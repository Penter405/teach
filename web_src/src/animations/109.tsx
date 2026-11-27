// Animation 109: 前綴和 (+) 與前綴積 (*) — hand-written, drawn on the data (not traced).
// a = [3, 1, 4, 1, 5]. P / Q have n + 1 items and sit on the gaps between cells: P[i] = sum of
// everything left of gap i. Build P (+), answer a[1..3] = P[4] − P[1], then the same with × (Q).
// steps / results in data.json come from TEXT below (steps[0] = 還沒開始執行): change both together.
import React from 'react';
import { AlgoBoard, Stage, Note } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';
import { PrefixRows, Stat, type PRow, type PSpan, type PLink } from '../animation_kit/AlgoHelpers';

const A = [3, 1, 4, 1, 5];
const N = A.length;
const P = [0];
const Q = [1];
A.forEach((v, i) => { P.push(P[i] + v); Q.push(Q[i] * v); });
const L = 1, R = 4;                               // query a[L..R-1] = a[1] + a[2] + a[3]

type Step = { now: string; post: string; p: number; q: number; hotP?: number; hotQ?: number; spans?: PSpan[]; links?: PLink[]; ans?: string; op: '+' | '×' };

export const TEXT: Step[] = [
  {
    now: `還沒開始：a = [${A.join(', ')}]`,
    post: 'P[i] = a[0] + … + a[i−1]（前 i 個的和）。P 比 a 多一格，畫在縫上：P[i] = 縫 i 左邊全部。P[0] = 0（左邊什麼都沒有）',
    p: 0, q: -1, op: '+',
  },
  ...A.map((v, k): Step => {
    const i = k + 1;
    return {
      now: `P[${i}] = P[${i - 1}] + a[${i - 1}]`,
      post: `${P[i - 1]} + ${v} = ${P[i]}：縫 ${i} 左邊 a[0..${i - 1}] 的和，只要再加一個數`,
      p: i, q: -1, hotP: i, op: '+',
      spans: [{ row: 0, from: 0, to: i - 1, tone: 'yes' }],
      links: [{ from: [1, i - 1], to: [1, i] }, { from: [0, i - 1], to: [1, i], tone: 'active' }],
    };
  }),
  {
    now: `a[${L}] + a[${L + 1}] + a[${R - 1}] = ?`,
    post: `不用一個一個加：P[${R}] 已經是 a[0..${R - 1}] 的和 = ${P[R]}`,
    p: N, q: -1, hotP: R, op: '+',
    spans: [{ row: 0, from: 0, to: R - 1, tone: 'blue', label: `P[${R}]` }],
  },
  {
    now: `減掉多算的 ${L === 1 ? 'a[0]' : `a[0..${L - 1}]`}`,
    post: `P[${L}] = ${P[L]}，所以答案 = P[${R}] − P[${L}] = ${P[R]} − ${P[L]} = ${P[R] - P[L]}。任何一段 a[l..r−1] 都是 P[r] − P[l]，O(1)`,
    p: N, q: -1, hotP: R, op: '+', ans: `${P[R] - P[L]}`,
    spans: [{ row: 0, from: 0, to: L - 1, tone: 'hit', label: `− P[${L}]` }, { row: 0, from: L, to: R - 1, tone: 'yes', label: '答案' }],
  },
  {
    now: '換成 ×：前綴積 Q',
    post: 'Q[i] = a[0] × … × a[i−1]。Q[0] = 1：乘法什麼都不乘是 1，就像加法的 0',
    p: N, q: 0, hotQ: 0, op: '×',
  },
  ...A.map((v, k): Step => {
    const i = k + 1;
    return {
      now: `Q[${i}] = Q[${i - 1}] × a[${i - 1}]`,
      post: `${Q[i - 1]} × ${v} = ${Q[i]}`,
      p: N, q: i, hotQ: i, op: '×',
      spans: [{ row: 0, from: 0, to: i - 1, tone: 'yes' }],
      links: [{ from: [2, i - 1], to: [2, i] }, { from: [0, i - 1], to: [2, i], tone: 'active' }],
    };
  }),
  {
    now: `a[${L}] × a[${L + 1}] × a[${R - 1}] = Q[${R}] / Q[${L}]？`,
    post: `${Q[R]} / ${Q[L]} = ${Q[R] / Q[L]}，可以。但 a 裡只要有一個 0，後面的 Q 全部變 0，除不回來 → 用前綴 × 後綴（下一支動畫）`,
    p: N, q: N, hotQ: R, op: '×', ans: `${Q[R] / Q[L]}`,
    spans: [{ row: 0, from: 0, to: L - 1, tone: 'hit', label: `÷ Q[${L}]` }, { row: 0, from: L, to: R - 1, tone: 'yes', label: '答案' }],
  },
];
export const STEPS = TEXT.length;

export default function PrefixSumProductAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const st = TEXT[s];
  const rows: PRow[] = [
    { name: 'a', kind: 'cell', items: A.map((v) => ({ v })) },
    { name: 'P', dir: '+ →', kind: 'gap', items: P.map((v, i) => ({ v: i <= st.p ? v : null, tone: i === st.hotP ? 'active' : 'yes' })) },
    { name: 'Q', dir: '× →', kind: 'gap', items: Q.map((v, i) => ({ v: i <= st.q ? v : null, tone: i === st.hotQ ? 'active' : 'blue' })) },
  ];
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={st.now} post={st.post} switches={[]} wide>
        <Stage title="陣列和它的前綴（縫 i 上的數 = 縫 i 左邊全部）">
          <PrefixRows rows={rows} spans={st.spans} links={st.links} />
        </Stage>
        <div className="grid w-full gap-3 @3xl:grid-cols-[2fr_1fr]">
          <Note tone={st.op === '+' ? 'emerald' : 'sky'}>
            {st.op === '+'
              ? 'P[i] = P[i−1] + a[i−1]：一路往右加，O(n) 做一次。之後任何一段的和 = 右邊的縫 − 左邊的縫。'
              : 'Q[i] = Q[i−1] × a[i−1]：同一個想法，+ 換成 ×、0 換成 1。區間要用除法拿掉左邊，碰到 0 就不行。'}
          </Note>
          <Stat label={`a[${L}..${R - 1}] 的${st.op === '+' ? '和' : '積'}`} value={st.ans ?? '?'} hot={!!st.ans} tone="emerald" />
        </div>
      </AlgoBoard>
    </div>
  );
}
