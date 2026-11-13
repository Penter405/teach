// Animation 67: DP · 0/1 背包 — capacity 5, items (1,6) (2,10) (3,12)
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Table2D, Note, type CellTone } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：dp[i][c] = 只看前 i 個物品、容量 c 時的最大價值',
  '第 0 列：沒有物品 → 全部 0',
  '物品 1（重 1、值 6）：容量 ≥ 1 都拿得下 → 6',
  '物品 2（重 2、值 10）：例如 c = 3：不拿 = 6；拿 = dp[1][1] + 10 = 16 → 16',
  '物品 3（重 3、值 12）：例如 c = 5：不拿 = 16；拿 = dp[2][2] + 12 = 22 → 22',
  '回溯：22 ≠ 16 → 拿了物品 3；剩容量 2，10 ≠ 6 → 拿了物品 2。答案 22',
];
const DP = [[0, 0, 0, 0, 0, 0], [0, 6, 6, 6, 6, 6], [0, 6, 10, 16, 16, 16], [0, 6, 10, 16, 18, 22]];
const HEAD = ['無', '1 (w1,v6)', '2 (w2,v10)', '3 (w3,v12)'];
const EX: Record<number, { cell: [number, number]; src: [number, number][] }> = { 3: { cell: [2, 3], src: [[1, 3], [1, 1]] }, 4: { cell: [3, 5], src: [[2, 5], [2, 2]] } };
const PATH: [number, number][] = [[3, 5], [2, 2], [1, 0], [0, 0]];

export default function Knapsack01Anim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const rowsFilled = s === 0 ? 0 : Math.min(s, 4);
  const ex = EX[s];
  const tone = (i: number, c: number): CellTone => {
    if (s === 5) return PATH.some(([a, b]) => a === i && b === c) ? 'yes' : 'normal';
    if (ex && ex.cell[0] === i && ex.cell[1] === c) return 'active';
    if (ex && ex.src.some(([a, b]) => a === i && b === c)) return 'blue';
    if (i === rowsFilled - 1 && s >= 1) return 'yes';
    return 'normal';
  };
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="列 = 考慮到第幾個物品；行 = 容量 c">
          <Table2D corner="物品＼c" colHeads={[0, 1, 2, 3, 4, 5]}
            rows={DP.map((row, i) => ({ head: HEAD[i], cells: row.map((v, c) => ({ v: i < rowsFilled ? v : '', tone: tone(i, c) })) }))} />
        </Stage>
        {ex && <Note>藍色兩格：正上方 = 不拿；上一列往左 w 格 + v = 拿。兩個都只看上一列 → 每個物品最多拿一次。</Note>}
        {s === 5 && <Note tone="emerald">從右下角往回走：和正上方不一樣就代表拿了，往左跳 w 格。選了物品 2、3：重 5、值 22。</Note>}
      </AlgoBoard>
    </div>
  );
}
