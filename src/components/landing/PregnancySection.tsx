import Link from "next/link";

const CARDS = [
  {
    id: 'pregnancy-timing',
    subtitle: '임신 가능 시기 예측',
    title: '아가야, 언제 올 거니?',
    desc: '사주로 보는 나의 임신 가능 시기와\n아이와의 인연이 닿는 때',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=85&fit=crop',
    href: '/products/pregnancy-timing',
    badge: 'NEW',
  },
  {
    id: 'pregnancy-date',
    subtitle: '합궁 및 임신 택일',
    title: '하늘이 맺어준 그날',
    desc: '복을 부르는 날을 골라\n하늘의 뜻에 맞는 인연을 맺으세요',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=85&fit=crop',
    href: '/products/pregnancy-date',
    badge: 'NEW',
  },
  {
    id: 'baby-dna',
    subtitle: '부부 사주로 보는 자녀 기질 예측',
    title: '미리 보는 우리 아이 DNA',
    desc: '두 사람의 사주로 태어날 아이의\n성격·재능·기질을 미리 엿봅니다',
    image: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&q=85&fit=crop',
    href: '/products/baby-dna',
    badge: 'NEW',
  },
  {
    id: 'baby-name',
    subtitle: '복을 부르는 태명 가이드',
    title: '태명 사주 학당',
    desc: '사주팔자에 맞는 태명으로\n아이에게 복을 불러드립니다',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=85&fit=crop',
    href: '/products/baby-name',
    badge: 'NEW',
  },
];

export function PregnancySection() {
  return (
    <section className="py-10 overflow-hidden">

      {/* 헤더 */}
      <div className="container mb-5">
        {/* 포인트 글씨 */}
        <p className="text-xs font-extrabold tracking-[0.2em] uppercase mb-1"
          style={{ color: '#f9a8d4' }}>
          ✦ 임신·육아
        </p>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-black text-white leading-tight">
            아이와의 인연이<br />궁금할 때
          </h2>
          <Link href="/products?category=임신·육아" className="text-xs text-mute flex items-center gap-1 hover:text-white transition-colors">
            더보기 →
          </Link>
        </div>
      </div>

      {/* 가로 스크롤 카드 */}
      <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {CARDS.map((card) => (
          <Link
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
                임신·육아
              </span>
              {card.badge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: '#ef4444', color: '#fff' }}>
                  NEW
                </span>
              )}
            </div>

            {/* 텍스트 */}
            <div className="absolute bottom-0 left-0 right-0 p-3.5">
              <p className="text-[10px] text-white/60 mb-1 leading-tight">{card.subtitle}</p>
              <p className="text-[14px] font-black text-white leading-tight mb-1.5">{card.title}</p>
              <p className="text-[10px] text-white/55 leading-relaxed whitespace-pre-line">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}
