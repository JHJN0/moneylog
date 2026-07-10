"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";

const MENU = [
  { href: "/", label: "대시보드" },
  { href: "/history", label: "지출 내역" },
  { href: "/add", label: "지출 적기" },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-white px-12 py-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Wallet size={24} strokeWidth={2} className="text-rausch" />
          <span className="text-xl font-bold text-ink">머니로그</span>
        </Link>
        <nav className="flex items-center gap-8">
          {MENU.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "border-b-2 border-ink pb-0.5 text-base font-semibold text-ink"
                    : "pb-0.5 text-base font-medium text-sub hover:text-ink"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
