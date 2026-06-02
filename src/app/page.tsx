import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { ReviewSection } from "@/components/landing/ReviewSection";
import { TrustPoints } from "@/components/landing/TrustPoints";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { ProductLineup } from "@/components/landing/ProductLineup";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <ReviewSection />
      <TrustPoints />
      <ComparisonTable />
      <ProductLineup />
      <FAQ />
      <CTA />
    </>
  );
}
