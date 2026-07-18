"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Check, Loader2, PenLine } from "lucide-react";
import { Expense, todayStr } from "@/types";
import { fetchExpensesByDate, addExpense } from "@/lib/expenses";
import { fetchDiary } from "@/lib/diary";
import { parseExpense } from "@/lib/parse";
import TodayPanel from "@/components/TodayPanel";
import ExpenseEditSheet, {
  type EditSheetMode,
} from "@/components/ExpenseEditSheet";

const ERROR_MESSAGE =
  '금액을 못 찾았어요. "김치찌개 9,500원"처럼 금액을 같이 적어주세요.';

export default function AddExpense() {
  const today = todayStr();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [todayLoaded, setTodayLoaded] = useState(false);
  const [sheet, setSheet] = useState<{
    expense: Expense;
    mode: EditSheetMode;
  } | null>(null);
  const [todayDiary, setTodayDiary] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshToday = () => {
    fetchExpensesByDate(today)
      .then(setTodayExpenses)
      .catch(console.error)
      .finally(() => setTodayLoaded(true));
  };

  useEffect(() => {
    refreshToday();
    // 오늘의 한 줄 일기 — 예시 문구 대신 보여준다
    fetchDiary(today)
      .then((diary) => setTodayDiary(diary?.content ?? null))
      .catch(() => setTodayDiary(null));
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = text.trim();
    if (!input || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await parseExpense(input);
      if (!result.ok) {
        setError(ERROR_MESSAGE);
        return;
      }
      await addExpense({
        date: result.expense.date ?? today,
        category: result.expense.category,
        memo: result.expense.memo,
        amount: result.expense.amount,
      });
      setText("");
      refreshToday();
      setSuccess(true);
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1">
      {/* 좌측 메인 — 세로·가로 중앙 정렬 */}
      <main className="flex flex-1 flex-col items-center justify-center px-12">
        <div className="flex w-full max-w-[560px] flex-col items-center">
          <Image src="/tori.png" alt="토리" width={88} height={88} priority />
          <h1 className="mt-3 text-[40px] font-bold text-ink">토리</h1>
          <p className="mt-2 text-base text-sub">
            오늘 뭐 썼어요? 문장으로 적으면 알아서 정리해줘요
          </p>

          {/* 프롬프트 입력창 — 완전 필, 유일하게 그림자 허용 */}
          <form onSubmit={handleSubmit} className="mt-8 w-full">
            <div className="relative">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="예: 점심에 김치찌개 9,500원"
                className="h-14 w-full rounded-full border border-line-strong px-6 pr-16 text-base text-ink shadow-(--shadow-prompt) outline-none placeholder:text-hint focus:border-2 focus:border-ink"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label="지출 적기"
                className="absolute top-1/2 right-2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-rausch text-white hover:bg-rausch-press active:bg-rausch-press disabled:bg-disabled"
              >
                {loading ? (
                  <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />
                ) : (
                  <ArrowUp size={20} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </form>

          {/* 상태 메시지 */}
          <div className="mt-4 h-6">
            {error && <p className="text-sm text-error">{error}</p>}
            {success && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <Check size={16} strokeWidth={2.5} />
                적었어요! 오른쪽에서 확인해보세요
              </p>
            )}
          </div>

          {/* 오늘의 한 줄 일기 */}
          <div className="mt-4 flex justify-center">
            {todayDiary ? (
              <p className="flex items-center gap-2 rounded-full bg-soft px-5 py-2.5 text-sm text-body">
                <PenLine size={14} strokeWidth={2} className="shrink-0 text-hint" />
                <span className="font-medium text-ink">오늘의 한 줄</span>
                <span className="min-w-0 truncate">{todayDiary}</span>
              </p>
            ) : (
              <Link
                href="/timeline"
                className="flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm text-sub hover:border-ink hover:text-ink"
              >
                <PenLine size={14} strokeWidth={2} />
                아직 오늘 한 줄이 없어요 · 남기러 가기
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* 우측 공용 사이드 패널 */}
      <TodayPanel
        date={today}
        expenses={todayExpenses}
        loading={!todayLoaded}
        onEdit={(expense) => setSheet({ expense, mode: "edit" })}
        onDelete={(expense) => setSheet({ expense, mode: "delete" })}
        footer={
          <Link
            href="/history"
            className="text-sm font-medium text-ink underline underline-offset-2"
          >
            이번 달 전체 보기
          </Link>
        }
      />

      {sheet && (
        <ExpenseEditSheet
          expense={sheet.expense}
          initialMode={sheet.mode}
          onClose={() => setSheet(null)}
          onSaved={refreshToday}
          onDeleted={refreshToday}
        />
      )}
    </div>
  );
}
