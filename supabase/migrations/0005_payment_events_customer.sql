-- =====================================================
-- 결제 고객 정보 저장 (payment_events.customer*)
-- =====================================================
-- 게스트 결제 흐름은 고객이 입력한 이름/이메일/생년월일/고민을 브라우저
-- localStorage 에만 두고 있어서, 결제 후 "누가 결제했는지" 를 조회할 수
-- 없었다. 결제 승인(client_confirmed) 기록에 고객 정보를 함께 남긴다.
--
-- Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 Run 하면 된다.
-- 0004(payment_events 테이블)를 아직 적용하지 않은 DB 에서도 돌아가도록
-- 테이블 생성부터 멱등(if not exists)으로 작성했다.

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
  payment_key text,
  amount integer,
  category text,
  tier text,
  status text not null,
  source text not null check (source in ('client', 'webhook')),
  raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_order_idx on public.payment_events(order_id);
create index if not exists payment_events_created_idx on public.payment_events(created_at desc);
create index if not exists payment_events_status_idx on public.payment_events(status);

alter table public.payment_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payment_events'
      and policyname = 'payment_events no client access'
  ) then
    create policy "payment_events no client access"
      on public.payment_events for all
      using (false)
      with check (false);
  end if;
end $$;

alter table public.payment_events add column if not exists customer_name text;
alter table public.payment_events add column if not exists customer_email text;
alter table public.payment_events add column if not exists customer jsonb;

create index if not exists payment_events_customer_email_idx on public.payment_events(customer_email);
