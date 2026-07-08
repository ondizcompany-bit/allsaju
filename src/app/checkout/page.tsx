'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TossWidget } from '@/components/checkout/TossWidget';
import { publicEnv } from '@/lib/env';

const fmt = (n: number) => n.toLocaleString('ko-KR') + '원';

const TIER_LABEL: Record<string, string> = {
  single: '단품',
  basic: '베이직',
  premium: '종합',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center"><p className="text-mute text-sm">로딩 중...</p></div>}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const search = useSearchParams();
  const cat    = search.get('cat') ?? 'unknown';
  const tier   = search.get('tier') ?? 'basic';
  const amount = Number(search.get('amount') ?? '34900');
  const name   = search.get('name') ?? '명리사주 분석';
  const bi     = search.get('bi') ?? '';

  const tierLabel = TIER_LABEL[tier] ?? tier;

  useEffect(() => {
    document.body.classList.add('checkout-page');
    // Meta Pixel — InitiateCheckout 이벤트 (fbq 로드 대기 후 발사)
    const fireInitiateCheckout = (retries = 10) => {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout', {
          value: amount,
          currency: 'KRW',
          content_ids: [cat],
          content_type: 'product',
          content_name: `${name} ${tierLabel}`.trim(),
        });
      } else if (retries > 0) {
        setTimeout(() => fireInitiateCheckout(retries - 1), 300);
      }
    };
    fireInitiateCheckout();
    return () => document.body.classList.remove('checkout-page');
  }, []);

  // 주문 ID는 클라이언트에서 1회 생성
  const [orderId] = useState(() => {
    const ts  = Date.now().toString(36);
    const rnd = Math.random().toString(36).slice(2, 8);
    return `ord_${ts}_${rnd}`;
  });

  // 고객 키 (비로그인 = ANONYMOUS)
  const customerKey = "ANONYMOUS";

  const successUrl = `${publicEnv.NEXT_PUBLIC_SITE_URL}/checkout/success?cat=${cat}&tier=${tier}&bi=${encodeURIComponent(bi)}`;
  const failUrl    = `${publicEnv.NEXT_PUBLIC_SITE_URL}/checkout/fail`;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container max-w-lg py-10">

        {/* 뒤로 */}
        <Link
          href={`/start?cat=${cat}`}
          className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-purple-light transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          이전으로
        </Link>

        {/* 주문 요약 */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: 'linear-gradient(135deg,rgba(76,29,149,0.25) 0%,rgba(30,10,80,0.4) 100%)',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <p className="text-xs font-semibold tracking-[0.15em] text-purple-bright uppercase mb-3">주문 요약</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-mute mt-0.5">{tierLabel} 플랜</p>
            </div>
            <p className="text-xl font-black text-white">{fmt(amount)}</p>
          </div>
        </div>

        {/* 토스 결제 위젯 */}
        <div className="rounded-2xl overflow-hidden border border-hairline bg-surface-soft/40 p-5">
          <p className="text-xs font-semibold tracking-[0.15em] text-purple-bright uppercase mb-5">결제 수단 선택</p>
          <TossWidget
            orderId={orderId}
            amount={amount}
            customerKey={customerKey}
            productName={`${name} - ${tierLabel}`}
            customerEmail={null}
            successUrl={successUrl}
            failUrl={failUrl}
          />
        </div>

        <p className="text-center text-xs text-mute mt-4">
          결제 정보는 암호화되어 안전하게 처리됩니다
        </p>

      </div>
    </div>
  );
}
