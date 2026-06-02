import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { confirmTossPayment } from "@/lib/toss/confirm";

const bodySchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().nonnegative(),
});

// Supabase 없이 토스 결제만 승인하는 경량 엔드포인트 (데모 / 테스트용)
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const { paymentKey, orderId, amount } = parsed.data;

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

  return NextResponse.json({
    success: true,
    method: toss.data.method,
    approvedAt: toss.data.approvedAt,
  });
}
