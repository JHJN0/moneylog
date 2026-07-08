"use client";

import { useState } from "react";
import ExpenseCard from "@/components/ExpenseCard";
import { Expense } from "@/types/expense";

// 1단계: 더미 데이터. 2~3단계에서 실제 API 파싱 결과로 대체됨.
const DUMMY_EXPENSES: Expense[] = [
  { id: "1", date: "2026-07-02", item: "편의점 도시락", amount: 5500, category: "식비" },
  { id: "2", date: "2026-07-02", item: "지하철", amount: 1400, category: "교통" },
  { id: "3", date: "2026-07-01", item: "영화관람", amount: 14000, category: "문화" },
  { id: "4", date: "2026-06-30", item: "온라인 쇼핑", amount: 32000, category: "쇼핑" },
];

export default function Home() {
  const [expenses] = useState<Expense[]>(DUMMY_EXPENSES);
  const [input, setInput] = useState("");

  // 2~3단계에서 여기에 Claude API 호출 로직이 들어갈 예정
  const handleAdd = () => {
    if (!input.trim()) return;
    alert(`(임시) 아직 파싱 로직 없음: "${input}"`);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4">
        <h1 className="text-2xl font-bold text-zinc-900">머니로그</h1>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="예: 어제 편의점 3천원"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <button
            onClick={handleAdd}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            추가
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </ul>
      </main>
    </div>
  );
}
