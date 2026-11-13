// Animation 82: DP · 環 DP — one step = one action
import React from 'react';
import T from './trace/82';
import { TraceView, Stage, GraphView, Seq, Split, type GNode, type GEdge, type CellTone } from '../animation_kit/AlgoKit';

const POS: Record<number, [number, number]> = { 4: [70, 60], 3: [230, 60], 2: [400, 130], 1: [240, 200] };
const NXT: Record<number, number> = { 4: 3, 3: 2, 2: 1, 1: 2 };
export default function CycleDpAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const state: number[] = st.vars.state ?? [0, 0, 0, 0, 0];
        const ans: number[] = st.vars.ans ?? [0, 0, 0, 0, 0];
        const path: number[] = st.vars.path ?? [];
        const { u, x } = st.vars;
        const tone = (n: number): CellTone => (n === x || n === u ? 'active' : state[n] === 2 ? 'yes' : state[n] === 1 ? 'hit' : 'normal');
        const nodes: GNode[] = Object.entries(POS).map(([k, [px, py]]) => {
          const n = +k;
          return { id: n, x: px, y: py, tone: tone(n), above: state[n] === 1 ? '走到一半' : state[n] === 2 ? `ans ${ans[n]}` : undefined, below: n === u ? 'u' : n === x ? 'x' : undefined };
        });
        const edges: GEdge[] = Object.entries(NXT).map(([a, b]) => ({ a: +a, b, directed: true, tone: +a === u ? 'active' : 'normal' }));
        return (
          <>
            <Stage title="紅 = 走到一半；綠 = 完成"><GraphView nodes={nodes} edges={edges} width={480} height={240} /></Stage>
            <Split>
              <Stage title="path（這次走過、還沒填答案的點）"><Seq items={path.map((n) => ({ v: n, tone: 'hit' }))} empty="（空）" /></Stage>
              <Stage title="ans"><Seq items={[1, 2, 3, 4].map((n) => ({ v: ans[n], top: `[${n}]`, tone: tone(n) }))} /></Stage>
            </Split>
          </>
        );
      }}
    </TraceView>
  );
}
