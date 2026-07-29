import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

export type SendResultEmailInput = {
  email: string;
  productTitle: string;
  tierLabel: string;
  sections: string[];
};

export type SendResultEmailResult =
  | { status: "sent" }
  | { status: "skipped"; reason: string }
  | { status: "error"; error: string };

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

// 서버에서 직접 호출하는 결과지 이메일 발송 함수.
// /api/interpret 안에서 생성 직후 곧바로 호출해, 클라이언트(브라우저)가 탭을 닫아도
// 발송이 이미 서버에서 끝난 상태가 되도록 한다.
export async function sendResultEmail(input: SendResultEmailInput): Promise<SendResultEmailResult> {
  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    return { status: "skipped", reason: "RESEND_API_KEY 미설정" };
  }

  const { email, productTitle, tierLabel, sections } = input;
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
    if (error) return { status: "error", error: error.message };
    return { status: "sent" };
  } catch (e) {
    return { status: "error", error: String(e) };
  }
}

// 발송 실패(일시적 오류 포함)가 조용히 묻히지 않도록, 실패 시 짧은 대기 후 최대 2회 더 재시도한다.
export async function sendResultEmailWithRetry(
  input: SendResultEmailInput,
  retries = 2,
): Promise<SendResultEmailResult> {
  const result = await sendResultEmail(input);
  if (result.status !== "error" || retries <= 0) return result;
  await new Promise((r) => setTimeout(r, 800));
  return sendResultEmailWithRetry(input, retries - 1);
}
