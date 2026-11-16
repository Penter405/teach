// Animation 67: DP · 0/1 背包 — one step = one action
import React from 'react';
import T from './trace/67';
import { TraceView, Stage, Table2D, type CellTone } from '../animation_kit/AlgoKit';

const HEAD = ['無', '物品 1 (w1, v6)', '物品 2 (w2, v10)'];
export default function Knapsack01Anim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const dp: number[][] = st.vars.dp ?? [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        const { i, c } = st.vars;
        // prev = dp[i - 1], cur = dp[i]: map the cell a step touched back to (row, column)
        const ref = st.ref;
        const at = !ref ? null : ref[0] === 'prev' ? [i - 1, ref[1]] : ref[0] === 'cur' ? [i, ref[1]] : ref[0] === 'dp' && ref.length === 3 ? [ref[1], ref[2]] : null;
        const rowRef = ref && ref[0] === 'dp' && ref.length === 2 ? ref[1] : null;
        const tone = (r: number, k: number): CellTone =>
          at && at[0] === r && at[1] === k ? (st.kind === 'assign' ? 'yes' : 'active') : r === i && k === c ? 'blue' : 'normal';
        return (
          <Stage title="dp[i][c]：列 = 考慮到第幾個物品；行 = 容量 c（藍 = 正在算的格子；黃 = 正在讀的格子）">
            <Table2D corner="i＼c" colHeads={dp[0].map((_, k) => k)} rows={dp.map((row, r) => ({ head: <span className={r === rowRef ? 'text-amber-300' : r === i ? 'text-sky-300' : r === (i ?? 0) - 1 ? 'text-slate-200' : ''}>{HEAD[r]}{r === i ? '（cur）' : r === (i ?? 0) - 1 ? '（prev）' : ''}</span>, cells: row.map((v, k) => ({ v, tone: tone(r, k) })) }))} />
          </Stage>
        );
      }}
    </TraceView>
  );
}
