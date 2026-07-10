import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// 아이디를 Supabase Auth용 가상 이메일로 변환 — 사용자는 이메일 없이 아이디만 쓴다
const EMAIL_DOMAIN = "id.moneylog.app";

export const USERNAME_RULE = "아이디는 영문 소문자·숫자·밑줄(_) 3~20자예요";
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function validUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

function toEmail(username: string): string {
  return `${username}@${EMAIL_DOMAIN}`;
}

export function displayName(user: User): string {
  const meta = user.user_metadata as { username?: string };
  return meta.username ?? user.email?.split("@")[0] ?? "사용자";
}

function translateAuthError(message: string): Error {
  if (/already registered|already exists/i.test(message))
    return new Error("이미 사용 중인 아이디예요");
  if (/invalid login credentials/i.test(message))
    return new Error("아이디 또는 비밀번호가 맞지 않아요");
  if (/at least 6 characters/i.test(message))
    return new Error("비밀번호는 6자 이상이어야 해요");
  if (/email not confirmed/i.test(message))
    return new Error(
      "계정 확인 대기 상태예요. Supabase에서 Confirm email 설정을 꺼주세요",
    );
  return new Error(message);
}

function noClientError(): Error {
  return new Error("Supabase가 설정되지 않았어요");
}

export async function signUp(username: string, password: string): Promise<void> {
  if (!supabase) throw noClientError();
  const { data, error } = await supabase.auth.signUp({
    email: toEmail(username),
    password,
    options: { data: { username } },
  });
  if (error) throw translateAuthError(error.message);
  if (!data.session)
    throw new Error(
      "가입은 됐지만 자동 로그인이 안 됐어요. 로그인 탭에서 다시 시도해주세요",
    );
}

export async function signIn(username: string, password: string): Promise<void> {
  if (!supabase) throw noClientError();
  const { error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  });
  if (error) throw translateAuthError(error.message);
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

// 로그인 상태 변화 구독 — 반환값을 호출하면 구독 해제
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
