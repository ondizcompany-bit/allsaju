import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { confirmTossPayment } from "@/lib/toss/confirm";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

const bodySchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().nonnegative(),
  category: z.string().optional(),
  tier: z.string().optional(),
});

// Supabase 없이 토스 결제만 승인하는 경량 엔드포인트.
// 성공 시 payment_events에도 기록해서 (토스 웹훅과 대조용) — 웹훅에는
// 있는데 이 client_confirmed 기록이 없는 order_id가 있으면, 결제는
// 됐는데 결과 화면까지 못 온 고객 건이라는 뜻이다.
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const { paymentKey, orderId, amount, category, tier } = parsed.data;

  const toss = await confirmTossPayment({ paymentKey, orderId, amount });

  if (!toss.ok) {
    return NextResponse.json(
      { error: toss.error.message, code: toss.error.code },
      { status: 402 }
    );
  }

  if (toss.data.totalAmount !== amount) {
    return NextResponse.json({ error: "금액이 일치하지 않습니다" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const service = createServiceClient();
      await service.from("payment_events").insert({
        order_id: orderId,
        payment_key: paymentKey,
        amount,
        category: category ?? null,
        tier: tier ?? null,
        status: "client_confirmed",
        source: "client",
        raw: toss.data as never,
      });
    } catch (e) {
      // 기록 실패는 결제 승인 자체를 막지 않는다 — 로그만 남긴다.
      console.error("payment_events insert failed", e);
    }
  }

  return NextResponse.json({
    success: true,
    method: toss.data.method,
    approvedAt: toss.data.approvedAt,
  });
}
