// Animation 57: 資料結構 · 並查集 — union and find with path compression
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, Note, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：每個點自己一群，parent[i] = i',
  'union(0, 1)：root 0 和 root 1 不同 → parent[1] = 0',
  'union(2, 3)：parent[3] = 2',
  'union(1, 3)：find(1) = 0、find(3) = 2，不同群 → parent[2] = 0',
  'union(4, 5)：parent[5] = 4',
  'find(3)：3 → 2 → 0，root 是 0',
  '路徑壓縮：parent[3] 直接改成 0，下次 find(3) 只要一步',
];
const PAR = [[0, 1, 2, 3, 4, 5], [0, 0, 2, 3, 4, 5], [0, 0, 2, 2, 4, 5], [0, 0, 0, 2, 4, 5], [0, 0, 0, 2, 4, 4], [0, 0, 0, 2, 4, 4], [0, 0, 0, 0, 4, 4]];
const CHANGED = [-1, 1, 3, 2, 5, -1, 3];
const PATH: Record<number, number[]> = { 5: [3, 2, 0], 6: [3, 0] };

/** lay out the forest: leaves get consecutive x, parents sit over their children */
function layout(par: number[]) {
  const kids: number[][] = par.map(() => []);
  par.forEach((p, i) => p !== i && kids[p].push(i));
  const pos: Record<number, [number, number]> = {};
  let x = 0;
  const place = (u: number, d: number): number => {
    if (!kids[u].length) { pos[u] = [x++, d]; return pos[u][0]; }
    const xs = kids[u].map((c) => place(c, d + 1));
    pos[u] = [(xs[0] + xs[xs.length - 1]) / 2, d];
    return pos[u][0];
  };
  par.forEach((p, i) => p === i && place(i, 0));
  const span = Math.max(1, x - 1);
  return (i: number) => [40 + (pos[i][0] / span) * 440, 35 + pos[i][1] * 70] as const;
}

export default function UnionFindAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const par = PAR[s];
  const at = layout(par);
  const path = PATH[s] ?? [];
  const nodes: GNode[] = par.map((p, i) => {
    const [x, y] = at(i);
    return { id: i, x, y, tone: path.includes(i) ? (i === 0 ? 'yes' : 'active') : i === CHANGED[s] ? 'active' : p === i ? 'yes' : 'normal', above: p === i ? 'root' : undefined };
  });
  const edges: GEdge[] = par.flatMap((p, i) => (p === i ? [] : [{ a: i, b: p, directed: true, tone: i === CHANGED[s] ? 'active' : path.includes(i) && path.includes(p) ? 'active' : 'normal' } as GEdge]));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="森林（箭頭指向 parent；綠色 = root）"><GraphView nodes={nodes} edges={edges} height={200} /></Stage>
        <Stage title="parent 陣列（整個並查集只存這個）">
          <div className="flex justify-center">
            <Seq items={par.map((p, i) => ({ v: p, tone: i === CHANGED[s] ? 'active' : path.includes(i) ? 'active' : p === i ? 'yes' : 'normal', top: `[${i}]` }))} />
          </div>
        </Stage>
        {s === 3 && <Note>是把 root 2 接到 root 0 底下，不是把 3 接到 1：合併的永遠是兩個 root。</Note>}
        {s === 6 && <Note tone="emerald">路徑壓縮讓樹越用越扁，之後幾乎每次 find 都是一步。</Note>}
      </AlgoBoard>
    </div>
  );
}
