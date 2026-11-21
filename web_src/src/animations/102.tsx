// Animation 102: 樹中心 · 一圈一圈剝葉子 — one step = one action
import React from 'react';
import T from './trace/102';
import { TraceView, Stage, GraphView, Seq, Split, type GEdge, type CellTone } from '../animation_kit/AlgoKit';
import { arr, rwTone, posNodes, collect, count } from '../animation_kit/AlgoHelpers';

const POS: Record<number, [number, number]> = { 0: [40, 60], 1: [140, 60], 2: [240, 60], 3: [340, 60], 4: [440, 60], 5: [240, 150] };
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]];
const IDS = [0, 1, 2, 3, 4, 5];

export default function TreeCenterAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} hide={['g']}>
      {(st, s) => {
        const deg = arr(st, 'deg');
        const q = arr(st, 'q');
        const nq = arr(st, 'nq');
        const done0 = st.line === 14 || (st.kind === 'while' && st.taken === false);
        // after the loop u / v still hold their last values: don't highlight them any more
        const u = done0 ? undefined : st.vars.u;
        const v = done0 ? undefined : st.vars.v;
        const removed = new Set(collect(T, s, (x) => x.line === 8 && x.kind === 'assign', (x) => x.vars.u as number));
        const done = done0;
        const round = count(T, s, (x) => x.kind === 'while' && !!x.taken);
        const tone = (n: number): CellTone =>
          done && q.includes(n) ? 'yes' : n === u && removed.has(n) ? 'hit' : n === v ? 'active' : removed.has(n) ? 'no' : nq.includes(n) ? 'blue' : 'normal';
        const nodes = posNodes(POS, (n) => ({
          tone: tone(n),
          above: done && q.includes(n) ? '中心' : n === u ? 'u' : n === v ? 'v' : undefined,
          below: removed.has(n) ? '拿掉了' : `deg ${deg[n]}`,
        }));
        const edges: GEdge[] = EDGES.map(([a, b]) => {
          const gone = removed.has(a) || removed.has(b);
          const now = (a === u && b === v) || (b === u && a === v);
          return { a, b, tone: now ? 'active' : gone ? 'dim' : 'normal' };
        });
        return (
          <>
            <Stage title="紅 = 正在拿掉、藍 = 下一輪的葉子、灰 = 拿掉了、綠 = 中心" right={<span className="whitespace-nowrap font-mono text-xs text-amber-200">{round > 0 ? `第 ${round} 輪` : ''}</span>}>
              <GraphView nodes={nodes} edges={edges} width={480} height={190} />
            </Stage>
            <Split>
              <Stage title="q：這一輪的葉子 → nq：下一輪的葉子">
                <div className="flex flex-col gap-2">
                  <Seq size="sm" items={q.map((x) => ({ v: x, tone: x === u ? 'active' : removed.has(x) && !done ? 'no' : done ? 'yes' : 'normal' }))} />
                  <Seq size="sm" empty="nq（空）" items={nq.map((x) => ({ v: x, tone: 'blue' }))} />
                </div>
              </Stage>
              <Stage title="deg：還連著幾條邊">
                <Seq size="sm" items={IDS.map((i) => ({ v: deg[i], top: `[${i}]`, tone: rwTone(st, 'deg', [i], removed.has(i) ? 'dim' : deg[i] === 1 ? 'blue' : 'normal') }))} />
              </Stage>
            </Split>
          </>
        );
      }}
    </TraceView>
  );
}
