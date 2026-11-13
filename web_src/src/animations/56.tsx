// Animation 56: 資料結構 · 單調佇列 — sliding window maximum, k = 3
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Seq, Note } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：a = [1, 3, -1, -3, 5, 3, 6, 7]，k = 3',
  'i=0, x=1：放進 deque',
  'i=1, x=3：1 比 3 小，以後不可能是最大 → 從後面踢掉；3 放進去',
  'i=2, x=-1：放進去；第一個視窗 [1, 3, -1] 的最大 = 最前面的 3',
  'i=3, x=-3：放進去；視窗 [3, -1, -3] 最大 = 3',
  'i=4, x=5：-3、-1、3 都比 5 小 → 從後面踢掉；最大 = 5',
  'i=5, x=3：放進去；視窗 [-3, 5, 3] 最大 = 5',
  'i=6, x=6：3、5 比 6 小 → 踢掉；最大 = 6',
  'i=7, x=7：6 比 7 小 → 踢掉；最大 = 7',
];
const A = [1, 3, -1, -3, 5, 3, 6, 7];
const K = 3;

function run(k: number) {
  let dq: number[] = [];
  let kicked: number[] = [];
  const res: number[] = [];
  for (let i = 0; i < k; i++) {
    kicked = [];
    while (dq.length && A[dq[dq.length - 1]] <= A[i]) kicked.push(dq.pop()!);
    dq.push(i);
    if (dq[0] <= i - K) kicked.push(dq.shift()!);
    if (i >= K - 1) res.push(A[dq[0]]);
  }
  return { dq, kicked, res };
}

export default function MonoQueueAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const { dq, kicked, res } = run(s);
  const i = s - 1;
  const lo = i - K + 1;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="a（框起來的是目前的視窗）">
          <div className="flex justify-center">
            <Seq items={A.map((v, j) => ({
              v, tone: j === i ? 'active' : kicked.includes(j) ? 'hit' : s > 0 && j >= Math.max(0, lo) && j <= i ? 'yes' : j > i ? 'normal' : 'no',
              top: j === i ? 'x' : `[${j}]`, bottom: s > 0 && j >= Math.max(0, lo) && j <= i ? '視窗' : undefined,
            }))} />
          </div>
        </Stage>
        <Stage title="deque（前 → 後遞減，最前面 = 最大）">
          <Seq left="前" right="後" items={dq.map((j) => ({ v: A[j], tone: j === dq[0] && i >= K - 1 ? 'yes' : j === i ? 'active' : 'normal', bottom: `[${j}]` }))} />
        </Stage>
        <Stage title="每個視窗的最大值">
          <Seq items={res.map((v, j) => ({ v, tone: j === res.length - 1 ? 'yes' : 'normal' }))} empty="（視窗還沒滿 3 個）" />
        </Stage>
        {s === 2 && <Note>新來的 3 比 1 大，而且比 1 晚離開視窗：1 永遠沒機會當最大了。</Note>}
      </AlgoBoard>
    </div>
  );
}
