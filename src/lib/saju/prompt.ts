// =====================================================
// 사주 해석 프롬프트 빌더
// =====================================================

import type { Myeongsik } from "./manseryeok";

// orders/confirm 에서 사용하는 레거시 타입 — DB 기반 플로우용
export type LegacyPromptInput = {
  productSlug: string;
  productName: string;
  myeongsik: Myeongsik;
  manseryeokText?: string;
  birthDate: string;
  birthTime: string | null;
  timeUnknown: boolean;
  gender: "male" | "female";
  concerns: string[];
};

const LEGACY_SYSTEM = `당신은 정통 명리학 기반의 사주 분석 전문가입니다.
- 첫 문장에서 바로 결론을 말한다.
- 단정문으로 쓴다.
- 구체적인 연도와 나이를 명시한다.
- 명리학적 근거를 반드시 언급한다.
- 한국어로 작성한다.`;

export function buildSajuPrompt(input: LegacyPromptInput): { system: string; user: string } {
  const m = input.myeongsik;
  const pillar = (p: { cheongan: string; jiji: string } | null) =>
    p ? `${p.cheongan}${p.jiji}` : "(시 미상)";

  const sajuSection = input.manseryeokText
    ? `[사주 풀 명식]\n${input.manseryeokText}`
    : [
        `[사주 4기둥]`,
        `- 년주: ${pillar(m.year)}`,
        `- 월주: ${pillar(m.month)}`,
        `- 일주: ${pillar(m.day)}`,
        `- 시주: ${pillar(m.hour)}`,
      ].join("\n");

  const user = `[상품] ${input.productName}
${sajuSection}
[생년월일] ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
[성별] ${input.gender === "male" ? "남성" : "여성"}
[고민] ${input.concerns.length > 0 ? input.concerns.join(", ") : "(미입력)"}

위 정보를 바탕으로 마크다운 리포트를 작성해 주세요.`;

  return { system: LEGACY_SYSTEM, user };
}

export type PromptInput = {
  productSlug: string;
  productName: string;
  manseryeokText: string;
  name: string;
  birthDate: string;
  birthTime: string | null;
  timeUnknown: boolean;
  gender: "male" | "female";
  currentYear: number;
  currentAge: number;
  tarotCard?: { name: string; keyword: string; advice: string } | null;
};

// ── 공통 시스템 프롬프트 ──────────────────────────────
const SYSTEM_BASE = `당신은 정통 명리학 기반의 사주 분석 전문가입니다. 수십 년 경력의 명리학자처럼 사주 원국 데이터를 꿰뚫어 읽고, 읽는 사람이 "어? 나 얘기잖아!", "오, 잘 맞는데!"라고 느낄 만큼 구체적이고 날카로운 통찰을 전달합니다.

[핵심 원칙 — 절대 준수]

▶ 구체성: 만세력 데이터에서 실제 천간·지지·십성·합충 정보를 직접 인용해 서술한다.
예) "일간 경금(庚金)은 단단한 바위 같은 의지력을 상징해요" → "경금(庚金) 일간에 임수(壬水) 식신이 월지에 뿌리를 내리고 있어서, OO님은 아이디어를 구체적인 말과 글로 풀어내는 능력이 탁월해요"처럼 사주 원국의 실제 정보를 반드시 넣는다.

▶ 추상어 금지: 아래 표현은 절대 쓰지 않는다.
금지 표현 예시: "당신은 특별한 사람이에요", "무한한 가능성이 있어요", "좋은 일이 생길 거예요", "긍정적인 에너지", "균형을 맞추세요", "자신을 믿으세요", "새로운 시작", "마음의 준비", "변화의 바람", "밝은 미래"
→ 이런 표현은 사주를 전혀 보지 않아도 쓸 수 있는 말이라 신뢰를 떨어뜨린다. 금지.

▶ 신뢰감 만들기: 읽는 사람의 실제 삶 패턴을 짚어주는 문장을 반드시 포함한다.
예) "경금 일간에 비겁이 강한 사주는 혼자 결정하는 걸 좋아하고, 남이 자기 일에 간섭하면 본능적으로 거부감이 생겨요 — 맞죠?" 이런 식으로 공감을 유도한다.

▶ 운세 서술 방식: 막연히 "좋다/나쁘다"가 아닌, "왜 그 시기에 그 에너지가 오는지" 명리학 근거를 반드시 설명한다.
예) "올해 재물이 들어오기 어려워요" (X) → "올해 병오년 병화가 OO님 일간 경금과 충(沖)을 이뤄서, 재성이 불안정해져요. 특히 3월·9월에 지출이 갑자기 생길 수 있으니 여유 자금을 꼭 마련해두세요." (O)

[말투 규칙]
- 말투: "~이에요", "~랍니다", "~거든요", "~해요" 등 친근하고 따뜻한 경어체
- 절대 금지: "~입니다", "~합니다" 격식체 / "~인 것 같다", "~가능성이 높습니다" 모호한 표현
- 이름을 자주 불러준다: "OO님은", "OO님의"
- 첫 문장은 그 단락의 핵심을 날카롭게 요약한 한 줄로 시작한다
- 마크다운 헤딩(##)으로 소제목을 구분하고, 소제목은 감성적이고 시적인 한 줄 문장으로 만든다
- 각 소제목 단락은 문단 2~3개로 작성하고, 문단 사이 빈 줄을 넣는다
- 구체적인 연도(2026년, 2027년)와 나이를 명시한다
- ⚠️ 나이는 절대 직접 계산하지 않는다. [분석 대상]에 적힌 "현재 나이: 만 OO세"를 그대로 사용한다
- 한국어로 작성한다
- ⚠️ 절대 중간에 끊기지 않는다. 요청한 모든 섹션(##)을 반드시 마지막 문장까지 완전히 작성한다. 공간이 부족하면 문단을 줄이더라도 모든 섹션을 완성한다`;

const BASIC_INFO = (input: PromptInput) => `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년

[만세력 명식 데이터]
${input.manseryeokText}

[작성 규칙]
- 각 섹션마다 문단 2개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
- 사주팔자와 자미두수를 각 섹션에서 자연스럽게 통합해 서술한다.
- ${input.name}님을 자주 불러주고 친근한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
- 명리학·자미두수 용어는 반드시 쉬운 말로 바로 풀어 설명한다.
- ⚠️ 모든 섹션을 반드시 완성한다. 절대 중간에 끊기지 않는다.`;

// ── 베이직: 섹션 1 — 타고난 기질 + 강점과 재능 + 삶의 패턴 ─────────────
export function buildBasicSection1(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${BASIC_INFO(input)}

---

아래 3개 섹션을 작성하라. 각 섹션에서 사주팔자와 자미두수를 함께 엮어 서술한다.

## ✨ 타고난 기질 — [${input.name}님만의 감성적 한 줄 소제목]

사주 일간의 음양오행 특성과 신강/신약 여부를 쉬운 말로 풀어 쓴다.

자미두수 명궁(命宮)의 주성(主星)이 무엇인지 설명하고, 이것이 사주 일간과 어떻게 공명하는지 연결해 서술한다. "사주에서도, 자미두수에서도 ${input.name}님은 OO한 사람이에요"라는 식으로 두 시스템이 같은 말을 한다는 신뢰감을 준다.

이 기질을 가진 사람이 삶에서 반복적으로 경험하는 패턴을 공감 어린 시각으로 마무리한다.

## 💎 강점과 재능 — [${input.name}님만의 감성적 한 줄 소제목]

사주 십성 배치에서 드러나는 ${input.name}님만의 재능과 강점 3가지를 명리학 근거와 함께 설명한다.

자미두수 재능 관련 성계(문창성·문곡성·천기성 등)가 ${input.name}님 명반에서 어떻게 작용하는지 설명하고, 사주의 강점과 겹치는 지점을 짚어준다.

이 강점들이 실생활에서 어떻게 발휘될 수 있는지 구체적인 예시와 함께 보완점 2가지도 따뜻하게 전달한다.

## 🔄 삶의 패턴 — [${input.name}님만의 감성적 한 줄 소제목]

사주 합충형해 등 명리학 요소에서 드러나는 ${input.name}님의 반복적 인생 패턴을 설명한다.

자미두수 천이궁(遷移宮)·복덕궁(福德宮) 분석을 통해 ${input.name}님이 어떤 환경에서 꽃피우는지, 어떤 상황에서 막히는지를 추가로 풀어 쓴다.

이 패턴을 알면 어떻게 더 지혜롭게 살아갈 수 있는지 실질적이고 따뜻한 조언으로 마무리한다.`,
  };
}

// ── 베이직: 섹션 2 — 2026 총운 + 직업운 + 재물운 ───────────────────────
export function buildBasicSection2(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${BASIC_INFO(input)}

---

아래 3개 섹션을 작성하라. 각 섹션에서 사주팔자와 자미두수를 함께 엮어 서술한다.

## 🌟 ${input.currentYear}년 총운 — [${input.name}님만의 감성적 한 줄 소제목]

${input.currentYear}년 병오년 세운의 천간 병화(丙火)와 지지 오화(午火)가 ${input.name}님 일간과 어떤 관계인지 설명하고, 올해 전체 에너지의 방향을 서술한다.

자미두수 기준 ${input.name}님의 현재 대한(大限) 흐름과 ${input.currentYear}년 소한(小限)이 어느 궁위에 해당하는지 설명하고, 사주 세운과 자미두수 소한이 함께 가리키는 올해의 핵심 메시지를 전달한다.

상반기(1~6월)와 하반기(7~12월)의 흐름 차이를 구체적으로 서술하고, 올해 가장 중요한 시기가 언제인지 명확히 짚어준다.

## 💼 직업 / 커리어운 — [${input.name}님만의 감성적 한 줄 소제목]

사주 관성(官星)·식상(食傷) 흐름을 바탕으로 ${input.currentYear}년 직업운을 분석한다. 직장인이라면 승진·이직·인정받는 시기를, 사업자라면 확장·전환·협업 기회를 명리학 근거와 함께 설명한다.

자미두수 관록궁(官祿宮)의 성계 배치와 올해 소한의 영향을 추가로 분석해, 사주와 자미두수가 동시에 가리키는 커리어 방향을 따뜻하게 전달한다.

올해 커리어에서 반드시 해야 할 것 2가지, 절대 피해야 할 것 1가지를 단정문으로 마무리한다.

## 💰 재물운 — [${input.name}님만의 감성적 한 줄 소제목]

사주 재성(財星) 흐름을 바탕으로 ${input.currentYear}년 수입·지출·투자 흐름을 분석한다. 재물이 들어오는 시기와 새어나가는 시기를 구체적으로 짚어준다.

자미두수 재백궁(財帛宮)의 성계 배치를 추가로 분석해 ${input.name}님의 타고난 재물 성향과 올해 재물운의 합을 설명한다. 두 시스템이 공통으로 말하는 재물 전략을 전달한다.

올해 재물 관리에서 반드시 해야 할 것 2가지, 절대 피해야 할 것 1가지를 단정문으로 마무리한다.`,
  };
}

// ── 베이직: 섹션 3 — 연애/관계운 + 건강운 + 자미두수 종합 ────────
export function buildBasicSection3(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${BASIC_INFO(input)}

---

아래 3개 섹션을 작성하라. 각 섹션에서 사주팔자와 자미두수를 함께 엮어 서술한다.

## 💕 연애 / 관계운 — [${input.name}님만의 감성적 한 줄 소제목]

사주 관성·식상·비겁 흐름으로 ${input.currentYear}년 연애운과 인간관계를 분석한다. 미혼이라면 새 인연, 기혼이라면 부부·가족 관계 변화를 명리학 근거와 함께 설명한다.

자미두수 부처궁·교우궁 성계를 추가 분석해 ${input.name}님의 관계 방식과 올해 인연 흐름을 더 깊이 풀어 쓰고, 올해 관계에서 해야 할 것 2가지·조심할 것 1가지를 단정문으로 마무리한다.

## 🌿 건강 + 대운 — [${input.name}님만의 감성적 한 줄 소제목]

사주 오행 불균형과 세운 충형 기운으로 주의해야 할 신체 부위를 설명하고, 현재 대운의 천간지지가 이 시기 ${input.name}님 인생에서 어떤 의미인지 함께 서술한다.

자미두수 질액궁 성계와 현재 대한(大限) 에너지를 추가 분석해 건강 약점과 대운의 핵심 방향을 함께 전달한다. 앞으로 ${input.currentYear + 1}~${input.currentYear + 2}년 흐름도 따뜻하게 조망한다.

## ✦✦✦ 자미두수 심층 분석 ✦✦✦

위는 UI 배너입니다. 아래 섹션부터 작성한다.

## 🌌 자미두수 종합 운세 — [${input.name}님만의 감성적 한 줄 소제목]

${input.name}님의 자미두수 명반 전체를 종합해 타고난 운명의 큰 그림을 그려준다. 명궁(命宮)의 주성과 보좌성이 어우러져 만드는 인생 테마를 감성적으로 풀어 쓴다.

사주팔자와 자미두수가 공통으로 말하는 단 하나의 핵심 메시지를 따뜻하고 단호하게 전달하며, ${input.name}님이 "맞아, 나 이런 사람이야"라고 느낄 수 있도록 깊이 공감하는 문장으로 마무리한다.`,
  };
}

// ── 프리미엄: 공통 정보 블록 ────────────────────────────────────────────
const PREMIUM_INFO = (input: PromptInput) => `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년

[만세력 명식 데이터]
${input.manseryeokText}

[선택한 타로 카드]
카드명: ${input.tarotCard?.name ?? "없음"}
키워드: ${input.tarotCard?.keyword ?? "없음"}
카드 메시지: ${input.tarotCard?.advice ?? "없음"}

[작성 규칙]
- 각 섹션마다 문단 2개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
- 사주팔자·자미두수·타로 세 가지를 자연스럽게 통합해 서술한다.
- 타로 카드는 억지로 끼워넣지 말고, 사주·자미두수 분석을 "타로가 확인해준다"는 방식으로 자연스럽게 언급한다.
- ${input.name}님을 자주 불러주고 친근한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
- 명리학·자미두수 용어는 반드시 쉬운 말로 바로 풀어 설명한다.
- ⚠️ 모든 섹션을 반드시 완성한다. 절대 중간에 끊기지 않는다.`;

// ── 프리미엄: 섹션 1 — 타고난 기질 + 강점과 재능 + 삶의 패턴 ────────────
export function buildPremiumSection1(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${PREMIUM_INFO(input)}

---

아래 3개 섹션을 작성하라. 사주·자미두수·타로를 자연스럽게 통합해 서술한다.

## ✨ 타고난 기질 — [${input.name}님만의 감성적 한 줄 소제목]

사주 일간의 음양오행 특성과 신강/신약 여부를 쉬운 말로 풀어 쓴다.

자미두수 명궁(命宮)의 주성이 사주 일간과 어떻게 공명하는지 연결해 서술한다. 그리고 ${input.name}님이 선택한 타로 카드 "${input.tarotCard?.name}"의 키워드 "${input.tarotCard?.keyword}"가 이 기질과 어떻게 연결되는지 자연스럽게 언급한다.

이 기질을 가진 사람이 삶에서 반복적으로 경험하는 패턴을 공감 어린 시각으로 마무리한다.

## 💎 강점과 재능 — [${input.name}님만의 감성적 한 줄 소제목]

사주 십성 배치에서 드러나는 ${input.name}님만의 재능과 강점 3가지를 명리학 근거와 함께 설명한다.

자미두수 재능 성계가 ${input.name}님 명반에서 어떻게 작용하는지 설명하고, 두 시스템이 공통으로 가리키는 핵심 재능을 짚어준다.

보완하면 좋을 점 2가지도 따뜻하게 전달하며 마무리한다.

## 🔄 삶의 패턴 — [${input.name}님만의 감성적 한 줄 소제목]

사주 합충형해 요소에서 드러나는 ${input.name}님의 반복적 인생 패턴을 설명한다.

자미두수 천이궁·복덕궁 분석으로 ${input.name}님이 어떤 환경에서 꽃피우는지 추가로 풀어 쓴다. 선택한 타로 카드의 메시지 "${input.tarotCard?.advice}"가 이 패턴과 어떤 연관이 있는지 한 줄로 자연스럽게 연결한다.

이 패턴을 알면 어떻게 더 지혜롭게 살아갈 수 있는지 따뜻한 조언으로 마무리한다.`,
  };
}

// ── 프리미엄: 섹션 2 — 2026 총운 + 직업운 + 재물운 ─────────────────────
export function buildPremiumSection2(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${PREMIUM_INFO(input)}

---

아래 3개 섹션을 작성하라. 사주·자미두수·타로를 자연스럽게 통합해 서술한다.

## 🌟 ${input.currentYear}년 총운 — [${input.name}님만의 감성적 한 줄 소제목]

${input.currentYear}년 병오년 세운이 ${input.name}님 일간과 어떤 관계인지 설명하고 올해 전체 에너지 방향을 서술한다.

자미두수 현재 대한과 소한이 어느 궁위에 해당하는지 설명하고, 사주 세운과 자미두수 소한이 함께 가리키는 올해의 핵심 메시지를 전달한다. 선택한 타로 카드 "${input.tarotCard?.name}"가 올해 흐름을 어떻게 확인해주는지 자연스럽게 언급한다.

상반기(1~6월)와 하반기(7~12월)의 흐름 차이를 구체적으로 서술하고 올해 가장 중요한 시기를 짚어준다.

## 💼 직업 / 커리어운 — [${input.name}님만의 감성적 한 줄 소제목]

사주 관성·식상 흐름으로 ${input.currentYear}년 직업운을 분석한다. 직장인이라면 승진·이직, 사업자라면 사업 흐름을 명리학 근거와 함께 설명한다.

자미두수 관록궁 성계와 올해 소한의 영향을 추가 분석해 사주와 자미두수가 동시에 가리키는 커리어 방향을 전달한다.

올해 커리어에서 반드시 해야 할 것 2가지, 절대 피해야 할 것 1가지를 단정문으로 마무리한다.

## 💰 재물운 — [${input.name}님만의 감성적 한 줄 소제목]

사주 재성 흐름으로 ${input.currentYear}년 수입·지출·투자 흐름을 분석하고 재물이 들어오는 시기와 주의 시기를 짚어준다.

자미두수 재백궁 성계를 추가 분석해 ${input.name}님의 타고난 재물 성향과 올해 재물운의 합을 설명한다.

올해 재물 관리에서 반드시 해야 할 것 2가지, 절대 피해야 할 것 1가지를 단정문으로 마무리한다.`,
  };
}

// ── 프리미엄: 섹션 3 — 연애/관계운 + 건강운 + 대운 10년 + 타로 종합 ─────
export function buildPremiumSection3(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${PREMIUM_INFO(input)}

---

아래 4개 섹션을 작성하라. 사주·자미두수·타로를 자연스럽게 통합해 서술한다.

## 💕 연애 / 관계운 — [${input.name}님만의 감성적 한 줄 소제목]

사주 관성·식상·비겁 흐름으로 ${input.currentYear}년 연애운과 인간관계를 분석한다. 미혼이라면 새 인연, 기혼이라면 부부·가족 관계 변화를 명리학 근거와 함께 설명한다.

자미두수 부처궁·교우궁 성계를 추가 분석해 ${input.name}님의 관계 방식과 올해 인연 흐름을 더 깊이 풀어 쓴다.

올해 관계에서 반드시 해야 할 것 2가지, 조심해야 할 것 1가지를 단정문으로 마무리한다.

## 🌿 건강운 — [${input.name}님만의 감성적 한 줄 소제목]

사주 오행 불균형과 ${input.currentYear}년 세운 충형 기운으로 주의해야 할 신체 부위와 건강 흐름을 설명한다.

자미두수 질액궁 성계 분석을 추가해 ${input.name}님의 타고난 건강 약점과 올해 특히 주의할 시기를 함께 서술한다.

올해 건강을 지키기 위해 실천할 수 있는 구체적인 생활 습관 3가지를 따뜻하게 제시한다.

## 🔭 현재 대운 10년 — [${input.name}님만의 감성적 한 줄 소제목]

사주 기준 현재 대운의 천간지지를 설명하고 이 10년이 인생 전체에서 어떤 의미인지 서술한다.

자미두수 기준 현재 대한의 주성과 에너지를 추가 분석해, 사주 대운과 자미두수 대한이 동시에 가리키는 이 시기의 핵심 방향을 전달한다.

이 대운 안에서 ${input.currentYear}년이 특별히 중요한 이유와 앞으로 ${input.currentYear + 1}~${input.currentYear + 2}년 흐름 변화를 따뜻하게 조망한다.

## 🃏 타로 × 사주 × 자미두수 종합 운세 — [${input.name}님만의 감성적 한 줄 소제목]

${input.name}님이 선택한 타로 카드 "${input.tarotCard?.name}"의 키워드 "${input.tarotCard?.keyword}"가 이 분석 전체에서 어떤 의미를 갖는지 풀어 쓴다. 카드의 메시지 "${input.tarotCard?.advice}"를 ${input.name}님의 사주·자미두수 흐름과 연결해 "우주가 같은 말을 하고 있다"는 신뢰감을 전달한다.

사주·자미두수·타로 세 시스템이 공통으로 강조하는 ${input.name}님에 대한 핵심 메시지를 하나로 통합해 단정문으로 제시한다. 이 메시지가 왜 지금 이 시기에 중요한지 깊이 풀어 쓴다.

${input.name}님이 가진 가장 큰 잠재력을 따뜻하고 희망차게 마무리하며, 앞으로의 시간이 기대되도록 감성적인 문장으로 끝맺는다.`,
  };
}

// ── 단품: 섹션 1 — 타고난 기질 + 강점과 재능 + 삶의 패턴 + 2026 총운 ──
export function buildDanpumSection1(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년

[만세력 명식 데이터]
${input.manseryeokText}

---

위 명식을 바탕으로 아래 4개 섹션을 작성하라.
각 섹션마다 문단을 2~3개로 나눠 작성한다. 문단 사이에는 빈 줄을 넣어 읽기 쉽게 한다.
각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
${input.name}님을 자주 불러주고 친근하고 따뜻한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.

## ✨ 타고난 기질 — [${input.name}님만의 감성적 한 줄 소제목]

${input.name}님의 일간을 중심으로 타고난 기질과 삶의 방식을 설명한다.
일간의 음양오행 특성과 신강/신약 여부를 쉬운 말로 풀어 쓴다.
이 사주를 가진 사람이 어떤 삶의 방식을 갖는지 공감 어린 시각으로 서술한다.

## 💎 강점과 재능 — [${input.name}님만의 감성적 한 줄 소제목]

십성 배치에서 드러나는 ${input.name}님만의 재능과 강점 3가지를 명리학적 근거와 함께 설명한다.
이 강점이 실생활에서 어떻게 발휘되는지 구체적인 예시로 풀어 쓴다.
보완하면 좋을 점 2가지도 따뜻하게 전달한다.

## 🔄 삶의 패턴 — [${input.name}님만의 감성적 한 줄 소제목]

${input.name}님이 인생에서 반복적으로 경험하는 패턴을 합충형 등 명리학 근거와 함께 설명한다.
인간관계, 일, 감정에서 나타나는 특징적인 흐름을 공감 어린 시각으로 풀어 쓴다.
이 패턴을 알면 어떻게 더 잘 살아갈 수 있는지 실질적인 조언을 덧붙인다.

## 🌟 ${input.currentYear}년 총운 — [${input.name}님만의 감성적 한 줄 소제목]

${input.currentYear}년 병오년 세운이 ${input.name}님의 일간과 어떤 관계인지 설명한다.
대운과 세운이 겹치는 지점에서 올해 가장 큰 변화와 기회가 무엇인지 구체적으로 서술한다.
상반기(1~6월)와 하반기(7~12월)의 흐름을 각각 따뜻하게 풀어 쓴다.`,
  };
}

// ── 단품: 섹션 2 — 직업/커리어운 + 재물운 + 연애/관계운 ──────
export function buildDanpumSection2(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년

[만세력 명식 데이터]
${input.manseryeokText}

---

위 명식을 바탕으로 아래 3개 섹션을 작성하라.
각 섹션마다 문단을 2~3개로 나눠 작성한다. 문단 사이에는 빈 줄을 넣어 읽기 쉽게 한다.
각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
${input.name}님을 자주 불러주고 친근하고 따뜻한 말투로 쓴다.

## 💼 직업 / 커리어운 — [${input.name}님만의 감성적 한 줄 소제목]

${input.currentYear}년 ${input.name}님의 관성과 식상 흐름을 바탕으로 직업운을 분석한다.
직장인이라면 승진/이직 흐름, 사업자라면 사업 확장/전환 흐름을 명리학 근거와 함께 설명한다.
올해 커리어에서 반드시 해야 할 것 2가지와 피해야 할 것 1가지를 단정문으로 제시한다.

## 💰 재물운 — [${input.name}님만의 감성적 한 줄 소제목]

${input.currentYear}년 ${input.name}님의 재성 흐름을 바탕으로 재물운을 분석한다.
수입, 지출, 투자, 저축에 대한 구체적인 흐름과 주의 시기를 설명한다.
올해 재물 관리에서 반드시 해야 할 것 2가지와 피해야 할 것 1가지를 단정문으로 제시한다.

## 💕 연애 / 관계운 — [${input.name}님만의 감성적 한 줄 소제목]

${input.currentYear}년 ${input.name}님의 관성/식상 흐름으로 연애운과 인간관계를 분석한다.
미혼이라면 새로운 인연, 기혼이라면 부부/가족 관계의 흐름을 명리학 근거와 함께 설명한다.
올해 관계에서 반드시 해야 할 것 2가지와 피해야 할 것 1가지를 단정문으로 제시한다.`,
  };
}

// ── 단품: 섹션 3 — 건강운 + 상반기vs하반기 + 핵심 조언 ────────
export function buildDanpumSection3(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년

[만세력 명식 데이터]
${input.manseryeokText}

---

위 명식을 바탕으로 아래 3개 섹션을 작성하라.
각 섹션마다 문단을 2~3개로 나눠 작성한다. 문단 사이에는 빈 줄을 넣어 읽기 쉽게 한다.
각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
${input.name}님을 자주 불러주고 친근하고 따뜻한 말투로 쓴다.

## 🌿 건강운 — [${input.name}님만의 감성적 한 줄 소제목]

${input.currentYear}년 ${input.name}님의 사주에서 주의해야 할 신체 부위와 건강 흐름을 설명한다.
오행 불균형이나 충형 등으로 생길 수 있는 건강 약점을 쉬운 말로 풀어 쓴다.
올해 건강을 지키기 위해 실천할 수 있는 구체적인 생활 습관 조언을 제시한다.

## ⚖️ 상반기 vs 하반기 — [${input.name}님만의 감성적 한 줄 소제목]

${input.currentYear}년 상반기(1~6월)의 전체 흐름을 대운·세운 기준으로 따뜻하게 풀어 쓴다.
하반기(7~12월)의 전체 흐름을 상반기와 비교하며 변화 포인트를 구체적으로 설명한다.
상반기와 하반기 중 ${input.name}님에게 더 중요한 시기가 언제인지, 왜 그런지 설명한다.

## 🔮 ${input.currentYear}년 핵심 조언 — [${input.name}님만의 감성적 한 줄 소제목]

대운과 세운을 종합해 지금 이 시기가 ${input.name}님 인생 전체에서 어떤 위치인지 설명한다.
올해 반드시 집중해야 할 핵심 영역 2가지를 단정문으로 제시하고 이유를 풀어 쓴다.
이 사주가 가진 가장 큰 잠재력과 앞으로 ${input.currentYear + 1}~${input.currentYear + 2}년의 흐름을 따뜻하게 마무리한다.`,
  };
}
