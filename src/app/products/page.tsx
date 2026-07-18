'use client';

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const ALL_PRODUCTS = [
  {
    slug: "new-year",
    name: "2026 병오년 신년 총운",
    subtitle: "한 해의 운기를 한눈에",
    description: "새해 운기·월별 흐름·주의 시기까지 나만의 2026년을 완전 분석",
    price: 24900,
    emoji: "🎆",
    color: "#fbbf24",
    category: "신년운세",
    image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=85&fit=crop",
  },
  {
    slug: "reunion",
    name: "재회 사주",
    subtitle: "헤어진 그 사람과의",
    description: "다시 만날 수 있는 시기와 가능성, 두 사람의 인연을 깊이 풀어드립니다",
    price: 24900,
    emoji: "💜",
    color: "#f472b6",
    category: "재회·사랑",
    image: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=85&fit=crop",
    badge: "인기",
  },
  {
    slug: "career",
    name: "커리어 타이밍",
    subtitle: "취업·이직·승진",
    description: "내 사주가 말하는 가장 완벽한 커리어 전환 시기를 알려드립니다",
    price: 24900,
    emoji: "🚀",
    color: "#60a5fa",
    category: "커리어",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=85&fit=crop",
  },
  {
    slug: "investment",
    name: "재테크 성향",
    subtitle: "내 팔자에 맞는",
    description: "사주팔자로 알아보는 나만의 최적 재테크 전략과 타고난 재물운",
    price: 24900,
    emoji: "💰",
    color: "#34d399",
    category: "재테크",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=85&fit=crop",
  },
  {
    slug: "secret",
    name: "속궁합 & 밤의 성향",
    subtitle: "29금 은밀한",
    description: "두 사람의 깊은 궁합을 솔직하게 은밀하고 자세히 풀어드립니다",
    price: 29900,
    emoji: "🌶️",
    color: "#f87171",
    category: "속궁합",
    image: "https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&q=85&fit=crop",
    badge: "19+",
  },
  // ── 재회·사랑 상품 ──
  {
    slug: "tarot-reunion",
    name: "타로로 보는 재회 가능성",
    description: "현시점 타로 카드로 짚어보는 재회 확률과 시기",
    price: 19900,
    emoji: "🃏",
    color: "#f472b6",
    category: "재회·사랑",
    image: "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=800&q=85&fit=crop",
    badge: "NEW",
  },
  {
    slug: "ex-feelings",
    name: "그 사람도 내 생각 할까?",
    description: "사주·타로로 들여다보는 상대방의 속마음과 미련",
    price: 19900,
    emoji: "💭",
    color: "#e879f9",
    category: "재회·사랑",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=85&fit=crop",
    badge: "NEW",
  },
  {
    slug: "reunion-timing",
    name: "타이밍을 놓치지 마라",
    description: "연락이 오거나 먼저 해야 할 재회 골든타임 분석",
    price: 19900,
    emoji: "⏰",
    color: "#60a5fa",
    category: "재회·사랑",
    image: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=85&fit=crop",
    badge: "NEW",
  },
  {
    slug: "breakup-reason",
    name: "우리가 헤어진 진짜 이유",
    description: "사주 궁합의 충(沖)으로 분석하는 이별 원인과 처방",
    price: 19900,
    emoji: "💔",
    color: "#fb923c",
    category: "재회·사랑",
    image: "https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&q=85&fit=crop",
    badge: "NEW",
  },
  {
    slug: "pregnancy-timing",
    name: "아가야, 언제 올 거니?",
    subtitle: "임신 가능 시기 예측",
    description: "사주로 보는 임신 가능 시기, 자녀와의 인연이 닿는 때",
    price: 24900,
    emoji: "🌸",
    color: "#f9a8d4",
    category: "임신·육아",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85&fit=crop",
    badge: "NEW",
  },
  {
    slug: "pregnancy-date",
    name: "하늘이 맺어준 그날",
    subtitle: "합궁 및 임신 택일",
    description: "복을 부르는 날을 골라 하늘의 뜻에 맞는 인연을 맺으세요",
    price: 24900,
    emoji: "🌙",
    color: "#a78bfa",
    category: "임신·육아",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=85&fit=crop",
    badge: "NEW",
  },
  {
    slug: "baby-dna",
    name: "미리 보는 우리 아이 DNA",
    subtitle: "부부 사주로 보는 자녀 기질",
    description: "두 사람의 사주로 태어날 아이의 성격·재능·기질을 미리 엿봅니다",
    price: 24900,
    emoji: "🧬",
    color: "#34d399",
    category: "임신·육아",
    image: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=85&fit=crop",
    badge: "NEW",
  },
  {
    slug: "baby-name",
    name: "태명 사주 학당",
    subtitle: "복을 부르는 태명 가이드",
    description: "사주 오행에 맞는 태명으로 아이에게 복을 불러드립니다",
    price: 19900,
    emoji: "✨",
    color: "#fbbf24",
    category: "임신·육아",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=85&fit=crop",
    badge: "NEW",
  },
  {
    slug: "charm",
    name: "나의 타고난 매력 포인트",
    subtitle: "사주로 알아보는 나만의 매력",
    description: "사주로 알아보는 나만의 매력과 어필 포인트, 200% 발휘하는 법까지",
    price: 24900,
    emoji: "✨",
    color: "#fb7185",
    category: "매력",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=85&fit=crop",
    badge: "NEW",
  },
];

const CATEGORIES = ["전체", "재회·사랑", "신년운세", "연애·재회", "커리어", "재테크", "속궁합", "임신·육아", "매력"];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") ?? "전체";

  const filtered =
    category === "전체"
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter((p) => p.category === category);

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "#fff" }}>
      <div className="container py-8">

        {/* 헤더 */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-1" style={{ color: "#a78bfa" }}>
            명리공방
          </p>
          <h1 className="text-2xl font-black text-white">
            {category === "전체" ? "전체 상품" : category}
          </h1>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                router.push(cat === "전체" ? "/products" : `/products?category=${cat}`)
              }
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={
                category === cat
                  ? {
                      background: "linear-gradient(90deg,#5b21b6,#7c3aed)",
                      color: "#fff",
                      boxShadow: "0 0 16px rgba(91,33,182,0.4)",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 상품 카드 목록 */}
        <div className="flex flex-col gap-4">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="relative block rounded-2xl overflow-hidden"
              style={{ aspectRatio: "4 / 3" }}
            >
              {/* 배경 이미지 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* 그라데이션 오버레이 */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.1) 100%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${p.color}30 0%, transparent 55%)`,
                }}
              />

              {/* 텍스트 영역 */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {/* 뱃지 */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      color: "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {p.category}
                  </span>
                  {p.badge && (
                    <span
                      className="text-[11px] font-black px-2.5 py-1 rounded-full"
                      style={{
                        background: p.badge === "19+" ? "#ef4444" : p.badge === "인기" ? "#7c3aed" : "#dc2626",
                        color: "#fff",
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>

                <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {p.subtitle}
                </p>
                <h2 className="text-2xl font-black text-white leading-tight mb-2">
                  {p.name}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {p.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-white">불러오는 중...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
