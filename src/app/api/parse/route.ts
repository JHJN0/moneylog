import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES } from "@/types";
import { regexParseExpense } from "@/lib/parse";

// 사용자 지정 모델: Claude Haiku 4.5
const MODEL = "claude-haiku-4-5-20251001";

const RECORD_EXPENSE_TOOL: Anthropic.Tool = {
  name: "record_expense",
  description:
    "한국어 지출 문장에서 지출 내역을 추출해 기록한다. 문장에 금액이 명시된 경우에만 호출한다.",
  input_schema: {
    type: "object",
    properties: {
      amount: {
        type: "number",
        description: "지출 금액 (원 단위 정수). 예: '9,500원' → 9500, '3천원' → 3000",
      },
      category: {
        type: "string",
        enum: [...CATEGORIES],
        description: "지출 카테고리",
      },
      memo: {
        type: "string",
        description: "짧은 지출 설명. 예: '점심 김치찌개', '아이스 라떼'",
      },
      date: {
        type: "string",
        description:
          "지출 날짜 'YYYY-MM-DD'. '어제', '그저께' 같은 상대 날짜가 문장에 있을 때만 포함. 날짜 언급이 없으면 생략",
      },
    },
    required: ["amount", "category", "memo"],
  },
};

function fallbackResponse(text: string) {
  const result = regexParseExpense(text);
  if (!result.ok) return Response.json({ error: "NO_AMOUNT" });
  return Response.json(result.expense);
}

export async function POST(request: Request) {
  let text: string;
  let today: string;
  try {
    const body = await request.json();
    text = typeof body.text === "string" ? body.text.trim() : "";
    today = /^\d{4}-\d{2}-\d{2}$/.test(body.today ?? "")
      ? body.today
      : new Date().toISOString().slice(0, 10);
  } catch {
    return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  if (!text) return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });

  // API 키가 없으면 정규식 폴백으로 데모가 죽지 않게
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackResponse(text);
  }

  try {
    const client = new Anthropic();
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][
      new Date(`${today}T00:00:00`).getDay()
    ];

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        `오늘 날짜는 ${today} (${weekday}요일)이다.`,
        "사용자가 입력한 한국어 지출 문장을 분석해 record_expense 도구로 기록한다.",
        "'어제', '그저께', '지난 금요일' 같은 상대 날짜는 오늘 날짜 기준으로 계산해 date 필드에 'YYYY-MM-DD'로 넣는다. 날짜 언급이 없으면 date는 생략한다.",
        "금액을 찾을 수 없으면 도구를 호출하지 말고 'NO_AMOUNT'라고만 답한다.",
      ].join("\n"),
      tools: [RECORD_EXPENSE_TOOL],
      messages: [{ role: "user", content: text }],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolUse) return Response.json({ error: "NO_AMOUNT" });

    const input = toolUse.input as {
      amount?: number;
      category?: string;
      memo?: string;
      date?: string;
    };
    if (typeof input.amount !== "number" || input.amount <= 0) {
      return Response.json({ error: "NO_AMOUNT" });
    }

    return Response.json({
      amount: Math.round(input.amount),
      category: CATEGORIES.includes(input.category as never)
        ? input.category
        : "기타",
      memo: input.memo || input.category || "지출",
      ...(input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
        ? { date: input.date }
        : {}),
    });
  } catch (error) {
    console.error("[/api/parse] Claude API 호출 실패, 정규식 폴백 사용:", error);
    return fallbackResponse(text);
  }
}
