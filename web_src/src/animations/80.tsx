// Animation 80: 圖 · 二分圖判定 — one step = one action
import React from 'react';
import T from './trace/80';
import { TraceView, Stage, GraphView, Seq, type GNode, type GEdge } from '../animation_kit/AlgoKit';

const POS: Record<number, [number, number]> = { 0: [140, 45], 1: [380, 45], 2: [380, 205], 3: [140, 205] };
const E: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];
export default function BipartiteAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const color: number[] = st.vars.color ?? [-1, -1, -1, -1];
        const q: number[] = st.vars.q ?? [];
        const { u, v } = st.vars;
        const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => {
          const n = +k;
          return { id: n, x, y, tone: color[n] === 0 ? 'hit' : color[n] === 1 ? 'blue' : 'normal', below: color[n] === 0 ? '紅' : color[n] === 1 ? '藍' : '還沒塗', above: n === u ? 'u' : n === v ? 'v' : undefined };
        });
        const edges: GEdge[] = E.map(([a, b]) => ({ a, b, tone: (a === u && b === v) || (b === u && a === v) ? 'active' : 'normal' }));
        return (
          <>
            <Stage title="每條邊兩端要不同色"><GraphView nodes={nodes} edges={edges} height={250} /></Stage>
            <Stage title="q"><Seq items={q.map((n) => ({ v: n }))} /></Stage>
          </>
        );
      }}
    </TraceView>
  );
}
