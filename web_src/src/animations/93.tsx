// Animation 93: Mo's algorithm · 查詢順序 — one step = every order handles one more query
// Hand-written (no tracer): the point is how far the two pointers travel, not each action.
// steps / results in data.json (11 of each) were written from the same data: change both together.
import React from 'react';
import { AlgoBoard, Stage } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';
import { QueryPlot, QueryList, PointerSeq, Stat, travel, type Query } from '../animation_kit/AlgoHelpers';

export const A = [2, 1, 1, 3, 1, 4, 5, 2]; // a[1..8]
export const N = A.length;
export const BLOCK = 3; // ≈ √8
// input order: your 6 queries, then 4 more
export const QS: Query[] = [[2, 5], [2, 6], [2, 7], [3, 8], [3, 5], [4, 4], [1, 8], [6, 7], [1, 3], [5, 8]].map(([l, r], id) => ({ l, r, id }));

const blk = (q: Query) => Math.floor((q.l - 1) / BLOCK);
const idx = QS.map((_, i) => i);
export const ORDERS: { key: string; name: string; order: number[]; color: string }[] = [
  { key: 'orig', name: '原本順序', order: idx, color: '#fb7185' },
  { key: 'mo', name: '分塊排序', order: [...idx].sort((i, j) => blk(QS[i]) - blk(QS[j]) || QS[i].r - QS[j].r), color: '#38bdf8' },
  { key: 'oe', name: '奇偶優化', order: [...idx].sort((i, j) => blk(QS[i]) - blk(QS[j]) || (blk(QS[i]) % 2 ? QS[j].r - QS[i].r : QS[i].r - QS[j].r)), color: '#34d399' },
];
export const STEPS = QS.length + 1;

const distinct = (q: Query) => new Set(A.slice(q.l - 1, q.r)).size;

export default function MoOrderAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const now = s === 0 ? '還沒開始：三種順序都從空區間 [1, 0] 出發' : `每一種順序都處理第 ${s} 筆查詢`;
  const post = s === 0
    ? `查詢是點 (l, r)；從一筆走到下一筆，兩個指標要走 |Δl| + |Δr| 步。塊大小 = ${BLOCK} ≈ √${N}`
    : ORDERS.map((o) => `${o.name} 累計 ${travel(QS, o.order, s)} 步`).join('；');
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={now} post={post} wide>
        <div className="grid w-full gap-3 @3xl:grid-cols-3">
          {ORDERS.map((o) => {
            const cur = s > 0 ? QS[o.order[s - 1]] : null;
            const prev = s > 1 ? QS[o.order[s - 2]] : { l: 1, r: 0 };
            const moved = cur ? Math.abs(cur.l - prev.l) + Math.abs(cur.r - prev.r) : 0;
            return (
              <Stage key={o.key} title={o.name} right={<span className="font-mono text-[11px] text-slate-300">{cur ? `q${cur.id}：+${moved} 步` : ''}</span>}>
                <div className="flex flex-col gap-2">
                  <QueryPlot n={N} queries={QS} order={o.order} done={s} block={BLOCK} color={o.color} />
                  <Stat label="指標總共走了" value={`${travel(QS, o.order, s)} 步`} hot={s === STEPS - 1 && o.key === 'oe'} />
                  <QueryList queries={QS} order={o.order} done={s} />
                </div>
              </Stage>
            );
          })}
        </div>
        <Stage title={s === 0 ? 'a（目前區間：空的）' : `a：分塊排序現在處理的區間（不同的值 ${distinct(QS[ORDERS[1].order[s - 1]])} 個）`}>
          {(() => {
            const q = s > 0 ? QS[ORDERS[1].order[s - 1]] : null;
            return (
              <PointerSeq first={1} items={A.map((v) => ({ v }))}
                range={q ? { from: q.l, to: q.r } : null}
                pointers={q ? [{ name: 'L', at: q.l }, { name: 'R', at: q.r, color: 'sky' }] : []} />
            );
          })()}
        </Stage>
      </AlgoBoard>
    </div>
  );
}
