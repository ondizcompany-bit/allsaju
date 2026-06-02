const ROWS = [
  {
    category: '가격',
    offline: '5만~30만원 이상',
    online: '24,900원부터',
    highlight: true,
  },
  {
    category: '대기 시간',
    offline: '예약 후 수일~수주 대기',
    online: '결제 후 즉시 확인',
    highlight: true,
  },
  {
    category: '익명성',
    offline: '대면으로 개인정보 노출',
    online: '완전 익명 · 비대면',
    highlight: false,
  },
  {
    category: '환불 보장',
    offline: '환불 거의 불가',
    online: '결과 확인 전 전액 환불',
    highlight: true,
  },
];

export function ComparisonTable() {
  return (
    <section className="container py-20">
      <hr className="divider-purple mb-20" />

      <div className="text-center mb-12">
        <p className="text-xs font-bold tracking-[0.25em] text-purple-bright uppercase mb-4">
          왜 명리공방인가
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          오프라인 철학관 vs{' '}
          <span className="text-gradient">명리공방</span>
        </h2>
        <p className="text-sm text-mute">
          같은 정통 명리학, 더 합리적인 방법으로 만나보세요
        </p>
      </div>

      {/* 테이블 */}
      <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl"
        style={{ border: '1px solid rgba(167,139,250,0.2)' }}
      >
        {/* 헤더 */}
        <div className="grid grid-cols-3 text-center text-xs font-bold tracking-wider uppercase"
          style={{ background: 'rgba(124,58,237,0.15)', borderBottom: '1px solid rgba(167,139,250,0.2)' }}
        >
          <div className="py-4 text-white/40">항목</div>
          <div className="py-4 text-white/50">오프라인 철학관</div>
          <div className="py-4" style={{ color: '#a78bfa' }}>명리공방 ✨</div>
        </div>

        {/* 행 */}
        {ROWS.map((row, i) => (
          <div
            key={row.category}
            className="grid grid-cols-3 text-center items-center"
            style={{
              background: row.highlight
                ? 'rgba(124,58,237,0.08)'
                : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              borderBottom: i < ROWS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            {/* 항목명 */}
            <div className="py-4 px-3 text-xs font-semibold text-white/60">
              {row.category}
            </div>

            {/* 오프라인 */}
            <div className="py-4 px-3 flex flex-col items-center gap-1">
              <span className="text-base">❌</span>
              <span className="text-xs text-white/40 leading-snug">{row.offline}</span>
            </div>

            {/* 명리공방 */}
            <div className="py-4 px-3 flex flex-col items-center gap-1">
              <span className="text-base">✅</span>
              <span
                className="text-xs font-semibold leading-snug"
                style={{ color: row.highlight ? '#c4b5fd' : 'rgba(255,255,255,0.85)' }}
              >
                {row.online}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA 후킹 */}
      <div className="mt-10 text-center">
        <p className="text-sm text-mute mb-2">
          지금 바로 시작하면 <span className="text-white font-semibold">30초 안에</span> 결과를 받아볼 수 있습니다
        </p>
        <p className="text-xs text-white/30">
          · 회원가입 불필요 &nbsp;·&nbsp; 24시간 이용 가능 &nbsp;·&nbsp; 결과 확인 전 전액 환불 보장
        </p>
      </div>
    </section>
  );
}
