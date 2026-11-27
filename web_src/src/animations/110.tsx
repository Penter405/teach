// Animation 110: 前綴積 × 後綴積 (postfix) = 除了自己以外的乘積 — hand-written, drawn on the data.
// a = [2, 3, 0, 4] (has a 0, so total / a[i] does not work). pre[i] = product left of gap i (built →),
// suf[i] = product right of gap i (built ←), ans[i] = pre[i] × suf[i + 1].
// steps / results in data.json come from TEXT below (steps[0] = 還沒開始執行): change both together.
import React from 'react';
import { AlgoBoard, Stage, Note } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';
import { PrefixRows, type PRow, type PSpan, type PLink } from '../animation_kit/AlgoHelpers';

const A = [2, 3, 0, 4];
const N = A.length;
const PRE = [1];
A.forEach((v, i) => PRE.push(PRE[i] * v));
const SUF = Array(N + 1).fill(1);
for (let i = N - 1; i >= 0; i--) SUF[i] = A[i] * SUF[i + 1];
const ANS = A.map((_, i) => PRE[i] * SUF[i + 1]);

type Step = { now: string; post: string; pre: number; suf: number; ans: number; hot?: [number, number]; spans?: PSpan[]; links?: PLink[] };
// pre: last pre index shown; suf: first suf index shown; ans: how many ans filled

export const TEXT: Step[] = [
  {
    now: `還沒開始：a = [${A.join(', ')}]`,
    post: `ans[i] = 除了 a[i] 以外全部相乘。總乘積 = 0，用「總乘積 / a[i]」除不回來。pre[0] = 1、suf[${N}] = 1（什麼都不乘）`,
    pre: 0, suf: N, ans: 0,
  },
  ...A.map((v, k): Step => {
    const i = k + 1;
    return {
      now: `前綴 pre[${i}] = pre[${i - 1}] × a[${i - 1}]（由左往右）`,
      post: `${PRE[i - 1]} × ${v} = ${PRE[i]}：縫 ${i} 左邊全部的乘積${v === 0 ? '。碰到 0，之後的 pre 都是 0' : ''}`,
      pre: i, suf: N, ans: 0, hot: [1, i],
      spans: [{ row: 0, from: 0, to: i - 1, tone: 'blue' }],
      links: [{ from: [1, i - 1], to: [1, i] }, { from: [0, i - 1], to: [1, i], tone: 'active' }],
    };
  }),
  ...A.map((_, k): Step => {
    const i = N - 1 - k;
    return {
      now: `後綴 suf[${i}] = a[${i}] × suf[${i + 1}]（postfix：由右往左）`,
      post: `${A[i]} × ${SUF[i + 1]} = ${SUF[i]}：縫 ${i} 右邊全部的乘積`,
      pre: N, suf: i, ans: 0, hot: [2, i],
      spans: [{ row: 0, from: i, to: N - 1, tone: 'yes' }],
      links: [{ from: [2, i + 1], to: [2, i] }, { from: [0, i], to: [2, i], tone: 'active' }],
    };
  }),
  ...A.map((_, i): Step => ({
    now: `ans[${i}] = pre[${i}] × suf[${i + 1}]`,
    post: `${PRE[i]} × ${SUF[i + 1]} = ${ANS[i]}：a[${i}] 左邊全部 × 右邊全部，剛好少了 a[${i}]`,
    pre: N, suf: 0, ans: i + 1, hot: [3, i],
    spans: [
      ...(i > 0 ? [{ row: 0, from: 0, to: i - 1, tone: 'blue' as const, label: `pre[${i}]` }] : []),
      ...(i < N - 1 ? [{ row: 0, from: i + 1, to: N - 1, tone: 'yes' as const, label: `suf[${i + 1}]` }] : []),
    ],
    links: [{ from: [1, i], to: [3, i] }, { from: [2, i + 1], to: [3, i] }],
  })),
  {
    now: '完成',
    post: `ans = [${ANS.join(', ')}]。兩次掃描（→ 一次、← 一次）+ 每格乘一次，O(n)，有 0 也沒問題`,
    pre: N, suf: 0, ans: N,
  },
];
export const STEPS = TEXT.length;

export default function PrefixSuffixProductAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const st = TEXT[s];
  const hot = (r: number, i: number) => st.hot?.[0] === r && st.hot[1] === i;
  const rows: PRow[] = [
    { name: 'a', kind: 'cell', items: A.map((v) => ({ v })) },
    { name: 'pre', dir: '× →', kind: 'gap', items: PRE.map((v, i) => ({ v: i <= st.pre ? v : null, tone: hot(1, i) ? 'active' : 'blue' })) },
    { name: 'suf', dir: '← ×', kind: 'gap', items: SUF.map((v, i) => ({ v: i >= st.suf ? v : null, tone: hot(2, i) ? 'active' : 'yes' })) },
    { name: 'ans', kind: 'cell', items: ANS.map((v, i) => ({ v: i < st.ans ? v : null, tone: hot(3, i) ? 'active' : 'yes' })) },
  ];
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={st.now} post={st.post} switches={[]} wide>
        <Stage title="前綴 = 縫左邊全部的積 ・ 後綴 = 縫右邊全部的積 ・ 答案 = 左邊的縫 × 右邊的縫">
          <PrefixRows rows={rows} spans={st.spans} links={st.links} />
        </Stage>
        <Note tone="sky">前綴（prefix）從左邊累積，後綴（postfix / suffix）從右邊累積。一格的「左邊全部」和「右邊全部」各查一次，就能拿掉中間那一格，不用除法。</Note>
      </AlgoBoard>
    </div>
  );
}
