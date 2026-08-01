// =====================================================
// POST /api/attachment-interpret
// =====================================================
// 애착유형검사 결과 해석. 단품 1콜(핵심 3섹션) / 베이직 2콜(+조언) /
// 종합 3콜(+궁합). /api/interpret 과 동일한 안전장치를 재사용한다.

import { NextResponse, type NextRequest } from "next/server";
export const runtime = 'edge';
export const maxDuration = 60;
import { z } from "zod";
import { generateInterpretationWithRetry } from "@/lib/saju/llm";
import { sendResultEmailWithRetry, type SendResultEmailResult } from "@/lib/email/send-result-email";
import { buildAttachmentCore, buildAttachmentAdvice, buildAttachmentCompat } from "@/lib/attachment/prompt";

const bodySchema = z.object({
  tier: z.enum(["single", "basic", "premium"]),
  name: z.string().min(1),
  gender: z.enum(["male", "female"]),
  answers: z.record(z.string(), z.number().min(1).max(5)),
  concerns: z.string().optional(),
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

  const { scoreAttachment } = await import("@/lib/attachment/quiz");
  const { anxietyScore, avoidanceScore, type } = scoreAttachment(d.answers);

  const promptInput = {
    name: d.name,
    gender: d.gender,
    anxietyScore,
    avoidanceScore,
    type,
    concerns: d.concerns,
  };

  let sections: string[];
  try {
    if (d.tier === "single") {
      sections = await Promise.all([
        generateSectionSafely(buildAttachmentCore(promptInput), "애착 유형 분석"),
      ]);
    } else if (d.tier === "basic") {
      sections = await Promise.all([
        generateSectionSafely(buildAttachmentCore(promptInput), "애착 유형 분석"),
        generateSectionSafely(buildAttachmentAdvice(promptInput), "관계 개선 조언"),
      ]);
    } else {
      sections = await Promise.all([
        generateSectionSafely(buildAttachmentCore(promptInput), "애착 유형 분석"),
        generateSectionSafely(buildAttachmentAdvice(promptInput), "관계 개선 조언"),
        generateSectionSafely(buildAttachmentCompat(promptInput), "애착유형 궁합"),
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
      productTitle: "애착유형검사",
      tierLabel: d.tier === "single" ? "단품" : d.tier === "basic" ? "베이직" : "종합",
      sections,
    }).catch((e): SendResultEmailResult => ({ status: "error", error: String(e) }));
  }

  return NextResponse.json({
    status: "success" as const,
    sections,
    anxietyScore,
    avoidanceScore,
    type,
    emailResult,
  });
}
