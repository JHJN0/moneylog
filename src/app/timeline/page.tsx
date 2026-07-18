"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Loader2,
  PenLine,
} from "lucide-react";
import {
  Expense,
  dateLabel,
  formatKRW,
  todayStr,
  toDateStr,
} from "@/types";
import { fetchExpensesByDate, fetchExpensesByMonth } from "@/lib/expenses";
import { fetchDiary, fetchDiaryDates, saveDiary } from "@/lib/diary";
import { DAILY_BUDGET, dayCheck, earnedAcorn } from "@/lib/reward";
import Acorn from "@/components/Acorn";
import Skeleton from "@/components/Skeleton";

// 'YYYY-MM-DD'를 delta일만큼 이동
function shiftDate(date: string, delta: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(y, m - 1, d + delta);
  return toDateStr(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

export default function DailyStory() {
  const today = todayStr();
  const [date, setDate] = useState(today);
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  // 날짜별 조회 결과 — view.date가 현재 date와 같아야 로딩 완료로 본다
  const [view, setView] = useState<{
    date: string;
    expenses: Expense[];
    error: string | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 보고 있는 달의 지출·일기 날짜 — 도토리 계산용
  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  const [diaryDates, setDiaryDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const [year, month] = date.split("-").map(Number);
    const monthLast = toDateStr(
      year,
      month,
      new Date(year, month, 0).getDate(),
    );
    Promise.all([
      fetchDiary(date),
      fetchExpensesByDate(date),
      fetchExpensesByMonth(year, month),
      fetchDiaryDates(toDateStr(year, month, 1), monthLast),
    ])
      .then(([diary, dayExpenses, monthRows, dates]) => {
        if (cancelled) return;
        const text = diary?.content ?? "";
        setView({ date, expenses: dayExpenses, error: null });
        setMonthExpenses(monthRows);
        setDiaryDates(dates);
        setContent(text);
        setSavedContent(text);
        setSaved(false);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setView({
          date,
          expenses: [],
          error: err instanceof Error ? err.message : "불러오지 못했어요",
        });
        setContent("");
        setSavedContent("");
        setSaved(false);
        setError(null);
      });
    return () => {
      cancelled = true;
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, [date]);

  const loaded = view?.date === date;
  const expenses = loaded ? view.expenses : [];
  const loadError = loaded ? view.error : null;

  // 이번 달 도토리 — 지출·일기·만원이하 3조건을 채운 날 수
  const monthAcorns = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const e of monthExpenses) {
      byDay.set(e.date, (byDay.get(e.date) ?? 0) + e.amount);
    }
    let earned = 0;
    for (const [d, sum] of byDay) {
      if (diaryDates.has(d) && sum <= DAILY_BUDGET) earned += 1;
    }
    return earned;
  }, [monthExpenses, diaryDates]);

  const checks = dayCheck(expenses, savedContent.trim() !== "");
  const earnedToday = earnedAcorn(checks);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || content.trim() === savedContent.trim()) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveDiary(date, content);
      setSavedContent(result?.content ?? "");
      setContent(result?.content ?? "");
      // 일기 유무가 바뀌면 도토리 계산에 바로 반영
      setDiaryDates((prev) => {
        const next = new Set(prev);
        if (result) next.add(date);
        else next.delete(date);
        return next;
      });
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해주세요");
    } finally {
      setSaving(false);
    }
  };

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <main className="mx-auto w-full max-w-[640px] flex-1 px-6 py-10 sm:px-10">
      {/* 상단: 타이틀 + 날짜 이동 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-ink">하루 이야기</h1>
          <p className="mt-1 text-sm text-sub">
            오늘 하루를 한 줄로 남겨요. 토리가 도토리와 함께 기억해줄게요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDate((d) => shiftDate(d, -1))}
            aria-label="이전 날"
            className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink hover:border-ink"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <span className="w-[110px] text-center text-sm font-semibold whitespace-nowrap text-ink">
            {dateLabel(date)}
          </span>
          <button
            type="button"
            onClick={() => setDate((d) => shiftDate(d, 1))}
            disabled={date >= today}
            aria-label="다음 날"
            className="flex size-9 items-center justify-center rounded-full border border-line-strong text-ink hover:border-ink disabled:border-line disabled:text-disabled disabled:hover:border-line"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* 한줄 일기 */}
      <div className="mt-10">
        {!loaded ? (
          <Skeleton className="h-14 w-full" />
        ) : (
          <form onSubmit={handleSave}>
            <div className="relative">
              <PenLine
                size={18}
                strokeWidth={2}
                className="absolute top-1/2 left-6 -translate-y-1/2 text-hint"
              />
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={100}
                placeholder={
                  date === today
                    ? "오늘은 어떤 하루였나요? 한 줄로 남겨봐요"
                    : "이 날은 어떤 하루였나요?"
                }
                className="h-14 w-full rounded-full border border-line-strong pr-28 pl-14 text-base text-ink shadow-(--shadow-prompt) outline-none placeholder:text-hint focus:border-2 focus:border-ink"
              />
              <button
                type="submit"
                disabled={saving || content.trim() === savedContent.trim()}
                className="absolute top-1/2 right-2 flex h-10 w-24 -translate-y-1/2 items-center justify-center rounded-full bg-rausch text-sm font-semibold text-white hover:bg-rausch-press active:bg-rausch-press disabled:bg-disabled"
              >
                {saving ? (
                  <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
                ) : savedContent ? (
                  "고쳐 쓰기"
                ) : (
                  "남기기"
                )}
              </button>
            </div>
          </form>
        )}

        {/* 상태 메시지 */}
        <div className="mt-3 h-6 px-2">
          {(loadError || error) && (
            <p className="text-sm text-error">{loadError || error}</p>
          )}
          {saved && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <Check size={16} strokeWidth={2.5} />
              남겼어요! 토리가 잘 보관할게요
            </p>
          )}
        </div>
      </div>

      {/* 도토리 획득 카드 — 3조건을 채우면 하루 1개 */}
      <div className="mt-6 rounded-(--radius-card) border border-line-strong p-6">
        {!loaded ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-bold text-ink">이 날의 도토리</p>
              {earnedToday ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Acorn size={18} />
                  획득했어요!
                </span>
              ) : (
                <span className="text-sm text-hint">아직이에요</span>
              )}
            </div>

            <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
              {(
                [
                  ["지출 적기", checks.expense],
                  ["하루 일기", checks.diary],
                  [
                    `만원 이하 (${formatKRW(total)})`,
                    checks.budget,
                  ],
                ] as const
              ).map(([label, met]) => (
                <li
                  key={label}
                  className={`flex items-center gap-1.5 text-sm ${
                    met ? "font-medium text-ink" : "text-hint"
                  }`}
                >
                  {met ? (
                    <Check size={15} strokeWidth={2.5} className="text-rausch" />
                  ) : (
                    <Circle size={13} strokeWidth={2} className="text-disabled" />
                  )}
                  {label}
                </li>
              ))}
            </ul>

            {/* 이번 달 쌓인 도토리 */}
            <div className="mt-5 border-t border-line pt-4">
              {monthAcorns === 0 ? (
                <p className="text-sm text-hint">
                  이 달엔 아직 모은 도토리가 없어요. 오늘부터 하나씩 모아봐요 🐿️
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="flex flex-wrap items-center gap-0.5">
                    {Array.from({ length: monthAcorns }, (_, i) => (
                      <Acorn key={i} size={18} />
                    ))}
                  </span>
                  <span className="text-sm text-sub">
                    이 달 도토리{" "}
                    <span className="font-semibold text-ink">
                      {monthAcorns}개
                    </span>
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
