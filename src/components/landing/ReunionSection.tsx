import Link from "next/link";

const CARDS = [
  {
    id: 'reunion',
    subtitle: '재회 사주 대표 상품',
    title: '헤어진 그 사람과의\n재회 사주',
    desc: '다시 만날 수 있는 시기와 가능성\n두 사람의 인연을 깊이 풀어드립니다',
    image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600&q=85&fit=crop',
    href: '/products/reunion',
    badge: '인기',
  },
  {
    id: 'tarot-reunion',
    subtitle: '타로로 보는 재회 가능성',
    title: '타로가 말하는\n재회 확률',
    desc: '현시점 타로 카드로 짚어보는\n재회 가능성과 시기',
    image: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=600&q=85&fit=crop',
    href: '/products/tarot-reunion',
    badge: 'NEW',
  },
  {
    id: 'ex-feelings',
    subtitle: '상대방의 속마음과 미련',
    title: '그 사람도 내\n생각 할까?',
    desc: '사주·타로로 들여다보는\n그 사람의 진짜 속마음',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=85&fit=crop',
    href: '/products/ex-feelings',
    badge: 'NEW',
  },
  {
    id: 'reunion-timing',
    subtitle: '재회 골든타임 분석',
    title: '타이밍을\n놓치지 마라',
    desc: '연락이 오거나 먼저 해야 할\n재회 최적 타이밍',
    image: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=600&q=85&fit=crop',
    href: '/products/reunion-timing',
    badge: 'NEW',
  },
  {
    id: 'breakup-reason',
    subtitle: '이별 원인과 처방',
    title: '우리가 헤어진\n진짜 이유',
    desc: '사주 궁합의 충(沖)으로 분석하는\n이별 원인과 관계 처방',
    image: 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=600&q=85&fit=crop',
    href: '/products/breakup-reason',
    badge: 'NEW',
  },
];

export function ReunionSection() {
  return (
    <section className="py-10 overflow-hidden">

      {/* 헤더 */}
      <div className="container mb-5">
        <p className="text-xs font-extrabold tracking-[0.2em] uppercase mb-1"
          style={{ color: '#f472b6' }}>
          ✦ 재회·사랑
        </p>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-black text-white leading-tight">
            그 사람이 아직도<br />마음에 걸릴 때
          </h2>
          <a href="/products?category=재회·사랑" className="text-xs text-mute flex items-center gap-1 hover:text-white transition-colors">
            더보기 →
          </a>
        </div>
      </div>

      {/* 가로 스크롤 카드 */}
      <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {CARDS.map((card) => (
          <a
            key={card.id}
            href={card.href}
            className="flex-shrink-0 relative rounded-2xl overflow-hidden block"
            style={{ width: '200px', aspectRatio: '2 / 3', scrollSnapAlign: 'start' }}
          >
            {/* 배경 이미지 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.25) 0%, transparent 60%)' }} />

            {/* 뱃지 */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white/80 backdrop-blur-sm border border-white/10">
                재회·사랑
              </span>
              {card.badge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: card.badge === '인기' ? '#7c3aed' : '#ef4444', color: '#fff' }}>
                  {card.badge}
                </span>
              )}
            </div>

            {/* 텍스트 */}
            <div className="absolute bottom-0 left-0 right-0 p-3.5">
              <p className="text-[10px] text-white/60 mb-1 leading-tight">{card.subtitle}</p>
              <p className="text-[14px] font-black text-white leading-tight mb-1.5 whitespace-pre-line">{card.title}</p>
              <p className="text-[10px] text-white/55 leading-relaxed whitespace-pre-line">{card.desc}</p>
            </div>
          </a>
        ))}
      </div>

    </section>
  );
}
