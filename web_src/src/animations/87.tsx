// Animation 87: 最小生成樹 · Prim — grow from A, always take the cheapest edge leaving the tree
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, VarRow, Note, type GNode, type GEdge } from '../animation_kit/AlgoKit';
import { W_POS, W_EDGES } from './83';

export const STEPS = [
  '從 A 開始：樹裡只有 A；候選邊 A–C (1)、A–B (4)',
  '最短的候選 A–C (1) → C 進樹；加入候選 C–B (2)、C–D (5)',
  '最短的候選 C–B (2) → B 進樹；加入候選 B–D (1)',
  '最短的候選 B–D (1) → D 進樹；加入候選 D–E (3)',
  '最短的候選 D–E (3) → E 進樹（A–B、C–D 兩端都在樹裡，不能用）',
  '5 個點都在樹裡：總權重 1 + 2 + 1 + 3 = 7',
];
const IN = [['A'], ['A', 'C'], ['A', 'C', 'B'], ['A', 'C', 'B', 'D'], ['A', 'C', 'B', 'D', 'E'], ['A', 'C', 'B', 'D', 'E']];
const TREE = [[], ['AC'], ['AC', 'CB'], ['AC', 'CB', 'BD'], ['AC', 'CB', 'BD', 'DE'], ['AC', 'CB', 'BD', 'DE']];
const CAND: [number, string][][] = [
  [[1, 'A–C'], [4, 'A–B']], [[2, 'C–B'], [4, 'A–B'], [5, 'C–D']], [[1, 'B–D'], [4, 'A–B'], [5, 'C–D']], [[3, 'D–E'], [4, 'A–B'], [5, 'C–D']], [[4, 'A–B'], [5, 'C–D']], [],
];
const NEW = ['A', 'C', 'B', 'D', 'E', ''];
const key = (a: string, b: string) => [a + b, b + a];

export default function PrimAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const inT = IN[s], tree = TREE[s];
  const nodes: GNode[] = Object.entries(W_POS).map(([k, [x, y]]) => ({ id: k, x, y, tone: k === NEW[s] ? 'active' : inT.includes(k) ? 'yes' : 'normal', [k === 'B' ? 'above' : 'below']: inT.includes(k) ? '在樹裡' : undefined }));
  const edges: GEdge[] = W_EDGES.map(([a, b, w]) => {
    const t = key(a, b).some((k) => tree.includes(k));
    const newest = s >= 1 && s <= 4 && key(a, b).includes(tree[tree.length - 1]);
    const both = inT.includes(a) && inT.includes(b);
    const cand = inT.includes(a) !== inT.includes(b);
    return { a, b, w, tone: newest ? 'active' : t ? 'chosen' : both ? 'dim' : cand ? 'normal' : 'dim' };
  });
  const total = [0, 1, 3, 4, 7, 7][s];
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: '樹裡的點', value: inT.join(' '), hot: s > 0 }, { name: '總權重', value: total, hot: s > 0 && s < 5 }]} />
        <Stage title="綠 = 樹；灰掉的邊兩端都在樹裡（用了會有環）"><GraphView nodes={nodes} edges={edges} width={600} height={260} /></Stage>
        <Stage title="候選邊（heap，左邊最小）">
          <Seq items={CAND[s].map(([w, e]) => {
            const [a, b] = e.split('–');
            const stale = inT.includes(a) && inT.includes(b);
            return { v: w, top: e, tone: stale ? 'no' : 'normal', struck: stale, bottom: stale ? '環' : undefined };
          })} />
        </Stage>
        {s === 4 && <Note>heap 裡的 A–B、C–D 取出來時會發現另一端已經在樹裡 → 跳過，和 Dijkstra 跳過舊資料一樣。</Note>}
        {s === 5 && <Note tone="emerald">和 Kruskal 選出來的邊一樣，總權重都是 7。</Note>}
      </AlgoBoard>
    </div>
  );
}
