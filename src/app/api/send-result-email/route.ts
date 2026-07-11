// =====================================================
// POST /api/send-result-email
// =====================================================
// 결과지 저장이 끝난 뒤, "결과지 보러가기" 버튼이 담긴 알림 이메일을 발송합니다.
// RESEND_API_KEY 미설정 시 조용히 스킵합니다 (기능 전체를 막지 않음).
//
// Body: { email, name, productTitle, tierLabel, reportUrl }
// Response: { status: "sent" | "skipped" | "error" }

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string(),
  productTitle: z.string(),
  tierLabel: z.string(),
  reportUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error" as const, error: "잘못된 요청입니다", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    return NextResponse.json({ status: "skipped" as const, reason: "RESEND_API_KEY 미설정" });
  }

  const { email, name, productTitle, tierLabel, reportUrl } = parsed.data;
  const resend = new Resend(env.RESEND_API_KEY);

  const html = `
    <div style="max-width:480px;margin:0 auto;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;padding:32px 20px;">
      <p style="text-align:center;font-size:12px;letter-spacing:0.2em;color:#a78bfa;text-transform:uppercase;margin:0 0 24px;">명리공방</p>
      <div style="background:#0f0a1e;border-radius:20px;padding:36px 28px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(139,92,246,0.15);border:2px solid rgba(139,92,246,0.4);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <span style="font-size:24px;color:#a78bfa;">命</span>
        </div>
        <h1 style="font-size:19px;color:#fff;margin:0 0 8px;line-height:1.4;">${name}님의 ${escapeHtml(productTitle)}<br/>결과지가 완성됐어요</h1>
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 28px;line-height:1.7;">${escapeHtml(tierLabel)} 분석을 한 자 한 자 짚어 정리했어요.<br/>아래 버튼에서 지금 확인해보세요.</p>
        <a href="${reportUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">
          결과지 보러가기 →
        </a>
        <p style="font-size:11px;color:rgba(255,255,255,0.3);margin:28px 0 0;">버튼이 안 보이면 아래 주소를 복사해 열어주세요.<br/><a href="${reportUrl}" style="color:#a78bfa;word-break:break-all;">${reportUrl}</a></p>
      </div>
      <p style="text-align:center;font-size:11px;color:#999;margin:20px 0 0;">결제하신 결과지 완성 알림이에요. 결과지는 언제든 다시 열어볼 수 있어요.<br/>© 명리공방</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: `[명리공방] ${name}님의 ${productTitle} 결과지가 도착했어요`,
      html,
    });
    if (error) {
      return NextResponse.json({ status: "error" as const, error: error.message }, { status: 502 });
    }
    return NextResponse.json({ status: "sent" as const });
  } catch (e) {
    return NextResponse.json({ status: "error" as const, error: String(e) }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
