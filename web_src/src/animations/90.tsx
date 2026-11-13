// Animation 90: 數學 · 捨入規則 — one step = one action
import React from 'react';
import T from './trace/90';
import { TraceView, Stage, Seq } from '../animation_kit/AlgoKit';

const num = (v: any) => (typeof v === 'string' ? v.replace(/^Decimal\('(.*)'\)$/, '$1') : v);
export default function RoundingAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} show={[]}>
      {(st) => {
        const v = st.vars;
        const rows = [
          ['x', 'Decimal("2.5")'], ['up', 'HALF_UP'], ['even', 'HALF_EVEN'], ['r', 'round(2.5)'],
          ['f', 'Decimal(2.675)（用 float）'], ['d', 'Decimal("2.675")'], ['ans', 'd 用 HALF_UP 留 2 位'],
        ].filter(([k]) => k in v);
        return (
          <Stage title="結果">
            <div className="flex flex-wrap gap-2">
              <Seq items={rows.map(([k, label]) => ({ v: String(num(v[k])).slice(0, 12) + (String(num(v[k])).length > 12 ? '…' : ''), top: k, bottom: label, tone: st.var === k ? 'yes' : 'normal' }))} empty="（還沒有）" />
            </div>
          </Stage>
        );
      }}
    </TraceView>
  );
}
