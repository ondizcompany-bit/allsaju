-- =====================================================
-- 결제 이벤트 안전망 (payment_events)
-- =====================================================
-- 배경: 현재 게스트 결제 흐름은 고객 브라우저가 직접
-- /api/payments/confirm 을 호출해야만 결제가 최종 처리된다.
-- 결제 직후 네트워크 끊김·앱 전환·브라우저 종료 등으로 이 요청이
-- 서버에 도달하지 못하면, 토스에는 결제가 잡혀있는데 우리 시스템은
-- 그 결제를 전혀 모르는 상태가 된다 ("결제 내역만 되고 결과를
-- 못 봤다"는 고객 문의의 근본 원인).
--
-- 이를 막기 위해 토스 웹훅이 고객 브라우저와 무관하게 독립적으로
-- 결제 상태를 이 테이블에 기록한다. 클라이언트 confirm 성공 시에도
-- 같은 테이블에 기록해서, 나중에 "웹훅에는 잡혔는데 클라이언트
-- 기록이 없는" 케이스(=이번 사고 유형)를 바로 찾아낼 수 있다.
--
-- 기존 orders 테이블은 product_id가 레거시 상품 카탈로그를
-- 참조해야 해서(FK 제약), 지금 쓰는 카테고리 기반 상품과 맞지 않아
-- 별도 테이블로 둔다.

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
  payment_key text,
  amount integer,
  category text,
  tier text,
  status text not null,                 -- 'client_confirmed' | 'webhook_done' | 'webhook_canceled' | 'failed' 등
  source text not null check (source in ('client', 'webhook')),
  raw jsonb,
  created_at timestamptz not null default now()
);

create index payment_events_order_idx on public.payment_events(order_id);
create index payment_events_created_idx on public.payment_events(created_at desc);
create index payment_events_status_idx on public.payment_events(status);

-- service_role(서버 route handler)만 쓰는 테이블이라 일반 사용자 접근은 전부 차단한다.
alter table public.payment_events enable row level security;

create policy "payment_events no client access"
  on public.payment_events for all
  using (false)
  with check (false);

comment on table public.payment_events is
  '토스 결제 상태를 클라이언트/웹훅 양쪽에서 독립적으로 기록하는 안전망 로그. order_id 기준으로 조회해 client_confirmed가 없는데 webhook_done만 있는 건을 찾으면, 결과 생성이 누락된 결제 건이다.';
