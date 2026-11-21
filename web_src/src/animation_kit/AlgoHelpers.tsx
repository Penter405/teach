// AlgoHelpers: small functions and parts that several algorithm animations need.
// Everything here is pulled out of animations 38–92 (or written for Mo's / two pointers, 93–94).
// Reference with examples: animation_kit/KIT.md
import React from 'react';
import { motion } from 'motion/react';
import { ValueCell, TONE, NODE_FILL, touches, type CellTone, type GNode, type Trace, type TraceStep } from './AlgoKit';

/* ───────────── reading a step ───────────── */

/** `st.vars[name]`, or `fallback` before the variable exists (step 0, before it is assigned). */
export function arr<T = number>(st: TraceStep, name: string, fallback: T[] = []): T[] {
  return (st.vars[name] as T[] | undefined) ?? fallback;
}

/**
 * Tone for a cell that this step reads or writes:
 * written (assignment) → 'yes', read → 'active', otherwise `otherwise` (default 'normal').
 * Replaces `touches(st, 'dp', k) ? (st.kind === 'assign' ? 'yes' : 'active') : …`
 */
export function rwTone(st: TraceStep, name: string, idx: (string | number)[], otherwise: CellTone = 'normal'): CellTone {
  if (!touches(st, name, ...idx)) return otherwise;
  return st.kind === 'assign' ? 'yes' : 'active';
}

/** Steps 0 … s (the history up to now). */
export const upTo = (T: Trace, s: number) => T.steps.slice(0, s + 1);

/** How many steps up to now match `pred`. Example: the for-loop round = count(T, s, x => x.kind === 'for' && x.taken) - 1 */
export const count = (T: Trace, s: number, pred: (x: TraceStep) => boolean) => upTo(T, s).filter(pred).length;

/** Collect something from every past step that matches. Example: chosen edges = collect(T, s, x => x.kind === 'assign' && x.ref?.[0] === 'PARENT', x => `${x.vars.u}-${x.vars.v}`) */
export function collect<R>(T: Trace, s: number, pred: (x: TraceStep) => boolean, pick: (x: TraceStep) => R): R[] {
  return upTo(T, s).filter(pred).map(pick);
}

/** The step before `s` (the state before this action), or the same step at s = 0. */
export const prevStep = (T: Trace, s: number) => T.steps[Math.max(0, s - 1)];

/* ───────────── labels and ranges ───────────── */

/**
 * Pointer names that sit on index `i`, joined with a space; undefined when none.
 * ptrLabel(i, { lo, hi, mid }) → 'lo mid'. Use as the `top` of a Seq item.
 */
export function ptrLabel(i: number, ptrs: Record<string, number | undefined | null>): string | undefined {
  const names = Object.entries(ptrs).filter(([, at]) => at === i).map(([n]) => n);
  return names.length ? names.join(' ') : undefined;
}

/** lo ≤ i ≤ hi (closed) or lo ≤ i < hi (half-open). False while lo / hi are undefined. */
export function inRange(i: number, lo: number | undefined, hi: number | undefined, halfOpen = false): boolean {
  if (lo === undefined || hi === undefined) return false;
  return i >= lo && (halfOpen ? i < hi : i <= hi);
}

/** Is edge (a, b) the edge u–v? Undirected unless `directed`. */
export const sameEdge = (a: number | string, b: number | string, u: unknown, v: unknown, directed = false) =>
  (a === u && b === v) || (!directed && a === v && b === u);

/* ───────────── layouts for GraphView ───────────── */

/** Turn a { id: [x, y] } table into GraphView nodes; `style` adds tone / labels per node. */
export function posNodes(pos: Record<number | string, [number, number]>, style: (id: number) => Partial<GNode> = () => ({})): GNode[] {
  return Object.entries(pos).map(([k, [x, y]]) => ({ id: +k, x, y, ...style(+k) }));
}

/** Complete binary tree stored in a list (heap, segment tree): index k → (x, y). Children of k are 2k+1, 2k+2. */
export function heapLayout(n: number, { width = 520, top = 30, dy = 72 } = {}): [number, number][] {
  return Array.from({ length: n }, (_, k) => {
    const depth = Math.floor(Math.log2(k + 1));
    const first = 2 ** depth - 1;
    const slots = 2 ** depth;
    return [((k - first + 0.5) / slots) * width, top + depth * dy] as [number, number];
  });
}

/** Forest from a parent array (union-find): roots have parent[i] === i. Returns i → [x, y]. */
export function forestLayout(parent: number[], { left = 40, width = 440, top = 35, dy = 70 } = {}) {
  const kids: number[][] = parent.map(() => []);
  parent.forEach((p, i) => p !== i && kids[p].push(i));
  const pos: Record<number, [number, number]> = {};
  let x = 0;
  const place = (u: number, d: number): number => {
    if (!kids[u].length) { pos[u] = [x++, d]; return pos[u][0]; }
    const xs = kids[u].map((c) => place(c, d + 1));
    pos[u] = [(xs[0] + xs[xs.length - 1]) / 2, d];
    return pos[u][0];
  };
  parent.forEach((p, i) => p === i && place(i, 0));
  const span = Math.max(1, x - 1);
  return (i: number) => [left + (pos[i][0] / span) * width, top + pos[i][1] * dy] as const;
}

/* ───────────── colours outside ValueCell ───────────── */

/** Tailwind classes of a tone, for your own boxes (chess board, Fenwick ranges …). */
export const toneClass = (tone: CellTone = 'normal') => TONE[tone];
/** [fill, stroke, text] hex colours of a tone, for your own SVG. */
export const toneFill = (tone: CellTone = 'normal') => NODE_FILL[tone];

/* ───────────── PointerSeq: array + named pointers + highlighted range ───────────── */

export type Pointer = { name: string; at: number | undefined | null; color?: 'amber' | 'sky' | 'emerald' | 'rose' };
const PTR_COLOR = { amber: 'text-amber-300', sky: 'text-sky-300', emerald: 'text-emerald-300', rose: 'text-rose-300' };
const PTR_LINE = { amber: 'bg-amber-300', sky: 'bg-sky-300', emerald: 'bg-emerald-300', rose: 'bg-rose-300' };

/**
 * A row of cells with pointers under it that slide (not jump) to their new index,
 * and an optional band behind a range [from, to] (closed) — two pointers, sliding window, Mo's.
 *   <PointerSeq items={a.map(v => ({ v }))} pointers={[{ name: 'L', at: l }, { name: 'R', at: r, color: 'sky' }]} range={{ from: l, to: r }} index={i => i} />
 * `index` labels each cell on top (default: the index; pass null to hide). Pointer `at` may be one past either end (empty range).
 */
export const PointerSeq = ({
  items, pointers = [], range, index = (i: number) => `[${i}]`, size = 'md', first = 0,
}: {
  items: { v: React.ReactNode; tone?: CellTone; bottom?: React.ReactNode; struck?: boolean }[];
  pointers?: Pointer[];
  range?: { from: number | undefined; to: number | undefined; tone?: 'yes' | 'blue' | 'active' } | null;
  index?: ((i: number) => React.ReactNode) | null;
  size?: 'sm' | 'md';
  /** index of items[0] (1 for 1-indexed arrays drawn without the unused a[0]) */
  first?: number;
}) => {
  const cell = size === 'sm' ? 36 : 44;
  const pitch = cell + 6;
  const x = (i: number) => (i - first) * pitch;
  const band = range && range.from !== undefined && range.to !== undefined && range.to >= range.from ? range : null;
  const bandColor = band?.tone === 'blue' ? 'bg-sky-500/15 border-sky-400/60' : band?.tone === 'active' ? 'bg-amber-500/15 border-amber-400/60' : 'bg-emerald-500/15 border-emerald-400/60';
  // pointers on the same index stack downwards
  const rows: Record<number, number> = {};
  const placed = pointers.filter((p) => p.at !== undefined && p.at !== null).map((p) => {
    const at = p.at as number;
    const row = rows[at] ?? 0;
    rows[at] = row + 1;
    return { ...p, at, row };
  });
  const depth = Math.max(1, ...Object.values(rows));
  return (
    <div className="mx-auto w-fit max-w-full overflow-x-auto overflow-y-hidden">
      <div className="relative px-6" style={{ width: items.length * pitch + 48 }}>
        <div className="relative">
          {band && (
            <motion.div
              className={`absolute rounded-xl border-2 ${bandColor}`}
              initial={false}
              animate={{ left: x(band.from!) - 4, width: (band.to! - band.from! + 1) * pitch + 2 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              style={{ top: 14, height: cell + 8 }}
            />
          )}
          <div className="relative flex gap-1.5">
            {items.map((it, k) => (
              <ValueCell key={k} value={it.v} tone={it.tone} struck={it.struck} size={size}
                top={index ? index(k + first) : undefined} bottom={it.bottom} />
            ))}
          </div>
        </div>
        <div className="relative" style={{ height: 8 + depth * 16 }}>
          {placed.map((p) => {
            const c = p.color ?? 'amber';
            return (
              <motion.div key={p.name} className="absolute flex flex-col items-center whitespace-nowrap" initial={false}
                animate={{ left: x(p.at) + cell / 2, top: p.row ? 6 + p.row * 16 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }} style={{ x: '-50%' }}>
                {p.row === 0 && <span className={`h-1.5 w-[2px] ${PTR_LINE[c]}`} />}
                <span className={`font-mono text-[11px] font-bold leading-4 ${PTR_COLOR[c]}`}>{p.row === 0 ? '▲ ' : ''}{p.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ───────────── CountBars: cnt[x] as bars ───────────── */

/**
 * cnt[x] drawn as vertical bars (counting sort, Mo's, frequency tables).
 * `hot` = the key this step changed; a bar that just became 0 or 1 flashes green / red when `flash` is on.
 *   <CountBars counts={cnt} keys={[1,2,3,4,5]} hot={x} prev={prevCnt} />
 */
export const CountBars = ({
  counts, keys, hot, prev, max, label = (k: number | string) => k,
}: {
  counts: Record<number | string, number> | number[];
  keys?: (number | string)[];
  hot?: number | string | null;
  /** counts before this step: a bar that went 0 → 1 turns green, 1 → 0 turns red */
  prev?: Record<number | string, number> | number[];
  max?: number;
  label?: (k: number | string) => React.ReactNode;
}) => {
  const get = (c: any, k: number | string) => (c ? (c[k as any] ?? 0) : 0);
  const ks = keys ?? Object.keys(counts).map((k) => (Array.isArray(counts) ? +k : k));
  const top = max ?? Math.max(1, ...ks.map((k) => get(counts, k)));
  const H = 70;
  return (
    <div className="flex items-end justify-center gap-2">
      {ks.map((k) => {
        const v = get(counts, k);
        const before = prev ? get(prev, k) : v;
        const tone: CellTone = before === 0 && v === 1 ? 'yes' : before === 1 && v === 0 ? 'hit' : k === hot ? 'active' : v > 0 ? 'blue' : 'dim';
        return (
          <div key={String(k)} className="flex w-9 flex-col items-center gap-1">
            <span className="font-mono text-xs font-bold text-slate-200">{v}</span>
            <div className="relative flex w-full items-end" style={{ height: H }}>
              <motion.div className={`w-full rounded-t-md border ${TONE[tone]}`} initial={false}
                animate={{ height: Math.max(3, (v / top) * H) }} transition={{ type: 'spring', stiffness: 240, damping: 24 }} />
            </div>
            <span className={`font-mono text-[11px] ${k === hot ? 'font-bold text-amber-300' : 'text-slate-400'}`}>{label(k)}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ───────────── QueryPlot: queries as points (l, r) ───────────── */

export type Query = { l: number; r: number; id: number | string };

/**
 * Each query is a point (l, r); pointer travel between two queries = |Δl| + |Δr|.
 * Shades every other block of l (Mo's √n blocks) and draws the path through `order` up to `done` queries.
 *   <QueryPlot n={8} queries={qs} order={[2, 0, 1]} done={2} block={3} />
 * `first` = the smallest index (1 = 1-indexed, default; 0 = 0-indexed, blocks are then l // block).
 */
export const QueryPlot = ({
  n, queries, order, done, block, first = 1, start = { l: first, r: first - 1 }, size = 300, color = '#38bdf8', maxHeight = 260,
}: {
  n: number; queries: Query[]; order: number[]; done: number; block?: number;
  first?: number; start?: { l: number; r: number }; size?: number; color?: string;
  /** drawn at most this tall (px), so a wide column does not make it huge (height budget, see KIT.md) */
  maxHeight?: number;
}) => {
  const pad = 26;
  const u = (size - pad - 10) / Math.max(1, n);
  const sx = (l: number) => pad + (l - first + 0.5) * u;
  const sy = (r: number) => size - pad - (r - first + 0.5) * u;
  const path = [start, ...order.slice(0, done).map((i) => queries[i])];
  const pos = new Map(order.map((qi, k) => [qi, k]));
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxHeight }}>
      {block && Array.from({ length: Math.ceil(n / block) }, (_, b) => (
        <g key={b}>
          <rect x={pad + b * block * u} y={6} width={Math.min(block, n - b * block) * u} height={size - pad - 6}
            fill={b % 2 ? '#1e293b' : '#0f172a'} />
          <text x={pad + (b * block + Math.min(block, n - b * block) / 2) * u} y={size - 4} textAnchor="middle" fontSize={10} fill="#64748b">塊 {b}</text>
        </g>
      ))}
      <line x1={pad} y1={size - pad} x2={size - 6} y2={size - pad} stroke="#475569" />
      <line x1={pad} y1={size - pad} x2={pad} y2={6} stroke="#475569" />
      {Array.from({ length: n }, (_, k) => k + first).map((v) => (
        <g key={v}>
          <text x={sx(v)} y={size - pad + 12} textAnchor="middle" fontSize={10} fill="#94a3b8">{v}</text>
          <text x={pad - 8} y={sy(v) + 3} textAnchor="middle" fontSize={10} fill="#94a3b8">{v}</text>
        </g>
      ))}
      <text x={size - 8} y={size - pad - 4} textAnchor="end" fontSize={10} fill="#64748b">l →</text>
      <text x={pad + 4} y={14} fontSize={10} fill="#64748b">r ↑</text>
      {path.slice(1).map((q, k) => {
        const p = path[k];
        const y0 = p.r < first ? size - pad : sy(p.r);
        const isLast = k === path.length - 2;
        return (
          <motion.path key={`${k}-${q.l}-${q.r}`} d={`M ${sx(p.l)} ${y0} L ${sx(q.l)} ${y0} L ${sx(q.l)} ${sy(q.r)}`}
            fill="none" stroke={color} strokeWidth={isLast ? 3 : 2} strokeOpacity={isLast ? 1 : 0.55} strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
        );
      })}
      {queries.map((q, i) => {
        const k = pos.get(i) ?? -1;
        const tone: CellTone = k === done - 1 ? 'active' : k >= 0 && k < done ? 'blue' : 'normal';
        const [fill, stroke, text] = NODE_FILL[tone];
        return (
          <g key={i}>
            <circle cx={sx(q.l)} cy={sy(q.r)} r={tone === 'active' ? 11 : 9} fill={fill} stroke={stroke} strokeWidth={tone === 'active' ? 3 : 1.5} style={{ transition: 'all 0.3s' }} />
            <text x={sx(q.l)} y={sy(q.r) + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={text}>{q.id}</text>
          </g>
        );
      })}
    </svg>
  );
};

/** Total pointer moves |Δl| + |Δr| for the first `done` queries of `order`, starting from `start`. */
export function travel(queries: Query[], order: number[], done = order.length, start = { l: 1, r: 0 }) {
  let { l, r } = start;
  let s = 0;
  for (const i of order.slice(0, done)) {
    s += Math.abs(queries[i].l - l) + Math.abs(queries[i].r - r);
    ({ l, r } = queries[i]);
  }
  return s;
}

/* ───────────── QueryList: queries as chips ───────────── */

/** Queries in processing order; done = blue, current = amber, waiting = grey. `extra(q)` adds a note (answer, cost …). */
export const QueryList = ({ queries, order, done, extra }: {
  queries: Query[]; order: number[]; done: number; extra?: (q: Query, k: number) => React.ReactNode;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {order.map((qi, k) => {
      const q = queries[qi];
      const tone: CellTone = k === done - 1 ? 'active' : k < done ? 'blue' : 'no';
      return (
        <div key={qi} className={`rounded-md border px-1.5 py-0.5 font-mono text-[11px] transition-colors duration-300 ${TONE[tone]}`}>
          <span className="font-bold">q{q.id}</span> [{q.l},{q.r}]{extra && <span className="ml-1 opacity-80">{extra(q, k)}</span>}
        </div>
      );
    })}
  </div>
);

/* ───────────── Stat: one big number with a label ───────────── */

/** A labelled number (totals, counters). `hot` highlights it. */
export const Stat = ({ label, value, hot = false, tone = 'sky' }: { label: React.ReactNode; value: React.ReactNode; hot?: boolean; tone?: 'sky' | 'emerald' | 'amber' | 'rose' }) => {
  const c = { sky: 'text-sky-200', emerald: 'text-emerald-200', amber: 'text-amber-200', rose: 'text-rose-200' }[tone];
  return (
    <div className={`rounded-lg border px-3 py-2 transition-colors duration-300 ${hot ? 'border-amber-400 bg-amber-500/15' : 'border-slate-700 bg-slate-900'}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className={`font-mono text-xl font-bold ${c}`}>{value}</div>
    </div>
  );
};
