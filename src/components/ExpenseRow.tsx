import {
  Utensils,
  Coffee,
  TrainFront,
  ShoppingBag,
  House,
  Clapperboard,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Category, Expense, formatKRW, dateLabel } from "@/types";

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  식비: Utensils,
  카페: Coffee,
  교통: TrainFront,
  쇼핑: ShoppingBag,
  주거: House,
  문화: Clapperboard,
  기타: Tag,
};

interface Props {
  expense: Expense;
  showDate?: boolean; // 대시보드 최근 지출에서 날짜 컬럼 표시
}

export default function ExpenseRow({ expense, showDate = false }: Props) {
  const Icon = CATEGORY_ICONS[expense.category];

  return (
    <li className="flex items-center gap-3 border-b border-line py-3.5 last:border-b-0">
      {showDate && (
        <span className="w-[92px] shrink-0 text-sm text-sub">
          {dateLabel(expense.date)}
        </span>
      )}
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft">
        <Icon size={20} strokeWidth={2} className="text-ink" />
      </span>
      <span className="whitespace-nowrap text-[15px] font-medium text-ink">
        {expense.category}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-sub">
        {expense.memo}
      </span>
      <span className="whitespace-nowrap text-[15px] font-semibold text-ink">
        {formatKRW(expense.amount)}
      </span>
    </li>
  );
}
