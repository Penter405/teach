// Animation 78: 樹 · 前序走訪 — one step = one action
import React from 'react';
import T from './trace/78';
import { TraceView, Stage, GraphView, Seq, type GNode, type GEdge } from '../animation_kit/AlgoKit';

const POS: Record<number, [number, number]> = { 1: [260, 30], 2: [150, 100], 3: [370, 100], 4: [90, 170], 5: [210, 170], 6: [310, 170] };
const E: [number, number][] = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6]];
export default function PreorderAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st, s) => {
        const out: number[] = st.vars.out ?? [];
        const node = st.vars.node;
        const path = st.stack.map((f) => +f.args.node).filter((n) => n > 0);
        const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => {
          const n = +k, i = out.indexOf(n);
          return { id: n, x, y, tone: n === node ? 'active' : path.includes(n) ? 'blue' : i >= 0 ? 'yes' : 'normal', above: i >= 0 ? `第 ${i + 1}` : undefined };
        });
        const edges: GEdge[] = E.map(([a, b]) => ({ a, b, tone: path.includes(a) && path.includes(b) ? 'active' : 'normal' }));
        return (
          <>
            <Stage title={node === -1 ? '這次呼叫的 node 是 -1（沒有子節點）→ 直接 return' : '樹（黃 = 目前的 node；藍 = 還在 stack 上等的）'}><GraphView nodes={nodes} edges={edges} height={205} /></Stage>
            <Stage title="out（前序）"><Seq items={out.map((n) => ({ v: n, tone: 'yes' }))} empty="（空）" /></Stage>
            {s === T.steps.length - 1 && (
              <div className="rounded-lg bg-sky-500/10 px-3 py-2 text-xs text-sky-200">
                同一棵樹：前序 1 2 4 5 3 6；中序（append 移到兩個呼叫中間）4 2 5 1 6 3；後序（移到最後）4 5 2 6 3 1；層序 1 2 3 4 5 6。
              </div>
            )}
          </>
        );
      }}
    </TraceView>
  );
}
