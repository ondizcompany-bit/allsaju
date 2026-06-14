'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// ════════════════════════════════════════
//  TYPES
// ════════════════════════════════════════
type Screen = 'home' | 'form' | 'package' | 'tarot' | 'result';
type Tier   = 'single' | 'basic' | 'premium';

interface PersonInfo {
  name: string;
  gender: string;
  birthDate: string;
  calendarType: 'solar' | 'lunar';
  birthTime: string;
}

interface Category {
  id: string;
  symbol: string;
  title: string;
  subtitle: string;
  needsPartner: boolean;
  adult: boolean;
  accentColor: string;
  gradient: string;
  packages: Record<Tier, { price: number; original: number; popular?: boolean }>;
}

// ════════════════════════════════════════
//  DATA
// ════════════════════════════════════════
const CATEGORIES: Category[] = [
  {
    id: 'new-year',
    symbol: '辛',
    title: '2026 병오년 신년 총운',
    subtitle: '새해 운기 · 월별 흐름 · 주의 시기 완전 분석',
    needsPartner: false,
    adult: false,
    accentColor: '#a78bfa',
    gradient: 'linear-gradient(145deg,#120826 0%,#3b0764 60%,#1e1040 100%)',
    packages: {
      single:  { price: 24900, original: 49800 },
      basic:   { price: 34900, original: 69800, popular: true },
      premium: { price: 44900, original: 89800 },
    },
  },
  {
    id: 'reunion',
    symbol: '緣',
    title: '헤어진 그 사람과의 재회 사주',
    subtitle: '다시 만날 수 있는 시기와 가능성을 짚어드립니다',
    needsPartner: true,
    adult: false,
    accentColor: '#c084fc',
    gradient: 'linear-gradient(145deg,#100720 0%,#581c87 60%,#2e1065 100%)',
    packages: {
      single:  { price: 24900, original: 49800 },
      basic:   { price: 39900, original: 79800, popular: true },
      premium: { price: 49900, original: 99800 },
    },
  },
  {
    id: 'career',
    symbol: '命',
    title: '취업·이직·승진 커리어 타이밍',
    subtitle: '내 사주가 말하는 가장 완벽한 커리어 전환 시기',
    needsPartner: false,
    adult: false,
    accentColor: '#818cf8',
    gradient: 'linear-gradient(145deg,#070b1e 0%,#1e1b4b 60%,#312e81 100%)',
    packages: {
      single:  { price: 24900, original: 49800 },
      basic:   { price: 34900, original: 69800, popular: true },
      premium: { price: 44900, original: 89800 },
    },
  },
  {
    id: 'investment',
    symbol: '財',
    title: '내 팔자에 맞는 재테크 성향',
    subtitle: '사주팔자로 알아보는 나만의 최적 재테크 전략',
    needsPartner: false,
    adult: false,
    accentColor: '#93c5fd',
    gradient: 'linear-gradient(145deg,#050e1e 0%,#1e3a5f 60%,#1e1b4b 100%)',
    packages: {
      single:  { price: 24900, original: 49800 },
      basic:   { price: 39900, original: 79800, popular: true },
      premium: { price: 49900, original: 99800 },
    },
  },
  {
    id: 'secret',
    symbol: '艶',
    title: '29금 은밀한 속궁합 & 밤의 성향',
    subtitle: '19세 이상 · 두 사람의 깊은 궁합을 솔직하게',
    needsPartner: true,
    adult: true,
    accentColor: '#f9a8d4',
    gradient: 'linear-gradient(145deg,#180710 0%,#831843 60%,#4a0d2a 100%)',
    packages: {
      single:  { price: 29900, original: 59800 },
      basic:   { price: 39900, original: 79800, popular: true },
      premium: { price: 49900, original: 99800 },
    },
  },
];

const TIER_META: Record<Tier, { label: string; tags: string[]; desc: string }> = {
  single: {
    label: '단품',
    tags: ['사주 기본 분석', '월별 운세', '핵심 조언'],
    desc: '정통 사주팔자 기반의 핵심 운세 풀이',
  },
  basic: {
    label: '베이직',
    tags: ['사주 기본 분석', '월별 운세', '자미두수 심층', '10년 대운', '핵심 조언'],
    desc: '사주 + 동양 점성술 자미두수 결합 완전 분석',
  },
  premium: {
    label: '종합',
    tags: ['사주 기본 분석', '월별 운세', '자미두수 심층', '10년 대운', '인터랙티브 타로', '종합 조언'],
    desc: '사주 + 자미두수 + 유저 선택 타로 카드 완전체',
  },
};

const TAROT_CARDS = [
  {
    symbol: '🌕',
    name: '달 · The Moon',
    keyword: '직관 · 무의식 · 숨겨진 진실',
    advice:
      '지금 당신의 감정이 가리키는 방향을 믿어 보세요. 논리보다 직관이 먼저 알고 있는 것이 있습니다. 감추어졌던 것들이 서서히 빛 속으로 드러나는 시기입니다.',
  },
  {
    symbol: '⭐',
    name: '별 · The Star',
    keyword: '희망 · 회복 · 새로운 가능성',
    advice:
      '힘든 시간이 지나고 새벽이 밝아오는 때입니다. 당신이 마음속 깊이 품어온 소망을 포기하지 마세요. 우주는 언제나 당신의 편입니다.',
  },
  {
    symbol: '🌍',
    name: '세계 · The World',
    keyword: '완성 · 성취 · 새로운 시작',
    advice:
      '하나의 챕터가 완전히 마무리됩니다. 지나온 길을 돌아보며 당신이 얼마나 성장했는지 느껴보세요. 더 크고 새로운 시작이 바로 코앞에 있습니다.',
  },
];

// ════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════
const fmt = (n: number) => n.toLocaleString('ko-KR') + '원';
const disc = (orig: number, sale: number) => Math.round((1 - sale / orig) * 100);

// ════════════════════════════════════════
//  SHARED UI
// ════════════════════════════════════════
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-purple-light transition-colors mb-8"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      이전으로
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-[0.15em] text-purple-bright uppercase mb-4">
      {children}
    </h2>
  );
}

// ════════════════════════════════════════
//  SCREEN 1 — HOME
// ════════════════════════════════════════
function HomeScreen({ onSelect }: { onSelect: (c: Category) => void }) {
  return (
    <div className="container max-w-2xl py-12 md:py-20">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-purple-bright uppercase mb-3">
          명리사주 · 프리미엄 운세
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
          어떤 운세가<br />궁금하신가요?
        </h1>
        <p className="text-sm text-body">사주 · 자미두수 · 타로를 결합한 정밀 분석</p>
      </div>

      {/* Category Cards */}
      <div className="flex flex-col gap-3">
        {CATEGORIES.map((cat, idx) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className="group relative w-full text-left rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-purple-rich/40 hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: cat.gradient }}
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(139,92,246,0.07)' }} />

            <div className="relative flex items-center gap-5 px-6 py-5">
              {/* Big CJK symbol */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black select-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: cat.accentColor,
                  textShadow: `0 0 20px ${cat.accentColor}`,
                  fontFamily: 'serif',
                }}
              >
                {cat.symbol}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-base font-semibold text-white truncate">{cat.title}</p>
                  {cat.adult && (
                    <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold bg-red-900/60 text-red-300 border border-red-700/40">
                      19+
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50">{cat.subtitle}</p>
              </div>

              {/* Price + arrow */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-white/40">부터</p>
                <p className="text-sm font-semibold" style={{ color: cat.accentColor }}>
                  {fmt(cat.packages.single.price)}
                </p>
              </div>
              <svg className="flex-shrink-0 text-white/20 group-hover:text-purple-bright transition-colors" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-mute">
        모든 분석은 AI + 정통 명리학을 결합하여 제공됩니다
      </p>
    </div>
  );
}

// ════════════════════════════════════════
//  SCREEN 2 — FORM
// ════════════════════════════════════════
function PersonFields({
  prefix,
  label,
  values,
  onChange,
}: {
  prefix: string;
  label: string;
  values: Partial<PersonInfo>;
  onChange: (k: keyof PersonInfo, v: string) => void;
}) {
  const inputCls =
    'w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 focus:ring-1 focus:ring-purple-rich/30 transition placeholder:text-mute';
  const selectCls = inputCls + ' appearance-none cursor-pointer';

  return (
    <div className="rounded-2xl border border-hairline bg-surface-soft/50 p-5 space-y-4">
      <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase">{label}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-body mb-1.5">이름</label>
          <input
            className={inputCls}
            placeholder="홍길동"
            value={values.name ?? ''}
            onChange={e => onChange('name', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-body mb-1.5">성별</label>
          <select
            className={selectCls}
            value={values.gender ?? ''}
            onChange={e => onChange('gender', e.target.value)}
          >
            <option value="">선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-body mb-1.5">생년월일</label>
        <div className="flex gap-2">
          <input
            type="date"
            className={cn(inputCls, 'flex-1')}
            value={values.birthDate ?? ''}
            onChange={e => onChange('birthDate', e.target.value)}
          />
          <select
            className={cn(selectCls, 'w-24')}
            value={values.calendarType ?? 'solar'}
            onChange={e => onChange('calendarType', e.target.value)}
          >
            <option value="solar">양력</option>
            <option value="lunar">음력</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-body mb-1.5">출생 시간</label>
        <select
          className={selectCls}
          value={values.birthTime ?? ''}
          onChange={e => onChange('birthTime', e.target.value)}
        >
          <option value="">모름 / 선택 안 함</option>
          {[
            ['자시', '23:00–01:00'],['축시','01:00–03:00'],['인시','03:00–05:00'],
            ['묘시','05:00–07:00'],['진시','07:00–09:00'],['사시','09:00–11:00'],
            ['오시','11:00–13:00'],['미시','13:00–15:00'],['신시','15:00–17:00'],
            ['유시','17:00–19:00'],['술시','19:00–21:00'],['해시','21:00–23:00'],
          ].map(([n, t]) => (
            <option key={n} value={n}>{n} ({t})</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function FormScreen({
  category,
  onSubmit,
  onBack,
}: {
  category: Category;
  onSubmit: (info: { me: PersonInfo; partner?: PersonInfo }) => void;
  onBack: () => void;
}) {
  const [me, setMe] = useState<Partial<PersonInfo>>({ calendarType: 'solar' });
  const [partner, setPartner] = useState<Partial<PersonInfo>>({ calendarType: 'solar' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 결제 후 돌아올 때 사용할 수 있도록 저장
    sessionStorage.setItem('saju_birth_me', JSON.stringify(me));
    if (category.needsPartner) sessionStorage.setItem('saju_birth_partner', JSON.stringify(partner));
    onSubmit({ me: me as PersonInfo, partner: category.needsPartner ? (partner as PersonInfo) : undefined });
  };

  const updateMe = (k: keyof PersonInfo, v: string) => setMe(p => ({ ...p, [k]: v }));
  const updatePartner = (k: keyof PersonInfo, v: string) => setPartner(p => ({ ...p, [k]: v }));

  return (
    <div className="container max-w-xl py-12">
      <BackButton onClick={onBack} />

      {/* Category badge */}
      <div
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-6"
        style={{
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.3)',
          color: category.accentColor,
        }}
      >
        <span className="font-serif">{category.symbol}</span>
        {category.title}
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">사주 정보 입력</h1>
      <p className="text-sm text-body mb-8">정확한 분석을 위해 정확한 정보를 입력해 주세요.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PersonFields prefix="me" label="나의 정보" values={me} onChange={updateMe} />

        {/* 파트너 정보: 재회/속궁합만 */}
        {category.needsPartner && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-hairline" />
              <span className="text-xs text-mute">+ 상대방 정보</span>
              <div className="flex-1 h-px bg-hairline" />
            </div>
            <PersonFields prefix="partner" label="상대방 정보" values={partner} onChange={updatePartner} />
          </div>
        )}

        <button
          type="submit"
          className="w-full mt-6 h-12 rounded-full bg-purple-gradient text-white font-semibold text-sm shadow-purple-glow hover:opacity-90 active:scale-[0.98] transition-all"
        >
          패키지 선택하기 →
        </button>
      </form>
    </div>
  );
}

// ════════════════════════════════════════
//  SCREEN 3 — PACKAGE SELECT
// ════════════════════════════════════════
function PackageScreen({
  category,
  onSelect,
  onBack,
}: {
  category: Category;
  onSelect: (t: Tier) => void;
  onBack: () => void;
}) {
  const tiers: Tier[] = ['single', 'basic', 'premium'];

  return (
    <div className="container max-w-xl py-12">
      <BackButton onClick={onBack} />

      <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2">
        패키지 선택
      </p>
      <h1 className="text-2xl font-bold text-white mb-2">어느 깊이까지<br />알아보시겠어요?</h1>
      <p className="text-sm text-body mb-8">{category.title}</p>

      <div className="flex flex-col gap-4">
        {tiers.map(tier => {
          const pkg  = category.packages[tier];
          const meta = TIER_META[tier];
          const isPop = pkg.popular;
          const dr   = disc(pkg.original, pkg.price);

          return (
            <button
              key={tier}
              onClick={() => {
                const params = new URLSearchParams({
                  cat:    category.id,
                  tier,
                  amount: String(pkg.price),
                  name:   category.title,
                });
                window.location.href = `/checkout?${params.toString()}`;
              }}
              className={cn(
                'relative w-full text-left rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]',
                isPop
                  ? 'border-purple-rich/60 bg-[rgba(88,28,135,0.2)]'
                  : 'border-hairline bg-surface-soft/50 hover:border-purple-rich/30'
              )}
            >
              {isPop && (
                <span className="absolute -top-3 left-5 rounded-full bg-purple-gradient px-3 py-0.5 text-[11px] font-bold text-white shadow-purple-glow">
                  ✦ 인기
                </span>
              )}

              <div className="flex items-start justify-between gap-4">
                {/* Left: name + desc + tags */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-base font-bold mb-0.5', isPop ? 'text-purple-light' : 'text-ink')}>
                    {meta.label}
                  </p>
                  <p className="text-xs text-body mb-3">{meta.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {meta.tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                        style={{
                          background: isPop ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isPop ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: isPop ? '#c4b5fd' : '#9ca3af',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: price */}
                <div className="flex-shrink-0 text-right">
                  <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold bg-red-900/50 text-red-300 mb-1">
                    {dr}% OFF
                  </span>
                  <p className="text-xs text-mute line-through">{fmt(pkg.original)}</p>
                  <p className={cn('text-xl font-black', isPop ? 'text-purple-light' : 'text-ink')}>
                    {fmt(pkg.price)}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className={cn(
                'mt-4 flex items-center justify-end gap-1.5 text-xs font-medium',
                isPop ? 'text-purple-bright' : 'text-mute'
              )}>
                {isPop ? '이 패키지로 시작하기' : '선택하기'}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-mute">
        결제는 다음 단계에서 진행됩니다 · 토스페이먼츠 안전 결제
      </p>
    </div>
  );
}

// ════════════════════════════════════════
//  SCREEN 4 — TAROT
// ════════════════════════════════════════
function TarotScreen({
  onSelect,
  onBack,
}: {
  onSelect: (i: number) => void;
  onBack: () => void;
}) {
  const [flipped, setFlipped]     = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [visible, setVisible]     = useState(false);

  useEffect(() => {
    // stagger card entry
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handlePick = (i: number) => {
    if (flipped !== null) return;
    setFlipped(i);
    setTimeout(() => setRevealed(true), 800);
  };

  const handleConfirm = () => {
    if (flipped !== null) onSelect(flipped);
  };

  const card = flipped !== null ? TAROT_CARDS[flipped] : null;

  return (
    <div className="container max-w-xl py-12 text-center">
      {!revealed && <BackButton onClick={onBack} />}

      <p className="text-xs font-semibold tracking-[0.2em] text-purple-bright uppercase mb-3">
        인터랙티브 타로
      </p>
      <h1 className="text-2xl font-bold text-white mb-2">
        {revealed ? '카드가 말을 걸어옵니다' : '하나의 카드를 선택하세요'}
      </h1>
      <p className="text-sm text-body mb-12">
        {revealed ? '당신이 선택한 카드입니다' : '마음이 이끄는 카드를 직관적으로 고르세요'}
      </p>

      {/* Cards */}
      <div className="flex justify-center items-center gap-4 mb-12">
        {TAROT_CARDS.map((tc, i) => {
          const isFlipped  = flipped === i;
          const isDimmed   = flipped !== null && flipped !== i;
          const delay      = i * 150;

          return (
            <div
              key={i}
              className={cn(
                'transition-all duration-700',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                isDimmed && 'opacity-20 scale-95 pointer-events-none',
              )}
              style={{
                transitionDelay: `${delay}ms`,
                perspective: '1200px',
                cursor: flipped === null ? 'pointer' : 'default',
              }}
              onClick={() => handlePick(i)}
            >
              <div
                style={{
                  width: '9rem',
                  height: '14rem',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* ── Card Back ── */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(160deg,#1a0a3e 0%,#0d0520 100%)',
                  } as React.CSSProperties}
                  className={cn(
                    'absolute inset-0 rounded-2xl flex flex-col items-center justify-center overflow-hidden',
                    'border border-purple-rich/30',
                    flipped === null && 'hover:border-purple-bright/60 hover:shadow-purple-glow',
                    'transition-shadow duration-300'
                  )}
                >
                  {/* Pattern */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.4) 0%, transparent 60%)',
                  }} />
                  <div className="text-5xl text-purple-deep/60 select-none" style={{ textShadow: '0 0 30px rgba(139,92,246,0.5)' }}>✦</div>
                  <div className="mt-3 text-[10px] tracking-[0.3em] text-purple-bright/40 uppercase">Tarot</div>
                  {/* Corner ornaments */}
                  {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map(pos => (
                    <span key={pos} className={`absolute ${pos} text-purple-bright/20 text-xs`}>✧</span>
                  ))}
                </div>

                {/* ── Card Front ── */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(160deg,#2e0a5e 0%,#1a0a3e 50%,#0a0520 100%)',
                    border: '1px solid rgba(167,139,250,0.5)',
                    boxShadow: '0 0 30px rgba(124,58,237,0.4)',
                  } as React.CSSProperties}
                  className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-4 overflow-hidden"
                >
                  <div className="text-5xl mb-3">{tc.symbol}</div>
                  <p className="text-xs font-bold text-purple-light text-center leading-snug">{tc.name}</p>
                  <div className="mt-2 w-8 h-px bg-purple-rich/50" />
                  <p className="mt-2 text-[10px] text-purple-bright/70 text-center leading-snug">{tc.keyword}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revealed advice */}
      {revealed && card && (
        <div
          className="rounded-2xl p-6 text-left mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{
            background: 'linear-gradient(135deg,rgba(76,29,149,0.3) 0%,rgba(30,10,80,0.5) 100%)',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-3">
            카드의 메시지
          </p>
          <p className="text-sm text-white/85 leading-7">{card.advice}</p>
        </div>
      )}

      {revealed && (
        <button
          onClick={handleConfirm}
          className="w-full h-12 rounded-full bg-purple-gradient text-white font-semibold text-sm shadow-purple-glow hover:opacity-90 active:scale-[0.98] transition-all animate-in fade-in duration-700"
        >
          종합 결과지 확인하기 →
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════
//  SCREEN 5 — RESULT
// ════════════════════════════════════════
const MOCK_SAJU = {
  overview: '2026년 병오년은 당신에게 전환점이 되는 해입니다. 상반기(1~6월)는 내실을 다지는 시기로, 조급하게 움직이기보다 기반을 탄탄히 하는 데 집중하세요. 7월부터는 그동안 쌓아온 것들이 빛을 발하며 기회의 문이 열립니다.',
  monthly: [
    { m: '1–2월', desc: '새로운 인연이 스며드는 시기. 섣불리 결정하지 말고 관찰하세요.' },
    { m: '3–4월', desc: '재물운이 상승합니다. 투자보다 저축이 유리한 시기.' },
    { m: '5–6월', desc: '건강에 주의가 필요합니다. 과로를 피하고 휴식을 챙기세요.' },
    { m: '7–8월', desc: '커리어의 전환점. 큰 기회가 찾아오니 망설이지 마세요.' },
    { m: '9–10월', desc: '인간관계가 풍성해지는 시기. 신뢰할 수 있는 사람과 연대하세요.' },
    { m: '11–12월', desc: '한 해를 마무리하며 내년을 위한 씨앗을 뿌리는 시기.' },
  ],
  caution: '5월과 9월은 충(沖)의 기운이 강합니다. 중요한 계약이나 결정은 이 시기를 피하는 것이 좋습니다.',
};

const MOCK_JAMI = {
  core: '당신의 명반에서 자미성(紫微星)이 재백궁(財帛宮)에 위치합니다. 이는 재물과 관련된 능력이 탁월하며, 타고난 경영 감각이 있음을 뜻합니다.',
  decade: '현재의 대운(2024~2033)은 문창성(文昌星)과 천량성(天梁星)의 조합입니다. 학문·연구·전문직 분야에서 두각을 나타내기 좋은 10년입니다.',
  strength: '판단력이 뛰어나고 위기 상황에서도 냉철하게 대처합니다. 주변 사람들로부터 신뢰를 얻는 자질이 있습니다.',
  weakness: '완벽주의 성향으로 인해 시작을 너무 늦추는 경향이 있습니다. 80%의 준비가 되었을 때 행동하는 연습이 필요합니다.',
};

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface-soft/50 p-6 mb-4">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}

function ResultScreen({
  category,
  tier,
  tarotCard,
  onReset,
}: {
  category: Category;
  tier: Tier;
  tarotCard: typeof TAROT_CARDS[0] | null;
  onReset: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'saju' | 'jami' | 'tarot'>('saju');
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const hasTarot = tier === 'premium' && tarotCard;
  const hasJami  = tier === 'basic' || tier === 'premium';

  useEffect(() => {
    const raw = sessionStorage.getItem('saju_birth_me');
    if (!raw) { setApiLoading(false); return; }
    const me = JSON.parse(raw) as Partial<PersonInfo>;
    if (!me.birthDate || !me.gender) { setApiLoading(false); return; }
    const [y, m, d] = (me.birthDate as string).split('-');
    const HOUR_MAP: Record<string, string> = {
      '자시': '0', '축시': '2', '인시': '4', '묘시': '6', '진시': '8', '사시': '10',
      '오시': '12', '미시': '14', '신시': '16', '유시': '18', '술시': '20', '해시': '22',
    };
    const birthInfo = {
      birthYear: y, birthMonth: String(Number(m)), birthDay: String(Number(d)),
      birthHour: me.birthTime ? HOUR_MAP[me.birthTime] : undefined,
      calendarType: me.calendarType === 'lunar' ? '음력' : '양력' as '양력' | '음력',
      gender: me.gender as 'male' | 'female',
    };
    fetch('/api/generate-manseryeok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthInfo }),
    })
      .then(r => r.json())
      .then(data => { if (data.status === 'success') setApiResult(data.manseryeok); })
      .catch(() => {})
      .finally(() => setApiLoading(false));
  }, []);

  if (apiLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-purple-rich/30 border-t-purple-rich animate-spin" />
        <p className="text-sm text-body">사주를 분석하고 있어요...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'saju' as const,  label: '사주 분석', always: true },
    { id: 'jami' as const,  label: '자미두수',  always: false, enabled: hasJami },
    { id: 'tarot' as const, label: '타로 조언',  always: false, enabled: !!hasTarot },
  ].filter(t => t.always || t.enabled);

  return (
    <div className="container max-w-2xl py-12">
      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-8 relative overflow-hidden"
        style={{ background: category.gradient }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
              style={{ background: 'rgba(255,255,255,0.15)', color: category.accentColor }}
            >
              {TIER_META[tier].label}
            </span>
            <span className="text-xs text-white/50">{category.title}</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">종합 분석 결과지</h1>
          <p className="text-xs text-white/50">사주팔자 + {hasJami ? '자미두수 ' : ''}{hasTarot ? '+ 타로 조언 ' : ''}완전 분석</p>
        </div>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-1 rounded-xl bg-surface-soft border border-hairline p-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-purple-gradient text-white shadow-purple-glow'
                  : 'text-mute hover:text-ink'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── 사주 탭 ── */}
      {activeTab === 'saju' && (
        <div className="animate-in fade-in duration-300">
          {apiResult ? (
            <ResultSection title="사주 명식 분석">
              <pre className="text-xs text-white/80 leading-6 whitespace-pre-wrap font-sans">{apiResult}</pre>
            </ResultSection>
          ) : (
            <>
              <ResultSection title="전반적 흐름">
                <p className="text-sm text-white/80 leading-7">{MOCK_SAJU.overview}</p>
              </ResultSection>
              <ResultSection title="월별 운의 흐름">
                <div className="grid grid-cols-2 gap-2">
                  {MOCK_SAJU.monthly.map(({ m, desc }) => (
                    <div key={m} className="rounded-xl bg-canvas/60 border border-hairline p-3">
                      <p className="text-[11px] font-bold text-purple-bright mb-1">{m}</p>
                      <p className="text-xs text-body leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </ResultSection>
              <ResultSection title="⚠️ 주의 시기">
                <p className="text-sm text-white/80 leading-7">{MOCK_SAJU.caution}</p>
              </ResultSection>
            </>
          )}
        </div>
      )}

      {/* ── 자미두수 탭 ── */}
      {activeTab === 'jami' && hasJami && (
        <div className="animate-in fade-in duration-300">
          <ResultSection title="명반 핵심 분석">
            <p className="text-sm text-white/80 leading-7">{MOCK_JAMI.core}</p>
          </ResultSection>
          <ResultSection title="현재 10년 대운">
            <p className="text-sm text-white/80 leading-7">{MOCK_JAMI.decade}</p>
          </ResultSection>
          <div className="grid grid-cols-2 gap-4">
            <ResultSection title="강점">
              <p className="text-sm text-white/80 leading-7">{MOCK_JAMI.strength}</p>
            </ResultSection>
            <ResultSection title="보완점">
              <p className="text-sm text-white/80 leading-7">{MOCK_JAMI.weakness}</p>
            </ResultSection>
          </div>
        </div>
      )}

      {/* ── 타로 탭 ── */}
      {activeTab === 'tarot' && hasTarot && tarotCard && (
        <div className="animate-in fade-in duration-300">
          <div
            className="rounded-2xl p-6 mb-4 text-center"
            style={{ background: 'linear-gradient(135deg,rgba(76,29,149,0.35) 0%,rgba(30,10,80,0.6) 100%)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <div className="text-5xl mb-3">{tarotCard.symbol}</div>
            <p className="text-base font-bold text-purple-light mb-1">{tarotCard.name}</p>
            <p className="text-xs text-purple-bright/70">{tarotCard.keyword}</p>
          </div>
          <ResultSection title="카드의 메시지">
            <p className="text-sm text-white/80 leading-7">{tarotCard.advice}</p>
          </ResultSection>
          <ResultSection title="종합 조언">
            <p className="text-sm text-white/80 leading-7">
              당신의 사주와 자미두수, 그리고 타로 카드가 모두 같은 방향을 가리키고 있습니다.
              지금 이 순간이 인생의 중요한 전환점임을 잊지 마세요.
              내면의 목소리에 귀를 기울이고, 두려움 대신 가능성에 집중하세요.
              우주는 당신의 용기 있는 첫 걸음을 기다리고 있습니다.
            </p>
          </ResultSection>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={onReset}
          className="w-full h-12 rounded-full border border-purple-rich/40 text-purple-light font-semibold text-sm hover:bg-purple-rich/10 transition-all"
        >
          다른 운세 보러 가기
        </button>
        <p className="text-center text-xs text-mute">
          결과지는 결제 완료 후 이메일로도 발송됩니다
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
//  ROOT PAGE
// ════════════════════════════════════════
export default function StartPage() {
  const [screen, setScreen]     = useState<Screen>('home');
  const [category, setCategory] = useState<Category | null>(null);
  const [tier, setTier]         = useState<Tier | null>(null);
  const [tarotIdx, setTarotIdx] = useState<number | null>(null);
  const initialized = useRef(false);

  // URL 파라미터로 카테고리/결제완료 사전 처리
  // ?cat=new-year            → 폼 화면으로 바로 이동
  // ?cat=new-year&tier=basic&paid=true → 결제 완료 후 타로/결과 화면으로 바로 이동
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const params   = new URLSearchParams(window.location.search);
    const catId    = params.get('cat');
    const tierParam = params.get('tier') as Tier | null;
    const paid     = params.get('paid');

    if (!catId) return;
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;

    setCategory(cat);

    if (paid === 'true' && tierParam && (['single', 'basic', 'premium'] as const).includes(tierParam)) {
      setTier(tierParam);
      setScreen(tierParam === 'premium' ? 'tarot' : 'result');
    } else {
      setScreen('form');
    }
  }, []);

  const handleSelectCategory = (cat: Category) => {
    setCategory(cat);
    setScreen('form');
  };

  const handleSubmitForm = () => {
    setScreen('package');
  };

  const handleSelectTier = (t: Tier) => {
    setTier(t);
    setScreen(t === 'premium' ? 'tarot' : 'result');
  };

  const handleSelectTarot = (i: number) => {
    setTarotIdx(i);
    setTimeout(() => setScreen('result'), 1500);
  };

  const reset = () => {
    setScreen('home');
    setCategory(null);
    setTier(null);
    setTarotIdx(null);
  };

  return (
    <div className="min-h-screen bg-canvas">
      {screen === 'home' && (
        <HomeScreen onSelect={handleSelectCategory} />
      )}
      {screen === 'form' && category && (
        <FormScreen
          category={category}
          onSubmit={handleSubmitForm}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'package' && category && (
        <PackageScreen
          category={category}
          onSelect={handleSelectTier}
          onBack={() => setScreen('form')}
        />
      )}
      {screen === 'tarot' && (
        <TarotScreen
          onSelect={handleSelectTarot}
          onBack={() => setScreen('package')}
        />
      )}
      {screen === 'result' && category && tier && (
        <ResultScreen
          category={category}
          tier={tier}
          tarotCard={tarotIdx !== null ? TAROT_CARDS[tarotIdx] : null}
          onReset={reset}
        />
      )}
    </div>
  );
}
