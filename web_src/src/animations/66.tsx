// Animation 66: DP · 1D 表格化 — climbing stairs dp[i] = dp[i-1] + dp[i-2]
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Seq, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：dp[i] = 爬到第 i 階有幾種方法（一次爬 1 或 2 階）',
  '初始值：dp[0] = 1（站在地上）、dp[1] = 1',
  'dp[2] = dp[1] + dp[0] = 1 + 1 = 2',
  'dp[3] = dp[2] + dp[1] = 2 + 1 = 3',
  'dp[4] = dp[3] + dp[2] = 3 + 2 = 5',
  'dp[5] = dp[4] + dp[3] = 5 + 3 = 8',
  'dp[6] = dp[5] + dp[4] = 8 + 5 = 13',
  '每一格只用到前兩格 → 只留兩個變數就夠（O(1) 空間）',
];
const DP = [1, 1, 2, 3, 5, 8, 13];

export default function StairsAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const filled = s === 0 ? 0 : s === 1 ? 2 : Math.min(s + 1, 7);
  const cur = s >= 2 && s <= 6 ? s : -1;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="dp 表（由左往右填）">
          <div className="flex justify-center">
            <Seq items={DP.map((v, i) => ({
              v: i < filled ? v : '',
              top: `dp[${i}]`,
              tone: i === cur ? 'active' : cur >= 0 && (i === cur - 1 || i === cur - 2) ? 'blue' : s === 7 ? (i >= 5 ? 'yes' : 'dim') : i < filled ? 'yes' : 'normal',
              bottom: i === cur ? '= 藍 + 藍' : s === 7 && i === 5 ? 'a' : s === 7 && i === 6 ? 'b' : undefined,
            }))} />
          </div>
        </Stage>
        <Stage title="為什麼">
          <div className="text-center text-sm text-slate-300">
            {cur >= 0 ? <>最後一步從第 {cur - 1} 階跨 1 階上來（{DP[cur - 1]} 種），或從第 {cur - 2} 階跨 2 階上來（{DP[cur - 2]} 種）</> : '到第 i 階的最後一步，不是跨 1 階就是跨 2 階'}
          </div>
        </Stage>
        {s === 7 && <Note tone="emerald">a, b = b, a + b：把整張表壓成兩個變數。</Note>}
      </AlgoBoard>
    </div>
  );
}
