// Animation 76: 圖 · BFS — one step = one action
import React from 'react';
import T from './trace/76';
import { TraceView, Stage, GraphView, Seq, Split, touches, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const G_POS: Record<number, [number, number]> = { 0: [260, 30], 1: [160, 100], 2: [360, 100], 3: [90, 180], 4: [230, 180], 5: [380, 180] };
export const G_EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [4, 5]];
export default function BfsAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const dist: number[] = st.vars.dist ?? [-1, -1, -1, -1, -1, -1];
        const q: number[] = st.vars.q ?? [];
        const { u, v } = st.vars;
        const nodes: GNode[] = Object.entries(G_POS).map(([k, [x, y]]) => {
          const n = +k;
          return { id: n, x, y, tone: n === u ? 'active' : n === v ? 'blue' : dist[n] >= 0 ? 'yes' : 'normal', below: dist[n] >= 0 ? `dist ${dist[n]}` : undefined, above: n === u ? 'u' : n === v ? 'v' : undefined };
        });
        const edges: GEdge[] = G_EDGES.map(([a, b]) => ({ a, b, tone: (a === u && b === v) || (b === u && a === v) ? 'active' : 'normal' }));
        return (
          <>
            <Stage title="圖（綠 = 已經知道距離；黃 = u；藍 = v）"><GraphView nodes={nodes} edges={edges} height={210} /></Stage>
            <Split>
              <Stage title="q（左邊先出）"><Seq left="出" right="進" items={q.map((n) => ({ v: n, bottom: `dist ${dist[n]}` }))} /></Stage>
              <Stage title="dist"><Seq size="sm" items={dist.map((d, k) => ({ v: d, top: `[${k}]`, tone: touches(st, 'dist', k) ? (st.kind === 'assign' ? 'yes' : 'active') : d < 0 ? 'dim' : 'normal' }))} /></Stage>
            </Split>
          </>
        );
      }}
    </TraceView>
  );
}
