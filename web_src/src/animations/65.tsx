// Animation 65: DP · 記憶化 fib(5) — one step = one action
import React from 'react';
import T from './trace/65';
import { TraceView, Stage, Seq, VarRow } from '../animation_kit/AlgoKit';

export default function MemoAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st, s) => {
        const memo: Record<string, number> = st.vars.memo ?? {};
        const calls = T.steps.slice(0, s + 1).filter((x) => x.kind === 'call_user').length;
        return (
          <>
            <VarRow vars={[{ name: 'fib 被呼叫幾次', value: calls, hot: st.kind === 'call_user' }, { name: '沒有記憶化要', value: 15 }]} />
            <Stage title="memo（算過的答案）">
              <Seq items={Object.entries(memo).map(([k, v]) => ({ v, top: `fib(${k})`, tone: st.ref?.[0] === 'memo' && String(st.ref[1]) === k ? 'active' : 'yes' }))} empty="（空的）" />
            </Stage>
          </>
        );
      }}
    </TraceView>
  );
}
