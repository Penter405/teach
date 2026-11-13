// Animation 73: 資料結構 · Fenwick tree — one step = one action
import React from 'react';
import T from './trace/73';
import { TraceView, Stage, touches } from '../animation_kit/AlgoKit';

const low = (i: number) => i & -i;
export default function FenwickAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const tree: number[] = st.vars.tree ?? [];
        const i: number | undefined = st.vars.i;
        return (
          <Stage title={i !== undefined ? `i = ${i} = ${i.toString(2)}₂，lowbit = ${i > 0 ? low(i) : 0}` : 'tree[i] 管的範圍（越下面管越多）'}>
            <div className="flex flex-col gap-1">
              {[0, 1, 2, 3].map((lv) => (
                <div key={lv} className="grid grid-cols-8 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].filter((k) => Math.log2(low(k)) === lv).map((k) => {
                    const hot = touches(st, 'tree', k);
                    return (
                      <div key={k} style={{ gridColumn: `${k - low(k) + 1} / ${k + 1}` }}
                        className={`flex h-9 items-center justify-between gap-1 whitespace-nowrap rounded-md border px-1.5 font-mono text-[11px] transition-colors duration-300
                        ${hot ? (st.kind === 'assign' ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100' : 'border-amber-400 bg-amber-500/25 text-amber-100 ring-2 ring-amber-400') : k === i ? 'border-sky-400 bg-sky-500/15 text-sky-100' : 'border-slate-600 bg-slate-800 text-slate-200'}`}>
                        <span className="font-bold">tree[{k}]</span><span>= {tree[k]}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Stage>
        );
      }}
    </TraceView>
  );
}
