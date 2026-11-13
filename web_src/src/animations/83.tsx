// Animation 83: 最短路徑 · Dijkstra — settle the closest, relax its neighbours, skip stale heap entries
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, Note, Split, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：dist[A] = 0，其他 = ∞；heap = [(0, A)]',
  '取出 (0, A) → A 確定。鬆弛：B = 4、C = 1',
  '取出 (1, C) → C 確定。鬆弛：B 從 4 變 1 + 2 = 3、D = 1 + 5 = 6',
  '取出 (3, B) → B 確定。鬆弛：D 從 6 變 3 + 1 = 4',
  '取出 (4, B)：B 早就確定了（4 > dist[B] = 3）→ 跳過',
  '取出 (4, D) → D 確定。鬆弛：E = 4 + 3 = 7',
  '取出 (6, D)：舊的資料 → 跳過',
  '取出 (7, E) → E 確定，heap 空了：A0 B3 C1 D4 E7',
];
export const W_POS: Record<string, [number, number]> = { A: [60, 130], B: [240, 40], C: [240, 220], D: [420, 130], E: [540, 130] };
export const W_EDGES: [string, string, number][] = [['A', 'B', 4], ['A', 'C', 1], ['C', 'B', 2], ['B', 'D', 1], ['C', 'D', 5], ['D', 'E', 3]];
type Fr = { dist: Record<string, number>; done: string[]; heap: [number, string][]; cur?: string; stale?: boolean; relax: string[]; par: Record<string, string> };
const INF = Infinity;
const F: Fr[] = [
  { dist: { A: 0, B: INF, C: INF, D: INF, E: INF }, done: [], heap: [[0, 'A']], relax: [], par: {} },
  { dist: { A: 0, B: 4, C: 1, D: INF, E: INF }, done: ['A'], heap: [[1, 'C'], [4, 'B']], cur: 'A', relax: ['AB', 'AC'], par: { B: 'A', C: 'A' } },
  { dist: { A: 0, B: 3, C: 1, D: 6, E: INF }, done: ['A', 'C'], heap: [[3, 'B'], [4, 'B'], [6, 'D']], cur: 'C', relax: ['CB', 'CD'], par: { B: 'C', C: 'A', D: 'C' } },
  { dist: { A: 0, B: 3, C: 1, D: 4, E: INF }, done: ['A', 'C', 'B'], heap: [[4, 'B'], [4, 'D'], [6, 'D']], cur: 'B', relax: ['BD'], par: { B: 'C', C: 'A', D: 'B' } },
  { dist: { A: 0, B: 3, C: 1, D: 4, E: INF }, done: ['A', 'C', 'B'], heap: [[4, 'D'], [6, 'D']], cur: 'B', stale: true, relax: [], par: { B: 'C', C: 'A', D: 'B' } },
  { dist: { A: 0, B: 3, C: 1, D: 4, E: 7 }, done: ['A', 'C', 'B', 'D'], heap: [[6, 'D'], [7, 'E']], cur: 'D', relax: ['DE'], par: { B: 'C', C: 'A', D: 'B', E: 'D' } },
  { dist: { A: 0, B: 3, C: 1, D: 4, E: 7 }, done: ['A', 'C', 'B', 'D'], heap: [[7, 'E']], cur: 'D', stale: true, relax: [], par: { B: 'C', C: 'A', D: 'B', E: 'D' } },
  { dist: { A: 0, B: 3, C: 1, D: 4, E: 7 }, done: ['A', 'C', 'B', 'D', 'E'], heap: [], cur: 'E', relax: [], par: { B: 'C', C: 'A', D: 'B', E: 'D' } },
];
const has = (list: string[], a: string, b: string) => list.includes(a + b) || list.includes(b + a);

export default function DijkstraAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const f = F[s];
  const nodes: GNode[] = Object.entries(W_POS).map(([k, [x, y]]) => ({
    id: k, x, y,
    tone: k === f.cur ? (f.stale ? 'hit' : 'active') : f.done.includes(k) ? 'yes' : f.dist[k] < INF ? 'blue' : 'normal',
    ...(k === 'B' ? { above: f.dist[k] === INF ? '∞' : `dist ${f.dist[k]}` } : { below: f.dist[k] === INF ? '∞' : `dist ${f.dist[k]}` }),
  }));
  const edges: GEdge[] = W_EDGES.map(([a, b, w]) => ({
    a, b, w,
    tone: has(f.relax, a, b) ? 'active' : (f.par[b] === a && f.done.includes(b)) || (f.par[a] === b && f.done.includes(a)) ? 'chosen' : 'normal',
  }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="綠 = 已確定；藍 = 有距離但還沒確定；黃線 = 這一步鬆弛的邊"><GraphView nodes={nodes} edges={edges} width={600} height={260} /></Stage>
        <Split>
          <Stage title="heap（左邊最小，下一個被取出）">
            <Seq items={f.heap.map(([d, v]) => ({ v: `${d},${v}`, tone: f.dist[v] < d ? 'no' : 'normal', bottom: f.dist[v] < d ? '舊的' : undefined }))} />
          </Stage>
          <Stage title="已確定的順序"><Seq items={f.done.map((v) => ({ v, tone: 'yes', bottom: f.dist[v] }))} /></Stage>
        </Split>
        {s === 2 && <Note>B 從 A 直接走要 4，繞 C 只要 3：「鬆弛」就是發現更短的路就更新。</Note>}
        {s === 4 && <Note tone="rose">B 變短時又放了一次 (3, B)，舊的 (4, B) 還留在 heap 裡：取出來時檢查 d &gt; dist[B] 就跳過。</Note>}
      </AlgoBoard>
    </div>
  );
}
