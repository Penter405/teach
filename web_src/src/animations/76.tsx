// Animation 76: 圖 · BFS — queue, rings of distance
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, Note, Split, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：dist[0] = 0，queue = [0]',
  '取出 0：鄰居 1、2 第一次走到 → 距離 1，放進 queue',
  '取出 1：鄰居 3、4 → 距離 2',
  '取出 2：鄰居 5 → 距離 2',
  '取出 3：沒有新的鄰居',
  '取出 4：鄰居 6 → 距離 3',
  '取出 5：6 已經走過了 → 跳過',
  '取出 6：queue 空了，結束',
];
export const G_POS: Record<number, [number, number]> = { 0: [260, 30], 1: [160, 100], 2: [360, 100], 3: [90, 175], 4: [230, 175], 5: [400, 175], 6: [315, 245] };
export const G_EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [4, 6], [5, 6]];
const ADJ: number[][] = Object.keys(G_POS).map((k) => G_EDGES.flatMap(([a, b]) => (a === +k ? [b] : b === +k ? [a] : [])).sort((x, y) => x - y));

function run(k: number) {
  const dist: number[] = Array(7).fill(-1);
  const par: number[] = Array(7).fill(-1);
  dist[0] = 0;
  const q = [0];
  let cur = -1, added: number[] = [], skipped: number[] = [];
  for (let t = 0; t < k && q.length; t++) {
    cur = q.shift()!; added = []; skipped = [];
    for (const v of ADJ[cur]) {
      if (dist[v] === -1) { dist[v] = dist[cur] + 1; par[v] = cur; q.push(v); added.push(v); }
      else if (v !== par[cur]) skipped.push(v);
    }
  }
  return { dist, par, q, cur, added, skipped };
}

export default function BfsAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const { dist, par, q, cur, added, skipped } = run(s);
  const nodes: GNode[] = Object.entries(G_POS).map(([k, [x, y]]) => {
    const v = +k;
    return { id: v, x, y, tone: v === cur ? 'active' : added.includes(v) ? 'blue' : dist[v] >= 0 ? 'yes' : 'normal', below: dist[v] >= 0 ? `距離 ${dist[v]}` : undefined };
  });
  const edges: GEdge[] = G_EDGES.map(([a, b]) => ({
    a, b,
    tone: (a === cur && added.includes(b)) || (b === cur && added.includes(a)) ? 'active' : (a === cur && skipped.includes(b)) || (b === cur && skipped.includes(a)) ? 'hit' : par[b] === a || par[a] === b ? 'chosen' : 'normal',
  }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="圖（綠 = 已經知道距離；藍 = 這一步放進 queue）"><GraphView nodes={nodes} edges={edges} height={275} /></Stage>
        <Split>
          <Stage title="queue（左邊先出）"><Seq left="出" right="進" items={q.map((v) => ({ v, tone: added.includes(v) ? 'blue' : 'normal', bottom: `距離 ${dist[v]}` }))} /></Stage>
          <Stage title="dist"><Seq size="sm" items={dist.map((d, i) => ({ v: d, tone: d < 0 ? 'dim' : added.includes(i) ? 'blue' : 'normal', top: `[${i}]` }))} /></Stage>
        </Split>
        {s === 2 && <Note>queue 裡永遠是「距離 d 的都在距離 d+1 的前面」，所以一圈一圈往外。</Note>}
        {s === 6 && <Note tone="rose">6 在放進 queue 時就標記了，所以不會被放進去第二次。</Note>}
      </AlgoBoard>
    </div>
  );
}
