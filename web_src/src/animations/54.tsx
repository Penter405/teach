// Animation 54: 資料結構 · heap push（上浮）— one step = one action
import React from 'react';
import T from './trace/54';
import { TraceView, Stage, GraphView, Seq, Split, touches, type GNode, type GEdge, type CellTone } from '../animation_kit/AlgoKit';

const POS = [[260, 30], [160, 100], [360, 100], [100, 170]];
export default function HeapAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const h: number[] = st.vars.h ?? [];
        const { i, p } = st.vars;
        const tone = (k: number): CellTone => (touches(st, 'h', k) ? (st.kind === 'assign' ? 'hit' : 'active') : k === i ? 'blue' : k === p ? 'yes' : 'normal');
        const nodes: GNode[] = h.map((v, k) => ({ id: k, x: POS[k][0], y: POS[k][1], label: v, tone: tone(k), above: `[${k}]`, below: k === i ? 'i' : k === p ? 'p（父）' : undefined }));
        const edges: GEdge[] = h.slice(1).map((_, k) => ({ a: (k) >> 1, b: k + 1, tone: (k + 1 === i && (k >> 1) === p) ? 'active' : 'normal' }));
        return (
          <Split>
            <Stage title="樹的樣子（父 ≤ 子）"><GraphView nodes={nodes} edges={edges} height={205} width={460} /></Stage>
            <Stage title="實際存的 list h">
              <div className="flex h-full items-center justify-center"><Seq items={h.map((v, k) => ({ v, tone: tone(k), top: `[${k}]`, bottom: k === i ? 'i' : k === p ? 'p' : undefined }))} /></div>
            </Stage>
          </Split>
        );
      }}
    </TraceView>
  );
}
