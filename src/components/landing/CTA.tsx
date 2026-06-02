import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="container py-16 pb-24">
      <div className="relative overflow-hidden rounded-2xl border border-purple-rich/30 px-8 py-14 text-center">
        {/* 배경 그라데이션 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(76,29,149,0.55) 0%, rgba(109,40,217,0.35) 40%, rgba(30,10,80,0.7) 100%)",
          }}
        />
        {/* 배경 글로우 오브 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-purple-rich/20 blur-[80px]"
        />

        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            지금 바로 시작해 보세요
          </h2>
          <p className="mt-3 text-sm text-purple-light/80">
            로그인 없이 게스트로도 결제할 수 있어요
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-purple-rich hover:bg-white/90 shadow-purple-glow-lg font-semibold"
              )}
            >
              상품 보러 가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
