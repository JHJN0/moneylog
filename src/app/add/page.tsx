"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Wallet, ArrowUp, Check, Loader2 } from "lucide-react";
import { Expense, todayStr } from "@/types";
import { fetchExpensesByDate, addExpense } from "@/lib/expenses";
import { parseExpense } from "@/lib/parse";
import TodayPanel from "@/components/TodayPanel";

const EXAMPLE_CHIPS = [
  "아침에 버스 1,500원",
  "스타벅스 라떼 5,500원",
  "넷플릭스 구독료 13,500원",
];

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
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshToday = () => {
    fetchExpensesByDate(today)
      .then(setTodayExpenses)
      .catch(console.error)
      .finally(() => setTodayLoaded(true));
  };

  useEffect(() => {
    refreshToday();
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
          <Wallet size={40} strokeWidth={2} className="text-rausch" />
          <h1 className="mt-3 text-[40px] font-bold text-ink">머니로그</h1>
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

          {/* 예시 칩 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setText(chip)}
                className="rounded-full border border-line-strong px-4 py-2 text-sm text-body whitespace-nowrap hover:border-ink"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* 우측 공용 사이드 패널 */}
      <TodayPanel
        date={today}
        expenses={todayExpenses}
        loading={!todayLoaded}
        footer={
          <Link
            href="/history"
            className="text-sm font-medium text-ink underline underline-offset-2"
          >
            이번 달 전체 보기
          </Link>
        }
      />
    </div>
  );
}
