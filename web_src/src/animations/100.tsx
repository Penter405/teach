// Animation 100: 特殊郵件 · 遞迴 DFS — one step = one action
// color[i]: -1 沒走過、>= 0 這一輪正在走（第幾層）、-2 走完；vis[i] = 答案（0 = 還沒算）
import React from 'react';
import T from './trace/100';
import { TraceView, Stage, GraphView, Seq, Split, type GEdge, type CellTone } from '../animation_kit/AlgoKit';
import { arr, rwTone, posNodes } from '../animation_kit/AlgoHelpers';

const POS: Record<number, [number, number]> = { 3: [80, 165], 1: [200, 80], 2: [420, 80] };
const NXT: Record<number, number> = { 1: 2, 2: 1, 3: 1 };
const IDS = [1, 2, 3];

export default function SpecialMailDfsAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} hide={['n']}>
      {(st) => {
        const vis = arr(st, 'vis');
        const color = arr(st, 'color');
        const { node, cycle, st: start } = st.vars;
        const path = st.stack.map((f) => +f.args.node);   // the chain of dfs calls = the mail's route so far
        // nodes of the cycle that was just found: from st along nxt back to st
        const ring: number[] = [];
        if (cycle) { let u = start as number; do { ring.push(u); u = NXT[u]; } while (u !== start && ring.length < 4); }
        const tone = (n: number): CellTone => (n === node && path.length ? 'active' : color[n] >= 0 ? 'blue' : vis[n] > 0 ? 'yes' : 'normal');
        const nodes = posNodes(POS, (n) => ({
          tone: tone(n),
          above: color[n] >= 0 ? `第 ${color[n]} 層` : vis[n] > 0 ? `vis = ${vis[n]}` : undefined,
          below: [n === node && path.length ? 'node' : '', cycle && n === start ? 'st（環的起點）' : ''].filter(Boolean).join('、') || undefined,
        }));
        const onPath = (a: number, b: number) => path.some((x, k) => x === a && path[k + 1] === b);
        const edges: GEdge[] = Object.entries(NXT).map(([a, b]) => {
          const A = +a;
          const following = A === node && st.line === 10 && path.length > 0;
          const inRing = ring.includes(A) && ring.includes(b);
          return { a: A, b, directed: true, bend: A === 3 ? 0 : 12, tone: inRing ? 'hit' : following ? 'active' : onPath(A, b) ? 'chosen' : 'normal' };
        });
        return (
          <>
            <Stage title="誰寄給誰（藍 = 這一輪正在走，上面是第幾層；綠 = vis 算好了；紅線 = 找到的環）">
              <GraphView nodes={nodes} edges={edges} width={500} height={210} />
            </Stage>
            <Split>
              <Stage title="vis：從這個人開始，有幾個人收到">
                <Seq size="sm" items={IDS.map((i) => ({ v: vis[i], top: `[${i}]`, tone: rwTone(st, 'vis', [i], vis[i] > 0 ? 'yes' : 'dim') }))} />
              </Stage>
              <Stage title="color：-1 沒走過、≥ 0 第幾層、-2 走完">
                <Seq size="sm" items={IDS.map((i) => ({ v: color[i], top: `[${i}]`, tone: rwTone(st, 'color', [i], color[i] >= 0 ? 'blue' : color[i] === -2 ? 'no' : 'dim') }))} />
              </Stage>
            </Split>
          </>
        );
      }}
    </TraceView>
  );
}
