// =====================================================
// 결제 고객 정보 수집 (클라이언트 전용)
// =====================================================
// 결제 흐름은 비로그인 게스트 결제라서, 고객이 입력한 정보는 각 페이지가
// localStorage 에만 저장해 둔다. 결제 승인 직후(/checkout/success) 이 함수로
// 해당 카테고리에 맞는 값만 모아서 서버(/api/payments/confirm)로 보내
// payment_events 에 함께 기록한다 → 어드민 "결제 고객" 화면/CSV 에서 조회.

export type CustomerPerson = {
  name?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  calendarType?: string;
};

export type CustomerInfo = {
  name?: string;
  email?: string;
  gender?: string;
  me?: CustomerPerson;
  partner?: CustomerPerson;
  concerns?: string;
  question?: string;
  details?: string;
};

const MAX_TEXT = 1000;

function get(key: string): string | undefined {
  try {
    const v = localStorage.getItem(key);
    return v ? v.slice(0, MAX_TEXT) : undefined;
  } catch {
    return undefined;
  }
}

function parsePerson(raw: string | undefined | null): CustomerPerson | undefined {
  if (!raw) return undefined;
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    if (!p || typeof p !== "object") return undefined;
    const pick = (k: string) => (typeof p[k] === "string" ? (p[k] as string).slice(0, 100) : undefined);
    const person: CustomerPerson = {
      name: pick("name"),
      gender: pick("gender"),
      birthDate: pick("birthDate"),
      birthTime: pick("birthTime"),
      calendarType: pick("calendarType"),
    };
    return Object.values(person).some(Boolean) ? person : undefined;
  } catch {
    return undefined;
  }
}

// /start 흐름은 생년월일 정보를 URL(bi)로도 넘긴다 — 인앱브라우저 전환 등으로
// localStorage 가 비어 있을 때의 대비책.
function decodeBi(bi: string | null | undefined): string | undefined {
  if (!bi) return undefined;
  try {
    return decodeURIComponent(atob(bi)) || undefined;
  } catch {
    return undefined;
  }
}

function clean<T extends Record<string, unknown>>(obj: T): T | undefined {
  const out = Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""));
  return Object.keys(out).length ? (out as T) : undefined;
}

export function collectCustomerInfo(category: string | null, bi?: string | null): CustomerInfo | undefined {
  if (typeof window === "undefined") return undefined;

  if (category === "attachment") {
    return clean<CustomerInfo>({
      name: get("attachment_name"),
      gender: get("attachment_gender"),
      email: get("attachment_email") ?? get("saju_result_email"),
      concerns: get("attachment_concerns"),
    });
  }

  if (category === "love-counsel") {
    return clean<CustomerInfo>({
      name: get("love_counsel_name"),
      gender: get("love_counsel_gender"),
      email: get("love_counsel_email") ?? get("saju_result_email"),
      concerns: get("love_counsel_situation"),
      question: get("love_counsel_question"),
      details: [get("love_counsel_relationship_type"), get("love_counsel_details")].filter(Boolean).join(" / ") || undefined,
    });
  }

  // 사주 카테고리(/start) + 추가 질문(followup)
  const me = parsePerson(get("saju_birth_me") ?? decodeBi(bi));
  return clean<CustomerInfo>({
    name: me?.name,
    gender: me?.gender,
    email: get("saju_result_email"),
    me,
    partner: category === "followup" ? undefined : parsePerson(get("saju_birth_partner")),
    concerns: category === "followup" ? undefined : get("saju_concerns"),
    question: category === "followup" ? get("saju_followup_question") : undefined,
  });
}
