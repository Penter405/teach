// Animation 56: 資料結構 · 單調佇列 — one step = one action
import React from 'react';
import T from './trace/56';
import { TraceView, Stage, Seq, touches } from '../animation_kit/AlgoKit';

export default function MonoQueueAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const a: number[] = st.vars.a ?? [];
        const dq: number[] = st.vars.dq ?? [];
        const res: number[] = st.vars.res ?? [];
        const { i, k } = st.vars;
        const inWin = (j: number) => i !== undefined && j <= i && j > i - (k ?? 3);
        return (
          <>
            <Stage title="a（綠 = 目前的視窗）">
              <div className="flex justify-center">
                <Seq items={a.map((v, j) => ({ v, tone: touches(st, 'a', j) ? 'active' : j === i ? 'blue' : inWin(j) ? 'yes' : 'normal', top: j === i ? 'i' : `[${j}]` }))} />
              </div>
            </Stage>
            <Stage title="dq（放 index；前 → 後，值遞減；最前面 = 視窗最大）">
              <Seq left="前" right="後" items={dq.map((j, n) => ({ v: j, bottom: `a=${a[j]}`, tone: n === 0 ? 'yes' : 'normal' }))} />
            </Stage>
            <Stage title="res（每個視窗的最大值）"><Seq items={res.map((v) => ({ v, tone: 'yes' }))} /></Stage>
          </>
        );
      }}
    </TraceView>
  );
}
