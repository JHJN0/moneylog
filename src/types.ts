// 머니로그 공통 타입 · 디자인 토큰 · 포맷터

export type Category =
  | "식비"
  | "카페"
  | "교통"
  | "쇼핑"
  | "주거"
  | "문화"
  | "기타";

export const CATEGORIES: Category[] = [
  "식비",
  "카페",
  "교통",
  "쇼핑",
  "주거",
  "문화",
  "기타",
];

export interface Expense {
  id: string; // uuid
  date: string; // 'YYYY-MM-DD'
  category: Category;
  memo: string;
  amount: number;
  created_at: string;
}

export type NewExpense = Omit<Expense, "id" | "created_at">;

// 디자인 토큰 — globals.css @theme와 동일한 값 (JS에서 색이 필요할 때 사용)
export const TOKENS = {
  rausch: "#ff385c",
  rauschPress: "#e00b41",
  ink: "#222222",
  body: "#3f3f3f",
  sub: "#6a6a6a",
  hint: "#929292",
  disabled: "#c1c1c1",
  lineStrong: "#dddddd",
  line: "#ebebeb",
  soft: "#f7f7f7",
  error: "#c13515",
} as const;

export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// 로컬 타임존 기준 오늘 날짜 'YYYY-MM-DD'
export function todayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// 'YYYY-MM-DD' → "7월 3일" (withToday: 오늘이면 " · 오늘" 붙임)
export function dateLabel(date: string, withToday = true): string {
  const [, m, d] = date.split("-").map(Number);
  const label = `${m}월 ${d}일`;
  if (withToday && date === todayStr()) return `${label} · 오늘`;
  return label;
}

export function monthLabel(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

export function sumAmounts(expenses: Pick<Expense, "amount">[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0);
}
