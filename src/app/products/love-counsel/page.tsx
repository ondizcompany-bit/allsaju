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

const ACCENT = 'linear-gradient(90deg,#fda4af,#e11d48)';
const ACCENT_COLOR = '#fda4af';
const ACCENT_GRAD = 'linear-gradient(90deg,#881337,#e11d48,#fda4af)';
const BG_COLOR = '#0e0508';
const STATS = [
  { target: 92, suffix: '%', label: '관계 진단 공감률', big: true },
  { target: 11200, suffix: '+', label: '누적 상담 건수', big: false },
  { target: 97, suffix: '%', label: '이용자 만족도', big: false },
  { target: 90, suffix: '%', label: '실질적 도움 체감률', big: false },
];
const CONCERNS = [
  { emoji: '🌫️', text: '그 사람이 저를 진짜 어떻게 생각하는지 모르겠어요. 좋아하는 건지, 그냥 편한 건지...', delay: 0 },
  { emoji: '💔', text: '재회하고 싶은데, 어떻게 다가가야 할지 구체적인 방법을 모르겠어요.', delay: 140 },
  { emoji: '😞', text: '관계가 자꾸 삐걱거리는데, 뭘 어떻게 고쳐야 할지 감이 안 잡혀요.', delay: 280 },
  { emoji: '💍', text: '이 사람과 결혼까지 가도 될지, 아무도 확실하게 말해주는 사람이 없어요.', delay: 420 },
];
const REVIEWS = [
  { emoji: '💐', name: '정○○', age: '30대 여성', rating: 5, text: '결혼 고민 때문에 신청했는데, 서두르지 말라는 조언이 딱 맞았어요. 반년 지나고 보니 그때 그 조언이 맞았더라고요.' },
  { emoji: '💕', name: '이○○', age: '20대 남성', rating: 5, text: '재회 타이밍을 짚어줘서 그대로 따라했더니 정말 연락이 왔어요. 신기했습니다.' },
  { emoji: '🌹', name: '한○○', age: '30대 여성', rating: 5, text: '자꾸 싸우는 이유를 전문가 시선으로 짚어주니 억울했던 마음이 좀 풀렸어요. 이해하는 데 도움 됐어요.' },
  { emoji: '💌', name: '오○○', age: '40대 남성', rating: 4, text: '막연히 걱정만 하다가, 구체적인 타이밍과 방향을 짚어주니 결정하는 데 확실히 도움이 됐어요.' },
];

function StatItem({ target, suffix, label, big }: { target: number; suffix: string; label: string; big: boolean }) {
  const { ref, display } = useCountUp(target, suffix);
  if (big) return (
    <div className="col-span-2 rounded-2xl p-6 text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(253,164,175,0.22)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 110%,rgba(253,164,175,0.15),transparent)' }} />
      <span ref={ref} className="block text-5xl font-black tabular-nums relative z-10" style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{display}</span>
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

function BottomCTA() {
  const { m, s } = useCountdown();
  return (
    <>
      <section className="relative overflow-hidden" style={{ background: '#040103' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 110% 50% at 50% 100%, rgba(136,19,55,0.25), transparent)' }} />
        <div className="relative z-10 px-6 pt-14 pb-10 max-w-md mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: 'rgba(253,164,175,0.12)', border: '1px solid rgba(253,164,175,0.35)', color: '#fda4af' }}>💌 연애상담 한정 할인</span>
          </div>
          <div className="text-center mb-10">
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.6rem,16vw,6rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,#fff 10%,rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>연애</p>
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.6rem,16vw,6rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>상담</p>
          </div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인 혜택 종료까지</p>
            <div className="inline-flex items-center rounded-2xl px-10 py-4" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: `0 0 28px rgba(225,29,72,0.5)` }}>{m}</span>
              <span className="font-black mx-1.5" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 'clamp(2rem,8vw,3rem)', lineHeight: 1 }}>:</span>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: `0 0 28px rgba(225,29,72,0.5)` }}>{s}</span>
            </div>
            <p className="text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>할인 종료 후 자동 갱신</p>
          </div>

          {/* 심층 상담 — 메인/추천 카드 */}
          <div className="rounded-3xl p-6 mb-4 relative" style={{ background: 'linear-gradient(160deg,rgba(136,19,55,0.35),rgba(30,5,15,0.6))', border: '1.5px solid rgba(253,164,175,0.5)', boxShadow: '0 0 50px rgba(225,29,72,0.25)' }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-black text-white" style={{ background: 'linear-gradient(90deg,#881337,#e11d48)' }}>가장 많이 선택하는 상담</span>
            <p className="text-center text-sm font-bold mt-2 mb-1" style={{ color: '#fda4af' }}>심층 상담</p>
            <div className="space-y-2 mb-5 mt-4">
              {[
                '상대방의 진짜 속마음',
                '지금 두 사람 관계 진단 + 궁합',
                '결혼을 고민하고 있다면 (적합성 분석)',
                '지금 놓치면 안 되는 타이밍',
                '관계를 더 단단하게 만드는 법',
                '앞으로 이 관계가 흘러갈 방향까지 전부',
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <span style={{ color: ACCENT_COLOR, flexShrink: 0, fontSize: 13 }}>✓</span>{t}
                </div>
              ))}
            </div>
            <div className="text-center mb-5">
              <p className="text-sm line-through mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>정가 169,800원</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,3.8rem)', letterSpacing: '-0.02em' }}>89,900원</span>
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(253,164,175,0.15)', color: '#fda4af', border: '1px solid rgba(253,164,175,0.4)' }}>47% 할인</span>
              </div>
            </div>
            <Link href="/love-counsel?tier=premium" className="w-full h-16 rounded-full flex items-center justify-center text-white font-black text-[16px] transition-all hover:scale-[1.015] active:scale-[0.97]" style={{ background: ACCENT_GRAD, boxShadow: '0 0 70px rgba(225,29,72,0.45), 0 10px 40px rgba(0,0,0,0.5)' }}>
              심층 상담 받기 →
            </Link>
          </div>

          {/* 상담 리포트 — 서브 옵션 */}
          <Link href="/love-counsel?tier=basic" className="flex items-center justify-between rounded-2xl px-5 py-4 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="text-sm font-semibold text-white">상담 리포트 <span style={{ color: 'rgba(255,255,255,0.35)' }}>· 핵심만 간단하게</span></p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>정가 109,800원 → <span style={{ color: '#fda4af' }}>59,900원</span></p>
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>선택 →</span>
          </Link>

          <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>결과 확인 전 전액 환불 · 회원가입 불필요 · 24시간 이용 가능</p>
          <div className="h-20" />
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(4,1,3,0.97)', borderTop: '1px solid rgba(225,29,72,0.18)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인혜택 종료까지</p>
            <p className="font-black tabular-nums leading-none" style={{ fontSize: '1.55rem', letterSpacing: '-0.03em', color: ACCENT_COLOR, textShadow: `0 0 18px rgba(225,29,72,0.7)` }}>
              {m}<span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '1.1rem', margin: '0 1px' }}>:</span>{s}
            </p>
          </div>
          <Link href="/love-counsel?tier=premium" className="flex-1 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#881337,#e11d48)', boxShadow: '0 0 24px rgba(225,29,72,0.45)' }}>
            심층 상담 89,900원 →
          </Link>
        </div>
      </div>
    </>
  );
}

export default function LoveCounselPage() {
  return (
    <div style={{ background: BG_COLOR, color: '#fff', overflowX: 'hidden' }}>
      <div className="fixed top-[62px] left-4 z-50">
        <Link href="/" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>← 홈</Link>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ height: '60vw', maxHeight: '480px', minHeight: '300px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1200&q=85&fit=crop" alt="연애상담" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top,${BG_COLOR} 0%,rgba(14,5,8,0.55) 45%,rgba(14,5,8,0.15) 100%)` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(136,19,55,0.45),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: 'linear-gradient(90deg,#881337,#e11d48)' }}>愛 연애·결혼·재회 통합상담</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg">지금 이 관계,<br />전문가 시선으로 솔직하게 짚어드려요</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.52)' }}>관계 진단 · 전문가 조언 · 재회 타이밍</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => (<svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.2"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/></svg>))}</div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>4.9 · 11,200+ 상담 완료</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <section className="px-5 pt-8 pb-4 max-w-md mx-auto">
        <FadeIn><div className="grid grid-cols-2 gap-3">{STATS.map((st, i) => <StatItem key={i} {...st} />)}</div></FadeIn>
        <FadeIn delay={100} className="mt-3">
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xl flex-shrink-0">💬</span>
            <div>
              <p className="text-sm text-white leading-relaxed">&ldquo;결혼 고민 때문에 신청했는데, <strong>서두르지 말라는 조언이 딱 맞았어요.</strong>&rdquo;</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>— 정○○, 30대 여성</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 전문성 */}
      <section className="px-5 pb-4 max-w-md mx-auto">
        <FadeIn>
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-bold mb-3" style={{ color: ACCENT_COLOR }}>왜 믿을 수 있나요</p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.68)' }}>
              지난 3년간 연애·결혼·재회를 아우르는 <strong style={{ color: '#fff' }}>11,200건 이상</strong>의 실제 상담 사례를 분석해온 관계 전문가의 인사이트를 담았어요. 어떤 질문이든 지금까지 다뤄본 사례를 바탕으로 구체적인 답을 드려요.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[['💑', '연애 상담', '4,800건+'], ['💍', '결혼 상담', '3,100건+'], ['💔', '재회 상담', '3,300건+']].map(([icon, label, count], i) => (
                <div key={i} className="rounded-xl px-2 py-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-base">{icon}</span>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: ACCENT_COLOR }}>{count}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 인트로 */}
      <section className="px-6 py-14 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.15]" style={{ fontSize: 'clamp(1.8rem,7vw,2.8rem)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>모르니까 불안한 거예요,</span>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>속마음도, 방법도</span>
            <br />
            <span style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>전문가가 알려드려요</span>
          </p>
        </FadeIn>
      </section>

      {/* 말풍선 */}
      <section className="px-5 pt-6 pb-12 max-w-md mx-auto">
        <FadeIn className="mb-7 text-center"><p className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>많은 분들이 이렇게 말해요</p></FadeIn>
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
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black" style={{ background: 'linear-gradient(135deg,#881337,#e11d48)', color: 'white' }}>愛</div>
              <div className="rounded-2xl rounded-tr-md px-4 py-3" style={{ background: 'rgba(136,19,55,0.18)', border: '1px solid rgba(225,29,72,0.25)', maxWidth: 'calc(100% - 52px)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>연애든 결혼이든 재회든, 어떤 질문이든 괜찮아요. 남겨주신 상황과 궁금한 점을 최우선으로 분석에 반영해서, 수많은 상담 사례를 다뤄온 관계 전문가의 시선으로 지금 상태부터 앞으로의 방향까지 솔직하게 짚어드릴게요. 💌</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 감정 훅 */}
      <section className="px-6 py-16 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.08]" style={{ fontSize: 'clamp(1.9rem,8vw,3rem)', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>그 사람 속마음,</span><br />
            <span style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>여기서 확인하고</span><br />
            <span style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>움직이세요</span>
          </p>
          <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>추측만 하다 놓치는 타이밍, 더는 없게요.</p>
        </FadeIn>
      </section>

      {/* 분석 항목 */}
      <section className="px-5 pb-16 max-w-md mx-auto">
        <FadeIn className="mb-7"><p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>분석 항목</p><h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>이런 걸 알 수 있어요</h2></FadeIn>
        <div className="space-y-2">
          {[['🌫️', '상대방의 진짜 속마음'], ['💑', '지금 두 사람 관계 진단'], ['💞', '이 사람과 나, 얼마나 잘 맞을까'], ['🔮', '전문가가 주는 솔직한 조언'], ['💍', '결혼을 고민하고 있다면'], ['🎯', '지금 놓치면 안 되는 타이밍'], ['🛠️', '관계를 더 단단하게 만드는 법']].map(([icon, text], i) => (
            <FadeIn key={i} delay={i * 55}>
              <div className="flex items-center gap-4 rounded-2xl px-5 py-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-lg flex-shrink-0">{icon}</span>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 미리보기 */}
      <section className="px-5 pb-16 max-w-md mx-auto">
        <FadeIn className="mb-6"><p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>미리보기</p><h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>이런 결과를 받게 돼요</h2></FadeIn>
        <FadeIn>
          <div className="rounded-2xl overflow-hidden relative" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="p-5 space-y-2.5" style={{ background: 'rgba(28,8,14,0.9)' }}>
              {['두 사람 상황으로 보는 현재 관계 진단', '전문가 시선의 궁합 분석 3가지', '올해 이 관계의 흐름 (분석 후 공개)', '결혼·재회 관련 솔직한 조언 (분석 후 공개)'].map((t, i) => (
                <div key={i} className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(50,15,25,0.7)', border: '1px solid rgba(225,29,72,0.15)', color: 'rgba(255,255,255,0.7)', filter: i > 1 ? 'blur(5px)' : 'none', userSelect: i > 1 ? 'none' : 'auto' }}>{t}</div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-28 flex items-end justify-center pb-5" style={{ background: `linear-gradient(to top,${BG_COLOR} 55%,transparent)` }}>
              <Link href="/love-counsel?tier=premium" className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg,#881337,#e11d48)', boxShadow: '0 0 24px rgba(225,29,72,0.4)' }}>🔒 전체 결과 확인하기</Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 후기 */}
      <section className="px-5 pb-16 max-w-md mx-auto">
        <FadeIn className="mb-7"><p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>실제 후기</p><h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>확인해본 분들의 이야기</h2></FadeIn>
        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <FadeIn key={i} delay={i * 65}>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.22)' }}>{r.emoji}</div>
                  <div><p className="text-sm font-semibold text-white">{r.name}</p><p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{r.age}</p></div>
                  <div className="ml-auto flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => (<svg key={j} width="12" height="12" viewBox="0 0 14 14" fill={j < r.rating ? '#f59e0b' : 'none'} stroke={j < r.rating ? '#f59e0b' : '#374151'} strokeWidth="1.2"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z" /></svg>))}</div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>&ldquo;{r.text}&rdquo;</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <BottomCTA />
    </div>
  );
}
