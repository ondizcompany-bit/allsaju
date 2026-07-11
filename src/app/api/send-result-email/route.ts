// =====================================================
// POST /api/send-result-email
// =====================================================
// 결과지 생성이 끝난 뒤 사용자에게 결과 내용을 이메일로 발송합니다.
// RESEND_API_KEY 미설정 시 조용히 스킵합니다 (기능 전체를 막지 않음).
//
// Body: { email, productTitle, tierLabel, sections: string[] }
// Response: { status: "sent" | "skipped" | "error" }

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

const bodySchema = z.object({
  email: z.string().email(),
  productTitle: z.string(),
  tierLabel: z.string(),
  sections: z.array(z.string()).min(1),
});

// 결과지 마크다운(##, ###, **, - )을 이메일용 HTML로 변환
function sectionsToHtml(sections: string[]): string {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const chapters: string[] = [];
  sections.forEach((section) => {
    section.split("\n").forEach((rawLine) => {
      const line = rawLine.trim();
      if (line.startsWith("## ")) {
        const title = escapeHtml(line.replace(/^##\s*/, ""));
        if (title.includes("심층 분석")) return; // 배너 라인 스킵
        chapters.push(`<h2 style="font-size:18px;color:#4c1d95;margin:28px 0 10px;">${title}</h2>`);
      } else if (line.startsWith("### ")) {
        chapters.push(`<h3 style="font-size:14px;color:#7c3aed;margin:16px 0 6px;">${escapeHtml(line.replace(/^###\s*/, ""))}</h3>`);
      } else if (line === "") {
        chapters.push(`<div style="height:8px;"></div>`);
      } else {
        const withBold = escapeHtml(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        const prefix = line.startsWith("- ") ? "border-left:2px solid #ddd6fe;padding-left:10px;" : "";
        chapters.push(`<p style="font-size:14px;line-height:1.8;color:#333;margin:0 0 6px;${prefix}">${withBold.replace(/^- /, "")}</p>`);
      }
    });
  });
  return chapters.join("\n");
}

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

  const { email, productTitle, tierLabel, sections } = parsed.data;
  const resend = new Resend(env.RESEND_API_KEY);

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
      <div style="text-align:center;padding:24px 0;">
        <p style="font-size:12px;letter-spacing:0.2em;color:#a78bfa;text-transform:uppercase;margin:0 0 6px;">명리공방</p>
        <h1 style="font-size:20px;color:#1a1a1a;margin:0;">${productTitle} · ${tierLabel} 결과지</h1>
      </div>
      <div style="padding:0 20px 32px;">
        ${sectionsToHtml(sections)}
      </div>
      <p style="text-align:center;font-size:12px;color:#999;padding:16px 0;border-top:1px solid #eee;">
        © 명리공방 · 본 메일은 발신 전용입니다
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: `[명리공방] ${productTitle} 결과지가 도착했어요`,
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
