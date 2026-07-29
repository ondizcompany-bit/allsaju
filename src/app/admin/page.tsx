import Link from "next/link";
import { requireAdminPassword } from "@/lib/admin-auth";

export const metadata = { title: "관리자" };

export default async function AdminHome() {
  await requireAdminPassword("/admin");

  return (
    <div className="container py-12 max-w-xl">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-mute mb-2">ADMIN</p>
          <h1 className="text-2xl font-semibold tracking-tight">관리자</h1>
        </div>
        <form action="/admin/logout" method="post">
          <button type="submit" className="text-xs text-body hover:text-ink underline underline-offset-2">
            로그아웃
          </button>
        </form>
      </header>

      <ul className="divide-y divide-hairline border-y border-hairline">
        <li>
          <Link
            href="/admin/orders"
            className="flex items-center justify-between py-4 text-[15px] font-medium text-ink hover:text-body"
          >
            <span>결제 내역</span>
            <span className="text-mute">→</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/resend"
            className="flex items-center justify-between py-4 text-[15px] font-medium text-ink hover:text-body"
          >
            <span>결과지 재발송</span>
            <span className="text-mute">→</span>
          </Link>
        </li>
      </ul>

      <p className="mt-8 text-xs text-body leading-relaxed">
        환불 / 결제 취소는{" "}
        <a
          href="https://app.tosspayments.com"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 text-ink"
        >
          토스페이먼츠 대시보드
        </a>
        에서 진행하세요.
      </p>
    </div>
  );
}
