// Animation 54: 資料結構 · heap — push 5, 3, 8, 1 then pop (上浮 / 下沉)
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, VarRow, Note, Split, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：heap 是空的',
  'push 5：放在最後（index 0）',
  'push 3：放在 index 1，比父節點 5 小 → 上浮交換',
  'push 8：放在 index 2，比父節點 3 大 → 不用動',
  'push 1：先放在最後（index 3）',
  '上浮：1 比父節點 5 小 → 交換',
  '上浮：1 比父節點 3 小 → 交換，1 到頂端',
  'pop：拿走頂端的 1，最後一個 5 搬到頂端',
  '下沉：5 比子節點 3 大 → 和比較小的子節點 3 交換，完成',
];
const H = [[], [5], [3, 5], [3, 5, 8], [3, 5, 8, 1], [3, 1, 8, 5], [1, 3, 8, 5], [5, 3, 8], [3, 5, 8]];
const HOT = [[], [0], [0, 1], [2], [3], [1, 3], [0, 1], [0], [0, 1]];
const POS = [[260, 30], [160, 100], [360, 100], [100, 170]];

export default function HeapAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const h = H[s], hot = HOT[s];
  const nodes: GNode[] = h.map((v, i) => ({ id: i, x: POS[i][0], y: POS[i][1], label: v, tone: hot.includes(i) ? 'active' : 'normal', above: `[${i}]` }));
  const edges: GEdge[] = h.slice(1).map((_, k) => {
    const i = k + 1, p = (i - 1) >> 1;
    return { a: p, b: i, tone: hot.includes(i) && hot.includes(p) ? 'active' : 'normal' };
  });
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: 'h[0]（最小）', value: h.length ? h[0] : '—', hot: s === 6 || s === 8 }, { name: '拿出來的', value: s >= 7 ? 1 : '—', hot: s === 7 }]} />
        <Split>
          <Stage title="樹的樣子（父 ≤ 子）"><GraphView nodes={nodes} edges={edges} height={205} width={460} /></Stage>
          <Stage title="實際存的 list">
            <div className="flex h-full items-center justify-center">
              <Seq items={h.map((v, i) => ({ v, tone: hot.includes(i) ? 'active' : 'normal', top: `[${i}]` }))} />
            </div>
          </Stage>
        </Split>
        {s === 6 && <Note tone="emerald">最小的一路往上換到 index 0：最多換「樹的高度」次 = O(log n)。</Note>}
        {s === 8 && <Note>下沉時要和「比較小」的子節點交換，換上來的才會 ≤ 另一個子節點。</Note>}
      </AlgoBoard>
    </div>
  );
}
