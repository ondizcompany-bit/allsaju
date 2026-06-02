"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { loadWidgets } from "@/lib/toss/client";
import { publicEnv } from "@/lib/env";

type Props = {
  orderId: string;
  amount: number;
  customerKey: string;
  productName: string;
  customerEmail: string | null;
  successUrl?: string;
  failUrl?: string;
};

export function TossWidget({ orderId, amount, customerKey, productName, customerEmail, successUrl, failUrl }: Props) {
  const widgetsRef        = useRef<Awaited<ReturnType<typeof loadWidgets>> | null>(null);
  const paymentWidgetRef  = useRef<{ destroy: () => Promise<void> } | null>(null);
  const agreementWidgetRef = useRef<{ destroy: () => Promise<void> } | null>(null);
  const [ready, setReady]   = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let canceled = false;

    (async () => {
      // 이미 렌더링된 경우 먼저 destroy (StrictMode 이중 호출 대응)
      if (paymentWidgetRef.current) {
        await paymentWidgetRef.current.destroy().catch(() => {});
        paymentWidgetRef.current = null;
      }
      if (agreementWidgetRef.current) {
        await agreementWidgetRef.current.destroy().catch(() => {});
        agreementWidgetRef.current = null;
      }

      const widgets = await loadWidgets(customerKey);
      if (canceled) return;

      widgetsRef.current = widgets;
      await widgets.setAmount({ currency: "KRW", value: amount });
      if (canceled) return;

      const [pmWidget, agWidget] = await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-methods", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);
      if (canceled) {
        pmWidget.destroy().catch(() => {});
        agWidget.destroy().catch(() => {});
        return;
      }

      paymentWidgetRef.current  = pmWidget;
      agreementWidgetRef.current = agWidget;
      setReady(true);
    })().catch((e) => {
      if (!canceled) {
        toast.error(e instanceof Error ? e.message : "결제 위젯 로드 실패");
      }
    });

    return () => {
      canceled = true;
      // cleanup: destroy both widgets on unmount
      paymentWidgetRef.current?.destroy().catch(() => {});
      agreementWidgetRef.current?.destroy().catch(() => {});
      paymentWidgetRef.current  = null;
      agreementWidgetRef.current = null;
      widgetsRef.current = null;
      setReady(false);
    };
  }, [amount, customerKey]);

  async function handlePay() {
    const widgets = widgetsRef.current;
    if (!widgets) return;
    setPaying(true);
    try {
      await widgets.requestPayment({
        orderId,
        orderName: productName,
        successUrl: successUrl ?? `${publicEnv.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        failUrl:    failUrl    ?? `${publicEnv.NEXT_PUBLIC_SITE_URL}/checkout/fail`,
        customerEmail: customerEmail ?? undefined,
      });
    } catch (err) {
      setPaying(false);
      toast.error(err instanceof Error ? err.message : "결제 요청 실패");
    }
  }

  return (
    <div className="space-y-4">
      <div id="payment-methods" />
      <div id="agreement" />
      <Button onClick={handlePay} disabled={!ready || paying} size="lg" className="w-full">
        {paying ? "결제 진행 중..." : "결제하기"}
      </Button>
    </div>
  );
}
