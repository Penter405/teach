// Animation 82: DP · 環 DP (functional graph) — 4 → 3 → 2 → 1 → 2
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, Note, type GNode, type GEdge, type CellTone } from '../animation_kit/AlgoKit';

export const STEPS = [
  '每個點只有一條出去的邊：4 → 3 → 2 → 1 → 2',
  '從 4 出發，一路標「走到一半」：4、3、2、1，下一步又走到 2',
  '2 還在這條路上 → 找到環 [2, 1]：環上的點答案 = 環長 = 2',
  '往回填：3 的答案 = 1 + ans[2] = 3',
  '4 的答案 = 1 + ans[3] = 4（= 1 + 1 + 2）',
  '之後從別的點出發，碰到「完成」的點就直接用答案：每個點只算一次',
];
const POS: Record<number, [number, number]> = { 4: [70, 60], 3: [230, 60], 2: [400, 130], 1: [240, 200] };
const NXT: Record<number, number> = { 4: 3, 3: 2, 2: 1, 1: 2 };
const ANS: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 4 };
// 0 none, 1 visiting, 2 done
const ST: Record<number, number>[] = [
  { 1: 0, 2: 0, 3: 0, 4: 0 }, { 1: 1, 2: 1, 3: 1, 4: 1 }, { 1: 2, 2: 2, 3: 1, 4: 1 }, { 1: 2, 2: 2, 3: 2, 4: 1 }, { 1: 2, 2: 2, 3: 2, 4: 2 }, { 1: 2, 2: 2, 3: 2, 4: 2 },
];
const CUR = [-1, 2, -1, 3, 4, -1];

export default function CycleDpAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const st = ST[s];
  const inCycle = (v: number) => s >= 2 && (v === 1 || v === 2);
  const tone = (v: number): CellTone => (v === CUR[s] ? 'active' : st[v] === 2 ? (inCycle(v) ? 'blue' : 'yes') : st[v] === 1 ? 'hit' : 'normal');
  const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => {
    const v = +k;
    return { id: v, x, y, tone: tone(v), above: st[v] === 1 ? '走到一半' : st[v] === 2 ? `ans ${ANS[v]}` : undefined };
  });
  const edges: GEdge[] = Object.entries(NXT).map(([a, b]) => ({ a: +a, b, directed: true, tone: inCycle(+a) ? 'hit' : s === 1 && +a === 1 ? 'active' : (s === 3 && +a === 3) || (s === 4 && +a === 4) ? 'active' : 'normal' }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="紅 = 走到一半；藍 = 環上（答案 = 環長）；綠 = 完成"><GraphView nodes={nodes} edges={edges} width={480} height={240} /></Stage>
        <Stage title="ans">
          <div className="flex justify-center">
            <Seq items={[1, 2, 3, 4].map((v) => ({ v: st[v] === 2 ? ANS[v] : '', top: `[${v}]`, tone: tone(v) }))} />
          </div>
        </Stage>
        {s === 1 && <Note tone="rose">走到「走到一半」的點 = 繞回自己的路上了 → 從那個點開始的就是環。</Note>}
        {s === 4 && <Note tone="emerald">就是手寫圖裡的 1 + 1 + 2 = 4：4 自己、3、再加上環的長度 2。</Note>}
      </AlgoBoard>
    </div>
  );
}
