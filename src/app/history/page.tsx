"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Expense,
  formatKRW,
  monthLabel,
  sumAmounts,
  toDateStr,
  todayStr,
} from "@/types";
import { fetchExpensesByMonth } from "@/lib/expenses";
import TodayPanel from "@/components/TodayPanel";
import Acorn from "@/components/Acorn";
import ExpenseEditSheet, {
  type EditSheetMode,
} from "@/components/ExpenseEditSheet";
import PrimaryButton from "@/components/PrimaryButton";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function History() {
  const today = todayStr();
  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [sheet, setSheet] = useState<{
    expense: Expense;
    mode: EditSheetMode;
  } | null>(null);

  const isCurrentMonth =
    cursor.year === now.getFullYear() && cursor.month === now.getMonth() + 1;

  const refresh = () => {
    fetchExpensesByMonth(cursor.year, cursor.month)
      .then(setExpenses)
      .catch(console.error)
      .finally(() => setLoaded(true));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor.year, cursor.month]);

  // 날짜별 합계·건수 맵
  const byDay = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    for (const e of expenses) {
      const prev = map.get(e.date) ?? { sum: 0, count: 0 };
      map.set(e.date, { sum: prev.sum + e.amount, count: prev.count + 1 });
    }
    return map;
  }, [expenses]);

  const total = sumAmounts(expenses);
  const count = expenses.length;

  // 달력 셀 구성: 앞뒤 빈칸 + 날짜
  const firstWeekday = new Date(cursor.year, cursor.month - 1, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const moveMonth = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
  };

  const panelExpenses = expenses.filter((e) => e.date === selectedDate);

  return (
    <div className="flex flex-1">
      <main className="flex-1 px-12 py-10">
        <div className="mx-auto max-w-[880px]">
          {/* 상단: 월 타이틀 + 이동 버튼 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[21px] font-bold text-ink">
                {monthLabel(cursor.year, cursor.month)}
              </h1>
              <p className="mt-1 text-sm text-sub">
                이번 달{" "}
                <span className="font-semibold text-ink">
                  {formatKRW(total)} · {count}건
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                aria-label="이전 달"
                className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink hover:border-ink"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                disabled={isCurrentMonth}
                aria-label="다음 달"
                className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink hover:border-ink disabled:border-line disabled:text-disabled disabled:hover:border-line"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="mt-6 grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-2.5 pb-2 text-xs font-semibold text-sub"
              >
                {d}
              </div>
            ))}
          </div>

          {/* 7열 달력 그리드 — 1px #ebebeb 격자 */}
          <div className="grid grid-cols-7 gap-px border border-line bg-line">
            {Array.from({ length: cellCount }, (_, i) => {
              const dayNum = i - firstWeekday + 1;
              const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
              if (!inMonth) {
                return <div key={i} className="min-h-[92px] bg-soft" />;
              }

              const dateStr = toDateStr(cursor.year, cursor.month, dayNum);
              const day = byDay.get(dateStr);
              const isToday = dateStr === today;
              const isFuture = dateStr > today;
              const clickable = !!day;

              return (
                <div
                  key={i}
                  onClick={clickable ? () => setSelectedDate(dateStr) : undefined}
                  className={`relative flex min-h-[92px] flex-col justify-between bg-white p-2.5 ${
                    clickable ? "cursor-pointer hover:bg-soft" : ""
                  }`}
                >
                  {isToday && (
                    <span className="pointer-events-none absolute inset-0 border-2 border-ink" />
                  )}
                  {isToday ? (
                    <span className="flex size-6 items-center justify-center rounded-full bg-ink text-[13px] font-medium text-white">
                      {dayNum}
                    </span>
                  ) : (
                    <span
                      className={`text-[13px] font-medium ${
                        isFuture ? "text-disabled" : "text-ink"
                      }`}
                    >
                      {dayNum}
                    </span>
                  )}
                  {day && (
                    <span className="flex flex-col gap-1">
                      {/* 그날 담은 도토리 — 5개까지, 넘치면 +N */}
                      <span
                        className="flex flex-wrap items-center gap-px"
                        aria-label={`도토리 ${day.count}개`}
                      >
                        {Array.from(
                          { length: Math.min(day.count, 5) },
                          (_, k) => (
                            <Acorn key={k} size={13} />
                          ),
                        )}
                        {day.count > 5 && (
                          <span className="ml-0.5 text-[10px] font-semibold text-sub">
                            +{day.count - 5}
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap ${
                          isToday ? "text-rausch" : "text-ink"
                        }`}
                      >
                        {formatKRW(day.sum)}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-[13px] text-hint">
            지출이 있는 날엔 담은 도토리와 하루 합계가 보여요 · 오늘은
            테두리로 표시돼요
          </p>
        </div>
      </main>

      {/* 우측 공용 사이드 패널 — 날짜 클릭 시 그 날 상세로 전환 */}
      <TodayPanel
        date={selectedDate}
        expenses={panelExpenses}
        loading={!loaded}
        onEdit={(expense) => setSheet({ expense, mode: "edit" })}
        onDelete={(expense) => setSheet({ expense, mode: "delete" })}
        footer={
          <PrimaryButton href="/add" fullWidth>
            지출 적기
          </PrimaryButton>
        }
      />

      {sheet && (
        <ExpenseEditSheet
          expense={sheet.expense}
          initialMode={sheet.mode}
          onClose={() => setSheet(null)}
          onSaved={refresh}
          onDeleted={refresh}
        />
      )}
    </div>
  );
}
