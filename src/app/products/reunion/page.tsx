'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* ══════════════════════════════════════════════════
   유틸
══════════════════════════════════════════════════ */
function rnd(a: number, b: number) { return a + Math.random() * (b - a); }

/* ══════════════════════════════════════════════════
   스크롤 페이드인
══════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════
   카운트다운 타이머 — 3배속 MM:SS
   333ms마다 갱신 → 실제보다 3배 빠르게 흘러가는 느낌
   59:59 → 00:00 (~20분) 반복
══════════════════════════════════════════════════ */
function useCountdown() {
  const getTick = () => {
    // 333ms = 1 display-tick, 3600 ticks = 1 cycle (~20 real minutes)
    const tick = Math.floor(Date.now() / 333);
    const totalSecs = 3599 - (tick % 3600);
    return {
      m: Math.floor(totalSecs / 60),
      s: totalSecs % 60,
    };
  };
  const [time, setTime] = useState(getTick);
  useEffect(() => {
    const id = setInterval(() => setTime(getTick()), 333);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  return { m: pad(time.m), s: pad(time.s) };
}

/* ══════════════════════════════════════════════════
   카운트업
══════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════
   폰 캔버스
══════════════════════════════════════════════════ */
type S = Record<string, unknown>;
function initPhone(w: number, h: number): S {
  return { pulses: [] as { r: number; a: number }[], next: 1.2, notifA: 0.4, notifDir: 1, msgs: [0, 1, 2].map(i => ({ x: (w - Math.min(w * 0.52, 145)) / 2 + (i % 2 === 0 ? 0 : 12), y: h * 0.52 + i * 24, w: Math.min(w * 0.52, 145) - i * 16, a: 0.65 - i * 0.12, sent: i % 2 === 0 })) };
}
function drawPhone(ctx: CanvasRenderingContext2D, w: number, h: number, s: S, t: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#080612'; ctx.fillRect(0, 0, w, h);
  const pw = Math.min(w * 0.38, 140), ph = pw * 1.95, px = (w - pw) / 2, py = (h - ph) / 2, r2 = pw * 0.13;
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, r2);
  ctx.fillStyle = 'rgba(14,9,28,0.97)'; ctx.strokeStyle = 'rgba(147,100,255,0.25)'; ctx.lineWidth = 1.2; ctx.fill(); ctx.stroke();
  const gl = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, pw);
  gl.addColorStop(0, `rgba(120,50,210,${0.08 + 0.04 * Math.sin(t * 1.4)})`); gl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
  const notifA = s.notifA as number; const notifDir = s.notifDir as number;
  (s as Record<string, unknown>).notifA = notifA + notifDir * 0.018;
  if ((s.notifA as number) > 1) (s as Record<string, unknown>).notifDir = -1;
  if ((s.notifA as number) < 0.3) (s as Record<string, unknown>).notifDir = 1;
  ctx.beginPath(); ctx.arc(w / 2, py + ph * 0.19, 8, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(236,72,153,${s.notifA as number})`; ctx.shadowBlur = 15 * (s.notifA as number); ctx.shadowColor = 'rgba(236,72,153,0.8)'; ctx.fill(); ctx.shadowBlur = 0;
  ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1', w / 2, py + ph * 0.19);
  const msgs = s.msgs as { x: number; y: number; w: number; a: number; sent: boolean }[];
  for (const m of msgs) { ctx.beginPath(); ctx.roundRect(m.x, m.y, m.w, 18, 9); ctx.fillStyle = m.sent ? `rgba(120,70,230,${m.a})` : `rgba(45,38,65,${m.a})`; ctx.fill(); }
  const pulses = s.pulses as { r: number; a: number }[]; const next = s.next as number;
  if (t > next) { (s as Record<string, unknown>).next = t + rnd(2.5, 4); pulses.push({ r: 11, a: 0.65 }); }
  for (let i = pulses.length - 1; i >= 0; i--) {
    pulses[i].r += 1.2; pulses[i].a -= 0.009;
    if (pulses[i].a <= 0) { pulses.splice(i, 1); continue; }
    ctx.beginPath(); ctx.arc(w / 2, py + ph * 0.19, pulses[i].r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(236,72,153,${pulses[i].a})`; ctx.lineWidth = 1; ctx.stroke();
  }
}
function PhoneCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    let st: S | null = null, time = 0, last = performance.now(), raf: number;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now; time += dt;
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      if (w > 0 && h > 0) {
        if (!st || canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; time = 0; st = initPhone(w, h); }
        const ctx = canvas.getContext('2d'); if (ctx && st) drawPhone(ctx, w, h, st, time);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

/* ══════════════════════════════════════════════════
   데이터
══════════════════════════════════════════════════ */
const STATS = [
  { target: 73, suffix: '%', label: '재회 성공 확인율', big: true },
  { target: 8900, suffix: '+', label: '누적 분석 건수', big: false },
  { target: 96, suffix: '%', label: '이용자 만족도', big: false },
  { target: 91, suffix: '%', label: '감정 예측 정확도', big: false },
];

const CONCERNS = [
  { emoji: '😔', text: '헤어진 지 8개월이 됐는데 아직도 잊질 못해요. 이 마음이 언제쯤 사라질까요...', delay: 0 },
  { emoji: '😶', text: '먼저 연락하면 싫어할까봐 무서워요. 연락해도 될 타이밍인지 알고 싶어요.', delay: 140 },
  { emoji: '💭', text: '혹시 그 사람도 가끔은 저를 생각할까요? 아직 마음이 남아 있는 건지...', delay: 280 },
  { emoji: '🌙', text: '재회할 수 있는 시기가 있다면 알고 싶어요. 사주로 볼 수 있다고 해서요.', delay: 420 },
];

const REVIEWS = [
  { emoji: '🐰', name: '이○○', age: '20대 여성', rating: 5, text: '사주에서 6월에 연락 온다고 했는데, 6월 3일에 정말로 연락이 왔어요. 소름 돋아서 눈물이 났어요.' },
  { emoji: '🦊', name: '김○○', age: '30대 여성', rating: 5, text: '상대 마음이 아직 있다고 했는데 실제로 연락해보니 맞았어요. 접근 방법 조언도 너무 도움됐어요.' },
  { emoji: '🐻', name: '박○○', age: '20대 남성', rating: 5, text: '재회 가능성 퍼센트 보고 반신반의했는데 딱 그 시기에 연락이 왔어요. 믿기 힘든 일이 일어났어요.' },
  { emoji: '🐱', name: '한○○', age: '30대 여성', rating: 4, text: '될지 안될지가 아니라 어떻게 접근할지까지 알려줘서 실용적이에요.' },
];

/* ══════════════════════════════════════════════════
   통계 카드
══════════════════════════════════════════════════ */
function StatItem({ target, suffix, label, big }: { target: number; suffix: string; label: string; big: boolean }) {
  const { ref, display } = useCountUp(target, suffix);
  if (big) return (
    <div className="col-span-2 rounded-2xl p-6 text-center relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(236,72,153,0.2)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 110%,rgba(236,72,153,0.14),transparent)' }} />
      <span ref={ref} className="block text-5xl font-black tabular-nums relative z-10"
        style={{ background: 'linear-gradient(90deg,#e879f9,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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

/* ══════════════════════════════════════════════════
   하단 CTA + 고정 스티키 바
══════════════════════════════════════════════════ */
function BottomCTA() {
  const { m, s } = useCountdown();

  return (
    <>
      {/* ────────────────────────────────
          메인 CTA 섹션
      ──────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#04020a' }}>
        {/* 배경 글로우 */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 110% 50% at 50% 100%, rgba(190,24,93,0.25), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 35% at 50% 55%, rgba(109,40,217,0.1), transparent)' }} />

        <div className="relative z-10 px-6 pt-14 pb-10 max-w-md mx-auto">

          {/* 한정 할인 뱃지 */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
              style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.35)', color: '#f9a8d4' }}>
              🔥 오늘만 적용되는 한정 할인
            </span>
          </div>

          {/* 대형 제품명 */}
          <div className="text-center mb-10">
            <p className="font-black leading-[0.95]"
              style={{ fontSize: 'clamp(3.6rem,16vw,6rem)', letterSpacing: '-0.03em',
                background: 'linear-gradient(180deg,#fff 10%,rgba(255,255,255,0.5) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              재회·연애
            </p>
            <p className="font-black leading-[0.95]"
              style={{ fontSize: 'clamp(3.6rem,16vw,6rem)', letterSpacing: '-0.03em',
                background: 'linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              분석
            </p>
          </div>

          {/* 특징 리스트 */}
          <div className="mb-10 space-y-3 max-w-xs mx-auto">
            {[
              { text: '사주 기반 재회 가능성 % 분석', dim: false },
              { text: '상대방의 현재 감정 상태', dim: false },
              { text: '연락 최적 타이밍 계산', dim: false },
              { text: '재회 후 관계 지속 예측', dim: false },
              { text: '맞춤 접근 전략 설계까지..', dim: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm"
                style={{ color: f.dim ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.68)' }}>
                <span style={{ color: f.dim ? 'rgba(255,255,255,0.2)' : '#ec4899', flexShrink: 0, fontSize: 13 }}>
                  {f.dim ? '··' : '✓'}
                </span>
                {f.text}
              </div>
            ))}
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />

          {/* 가격 표시 */}
          <div className="text-center mb-8">
            <p className="text-sm line-through mb-2" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.02em' }}>
              정가 49,800원
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-black text-white" style={{ fontSize: 'clamp(2.4rem,10vw,3.5rem)', letterSpacing: '-0.02em' }}>
                24,900원
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: 'rgba(236,72,153,0.15)', color: '#f9a8d4', border: '1px solid rgba(236,72,153,0.4)' }}>
                한정 할인
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-black"
              style={{ background: 'linear-gradient(90deg,#be185d,#ec4899)',
                color: 'white', boxShadow: '0 6px 28px rgba(236,72,153,0.5)' }}>
              지금 결제 시 50% 할인!
            </div>
          </div>

          {/* 카운트다운 — 레퍼런스 스타일 */}
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              할인 혜택 종료까지
            </p>
            {/* MM:SS 빠른 카운트다운 */}
            <div className="inline-flex items-center rounded-2xl px-10 py-4"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="tabular-nums font-black text-white"
                style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em',
                  textShadow: '0 0 28px rgba(244,114,182,0.4)' }}>
                {m}
              </span>
              <span className="font-black mx-1.5" style={{ color: 'rgba(255,255,255,0.25)',
                fontSize: 'clamp(2rem,8vw,3rem)', lineHeight: 1 }}>:</span>
              <span className="tabular-nums font-black text-white"
                style={{ fontSize: 'clamp(2.6rem,11vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em',
                  textShadow: '0 0 28px rgba(244,114,182,0.4)' }}>
                {s}
              </span>
            </div>
            <p className="text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
              할인 종료 후 자동 갱신
            </p>
          </div>

          {/* 메인 CTA 버튼 */}
          <Link href="/start?cat=reunion"
            className="w-full h-16 rounded-full flex items-center justify-center text-white font-black text-[16px] transition-all hover:scale-[1.015] active:scale-[0.97]"
            style={{ background: 'linear-gradient(90deg,#9d174d,#db2777,#f472b6)',
              boxShadow: '0 0 70px rgba(236,72,153,0.5), 0 10px 40px rgba(0,0,0,0.5)' }}>
            재회 가능성 확인하기 →
          </Link>

          <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
            결과 확인 전 전액 환불 · 회원가입 불필요 · 24시간 이용 가능
          </p>

          {/* 스티키 바 공간 확보 */}
          <div className="h-20" />
        </div>
      </section>

      {/* ────────────────────────────────
          하단 고정 스티키 바
      ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50"
        style={{ background: 'rgba(4,2,10,0.97)', borderTop: '1px solid rgba(236,72,153,0.18)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* 카운트다운 — 레퍼런스 HH:MM:SS 인라인 포맷 */}
          <div className="flex-shrink-0">
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-none mb-0.5"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              할인혜택 종료까지
            </p>
            <p className="font-black tabular-nums leading-none"
              style={{ fontSize: '1.65rem', letterSpacing: '-0.04em', color: '#f472b6',
                textShadow: '0 0 20px rgba(244,114,182,0.8)' }}>
              {m}
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', margin: '0 1px' }}>:</span>
              {s}
            </p>
          </div>
          {/* CTA 버튼 */}
          <Link href="/start?cat=reunion"
            className="flex-1 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(90deg,#9333ea,#ec4899)',
              boxShadow: '0 0 24px rgba(236,72,153,0.45)' }}>
            재회 분석 신청하기 →
          </Link>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function ReunionPage() {
  return (
    <div style={{ background: '#07070e', color: '#fff', overflowX: 'hidden' }}>

      {/* 뒤로가기 */}
      <div className="fixed top-[62px] left-4 z-50">
        <Link href="/" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>
          ← 홈
        </Link>
      </div>

      {/* ══════════════════════════════
          HERO — 이미지
      ══════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ height: '60vw', maxHeight: '480px', minHeight: '300px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1200&q=85&fit=crop"
          alt="재회 사주"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top,#07070e 0%,rgba(7,7,14,0.55) 45%,rgba(7,7,14,0.15) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right,rgba(88,28,135,0.4),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-7 md:px-8">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7)' }}>
              ✦ 재회 사주
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg">
            헤어진 그 사람과의<br />재회 사주
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.52)' }}>
            다시 만날 수 있는 시기와 가능성을 깊이 짚어드립니다
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.2">
                  <path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/>
                </svg>
              ))}
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>4.9 · 8,900+ 분석 완료</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          숫자 증거
      ══════════════════════════════ */}
      <section className="px-5 pt-8 pb-4 max-w-md mx-auto">
        <FadeIn>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((st, i) => <StatItem key={i} {...st} />)}
          </div>
        </FadeIn>
        <FadeIn delay={100} className="mt-3">
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xl flex-shrink-0">💬</span>
            <div>
              <p className="text-sm text-white leading-relaxed">
                &ldquo;6월에 연락 온다고 했는데, <strong>6월 3일에 정말 연락이 왔어요.</strong>&rdquo;
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>— 이○○, 20대 여성</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════
          공감 인트로
      ══════════════════════════════ */}
      <section className="px-6 py-14 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.1]"
            style={{ fontSize: 'clamp(1.8rem,7vw,2.8rem)', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>혹시</span>{' '}
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>이런 마음,</span>
            <br />
            <span style={{ background: 'linear-gradient(90deg,#e879f9,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>있으신가요?</span>
          </p>
        </FadeIn>
      </section>

      {/* ══════════════════════════════
          폰 씬
      ══════════════════════════════ */}
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(240px, 55vw, 340px)' }}>
        <PhoneCanvas />
        <div className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: '40%', background: 'linear-gradient(to bottom,#07070e 0%,rgba(7,7,14,0.5) 60%,transparent 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: '50%', background: 'linear-gradient(to top,#07070e 0%,rgba(7,7,14,0.6) 55%,transparent 100%)' }} />
        <span className="absolute top-5 left-5 text-[10px] font-bold tracking-widest"
          style={{ color: 'rgba(255,255,255,0.18)' }}>01</span>
        <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
          <FadeIn>
            <p className="font-black leading-[1.1] mb-1"
              style={{ fontSize: 'clamp(1.5rem,6vw,2.2rem)', letterSpacing: '-0.01em' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>아직도 폰을 </span>
              <span style={{ background: 'linear-gradient(90deg,#e879f9,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>확인해요</span>
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>혹시 연락이 왔나 하고</p>
          </FadeIn>
        </div>
      </div>

      {/* ══════════════════════════════
          말풍선
      ══════════════════════════════ */}
      <section className="px-5 pt-6 pb-12 max-w-md mx-auto">
        <FadeIn className="mb-7 text-center">
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}>많은 분들이 이렇게 말해요</p>
        </FadeIn>
        <div className="space-y-3">
          {CONCERNS.map((c, i) => (
            <FadeIn key={i} delay={c.delay}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  {c.emoji}
                </div>
                <div className="rounded-2xl rounded-tl-md px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 'calc(100% - 52px)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.text}</p>
                </div>
              </div>
            </FadeIn>
          ))}
          <FadeIn delay={580}>
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: 'white' }}>
                命
              </div>
              <div className="rounded-2xl rounded-tr-md px-4 py-3"
                style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.25)', maxWidth: 'calc(100% - 52px)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  사주로 재회 가능성과 최적의 타이밍을 알 수 있어요. 두 사람의 인연이 끝난 건지, 아직 이어질 수 있는지 확인해드릴게요. 💜
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════
          감정 훅
      ══════════════════════════════ */}
      <section className="px-6 py-16 max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-black leading-[1.08]"
            style={{ fontSize: 'clamp(1.9rem,8vw,3rem)', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>그 인연,</span>
            <br />
            <span style={{ background: 'linear-gradient(90deg,#e879f9,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>아직 끝나지</span>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>않았을 수 있어요.</span>
          </p>
          <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            사주가 두 사람의 인연을 솔직하게 알려드립니다.
          </p>
        </FadeIn>
      </section>

      {/* ══════════════════════════════
          분석 항목
      ══════════════════════════════ */}
      <section className="px-5 pb-16 max-w-md mx-auto">
        <FadeIn className="mb-7">
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>분석 항목</p>
          <h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>이런 걸 알 수 있어요</h2>
        </FadeIn>
        <div className="space-y-2">
          {[['💫', '재회 가능성 % 및 최적 시기'], ['💭', '지금 상대방이 나를 어떻게 생각하는지'], ['📱', '연락 타이밍과 가장 좋은 방법'], ['🌙', '두 사람의 인연이 아직 남아 있는지'], ['✨', '재회 후 관계가 지속될 가능성']].map(([icon, text], i) => (
            <FadeIn key={i} delay={i * 55}>
              <div className="flex items-center gap-4 rounded-2xl px-5 py-3.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-lg flex-shrink-0">{icon}</span>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          결과 미리보기
      ══════════════════════════════ */}
      <section className="px-5 pb-16 max-w-md mx-auto">
        <FadeIn className="mb-6">
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>미리보기</p>
          <h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>이런 결과를 받게 돼요</h2>
        </FadeIn>
        <FadeIn>
          <div className="rounded-2xl overflow-hidden relative" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="p-5 space-y-2.5" style={{ background: 'rgba(10,8,20,0.9)' }}>
              {['두 사람의 인연지수: ██% (분석 후 공개)', '재회 최적 시기: 2026년 ○월 전후', '상대방 감정: 아직 ○○한 마음이 남아 있음', '연락 방법: ○○한 방식으로 접근하는 것이 유리'].map((t, i) => (
                <div key={i} className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(25,15,50,0.7)', border: '1px solid rgba(100,70,200,0.15)', color: 'rgba(255,255,255,0.7)', filter: i > 0 ? 'blur(5px)' : 'none', userSelect: i > 0 ? 'none' : 'auto' }}>
                  {t}
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-28 flex items-end justify-center pb-5"
              style={{ background: 'linear-gradient(to top,#07070e 55%,transparent)' }}>
              <Link href="/start?cat=reunion"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(90deg,#7c3aed,#ec4899)', boxShadow: '0 0 24px rgba(236,72,153,0.4)' }}>
                🔒 전체 결과 확인하기
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════
          후기
      ══════════════════════════════ */}
      <section className="px-5 pb-16 max-w-md mx-auto">
        <FadeIn className="mb-7">
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>실제 후기</p>
          <h2 className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>재회한 분들의 이야기</h2>
        </FadeIn>
        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <FadeIn key={i} delay={i * 65}>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.22)' }}>
                    {r.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{r.name}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{r.age}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} width="12" height="12" viewBox="0 0 14 14" fill={j < r.rating ? '#f59e0b' : 'none'} stroke={j < r.rating ? '#f59e0b' : '#374151'} strokeWidth="1.2">
                        <path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>&ldquo;{r.text}&rdquo;</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          하단 CTA + 스티키 바
      ══════════════════════════════ */}
      <BottomCTA />

    </div>
  );
}
