// Animation 70: DP · LIS（memo + 二分搜尋）— one step = one action
import React from 'react';
import T from './trace/70';
import { TraceView, Stage, Seq, touches } from '../animation_kit/AlgoKit';

export default function LisAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st, s) => {
        const a: number[] = st.vars.a ?? [];
        const memo: number[] = st.vars.memo ?? [];
        const at = T.steps.slice(0, s + 1).filter((x) => x.kind === 'for' && x.taken).length - 1;
        return (
          <>
            <Stage title="a（藍 = 這一輪的 x）">
              <div className="flex justify-center"><Seq items={a.map((v, k) => ({ v, top: `[${k}]`, tone: k === at ? 'blue' : k < at ? 'no' : 'normal' }))} /></div>
            </Stage>
            <Stage title="memo（遞增；memo[k] = 長度 k+1 的結尾最小值）">
              <Seq items={memo.map((v, k) => ({ v, top: `長度 ${k + 1}`, tone: touches(st, 'memo', k) || (st.changed?.includes('memo') && k === memo.length - 1) ? 'yes' : k === st.vars.i ? 'active' : 'normal' }))} empty="（空的）" />
            </Stage>
          </>
        );
      }}
    </TraceView>
  );
}
