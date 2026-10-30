// =====================================================
// 어드민 — 전체 주문 데이터 CSV 다운로드
// =====================================================
// GET /admin/orders/export?status=paid
// orders + products + profiles(이메일/이름/전화) + saju_inputs 를 합쳐 CSV 로 반환.
// 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 을 붙인다.
import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

const PAGE_SIZE = 1000;
const IN_CHUNK = 200;

const STATUS_LABEL: Record<string, string> = {
  paid: "결제완료",
  pending: "결제대기",
  failed: "실패",
};

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function toKST(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Seoul" });
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase 미연결" }, { status: 503 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const service = createServiceClient();

  // 1) orders — 1000건씩 페이지네이션으로 전부
  type Order = {
    id: string;
    order_id: string;
    user_id: string | null;
    guest_email: string | null;
    product_id: string;
    amount: number;
    status: string;
    toss_payment_key: string | null;
    paid_at: string | null;
    created_at: string;
  };
  const orders: Order[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = service
      .from("orders")
      .select("id, order_id, user_id, guest_email, product_id, amount, status, toss_payment_key, paid_at, created_at")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (status && ["pending", "paid", "failed"].includes(status)) {
      query = query.eq("status", status as "pending" | "paid" | "failed");
    }
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    orders.push(...((data ?? []) as Order[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  // 2) 연관 데이터
  const productMap = new Map<string, string>();
  const productIds = Array.from(new Set(orders.map((o) => o.product_id)));
  for (const ids of chunk(productIds, IN_CHUNK)) {
    const { data } = await service.from("products").select("id, name").in("id", ids);
    for (const p of data ?? []) productMap.set(p.id, p.name);
  }

  type Profile = { id: string; email: string; display_name: string | null; phone: string | null };
  const profileMap = new Map<string, Profile>();
  const userIds = Array.from(new Set(orders.map((o) => o.user_id).filter((v): v is string => !!v)));
  for (const ids of chunk(userIds, IN_CHUNK)) {
    const { data } = await service.from("profiles").select("id, email, display_name, phone").in("id", ids);
    for (const p of (data ?? []) as Profile[]) profileMap.set(p.id, p);
  }

  type Input = {
    order_id: string;
    name: string | null;
    birth_date: string;
    birth_time: string | null;
    time_unknown: boolean;
    gender: string;
    calendar: string;
    concerns: string[];
  };
  const inputMap = new Map<string, Input>();
  const resultMap = new Map<string, string>();
  for (const ids of chunk(orders.map((o) => o.id), IN_CHUNK)) {
    const [{ data: inputs }, { data: results }] = await Promise.all([
      service
        .from("saju_inputs")
        .select("order_id, name, birth_date, birth_time, time_unknown, gender, calendar, concerns")
        .in("order_id", ids),
      service.from("saju_results").select("id, order_id").in("order_id", ids),
    ]);
    for (const i of (inputs ?? []) as Input[]) inputMap.set(i.order_id, i);
    for (const r of results ?? []) resultMap.set(r.order_id, r.id);
  }

  // 3) CSV
  const siteUrl = request.nextUrl.origin;
  const header = [
    "주문일시(KST)", "결제일시(KST)", "주문번호", "상태", "상품", "금액",
    "이메일", "회원명", "전화번호",
    "사주 이름", "생년월일", "출생시간", "시간모름", "성별", "양력/음력", "고민",
    "결과 링크", "토스 paymentKey",
  ];
  const rows = orders.map((o) => {
    const profile = o.user_id ? profileMap.get(o.user_id) : undefined;
    const input = inputMap.get(o.id);
    const resultId = resultMap.get(o.id);
    return [
      toKST(o.created_at),
      toKST(o.paid_at),
      o.order_id,
      STATUS_LABEL[o.status] ?? o.status,
      productMap.get(o.product_id) ?? "",
      o.amount,
      profile?.email ?? o.guest_email ?? "",
      profile?.display_name ?? "",
      profile?.phone ?? "",
      input?.name ?? "",
      input?.birth_date ?? "",
      input?.birth_time?.slice(0, 5) ?? "",
      input ? (input.time_unknown ? "Y" : "N") : "",
      input ? (input.gender === "male" ? "남" : "여") : "",
      input ? (input.calendar === "lunar" ? "음력" : "양력") : "",
      input?.concerns?.join(" / ") ?? "",
      resultId ? `${siteUrl}/results/${resultId}` : "",
      o.toss_payment_key ?? "",
    ];
  });

  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const filename = `orders_${status || "all"}_${today}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
