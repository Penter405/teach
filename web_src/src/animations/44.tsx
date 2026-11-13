// Animation 44: 搜尋 · 二分答案 — Koko: piles [30,11,23,4,20], h = 6
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Seq, VarRow, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  '答案範圍：速度 1 ～ 30（最大的那堆是 30）',
  'mid = 15：要 2+1+2+1+2 = 8 小時 > 6 ✗ → 太慢，lo = 16',
  'mid = 23：要 2+1+1+1+1 = 6 小時 ≤ 6 ✓ → hi = 23',
  'mid = 19：要 8 小時 ✗ → lo = 20',
  'mid = 21：要 7 小時 ✗ → lo = 22',
  'mid = 22：要 7 小時 ✗ → lo = 23',
  'lo == hi == 23 → 答案 23：可以的速度排起來是 ✗✗…✗✓✓…✓',
];
const P = [30, 11, 23, 4, 20];
const H = 6;
const hours = (k: number) => P.reduce((a, p) => a + Math.ceil(p / k), 0);
const F = [{ lo: 1, hi: 30, mid: 0 }, { lo: 16, hi: 30, mid: 15 }, { lo: 16, hi: 23, mid: 23 }, { lo: 20, hi: 23, mid: 19 }, { lo: 22, hi: 23, mid: 21 }, { lo: 23, hi: 23, mid: 22 }, { lo: 23, hi: 23, mid: 0 }];

export default function BinaryAnswerAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const { lo, hi, mid } = F[s];
  const ks = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: 'lo', value: lo }, { name: 'hi', value: hi }, { name: 'mid', value: mid || '—', hot: !!mid }, { name: `hours(mid)`, value: mid ? hours(mid) : '—', hot: !!mid }, { name: 'h', value: H }]} />
        <Stage title="每一堆用 mid 的速度要幾小時（無條件進位）">
          <div className="flex justify-center">
            <Seq items={P.map((p) => ({ v: p, tone: mid ? 'active' : 'normal', bottom: mid ? `⌈${p}/${mid}⌉ = ${Math.ceil(p / mid)}` : undefined }))} />
          </div>
        </Stage>
        <Stage title="答案軸：速度 k = 1 ～ 30">
          <div className="flex flex-wrap justify-center gap-1">
            {ks.map((k) => {
              const ok = hours(k) <= H;
              const known = s === 6 || k < lo || k >= hi + (s === 0 ? 1 : 0) || k === mid;
              const tone = k === mid ? 'active' : !known ? 'normal' : ok ? 'yes' : 'no';
              return (
                <div key={k} className={`flex h-9 w-9 flex-col items-center justify-center rounded-md border font-mono text-xs font-bold transition-colors duration-300
                  ${tone === 'active' ? 'border-amber-400 bg-amber-500/25 text-amber-100 ring-2 ring-amber-400' : tone === 'yes' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100' : tone === 'no' ? 'border-rose-900 bg-rose-950/40 text-rose-300/70' : 'border-slate-600 bg-slate-800 text-slate-200'}`}>
                  {k}<span className="text-[9px] leading-none">{known ? (ok ? '✓' : '✗') : ''}</span>
                </div>
              );
            })}
          </div>
        </Stage>
        {s === 2 && <Note>23 可以 → 24、25…一定也可以（單調性），所以右半邊不用再檢查。</Note>}
        {s === 6 && <Note tone="emerald">只檢查了 5 個速度，不用從 1 試到 30。</Note>}
      </AlgoBoard>
    </div>
  );
}
