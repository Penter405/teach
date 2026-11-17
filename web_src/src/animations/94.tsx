// Animation 94: Mo's algorithm · 兩個指標依序走到每一筆查詢 — one step = one action (traced)
import React from 'react';
import T from './trace/94';
import { TraceView, Stage, Seq, Split } from '../animation_kit/AlgoKit';
import { PointerSeq, CountBars, QueryList, arr, prevStep, count, type Query } from '../animation_kit/AlgoHelpers';

export default function MoPointersAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} hide={['idx']}>
      {(st, s) => {
        const a = arr(st, 'a');
        const cnt = arr(st, 'cnt');
        const ans = arr(st, 'ans');
        const qs = arr<[number, number, number]>(st, 'qs');
        const { cur_l, cur_r, l, r } = st.vars;
        // add(i) / remove(i): which element went in or out this step
        const moving = st.kind === 'call' && (st.fn === 'add' || st.fn === 'remove') ? (st.pre.includes('cur_r') ? cur_r : cur_l) : undefined;
        const hotVal = moving !== undefined ? a[moving] : undefined;
        const queries: Query[] = qs.map(([ql, qr, id]) => ({ l: ql, r: qr, id }));
        const done = count(T, s, (x) => x.kind === 'assign' && x.ref?.[0] === 'ans');
        const started = count(T, s, (x) => x.kind === 'for' && !!x.taken);
        return (
          <>
            <Stage title="a[1..8]（綠框 = 目前的區間；黃、藍 = 現在的指標；綠字 = 這一筆查詢要走到哪）">
              <PointerSeq first={1}
                items={a.slice(1).map((v, k) => ({ v, tone: k + 1 === moving ? (st.fn === 'add' ? 'yes' : 'hit') : 'normal' }))}
                range={cur_l !== undefined && cur_r !== undefined ? { from: cur_l, to: cur_r } : null}
                pointers={[
                  { name: 'cur_l', at: cur_l },
                  { name: 'cur_r', at: cur_r, color: 'sky' },
                  { name: 'l', at: started > done ? l : undefined, color: 'emerald' },
                  { name: 'r', at: started > done ? r : undefined, color: 'emerald' },
                ]} />
            </Stage>
            <Split>
              <Stage title={`cnt[x] = 區間裡 x 出現幾次（distinct = ${st.vars.distinct ?? 0}）`}>
                <CountBars counts={cnt} keys={[1, 2, 3, 4, 5]} hot={hotVal} prev={arr(prevStep(T, s), 'cnt')} max={3} />
              </Stage>
              <Stage title="查詢（排好的順序）和 ans（原本的順序）">
                <div className="flex flex-col gap-2">
                  <QueryList queries={queries} order={queries.map((_, k) => k)} done={Math.max(done, started)} />
                  <Seq size="sm" items={ans.map((v, k) => ({ v, top: `q${k}`, tone: st.kind === 'assign' && st.ref?.[0] === 'ans' && st.ref[1] === k ? 'yes' : 'normal' }))} />
                </div>
              </Stage>
            </Split>
          </>
        );
      }}
    </TraceView>
  );
}
