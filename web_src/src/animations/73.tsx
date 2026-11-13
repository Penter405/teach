// Animation 73: 資料結構 · Fenwick tree — query jumps down (i -= i&-i), update jumps up (i += i&-i)
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, VarRow, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  'a[1..8]；tree[i] 負責「i 往左數 lowbit(i) 個」的總和',
  'lowbit：1、3、5、7 管 1 個；2、6 管 2 個；4 管 4 個；8 管 8 個',
  'prefix_sum(7)：i = 7 (111₂)，先加 tree[7]（a[7]）',
  '7 − lowbit(7) = 6 (110₂)：加 tree[6]（a[5..6]）',
  '6 − lowbit(6) = 4 (100₂)：加 tree[4]（a[1..4]）',
  '4 − lowbit(4) = 0：停。a[1..7] 的總和 = 8 + 9 + 17 = 34',
  'update(3, +2)：i = 3 (011₂)，tree[3] 加 2',
  '3 + lowbit(3) = 4 (100₂)：tree[4] 加 2',
  '4 + lowbit(4) = 8 (1000₂)：tree[8] 加 2',
  '8 + 8 = 16 > 8：停。只改了 3 格',
];
const A0 = [0, 5, 2, 9, 1, 6, 3, 8, 4];
const low = (i: number) => i & -i;
const LEVEL = (i: number) => Math.log2(low(i));
const QUERY: Record<number, number[]> = { 2: [7], 3: [7, 6], 4: [7, 6, 4], 5: [7, 6, 4] };
const UPD: Record<number, number[]> = { 6: [3], 7: [3, 4], 8: [3, 4, 8], 9: [3, 4, 8] };

export default function FenwickAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const a = [...A0];
  if (s >= 6) a[3] += 2;
  const tree = (i: number, upTo: number[]) => {
    let t = 0;
    for (let k = i - low(i) + 1; k <= i; k++) t += A0[k] + (k === 3 && upTo.includes(i) ? 2 : 0);
    return t;
  };
  const upd = UPD[s] ?? [];
  const q = QUERY[s] ?? [];
  const cur = s >= 2 && s <= 4 ? q[q.length - 1] : s >= 6 && s <= 8 ? upd[upd.length - 1] : 0;
  const sum = q.reduce((acc, i) => acc + tree(i, []), 0);
  const COL = 'grid grid-cols-8 gap-1';
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[
          { name: 'i', value: cur ? `${cur} (${cur.toString(2)}₂)` : '—', hot: !!cur },
          { name: 'lowbit(i)', value: cur ? low(cur) : '—', hot: !!cur },
          { name: s <= 5 ? 'total' : '改了幾格', value: s <= 5 ? (s >= 2 ? sum : '—') : upd.length, hot: s >= 2 },
        ]} />
        <Stage title="tree[i] 負責的範圍（越下面管越多）">
          <div className="flex flex-col gap-1">
            {[0, 1, 2, 3].map((lv) => (
              <div key={lv} className={COL}>
                {[1, 2, 3, 4, 5, 6, 7, 8].filter((i) => LEVEL(i) === lv).map((i) => {
                  const inQ = q.includes(i), inU = upd.includes(i);
                  const tone = i === cur ? 'border-amber-400 bg-amber-500/25 text-amber-100 ring-2 ring-amber-400'
                    : inQ || inU ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                    : s === 1 ? 'border-sky-500 bg-sky-500/10 text-sky-100' : 'border-slate-600 bg-slate-800 text-slate-200';
                  return (
                    <div key={i} style={{ gridColumn: `${i - low(i) + 1} / ${i + 1}` }}
                      className={`flex h-9 items-center justify-between gap-1 whitespace-nowrap rounded-md border px-1.5 font-mono text-[11px] transition-colors duration-300 ${tone}`}>
                      <span className="font-bold">tree[{i}]</span>
                      <span>{s === 1 ? `${low(i)} 個` : `= ${tree(i, upd)}`}</span>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className={`${COL} mt-2`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className={`flex h-10 flex-col items-center justify-center rounded-md border font-mono text-sm font-bold
                  ${s >= 6 && i === 3 ? 'border-amber-400 bg-amber-500/20 text-amber-100' : s >= 2 && s <= 5 && i <= 7 ? 'border-slate-500 bg-slate-700 text-slate-100' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
                  <span className="text-[9px] font-normal text-slate-500">a[{i}]</span>{a[i]}
                </div>
              ))}
            </div>
          </div>
        </Stage>
        {s === 5 && <Note tone="emerald">7 = 111₂ 有三個 1 → 加三格。每次去掉最右邊的 1，最多 log n 次。</Note>}
        {s === 9 && <Note tone="emerald">update 往上找「範圍包含 a[3]」的格子：3 → 4 → 8，也是 log n 次。</Note>}
      </AlgoBoard>
    </div>
  );
}
