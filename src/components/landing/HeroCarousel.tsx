'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const TABS = [
  { label: '전체',     href: null },
  { label: '매력',     href: '/products/charm' },
  { label: '신년운세', href: '/products/new-year' },
  { label: '연애·재회', href: '/products/reunion' },
  { label: '커리어',   href: '/products/career' },
  { label: '재테크',   href: '/products/investment' },
  { label: '속궁합', href: '/products/secret' },
  { label: '임신·육아', href: '/products?category=임신·육아' },
];

const SLIDES = [
  {
    id: 'new-year',
    category: '2026 신년 총운',
    title: '2026 병오년\n신년 총운',
    desc: '새해 운기 · 월별 흐름 · 주의 시기까지\n한 해의 모든 운명을 완전 분석',
    image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=85&fit=crop',
    href: '/products/new-year',
    adult: false,
  },
  {
    id: 'reunion',
    category: '재회 사주',
    title: '헤어진 그 사람과의\n재회 사주',
    desc: '다시 만날 수 있는 시기와 가능성\n두 사람의 인연을 깊이 풀어드립니다',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1200&q=85&fit=crop',
    href: '/products/reunion',
    adult: false,
  },
  {
    id: 'career',
    category: '커리어 타이밍',
    title: '취업·이직·승진\n커리어 타이밍',
    desc: '내 사주가 말하는 가장 완벽한\n커리어 전환 시기를 알려드립니다',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=85&fit=crop',
    href: '/products/career',
    adult: false,
  },
  {
    id: 'investment',
    category: '재테크 성향',
    title: '내 팔자에 맞는\n재테크 성향',
    desc: '사주팔자로 알아보는 나만의\n최적 재테크 전략과 타고난 재물운',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=85&fit=crop',
    href: '/products/investment',
    adult: false,
  },
  {
    id: 'secret',
    category: '🌶️ 속궁합 19+',
    title: '29금 은밀한\n속궁합 & 밤의 성향',
    desc: '두 사람의 깊은 궁합을 솔직하게\n은밀하고 자세히 풀어드립니다',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&q=85&fit=crop',
    href: '/products/secret',
    adult: true,
  },
];

const PEEK = 36;
const GAP  = 12;

/* eslint-disable @typescript-eslint/no-explicit-any */

function rnd(a: number, b: number) { return a + Math.random() * (b - a); }

// ─────────────────────────────────────────────────────────────────────────────
// 1. 신년 총운 — 대형 별자리 + 연속 폭죽 + 유성
// ─────────────────────────────────────────────────────────────────────────────
function initNewYear(w: number, h: number) {
  return {
    stars: Array.from({ length: 120 }, () => ({
      x: rnd(0, w), y: rnd(0, h),
      size: rnd(1, 4), phase: rnd(0, Math.PI * 2), speed: rnd(0.4, 1.8),
      gold: Math.random() > 0.5,
    })),
    fw:      [] as any[],
    meteors: [] as any[],
    nextFw:  0.5,
    nextMeteor: 2,
  };
}
function drawNewYear(ctx: CanvasRenderingContext2D, w: number, h: number, s: any, t: number) {
  ctx.clearRect(0, 0, w, h);

  // 별
  for (const st of s.stars) {
    const a = (Math.sin(st.phase + t * st.speed) + 1) / 2;
    const r = st.size * (0.7 + 0.3 * a);
    ctx.beginPath();
    ctx.arc(st.x, st.y, r, 0, Math.PI * 2);
    ctx.shadowBlur = st.gold ? 18 : 10;
    ctx.shadowColor = st.gold ? `rgba(255,220,50,${a})` : `rgba(180,210,255,${a})`;
    ctx.fillStyle   = st.gold ? `rgba(255,230,80,${a * 0.95})` : `rgba(200,225,255,${a * 0.8})`;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // 유성 생성
  if (t > s.nextMeteor) {
    s.nextMeteor = t + rnd(1.5, 3);
    s.meteors.push({ x: rnd(w * 0.3, w), y: rnd(0, h * 0.3), len: rnd(80, 160), speed: rnd(6, 12), alpha: 1 });
  }
  for (let i = s.meteors.length - 1; i >= 0; i--) {
    const m = s.meteors[i];
    m.x -= m.speed; m.y += m.speed * 0.55; m.alpha -= 0.025;
    if (m.alpha <= 0 || m.x < -m.len) { s.meteors.splice(i, 1); continue; }
    const g = ctx.createLinearGradient(m.x, m.y, m.x + m.len, m.y - m.len * 0.55);
    g.addColorStop(0, `rgba(255,245,200,${m.alpha})`);
    g.addColorStop(1, 'rgba(255,245,200,0)');
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + m.len, m.y - m.len * 0.55);
    ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(255,240,150,0.8)';
    ctx.stroke(); ctx.shadowBlur = 0;
  }

  // 폭죽 생성 (빠른 주기)
  if (t > s.nextFw) {
    s.nextFw = t + rnd(0.6, 1.4);
    const fx = rnd(w * 0.1, w * 0.9);
    const fy = rnd(h * 0.05, h * 0.5);
    const hue = rnd(30, 70);
    const count = 36;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const spd = rnd(1.5, 4.5);
      s.fw.push({ x: fx, y: fy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, alpha: 1, hue, size: rnd(2, 4.5) });
    }
    // 2차 내부 폭죽
    for (let i = 0; i < 12; i++) {
      const ang = rnd(0, Math.PI * 2);
      s.fw.push({ x: fx, y: fy, vx: Math.cos(ang) * rnd(0.3, 1), vy: Math.sin(ang) * rnd(0.3, 1), alpha: 1, hue: hue + 20, size: rnd(3, 6) });
    }
  }
  for (let i = s.fw.length - 1; i >= 0; i--) {
    const p = s.fw[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.alpha -= 0.015;
    if (p.alpha <= 0) { s.fw.splice(i, 1); continue; }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.shadowBlur = 14; ctx.shadowColor = `hsla(${p.hue},100%,65%,${p.alpha})`;
    ctx.fillStyle = `hsla(${p.hue},100%,75%,${p.alpha})`;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // 전체 황금 글로우 펄스
  const pulse = 0.12 + 0.06 * Math.sin(t * 1.5);
  const gg = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.8);
  gg.addColorStop(0, `rgba(255,200,0,${pulse})`);
  gg.addColorStop(1, 'rgba(255,200,0,0)');
  ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. 재회 사주 — 대형 오브 2개 공전 + 연결 광선 + 빛 소나기
// ─────────────────────────────────────────────────────────────────────────────
function initReunion(w: number, h: number) {
  return {
    particles: Array.from({ length: 80 }, () => ({
      x: rnd(0, w), y: rnd(0, h),
      vx: rnd(-0.4, 0.4), vy: rnd(-1.2, -0.3),
      alpha: rnd(0, 1), size: rnd(2, 5), pink: Math.random() > 0.5,
    })),
    trail: [] as any[],
  };
}
function drawReunion(ctx: CanvasRenderingContext2D, w: number, h: number, s: any, t: number) {
  ctx.clearRect(0, 0, w, h);

  const orbitR = Math.min(w, h) * 0.22;
  const cx = w / 2, cy = h * 0.44;

  // 두 오브 위치 계산
  const positions = [0, 1].map(j => ({
    x: cx + Math.cos(t * 0.38 + j * Math.PI) * orbitR,
    y: cy + Math.sin(t * 0.38 + j * Math.PI) * orbitR * 0.42,
    purple: j === 0,
  }));

  // 두 오브를 잇는 빛줄기
  const [p0, p1] = positions;
  const lg = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
  lg.addColorStop(0, 'rgba(192,132,252,0.5)');
  lg.addColorStop(0.5, 'rgba(255,255,255,0.15)');
  lg.addColorStop(1, 'rgba(251,113,133,0.5)');
  ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
  ctx.strokeStyle = lg; ctx.lineWidth = 2.5;
  ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(200,150,255,0.6)';
  ctx.stroke(); ctx.shadowBlur = 0;

  // 두 오브 렌더
  for (const pos of positions) {
    // 대형 외곽 글로우 (3단계)
    for (const [radius, opacity] of [[120, 0.18], [75, 0.35], [40, 0.6]] as [number, number][]) {
      const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
      const col = pos.purple ? '192,132,252' : '251,113,133';
      g.addColorStop(0, `rgba(${col},${opacity})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
    // 코어
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
    ctx.shadowBlur = 30;
    ctx.shadowColor = pos.purple ? 'rgba(192,132,252,1)' : 'rgba(251,113,133,1)';
    ctx.fillStyle = pos.purple ? 'rgba(230,205,255,1)' : 'rgba(255,205,215,1)';
    ctx.fill(); ctx.shadowBlur = 0;
  }

  // 빛 소나기 파티클
  for (const p of s.particles) {
    p.x += p.vx + 0.15 * Math.sin(t * 0.8 + p.y * 0.01);
    p.y += p.vy;
    p.alpha += 0.008;
    if (p.y < -10 || p.alpha > 1.4) { p.x = rnd(0, w); p.y = h + 10; p.alpha = 0; }
    const a = Math.min(1, Math.sin(p.alpha * Math.PI * 0.72));
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.pink ? `rgba(255,100,150,${a})` : `rgba(180,130,255,${a})`;
    ctx.fillStyle   = p.pink ? `rgba(255,170,190,${a * 0.9})` : `rgba(210,180,255,${a * 0.9})`;
    ctx.fill(); ctx.shadowBlur = 0;
  }

  // 중앙 신비 글로우
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbitR * 1.6);
  cg.addColorStop(0, `rgba(160,80,220,${0.1 + 0.05 * Math.sin(t * 1.2)})`);
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cg; ctx.fillRect(0, 0, w, h);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. 커리어 — 두꺼운 빛줄기 폭포 + 번개 + 스파크
// ─────────────────────────────────────────────────────────────────────────────
function initCareer(w: number, h: number) {
  return {
    streaks: Array.from({ length: 40 }, () => ({
      x: rnd(0, w), y: rnd(-h, h),
      len: rnd(40, 140), speed: rnd(2, 6),
      alpha: rnd(0.3, 1), width: rnd(1, 3.5), blue: Math.random() > 0.35,
    })),
    sparks: Array.from({ length: 30 }, () => ({
      x: rnd(0, w), y: rnd(0, h),
      vx: rnd(-1.5, 1.5), vy: rnd(-3, -0.5),
      alpha: rnd(0, 1), size: rnd(2, 5),
    })),
    bolts: [] as any[],
    nextBolt: 1.5,
  };
}
function drawCareer(ctx: CanvasRenderingContext2D, w: number, h: number, s: any, t: number) {
  ctx.clearRect(0, 0, w, h);

  // 빛줄기
  for (const st of s.streaks) {
    st.y -= st.speed;
    if (st.y < -st.len) { st.y = h + rnd(0, h * 0.8); st.x = rnd(0, w); st.alpha = rnd(0.3, 1); }
    const col = st.blue ? '80,200,255' : '150,140,255';
    const g = ctx.createLinearGradient(st.x, st.y, st.x, st.y + st.len);
    g.addColorStop(0, `rgba(${col},${st.alpha})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(st.x, st.y + st.len);
    ctx.strokeStyle = g; ctx.lineWidth = st.width;
    ctx.shadowBlur = 16; ctx.shadowColor = `rgba(${col},${st.alpha * 0.8})`;
    ctx.stroke(); ctx.shadowBlur = 0;
  }

  // 번개 생성
  if (t > s.nextBolt) {
    s.nextBolt = t + rnd(1.2, 2.5);
    const bx = rnd(w * 0.1, w * 0.9);
    s.bolts.push({ x: bx, alpha: 1, segs: Array.from({ length: 8 }, (_, i) => ({ y: h * 0.05 + i * h * 0.1, dx: rnd(-30, 30) })) });
  }
  for (let i = s.bolts.length - 1; i >= 0; i--) {
    const b = s.bolts[i];
    b.alpha -= 0.045;
    if (b.alpha <= 0) { s.bolts.splice(i, 1); continue; }
    ctx.beginPath();
    ctx.moveTo(b.x, 0);
    let cx2 = b.x;
    for (const seg of b.segs) { cx2 += seg.dx; ctx.lineTo(cx2, seg.y); }
    ctx.strokeStyle = `rgba(150,220,255,${b.alpha})`;
    ctx.lineWidth = 2.5; ctx.shadowBlur = 25; ctx.shadowColor = `rgba(100,200,255,${b.alpha})`;
    ctx.stroke(); ctx.shadowBlur = 0;
  }

  // 스파크
  for (const p of s.sparks) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.alpha -= 0.012;
    if (p.alpha <= 0 || p.y > h + 10) { p.x = rnd(0, w); p.y = h; p.alpha = rnd(0.5, 1); p.vy = rnd(-3, -0.5); p.vx = rnd(-1.5, 1.5); }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.shadowBlur = 14; ctx.shadowColor = `rgba(80,200,255,${p.alpha})`;
    ctx.fillStyle = `rgba(160,230,255,${p.alpha})`;
    ctx.fill(); ctx.shadowBlur = 0;
  }

  // 상단 전기 글로우
  const tg = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  tg.addColorStop(0, `rgba(60,180,255,${0.1 + 0.05 * Math.sin(t * 2)})`);
  tg.addColorStop(1, 'rgba(60,180,255,0)');
  ctx.fillStyle = tg; ctx.fillRect(0, 0, w, h * 0.5);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. 재테크 — 대형 황금 파문 + 코인 + 빛기둥
// ─────────────────────────────────────────────────────────────────────────────
function initInvestment(w: number, h: number) {
  return {
    rings:    [] as any[],
    sparks:   Array.from({ length: 60 }, () => ({
      x: rnd(0, w), y: rnd(0, h),
      vx: rnd(-0.8, 0.8), vy: rnd(-1.5, -0.3),
      alpha: rnd(0, 1), size: rnd(1.5, 4),
    })),
    coins: Array.from({ length: 12 }, () => ({
      x: rnd(0, w), y: rnd(0, h),
      vy: rnd(-0.4, -0.1), angle: rnd(0, Math.PI * 2),
      spin: rnd(0.02, 0.06), alpha: rnd(0.3, 0.9), size: rnd(8, 18),
    })),
    nextRing: 0.2,
  };
}
function drawInvestment(ctx: CanvasRenderingContext2D, w: number, h: number, s: any, t: number) {
  ctx.clearRect(0, 0, w, h);

  // 파문
  if (t > s.nextRing) {
    s.nextRing = t + rnd(0.4, 0.9);
    s.rings.push({ r: 10, alpha: 0.9, speed: rnd(1.2, 2.8), lineW: rnd(1.5, 3.5) });
  }
  for (let i = s.rings.length - 1; i >= 0; i--) {
    const ring = s.rings[i];
    ring.r += ring.speed; ring.alpha -= 0.006;
    if (ring.alpha <= 0 || ring.r > Math.max(w, h) * 0.9) { s.rings.splice(i, 1); continue; }
    ctx.beginPath(); ctx.arc(w / 2, h / 2, ring.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,210,50,${ring.alpha})`;
    ctx.lineWidth = ring.lineW;
    ctx.shadowBlur = 20; ctx.shadowColor = `rgba(255,190,0,${ring.alpha * 0.7})`;
    ctx.stroke(); ctx.shadowBlur = 0;
  }

  // 코인
  for (const c of s.coins) {
    c.y += c.vy; c.angle += c.spin;
    if (c.y < -c.size * 2) { c.y = h + c.size * 2; c.x = rnd(0, w); c.alpha = rnd(0.3, 0.9); }
    const scaleX = Math.abs(Math.cos(c.angle));
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(scaleX, 1);
    ctx.beginPath(); ctx.arc(0, 0, c.size, 0, Math.PI * 2);
    const cg = ctx.createRadialGradient(-c.size * 0.3, -c.size * 0.3, 0, 0, 0, c.size);
    cg.addColorStop(0, `rgba(255,240,100,${c.alpha})`);
    cg.addColorStop(0.6, `rgba(212,175,55,${c.alpha})`);
    cg.addColorStop(1, `rgba(160,120,20,${c.alpha})`);
    ctx.fillStyle = cg;
    ctx.shadowBlur = 18; ctx.shadowColor = `rgba(255,200,0,${c.alpha * 0.7})`;
    ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
  }

  // 황금 반짝이
  for (const p of s.sparks) {
    p.x += p.vx; p.y += p.vy; p.alpha -= 0.005;
    if (p.alpha <= 0 || p.y < 0) { p.x = rnd(0, w); p.y = rnd(h * 0.4, h); p.alpha = rnd(0.4, 1); p.vy = rnd(-1.5, -0.3); }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.shadowBlur = 10; ctx.shadowColor = `rgba(255,200,0,${p.alpha})`;
    ctx.fillStyle = `rgba(255,225,80,${p.alpha})`;
    ctx.fill(); ctx.shadowBlur = 0;
  }

  // 중앙 황금 태양 글로우
  const sun = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.55);
  sun.addColorStop(0, `rgba(255,210,50,${0.14 + 0.07 * Math.sin(t * 1.1)})`);
  sun.addColorStop(0.5, `rgba(200,150,20,${0.06 + 0.03 * Math.sin(t * 1.1)})`);
  sun.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sun; ctx.fillRect(0, 0, w, h);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. 속궁합 — 대형 꽃잎 폭풍 + 하트 + 촛불
// ─────────────────────────────────────────────────────────────────────────────
function initSecret(w: number, h: number) {
  return {
    petals: Array.from({ length: 55 }, () => ({
      x: rnd(0, w), y: rnd(-h, h),
      vy: rnd(0.6, 2.0), vx: rnd(-0.8, 0.8),
      angle: rnd(0, Math.PI * 2), spin: rnd(-0.055, 0.055),
      alpha: rnd(0.4, 0.95), size: rnd(6, 18),
    })),
    hearts: Array.from({ length: 10 }, () => ({
      x: rnd(0, w), y: rnd(0, h),
      vy: rnd(-0.8, -0.3), alpha: rnd(0, 1),
      size: rnd(10, 22), phase: rnd(0, Math.PI * 2),
    })),
  };
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.3);
  ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size, x, y + size * 1.1);
  ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.6, x + size, y + size * 0.3);
  ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
  ctx.closePath();
}

function drawSecret(ctx: CanvasRenderingContext2D, w: number, h: number, s: any, t: number) {
  ctx.clearRect(0, 0, w, h);

  // 대형 촛불 글로우
  const flicker = 0.22 + 0.1 * Math.sin(t * 7.2) + 0.05 * Math.cos(t * 14.8) + 0.03 * Math.sin(t * 23);
  for (const [radius, alpha] of [[w * 0.65, flicker * 0.5], [w * 0.4, flicker * 0.8], [w * 0.2, flicker]] as [number, number][]) {
    const cg = ctx.createRadialGradient(w / 2, h * 0.88, 0, w / 2, h * 0.88, radius);
    cg.addColorStop(0, `rgba(255,130,60,${alpha})`);
    cg.addColorStop(0.4, `rgba(200,50,30,${alpha * 0.5})`);
    cg.addColorStop(1, 'rgba(100,0,20,0)');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, w, h);
  }

  // 꽃잎
  for (const p of s.petals) {
    p.x += p.vx + 0.4 * Math.sin(t * 0.45 + p.x * 0.014);
    p.y += p.vy; p.angle += p.spin;
    if (p.y > h + 25) { p.y = rnd(-40, -10); p.x = rnd(0, w); p.alpha = rnd(0.4, 0.95); }
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.scale(1, 0.52);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, Math.PI * 2);
    ctx.shadowBlur = 12; ctx.shadowColor = `rgba(255,80,130,${p.alpha * 0.6})`;
    ctx.fillStyle = `rgba(240,80,115,${p.alpha})`;
    ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
  }

  // 하트
  for (const h2 of s.hearts) {
    h2.y += h2.vy; h2.alpha += 0.006;
    if (h2.y < -30 || h2.alpha > 1.3) { h2.x = rnd(0, w); h2.y = h; h2.alpha = 0; }
    const a = Math.min(1, Math.sin(h2.alpha * Math.PI * 0.76));
    ctx.save();
    ctx.translate(h2.x, h2.y);
    ctx.scale(1 + 0.1 * Math.sin(t * 2 + h2.phase), 1 + 0.1 * Math.sin(t * 2 + h2.phase));
    ctx.translate(-h2.x, -h2.y);
    drawHeart(ctx, h2.x - h2.size / 2, h2.y - h2.size / 2, h2.size / 2);
    ctx.shadowBlur = 16; ctx.shadowColor = `rgba(255,80,130,${a})`;
    ctx.fillStyle = `rgba(255,120,160,${a * 0.85})`;
    ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Canvas 오버레이 컴포넌트 ────────────────────────────────────────────────

function ParticleOverlay({ id }: { id: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let state: any = null;
    let time = 0;
    let last = performance.now();
    let rafId: number;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now; time += dt;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w > 0 && h > 0) {
        if (!state || canvas.width !== w || canvas.height !== h) {
          canvas.width = w; canvas.height = h; time = 0;
          switch (id) {
            case 'new-year':   state = initNewYear(w, h);   break;
            case 'reunion':    state = initReunion(w, h);   break;
            case 'career':     state = initCareer(w, h);    break;
            case 'investment': state = initInvestment(w, h); break;
            case 'secret':     state = initSecret(w, h);    break;
          }
        }
        const ctx = canvas.getContext('2d');
        if (ctx && state) {
          switch (id) {
            case 'new-year':   drawNewYear(ctx, w, h, state, time);   break;
            case 'reunion':    drawReunion(ctx, w, h, state, time);   break;
            case 'career':     drawCareer(ctx, w, h, state, time);    break;
            case 'investment': drawInvestment(ctx, w, h, state, time); break;
            case 'secret':     drawSecret(ctx, w, h, state, time);    break;
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [id]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

// ─── 캐러셀 ─────────────────────────────────────────────────────────────────

export function HeroCarousel() {
  const [activeTab, setActiveTab] = useState(0);
  const [current, setCurrent]     = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSize = useCallback(() => {
    if (containerRef.current) setCardWidth(containerRef.current.offsetWidth - PEEK * 2);
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % SLIDES.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const translateX = PEEK - current * (cardWidth + GAP);

  return (
    <section className="bg-canvas pb-8">

      {/* 탭 */}
      <div className="border-b border-hairline">
        <div className="container">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab, i) =>
              tab.href ? (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={cn(
                    'px-3 py-3.5 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                    activeTab === i ? 'border-gold text-gold' : 'border-transparent text-ink/55 hover:text-ink'
                  )}
                  onClick={() => setActiveTab(i)}
                >
                  {tab.label}
                </Link>
              ) : (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    'px-3 py-3.5 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                    activeTab === i ? 'border-gold text-gold' : 'border-transparent text-ink/55 hover:text-ink'
                  )}
                >
                  {tab.label}
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      {/* 슬라이더 */}
      <div ref={containerRef} className="overflow-hidden mt-5">
        <div className="flex" style={{ gap: `${GAP}px`, transform: `translateX(${translateX}px)`, transition: 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)', willChange: 'transform' }}>
          {SLIDES.map((slide, i) => (
            <Link key={slide.id} href={slide.href}
              className={cn('relative flex-shrink-0 rounded-2xl overflow-hidden block transition-all duration-500', i === current ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.97]')}
              style={{ width: cardWidth > 0 ? `${cardWidth}px` : `calc(100% - ${PEEK * 2}px)`, aspectRatio: '4 / 3', maxHeight: '520px' }}>

              {/* 원본 사진 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image} alt={slide.category} className="absolute inset-0 w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />

              {/* 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-deep/45 via-transparent to-transparent" />

              {/* 파티클 오버레이 */}
              <ParticleOverlay id={slide.id} />

              {/* 텍스트 */}
              <div className="absolute bottom-0 left-0 p-5 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-gradient px-3 py-1 text-xs font-semibold text-white shadow-purple-glow">
                    ✦ {slide.category}
                  </span>
                  {slide.adult && (
                    <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-red-900/80 text-red-300 border border-red-600/50">19+</span>
                  )}
                </div>
                <h2 className="text-[1.5rem] md:text-[2rem] font-bold text-white whitespace-pre-line leading-[1.2] mb-2 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-sm text-white/70 leading-relaxed max-w-xs whitespace-pre-line">{slide.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 도트 */}
      <div className="flex justify-center items-center gap-2 mt-5">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`슬라이드 ${i + 1}`}
            className={cn('rounded-full transition-all duration-300', i === current ? 'w-8 h-[5px] bg-purple-rich shadow-purple-glow' : 'w-[5px] h-[5px] bg-mute hover:bg-body')} />
        ))}
      </div>

    </section>
  );
}
