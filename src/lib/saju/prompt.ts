// =====================================================
// 사주 해석 프롬프트 빌더
// =====================================================

import type { Myeongsik } from "./manseryeok";
import { DANPUM_CONFIGS, BASIC_CONFIGS, PREMIUM_CONFIGS, type CategoryId, type ChapterDef } from "./category-configs";

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
  catId?: CategoryId;
  partnerText?: string;
  concerns?: string;
};

// ── 카테고리 헬퍼 ─────────────────────────────────────────────────────
function applyVars(text: string, input: PromptInput): string {
  return text
    .replace(/\{name\}/g, input.name)
    .replace(/\{year\}/g, String(input.currentYear))
    .replace(/\{year1\}/g, String(input.currentYear + 1))
    .replace(/\{year2\}/g, String(input.currentYear + 2));
}

function fmtChapters(chapters: ChapterDef[], input: PromptInput): string {
  return chapters
    .map(ch => {
      const title = applyVars(ch.title, input);
      const instr = applyVars(ch.instruction, input);
      return `## ${ch.icon} ${title} — [${input.name}님만의 감성적 한 줄 소제목]\n\n${instr}`;
    })
    .join('\n\n');
}

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

const BASIC_INFO = (input: PromptInput) => {
  const isPartner = input.catId === 'reunion' || input.catId === 'secret' || input.catId === 'pregnancy-date' || input.catId === 'baby-dna' || input.catId === 'tarot-reunion' || input.catId === 'ex-feelings' || input.catId === 'reunion-timing' || input.catId === 'breakup-reason';
  const partnerBlock = isPartner && input.partnerText
    ? `\n[상대방 정보]\n${input.partnerText}\n`
    : '';
  const integrationRule = isPartner
    ? `- 상대방 정보를 적극 활용해 두 사람을 사주 + 자미두수로 함께 비교 분석한다.`
    : `- 사주팔자와 자미두수를 각 섹션에서 자연스럽게 통합해 서술한다.`;
  const isReunionType = (['reunion', 'tarot-reunion', 'ex-feelings', 'reunion-timing', 'breakup-reason'] as string[]).includes(input.catId ?? '');
  const emotionNote = isReunionType
    ? `- ⭐ [핵심 관점] 이 결과지를 읽는 ${input.name}님은 헤어진 상대방에 대한 마음이 아직 남아있는 상태다. 모든 내용은 ${input.name}님의 감정에 먼저 깊이 공감하고, ${input.name}님 편에서 따뜻하게 서술한다. 상대방의 현재 마음·재회 가능성·구체적인 접근 시기와 방법을 중심으로 풀어 쓰되, ${input.name}님이 읽고 "내 상황을 정확히 이해받는 느낌"을 받을 수 있도록 한다. ${input.name}님이 이 사람에게 가진 감정을 부정하지 않고, 그 감정의 사주적 이유를 설명하며 위로와 방향을 함께 전한다.`
    : input.catId === 'secret'
    ? `- ⭐ [핵심 관점] 이 결과지를 읽는 ${input.name}님은 상대방에 대해 설레는 마음이 있다. 두 사람의 궁합 분석을 ${input.name}님 편에서 따뜻하고 솔직하게 전달하고, ${input.name}님이 이 관계에서 어떻게 행동하면 좋을지 구체적으로 안내한다.`
    : '';
  const isTarotCentric = input.catId === 'tarot-reunion';
  const tarotBlock = input.tarotCard
    ? `\n[선택한 타로 카드]\n카드명: ${input.tarotCard.name}\n키워드: ${input.tarotCard.keyword}\n카드 메시지: ${input.tarotCard.advice}\n`
    : '';
  const tarotRule = input.tarotCard
    ? isTarotCentric
      ? `- ⭐ 이 상품은 타로 리딩이 핵심이다. 타로 카드 "${input.tarotCard.name}"(키워드: ${input.tarotCard.keyword})의 해석을 모든 분석의 중심에 두고, 사주·자미두수는 그 해석을 뒷받침하는 보조 확인 근거로만 짧게 사용한다. "사주가 확인해준다"가 아니라 "타로가 먼저 말하고, 사주로도 확인된다"는 방식으로 서술한다.`
      : `- 타로 카드 "${input.tarotCard.name}"(키워드: ${input.tarotCard.keyword})를 사주·자미두수 분석과 자연스럽게 연결해 언급한다. 억지로 끼워넣지 말고 "타로가 확인해준다"는 방식으로.`
    : '';
  const concernsBlock = input.concerns?.trim()
    ? `\n[${input.name}님이 궁금해하는 점]\n${input.concerns.trim()}\n`
    : '';
  const concernsRule = input.concerns?.trim()
    ? `- ⭐ [최우선] ${input.name}님이 직접 남긴 궁금한 점을 반드시 분석 전반에 반영한다. 이 질문에 대한 답을 각 섹션에서 구체적으로 짚어주고, 가장 관련 깊은 섹션에서는 이 질문에 직접 답하는 문장으로 시작한다.`
    : '';
  return `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년
${partnerBlock}
[만세력 명식 데이터]
${input.manseryeokText}
${tarotBlock}${concernsBlock}
[작성 규칙]
- 각 섹션마다 문단 2개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
${integrationRule}
${emotionNote}
${tarotRule}
${concernsRule}
- ${input.name}님을 자주 불러주고 친근한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
- 명리학·자미두수 용어는 반드시 쉬운 말로 바로 풀어 설명한다.
- ⚠️ 모든 섹션을 반드시 완성한다. 절대 중간에 끊기지 않는다.`;
};

// ── 베이직: 섹션 1, 2, 3 — 카테고리별 config 구동 ──────────────────────
export function buildBasicSection1(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = BASIC_CONFIGS[catId].s1;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  return {
    system: SYSTEM_BASE,
    user: `${BASIC_INFO(input)}

---

${note}아래 ${cfg.chapters.length}개 섹션을 작성하라. 각 섹션에서 사주팔자와 자미두수를 함께 엮어 서술한다.

${fmtChapters(cfg.chapters, input)}`,
  };
}

export function buildBasicSection2(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = BASIC_CONFIGS[catId].s2;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  return {
    system: SYSTEM_BASE,
    user: `${BASIC_INFO(input)}

---

${note}아래 ${cfg.chapters.length}개 섹션을 작성하라. 각 섹션에서 사주팔자와 자미두수를 함께 엮어 서술한다.

${fmtChapters(cfg.chapters, input)}`,
  };
}

export function buildBasicSection3(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = BASIC_CONFIGS[catId].s3;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  return {
    system: SYSTEM_BASE,
    user: `${BASIC_INFO(input)}

---

${note}아래 ${cfg.chapters.length}개 섹션을 작성하라. 사주팔자 명리학 분석에 집중하고 자미두수는 간략히 언급한다.

${fmtChapters(cfg.chapters, input)}`,
  };
}

// ── 베이직: 섹션 4 — 자미두수 심층 분석 (카테고리별 분기) ──────────────────
export function buildBasicJami(input: PromptInput): { system: string; user: string } {
  const isPartner = input.catId === 'reunion' || input.catId === 'secret' || input.catId === 'pregnancy-date' || input.catId === 'baby-dna' || input.catId === 'tarot-reunion' || input.catId === 'ex-feelings' || input.catId === 'reunion-timing' || input.catId === 'breakup-reason';
  const partnerBlock = isPartner && input.partnerText
    ? `\n[상대방 정보]\n${input.partnerText}\n` : '';

  const infoBlock = `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년
${partnerBlock}
[만세력 명식 데이터]
${input.manseryeokText}

[작성 규칙]
- 이 섹션은 자미두수(紫微斗數) 명반 전용 심층 분석이다. 사주팔자 언급은 최소화한다.
- 각 섹션마다 문단 2개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 100~140자로 충실하게 쓴다. 단순 나열 금지, 반드시 해석과 의미를 함께 서술한다.
- 자미두수 용어(궁, 성계 이름 등)는 반드시 쉬운 말로 바로 풀어 설명한다.
- ${input.name}님을 자주 불러주고 친근한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
- ⚠️ 5개 섹션 모두 반드시 완성한다. 절대 중간에 끊기지 않는다.`;

  // 재회·속궁합·임신택일·아이DNA 전용 자미두수 섹션 (부처궁·인연·자녀궁 중심)
  if (isPartner) {
    const topicLabel = (['reunion', 'tarot-reunion', 'ex-feelings', 'reunion-timing', 'breakup-reason'] as string[]).includes(input.catId ?? '') ? '재회 인연'
      : input.catId === 'pregnancy-date' ? '임신 인연'
      : input.catId === 'baby-dna' ? '자녀 인연'
      : '궁합';
    return {
      system: SYSTEM_BASE,
      user: `${infoBlock}

---

아래는 자미두수 심층 분석 섹션 5개다. UI 배너 포함 정확히 아래 순서대로 작성한다.

## ✦✦✦ 자미두수 심층 분석 ✦✦✦

위 줄은 UI 배너다. 내용 없이 그대로 두고 바로 다음 섹션을 작성한다.

## 💕 부처궁 심층 분석 — [${input.name}님만의 감성적 한 줄 소제목]

부처궁(夫妻宮)은 자미두수에서 연애·결혼·파트너 에너지의 핵심 궁이다. ${input.name}님의 부처궁에 자리한 주성(主星)과 보좌성·흉성 조합이 만드는 인연 패턴을 깊이 분석한다. "이 부처궁을 가진 사람은 이런 방식으로 사랑을 한다"는 핵심 문장과 함께, 이 인연 에너지가 지금 상황과 어떻게 연결되는지 감성적으로 풀어 쓴다.

${input.currentYear}년 세운이 ${input.name}님의 부처궁에 어떤 영향을 주는지, 올해 ${topicLabel} 흐름에서 특히 주목해야 할 시기와 에너지를 짚어주며 마무리한다.

## 🌙 명궁으로 보는 인연 방식 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 명궁(命宮)은 타고난 본성과 삶의 방식을 담은 핵심 궁이다. ${input.name}님의 명궁 주성이 인연과 관계를 대하는 방식에 어떤 영향을 주는지 분석한다. 이 명궁을 가진 사람이 사랑에서 반복적으로 경험하는 패턴을 솔직하고 따뜻하게 서술한다.

명궁 성계가 부처궁 에너지와 만날 때 만들어지는 ${input.name}님만의 독특한 인연 스타일을 설명하고, 이 스타일이 지금 상황에서 어떤 의미인지 연결하며 마무리한다.

## 🔗 자미두수로 본 두 사람의 인연 에너지 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 명반에서 두 사람의 인연 에너지가 어떻게 연결되는지 분석한다. ${input.name}님의 부처궁 성계가 이 관계에서 어떤 에너지를 만들어내는지, 두 사람이 자미두수적으로 어떤 인연인지 깊이 있게 서술한다.

자미두수가 말하는 이 인연의 성격(운명적인지, 성장을 위한 인연인지, 업연인지)을 솔직하게 전달하고, "${input.name}님에게 이 사람이 자미두수적으로 어떤 의미인지" 따뜻하게 마무리한다.

## 🌸 복덕궁으로 보는 내면의 욕구 — [${input.name}님만의 감성적 한 줄 소제목]

복덕궁(福德宮)은 자미두수에서 타고난 내면의 행복 욕구와 정신적 에너지를 담은 궁이다. ${input.name}님의 복덕궁 성계가 말하는 내면 깊은 곳의 욕구를 분석한다. 이 사람을 그리워하고 재회를 원하는 감정이 복덕궁 에너지와 어떻게 연결되는지 따뜻하고 솔직하게 서술한다.

복덕궁이 말하는 ${input.name}님의 진짜 행복 조건과, 이 인연이 그 행복 조건과 얼마나 맞닿아 있는지 감성적으로 전달하며 마무리한다.

## 🔭 ${input.currentYear}년 자미두수 세운 총평 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 세운(歲運) 분석으로 ${input.currentYear}년 한 해의 인연 흐름을 종합한다. 올해 세운이 ${input.name}님의 부처궁·복덕궁과 어떻게 만나 ${topicLabel}에 어떤 에너지를 가져오는지 감성적으로 풀어 쓴다.

상반기와 하반기 중 ${topicLabel}에 더 유리한 시기를 구체적으로 짚고, ${input.name}님이 ${input.currentYear}년 인연 흐름을 가장 잘 타기 위한 핵심 키워드 3가지로 마무리한다.`,
    };
  }

  // 신년운세·커리어·재테크 기본 자미두수 섹션
  return {
    system: SYSTEM_BASE,
    user: `${infoBlock}

---

아래는 자미두수 심층 분석 섹션 5개다. UI 배너 포함 정확히 아래 순서대로 작성한다.

## ✦✦✦ 자미두수 심층 분석 ✦✦✦

위 줄은 UI 배너다. 내용 없이 그대로 두고 바로 다음 섹션을 작성한다.

## 🌌 명궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수에서 명궁(命宮)은 타고난 본성과 운명의 씨앗을 담은 핵심 궁이다. ${input.name}님의 명궁에 자리한 주성(主星)이 무엇인지, 그 별이 어떤 성격과 기질을 만들어내는지 구체적으로 서술한다.

보좌성·흉성과의 조합이 ${input.name}님의 삶에 어떤 독특한 색깔을 부여하는지 설명하고, "이 명궁을 가진 사람은 OO한 방식으로 세상과 만난다"는 핵심 문장으로 마무리한다.

## 💰 재백궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

재백궁(財帛宮)은 자미두수에서 돈과 재물의 흐름, 경제적 체질을 보여주는 궁이다. ${input.name}님의 재백궁 성계 구성으로 타고난 재물 체질과 돈을 버는 방식의 특성을 분석한다.

${input.currentYear}년 세운이 재백궁에 미치는 영향을 설명하고, 재물운을 높이는 구체적인 행동 방향 2가지를 제안하며 마무리한다.

## 💼 관록궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

관록궁(官祿宮)은 커리어, 직업, 사회적 성취를 다루는 궁이다. ${input.name}님의 관록궁에 어떤 성계가 자리하며, 이것이 어떤 직업 에너지와 성취 방식을 만드는지 구체적으로 서술한다.

${input.currentYear}년 올해 관록궁 흐름에서 커리어적으로 특히 주목해야 할 시기나 기회, 조심해야 할 점을 짚어주며 마무리한다.

## 💕 부처궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

부처궁(夫妻宮)은 연애, 결혼, 파트너와의 관계 에너지를 담은 궁이다. ${input.name}님의 부처궁 성계가 어떤 인연 패턴과 관계 스타일을 만드는지 솔직하고 따뜻하게 서술한다.

${input.name}님에게 잘 맞는 파트너의 유형과 올해 인연 흐름을 짚어주고, 관계에서 반복되는 패턴을 인식하는 방법을 조언하며 마무리한다.

## 🔭 ${input.currentYear}년 자미두수 세운 총평 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 세운(歲運) 분석으로 ${input.currentYear}년 한 해의 전체 에너지 흐름을 종합한다. 올해 세운이 ${input.name}님의 명반과 어떻게 만나 어떤 큰 흐름을 만드는지 감성적으로 풀어 쓴다.

상반기와 하반기의 에너지 차이를 구체적으로 짚고, ${input.name}님이 ${input.currentYear}년을 가장 잘 보내기 위한 핵심 키워드 3가지로 마무리한다.`,
  };
}

// ── 프리미엄: 공통 정보 블록 ────────────────────────────────────────────
const PREMIUM_INFO = (input: PromptInput) => {
  const isPartner = input.catId === 'reunion' || input.catId === 'secret' || input.catId === 'pregnancy-date' || input.catId === 'baby-dna' || input.catId === 'tarot-reunion' || input.catId === 'ex-feelings' || input.catId === 'reunion-timing' || input.catId === 'breakup-reason';
  const partnerBlock = isPartner && input.partnerText
    ? `\n[상대방 정보]\n${input.partnerText}\n`
    : '';
  const isTarotCentricPremium = input.catId === 'tarot-reunion';
  const integrationRule = isTarotCentricPremium
    ? `- ⭐ 이 상품은 타로 리딩이 핵심이다. 타로 카드의 해석을 모든 분석의 중심에 두고, 사주팔자·자미두수는 그 해석을 뒷받침하는 보조 확인 근거로만 짧게 사용한다.`
    : isPartner
    ? `- 상대방 정보를 적극 활용해 두 사람을 사주·자미두수·타로로 함께 비교 분석한다.`
    : `- 사주팔자·자미두수·타로 세 가지를 자연스럽게 통합해 서술한다.`;
  const isReunionType = (['reunion', 'tarot-reunion', 'ex-feelings', 'reunion-timing', 'breakup-reason'] as string[]).includes(input.catId ?? '');
  const emotionNote = isReunionType
    ? `- ⭐ [핵심 관점] 이 결과지를 읽는 ${input.name}님은 헤어진 상대방에 대한 마음이 아직 남아있는 상태다. 모든 내용은 ${input.name}님의 감정에 먼저 깊이 공감하고, ${input.name}님 편에서 따뜻하게 서술한다. 상대방의 현재 마음·재회 가능성·구체적인 접근 시기와 방법을 중심으로 풀어 쓰되, ${input.name}님이 읽고 "내 상황을 정확히 이해받는 느낌"을 받을 수 있도록 한다. ${input.name}님이 이 사람에게 가진 감정을 부정하지 않고, 그 감정의 사주적 이유를 설명하며 위로와 방향을 함께 전한다.`
    : input.catId === 'secret'
    ? `- ⭐ [핵심 관점] 이 결과지를 읽는 ${input.name}님은 상대방에 대해 설레는 마음이 있다. 두 사람의 궁합 분석을 ${input.name}님 편에서 따뜻하고 솔직하게 전달하고, ${input.name}님이 이 관계에서 어떻게 행동하면 좋을지 구체적으로 안내한다.`
    : '';
  const concernsBlock = input.concerns?.trim()
    ? `\n[${input.name}님이 궁금해하는 점]\n${input.concerns.trim()}\n`
    : '';
  const concernsRule = input.concerns?.trim()
    ? `- ⭐ [최우선] ${input.name}님이 직접 남긴 궁금한 점을 반드시 분석 전반에 반영한다. 이 질문에 대한 답을 각 섹션에서 구체적으로 짚어주고, 가장 관련 깊은 섹션에서는 이 질문에 직접 답하는 문장으로 시작한다.`
    : '';
  return `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년
${partnerBlock}
[만세력 명식 데이터]
${input.manseryeokText}

[선택한 타로 카드]
카드명: ${input.tarotCard?.name ?? "없음"}
키워드: ${input.tarotCard?.keyword ?? "없음"}
카드 메시지: ${input.tarotCard?.advice ?? "없음"}
${concernsBlock}
[작성 규칙]
- 각 섹션마다 문단 2개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
${integrationRule}
${emotionNote}
${isTarotCentricPremium
    ? `- "타로가 먼저 말하고, 사주·자미두수로도 확인된다"는 방식으로 서술한다. 사주가 타로를 확인해주는 보조 역할이지, 그 반대가 아니다.`
    : `- 타로 카드는 억지로 끼워넣지 말고, 사주·자미두수 분석을 "타로가 확인해준다"는 방식으로 자연스럽게 언급한다.`}
${concernsRule}
- ${input.name}님을 자주 불러주고 친근한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
- 명리학·자미두수 용어는 반드시 쉬운 말로 바로 풀어 설명한다.
- ⚠️ 모든 섹션을 반드시 완성한다. 절대 중간에 끊기지 않는다.`;
};

// ── 프리미엄: 섹션 1, 2, 3 — 카테고리별 config 구동 ────────────────────
export function buildPremiumSection1(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = PREMIUM_CONFIGS[catId].s1;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  const taroNote = input.tarotCard
    ? `타로 카드 "${input.tarotCard.name}"(키워드: ${input.tarotCard.keyword})를 분석과 자연스럽게 연결해 언급한다.\n\n`
    : '';
  return {
    system: SYSTEM_BASE,
    user: `${PREMIUM_INFO(input)}

---

${note}${taroNote}아래 ${cfg.chapters.length}개 섹션을 작성하라. 사주·자미두수·타로를 자연스럽게 통합해 서술한다.

${fmtChapters(cfg.chapters, input)}`,
  };
}

export function buildPremiumSection2(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = PREMIUM_CONFIGS[catId].s2;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  const taroNote = input.tarotCard
    ? `타로 카드 "${input.tarotCard.name}"(메시지: ${input.tarotCard.advice})를 올해 흐름 분석에 자연스럽게 연결해 언급한다.\n\n`
    : '';
  return {
    system: SYSTEM_BASE,
    user: `${PREMIUM_INFO(input)}

---

${note}${taroNote}아래 ${cfg.chapters.length}개 섹션을 작성하라. 사주·자미두수·타로를 자연스럽게 통합해 서술한다.

${fmtChapters(cfg.chapters, input)}`,
  };
}

export function buildPremiumSection3(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = PREMIUM_CONFIGS[catId].s3;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  return {
    system: SYSTEM_BASE,
    user: `${PREMIUM_INFO(input)}

---

${note}아래 ${cfg.chapters.length}개 섹션을 작성하라. 사주·자미두수를 중심으로 서술하고 타로는 자연스럽게 보조로 언급한다.

${fmtChapters(cfg.chapters, input)}`,
  };
}

// ── 프리미엄: 섹션 4 — 자미두수 심층 분석 (전용, 6궁 / 재회·속궁합 인연 특화) ──
export function buildPremiumJami(input: PromptInput): { system: string; user: string } {
  const isPartner = input.catId === 'reunion' || input.catId === 'secret' || input.catId === 'pregnancy-date' || input.catId === 'baby-dna' || input.catId === 'tarot-reunion' || input.catId === 'ex-feelings' || input.catId === 'reunion-timing' || input.catId === 'breakup-reason';
  const partnerBlock = isPartner && input.partnerText
    ? `\n[상대방 정보]\n${input.partnerText}\n` : '';

  const infoBlock = `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년
${partnerBlock}
[만세력 명식 데이터]
${input.manseryeokText}

[작성 규칙]
- 이 섹션은 자미두수(紫微斗數) 명반 전용 심층 분석이다. 사주팔자 언급은 최소화한다.
- 각 섹션마다 문단 2개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 110~150자로 충실하고 구체적으로 쓴다. 단순 나열 금지.
- 자미두수 용어(궁, 성계 이름 등)는 반드시 쉬운 말로 바로 풀어 설명한다.
- ${input.name}님을 자주 불러주고 친근한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
- ⚠️ 6개 섹션 모두 반드시 완성한다. 절대 중간에 끊기지 않는다.`;

  // 재회·속궁합·임신택일·아이DNA 전용 자미두수 6궁 분석 (인연·관계·자녀궁 위주)
  if (isPartner) {
    const topicLabel = (['reunion', 'tarot-reunion', 'ex-feelings', 'reunion-timing', 'breakup-reason'] as string[]).includes(input.catId ?? '') ? '재회 인연'
      : input.catId === 'pregnancy-date' ? '임신 인연'
      : input.catId === 'baby-dna' ? '자녀 인연'
      : '궁합';
    return {
      system: SYSTEM_BASE,
      user: `${infoBlock}

---

아래는 자미두수 심층 분석 섹션 6개다. UI 배너 포함 정확히 아래 순서대로 작성한다.

## ✦✦✦ 자미두수 심층 분석 ✦✦✦

위 줄은 UI 배너다. 내용 없이 그대로 두고 바로 다음 섹션을 작성한다.

## 💕 부처궁 심층 분석 — [${input.name}님만의 감성적 한 줄 소제목]

부처궁(夫妻宮)은 자미두수에서 연애·결혼·파트너 에너지의 핵심 궁이다. ${input.name}님의 부처궁 주성과 보좌성·흉성 조합이 만드는 인연 패턴을 깊이 분석한다. "이 부처궁을 가진 사람은 이런 방식으로 사랑한다"는 핵심 문장과 함께, 이 인연 에너지가 지금 상황과 어떻게 연결되는지 감성적으로 풀어 쓴다.

${input.currentYear}년 세운이 ${input.name}님의 부처궁에 어떤 영향을 주는지, 올해 ${topicLabel} 흐름에서 특히 주목해야 할 시기와 에너지를 짚어주며 마무리한다.

## 🌙 명궁으로 보는 인연 방식 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 명궁(命宮)은 타고난 본성과 삶의 방식을 담은 핵심 궁이다. ${input.name}님의 명궁 주성이 인연과 관계를 대하는 방식에 어떤 영향을 주는지 깊이 분석한다. 이 명궁을 가진 사람이 사랑에서 반복적으로 경험하는 패턴을 솔직하고 따뜻하게 서술한다.

명궁 성계가 부처궁 에너지와 만날 때 만들어지는 ${input.name}님만의 독특한 인연 스타일을 설명하고, 이 스타일이 지금 상황에서 어떤 의미인지 연결하며 마무리한다.

## 🔗 자미두수로 본 두 사람의 인연 에너지 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 명반에서 두 사람의 인연 에너지가 어떻게 연결되는지 분석한다. ${input.name}님의 부처궁 성계가 이 관계에서 어떤 에너지를 만들어내는지, 두 사람이 자미두수적으로 어떤 인연인지 깊이 있게 서술한다.

자미두수가 말하는 이 인연의 성격(운명적인지, 성장을 위한 인연인지, 업연인지)을 솔직하게 전달하고, "${input.name}님에게 이 사람이 자미두수적으로 어떤 의미인지" 따뜻하게 마무리한다.

## 🌸 복덕궁으로 보는 내면의 욕구 — [${input.name}님만의 감성적 한 줄 소제목]

복덕궁(福德宮)은 자미두수에서 타고난 내면의 행복 욕구와 정신적 에너지를 담은 궁이다. ${input.name}님의 복덕궁 성계가 말하는 내면 깊은 곳의 욕구를 분석한다. 이 사람을 그리워하고 재회·관계를 원하는 감정이 복덕궁 에너지와 어떻게 연결되는지 따뜻하고 솔직하게 서술한다.

복덕궁이 말하는 ${input.name}님의 진짜 행복 조건과, 이 인연이 그 행복 조건과 얼마나 맞닿아 있는지 감성적으로 전달하며 마무리한다.

## 🌊 천이궁으로 보는 변화와 만남의 에너지 — [${input.name}님만의 감성적 한 줄 소제목]

천이궁(遷移宮)은 자미두수에서 외부 세계와의 만남, 변화, 이동의 에너지를 담은 궁이다. ${input.name}님의 천이궁 성계가 말하는 외부에서의 만남과 변화 에너지를 분석한다. 올해 ${topicLabel} 흐름에서 천이궁이 가리키는 변화의 타이밍과 방향을 구체적으로 전달한다.

천이궁 성계와 올해 세운의 조합이 ${topicLabel}에 어떤 에너지를 가져오는지 분석하고, ${input.name}님이 이 에너지를 어떻게 활용하면 좋은지 실질적인 조언으로 마무리한다.

## 🔭 ${input.currentYear}년 자미두수 세운 총평 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 세운(歲運) 분석으로 ${input.currentYear}년 한 해의 인연 흐름을 종합한다. 올해 세운이 ${input.name}님의 부처궁·복덕궁·천이궁과 어떻게 만나 ${topicLabel}에 어떤 에너지를 가져오는지 깊이 풀어 쓴다.

상반기·하반기 중 ${topicLabel}에 더 유리한 시기를 짚고, 올해 가장 중요한 달을 구체적으로 언급하며 ${input.currentYear}년 인연 핵심 키워드 3가지로 강렬하게 마무리한다.`,
    };
  }

  // 신년운세·커리어·재테크 기본 자미두수 6궁 분석
  return {
    system: SYSTEM_BASE,
    user: `${infoBlock}

---

아래는 자미두수 심층 분석 섹션 6개다. UI 배너 포함 정확히 아래 순서대로 작성한다.

## ✦✦✦ 자미두수 심층 분석 ✦✦✦

위 줄은 UI 배너다. 내용 없이 그대로 두고 바로 다음 섹션을 작성한다.

## 🌌 명궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수에서 명궁(命宮)은 타고난 본성과 운명의 씨앗을 담은 핵심 궁이다. ${input.name}님의 명궁에 자리한 주성(主星)이 무엇인지, 그 별이 만들어내는 성격·기질·삶의 방향을 깊이 있게 서술한다.

보좌성·흉성과의 조합이 ${input.name}님의 삶에 부여하는 독특한 색깔을 설명하고, 이 명궁을 가진 사람이 인생에서 반복적으로 경험하는 테마를 따뜻한 시각으로 마무리한다.

## 💰 재백궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

재백궁(財帛宮)은 돈과 재물의 흐름, 경제적 체질을 보여주는 궁이다. ${input.name}님의 재백궁 성계 구성으로 타고난 재물 체질, 돈을 버는 방식, 재물과의 관계 패턴을 구체적으로 분석한다.

${input.currentYear}년 세운이 재백궁에 미치는 영향을 설명하고, 재물운을 높이는 행동 방향 2가지와 피해야 할 재물 실수 1가지를 단정문으로 마무리한다.

## 💼 관록궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

관록궁(官祿宮)은 커리어, 직업, 사회적 성취를 다루는 궁이다. ${input.name}님의 관록궁 성계가 어떤 직업 에너지와 성취 방식을 만드는지, 어떤 분야에서 빛나는지 구체적으로 서술한다.

${input.currentYear}년 관록궁 흐름에서 커리어적으로 주목할 기회의 시기, 조심해야 할 함정, 그리고 장기적으로 성공하는 직업 방향을 명확하게 전달하며 마무리한다.

## 💕 부처궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

부처궁(夫妻宮)은 연애, 결혼, 파트너와의 관계 에너지를 담은 궁이다. ${input.name}님의 부처궁 성계가 어떤 인연 패턴과 관계 스타일을 만드는지 솔직하고 깊이 있게 서술한다.

${input.name}님에게 잘 맞는 파트너의 유형, 관계에서 반복되는 패턴을 인식하는 법, 올해 인연 흐름을 함께 짚어주고 관계를 더 깊게 만드는 핵심 조언으로 마무리한다.

## 🌸 복덕궁 분석 — [${input.name}님만의 감성적 한 줄 소제목]

복덕궁(福德宮)은 타고난 복의 크기, 정신적 행복, 내면의 풍요를 담당하는 궁이다. ${input.name}님의 복덕궁 성계가 어떤 삶의 기쁨과 행복 패턴을 만드는지, 어떤 상황에서 진짜 행복을 느끼는지 서술한다.

복덕궁이 말하는 ${input.name}님만의 행복 공식을 따뜻하게 전달하고, 타고난 복을 더 잘 발현하기 위한 실천 방법 2가지를 감성적으로 마무리한다.

## 🔭 ${input.currentYear}년 자미두수 세운 총평 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 세운(歲運) 분석으로 ${input.currentYear}년 한 해의 전체 에너지 흐름을 종합한다. 올해 세운이 ${input.name}님의 명반과 어떻게 만나 어떤 큰 흐름을 만드는지 깊이 풀어 쓴다.

상반기·하반기의 에너지 차이를 구체적으로 짚고, 올해 가장 중요한 달과 피해야 할 달을 짚어주며 ${input.currentYear}년 핵심 키워드 3가지로 강렬하게 마무리한다.`,
  };
}

// ── 프리미엄: 섹션 5 — 타로 심층 분석 (전용, 4챕터) ───────────────────────
export function buildPremiumTarot(input: PromptInput): { system: string; user: string } {
  const card = input.tarotCard;
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

[선택한 타로 카드]
카드명: ${card?.name ?? "없음"}
키워드: ${card?.keyword ?? "없음"}
카드 메시지: ${card?.advice ?? "없음"}

[작성 규칙]
- 이 섹션은 타로 카드 전용 심층 분석이다. 타로를 중심에 놓고 사주·자미두수를 보조로 연결한다.
- 각 섹션마다 문단 2개로 나눠 작성한다. 문단 사이 빈 줄을 넣는다.
- 각 문단은 110~150자로 충실하고 감성적으로 쓴다. 신비롭고 따뜻한 톤을 유지한다.
- 타로 해석은 전통적 상징과 ${input.name}님의 실제 상황을 연결해 구체적으로 서술한다.
- ${input.name}님을 자주 불러주고 친근한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
- ⚠️ 4개 섹션 모두 반드시 완성한다. 절대 중간에 끊기지 않는다.

---

아래는 타로 심층 분석 섹션 4개다. UI 배너 포함 정확히 아래 순서대로 작성한다.

## ✦✦✦ 타로 심층 분석 ✦✦✦

위 줄은 UI 배너다. 내용 없이 그대로 두고 바로 다음 섹션을 작성한다.

## 🃏 ${card?.name ?? "타로"} 카드 해석 — [${input.name}님만의 감성적 한 줄 소제목]

${input.name}님이 선택한 "${card?.name}" 카드가 담고 있는 아르카나 상징과 전통적 의미를 깊이 있게 풀어 쓴다. 이 카드가 어떤 원형적 에너지를 담고 있으며, 왜 지금 이 시점에 ${input.name}님 앞에 나타났는지 설명한다.

카드의 키워드 "${card?.keyword}"가 ${input.name}님의 현재 삶과 어떻게 연결되는지 구체적으로 서술하고, 카드의 메시지 "${card?.advice}"를 ${input.name}님의 상황에 맞게 따뜻하고 감성적으로 해석하며 마무리한다.

## 🔮 사주 × 타로 시너지 — [${input.name}님만의 감성적 한 줄 소제목]

사주팔자의 핵심 에너지(일간의 특성, 올해 세운 흐름)와 "${card?.name}" 카드가 교차하는 지점을 분석한다. 두 시스템이 공통으로 가리키는 메시지를 강렬하고 명확하게 전달한다.

사주가 말하는 ${input.name}님의 올해 방향과 타로 카드의 조언이 어떻게 하나의 이야기로 연결되는지 풀어 쓴다. "사주도, 타로도 지금 ${input.name}님에게 같은 말을 하고 있어요"라는 신뢰감을 주는 문장으로 마무리한다.

## 🌟 자미두수 × 타로 — [${input.name}님만의 감성적 한 줄 소제목]

자미두수 명반의 에너지(명궁 주성, 올해 세운의 흐름)와 "${card?.name}" 카드의 에너지가 어떻게 공명하는지 서술한다. 동양의 별자리 운명학과 서양의 타로가 ${input.name}님에 대해 같은 언어로 말하는 지점을 짚어준다.

자미두수가 말하는 ${input.name}님의 타고난 운명적 테마와 타로 카드의 상징이 어떻게 연결되는지 깊이 풀어 쓴다. 동서양 운명 시스템이 하나로 수렴하는 핵심 메시지를 감성적으로 전달하며 마무리한다.

## 💫 ${input.currentYear}년 타로 조언 — [${input.name}님만의 감성적 한 줄 소제목]

"${card?.name}" 카드가 ${input.currentYear}년 한 해 동안 ${input.name}님에게 전하는 실질적 조언을 구체적으로 서술한다. 상반기(1~6월)에 카드가 권하는 행동 방향과 하반기(7~12월)에 집중해야 할 에너지를 각각 풀어 쓴다.

올해 ${input.name}님이 가슴에 새겨야 할 타로의 핵심 키워드 3가지를 제시하고, 사주·자미두수·타로 세 시스템이 공통으로 가리키는 ${input.currentYear}년 ${input.name}님만의 인생 격언을 감성적이고 강렬하게 마무리한다.`,
  };
}

// ── 단품: 공통 정보 블록 ────────────────────────────────────────────────
const DANPUM_INFO = (input: PromptInput) => {
  const isPartner = input.catId === 'reunion' || input.catId === 'secret' || input.catId === 'pregnancy-date' || input.catId === 'baby-dna' || input.catId === 'tarot-reunion' || input.catId === 'ex-feelings' || input.catId === 'reunion-timing' || input.catId === 'breakup-reason';
  const partnerBlock = isPartner && input.partnerText
    ? `\n[상대방 정보]\n${input.partnerText}\n`
    : '';
  const isReunionTypeDanpum = (['reunion', 'tarot-reunion', 'ex-feelings', 'reunion-timing', 'breakup-reason'] as string[]).includes(input.catId ?? '');
  const emotionNote = isReunionTypeDanpum
    ? `\n[작성 관점]\n⭐ 이 결과지를 읽는 ${input.name}님은 헤어진 상대방에 대한 마음이 아직 남아있는 상태다. 모든 내용은 ${input.name}님의 감정에 먼저 깊이 공감하고, ${input.name}님 편에서 따뜻하게 서술한다. 상대방의 현재 마음·재회 가능성·구체적인 접근 시기와 방법을 중심으로 풀어 쓰되, ${input.name}님이 읽고 "내 상황을 정확히 이해받는 느낌"을 받을 수 있도록 한다. ${input.name}님이 이 사람에게 가진 감정을 부정하지 않고, 그 감정의 사주적 이유를 설명하며 위로와 방향을 함께 전한다.`
    : input.catId === 'secret'
    ? `\n[작성 관점]\n⭐ 이 결과지를 읽는 ${input.name}님은 상대방에 대해 설레는 마음이 있다. 두 사람의 궁합 분석을 ${input.name}님 편에서 따뜻하고 솔직하게 전달하고, ${input.name}님이 이 관계에서 어떻게 행동하면 좋을지 구체적으로 안내한다.`
    : '';
  const isTarotCentricDanpum = input.catId === 'tarot-reunion';
  const tarotBlock = input.tarotCard
    ? `\n[선택한 타로 카드]\n카드명: ${input.tarotCard.name}\n키워드: ${input.tarotCard.keyword}\n카드 메시지: ${input.tarotCard.advice}\n\n[작성 규칙]\n${isTarotCentricDanpum
        ? `- ⭐ 이 상품은 타로 리딩이 핵심이다. 타로 카드 "${input.tarotCard.name}"(키워드: ${input.tarotCard.keyword})의 해석을 모든 분석의 중심에 두고, 사주는 그 해석을 뒷받침하는 보조 확인 근거로만 짧게 사용한다. "타로가 먼저 말하고, 사주로도 확인된다"는 방식으로 서술한다.`
        : `- 타로 카드 "${input.tarotCard.name}"(키워드: ${input.tarotCard.keyword})를 사주 분석과 자연스럽게 연결해 언급한다. 억지로 끼워넣지 말고 "타로가 확인해준다"는 방식으로.`}`
    : '';
  const concernsBlock = input.concerns?.trim()
    ? `\n\n[${input.name}님이 궁금해하는 점]\n${input.concerns.trim()}\n\n[작성 규칙]\n- ⭐ [최우선] 위 궁금한 점을 반드시 분석 전반에 반영한다. 가장 관련 깊은 섹션에서는 이 질문에 직접 답하는 문장으로 시작한다.`
    : '';
  return `[분석 대상]
이름: ${input.name}
생년월일: ${input.birthDate}${input.timeUnknown ? " (시 미상)" : input.birthTime ? ` ${input.birthTime}` : ""}
성별: ${input.gender === "male" ? "남성" : "여성"}
현재 나이: 만 ${input.currentAge}세
기준 연도: ${input.currentYear}년
${partnerBlock}
[만세력 명식 데이터]
${input.manseryeokText}${emotionNote}${tarotBlock}${concernsBlock}`;
};

// ── 단품: 섹션 1, 2, 3 — 카테고리별 config 구동 ─────────────────────────
export function buildDanpumSection1(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = DANPUM_CONFIGS[catId].s1;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  return {
    system: SYSTEM_BASE,
    user: `${DANPUM_INFO(input)}

---

${note}위 명식을 바탕으로 아래 ${cfg.chapters.length}개 섹션을 작성하라.
각 섹션마다 문단을 2~3개로 나눠 작성한다. 문단 사이에는 빈 줄을 넣어 읽기 쉽게 한다.
각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
${input.name}님을 자주 불러주고 친근하고 따뜻한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.

${fmtChapters(cfg.chapters, input)}`,
  };
}

export function buildDanpumSection2(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = DANPUM_CONFIGS[catId].s2;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  return {
    system: SYSTEM_BASE,
    user: `${DANPUM_INFO(input)}

---

${note}위 명식을 바탕으로 아래 ${cfg.chapters.length}개 섹션을 작성하라.
각 섹션마다 문단을 2~3개로 나눠 작성한다. 문단 사이에는 빈 줄을 넣어 읽기 쉽게 한다.
각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
${input.name}님을 자주 불러주고 친근하고 따뜻한 말투로 쓴다.

${fmtChapters(cfg.chapters, input)}`,
  };
}

export function buildDanpumSection3(input: PromptInput): { system: string; user: string } {
  const catId = (input.catId ?? 'new-year') as CategoryId;
  const cfg = DANPUM_CONFIGS[catId].s3;
  const note = cfg.note ? `[주의] ${cfg.note}\n\n` : '';
  return {
    system: SYSTEM_BASE,
    user: `${DANPUM_INFO(input)}

---

${note}위 명식을 바탕으로 아래 ${cfg.chapters.length}개 섹션을 작성하라.
각 섹션마다 문단을 2~3개로 나눠 작성한다. 문단 사이에는 빈 줄을 넣어 읽기 쉽게 한다.
각 문단은 80~120자로 핵심을 담아 쓴다. 간결하되 구체적으로.
${input.name}님을 자주 불러주고 친근하고 따뜻한 말투로 쓴다.

${fmtChapters(cfg.chapters, input)}`,
  };
}
