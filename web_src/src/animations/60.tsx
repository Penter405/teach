// Animation 60: 分治 · 快速冪 fast_pow(2, 10) — the call stack goes 10 → 5 → 2 → 1 → 0 and comes back squaring.
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, StackView, Seq, VarRow, Note, Split } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始（還沒執行）',
  'fast_pow(2, 10)：要先算 fast_pow(2, 5)',
  'fast_pow(2, 5)：要先算 fast_pow(2, 2)',
  'fast_pow(2, 2)：要先算 fast_pow(2, 1)',
  'fast_pow(2, 1)：要先算 fast_pow(2, 0) = 1',
  '回到 fast_pow(2, 1)：1 是奇數 → 1² × 2 = 2',
  '回到 fast_pow(2, 2)：2 是偶數 → 2² = 4',
  '回到 fast_pow(2, 5)：5 是奇數 → 4² × 2 = 32',
  '回到 fast_pow(2, 10)：10 是偶數 → 32² = 1024',
  '只乘了 6 次，不是 9 次；n = 10⁹ 時大約 60 次',
];
const NS = [10, 5, 2, 1, 0];
const VAL: Record<number, number> = { 0: 1, 1: 2, 2: 4, 5: 32, 10: 1024 };
const HOW: Record<number, string> = { 1: '1² × 2', 2: '2²', 5: '4² × 2', 10: '32²' };
const MULS = [0, 0, 0, 0, 0, 2, 3, 5, 6, 6];

export default function FastPowAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  // frames on the stack: depth = how many calls are open
  const depth = s === 0 ? 0 : s <= 4 ? s + 1 : s <= 8 ? 9 - s : 1;
  const doneN = s >= 4 ? NS.slice(Math.max(0, 8 - s), 5) : []; // which n already have a value
  const stack = NS.slice(0, depth).map((n, i) => {
    const top = i === depth - 1;
    const has = doneN.includes(n);
    return { v: `fast_pow(2, ${n})`, tone: top ? (has ? 'yes' : 'active') : 'normal', note: has ? `= ${VAL[n]}` : '等…' } as const;
  });
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: '乘法次數', value: MULS[s], hot: s >= 5 && s <= 8 }, { name: '直接乘要', value: 9 }]} />
        <Split>
          <Stage title="call stack（上面是正在算的）">
            <div className="flex justify-center">
              <StackView width="w-56" items={s === 9 ? [{ v: 'fast_pow(2, 10)', tone: 'yes', note: '= 1024' }] : stack} />
            </div>
          </Stage>
          <Stage title="n 每次砍一半">
            <Seq items={NS.map((n, i) => ({
              v: n,
              tone: s === 0 ? 'normal' : s <= 4 ? (i < s ? 'no' : i === s ? 'active' : 'normal') : doneN.includes(n) ? (n === NS[8 - s] ? 'active' : 'yes') : 'no',
              top: i < 4 ? (n % 2 ? '奇' : '偶') : 'base',
              bottom: doneN.includes(n) ? (n === 0 ? '= 1' : `${HOW[n]} = ${VAL[n]}`) : undefined,
            }))} />
          </Stage>
        </Split>
        {s === 9 && <Note tone="emerald">每一層只做 1～2 次乘法，層數是 log₂ n：n = 10 只要 4 層。</Note>}
      </AlgoBoard>
    </div>
  );
}
