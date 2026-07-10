import { Expense, formatKRW, dateLabel, sumAmounts } from "@/types";
import ExpenseRow from "@/components/ExpenseRow";

interface Props {
  date: string; // 'YYYY-MM-DD'
  expenses: Expense[];
  footer?: React.ReactNode;
}

// 오른쪽 공용 사이드 패널 (지출 적기 · 지출 내역)
export default function TodayPanel({ date, expenses, footer }: Props) {
  const total = sumAmounts(expenses);

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-line px-6 py-10">
      <p className="text-sm text-sub">{dateLabel(date)}</p>
      <p className="mt-1 text-[28px] font-bold text-ink">
        {formatKRW(total)} 썼어요
      </p>

      <ul className="mt-6 flex-1">
        {expenses.length === 0 ? (
          <li className="pt-2 text-sm text-hint">아직 적은 지출이 없어요</li>
        ) : (
          expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)
        )}
      </ul>

      {footer && <div className="mt-6">{footer}</div>}
    </aside>
  );
}
