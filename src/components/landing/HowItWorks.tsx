export function HowItWorks() {
  const steps = [
    { n: "01", t: "상품 선택", d: "오늘의 운세부터 프리미엄 종합 풀이까지" },
    { n: "02", t: "사주 입력", d: "생년월일 · 출생 시각 · 성별 · 고민" },
    { n: "03", t: "결제", d: "토스페이먼츠로 안전하게 결제" },
    { n: "04", t: "결과 확인", d: "맞춤 사주 리포트 즉시 확인" },
  ];

  return (
    <section id="how-it-works" className="container py-20">
      <hr className="divider-purple mb-20" />
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-3">
        <span className="text-gradient">작동 방식</span>
      </h2>
      <p className="text-center text-sm text-body mb-14">
        단 4단계로 나만의 사주 리포트를 받아보세요
      </p>

      <ol className="grid gap-8 md:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s.n}
            className="relative rounded-xl border border-hairline bg-surface-soft p-6 overflow-hidden"
          >
            {/* 배경 넘버 글로우 */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-2 text-[80px] font-black leading-none text-purple-deep/30 select-none"
            >
              {s.n}
            </div>
            {/* 스텝 번호 */}
            <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-gradient text-xs font-bold text-white shadow-purple-glow">
              {i + 1}
            </div>
            <p className="relative text-base font-semibold text-ink mb-1.5">{s.t}</p>
            <p className="relative text-sm text-body leading-relaxed">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
