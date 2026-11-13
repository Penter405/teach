// Animation 83: 最短路徑 · Dijkstra — one step = one action
import React from 'react';
import T from './trace/83';
import { TraceView, Stage, GraphView, Seq, Split, touches, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const W_POS: Record<number, [number, number]> = { 0: [60, 130], 1: [260, 40], 2: [260, 220], 3: [460, 130] };
export const W_EDGES: [number, number, number][] = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]];
export const NAME = ['A', 'B', 'C', 'D'];
export default function DijkstraAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st, s) => {
        const dist: (number | string)[] = st.vars.dist ?? ['∞', '∞', '∞', '∞'];
        const pq: [number, number][] = st.vars.pq ?? [];
        const { u, v } = st.vars;
        // a node is settled once it was popped with d == dist[u] and the stale check passed
        const settled = new Set<number>();
        T.steps.slice(0, s + 1).forEach((x) => { if (x.kind === 'if' && x.line === 7 && x.taken === false) settled.add(x.vars.u); });
        const nodes: GNode[] = Object.entries(W_POS).map(([k, [x, y]]) => {
          const n = +k;
          return { id: n, x, y, label: NAME[n], tone: n === u ? 'active' : n === v ? 'blue' : settled.has(n) ? 'yes' : 'normal', [n === 1 ? 'above' : 'below']: `dist ${dist[n]}` } as GNode;
        });
        const edges: GEdge[] = W_EDGES.map(([a, b, w]) => ({ a, b, w, tone: (a === u && b === v) || (b === u && a === v) ? 'active' : 'normal' }));
        return (
          <>
            <Stage title="綠 = 已確定；黃 = u；藍 = v"><GraphView nodes={nodes} edges={edges} width={520} height={260} /></Stage>
            <Split>
              <Stage title="pq（heap：最小的在最前面）"><Seq items={pq.map(([d, n]) => ({ v: `${d},${NAME[n]}` }))} /></Stage>
              <Stage title="dist"><Seq items={dist.map((d, k) => ({ v: d, top: NAME[k], tone: touches(st, 'dist', k) ? (st.kind === 'assign' ? 'yes' : 'active') : 'normal' }))} /></Stage>
            </Split>
          </>
        );
      }}
    </TraceView>
  );
}
