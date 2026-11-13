// Animation 41: 搜尋 · 二分搜尋 lower_bound — leftmost 4 in [1,3,4,4,4,7,9,12]
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Seq, VarRow, Note, type SeqItem } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：lo = 0，hi = 8（左閉右開 [0, 8)），找第一個 ≥ 4 的位置',
  'mid = 4：a[4] = 4 ≥ 4 → 答案是 4 或更左 → hi = 4',
  'mid = 2：a[2] = 4 ≥ 4 → hi = 2',
  'mid = 1：a[1] = 3 < 4 → 太小，丟掉 → lo = 2',
  'lo == hi == 2 → 停：最左邊的 4 在 index 2',
  'upper_bound 把 ≥ 換成 >，會停在 5；4 出現 5 − 2 = 3 次',
];
const A = [1, 3, 4, 4, 4, 7, 9, 12];
const F = [{ lo: 0, hi: 8, mid: -1 }, { lo: 0, hi: 4, mid: 4 }, { lo: 0, hi: 2, mid: 2 }, { lo: 2, hi: 2, mid: 1 }, { lo: 2, hi: 2, mid: -1 }, { lo: 2, hi: 5, mid: -1 }];

export default function BinarySearchAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const { lo, hi, mid } = F[s];
  const items: SeqItem[] = [...A, '末'].map((v, i) => {
    const tags = [s < 5 && i === lo ? 'lo' : '', s < 5 && i === hi ? 'hi' : '', i === mid ? 'mid' : '', s === 5 && i === 2 ? 'lower' : '', s === 5 && i === 5 ? 'upper' : ''].filter(Boolean).join(' ');
    const tone = i === mid ? 'active' : s === 5 ? (i >= 2 && i < 5 ? 'yes' : 'no') : s === 4 && i === 2 ? 'yes' : i >= lo && i < hi ? 'normal' : i === 8 ? 'dim' : 'no';
    return { v, tone, top: tags || undefined, bottom: `[${i}]`, struck: s < 5 && i < 8 && (i < lo || i >= hi) && !(s === 4 && i === 2) };
  });
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: 'lo', value: lo, hot: s === 3 }, { name: 'hi', value: hi, hot: s === 1 || s === 2 }, { name: 'mid', value: mid >= 0 ? mid : '—', hot: mid >= 0 }, { name: '比較次數', value: Math.min(s, 3) }]} />
        <Stage title="a（劃掉 = 已經排除；[lo, hi) 是還可能的範圍）">
          <div className="flex justify-center"><Seq items={items} /></div>
        </Stage>
        {s === 1 && <Note>a[mid] 等於 target 時也是 hi = mid：mid 可能就是答案，不能丟掉，但左邊可能還有。</Note>}
        {s === 4 && <Note tone="emerald">3 次比較就找到。n = 10⁶ 也只要 20 次。</Note>}
      </AlgoBoard>
    </div>
  );
}
