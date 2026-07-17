"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Squirrel, LogOut } from "lucide-react";
import { displayName, signOut } from "@/lib/auth";
import { useUser } from "@/lib/useUser";

const MENU = [
  { href: "/", label: "대시보드" },
  { href: "/history", label: "지출 내역" },
  { href: "/timeline", label: "하루 이야기" },
  { href: "/add", label: "지출 적기" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <header className="border-b border-line bg-white px-4 py-4 sm:px-12 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Squirrel size={24} strokeWidth={2} className="text-rausch" />
          <span className="text-xl font-bold text-ink">토리</span>
        </Link>
        {user && (
          <nav className="flex items-center gap-3.5 sm:gap-8">
            {MENU.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "border-b-2 border-ink pb-0.5 text-sm font-semibold whitespace-nowrap text-ink sm:text-base"
                      : "pb-0.5 text-sm font-medium whitespace-nowrap text-sub hover:text-ink sm:text-base"
                  }
                >
                  {label}
                </Link>
              );
            })}
            <span className="hidden text-base font-medium whitespace-nowrap text-ink lg:inline">
              {displayName(user)}님
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="로그아웃"
              className="flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-sub hover:text-ink sm:text-base"
            >
              <LogOut size={16} strokeWidth={2} />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
