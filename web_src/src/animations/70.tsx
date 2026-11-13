// Animation 70: DP · LIS with memo (tails) + binary search — [3,1,4,1,5,9,2,6]
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Seq, VarRow, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：memo[k] = 長度 k+1 的遞增子序列，結尾最小可以是多少',
  '3：memo 是空的 → 接在最後 [3]',
  '1：第一個 ≥ 1 的是 3 → 換掉 [1]（長度 1 的結尾變小了）',
  '4：比全部都大 → 接在最後 [1, 4]',
  '1：第一個 ≥ 1 的是 1 → 換掉（一樣）[1, 4]',
  '5：接在最後 [1, 4, 5]',
  '9：接在最後 [1, 4, 5, 9]',
  '2：第一個 ≥ 2 的是 4 → 換掉 [1, 2, 5, 9]',
  '6：第一個 ≥ 6 的是 9 → 換掉 [1, 2, 5, 6]',
  '答案 = memo 的長度 = 4（例如 1 4 5 9）；但 [1, 2, 5, 6] 本身不是 a 的子序列',
];
const A = [3, 1, 4, 1, 5, 9, 2, 6];

function run(k: number) {
  const m: number[] = [];
  let at = -1, app = false;
  for (let i = 0; i < k; i++) {
    let lo = 0, hi = m.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (m[mid] >= A[i]) hi = mid; else lo = mid + 1; }
    app = lo === m.length;
    if (app) m.push(A[i]); else m[lo] = A[i];
    at = lo;
  }
  return { m, at, app };
}

export default function LisAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const { m, at, app } = run(Math.min(s, 8));
  const cur = s >= 1 && s <= 8 ? s - 1 : -1;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: 'x', value: cur >= 0 ? A[cur] : '—', hot: cur >= 0 }, { name: 'LIS 長度', value: m.length, hot: s === 9 }]} />
        <Stage title="a">
          <div className="flex justify-center">
            <Seq items={A.map((v, i) => ({ v, tone: i === cur ? 'active' : i < cur || s === 9 ? (s === 9 && [1, 2, 4, 5].includes(i) ? 'yes' : 'no') : 'normal', top: i === cur ? 'x' : `[${i}]` }))} />
          </div>
        </Stage>
        <Stage title="memo（遞增；用二分搜尋找位置）">
          <Seq items={m.map((v, i) => ({ v, tone: i === at && cur >= 0 ? (app ? 'yes' : 'active') : 'normal', top: `長度 ${i + 1}`, bottom: i === at && cur >= 0 ? (app ? '接上' : '換掉') : undefined }))} empty="（空的）" />
        </Stage>
        {s === 2 && <Note>結尾越小越好：之後比 1 大的都能接，比 3 大的才能接。</Note>}
        {s === 9 && <Note tone="emerald">每個數做一次二分搜尋：O(n log n)。</Note>}
      </AlgoBoard>
    </div>
  );
}
