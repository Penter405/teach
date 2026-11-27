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

/* ───────────── ArcBars: bars + "<---" arcs between them (monotonic stack / queue on the data) ───────────── */

export type Arc = { from: number; to: number; tone?: 'active' | 'chosen' | 'dim' | 'hit'; label?: string };
const ARC_COLOR = { active: '#fbbf24', chosen: '#34d399', dim: '#475569', hit: '#fb7185' };

/**
 * The array drawn as bars (height = value), with arcs `from → to` above them; the arrow head is on `to`.
 * Use it to show an algorithm on the data itself instead of its helper structure, e.g. next greater:
 * x arrives and shoots ← at every waiting smaller number.
 *   <ArcBars values={a} tones={a.map(...)} arcs={[{ from: 2, to: 0, tone: 'chosen' }]} band={{ from: l, to: r }} bottom={(i) => ans[i]} />
 * `band` = closed range drawn behind the bars (sliding window). `top(i)` / `bottom(i)` are small labels.
 */
export const ArcBars = ({
  values, tones = [], arcs = [], band, top, bottom, bottomName, cell = 58, barMax = 120,
}: {
  values: number[];
  tones?: CellTone[];
  arcs?: Arc[];
  band?: { from: number; to: number; label?: string } | null;
  top?: (i: number) => string | number | null | undefined;
  bottom?: (i: number) => string | number | null | undefined;
  /** name written left of the bottom labels (e.g. "ans") */
  bottomName?: string;
  cell?: number;
  barMax?: number;
}) => {
  const n = values.length;
  const left = bottomName ? 44 : 8;
  const maxSpan = Math.max(1, ...arcs.map((a) => Math.abs(a.from - a.to)), n > 1 ? n - 1 : 1);
  const arcRoom = 26 + Math.min(56, 12 * maxSpan);
  const lo = Math.min(0, ...values), hi = Math.max(1, ...values);
  const barH = (v: number) => 14 + ((v - lo) / (hi - lo || 1)) * barMax;
  const base = arcRoom + barMax + 22;            // y of the bars' bottom
  const H = base + 20 + (bottom ? 26 : 0);
  const W = left + n * cell + 8;
  const cx = (i: number) => left + i * cell + cell / 2;
  const topY = (i: number) => base - barH(values[i]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }} role="img">
      {band && band.to >= band.from && (
        <g>
          <rect x={left + band.from * cell + 2} y={arcRoom - 6} width={(band.to - band.from + 1) * cell - 4} height={base - arcRoom + 26}
            rx={10} fill="#0c4a6e" fillOpacity={0.35} stroke="#38bdf8" strokeDasharray="5 4" />
          {band.label && <text x={left + band.from * cell + 8} y={arcRoom + 8} fontSize={11} fill="#7dd3fc" fontWeight={700}>{band.label}</text>}
        </g>
      )}
      {values.map((v, i) => {
        const [fill, stroke, text] = NODE_FILL[tones[i] ?? 'normal'];
        const y = topY(i);
        return (
          <g key={i}>
            <motion.rect initial={false} animate={{ y, height: barH(v), fill, stroke }} transition={{ duration: 0.3 }}
              x={cx(i) - cell * 0.32} width={cell * 0.64} rx={6} strokeWidth={2}
              strokeDasharray={tones[i] === 'stack' ? '5 3' : undefined} />
            <text x={cx(i)} y={y + 18} textAnchor="middle" fontSize={15} fontWeight={700} fill={text} fontFamily="ui-monospace, monospace">{v}</text>
            {top?.(i) != null && top(i) !== '' && <text x={cx(i)} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fcd34d">{top(i)}</text>}
            <text x={cx(i)} y={base + 15} textAnchor="middle" fontSize={11} fill="#64748b" fontFamily="ui-monospace, monospace">[{i}]</text>
            {bottom && (
              <text x={cx(i)} y={base + 38} textAnchor="middle" fontSize={14} fontWeight={700} fill={bottom(i) == null || bottom(i) === '' ? '#334155' : '#a7f3d0'} fontFamily="ui-monospace, monospace">
                {bottom(i) == null || bottom(i) === '' ? '·' : bottom(i)}
              </text>
            )}
          </g>
        );
      })}
      {bottom && bottomName && <text x={4} y={base + 38} fontSize={12} fontWeight={700} fill="#94a3b8" fontFamily="ui-monospace, monospace">{bottomName}</text>}
      {arcs.map((a, k) => {
        const x1 = cx(a.from), y1 = topY(a.from) - 22, x2 = cx(a.to), y2 = topY(a.to) - 22;
        const span = Math.abs(a.from - a.to);
        const qx = (x1 + x2) / 2, qy = Math.min(y1, y2) - 14 - Math.min(60, 12 * span);
        const color = ARC_COLOR[a.tone ?? 'chosen'];
        // arrow head along the tangent at the end (end − control)
        const dx = x2 - qx, dy = y2 - qy, len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len, s = 8;
        const head = `${x2},${y2} ${x2 - ux * s - uy * s * 0.6},${y2 - uy * s + ux * s * 0.6} ${x2 - ux * s + uy * s * 0.6},${y2 - uy * s - ux * s * 0.6}`;
        return (
          <g key={k}>
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }}
              d={`M ${x1} ${y1} Q ${qx} ${qy} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={a.tone === 'dim' ? 1.5 : 2.5} />
            <polygon points={head} fill={color} />
            {a.label && <text x={qx} y={(y1 + y2) / 4 + qy / 2 - 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>{a.label}</text>}
          </g>
        );
      })}
    </svg>
  );
};

/* ───────────── PrefixRows: cell rows + boundary rows (prefix / suffix arrays) ───────────── */

export type PRow = {
  name: string;
  /** 'cell' = n items under the array cells; 'gap' = n + 1 items on the boundaries between cells (P[i] = everything left of boundary i) */
  kind: 'cell' | 'gap';
  items: { v: string | number | null; tone?: CellTone }[];
  /** small hint after the name, e.g. '→' or '←' (build direction) */
  dir?: string;
};
/** highlight cells from..to (closed) of a 'cell' row, e.g. the part of a that P[i] covers */
export type PSpan = { row: number; from: number; to: number; tone?: 'yes' | 'blue' | 'active' | 'hit'; label?: string };
/** arrow from item [row, i] to item [row, i] */
export type PLink = { from: [number, number]; to: [number, number]; tone?: 'active' | 'chosen' };

/**
 * Rows of an array and its prefix / suffix arrays, lined up so a boundary value sits between the two
 * cells it separates: P[i] is drawn under the gap left of a[i]. `spans` shade a range of cells,
 * `links` draw arrows (which values are read to make the new one). An item with v = null is empty.
 *   <PrefixRows rows={[{ name: 'a', kind: 'cell', items }, { name: 'P', kind: 'gap', items: P }]} spans={[{ row: 0, from: 0, to: 2 }]} />
 */
export const PrefixRows = ({ rows, spans = [], links = [], cell = 62 }: { rows: PRow[]; spans?: PSpan[]; links?: PLink[]; cell?: number }) => {
  const n = Math.max(...rows.map((r) => (r.kind === 'cell' ? r.items.length : r.items.length - 1)));
  const left = 70, rowH = 70, box = 40;
  const W = left + n * cell + cell / 2 + 10;
  const H = rows.length * rowH + 22;
  const x = (row: PRow, i: number) => left + (row.kind === 'cell' ? i * cell + cell / 2 : i * cell);
  const y = (r: number) => r * rowH + 52;        // centre of the boxes of row r (18 on top for span labels)
  const SPAN = { yes: ['#064e3b', '#34d399'], blue: ['#0c4a6e', '#38bdf8'], active: ['#78350f', '#fbbf24'], hit: ['#881337', '#fb7185'] };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }} role="img">
      {spans.map((s, k) => {
        const [fill, stroke] = SPAN[s.tone ?? 'yes'];
        const x0 = left + s.from * cell + 2, w = (s.to - s.from + 1) * cell - 4;
        return (
          <g key={k}>
            <rect x={x0} y={y(s.row) - box / 2 - 8} width={w} height={box + 16} rx={10} fill={fill} fillOpacity={0.45} stroke={stroke} strokeDasharray="5 4" />
            {s.label && <text x={x0 + w / 2} y={y(s.row) - box / 2 - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill={stroke}>{s.label}</text>}
          </g>
        );
      })}
      {rows.map((row, r) => (
        <g key={r}>
          <text x={6} y={y(r) + 5} fontSize={15} fontWeight={700} fill="#cbd5e1" fontFamily="ui-monospace, monospace">{row.name}</text>
          {row.dir && <text x={6} y={y(r) + 22} fontSize={11} fill="#94a3b8">{row.dir}</text>}
          {row.items.map((it, i) => {
            const [fill, stroke, text] = NODE_FILL[it.v == null ? 'dim' : it.tone ?? 'normal'];
            const cx = x(row, i);
            return (
              <g key={i}>
                <motion.rect initial={false} animate={{ fill, stroke }} transition={{ duration: 0.3 }}
                  x={cx - box / 2} y={y(r) - box / 2} width={box} height={box} rx={row.kind === 'gap' ? 20 : 8} strokeWidth={it.tone === 'active' ? 3 : 2} />
                <text x={cx} y={y(r) + 6} textAnchor="middle" fontSize={15} fontWeight={700} fill={text} fontFamily="ui-monospace, monospace">{it.v ?? ''}</text>
                <text x={cx} y={y(r) + box / 2 + 13} textAnchor="middle" fontSize={10} fill="#64748b" fontFamily="ui-monospace, monospace">[{i}]</text>
              </g>
            );
          })}
        </g>
      ))}
      {links.map((l, k) => {
        const [r1, i1] = l.from, [r2, i2] = l.to;
        const x1 = x(rows[r1], i1), y1 = y(r1), x2 = x(rows[r2], i2), y2 = y(r2);
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
        const sx = x1 + ux * 22, sy = y1 + uy * 22, ex = x2 - ux * 23, ey = y2 - uy * 23, s = 8;
        const color = l.tone === 'active' ? '#fbbf24' : '#34d399';
        const head = `${ex},${ey} ${ex - ux * s - uy * s * 0.6},${ey - uy * s + ux * s * 0.6} ${ex - ux * s + uy * s * 0.6},${ey - uy * s - ux * s * 0.6}`;
        return (
          <g key={k}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={2.5} />
            <polygon points={head} fill={color} />
          </g>
        );
      })}
    </svg>
  );
};
