// Animation 80: 圖 · 二分圖判定 — BFS two-coloring
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Note, type GNode, type GEdge, type CellTone } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：還沒塗色',
  '0 塗紅',
  '0 的鄰居 1、3 塗藍（和 0 相反）',
  '1 的鄰居 2 塗紅；3 的鄰居 0、2 檢查過，顏色都不同',
  '每條邊兩端顏色都不同 → 是二分圖（紅一組、藍一組）',
  '加一條 0 – 2：兩端都是紅 → 0 – 1 – 2 是奇數長度的環，不是二分圖',
];
const POS: Record<number, [number, number]> = { 0: [140, 45], 1: [380, 45], 2: [380, 205], 3: [140, 205] };
const COL: (CellTone | null)[][] = [
  [null, null, null, null], ['hit', null, null, null], ['hit', 'blue', null, 'blue'], ['hit', 'blue', 'hit', 'blue'], ['hit', 'blue', 'hit', 'blue'], ['hit', 'blue', 'hit', 'blue'],
];

export default function BipartiteAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const c = COL[s];
  const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => ({ id: +k, x, y, tone: c[+k] ?? 'normal', below: c[+k] === 'hit' ? '紅' : c[+k] === 'blue' ? '藍' : undefined }));
  const E: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], ...(s === 5 ? [[0, 2] as [number, number]] : [])];
  const edges: GEdge[] = E.map(([a, b]) => ({ a, b, tone: s === 5 && ((a === 0 && b === 2) || (a === 0 && b === 1) || (a === 1 && b === 2)) ? 'hit' : s === 4 ? 'chosen' : 'normal' }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="每條邊的兩端要不同色"><GraphView nodes={nodes} edges={edges} height={250} /></Stage>
        {s === 5 && <Note tone="rose">繞奇數條邊回到自己：顏色每走一步換一次，奇數步回來一定和自己不同色 → 矛盾。</Note>}
      </AlgoBoard>
    </div>
  );
}
