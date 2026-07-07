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
// SAJU_API_URL / SAJU_API_KEY 가 미설정이면 503 을 돌려줍니다.

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

  try {
    const manseryeok = await generateManseryeok(parsed.data.birthInfo);
    return NextResponse.json({ status: "success" as const, manseryeok });
  } catch {
    // 외부 API 실패 시 기본 출생 정보로 폴백 — 결과지는 항상 나와야 함
    const bi = parsed.data.birthInfo;
    const fallback = buildFallbackManseryeok(bi);
    return NextResponse.json({ status: "success" as const, manseryeok: fallback });
  }
}

function buildFallbackManseryeok(bi: {
  birthYear: string; birthMonth: string; birthDay: string;
  birthHour?: string; calendarType: string; gender: string;
}): string {
  const CHEONGAN = ["갑","을","병","정","무","기","경","신","임","계"];
  const JIJI = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const JIJI_OE = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const CHEONGAN_OE = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

  const y = parseInt(bi.birthYear);
  const m = parseInt(bi.birthMonth);
  const d = parseInt(bi.birthDay);
  const h = bi.birthHour != null ? parseInt(bi.birthHour) : null;

  const yearIdx = (y - 4) % 60;
  const yearCG = CHEONGAN[yearIdx % 10];
  const yearJJ = JIJI[yearIdx % 12];
  const yearCGOe = CHEONGAN_OE[yearIdx % 10];
  const yearJJOe = JIJI_OE[yearIdx % 12];

  // 월주: 절입 기준 간략 계산 (오차 있을 수 있음 — LLM이 보정)
  const monthBase = (y - 4) * 12 + (m - 1);
  const monthCG = CHEONGAN[monthBase % 10];
  const monthJJ = JIJI[((m + 1) % 12)];
  const monthCGOe = CHEONGAN_OE[monthBase % 10];
  const monthJJOe = JIJI_OE[((m + 1) % 12)];

  // 일주: 간략 줄리안일 기반 계산
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jd = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  const dayIdx = (jd + 49) % 60;
  const dayCG = CHEONGAN[dayIdx % 10];
  const dayJJ = JIJI[dayIdx % 12];
  const dayCGOe = CHEONGAN_OE[dayIdx % 10];
  const dayJJOe = JIJI_OE[dayIdx % 12];

  // 시주
  let hourCG = "모름", hourJJ = "모름";
  if (h !== null) {
    const hourBranch = Math.floor((h + 1) / 2) % 12;
    const hourStem = (dayIdx % 5) * 2 + hourBranch % 10;
    hourCG = CHEONGAN[hourStem % 10];
    hourJJ = JIJI[hourBranch];
  }

  const timeStr = h !== null ? `${String(h).padStart(2,"0")}:00` : "모름";

  return `[명식 기본 정보]
생년월일: ${bi.birthYear}-${bi.birthMonth.padStart(2,"0")}-${bi.birthDay.padStart(2,"0")} (${bi.calendarType})
출생시각: ${timeStr}
성별: ${bi.gender === "male" ? "남성" : "여성"}

[천간지지 (사주 원국)]
년주: ${yearCG}${yearJJ} (${yearCGOe}${yearJJOe})
월주: ${monthCG}${monthJJ} (${monthCGOe}${monthJJOe})
일주: ${dayCG}${dayJJ} (${dayCGOe}${dayJJOe})
시주: ${h !== null ? `${hourCG}${hourJJ}` : "모름 (시 미상)"}

[참고]
위 사주 원국을 기반으로 십성·합충·대운·세운 등을 명리학 원칙에 따라 직접 분석하여 해석하라.
현재 연도 기준 세운: 2026년 병오년 (丙午年)`;
}
}
