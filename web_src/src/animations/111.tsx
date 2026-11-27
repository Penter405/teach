// Animation 111: 下一個更大 — 只看資料：新來的 x 往左射 ←，射到每個還在等、比它小的數。
// Hand-written (not traced). a = [2, 1, 5, 3, 6, 4], same as the code in the lesson. The numbers
// still waiting (no arrow yet) are exactly the stack, and they always go down from left to right.
// steps / results in data.json come from TEXT below (steps[0] = 還沒開始執行): change both together.
import React from 'react';
import { AlgoBoard, Stage, Note, Seq, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';
import { ArcBars, type Arc } from '../animation_kit/AlgoHelpers';

const A = [2, 1, 5, 3, 6, 4];
const N = A.length;

type Step = { now: string; post: string; cur: number; wait: number[]; ans: (number | null)[]; arcs: [number, number][]; shot?: number; stop?: number; end?: boolean };

function build(): Step[] {
  const out: Step[] = [{
    now: `還沒開始：a = [${A.join(', ')}]`,
    post: '問題：每個數右邊第一個比它大的是誰？換個方向想：新來的 x 往左看，還在等答案、比 x 小的數，答案就是 x',
    cur: -1, wait: [], ans: Array(N).fill(null), arcs: [],
  }];
  const wait: number[] = [];
  const ans: (number | null)[] = Array(N).fill(null);
  const arcs: [number, number][] = [];
  A.forEach((x, i) => {
    let first = true;
    while (wait.length && A[wait[wait.length - 1]] < x) {
      const j = wait.pop()!;
      ans[j] = x;
      arcs.push([i, j]);
      out.push({
        now: `${first ? `${x} 進來，往左看` : '再往左看'}：還在等的最右邊是 ${A[j]}`,
        post: `${A[j]} < ${x}，${A[j]} 的答案就是 ${x}（${x} ← ${A[j]}），它不用再等了`,
        cur: i, wait: [...wait], ans: [...ans], arcs: [...arcs], shot: j,
      });
      first = false;
    }
    const top = wait.length ? wait[wait.length - 1] : undefined;
    wait.push(i);
    out.push({
      now: first ? `${x} 進來，往左看` : '再往左看',
      post: top === undefined
        ? `${first ? '還沒有人在等' : '沒有人在等了'}，${x} 開始等答案`
        : `還在等的最右邊是 ${A[top]} > ${x}，停：再左邊的更大，${x} 一定射不到。${x} 開始等答案`,
      cur: i, wait: [...wait], ans: [...ans], arcs: [...arcs], stop: top,
    });
  });
  out.push({
    now: '掃完了',
    post: `還在等的 ${wait.map((j) => A[j]).join('、')} 右邊沒有更大的，答案 = -1。每個數最多被 ← 射到一次，O(n)`,
    cur: -1, wait: [...wait], ans: ans.map((v) => v ?? -1), arcs: [...arcs], end: true,
  });
  return out;
}

export const TEXT = build();
export const STEPS = TEXT.length;

export default function NextGreaterArrowsAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const st = TEXT[s];
  const tone = (i: number): CellTone => {
    if (i === st.cur) return 'active';
    if (i === st.shot) return 'yes';
    if (st.wait.includes(i)) return 'stack';
    if (st.ans[i] != null) return 'no';
    return st.cur < 0 && !st.end ? 'normal' : i > st.cur && !st.end ? 'dim' : 'no';
  };
  const arcs: Arc[] = st.arcs.map(([from, to]) => ({ from, to, tone: to === st.shot ? 'active' : 'chosen' }));
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={st.now} post={st.post} switches={[]} wide>
        <Stage title="陣列（← = 「我就是你的答案」，紫色虛線 = 還在等）">
          <ArcBars values={A} tones={A.map((_, i) => tone(i))} arcs={arcs} bottomName="ans" bottom={(i) => st.ans[i]} top={(i) => (i === st.cur ? 'x' : i === st.stop ? '擋住' : '')} />
        </Stage>
        <div className="grid w-full gap-3 @3xl:grid-cols-[1fr_1fr]">
          <Stage title="還在等的數（就是程式裡的 stack）">
            <Seq size="sm" left="底" right="頂" items={st.wait.map((j) => ({ v: A[j], tone: j === st.cur ? 'active' : 'stack', bottom: `[${j}]` }))} />
          </Stage>
          <Note tone="sky">只想「掃過資料、找右邊第一個更大」：不用畫 stack，就是每個數往左射 ←。射不到的一定在更大的數後面（被擋住），所以還在等的數由左到右一路變小——這就是單調堆疊。</Note>
        </div>
      </AlgoBoard>
    </div>
  );
}
