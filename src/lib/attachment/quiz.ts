// =====================================================
// 애착유형검사 문항 + 채점 로직
// =====================================================
// 단순화된 2축(불안/회피) 애착 이론 기반 자체 제작 문항.
// 임상 진단 도구가 아닌 자기이해/재미 목적의 라이트 버전.

export type AttachmentAxis = 'anxiety' | 'avoidance';

export type QuizQuestion = {
  id: string;
  axis: AttachmentAxis;
  text: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'a1', axis: 'anxiety', text: '연인이 연락이 늦으면 불안해지고 자꾸 확인하고 싶어진다.' },
  { id: 'a2', axis: 'anxiety', text: '상대방이 나를 정말 사랑하는지 자주 의심하게 된다.' },
  { id: 'a3', axis: 'anxiety', text: '연인과 조금만 멀어져도 관계가 끝날까봐 걱정된다.' },
  { id: 'a4', axis: 'anxiety', text: '상대방의 사소한 말이나 표정 변화에도 마음이 크게 흔들린다.' },
  { id: 'a5', axis: 'anxiety', text: '연애할 때 상대방의 사랑을 계속 확인받고 싶어진다.' },
  { id: 'a6', axis: 'anxiety', text: '혼자 있는 시간보다 연인과 함께 있는 시간이 늘 더 안전하게 느껴진다.' },
  { id: 'a7', axis: 'anxiety', text: '다투고 나면 먼저 연락하지 않으면 견디기 힘들다.' },
  { id: 'a8', axis: 'anxiety', text: '상대가 나 없이도 즐거워 보이면 서운한 마음이 크게 든다.' },
  { id: 'v1', axis: 'avoidance', text: '너무 가까워지는 관계는 부담스럽게 느껴진다.' },
  { id: 'v2', axis: 'avoidance', text: '힘든 일이 있어도 연인에게 기대기보다 혼자 해결하는 게 편하다.' },
  { id: 'v3', axis: 'avoidance', text: '누군가 내게 의지하려 하면 살짝 거리를 두고 싶어진다.' },
  { id: 'v4', axis: 'avoidance', text: '감정을 솔직하게 표현하는 게 어색하고 어렵다.' },
  { id: 'v5', axis: 'avoidance', text: '연애 초반에 상대가 너무 적극적으로 다가오면 오히려 마음이 식는다.' },
  { id: 'v6', axis: 'avoidance', text: '혼자만의 시간과 공간이 연애보다 더 중요하게 느껴질 때가 많다.' },
  { id: 'v7', axis: 'avoidance', text: '관계에서 문제가 생기면 대화보다 그냥 거리를 두는 편이다.' },
  { id: 'v8', axis: 'avoidance', text: '누군가와 깊이 얽히는 것보다 적당한 거리를 유지하는 게 편하다.' },
];

export const SCALE_LABELS = ['전혀 아니다', '아니다', '보통이다', '그렇다', '매우 그렇다'];

export type AttachmentType = 'secure' | 'anxious' | 'avoidant' | 'fearful';

export const ATTACHMENT_TYPE_LABEL: Record<AttachmentType, string> = {
  secure: '안정형',
  anxious: '불안형',
  avoidant: '회피형',
  fearful: '혼란형',
};

export type AttachmentResult = {
  anxietyScore: number;   // 1~5
  avoidanceScore: number; // 1~5
  type: AttachmentType;
};

// answers: { [questionId]: 1~5 }
export function scoreAttachment(answers: Record<string, number>): AttachmentResult {
  const anxietyItems = QUIZ_QUESTIONS.filter(q => q.axis === 'anxiety');
  const avoidanceItems = QUIZ_QUESTIONS.filter(q => q.axis === 'avoidance');

  const avg = (items: QuizQuestion[]) => {
    const sum = items.reduce((acc, q) => acc + (answers[q.id] ?? 3), 0);
    return sum / items.length;
  };

  const anxietyScore = avg(anxietyItems);
  const avoidanceScore = avg(avoidanceItems);

  const highAnxiety = anxietyScore >= 3;
  const highAvoidance = avoidanceScore >= 3;

  let type: AttachmentType;
  if (!highAnxiety && !highAvoidance) type = 'secure';
  else if (highAnxiety && !highAvoidance) type = 'anxious';
  else if (!highAnxiety && highAvoidance) type = 'avoidant';
  else type = 'fearful';

  return { anxietyScore: Math.round(anxietyScore * 100) / 100, avoidanceScore: Math.round(avoidanceScore * 100) / 100, type };
}
