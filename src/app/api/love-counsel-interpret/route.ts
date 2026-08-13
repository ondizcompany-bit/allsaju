// =====================================================
// POST /api/love-counsel-interpret
// =====================================================
// 연애상담 결과 해석. 상담 리포트 1콜(4섹션) / 심층 상담 2콜(+4섹션).
// 사주가 아닌 "관계 전문가"의 통찰 기반 상담. /api/interpret 과
// 동일한 안전장치(재시도, 실패 시 그래도 나머지는 살리기)를 재사용.

import { NextResponse, type NextRequest } from "next/server";
export const runtime = 'edge';
export const maxDuration = 60;
import { z } from "zod";
import { generateInterpretationWithRetry } from "@/lib/saju/llm";
import { sendResultEmailWithRetry, type SendResultEmailResult } from "@/lib/email/send-result-email";
import { buildLoveCounselCore, buildLoveCounselDeep } from "@/lib/love-counsel/prompt";

const bodySchema = z.object({
  tier: z.enum(["basic", "premium"]),
  name: z.string().min(1),
  gender: z.enum(["male", "female"]),
  situation: z.string().min(1),
  question: z.string().min(1),
  relationshipType: z.enum(["couple", "married", "some", "other"]).optional(),
  email: z.string().email().optional(),
});

function stripUnfilledPlaceholders(text: string): string {
  return text.replace(/\s*\[[^\[\]]{0,40}(소제목|placeholder)[^\[\]]{0,10}\]/g, "");
}

async function generateSectionSafely(req: { system: string; user: string }, fallbackTitle: string): Promise<string> {
  try {
    const result = await generateInterpretationWithRetry(req, 2);
    return stripUnfilledPlaceholders(result.text);
  } catch {
    return `## ⚠️ ${fallbackTitle}\n\n일시적인 오류로 이 부분 생성에 실패했어요. 새로고침 후 다시 시도하시면 정상적으로 나올 수 있어요. 계속 안 나오면 고객센터로 문의해주세요.`;
  }
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
  const promptInput = { name: d.name, gender: d.gender, situation: d.situation, question: d.question, relationshipType: d.relationshipType };

  let sections: string[];
  try {
    if (d.tier === "basic") {
      sections = await Promise.all([
        generateSectionSafely(buildLoveCounselCore(promptInput), "상담 리포트"),
      ]);
    } else {
      sections = await Promise.all([
        generateSectionSafely(buildLoveCounselCore(promptInput), "상담 리포트"),
        generateSectionSafely(buildLoveCounselDeep(promptInput), "심층 상담"),
      ]);
    }
  } catch (err) {
    return NextResponse.json(
      { status: "error" as const, error: err instanceof Error ? err.message : "해석 생성 실패" },
      { status: 502 },
    );
  }

  let emailResult: SendResultEmailResult | null = null;
  if (d.email) {
    emailResult = await sendResultEmailWithRetry({
      email: d.email,
      productTitle: "연애상담",
      tierLabel: d.tier === "basic" ? "상담 리포트" : "심층 상담",
      sections,
    }).catch((e): SendResultEmailResult => ({ status: "error", error: String(e) }));
  }

  return NextResponse.json({ status: "success" as const, sections, emailResult });
}
