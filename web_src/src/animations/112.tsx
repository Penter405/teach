// Animation 112: 滑動視窗最大值 — 只看資料：新來的 x 往左踢 ←，視窗裡比 x 小（或一樣）的數以後不可能是最大。
// Hand-written (not traced). a = [5, 3, 4, 1, 2, 6], k = 3. Candidates left (purple) are the deque,
// they go down from left to right; the leftmost candidate in the window is the max.
// steps / results in data.json come from TEXT below (steps[0] = 還沒開始執行): change both together.
import React from 'react';
import { AlgoBoard, Stage, Note, Seq, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';
import { ArcBars, type Arc } from '../animation_kit/AlgoHelpers';

const A = [5, 3, 4, 1, 2, 6];
const K = 3;
const N = A.length;

type Step = {
  now: string; post: string; cur: number; dq: number[]; kicked: number[]; gone: number[]; arcs: [number, number][];
  res: number[]; shot?: number; out?: number; best?: number; end?: boolean;
};

function build(): Step[] {
  const out: Step[] = [{
    now: `還沒開始：a = [${A.join(', ')}]，k = ${K}`,
    post: `長度 ${K} 的視窗一路往右滑，每次的最大值？新來的 x 比較晚離開，視窗裡比 x 小的數以後永遠贏不了 x，可以直接丟掉`,
    cur: -1, dq: [], kicked: [], gone: [], arcs: [], res: [],
  }];
  const dq: number[] = [], kicked: number[] = [], gone: number[] = [], arcs: [number, number][] = [], res: number[] = [];
  const snap = () => ({ dq: [...dq], kicked: [...kicked], gone: [...gone], arcs: [...arcs], res: [...res] });
  A.forEach((x, i) => {
    let first = true;
    while (dq.length && A[dq[dq.length - 1]] <= x) {
      const j = dq.pop()!;
      kicked.push(j);
      arcs.push([i, j]);
      out.push({
        now: `${first ? `${x} 進來，往左看` : '再往左看'}：最右邊的候選是 ${A[j]}`,
        post: `${A[j]} ≤ ${x}：${x} 比較晚離開視窗又不比它小，${A[j]} 以後不可能是最大，踢掉（${x} ← ${A[j]}）`,
        cur: i, ...snap(), shot: j,
      });
      first = false;
    }
    const top = dq.length ? dq[dq.length - 1] : undefined;
    dq.push(i);
    out.push({
      now: first ? `${x} 進來，往左看` : '再往左看',
      post: top === undefined
        ? `${first ? '還沒有候選' : '沒有候選了'}，${x} 成為候選`
        : `最右邊的候選 ${A[top]} > ${x}，停。${x} 也是候選：等前面的大數滑出去，它可能變最大`,
      cur: i, ...snap(),
    });
    if (dq[0] <= i - K) {
      const f = dq.shift()!;
      gone.push(f);
      out.push({
        now: `視窗變成 [${i - K + 1}, ${i}]，看最左邊的候選 ${A[f]}`,
        post: `${A[f]} 在 index ${f}，已經滑出視窗，拿掉`,
        cur: i, ...snap(), out: f,
      });
    }
    if (i >= K - 1) {
      res.push(A[dq[0]]);
      out.push({
        now: `視窗 [${i - K + 1}, ${i}] 的最大值`,
        post: `視窗裡最左邊的候選 = ${A[dq[0]]}，就是最大值（候選由左到右變小）。res = [${res.join(', ')}]`,
        cur: i, ...snap(), best: dq[0],
      });
    }
  });
  out.push({
    now: '掃完了',
    post: `res = [${res.join(', ')}]。每個數最多進來一次、被踢或滑出去一次，O(n)`,
    cur: -1, ...snap(), end: true,
  });
  return out;
}

export const TEXT = build();
export const STEPS = TEXT.length;

export default function WindowMaxArrowsAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const st = TEXT[s];
  const tone = (i: number): CellTone => {
    if (i === st.out || i === st.shot) return 'hit';
    if (i === st.best) return 'yes';
    if (i === st.cur) return 'active';
    if (st.dq.includes(i)) return 'stack';
    if (st.kicked.includes(i) || st.gone.includes(i)) return 'no';
    return st.cur < 0 && !st.end ? 'normal' : 'dim';
  };
  const arcs: Arc[] = st.arcs.map(([from, to]) => ({ from, to, tone: to === st.shot ? 'hit' : 'dim' }));
  const band = st.cur >= 0 ? { from: Math.max(0, st.cur - K + 1), to: st.cur, label: '視窗' } : null;
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={st.now} post={st.post} switches={[]} wide>
        <Stage title="陣列（← = 被新來的踢掉，紫色虛線 = 還是候選，藍框 = 視窗）">
          <ArcBars values={A} tones={A.map((_, i) => tone(i))} arcs={arcs} band={band}
            top={(i) => (i === st.best ? 'max' : i === st.cur ? 'x' : st.gone.includes(i) ? '滑出' : '')} />
        </Stage>
        <div className="grid w-full gap-3 @3xl:grid-cols-[1fr_1fr_1fr]">
          <Stage title="候選（就是程式裡的 deque）">
            <Seq size="sm" left="前" right="後" items={st.dq.map((j) => ({ v: A[j], tone: j === st.best ? 'yes' : j === st.cur ? 'active' : 'stack', bottom: `[${j}]` }))} />
          </Stage>
          <Stage title="res（每個視窗的最大值）">
            <Seq size="sm" items={st.res.map((v, k) => ({ v, tone: k === st.res.length - 1 && st.best !== undefined ? 'yes' : 'normal' }))} />
          </Stage>
          <Note tone="sky">和下一個更大一樣：新來的往左踢掉比它小的。多一條規則：視窗往右滑，最左邊的候選掉出去就拿掉。</Note>
        </div>
      </AlgoBoard>
    </div>
  );
}
