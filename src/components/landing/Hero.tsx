import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden hero-glow">
      {/* 배경 보라 글로우 오브 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -top-32 flex justify-center"
      >
        <div className="h-[500px] w-[700px] rounded-full bg-purple-rich/10 blur-[120px]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-purple-deep/20 blur-[90px]"
      />

      <div className="container relative py-28 md:py-40 text-center">
        {/* 뱃지 */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-rich/30 bg-purple-deep/20 px-4 py-1.5 text-xs font-medium text-purple-light backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-bright animate-pulse" />
          정통 명리학 기반 사주 풀이
        </div>

        {/* 헤드라인 */}
        <h1 className="text-[38px] md:text-[56px] lg:text-[64px] font-semibold tracking-tight leading-[1.08]">
          <span className="text-gradient">{siteConfig.tagline}</span>
        </h1>

        <p className="mt-6 text-[15px] md:text-[17px] leading-relaxed text-body max-w-lg mx-auto">
          {siteConfig.description}
        </p>

        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
            상품 보기
          </Link>
          <Link
            href="#how-it-works"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            작동 방식
          </Link>
        </div>
      </div>
    </section>
  );
}
