// Animation 67: DP · 0/1 背包 — one step = one action
import React from 'react';
import T from './trace/67';
import { TraceView, Stage, Table2D, touches, type CellTone } from '../animation_kit/AlgoKit';

const HEAD = ['無', '物品 1 (w1, v6)', '物品 2 (w2, v10)'];
export default function Knapsack01Anim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const dp: number[][] = st.vars.dp ?? [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
        const { i, c } = st.vars;
        const tone = (r: number, k: number): CellTone =>
          touches(st, 'dp', r, k) ? (st.kind === 'assign' ? 'yes' : 'active') : r === i && k === c ? 'blue' : 'normal';
        return (
          <Stage title="dp[i][c]：列 = 考慮到第幾個物品；行 = 容量 c（藍 = 正在算的格子；黃 = 正在讀的格子）">
            <Table2D corner="i＼c" colHeads={[0, 1, 2, 3]} rows={dp.map((row, r) => ({ head: HEAD[r], cells: row.map((v, k) => ({ v, tone: tone(r, k) })) }))} />
          </Stage>
        );
      }}
    </TraceView>
  );
}
