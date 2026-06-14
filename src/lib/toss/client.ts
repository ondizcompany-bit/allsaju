import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { publicEnv } from "@/lib/env";

export async function loadWidgets(customerKey: string): Promise<TossPaymentsWidgets> {
  const key = publicEnv.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
  const tossPayments = await loadTossPayments(key);
  return tossPayments.widgets({ customerKey });
}
