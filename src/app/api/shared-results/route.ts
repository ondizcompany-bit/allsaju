// =====================================================
// POST /api/shared-results
// =====================================================
// 생성된 결과지를 영구 저장해 이메일/공유 링크(/report/[id])로
// 언제든 다시 열어볼 수 있게 한다.
//
// Body: { categoryId, categoryTitle, tier, name, sections, tarotCard }
// Response: { status: "success", id } | { status: "error" }

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

const bodySchema = z.object({
  categoryId: z.string(),
  categoryTitle: z.string(),
  tier: z.string(),
  name: z.string(),
  sections: z.array(z.string()).min(1),
  tarotCard: z.object({ name: z.string(), keyword: z.string(), advice: z.string() }).nullable().default(null),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error" as const, error: "잘못된 요청입니다" },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ status: "skipped" as const, reason: "Supabase 미설정" });
  }

  const { categoryId, categoryTitle, tier, name, sections, tarotCard } = parsed.data;
  const service = createServiceClient();

  const { data, error } = await service
    .from("shared_results")
    .insert({
      category_id: categoryId,
      category_title: categoryTitle,
      tier,
      name,
      sections,
      tarot_card: tarotCard,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ status: "error" as const, error: error?.message ?? "저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ status: "success" as const, id: data.id });
}
