// Animation 39: 數學 · 埃氏篩 sieve(20) — one step = one action
import React from 'react';
import T from './trace/39';
import { TraceView, Stage, ValueCell, touches, type CellTone } from '../animation_kit/AlgoKit';

const LAST = T.steps.length - 1;
export default function SieveAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st, s) => {
        const isp: boolean[] | undefined = st.vars.is_p;
        const p: number | undefined = st.vars.p;
        return (
          <Stage title="is_p[0..20]（劃掉 = False；綠圈 = 確定是質數）">
            <div className="grid grid-cols-7 sm:grid-cols-11 justify-items-center gap-x-1 gap-y-0.5">
              {Array.from({ length: 21 }, (_, k) => {
                const alive = isp ? isp[k] : true;
                const hit = touches(st, 'is_p', k);
                const sure = alive && k >= 2 && ((p !== undefined && k < p) || s === LAST);
                const tone: CellTone = hit ? (st.kind === 'assign' ? 'hit' : 'active') : k === p ? 'active' : sure ? 'yes' : alive ? 'normal' : 'dim';
                return <ValueCell key={k} value={k} size="sm" tone={tone} struck={!alive} circle={sure || k === p} top={k === p ? 'p' : k === st.vars.m ? 'm' : undefined} />;
              })}
            </div>
          </Stage>
        );
      }}
    </TraceView>
  );
}
