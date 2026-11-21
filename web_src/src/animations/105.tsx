// Animation 105: 環 DP 用 DFS · 沿著箭頭呼叫 dfs，return 的時候把答案寫在點旁邊 — hand-written, not traced.
// Graph: 6 → 5 → 1 → 2 → 3 → 4 → 1（環 1-2-3-4，長 4），7 → 3。
// 紫色（stack）= dfs(n) 還沒結束；黃色（active）= 現在在這個點。
// Frames are simulated below; data.json steps / results = FRAMES.map(f => f.now / f.post) — regenerate both together.
import React from 'react';
import { AlgoBoard, Stage, GraphView, Split, Seq, StackView, type GEdge, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep, CodePanel, Line } from '../animation_kit/HardwareKit';
import { codeTokens } from '../animation_kit/AlgoKit';
import { posNodes } from '../animation_kit/AlgoHelpers';

const NXT: Record<number, number> = { 1: 2, 2: 3, 3: 4, 4: 1, 5: 1, 6: 5, 7: 3 };
const IDS = [1, 2, 3, 4, 5, 6, 7];
const POS: Record<number, [number, number]> = { 6: [45, 120], 5: [150, 120], 1: [265, 120], 2: [375, 45], 3: [485, 120], 4: [375, 195], 7: [590, 195] };
const STARTS = [6, 7];

type Frame = {
  now: string; post: string;
  at?: number;                 // where we are now
  edge?: [number, number];     // the arrow used in this step (call goes along it, the answer comes back along it)
  stack: number[];             // dfs calls not finished yet, bottom → top
  ans: Record<number, number>;
  ring?: number[];
  formula?: string;
  hot?: number;
  line?: number;               // code line (0-based) this step is on
  py?: string;                 // that line right now, Python (⟦v⟧ = value just produced)
  zh?: string;                 // that line right now, 中文步驟
};

// the code the walk follows (the same dfs as 特殊郵件, with ans / depth)
const CODE: [string, string][] = [
  ['def dfs(u, d):', 'dfs(u, d)：從 u 出發，d = 第幾層'],
  ['    global st', '    （st 用外面的：-1 = 不在環裡）'],
  ['    if ans[u] > 0:', '    如果 u 算過了（ans[u] > 0）：'],
  ['        return ans[u]', '        回傳 ans[u]'],
  ['    if depth[u] >= 0:', '    如果 depth[u] ≥ 0（還沒結束）：'],
  ['        st = u', '        st ← u（環從 u 開始）'],
  ['        return d - depth[u]', '        回傳 環長 d − depth[u]'],
  ['    depth[u] = d', '    depth[u] ← d（變紫色）'],
  ['    r = dfs(nxt[u], d + 1)', '    r ← 問下一個：dfs(nxt[u], d + 1)'],
  ['    depth[u] = -2', '    depth[u] ← -2（結束）'],
  ['    if st != -1:', '    如果 st ≠ -1（還在環裡）：'],
  ['        ans[u] = r', '        ans[u] ← r（環長）'],
  ['        if u == st:', '        如果 u = st（環的起點）：'],
  ['            st = -1', '            st ← -1（離開環）'],
  ['        return r', '        回傳 r'],
  ['    ans[u] = r + 1', '    ans[u] ← r + 1'],
  ['    return r + 1', '    回傳 r + 1'],
];
export const HAS_PSEUDO = true;

function simulate(): Frame[] {
  const F: Frame[] = [];
  const ans: Record<number, number> = {};
  let ring: number[] | undefined;
  F.push({ now: '還沒開始執行', post: 'dfs(u)：先呼叫 dfs(下一個點)，等它回傳，再算自己的 ans。紫色 = dfs 還沒結束（還在 call stack 上），黃色 = 現在在這裡', stack: [], ans: {} });
  for (const s of STARTS) {
    const stack: number[] = [];
    let u = s;
    let prev: number | undefined;
    let ret = 0;
    let st: number | undefined;
    for (;;) {
      const edge: [number, number] | undefined = prev === undefined ? undefined : [prev, u];
      if (ans[u] !== undefined) {
        ret = ans[u];
        F.push({ now: `呼叫 dfs(${u})：ans[${u}] 已經算好了`, post: `直接回傳 ${ret}，不用再往下走（記憶化）`, at: u, edge, stack: [...stack], ans: { ...ans }, ring, formula: `dfs(${u}) = ans[${u}] = ${ret}（以前算過）`,
          line: 3, py: `return ⟦${ret}⟧`, zh: `回傳 ⟦${ret}⟧` });
        break;
      }
      if (stack.includes(u)) {
        const k = stack.indexOf(u);
        ring = stack.slice(k);
        st = u;
        ret = ring.length;
        F.push({
          now: `呼叫 dfs(${u})：${u} 是紫色，dfs(${u}) 還沒結束又被呼叫 → 繞回來了`,
          post: `環 = ${[...ring, u].join(' → ')}。回傳環長 ${ret}`,
          at: u, edge, stack: [...stack], ans: { ...ans }, ring,
          formula: `環長 = 現在第 ${stack.length} 層 − dfs(${u}) 在第 ${k} 層 = ${ret}`,
          line: 6, py: `return ${stack.length} - ${k}  →  ⟦${ret}⟧`, zh: `回傳 環長 ${stack.length} − ${k} = ⟦${ret}⟧`,
        });
        break;
      }
      stack.push(u);
      F.push({ now: `呼叫 dfs(${u})：第 ${stack.length - 1} 層`, post: `${u} 還沒有答案，dfs(${u}) 先不結束，去呼叫 dfs(${NXT[u]})`, at: u, edge, stack: [...stack], ans: { ...ans }, ring,
        line: 8, py: `r = dfs(⟦${NXT[u]}⟧, ${stack.length})`, zh: `r ← 問下一個：dfs(⟦${NXT[u]}⟧, ${stack.length})` });
      prev = u; u = NXT[u];
    }
    // return one call at a time
    let inRing = st !== undefined;
    while (stack.length) {
      const x = stack[stack.length - 1];
      if (inRing) {
        ans[x] = ret;
        const leave = x === st;
        F.push({ now: `回到 dfs(${x})：還在環裡`, post: `ans[${x}] = 環長 = ${ret}` + (leave ? `。${x} 就是環的起點，再往回就不在環上了` : ''), at: x, edge: [x, NXT[x]], stack: [...stack], ans: { ...ans }, ring, formula: `ans[${x}] = 環長 = ${ret}`, hot: x,
          line: 11, py: `ans[${x}] = ⟦${ret}⟧`, zh: `ans[${x}] ← r = ⟦${ret}⟧（環長）` });
        if (leave) inRing = false;
      } else {
        ans[x] = 1 + ret;
        F.push({ now: `回到 dfs(${x})：ans[${x}] = 1 + dfs(${NXT[x]})`, post: `${x} 自己 1 個，加上從 ${NXT[x]} 開始的 ${ret} 個 = ${ans[x]}`, at: x, edge: [x, NXT[x]], stack: [...stack], ans: { ...ans }, ring, formula: `ans[${x}] = 1 + ${ret} = ${ans[x]}`, hot: x,
          line: 15, py: `ans[${x}] = ${ret} + 1  →  ⟦${ans[x]}⟧`, zh: `ans[${x}] ← r + 1 = ${ret} + 1 = ⟦${ans[x]}⟧` });
      }
      ret = ans[x];
      stack.pop();
    }
  }
  const best = Math.max(...IDS.map((i) => ans[i]));
  F.push({ now: '全部的 dfs 都結束了', post: `每個點只寫一次答案。最多的是 ${IDS.find((i) => ans[i] === best)}：ans = ${best}`, stack: [], ans: { ...ans }, ring });
  return F;
}

export const FRAMES = simulate();
export const STEPS = FRAMES.length;

export default function CycleDfsWalkAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const f = FRAMES[s];
  const open = (n: number) => f.stack.includes(n) && f.ans[n] === undefined;   // dfs(n) not finished
  const tone = (n: number): CellTone => (n === f.at ? 'active' : open(n) ? 'stack' : f.ans[n] !== undefined ? 'yes' : 'normal');
  const nodes = posNodes(POS, (n) => ({
    tone: tone(n),
    above: f.ans[n] !== undefined ? `ans = ${f.ans[n]}` : open(n) ? `第 ${f.stack.indexOf(n)} 層` : undefined,
    below: n === f.at ? '📍' : f.ring?.includes(n) ? '環' : undefined,
  }));
  const ringEdge = (a: number) => !!f.ring && f.ring.includes(a) && f.ring.includes(NXT[a]);
  const edges: GEdge[] = Object.entries(NXT).map(([a, b]) => {
    const A = +a;
    const used = f.edge && f.edge[0] === A && f.edge[1] === b;
    return { a: A, b, directed: true, tone: used ? 'active' : ringEdge(A) ? 'hit' : 'normal' };
  });

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={f.now} post={f.post} wide>
        <Stage title="黃 = 現在在這、紫（虛線）= dfs 還沒結束、綠 = 答案寫好了、紅線 = 環">
          <GraphView nodes={nodes} edges={edges} width={640} height={240} />
        </Stage>
        <div className={`min-h-[2.5rem] rounded-lg border px-3 py-2 text-center font-mono text-base ${f.formula ? 'border-amber-500/60 bg-amber-950/40 text-amber-100' : 'border-transparent'}`}>
          {f.formula ?? ''}
        </div>
        <Split>
          <CodePanel pseudo>
            {CODE.map(([py, zh], i) => {
              const cur = f.line === i;
              const ind = (t: string) => Math.floor(t.match(/^ */)![0].length / 4);
              const show = (t: string, live?: string) => codeTokens(cur && live ? live : t.trim());
              return (
                <Line key={i} pc={cur} indent={ind(py)} pseudo={show(zh, f.zh)}>{show(py, f.py)}</Line>
              );
            })}
          </CodePanel>
          <div className="flex flex-col gap-3">
          <Stage title="call stack（上面 = 最後呼叫的）">
            <StackView items={[...f.stack].reverse().map((n) => ({ v: `dfs(${n})`, tone: n === f.at ? 'active' : 'stack', note: `第 ${f.stack.indexOf(n)} 層` }))} empty="（沒有 dfs 在跑）" />
          </Stage>
          <Stage title="ans">
            <Seq size="sm" items={IDS.map((n) => ({ v: f.ans[n] ?? '?', top: `[${n}]`, tone: n === f.hot ? 'active' : f.ans[n] !== undefined ? 'yes' : 'dim' }))} />
          </Stage>
          </div>
        </Split>
      </AlgoBoard>
    </div>
  );
}
