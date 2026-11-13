// Animation 81: 樹 · 樹的直徑 — two BFS
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Note, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const STEPS = [
  '一棵樹：哪兩個點離最遠？',
  '第一次 BFS 從 0 出發：每個點標上距離，最遠的是 5（距離 4）→ A = 5',
  '第二次 BFS 從 A = 5 出發：最遠的是 6（距離 5）→ B = 6',
  '直徑 = 5：路徑 5 – 4 – 3 – 1 – 0 – 6',
];
const POS: Record<number, [number, number]> = { 6: [40, 70], 0: [130, 70], 1: [230, 70], 3: [330, 70], 4: [420, 70], 5: [510, 70], 2: [230, 160] };
const E: [number, number][] = [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [0, 6]];
const D0: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 1 };
const D5: Record<number, number> = { 5: 0, 4: 1, 3: 2, 1: 3, 0: 4, 2: 4, 6: 5 };
const PATH = [5, 4, 3, 1, 0, 6];

export default function DiameterAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const D = s === 1 ? D0 : s === 2 ? D5 : null;
  const start = s === 1 ? 0 : s === 2 ? 5 : -1;
  const far = s === 1 ? 5 : s === 2 ? 6 : -1;
  const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => {
    const v = +k;
    return {
      id: v, x, y,
      tone: v === start ? 'active' : v === far ? 'yes' : s === 3 && PATH.includes(v) ? 'yes' : 'normal',
      below: D ? `距離 ${D[v]}` : undefined,
      above: v === start ? '起點' : v === far ? '最遠' : s === 3 && (v === 5 || v === 6) ? (v === 5 ? 'A' : 'B') : undefined,
    };
  });
  const onPath = (a: number, b: number) => { const i = PATH.indexOf(a), j = PATH.indexOf(b); return i >= 0 && j >= 0 && Math.abs(i - j) === 1; };
  const edges: GEdge[] = E.map(([a, b]) => ({ a, b, tone: s === 3 && onPath(a, b) ? 'chosen' : 'normal' }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="樹"><GraphView nodes={nodes} edges={edges} width={560} height={200} /></Stage>
        {s === 1 && <Note>從哪裡出發都可以，走到最遠的那個點一定是直徑的一端。</Note>}
        {s === 3 && <Note tone="emerald">兩次 BFS，O(n)。不用每個點都 BFS 一次（O(n²)）。</Note>}
      </AlgoBoard>
    </div>
  );
}
