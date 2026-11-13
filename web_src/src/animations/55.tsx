// Animation 55: 資料結構 · 單調堆疊 — one step = one action
import React from 'react';
import T from './trace/55';
import { TraceView, Stage, StackView, Seq, Split, touches } from '../animation_kit/AlgoKit';

export default function MonoStackAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const a: number[] = st.vars.a ?? [];
        const ans: number[] = st.vars.ans ?? [];
        const stack: number[] = st.vars.stack ?? [];
        const i: number | undefined = st.vars.i;
        return (
          <Split>
            <Stage title="a 和 ans（-1 = 還沒找到）">
              <Seq items={a.map((v, k) => ({ v, tone: touches(st, 'a', k) ? 'active' : k === i ? 'blue' : 'normal', top: k === i ? 'i' : `[${k}]`, bottom: ans.length ? `ans ${ans[k]}` : undefined }))} />
            </Stage>
            <Stage title="stack（放 index；由下到上，值遞減）">
              <div className="flex justify-center">
                <StackView items={stack.map((k) => ({ v: k, note: `a=${a[k]}`, tone: st.changed?.includes('stack') && k === stack[stack.length - 1] ? 'active' : 'normal' }))} />
              </div>
            </Stage>
          </Split>
        );
      }}
    </TraceView>
  );
}
