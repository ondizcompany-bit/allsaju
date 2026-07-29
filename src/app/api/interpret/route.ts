// =====================================================
// POST /api/interpret
// =====================================================
// 만세력 텍스트 + 상품 정보를 받아 LLM 해석 결과를 반환합니다.
// 단품 신년운세: 3번의 LLM 호출로 ~3만자 결과 생성
//
// Body: { productSlug, name, birthDate, birthTime, timeUnknown, gender, manseryeokText,
//         email?, productTitle?, tierLabel? }
// Response: { status: "success", sections: string[] }
//
// - 병렬 LLM 호출 중 일부가 실패해도(타임아웃 등) 전체를 날리지 않고,
//   실패한 섹션만 재시도 후 안내 문구로 대체해 나머지는 그대로 보여준다.
// - email이 함께 오면, 클라이언트가 탭을 닫아도 발송이 끝나 있도록
//   여기서 서버가 직접 이메일을 보내고 응답한다.

import { NextResponse, type NextRequest } from "next/server";

export const runtime = 'edge';
export const maxDuration = 60;
import { z } from "zod";
import { generateInterpretationWithRetry } from "@/lib/saju/llm";
import { sendResultEmailWithRetry, type SendResultEmailResult } from "@/lib/email/send-result-email";
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
  concerns: z.string().optional(),
  email: z.string().email().optional(),
  productTitle: z.string().optional(),
  tierLabel: z.string().optional(),
});

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// LLM이 소제목 placeholder("[OO님만의 감성적 한 줄 소제목]" 등)를 채우지 못하고
// 대괄호를 그대로 남기는 경우가 있어, 눈에 띄는 잔여 대괄호 구문을 제거한다.
function stripUnfilledPlaceholders(text: string): string {
  return text.replace(/\s*\[[^\[\]]{0,40}(소제목|placeholder)[^\[\]]{0,10}\]/g, "");
}

// 실패한 섹션은 전체를 날리는 대신, 안내 문구로 대체해 나머지 섹션은 그대로 보여준다.
async function generateSectionSafely(req: { system: string; user: string }, fallbackTitle: string): Promise<string> {
  try {
    const result = await generateInterpretationWithRetry(req, 1);
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
    concerns: d.concerns,
  };

  let sections: string[];

  try {
    if (isBasic) {
      sections = await Promise.all([
        generateSectionSafely(buildBasicSection1(promptInput), "사주 분석 (1부)"),
        generateSectionSafely(buildBasicSection2(promptInput), "사주 분석 (2부)"),
        generateSectionSafely(buildBasicSection3(promptInput), "사주 분석 (3부)"),
        generateSectionSafely(buildBasicJami(promptInput), "자미두수 심층 분석"),
      ]);
    } else if (isPremium) {
      sections = await Promise.all([
        generateSectionSafely(buildPremiumSection1(promptInput), "사주 분석 (1부)"),
        generateSectionSafely(buildPremiumSection2(promptInput), "사주 분석 (2부)"),
        generateSectionSafely(buildPremiumSection3(promptInput), "사주 분석 (3부)"),
        generateSectionSafely(buildPremiumJami(promptInput), "자미두수 심층 분석"),
        generateSectionSafely(buildPremiumTarot(promptInput), "타로 심층 분석"),
      ]);
    } else {
      sections = await Promise.all([
        generateSectionSafely(buildDanpumSection1(promptInput), "사주 분석 (1부)"),
        generateSectionSafely(buildDanpumSection2(promptInput), "사주 분석 (2부)"),
        generateSectionSafely(buildDanpumSection3(promptInput), "사주 분석 (3부)"),
      ]);
    }
  } catch (err) {
    return NextResponse.json(
      { status: "error" as const, error: err instanceof Error ? err.message : "해석 생성 실패" },
      { status: 502 },
    );
  }

  // 이메일은 클라이언트가 페이지를 닫아도 발송이 완료되도록 서버에서 직접 처리한다.
  // 실패해도 결과지 응답 자체는 막지 않되, 실제 발송 결과는 응답에 그대로 실어
  // 호출자(관리자 재발송 도구 등)가 성공 여부를 확인할 수 있게 한다.
  let emailResult: SendResultEmailResult | null = null;
  if (d.email) {
    emailResult = await sendResultEmailWithRetry({
      email: d.email,
      productTitle: d.productTitle ?? d.catId ?? "사주",
      tierLabel: d.tierLabel ?? (isPremium ? "종합" : isBasic ? "베이직" : "단품"),
      sections,
    }).catch((e): SendResultEmailResult => ({ status: "error", error: String(e) }));
  }

  return NextResponse.json({ status: "success" as const, sections, emailResult });
}
