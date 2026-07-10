import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경변수가 없으면 null — 데이터 계층에서 빈 결과로 처리해 데모가 죽지 않게 한다
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
