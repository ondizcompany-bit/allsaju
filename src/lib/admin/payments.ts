// =====================================================
// 어드민 — 결제 고객 목록 (payment_events 기반)
// =====================================================
// 실제 결제 흐름(게스트 결제)은 orders 테이블이 아니라 payment_events 에
// 기록된다. 같은 주문에 대해 클라이언트 승인(client_confirmed)과 토스
// 웹훅(webhook_*) 이벤트가 여러 건 쌓이므로 order_id 기준으로 한 줄로 합친다.
import { createServiceClient } from "@/lib/supabase/server";

const PAGE_SIZE = 1000;

type EventRow = {
  order_id: string;
  payment_key: string | null;
  amount: number | null;
  category: string | null;
  tier: string | null;
  status: string;
  source: "client" | "webhook";
  raw: unknown;
  customer: unknown;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
};

export type Person = {
  name?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  calendarType?: string;
};

export type Customer = {
  name?: string;
  email?: string;
  gender?: string;
  me?: Person;
  partner?: Person;
  concerns?: string;
  question?: string;
  details?: string;
};

export type PaymentStatus = "paid" | "canceled" | "other";

export type PaymentRow = {
  orderId: string;
  paymentKey: string | null;
  amount: number | null;
  category: string | null;
  tier: string | null;
  productName: string | null;
  method: string | null;
  status: PaymentStatus;
  statusLabel: string;
  paidAt: string | null;
  createdAt: string;
  customer: Customer | null;
  // 웹훅으로는 결제가 확인됐는데 고객 브라우저의 승인 기록이 없는 건
  // = 결제는 됐지만 결과 화면까지 못 왔을 수 있는 고객
  missingClientConfirm: boolean;
};

function asObj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

function statusOf(events: EventRow[]): { status: PaymentStatus; label: string } {
  // 가장 최근 웹훅 상태가 진실 — 없으면 클라이언트 승인 = 결제완료
  const lastWebhook = [...events].reverse().find((e) => e.source === "webhook");
  const s = lastWebhook?.status ?? (events.some((e) => e.status === "client_confirmed") ? "webhook_done" : events.at(-1)?.status ?? "");
  if (s === "webhook_done" || s === "client_confirmed") return { status: "paid", label: "결제완료" };
  if (s === "webhook_canceled") return { status: "canceled", label: "취소" };
  if (s === "webhook_partial_canceled") return { status: "canceled", label: "부분취소" };
  return { status: "other", label: s.replace(/^webhook_/, "") || "-" };
}

export async function loadPaymentRows(): Promise<{ rows: PaymentRow[]; error: string | null }> {
  const service = createServiceClient();
  const events: EventRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await service
      .from("payment_events")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      const msg = error.message ?? "";
      return {
        rows: [],
        error: msg.trimStart().startsWith("<")
          ? "데이터베이스(Supabase)에 연결하지 못했어요. Vercel 환경변수 NEXT_PUBLIC_SUPABASE_URL 이 https://xxxx.supabase.co 형태인지 확인하세요."
          : msg,
      };
    }
    events.push(...((data ?? []) as unknown as EventRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  const byOrder = new Map<string, EventRow[]>();
  for (const e of events) {
    const list = byOrder.get(e.order_id);
    if (list) list.push(e);
    else byOrder.set(e.order_id, [e]);
  }

  const rows: PaymentRow[] = [];
  for (const [orderId, list] of byOrder) {
    const client = list.find((e) => e.source === "client");
    const withRaw = [...list].reverse().find((e) => asObj(e.raw));
    const raw = asObj(withRaw?.raw);
    const legacyCustomer = asObj(asObj(client?.raw)?._customer);
    const customer = (asObj(client?.customer) ?? legacyCustomer) as Customer | null;
    const merged: Customer | null =
      customer || client?.customer_name || client?.customer_email
        ? { ...(customer ?? {}), name: customer?.name ?? client?.customer_name ?? undefined, email: customer?.email ?? client?.customer_email ?? undefined }
        : null;
    const { status, label } = statusOf(list);

    rows.push({
      orderId,
      paymentKey: list.find((e) => e.payment_key)?.payment_key ?? null,
      amount: list.find((e) => e.amount != null)?.amount ?? null,
      category: client?.category ?? list.find((e) => e.category)?.category ?? null,
      tier: client?.tier ?? list.find((e) => e.tier)?.tier ?? null,
      productName: str(raw?.orderName),
      method: str(raw?.method),
      status,
      statusLabel: label,
      paidAt: str(raw?.approvedAt),
      createdAt: list[0].created_at,
      customer: merged,
      missingClientConfirm: !client && status === "paid",
    });
  }

  rows.sort((a, b) => (b.paidAt ?? b.createdAt).localeCompare(a.paidAt ?? a.createdAt));
  return { rows, error: null };
}

export const TIER_LABEL: Record<string, string> = {
  single: "단품",
  basic: "베이직",
  premium: "종합",
  addon: "추가 질문",
};

export function genderLabel(g?: string): string {
  if (g === "male") return "남";
  if (g === "female") return "여";
  return g ?? "";
}

export function formatPerson(p?: Person): string {
  if (!p) return "";
  const cal = p.calendarType === "lunar" ? "음력" : p.calendarType === "solar" ? "양력" : "";
  return [p.name, genderLabel(p.gender), p.birthDate && `${p.birthDate}${cal ? `(${cal})` : ""}`, p.birthTime]
    .filter(Boolean)
    .join(" ");
}
