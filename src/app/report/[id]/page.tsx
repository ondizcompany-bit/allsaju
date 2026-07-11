import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { ChapterResult } from "@/components/saju/ChapterResult";

export const metadata = { title: "결과지" };

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) notFound();

  const service = createServiceClient();
  const { data: result } = await service
    .from("shared_results")
    .select("category_title, tier, name, sections, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!result) notFound();

  const tierLabel: Record<string, string> = { single: "단품", basic: "베이직", premium: "종합" };
  const sections = result.sections as unknown as string[];

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container max-w-2xl py-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2">
            {tierLabel[result.tier] ?? result.tier}
          </p>
          <h1 className="text-xl font-bold text-white mb-1">{result.category_title}</h1>
          <p className="text-xs text-mute">{result.name}님의 결과지</p>
        </div>

        <ChapterResult sections={sections} />

        <div className="text-center mt-8">
          <Link href="/" className="text-xs text-mute hover:text-purple-light transition-colors">
            명리공방 홈으로 →
          </Link>
        </div>
      </div>
    </div>
  );
}
