// Animation 95: 線性資料 recursion · 先加後乘 f(5,2)*1+2 — one step = one action (traced)
// The tokens on top; under them one row per call depth. A bar = the part of t a call has eaten:
// amber = running now, blue = waiting for a call below it, green = returned (value written on it).
import React from 'react';
import { motion } from 'motion/react';
import T from './trace/95';
import { TraceView, Stage, ValueCell, Note, FitWidth, type CellTone, type TraceStep } from '../animation_kit/AlgoKit';
import { arr, toneClass } from '../animation_kit/AlgoHelpers';

const ROW_NAME = ['mul_expr', 'add_expr', 'factor']; // the call chain always goes mul → add → factor → mul …
const CELL = 36;
const GAP = 4;
const LABEL = 52;

type Span = { depth: number; start: number; end: number; value?: string; tone: CellTone; key: string };

/** "(5, 3)" → ['5', 3] */
function parsePair(r: string): [string, number] {
  const m = r.match(/^\((.*), (\d+)\)$/);
  return m ? [m[1], Number(m[2])] : [r, 0];
}

/** Where reading stands after step s (the i the running call will read next). */
function position(st: TraceStep): number | undefined {
  if (st.kind === 'return' && st.act?.k === 'return') return parsePair(st.act.r)[1];
  if (st.stack.length === 0) return st.vars.end;
  return st.vars.i;
}

function spansAt(s: number): Span[] {
  const st = T.steps[s];
  const cur = position(st) ?? 0;
  const out: Span[] = [];
  // finished calls: every return up to now
  for (let k = 1; k <= s; k++) {
    const x = T.steps[k];
    if (x.kind !== 'return' || x.act?.k !== 'return') continue;
    const before = T.steps[k - 1].stack;
    const f = before[before.length - 1];
    const [value, end] = parsePair(x.act.r);
    out.push({ depth: before.length - 1, start: Number(f.args.i), end, value, tone: 'yes', key: `${k}` });
  }
  // calls still running: from where they started to where reading is now
  st.stack.forEach((f, d) => {
    const start = Number(f.args.i);
    const top = d === st.stack.length - 1;
    out.push({ depth: d, start, end: Math.max(cur, start), tone: top ? 'active' : 'blue', key: `open-${d}-${start}` });
  });
  return out;
}

export default function LinearRecursionAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step} show={['i', 'v', 'w', 'ans', 'end']}>
      {(st, s) => {
        const t = arr<string | number>(st, 't');
        const cur = s === 0 ? undefined : position(st);
        const reading = st.kind === 'subscript' && st.ref?.[0] === 't' ? Number(st.ref[1]) : undefined;
        const spans = spansAt(s);
        const depth = Math.max(3, ...spans.map((x) => x.depth + 1));
        const justReturned = st.kind === 'return' ? spans.filter((x) => x.tone === 'yes').at(-1)?.key : undefined;
        const args = st.vars.args as number[] | undefined;
        const x = (i: number) => LABEL + i * (CELL + GAP);
        const width = x(t.length);
        return (
          <>
            <Stage title="token 和每一層呼叫吃掉的範圍" right={args && <span className="font-mono text-xs text-slate-300">args = [{args.join(', ')}]</span>}>
              <FitWidth>
                <div className="relative" style={{ width }}>
                  {/* tokens */}
                  <div className="flex gap-1" style={{ paddingLeft: LABEL }}>
                    {t.map((v, k) => {
                      const tone: CellTone = k === reading ? 'active' : v === '#' ? 'dim' : cur !== undefined && k < cur ? 'blue' : 'normal';
                      return <ValueCell key={k} value={String(v)} tone={tone} top={`[${k}]`} bottom={k === cur ? '▲ i' : undefined} size="sm" />;
                    })}
                  </div>
                  {/* one row per call depth */}
                  <div className="relative mt-1" style={{ height: depth * 30 }}>
                    {Array.from({ length: depth }, (_, d) => (
                      <span key={d} className="absolute left-0 font-mono text-[9px] leading-[26px] text-slate-500" style={{ top: d * 30 }}>
                        {ROW_NAME[d % 3]}
                      </span>
                    ))}
                    {spans.map((sp) => {
                      const w = Math.max(1, sp.end - sp.start) * (CELL + GAP) - GAP;
                      const open = sp.tone !== 'yes';
                      const pop = sp.key === justReturned;
                      return (
                        <motion.div key={sp.key}
                          initial={pop ? { scale: 0.6, opacity: 0 } : false}
                          animate={{ left: x(sp.start), width: w, scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                          className={`absolute flex h-[26px] items-center justify-center overflow-hidden rounded-md border font-mono text-xs font-bold whitespace-nowrap
                            ${toneClass(sp.tone)} ${open && sp.end === sp.start ? 'border-dashed' : ''} ${pop ? 'ring-2 ring-emerald-300' : ''}`}
                          style={{ top: sp.depth * 30 }}>
                          {open ? '…' : `= ${sp.value}`}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </FitWidth>
            </Stage>
            <Note tone="sky">
              一列 = 一層呼叫。黃 = 正在跑、藍 = 等下面那層回傳、綠 = 已經回傳（寫著回傳的值）。
              f( ) 裡面又從 mul_expr 開始：字串裡的樹就是這樣長出來的。
            </Note>
          </>
        );
      }}
    </TraceView>
  );
}
