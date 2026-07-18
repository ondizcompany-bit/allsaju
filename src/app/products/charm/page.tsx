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

const ACCENT = 'linear-gradient(90deg,#fb7185,#f43f5e)';
const ACCENT_COLOR = '#fb7185';
const ACCENT_GRAD = 'linear-gradient(90deg,#9f1239,#e11d48,#fb7185)';
const BG_COLOR = '#0e0508';
const STATS = [
  { target: 91, suffix: '%', label: '매력 포인트 적중률', big: true },
  { target: 8200, suffix: '+', label: '누적 분석 건수', big: false },
  { target: 96, suffix: '%', label: '이용자 만족도', big: false },
  { target: 89, suffix: '%', label: '어필 성공 체감률', big: false },
];
const CONCERNS = [
  { emoji: '😶', text: '제 매력이 뭔지 잘 모르겠어요. 남들은 다 하나씩 있어 보이는데...', delay: 0 },
  { emoji: '💭', text: '소개팅에 나가면 제 매력을 어떻게 어필해야 할지 감이 안 잡혀요.', delay: 140 },
  { emoji: '😔', text: '친구들은 인기 많은데 저는 왜 자꾸 밀리는 느낌일까요?', delay: 280 },
  { emoji: '🤔', text: '분명 저만의 매력이 있을 텐데, 제대로 보여줄 방법이 궁금해요.', delay: 420 },
];
const REVIEWS = [
  { emoji: '🌟', name: '한○○', age: '20대 여성', rating: 5, text: '제 매력 포인트가 "은은하게 끄는 힘"이라고 나왔는데, 소개팅에서 그 부분을 의식하고 나갔더니 반응이 확실히 달랐어요.' },
  { emoji: '⭐', name: '정○○', age: '30대 남성', rating: 5, text: '매력을 갉아먹는 습관 얘기 듣고 뜨끔했어요. 고치려고 노력하니까 주변 반응이 좋아졌습니다.' },
  { emoji: '✨', name: '오○○', age: '20대 남성', rating: 5, text: '제가 어떤 상황에서 매력이 잘 드러나는지 구체적으로 알려줘서, 자리마다 어떻게 행동할지 감이 잡혔어요.' },
  { emoji: '💫', name: '윤○○', age: '30대 여성', rating: 4, text: '막연히 "매력 있다"는 말만 듣다가, 왜 그런지 사주로 설명 들으니 훨씬 와닿았어요.' },
];

function StatItem({ target, suffix, label, big }: { target: number; suffix: string; label: string; big: boolean }) {
  const { ref, display } = useCountUp(target, suffix);
  if (big) return (
    <div className="col-span-2 rounded-2xl p-6 text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,113,133,0.22)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 110%,rgba(251,113,133,0.15),transparent)' }} />
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
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 110% 50% at 50% 100%, rgba(159,18,57,0.25), transparent)' }} />
        <div className="relative z-10 px-6 pt-14 pb-10 max-w-md mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.35)', color: '#fda4af' }}>🔥 매력 분석 한정 할인</span>
          </div>
          <div className="text-center mb-10">
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.6rem,16vw,6rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,#fff 10%,rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>타고난</p>
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.6rem,16vw,6rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>매력</p>
          </div>
          <div className="mb-10 space-y-3 max-w-xs mx-auto">
            {[
              { text: '나만의 타고난 매력 포인트', dim: false },
              { text: '사람들이 나에게 끌리는 이유', dim: false },
              { text: '매력이 가장 잘 드러나는 순간', dim: false },
              { text: '올해 매력·인기운 흐름', dim: false },
              { text: '매력을 200% 발휘하는 법까지..', dim: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm" style={{ color: f.dim ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.68)' }}>
                <span style={{ color: f.dim ? 'rgba(255,255,255,0.2)' : ACCENT_COLOR, flexShrink: 0, fontSize: 13 }}>{f.dim ? '··' : '✓'}</span>{f.text}
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />
          <div className="text-center mb-8">
            <p className="text-sm line-through mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>정가 49,800원</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-black text-white" style={{ fontSize: 'clamp(2.4rem,10vw,3.5rem)', letterSpacing: '-0.02em' }}>24,900원</span>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(251,113,133,0.15)', color: '#fda4af', border: '1px solid rgba(251,113,133,0.4)' }}>한정 할인</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-black" style={{ background: 'linear-gradient(90deg,#9f1239,#e11d48)', color: 'white', boxShadow: '0 6px 28px rgba(225,29,72,0.4)' }}>지금 결제 시 50% 할인!</div>
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
          <Link href="/start?cat=charm" className="w-full h-16 rounded-full flex items-center justify-center text-white font-black text-[16px] transition-all hover:scale-[1.015] active:scale-[0.97]" style={{ background: ACCENT_GRAD, boxShadow: '0 0 70px rgba(225,29,72,0.45), 0 10px 40px rgba(0,0,0,0.5)' }}>
            내 매력 포인트 확인하기 →
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
          <Link href="/start?cat=charm" className="flex-1 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#9f1239,#e11d48)', boxShadow: '0 0 24px rgba(225,29,72,0.45)' }}>
            매력 포인트 신청하기 →
          </Link>
        </div>
      </div>
    </>
  );
}

export default function CharmPage() {
  return (
    <div style={{ background: BG_COLOR, color: '#fff', overflowX: 'hidden' }}>
      <div className="fixed top-[62px] left-4 z-50">
        <Link href="/" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>← 홈</Link>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ height: '60vw', maxHeight: '480px', minHeight: '300px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=85&fit=crop" alt="타고난 매력" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top,${BG_COLOR} 0%,rgba(14,5,8,0.55) 45%,rgba(14,5,8,0.15) 100%)` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(159,18,57,0.45),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: 'linear-gradient(90deg,#9f1239,#e11d48)' }}>✦ 타고난 매력 분석</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg">사주로 읽는<br />나만의 매력 포인트</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.52)' }}>매력의 근원 · 어필 포인트 · 200% 발휘하는 법</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => (<svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.2"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/></svg>))}</div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>4.8 · 8,200+ 분석 완료</span>
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
              <p className="text-sm text-white leading-relaxed">&ldquo;은은하게 끄는 힘이 매력 포인트라고 했는데, <strong>소개팅에서 반응이 확실히 달랐어요.</strong>&rdquo;</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>— 한○○, 20대 여성</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 인트로 */}
      <section className="px-6 py-14 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.1]" style={{ fontSize: 'clamp(1.8rem,7vw,2.8rem)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>내 매력이</span>{' '}
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>뭔지 모르겠나요,</span>
            <br />
            <span style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>이미 갖고 있나요?</span>
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
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black" style={{ background: 'linear-gradient(135deg,#9f1239,#e11d48)', color: 'white' }}>魅</div>
              <div className="rounded-2xl rounded-tr-md px-4 py-3" style={{ background: 'rgba(159,18,57,0.18)', border: '1px solid rgba(225,29,72,0.25)', maxWidth: 'calc(100% - 52px)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>사주에는 그 사람만의 고유한 매력 포인트가 이미 새겨져 있어요. 어떤 매력을 타고났는지, 언제 가장 잘 드러나는지, 어떻게 어필하면 좋은지 정밀하게 짚어드릴게요. ✨</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 감정 훅 */}
      <section className="px-6 py-16 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.08]" style={{ fontSize: 'clamp(1.9rem,8vw,3rem)', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>매력은 없는 게 아니라</span><br />
            <span style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>몰랐던 것</span><br />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>일 수 있어요.</span>
          </p>
          <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>알고 쓰면, 같은 나도 다르게 보입니다.</p>
        </FadeIn>
      </section>

      {/* 분석 항목 */}
      <section className="px-5 pb-16 max-w-md mx-auto">
        <FadeIn className="mb-7"><p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>분석 항목</p><h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>이런 걸 알 수 있어요</h2></FadeIn>
        <div className="space-y-2">
          {[['✨', '타고난 매력 포인트'], ['💫', '사람들이 끌리는 이유'], ['🌙', '매력이 드러나는 순간들'], ['💌', '매력을 가장 잘 어필하는 상황'], ['🏆', '매력을 200% 발휘하는 법']].map(([icon, text], i) => (
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
              {['일간 기준 매력 포인트 – 은은하게 끄는 힘', '사람들이 끌리는 지점 3가지 분석', '올해 매력·인기운이 강해지는 시기 (분석 후 공개)', '매력을 200% 발휘하는 전략 (분석 후 공개)'].map((t, i) => (
                <div key={i} className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(50,15,25,0.7)', border: '1px solid rgba(225,29,72,0.15)', color: 'rgba(255,255,255,0.7)', filter: i > 1 ? 'blur(5px)' : 'none', userSelect: i > 1 ? 'none' : 'auto' }}>{t}</div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-28 flex items-end justify-center pb-5" style={{ background: `linear-gradient(to top,${BG_COLOR} 55%,transparent)` }}>
              <Link href="/start?cat=charm" className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg,#9f1239,#e11d48)', boxShadow: '0 0 24px rgba(225,29,72,0.4)' }}>🔒 전체 결과 확인하기</Link>
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
