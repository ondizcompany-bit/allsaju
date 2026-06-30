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
};

// ── 공통 시스템 프롬프트 ──────────────────────────────
const SYSTEM_BASE = `당신은 정통 명리학 기반의 따뜻하고 공감력 있는 사주 분석 전문가입니다.

[말투 및 문체 규칙 — 절대 준수]
- 말투: "~이에요", "~랍니다", "~거든요", "~해요", "~답니다" 등 친근하고 따뜻한 경어체로 쓴다.
- 절대 사용 금지: "~입니다", "~합니다" 같은 딱딱한 격식체. "~인 것 같다", "~가능성이 높습니다" 같은 모호한 표현.
- 이름을 자주 불러준다: "OO님은", "OO님의" 형태로 공감과 친밀감을 준다.
- 첫 문장은 그 단락의 핵심을 감성적으로 요약한 한 줄로 시작한다.
- 명리학 용어(천간지지, 십성, 대운, 세운, 합충형 등)를 반드시 언급하되, 바로 뒤에 쉬운 말로 풀어서 설명한다.
- 구체적인 연도(2026년, 2027년)와 나이(만 OO세)를 명시한다.
- 각 소제목 단락은 반드시 200자 이상의 긴 문단 2~3개로 작성한다.
- 마크다운 헤딩(##)으로 소제목을 구분하고, 소제목은 감성적이고 시적인 한 줄 문장으로 만든다.
- 한국어로 작성한다.`;

// ── 단품: 섹션 1 — 핵심 성향 + 2026 총운 ──────────────
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

위 명식 데이터를 바탕으로 아래 내용을 작성하라.
각 소제목 단락마다 반드시 300자 이상의 문단 2~3개를 작성한다. 절대 짧게 쓰지 않는다.
이름(${input.name}님)을 자주 불러주며 친근하고 따뜻하게 서술한다.

## [감성적 한 줄 소제목] 핵심 성향 1

${input.name}님의 일간을 중심으로 타고난 기질과 삶의 방식을 따뜻하게 풀어쓴다.
일간의 음양오행적 특성, 신강/신약 여부, 격국과 용신을 쉬운 말로 설명한다.
이 사주를 가진 사람이 반복적으로 겪는 삶의 패턴을 공감 어린 시각으로 서술한다.

## [감성적 한 줄 소제목] 핵심 성향 2

십성 배치(비겁·식상·재성·관성·인성)에서 드러나는 대인관계와 성격 패턴을 구체적으로 서술한다.
합충형해파가 있으면 그것이 성격과 인생에 미치는 영향을 설명한다.
강점 3가지와 보완점 2가지를 명리학적 근거와 함께 따뜻하게 전달한다.

## [감성적 한 줄 소제목] ${input.currentYear}년 총운 1

${input.currentYear}년 병오년 세운의 천간 병화(丙火)와 지지 오화(午火)가 일간과 어떤 관계인지 설명한다.
대운과 세운이 겹치는 지점의 변화를 구체적으로 서술한다.
상반기(1~6월) 흐름을 300자 이상으로 따뜻하게 풀어쓴다.

## [감성적 한 줄 소제목] ${input.currentYear}년 총운 2

하반기(7~12월) 흐름을 300자 이상으로 따뜻하게 풀어쓴다.
재물운·직업운·관계운 흐름을 명리학 근거와 함께 각각 설명한다.
이 해에 반드시 해야 할 것 3가지, 피해야 할 것 2가지를 친근한 말투로 전달한다.`,
  };
}

// ── 단품: 섹션 2 — 1월~6월 월별 운세 ──────────────────
export function buildDanpumSection2(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `[분석 대상]
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년

[만세력 명식 데이터]
${input.manseryeokText}

---

위 명식 데이터를 바탕으로 ${input.currentYear}년 1월부터 6월까지 월별 운세를 작성하라.
각 월마다 반드시 800자 이상 작성한다. 친근하고 따뜻한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
${input.name}님이라고 이름을 자주 불러주며, 6개월 모두 빠짐없이 작성한다.

각 월 작성 형식:
## OO월 (지지월 명칭 — 예: 인월, 묘월)

### 이달의 핵심
[한 줄 결론 — 단정문으로]

### 직업 / 커리어
월간(月干)과 일간의 관계를 명리학적으로 설명한다. 이달의 직업·사업·커리어 흐름을 구체적으로 분석하고, 해야 할 행동과 피해야 할 행동을 명시한다.

### 재물
이달의 재물운 흐름을 명리학 근거와 함께 설명한다. 수입·지출·투자에 대한 구체적 지침을 제시한다.

### 관계 / 감정
이달의 대인관계 및 감정 흐름을 명리학 근거와 함께 설명한다. 연애 중이라면 연인 관계, 미혼이라면 인연 흐름을 분석한다.

### 건강
이달에 주의해야 할 신체 부위와 생활습관을 명리학적 근거와 함께 설명한다.

### 이달의 행동 지침
- 반드시 해야 할 것 2가지 (단정문)
- 반드시 피해야 할 것 1가지 (단정문)

1월부터 6월까지 위 형식으로 빠짐없이 작성하라. 중간에 멈추지 말고 6월까지 완성하라.`,
  };
}

// ── 단품: 섹션 3 — 7월~12월 월별 운세 + 핵심 조언 ────────
export function buildDanpumSection3(input: PromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `[분석 대상]
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년

[만세력 명식 데이터]
${input.manseryeokText}

---

위 명식 데이터를 바탕으로 두 가지를 작성하라.

**첫 번째: ${input.currentYear}년 7월부터 12월까지 월별 운세**
각 월마다 반드시 800자 이상 작성한다. 친근하고 따뜻한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
${input.name}님이라고 이름을 자주 불러주며, 6개월 모두 빠짐없이 작성한다.

각 월 작성 형식:
## OO월 (지지월 명칭)

### 이달의 핵심
[한 줄 결론 — 단정문으로]

### 직업 / 커리어
월간(月干)과 일간의 관계를 명리학적으로 설명한다. 이달의 직업·사업·커리어 흐름을 구체적으로 분석하고, 해야 할 행동과 피해야 할 행동을 명시한다.

### 재물
이달의 재물운 흐름을 명리학 근거와 함께 설명한다. 수입·지출·투자에 대한 구체적 지침을 제시한다.

### 관계 / 감정
이달의 대인관계 및 감정 흐름을 명리학 근거와 함께 설명한다. 연애 중이라면 연인 관계, 미혼이라면 인연 흐름을 분석한다.

### 건강
이달에 주의해야 할 신체 부위와 생활습관을 명리학적 근거와 함께 설명한다.

### 이달의 행동 지침
- 반드시 해야 할 것 2가지 (단정문)
- 반드시 피해야 할 것 1가지 (단정문)

7월부터 12월까지 위 형식으로 빠짐없이 작성하라. 중간에 멈추지 말고 12월까지 완성하라.

---

**두 번째: ${input.currentYear}년 핵심 조언**

## ${input.currentYear}년 당신에게 가장 중요한 조언

작성 기준 (1500자 이상 필수):
- 대운과 세운 흐름을 종합해 지금 이 시기가 인생 전체에서 어떤 위치인지 설명한다.
- 향후 3년(${input.currentYear}~${input.currentYear + 2}년) 흐름을 대운 기준으로 조망한다.
- 이 시기에 집중해야 할 핵심 영역 2가지를 단정문으로 제시한다.
- 이 시기를 낭비하게 만드는 함정 2가지를 단정문으로 경고한다.
- 마지막 문단: 이 사주가 가진 가장 큰 잠재력을 한 단락으로 마무리한다.`,
  };
}
