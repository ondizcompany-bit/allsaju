// =====================================================
// POST /api/send-result-email
// =====================================================
// 결과지 이메일 발송 (단독 호출용, 예: 재발송). 실제 결과 생성 흐름에서는
// /api/interpret 이 생성 직후 서버에서 곧바로 sendResultEmail을 호출한다.
// RESEND_API_KEY 미설정 시 조용히 스킵합니다 (기능 전체를 막지 않음).
//
// Body: { email, productTitle, tierLabel, sections: string[] }
// Response: { status: "sent" | "skipped" | "error" }

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { sendResultEmail } from "@/lib/email/send-result-email";

const bodySchema = z.object({
  email: z.string().email(),
  productTitle: z.string(),
  tierLabel: z.string(),
  sections: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error" as const, error: "잘못된 요청입니다", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await sendResultEmail(parsed.data);
  const httpStatus = result.status === "error" ? 502 : 200;
  return NextResponse.json(result, { status: httpStatus });
}
