"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-mute text-sm">결제 확인 중...</p>
      </div>
    }>
      <CheckoutSuccessInner />
    </Suspense>
  );
}

function CheckoutSuccessInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentKey = search.get("paymentKey");
    const orderId    = search.get("orderId");
    const amount     = Number(search.get("amount"));
    const cat        = search.get("cat");
    const tier       = search.get("tier");
    const bi         = search.get("bi") ?? "";

    if (!paymentKey || !orderId || !amount) {
      setState("error");
      setMessage("결제 파라미터가 누락되었습니다.");
      return;
    }

    // 토스 결제 승인(confirm) — 이 호출이 성공해야 실제로 결제가 확정된다
    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
          setState("error");
          setMessage(data?.error ?? "결제 승인에 실패했어요. 카드사에 문의해주세요.");
          return;
        }

        setState("ok");

        // Meta Pixel — Purchase 이벤트 (fbq 로드 대기 후 발사)
        const firePurchase = (retries = 10) => {
          if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'Purchase', {
              value: amount,
              currency: 'KRW',
              content_ids: [cat ?? 'unknown'],
              content_type: 'product',
              content_name: `${cat ?? ''} ${tier ?? ''}`.trim(),
            });
          } else if (retries > 0) {
            setTimeout(() => firePurchase(retries - 1), 300);
          }
        };
        firePurchase();

        setTimeout(() => {
          if (cat === 'followup') {
            router.replace('/followup?paid=true');
          } else if (cat && tier) {
            router.replace(`/start?cat=${cat}&tier=${tier}&paid=true&bi=${encodeURIComponent(bi)}`);
          } else {
            router.replace("/");
          }
        }, 1800);
      })
      .catch(() => {
        setState("error");
        setMessage("결제 승인 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      });
  }, [router, search]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6">
        {/* 스피너 */}
        <div className="w-16 h-16 rounded-full border-4 border-purple-rich/30 border-t-purple-rich animate-spin" />
        <p className="text-sm text-body">결제를 확인하고 있어요...</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-red-800/50 bg-red-900/20 p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h1 className="text-lg font-bold text-white mb-2">결제 처리 실패</h1>
          <p className="text-sm text-body mb-6">{message}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-11 rounded-full border border-purple-rich/40 text-purple-light text-sm font-semibold hover:bg-purple-rich/10 transition-all"
          >
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  // 성공
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* 성공 아이콘 */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg,rgba(76,29,149,0.4) 0%,rgba(30,10,80,0.6) 100%)',
            border: '2px solid rgba(139,92,246,0.5)',
            boxShadow: '0 0 30px rgba(124,58,237,0.4)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M8 18L15 25L28 11" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">결제 완료!</h1>
        <p className="text-sm text-body mb-1">결제가 정상적으로 처리되었습니다.</p>
        <p className="text-sm text-mute mb-8">잠시 후 분석 화면으로 이동합니다...</p>

        {/* 로딩 바 */}
        <div className="w-full h-1 rounded-full bg-purple-deep/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-purple-gradient"
            style={{ animation: 'progress 1.8s linear forwards' }}
          />
        </div>

        <style>{`
          @keyframes progress {
            from { width: 0% }
            to { width: 100% }
          }
        `}</style>
      </div>
    </div>
  );
}
