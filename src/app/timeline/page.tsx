"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  MapPin,
  MoonStar,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { Expense, dateLabel, formatKRW, todayStr, toDateStr } from "@/types";
import { fetchExpensesByRange } from "@/lib/expenses";
import { CATEGORY_ICONS } from "@/components/ExpenseRow";
import Skeleton from "@/components/Skeleton";

// 'YYYY-MM-DD'를 delta일만큼 이동
function shiftDate(date: string, delta: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(y, m - 1, d + delta);
  return toDateStr(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

// created_at → 'HH:MM' (로컬 시각)
function timeLabel(createdAt: string): string {
  const d = new Date(createdAt);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

// 시간대 아이콘 · 이름 (적은 시각 기준)
function timeOfDay(createdAt: string): { Icon: LucideIcon; name: string } {
  const hour = new Date(createdAt).getHours();
  if (hour >= 5 && hour < 11) return { Icon: Sunrise, name: "아침" };
  if (hour >= 11 && hour < 17) return { Icon: Sun, name: "낮" };
  if (hour >= 17 && hour < 21) return { Icon: Sunset, name: "저녁" };
  return { Icon: Moon, name: "밤" };
}

// 새벽(0~4시)은 하루의 끝으로 쳐서 "가장 늦게"를 찾는다
function lateScore(createdAt: string): number {
  const d = new Date(createdAt);
  const hour = d.getHours() < 5 ? d.getHours() + 24 : d.getHours();
  return hour * 60 + d.getMinutes();
}

export default function Timeline() {
  const today = todayStr();
  const [date, setDate] = useState(today);
  const [dayExpenses, setDayExpenses] = useState<Expense[]>([]);
  const [weekExpenses, setWeekExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  const weekFirst = shiftDate(today, -6);

  useEffect(() => {
    // 선택한 날 + 최근 7일을 한 번에 가져와 나눠 쓴다
    const first = date < weekFirst ? date : weekFirst;
    const last = date > today ? date : today;
    fetchExpensesByRange(first, last)
      .then((rows) => {
        setDayExpenses(rows.filter((e) => e.date === date));
        setWeekExpenses(
          rows.filter((e) => e.date >= weekFirst && e.date <= today),
        );
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, [date, weekFirst, today]);

  // 이번 주 재미 통계
  const weekStats = useMemo(() => {
    if (weekExpenses.length === 0) return null;

    const counts = new Map<string, number>();
    for (const e of weekExpenses) {
      const key = e.memo.trim() || e.category;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const [favoriteName, favoriteCount] = [...counts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];

    const latest = weekExpenses.reduce((acc, e) =>
      lateScore(e.created_at) > lateScore(acc.created_at) ? e : acc,
    );

    return { favoriteName, favoriteCount, latest };
  }, [weekExpenses]);

  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-10 sm:px-12">
      {/* 상단: 날짜 이동 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-ink">하루 이야기</h1>
          <p className="mt-1 text-sm text-sub">
            도토리를 담은 시간을 따라 하루를 돌아봐요
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
          <span className="w-[110px] text-center text-sm font-semibold text-ink">
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

      {/* 이번 주 재미 통계 카드 */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          Icon={Sprout}
          label="이번 주 도토리"
          value={
            loaded ? (
              `${weekExpenses.length}개`
            ) : (
              <Skeleton className="h-6 w-14" />
            )
          }
          hint={loaded ? formatKRW(weekExpenses.reduce((a, e) => a + e.amount, 0)) : ""}
        />
        <StatCard
          Icon={MapPin}
          label="제일 자주 담은 곳"
          value={
            loaded ? (
              (weekStats?.favoriteName ?? "아직 없어요")
            ) : (
              <Skeleton className="h-6 w-20" />
            )
          }
          hint={
            weekStats && weekStats.favoriteCount > 1
              ? `${weekStats.favoriteCount}번이나 갔어요`
              : ""
          }
        />
        <StatCard
          Icon={MoonStar}
          label="가장 늦게 담은 도토리"
          value={
            loaded ? (
              weekStats ? (
                timeLabel(weekStats.latest.created_at)
              ) : (
                "아직 없어요"
              )
            ) : (
              <Skeleton className="h-6 w-16" />
            )
          }
          hint={weekStats ? weekStats.latest.memo || weekStats.latest.category : ""}
        />
      </div>

      {/* 타임라인 */}
      <div className="mt-10">
        {!loaded ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : dayExpenses.length === 0 ? (
          <div className="rounded-(--radius-card) border border-line py-14 text-center">
            <p className="text-base font-medium text-ink">
              이 날은 도토리를 안 담았어요
            </p>
            <p className="mt-1 text-sm text-sub">조용한 하루였네요 🐿️</p>
          </div>
        ) : (
          <ol className="relative ml-[52px] border-l-2 border-line">
            {dayExpenses.map((e) => {
              const { Icon: TimeIcon, name } = timeOfDay(e.created_at);
              const CategoryIcon = CATEGORY_ICONS[e.category];
              return (
                <li key={e.id} className="relative pb-8 pl-8 last:pb-2">
                  {/* 시각 — 선 왼쪽 */}
                  <span className="absolute top-1.5 -left-[52px] w-10 text-right text-[13px] font-medium text-sub">
                    {timeLabel(e.created_at)}
                  </span>
                  {/* 시간대 아이콘 — 선 위의 점 */}
                  <span className="absolute top-0 -left-[15px] flex size-7 items-center justify-center rounded-full border border-line-strong bg-white">
                    <TimeIcon size={14} strokeWidth={2} className="text-sub" />
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-soft">
                      <CategoryIcon
                        size={18}
                        strokeWidth={2}
                        className="text-ink"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-ink">
                        {e.memo || e.category}
                      </p>
                      <p className="text-[13px] text-sub">
                        {name} · {e.category}
                      </p>
                    </div>
                    <span className="text-[15px] font-semibold whitespace-nowrap text-ink">
                      {formatKRW(e.amount)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {loaded && dayExpenses.length > 0 && (
          <p className="mt-6 text-[13px] text-hint">
            도토리 {dayExpenses.length}개 ·{" "}
            {formatKRW(dayExpenses.reduce((a, e) => a + e.amount, 0))} · 적은
            시간 기준이에요
          </p>
        )}
      </div>
    </main>
  );
}

function StatCard({
  Icon,
  label,
  value,
  hint,
}: {
  Icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="rounded-(--radius-card) border border-line-strong p-5">
      <div className="flex items-center gap-1.5 text-sub">
        <Icon size={14} strokeWidth={2} />
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <div className="mt-2 truncate text-lg font-bold text-ink">{value}</div>
      <p className="mt-0.5 h-4 truncate text-[13px] text-hint">{hint}</p>
    </div>
  );
}
