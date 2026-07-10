"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Loader2 } from "lucide-react";
import { signIn, signUp, validUsername, USERNAME_RULE } from "@/lib/auth";

type Mode = "login" | "signup";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = username.trim().toLowerCase();
    if (loading) return;

    if (!validUsername(id)) {
      setError(USERNAME_RULE);
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 해요");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") await signUp(id, password);
      else await signIn(id, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해주세요");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-[400px] flex-col items-center">
        <Wallet size={40} strokeWidth={2} className="text-rausch" />
        <h1 className="mt-3 text-[32px] font-bold text-ink">머니로그</h1>
        <p className="mt-2 text-base text-sub">
          {mode === "login"
            ? "다시 만나서 반가워요"
            : "아이디 하나로 바로 시작해요"}
        </p>

        {/* 로그인 / 회원가입 탭 */}
        <div className="mt-8 flex w-full rounded-full border border-line-strong p-1">
          {(
            [
              ["login", "로그인"],
              ["signup", "회원가입"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
              className={`flex-1 rounded-full py-2 text-sm font-medium ${
                mode === value
                  ? "bg-ink text-white"
                  : "text-sub hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디"
            autoComplete="username"
            autoCapitalize="none"
            className="h-13 w-full rounded-full border border-line-strong px-6 text-base text-ink outline-none placeholder:text-hint focus:border-2 focus:border-ink"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="h-13 w-full rounded-full border border-line-strong px-6 text-base text-ink outline-none placeholder:text-hint focus:border-2 focus:border-ink"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex h-13 w-full items-center justify-center rounded-full bg-rausch text-base font-semibold text-white hover:bg-rausch-press active:bg-rausch-press disabled:bg-disabled"
          >
            {loading ? (
              <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />
            ) : mode === "login" ? (
              "로그인"
            ) : (
              "가입하고 시작하기"
            )}
          </button>
        </form>

        {/* 상태 메시지 */}
        <div className="mt-4 h-6">
          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        {mode === "signup" && (
          <p className="text-center text-[13px] text-hint">
            {USERNAME_RULE}
            <br />
            이메일 없이 아이디와 비밀번호만으로 가입돼요
          </p>
        )}
      </div>
    </main>
  );
}
