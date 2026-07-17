"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, Category, Expense, formatKRW, sumAmounts } from "@/types";
import { CATEGORY_ICONS } from "@/components/ExpenseRow";
import Acorn, { AcornCharacter } from "@/components/Acorn";
import Skeleton from "@/components/Skeleton";

const MAX_ACORNS = 40; // 그 이상은 "+N개" 칩으로 접는다

function basketMessage(count: number): string {
  if (count === 0) return "바구니가 비어 있어요. 첫 도토리를 담아볼까요?";
  if (count < 10) return "차곡차곡 모으는 중이에요";
  if (count < 30) return "부지런히 모았는걸요?";
  return "바구니가 묵직해요!";
}

// 0 → target으로 차오르는 카운터 (모션 최소화 설정이면 바로 표시)
function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const instant =
      target === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = instant ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

interface Props {
  expenses: Expense[]; // 이번 달 지출
  loaded: boolean;
}

// 토리의 도토리 바구니 — 지출 1건 = 도토리 1개, 카테고리별로 어디에 담았는지
export default function AcornBasket({ expenses, loaded }: Props) {
  const count = expenses.length;
  const total = sumAmounts(expenses);

  // 이번 달 합계 카운터 — 동글이 옆에서 차오른다
  const shownCount = useCountUp(count);
  const shownTotal = useCountUp(total);

  // 카테고리별 합계 (금액 큰 순, 0원 제외)
  const byCategory = CATEGORIES.map((category) => ({
    category,
    sum: sumAmounts(expenses.filter((e) => e.category === category)),
  }))
    .filter((c) => c.sum > 0)
    .sort((a, b) => b.sum - a.sum);
  const maxSum = byCategory[0]?.sum ?? 0;

  return (
    <div className="rounded-(--radius-card) border border-line-strong p-7">
      <h2 className="text-[21px] font-bold text-ink">도토리 바구니</h2>

      {!loaded ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <>
          {/* 이번 달 합계 카운터 */}
          <div className="mt-4 flex items-center gap-4">
            <AcornCharacter size={52} />
            <div>
              <p className="text-[26px] leading-tight font-bold text-ink">
                {shownCount}개
              </p>
              <p className="mt-0.5 text-sm text-sub">
                이번 달{" "}
                <span className="font-semibold text-ink">
                  {formatKRW(shownTotal)}
                </span>
              </p>
              <p className="mt-0.5 text-[13px] text-hint">
                {basketMessage(count)}
              </p>
            </div>
          </div>

          {/* 도토리 알갱이 — 지출 1건 = 1개, 알에 마우스를 올리면 내용이 보인다 */}
          {count > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1">
              {expenses.slice(0, MAX_ACORNS).map((e) => (
                <Acorn
                  key={e.id}
                  label={`${dateShort(e.date)} ${e.category} ${e.memo || ""} ${formatKRW(e.amount)}`.replace(/\s+/g, " ")}
                />
              ))}
              {count > MAX_ACORNS && (
                <span className="ml-1 rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-sub">
                  +{count - MAX_ACORNS}개
                </span>
              )}
            </div>
          )}

          {/* 카테고리별 — 단일 색, 길이로 비교 */}
          {byCategory.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[13px] font-medium text-sub">
                어디에 담았을까요?
              </p>
              <ul className="mt-3 space-y-2.5">
                {byCategory.map(({ category, sum }) => (
                  <CategoryBar
                    key={category}
                    category={category}
                    sum={sum}
                    ratio={maxSum > 0 ? sum / maxSum : 0}
                    share={total > 0 ? Math.round((sum / total) * 100) : 0}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CategoryBar({
  category,
  sum,
  ratio,
  share,
}: {
  category: Category;
  sum: number;
  ratio: number; // 최대 카테고리 대비 막대 길이
  share: number; // 전체 대비 %
}) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <li className="flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-soft">
        <Icon size={14} strokeWidth={2} className="text-ink" />
      </span>
      <span className="w-9 shrink-0 text-[13px] font-medium text-ink">
        {category}
      </span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-soft">
        <span
          className="block h-full rounded-full bg-rausch"
          style={{ width: `${Math.max(ratio * 100, 4)}%` }}
        />
      </span>
      <span className="w-[104px] shrink-0 text-right text-[13px] whitespace-nowrap text-sub">
        <span className="font-semibold text-ink">{formatKRW(sum)}</span> ·{" "}
        {share}%
      </span>
    </li>
  );
}

// 'YYYY-MM-DD' → 'M/D' (도토리 툴팁용 짧은 날짜)
function dateShort(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d}`;
}
