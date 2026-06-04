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
    <div className="col-span-2 rounded-2xl p-6 text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 110%,rgba(167,139,250,0.14),transparent)' }} />
      <span ref={ref} className="block text-5xl font-black tabular-nums relative z-10" style={{ background: 'linear-gradient(90deg,#a78bfa,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{display}</span>
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
  { target: 94, suffix: '%', label: '택일 후 임신 성공률', big: true },
  { target: 3800, suffix: '+', label: '누적 택일 건수', big: false },
  { target: 98, suffix: '%', label: '이용자 만족도', big: false },
  { target: 91, suffix: '%', label: '재이용 의향', big: false },
];

const CONCERNS = [
  { emoji: '🌙', text: '어떤 날이 좋은 날인지, 하늘의 뜻에 맞는 날을 고르고 싶어요.', delay: 0 },
  { emoji: '💫', text: '좋은 기운이 흐르는 날에 맞추면 더 잘 될 것 같아서요.', delay: 140 },
  { emoji: '🌸', text: '의학적으로는 준비됐는데, 사주적으로도 좋은 날을 알고 싶어요.', delay: 280 },
  { emoji: '✨', text: '하늘이 정해준 날에 맞추면 아이에게도 복이 온다고 들었어요.', delay: 420 },
];

const REVIEWS = [
  { emoji: '🌟', name: '정○○', age: '30대 여성', rating: 5, text: '알려준 날 맞춰서 드디어 임신 성공했어요. 3년을 기다렸는데 택일 후 바로 되다니 정말 신기해요.' },
  { emoji: '🌙', name: '윤○○', age: '20대 여성', rating: 5, text: '어떤 날이 가장 좋은지 구체적으로 알려줘서 계획 세우기 너무 좋았어요.' },
  { emoji: '💜', name: '한○○', age: '30대 여성', rating: 5, text: '과학과 사주를 함께 활용하니까 훨씬 마음이 든든하더라고요. 감사해요.' },
  { emoji: '🌺', name: '오○○', age: '30대 여성', rating: 4, text: '택일 날짜뿐만 아니라 그 전후로 주의할 것들도 알려줘서 도움이 많이 됐어요.' },
];

function BottomCTA() {
  const { m, s } = useCountdown();
  return (
    <>
      <section className="relative overflow-hidden" style={{ background: '#04020a' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 110% 50% at 50% 100%, rgba(167,139,250,0.2), transparent)' }} />
        <div className="relative z-10 px-6 pt-14 pb-10 max-w-md mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd' }}>🔥 오늘만 적용되는 한정 할인</span>
          </div>
          <div className="text-center mb-10">
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.2rem,14vw,5.5rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,#fff 10%,rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>합궁·임신</p>
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.2rem,14vw,5.5rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>택일</p>
          </div>
          <div className="mb-10 space-y-3 max-w-xs mx-auto">
            {[
              { text: '사주 기반 최길(最吉) 택일 선정', dim: false },
              { text: '부부 합궁에 맞는 날짜 3~5개 제공', dim: false },
              { text: '해당 월 전체 길흉일 흐름 분석', dim: false },
              { text: '택일 전후 주의사항 가이드', dim: false },
              { text: '계절별 임신 기운 해석까지..', dim: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm" style={{ color: f.dim ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.68)' }}>
                <span style={{ color: f.dim ? 'rgba(255,255,255,0.2)' : '#a78bfa', flexShrink: 0 }}>{f.dim ? '··' : '✓'}</span>
                {f.text}
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />
          <div className="text-center mb-8">
            <p className="text-sm line-through mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>정가 49,800원</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-black text-white" style={{ fontSize: 'clamp(2.4rem,10vw,3.5rem)', letterSpacing: '-0.02em' }}>24,900원</span>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(167,139,250,0.15)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.4)' }}>한정 할인</span>
            </div>
          </div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인 혜택 종료까지</p>
            <div className="inline-flex items-center rounded-2xl px-10 py-4" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 28px rgba(167,139,250,0.4)' }}>{m}</span>
              <span className="font-black mx-1.5" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 'clamp(2rem,8vw,3rem)', lineHeight: 1 }}>:</span>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: '0 0 28px rgba(167,139,250,0.4)' }}>{s}</span>
            </div>
          </div>
          <Link href="/start?cat=pregnancy-date" className="w-full h-16 rounded-full flex items-center justify-center text-white font-black text-[16px] transition-all hover:scale-[1.015] active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#4c1d95,#7c3aed,#a78bfa)', boxShadow: '0 0 70px rgba(167,139,250,0.45), 0 10px 40px rgba(0,0,0,0.5)' }}>
            합궁 택일 확인하기 →
          </Link>
          <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>결과 확인 전 전액 환불 · 회원가입 불필요 · 24시간 이용 가능</p>
          <div className="h-20" />
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(4,2,10,0.97)', borderTop: '1px solid rgba(167,139,250,0.18)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인혜택 종료까지</p>
            <p className="font-black tabular-nums leading-none" style={{ fontSize: '1.65rem', letterSpacing: '-0.04em', color: '#a78bfa', textShadow: '0 0 20px rgba(167,139,250,0.8)' }}>
              {m}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', margin: '0 1px' }}>:</span>{s}
            </p>
          </div>
          <Link href="/start?cat=pregnancy-date" className="flex-1 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#4c1d95,#a78bfa)', boxShadow: '0 0 24px rgba(167,139,250,0.45)' }}>
            택일 분석 신청하기 →
          </Link>
        </div>
      </div>
    </>
  );
}

export default function PregnancyDatePage() {
  return (
    <div style={{ background: '#07070e', color: '#fff', overflowX: 'hidden' }}>
      <div className="fixed top-[62px] left-4 z-50">
        <Link href="/" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>← 홈</Link>
      </div>
      <div className="relative overflow-hidden" style={{ height: '60vw', maxHeight: '480px', minHeight: '300px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&q=85&fit=crop" alt="합궁 임신 택일" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#07070e 0%,rgba(7,7,14,0.55) 45%,rgba(7,7,14,0.15) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(76,29,149,0.4),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: 'linear-gradient(90deg,#4c1d95,#7c3aed)' }}>✦ 임신·육아</span>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white">NEW</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">하늘이 맺어준 그날</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.52)' }}>합궁 및 임신 택일 · 복을 부르는 날 선정</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/></svg>)}</div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>4.9 · 3,800+ 분석 완료</span>
          </div>
        </div>
      </div>
      <section className="px-5 pt-8 pb-4 max-w-md mx-auto">
        <FadeIn><div className="grid grid-cols-2 gap-3">{STATS.map((st, i) => <StatItem key={i} {...st} />)}</div></FadeIn>
        <FadeIn delay={100} className="mt-3">
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xl flex-shrink-0">💬</span>
            <div>
              <p className="text-sm text-white leading-relaxed">&ldquo;알려준 날 맞춰서 <strong>드디어 임신 성공했어요.</strong> 3년을 기다렸는데 택일 후 바로 됐어요.&rdquo;</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>— 정○○, 30대 여성</p>
            </div>
          </div>
        </FadeIn>
      </section>
      <section className="px-6 py-14 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.1]" style={{ fontSize: 'clamp(1.8rem,7vw,2.8rem)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>하늘의 뜻에</span>
            <br /><span style={{ color: 'rgba(255,255,255,0.85)' }}>맞는 날,</span>{' '}
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>있어요</span>
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
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black" style={{ background: 'linear-gradient(135deg,#4c1d95,#7c3aed)', color: 'white' }}>命</div>
              <div className="rounded-2xl rounded-tr-md px-4 py-3" style={{ background: 'rgba(76,29,149,0.18)', border: '1px solid rgba(167,139,250,0.22)', maxWidth: 'calc(100% - 52px)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>사주와 천간지지의 흐름을 보면 임신에 가장 좋은 날을 찾을 수 있어요. 하늘이 허락한 날에 맞추면 아이와의 인연이 더욱 깊어집니다. ✨</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      <section className="px-5 py-12 max-w-md mx-auto">
        <FadeIn><p className="text-center text-[10px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>분석 항목</p>
          <div className="space-y-3">
            {[
              { icon: '📅', title: '최길(最吉) 택일 선정', desc: '부부 사주에 맞는 최적의 날짜 3~5개 제공' },
              { icon: '🌙', title: '월별 길흉일 흐름', desc: '해당 월 전체의 임신 기운 흐름 분석' },
              { icon: '💑', title: '부부 합궁 최적일', desc: '두 사람의 사주가 가장 조화로운 날 계산' },
              { icon: '⚠️', title: '주의해야 할 날', desc: '피해야 할 흉일과 그 이유 상세 안내' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.1)' }}>
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
