// Animation 77: 圖 · DFS — go deep, back up when stuck
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, GraphView, StackView, Seq, Note, Split, type GNode, type GEdge } from '../animation_kit/AlgoKit';
import { G_POS, G_EDGES } from './76';

export const STEPS = [
  '開始：dfs(0)',
  '進入 0：標記走過，往第一個沒走過的鄰居 1',
  '進入 1：往 3',
  '進入 3：沒有沒走過的鄰居 → 退回 1',
  '回到 1：往下一個鄰居 4',
  '進入 4：往 6',
  '進入 6：往 5',
  '進入 5：往 2',
  '進入 2：鄰居 0、5 都走過了 → 退回',
  '一路退回 0，結束：順序 0 1 3 4 6 5 2',
];
const STACK = [[], [0], [0, 1], [0, 1, 3], [0, 1], [0, 1, 4], [0, 1, 4, 6], [0, 1, 4, 6, 5], [0, 1, 4, 6, 5, 2], []];
const ORDER = [0, 1, 3, 4, 6, 5, 2];
const SEEN = [0, 1, 2, 3, 3, 4, 5, 6, 7, 7];
const PAR: Record<number, number> = { 1: 0, 3: 1, 4: 1, 6: 4, 5: 6, 2: 5 };

export default function DfsAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const st = STACK[s];
  const seen = ORDER.slice(0, SEEN[s]);
  const cur = st[st.length - 1];
  const back = s === 3 || s === 8;
  const nodes: GNode[] = Object.entries(G_POS).map(([k, [x, y]]) => {
    const v = +k, i = seen.indexOf(v);
    return { id: v, x, y, tone: v === cur ? (back ? 'hit' : 'active') : i >= 0 ? 'yes' : 'normal', above: i >= 0 ? `第 ${i + 1}` : undefined };
  });
  const edges: GEdge[] = G_EDGES.map(([a, b]) => {
    const tree = (PAR[b] === a && seen.includes(b)) || (PAR[a] === b && seen.includes(a));
    const onStack = st.includes(a) && st.includes(b) && Math.abs(st.indexOf(a) - st.indexOf(b)) === 1;
    return { a, b, tone: onStack ? 'active' : tree ? 'chosen' : 'normal' };
  });
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="圖（黃線 = 目前這條路；上面的數字 = 第幾個走到）"><GraphView nodes={nodes} edges={edges} height={275} /></Stage>
        <Split>
          <Stage title="call stack（目前這條路）">
            <div className="flex justify-center"><StackView items={st.map((v) => ({ v: `dfs(${v})`, tone: v === cur ? (back ? 'hit' : 'active') : 'normal' }))} /></div>
          </Stage>
          <Stage title="走到的順序"><Seq size="sm" items={seen.map((v) => ({ v, tone: 'yes' }))} /></Stage>
        </Split>
        {s === 3 && <Note tone="rose">走到底了：dfs(3) return，回到 dfs(1) 繼續看它的下一個鄰居。</Note>}
        {s === 9 && <Note tone="emerald">綠色的邊連起來是一棵樹（DFS 樹）。BFS 會先走 2，DFS 最後才走到 2。</Note>}
      </AlgoBoard>
    </div>
  );
}
