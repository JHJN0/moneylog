import { Category, Expense } from "@/types/expense";

const CATEGORY_STYLE: Record<Category, string> = {
  식비: "bg-orange-100 text-orange-700",
  교통: "bg-blue-100 text-blue-700",
  쇼핑: "bg-pink-100 text-pink-700",
  문화: "bg-purple-100 text-purple-700",
  기타: "bg-zinc-100 text-zinc-700",
};

export default function ExpenseCard({ expense }: { expense: Expense }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500">{expense.date}</span>
        <span className="font-medium text-zinc-900">{expense.item}</span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_STYLE[expense.category]}`}
        >
          {expense.category}
        </span>
        <span className="w-20 text-right font-semibold text-zinc-900">
          {expense.amount.toLocaleString()}원
        </span>
      </div>
    </li>
  );
}
