// Animation 77: 圖 · DFS — one step = one action
import React from 'react';
import T from './trace/77';
import { TraceView, Stage, GraphView, Seq, type GNode, type GEdge } from '../animation_kit/AlgoKit';
import { G_POS, G_EDGES } from './76';

export default function DfsAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const seen: boolean[] = st.vars.seen ?? [];
        const order: number[] = st.vars.order ?? [];
        const path = st.stack.map((f) => +f.args.u);
        const { u, v } = st.vars;
        const nodes: GNode[] = Object.entries(G_POS).map(([k, [x, y]]) => {
          const n = +k, i = order.indexOf(n);
          return { id: n, x, y, tone: n === u ? 'active' : n === v && !seen[n] ? 'blue' : seen[n] ? 'yes' : 'normal', above: i >= 0 ? `第 ${i + 1}` : undefined };
        });
        const onPath = (a: number, b: number) => { const i = path.indexOf(a), j = path.indexOf(b); return i >= 0 && j >= 0 && Math.abs(i - j) === 1; };
        const edges: GEdge[] = G_EDGES.map(([a, b]) => ({ a, b, tone: onPath(a, b) ? 'chosen' : (a === u && b === v) || (b === u && a === v) ? 'active' : 'normal' }));
        return (
          <>
            <Stage title="圖（綠線 = call stack 上的這條路；上面的數字 = 第幾個走到）"><GraphView nodes={nodes} edges={edges} height={210} /></Stage>
            <Stage title="order"><Seq items={order.map((n) => ({ v: n, tone: 'yes' }))} empty="（空）" /></Stage>
          </>
        );
      }}
    </TraceView>
  );
}
