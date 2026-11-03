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
  // 고객이 결제 전에 입력한 정보 (이름/이메일/생년월일/고민 등) — 어드민 조회용 기록
  customer: z
    .object({
      name: z.string().max(100).optional(),
      email: z.string().max(200).optional(),
      gender: z.string().max(20).optional(),
      me: z.record(z.string(), z.string().max(100)).optional(),
      partner: z.record(z.string(), z.string().max(100)).optional(),
      concerns: z.string().max(1000).optional(),
      question: z.string().max(1000).optional(),
      details: z.string().max(1000).optional(),
    })
    .optional()
    .catch(undefined),
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

  const { paymentKey, orderId, amount, category, tier, customer } = parsed.data;

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
      const base = {
        order_id: orderId,
        payment_key: paymentKey,
        amount,
        category: category ?? null,
        tier: tier ?? null,
        status: "client_confirmed",
        source: "client" as const,
      };
      const { error } = await service.from("payment_events").insert({
        ...base,
        customer_name: customer?.name ?? null,
        customer_email: customer?.email ?? null,
        customer: (customer ?? null) as never,
        raw: toss.data as never,
      });
      if (error) {
        // 0005 마이그레이션(customer 컬럼) 적용 전이면 컬럼 없음 오류가 난다 —
        // 고객 정보를 raw 안에 넣어서라도 기록을 남긴다.
        console.error("payment_events insert failed, retrying without customer columns", error.message);
        const { error: retryErr } = await service.from("payment_events").insert({
          ...base,
          raw: { ...(toss.data as object), _customer: customer ?? null } as never,
        });
        if (retryErr) console.error("payment_events insert failed", retryErr.message);
      }
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
