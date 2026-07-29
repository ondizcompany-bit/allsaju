import { requireAdminPassword } from "@/lib/admin-auth";
import { ResendForm } from "@/components/admin/ResendForm";

export const metadata = { title: "관리자 - 결과 재발송" };

export default async function AdminResendPage() {
  await requireAdminPassword("/admin/resend");

  return (
    <div className="container py-12 max-w-xl">
      <header className="mb-8">
        <p className="text-xs font-mono text-mute mb-2">ADMIN / RESEND</p>
        <h1 className="text-2xl font-semibold tracking-tight">결과지 재발송</h1>
        <p className="text-sm text-body mt-2 leading-relaxed">
          이메일이 안 왔다는 고객에게 사용할 도구예요. 고객에게 이름·생년월일·구매 상품/등급·이메일을 다시 확인한 뒤 아래에 입력하면,
          결과를 새로 생성해서 바로 이메일로 보내드려요. (원래 받았던 것과 문구는 다를 수 있지만 같은 사주 기반으로 동일한 내용이에요)
        </p>
      </header>
      <ResendForm />
    </div>
  );
}
