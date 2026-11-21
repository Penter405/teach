// Animation 97: Mo's algorithm · 學生的寫法（0-indexed，add / remove 回傳新的答案）— one step = one action (traced)
import React from 'react';
import T from './trace/97';
import { TraceView, Stage, Seq, Split, FitWidth } from '../animation_kit/AlgoKit';
import { PointerSeq, CountBars, QueryList, arr, prevStep, count, type Query } from '../animation_kit/AlgoHelpers';

export default function MoStudentAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} hide={['idx', 'a']}>
      {(st, s) => {
        const nums = arr(st, 'nums');
        const ans = arr(st, 'ans');
        const d = (st.vars.d ?? {}) as Record<string, number>;
        const qs = arr<[number, number, number]>(st, 'queries');
        const { cur_l, cur_r, l, r } = st.vars;
        // add / remove: which element went in or out this step (= the nums[i] read one step before)
        const moving = st.kind === 'call' && (st.fn === 'add' || st.fn === 'remove') ? Number(prevStep(T, s).ref?.[1]) : undefined;
        const queries: Query[] = qs.map(([ql, qr, id]) => ({ l: ql, r: qr, id }));
        const sorted = count(T, s, (x) => x.kind === 'call' && x.fn === 'sort') > 0;
        const done = count(T, s, (x) => x.kind === 'assign' && x.ref?.[0] === 'ans');
        const started = count(T, s, (x) => x.kind === 'for' && !!x.taken);
        return (
          <>
            <Stage title="nums（綠框 = 目前的區間；綠字 = 要走到哪）">
              <FitWidth><PointerSeq
                items={nums.map((v, k) => ({ v, tone: k === moving ? (st.fn === 'add' ? 'yes' : 'hit') : 'normal' }))}
                range={cur_l !== undefined && cur_r !== undefined ? { from: cur_l, to: cur_r } : null}
                pointers={[
                  { name: 'cur_l', at: cur_l },
                  { name: 'cur_r', at: cur_r, color: 'sky' },
                  { name: 'l', at: started > done ? l : undefined, color: 'emerald' },
                  { name: 'r', at: started > done ? r : undefined, color: 'emerald' },
                ]} /></FitWidth>
            </Stage>
            <Split>
              <Stage title={`d[x]：出現幾次（cur_ans = ${st.vars.cur_ans ?? 0}）`}>
                <CountBars counts={d} keys={[1, 2, 3]} hot={moving !== undefined ? nums[moving] : undefined}
                  prev={(prevStep(T, s).vars.d ?? {}) as Record<string, number>} max={2} />
              </Stage>
              <Stage title={sorted ? 'queries（排好了）和 ans' : 'queries（還沒排序）和 ans'}>
                <div className="flex flex-col gap-2">
                  <QueryList queries={queries} order={queries.map((_, k) => k)} done={sorted ? Math.max(done, started) : 0}
                    extra={(q) => (sorted ? `塊${Math.floor(q.l / (st.vars.end ?? 2))}` : '')} />
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
