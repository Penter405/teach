// Animation 61: bit · bitmask 列舉子集 — [3,5,2,7], sum = 10
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Seq, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  '4 個數，每個「選或不選」→ 2⁴ = 16 個子集，正好是 0 ～ 15',
  'mask = 0101₂ = 5：第 0、2 位是 1 → 選 nums[0]、nums[2] = {3, 2}',
  'mask 從 0 跑到 15，每個 mask 對應一個子集',
  '總和 = 10 的：0111₂ {3, 5, 2} 和 1001₂ {3, 7}',
  'n = 20 時 2²⁰ ≈ 10⁶ 個還可以；n = 40 就太多了',
];
const N = [3, 5, 2, 7];
const pick = (m: number) => N.filter((_, i) => (m >> i) & 1);
const bits = (m: number) => m.toString(2).padStart(4, '0');

export default function BitmaskAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const focus = s === 1 ? 5 : -1;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="nums（第 i 位 ↔ nums[i]）">
          <div className="flex justify-center">
            <Seq items={N.map((v, i) => ({ v, top: `第 ${i} 位`, tone: focus >= 0 ? ((focus >> i) & 1 ? 'yes' : 'no') : 'normal', bottom: focus >= 0 ? `bit = ${(focus >> i) & 1}` : undefined }))} />
          </div>
        </Stage>
        <Stage title="16 個 mask（二進位右邊是第 0 位）">
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 16 }, (_, m) => {
              const p = pick(m), sum = p.reduce((a, b) => a + b, 0);
              const on = s >= 2 || m === focus;
              const hit = s >= 3 && sum === 10;
              return (
                <div key={m} className={`rounded-md border px-2 py-1 text-center font-mono text-xs transition-colors duration-300
                  ${m === focus ? 'border-amber-400 bg-amber-500/25 text-amber-100 ring-2 ring-amber-400' : hit ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100' : on ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
                  <div className="font-bold">{bits(m)}<span className="ml-1 font-normal text-[10px] opacity-70">={m}</span></div>
                  <div className="text-[10px]">{on ? `{${p.join(',')}} 和 ${sum}` : ''}</div>
                </div>
              );
            })}
          </div>
        </Stage>
        {s === 4 && <Note>2ⁿ 成長很快：n ≤ 20 左右才用 bitmask 暴力列舉；更大要找 DP 或其他方法。</Note>}
      </AlgoBoard>
    </div>
  );
}
