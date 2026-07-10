-- 머니로그 인증 마이그레이션: 사용자별 데이터 분리
-- Supabase 대시보드 > SQL Editor에서 이 파일 전체를 실행하세요.
-- 실행 후 Authentication > Providers > Email 에서 "Confirm email"을 꺼주세요.
-- (아이디 기반 가상 이메일을 쓰므로 확인 메일을 보낼 수 없습니다)

-- 1) user_id 컬럼 추가 — insert 시 로그인한 사용자의 id가 자동으로 들어감
alter table public.expenses
  add column if not exists user_id uuid
    references auth.users (id) on delete cascade
    default auth.uid();

-- 2) 주인 없는 기존 데이터(시드·테스트) 삭제 후 user_id 필수화
delete from public.expenses where user_id is null;

alter table public.expenses alter column user_id set not null;

-- 3) 익명 정책 제거 → 로그인한 본인 데이터만 읽고 쓰게
drop policy if exists "anon can read expenses" on public.expenses;
drop policy if exists "anon can insert expenses" on public.expenses;

drop policy if exists "users read own expenses" on public.expenses;
create policy "users read own expenses"
  on public.expenses for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users insert own expenses" on public.expenses;
create policy "users insert own expenses"
  on public.expenses for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users delete own expenses" on public.expenses;
create policy "users delete own expenses"
  on public.expenses for delete to authenticated
  using (auth.uid() = user_id);
