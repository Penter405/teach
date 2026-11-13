// Animation 91: 數學 · 輾轉相除 gcd(48, 18) — cut the 48 × 18 rectangle into squares.
import React from 'react';
import { motion } from 'motion/react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, VarRow, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：48 × 18 的長方形',
  '48 % 18 = 12：切掉 2 個 18 × 18 的正方形，剩下 18 × 12 → gcd(18, 12)',
  '18 % 12 = 6：切掉 1 個 12 × 12，剩下 12 × 6 → gcd(12, 6)',
  '12 % 6 = 0：剛好切成 2 個 6 × 6，沒有剩 → gcd(6, 0)',
  'b = 0 → 答案是 6：6 × 6 的正方形可以鋪滿整個 48 × 18',
];
const K = 10; // px per unit
// squares: [x, y, size, step it is cut]
const SQ: [number, number, number, number][] = [[0, 0, 18, 1], [18, 0, 18, 1], [36, 0, 12, 2], [36, 12, 6, 3], [42, 12, 6, 3]];
const AB = [[48, 18], [18, 12], [12, 6], [6, 0], [6, 0]];
const COLOR = ['', '#0e7490', '#7c3aed', '#059669'];

export default function GcdAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const [a, b] = AB[s];
  const rest = s === 0 ? [0, 0, 48, 18] : s === 1 ? [36, 0, 12, 18] : s === 2 ? [36, 12, 12, 6] : null;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <VarRow vars={[{ name: 'a', value: a, hot: s > 0 }, { name: 'b', value: b, hot: s > 0 }, { name: 'gcd', value: s === 4 ? 6 : '?', hot: s === 4 }]} />
        <Stage title="48 × 18 的長方形，每次切掉最大的正方形">
          <svg viewBox={`-4 -4 ${48 * K + 8} ${18 * K + 8}`} className="w-full" style={{ maxHeight: 220 }}>
            <rect x={0} y={0} width={48 * K} height={18 * K} fill="#0f172a" stroke="#64748b" strokeWidth={2} />
            {SQ.filter((q) => q[3] <= s).map(([x, y, z, st], i) => (
              <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <rect x={x * K} y={y * K} width={z * K} height={z * K} fill={COLOR[st]} fillOpacity={st === s ? 0.55 : 0.25} stroke={COLOR[st]} strokeWidth={2} />
                <text x={(x + z / 2) * K} y={(y + z / 2) * K + 5} textAnchor="middle" fontSize={z >= 12 ? 16 : 11} fontWeight={700} fill="#f1f5f9">{z}×{z}</text>
              </motion.g>
            ))}
            {rest && <rect x={rest[0] * K} y={rest[1] * K} width={rest[2] * K} height={rest[3] * K} fill="none" stroke="#fbbf24" strokeWidth={3} strokeDasharray="6 4" />}
            {s === 4 && Array.from({ length: 8 }, (_, i) => Array.from({ length: 3 }, (_, j) => (
              <rect key={`${i}-${j}`} x={i * 6 * K} y={j * 6 * K} width={6 * K} height={6 * K} fill="none" stroke="#34d399" strokeWidth={1.5} />
            )))}
          </svg>
        </Stage>
        {s >= 1 && s <= 3 && <Note>虛線框 = 還沒切完的部分，也就是下一步的 gcd(a, b)。</Note>}
        {s === 4 && <Note tone="emerald">能鋪滿 48 × 18 的最大正方形邊長就是 gcd(48, 18) = 6：48 ÷ 6 = 8 個、18 ÷ 6 = 3 個。</Note>}
      </AlgoBoard>
    </div>
  );
}
