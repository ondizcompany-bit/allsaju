'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';

const fmt = (n: number) => n.toLocaleString('ko-KR') + '원';
const disc = (orig: number, sale: number) => Math.round((1 - sale / orig) * 100);

// ════════════════════════════════════════
//  PRODUCT DATA
// ════════════════════════════════════════
const PRODUCTS = [
  {
    id: 'new-year',
    category: '2026 신년 총운',
    emoji: '辛',
    title: '2026 병오년\n신년 총운',
    subtitle: '사주×자미두수 통합 분석 · 기질·운세·대운 완전 해석',
    description: '2026년 병오(丙午)년의 기운이 나의 사주와 어떻게 맞물리는지 정통 명리학으로 완전히 해석합니다. 타고난 기질부터 올해 재물·직업·연애·건강운, 현재 대운 10년의 방향까지 깊이 풀어드립니다.',
    image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=85&fit=crop',
    accentColor: '#a78bfa',
    adult: false,
    needsPartner: false,
    stats: { count: '12,400', satisfaction: '97', accuracy: '94' },
    discoveries: [
      '타고난 기질·강점·반복되는 삶의 패턴',
      '2026년 총운 — 내 일간과 병오년 에너지의 관계',
      '재물·직업·연애·건강운 깊이 분석',
      '현재 대운 10년의 방향과 올해의 의미',
      '사주×자미두수 핵심 조언',
    ],
    previewItems: [
      '✨ 타고난 기질 — 경금(庚金) 일간, 단단한 의지와 날카로운 판단력',
      '💰 재물운 — 병오년 충(沖) 기운, 3월·9월 지출 특히 주의',
      '💼 커리어운 — 식신 흐름이 살아나는 하반기가 기회',
    ],
    recommend: [
      '올해 한 해 계획을 제대로 세우고 싶은 분',
      '취업·이직·결혼 등 중요한 결정을 앞둔 분',
      '조심해야 할 시기를 미리 알고 싶은 분',
      '지난해보다 더 나은 한 해를 만들고 싶은 분',
    ],
    accuracy: {
      headline: '실제 이용자 94%가 "정확했다"고 응답',
      points: [
        { icon: '🔬', title: '정통 명리학 기반', desc: '수백 년 검증된 사주 명리학 원리로 사주팔자를 4기둥(八字) 단위로 정밀 분석합니다.' },
        { icon: '🔮', title: '정밀 사주 알고리즘', desc: '수십만 건의 사주 명식을 기반으로 한 고도화된 분석 알고리즘이 개인화된 해석을 도출합니다.' },
        { icon: '🌟', title: '자미두수 결합', desc: '동양 최고 점성술 자미두수(베이직·종합)를 결합해 더 입체적인 운명을 읽어드립니다.' },
      ],
    },
    reviews: [
      { name: '김○○', age: '30대 여성', rating: 5, text: '3월에 조심하라고 했는데 그달에 진짜 큰 사고가 날 뻔했어요. 소름 돋아서 바로 주변에 추천했습니다.' },
      { name: '이○○', age: '20대 남성', rating: 5, text: '취업 시기 딱 맞혔어요. 2월에 연락 온다고 했는데 2월 말에 최종 합격 통보 받았습니다. 신기해요.' },
      { name: '박○○', age: '40대 여성', rating: 5, text: '매년 신년 운세 보는데 여기가 제일 구체적이에요. 월별로 이렇게 자세히 알려주는 곳 처음이에요.' },
      { name: '최○○', age: '30대 남성', rating: 4, text: '처음엔 반신반의했는데 상반기 운세가 너무 맞아서 하반기가 더 기대돼요. 종합 리포트 퀄리티가 높습니다.' },
    ],
    packages: {
      single:  { price: 24900, original: 49800, popular: false },
      basic:   { price: 34900, original: 69800, popular: true  },
      premium: { price: 44900, original: 89800, popular: false },
    },
  },
  {
    id: 'reunion',
    category: '재회 사주',
    emoji: '緣',
    title: '헤어진 그 사람과의\n재회 사주',
    subtitle: '다시 만날 수 있는 시기와 가능성을 깊이 짚어드립니다',
    description: '헤어진 후에도 마음속에 남아 있는 그 사람과의 인연이 아직 끝난 것인지, 다시 만날 수 있는 시기와 가능성은 얼마나 되는지 사주로 깊이 풀어드립니다. 두 사람의 재회 타이밍과 최선의 접근 방법까지 안내해드립니다.',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1200&q=85&fit=crop',
    accentColor: '#c084fc',
    adult: false,
    needsPartner: true,
    stats: { count: '8,900', satisfaction: '96', accuracy: '91' },
    discoveries: [
      '두 사람의 인연이 아직 남아 있는지 여부',
      '재회 가능성 % 및 최적 타이밍',
      '상대방의 현재 감정과 나를 향한 마음',
      '연락하기 가장 좋은 시기와 방법',
      '재회 후 관계가 지속될 가능성',
    ],
    previewItems: ['두 사람의 인연지수: ██% (분석 후 공개)', '재회 최적 시기: 20○○년 ○월 전후', '상대방 감정 상태: 아직 ○○한 마음이 남아 있음'],
    recommend: [
      '헤어진 후에도 계속 생각나는 사람이 있는 분',
      '재회 가능성이 얼마나 되는지 알고 싶은 분',
      '연락 타이밍을 놓칠까봐 걱정되는 분',
      '두 사람이 다시 이어질 수 있는지 궁금한 분',
    ],
    accuracy: {
      headline: '실제 이용자 91%가 "상대방 마음을 정확히 맞혔다"고 응답',
      points: [
        { icon: '💫', title: '두 사람 사주 합산 분석', desc: '두 사람의 사주를 동시에 분석하여 궁합과 인연의 흐름을 정밀하게 읽어냅니다.' },
        { icon: '🌙', title: '감정 흐름 예측', desc: '상대방 사주의 감정궁과 인연궁을 분석해 현재 마음 상태를 파악합니다.' },
        { icon: '⏰', title: '타이밍 정밀 계산', desc: '두 사람의 운기가 만나는 최적의 시기를 월·주 단위로 계산합니다.' },
      ],
    },
    reviews: [
      { name: '이○○', age: '20대 여성', rating: 5, text: '헤어지고 8개월 됐는데 사주에서 6월에 연락 온다고 했어요. 6월 3일에 정말로 연락이 왔어요... 너무 신기해서 눈물이 났어요.' },
      { name: '김○○', age: '30대 여성', rating: 5, text: '상대방 마음이 아직 남아 있다고 했는데 실제로 연락해보니 맞았어요. 접근 방법 조언도 너무 도움이 됐어요.' },
      { name: '박○○', age: '20대 남성', rating: 5, text: '재회 가능성 퍼센트 보고 반신반의했는데 딱 그 시기에 그 사람한테서 연락이 왔어요. 믿기 힘든 일이 일어났어요.' },
      { name: '한○○', age: '30대 여성', rating: 4, text: '결과지가 정말 자세해요. 단순히 될지 안될지가 아니라 어떻게 접근해야 하는지까지 알려줘서 실용적이에요.' },
    ],
    packages: {
      single:  { price: 24900, original: 49800, popular: false },
      basic:   { price: 39900, original: 79800, popular: true  },
      premium: { price: 49900, original: 99800, popular: false },
    },
  },
  {
    id: 'career',
    category: '커리어 타이밍',
    emoji: '命',
    title: '취업·이직·승진\n커리어 타이밍',
    subtitle: '내 사주가 말하는 가장 완벽한 커리어 전환 시기',
    description: '내 사주팔자가 말하는 가장 완벽한 직업 전환의 시기를 분석합니다. 현재 직장운의 흐름, 이직하기 좋은 달, 승진 타이밍까지 커리어 전반을 깊이 짚어드립니다.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=85&fit=crop',
    accentColor: '#818cf8',
    adult: false,
    needsPartner: false,
    stats: { count: '9,700', satisfaction: '95', accuracy: '92' },
    discoveries: [
      '취업·이직·창업의 최적 타이밍',
      '현재 직장에 계속 다녀야 하는지 여부',
      '올해 승진 또는 발탁 가능성',
      '나에게 맞는 직종과 직무 성향',
      '커리어에서 가장 피해야 할 시기',
    ],
    previewItems: ['이직 최적 시기: 20○○년 ○~○월 (운기 상승 구간)', '현재 직장운 흐름: ○○○한 상태 → ○월부터 변화 예상', '승진 가능성: 상반기보다 하반기가 유리'],
    recommend: [
      '이직을 고민 중이지만 타이밍이 고민인 분',
      '승진·발탁이 언제쯤 될지 궁금한 분',
      '창업 시기를 잡지 못하고 고민 중인 분',
      '지금 직장을 계속 다녀야 할지 확신이 없는 분',
    ],
    accuracy: {
      headline: '실제 이용자 92%가 "이직·승진 타이밍이 맞았다"고 응답',
      points: [
        { icon: '📊', title: '직업궁 정밀 분석', desc: '사주의 관성궁(官星宮)과 재성궁(財星宮)을 분석해 직업운의 흐름을 읽어냅니다.' },
        { icon: '⚡', title: '운기 변화 감지', desc: '대운·세운·월운의 3중 교차 분석으로 커리어 전환의 최적 시점을 계산합니다.' },
        { icon: '🎯', title: '맞춤형 전략 제시', desc: '단순 시기만이 아니라 어떻게 준비해야 하는지 구체적인 방향까지 안내합니다.' },
      ],
    },
    reviews: [
      { name: '정○○', age: '30대 남성', rating: 5, text: '이직 타이밍 물어봤는데 4월이 최적이라고 했어요. 4월에 이직했더니 연봉도 오르고 너무 잘됐어요. 사주 믿길 잘했습니다.' },
      { name: '강○○', age: '20대 여성', rating: 5, text: '취업이 너무 안 됐는데 올해 9월 이후 운이 열린다고 했어요. 10월에 첫 합격 통보 받았습니다. 진짜예요.' },
      { name: '윤○○', age: '40대 남성', rating: 5, text: '창업 시기 잡는 데 도움 받았어요. 조심해야 할 시기라고 한 달을 피해서 시작했더니 안정적으로 정착했어요.' },
      { name: '오○○', age: '30대 여성', rating: 4, text: '승진 타이밍이 내년 상반기라고 했는데 실제로 그쯤 기회가 왔어요. 미리 준비하고 있어서 잡을 수 있었습니다.' },
    ],
    packages: {
      single:  { price: 24900, original: 49800, popular: false },
      basic:   { price: 34900, original: 69800, popular: true  },
      premium: { price: 44900, original: 89800, popular: false },
    },
  },
  {
    id: 'investment',
    category: '재테크 성향',
    emoji: '財',
    title: '내 팔자에 맞는\n재테크 성향',
    subtitle: '사주팔자로 알아보는 나만의 최적 재테크 전략과 재물운',
    description: '타고난 사주팔자에 새겨진 재물운과 투자 성향을 분석합니다. 나에게 맞는 투자 방식은 무엇인지, 재물이 모이는 시기와 흐트러지는 시기는 언제인지 정밀하게 알려드립니다.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=85&fit=crop',
    accentColor: '#93c5fd',
    adult: false,
    needsPartner: false,
    stats: { count: '7,300', satisfaction: '95', accuracy: '90' },
    discoveries: [
      '나의 타고난 재물운 수준과 성향',
      '돈이 모이는 시기 vs 나가는 시기',
      '나에게 맞는 투자 방식 (주식·부동산·예금 등)',
      '큰 지출 또는 투자 결정의 최적 타이밍',
      '재물운을 높이는 생활 방식과 방향',
    ],
    previewItems: ['재물 성향: ○○형 (○○을 통한 재물 축적이 유리)', '올해 재물운 피크: ○~○월 / 조심 구간: ○월', '추천 투자 방식: ○○ > ○○ > ○○ 순'],
    recommend: [
      '재테크 방향이 나에게 맞는지 확인하고 싶은 분',
      '큰 투자 결정 전 타이밍을 확인하고 싶은 분',
      '돈이 왜 안 모이는지 이유가 궁금한 분',
      '팔자에 맞는 재테크 전략이 궁금한 분',
    ],
    accuracy: {
      headline: '실제 이용자 90%가 "재물 성향 분석이 딱 맞았다"고 응답',
      points: [
        { icon: '💰', title: '재성궁 집중 분석', desc: '사주의 재성(財星)과 식신·상관의 조합을 분석해 재물 취득 방식을 파악합니다.' },
        { icon: '📈', title: '세운·월운 재물 흐름', desc: '올해~내년의 재물운 흐름을 월별로 계산해 투자·소비 최적 타이밍을 제공합니다.' },
        { icon: '🏆', title: '맞춤 전략 설계', desc: '사주 성향에 따라 공격적/안정적 재테크 방향 중 더 유리한 방식을 제안합니다.' },
      ],
    },
    reviews: [
      { name: '송○○', age: '40대 남성', rating: 5, text: '부동산 투자 타이밍 물어봤는데 이 시기 피하라고 한 때 실제로 시장이 빠졌어요. 덕분에 손실 피했습니다. 진짜 감사해요.' },
      { name: '류○○', age: '30대 여성', rating: 5, text: '주식이 왜 안 맞는지 이유를 사주로 설명해줬는데 너무 공감돼서 눈물 날 뻔했어요. 내 성향엔 적금이 맞다고 했는데 진짜예요.' },
      { name: '홍○○', age: '30대 남성', rating: 5, text: '재물운 피크가 4분기라고 했는데 실제로 10월에 큰 계약이 성사됐어요. 우연이라기엔 너무 정확해요.' },
      { name: '신○○', age: '20대 여성', rating: 4, text: '돈 관리 습관을 바꿨더니 실제로 조금씩 모이기 시작했어요. 사주에서 알려준 방향대로 하니까 스트레스도 덜해요.' },
    ],
    packages: {
      single:  { price: 24900, original: 49800, popular: false },
      basic:   { price: 39900, original: 79800, popular: true  },
      premium: { price: 49900, original: 99800, popular: false },
    },
  },
  {
    id: 'secret',
    category: '🌶️ 속궁합 19+',
    emoji: '艶',
    title: '29금 은밀한\n속궁합 & 밤의 성향',
    subtitle: '19세 이상 · 두 사람의 깊은 궁합을 솔직하게',
    description: '19세 이상 성인을 위한 두 사람의 깊은 궁합 분석입니다. 사주팔자로 본 성적 성향, 두 사람의 궁합, 그리고 더 깊이 있는 케미스트리를 솔직하고 자세하게 풀어드립니다.',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&q=85&fit=crop',
    accentColor: '#f9a8d4',
    adult: true,
    needsPartner: true,
    stats: { count: '6,100', satisfaction: '98', accuracy: '93' },
    discoveries: [
      '두 사람의 속궁합 점수와 케미스트리',
      '나의 타고난 성적 성향과 욕구 패턴',
      '파트너와의 침실 궁합 상세 분석',
      '두 사람이 가장 잘 맞는 방식과 타이밍',
      '관계 만족도를 높이는 실질적인 방향',
    ],
    previewItems: ['속궁합 점수: ██점 / 100점 (분석 후 공개)', '두 사람의 케미: ○○형 조합 → ○○한 특징', '가장 잘 맞는 시간대와 분위기 유형'],
    recommend: [
      '파트너와의 깊은 궁합이 궁금한 분',
      '관계에서 더 큰 만족을 원하는 분',
      '서로의 성향 차이를 이해하고 싶은 분',
      '새로운 파트너와의 케미를 미리 확인하고 싶은 분',
    ],
    accuracy: {
      headline: '실제 이용자 93%가 "파트너와의 성향이 정확히 묘사됐다"고 응답',
      points: [
        { icon: '🔥', title: '도화성 집중 분석', desc: '사주의 도화성(桃花星)과 홍염성(紅艶星)을 분석해 타고난 성적 매력과 성향을 파악합니다.' },
        { icon: '💑', title: '두 사람 기운 합산', desc: '두 사람의 음양오행 균형을 분석하여 속궁합의 조화 정도를 수치화합니다.' },
        { icon: '🌹', title: '솔직한 맞춤 분석', desc: '수위 높은 내용도 솔직하게 다루며, 19세 이상 성인을 위한 전용 리포트로 제공합니다.' },
      ],
    },
    reviews: [
      { name: '익명○○', age: '20대 여성', rating: 5, text: '파트너랑 왜 잘 맞는지 사주로 설명해줬는데 너무 공감돼요. 서로 이해하는 데 엄청 도움이 됐어요. 커플끼리 같이 보면 좋을 것 같아요.' },
      { name: '익명○○', age: '30대 남성', rating: 5, text: '조금 민감한 내용이라 걱정했는데 품위 있게 잘 써져 있어요. 내용은 솔직하고 정확하고, 파트너도 읽고 많이 공감했어요.' },
      { name: '익명○○', age: '20대 여성', rating: 5, text: '분석 결과가 너무 정확해서 깜짝 놀랐어요. 내가 이런 성향인지 몰랐는데 사주로 이렇게 잘 설명이 될 줄이야.' },
      { name: '익명○○', age: '30대 여성', rating: 4, text: '솔직히 반신반의했는데 파트너 성향 묘사가 너무 정확해서 소름 돋았어요. 둘이 같이 읽으면서 엄청 웃었어요 ㅋㅋ' },
    ],
    packages: {
      single:  { price: 29900, original: 59800, popular: false },
      basic:   { price: 39900, original: 79800, popular: true  },
      premium: { price: 49900, original: 99800, popular: false },
    },
  },
] as const;

const TIER_META = {
  single:  { label: '단품',  desc: '정통 사주팔자 기반 핵심 운세 풀이',       tags: ['사주 기본 분석', '월별 운세', '핵심 조언'] },
  basic:   { label: '베이직', desc: '사주 + 자미두수 결합 완전 분석',          tags: ['사주 기본 분석', '월별 운세', '자미두수 심층', '10년 대운', '핵심 조언'] },
  premium: { label: '종합',  desc: '사주 + 자미두수 + 인터랙티브 타로 완전체', tags: ['사주 기본 분석', '월별 운세', '자미두수 심층', '10년 대운', '인터랙티브 타로', '종합 조언'] },
};

// ════════════════════════════════════════
//  SUB COMPONENTS
// ════════════════════════════════════════
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={i <= rating ? '#f59e0b' : 'none'} stroke={i <= rating ? '#f59e0b' : '#4b5563'} strokeWidth="1.2">
          <path d="M7 1L8.6 5.2H13L9.7 7.8L10.9 12L7 9.4L3.1 12L4.3 7.8L1 5.2H5.4L7 1Z"/>
        </svg>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-[0.18em] text-purple-bright uppercase mb-5">
      {children}
    </h2>
  );
}

// ════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════
export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = PRODUCTS.find(p => p.id === slug);
  if (!product) notFound();

  const tiers = ['single', 'basic', 'premium'] as const;
  const avgRating = (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-canvas pb-24">

      {/* ── 뒤로 가기 ── */}
      <div className="container max-w-2xl pt-4 pb-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-purple-light transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          홈으로
        </Link>
      </div>

      {/* ── 히어로 이미지 ── */}
      <div className="relative overflow-hidden" style={{ height: '54vw', maxHeight: '400px', minHeight: '220px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.category} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070e] via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-deep/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full px-5 pb-6 md:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7)' }}>
              ✦ {product.category}
            </span>
            {product.adult && (
              <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-red-900/80 text-red-300 border border-red-600/50">19+</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white whitespace-pre-line leading-tight drop-shadow-lg">
            {product.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={5} />
            <span className="text-sm font-semibold text-amber-400">{avgRating}</span>
            <span className="text-xs text-white/40">({product.stats.count}명 이용)</span>
          </div>
        </div>
      </div>

      {/* ── 신뢰 지표 바 ── */}
      <div className="border-b border-hairline" style={{ background: 'rgba(14,14,28,0.9)' }}>
        <div className="container max-w-2xl">
          <div className="grid grid-cols-3 divide-x divide-hairline py-4">
            {[
              { label: '누적 분석', value: product.stats.count + '+', sub: '건' },
              { label: '만족도', value: product.stats.satisfaction + '%', sub: '' },
              { label: '정확도', value: product.stats.accuracy + '%', sub: '' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="text-center px-2">
                <p className="text-[11px] text-mute mb-0.5">{label}</p>
                <p className="text-lg font-bold text-white leading-none">
                  {value}<span className="text-xs text-mute ml-0.5">{sub}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mt-6 space-y-10">

        {/* ── 가격 + 메인 CTA ── */}
        <div className="rounded-2xl p-5" style={{
          background: 'linear-gradient(135deg,rgba(76,29,149,0.25) 0%,rgba(30,10,80,0.4) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-mute mb-0.5">가격</p>
              <p className="text-sm text-body">
                <span className="text-xl font-bold text-white">{fmt(product.packages.single.price)}</span>
                <span className="text-mute text-xs"> 부터</span>
              </p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-700/40">
              최대 50% OFF
            </span>
          </div>
          <Link
            href={`/start?cat=${product.id}`}
            className="w-full h-12 rounded-full flex items-center justify-center text-white font-semibold text-[15px] transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(90deg,#7c3aed 0%,#a855f7 100%)', boxShadow: '0 0 24px rgba(139,92,246,0.45)' }}
          >
            지금 시작하기 →
          </Link>
          <p className="text-center text-xs text-mute mt-2.5">3분 내 입력 완료 · 분석 결과 즉시 제공</p>
        </div>

        {/* ── 이 분석으로 알 수 있는 것들 ── */}
        <div>
          <SectionLabel>이 분석으로 알 수 있어요</SectionLabel>
          <div className="rounded-2xl border border-hairline bg-surface-soft/50 p-5 space-y-3">
            {product.discoveries.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm text-body leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 결과 미리보기 (잠금) ── */}
        <div>
          <SectionLabel>결과 미리보기</SectionLabel>
          <div className="rounded-2xl overflow-hidden border border-hairline relative">
            <div className="p-5 space-y-3" style={{ background: 'rgba(14,14,28,0.8)' }}>
              {product.previewItems.map((item, i) => (
                <div key={i} className={cn(
                  'rounded-xl px-4 py-3 text-sm',
                  i === 0 ? 'text-body' : 'blur-[4px] select-none pointer-events-none text-body'
                )} style={{ background: 'rgba(30,20,60,0.6)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  {item}
                </div>
              ))}
            </div>
            {/* 잠금 오버레이 */}
            <div className="absolute bottom-0 left-0 right-0 h-24 flex flex-col items-center justify-end pb-4"
              style={{ background: 'linear-gradient(to top, #07070e 60%, transparent)' }}>
              <Link
                href={`/start?cat=${product.id}`}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7)', boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}
              >
                🔒 전체 결과 확인하기
              </Link>
            </div>
          </div>
        </div>

        {/* ── 실제 후기 ── */}
        <div>
          <SectionLabel>실제 이용 후기</SectionLabel>
          <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.1) 0%,rgba(30,10,80,0.3) 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="text-4xl font-bold text-amber-400">{avgRating}</div>
            <div>
              <StarRating rating={5} />
              <p className="text-xs text-mute mt-1">{product.stats.count}명의 평균 평점</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-mute">만족도</p>
              <p className="text-lg font-bold text-white">{product.stats.satisfaction}%</p>
            </div>
          </div>
          <div className="space-y-3">
            {product.reviews.map((review, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(14,14,28,0.8)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink">{review.name}</p>
                      <p className="text-[10px] text-mute">{review.age}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-body leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 이런 분께 추천해요 ── */}
        <div>
          <SectionLabel>이런 분께 특히 좋아요</SectionLabel>
          <div className="rounded-2xl border border-hairline bg-surface-soft/50 p-5 space-y-3">
            {product.recommend.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-purple-bright flex-shrink-0 mt-0.5">✦</span>
                <p className="text-sm text-body">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 정확도 / 왜 믿을 수 있나요 ── */}
        <div>
          <SectionLabel>왜 정확한가요?</SectionLabel>
          <div className="rounded-2xl border border-hairline overflow-hidden">
            <div className="px-5 py-4 border-b border-hairline" style={{ background: 'rgba(76,29,149,0.15)' }}>
              <p className="text-sm font-semibold text-white text-center">{product.accuracy.headline}</p>
            </div>
            <div className="p-5 space-y-5 bg-surface-soft/50">
              {product.accuracy.points.map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink mb-0.5">{title}</p>
                    <p className="text-xs text-mute leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 가격 플랜 ── */}
        <div>
          <SectionLabel>가격 플랜 선택</SectionLabel>
          <div className="flex flex-col gap-3">
            {tiers.map((tier) => {
              const pkg = product.packages[tier];
              const meta = TIER_META[tier];
              const isPopular = pkg.popular;
              return (
                <div key={tier} className={cn(
                  'relative rounded-2xl p-5 transition-all',
                  isPopular ? 'border-2 border-purple-rich/70' : 'border border-hairline'
                )} style={{
                  background: isPopular
                    ? 'linear-gradient(135deg,rgba(76,29,149,0.3) 0%,rgba(30,10,80,0.5) 100%)'
                    : 'rgba(14,14,28,0.6)',
                }}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full px-3 py-0.5 text-[11px] font-bold text-white"
                        style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7)', boxShadow: '0 0 12px rgba(139,92,246,0.5)' }}>
                        ✦ 가장 인기
                      </span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-base font-bold text-white">{meta.label}</p>
                      <p className="text-xs text-mute mt-0.5">{meta.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{fmt(pkg.price)}</p>
                      <p className="text-xs text-mute line-through">{fmt(pkg.original)}</p>
                      <p className="text-xs font-bold text-emerald-400">{disc(pkg.original, pkg.price)}% OFF</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {meta.tags.map((tag) => (
                      <li key={tag} className="flex items-center gap-2 text-xs text-body">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                          <circle cx="7" cy="7" r="7" fill="rgba(139,92,246,0.2)"/>
                          <path d="M4 7L6 9L10 5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/start?cat=${product.id}&tier=${tier}`}
                    className={cn(
                      'w-full h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all active:scale-[0.98]',
                      isPopular ? 'text-white hover:opacity-90' : 'text-purple-light border hover:bg-purple-rich/10'
                    )}
                    style={isPopular
                      ? { background: 'linear-gradient(90deg,#7c3aed,#a855f7)', boxShadow: '0 0 16px rgba(139,92,246,0.4)' }
                      : { borderColor: 'rgba(139,92,246,0.4)' }
                    }
                  >
                    이 플랜으로 시작하기 →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 하단 CTA ── */}
        <div className="pt-2">
          <Link
            href={`/start?cat=${product.id}`}
            className="w-full h-14 rounded-full flex items-center justify-center text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(90deg,#7c3aed 0%,#a855f7 100%)', boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}
          >
            지금 시작하기 →
          </Link>
          <p className="text-center text-xs text-mute mt-3">
            ※ 본 서비스는 오락·참고 목적이며, 전문적인 조언을 대체하지 않습니다.
          </p>
        </div>

      </div>
    </div>
  );
}
