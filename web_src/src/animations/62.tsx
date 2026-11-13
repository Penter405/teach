// Animation 62: 回溯 · 4 皇后 — one step = one action
import React from 'react';
import T from './trace/62';
import { TraceView, Stage, Seq, Split } from '../animation_kit/AlgoKit';

const attacked = (q: number[], r: number, c: number) => q.some((qc, qr) => qr < r && (qc === c || Math.abs(qr - r) === Math.abs(qc - c)));
export default function NQueensAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const q: number[] = st.vars.place ?? [];
        const { r, c } = st.vars;
        const done = q.length === 4;
        return (
          <Split>
            <Stage title="棋盤（黃 = 正在檢查的格子；紅 = 會被攻擊）">
              <div className="mx-auto grid w-fit grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((rr) => [0, 1, 2, 3].map((cc) => {
                  const queen = q[rr] === cc;
                  const cur = rr === r && cc === c && !queen;
                  const hit = rr === r && rr >= q.length && attacked(q, rr, cc);
                  return (
                    <div key={`${rr}-${cc}`} className={`flex h-12 w-12 items-center justify-center rounded-md border text-2xl transition-colors duration-300
                      ${queen ? (done ? 'border-emerald-400 bg-emerald-500/25' : 'border-slate-500 bg-slate-700') : cur ? (hit ? 'border-rose-400 bg-rose-500/40 ring-2 ring-rose-400' : 'border-amber-400 bg-amber-500/30 ring-2 ring-amber-400') : hit ? 'border-rose-900 bg-rose-950/50' : (rr + cc) % 2 ? 'border-slate-700 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}>
                      {queen ? '♛' : ''}
                    </div>
                  );
                }))}
              </div>
            </Stage>
            <Stage title="place（每一列放在第幾行）">
              <Seq items={q.map((v, k) => ({ v, top: `列 ${k}`, tone: done ? 'yes' : k === q.length - 1 ? 'active' : 'normal' }))} empty="（空）" />
            </Stage>
          </Split>
        );
      }}
    </TraceView>
  );
}
