// Animation 41: 搜尋 · lower_bound — one step = one action
import React from 'react';
import T from './trace/41';
import { TraceView, Stage, Seq, touches } from '../animation_kit/AlgoKit';

export default function BinarySearchAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} hide={['target']}>
      {(st) => {
        const a: number[] = st.vars.a ?? [];
        const { lo, hi, mid } = st.vars;
        const inside = (i: number) => lo === undefined || (i >= lo && i < (hi ?? a.length));
        return (
          <Stage title="a（劃掉 = 已經排除；[lo, hi) = 還可能的範圍）">
            <div className="flex justify-center">
              <Seq items={[...a, '末'].map((v, i) => ({
                v,
                tone: touches(st, 'a', i) ? 'active' : i === a.length ? 'dim' : i === mid ? 'blue' : inside(i) ? 'normal' : 'no',
                struck: i < a.length && lo !== undefined && !inside(i),
                top: [i === lo ? 'lo' : '', i === hi ? 'hi' : '', i === mid ? 'mid' : ''].filter(Boolean).join(' ') || undefined,
                bottom: `[${i}]`,
              }))} />
            </div>
          </Stage>
        );
      }}
    </TraceView>
  );
}
