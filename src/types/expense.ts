export type Category = "식비" | "교통" | "쇼핑" | "문화" | "기타";

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  item: string;
  amount: number; // 원 단위
  category: Category;
}
