"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/lib/useUser";

const PUBLIC_PATHS = ["/login"];

// 비로그인 사용자는 /login으로, 로그인 사용자가 /login에 오면 대시보드로
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) router.replace("/login");
    if (user && isPublic) router.replace("/");
  }, [user, loading, isPublic, router]);

  if (loading || (!user && !isPublic) || (user && isPublic)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 size={24} strokeWidth={2} className="animate-spin text-sub" />
      </div>
    );
  }
  return <>{children}</>;
}
