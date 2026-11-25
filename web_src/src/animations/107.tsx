// Animation 107: 割點 · 公司組織圖（越級報告）— hand-written, not traced.
// The same Tarjan dfs as 104, told as a company: DFS tree = org chart (tree edge = normal reporting line),
// back edge = someone who personally knows a higher-up, tin = rank (smaller = higher), low[v] = the highest
// person anyone in v's department can reach. u leaves the company: does v's department lose contact?
// Graph: 0 – 1, 1 – 2, 2 – 3, 3 – 0（3 認識老闆）, 1 – 4, 4 – 5, 5 – 1（5 只認識 1）. Answer: 1 is the only cut vertex.
// Frames are simulated below; data.json steps / results = FRAMES.map(f => f.now / f.post) — regenerate both together.
import React from 'react';
import { AlgoBoard, Stage, GraphView, Table2D, Note, codeTokens, type GEdge, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep, CodePanel, Line } from '../animation_kit/HardwareKit';
import { posNodes } from '../animation_kit/AlgoHelpers';

const N = 6;
const IDS = [0, 1, 2, 3, 4, 5];
const ADJ: number[][] = [[1, 3], [0, 2, 4, 5], [1, 3], [2, 0], [1, 5], [4, 1]];
const ROLE = ['老闆', '主管', 'A 部門頭', 'A 部員', 'B 部門頭', 'B 部員'];
const POS: Record<number, [number, number]> = { 0: [230, 42], 1: [320, 122], 2: [190, 205], 3: [120, 290], 4: [450, 205], 5: [520, 290] };
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [4, 5], [5, 1]];
const BEND: Record<string, number> = { '0-3': -45, '1-5': 75 };
const BOTTOM = [3, 5];
const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// the code the walk follows (lesson code without the root's kids count; the root is explained at the end)
const CODE: [string, string][] = [
  ['def dfs(u, p):', 'dfs(u, p)：u = 主管，p = 他的上司'],
  ['    tin[u] = low[u] = t', '    tin[u] ← t，low[u] ← t（越小越高層）'],
  ['    t += 1', '    t ← t + 1'],
  ['    for v in g[u]:', '    對 u 認識的每個人 v：'],
  ['        if v == p:', '        如果 v 是上司 p：'],
  ['            continue', '            跳過（正常匯報線）'],
  ['        if tin[v] != -1:', '        如果 v 已經有編號（熟人）：'],
  ['            low[u] = min(low[u], tin[v])', '            low[u] ← min(low[u], tin[v])'],
  ['        else:', '        否則（v 是新部屬）：'],
  ['            dfs(v, u)', '            dfs(v, u)：v 先查完自己的部門'],
  ['            low[u] = min(low[u], low[v])', '            low[u] ← min(low[u], low[v])'],
  ['            if p != -1 and low[v] >= tin[u]:', '            如果 u 不是老闆 且 low[v] ≥ tin[u]：'],
  ['                cut[u] = True', '                cut[u] ← True（部門會失聯）'],
];
export const HAS_PSEUDO = true;

type Check = { u: number; v: number; dept: number[]; rope?: [number, number]; ok: boolean };
type Frame = {
  now: string; post: string;
  at?: number;
  stack: number[];               // dfs calls not finished yet
  tin: number[]; low: number[]; cut: boolean[];
  tree: string[]; back: string[];
  edge?: [number, number];       // edge looked at in this step
  check?: Check;
  hotTin?: number; hotLow?: number;
  line?: number; py?: string; zh?: string;
  root?: boolean;
};

function simulate(): Frame[] {
  const F: Frame[] = [];
  const tin = Array(N).fill(-1), low = Array(N).fill(-1), cut = Array(N).fill(false);
  const parent = Array(N).fill(-1);
  const via: ([number, number] | undefined)[] = Array(N).fill(undefined); // the back edge that gives low[u]
  const tree: string[] = [], back: string[] = [];
  const stack: number[] = [];
  let t = 0;
  const snap = (f: Omit<Frame, 'stack' | 'tin' | 'low' | 'cut' | 'tree' | 'back'>) =>
    F.push({ ...f, stack: [...stack], tin: [...tin], low: [...low], cut: [...cut], tree: [...tree], back: [...back] });
  const sub = (v: number): number[] => [v, ...IDS.filter((x) => parent[x] === v).flatMap(sub)];

  snap({
    now: '還沒開始：把 DFS 樹想成公司的組織圖',
    post: '灰線 = 正常匯報線（只報給直屬上司），紅線 = 私下認識更高層的人（越級）。tin = 編號，越小越高層；low[v] = v 整個部門最高能聯絡到誰',
  });

  const dfs = (u: number, p: number) => {
    stack.push(u);
    tin[u] = low[u] = t; t += 1;
    snap({
      now: `dfs(${u})：${ROLE[u]}${p >= 0 ? `，上司是 ${p}` : '，沒有上司'}`,
      post: `給 ${u} 編號 tin = ${tin[u]}；一開始 ${u} 最高只認識自己，low = ${low[u]}`,
      at: u, hotTin: u, hotLow: u, edge: p >= 0 ? [p, u] : undefined,
      line: 1, py: `tin[${u}] = low[${u}] = ⟦${tin[u]}⟧`, zh: `tin[${u}] ← ⟦${tin[u]}⟧，low[${u}] ← ⟦${tin[u]}⟧`,
    });
    for (const v of ADJ[u]) {
      if (v === p) {
        snap({
          now: `${u} 認識 ${v}：是上司`,
          post: `${u} – ${v} 是正常匯報線，不算越級，跳過`,
          at: u, edge: [u, v],
          line: 5, py: 'continue', zh: '跳過（正常匯報線）',
        });
        continue;
      }
      if (tin[v] !== -1) {
        const before = low[u];
        if (!back.includes(key(u, v))) back.push(key(u, v));
        const up = tin[v] < tin[u];
        if (tin[v] < low[u]) { low[u] = tin[v]; via[u] = [u, v]; }
        snap({
          now: `${u} 認識 ${v}：${v} 已經有編號 tin = ${tin[v]}`,
          post: up
            ? `${v} 比 ${u} 高層：這是越級認識的人。low[${u}] = min(${before}, ${tin[v]}) = ${low[u]}`
            : `${v} 是 ${u} 自己部門底下的人，不會更高：low[${u}] = min(${before}, ${tin[v]}) = ${low[u]}，不變`,
          at: u, edge: [u, v], hotLow: u,
          line: 7, py: `low[${u}] = min(${before}, ${tin[v]})  →  ⟦${low[u]}⟧`, zh: `low[${u}] ← min(${before}, ${tin[v]}) = ⟦${low[u]}⟧`,
        });
        continue;
      }
      parent[v] = u;
      tree.push(key(u, v));
      snap({
        now: `${u} 認識 ${v}：還沒有編號 → ${v} 是新部屬`,
        post: `${v} 帶一個部門。先呼叫 dfs(${v})，讓 ${v} 把自己的部門查完`,
        at: u, edge: [u, v],
        line: 9, py: `dfs(⟦${v}⟧, ${u})`, zh: `dfs(⟦${v}⟧, ${u})：${v} 先查完自己的部門`,
      });
      dfs(v, u);
      const before = low[u];
      if (low[v] < low[u]) { low[u] = low[v]; via[u] = via[v]; }
      snap({
        now: `回到 dfs(${u})：${v} 的部門查完了，low[${v}] = ${low[v]}`,
        post: `${v} 的部門最高認識到 tin ${low[v]}，${u} 的部門也算進去：low[${u}] = min(${before}, ${low[v]}) = ${low[u]}`,
        at: u, edge: [u, v], hotLow: u,
        line: 10, py: `low[${u}] = min(${before}, ${low[v]})  →  ⟦${low[u]}⟧`, zh: `low[${u}] ← min(${before}, ${low[v]}) = ⟦${low[u]}⟧`,
      });
      if (p === -1) continue;
      const dept = sub(v);
      const ok = low[v] < tin[u];
      const rope = via[v];
      const deptTxt = dept.join('、');
      snap({
        now: `假設 ${u} 離職：${v} 的部門（${deptTxt}）還聯絡得到公司嗎？`,
        post: ok
          ? `low[${v}] = ${low[v]} < tin[${u}] = ${tin[u]}：部門裡的 ${rope![0]} 認識 ${rope![1]}（比 ${u} 高層），可以越級聯絡，沒事`
          : `low[${v}] = ${low[v]} ≥ tin[${u}] = ${tin[u]}：整個部門最高只認識 ${u} 本人。${u} 一走，這個部門就和公司失聯了`,
        at: u, check: { u, v, dept, rope, ok },
        line: 11,
        py: `if ${p} != -1 and ${low[v]} >= ${tin[u]}  →  ⟦${ok ? 'False' : 'True'}⟧`,
        zh: `如果 ${u} 不是老闆 且 ${low[v]} ≥ ${tin[u]}  →  ⟦${ok ? '不成立' : '成立'}⟧`,
      });
      if (!ok) {
        cut[u] = true;
        snap({
          now: `${u} 是割點`,
          post: `只要有一個部門會失聯就夠了：拿掉 ${u}，${deptTxt} 就和上面斷開`,
          at: u, check: { u, v, dept, rope, ok },
          line: 12, py: `cut[${u}] = ⟦True⟧`, zh: `cut[${u}] ← ⟦True⟧（部門會失聯）`,
        });
      }
    }
    stack.pop();
  };
  dfs(0, -1);

  const kids = IDS.filter((x) => parent[x] === 0).length;
  snap({
    now: '全部查完。最後看老闆（DFS 的根）',
    post: `老闆沒有上司，不能用 low 判斷（每個部門都「碰得到」老闆）。改看他有幾個直屬部門：這裡只有 ${kids} 個，老闆走了其他人還連在一起，所以不是割點。答案：割點只有 ${IDS.filter((x) => cut[x]).join('、')}`,
    root: true,
  });
  return F;
}

export const FRAMES = simulate();
export const STEPS = FRAMES.length;

export default function ArticulationOrgChartAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const f = FRAMES[s];
  const c = f.check;
  const open = (n: number) => f.stack.includes(n);

  const tone = (n: number): CellTone => {
    if (c) {
      if (n === c.u) return c.ok ? 'active' : 'hit';
      if (c.dept.includes(n)) return c.ok ? 'blue' : 'hit';
      if (c.rope && n === c.rope[1] && c.ok) return 'yes';
      return 'dim';
    }
    if (f.cut[n]) return 'hit';
    if (n === f.at) return 'active';
    if (open(n)) return 'stack';
    if (f.tin[n] >= 0) return 'yes';
    return 'normal';
  };
  // tin / low live in the table; the graph only names the role (bottom row: under the node, clear of the edges)
  const nodes = posNodes(POS, (n) => {
    const tag = c && n === c.u && !c.ok ? `${ROLE[n]}（離職）` : f.cut[n] ? `${ROLE[n]} · 割點` : ROLE[n];
    return BOTTOM.includes(n) ? { tone: tone(n), below: tag } : { tone: tone(n), above: tag };
  });
  const edges: GEdge[] = EDGES.map(([a, b]) => {
    const k = key(a, b);
    const isTree = f.tree.includes(k), isBack = f.back.includes(k);
    const cur = f.edge && key(f.edge[0], f.edge[1]) === k;
    let t: GEdge['tone'] = isTree ? 'normal' : isBack ? 'hit' : 'dim';
    if (c) {
      // only the department's best contact matters now: green = it reaches above u, red = it only reaches u
      const rope = c.rope && key(c.rope[0], c.rope[1]) === k;
      if (rope) t = c.ok ? 'chosen' : 'hit';
      else if (isBack || (!c.ok && (a === c.u || b === c.u))) t = 'dim';
    } else if (cur) t = 'active';
    return { a, b, tone: t, bend: BEND[k] };
  });

  const row = (name: string, vals: (number | boolean)[], hot?: number) => ({
    head: name,
    cells: IDS.map((i) => {
      const v = vals[i];
      const shown = typeof v === 'boolean' ? (v ? 'T' : 'F') : v < 0 ? '–' : v;
      const t: CellTone = i === hot ? 'active' : typeof v === 'boolean' ? (v ? 'hit' : 'normal') : v < 0 ? 'dim' : 'normal';
      return { v: shown, tone: t };
    }),
  });

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={f.now} post={f.post} wide>
        <div className="grid w-full gap-3 @3xl:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3">
            <Stage title="組織圖（黃 = 現在、紫虛線 = 還在查、灰線 = 匯報線、紅線 = 越級認識）">
              <GraphView nodes={nodes} edges={edges} width={600} height={330} />
            </Stage>
            {c ? (
              c.ok ? (
                <Note tone="emerald">{c.u} 離職也沒事：{c.v} 的部門（{c.dept.join('、')}）裡的 {c.rope![0]} 認識 {c.rope![1]}，綠線就是越級聯絡的路。</Note>
              ) : (
                <Note tone="rose">{c.u} 離職：{c.v} 的部門（{c.dept.join('、')}）最高只認識 {c.u}，沒有別條路通到上面 → 失聯。</Note>
              )
            ) : f.root ? (
              <Note tone="amber">老闆（根）另外判斷：直屬部門 ≥ 2 個才是割點。不同部門之間沒有線，老闆一走它們就分開了。</Note>
            ) : (
              <Note tone="sky">low[v] = v 整個部門最高能聯絡到的人。比 tin[u] 小 = 認識 u 的上面，u 走了也沒事。</Note>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <Stage title="tin（編號，越小越高層）、low（部門最高認識到誰）">
              <Table2D corner="" colHeads={IDS.map((i) => `${i}`)} rows={[row('tin', f.tin, f.hotTin), row('low', f.low, f.hotLow), row('cut', f.cut)]} />
            </Stage>
            <CodePanel pseudo>
              {CODE.map(([py, zh], i) => {
                const cur = f.line === i;
                const ind = (t: string) => Math.floor(t.match(/^ */)![0].length / 4);
                const show = (t: string, live?: string) => codeTokens(cur && live ? live : t.trim());
                return <Line key={i} pc={cur} indent={ind(py)} pseudo={show(zh, f.zh)}>{show(py, f.py)}</Line>;
              })}
            </CodePanel>
          </div>
        </div>
      </AlgoBoard>
    </div>
  );
}
