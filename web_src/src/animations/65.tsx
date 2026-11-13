// Animation 65: DP · 記憶化 fib(5) — the recursion tree gets cut
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, VarRow, Note, type GNode, type GEdge, type CellTone } from '../animation_kit/AlgoKit';

export const STEPS = [
  '沒有記憶化：fib(5) 要呼叫 15 次，紅色的都是算過的 argument 又算一次',
  '有記憶化：一路往左算到 fib(2) = 1，存進 memo',
  'fib(3) = fib(2) + fib(1) = 2，存進 memo',
  'fib(4) 要 fib(2)：memo 裡有 → 直接拿，下面整枝剪掉',
  'fib(4) = 2 + 1 = 3，存進 memo',
  'fib(5) 要 fib(3)：memo 裡有 → 直接拿，下面整枝剪掉',
  'fib(5) = 3 + 2 = 5：只呼叫 9 次（原本 15 次）',
];
type T = { id: string; n: number };
const all: T[] = [];
const kids: Record<string, string[]> = {};
(function build(id: string, n: number) {
  all.push({ id, n });
  kids[id] = [];
  if (n >= 2) { kids[id] = [id + '0', id + '1']; build(id + '0', n - 1); build(id + '1', n - 2); }
})('r', 5);
// layout: leaves left to right
const pos: Record<string, [number, number]> = {};
let leaf = 0;
(function place(id: string, d: number): number {
  if (!kids[id].length) { pos[id] = [leaf++, d]; return pos[id][0]; }
  const xs = kids[id].map((k) => place(k, d + 1));
  pos[id] = [(xs[0] + xs[1]) / 2, d];
  return pos[id][0];
})('r', 0);
const X = (id: string) => 30 + (pos[id][0] / (leaf - 1)) * 520;
const Y = (id: string) => 22 + pos[id][1] * 54;
const firstSeen = new Set<number>();
const repeated = new Set<string>();
// preorder: a node is "repeated" if its argument was already computed earlier in the plain recursion
(function pre(id: string) {
  const n = all.find((t) => t.id === id)!.n;
  if (firstSeen.has(n) && n >= 2) repeated.add(id); else firstSeen.add(n);
  kids[id].forEach(pre);
})('r');
const CALLED = [[], ['r', 'r0', 'r00', 'r000', 'r0000', 'r0001'], ['r001'], ['r01'], [], ['r1'], []];
const CUR = ['', 'r000', 'r00', 'r01', 'r0', 'r1', 'r'];
const MEMO = [{}, { 2: 1 }, { 2: 1, 3: 2 }, { 2: 1, 3: 2 }, { 2: 1, 3: 2, 4: 3 }, { 2: 1, 3: 2, 4: 3 }, { 2: 1, 3: 2, 4: 3, 5: 5 }] as Record<number, number>[];

export default function MemoAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const called = new Set(CALLED.slice(0, s + 1).flat());
  const hits = new Set(s >= 5 ? ['r01', 'r1'] : s >= 3 ? ['r01'] : []);
  const pruned = (id: string) => [...hits].some((h) => id.startsWith(h) && id !== h);
  const tone = (id: string, n: number): CellTone => {
    if (s === 0) return repeated.has(id) || [...repeated].some((r) => id.startsWith(r)) ? 'hit' : 'normal';
    if (id === CUR[s]) return 'active';
    if (hits.has(id)) return 'blue';
    if (pruned(id)) return 'dim';
    return called.has(id) ? 'yes' : 'normal';
  };
  const nodes: GNode[] = all.map(({ id, n }) => ({ id, x: X(id), y: Y(id), label: n, tone: tone(id, n), below: s > 0 && hits.has(id) ? 'memo' : undefined }));
  const edges: GEdge[] = all.flatMap(({ id }) => kids[id].map((k) => ({ a: id, b: k, tone: s > 0 && pruned(k) ? 'dim' : 'normal' } as GEdge)));
  const calls = s === 0 ? 15 : called.size;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: '呼叫次數', value: calls, hot: true }]} />
        <Stage title={s === 0 ? '遞迴樹（節點上的數字 = argument n）' : '綠 = 算過；藍 = 從 memo 拿；灰 = 被剪掉，不用呼叫'}>
          <GraphView nodes={nodes} edges={edges} width={580} height={262} r={15} />
        </Stage>
        <Stage title="memo">
          <Seq items={Object.entries(MEMO[s]).map(([k, v]) => ({ v, top: `fib(${k})`, tone: +k === all.find((t) => t.id === CUR[s])?.n ? 'active' : 'yes' }))} empty="（空的）" />
        </Stage>
        {s === 6 && <Note tone="emerald">不同的 argument 只有 6 個（0～5），每個只算一次：時間從 O(2ⁿ) 變成 O(n)。</Note>}
      </AlgoBoard>
    </div>
  );
}
