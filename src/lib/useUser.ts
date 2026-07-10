"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getCurrentUser, onAuthChange } from "@/lib/auth";

// 현재 로그인 사용자. loading이 true인 동안은 아직 세션 확인 전이다
export function useUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });
    const unsubscribe = onAuthChange((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading };
}
