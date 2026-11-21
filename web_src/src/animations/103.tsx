// Animation 103: 樹重心 — hand-written, not traced (the point is the equation, not each action).
// One step = one idea: sizes bottom-up → the pieces left after removing v → max_part(v) for every v → walk from the root.
// steps / results in data.json (11 of each) are NOW / POST below: change both together.
import React from 'react';
import { AlgoBoard, Stage, GraphView, Split, Note, Table2D, FitWidth, type GEdge, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';
import { posNodes } from '../animation_kit/AlgoHelpers';

export const PAR = [-1, 0, 0, 1, 1, 1, 2, 3, 3];
export const N = PAR.length; // 9
const HALF = N / 2;
const POS: Record<number, [number, number]> = { 0: [250, 42], 1: [150, 115], 2: [370, 115], 3: [70, 190], 4: [150, 190], 5: [230, 190], 6: [370, 190], 7: [40, 260], 8: [100, 260] };
const CH: number[][] = PAR.map((_, u) => PAR.flatMap((p, v) => (p === u ? [v] : [])));
const DEPTH: number[] = PAR.map((_, u) => { let d = 0; for (let x = u; PAR[x] !== -1; x = PAR[x]) d++; return d; });
const SUB = (v: number): number[] => [v, ...CH[v].flatMap(SUB)];
const SZ: number[] = PAR.map((_, u) => SUB(u).length);
/** pieces left after removing v: one per child, plus the part above v */
const pieces = (v: number) => [
  ...CH[v].map((c) => ({ label: `sz(${c})`, nodes: SUB(c) })),
  ...(PAR[v] === -1 ? [] : [{ label: `n − sz(${v})`, nodes: PAR.map((_, i) => i).filter((i) => !SUB(v).includes(i)) }]),
];
const MAXP: number[] = PAR.map((_, v) => Math.max(...pieces(v).map((p) => p.nodes.length)));
const BEST = Math.min(...MAXP);
export const STEPS = 11;

export const NOW = [
  '還沒開始：刪掉一個點，樹會斷成好幾塊',
  '由下往上算子樹大小：第 3 層（葉子）',
  '第 2 層：sz(u) = 1 + 子節點的 sz 加起來',
  '第 1 層',
  '第 0 層（根）：sz(0) = n',
  '刪掉 3：剩下哪幾塊？',
  '刪掉 0（根）：沒有上面那一塊',
  '刪掉 1',
  '每個點都算一次 max_part，最小的就是重心',
  '更快：從根出發，往 sz > n/2 的子節點走',
  '走到 1：沒有子節點 > n/2，停下',
];
export const POST = [
  `n = ${N}。重心 = 刪掉後「最大的那一塊」最小的點；一定找得到一個點，讓每一塊都 ≤ n/2 = ${HALF}`,
  'sz(7) = sz(8) = 1',
  `sz(3) = 1 + 1 + 1 = ${SZ[3]}；4、5、6 是葉子，sz = 1`,
  `sz(1) = 1 + 3 + 1 + 1 = ${SZ[1]}；sz(2) = 1 + 1 = ${SZ[2]}`,
  `sz(0) = 1 + 6 + 2 = ${SZ[0]}`,
  `子樹 7、8 各 1 塊；上面那一塊 = n − sz(3) = ${N} − ${SZ[3]} = ${N - SZ[3]}。max_part(3) = ${MAXP[3]} > ${HALF}，不行`,
  `兩塊：sz(1) = ${SZ[1]}、sz(2) = ${SZ[2]}。max_part(0) = ${MAXP[0]} > ${HALF}，不行`,
  `子樹 3、4、5：${SZ[3]}、${SZ[4]}、${SZ[5]}；上面 n − sz(1) = ${N - SZ[1]}。max_part(1) = ${MAXP[1]} ≤ ${HALF}，可以`,
  `max_part = [${MAXP.join(', ')}]，最小是 ${BEST}，在點 ${MAXP.indexOf(BEST)}。每個點 O(子節點數)，全部 O(n)`,
  `sz(1) = ${SZ[1]} > ${HALF}：0 不行，而且子樹 1 以外的點也都不行（那一塊至少有 ${SZ[1]} 個點），答案一定在子樹 1 裡`,
  `子節點都 ≤ ${HALF}；上面 = n − sz(1) = ${N - SZ[1]} < ${HALF}，因為剛才是 sz(1) > n/2 才走下來的。1 就是重心`,
];

export default function CentroidAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  // sizes known so far (steps 1 – 4 fill one depth level each, deepest first)
  const known = (u: number) => s >= 5 || (s >= 1 && DEPTH[u] >= 4 - s);
  const removed = s === 5 ? 3 : s === 6 ? 0 : s === 7 ? 1 : undefined;
  const ps = removed === undefined ? [] : pieces(removed);
  const big = ps.length ? ps.reduce((a, b) => (b.nodes.length > a.nodes.length ? b : a)) : undefined;
  const walk = s === 9 ? [0, 1] : s === 10 ? [0, 1] : [];
  const cur = s === 9 ? 0 : s === 10 ? 1 : undefined;
  const centroid = s === 8 || s === 10;
  const levelNow = (u: number) => s >= 1 && s <= 4 && DEPTH[u] === 4 - s;

  const tone = (u: number): CellTone => {
    if (u === removed) return 'no';
    if (big && big.nodes.includes(u)) return big.nodes.length > HALF ? 'hit' : 'yes';
    if (ps.some((p) => p.nodes.includes(u))) return 'blue';
    if (centroid && MAXP[u] === BEST) return 'yes';
    if (u === cur) return 'active';
    if (walk.includes(u)) return 'blue';
    if (levelNow(u)) return 'active';
    return 'normal';
  };
  const nodes = posNodes(POS, (u) => ({
    tone: tone(u),
    above: u === removed ? '刪掉' : centroid && MAXP[u] === BEST ? '重心' : known(u) ? `sz ${SZ[u]}` : undefined,
    below: s === 8 ? `max ${MAXP[u]}` : undefined,
  }));
  const edges: GEdge[] = PAR.flatMap((p, v) => (p === -1 ? [] : [{
    a: p, b: v,
    tone: (removed !== undefined && (p === removed || v === removed) ? 'dim' : walk.includes(p) && walk.includes(v) ? 'chosen' : 'normal') as GEdge['tone'],
  }]));

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={NOW[s]} post={POST[s]} wide>
        <Split>
          <Stage title="樹（紅 = 超過 n/2 的那一塊、藍 = 其他塊、綠 = 重心）">
            <GraphView nodes={nodes} edges={edges} width={430} height={300} />
          </Stage>
          <div className="flex flex-col gap-3">
            <Stage title="公式">
              <div className="flex flex-col gap-1.5 font-mono text-sm text-slate-200">
                <div className={s >= 1 && s <= 4 ? 'text-amber-200' : ''}>sz(u) = 1 + Σ sz(c)　（c = u 的子節點）</div>
                <div className={s >= 5 && s <= 8 ? 'text-amber-200' : ''}>max_part(v) = max( max sz(c), n − sz(v) )</div>
                <div className={s >= 9 ? 'text-amber-200' : ''}>sz(c) &gt; n/2 ⇒ n − sz(c) &lt; n/2</div>
                {removed !== undefined && (
                  <div className="mt-1 rounded-md border border-slate-700 px-2 py-1 text-[13px]">
                    max_part({removed}) = max( {ps.map((p) => `${p.label}=${p.nodes.length}`).join(', ')} ) = <b className={MAXP[removed] > HALF ? 'text-rose-300' : 'text-emerald-300'}>{MAXP[removed]}</b>
                  </div>
                )}
              </div>
            </Stage>
            {s >= 8 && (
              <Stage title="每個點的 max_part">
                <FitWidth><Table2D corner="v" colHeads={PAR.map((_, i) => `${i}`)} rows={[
                  { head: 'sz', cells: SZ.map((x) => ({ v: x })) },
                  { head: 'max', cells: MAXP.map((x) => ({ v: x, tone: x === BEST ? 'yes' : x > HALF ? 'no' : 'normal' })) },
                ]} /></FitWidth>
              </Stage>
            )}
            {s >= 9 && (
              <Note tone={s === 9 ? 'amber' : 'emerald'}>
                {s === 9
                  ? 'sz > n/2 的子節點最多一個（兩個加起來就超過 n 了），所以路只有一條'
                  : '每走一步，往下的那一塊變小；上面那一塊一定 < n/2。停下的點，每一塊都 ≤ n/2'}
              </Note>
            )}
          </div>
        </Split>
      </AlgoBoard>
    </div>
  );
}
