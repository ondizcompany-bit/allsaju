'use client';

const POINTS = [
  {
    icon: '🏛',
    title: '정통 명리학 기반',
    desc: '만세력·오행·십신·대운 등\n역학의 엄격한 공식을 따릅니다.',
    color: '#fbbf24',
  },
  {
    icon: '🔮',
    title: '정밀 사주 분석',
    desc: '수만 건의 사주 명식을 기반으로 한\n고도화된 알고리즘이 운명을 도출합니다.',
    color: '#a78bfa',
  },
  {
    icon: '✅',
    title: '검증된 신뢰도',
    desc: '148,555명이 경험한\n압도적인 정확도와 만족도.',
    color: '#34d399',
  },
  {
    icon: '🔒',
    title: '개인정보 완전 보호',
    desc: '입력하신 정보는 분석 후 즉시 파기되며\n절대 외부에 제공되지 않습니다.',
    color: '#60a5fa',
  },
];

export function TrustPoints() {
  return (
    <section className="container py-20">
      <hr className="divider-purple mb-20" />

      <div className="text-center mb-12">
        <p className="text-xs font-bold tracking-[0.25em] text-purple-bright uppercase mb-4">
          왜 명리공방인가
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white">
          믿을 수 있는 이유가 있습니다
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {POINTS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl p-6 flex flex-col items-center text-center gap-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${p.color}25`,
            }}
          >
            {/* 아이콘 원 */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ background: `${p.color}18`, border: `1px solid ${p.color}40` }}
            >
              {p.icon}
            </div>

            {/* 제목 */}
            <p className="text-sm font-bold text-white leading-snug">{p.title}</p>

            {/* 설명 */}
            <p className="text-xs text-mute leading-relaxed whitespace-pre-line">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
