"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CATEGORY_OPTIONS = [
  { id: "new-year", title: "2026 병오년 신년 총운" },
  { id: "reunion", title: "헤어진 그 사람과의 재회 사주" },
  { id: "career", title: "취업·이직·승진 커리어 타이밍" },
  { id: "investment", title: "내 팔자에 맞는 재테크 성향" },
  { id: "secret", title: "29금 은밀한 속궁합 & 밤의 성향" },
  { id: "pregnancy-timing", title: "아가야, 언제 올 거니? — 임신 시기 예측" },
  { id: "pregnancy-date", title: "하늘이 맺어준 그날 — 임신 택일" },
  { id: "baby-dna", title: "미리 보는 우리 아이 DNA" },
  { id: "baby-name", title: "태명 사주 학당" },
  { id: "tarot-reunion", title: "타로로 보는 재회 가능성" },
  { id: "ex-feelings", title: "그 사람도 내 생각 할까?" },
  { id: "reunion-timing", title: "타이밍을 놓치지 마라" },
  { id: "breakup-reason", title: "우리가 헤어진 진짜 이유" },
  { id: "charm", title: "나의 타고난 매력 포인트" },
] as const;

const TIER_OPTIONS = [
  { value: "danpum", label: "단품" },
  { value: "basic", label: "베이직" },
  { value: "premium", label: "종합" },
] as const;

const TAROT_CARDS = [
  { name: "달 · The Moon", keyword: "직관 · 무의식 · 숨겨진 진실", advice: "지금 당신의 감정이 가리키는 방향을 믿어 보세요. 논리보다 직관이 먼저 알고 있는 것이 있습니다. 감추어졌던 것들이 서서히 빛 속으로 드러나는 시기입니다." },
  { name: "별 · The Star", keyword: "희망 · 회복 · 새로운 가능성", advice: "힘든 시간이 지나고 새벽이 밝아오는 때입니다. 당신이 마음속 깊이 품어온 소망을 포기하지 마세요. 우주는 언제나 당신의 편입니다." },
  { name: "세계 · The World", keyword: "완성 · 성취 · 새로운 시작", advice: "하나의 챕터가 완전히 마무리됩니다. 지나온 길을 돌아보며 당신이 얼마나 성장했는지 느껴보세요. 더 크고 새로운 시작이 바로 코앞에 있습니다." },
] as const;

const HOUR_MAP: Record<string, string> = {
  '자시': '0', '축시': '2', '인시': '4', '묘시': '6', '진시': '8', '사시': '10',
  '오시': '12', '미시': '14', '신시': '16', '유시': '18', '술시': '20', '해시': '22',
};

type Status =
  | { kind: "idle" }
  | { kind: "loading"; step: string }
  | { kind: "done"; sections: number }
  | { kind: "email-failed"; sections: number; reason: string }
  | { kind: "error"; message: string };

export function ResendForm() {
  const [catId, setCatId] = useState<string>(CATEGORY_OPTIONS[0].id);
  const [tier, setTier] = useState<(typeof TIER_OPTIONS)[number]["value"]>("basic");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [calendarType, setCalendarType] = useState<"양력" | "음력">("양력");
  const [birthDate, setBirthDate] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [birthTime, setBirthTime] = useState("");
  const [email, setEmail] = useState("");
  const [concerns, setConcerns] = useState("");
  const [partnerText, setPartnerText] = useState("");
  const [tarotIdx, setTarotIdx] = useState<number>(-1);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthDate || !name || !email) return;
    setStatus({ kind: "loading", step: "만세력 계산 중..." });

    try {
      const [y, m, d] = birthDate.split("-");
      const birthInfo = {
        birthYear: y,
        birthMonth: String(Number(m)),
        birthDay: String(Number(d)),
        birthHour: !timeUnknown && birthTime ? String(Number(birthTime.split(":")[0])) : undefined,
        calendarType,
        gender,
      };

      const manseryeokRes = await fetch("/api/generate-manseryeok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthInfo }),
      }).then((r) => r.json());

      if (manseryeokRes.status !== "success") {
        setStatus({ kind: "error", message: "만세력 계산에 실패했어요: " + (manseryeokRes.error ?? "알 수 없는 오류") });
        return;
      }

      setStatus({ kind: "loading", step: "결과지 생성 및 이메일 발송 중... (최대 1분 소요)" });

      const category = CATEGORY_OPTIONS.find((c) => c.id === catId)!;
      const tierLabel = TIER_OPTIONS.find((t) => t.value === tier)!.label;
      const tarotCard = tarotIdx >= 0 ? TAROT_CARDS[tarotIdx] : null;

      const interpretRes = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: `${tier}-${catId}`,
          catId,
          name,
          birthDate,
          birthTime: !timeUnknown && birthTime ? birthTime : null,
          timeUnknown,
          gender,
          manseryeokText: manseryeokRes.manseryeok,
          tarotCard,
          partnerText: partnerText || undefined,
          concerns: concerns || undefined,
          email,
          productTitle: category.title,
          tierLabel,
        }),
      }).then((r) => r.json());

      if (interpretRes.status !== "success") {
        setStatus({ kind: "error", message: "결과 생성에 실패했어요: " + (interpretRes.error ?? "알 수 없는 오류") });
        return;
      }

      const sectionsCount = interpretRes.sections?.length ?? 0;
      const emailResult = interpretRes.emailResult as
        | { status: "sent" }
        | { status: "skipped"; reason: string }
        | { status: "error"; error: string }
        | null;

      if (!emailResult || emailResult.status === "error") {
        setStatus({
          kind: "email-failed",
          sections: sectionsCount,
          reason: emailResult?.status === "error" ? emailResult.error : "알 수 없는 오류로 발송되지 않았어요",
        });
        return;
      }
      if (emailResult.status === "skipped") {
        setStatus({ kind: "email-failed", sections: sectionsCount, reason: `발송 건너뜀 (${emailResult.reason})` });
        return;
      }

      setStatus({ kind: "done", sections: sectionsCount });
    } catch (err) {
      setStatus({ kind: "error", message: String(err) });
    }
  }

  const loading = status.kind === "loading";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>상품</Label>
          <select
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            className="flex h-10 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>등급</Label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as typeof tier)}
            className="flex h-10 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>이름</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>성별</Label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
            className="flex h-10 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
          >
            <option value="female">여성</option>
            <option value="male">남성</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>생년월일</Label>
          <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>양/음력</Label>
          <select
            value={calendarType}
            onChange={(e) => setCalendarType(e.target.value as "양력" | "음력")}
            className="flex h-10 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
          >
            <option value="양력">양력</option>
            <option value="음력">음력</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>태어난 시간</Label>
          <Input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} disabled={timeUnknown} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-body">
        <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
        태어난 시간 모름
      </label>

      <div className="space-y-2">
        <Label>받는 사람 이메일</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label>궁금한 점 (선택)</Label>
        <Textarea value={concerns} onChange={(e) => setConcerns(e.target.value)} rows={2} />
      </div>

      <div className="space-y-2">
        <Label>상대방 정보 (재회·궁합류 상품인 경우, 자유 형식으로 입력)</Label>
        <Textarea
          value={partnerText}
          onChange={(e) => setPartnerText(e.target.value)}
          rows={2}
          placeholder={"이름: 홍길동\n생년월일: 1990-01-01 (시 미상)\n성별: 남성"}
        />
      </div>

      {tier === "premium" ? (
        <div className="space-y-2">
          <Label>타로 카드 (종합 상품은 타로 챕터가 포함돼요 — 원본과 다른 카드가 나올 수 있어요)</Label>
          <select
            value={tarotIdx}
            onChange={(e) => setTarotIdx(Number(e.target.value))}
            className="flex h-10 w-full rounded-full border border-hairline bg-canvas px-4 text-sm text-ink"
          >
            <option value={-1}>선택 안 함</option>
            {TAROT_CARDS.map((c, i) => (
              <option key={c.name} value={i}>{c.name}</option>
            ))}
          </select>
        </div>
      ) : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "처리 중..." : "결과 재생성 후 이메일 재발송"}
      </Button>

      {status.kind === "loading" ? (
        <p className="text-xs text-mute text-center">{status.step}</p>
      ) : null}
      {status.kind === "done" ? (
        <p className="text-xs text-emerald-500 text-center">
          완료! {email} 로 결과지 이메일을 다시 보냈어요. ({status.sections}개 섹션 생성됨)
        </p>
      ) : null}
      {status.kind === "email-failed" ? (
        <p className="text-xs text-red-500 text-center whitespace-pre-wrap">
          결과지는 생성됐지만({status.sections}개 섹션) 이메일 발송에 실패했어요: {status.reason}
          {"\n"}이메일 주소를 다시 확인하고 재시도해주세요.
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p className="text-xs text-red-500 text-center whitespace-pre-wrap">{status.message}</p>
      ) : null}
    </form>
  );
}
