// Animation 87: 最小生成樹 · Prim — one step = one action
import React from 'react';
import T from './trace/87';
import { TraceView, Stage, GraphView, Seq, type GNode, type GEdge } from '../animation_kit/AlgoKit';
import { W_POS, W_EDGES, NAME } from './83';

export default function PrimAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const inT: boolean[] = st.vars.in_tree ?? [false, false, false, false];
        const pq: [number, number][] = st.vars.pq ?? [];
        const { u, v } = st.vars;
        const nodes: GNode[] = Object.entries(W_POS).map(([k, [x, y]]) => {
          const n = +k;
          return { id: n, x, y, label: NAME[n], tone: n === u ? 'active' : n === v ? 'blue' : inT[n] ? 'yes' : 'normal', [n === 1 ? 'above' : 'below']: inT[n] ? '在樹裡' : undefined } as GNode;
        });
        const edges: GEdge[] = W_EDGES.map(([a, b, w]) => ({ a, b, w, tone: (a === u && b === v) || (b === u && a === v) ? 'active' : inT[a] && inT[b] ? 'dim' : 'normal' }));
        return (
          <>
            <Stage title="綠 = 已經在樹裡；黃 = u；藍 = v"><GraphView nodes={nodes} edges={edges} width={520} height={260} /></Stage>
            <Stage title="pq（候選：(邊的權重, 點)；最小的在最前面）"><Seq items={pq.map(([w, n]) => ({ v: `${w},${NAME[n]}`, tone: inT[n] ? 'no' : 'normal', struck: inT[n] }))} /></Stage>
          </>
        );
      }}
    </TraceView>
  );
}
