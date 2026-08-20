'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChapterResult } from '@/components/saju/ChapterResult';

type Screen = 'intro' | 'form' | 'concern' | 'package' | 'loading' | 'result' | 'error';
type Tier = 'basic' | 'premium';
type Gender = 'male' | 'female';
type RelationshipType = 'couple' | 'married' | 'some' | 'other';

const RELATIONSHIP_TYPES: { key: RelationshipType; label: string; emoji: string }[] = [
  { key: 'couple',  label: '연인 사이',    emoji: '💑' },
  { key: 'married', label: '부부 사이',    emoji: '💍' },
  { key: 'some',    label: '썸 타는 사이', emoji: '🌱' },
  { key: 'other',   label: '그 외 인간관계', emoji: '👥' },
];

// 고민 작성 화면 — 공통 도입부: 최근 사건 집중 분석 (모든 유형 공통 3문항).
// 상담사가 실제로 근거를 갖고 진단하려면 막연한 상황 설명보다 '최근 1주일 내
// 구체적 사건 하나'를 시간순으로 파고드는 편이 훨씬 유용하다.
const EVENT_STORY_LABEL = '최근 1주일 이내, 상대방과의 관계에서 가장 속상했거나 화가 났던 사건을 시간 순서대로 작성해 주세요.';
const EVENT_STORY_PLACEHOLDER: Record<RelationshipType, string> = {
  couple: '예: 지난주 토요일 저녁, 약속 시간에 30분 늦게 나타났는데 미안하다는 말도 없이 넘어가려고 해서 서운했어요.',
  married: '예: 어제 저녁 식사 자리에서 아이 문제로 이야기하다가 갑자기 언성이 높아졌어요.',
  some: '예: 지난 주말 데이트 중에 제가 미래 얘기를 꺼냈더니 갑자기 말수가 줄었어요.',
  other: '예: 지난주 단톡방에서 제 의견을 무시하는 듯한 말을 들었어요.',
};
const REACTION_EXCHANGE_LABEL = '그 사건이 발생했을 때 본인은 어떤 행동이나 말을 했고, 상대방은 어떻게 반응했나요?';
const REACTION_EXCHANGE_PLACEHOLDER: Record<RelationshipType, string> = {
  couple: '예: 저는 왜 늦었냐고 물었고, 상대방은 "그냥 좀 늦을 수도 있지"라며 대수롭지 않게 넘겼어요.',
  married: '예: 저는 서운함을 표현했는데, 배우자는 오히려 제 말투를 지적하며 화를 냈어요.',
  some: '예: 저는 그냥 웃으면서 넘겼는데, 상대방은 갑자기 핸드폰만 보기 시작했어요.',
  other: '예: 저는 아무 말도 못 하고 넘어갔고, 상대방은 그 후로도 계속 비슷한 태도였어요.',
};
const IMMEDIATE_EMOTION_LABEL = '그 사건 직후 본인이 느낀 가장 큰 감정은 무엇인가요?';
const IMMEDIATE_EMOTION_PLACEHOLDER = '예: 서운함과 동시에 내가 너무 예민한 건가 하는 자책감이 들었어요.';

// 고민 작성 화면 — 관계 유형별 심층 진단 (Q4~Q9, 6문항). 실제 상담사가 사건 하나를
// 깊이 파고들 때 물을 법한 질문들로, text는 서술형, choice는 버튼 선택형이다.
type DeepField = { key: string; label: string; kind: 'text' | 'choice'; options?: string[]; placeholder?: string };
const TYPE_DEEP_FIELDS: Record<RelationshipType, DeepField[]> = {
  some: [
    { key: '연락·말투 변화', label: '그 사건 이후로 상대방의 연락 빈도나 말투에 변화가 있었나요?', kind: 'text', placeholder: '예: 답장이 눈에 띄게 짧아지고 늦어졌어요.' },
    { key: '상대가 느낀 인상', label: '그 사건을 겪으며 상대방이 본인을 어떻게 생각한다고 느끼셨나요?', kind: 'text', placeholder: '예: 제가 좀 부담스러운 사람이라고 느꼈을 것 같아요.' },
    { key: '연인의 최소 매너', label: '본인이 생각하는 연인이 갖춰야 할 최소한의 매너는 무엇인가요?', kind: 'text', placeholder: '예: 약속은 지키고, 늦으면 미리 연락하는 것.' },
    { key: '다시 온다면', label: '만약 오늘 같은 상황이 다시 온다면, 본인은 어떻게 행동하고 싶나요?', kind: 'text', placeholder: '예: 그 자리에서 바로 솔직하게 서운함을 말하고 싶어요.' },
    { key: '확인하고 싶은 부분', label: '이 사건을 통해 상대의 어떤 부분을 확인하고 싶으신가요?', kind: 'text', placeholder: '예: 저를 얼마나 진지하게 생각하는지 확인하고 싶어요.' },
    { key: '고민 정도', label: '이번 사건이 그냥 넘어갈 일인지 앞으로의 관계를 고려해야 할 일인지 고민되시나요?', kind: 'choice', options: ['그냥 넘어갈 일 같아요', '앞으로의 관계를 고려해야 할 것 같아요', '아직 판단이 안 서요'] },
  ],
  couple: [
    { key: '반복 여부', label: '이 사건이 과거에도 똑같이 반복된 적이 있나요?', kind: 'choice', options: ['네, 자주 반복돼요', '비슷한 적은 있어요', '이번이 처음이에요'] },
    { key: '대화 시도 여부', label: '사건 직후, 이 문제에 대해 대화를 시도하셨나요 아니면 회피하셨나요?', kind: 'choice', options: ['대화를 시도했어요', '회피했어요', '싸우다 흐지부지됐어요'] },
    { key: '바랐던 행동', label: '이번 사건에서 상대가 본인에게 해주길 바랐던 행동은 무엇인가요?', kind: 'text', placeholder: '예: 먼저 미안하다고 말해주길 바랐어요.' },
    { key: "변하지 않겠다 느낀 지점", label: '상대의 반응을 보며 "이 사람은 변하지 않겠구나"라고 느낀 지점이 있었나요?', kind: 'text', placeholder: '예: 매번 똑같은 변명을 반복할 때요.' },
    { key: '관계 유지 동력', label: '이 관계를 유지하게 만드는 본인만의 동력은 무엇인가요?', kind: 'text', placeholder: '예: 예전에 좋았던 기억들, 함께한 시간이 아까워서요.' },
    { key: '헤어질 때 상실감', label: '만약 오늘 당장 헤어진다면, 본인이 감당해야 할 가장 큰 상실감은 무엇일까요?', kind: 'text', placeholder: '예: 혼자가 된다는 외로움, 다시 처음부터 시작해야 한다는 부담.' },
  ],
  married: [
    { key: '일상 지장', label: '이 사건이 부부의 일상에 어떤 실질적 지장을 주었나요?', kind: 'text', placeholder: '예: 며칠간 서로 말을 안 해서 집안 분위기가 냉랭했어요.' },
    { key: '원가족·자녀 개입', label: '사건 당시 원가족이나 자녀가 개입되었나요?', kind: 'choice', options: ['개입됐어요', '개입 안 됐어요'] },
    { key: '선을 넘었는지', label: '사건 도중 서로에게 해서는 안 될 선을 넘었다고 생각하시나요?', kind: 'choice', options: ['네, 넘었어요', '아니요, 그 정도는 아니에요', '잘 모르겠어요'] },
    { key: '양보 가능 최대치', label: '이 갈등을 해결하기 위해 본인이 양보할 수 있는 최대치는 어디까지인가요?', kind: 'text', placeholder: '예: 먼저 대화를 시도하는 것까지는 할 수 있어요.' },
    { key: '신뢰 손상 정도', label: '이번 사건으로 인해 배우자에 대한 신뢰가 어느 정도 깨졌다고 느끼시나요?', kind: 'text', placeholder: '예: 크게 깨지진 않았지만 서운함이 계속 남아있어요.' },
    { key: '10년 뒤 전망', label: '10년 뒤에도 이런 사건이 계속 발생한다면, 어떤 삶을 살고 있을 것 같나요?', kind: 'text', placeholder: '예: 서로에게 무관심한 채로 그냥 같이 사는 사이가 될 것 같아요.' },
  ],
  other: [
    { key: '업무·관계 차질', label: '이 사건 때문에 일상 업무나 다른 인간관계에 차질이 있었나요?', kind: 'choice', options: ['있었어요', '없었어요'] },
    { key: '단호한 대처 여부', label: '상대의 무례함이나 실수를 지적하거나 단호하게 대처했나요?', kind: 'choice', options: ['지적했어요', '그냥 넘어갔어요', '어떻게 해야 할지 몰랐어요'] },
    { key: '기억에 남는 말', label: '상대의 말 중 가장 기억에 남는 비수 같은 한마디는 무엇인가요?', kind: 'text', placeholder: '예: "네가 너무 예민한 거 아니야?"라는 말이 계속 남아요.' },
    { key: '관계 유지 시 가치', label: '이 관계를 계속 유지했을 때 본인이 얻는 긍정적 가치는 무엇인가요?', kind: 'text', placeholder: '예: 오랜 시간 함께한 편안함, 공유하는 추억들.' },
    { key: '사과·변화 가능성', label: '상대가 본인이 원하시는 대로 사과하거나 행동을 고칠 가능성이 있다고 보시나요?', kind: 'choice', options: ['있을 것 같아요', '없을 것 같아요', '잘 모르겠어요'] },
    { key: '관계 끊을 때 걸리는 점', label: '만약 관계를 끊는다면, 어떤 점이 가장 걸리시나요?', kind: 'text', placeholder: '예: 같이 아는 사람들 사이에서 어색해질까 봐 걱정돼요.' },
  ],
};

// 고민 작성 화면 — Q10: 어떤 도움이 필요한지 (question 필드로 저장됨)
const TYPE_Q10: Record<RelationshipType, DeepField> = {
  some:    { key: '조언받고 싶은 부분', label: '상담사에게 사건의 어떤 부분을 가장 중점적으로 조언받고 싶으신가요?', kind: 'text', placeholder: '예: 제가 먼저 연락해도 될지, 상대방 마음이 어떤지 알고 싶어요.' },
  couple:  { key: '원하는 도움', label: '어떤 도움이 더 필요하신가요?', kind: 'choice', options: ['갈등 상황에서의 대화법이 필요해요', '관계 회복을 위한 구체적인 액션 플랜이 필요해요'] },
  married: { key: '원하는 도움', label: '어떤 도움이 더 필요하신가요?', kind: 'choice', options: ['부부간의 갈등 중재가 필요해요', '이혼 준비 단계에 가까워요'] },
  other:   { key: '원하는 도움', label: '어떤 도움이 더 필요하신가요?', kind: 'choice', options: ['관계 개선을 위한 소통 스킬이 필요해요', '거리를 두는 관계 정리가 필요해요'] },
};

// 고민 작성 화면 — 맨 마지막: 명확한 결론을 원하는 핵심 질문. "이별해야 하나요 말아야
// 하나요" 같은 판단이 필요한 질문을 적으면, 상담사가 애매하게 돌려 말하지 않고
// 분명한 결론을 먼저 제시하도록 프롬프트에서 강하게 지시한다.
const CORE_ASK_LABEL = '가장 명확한 답을 듣고 싶은 것이 있다면 적어주세요';
const CORE_ASK_PLACEHOLDER: Record<RelationshipType, string> = {
  couple: '예: 저는 이 사람과 이별을 해야 할까요, 하지 말아야 할까요?',
  married: '예: 저는 이 결혼을 계속 유지해야 할까요, 이혼을 고민해야 할까요?',
  some: '예: 저는 이 사람에게 계속 마음을 쏟아야 할까요, 그만둬야 할까요?',
  other: '예: 저는 이 관계를 계속 이어가야 할까요, 정리해야 할까요?',
};

const COUNSELOR_NAME = '다연';
const INTRO_BUBBLES = [
  `안녕하세요, 저는 관계 상담사 ${COUNSELOR_NAME}이에요 🙂`,
  '지금까지 11,000건이 넘는 연애·결혼·재회 상담을 진행해왔어요.',
  '관계는 사실 감정보다 \'패턴\'에 가까워요. 지금 무슨 일이 있었는지 알면, 앞으로 어떻게 하면 좋을지도 꽤 정확하게 보이거든요.',
];
const QUALIFY_QUESTION = '그런데… 지금 이 페이지를 보고 계신 건, 마음이 편하지만은 않아서겠죠?';

// 관계 유형별로 상황을 더 구체적으로 파악하기 위한 추가 질문
type TypeField = { key: string; label: string; options: string[] };
const TYPE_FIELDS: Record<RelationshipType, TypeField[]> = {
  couple: [
    { key: '교제 기간', label: '만난 지 얼마나 되셨어요?', options: ['3개월 미만', '3개월~1년', '1~3년', '3년 이상'] },
    { key: '지금 상태', label: '지금 상태는요?', options: ['사귀는 중이에요', '헤어졌고, 재회를 원해요', '헤어졌고, 아직 고민 중이에요'] },
    { key: '다툼 빈도', label: '다툼은 얼마나 자주 있나요?', options: ['별로 없어요', '가끔 있어요', '자주 있어요', '최근에 크게 있었어요'] },
    { key: '주된 갈등', label: '가장 신경 쓰이는 부분은?', options: ['연락·시간 문제', '성격 차이', '신뢰 문제', '결혼 등 미래 문제', '잘 모르겠어요'] },
    { key: '연락·만남 빈도 변화', label: '연락이나 만남 빈도는 예전과 비교해서 어때요?', options: ['비슷해요', '조금 줄었어요', '많이 줄었어요', '오히려 늘었어요'] },
    { key: '애정표현 변화', label: '스킨십이나 애정표현은 예전과 비교해서 어때요?', options: ['비슷해요', '줄었어요', '거의 없어요', '제가 더 적극적이에요'] },
    { key: '신뢰 상태', label: '상대방을 믿는 데 어려움이 있나요?', options: ['전혀 없어요', '가끔 의심이 들어요', '자주 불안해요', '이미 신뢰가 깨졌어요'] },
    { key: '미래관 일치도', label: '결혼이나 미래에 대한 생각은 서로 맞나요?', options: ['잘 맞아요', '조금 달라요', '많이 달라요', '얘기해본 적 없어요'] },
    { key: '대화 시도', label: '이 문제에 대해 직접 대화해본 적 있나요?', options: ['자주 얘기해요', '몇 번 시도했어요', '거의 못 꺼냈어요', '얘기하면 싸워요'] },
    { key: '주변 반응', label: '주변(친구·가족)은 이 관계를 어떻게 보나요?', options: ['응원해줘요', '걱정해요', '반대해요', '잘 몰라요'] },
  ],
  married: [
    { key: '결혼 기간', label: '결혼하신 지 얼마나 되셨어요?', options: ['1년 미만', '1~5년', '5~10년', '10년 이상'] },
    { key: '자녀 유무', label: '자녀가 있으신가요?', options: ['없어요', '있어요'] },
    { key: '대화 빈도', label: '요즘 부부 대화는 어때요?', options: ['예전과 비슷해요', '많이 줄었어요', '거의 없어요', '싸울 때만 해요'] },
    { key: '주된 갈등', label: '요즘 가장 큰 갈등은?', options: ['생활 패턴 차이', '경제적 문제', '자녀 양육', '시댁·처가 문제', '애정이 식은 느낌'] },
    { key: '애정표현 변화', label: '스킨십이나 애정표현은 예전과 비교해서 어때요?', options: ['비슷해요', '많이 줄었어요', '거의 없어요', '한쪽만 노력해요'] },
    { key: '갈등 해결 방식', label: '다툰 후에는 보통 어떻게 되나요?', options: ['금방 풀려요', '시간이 좀 걸려요', '서로 냉전이에요', '항상 제가 먼저 풀어요'] },
    { key: '이혼·별거 고려', label: '이혼이나 별거를 생각해보신 적 있나요?', options: ['전혀 없어요', '가끔 스쳐요', '진지하게 고민 중이에요', '이미 얘기 중이에요'] },
    { key: '배우자와 대화 시도', label: '이 문제로 배우자와 진지하게 대화해본 적 있나요?', options: ['자주 얘기해요', '몇 번 시도했어요', '거의 못 꺼냈어요', '얘기하면 싸워요'] },
    { key: '경제적 영향', label: '경제적인 부분이 관계에 영향을 주고 있나요?', options: ['전혀 아니에요', '약간 있어요', '꽤 커요', '가장 큰 문제예요'] },
    { key: '시댁·처가 관계', label: '시댁·처가와의 관계는 어떤가요?', options: ['원만해요', '약간 불편해요', '스트레스가 커요', '관련 없어요'] },
  ],
  some: [
    { key: '만난 기간', label: '만난 지 얼마나 되셨어요?', options: ['2주 미만', '1개월 정도', '2~3개월', '3개월 이상'] },
    { key: '만난 계기', label: '어떻게 만나셨어요?', options: ['소개팅', '지인 소개', '자연스럽게', '소개팅 앱'] },
    { key: '연락 주도권', label: '먼저 연락하는 쪽은 주로 누구인가요?', options: ['제가 먼저', '상대가 먼저', '비슷해요', '요즘은 뜸해요'] },
    { key: '스킨십·진도', label: '스킨십이나 애정표현은 어느 정도인가요?', options: ['아직 없어요', '손 잡는 정도', '가벼운 스킨십 있어요', '꽤 진전됐어요'] },
    { key: '호감 신호', label: '상대방이 저에게 관심 있다고 느끼는 순간이 있나요?', options: ['자주 있어요', '가끔 있어요', '거의 없어요', '헷갈려요'] },
    { key: '다른 이성 여지', label: '상대방에게 다른 관심 상대가 있을 가능성은?', options: ['없을 것 같아요', '잘 모르겠어요', '있을 것 같아요', '이미 알고 있어요'] },
    { key: '만남 빈도', label: '만나는 빈도는 어느 정도예요?', options: ['주 2회 이상', '주 1회 정도', '2주에 한 번', '뜸해요'] },
    { key: '마음 표현', label: '서로 마음을 직접 표현한 적 있나요?', options: ['있어요', '살짝 얘기했어요', '전혀 없어요', '저만 표현했어요'] },
    { key: '상대 연애 스타일', label: '상대방은 연애에 적극적인 편인가요?', options: ['적극적이에요', '소극적이에요', '그때그때 달라요', '잘 모르겠어요'] },
    { key: '관계 정의', label: '지금 이 관계를 뭐라고 부를 수 있을까요?', options: ['썸이라고 생각해요', '그냥 친한 사이 같아요', '저만 진지한 것 같아요', '애매해요'] },
  ],
  other: [
    { key: '관계', label: '어떤 관계이신가요?', options: ['친구', '가족', '직장동료', '기타'] },
    { key: '알고 지낸 기간', label: '알고 지내신 지 얼마나 되셨어요?', options: ['1년 미만', '1~5년', '5년 이상'] },
    { key: '신경 쓰이는 부분', label: '이 관계에서 가장 신경 쓰이는 부분은?', options: ['연락이 줄었어요', '오해가 생긴 것 같아요', '서운한 일이 있었어요', '그냥 거리감이 느껴져요'] },
    { key: '앞으로 바라는 것', label: '앞으로 어떻게 하고 싶으세요?', options: ['예전처럼 가깝게 지내고 싶어요', '적당한 거리를 유지하고 싶어요', '아직 잘 모르겠어요'] },
    { key: '연락 빈도 변화', label: '요즘 연락 빈도는 예전과 비교해서 어때요?', options: ['비슷해요', '조금 줄었어요', '많이 줄었어요', '완전히 끊겼어요'] },
    { key: '갈등 원인 인지', label: '왜 이렇게 됐는지 짐작 가는 이유가 있나요?', options: ['있어요', '어렴풋이 짐작해요', '전혀 모르겠어요', '상대방 문제인 것 같아요'] },
    { key: '대화 시도', label: '이 문제에 대해 직접 얘기해본 적 있나요?', options: ['얘기해봤어요', '시도했지만 어려웠어요', '못 꺼냈어요', '얘기하면 더 어색해져요'] },
    { key: '관계 중요도', label: '이 관계가 나에게 얼마나 중요한가요?', options: ['매우 중요해요', '중요한 편이에요', '그냥 그래요', '사실 부담스러워요'] },
    { key: '제3자 개입', label: '이 상황에 다른 사람이 관련되어 있나요?', options: ['없어요', '있어요', '잘 모르겠어요', '여러 명 얽혀있어요'] },
    { key: '예전과 비교', label: '예전과 비교했을 때 지금 관계는요?', options: ['많이 멀어졌어요', '조금 어색해졌어요', '비슷한데 불안해요', '오히려 가까워지고 있어요'] },
  ],
};

// 모든 관계 유형에 공통으로 물어보는 간단 체크 질문 — 자유 서술(상황 설명·궁금한 점)보다 먼저 노출해
// 부담 없이 답할 수 있게 한다.
const UNIVERSAL_FIELDS: TypeField[] = [
  { key: '지금 기분', label: '지금 기분을 가장 잘 표현하면?', options: ['불안해요', '답답해요', '화가 나요', '서운해요', '그리워요', '후회돼요'] },
  { key: '연락 빈도', label: '요즘 연락은 어떤 상태인가요?', options: ['매일 연락해요', '가끔 연락해요', '거의 안 해요', '전혀 안 해요'] },
  { key: '원하는 것', label: '가장 원하는 건 뭐예요?', options: ['관계를 더 좋게 만들고 싶어요', '다시 가까워지고 싶어요', '지금 이대로 괜찮은지 확인하고 싶어요', '거리를 둬야 할지 고민돼요', '그냥 마음 정리가 필요해요'] },
];

const PACKAGES: Record<Tier, { price: number; original: number; label: string; desc: string; popular?: boolean }> = {
  basic:   { price: 27900, original: 49800, label: '상담 리포트', desc: '핵심 진단 + 전문가 조언 (6개 섹션)' },
  premium: { price: 39900, original: 69800, label: '심층 상담', desc: '상담 리포트 전부 + 전략·장기 조언 (12개 섹션)', popular: true },
};

const fmt = (n: number) => n.toLocaleString('ko-KR') + '원';
const disc = (orig: number, sale: number) => Math.round((1 - sale / orig) * 100);

// sections[] 인덱스: 0=core(4섹션 묶음) 1=deep(4섹션 묶음, 심층만)
const TAB_META = [
  { key: 0, label: '상담 리포트', minTier: 'basic' as Tier },
  { key: 1, label: '심층 전략 & 조언', minTier: 'premium' as Tier },
];
const TIER_ORDER: Record<Tier, number> = { basic: 0, premium: 1 };

export default function LoveCounselPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center"><p className="text-mute text-sm">로딩 중...</p></div>}>
      <LoveCounselInner />
    </Suspense>
  );
}

function LoveCounselInner() {
  const search = useSearchParams();
  const [screen, setScreen] = useState<Screen>('intro');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [email, setEmail] = useState('');
  const [eventStory, setEventStory] = useState('');
  const [reactionExchange, setReactionExchange] = useState('');
  const [immediateEmotion, setImmediateEmotion] = useState('');
  const [deepAnswers, setDeepAnswers] = useState<Record<string, string>>({});
  const [question, setQuestion] = useState('');
  const [coreAsk, setCoreAsk] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [relationshipType, setRelationshipType] = useState<RelationshipType | null>(null);
  const [typeAnswers, setTypeAnswers] = useState<Record<string, string>>({});
  const [introStep, setIntroStep] = useState(0);
  // bubbles: 소개 문구 순차 노출 → qualify: 예/아니오 질문 → typeSelect: 고민 유형 선택
  const [introPhase, setIntroPhase] = useState<'bubbles' | 'qualify' | 'typeSelect'>('bubbles');
  const [errorMsg, setErrorMsg] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [tier, setTier] = useState<Tier>('basic');
  const [activeTab, setActiveTab] = useState(0);
  // 랜딩 페이지에서 특정 가격의 CTA를 눌러 들어온 경우, 패키지 선택 화면을
  // 건너뛰고 폼 작성 후 바로 그 가격으로 결제하러 간다.
  const [preselectedTier, setPreselectedTier] = useState<Tier | null>(null);

  // 랜딩페이지에서 특정 가격 CTA(?tier=...)로 들어와도, 상담사 인트로(채팅 버블 →
  // 예/아니오 → 관계 유형 선택)는 그대로 다 보여준다. 가격만 기억해뒀다가
  // 폼 작성 후 패키지 선택 화면을 건너뛰고 바로 그 가격으로 결제하러 간다.
  useEffect(() => {
    const t = search.get('tier');
    if ((t === 'basic' || t === 'premium') && search.get('paid') !== 'true') {
      setPreselectedTier(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 인트로 채팅 버블을 순차적으로 하나씩 보여준 뒤, 예/아니오 질문 단계로 넘어간다
  useEffect(() => {
    if (screen !== 'intro' || introPhase !== 'bubbles') return;
    if (introStep >= INTRO_BUBBLES.length) {
      const t = setTimeout(() => setIntroPhase('qualify'), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIntroStep(s => s + 1), introStep === 0 ? 500 : 1000);
    return () => clearTimeout(t);
  }, [screen, introPhase, introStep]);

  // 로딩 화면 — 실제 생성이 몇 초 만에 끝나도 "심층 분석 중"이라는 느낌이 들도록
  // 진행률을 시간에 따라 서서히 올린다. 92%에서 멈춰 있다가, 실제 응답이 오면
  // 100%로 채우고 결과 화면으로 넘어간다.
  useEffect(() => {
    if (screen !== 'loading') return;
    setLoadingProgress(0);
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const target = 92 * (1 - Math.exp(-elapsed / 6));
      setLoadingProgress(p => Math.max(p, Math.min(92, target)));
    }, 200);
    return () => clearInterval(id);
  }, [screen]);

  // 결제 완료 후 돌아온 경우 — localStorage에서 입력 내용을 읽어 바로 결과 생성
  useEffect(() => {
    if (search.get('paid') !== 'true') return;
    const t = (search.get('tier') as Tier) ?? 'basic';
    setTier(t);
    setScreen('loading');

    try {
      const savedName = localStorage.getItem('love_counsel_name') ?? '';
      const savedGender = (localStorage.getItem('love_counsel_gender') as Gender) ?? 'female';
      const savedEmail = localStorage.getItem('love_counsel_email') ?? '';
      const savedSituation = localStorage.getItem('love_counsel_situation') ?? '';
      const savedQuestion = localStorage.getItem('love_counsel_question') ?? '';
      const savedRelType = localStorage.getItem('love_counsel_relationship_type') || undefined;
      const savedDetails = localStorage.getItem('love_counsel_details') || undefined;

      if (!savedName || !savedSituation || !savedQuestion) {
        setScreen('error');
        setErrorMsg('이전 상담 정보를 찾을 수 없어요. 처음부터 다시 시도해주세요.');
        return;
      }

      fetch('/api/love-counsel-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: t,
          name: savedName,
          gender: savedGender,
          situation: savedSituation,
          question: savedQuestion,
          relationshipType: savedRelType,
          details: savedDetails,
          email: savedEmail || undefined,
        }),
      })
        .then(r => r.json())
        .then((data: { status: string; sections?: string[]; error?: string }) => {
          if (data.status === 'success' && data.sections) {
            setSections(data.sections);
            setLoadingProgress(100);
            setTimeout(() => setScreen('result'), 500);
          } else {
            setScreen('error');
            setErrorMsg(data.error ?? '결과 생성에 실패했어요.');
          }
        })
        .catch(() => {
          setScreen('error');
          setErrorMsg('네트워크 오류가 발생했어요.');
        });
    } catch {
      setScreen('error');
      setErrorMsg('이전 상담 정보를 불러오지 못했어요.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goCheckout(selectedTier: Tier) {
    // 최근 사건 서술(Q1~Q3) + 관계 유형별 심층 진단(Q4~Q9)을 하나로 묶어
    // 상담 프롬프트에 그대로 전달한다 (API 스키마는 situation 필드 그대로 재사용).
    const deepFields = TYPE_DEEP_FIELDS[relationshipType ?? 'couple'];
    const deepParts = deepFields
      .filter(f => deepAnswers[f.key])
      .map(f => `[${f.key}] ${deepAnswers[f.key]}`);
    const combinedSituation = [
      eventStory.trim() ? `[최근 사건] ${eventStory.trim()}` : '',
      reactionExchange.trim() ? `[그때 나의 행동·말과 상대방 반응] ${reactionExchange.trim()}` : '',
      immediateEmotion.trim() ? `[사건 직후 느낀 감정] ${immediateEmotion.trim()}` : '',
      ...deepParts,
    ].filter(Boolean).join('\n\n');

    // 명확한 결론을 원하는 핵심 질문이 있다면 맨 앞에 붙여서, 프롬프트가
    // 가장 먼저 눈에 띄게 하고 반드시 단정적으로 답하도록 한다.
    const combinedQuestion = coreAsk.trim()
      ? `[반드시 명확한 결론으로 답할 것] ${coreAsk.trim()}\n\n${question.trim()}`
      : question.trim();

    localStorage.setItem('love_counsel_name', name);
    localStorage.setItem('love_counsel_gender', gender);
    localStorage.setItem('love_counsel_email', email);
    localStorage.setItem('love_counsel_situation', combinedSituation);
    localStorage.setItem('love_counsel_question', combinedQuestion);
    if (relationshipType) localStorage.setItem('love_counsel_relationship_type', relationshipType);
    const detailsText = Object.entries(typeAnswers).map(([k, v]) => `${k}: ${v}`).join(' / ');
    if (detailsText) localStorage.setItem('love_counsel_details', detailsText);
    localStorage.setItem('saju_result_email', email); // 체크아웃 위젯이 재사용하는 키

    const pkg = PACKAGES[selectedTier];
    const params = new URLSearchParams({
      cat: 'love-counsel',
      tier: selectedTier,
      amount: String(pkg.price),
      name: '연애상담',
      bi: '',
    });
    window.location.href = `/checkout?${params.toString()}`;
  }

  if (screen === 'loading') {
    const pct = Math.round(loadingProgress);
    const stage =
      pct < 20 ? '상황을 꼼꼼히 읽고 있어요' :
      pct < 45 ? '심리 패턴을 분석하고 있어요' :
      pct < 70 ? '프레임·애착 유형을 진단하고 있어요' :
      pct < 90 ? '맞춤 액션 플랜을 작성하고 있어요' :
      '상담 리포트를 마무리하고 있어요';
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-full border-4 border-purple-rich/30 border-t-purple-rich animate-spin" />
        <div className="w-full max-w-xs">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-sm text-body">{stage}</p>
            <p className="text-sm font-bold text-purple-bright">{pct}%</p>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#881337,#e11d48)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-red-800/50 bg-red-900/20 p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h1 className="text-lg font-bold text-white mb-2">오류가 발생했어요</h1>
          <p className="text-sm text-body mb-6">{errorMsg}</p>
          <Link href="/love-counsel" className="inline-flex items-center justify-center w-full h-11 rounded-full border border-purple-rich/40 text-purple-light text-sm font-semibold hover:bg-purple-rich/10 transition-all">
            처음부터 다시하기
          </Link>
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    const availableTabs = TAB_META.filter(t => TIER_ORDER[t.minTier] <= TIER_ORDER[tier]);
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container max-w-lg py-12">
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">연애상담 결과</p>
          <h1 className="text-xl font-bold text-white mb-2 text-center">{name}님을 위한 상담이에요</h1>

          {availableTabs.length > 1 ? (
            <>
              <p className="text-xs text-mute text-center mb-4">
                총 {sections.length * 6}개 섹션이 두 탭에 나뉘어 있어요 — 아래 탭을 눌러 심층 전략까지 모두 확인해보세요
              </p>
              <div className="flex gap-2 mb-6">
                {availableTabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold transition-colors"
                    style={activeTab === t.key
                      ? { background: 'linear-gradient(135deg,#881337,#e11d48)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {t.label} {activeTab !== t.key ? '👉' : ''}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="mb-6" />
          )}

          {sections[activeTab] ? <ChapterResult sections={[sections[activeTab]]} /> : null}

          <p className="text-center text-xs text-mute mt-6">
            결과지는 이메일로도 발송됩니다 · 본 상담은 참고용 콘텐츠입니다
          </p>
          <Link href="/" className="mt-6 inline-flex items-center justify-center w-full h-12 rounded-full border border-purple-rich/40 text-purple-light font-semibold text-sm hover:bg-purple-rich/10 transition-all">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  if (screen === 'intro') {
    const allBubblesShown = introStep >= INTRO_BUBBLES.length;
    return (
      <div className="min-h-screen bg-canvas flex flex-col px-5 py-8">
        <div className="max-w-sm mx-auto w-full flex flex-col flex-1">

          {/* 상담사 프로필 헤더 */}
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg,#881337,#e11d48)' }}>💬</div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: '#34d399', borderColor: '#0e0508' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white">{COUNSELOR_NAME}</p>
                <span className="text-[10px]" style={{ color: '#34d399' }}>● 상담중</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>관계 상담 경력 15년 · 누적 상담 11,000+</p>
            </div>
          </div>

          {introPhase !== 'typeSelect' ? (
            <div className="flex flex-col gap-3 mb-8">
              {INTRO_BUBBLES.slice(0, introStep).map((line, i) => (
                <div key={i} className="flex items-start gap-2.5" style={{ animation: 'love-bubble-in 0.4s ease' }}>
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm" style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>💌</div>
                  <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 'calc(100% - 44px)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{line}</p>
                  </div>
                </div>
              ))}
              {!allBubblesShown ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm" style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>💌</div>
                  <div className="rounded-2xl rounded-tl-md px-4 py-3 flex gap-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `love-dot-bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                </div>
              ) : null}

              {introPhase === 'qualify' ? (
                <>
                  <div className="flex items-start gap-2.5" style={{ animation: 'love-bubble-in 0.4s ease' }}>
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm" style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>💌</div>
                    <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)', maxWidth: 'calc(100% - 44px)' }}>
                      <p className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{QUALIFY_QUESTION}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-1" style={{ animation: 'love-bubble-in 0.4s ease 0.15s both' }}>
                    <button
                      onClick={() => setIntroPhase('typeSelect')}
                      className="w-full h-12 rounded-full text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg,#881337,#e11d48)' }}
                    >
                      네, 맞아요
                    </button>
                    <button
                      onClick={() => setIntroPhase('typeSelect')}
                      className="text-xs text-mute hover:text-body transition-colors py-1"
                    >
                      그냥 살펴보는 중이에요
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div style={{ animation: 'love-bubble-in 0.4s ease' }}>
              <p className="text-sm text-body mb-5 text-center">지금 어떤 관계 때문에 오셨어요?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {RELATIONSHIP_TYPES.map(rt => (
                  <button
                    key={rt.key}
                    onClick={() => { setRelationshipType(rt.key); setScreen('form'); }}
                    className="rounded-2xl px-4 py-4 text-left transition-transform hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span className="text-lg">{rt.emoji}</span>
                    <p className="text-sm font-semibold text-white mt-1.5">{rt.label}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-mute text-center mt-6">약 2분 소요 · 참고용 상담 콘텐츠예요</p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes love-bubble-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes love-dot-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  if (screen === 'form') {
    const allQuickFields = [...TYPE_FIELDS[relationshipType ?? 'couple'], ...UNIVERSAL_FIELDS];
    const quickFieldsAnswered = allQuickFields.every(f => !!typeAnswers[f.key]);
    const canProceed = name.trim().length > 0 && /.+@.+\..+/.test(email) && quickFieldsAnswered;
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container max-w-md py-12">
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">상담 신청</p>
          <h1 className="text-xl font-bold text-white mb-8 text-center">몇 가지만<br />간단히 체크해주세요</h1>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-body mb-1.5">이름</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60"
                  placeholder="이름을 입력해주세요" />
              </div>
              <div>
                <label className="block text-xs text-body mb-1.5">성별</label>
                <div className="flex gap-2">
                  {(['female', 'male'] as Gender[]).map(g => (
                    <button key={g} onClick={() => setGender(g)}
                      className="flex-1 h-11 rounded-xl text-sm font-semibold transition-colors"
                      style={gender === g
                        ? { background: 'rgba(225,29,72,0.25)', border: '1px solid rgba(225,29,72,0.6)', color: '#fda4af' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      {g === 'female' ? '여성' : '남성'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {allQuickFields.map(f => (
              <div key={f.key}>
                <label className="block text-xs text-body mb-1.5">{f.label}</label>
                <div className="flex flex-wrap gap-2">
                  {f.options.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTypeAnswers(a => ({ ...a, [f.key]: opt }))}
                      className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                      style={typeAnswers[f.key] === opt
                        ? { background: 'rgba(225,29,72,0.25)', border: '1px solid rgba(225,29,72,0.6)', color: '#fda4af' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs text-body mb-1.5">결과지 받을 이메일 (간단하게만 발송됩니다)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60"
                placeholder="example@email.com" />
            </div>
          </div>

          <button
            disabled={!canProceed}
            onClick={() => setScreen('concern')}
            className="w-full h-14 rounded-full text-white font-bold text-base mt-8 disabled:opacity-30 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#881337,#e11d48)' }}
          >
            다음으로 →
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'concern') {
    const rType = relationshipType ?? 'couple';
    const deepFields = TYPE_DEEP_FIELDS[rType];
    const q10 = TYPE_Q10[rType];
    const canProceed = eventStory.trim().length >= 10 && question.trim().length >= 2;

    const renderDeepField = (f: DeepField) => {
      if (f.kind === 'choice') {
        return (
          <div className="flex flex-wrap gap-2">
            {f.options!.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setDeepAnswers(a => ({ ...a, [f.key]: opt }))}
                className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                style={deepAnswers[f.key] === opt
                  ? { background: 'rgba(225,29,72,0.25)', border: '1px solid rgba(225,29,72,0.6)', color: '#fda4af' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      }
      return (
        <textarea
          value={deepAnswers[f.key] ?? ''}
          onChange={e => setDeepAnswers(a => ({ ...a, [f.key]: e.target.value }))}
          rows={2}
          className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
          placeholder={f.placeholder}
        />
      );
    };

    return (
      <div className="min-h-screen bg-canvas">
        <div className="container max-w-md py-12">
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">상담 신청</p>
          <h1 className="text-xl font-bold text-white mb-8 text-center">최근 있었던 일을<br />구체적으로 들려주세요</h1>

          <p className="text-xs font-semibold text-purple-bright mb-3">최근 사건 집중 분석</p>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-body mb-1.5">{EVENT_STORY_LABEL}</label>
              <textarea value={eventStory} onChange={e => setEventStory(e.target.value)} rows={5}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={EVENT_STORY_PLACEHOLDER[rType]} />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">{REACTION_EXCHANGE_LABEL}</label>
              <textarea value={reactionExchange} onChange={e => setReactionExchange(e.target.value)} rows={3}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={REACTION_EXCHANGE_PLACEHOLDER[rType]} />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">{IMMEDIATE_EMOTION_LABEL}</label>
              <textarea value={immediateEmotion} onChange={e => setImmediateEmotion(e.target.value)} rows={2}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={IMMEDIATE_EMOTION_PLACEHOLDER} />
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '28px 0 20px' }} />
          <p className="text-xs font-semibold text-purple-bright mb-3">{RELATIONSHIP_TYPES.find(r => r.key === rType)?.label} 심층 진단</p>
          <div className="flex flex-col gap-5">
            {deepFields.map(f => (
              <div key={f.key}>
                <label className="block text-xs text-body mb-1.5">{f.label}</label>
                {renderDeepField(f)}
              </div>
            ))}

            <div>
              <label className="block text-xs text-body mb-1.5">{q10.label}</label>
              {q10.kind === 'choice' ? (
                <div className="flex flex-wrap gap-2">
                  {q10.options!.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setQuestion(opt)}
                      className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                      style={question === opt
                        ? { background: 'rgba(225,29,72,0.25)', border: '1px solid rgba(225,29,72,0.6)', color: '#fda4af' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                  className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                  placeholder={q10.placeholder} />
              )}
            </div>

            <div>
              <label className="block text-xs text-body mb-1.5">{CORE_ASK_LABEL} <span className="text-mute">(선택)</span></label>
              <textarea value={coreAsk} onChange={e => setCoreAsk(e.target.value)} rows={2}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={CORE_ASK_PLACEHOLDER[rType]} />
              <p className="text-[11px] text-mute mt-1.5">이런 질문일수록 상담사가 애매하게 넘기지 않고 분명한 결론을 드려요</p>
            </div>
          </div>

          <button
            disabled={!canProceed}
            onClick={() => preselectedTier ? goCheckout(preselectedTier) : setScreen('package')}
            className="w-full h-14 rounded-full text-white font-bold text-base mt-8 disabled:opacity-30 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#881337,#e11d48)' }}
          >
            {preselectedTier ? `${fmt(PACKAGES[preselectedTier].price)} 결제하러 가기 →` : '다음으로 →'}
          </button>

          <button
            onClick={() => setScreen('form')}
            className="w-full text-center text-xs text-mute mt-4"
          >
            ← 이전으로
          </button>
        </div>
      </div>
    );
  }

  // screen === 'package'
  const tiers: Tier[] = ['basic', 'premium'];
  return (
    <div className="min-h-screen bg-canvas">
      <div className="container max-w-xl py-12">
        <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2">패키지 선택</p>
        <h1 className="text-2xl font-bold text-white mb-8">어느 깊이까지<br />상담받으시겠어요?</h1>

        <div className="flex flex-col gap-4">
          {tiers.map(t => {
            const pkg = PACKAGES[t];
            const dr = disc(pkg.original, pkg.price);
            return (
              <button
                key={t}
                onClick={() => goCheckout(t)}
                className="text-left rounded-2xl p-5 transition-transform hover:scale-[1.01]"
                style={pkg.popular
                  ? { background: 'linear-gradient(135deg,rgba(225,29,72,0.2),rgba(136,19,55,0.3))', border: '1.5px solid rgba(225,29,72,0.6)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-white">{pkg.label}</p>
                    {pkg.popular ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(225,29,72,0.3)', color: '#fda4af' }}>가장 많이 선택</span> : null}
                  </div>
                  <p className="text-xs" style={{ color: '#f87171' }}>{dr}% 할인</p>
                </div>
                <p className="text-xs text-mute mb-3">{pkg.desc}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-mute line-through">{fmt(pkg.original)}</p>
                  <p className="text-lg font-black text-white">{fmt(pkg.price)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
