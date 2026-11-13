// Animation 86: 最小生成樹 · Kruskal — shortest edges first, skip the ones that close a cycle
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, VarRow, Note, type GNode, type GEdge, type CellTone } from '../animation_kit/AlgoKit';
import { W_POS } from './83';

export const STEPS = [
  '把邊由短到長排好；每個點自己一群',
  'A–C (1)：A、C 不同群 → 連上',
  'B–D (1)：不同群 → 連上',
  'C–B (2)：{A, C} 和 {B, D} 不同群 → 連上',
  'D–E (3)：不同群 → 連上，已經 4 條邊 = n − 1',
  'A–B (4)：A、B 已經同一群，連上會形成環 → 跳過',
  'C–D (5)：也會形成環 → 跳過。總權重 1 + 1 + 2 + 3 = 7',
];
const SORTED: [string, string, number][] = [['A', 'C', 1], ['B', 'D', 1], ['C', 'B', 2], ['D', 'E', 3], ['A', 'B', 4], ['C', 'D', 5]];
const GROUPS: Record<string, number>[] = [
  { A: 0, B: 1, C: 2, D: 3, E: 4 }, { A: 0, B: 1, C: 0, D: 3, E: 4 }, { A: 0, B: 1, C: 0, D: 1, E: 4 },
  { A: 0, B: 0, C: 0, D: 0, E: 4 }, { A: 0, B: 0, C: 0, D: 0, E: 0 }, { A: 0, B: 0, C: 0, D: 0, E: 0 }, { A: 0, B: 0, C: 0, D: 0, E: 0 },
];
const GTONE: CellTone[] = ['yes', 'blue', 'normal', 'normal', 'normal'];

export default function KruskalAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const g = GROUPS[s];
  const taken = SORTED.slice(0, Math.min(s, 4));
  const curE = s >= 1 ? SORTED[s - 1] : null;
  const skip = s >= 5;
  const size: Record<number, number> = {};
  Object.values(g).forEach((x) => (size[x] = (size[x] ?? 0) + 1));
  const nodes: GNode[] = Object.entries(W_POS).map(([k, [x, y]]) => ({
    id: k, x, y, tone: curE && (curE[0] === k || curE[1] === k) ? (skip ? 'hit' : 'active') : size[g[k]] > 1 ? GTONE[g[k]] : 'normal', [k === 'B' ? 'above' : 'below']: `群 ${'ABCDE'[g[k]]}`,
  }));
  const isE = (e: [string, string, number], a: string, b: string) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a);
  const edges: GEdge[] = SORTED.map(([a, b, w]) => ({
    a, b, w,
    tone: curE && isE(curE, a, b) ? (skip ? 'hit' : 'active') : taken.some((e) => isE(e, a, b)) ? 'chosen' : SORTED.slice(4, Math.max(4, s - 1)).some((e) => isE(e, a, b)) ? 'dim' : 'normal',
  }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: '已選幾條', value: taken.length, hot: s >= 1 && s <= 4 }, { name: '總權重', value: taken.reduce((a, e) => a + e[2], 0), hot: s >= 1 && s <= 4 }]} />
        <Stage title="綠線 = 已選的邊；點下面是它屬於哪一群（並查集的 root）"><GraphView nodes={nodes} edges={edges} width={600} height={260} /></Stage>
        <Stage title="邊（由短到長）">
          <div className="flex justify-center">
            <Seq items={SORTED.map(([a, b, w], i) => ({ v: w, top: `${a}–${b}`, tone: i === s - 1 ? (skip ? 'hit' : 'active') : i < Math.min(s, 4) ? 'yes' : i < s - 1 ? 'no' : 'normal', struck: i >= 4 && i < s, bottom: i < 4 && i < s ? '選' : i >= 4 && i < s ? '環' : undefined }))} />
          </div>
        </Stage>
        {s === 5 && <Note tone="rose">find(A) == find(B)：已經連通了，再連就是環。這就是 union 回傳 False。</Note>}
      </AlgoBoard>
    </div>
  );
}
