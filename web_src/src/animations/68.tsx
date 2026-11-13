// Animation 68: DP · 無限背包 — coins {1,3,4}, fewest coins for 6
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Seq, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：dp[c] = 湊出 c 元最少要幾枚，硬幣 {1, 3, 4}',
  'dp[0] = 0：湊 0 元不用硬幣',
  'dp[1]：只能用 1 → dp[0] + 1 = 1',
  'dp[2]：用 1 → dp[1] + 1 = 2',
  'dp[3]：用 1 → dp[2] + 1 = 3；用 3 → dp[0] + 1 = 1 → 1',
  'dp[4]：用 4 → dp[0] + 1 = 1',
  'dp[5]：用 1 → dp[4] + 1 = 2；用 3 → dp[2] + 1 = 3；用 4 → dp[1] + 1 = 2 → 2',
  'dp[6]：用 1 → 3；用 3 → dp[3] + 1 = 2（3 + 3）；用 4 → dp[2] + 1 = 3 → 2',
  '同一枚硬幣可以一直用：dp[c − coin] 已經用過這枚也沒關係 → c 從小到大',
];
const DP = [0, 1, 2, 1, 1, 2, 2];
const COINS = [1, 3, 4];

export default function CoinAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const c = s >= 1 && s <= 7 ? s - 1 : -1;
  const src = c > 0 ? COINS.filter((k) => k <= c).map((k) => c - k) : [];
  const best = c > 0 ? COINS.filter((k) => k <= c && DP[c - k] + 1 === DP[c]).map((k) => c - k) : [];
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="dp[c]">
          <div className="flex justify-center">
            <Seq items={DP.map((v, i) => ({
              v: s === 0 || (s <= 7 && i > c) ? '' : v,
              top: `c=${i}`,
              tone: i === c ? 'active' : best.includes(i) ? 'yes' : src.includes(i) ? 'blue' : 'normal',
              bottom: i === c ? `${v} 枚` : src.includes(i) ? `+${c - i} 元硬幣` : undefined,
            }))} />
          </div>
        </Stage>
        <Stage title="候選（每種硬幣都試）">
          <div className="flex flex-wrap justify-center gap-2 font-mono text-xs">
            {c > 0 ? COINS.filter((k) => k <= c).map((k) => (
              <span key={k} className={`rounded-md border px-2 py-1 ${DP[c - k] + 1 === DP[c] ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100' : 'border-slate-600 text-slate-300'}`}>
                用 {k}：dp[{c - k}] + 1 = {DP[c - k] + 1}
              </span>
            )) : <span className="text-slate-500">—</span>}
          </div>
        </Stage>
        {s === 7 && <Note tone="rose">貪婪會先拿最大的 4 → 4 + 1 + 1 = 3 枚；DP 找到 3 + 3 = 2 枚。</Note>}
      </AlgoBoard>
    </div>
  );
}
