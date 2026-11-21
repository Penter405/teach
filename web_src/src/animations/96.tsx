// Animation 96: Mo's algorithm · 排序規則 (x[0] // end, x[1]) — hand-written, not traced.
// One step = one idea: block of each query → primary rule → secondary rule → why l only uses the block.
// steps / results in data.json (7 of each) were written from the same data: change both together.
import React from 'react';
import { AlgoBoard, Stage, Split, ValueCell, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep, CodePanel, Line, Tok, type TokState } from '../animation_kit/HardwareKit';
import { QueryPlot, PointerSeq, Stat, toneClass, type Query } from '../animation_kit/AlgoHelpers';

// same data as 93, written 0-indexed like the student's code (l - 1, r - 1)
export const A = [2, 1, 1, 3, 1, 4, 5, 2];
export const N = A.length;
export const END = Math.floor(Math.sqrt(N)); // int(8 ** 0.5) = 2
export const QS: Query[] = [[1, 4], [1, 5], [1, 6], [2, 7], [2, 4], [3, 3], [0, 7], [5, 6], [0, 2], [4, 7]].map(([l, r], id) => ({ l, r, id }));
export const STEPS = 7;

const blk = (q: Query) => Math.floor(q.l / END);
const idx = QS.map((_, i) => i);
const BY_BLOCK = [...idx].sort((i, j) => blk(QS[i]) - blk(QS[j])); // stable: primary rule only
const MO = [...idx].sort((i, j) => blk(QS[i]) - blk(QS[j]) || QS[i].r - QS[j].r);
const LR = [...idx].sort((i, j) => QS[i].l - QS[j].l || QS[i].r - QS[j].r);
const START = { l: 0, r: -1 };

/** pointer moves split into left / right */
function moves(order: number[]) {
  let { l, r } = START;
  let L = 0;
  let R = 0;
  for (const i of order) {
    L += Math.abs(QS[i].l - l);
    R += Math.abs(QS[i].r - r);
    ({ l, r } = QS[i]);
  }
  return { L, R };
}
const MO_MOVES = moves(MO);
const LR_MOVES = moves(LR);
// n = q = 10000, random queries (seed 1), end = 100 — computed once in Python
const BIG = { mo: { L: 341734, R: 971437 }, lr: { L: 9926, R: 21494397 } };
const fmt = (x: number) => x.toLocaleString('en-US');

const BLOCK_TONE: CellTone[] = ['blue', 'normal', 'blue', 'normal'];

const Chip = ({ q, showBlock, tone = 'normal' }: { q: Query; showBlock: boolean; tone?: CellTone }) => (
  <div className={`rounded-md border px-1.5 py-0.5 font-mono text-[11px] transition-colors duration-300 ${toneClass(tone)}`}>
    <span className="font-bold">q{q.id}</span> ({q.l},{q.r})
    {showBlock && <span className="ml-1 text-amber-200">塊{blk(q)}</span>}
  </div>
);

export default function MoSortRuleAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const tok = (on: number[], done: number[] = []): TokState => (on.includes(s) ? 'active' : done.includes(s) ? 'done' : 'normal');
  const NOW = [
    '還沒排序：查詢照輸入的順序',
    '先算每一筆查詢的 x[0] // end：左端點在第幾塊',
    '主要規則：依塊號由小到大',
    '次要規則：同一塊裡依 r 由小到大',
    '對照：如果 l 也完整排序，排成 (l, r)',
    '比一比兩個指標各走幾步',
    '資料變大：n = q = 10000',
  ];
  const POST = [
    `x = (l, r, 編號)；end = int(${N} ** 0.5) = ${END}，每 ${END} 格一塊`,
    '同一塊的查詢，左端點最多差 end − 1 格',
    '塊號一樣的先不管 r，只是放在一起',
    '同一塊裡 r 只往右走；換塊時 r 才可能跳回去',
    `(l, r) 排序：l 一直往右，但 r 跳來跳去：${LR.map((i) => QS[i].r).join(' → ')}`,
    `分塊：左 ${MO_MOVES.L} + 右 ${MO_MOVES.R} = ${MO_MOVES.L + MO_MOVES.R}；(l, r)：左 ${LR_MOVES.L} + 右 ${LR_MOVES.R} = ${LR_MOVES.L + LR_MOVES.R}`,
    'l 讓一點（每筆最多走 end 格），換來 r 在每一塊裡只走一趟：右邊省下的比左邊多很多',
  ];

  const groups = Array.from({ length: Math.ceil(N / END) }, (_, b) => (s >= 3 ? MO : BY_BLOCK).filter((i) => blk(QS[i]) === b));

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={NOW[s]} post={POST[s]} wide>
        <CodePanel title="排序規則">
          <Line pc={s >= 1 && s <= 3}>
            queries.sort(key=lambda x: (<Tok s={tok([1, 2], [3])}>x[0] // end</Tok>, <Tok s={tok([3])}>x[1]</Tok>))
          </Line>
          <Line dim={s < 4} pc={s === 4}>
            <span className="text-slate-400"># 對照：</span>queries.sort(key=lambda x: (<Tok s={tok([4])}>x[0]</Tok>, x[1]))
          </Line>
        </CodePanel>

        {s <= 3 && (
          <>
            <Stage title={`a（0-indexed，end = ${END}：每 ${END} 格一塊）`}>
              <PointerSeq items={A.map((v, i) => ({ v, tone: s >= 1 ? BLOCK_TONE[Math.floor(i / END)] : 'normal', bottom: s >= 1 && i % END === 0 ? `塊${i / END}` : undefined }))} />
            </Stage>
            {s <= 1 ? (
              <Stage title="查詢（輸入的順序）">
                <div className="flex flex-wrap gap-1.5">
                  {QS.map((q) => <Chip key={q.id} q={q} showBlock={s >= 1} tone={s === 1 ? 'active' : 'normal'} />)}
                </div>
              </Stage>
            ) : (
              <Stage title={s === 2 ? '依塊號分組（組裡還是輸入的順序）' : '每一組裡依 r 排好 = 最後的處理順序'}>
                <div className="grid gap-2 @xl:grid-cols-4">
                  {groups.map((g, b) => (
                    <div key={b} className="flex flex-col gap-1 rounded-lg border border-slate-700 p-2">
                      <div className="text-[11px] font-bold text-amber-200">塊 {b}（l = {b * END} ～ {b * END + END - 1}）</div>
                      {g.map((i) => <Chip key={i} q={QS[i]} showBlock={false} tone={s === 3 ? 'yes' : 'normal'} />)}
                      {s === 3 && g.length > 0 && <div className="font-mono text-[11px] text-sky-200">r：{g.map((i) => QS[i].r).join(' → ')}</div>}
                    </div>
                  ))}
                </div>
              </Stage>
            )}
          </>
        )}

        {s >= 4 && (
          <Split>
            {[
              { name: '分塊排序 (x[0] // end, x[1])', order: MO, m: MO_MOVES, big: BIG.mo, color: '#38bdf8', win: true },
              { name: '直接排序 (x[0], x[1])', order: LR, m: LR_MOVES, big: BIG.lr, color: '#fb7185', win: false },
            ].map((o) => (
              <Stage key={o.name} title={o.name}>
                <div className="flex flex-col gap-2">
                  <QueryPlot n={N} first={0} start={START} queries={QS} order={o.order} done={o.order.length} block={END} color={o.color} />
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-slate-300">
                    <span>r 的順序（紅 = 往回跳）</span>{o.order.map((i, k) => <ValueCell key={k} value={QS[i].r} size="sm" tone={k > 0 && QS[i].r < QS[o.order[k - 1]].r ? 'hit' : 'normal'} />)}
                  </div>
                  {s >= 5 && (
                    <div className="grid grid-cols-3 gap-2">
                      <Stat label={s === 6 ? "左指標（n = 10000）" : "左指標"} value={fmt(s === 6 ? o.big.L : o.m.L)} tone="amber" />
                      <Stat label={s === 6 ? "右指標（n = 10000）" : "右指標"} value={fmt(s === 6 ? o.big.R : o.m.R)} />
                      <Stat label={s === 6 ? "合計（n = 10000）" : "合計"} value={fmt(s === 6 ? o.big.L + o.big.R : o.m.L + o.m.R)} hot={o.win} tone={o.win ? 'emerald' : 'rose'} />
                    </div>
                  )}
                </div>
              </Stage>
            ))}
          </Split>
        )}
      </AlgoBoard>
    </div>
  );
}
