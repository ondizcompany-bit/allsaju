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
} from "@/lib/saju/prompt";

const bodySchema = z.object({
  productSlug: z.string(),
  name: z.string().default(""),
  birthDate: z.string(),
  birthTime: z.string().nullable().default(null),
  timeUnknown: z.boolean().default(false),
  gender: z.enum(["male", "female"]),
  manseryeokText: z.string(),
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

  const promptInput = {
    productSlug: d.productSlug,
    productName: "2026 병오년 신년 총운 — 단품",
    manseryeokText: d.manseryeokText,
    name: d.name,
    birthDate: d.birthDate,
    birthTime: d.birthTime,
    timeUnknown: d.timeUnknown,
    gender: d.gender,
    currentYear,
    currentAge,
  };

  try {
    // 병렬 호출 (Edge 런타임 — gpt-5.4-mini TPM 여유)
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
