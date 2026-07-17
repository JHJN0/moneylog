import { supabase } from "@/lib/supabase";
import { Expense, NewExpense, toDateStr } from "@/types";

function warnNoClient() {
  console.warn(
    "[tori] Supabase 환경변수가 없어요. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.",
  );
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 해당 월 전체 지출 (최신순)
export async function fetchExpensesByMonth(
  year: number,
  month: number,
): Promise<Expense[]> {
  if (!supabase) {
    warnNoClient();
    return [];
  }
  const first = toDateStr(year, month, 1);
  const last = toDateStr(year, month, daysInMonth(year, month));
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", first)
    .lte("date", last)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Expense[];
}

// 특정 날짜 지출 (최신순)
export async function fetchExpensesByDate(date: string): Promise<Expense[]> {
  if (!supabase) {
    warnNoClient();
    return [];
  }
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Expense[];
}

// 지난달 1일 ~ 지난달 같은 날 합계 (증감 비교용). 데이터가 없으면 null
export async function fetchPrevMonthToDateTotal(
  year: number,
  month: number,
  day: number,
): Promise<number | null> {
  if (!supabase) {
    warnNoClient();
    return null;
  }
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const clampedDay = Math.min(day, daysInMonth(prevYear, prevMonth));
  const first = toDateStr(prevYear, prevMonth, 1);
  const sameDay = toDateStr(prevYear, prevMonth, clampedDay);
  const { data, error } = await supabase
    .from("expenses")
    .select("amount")
    .gte("date", first)
    .lte("date", sameDay);
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return data.reduce((acc, row) => acc + (row.amount as number), 0);
}

export async function addExpense(input: NewExpense): Promise<Expense> {
  if (!supabase) {
    warnNoClient();
    throw new Error("Supabase가 설정되지 않았어요");
  }
  const { data, error } = await supabase
    .from("expenses")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Expense;
}

// 기간 지출 (적은 시각 순) — 하루 이야기 타임라인·주간 통계용
export async function fetchExpensesByRange(
  first: string,
  last: string,
): Promise<Expense[]> {
  if (!supabase) {
    warnNoClient();
    return [];
  }
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", first)
    .lte("date", last)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Expense[];
}

// 지출 수정 — RLS로 본인 데이터만. 정책이 없거나 남의 데이터면 행이 안 돌아온다
export async function updateExpense(
  id: string,
  patch: Partial<NewExpense>,
): Promise<Expense> {
  if (!supabase) {
    warnNoClient();
    throw new Error("Supabase가 설정되지 않았어요");
  }
  const { data, error } = await supabase
    .from("expenses")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw new Error(
      "수정하지 못했어요. supabase/tori-migration.sql을 실행했는지 확인해주세요",
    );
  return data as Expense;
}

// 지출 삭제 — RLS로 본인 데이터만
export async function deleteExpense(id: string): Promise<void> {
  if (!supabase) {
    warnNoClient();
    throw new Error("Supabase가 설정되지 않았어요");
  }
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
