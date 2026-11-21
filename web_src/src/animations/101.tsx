// Animation 101: 環 DP · 為什麼環上不能直接用 ans[u] = 1 + ans[nxt[u]] — hand-written, not traced.
// Same graph as 82 (4 → 3 → 2 → 1 → 2). One step = one idea: follow the dependencies until they go round,
// solve the cycle as one block, then fill the tail backwards.
// steps / results in data.json (8 of each) were written from the same data: change both together.
import React from 'react';
import { AlgoBoard, Stage, GraphView, Seq, Split, Note, type GEdge, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';
import { posNodes, toneClass } from '../animation_kit/AlgoHelpers';

const POS: Record<number, [number, number]> = { 4: [50, 100], 3: [180, 100], 2: [320, 100], 1: [460, 100] };
const NXT: Record<number, number> = { 4: 3, 3: 2, 2: 1, 1: 2 };
const IDS = [1, 2, 3, 4];
export const STEPS = 8;

// which ans[] we are asking for, step by step (steps 1 – 4)
const ASK = [4, 3, 2, 1];
// the answer known after each step
const KNOWN: Record<number, number>[] = [{}, {}, {}, {}, {}, { 1: 2, 2: 2 }, { 1: 2, 2: 2, 3: 3 }, { 1: 2, 2: 2, 3: 3, 4: 4 }];

const NOW = [
  '想用 DP：ans[u] = 1 + ans[nxt[u]]',
  '要算 ans[4]：先要 ans[3]',
  '要算 ans[3]：先要 ans[2]',
  '要算 ans[2]：先要 ans[1]',
  '要算 ans[1]：先要 ans[2]……又回到 ans[2]',
  '把環當成一整塊：環上的人經過的是同一群點',
  '往回填尾巴：ans[3] = 1 + ans[2]',
  '再往外：ans[4] = 1 + ans[3]',
];
const POST = [
  'ans[u] = 從 u 出發會經過幾個不同的點。每個點只有一條出去的邊，所以答案只和下一個點有關',
  'ans[4] 等 ans[3]（還不知道）',
  'ans[3] 等 ans[2]（還不知道）',
  'ans[2] 等 ans[1]（還不知道）',
  '繞了一圈：ans[2] 等 ans[1]、ans[1] 又等 ans[2]，誰都算不出來。而且 1 + ans[2] 會把 1 算兩次（從 2 出發本來就會走到 1）',
  '從 1 或 2 出發，經過的都是 {1, 2}：ans = 環長 = 2。這是這個 DP 的起點（邊界）',
  'ans[3] = 1 + 2 = 3：3 不在環上，走出去就不會再回到 3，所以不會重複算',
  'ans[4] = 1 + 3 = 4。順序：先環，再沿著尾巴由近到遠，每個點只算一次',
];

export default function CycleDependencyAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const known = KNOWN[s];
  const asked = s >= 1 && s <= 4 ? ASK.slice(0, s) : [];
  const cur = s >= 1 && s <= 4 ? ASK[s - 1] : s === 6 ? 3 : s === 7 ? 4 : undefined;
  const loop = s === 4;
  const ring = s >= 4;

  const tone = (n: number): CellTone =>
    n === cur ? 'active' : loop && (n === 1 || n === 2) ? 'hit' : known[n] !== undefined ? 'yes' : asked.includes(n) ? 'blue' : 'normal';
  const nodes = posNodes(POS, (n) => ({
    tone: tone(n),
    above: known[n] !== undefined ? `ans = ${known[n]}` : asked.includes(n) ? 'ans = ?' : undefined,
    below: ring && (n === 1 || n === 2) ? '環' : undefined,
  }));
  const edges: GEdge[] = Object.entries(NXT).map(([a, b]) => {
    const A = +a;
    const waiting = s >= 1 && s <= 4 && asked.includes(A);           // A is waiting for nxt[A]
    const filling = (s === 6 && A === 3) || (s === 7 && A === 4);    // the edge used to fill A
    return { a: A, b, directed: true, bend: A === 1 || A === 2 ? 14 : 0,
      tone: loop && (A === 1 || A === 2) ? 'hit' : filling || waiting ? 'active' : s >= 5 && (A === 1 || A === 2) ? 'chosen' : 'normal' };
  });

  // the chain of "ans[x] needs ans[y]" built in steps 1 – 4
  const chain = s >= 1 && s <= 4 ? [...ASK.slice(0, s), NXT[ASK[s - 1]]] : [];

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={NOW[s]} post={POST[s]} wide>
        <Stage title="4 → 3 → 2 → 1 → 2（藍 = 等答案、紅 = 互相等、綠 = 算好了）">
          <GraphView nodes={nodes} edges={edges} width={510} height={150} />
        </Stage>
        <Split>
            <Stage title="誰在等誰">
              {chain.length === 0 ? (
                <div className="text-sm text-slate-400">{s === 0 ? '（還沒開始算）' : '（不用再等：環先算好）'}</div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm">
                  {chain.map((n, k) => (
                    <React.Fragment key={k}>
                      {k > 0 && <span className={loop && k === chain.length - 1 ? 'text-rose-300' : 'text-slate-400'}>{loop && k === chain.length - 1 ? '等 → 又是' : '等 →'}</span>}
                      <span className={`rounded-md border px-2 py-1 ${toneClass(loop && (n === 1 || n === 2) ? 'hit' : k === chain.length - 1 ? 'dim' : 'blue')}`}>ans[{n}]</span>
                    </React.Fragment>
                  ))}
                  {!loop && <span className="text-slate-500">（還不知道）</span>}
                </div>
              )}
            </Stage>
            <Stage title="ans（從這個點出發經過幾個點）">
              <Seq size="sm" items={IDS.map((n) => ({ v: known[n] ?? '?', top: `[${n}]`, tone: n === cur ? 'active' : known[n] !== undefined ? 'yes' : 'dim' }))} />
            </Stage>
        </Split>
            {s >= 4 && (
              <Note tone={s === 4 ? 'rose' : 'emerald'}>
                {s === 4
                  ? '環上的點互相等：一般 DP 要「先算好的不依賴後算的」，這裡做不到'
                  : '計算順序：① 找到環，整個環一次給答案（環長）② 尾巴由靠近環的往外，ans[u] = 1 + ans[nxt[u]]'}
              </Note>
            )}
      </AlgoBoard>
    </div>
  );
}
