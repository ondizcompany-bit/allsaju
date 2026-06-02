import Link from "next/link";

const PRODUCTS = [
  {
    id: 'new-year',
    emoji: '🎆',
    name: '2026 병오년 신년 총운',
    desc: '한 해의 운기·월별 흐름·주의 시기까지\n나만의 2026년을 완전 분석',
    from: 24_900,
    popular: 34_900,
    badge: null,
    color: '#fbbf24',
    href: '/products/new-year',
  },
  {
    id: 'reunion',
    emoji: '💜',
    name: '헤어진 그 사람과의 재회 사주',
    desc: '다시 만날 수 있는 시기와 가능성\n두 사람의 인연을 깊이 풀어드립니다',
    from: 24_900,
    popular: 39_900,
    badge: '인기',
    color: '#f472b6',
    href: '/products/reunion',
  },
  {
    id: 'career',
    emoji: '🚀',
    name: '취업·이직·승진 커리어 타이밍',
    desc: '내 사주가 말하는 가장 완벽한\n커리어 전환 시기를 알려드립니다',
    from: 24_900,
    popular: 34_900,
    badge: null,
    color: '#60a5fa',
    href: '/products/career',
  },
  {
    id: 'investment',
    emoji: '💰',
    name: '내 팔자에 맞는 재테크 성향',
    desc: '사주팔자로 알아보는 나만의\n최적 재테크 전략과 타고난 재물운',
    from: 24_900,
    popular: 39_900,
    badge: null,
    color: '#34d399',
    href: '/products/investment',
  },
  {
    id: 'secret',
    emoji: '🌶️',
    name: '29금 은밀한 속궁합 & 밤의 성향',
    desc: '두 사람의 깊은 궁합을 솔직하게\n은밀하고 자세히 풀어드립니다',
    from: 29_900,
    popular: 39_900,
    badge: '19+',
    color: '#f87171',
    href: '/products/secret',
  },
];

const fmt = (n: number) => n.toLocaleString('ko-KR');

export function ProductLineup() {
  return (
    <section className="container py-20">
      <hr className="divider-purple mb-20" />

      <div className="text-center mb-12">
        <p className="text-xs font-bold tracking-[0.25em] text-purple-bright uppercase mb-4">
          상품 라인업
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          원하는 답을 골라보세요
        </h2>
        <p className="text-sm text-mute">각 상품은 단품·베이직·종합 플랜으로 선택 가능합니다</p>
      </div>

      {/* 5개 카드 — 모바일 1열 / 태블릿 2열 / 데스크탑 3열(마지막 2개 중앙) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCTS.map((p, i) => (
          <Link
            key={p.id}
            href={p.href}
            /* 마지막 2개(4,5번째)를 lg에서 중앙 정렬 */
            className={`group relative rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1
              ${i === 3 ? 'lg:col-start-1' : ''}
              ${i === 4 ? 'lg:col-start-2' : ''}
            `}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${p.color}30`,
            }}
          >
            {/* 호버 글로우 */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${p.color}12 0%, transparent 70%)` }}
            />

            {/* 뱃지 */}
            {p.badge && (
              <span
                className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: p.badge === '19+' ? 'rgba(239,68,68,0.2)' : 'rgba(167,139,250,0.2)',
                  color: p.badge === '19+' ? '#f87171' : '#a78bfa',
                  border: p.badge === '19+' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(167,139,250,0.4)',
                }}
              >
                {p.badge}
              </span>
            )}

            {/* 이모지 아이콘 */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${p.color}18`, border: `1px solid ${p.color}35` }}
            >
              {p.emoji}
            </div>

            {/* 상품명 + 설명 */}
            <div className="flex-1">
              <p className="font-bold text-white text-[15px] leading-snug mb-2">{p.name}</p>
              <p className="text-xs text-mute leading-relaxed whitespace-pre-line">{p.desc}</p>
            </div>

            {/* 가격 + CTA */}
            <div className="pt-4 border-t border-white/[0.06] flex items-end justify-between">
              <div>
                <p className="text-[11px] text-mute mb-0.5">단품부터</p>
                <p className="text-xl font-black" style={{ color: p.color }}>
                  {fmt(p.from)}원~
                </p>
                <p className="text-[11px] text-mute mt-0.5">
                  베이직 <span className="text-white/60 font-semibold">{fmt(p.popular)}원</span>
                </p>
              </div>
              <span
                className="text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 group-hover:scale-105"
                style={{
                  background: `${p.color}22`,
                  color: p.color,
                  border: `1px solid ${p.color}40`,
                }}
              >
                시작하기 →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
