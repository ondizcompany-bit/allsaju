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
    <div className="col-span-2 rounded-2xl p-6 text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(244,114,182,0.2)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 110%,rgba(244,114,182,0.14),transparent)' }} />
      <span ref={ref} className="block text-5xl font-black tabular-nums relative z-10" style={{ background: 'linear-gradient(90deg,#f472b6,#fbcfe8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{display}</span>
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
  { target: 81, suffix: '%', label: '재회 가능성 예측 적중률', big: true },
  { target: 12400, suffix: '+', label: '누적 타로 분석 건수', big: false },
  { target: 95, suffix: '%', label: '이용자 만족도', big: false },
  { target: 88, suffix: '%', label: '타이밍 일치율', big: false },
];
const CONCERNS = [
  { emoji: '🃏', text: '재회가 될지 안 될지, 타로로 보면 정말 알 수 있을까요? 솔직한 답이 듣고 싶어요.', delay: 0 },
  { emoji: '💭', text: '사주도 봤는데 타로로 보면 또 다른 면이 보인다고 해서 궁금해요.', delay: 140 },
  { emoji: '😔', text: '지금 이 시점에서 재회 가능성이 어느 정도인지 퍼센트로 알고 싶어요.', delay: 280 },
  { emoji: '🌙', text: '카드가 뭐라고 하는지, 지금 상황에서 어떻게 해야 할지 방향을 알고 싶어요.', delay: 420 },
];
const REVIEWS = [
  { emoji: '🌹', name: '박○○', age: '20대 여성', rating: 5, text: '타로에서 재회 가능성 높다고 했는데 진짜로 2주 뒤에 연락 왔어요. 너무 신기해서 소름 돋았어요.' },
  { emoji: '🌷', name: '이○○', age: '30대 여성', rating: 5, text: '현재 상대 마음 카드가 정확히 맞아서 깜짝 놀랐어요. 덕분에 용기 내서 먼저 연락했어요.' },
  { emoji: '💜', name: '김○○', age: '20대 여성', rating: 5, text: '될 것 같다고 했고 정말 됐어요. 타로가 이렇게 정확할 줄 몰랐어요.' },
  { emoji: '🌸', name: '최○○', age: '30대 여성', rating: 4, text: '솔직하게 어렵다고도 해줘서 오히려 믿음이 갔어요. 현실적인 조언이 도움됐어요.' },
];

function BottomCTA() {
  const { m, s } = useCountdown();
  return (
    <>
      <section className="relative overflow-hidden" style={{ background: '#04020a' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 110% 50% at 50% 100%, rgba(244,114,182,0.22), transparent)' }} />
        <div className="relative z-10 px-6 pt-14 pb-10 max-w-md mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.35)', color: '#fbcfe8' }}>🔥 오늘만 적용되는 한정 할인</span>
          </div>
          <div className="text-center mb-10">
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.2rem,14vw,5.5rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,#fff 10%,rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>타로 재회</p>
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.2rem,14vw,5.5rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>가능성</p>
          </div>
          <div className="mb-10 space-y-3 max-w-xs mx-auto">
            {[
              { text: '현시점 재회 가능성 % 타로 분석', dim: false },
              { text: '상대방의 지금 감정 카드 리딩', dim: false },
              { text: '재회가 가능한 시기 예측', dim: false },
              { text: '지금 내가 해야 할 행동 가이드', dim: false },
              { text: '관계 회복 단계별 처방까지..', dim: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm" style={{ color: f.dim ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.68)' }}>
                <span style={{ color: f.dim ? 'rgba(255,255,255,0.2)' : '#f472b6', flexShrink: 0 }}>{f.dim ? '··' : '✓'}</span>
                {f.text}
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />
          <div className="text-center mb-8">
            <p className="text-sm line-through mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>정가 39,800원</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-black text-white" style={{ fontSize: 'clamp(2.4rem,10vw,3.5rem)', letterSpacing: '-0.02em' }}>19,900원</span>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(244,114,182,0.15)', color: '#fbcfe8', border: '1px solid rgba(244,114,182,0.4)' }}>한정 할인</span>
            </div>
          </div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인 혜택 종료까지</p>
            <div className="inline-flex items-center rounded-2xl px-10 py-4" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 28px rgba(244,114,182,0.5)' }}>{m}</span>
              <span className="font-black mx-1.5" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 'clamp(2rem,8vw,3rem)', lineHeight: 1 }}>:</span>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 28px rgba(244,114,182,0.5)' }}>{s}</span>
            </div>
          </div>
          <Link href="/start?cat=tarot-reunion" className="w-full h-16 rounded-full flex items-center justify-center text-white font-black text-[16px] transition-all hover:scale-[1.015] active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#9d174d,#ec4899,#fbcfe8)', boxShadow: '0 0 70px rgba(244,114,182,0.5), 0 10px 40px rgba(0,0,0,0.5)' }}>
            재회 가능성 타로로 보기 →
          </Link>
          <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>결과 확인 전 전액 환불 · 회원가입 불필요 · 24시간 이용 가능</p>
          <div className="h-20" />
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(4,2,10,0.97)', borderTop: '1px solid rgba(244,114,182,0.18)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인혜택 종료까지</p>
            <p className="font-black tabular-nums leading-none" style={{ fontSize: '1.65rem', letterSpacing: '-0.04em', color: '#f472b6', textShadow: '0 0 20px rgba(244,114,182,0.8)' }}>
              {m}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', margin: '0 1px' }}>:</span>{s}
            </p>
          </div>
          <Link href="/start?cat=tarot-reunion" className="flex-1 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#9d174d,#ec4899)', boxShadow: '0 0 24px rgba(244,114,182,0.45)' }}>
            타로 재회 분석 신청하기 →
          </Link>
        </div>
      </div>
    </>
  );
}

export default function TarotReunionPage() {
  return (
    <div style={{ background: '#07070e', color: '#fff', overflowX: 'hidden' }}>
      <div className="fixed top-[62px] left-4 z-50">
        <Link href="/" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>← 홈</Link>
      </div>
      <div className="relative overflow-hidden" style={{ height: '60vw', maxHeight: '480px', minHeight: '300px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=1200&q=85&fit=crop" alt="타로 재회" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#07070e 0%,rgba(7,7,14,0.55) 45%,rgba(7,7,14,0.15) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(157,23,77,0.4),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: 'linear-gradient(90deg,#9d174d,#ec4899)' }}>✦ 재회·사랑</span>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white">NEW</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">타로로 보는 재회 가능성</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.52)' }}>현시점 타로 카드로 짚어보는 재회 확률과 시기</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/></svg>)}</div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>4.9 · 12,400+ 분석 완료</span>
          </div>
        </div>
      </div>
      <section className="px-5 pt-8 pb-4 max-w-md mx-auto">
        <FadeIn><div className="grid grid-cols-2 gap-3">{STATS.map((st, i) => <StatItem key={i} {...st} />)}</div></FadeIn>
        <FadeIn delay={100} className="mt-3">
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xl flex-shrink-0">💬</span>
            <div>
              <p className="text-sm text-white leading-relaxed">&ldquo;재회 가능성 높다고 했는데 <strong>2주 뒤에 진짜로 연락이 왔어요.</strong>&rdquo;</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>— 박○○, 20대 여성</p>
            </div>
          </div>
        </FadeIn>
      </section>
      <section className="px-6 py-14 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.1]" style={{ fontSize: 'clamp(1.8rem,7vw,2.8rem)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>타로카드가</span>
            <br /><span style={{ color: 'rgba(255,255,255,0.85)' }}>말하는</span>{' '}
            <span style={{ background: 'linear-gradient(90deg,#f472b6,#fbcfe8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>진실</span>
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
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black" style={{ background: 'linear-gradient(135deg,#9d174d,#ec4899)', color: 'white' }}>命</div>
              <div className="rounded-2xl rounded-tr-md px-4 py-3" style={{ background: 'rgba(157,23,77,0.15)', border: '1px solid rgba(244,114,182,0.22)', maxWidth: 'calc(100% - 52px)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>타로는 현재 에너지와 흐름을 읽어요. 지금 이 순간 재회 가능성이 얼마나 되는지, 상대의 마음이 어디에 있는지 카드가 솔직하게 말해줄 거예요. 🃏</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      <section className="px-5 py-12 max-w-md mx-auto">
        <FadeIn><p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>분석 항목</p>
          <div className="space-y-3">
            {[
              { icon: '🃏', title: '현시점 재회 가능성 리딩', desc: '지금 이 순간의 에너지로 보는 재회 확률' },
              { icon: '💭', title: '상대방 현재 감정 카드', desc: '그 사람의 지금 마음과 나에 대한 생각' },
              { icon: '⏰', title: '재회 타이밍 예측', desc: '언제쯤 재회의 기회가 올지 시기 분석' },
              { icon: '📍', title: '지금 내가 할 행동', desc: '기다릴지 먼저 연락할지 구체적 가이드' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(244,114,182,0.1)' }}>
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
