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

const ACCENT = 'linear-gradient(90deg,#38bdf8,#0ea5e9)';
const ACCENT_COLOR = '#38bdf8';
const ACCENT_GRAD = 'linear-gradient(90deg,#0c4a6e,#0284c7,#38bdf8)';
const BG_COLOR = '#020a10';
const STATS = [
  { target: 93, suffix: '%', label: '고민 진단 공감률', big: true },
  { target: 9600, suffix: '+', label: '누적 분석 건수', big: false },
  { target: 97, suffix: '%', label: '이용자 만족도', big: false },
  { target: 88, suffix: '%', label: '실질적 도움 체감률', big: false },
];
const CONCERNS = [
  { emoji: '😮‍💨', text: '요즘 계속 같은 고민만 맴돌아요. 누구한테 말하기도 애매하고...', delay: 0 },
  { emoji: '🤔', text: '이 선택이 맞는 건지 계속 확신이 안 서요.', delay: 140 },
  { emoji: '💭', text: '왜 저는 자꾸 비슷한 문제로 힘들어할까요?', delay: 280 },
  { emoji: '😔', text: '주변에 물어봐도 다 다른 말을 해서 더 헷갈려요.', delay: 420 },
];
const REVIEWS = [
  { emoji: '🌊', name: '조○○', age: '30대 여성', rating: 5, text: '이직 고민 때문에 신청했는데, 제가 왜 자꾸 이런 갈등을 겪는지 사주로 설명 들으니 마음이 훨씬 정리됐어요.' },
  { emoji: '💧', name: '남○○', age: '20대 남성', rating: 5, text: '막연하게 걱정만 하다가, 구체적으로 언제쯤 풀릴지 짚어주니까 답답함이 줄었습니다.' },
  { emoji: '☁️', name: '백○○', age: '40대 여성', rating: 5, text: '갈림길에서 어느 쪽이 저한테 맞는지 사주로 비교해줘서 결정하는 데 정말 도움이 됐어요.' },
  { emoji: '🌫️', name: '한○○', age: '30대 남성', rating: 4, text: '고민을 키우는 제 습관을 짚어줘서 뜨끔했는데, 덕분에 뭘 고쳐야 할지 명확해졌어요.' },
];

function StatItem({ target, suffix, label, big }: { target: number; suffix: string; label: string; big: boolean }) {
  const { ref, display } = useCountUp(target, suffix);
  if (big) return (
    <div className="col-span-2 rounded-2xl p-6 text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,189,248,0.22)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 110%,rgba(56,189,248,0.15),transparent)' }} />
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
      <section className="relative overflow-hidden" style={{ background: '#010609' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 110% 50% at 50% 100%, rgba(2,132,199,0.25), transparent)' }} />
        <div className="relative z-10 px-6 pt-14 pb-10 max-w-md mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', color: '#7dd3fc' }}>🌀 고민사주풀이 한정 할인</span>
          </div>
          <div className="text-center mb-10">
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.6rem,16vw,6rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,#fff 10%,rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>고민</p>
            <p className="font-black leading-[0.95]" style={{ fontSize: 'clamp(3.6rem,16vw,6rem)', letterSpacing: '-0.03em', background: 'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>사주풀이</p>
          </div>
          <div className="mb-10 space-y-3 max-w-xs mx-auto">
            {[
              { text: '이 고민이 생긴 사주적 이유', dim: false },
              { text: '지금 상황에 대한 사주의 진단', dim: false },
              { text: '고민이 풀리는 시기와 흐름', dim: false },
              { text: '갈림길에서의 선택 방향', dim: false },
              { text: '지금 당장 할 수 있는 것까지..', dim: true },
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
              <span className="font-black text-white" style={{ fontSize: 'clamp(2.4rem,10vw,3.5rem)', letterSpacing: '-0.02em' }}>27,900원</span>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(56,189,248,0.15)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,0.4)' }}>한정 할인</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-black" style={{ background: 'linear-gradient(90deg,#0c4a6e,#0284c7)', color: 'white', boxShadow: '0 6px 28px rgba(2,132,199,0.4)' }}>지금 결제 시 44% 할인!</div>
          </div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인 혜택 종료까지</p>
            <div className="inline-flex items-center rounded-2xl px-10 py-4" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: `0 0 28px rgba(2,132,199,0.5)` }}>{m}</span>
              <span className="font-black mx-1.5" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 'clamp(2rem,8vw,3rem)', lineHeight: 1 }}>:</span>
              <span className="tabular-nums font-black text-white" style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em', textShadow: `0 0 28px rgba(2,132,199,0.5)` }}>{s}</span>
            </div>
            <p className="text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>할인 종료 후 자동 갱신</p>
          </div>
          <Link href="/start?cat=worry" className="w-full h-16 rounded-full flex items-center justify-center text-white font-black text-[16px] transition-all hover:scale-[1.015] active:scale-[0.97]" style={{ background: ACCENT_GRAD, boxShadow: '0 0 70px rgba(2,132,199,0.45), 0 10px 40px rgba(0,0,0,0.5)' }}>
            내 고민 사주로 풀어보기 →
          </Link>
          <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>결과 확인 전 전액 환불 · 회원가입 불필요 · 24시간 이용 가능</p>
          <div className="h-20" />
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(1,6,9,0.97)', borderTop: '1px solid rgba(2,132,199,0.18)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>할인혜택 종료까지</p>
            <p className="font-black tabular-nums leading-none" style={{ fontSize: '1.55rem', letterSpacing: '-0.03em', color: ACCENT_COLOR, textShadow: `0 0 18px rgba(2,132,199,0.7)` }}>
              {m}<span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '1.1rem', margin: '0 1px' }}>:</span>{s}
            </p>
          </div>
          <Link href="/start?cat=worry" className="flex-1 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-[0.97]" style={{ background: 'linear-gradient(90deg,#0c4a6e,#0284c7)', boxShadow: '0 0 24px rgba(2,132,199,0.45)' }}>
            고민사주풀이 신청하기 →
          </Link>
        </div>
      </div>
    </>
  );
}

export default function WorryPage() {
  return (
    <div style={{ background: BG_COLOR, color: '#fff', overflowX: 'hidden' }}>
      <div className="fixed top-[62px] left-4 z-50">
        <Link href="/" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>← 홈</Link>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ height: '60vw', maxHeight: '480px', minHeight: '300px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1200&q=85&fit=crop" alt="고민사주풀이" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top,${BG_COLOR} 0%,rgba(2,10,16,0.55) 45%,rgba(2,10,16,0.15) 100%)` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(12,74,110,0.45),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: 'linear-gradient(90deg,#0c4a6e,#0284c7)' }}>解 고민사주풀이</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg">말 못한 고민,<br />사주로 풀어드립니다</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.52)' }}>고민의 뿌리 · 지금 상황 진단 · 명확한 답</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => (<svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.2"><path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/></svg>))}</div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>4.9 · 9,600+ 분석 완료</span>
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
              <p className="text-sm text-white leading-relaxed">&ldquo;제가 왜 자꾸 이런 갈등을 겪는지 설명 들으니 <strong>마음이 훨씬 정리됐어요.</strong>&rdquo;</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>— 조○○, 30대 여성</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 인트로 */}
      <section className="px-6 py-14 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.15]" style={{ fontSize: 'clamp(1.8rem,7vw,2.8rem)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>말할 곳 없는 고민,</span>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>혼자 안고 있나요?</span>
            <br />
            <span style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>사주에 답이 있어요</span>
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
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black" style={{ background: 'linear-gradient(135deg,#0c4a6e,#0284c7)', color: 'white' }}>解</div>
              <div className="rounded-2xl rounded-tr-md px-4 py-3" style={{ background: 'rgba(12,74,110,0.18)', border: '1px solid rgba(2,132,199,0.25)', maxWidth: 'calc(100% - 52px)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>어떤 고민이든, 직접 남겨주신 질문을 최우선으로 분석에 반영해드려요. 이 고민이 왜 생겼는지, 지금은 어떤 상황인지, 언제 풀리는지, 그래서 어떻게 하면 좋은지까지 사주로 명확하게 짚어드릴게요. 🌀</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 감정 훅 */}
      <section className="px-6 py-16 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.08]" style={{ fontSize: 'clamp(1.9rem,8vw,3rem)', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>답이 없는 게 아니라,</span><br />
            <span style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>아직 못 찾았을</span><br />
            <span style={{ background: ACCENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>뿐이에요</span>
          </p>
          <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>사주로 보면, 지금 상황이 훨씬 선명해집니다.</p>
        </FadeIn>
      </section>

      {/* 분석 항목 */}
      <section className="px-5 pb-16 max-w-md mx-auto">
        <FadeIn className="mb-7"><p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>분석 항목</p><h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>이런 걸 알 수 있어요</h2></FadeIn>
        <div className="space-y-2">
          {[['🌀', '고민의 뿌리 — 사주가 보는 이 마음'], ['🔍', '지금 상황 진단'], ['💡', '사주가 주는 첫 번째 답'], ['⏳', '이 고민이 풀리는 시기'], ['🧭', '갈림길에서의 선택 방향'], ['🛠️', '지금 당장 할 수 있는 것']].map(([icon, text], i) => (
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
            <div className="p-5 space-y-2.5" style={{ background: 'rgba(6,20,28,0.9)' }}>
              {['일간 기준 이 고민이 생기는 이유 분석', '지금 상황에 대한 사주의 진단 3가지', '이 고민이 풀리기 시작하는 시기 (분석 후 공개)', '갈림길에서 사주가 말하는 선택 (분석 후 공개)'].map((t, i) => (
                <div key={i} className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(8,35,50,0.7)', border: '1px solid rgba(2,132,199,0.15)', color: 'rgba(255,255,255,0.7)', filter: i > 1 ? 'blur(5px)' : 'none', userSelect: i > 1 ? 'none' : 'auto' }}>{t}</div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-28 flex items-end justify-center pb-5" style={{ background: `linear-gradient(to top,${BG_COLOR} 55%,transparent)` }}>
              <Link href="/start?cat=worry" className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg,#0c4a6e,#0284c7)', boxShadow: '0 0 24px rgba(2,132,199,0.4)' }}>🔒 전체 결과 확인하기</Link>
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
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(2,132,199,0.1)', border: '1px solid rgba(2,132,199,0.22)' }}>{r.emoji}</div>
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
