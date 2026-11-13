// Animation 55: 資料結構 · 單調堆疊 — next greater element of [2,1,5,3,6,4]
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, StackView, Seq, Note, Split } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：a = [2, 1, 5, 3, 6, 4]',
  'i=0, x=2：堆疊是空的 → 2 進堆疊等答案',
  'i=1, x=1：1 沒有比 2 大 → 1 進堆疊',
  'i=2, x=5：彈出 1、2，它們的答案都是 5；5 進堆疊',
  'i=3, x=3：3 沒有比 5 大 → 3 進堆疊',
  'i=4, x=6：彈出 3、5，答案是 6；6 進堆疊',
  'i=5, x=4：4 沒有比 6 大 → 4 進堆疊',
  '結束：堆疊裡剩下的 6、4 右邊沒有更大的 → -1',
];
const A = [2, 1, 5, 3, 6, 4];

function run(k: number) {
  const ans: (number | null)[] = A.map(() => null);
  let st: number[] = [];
  let popped: number[] = [];
  for (let i = 0; i < Math.min(k, A.length); i++) {
    popped = [];
    while (st.length && A[st[st.length - 1]] < A[i]) { const j = st.pop()!; ans[j] = A[i]; popped.push(j); }
    st.push(i);
  }
  if (k > A.length) { popped = []; st.forEach((j) => (ans[j] = -1)); }
  return { ans, st, popped };
}

export default function MonoStackAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const { ans, st, popped } = run(s);
  const cur = s >= 1 && s <= A.length ? s - 1 : -1;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="a 和答案">
          <div className="flex justify-center">
            <Seq items={A.map((v, i) => ({
              v, tone: i === cur ? 'active' : popped.includes(i) ? 'hit' : ans[i] !== null ? 'yes' : 'normal',
              top: i === cur ? 'x' : `[${i}]`, bottom: ans[i] !== null ? `答案 ${ans[i]}` : undefined,
            }))} />
          </div>
        </Stage>
        <Split>
          <Stage title="堆疊（由下到上遞減）">
            <div className="flex justify-center">
              <StackView items={st.map((j) => ({ v: A[j], tone: j === cur ? 'active' : s > A.length ? 'no' : 'normal', note: `[${j}]` }))} />
            </div>
          </Stage>
          <Stage title="這一步彈出的">
            <Seq items={popped.map((j) => ({ v: A[j], tone: 'hit', bottom: `→ ${ans[j]}` }))} empty="（沒有）" />
          </Stage>
        </Split>
        {s === 3 && <Note>堆疊裡比 x 小的，右邊第一個更大的就是 x：一次解決好幾個。</Note>}
        {s === 7 && <Note tone="emerald">每個數只進一次、出一次 → O(n)。</Note>}
      </AlgoBoard>
    </div>
  );
}
