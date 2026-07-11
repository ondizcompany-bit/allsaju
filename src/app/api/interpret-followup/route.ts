// =====================================================
// POST /api/interpret-followup
// =====================================================
// 결과지를 다 본 후 1,000원 결제하고 남기는 추가 질문 1건에 답한다.
// 기존 사주/타로 맥락을 유지한 채 짧고 구체적으로 답변한다.
//
// Body: { name, birthDate, birthTime, timeUnknown, gender, manseryeokText, categoryTitle, tarotCard, question }
// Response: { status: "success", answer: string } | { status: "error" }

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { generateInterpretation } from "@/lib/saju/llm";

export const runtime = 'edge';
export const maxDuration = 60;

const bodySchema = z.object({
  name: z.string(),
  birthDate: z.string(),
  birthTime: z.string().nullable().default(null),
  timeUnknown: z.boolean().default(false),
  gender: z.enum(["male", "female"]),
  manseryeokText: z.string(),
  categoryTitle: z.string(),
  tarotCard: z.object({ name: z.string(), keyword: z.string(), advice: z.string() }).nullable().default(null),
  question: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error" as const, error: "잘못된 요청입니다" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const tarotBlock = d.tarotCard
    ? `\n[선택한 타로 카드]\n카드명: ${d.tarotCard.name}\n키워드: ${d.tarotCard.keyword}\n카드 메시지: ${d.tarotCard.advice}\n`
    : '';

  const system = `너는 따뜻하고 솔직한 명리학·자미두수 상담가다. "${d.categoryTitle}" 결과지를 이미 받은 손님이 추가로 남긴 질문 딱 하나에 답한다.

[작성 규칙]
- 이미 결과지를 다 읽은 손님이니 배경 설명 없이 질문에 바로 답한다.
- 총 3~4문단, 문단마다 80~120자. 문단 사이 빈 줄.
- ${d.name}님을 자주 불러주고 친근한 말투("~이에요", "~랍니다", "~거든요")로 쓴다.
- 명리학·자미두수 용어는 쉬운 말로 바로 풀어 설명한다.
- 사주 명식을 근거로 구체적으로 답하되, 마지막 문단은 실천 가능한 조언 한 가지로 마무리한다.
- 절대 중간에 끊기지 않는다.`;

  const user = `[분석 대상]
이름: ${d.name}
생년월일: ${d.birthDate}${d.timeUnknown ? " (시 미상)" : d.birthTime ? ` ${d.birthTime}` : ""}
성별: ${d.gender === "male" ? "남성" : "여성"}

[만세력 명식 데이터]
${d.manseryeokText}
${tarotBlock}
[${d.name}님의 추가 질문]
${d.question}

위 질문에 답하라.`;

  try {
    const result = await generateInterpretation({ system, user });
    return NextResponse.json({ status: "success" as const, answer: result.text });
  } catch (e) {
    return NextResponse.json({ status: "error" as const, error: String(e) }, { status: 500 });
  }
}
