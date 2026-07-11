'use client';

import { useState } from 'react';

const CHAPTER_ICONS = ['✨','💎','🌟','💼','💰','💕','🌿','🔭','🌌','🃏','🔮'];

export function ChapterResult({ sections }: { sections: string[] }) {
  const [screen, setScreen] = useState<'toc' | 'chapter'>('toc');
  const [cur, setCur] = useState(0);

  type Block = { title: string; body: string; isJami: boolean; isTarot: boolean };
  const blocks: Block[] = [];
  let afterJami = false;
  let afterTarot = false;
  sections.forEach(section => {
    const lines = section.split('\n');
    let curTitle = '';
    let curBody: string[] = [];
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        const isBanner = curTitle.includes('자미두수 심층 분석') || curTitle.includes('타로 심층 분석');
        if (curTitle && !isBanner) {
          blocks.push({ title: curTitle, body: curBody.join('\n').trim(), isJami: afterJami, isTarot: afterTarot });
        }
        curTitle = line.replace(/^##\s*/, '');
        curBody = [];
        if (curTitle.includes('자미두수 심층 분석')) { afterJami = true; curTitle = ''; }
        if (curTitle.includes('타로 심층 분석')) { afterTarot = true; afterJami = false; curTitle = ''; }
      } else {
        curBody.push(line);
      }
    });
    const isBanner = curTitle.includes('자미두수 심층 분석') || curTitle.includes('타로 심층 분석');
    if (curTitle && !isBanner) {
      blocks.push({ title: curTitle, body: curBody.join('\n').trim(), isJami: afterJami, isTarot: afterTarot });
    }
  });

  const total = blocks.length;
  const progress = screen === 'toc' ? 0 : Math.round(((cur + 1) / total) * 100);

  function renderBody(body: string, isJami: boolean, isTarot: boolean) {
    const accent = isTarot ? '#c084fc' : isJami ? '#fbbf24' : '#a78bfa';
    const borderColor = isTarot ? 'rgba(192,132,252,0.35)' : isJami ? 'rgba(234,179,8,0.35)' : 'rgba(139,92,246,0.35)';
    return body.split('\n').map((line, li) => {
      if (line.trim() === '') return <div key={li} className="h-3" />;
      if (line.startsWith('### ')) return (
        <p key={li} className="text-xs font-bold mt-4 mb-1" style={{ color: accent }}>{line.replace(/^###\s*/, '')}</p>
      );
      if (line.startsWith('- ')) return (
        <p key={li} className="text-sm leading-7 pl-3 mb-1" style={{ color: 'rgba(255,255,255,0.75)', borderLeft: `2px solid ${borderColor}` }}>{line.replace(/^-\s*/, '')}</p>
      );
      const html = line.replace(/\*\*(.+?)\*\*/g, `<strong style="color:#e2d9f3;font-weight:500">$1</strong>`);
      return <p key={li} className="text-sm leading-8" style={{ color: 'rgba(255,255,255,0.75)' }} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  if (screen === 'toc') {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs mb-2" style={{ color: '#a78bfa' }}>目 次 · 목차</p>
          <p className="text-base font-bold text-white">총 {total}장으로 구성된 분석이에요</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>각 장을 눌러 바로 이동하거나, 처음부터 읽어보세요</p>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          {blocks.map((b, i) => (
            <button
              key={i}
              onClick={() => { setCur(i); setScreen('chapter'); }}
              className="flex items-center gap-3 w-full text-left rounded-xl px-4 py-3 transition-colors hover:bg-white/5"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: b.isTarot ? '1px solid rgba(192,132,252,0.2)' : b.isJami ? '1px solid rgba(234,179,8,0.2)' : '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                style={{
                  background: b.isTarot ? 'rgba(192,132,252,0.1)' : b.isJami ? 'rgba(234,179,8,0.1)' : 'rgba(124,58,237,0.15)',
                  border: b.isTarot ? '1px solid rgba(192,132,252,0.25)' : b.isJami ? '1px solid rgba(234,179,8,0.25)' : '1px solid rgba(124,58,237,0.3)'
                }}>
                {CHAPTER_ICONS[i % CHAPTER_ICONS.length]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs" style={{ color: b.isTarot ? '#c084fc' : b.isJami ? '#fbbf24' : '#a78bfa' }}>제 {i + 1}장</p>
                  {b.isJami && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.35)', color: '#fbbf24', letterSpacing: '0.05em' }}>
                      ✦ 자미두수
                    </span>
                  )}
                  {b.isTarot && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.35)', color: '#c084fc', letterSpacing: '0.05em' }}>
                      🃏 타로
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-white leading-snug truncate">{b.title.replace(/^[^\w가-힣]+/, '')}</p>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>›</span>
            </button>
          ))}
        </div>
        <div className="px-4 pb-5 pt-1">
          <button
            onClick={() => { setCur(0); setScreen('chapter'); }}
            className="w-full py-3.5 rounded-xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
          >
            처음부터 읽기 →
          </button>
        </div>
      </div>
    );
  }

  const block = blocks[cur];
  const isJami = block.isJami;
  const isTarot = block.isTarot;

  const accentColor = isTarot ? '#c084fc' : isJami ? '#fbbf24' : '#a78bfa';
  const bgColor = isTarot ? 'rgba(20,5,40,0.95)' : isJami ? 'rgba(15,10,46,0.9)' : 'rgba(10,10,20,0.8)';
  const borderStyle = isTarot ? '1px solid rgba(192,132,252,0.25)' : isJami ? '1px solid rgba(234,179,8,0.2)' : '1px solid rgba(255,255,255,0.07)';
  const progressBg = isTarot ? 'linear-gradient(90deg,#9333ea,#c084fc)' : isJami ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#7c3aed,#a78bfa)';
  const btnBg = isTarot ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : isJami ? 'linear-gradient(135deg,#b45309,#d97706)' : 'linear-gradient(135deg,#7c3aed,#6d28d9)';
  const numBg = isTarot ? 'rgba(192,132,252,0.15)' : isJami ? 'rgba(234,179,8,0.15)' : '#7c3aed';
  const numBorder = isTarot ? '1px solid rgba(192,132,252,0.4)' : isJami ? '1px solid rgba(234,179,8,0.4)' : 'none';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: bgColor, border: borderStyle }}>
      {/* 프로그레스 바 */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: progressBg, transition: 'width 0.4s' }} />
      </div>

      {/* 챕터 헤더 */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ background: numBg, color: accentColor, border: numBorder }}>
          {cur + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-0.5" style={{ color: accentColor }}>제 {cur + 1}장 · {cur + 1}/{total}</p>
          <p className="text-sm font-bold leading-snug" style={{ color: isTarot ? '#e9d5ff' : isJami ? '#fde68a' : '#fff' }}>{block.title.replace(/^[^\w가-힣]+/, '')}</p>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-5 py-5">
        {renderBody(block.body, isJami, isTarot)}
      </div>

      {/* 도트 네비 */}
      <div className="flex justify-center gap-1.5 pb-1">
        {blocks.map((_, i) => (
          <button key={i} onClick={() => setCur(i)}
            style={{ width: i === cur ? 18 : 6, height: 6, borderRadius: i === cur ? 3 : '50%', background: i === cur ? accentColor : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>

      {/* 이전/다음 버튼 */}
      <div className="flex gap-2 px-4 py-4">
        <button
          onClick={() => cur === 0 ? setScreen('toc') : setCur(cur - 1)}
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
        >
          {cur === 0 ? '목차' : '← 이전'}
        </button>
        <button
          onClick={() => cur === total - 1 ? setScreen('toc') : setCur(cur + 1)}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white"
          style={{ background: btnBg }}
        >
          {cur === total - 1 ? '목차로 돌아가기' : '다음 →'}
        </button>
      </div>
    </div>
  );
}
