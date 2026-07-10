"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LogOut } from "lucide-react";
import { displayName, signOut } from "@/lib/auth";
import { useUser } from "@/lib/useUser";

const MENU = [
  { href: "/", label: "대시보드" },
  { href: "/history", label: "지출 내역" },
  { href: "/add", label: "지출 적기" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className="border-b border-line bg-white px-12 py-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Wallet size={24} strokeWidth={2} className="text-rausch" />
          <span className="text-xl font-bold text-ink">머니로그</span>
        </Link>
        {user && (
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
            <span className="text-base font-medium text-ink">
              {displayName(user)}님
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="로그아웃"
              className="flex items-center gap-1.5 text-base font-medium text-sub hover:text-ink"
            >
              <LogOut size={16} strokeWidth={2} />
              로그아웃
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
