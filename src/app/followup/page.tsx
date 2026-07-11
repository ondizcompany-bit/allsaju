'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function FollowupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-mute text-sm">불러오는 중...</p>
      </div>
    }>
      <FollowupInner />
    </Suspense>
  );
}

function FollowupInner() {
  const search = useSearchParams();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (search.get('paid') !== 'true') {
      setState('error');
      setError('결제 정보가 확인되지 않았어요.');
      return;
    }

    const rawMe = localStorage.getItem('saju_birth_me');
    const manseryeokText = localStorage.getItem('saju_manseryeok');
    const categoryTitle = localStorage.getItem('saju_followup_category');
    const q = localStorage.getItem('saju_followup_question');
    const rawTarot = localStorage.getItem('saju_followup_tarot');

    if (!rawMe || !manseryeokText || !categoryTitle || !q) {
      setState('error');
      setError('이전 결과 정보를 찾을 수 없어요. 결과지 화면에서 다시 시도해주세요.');
      return;
    }

    setQuestion(q);
    const me = JSON.parse(rawMe) as { name?: string; birthDate?: string; birthTime?: string; gender?: string };
    const tarotCard = rawTarot ? JSON.parse(rawTarot) : null;

    fetch('/api/interpret-followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: me.name ?? '',
        birthDate: me.birthDate,
        birthTime: me.birthTime ?? null,
        timeUnknown: !me.birthTime,
        gender: me.gender,
        manseryeokText,
        categoryTitle,
        tarotCard,
        question: q,
      }),
    })
      .then(r => r.json())
      .then((data: { status: string; answer?: string; error?: string }) => {
        if (data.status === 'success' && data.answer) {
          setAnswer(data.answer);
          setState('ok');
          localStorage.removeItem('saju_followup_question');
        } else {
          setState('error');
          setError(data.error ?? 'AI 답변 생성에 실패했어요.');
        }
      })
      .catch(() => {
        setState('error');
        setError('네트워크 오류가 발생했어요.');
      });
  }, [search]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-full border-4 border-purple-rich/30 border-t-purple-rich animate-spin" />
        <p className="text-sm text-body">질문에 대한 답을 준비하고 있어요...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-red-800/50 bg-red-900/20 p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h1 className="text-lg font-bold text-white mb-2">답변 생성 실패</h1>
          <p className="text-sm text-body mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-11 rounded-full border border-purple-rich/40 text-purple-light text-sm font-semibold hover:bg-purple-rich/10 transition-all"
          >
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container max-w-lg py-16">
        <p className="text-xs font-semibold tracking-widest text-purple-bright uppercase mb-2 text-center">추가 질문 답변</p>
        <div className="rounded-2xl border border-hairline bg-surface-soft/50 p-5 mb-6">
          <p className="text-xs text-mute mb-1">남겨주신 질문</p>
          <p className="text-sm font-semibold text-white">&ldquo;{question}&rdquo;</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {answer.split('\n').map((line, i) =>
            line.trim() === ''
              ? <div key={i} className="h-3" />
              : <p key={i} className="text-sm leading-8 mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{line}</p>
          )}
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center w-full h-12 rounded-full border border-purple-rich/40 text-purple-light font-semibold text-sm hover:bg-purple-rich/10 transition-all"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
