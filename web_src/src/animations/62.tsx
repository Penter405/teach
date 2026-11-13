// Animation 62: 遞迴 · 回溯 4 皇后 — place row by row, undo when a row has no safe square
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Seq, Note, Split } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：4 × 4 棋盤，一列放一個皇后',
  '第 0 列：放在 (0, 0)',
  '第 1 列：第 0、1 行會被攻擊，放在 (1, 2)',
  '第 2 列：每一格都會被攻擊 → 放不下，退回',
  '拿掉 (1, 2)（還原），第 1 列改放 (1, 3)',
  '第 2 列：放在 (2, 1)',
  '第 3 列每一格都被攻擊 → 退回；第 2、1 列也沒有別的位置 → 一路退回，拿掉 (0, 0)',
  '第 0 列改放 (0, 1)',
  '第 1 列：放在 (1, 3)',
  '第 2 列：放在 (2, 0)',
  '第 3 列：放在 (3, 2) → 找到一個解 [1, 3, 0, 2]',
];
const F: { q: number[]; fail?: number }[] = [
  { q: [] }, { q: [0] }, { q: [0, 2] }, { q: [0, 2], fail: 2 }, { q: [0, 3] }, { q: [0, 3, 1] }, { q: [0, 3, 1], fail: 3 },
  { q: [1] }, { q: [1, 3] }, { q: [1, 3, 0] }, { q: [1, 3, 0, 2] },
];
const attacked = (q: number[], r: number, c: number) => q.some((qc, qr) => qr !== r && (qc === c || Math.abs(qr - r) === Math.abs(qc - c)));

export default function NQueensAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const { q, fail } = F[s];
  const last = q.length - 1;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Split>
          <Stage title="棋盤（紅 = 會被攻擊）">
            <div className="mx-auto grid w-fit grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => {
                const queen = q[r] === c;
                const hit = !queen && r >= q.length && attacked(q, r, c);
                const failRow = fail === r;
                return (
                  <div key={`${r}-${c}`} className={`flex h-12 w-12 items-center justify-center rounded-md border text-2xl transition-colors duration-300
                    ${queen ? (r === last && !fail ? 'border-amber-400 bg-amber-500/30 ring-2 ring-amber-400' : s === 10 ? 'border-emerald-400 bg-emerald-500/25' : 'border-slate-500 bg-slate-700')
                      : failRow ? 'border-rose-400 bg-rose-500/30' : hit ? 'border-rose-900 bg-rose-950/50' : (r + c) % 2 ? 'border-slate-700 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}>
                    {queen ? '♛' : failRow ? <span className="text-sm text-rose-200">✗</span> : ''}
                  </div>
                );
              }))}
            </div>
          </Stage>
          <Stage title="path（每一列放在第幾行）">
            <Seq items={q.map((c, r) => ({ v: c, tone: s === 10 ? 'yes' : r === last && !fail ? 'active' : 'normal', top: `列 ${r}` }))} />
            {fail !== undefined && <div className="mt-2 text-xs text-rose-300">第 {fail} 列沒有安全的格子 → return，回到上一層後 path.pop()</div>}
          </Stage>
        </Split>
        {s === 4 && <Note>退回時一定要把剛剛放的皇后拿掉（還原 cols、斜線），不然下一個嘗試會看到錯的棋盤。</Note>}
        {s === 10 && <Note tone="emerald">放不下就馬上退回（剪枝），不用把 4⁴ = 256 種放法全部試一遍。</Note>}
      </AlgoBoard>
    </div>
  );
}
