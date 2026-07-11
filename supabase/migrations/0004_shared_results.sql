-- ─── shared_results ──────────────────────────────────
-- 이메일로 발송하는 "결과지 링크"용 — 생성된 결과를 영구 저장해
-- /results/[id] 로 언제든 다시 열어볼 수 있게 한다.
-- order_id 등 결제 스키마와 독립적으로, service_role 클라이언트로만 쓰고 읽는다.

create table public.shared_results (
  id uuid primary key default gen_random_uuid(),
  category_id text not null,
  category_title text not null,
  tier text not null,
  name text not null,
  sections jsonb not null,
  tarot_card jsonb,
  created_at timestamptz not null default now()
);

alter table public.shared_results enable row level security;

-- 링크를 아는 사람은 누구나 볼 수 있다 (비밀번호 없는 공유 링크와 동일한 모델)
create policy "shared_results are publicly readable"
  on public.shared_results for select
  using (true);

-- 쓰기는 service_role(서버)에서만 — 별도 insert policy 없음(기본 거부)
