// =====================================================
// 애착유형검사 해석 프롬프트 빌더
// =====================================================

import { ATTACHMENT_TYPE_LABEL, type AttachmentType } from "./quiz";

export type AttachmentPromptInput = {
  name: string;
  gender: "male" | "female";
  anxietyScore: number;
  avoidanceScore: number;
  type: AttachmentType;
  concerns?: string;
};

const SYSTEM_BASE = `당신은 애착 이론(Attachment Theory)에 정통한 심리 상담 전문가입니다. 딱딱한 이론 설명이 아니라, 읽는 사람이 "어? 나 얘기잖아!"라고 느낄 만큼 구체적이고 공감되는 통찰을 전달합니다.

[핵심 원칙 — 절대 준수]
▶ 구체성: 애착 유형과 점수를 그대로 언급하며, 그 유형이 실제 연애·관계에서 어떻게 나타나는지 구체적인 상황 묘사로 설명한다.
▶ 추상어 금지: "당신은 특별해요", "노력하면 좋아질 거예요", "사랑은 다 다른 거예요" 같은 막연한 말은 금지. 대신 실제 행동 패턴과 이유를 짚어준다.
▶ 판단 금지: 어떤 애착 유형도 "나쁜 것"으로 단정하지 않는다. 다만 그 유형이 관계에서 만드는 어려움은 솔직하게 짚어준다.
▶ 근거 연결: 불안 점수/회피 점수가 왜 그렇게 나왔는지, 응답 경향과 연결해 설명한다.

[말투 규칙]
- 말투: "~이에요", "~랍니다", "~거든요", "~해요" 친근하고 따뜻한 경어체
- 이름을 자주 불러준다: "OO님은", "OO님의"
- 마크다운 헤딩(##)으로 소제목을 구분하고, 소제목은 감성적인 한 줄 문장으로 만든다
- 각 소제목 단락은 문단 2~3개, 문단 사이 빈 줄
- 한국어로 작성
- ⚠️ 절대 중간에 끊기지 않는다. 요청한 모든 섹션(##)을 끝까지 완성한다`;

function infoBlock(input: AttachmentPromptInput): string {
  const concernsBlock = input.concerns?.trim()
    ? `\n[${input.name}님이 궁금해하는 점]\n${input.concerns.trim()}\n`
    : '';
  const concernsRule = input.concerns?.trim()
    ? `\n- ⭐ [최우선] ${input.name}님이 남긴 궁금한 점을 반드시 반영한다. 애착 유형 분석과 위 궁금한 점을 구체적으로 연결지어 설명하고, 가장 관련 깊은 섹션에서는 이 질문에 직접 답하는 문장으로 시작한다.`
    : '';
  return `[분석 대상]
이름: ${input.name}
성별: ${input.gender === "male" ? "남성" : "여성"}

[애착유형검사 결과]
불안(Anxiety) 점수: ${input.anxietyScore} / 5
회피(Avoidance) 점수: ${input.avoidanceScore} / 5
애착 유형: ${ATTACHMENT_TYPE_LABEL[input.type]}
${concernsBlock}
[유형별 참고 — 반드시 이 정의에 맞춰 서술한다]
- 안정형: 불안·회피 모두 낮음. 관계에 대한 신뢰가 기본값이고, 갈등이 생겨도 대화로 풀 수 있다는 확신이 있다.
- 불안형: 불안이 높고 회피가 낮음. 사랑받고 있다는 확신이 부족해 상대의 반응에 예민하고, 자주 확인받고 싶어한다.
- 회피형: 회피가 높고 불안이 낮음. 친밀해지는 것 자체가 부담스럽고, 감정 표현보다 거리 유지가 편하다.
- 혼란형: 불안·회피 모두 높음. 가까워지고 싶으면서도 동시에 두려워, 다가갔다 물러서기를 반복한다.
${concernsRule}`;
}

export function buildAttachmentCore(input: AttachmentPromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${infoBlock(input)}

[작성 규칙]
- 각 섹션마다 문단 2~3개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 90~130자로 핵심을 담아 쓴다.
- ${input.name}님을 자주 불러주고 친근한 말투로 쓴다.

---

아래 3개 섹션을 정확히 이 순서대로 작성한다.

## 💗 나의 애착 유형 — [${input.name}님만의 감성적 한 줄 소제목]

${input.name}님의 불안 점수(${input.anxietyScore})와 회피 점수(${input.avoidanceScore})를 근거로 "${ATTACHMENT_TYPE_LABEL[input.type]}"으로 나온 이유를 설명한다. 이 유형이 실제 연애에서 어떻게 나타나는지 구체적인 장면으로 묘사한다.

## 🌱 이런 유형이 된 이유

애착 유형은 보통 어린 시절 주 양육자와의 관계, 과거 연애 경험이 누적되어 형성된다는 이론을 바탕으로, ${input.name}님의 점수 패턴이 어떤 경험에서 비롯됐을 가능성이 높은지 공감적으로 짚어준다. 원인을 단정하기보다 "이런 경험이 있었다면 이 패턴이 이해가 돼요"라는 방식으로 서술한다.

## 🔍 연애에서 나타나는 패턴

${input.name}님의 애착 유형이 실제 연애 상황(썸, 초반 연애, 갈등 상황, 이별 후)에서 각각 어떻게 드러나는지 구체적으로 서술한다. ${input.name}님이 "아 진짜 나 이래"라고 공감할 수 있는 실제 행동 패턴 3가지를 짚어준다.`,
  };
}

export function buildAttachmentAdvice(input: AttachmentPromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${infoBlock(input)}

[작성 규칙]
- 각 섹션마다 문단 2~3개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 90~130자로 핵심을 담아 쓴다.
- ${input.name}님을 자주 불러주고 친근한 말투로 쓴다.

---

아래 3개 섹션을 정확히 이 순서대로 작성한다.

## 🚧 관계를 흔드는 습관

${ATTACHMENT_TYPE_LABEL[input.type]} 유형인 ${input.name}님이 관계에서 스스로도 모르게 반복하는, 관계를 흔드는 습관 2~3가지를 솔직하게 짚어준다. 왜 이 습관이 생기는지 애착 이론으로 설명한다.

## 🛠️ 더 건강한 관계를 위한 구체적 방법

${input.name}님의 유형에 맞춰 관계를 더 안정적으로 만들 수 있는 구체적인 방법 3가지를 제시한다. 막연한 조언이 아니라 실제 상황에서 바로 써먹을 수 있는 말이나 행동으로 제시한다.

## 💌 지금 이 순간 실천할 수 있는 것

${input.name}님이 이번 주 안에 시도해볼 수 있는 작은 행동 2가지를 제시하고, 이 작은 변화가 왜 ${ATTACHMENT_TYPE_LABEL[input.type]} 유형에게 특히 효과적인지 설명하며 따뜻하게 마무리한다.`,
  };
}

export function buildAttachmentCompat(input: AttachmentPromptInput): { system: string; user: string } {
  return {
    system: SYSTEM_BASE,
    user: `${infoBlock(input)}

[작성 규칙]
- 각 섹션마다 문단 2~3개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 90~130자로 핵심을 담아 쓴다.
- ${input.name}님을 자주 불러주고 친근한 말투로 쓴다.

---

아래 4개 섹션을 정확히 이 순서대로 작성한다.

## 💞 안정형과 만났을 때

${ATTACHMENT_TYPE_LABEL[input.type]}인 ${input.name}님이 안정형 상대를 만났을 때 관계가 어떻게 흘러가는지, 어떤 점이 편하고 어떤 점에서 여전히 스스로의 패턴이 나올 수 있는지 서술한다.

## 🔥 비슷한 유형과 만났을 때

${input.name}님과 비슷한 유형(또는 정반대 유형)을 만났을 때 생길 수 있는 시너지와 충돌 지점을 구체적으로 설명한다. 실제로 자주 벌어지는 갈등 장면을 예로 든다.

## 🧭 ${input.name}님에게 가장 잘 맞는 상대의 특징

${input.name}님의 애착 유형을 고려했을 때, 장기적으로 가장 안정적인 관계를 만들 수 있는 상대방의 성향과 태도를 구체적으로 제시한다.

## 🌈 장기적으로 더 안정형에 가까워지는 법

애착 유형은 고정된 것이 아니라 관계 경험을 통해 점차 안정형에 가까워질 수 있다는 것을 전제로, ${input.name}님이 장기적으로 실천하면 좋을 방향을 감성적이고 희망적으로 제시하며 마무리한다.`,
  };
}
