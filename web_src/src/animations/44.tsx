// Animation 44: 搜尋 · 二分答案 — one step = one action
import React from 'react';
import T from './trace/44';
import { TraceView, Stage, Seq } from '../animation_kit/AlgoKit';

const hours = (p: number[], k: number) => p.reduce((a, x) => a + Math.ceil(x / k), 0);
export default function BinaryAnswerAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const piles: number[] = st.vars.piles ?? [];
        const { lo, hi, mid, h } = st.vars;
        const ks = Array.from({ length: 11 }, (_, i) => i + 1);
        return (
          <>
            {piles.length > 0 && (
              <Stage title={mid ? `速度 mid = ${mid}：每一堆要幾小時（無條件進位）` : 'piles'}>
                <div className="flex justify-center">
                  <Seq items={piles.map((p) => ({ v: p, tone: mid ? 'blue' : 'normal', bottom: mid ? `⌈${p}/${mid}⌉ = ${Math.ceil(p / mid)}` : undefined }))} />
                </div>
              </Stage>
            )}
            <Stage title="答案軸：速度 k（✓ = 確定可以、✗ = 確定不行）">
              <div className="flex flex-wrap justify-center">
                <Seq items={ks.map((k) => {
                  const known = lo !== undefined && (k < lo || (hi !== undefined && k >= hi));
                  const ok = h !== undefined && hours(piles, k) <= h;
                  return {
                    v: k,
                    tone: k === mid ? 'active' : known ? (ok ? 'yes' : 'no') : 'normal',
                    top: [k === lo ? 'lo' : '', k === hi ? 'hi' : '', k === mid ? 'mid' : ''].filter(Boolean).join(' ') || undefined,
                    bottom: known ? (ok ? '✓' : '✗') : undefined,
                  };
                })} />
              </div>
            </Stage>
          </>
        );
      }}
    </TraceView>
  );
}
