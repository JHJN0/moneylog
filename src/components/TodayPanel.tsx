import Image from "next/image";
import { Expense, formatKRW, dateLabel, sumAmounts } from "@/types";
import ExpenseRow from "@/components/ExpenseRow";
import Skeleton from "@/components/Skeleton";

interface Props {
  date: string; // 'YYYY-MM-DD'
  expenses: Expense[];
  loading?: boolean;
  footer?: React.ReactNode;
}

// 오른쪽 공용 사이드 패널 (지출 적기 · 지출 내역)
export default function TodayPanel({ date, expenses, loading, footer }: Props) {
  const total = sumAmounts(expenses);

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-line px-6 py-10">
      <p className="text-sm text-sub">{dateLabel(date)}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-44" />
      ) : (
        <p className="mt-1 text-[28px] font-bold text-ink">
          {formatKRW(total)} 썼어요
        </p>
      )}

      <ul className="mt-6 flex-1">
        {loading ? (
          Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="border-b border-line py-5">
              <Skeleton className="h-4 w-full" />
            </li>
          ))
        ) : expenses.length === 0 ? (
          <li className="flex flex-col items-center gap-3 pt-8">
            <Image
              src="/tori.png"
              alt=""
              width={72}
              height={72}
              className="opacity-80"
            />
            <span className="text-sm text-hint">아직 적은 지출이 없어요</span>
          </li>
        ) : (
          expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)
        )}
      </ul>

      {footer && <div className="mt-6">{footer}</div>}
    </aside>
  );
}
