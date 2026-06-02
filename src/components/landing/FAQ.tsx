'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: '얼마나 정확한가요?',
    a: '명리공방은 수백 년의 정통 명리학 공식을 현대적으로 재해석합니다. 148,555명의 실사용자 중 97%가 만족했으며, 월별 운세 흐름·특정 시기 예측 등에서 높은 정확도를 보이고 있습니다. 물론 사주는 참고 지침이며 모든 결과를 100% 보장하지는 않습니다.',
  },
  {
    q: '분석 결과는 언제 받나요?',
    a: '결제 완료 후 즉시 분석이 시작되며, 보통 30초~1분 이내에 결과 화면을 확인하실 수 있습니다. 별도의 대기 없이 바로 확인 가능합니다.',
  },
  {
    q: '비로그인으로도 이용할 수 있나요?',
    a: '네, 회원가입 없이 바로 이용하실 수 있습니다. 생년월일·성별 정보만 입력하시면 즉시 분석이 진행됩니다.',
  },
  {
    q: '환불이 가능한가요?',
    a: '결과 화면을 확인하기 전까지는 전액 환불이 가능합니다. 결과 확인 후에는 디지털 콘텐츠 특성상 환불이 어려우니 이용 전 상품 설명을 충분히 확인해 주세요.',
  },
  {
    q: '입력한 개인정보는 어떻게 되나요?',
    a: '입력하신 생년월일 및 성별 정보는 분석에만 사용되며, 분석 완료 후 즉시 파기됩니다. 외부 제3자에게 절대 제공하지 않으며 마케팅 목적으로도 활용하지 않습니다.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="container py-20">
      <hr className="divider-purple mb-20" />

      <div className="text-center mb-12">
        <p className="text-xs font-bold tracking-[0.25em] text-purple-bright uppercase mb-4">
          FAQ
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white">
          자주 묻는 질문
        </h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                border: isOpen
                  ? '1px solid rgba(167,139,250,0.4)'
                  : '1px solid rgba(255,255,255,0.07)',
                background: isOpen
                  ? 'linear-gradient(135deg,rgba(124,58,237,0.12) 0%,rgba(255,255,255,0.03) 100%)'
                  : 'rgba(255,255,255,0.03)',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              {/* 질문 버튼 */}
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
              >
                <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-purple-light' : 'text-white'}`}>
                  {faq.q}
                </span>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isOpen ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.08)',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1V9M1 5H9" stroke={isOpen ? '#a78bfa' : 'rgba(255,255,255,0.5)'} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              {/* 답변 */}
              {isOpen && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-body leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
