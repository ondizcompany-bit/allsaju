import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import { Noto_Serif_KR } from "next/font/google";
import { siteConfig, businessInfo } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import Logo from "@/components/ui/Logo";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  weight: ["900"],
  subsets: ["latin"],
  variable: "--font-myeongjo",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    locale: "ko_KR",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 로그인 여부에 따라 헤더 메뉴 분기. Supabase 미설정(데모) 모드면 무조건 비로그인 취급.
  const isLoggedIn = isSupabaseConfigured() ? !!(await getCurrentUser()) : false;

  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <body suppressHydrationWarning>
        <SiteHeader isLoggedIn={isLoggedIn} />
        <main className="min-h-[calc(100vh-7rem)]">{children}</main>
        <SiteFooter />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo size={26} />
          <span
            className="text-gradient tracking-tight"
            style={{ fontFamily: 'var(--font-myeongjo)', fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em' }}
          >{siteConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-6 text-[13px] font-medium">
          <Link href="/products" className="text-ink/70 hover:text-purple-light transition-colors">상품</Link>
          {isLoggedIn ? (
            <>
              <Link href="/mypage" className="text-ink/70 hover:text-purple-light transition-colors">마이페이지</Link>
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="text-ink/70 hover:text-purple-light transition-colors">로그아웃</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="text-ink/70 hover:text-purple-light transition-colors">로그인</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  // 사업자정보 한 줄 — 운세위키 푸터 포맷: "회사 | 사업자등록번호: ... | 통신판매업 신고번호: ... | 대표: ... | 주소: ..."
  const businessLine = [
    businessInfo.companyName,
    `사업자등록번호: ${businessInfo.businessNumber}`,
    `통신판매업 신고번호: ${businessInfo.mailOrderNumber}`,
    `대표: ${businessInfo.representative}`,
    `주소: ${businessInfo.address}`,
  ].join(" | ");

  const contactLine = [
    `고객센터: ${businessInfo.email}`,
    businessInfo.phone
      ? `핸드폰${businessInfo.phoneNote ? `(${businessInfo.phoneNote})` : ""}: ${businessInfo.phone}`
      : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <footer className="border-t border-hairline mt-20 bg-surface-soft">
      <div className="container py-10 text-xs text-body space-y-4">
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          <Link href="/legal/terms" className="hover:text-purple-light transition-colors">이용약관</Link>
          <Link href="/legal/privacy" className="hover:text-purple-light transition-colors">개인정보처리방침</Link>
          <Link href="/legal/refund-policy" className="hover:text-purple-light transition-colors">환불정책</Link>
        </div>
        <p className="text-mute leading-relaxed">{businessLine}</p>
        <p className="text-mute leading-relaxed">{contactLine}</p>
        <p className="text-mute">© {new Date().getFullYear()} {siteConfig.name}</p>
      </div>
    </footer>
  );
}
