// =====================================================
// POST /api/generate-manseryeok
// =====================================================
// 사주 명식표 생성 라우트.
// Body: { birthInfo: BirthInfo }
// Response (success): { status: "success", manseryeok: string }
// Response (error):   { status: "error",   error: string, details?: any }
//
// 내부 동작:
//   fetchSajuAnalysis(birthInfo, []) → formatSajuToManseryeok(...) → 텍스트 반환
//   (fetchSajuAnalysis 자체도 5xx/네트워크 오류 시 최대 2회 재시도)
// SAJU_API_URL / SAJU_API_KEY 가 미설정이면 503 을 돌려줍니다.
// ⚠️ 실제 API 호출이 재시도 후에도 계속 실패하면, 근사치로 대충 채운
//   사주를 성공으로 위장해서 내보내지 않는다 — 502 에러를 그대로
//   반환해 클라이언트가 재시도 안내를 보여주도록 한다.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  generateManseryeok,
  isSajuApiConfigured,
  SajuApiError,
} from "@/lib/saju/saju-api";

const birthInfoSchema = z.object({
  birthYear: z.string().regex(/^\d{4}$/, "birthYear 는 YYYY 형식이어야 합니다"),
  birthMonth: z.string().regex(/^(0?[1-9]|1[0-2])$/, "birthMonth 는 1~12 사이"),
  birthDay: z.string().regex(/^(0?[1-9]|[12]\d|3[01])$/, "birthDay 는 1~31 사이"),
  birthHour: z.string().regex(/^(0?\d|1\d|2[0-3])$/, "birthHour 는 0~23 사이").optional(),
  birthMinute: z.string().regex(/^(0?\d|[1-5]\d)$/, "birthMinute 는 0~59 사이").optional(),
  calendarType: z.enum(["양력", "음력"]),
  gender: z.enum(["male", "female"]),
  isLeapMonth: z.boolean().optional(),
  useYajasiRule: z.boolean().optional(),
});

const bodySchema = z.object({
  birthInfo: birthInfoSchema,
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "error" as const,
        error: "잘못된 요청입니다",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  if (!isSajuApiConfigured()) {
    return NextResponse.json(
      {
        status: "error" as const,
        error: "사주 API 가 설정되지 않았습니다. .env.local 의 SAJU_API_URL / SAJU_API_KEY 를 확인하세요.",
      },
      { status: 503 },
    );
  }

  // 실제 API 호출 실패 시, 근사치로 대충 채워서 "성공"으로 속이지 않는다.
  // (근사 계산으로 만든 사주를 실제 결과인 것처럼 내보내면 일주가 틀리는 등
  // 고객이 그대로 돈을 내고 잘못된 사주를 받게 되는 사고로 이어진다 — 실제 신고 사례로 확인됨.)
  // 대신 한 번 더 재시도한 뒤에도 실패하면 명확한 오류를 반환해, 클라이언트가
  // "잠시 후 다시 시도해주세요" 안내와 함께 재시도하도록 한다.
  try {
    const manseryeok = await generateManseryeok(parsed.data.birthInfo);
    return NextResponse.json({ status: "success" as const, manseryeok });
  } catch {
    try {
      await new Promise((r) => setTimeout(r, 800));
      const manseryeok = await generateManseryeok(parsed.data.birthInfo);
      return NextResponse.json({ status: "success" as const, manseryeok });
    } catch (err) {
      const message = err instanceof SajuApiError ? err.message : "사주 API 호출에 실패했습니다.";
      return NextResponse.json(
        { status: "error" as const, error: `만세력 계산에 실패했어요: ${message}` },
        { status: 502 },
      );
    }
  }
}
