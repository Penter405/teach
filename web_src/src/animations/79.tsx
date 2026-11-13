// Animation 79: 圖 · 拓樸排序 (Kahn) — indegree drops to 0 → ready
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, Seq, Note, Split, type GNode, type GEdge } from '../animation_kit/AlgoKit';

export const STEPS = [
  '先數入度：0、1 沒有人要等（入度 0）',
  '入度 0 的 0、1 放進 queue',
  '取出 0：拿掉 0 → 2，2 的入度 2 → 1',
  '取出 1：2 的入度 1 → 0、4 的入度 1 → 0，放進 queue',
  '取出 2：3 的入度 2 → 1',
  '取出 4：3 的入度 1 → 0，放進 queue',
  '取出 3：全部做完，順序 0 1 2 4 3',
  '如果有環（再加一條 3 → 1）：環上的點入度永遠不會變 0，order 少於 n 個',
];
const POS: Record<number, [number, number]> = { 0: [70, 60], 1: [70, 200], 2: [260, 60], 4: [260, 200], 3: [450, 130] };
const E: [number, number][] = [[0, 2], [1, 2], [2, 3], [1, 4], [4, 3]];
const F = [
  { indeg: [0, 0, 2, 2, 1], q: [], order: [], gone: [], cur: -1 },
  { indeg: [0, 0, 2, 2, 1], q: [0, 1], order: [], gone: [], cur: -1 },
  { indeg: [0, 0, 1, 2, 1], q: [1], order: [0], gone: ['0-2'], cur: 0 },
  { indeg: [0, 0, 0, 2, 0], q: [2, 4], order: [0, 1], gone: ['0-2', '1-2', '1-4'], cur: 1 },
  { indeg: [0, 0, 0, 1, 0], q: [4], order: [0, 1, 2], gone: ['0-2', '1-2', '1-4', '2-3'], cur: 2 },
  { indeg: [0, 0, 0, 0, 0], q: [3], order: [0, 1, 2, 4], gone: ['0-2', '1-2', '1-4', '2-3', '4-3'], cur: 4 },
  { indeg: [0, 0, 0, 0, 0], q: [], order: [0, 1, 2, 4, 3], gone: ['0-2', '1-2', '1-4', '2-3', '4-3'], cur: 3 },
  { indeg: [0, 1, 1, 2, 1], q: [], order: [0], gone: ['0-2'], cur: -1 },
];

export default function TopoAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const f = F[s];
  const cyc = s === 7;
  const nodes: GNode[] = Object.entries(POS).map(([k, [x, y]]) => {
    const v = +k;
    return {
      id: v, x, y,
      tone: v === f.cur ? 'active' : f.order.includes(v) ? 'yes' : cyc ? 'hit' : f.q.includes(v) ? 'blue' : 'normal',
      below: `入度 ${f.indeg[v]}`,
    };
  });
  const edges: GEdge[] = [...E, ...(cyc ? [[3, 1] as [number, number]] : [])].map(([a, b]) => ({
    a, b, directed: true,
    tone: f.gone.includes(`${a}-${b}`) ? (a === f.cur ? 'active' : 'dim') : cyc && a !== 0 ? 'hit' : 'normal',
  }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="先修關係（a → b：先做 a 才能做 b）"><GraphView nodes={nodes} edges={edges} height={250} /></Stage>
        <Split>
          <Stage title="queue（現在就能做的）"><Seq items={f.q.map((v) => ({ v, tone: 'blue' }))} /></Stage>
          <Stage title="order（做完的順序）"><Seq items={f.order.map((v) => ({ v, tone: v === f.cur ? 'active' : 'yes' }))} /></Stage>
        </Split>
        {s === 3 && <Note>一個 task 做完，就把它指出去的邊拿掉：被指的 task 少一個要等的。</Note>}
        {s === 7 && <Note tone="rose">1、2、3、4 互相等（1 → 2 → 3 → 1），入度都卡在 1 以上 → order 只有 1 個 &lt; 5 → 有環。</Note>}
      </AlgoBoard>
    </div>
  );
}
