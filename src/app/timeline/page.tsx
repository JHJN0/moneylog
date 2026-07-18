"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  PenLine,
} from "lucide-react";
import { Expense, dateLabel, formatKRW, todayStr, toDateStr } from "@/types";
import { fetchExpensesByDate } from "@/lib/expenses";
import { fetchDiary, saveDiary } from "@/lib/diary";
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

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDiary(date), fetchExpensesByDate(date)])
      .then(([diary, dayExpenses]) => {
        if (cancelled) return;
        const text = diary?.content ?? "";
        setView({ date, expenses: dayExpenses, error: null });
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

      {/* 이 날의 도토리 — 시간 없이, 일기 아래 조용히 */}
      <div className="mt-8 border-t border-line pt-6">
        {!loaded ? (
          <Skeleton className="h-6 w-48" />
        ) : expenses.length === 0 ? (
          <p className="text-sm text-hint">
            이 날은 도토리를 담지 않았어요. 조용한 하루였네요 🐿️
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-1">
              {expenses.slice(0, 10).map((e) => (
                <Acorn
                  key={e.id}
                  size={16}
                  label={`${e.category} ${e.memo || ""} ${formatKRW(e.amount)}`}
                />
              ))}
              {expenses.length > 10 && (
                <span className="text-xs font-semibold text-sub">
                  +{expenses.length - 10}
                </span>
              )}
            </span>
            <span className="text-sm text-sub">
              이 날 도토리{" "}
              <span className="font-semibold text-ink">
                {expenses.length}개
              </span>{" "}
              · {formatKRW(total)}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
