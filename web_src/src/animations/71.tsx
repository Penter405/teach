// Animation 71: DP · 區間 DP — one step = one action
import React from 'react';
import T from './trace/71';
import { TraceView, Stage, Table2D, Seq, touches, type CellTone } from '../animation_kit/AlgoKit';

export default function IntervalAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const dp: number[][] = st.vars.dp ?? [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        const { l, r, k } = st.vars;
        const tone = (a: number, b: number): CellTone =>
          b < a ? 'dim' : touches(st, 'dp', a, b) ? (st.kind === 'assign' ? 'yes' : 'active') : a === l && b === r ? 'blue' : 'normal';
        return (
          <>
            <Stage title="石頭（k = 切點：左邊 l..k、右邊 k+1..r）">
              <div className="flex justify-center"><Seq items={[3, 4, 5].map((v, j) => ({ v, top: `[${j}]`, tone: l !== undefined && j >= l && j <= (r ?? -1) ? (k !== undefined && j <= k ? 'blue' : 'hit') : 'normal' }))} /></div>
            </Stage>
            <Stage title="dp[l][r]（藍 = 正在算的區間；黃 = 正在讀的格子）">
              <Table2D corner="l＼r" colHeads={[0, 1, 2]} rows={dp.map((row, a) => ({ head: a, cells: row.map((v, b) => ({ v: b < a ? '—' : v, tone: tone(a, b) })) }))} />
            </Stage>
          </>
        );
      }}
    </TraceView>
  );
}
