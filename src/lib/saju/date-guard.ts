// =====================================================
// 결과지 "지나간 시기" 방지
// =====================================================
// 프롬프트에 연도만 주면 AI가 "6월에 연락이 와요", "올봄이 기회예요"처럼
// 결제 시점보다 이미 지난 달을 예측으로 써버린다(고객 취소 원인).
// 오늘 날짜(한국 시간)를 명시하고, 모든 예측 시기를 오늘 이후로만 쓰도록 강제한다.

export type YMD = { y: number; m: number; d: number };

/** 한국 시간 기준 오늘 날짜 (서버는 UTC로 돌기 때문에 +9시간 보정) */
export function todayKst(now: Date = new Date()): YMD {
  const k = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return { y: k.getUTCFullYear(), m: k.getUTCMonth() + 1, d: k.getUTCDate() };
}

function addMonths(y: number, m: number, n: number): { y: number; m: number } {
  const idx = y * 12 + (m - 1) + n;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

/**
 * 프롬프트에 넣을 [오늘 날짜 + 시기 표기 규칙] 블록.
 * @param targetYear 결과지의 기준 연도. 신년운세처럼 올해보다 뒤의 해를 보는 상품이면
 *                   그 해 1~12월 전체가 미래이므로 "올해" 재해석 규칙을 쓰지 않는다.
 */
export function timingGuardBlock(targetYear?: number, today: YMD = todayKst()): string {
  const { y, m, d } = today;
  // 이번 달이 얼마 안 남았으면 가장 이른 예측 시기를 다음 달로 잡는다.
  const earliest = d <= 20 ? { y, m } : addMonths(y, m, 1);
  const earliestLabel = d <= 20 ? `${y}년 ${m}월 하순` : `${earliest.y}년 ${earliest.m}월`;
  const windowEnd = addMonths(y, m, 11);
  const windowLabel = `${y}년 ${m}월 ~ ${windowEnd.y}년 ${windowEnd.m}월`;

  const yearRule = targetYear && targetYear > y
    ? `- 이 결과지의 "올해"는 ${targetYear}년(1~12월)을 뜻하며, 모두 오늘 이후의 미래다. 그 전까지 남은 ${y}년 ${m}월 이후의 흐름은 필요하면 짧게 덧붙일 수 있다.`
    : `- 섹션 지시문의 "올해", "상반기/하반기", "1~12월", "올봄/올여름" 같은 표현은 "오늘부터 앞으로 12개월(${windowLabel})"로 바꿔 해석한다. 이미 지난 달은 "지나온 흐름"으로 한 줄만 언급할 수 있고, 예측·추천 시기로는 절대 쓰지 않는다.`;

  return `[오늘 날짜 — 고객이 결제하고 이 결과지를 읽는 날]
${y}년 ${m}월 ${d}일 (한국 시간)

[시기 표기 규칙 — 절대 준수]
- 연락·재회·고백·기회·주의·이직·임신 등 "앞으로 일어날 시기"는 반드시 오늘 이후로만 쓴다. 가장 이른 예측 시기는 ${earliestLabel}이다.
- 오늘(${y}년 ${m}월 ${d}일)보다 이전의 달·계절·연도를 앞으로 일어날 일처럼 쓰지 않는다. (예: 오늘이 ${m}월인데 이미 지난 달에 "연락이 와요", "기회가 와요"라고 쓰는 것은 금지)
${yearRule}
- 시기를 말할 때는 "${earliest.y}년 ${earliest.m}월"처럼 연도와 월을 함께 쓴다.`;
}
