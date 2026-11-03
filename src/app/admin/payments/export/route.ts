// =====================================================
// 어드민 — 결제 고객 CSV 다운로드 (payment_events 기반)
// =====================================================
// GET /admin/payments/export?status=paid
// 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 을 붙인다.
import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { loadPaymentRows, formatPerson, genderLabel, TIER_LABEL } from "@/lib/admin/payments";

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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
  const { rows: all, error } = await loadPaymentRows();
  if (error) return NextResponse.json({ error }, { status: 500 });
  const rows = status ? all.filter((r) => r.status === status) : all;

  const header = [
    "결제일시(KST)", "주문번호", "상태", "상품", "카테고리", "패키지", "금액", "결제수단",
    "이름", "이메일", "성별", "본인 생년월일", "상대방 정보", "고민", "질문", "기타",
    "결과화면 미도달 의심", "토스 paymentKey",
  ];

  const lines = rows.map((r) => {
    const c = r.customer;
    return [
      toKST(r.paidAt ?? r.createdAt),
      r.orderId,
      r.statusLabel,
      r.productName ?? "",
      r.category ?? "",
      r.tier ? TIER_LABEL[r.tier] ?? r.tier : "",
      r.amount ?? "",
      r.method ?? "",
      c?.name ?? "",
      c?.email ?? "",
      genderLabel(c?.gender),
      formatPerson(c?.me),
      formatPerson(c?.partner),
      c?.concerns ?? "",
      c?.question ?? "",
      c?.details ?? "",
      r.missingClientConfirm ? "Y" : "",
      r.paymentKey ?? "",
    ];
  });

  const csv = "﻿" + [header, ...lines].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const filename = `payments_${status || "all"}_${today}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
