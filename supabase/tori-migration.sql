-- 토리 마이그레이션: 지출 수정(update) 정책 추가
-- Supabase 대시보드 > SQL Editor에서 이 파일 전체를 실행하세요.
-- (auth-migration.sql에 select/insert/delete 정책은 이미 있고 update만 빠져 있습니다)

drop policy if exists "users update own expenses" on public.expenses;
create policy "users update own expenses"
  on public.expenses for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
