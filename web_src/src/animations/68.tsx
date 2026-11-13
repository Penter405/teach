// Animation 68: DP · 無限背包（最少硬幣）— one step = one action
import React from 'react';
import T from './trace/68';
import { TraceView, Stage, Seq, touches } from '../animation_kit/AlgoKit';

export default function CoinAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st) => {
        const dp: (number | string)[] = st.vars.dp ?? [];
        return (
          <Stage title="dp[c] = 湊出 c 元最少幾枚（∞ = 還湊不出來）">
            <div className="flex justify-center">
              <Seq items={dp.map((v, k) => ({ v, top: `c=${k}`, tone: touches(st, 'dp', k) ? (st.kind === 'assign' ? 'yes' : 'active') : k === st.vars.c ? 'blue' : 'normal' }))} />
            </div>
          </Stage>
        );
      }}
    </TraceView>
  );
}
