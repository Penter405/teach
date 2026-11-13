// Animation 91: 數學 · 輾轉相除 gcd(48, 18) — one step = one action
import React from 'react';
import T from './trace/91';
import { TraceView, Stage } from '../animation_kit/AlgoKit';

const K = 10;
const SQ: [number, number, number, number][] = [[0, 0, 18, 18], [18, 0, 18, 18], [36, 0, 12, 12], [36, 12, 6, 6], [42, 12, 6, 6]]; // x, y, size, cut once b ≤ this
const REST: Record<number, [number, number, number, number]> = { 18: [0, 0, 48, 18], 12: [36, 0, 12, 18], 6: [36, 12, 12, 6] };
export default function GcdAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const { a, b } = st.vars;
        const cutUpTo = b === undefined ? 99 : b; // squares of size > current b are cut
        const rest = b !== undefined ? REST[b] : undefined;
        return (
          <Stage title="48 × 18 的長方形；虛線 = 還沒切完的 a × b">
            <svg viewBox={`-4 -4 ${48 * K + 8} ${18 * K + 8}`} className="w-full" style={{ maxHeight: 220 }}>
              <rect x={0} y={0} width={48 * K} height={18 * K} fill="#0f172a" stroke="#64748b" strokeWidth={2} />
              {SQ.filter((q) => a !== undefined && q[2] > cutUpTo).map(([x, y, z], i) => (
                <g key={i}>
                  <rect x={x * K} y={y * K} width={z * K} height={z * K} fill="#0e7490" fillOpacity={0.3} stroke="#22d3ee" strokeWidth={2} />
                  <text x={(x + z / 2) * K} y={(y + z / 2) * K + 5} textAnchor="middle" fontSize={z >= 12 ? 16 : 11} fontWeight={700} fill="#f1f5f9">{z}×{z}</text>
                </g>
              ))}
              {rest && <rect x={rest[0] * K} y={rest[1] * K} width={rest[2] * K} height={rest[3] * K} fill="none" stroke="#fbbf24" strokeWidth={3} strokeDasharray="6 4" />}
              {b === 0 && Array.from({ length: 8 }, (_, i) => Array.from({ length: 3 }, (_, j) => (
                <rect key={`${i}-${j}`} x={i * 6 * K} y={j * 6 * K} width={6 * K} height={6 * K} fill="#059669" fillOpacity={0.15} stroke="#34d399" strokeWidth={1.5} />
              )))}
            </svg>
          </Stage>
        );
      }}
    </TraceView>
  );
}
