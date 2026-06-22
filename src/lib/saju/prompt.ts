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
const SYSTEM_BASE = `당신은 정통 명리학 기반의 사주 분석 전문가입니다.

[절대 규칙]
- 첫 문장에서 바로 결론을 말한다. 서론 없이 시작한다.
- 단정문으로 쓴다. "~입니다", "~합니다"로 끝낸다.
- "~인 것 같다", "~의 흐름으로", "~할 수 있을 것 같다", "~경향이 있습니다", "~가능성이 높습니다" — 이 표현들은 절대 사용하지 않는다.
- 구체적인 연도(2026년, 2027년)와 나이(만 OO세)를 명시한다.
- 한 문장에 한 가지 내용만 담는다.
- 행동 묘사로 쓴다. "적극적으로 나서야 합니다", "연락을 먼저 끊어야 합니다" 식으로.
- 천간지지, 십성, 대운, 세운, 월운, 합충형 등 명리학적 근거를 반드시 언급한다.
- 부모복, 재물 버는 방식, 남편운, 자식운은 절대 언급하지 않는다.
- 틀리기 쉬운 내용(구체적 인물 묘사, 직업 단정, 질병 단정)은 과감하게 삭제한다.
- 마크다운 헤딩(##, ###)과 줄바꿈을 적극 활용해 가독성을 높인다.
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

위 명식 데이터를 바탕으로 아래 두 섹션을 작성하라.
각 섹션은 2000자 내외로 작성한다.
이름은 첫 번째 섹션 시작 부분에 딱 한 번만 자연스럽게 언급하고, 이후에는 절대 사용하지 않는다.

## 섹션 1: 나의 사주 핵심 성향

작성 기준:
- 일간(日干)을 중심으로 성향을 분석한다.
- 격국과 용신을 명시하고 어떤 의미인지 풀어쓴다.
- 신강/신약 여부와 그것이 삶에 어떻게 나타나는지 행동으로 묘사한다.
- 십성 배치에서 드러나는 대인관계 패턴을 구체적으로 쓴다.
- 강점 3가지, 보완점 2가지를 각각 명리학적 근거와 함께 단정문으로 쓴다.
- 합충형해파가 있으면 그것이 성격에 미치는 영향을 설명한다.

## 섹션 2: ${input.currentYear}년 병오년 총운

작성 기준:
- 첫 문장: "${input.currentYear}년 당신의 한 해는 [한 줄 결론]입니다." 형식으로 시작한다.
- 세운(병오년) 천간지지가 일간과 어떤 관계인지 명리학적으로 설명한다.
- 대운과 세운이 겹치는 지점에서 발생하는 변화를 구체적으로 쓴다.
- 상반기(1~6월)와 하반기(7~12월)를 나눠서 흐름을 설명한다.
- 이 해에 반드시 해야 할 행동 3가지를 단정문으로 쓴다.
- 이 해에 반드시 피해야 할 행동 2가지를 단정문으로 쓴다.`,
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
각 월마다 2000자 내외로 작성한다. 이름은 절대 사용하지 않는다.

각 월 작성 형식:
## OO월 (지지월 명칭 — 예: 인월, 묘월)

### 이달의 핵심
[한 줄 결론 — 단정문으로]

### 직업 / 커리어
- 월간(月干)과 일간의 관계를 명리학적으로 설명
- 이달에 해야 할 행동을 구체적으로 명시
- 피해야 할 행동도 명시

### 관계 / 감정
- 이달의 관계 흐름을 명리학 근거와 함께 설명
- 구체적인 행동 지침 제시

### 이달의 행동 지침
- 반드시 해야 할 것 2가지 (단정문)
- 반드시 피해야 할 것 1가지 (단정문)

1월부터 6월까지 위 형식으로 빠짐없이 작성하라.`,
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
각 월마다 2000자 내외로 작성한다. 이름은 절대 사용하지 않는다.

각 월 작성 형식:
## OO월 (지지월 명칭)

### 이달의 핵심
[한 줄 결론 — 단정문으로]

### 직업 / 커리어
- 월간(月干)과 일간의 관계를 명리학적으로 설명
- 이달에 해야 할 행동을 구체적으로 명시
- 피해야 할 행동도 명시

### 관계 / 감정
- 이달의 관계 흐름을 명리학 근거와 함께 설명
- 구체적인 행동 지침 제시

### 이달의 행동 지침
- 반드시 해야 할 것 2가지 (단정문)
- 반드시 피해야 할 것 1가지 (단정문)

7월부터 12월까지 위 형식으로 빠짐없이 작성하라.

---

**두 번째: ${input.currentYear}년 핵심 조언**

## ${input.currentYear}년 당신에게 가장 중요한 조언

작성 기준:
- 대운과 세운 흐름을 종합해 지금 이 시기가 인생 전체에서 어떤 위치인지 설명한다.
- 향후 3년(${input.currentYear}~${input.currentYear + 2}년) 흐름을 대운 기준으로 짧게 조망한다.
- 이 시기에 집중해야 할 핵심 영역 2가지를 단정문으로 제시한다.
- 이 시기를 낭비하게 만드는 함정 2가지를 단정문으로 경고한다.
- 마지막 문단: 이 사주가 가진 가장 큰 잠재력을 한 단락으로 마무리한다.
- 2000자 내외로 작성한다.`,
  };
}
