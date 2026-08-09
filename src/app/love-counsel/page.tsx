'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChapterResult } from '@/components/saju/ChapterResult';

type Screen = 'intro' | 'form' | 'package' | 'loading' | 'result' | 'error';
type Tier = 'basic' | 'premium';
type Gender = 'male' | 'female';

const PACKAGES: Record<Tier, { price: number; original: number; label: string; desc: string; popular?: boolean }> = {
  basic:   { price: 59900, original: 109800, label: '상담 리포트', desc: '핵심 진단 + 전문가 조언 (4개 섹션)' },
  premium: { price: 89900, original: 169800, label: '심층 상담', desc: '상담 리포트 전부 + 전략·장기 조언 (8개 섹션)', popular: true },
};

const fmt = (n: number) => n.toLocaleString('ko-KR') + '원';
const disc = (orig: number, sale: number) => Math.round((1 - sale / orig) * 100);

// sections[] 인덱스: 0=core(4섹션 묶음) 1=deep(4섹션 묶음, 심층만)
const TAB_META = [
  { key: 0, label: '상담 리포트', minTier: 'basic' as Tier },
  { key: 1, label: '심층 전략 & 조언', minTier: 'premium' as Tier },
];
const TIER_ORDER: Record<Tier, number> = { basic: 0, premium: 1 };

export default function LoveCounselPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center"><p className="text-mute text-sm">로딩 중...</p></div>}>
      <LoveCounselInner />
    </Suspense>
  );
}

function LoveCounselInner() {
  const search = useSearchParams();
  const [screen, setScreen] = useState<Screen>('intro');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [email, setEmail] = useState('');
  const [situation, setSituation] = useState('');
  const [question, setQuestion] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [tier, setTier] = useState<Tier>('basic');
  const [activeTab, setActiveTab] = useState(0);
  // 랜딩 페이지에서 특정 가격의 CTA를 눌러 들어온 경우, 패키지 선택 화면을
  // 건너뛰고 폼 작성 후 바로 그 가격으로 결제하러 간다.
  const [preselectedTier, setPreselectedTier] = useState<Tier | null>(null);

  useEffect(() => {
    const t = search.get('tier');
    if ((t === 'basic' || t === 'premium') && search.get('paid') !== 'true') {
      setPreselectedTier(t);
      setScreen('form');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 결제 완료 후 돌아온 경우 — localStorage에서 입력 내용을 읽어 바로 결과 생성
  useEffect(() => {
    if (search.get('paid') !== 'true') return;
    const t = (search.get('tier') as Tier) ?? 'basic';
    setTier(t);
    setScreen('loading');

    try {
      const savedName = localStorage.getItem('love_counsel_name') ?? '';
      const savedGender = (localStorage.getItem('love_counsel_gender') as Gender) ?? 'female';
      const savedEmail = localStorage.getItem('love_counsel_email') ?? '';
      const savedSituation = localStorage.getItem('love_counsel_situation') ?? '';
      const savedQuestion = localStorage.getItem('love_counsel_question') ?? '';

      if (!savedName || !savedSituation || !savedQuestion) {
        setScreen('error');
        setErrorMsg('이전 상담 정보를 찾을 수 없어요. 처음부터 다시 시도해주세요.');
        return;
      }

      fetch('/api/love-counsel-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: t,
          name: savedName,
          gender: savedGender,
          situation: savedSituation,
          question: savedQuestion,
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
      setErrorMsg('이전 상담 정보를 불러오지 못했어요.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goCheckout(selectedTier: Tier) {
    localStorage.setItem('love_counsel_name', name);
    localStorage.setItem('love_counsel_gender', gender);
    localStorage.setItem('love_counsel_email', email);
    localStorage.setItem('love_counsel_situation', situation);
    localStorage.setItem('love_counsel_question', question);
    localStorage.setItem('saju_result_email', email); // 체크아웃 위젯이 재사용하는 키

    const pkg = PACKAGES[selectedTier];
    const params = new URLSearchParams({
      cat: 'love-counsel',
      tier: selectedTier,
      amount: String(pkg.price),
      name: '연애상담',
      bi: '',
    });
    window.location.href = `/checkout?${params.toString()}`;
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-full border-4 border-purple-rich/30 border-t-purple-rich animate-spin" />
        <p className="text-sm text-body">전문가 상담 리포트를 준비하고 있어요...</p>
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
          <Link href="/love-counsel" className="inline-flex items-center justify-center w-full h-11 rounded-full border border-purple-rich/40 text-purple-light text-sm font-semibold hover:bg-purple-rich/10 transition-all">
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
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">연애상담 결과</p>
          <h1 className="text-xl font-bold text-white mb-6 text-center">{name}님을 위한 상담이에요</h1>

          {availableTabs.length > 1 ? (
            <div className="flex gap-2 mb-6">
              {availableTabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold transition-colors"
                  style={activeTab === t.key
                    ? { background: 'linear-gradient(135deg,#881337,#e11d48)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}

          {sections[activeTab] ? <ChapterResult sections={[sections[activeTab]]} /> : null}

          <p className="text-center text-xs text-mute mt-6">
            결과지는 이메일로도 발송됩니다 · 본 상담은 참고용 콘텐츠입니다
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
        <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-3">연애·결혼·재회 통합상담</p>
        <h1 className="text-2xl font-bold text-white mb-3">지금 이 관계,<br />전문가 시선으로 짚어드려요</h1>
        <p className="text-sm text-body mb-10 max-w-xs">
          연애든 결혼이든 재회든, 어떤 질문이든 괜찮아요. 지금 상황을 남겨주시면
          다양한 상담 사례를 다뤄온 관계 전문가의 통찰로 솔직하게 답해드려요.
        </p>
        <button
          onClick={() => setScreen('form')}
          className="w-full max-w-xs h-14 rounded-full text-white font-bold text-base"
          style={{ background: 'linear-gradient(135deg,#881337,#e11d48)', boxShadow: '0 8px 30px rgba(225,29,72,0.4)' }}
        >
          상담 시작하기 →
        </button>
        <p className="text-xs text-mute mt-4">약 2분 소요 · 참고용 상담 콘텐츠예요</p>
      </div>
    );
  }

  if (screen === 'form') {
    const canProceed = name.trim().length > 0 && /.+@.+\..+/.test(email) && situation.trim().length >= 10 && question.trim().length >= 5;
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container max-w-md py-12">
          <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">상담 신청</p>
          <h1 className="text-xl font-bold text-white mb-8 text-center">지금 상황을<br />편하게 들려주세요</h1>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
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
                        ? { background: 'rgba(225,29,72,0.25)', border: '1px solid rgba(225,29,72,0.6)', color: '#fda4af' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      {g === 'female' ? '여성' : '남성'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">결과지 받을 이메일 (간단하게만 발송됩니다)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60"
                placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">지금 상황을 편하게 설명해주세요</label>
              <textarea value={situation} onChange={e => setSituation(e.target.value)} rows={5}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder="예: 3개월 전 헤어진 사람이 있는데, 최근에 SNS로 제 게시물에 자주 좋아요를 눌러요. 만난 지는 1년 정도 됐고, 헤어진 이유는 서로 바빠서 연락이 뜸해졌기 때문이에요." />
            </div>
            <div>
              <label className="block text-xs text-body mb-1.5">궁금한 점 — 어떤 질문이든 괜찮아요</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                className="w-full rounded-xl bg-surface-soft border border-hairline text-ink text-sm px-4 py-3 outline-none focus:border-purple-rich/60 resize-none"
                placeholder="예: 제가 먼저 연락해도 될까요? 상대방도 저를 다시 생각하고 있는 걸까요?" />
            </div>
          </div>

          <button
            disabled={!canProceed}
            onClick={() => preselectedTier ? goCheckout(preselectedTier) : setScreen('package')}
            className="w-full h-14 rounded-full text-white font-bold text-base mt-8 disabled:opacity-30 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#881337,#e11d48)' }}
          >
            {preselectedTier ? `${fmt(PACKAGES[preselectedTier].price)} 결제하러 가기 →` : '다음으로 →'}
          </button>
        </div>
      </div>
    );
  }

  // screen === 'package'
  const tiers: Tier[] = ['basic', 'premium'];
  return (
    <div className="min-h-screen bg-canvas">
      <div className="container max-w-xl py-12">
        <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2">패키지 선택</p>
        <h1 className="text-2xl font-bold text-white mb-8">어느 깊이까지<br />상담받으시겠어요?</h1>

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
                  ? { background: 'linear-gradient(135deg,rgba(225,29,72,0.2),rgba(136,19,55,0.3))', border: '1.5px solid rgba(225,29,72,0.6)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-white">{pkg.label}</p>
                    {pkg.popular ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(225,29,72,0.3)', color: '#fda4af' }}>가장 많이 선택</span> : null}
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
