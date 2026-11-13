// Animation 66: DP · 爬樓梯 — one step = one action
import React from 'react';
import T from './trace/66';
import { TraceView, Stage, Seq, touches } from '../animation_kit/AlgoKit';

export default function StairsAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const dp: number[] = st.vars.dp ?? [];
        return (
          <Stage title="dp[i] = 爬到第 i 階有幾種方法">
            <div className="flex justify-center">
              <Seq items={dp.map((v, k) => ({ v, top: `dp[${k}]`, tone: touches(st, 'dp', k) ? (st.kind === 'assign' ? 'yes' : 'active') : k === st.vars.i ? 'blue' : 'normal' }))} />
            </div>
          </Stage>
        );
      }}
    </TraceView>
  );
}
