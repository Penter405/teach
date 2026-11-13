// Animation 38: 數學 · 試除法 is_prime(91) — one step = one action
import React from 'react';
import T from './trace/38';
import { TraceView, Stage, ValueCell, type CellTone } from '../animation_kit/AlgoKit';

const DIVS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
export default function TrialDivisionAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const n = st.vars.n ?? 91;
        const d: number | undefined = st.vars.d;
        const found = st.kind === 'return' && st.post.includes('False');
        return (
          <Stage title={`除數 d（n = ${n}）`} right={<span className="text-[10px] text-amber-300">√{n} ≈ {Math.sqrt(n).toFixed(2)}</span>}>
            <div className="flex flex-wrap items-end justify-center gap-1.5">
              {DIVS.map((k) => {
                let tone: CellTone = 'normal', top: string | undefined, bottom: string | undefined;
                if (k > 9) { tone = 'dim'; bottom = '不用試'; }
                else if (d !== undefined && k < d) { tone = 'no'; bottom = `餘 ${n % k}`; }
                else if (k === d) { tone = found ? 'yes' : 'active'; top = 'd'; bottom = `${n} % ${k} = ${n % k}`; }
                return (
                  <React.Fragment key={k}>
                    {k === 10 && <div className="mx-1 flex flex-col items-center self-stretch"><span className="text-[9px] font-bold text-amber-300">√n</span><div className="w-[3px] flex-1 rounded bg-amber-400/80" /></div>}
                    <ValueCell value={k} tone={tone} top={top} bottom={bottom} />
                  </React.Fragment>
                );
              })}
            </div>
          </Stage>
        );
      }}
    </TraceView>
  );
}
