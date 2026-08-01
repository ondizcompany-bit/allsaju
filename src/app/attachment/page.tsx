'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QUIZ_QUESTIONS, SCALE_LABELS } from '@/lib/attachment/quiz';
import { ChapterResult } from '@/components/saju/ChapterResult';

type Screen = 'intro' | 'quiz' | 'info' | 'package' | 'loading' | 'result' | 'error';
type Tier = 'single' | 'basic' | 'premium';
type Gender = 'male' | 'female';

const PACKAGES: Record<Tier, { price: number; original: number; label: string; desc: string; popular?: boolean }> = {
  single:  { price: 27900, original: 49800, label: '단품', desc: '나의 애착 유형 분석' },
  basic:   { price: 39900, original: 79800, label: '베이직', desc: '유형 분석 + 관계 개선 조언', popular: true },
  premium: { price: 49900, original: 99800, label: '종합', desc: '유형 분석 + 조언 + 유형별 궁합' },
};

const fmt = (n: number) => n.toLocaleString('ko-KR') + '원';
const disc = (orig: number, sale: number) => Math.round((1 - sale / orig) * 100);

const TAB_META = [
  { key: 0, label: '유형 분석', minTier: 'single' as Tier },
  { key: 1, label: '관계 개선 조언', minTier: 'basic' as Tier },
  { key: 2, label: '유형별 궁합', minTier: 'premium' as Tier },
];
const TIER_ORDER: Record<Tier, number> = { single: 0, basic: 1, premium: 2 };

export default function AttachmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center"><p className="text-mute text-sm">로딩 중...</p></div>}>
      <AttachmentInner />
    </Suspense>
  );
}

function AttachmentInner() {
  const search = useSearchParams();
  const [screen, setScreen] = useState<Screen>('intro');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [email, setEmail] = useState('');
  const [concerns, setConcerns] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [tier, setTier] = useState<Tier>('basic');
  const [activeTab, setActiveTab] = useState(0);

  // 결제 완료 후 돌아온 경우 — localStorage에서 답변을 읽어 바로 결과 생성
  useEffect(() => {
    if (search.get('paid') !== 'true') return;
    const t = (search.get('tier') as Tier) ?? 'basic';
    setTier(t);
    setScreen('loading');

    try {
      const savedAnswers = JSON.parse(localStorage.getItem('attachment_answers') ?? '{}');
      const savedName = localStorage.getItem('attachment_name') ?? '';
      const savedGender = (localStorage.getItem('attachment_gender') as Gender) ?? 'female';
      const savedEmail = localStorage.getItem('attachment_email') ?? '';
      const savedConcerns = localStorage.getItem('attachment_concerns') ?? '';

      if (!savedName || Object.keys(savedAnswers).length === 0) {
        setScreen('error');
        setErrorMsg('이전 검사 정보를 찾을 수 없어요. 처음부터 다시 시도해주세요.');
        return;
      }

      fetch('/api/attachment-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: t,
          name: savedName,
          gender: savedGender,
          answers: savedAnswers,
          concerns: savedConcerns || undefined,
          email: savedEmail || undefined,
        }),
      })
        .then(r => r.json())
        .then((data: { status: string; sections?: string[]; error?: string }) => {
          if (data.status === 'success' && data.sections) {
            setSections(data.sections);
            setScreen('result');
          } else {
            setScreen('error');
            setErrorMsg(data.error ?? '결과 생성에 실패했어요.');
          }
        })
        .catch(() => {
          setScreen('error');
          setErrorMsg('네트워크 오류가 발생했어요.');
        });
    } catch {
      setScreen('error');
      setErrorMsg('이전 검사 정보를 불러오지 못했어요.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUIZ_QUESTIONS.length;

  function goCheckout(selectedTier: Tier) {
    localStorage.setItem('attachment_answers', JSON.stringify(answers));
    localStorage.setItem('attachment_name', name);
    localStorage.setItem('attachment_gender', gender);
    localStorage.setItem('attachment_email', email);
    localStorage.setItem('attachment_concerns', concerns);
    localStorage.setItem('saju_result_email', email); // 체크아웃 위젯이 재사용하는 키

    const pkg = PACKAGES[selectedTier];
    const params = new URLSearchParams({
      cat: 'attachment',
      tier: selectedTier,
      amount: String(pkg.price),
      name: '애착유형검사',
      bi: '',
    });
    window.location.href = `/checkout?${params.toString()}`;
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-full border-4 border-purple-rich/30 border-t-purple-rich animate-spin" />
        <p className="text-sm text-body">결과를 분석하고 있어요...</p>
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-red-800/50 bg-red-900/20 p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h1 className="text-lg font-bold text-white mb-2">오류가 발생했어요</h1>
          <p className="text-sm text-body mb-6">{errorMsg}</p>
          <Link href="/attachment" className="inline-flex items-center justify-center w-full h-11 rounded-full border border-purple-rich/40 text-purple-light text-sm font-semibold hover:bg-purple-rich/10 transition-all">
            처음부터 다시하기
          </Link>
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    const availableTabs = TAB_META.filter(t => TIER_ORDER[t.minTier] <= TIER_ORDER[tier]);
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container max-w-lg py-12">
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">애착유형검사 결과</p>
          <h1 className="text-xl font-bold text-white mb-6 text-center">{name}님의 결과예요</h1>

          <div className="flex gap-2 mb-6">
            {availableTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="flex-1 py-2.5 rounded-full text-xs font-bold transition-colors"
                style={activeTab === t.key
                  ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {sections[activeTab] ? <ChapterResult sections={[sections[activeTab]]} /> : null}

          <p className="text-center text-xs text-mute mt-6">
            결과지는 이메일로도 발송됩니다 · 본 검사는 참고용이며 전문 심리 진단이 아닙니다
          </p>
          <Link href="/" className="mt-6 inline-flex items-center justify-center w-full h-12 rounded-full border border-purple-rich/40 text-purple-light font-semibold text-sm hover:bg-purple-rich/10 transition-all">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  if (screen === 'intro') {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-3">애착유형검사</p>
        <h1 className="text-2xl font-bold text-white mb-3">나의 연애 애착 유형,<br />제대로 알아본 적 있나요?</h1>
        <p className="text-sm text-body mb-10 max-w-xs">
          16개 문항으로 나의 애착 유형(안정형·불안형·회피형·혼란형)을 진단하고,
          연애에서 나타나는 패턴과 더 건강한 관계를 위한 조언까지 받아보세요.
        </p>
        <button
          onClick={() => setScreen('quiz')}
          className="w-full max-w-xs h-14 rounded-full text-white font-bold text-base"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)' }}
        >
          검사 시작하기 →
        </button>
        <p className="text-xs text-mute mt-4">약 3분 소요 · 참고용 검사이며 전문 심리 진단이 아니에요</p>
      </div>
    );
  }

  if (screen === 'quiz') {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container max-w-lg py-10">
          <p className="text-xs text-mute mb-2 text-center">{answeredCount} / {QUIZ_QUESTIONS.length}</p>
          <div className="w-full h-1.5 rounded-full bg-purple-deep/40 overflow-hidden mb-8">
            <div className="h-full rounded-full bg-purple-gradient transition-all" style={{ width: `${(answeredCount / QUIZ_QUESTIONS.length) * 100}%` }} />
          </div>

          <div className="flex flex-col gap-6">
            {QUIZ_QUESTIONS.map((q, qi) => (
              <div key={q.id} className="rounded-2xl border border-hairline bg-surface-soft/50 p-5">
                <p className="text-sm text-white mb-4">{qi + 1}. {q.text}</p>
                <div className="flex justify-between gap-1.5">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}
                      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] transition-colors"
                      style={answers[q.id] === v
                        ? { background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.6)', color: '#ddd6fe' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      <span className="text-sm font-bold">{v}</span>
                      <span className="leading-tight text-center">{SCALE_LABELS[v - 1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            disabled={!allAnswered}
            onClick={() => setScreen('info')}
            className="w-full h-14 rounded-full text-white font-bold text-base mt-8 disabled:opacity-30 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
          >
            {allAnswered ? '다음으로 →' : `모든 문항에 답해주세요 (${answeredCount}/${QUIZ_QUESTIONS.length})`}
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'info') {
    const canProceed = name.trim().length > 0 && /.+@.+\..+/.test(email);
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container max-w-md py-12">
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">정보 입력</p>
          <h1 className="text-xl font-bold text-white mb-8 text-center">결과지를 받을 정보를<br />입력해주세요</h1>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-body mb-1.5">이름</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60"
                placeholder="이름을 입력해주세요" />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">성별</label>
              <div className="flex gap-2">
                {(['female', 'male'] as Gender[]).map(g => (
                  <button key={g} onClick={() => setGender(g)}
                    className="flex-1 h-11 rounded-xl text-sm font-semibold transition-colors"
                    style={gender === g
                      ? { background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.6)', color: '#ddd6fe' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    {g === 'female' ? '여성' : '남성'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">결과지 받을 이메일 (간단하게만 발송됩니다)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60"
                placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">궁금한 점 (선택)</label>
              <textarea value={concerns} onChange={e => setConcerns(e.target.value)} rows={2}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder="예: 지금 만나는 사람과의 관계에서 제 애착 유형이 어떤 영향을 주는지 궁금해요." />
            </div>
          </div>

          <button
            disabled={!canProceed}
            onClick={() => setScreen('package')}
            className="w-full h-14 rounded-full text-white font-bold text-base mt-8 disabled:opacity-30 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
          >
            다음으로 →
          </button>
        </div>
      </div>
    );
  }

  // screen === 'package'
  const tiers: Tier[] = ['single', 'basic', 'premium'];
  return (
    <div className="min-h-screen bg-canvas">
      <div className="container max-w-xl py-12">
        <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2">패키지 선택</p>
        <h1 className="text-2xl font-bold text-white mb-8">어느 깊이까지<br />알아보시겠어요?</h1>

        <div className="flex flex-col gap-4">
          {tiers.map(t => {
            const pkg = PACKAGES[t];
            const dr = disc(pkg.original, pkg.price);
            return (
              <button
                key={t}
                onClick={() => goCheckout(t)}
                className="text-left rounded-2xl p-5 transition-transform hover:scale-[1.01]"
                style={pkg.popular
                  ? { background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(76,29,149,0.3))', border: '1.5px solid rgba(124,58,237,0.6)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-white">{pkg.label}</p>
                    {pkg.popular ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.3)', color: '#ddd6fe' }}>인기</span> : null}
                  </div>
                  <p className="text-xs" style={{ color: '#f87171' }}>{dr}% 할인</p>
                </div>
                <p className="text-xs text-mute mb-3">{pkg.desc}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-mute line-through">{fmt(pkg.original)}</p>
                  <p className="text-lg font-black text-white">{fmt(pkg.price)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
