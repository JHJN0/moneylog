"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Expense, formatKRW, monthLabel, sumAmounts } from "@/types";
import { fetchExpensesByMonth, fetchPrevMonthToDateTotal } from "@/lib/expenses";
import ExpenseRow from "@/components/ExpenseRow";
import ExpenseEditSheet, {
  type EditSheetMode,
} from "@/components/ExpenseEditSheet";
import PrimaryButton from "@/components/PrimaryButton";
import Skeleton from "@/components/Skeleton";
import AcornBasket from "@/components/AcornBasket";

export default function Dashboard() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [prevTotal, setPrevTotal] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sheet, setSheet] = useState<{
    expense: Expense;
    mode: EditSheetMode;
  } | null>(null);

  const refresh = () => {
    Promise.all([
      fetchExpensesByMonth(year, month),
      fetchPrevMonthToDateTotal(year, month, day),
    ])
      .then(([monthExpenses, prev]) => {
        setExpenses(monthExpenses);
        setPrevTotal(prev);
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day]);

  const total = sumAmounts(expenses);
  const count = expenses.length;
  const dailyAvg = day > 0 ? Math.round(total / day) : 0;
  const diff = prevTotal === null ? null : prevTotal - total;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-20">
      {/* 히어로 */}
      <section className="flex items-start justify-between pt-16 pb-12">
        <div>
          <p className="text-base text-sub">{monthLabel(year, month)}</p>
          {loaded ? (
            <h1 className="mt-2 text-[40px] leading-tight font-bold text-ink">
              이번 달 <span className="text-rausch">{formatKRW(total)}</span>{" "}
              썼어요
            </h1>
          ) : (
            <Skeleton className="mt-3 h-11 w-[400px]" />
          )}
          {loaded && diff !== null && diff !== 0 && (
            <p className="mt-3 text-base text-sub">
              지난달 같은 날보다 {formatKRW(Math.abs(diff))}{" "}
              {diff > 0 ? "덜" : "더"} 썼어요
            </p>
          )}
        </div>
        <PrimaryButton href="/add">지출 적기</PrimaryButton>
      </section>

      {/* 2컬럼: 최근 지출 + 요약 */}
      <section className="grid grid-cols-[1fr_380px] gap-12 pb-16">
        <div>
          <div className="flex items-end justify-between border-b border-line-strong pb-3">
            <h2 className="text-[21px] font-bold text-ink">최근 지출</h2>
            <Link
              href="/history"
              className="text-sm font-medium text-ink underline underline-offset-2"
            >
              전체 보기
            </Link>
          </div>
          <ul>
            {!loaded &&
              Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="border-b border-line py-5">
                  <Skeleton className="h-5 w-full" />
                </li>
              ))}
            {expenses.slice(0, 8).map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                showDate
                onEdit={(expense) => setSheet({ expense, mode: "edit" })}
                onDelete={(expense) => setSheet({ expense, mode: "delete" })}
              />
            ))}
            {loaded && expenses.length === 0 && (
              <li className="pt-4 text-sm text-hint">
                아직 지출이 없어요. 오늘 뭐 썼는지 적어볼까요?
              </li>
            )}
          </ul>
        </div>

        <div>
          <div className="rounded-(--radius-card) border border-line-strong p-7">
            <h2 className="text-[21px] font-bold text-ink">{month}월 요약</h2>
            <dl className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-sub">총 지출</dt>
                <dd className="whitespace-nowrap text-base font-semibold text-ink">
                  {loaded ? formatKRW(total) : <Skeleton className="h-5 w-20" />}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-sub">지출 건수</dt>
                <dd className="text-base font-semibold text-ink">
                  {loaded ? `${count}건` : <Skeleton className="h-5 w-12" />}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-sub">하루 평균</dt>
                <dd className="whitespace-nowrap text-base font-semibold text-ink">
                  {loaded ? formatKRW(dailyAvg) : <Skeleton className="h-5 w-16" />}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-[13px] text-hint">
              매일 적기만 해도 반은 성공이에요
            </p>
          </div>

          <div className="mt-6">
            <AcornBasket expenses={expenses} loaded={loaded} />
          </div>
        </div>
      </section>

      {sheet && (
        <ExpenseEditSheet
          expense={sheet.expense}
          initialMode={sheet.mode}
          onClose={() => setSheet(null)}
          onSaved={refresh}
          onDeleted={refresh}
        />
      )}
    </main>
  );
}
