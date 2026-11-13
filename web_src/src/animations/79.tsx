// Animation 79: 圖 · 拓樸排序（Kahn）— one step = one action
import React from 'react';
import T from './trace/79';
import { TraceView, Stage, GraphView, Seq, Split, type GNode, type GEdge } from '../animation_kit/AlgoKit';

const POS: Record<number, [number, number]> = { 0: [70, 60], 1: [70, 200], 2: [260, 60], 4: [260, 200], 3: [450, 130] };
const E: [number, number][] = [[0, 2], [1, 2], [2, 3], [1, 4], [4, 3]];
export default function TopoAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const indeg: number[] = st.vars.indeg ?? [0, 0, 0, 0, 0];
        const q: number[] = st.vars.q ?? [];
        const order: number[] = st.vars.order ?? [];
        const { u, v } = st.vars;
        const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => {
          const n = +k;
          return { id: n, x, y, tone: n === u ? 'active' : n === v ? 'blue' : order.includes(n) ? 'yes' : 'normal', below: `入度 ${indeg[n]}` };
        });
        const edges: GEdge[] = E.map(([a, b]) => ({ a, b, directed: true, tone: a === u && b === v ? 'active' : order.includes(a) ? 'dim' : 'normal' }));
        return (
          <>
            <Stage title="先修關係（a → b：先做 a 才能做 b）"><GraphView nodes={nodes} edges={edges} height={250} /></Stage>
            <Split>
              <Stage title="q（現在就能做的）"><Seq items={q.map((n) => ({ v: n, tone: 'blue' }))} /></Stage>
              <Stage title="order（做完的順序）"><Seq items={order.map((n) => ({ v: n, tone: 'yes' }))} /></Stage>
            </Split>
          </>
        );
      }}
    </TraceView>
  );
}
