// Animation 92: 資料結構 · 二元樹 ↔ list — index i 的子節點是 2i+1、2i+2
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, Note, type GNode, type GEdge, type CellTone } from '../animation_kit/AlgoKit';

export const STEPS = [
  '一層一層、由左到右放進 list',
  'index 0 的子節點：2×0+1 = 1、2×0+2 = 2',
  'index 1 的子節點：2×1+1 = 3、2×1+2 = 4',
  'index 5 的父節點：(5−1) // 2 = 2',
  '少了一個節點：list 要留 None 空格，位置才不會亂',
];
const POS = [[260, 30], [140, 100], [380, 100], [80, 175], [200, 175], [320, 175], [440, 175]];
const HOT: Record<number, { me: number; rel: number[] }> = { 1: { me: 0, rel: [1, 2] }, 2: { me: 1, rel: [3, 4] }, 3: { me: 5, rel: [2] } };

export default function TreeListAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const vals: (number | null)[] = s === 4 ? [1, 2, 3, null, 5, 6, 7] : [1, 2, 3, 4, 5, 6, 7];
  const h = HOT[s];
  const tone = (i: number): CellTone => (vals[i] === null ? 'dim' : !h ? 'normal' : i === h.me ? 'active' : h.rel.includes(i) ? 'yes' : 'normal');
  const nodes: GNode[] = POS.map(([x, y], i) => ({ id: i, x, y, label: vals[i] ?? '–', tone: tone(i), above: `[${i}]` }));
  const edges: GEdge[] = [1, 2, 3, 4, 5, 6].map((i) => {
    const p = (i - 1) >> 1;
    const on = h && ((i === h.me && h.rel.includes(p)) || (p === h.me && h.rel.includes(i)));
    return { a: p, b: i, tone: vals[i] === null ? 'dim' : on ? 'active' : 'normal' };
  });
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="樹"><GraphView nodes={nodes} edges={edges} height={210} /></Stage>
        <Stage title="list（上面是 index）">
          <div className="flex justify-center">
            <Seq items={vals.map((v, i) => ({ v: v ?? 'None', tone: tone(i), top: `[${i}]`, bottom: h && i === h.me ? (s === 3 ? '我' : '父') : h?.rel.includes(i) ? (s === 3 ? '父' : '子') : undefined }))} />
          </div>
        </Stage>
        {s === 4 && <Note>樹越「歪」，None 越多，浪費越多空間 → 這時改用 Node class。</Note>}
      </AlgoBoard>
    </div>
  );
}
