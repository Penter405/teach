// Animation 98: 區間不同值 · 每個數字只保留最後出現的位置 + Fenwick tree（學生的寫法）— one step = one action (traced)
// add / get are env helpers (one step each); the marks row is rebuilt from the Fenwick array last_ocuur.
import React from 'react';
import T from './trace/98';
import { TraceView, Stage, Seq, Split, type CellTone, type TraceStep } from '../animation_kit/AlgoKit';
import { PointerSeq, arr, prevStep } from '../animation_kit/AlgoHelpers';

const N = 5; // d[1..5]

/** point values (0 / 1 marks) behind the Fenwick array: get(i) − get(i − 1) */
function marks(st: TraceStep): number[] {
  const t = arr(st, 'last_ocuur');
  const get = (i: number) => { let s = 0; for (; i > 0; i -= i & -i) s += t[i] ?? 0; return s; };
  return Array.from({ length: N }, (_, k) => get(k + 1) - get(k));
}

export default function LastOccurrenceAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} hide={['d_size']}>
      {(st, s) => {
        const d = arr(st, 'd');
        const m = marks(st);
        const before = marks(prevStep(T, s));
        const { back, begin, end, found } = st.vars;
        const appear = (st.vars.appear ?? {}) as Record<string, number>;
        const result = (st.vars.result ?? {}) as Record<string, number>;
        const need = arr<[number, number]>(st, 'need');
        const inQuery = st.line === 15 || st.line === 16 || (st.line === 14 && !!st.taken);
        const inPrint = (st.line === 17 && !!st.taken) || st.line === 18;
        const range = inQuery ? { from: begin, to: back } : inPrint ? { from: begin, to: end, tone: 'blue' as const } : null;
        const markTone = (k: number): CellTone => (m[k] !== before[k] ? (m[k] ? 'yes' : 'hit') : m[k] ? 'blue' : 'dim');
        return (
          <>
            <Stage title="d[1..5]（綠框 = 這一筆查詢 [begin, back]）">
              <PointerSeq first={1}
                items={d.slice(1).map((v, k) => ({ v, tone: k + 1 === back && !inPrint ? 'active' : 'normal' }))}
                range={range}
                pointers={inPrint ? [] : [
                  { name: 'begin', at: inQuery ? begin : undefined, color: 'emerald' },
                  { name: 'back', at: back, color: 'sky' },
                ]} />
            </Stage>
            <Stage title={`標記：每個值只在最後出現的位置記 1（存在 Fenwick tree 裡）${inQuery && found !== undefined ? `　found = ${found}` : ''}`}>
              <PointerSeq first={1} index={null} items={m.map((v, k) => ({ v, tone: markTone(k) }))} range={range} />
            </Stage>
            <Split>
              <Stage title="appear：值 → 最後出現的位置">
                <Seq size="sm" empty="（空）" items={Object.entries(appear).map(([x, pos]) => ({
                  v: pos, top: `值${x}`, tone: st.ref?.[0] === 'appear' && String(st.ref[1]) === x ? (st.kind === 'assign' ? 'yes' : 'active') : 'normal',
                }))} />
              </Stage>
              <Stage title="查詢 [a, b] 和答案">
                <Seq size="sm" items={need.map(([a, b]) => {
                  const key = `(${a}, ${b})`;
                  const now = (inQuery && a === begin && b === back) || (inPrint && a === begin && b === end);
                  return { v: result[key] ?? '?', top: `[${a},${b}]`, tone: now ? 'active' : key in result ? 'yes' : 'no' };
                })} />
              </Stage>
            </Split>
          </>
        );
      }}
    </TraceView>
  );
}
