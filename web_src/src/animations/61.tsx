// Animation 61: bit · bitmask — one step = one action
import React from 'react';
import T from './trace/61';
import { TraceView, Stage, Seq, Split } from '../animation_kit/AlgoKit';

export default function BitmaskAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const nums: number[] = st.vars.nums ?? [];
        const mask: number | undefined = st.vars.mask;
        const pick: number[] = st.vars.pick ?? [];
        const i: number | undefined = st.vars.i;
        return (
          <Split>
            <Stage title="mask 的每一位（右邊是第 0 位）">
              <div className="flex justify-center">
                <Seq items={[2, 1, 0].map((b) => ({ v: mask === undefined ? '' : (mask >> b) & 1, tone: b === i ? 'active' : mask !== undefined && (mask >> b) & 1 ? 'yes' : 'normal', top: `第 ${b} 位` }))} />
              </div>
            </Stage>
            <Stage title="nums 和選到的">
              <Seq items={nums.map((v, b) => ({ v, top: `[${b}]`, tone: b === i ? 'active' : mask !== undefined && (mask >> b) & 1 && i !== undefined && b < i ? 'yes' : 'normal' }))} />
              <div className="mt-2"><Seq items={pick.map((v) => ({ v, tone: 'yes' }))} left="pick" empty="（空）" /></div>
            </Stage>
          </Split>
        );
      }}
    </TraceView>
  );
}
