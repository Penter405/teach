// Animation 104: 割點 · Tarjan（tin / low）— one step = one action
import React from 'react';
import T from './trace/104';
import { TraceView, Stage, GraphView, Table2D, type GEdge, type CellTone } from '../animation_kit/AlgoKit';
import { arr, rwTone, posNodes, upTo, sameEdge } from '../animation_kit/AlgoHelpers';

const POS: Record<number, [number, number]> = { 0: [80, 80], 1: [260, 80], 2: [170, 200], 3: [420, 80] };
const EDGES: [number, number][] = [[0, 1], [0, 2], [1, 2], [1, 3]];
const IDS = [0, 1, 2, 3];

export default function ArticulationAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} hide={['g', 't']}>
      {(st, s) => {
        const tin = arr(st, 'tin');
        const low = arr(st, 'low');
        const cut = arr<boolean>(st, 'cut');
        const { u, v } = st.vars;
        const onStack = st.stack.map((f) => +f.args.u);
        // tree edges = every (parent, child) dfs call so far
        const tree = new Set<string>();
        upTo(T, s).forEach((x) => x.stack.forEach((f) => { if (+f.args.p !== -1) tree.add([+f.args.p, +f.args.u].sort().join('-')); }));
        const isTree = (a: number, b: number) => tree.has([a, b].sort().join('-'));
        const tone = (n: number): CellTone => (cut[n] ? 'hit' : n === u && onStack.length ? 'active' : onStack.includes(n) ? 'blue' : tin[n] >= 0 ? 'yes' : 'normal');
        const nodes = posNodes(POS, (n) => {
          const tag = cut[n] ? '割點' : n === u && onStack.length ? 'u' : n === v && onStack.length ? 'v' : undefined;
          const nums = tin[n] >= 0 ? `tin ${tin[n]} · low ${low[n]}` : '還沒走到';
          // node 2 sits below the others: its numbers go underneath, the top row's numbers go on top (edges run downwards)
          return n === 2 ? { tone: tone(n), above: tag, below: nums } : { tone: tone(n), above: nums, below: tag };
        });
        const edges: GEdge[] = EDGES.map(([a, b]) => {
          const now = onStack.length > 0 && v !== undefined && sameEdge(a, b, u, v);
          const back = !isTree(a, b) && tin[a] >= 0 && tin[b] >= 0;
          return { a, b, tone: now ? 'active' : isTree(a, b) ? 'chosen' : back ? 'hit' : 'normal' };
        });
        const row = (name: string, vals: (number | boolean)[]) => ({
          head: name,
          cells: IDS.map((i) => ({ v: typeof vals[i] === 'boolean' ? (vals[i] ? 'T' : 'F') : vals[i], tone: rwTone(st, name, [i], name === 'cut' && vals[i] ? 'hit' : 'normal') })),
        });
        return (
          <>
            <Stage title="圖（綠線 = DFS 走下去的邊、紅線 = 回頭的邊、藍 = 還在 call stack 上）">
              <GraphView nodes={nodes} edges={edges} width={500} height={240} />
            </Stage>
            <Stage title="tin（第幾個走到）、low（最早能碰到的 tin）">
              <Table2D corner="" colHeads={IDS.map((i) => `${i}`)} rows={[row('tin', tin), row('low', low), row('cut', cut)]} />
            </Stage>
          </>
        );
      }}
    </TraceView>
  );
}
