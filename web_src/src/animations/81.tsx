// Animation 81: 樹 · 樹的直徑 — one step = one action
import React from 'react';
import T from './trace/81';
import { TraceView, Stage, GraphView, type GNode, type GEdge } from '../animation_kit/AlgoKit';

const POS: Record<number, [number, number]> = { 6: [40, 70], 0: [130, 70], 1: [230, 70], 3: [330, 70], 4: [420, 70], 5: [510, 70], 2: [230, 160] };
const E: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [0, 6]];
const D0: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 1 };
const D5: Record<number, number> = { 5: 0, 4: 1, 3: 2, 1: 3, 0: 4, 2: 4, 6: 5 };
const PATH = [5, 4, 3, 1, 0, 6];
export default function DiameterAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const { A, B } = st.vars;
        const D = B !== undefined ? D5 : A !== undefined ? D0 : null;
        const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => {
          const n = +k;
          return { id: n, x, y, tone: n === A || n === B ? 'yes' : (B === undefined && A === undefined && n === 0 && st.kind === 'call') ? 'active' : 'normal', below: D ? `距離 ${D[n]}` : undefined, above: n === A ? 'A' : n === B ? 'B' : undefined };
        });
        const onPath = (a: number, b: number) => { const i = PATH.indexOf(a), j = PATH.indexOf(b); return B !== undefined && i >= 0 && j >= 0 && Math.abs(i - j) === 1; };
        const edges: GEdge[] = E.map(([a, b]) => ({ a, b, tone: onPath(a, b) ? 'chosen' : 'normal' }));
        return <Stage title={B !== undefined ? '從 A 出發的距離；綠線 = 直徑' : A !== undefined ? '從 0 出發的距離' : '樹'}><GraphView nodes={nodes} edges={edges} width={560} height={200} /></Stage>;
      }}
    </TraceView>
  );
}
