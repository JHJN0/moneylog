"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { CATEGORIES, Category, Expense, formatKRW } from "@/types";
import { updateExpense, deleteExpense } from "@/lib/expenses";

export type EditSheetMode = "edit" | "delete";

interface Props {
  expense: Expense;
  initialMode?: EditSheetMode;
  onClose: () => void;
  onSaved: (updated: Expense) => void;
  onDeleted: (id: string) => void;
}

// 지출 수정·삭제 바텀시트 — 모바일은 하단 시트, 데스크톱은 중앙 카드
export default function ExpenseEditSheet({
  expense,
  initialMode = "edit",
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const [mode, setMode] = useState<EditSheetMode>(initialMode);
  const [date, setDate] = useState(expense.date);
  const [category, setCategory] = useState<Category>(expense.category);
  const [memo, setMemo] = useState(expense.memo);
  const [amount, setAmount] = useState(String(expense.amount));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (busy) return;
    const parsedAmount = Number(amount.replaceAll(",", ""));
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      setError("금액은 1원 이상 숫자로 적어주세요");
      return;
    }
    if (!date) {
      setError("날짜를 골라주세요");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await updateExpense(expense.id, {
        date,
        category,
        memo: memo.trim(),
        amount: parsedAmount,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해주세요");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteExpense(expense.id);
      onDeleted(expense.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해주세요");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-t-(--radius-card) bg-white p-6 sm:rounded-(--radius-card)"
      >
        {mode === "delete" ? (
          <>
            <h2 className="text-lg font-bold text-ink">
              이 도토리를 버릴까요?
            </h2>
            <p className="mt-2 text-sm text-sub">
              {expense.category} · {expense.memo || "메모 없음"} ·{" "}
              {formatKRW(expense.amount)}
            </p>
            <p className="mt-1 text-[13px] text-hint">
              한번 버린 도토리는 되돌릴 수 없어요
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("edit")}
                disabled={busy}
                className="h-12 flex-1 rounded-(--radius-btn) border border-line-strong text-base font-semibold text-ink hover:border-ink"
              >
                그대로 둘게요
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="flex h-12 flex-1 items-center justify-center rounded-(--radius-btn) bg-rausch text-base font-semibold text-white hover:bg-rausch-press disabled:bg-disabled"
              >
                {busy ? (
                  <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />
                ) : (
                  "버릴게요"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">도토리 고치기</h2>
              <button
                type="button"
                onClick={() => setMode("delete")}
                disabled={busy}
                aria-label="지출 삭제"
                className="flex items-center gap-1 text-sm font-medium text-sub hover:text-error"
              >
                <Trash2 size={15} strokeWidth={2} />
                버리기
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-sub">날짜</span>
                <input
                  type="date"
                  value={date}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 w-full rounded-(--radius-btn) border border-line-strong px-4 text-base text-ink outline-none focus:border-2 focus:border-ink"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-sub">
                  카테고리
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                        category === c
                          ? "border-ink bg-ink text-white"
                          : "border-line-strong text-sub hover:text-ink"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-sub">메모</span>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: 점심 김치찌개"
                  className="h-12 w-full rounded-(--radius-btn) border border-line-strong px-4 text-base text-ink outline-none placeholder:text-hint focus:border-2 focus:border-ink"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-sub">
                  금액 (원)
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="9500"
                  className="h-12 w-full rounded-(--radius-btn) border border-line-strong px-4 text-base text-ink outline-none placeholder:text-hint focus:border-2 focus:border-ink"
                />
              </label>
            </div>

            <div className="mt-2 h-6">
              {error && <p className="text-sm text-error">{error}</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="h-12 flex-1 rounded-(--radius-btn) border border-line-strong text-base font-semibold text-ink hover:border-ink"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className="flex h-12 flex-1 items-center justify-center rounded-(--radius-btn) bg-rausch text-base font-semibold text-white hover:bg-rausch-press disabled:bg-disabled"
              >
                {busy ? (
                  <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />
                ) : (
                  "고쳤어요"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
