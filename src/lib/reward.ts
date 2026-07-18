import { Expense, sumAmounts } from "@/types";

// 하루 예산 — 이 금액 이하로 쓰면 도토리 조건 충족 (달력 빨간색 경고 기준과 동일)
export const DAILY_BUDGET = 10000;

// 도토리 획득 3조건: ①지출 적기 ②하루 일기 ③만원 이하
export interface DayCheck {
  expense: boolean;
  diary: boolean;
  budget: boolean;
}

export function dayCheck(
  dayExpenses: Pick<Expense, "amount">[],
  hasDiary: boolean,
): DayCheck {
  return {
    expense: dayExpenses.length > 0,
    diary: hasDiary,
    budget: sumAmounts(dayExpenses) <= DAILY_BUDGET,
  };
}

export function earnedAcorn(check: DayCheck): boolean {
  return check.expense && check.diary && check.budget;
}
