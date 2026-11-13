// Animation 90: 數學 · 捨入規則 — where does 2.5 go on the number line?
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：數線上的 2.5，剛好在 2 和 3 的正中間',
  'ROUND_HALF_UP：剛好一半 → 遠離 0 → 3',
  'ROUND_HALF_EVEN（round() 用的）：剛好一半 → 取偶數 → 2',
  '-2.5 用 ROUND_HALF_UP：遠離 0 → -3（不是 -2）',
  'ROUND_FLOOR 往負無限大 → -3；ROUND_CEILING 往正無限大 → -2',
  'float 的 2.675 其實是 2.67499999…，在一半的左邊 → 2.67',
];
type Arrow = { to: number; label: string; color: string };
type F = { min: number; max: number; ticks: number[]; fmt: (v: number) => string; point: number; pointLabel: string; arrows: Arrow[]; half?: number };
const INT = { min: -3.5, max: 3.5, ticks: [-3, -2, -1, 0, 1, 2, 3], fmt: (v: number) => String(v) };
const FR: F[] = [
  { ...INT, point: 2.5, pointLabel: '2.5', arrows: [] },
  { ...INT, point: 2.5, pointLabel: '2.5', arrows: [{ to: 3, label: 'HALF_UP → 3', color: '#34d399' }] },
  { ...INT, point: 2.5, pointLabel: '2.5', arrows: [{ to: 2, label: 'HALF_EVEN → 2', color: '#38bdf8' }] },
  { ...INT, point: -2.5, pointLabel: '-2.5', arrows: [{ to: -3, label: 'HALF_UP → -3', color: '#34d399' }] },
  { ...INT, point: -2.5, pointLabel: '-2.5', arrows: [{ to: -3, label: 'FLOOR → -3', color: '#f472b6' }, { to: -2, label: 'CEILING → -2', color: '#fbbf24' }] },
  { min: 2.669, max: 2.681, ticks: [2.67, 2.675, 2.68], fmt: (v) => v.toFixed(3), point: 2.6743, pointLabel: '2.67499…', half: 2.675, arrows: [{ to: 2.67, label: '→ 2.67', color: '#fb7185' }] },
];

export default function RoundingAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const f = FR[s];
  const W = 560, Y = 90;
  const X = (v: number) => 30 + ((v - f.min) / (f.max - f.min)) * (W - 60);
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title={s === 5 ? '放大：2.67 ～ 2.68' : '數線'}>
          <svg viewBox={`0 0 ${W} 150`} className="w-full" style={{ maxHeight: 190 }}>
            <line x1={20} y1={Y} x2={W - 20} y2={Y} stroke="#64748b" strokeWidth={2} />
            {f.ticks.map((t) => (
              <g key={t}>
                <line x1={X(t)} y1={Y - 8} x2={X(t)} y2={Y + 8} stroke={t === f.half ? '#fbbf24' : '#94a3b8'} strokeWidth={2} strokeDasharray={t === f.half ? '3 3' : undefined} />
                <text x={X(t)} y={Y + 26} textAnchor="middle" fontSize={13} fill={t === f.half ? '#fbbf24' : '#cbd5e1'} fontFamily="monospace">{f.fmt(t)}{t === f.half ? '（一半）' : ''}</text>
              </g>
            ))}
            {f.arrows.map((a, i) => {
              const y = Y - 26 - i * 22;
              return (
                <g key={i}>
                  <line x1={X(f.point)} y1={y} x2={X(a.to)} y2={y} stroke={a.color} strokeWidth={3} />
                  <polygon points={`${X(a.to)},${y} ${X(a.to) + (a.to > f.point ? -8 : 8)},${y - 5} ${X(a.to) + (a.to > f.point ? -8 : 8)},${y + 5}`} fill={a.color} />
                  <text x={X(a.to) + (a.to > f.point ? 6 : -6)} y={y + 4} textAnchor={a.to > f.point ? 'start' : 'end'} fontSize={12} fontWeight={700} fill={a.color}>{a.label}</text>
                </g>
              );
            })}
            <circle cx={X(f.point)} cy={Y} r={7} fill="#fbbf24" />
            <text x={X(f.point)} y={Y + 46} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fde68a" fontFamily="monospace">{f.pointLabel}</text>
          </svg>
        </Stage>
        {s === 2 && <Note>3.5 用 HALF_EVEN 會變 4：剛好一半時，往偶數那邊走。</Note>}
        {s === 5 && <Note tone="rose">規則沒錯，是數字本身已經不是 2.675 了。Decimal("2.675") 才是真的 2.675。</Note>}
      </AlgoBoard>
    </div>
  );
}
