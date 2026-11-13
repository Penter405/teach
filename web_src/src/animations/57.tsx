// Animation 57: 資料結構 · 並查集 — one step = one action
import React from 'react';
import T from './trace/57';
import { TraceView, Stage, GraphView, Seq, touches, type GNode, type GEdge } from '../animation_kit/AlgoKit';

function layout(par: number[]) {
  const kids: number[][] = par.map(() => []);
  par.forEach((p, i) => p !== i && kids[p].push(i));
  const pos: Record<number, [number, number]> = {};
  let x = 0;
  const place = (u: number, d: number): number => {
    if (!kids[u].length) { pos[u] = [x++, d]; return pos[u][0]; }
    const xs = kids[u].map((c) => place(c, d + 1));
    pos[u] = [(xs[0] + xs[xs.length - 1]) / 2, d];
    return pos[u][0];
  };
  par.forEach((p, i) => p === i && place(i, 0));
  const span = Math.max(1, x - 1);
  return (i: number) => [40 + (pos[i][0] / span) * 440, 35 + pos[i][1] * 70] as const;
}

export default function UnionFindAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const par: number[] = st.vars.parent ?? [0, 1, 2, 3, 4, 5];
        const at = layout(par);
        const hot = (i: number) => touches(st, 'parent', i);
        const nodes: GNode[] = par.map((p, i) => {
          const [x, y] = at(i);
          return { id: i, x, y, tone: hot(i) ? (st.kind === 'assign' ? 'hit' : 'active') : i === st.vars.x ? 'blue' : p === i ? 'yes' : 'normal', above: p === i ? 'root' : undefined };
        });
        const edges: GEdge[] = par.flatMap((p, i) => (p === i ? [] : [{ a: i, b: p, directed: true, tone: hot(i) ? 'active' : 'normal' } as GEdge]));
        return (
          <>
            <Stage title="森林（箭頭指向 parent；綠 = root）"><GraphView nodes={nodes} edges={edges} height={200} /></Stage>
            <Stage title="parent 陣列">
              <div className="flex justify-center"><Seq items={par.map((p, i) => ({ v: p, top: `[${i}]`, tone: hot(i) ? (st.kind === 'assign' ? 'hit' : 'active') : p === i ? 'yes' : 'normal' }))} /></div>
            </Stage>
          </>
        );
      }}
    </TraceView>
  );
}
