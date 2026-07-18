import { supabase } from "@/lib/supabase";

export interface Diary {
  id: string;
  date: string; // 'YYYY-MM-DD'
  content: string;
  updated_at: string;
}

const MIGRATION_HINT =
  "일기장이 아직 준비되지 않았어요. supabase/diary-migration.sql을 실행해주세요";

function translateDiaryError(err: unknown): Error {
  // Supabase의 PostgrestError는 Error 인스턴스가 아닐 수 있어 message를 직접 꺼낸다
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
  if (/relation .*diaries.* does not exist|schema cache/i.test(message))
    return new Error(MIGRATION_HINT);
  return new Error(message);
}

// 그 날의 한줄 일기 (없으면 null)
export async function fetchDiary(date: string): Promise<Diary | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) throw translateDiaryError(error);
  return (data as Diary) ?? null;
}

// 한줄 일기 저장 — 이미 있으면 덮어쓰고, 빈 내용이면 지운다
export async function saveDiary(
  date: string,
  content: string,
): Promise<Diary | null> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았어요");
  const trimmed = content.trim();

  if (!trimmed) {
    const { error } = await supabase.from("diaries").delete().eq("date", date);
    if (error) throw translateDiaryError(error);
    return null;
  }

  const { data, error } = await supabase
    .from("diaries")
    .upsert(
      { date, content: trimmed, updated_at: new Date().toISOString() },
      { onConflict: "user_id,date" },
    )
    .select()
    .single();
  if (error) throw translateDiaryError(error);
  return data as Diary;
}
