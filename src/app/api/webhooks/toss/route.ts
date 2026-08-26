// =====================================================
// POST /api/webhooks/toss
// =====================================================
// 토스페이먼츠 웹훅 수신. 고객 브라우저와 완전히 무관하게, 토스 서버가
// 결제 상태 변경을 우리 서버에 직접 알려주는 안전망이다.
//
// 왜 필요한가: 지금까지는 고객 브라우저가 결제 후 돌아와서 직접
// /api/payments/confirm 을 호출해야만 결제가 최종 처리됐다. 그 요청이
// 네트워크 문제·앱 전환·브라우저 종료 등으로 서버에 도달하지 못하면,
// 토스에는 결제가 잡혀있는데 우리 시스템은 그 결제를 전혀 모르게 된다.
// ("결제 내역만 되고 결과를 못 봤다"는 고객 문의의 근본 원인.)
//
// 이 웹훅은 결제 상태를 payment_events 테이블에 독립적으로 기록해서,
// 최소한 "이 결제가 실제로 있었다"는 사실을 항상 서버가 알 수 있게 한다.
// (완전 자동 복구—결과 재생성까지—는 각 상품 폼 데이터를 결제 전에
// 서버로 저장해야 하는 더 큰 작업이라 이번 범위에는 포함하지 않는다.)
//
// 보안: 토스 웹훅 본문은 서명이 없다. 본문을 그대로 신뢰하지 않고,
// paymentKey로 토스 결제 조회 API를 다시 호출해 실제 결제 상태를
// 확인한 뒤에만 기록한다.

import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

async function lookupTossPayment(paymentKey: string) {
  const secretKey = serverEnv().TOSS_SECRET_KEY;
  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as { orderId: string; status: string; totalAmount: number; [k: string]: unknown };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  // 토스 웹훅은 { eventType, data: {...} } 형태이거나, 구버전은 결제 객체를 그대로 보낸다.
  const payload = (body.data ?? body) as { paymentKey?: string; orderId?: string; status?: string };
  const paymentKey = payload.paymentKey;

  if (!paymentKey) {
    // paymentKey가 없는 이벤트(가상계좌 발급 안내 등)는 이 안전망 대상이 아니다 — 그냥 확인만 하고 넘어간다.
    return NextResponse.json({ received: true });
  }

  // 본문을 그대로 믿지 않고 토스에 재조회해서 진짜 상태를 확인한다.
  const verified = await lookupTossPayment(paymentKey);
  if (!verified) {
    // 조회 실패 — 토스 쪽 일시 오류일 수 있으니 재시도하도록 5xx로 응답한다.
    return NextResponse.json({ error: "결제 조회 실패" }, { status: 502 });
  }

  if (isSupabaseConfigured()) {
    try {
      const service = createServiceClient();
      await service.from("payment_events").insert({
        order_id: verified.orderId,
        payment_key: paymentKey,
        amount: verified.totalAmount,
        status: `webhook_${verified.status.toLowerCase()}`,
        source: "webhook",
        raw: verified as never,
      });
    } catch (e) {
      // 로그만 남기고 200을 반환 — 토스가 계속 재시도하게 만들 필요는 없다 (DB 문제는 우리가 직접 확인).
      console.error("payment_events insert failed", e);
    }
  }

  return NextResponse.json({ received: true });
}
