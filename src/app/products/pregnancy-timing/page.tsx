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
  const getTick = () => {
    const tick = Math.floor(Date.now() / 333);
    const totalSecs = 3599 - (tick % 3600);
    return { m: Math.floor(totalSecs / 60), s: totalSecs % 60 };
  };
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
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.floor(target * ease).toLocaleString('ko-KR') + suffix);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(target.toLocaleString('ko-KR') + suffix);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, [target, suffix]);
  return { ref, display };
}

function StatItem({ target, suffix, label, big }: { target: number; suffix: string; label: string; big: boolean }) {
  const { ref, display } = useCountUp(target, suffix);
  if (big) return (
    <div className="col-span-2 rounded-2xl p-6 text-center relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(249,168,212,0.2)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 110%,rgba(249,168,212,0.14),transparent)' }} />
      <span ref={ref} className="block text-5xl font-black tabular-nums relative z-10"
        style={{ background: 'linear-gradient(90deg,#f9a8d4,#fbcfe8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {display}
      </span>
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
  { target: 89, suffix: '%', label: '임신 시기 예측 적중률', big: true },
  { target: 5200, suffix: '+', label: '누적 분석 건수', big: false },
  { target: 97, suffix: '%', label: '이용자 만족도', big: false },
  { target: 92, suffix: '%', label: '임신 시기 일치율', big: false },
];

const CONCERNS = [
  { emoji: '🌸', text: '결혼한 지 2년이 됐는데 아직 소식이 없어요. 사주로 보면 임신이 될 수 있는 건지 알고 싶어요.', delay: 0 },
  { emoji: '💭', text: '의학적으로는 문제없다는데, 언제쯤 좋은 소식이 생길지 너무 궁금해요.', delay: 140 },
  { emoji: '🌙', text: '주변에서 다들 임신 소식을 전하는데 저는 언제일지... 사주에 답이 있다고 해서요.', delay: 280 },
  { emoji: '🤍', text: '임신 가능 시기를 미리 알면 더 잘 준비할 수 있을 것 같아서요.', delay: 420 },
];

const REVIEWS = [
  { emoji: '🌷', name: '김○○', age: '30대 여성', rating: 5, text: '3월에 임신 가능성 높다고 했는데 정확히 그달에 임신 확인했어요. 너무 신기하고 감사해요.' },
  { emoji: '🍀', name: '이○○', age: '20대 여성', rating: 5, text: '결혼 3년 만에 드디어 좋은 소식 들었어요. 사주에서 올해라고 했는데 진짜였어요.' },
  { emoji: '🌼', name: '박○○', age: '30대 여성', rating: 5, text: '임신 시기뿐 아니라 어떤 마음가짐으로 준비해야 할지까지 알려줘서 위로가 됐어요.' },
  { emoji: '🌺', name: '최○○', age: '30대 여성', rating: 4, text: '오래 기다려왔는데 희망이 생겼어요. 시기를 알고 나니 더 여유롭게 기다릴 수 있게 됐어요.' },
];

function BottomCTA() {
  const { m, s } = useCountdown();
  return (
    <>
      <section className="relative overflow-hidden" style={{ background: '#04020a' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 110% 50% at 50% 100%, rgba(249,168,212,0.2), transparent)' }} />
        <div className="relative z-10 px-6 pt-14 pb-10 max-w-md mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
              style={{ background: 'rgba(249,168,212,0.12)', border: '1px solid rgba(249,168,212,0.35)', color: '#f9a8d4' }}>
              🔥 오늘만 적용되는 한정 할인
            </span>
          </div>
          <div className="text-center mb-10">
            <p className="font-black leading-[0.95]"
              style={{ fontSize: 'clamp(3.2rem,14vw,5.5rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,#fff 10%,rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              임신 시기
            </p>
            <p className="font-black leading-[0.95]"
              style={{ fontSize: 'clamp(3.2rem,14vw,5.5rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              예측
            </p>
          </div>
          <div className="mb-10 space-y-3 max-w-xs mx-auto">
            {[
              { text: '사주 기반 임신 가능 시기 분석', dim: false },
              { text: '연도별·월별 임신 운기 흐름', dim: false },
              { text: '몸과 마음 준비 최적 시기', dim: false },
              { text: '부부 궁합으로 보는 자녀운', dim: false },
              { text: '임신 후 건강 주의 시기까지..', dim: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm"
                style={{ color: f.dim ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.68)' }}>
                <span style={{ color: f.dim ? 'rgba(255,255,255,0.2)' : '#f9a8d4', flexShrink: 0 }}>{f.dim ? '··' : '✓'}</span>
                {f.text}
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />
          <div className="text-center mb-8">
            <p className="text-sm line-through mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>정가 49,800원</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-black text-white" style={{ fontSize: 'clamp(2.4rem,10vw,3.5rem)', letterSpacing: '-0.02em' }}>24,900원</span>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(249,168,212,0.15)', color: '#f9a8d4', border: '1px solid rgba(249,168,212,0.4)' }}>한정 할인</span>
            </div>
          </div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인 혜택 종료까지</p>
            <div className="inline-flex items-center rounded-2xl px-10 py-4" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 28px rgba(249,168,212,0.4)' }}>{m}</span>
              <span className="font-black mx-1.5" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 'clamp(2rem,8vw,3rem)', lineHeight: 1 }}>:</span>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 28px rgba(249,168,212,0.4)' }}>{s}</span>
            </div>
          </div>
          <Link href="/start?cat=pregnancy-timing"
            className="w-full h-16 rounded-full flex items-center justify-center text-white font-black text-[16px] transition-all hover:scale-[1.015] active:scale-[0.97]"
            style={{ background: 'linear-gradient(90deg,#be185d,#f472b6,#fbcfe8)', boxShadow: '0 0 70px rgba(249,168,212,0.45), 0 10px 40px rgba(0,0,0,0.5)' }}>
            임신 시기 확인하기 →
          </Link>
          <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>결과 확인 전 전액 환불 · 회원가입 불필요 · 24시간 이용 가능</p>
          <div className="h-20" />
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 z-50"
        style={{ background: 'rgba(4,2,10,0.97)', borderTop: '1px solid rgba(249,168,212,0.18)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인혜택 종료까지</p>
            <p className="font-black tabular-nums leading-none" style={{ fontSize: '1.65rem', letterSpacing: '-0.04em', color: '#f9a8d4', textShadow: '0 0 20px rgba(249,168,212,0.8)' }}>
              {m}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', margin: '0 1px' }}>:</span>{s}
            </p>
          </div>
          <Link href="/start?cat=pregnancy-timing"
            className="flex-1 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(90deg,#9333ea,#f472b6)', boxShadow: '0 0 24px rgba(249,168,212,0.45)' }}>
            임신 시기 분석 신청하기 →
          </Link>
        </div>
      </div>
    </>
  );
}

export default function PregnancyTimingPage() {
  return (
    <div style={{ background: '#07070e', color: '#fff', overflowX: 'hidden' }}>
      <div className="fixed top-[62px] left-4 z-50">
        <Link href="/" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>
          ← 홈
        </Link>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ height: '60vw', maxHeight: '480px', minHeight: '300px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&q=85&fit=crop" alt="임신 시기 예측" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#07070e 0%,rgba(7,7,14,0.55) 45%,rgba(7,7,14,0.15) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(190,24,93,0.35),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(90deg,#be185d,#f472b6)' }}>
              ✦ 임신·육아
            </span>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white">NEW</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">
            아가야, 언제 올 거니?
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.52)' }}>임신 가능 시기 예측 · 사주로 보는 자녀와의 인연</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/></svg>)}
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>4.9 · 5,200+ 분석 완료</span>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <section className="px-5 pt-8 pb-4 max-w-md mx-auto">
        <FadeIn><div className="grid grid-cols-2 gap-3">{STATS.map((st, i) => <StatItem key={i} {...st} />)}</div></FadeIn>
        <FadeIn delay={100} className="mt-3">
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xl flex-shrink-0">💬</span>
            <div>
              <p className="text-sm text-white leading-relaxed">&ldquo;3월에 임신 가능성 높다고 했는데, <strong>정확히 그달에 임신 확인했어요.</strong>&rdquo;</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>— 김○○, 30대 여성</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 공감 인트로 */}
      <section className="px-6 py-14 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.1]" style={{ fontSize: 'clamp(1.8rem,7vw,2.8rem)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>혹시</span>{' '}
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>이런 마음,</span>
            <br />
            <span style={{ background: 'linear-gradient(90deg,#f9a8d4,#fbcfe8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>있으신가요?</span>
          </p>
        </FadeIn>
      </section>

      {/* 고민 말풍선 */}
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
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black" style={{ background: 'linear-gradient(135deg,#be185d,#f472b6)', color: 'white' }}>命</div>
              <div className="rounded-2xl rounded-tr-md px-4 py-3" style={{ background: 'rgba(190,24,93,0.15)', border: '1px solid rgba(249,168,212,0.22)', maxWidth: 'calc(100% - 52px)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>사주에는 자녀와의 인연이 담겨있어요. 임신 가능 시기, 자녀운이 열리는 시점을 미리 확인하면 더 여유롭게 준비할 수 있어요. 🌸</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 무엇을 알 수 있나 */}
      <section className="px-5 py-12 max-w-md mx-auto">
        <FadeIn>
          <p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>분석 항목</p>
          <div className="space-y-3">
            {[
              { icon: '🌸', title: '임신 가능 시기', desc: '연도별·월별로 자녀운이 열리는 최적 시기 분석' },
              { icon: '💑', title: '부부 자녀운 궁합', desc: '두 사람의 사주로 보는 자녀와의 인연과 시기' },
              { icon: '🍼', title: '임신 준비 가이드', desc: '몸과 마음을 준비해야 할 시기와 주의사항' },
              { icon: '✨', title: '태어날 아이 기질', desc: '자녀운에 담긴 아이의 타고난 기질 미리보기' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(249,168,212,0.1)' }}>
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* 후기 */}
      <section className="px-5 py-12 max-w-md mx-auto">
        <FadeIn><p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>실제 이용 후기</p></FadeIn>
        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div className="rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{r.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{r.name} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>{r.age}</span></p>
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
