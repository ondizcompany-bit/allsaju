"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_ck_DpexMgkW36zEjXK9MZR43GbR5ozO";

type Props = {
  orderId: string;
  amount: number;
  customerKey: string;
  productName: string;
  customerEmail: string | null;
  successUrl?: string;
  failUrl?: string;
};

export function TossWidget({ orderId, amount, productName, customerEmail, successUrl, failUrl }: Props) {
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    setPaying(true);
    try {
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId,
        orderName: productName,
        successUrl: successUrl ?? `${window.location.origin}/checkout/success`,
        failUrl: failUrl ?? `${window.location.origin}/checkout/fail`,
        customerEmail: customerEmail ?? undefined,
      });
    } catch (err: unknown) {
      setPaying(false);
      const error = err as { code?: string; message?: string };
      if (error?.code === "USER_CANCEL") return;
      toast.error(error?.message ?? "결제 요청 실패");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
        버튼을 누르면 토스 결제창이 열립니다
      </p>
      <Button onClick={handlePay} disabled={paying} size="lg" className="w-full">
        {paying ? "결제 진행 중..." : `${amount.toLocaleString("ko-KR")}원 결제하기`}
      </Button>
    </div>
  );
}
