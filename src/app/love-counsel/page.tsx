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

const SITUATION_PLACEHOLDER: Record<RelationshipType, string> = {
  couple: '예: 3개월 전 헤어진 사람이 있는데, 최근에 SNS로 제 게시물에 자주 좋아요를 눌러요. 만난 지는 1년 정도 됐고, 헤어진 이유는 서로 바빠서 연락이 뜸해졌기 때문이에요.',
  married: '예: 결혼 5년 차인데, 요즘 대화가 눈에 띄게 줄었어요. 큰 다툼은 없지만 서로 각자 할 일만 하는 느낌이에요.',
  some: '예: 소개로 만나서 3번 정도 데이트했어요. 연락은 매일 하는데 먼저 만나자는 말은 안 해요.',
  other: '예: 친한 친구인데 최근에 사소한 일로 연락이 뜸해졌어요. 제가 뭘 잘못했는지 모르겠어요.',
};

// 상황 설명을 더 입체적으로 파악하기 위한 추가 서술형 질문 — 상담사가 실제로
// 근거를 갖고 진단하려면 '최근에 있었던 구체적 사건'과 '상대방의 실제 언행'이 필요하다.
const RECENT_EVENT_PLACEHOLDER: Record<RelationshipType, string> = {
  couple: '예: 지난주에 사소한 일로 다퉜는데, 그 후로 연락이 눈에 띄게 줄었어요.',
  married: '예: 어제 대화하다가 서로 언성이 높아졌어요. 그 전에는 그냥 조용히 지내던 편이었어요.',
  some: '예: 지난 데이트 이후로 먼저 연락이 뜸해진 것 같아요.',
  other: '예: 며칠 전부터 메시지 답장이 눈에 띄게 늦어졌어요.',
};
const PARTNER_WORDS_PLACEHOLDER: Record<RelationshipType, string> = {
  couple: '예: "요즘 좀 지친다"는 말을 했는데, 정확히 무슨 뜻인지 모르겠어요.',
  married: '예: "우리 이렇게 사는 게 맞나 싶다"고 말했어요.',
  some: '예: "다음에 또 보자"고는 하는데, 구체적인 약속은 안 잡아요.',
  other: '예: "요즘 좀 바빠서"라고만 하고 자세한 얘기는 안 해요.',
};
const TRIED_PLACEHOLDER: Record<RelationshipType, string> = {
  couple: '예: 먼저 연락해봤는데 반응이 뜨뜻미지근했어요.',
  married: '예: 대화를 시도했지만 서로 감정만 상하고 끝났어요.',
  some: '예: 먼저 약속을 잡아보려 했는데 계속 미뤄졌어요.',
  other: '예: 안부 메시지를 보냈는데 짧게만 답이 왔어요.',
};

const COUNSELOR_NAME = '다연';
const INTRO_BUBBLES = [
  `안녕하세요, 저는 관계 상담사 ${COUNSELOR_NAME}이에요 🙂`,
  '지금까지 11,000건이 넘는 연애·결혼·재회 상담을 진행해왔어요.',
  '관계는 사실 감정보다 \'패턴\'에 가까워요. 지금 무슨 일이 있었는지 알면, 앞으로 어떻게 하면 좋을지도 꽤 정확하게 보이거든요.',
];
const QUALIFY_QUESTION = '그런데… 지금 이 페이지를 보고 계신 건, 마음이 편하지만은 않아서겠죠?';

const QUESTION_PLACEHOLDER: Record<RelationshipType, string> = {
  couple: '예: 제가 먼저 연락해도 될까요? 상대방도 저를 다시 생각하고 있는 걸까요?',
  married: '예: 이 상태로 계속 지내도 괜찮을까요? 대화를 늘리려면 어떻게 시작해야 할까요?',
  some: '예: 저한테 관심이 있는 게 맞을까요? 제가 먼저 만나자고 해도 될까요?',
  other: '예: 제가 먼저 연락해서 괜찮은지 물어봐도 될까요?',
};

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
  basic:   { price: 59900, original: 109800, label: '상담 리포트', desc: '핵심 진단 + 전문가 조언 (4개 섹션)' },
  premium: { price: 89900, original: 169800, label: '심층 상담', desc: '상담 리포트 전부 + 전략·장기 조언 (8개 섹션)', popular: true },
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
  const [situation, setSituation] = useState('');
  const [recentEvent, setRecentEvent] = useState('');
  const [partnerWords, setPartnerWords] = useState('');
  const [triedSoFar, setTriedSoFar] = useState('');
  const [question, setQuestion] = useState('');
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
            setScreen('result');
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
    // 상황 설명 + 최근 있었던 일 / 상대방의 말·행동 / 시도해본 것을 하나로 묶어
    // 상담 프롬프트에 그대로 전달한다 (API 스키마는 situation 필드 그대로 재사용).
    const extraParts: string[] = [];
    if (recentEvent.trim()) extraParts.push(`[최근 있었던 일] ${recentEvent.trim()}`);
    if (partnerWords.trim()) extraParts.push(`[상대방의 말·행동] ${partnerWords.trim()}`);
    if (triedSoFar.trim()) extraParts.push(`[지금까지 시도해본 것] ${triedSoFar.trim()}`);
    const combinedSituation = [situation.trim(), ...extraParts].join('\n\n');

    localStorage.setItem('love_counsel_name', name);
    localStorage.setItem('love_counsel_gender', gender);
    localStorage.setItem('love_counsel_email', email);
    localStorage.setItem('love_counsel_situation', combinedSituation);
    localStorage.setItem('love_counsel_question', question);
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
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-full border-4 border-purple-rich/30 border-t-purple-rich animate-spin" />
        <p className="text-sm text-body">전문가 상담 리포트를 준비하고 있어요...</p>
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
          <h1 className="text-xl font-bold text-white mb-6 text-center">{name}님을 위한 상담이에요</h1>

          {availableTabs.length > 1 ? (
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
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}

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
    const canProceed = situation.trim().length >= 10 && question.trim().length >= 5;
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container max-w-md py-12">
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">상담 신청</p>
          <h1 className="text-xl font-bold text-white mb-8 text-center">조금 더 자세히<br />들려주시면 상담이 정확해져요</h1>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-body mb-1.5">지금 상황을 편하게 설명해주세요</label>
              <textarea value={situation} onChange={e => setSituation(e.target.value)} rows={5}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={SITUATION_PLACEHOLDER[relationshipType ?? 'couple']} />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">최근에 있었던 일 <span className="text-mute">(선택)</span></label>
              <textarea value={recentEvent} onChange={e => setRecentEvent(e.target.value)} rows={3}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={RECENT_EVENT_PLACEHOLDER[relationshipType ?? 'couple']} />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">상대방이 최근에 했던 말이나 행동 <span className="text-mute">(선택)</span></label>
              <textarea value={partnerWords} onChange={e => setPartnerWords(e.target.value)} rows={3}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={PARTNER_WORDS_PLACEHOLDER[relationshipType ?? 'couple']} />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">지금까지 시도해본 것이 있다면 <span className="text-mute">(선택)</span></label>
              <textarea value={triedSoFar} onChange={e => setTriedSoFar(e.target.value)} rows={3}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={TRIED_PLACEHOLDER[relationshipType ?? 'couple']} />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">궁금한 점 — 어떤 질문이든 괜찮아요</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder={QUESTION_PLACEHOLDER[relationshipType ?? 'couple']} />
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
