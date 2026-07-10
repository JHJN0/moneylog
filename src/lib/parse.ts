import { Category, CATEGORIES, todayStr } from "@/types";

export interface ParsedExpense {
  amount: number;
  category: Category;
  memo: string;
  date?: string; // 'YYYY-MM-DD' — "어제" 같은 상대 날짜가 있을 때만
}

export type ParseResult =
  | { ok: true; expense: ParsedExpense }
  | { ok: false; error: "NO_AMOUNT" };

// ---------- 정규식 폴백 (API 키가 없거나 호출 실패 시) ----------

const CATEGORY_KEYWORDS: [Category, RegExp][] = [
  ["카페", /카페|커피|라떼|아메리카노|스타벅스|스벅|투썸|음료/],
  ["교통", /버스|지하철|택시|기차|교통|주유|KTX|주차/i],
  ["식비", /점심|저녁|아침|밥|식사|김치찌개|치킨|배달|마트|편의점|장보기|간식|외식/],
  ["주거", /관리비|월세|전기세|수도세|가스비|공과금|집/],
  ["문화", /넷플릭스|영화|공연|전시|구독|유튜브|게임|책/i],
  ["쇼핑", /쇼핑|옷|신발|가방|화장품|택배|주문/],
];

// 콤마 제거 후 최대 숫자를 금액으로, 키워드로 카테고리 추정
export function regexParseExpense(text: string): ParseResult {
  const normalized = text.replace(/,/g, "");

  // "3천원", "2만원" 같은 단위 표현도 처리
  const unitMatches = [...normalized.matchAll(/(\d+(?:\.\d+)?)\s*(만|천)\s*원?/g)].map(
    (m) => Math.round(parseFloat(m[1]) * (m[2] === "만" ? 10000 : 1000)),
  );
  const plainMatches = [...normalized.matchAll(/\d+/g)].map((m) => parseInt(m[0], 10));
  const candidates = [...unitMatches, ...plainMatches].filter((n) => n > 0);
  if (candidates.length === 0) return { ok: false, error: "NO_AMOUNT" };
  const amount = Math.max(...candidates);

  let category: Category = "기타";
  for (const [cat, pattern] of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) {
      category = cat;
      break;
    }
  }

  // 숫자·단위·조사를 걷어낸 나머지를 메모로
  const memo =
    text
      .replace(/[\d,]+(?:\.\d+)?\s*(만|천)?\s*원?/g, " ")
      .replace(/\s+/g, " ")
      .replace(/(어제|그저께|오늘|아침에|점심에|저녁에)/g, "")
      .trim() || category;

  return { ok: true, expense: { amount, category, memo } };
}

// ---------- 클라이언트용 순수 함수 — 프론트는 API 구현을 몰라도 된다 ----------

export async function parseExpense(text: string): Promise<ParseResult> {
  try {
    const res = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, today: todayStr() }),
    });
    if (!res.ok) throw new Error(`parse API ${res.status}`);
    const data = await res.json();

    if (data.error === "NO_AMOUNT") return { ok: false, error: "NO_AMOUNT" };

    if (
      typeof data.amount === "number" &&
      data.amount > 0 &&
      CATEGORIES.includes(data.category)
    ) {
      return {
        ok: true,
        expense: {
          amount: Math.round(data.amount),
          category: data.category as Category,
          memo: typeof data.memo === "string" && data.memo ? data.memo : data.category,
          date: /^\d{4}-\d{2}-\d{2}$/.test(data.date ?? "") ? data.date : undefined,
        },
      };
    }
    // 형식이 이상하면 폴백
    return regexParseExpense(text);
  } catch {
    // 네트워크/서버 오류 시 정규식 폴백으로 데모가 죽지 않게
    return regexParseExpense(text);
  }
}
