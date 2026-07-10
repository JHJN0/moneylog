-- 머니로그 expenses 테이블 + 시드 데이터
-- Supabase 대시보드 > SQL Editor에서 이 파일 전체를 실행하세요.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  category text not null check (
    category in ('식비', '카페', '교통', '쇼핑', '주거', '문화', '기타')
  ),
  memo text not null default '',
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- RLS: 익명 read/write 허용 (데모용 — 실서비스에서는 인증 기반 정책으로 교체)
alter table public.expenses enable row level security;

drop policy if exists "anon can read expenses" on public.expenses;
create policy "anon can read expenses"
  on public.expenses for select
  using (true);

drop policy if exists "anon can insert expenses" on public.expenses;
create policy "anon can insert expenses"
  on public.expenses for insert
  with check (true);

-- 시드 데이터: 이번 달 1~3일, 총 183,450원 · 7건
-- date_trunc 기준이라 어느 달에 실행해도 "이번 달" 데이터로 들어갑니다.
insert into public.expenses (date, category, memo, amount) values
  (date_trunc('month', current_date)::date + 2, '식비', '점심 김치찌개', 9500),
  (date_trunc('month', current_date)::date + 2, '카페', '아이스 라떼', 5000),
  (date_trunc('month', current_date)::date + 2, '교통', '지하철', 1550),
  (date_trunc('month', current_date)::date + 1, '식비', '마트 장보기', 32400),
  (date_trunc('month', current_date)::date + 1, '문화', '넷플릭스', 13500),
  (date_trunc('month', current_date)::date,     '주거', '관리비', 120000),
  (date_trunc('month', current_date)::date,     '교통', '버스', 1500);
