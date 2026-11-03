import Link from "next/link";
import { requireAdminPassword } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { formatKRW, formatDate } from "@/lib/utils";
import { loadPaymentRows, formatPerson, TIER_LABEL, type PaymentRow } from "@/lib/admin/payments";

export const metadata = { title: "관리자 - 결제 고객" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

const FILTERS = [
  { key: "", label: "전체" },
  { key: "paid", label: "결제완료" },
  { key: "canceled", label: "취소" },
];

const th = "px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-mute whitespace-nowrap";

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPassword("/admin/payments");

  const { status } = await searchParams;
  const demoMode = !isSupabaseConfigured();

  let rows: PaymentRow[] = [];
  let error: string | null = null;
  if (!demoMode) {
    const res = await loadPaymentRows();
    error = res.error;
    rows = status ? res.rows.filter((r) => r.status === status) : res.rows;
  }

  const paidTotal = rows.filter((r) => r.status === "paid").reduce((sum, r) => sum + (r.amount ?? 0), 0);

  return (
    <div className="container py-12">
      <header className="mb-8">
        <p className="text-xs font-mono text-mute mb-2">
          <Link href="/admin" className="hover:text-ink">ADMIN</Link> / PAYMENTS
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">결제 고객</h1>
        <p className="mt-2 text-xs text-body leading-relaxed">
          고객 정보(이름·이메일·생년월일·고민)는 이 기능이 배포된 이후 결제 건부터 기록됩니다.
          이전 결제 건은 토스페이먼츠 대시보드에서 확인하세요.
        </p>
      </header>

      {demoMode ? (
        <div className="mb-6 rounded-lg border border-hairline p-4 text-xs text-body">
          데모 모드 — <code className="font-mono text-ink">NEXT_PUBLIC_SUPABASE_URL</code> 이 설정되지 않았습니다.
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-lg border border-red-800/50 bg-red-900/20 p-4 text-xs text-red-200 leading-relaxed">
          <p className="font-semibold mb-1">결제 기록을 불러오지 못했어요</p>
          {error}
        </div>
      ) : null}

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => {
          const active = (status ?? "") === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={f.key ? `/admin/payments?status=${f.key}` : "/admin/payments"}
              className={`px-4 h-8 inline-flex items-center rounded-full text-sm border transition-colors ${active ? "bg-ink text-canvas border-ink" : "border-hairline text-ink hover:border-ink"}`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-mute font-mono">
          {rows.length} ROWS · 결제완료 합계 {formatKRW(paidTotal)}
        </p>
        {!demoMode && !error ? (
          <a
            href={status ? `/admin/payments/export?status=${status}` : "/admin/payments/export"}
            className="px-4 h-8 inline-flex items-center rounded-full text-sm border border-ink bg-ink text-canvas hover:opacity-90"
          >
            CSV 다운로드
          </a>
        ) : null}
      </div>

      <div className="border border-hairline rounded-lg overflow-x-auto">
        {rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-mute">아직 기록된 결제가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline">
                <th className={th}>결제일시</th>
                <th className={th}>상품</th>
                <th className={th}>이름</th>
                <th className={th}>이메일</th>
                <th className={th}>생년월일</th>
                <th className={th}>고민/질문</th>
                <th className={`${th} text-right`}>금액</th>
                <th className={th}>상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const c = r.customer;
                return (
                  <tr key={r.orderId} className="border-b border-hairline last:border-0 align-top">
                    <td className="px-4 py-3 text-xs text-body whitespace-nowrap">
                      {formatDate(r.paidAt ?? r.createdAt)}
                      <div className="font-mono text-[10px] text-mute mt-1">{r.orderId}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.productName ?? r.category ?? "-"}
                      {r.tier ? <span className="text-mute"> · {TIER_LABEL[r.tier] ?? r.tier}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{c?.name ?? <span className="text-mute">-</span>}</td>
                    <td className="px-4 py-3 text-xs">{c?.email ?? <span className="text-mute">-</span>}</td>
                    <td className="px-4 py-3 text-xs">
                      {formatPerson(c?.me) || <span className="text-mute">-</span>}
                      {c?.partner ? <div className="text-mute mt-1">상대: {formatPerson(c.partner)}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[280px] break-words">
                      {[c?.concerns, c?.question].filter(Boolean).join(" / ") || <span className="text-mute">-</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                      {r.amount != null ? formatKRW(r.amount) : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={r.status === "paid" ? "success" : r.status === "canceled" ? "destructive" : "secondary"}>
                        {r.statusLabel}
                      </Badge>
                      {r.missingClientConfirm ? (
                        <div className="text-[10px] text-amber-300 mt-1">결과 미도달 의심</div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
