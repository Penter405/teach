// Animation 86: 最小生成樹 · Kruskal — one step = one action
import React from 'react';
import T from './trace/86';
import { TraceView, Stage, GraphView, Seq, type GNode, type GEdge } from '../animation_kit/AlgoKit';
import { W_POS, NAME } from './83';

export default function KruskalAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} hide={['total']}>
      {(st, s) => {
        const edges: [number, number, number][] = st.vars.edges ?? [];
        const par: number[] = st.vars.PARENT ?? [0, 1, 2, 3];
        const { u, v } = st.vars;
        const chosen: string[] = [];
        T.steps.slice(0, s + 1).forEach((x) => { if (x.kind === 'assign' && x.ref?.[0] === 'PARENT') chosen.push(`${x.vars.u}-${x.vars.v}`); });
        const skipped: string[] = [];
        T.steps.slice(0, s + 1).forEach((x) => { if (x.kind === 'continue') skipped.push(`${x.vars.u}-${x.vars.v}`); });
        const root = (x: number) => { while (par[x] !== x) x = par[x]; return x; };
        const key = (a: number, b: number) => `${a}-${b}`;
        const nodes: GNode[] = Object.entries(W_POS).map(([k, [x, y]]) => {
          const n = +k;
          return { id: n, x, y, label: NAME[n], tone: n === u || n === v ? 'active' : 'normal', [n === 1 ? 'above' : 'below']: `群 ${NAME[root(n)]}` } as GNode;
        });
        const gEdges: GEdge[] = edges.map(([w, a, b]) => ({ a, b, w, tone: a === u && b === v ? (skipped.includes(key(a, b)) ? 'hit' : 'active') : chosen.includes(key(a, b)) ? 'chosen' : skipped.includes(key(a, b)) ? 'dim' : 'normal' }));
        return (
          <>
            <Stage title="綠線 = 選了；點下面 = 屬於哪一群（root）"><GraphView nodes={nodes} edges={gEdges} width={520} height={260} /></Stage>
            <Stage title={`邊（由短到長）　總權重 total = ${st.vars.total ?? 0}`}>
              <div className="flex justify-center">
                <Seq items={edges.map(([w, a, b]) => ({ v: w, top: `${NAME[a]}–${NAME[b]}`, tone: a === u && b === v ? 'active' : chosen.includes(key(a, b)) ? 'yes' : skipped.includes(key(a, b)) ? 'no' : 'normal', struck: skipped.includes(key(a, b)), bottom: chosen.includes(key(a, b)) ? '選' : skipped.includes(key(a, b)) ? '環' : undefined }))} />
              </div>
            </Stage>
          </>
        );
      }}
    </TraceView>
  );
}
