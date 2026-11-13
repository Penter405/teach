// Animation 78: 樹 · 前序 / 中序 / 後序 / 層序 on the same tree
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, Note, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const STEPS = [
  '同一棵樹，四種走訪順序',
  '前序 node → left → right：1 2 4 5 3 6',
  '中序 left → node → right：4 2 5 1 6 3',
  '後序 left → right → node：4 5 2 6 3 1',
  '層序 一層一層：1 2 3 4 5 6',
];
const POS: Record<number, [number, number]> = { 1: [260, 30], 2: [150, 100], 3: [370, 100], 4: [90, 170], 5: [210, 170], 6: [310, 170] };
const EDGES: [number, number][] = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6]];
const ORDER = [[], [1, 2, 4, 5, 3, 6], [4, 2, 5, 1, 6, 3], [4, 5, 2, 6, 3, 1], [1, 2, 3, 4, 5, 6]];

export default function TraversalAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const order = ORDER[s];
  const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => {
    const v = +k, idx = order.indexOf(v);
    return { id: v, x, y, tone: idx === 0 ? 'active' : idx > 0 ? 'yes' : 'normal', above: idx >= 0 ? `第 ${idx + 1}` : undefined };
  });
  const edges: GEdge[] = EDGES.map(([a, b]) => ({ a, b }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="樹（上面的數字 = 第幾個被輸出）"><GraphView nodes={nodes} edges={edges} height={205} /></Stage>
        <Stage title="輸出順序">
          <div className="flex justify-center"><Seq items={order.map((v, i) => ({ v, tone: i === 0 ? 'active' : 'yes', top: i + 1 }))} empty="（選一種走訪）" /></div>
        </Stage>
        {s === 2 && <Note>中序：每個 node 都在「左子樹全部」和「右子樹全部」中間。BST 的中序就是排序好的。</Note>}
        {s === 3 && <Note>後序：root 一定在最後。要先知道子樹的答案才能算自己時（例如樹的高度）用後序。</Note>}
        {s === 4 && <Note>層序用 queue（BFS），前三種用遞迴（call stack）。</Note>}
      </AlgoBoard>
    </div>
  );
}
