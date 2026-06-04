'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { threshold });
    io.observe(el); return () => io.disconnect();
  }, [threshold]);
  return { ref, v };
}
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, v } = useFadeIn();
  return (
    <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

function useCountdown() {
  const getTick = () => { const tick = Math.floor(Date.now() / 333); const totalSecs = 3599 - (tick % 3600); return { m: Math.floor(totalSecs / 60), s: totalSecs % 60 }; };
  const [time, setTime] = useState(getTick);
  useEffect(() => { const id = setInterval(() => setTime(getTick()), 333); return () => clearInterval(id); }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  return { m: pad(time.m), s: pad(time.s) };
}

function useCountUp(target: number, suffix = '') {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState('0' + suffix);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const dur = 1800, start = performance.now();
      const tick = (now: number) => { const p = Math.min((now - start) / dur, 1); const ease = 1 - Math.pow(1 - p, 3); setDisplay(Math.floor(target * ease).toLocaleString('ko-KR') + suffix); if (p < 1) requestAnimationFrame(tick); else setDisplay(target.toLocaleString('ko-KR') + suffix); };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, [target, suffix]);
  return { ref, display };
}

function StatItem({ target, suffix, label, big }: { target: number; suffix: string; label: string; big: boolean }) {
  const { ref, display } = useCountUp(target, suffix);
  if (big) return (
    <div className="col-span-2 rounded-2xl p-6 text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.2)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 110%,rgba(251,191,36,0.14),transparent)' }} />
      <span ref={ref} className="block text-5xl font-black tabular-nums relative z-10" style={{ background: 'linear-gradient(90deg,#fbbf24,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{display}</span>
      <p className="text-sm font-semibold text-white mt-1 relative z-10">{label}</p>
    </div>
  );
  return (
    <div className="rounded-2xl py-5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span ref={ref} className="block text-2xl font-black tabular-nums text-white">{display}</span>
      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
    </div>
  );
}

const STATS = [
  { target: 96, suffix: '%', label: '이용자 만족도', big: true },
  { target: 6100, suffix: '+', label: '누적 태명 가이드 건수', big: false },
  { target: 98, suffix: '%', label: '재이용 의향', big: false },
  { target: 4.9, suffix: '점', label: '평균 평점', big: false },
];

const CONCERNS = [
  { emoji: '✨', text: '우리 아이에게 복을 불러줄 태명이 있다면 꼭 알고 싶어요.', delay: 0 },
  { emoji: '🌟', text: '태명이 중요하다고 하는데, 사주에 맞는 태명을 어떻게 고르는지 모르겠어요.', delay: 140 },
  { emoji: '💛', text: '아이에게 줄 수 있는 첫 번째 선물이 태명인 것 같아서 신중하게 고르고 싶어요.', delay: 280 },
  { emoji: '🙏', text: '복 많이 받고 건강하게 태어나길 바라는 마음으로 좋은 태명을 주고 싶어요.', delay: 420 },
];

const REVIEWS = [
  { emoji: '⭐', name: '배○○', age: '30대 여성', rating: 5, text: '알려준 태명으로 불렀는데 임신 기간 내내 너무 순탄했어요. 아이도 건강하게 잘 태어났고요.' },
  { emoji: '🌟', name: '신○○', age: '20대 여성', rating: 5, text: '사주에 맞는 태명을 골라줘서 더 의미있게 느껴졌어요. 남편도 좋아했어요.' },
  { emoji: '💛', name: '홍○○', age: '30대 여성', rating: 5, text: '태명 고르는 게 이렇게 재미있을 줄 몰랐어요. 아이에게 주는 첫 선물 같아서 더 특별했어요.' },
  { emoji: '🌸', name: '문○○', age: '20대 여성', rating: 4, text: '왜 이 태명이 좋은지 이유까지 설명해줘서 믿음이 갔어요. 감사합니다.' },
];

function BottomCTA() {
  const { m, s } = useCountdown();
  return (
    <>
      <section className="relative overflow-hidden" style={{ background: '#04020a' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 110% 50% at 50% 100%, rgba(251,191,36,0.18), transparent)' }} />
        <div className="relative z-10 px-6 pt-14 pb-10 max-w-md mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', color: '#fde68a' }}>🔥 오늘만 적용되는 한정 할인</span>
          </div>
          <div className="text-center mb-10">
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.2rem,14vw,5.5rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,#fff 10%,rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>태명</p>
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.2rem,14vw,5.5rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>사주 학당</p>
          </div>
          <div className="mb-10 space-y-3 max-w-xs mx-auto">
            {[
              { text: '사주 기반 복을 부르는 태명 추천', dim: false },
              { text: '태명 후보 5가지 + 선택 이유', dim: false },
              { text: '오행에 맞는 태명 에너지 해석', dim: false },
              { text: '태명 부르는 법과 주의사항', dim: false },
              { text: '임신 기간 건강 기원 가이드까지..', dim: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm" style={{ color: f.dim ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.68)' }}>
                <span style={{ color: f.dim ? 'rgba(255,255,255,0.2)' : '#fbbf24', flexShrink: 0 }}>{f.dim ? '··' : '✓'}</span>
                {f.text}
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />
          <div className="text-center mb-8">
            <p className="text-sm line-through mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>정가 39,800원</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-black text-white" style={{ fontSize: 'clamp(2.4rem,10vw,3.5rem)', letterSpacing: '-0.02em' }}>19,900원</span>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(251,191,36,0.15)', color: '#fde68a', border: '1px solid rgba(251,191,36,0.4)' }}>한정 할인</span>
            </div>
          </div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인 혜택 종료까지</p>
            <div className="inline-flex items-center rounded-2xl px-10 py-4" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 28px rgba(251,191,36,0.4)' }}>{m}</span>
              <span className="font-black mx-1.5" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 'clamp(2rem,8vw,3rem)', lineHeight: 1 }}>:</span>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 28px rgba(251,191,36,0.4)' }}>{s}</span>
            </div>
          </div>
          <Link href="/start?cat=baby-name" className="w-full h-16 rounded-full flex items-center justify-center text-white font-black text-[16px] transition-all hover:scale-[1.015] active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#92400e,#d97706,#fbbf24)', boxShadow: '0 0 70px rgba(251,191,36,0.4), 0 10px 40px rgba(0,0,0,0.5)' }}>
            복 부르는 태명 받기 →
          </Link>
          <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>결과 확인 전 전액 환불 · 회원가입 불필요 · 24시간 이용 가능</p>
          <div className="h-20" />
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(4,2,10,0.97)', borderTop: '1px solid rgba(251,191,36,0.18)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인혜택 종료까지</p>
            <p className="font-black tabular-nums leading-none" style={{ fontSize: '1.65rem', letterSpacing: '-0.04em', color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.8)' }}>
              {m}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', margin: '0 1px' }}>:</span>{s}
            </p>
          </div>
          <Link href="/start?cat=baby-name" className="flex-1 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#92400e,#fbbf24)', boxShadow: '0 0 24px rgba(251,191,36,0.4)' }}>
            태명 가이드 신청하기 →
          </Link>
        </div>
      </div>
    </>
  );
}

export default function BabyNamePage() {
  return (
    <div style={{ background: '#07070e', color: '#fff', overflowX: 'hidden' }}>
      <div className="fixed top-[62px] left-4 z-50">
        <Link href="/" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>← 홈</Link>
      </div>
      <div className="relative overflow-hidden" style={{ height: '60vw', maxHeight: '480px', minHeight: '300px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=85&fit=crop" alt="태명 사주 학당" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#07070e 0%,rgba(7,7,14,0.55) 45%,rgba(7,7,14,0.15) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(146,64,14,0.4),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: 'linear-gradient(90deg,#92400e,#d97706)' }}>✦ 임신·육아</span>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white">NEW</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">태명 사주 학당</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.52)' }}>복을 부르는 태명 · 사주 기반 태명 가이드</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/></svg>)}</div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>4.9 · 6,100+ 분석 완료</span>
          </div>
        </div>
      </div>
      <section className="px-5 pt-8 pb-4 max-w-md mx-auto">
        <FadeIn><div className="grid grid-cols-2 gap-3">{STATS.map((st, i) => <StatItem key={i} {...st} />)}</div></FadeIn>
        <FadeIn delay={100} className="mt-3">
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xl flex-shrink-0">💬</span>
            <div>
              <p className="text-sm text-white leading-relaxed">&ldquo;알려준 태명으로 불렀는데 <strong>임신 기간 내내 너무 순탄했어요.</strong> 아이도 건강하게 태어났고요.&rdquo;</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>— 배○○, 30대 여성</p>
            </div>
          </div>
        </FadeIn>
      </section>
      <section className="px-6 py-14 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.1]" style={{ fontSize: 'clamp(1.8rem,7vw,2.8rem)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>아이에게 주는</span>
            <br /><span style={{ color: 'rgba(255,255,255,0.18)' }}>첫 번째</span>{' '}
            <span style={{ background: 'linear-gradient(90deg,#fbbf24,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>선물</span>
          </p>
        </FadeIn>
      </section>
      <section className="px-5 pt-2 pb-12 max-w-md mx-auto">
        <div className="space-y-3">
          {CONCERNS.map((c, i) => (
            <FadeIn key={i} delay={c.delay}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>{c.emoji}</div>
                <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 'calc(100% - 52px)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.text}</p>
                </div>
              </div>
            </FadeIn>
          ))}
          <FadeIn delay={580}>
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black" style={{ background: 'linear-gradient(135deg,#92400e,#fbbf24)', color: 'white' }}>命</div>
              <div className="rounded-2xl rounded-tr-md px-4 py-3" style={{ background: 'rgba(146,64,14,0.18)', border: '1px solid rgba(251,191,36,0.22)', maxWidth: 'calc(100% - 52px)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>태명은 아이가 세상에 오기 전 엄마 아빠가 불러주는 첫 이름이에요. 사주 오행에 맞는 태명은 아이에게 좋은 기운을 불러줘요. ✨</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      <section className="px-5 py-12 max-w-md mx-auto">
        <FadeIn><p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>분석 항목</p>
          <div className="space-y-3">
            {[
              { icon: '✨', title: '복을 부르는 태명 5가지', desc: '사주 오행에 맞춘 태명 후보와 선택 이유' },
              { icon: '🔮', title: '태명 에너지 해석', desc: '각 태명이 아이에게 전하는 기운과 의미' },
              { icon: '📖', title: '태명 부르는 법', desc: '효과를 높이는 태명 부르는 방법과 시기' },
              { icon: '🌸', title: '임신 기간 건강 기원', desc: '아이와 엄마 모두 건강한 임신 기간 가이드' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(251,191,36,0.1)' }}>
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div><p className="font-bold text-white text-sm mb-1">{item.title}</p><p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</p></div>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </section>
      <section className="px-5 py-12 max-w-md mx-auto">
        <FadeIn><p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>실제 이용 후기</p></FadeIn>
        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div className="rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{r.emoji}</span>
                  <div><p className="text-xs font-bold text-white">{r.name} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>{r.age}</span></p>
                    <div className="flex gap-0.5 mt-0.5">{Array.from({ length: r.rating }).map((_, j) => <svg key={j} width="10" height="10" viewBox="0 0 14 14" fill="#f59e0b"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/></svg>)}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <BottomCTA />
    </div>
  );
}
