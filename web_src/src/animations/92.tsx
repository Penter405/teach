// Animation 92: 資料結構 · 二元樹 ↔ list — one step = one action
import React from 'react';
import T from './trace/92';
import { TraceView, Stage, GraphView, Seq, touches, type GNode, type GEdge, type CellTone } from '../animation_kit/AlgoKit';

const POS = [[260, 30], [140, 100], [380, 100], [80, 175], [200, 175], [320, 175], [440, 175]];
export default function TreeListAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const tree: number[] = st.vars.tree ?? [];
        const { i, j } = st.vars;
        const tone = (k: number): CellTone => (touches(st, 'tree', k) ? 'active' : k === i || k === j ? 'blue' : 'normal');
        const nodes: GNode[] = tree.map((v, k) => ({ id: k, x: POS[k][0], y: POS[k][1], label: v, tone: tone(k), above: `[${k}]` }));
        const edges: GEdge[] = tree.slice(1).map((_, k) => ({ a: k >> 1, b: k + 1 }));
        return (
          <>
            <Stage title="樹（上面是 index）"><GraphView nodes={nodes} edges={edges} height={210} /></Stage>
            <Stage title="list"><div className="flex justify-center"><Seq items={tree.map((v, k) => ({ v, tone: tone(k), top: `[${k}]` }))} /></div></Stage>
          </>
        );
      }}
    </TraceView>
  );
}
