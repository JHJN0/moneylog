-- 토리 한줄 일기(diaries) 테이블 + 본인 전용 RLS
-- Supabase 대시보드 > SQL Editor에서 이 파일 전체를 실행하세요.

create table if not exists public.diaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  date date not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date) -- 하루에 한 줄
);

alter table public.diaries enable row level security;

drop policy if exists "users read own diaries" on public.diaries;
create policy "users read own diaries"
  on public.diaries for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users insert own diaries" on public.diaries;
create policy "users insert own diaries"
  on public.diaries for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users update own diaries" on public.diaries;
create policy "users update own diaries"
  on public.diaries for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users delete own diaries" on public.diaries;
create policy "users delete own diaries"
  on public.diaries for delete to authenticated
  using (auth.uid() = user_id);
