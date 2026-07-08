// =====================================================
// POST /api/interpret
// =====================================================
// 만세력 텍스트 + 상품 정보를 받아 LLM 해석 결과를 반환합니다.
// 단품 신년운세: 3번의 LLM 호출로 ~3만자 결과 생성
//
// Body: { productSlug, name, birthDate, birthTime, timeUnknown, gender, manseryeokText }
// Response: { status: "success", sections: string[] }

import { NextResponse, type NextRequest } from "next/server";

export const runtime = 'edge';
export const maxDuration = 60;
import { z } from "zod";
import { generateInterpretation } from "@/lib/saju/llm";
import {
  buildDanpumSection1,
  buildDanpumSection2,
  buildDanpumSection3,
  buildBasicSection1,
  buildBasicSection2,
  buildBasicSection3,
  buildBasicJami,
  buildPremiumSection1,
  buildPremiumSection2,
  buildPremiumSection3,
  buildPremiumJami,
  buildPremiumTarot,
} from "@/lib/saju/prompt";

const bodySchema = z.object({
  productSlug: z.string(),
  name: z.string().default(""),
  birthDate: z.string(),
  birthTime: z.string().nullable().default(null),
  timeUnknown: z.boolean().default(false),
  gender: z.enum(["male", "female"]),
  manseryeokText: z.string(),
  tarotCard: z.object({ name: z.string(), keyword: z.string(), advice: z.string() }).nullable().default(null),
  catId: z.string().optional(),
  partnerText: z.string().optional(),
});

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error" as const, error: "잘못된 요청입니다", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const currentYear = new Date().getFullYear();
  const currentAge = getAge(d.birthDate);

  const isBasic = d.productSlug.startsWith('basic-');
  const isPremium = d.productSlug.startsWith('premium-');

  const promptInput = {
    productSlug: d.productSlug,
    productName: d.productSlug,
    manseryeokText: d.manseryeokText,
    name: d.name,
    birthDate: d.birthDate,
    birthTime: d.birthTime,
    timeUnknown: d.timeUnknown,
    gender: d.gender,
    currentYear,
    currentAge,
    tarotCard: d.tarotCard,
    catId: d.catId as import("@/lib/saju/category-configs").CategoryId | undefined,
    partnerText: d.partnerText,
  };

  try {
    if (isBasic) {
      // 베이직: 사주 3섹션 + 자미두수 전용 심층 섹션 병렬 호출
      const [r1, r2, r3, r4] = await Promise.all([
        generateInterpretation(buildBasicSection1(promptInput)),
        generateInterpretation(buildBasicSection2(promptInput)),
        generateInterpretation(buildBasicSection3(promptInput)),
        generateInterpretation(buildBasicJami(promptInput)),
      ]);
      return NextResponse.json({
        status: "success" as const,
        sections: [r1.text, r2.text, r3.text, r4.text],
      });
    }

    if (isPremium) {
      // 종합: 사주 3섹션 + 자미두수 심층 + 타로 심층 병렬 호출
      const [r1, r2, r3, r4, r5] = await Promise.all([
        generateInterpretation(buildPremiumSection1(promptInput)),
        generateInterpretation(buildPremiumSection2(promptInput)),
        generateInterpretation(buildPremiumSection3(promptInput)),
        generateInterpretation(buildPremiumJami(promptInput)),
        generateInterpretation(buildPremiumTarot(promptInput)),
      ]);
      return NextResponse.json({
        status: "success" as const,
        sections: [r1.text, r2.text, r3.text, r4.text, r5.text],
      });
    }

    // 단품
    const [r1, r2, r3] = await Promise.all([
      generateInterpretation(buildDanpumSection1(promptInput)),
      generateInterpretation(buildDanpumSection2(promptInput)),
      generateInterpretation(buildDanpumSection3(promptInput)),
    ]);

    return NextResponse.json({
      status: "success" as const,
      sections: [r1.text, r2.text, r3.text],
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error" as const, error: err instanceof Error ? err.message : "해석 생성 실패" },
      { status: 502 },
    );
  }
}
