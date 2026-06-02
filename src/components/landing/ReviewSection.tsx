'use client';

import { useEffect, useRef, useState } from 'react';

// ─── 리뷰 4개만 ──────────────────────────────────────────────────────────────

const REVIEWS = [
  {
    category: '재회 사주',
    text: '헤어지고 8개월 됐는데 6월에 연락 온다고 했어요. 6월 3일에 정말로 연락이 왔어요. 어떻게 이게 가능한지 진짜 소름 돋았습니다.',
    author: '97년생 여',
    stars: 5,
    color: '#f472b6',
  },
  {
    category: '신년 총운',
    text: '4월이 고비라고 딱 짚어줬는데 진짜 4월에 힘든 일이 생기고 5월부터 풀렸어요. 월별로 이렇게 정확할 줄 몰랐어요.',
    author: '90년생 여',
    stars: 5,
    color: '#fbbf24',
  },
  {
    category: '커리어 타이밍',
    text: '이직 타이밍을 못 잡고 있었는데 하반기 9~10월이 최적이라고 나왔어요. 확신이 생겨서 지금 준비 중입니다.',
    author: '93년생 남',
    stars: 5,
    color: '#60a5fa',
  },
  {
    category: '재테크 성향',
    text: '부동산보다 주식이 내 팔자에 맞는다고 나왔어요. 성향 분석이 너무 정확해서 앞으로 방향을 바꿔볼 생각입니다.',
    author: '85년생 남',
    stars: 5,
    color: '#34d399',
  },
];

// ─── 라이브 카운터 ────────────────────────────────────────────────────────────

const BASE = 148_555;

function LiveCounter() {
  const [count, setCount]  = useState(0);
  const ref     = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const live    = useRef(BASE);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;

      // 0 → BASE 카운트업 (2.5초, ease-out)
      const start = performance.now();
      const dur   = 2500;
      const frame = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setCount(Math.floor(BASE * e));
        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          setCount(BASE);
          live.current = BASE;
          // 도달 후 계속 +1씩 (3~6초 간격)
          const tick = () => {
            setTimeout(() => {
              live.current++;
              setCount(live.current);
              tick();
            }, 3000 + Math.random() * 3000);
          };
          tick();
        }
      };
      requestAnimationFrame(frame);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <span ref={ref} className="tabular-nums">{count.toLocaleString('ko-KR')}</span>;
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

export function ReviewSection() {
  return (
    <section className="container py-20">
      <hr className="divider-purple mb-20" />

      {/* 헤더 */}
      <div className="text-center mb-14">
        <p className="text-xs font-bold tracking-[0.25em] text-amber-400 uppercase mb-5">
          실제 이용 후기
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
          <LiveCounter />명이 선택한
          <br />
          <span className="text-gradient">명리공방</span>
        </h2>
        <p className="text-sm text-mute mt-4">모든 후기는 100% 실제 이용자의 후기입니다</p>
      </div>

      {/* 리뷰 카드 2×2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REVIEWS.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${r.color}30`,
            }}
          >
            {/* 별점 */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <svg key={j} width="16" height="16" viewBox="0 0 16 16" fill={j < r.stars ? '#fbbf24' : 'rgba(255,255,255,0.1)'}>
                  <path d="M8 1L9.8 5.8H15L10.6 8.7L12.4 13.5L8 10.6L3.6 13.5L5.4 8.7L1 5.8H6.2L8 1Z" />
                </svg>
              ))}
            </div>

            {/* 후기 텍스트 */}
            <p className="text-[15px] text-white/90 leading-relaxed flex-1">
              &ldquo;{r.text}&rdquo;
            </p>

            {/* 하단 */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <span className="text-sm font-semibold text-white/70">{r.author}</span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: `${r.color}20`, color: r.color }}
              >
                {r.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
