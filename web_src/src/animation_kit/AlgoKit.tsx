// AlgoKit: shared parts for algorithm / data-structure animations (38+).
// Same rules as HardwareKit: one step = one action, step 0 = nothing has run yet,
// ▶ (Line pc) marks the line the step is on. Code comes from HardwareKit (CodePanel / Line / Tok)
// so 預告 (preview) keeps working.
import React from 'react';
import { motion } from 'motion/react';

/** Dark board: "現在在做什麼" bar on top, then the code and the drawing. */
export const AlgoBoard = ({ now, children }: { now?: string; children: React.ReactNode }) => (
  <div className="w-full max-w-[900px] flex flex-col gap-3 rounded-2xl bg-slate-950 p-3 md:p-4 font-sans text-slate-100">
    <div className="flex items-center gap-2 rounded-lg bg-sky-500/10 px-3 py-2">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-sky-400">現在在做什麼</span>
      <span data-now={now || ''} className="text-sm font-bold text-sky-100">{now || '還沒開始執行'}</span>
    </div>
    {children}
  </div>
);

/** A titled area for the drawing (array, grid, tree …). */
export const Stage = ({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <div className="w-full rounded-xl border border-slate-800 bg-slate-900/70 p-3">
    {(title || right) && (
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
        {right}
      </div>
    )}
    {children}
  </div>
);

export type CellTone = 'normal' | 'active' | 'yes' | 'no' | 'dim' | 'hit' | 'blue';

const TONE: Record<CellTone, string> = {
  normal: 'bg-slate-800 border-slate-600 text-slate-100',
  active: 'bg-amber-500/25 border-amber-400 text-amber-100 ring-2 ring-amber-400',
  yes: 'bg-emerald-500/25 border-emerald-400 text-emerald-100',
  no: 'bg-slate-800/60 border-slate-700 text-slate-500',
  dim: 'bg-slate-900 border-slate-800 text-slate-600',
  hit: 'bg-rose-500/25 border-rose-400 text-rose-100 ring-2 ring-rose-400',
  blue: 'bg-sky-500/25 border-sky-400 text-sky-100',
};

/** One box of an array / grid. `struck` draws a line through the value, `top` / `bottom` are small labels. */
export const ValueCell = ({
  value, tone = 'normal', struck = false, top, bottom, circle = false, size = 'md',
}: {
  value: React.ReactNode; tone?: CellTone; struck?: boolean; top?: React.ReactNode; bottom?: React.ReactNode; circle?: boolean; size?: 'sm' | 'md';
}) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="h-3.5 text-[9px] font-bold leading-[14px] text-amber-300 whitespace-nowrap">{top}</span>
    <motion.div
      animate={{ scale: tone === 'active' || tone === 'hit' ? 1.08 : 1 }}
      transition={{ duration: 0.3 }}
      className={`relative flex items-center justify-center border font-mono font-bold transition-colors duration-300
        ${size === 'sm' ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base'} ${circle ? 'rounded-full' : 'rounded-lg'} ${TONE[tone]}`}
    >
      {value}
      {struck && (
        <motion.span
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }}
          className="absolute left-1 right-1 top-1/2 h-[2px] origin-left -rotate-[24deg] bg-rose-400"
        />
      )}
    </motion.div>
    <span className="h-3.5 text-[9px] leading-[14px] text-slate-400 whitespace-nowrap">{bottom}</span>
  </div>
);

/** Small "name = value" chips (loop variables, counters). */
export const VarRow = ({ vars }: { vars: { name: string; value: React.ReactNode; hot?: boolean }[] }) => (
  <div className="flex flex-wrap gap-2">
    {vars.map((v) => (
      <motion.div
        key={v.name}
        animate={{ scale: v.hot ? 1.05 : 1 }}
        className={`rounded-lg border px-2.5 py-1 font-mono text-xs ${v.hot ? 'border-amber-400 bg-amber-500/15 text-amber-100' : 'border-slate-700 bg-slate-900 text-slate-300'}`}
      >
        <span className="text-slate-400">{v.name}</span> = <span className="font-bold">{v.value}</span>
      </motion.div>
    ))}
  </div>
);

/** One-line explanation under the drawing. */
export const Note = ({ children, tone = 'sky' }: { children: React.ReactNode; tone?: 'sky' | 'emerald' | 'rose' | 'amber' }) => {
  const c = { sky: 'text-sky-200 bg-sky-500/10', emerald: 'text-emerald-200 bg-emerald-500/10', rose: 'text-rose-200 bg-rose-500/10', amber: 'text-amber-200 bg-amber-500/10' }[tone];
  return <div className={`rounded-lg px-3 py-2 text-xs md:text-sm ${c}`}>{children}</div>;
};

/* ───────────── graph / tree (SVG, fixed positions) ───────────── */

export type EdgeTone = 'normal' | 'active' | 'chosen' | 'dim' | 'hit';
export type GNode = { id: string | number; x: number; y: number; label?: React.ReactNode; tone?: CellTone; below?: React.ReactNode; above?: React.ReactNode };
export type GEdge = { a: string | number; b: string | number; w?: React.ReactNode; tone?: EdgeTone; directed?: boolean };

const NODE_FILL: Record<CellTone, [string, string, string]> = {
  // fill, stroke, text
  normal: ['#1e293b', '#64748b', '#f1f5f9'],
  active: ['#78350f', '#fbbf24', '#fef3c7'],
  yes: ['#064e3b', '#34d399', '#d1fae5'],
  no: ['#1e293b', '#334155', '#64748b'],
  dim: ['#0f172a', '#1e293b', '#475569'],
  hit: ['#881337', '#fb7185', '#ffe4e6'],
  blue: ['#0c4a6e', '#38bdf8', '#e0f2fe'],
};
const EDGE_STROKE: Record<EdgeTone, [string, number]> = {
  normal: ['#64748b', 2], active: ['#fbbf24', 4], chosen: ['#34d399', 4], dim: ['#1e293b', 2], hit: ['#fb7185', 4],
};

/** Nodes and edges at fixed positions (viewBox units). Colors carry meaning only together with labels. */
export const GraphView = ({ nodes, edges, width = 520, height = 260, r = 18 }: { nodes: GNode[]; edges: GEdge[]; width?: number; height?: number; r?: number }) => {
  const at = new Map(nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height * 1.15 }}>
      <defs>
        {(Object.keys(EDGE_STROKE) as EdgeTone[]).map((t) => (
          <marker key={t} id={`arrow-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_STROKE[t][0]} />
          </marker>
        ))}
      </defs>
      {edges.map((e, i) => {
        const A = at.get(e.a)!, B = at.get(e.b)!;
        const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        const tone = e.tone ?? 'normal';
        const [stroke, sw] = EDGE_STROKE[tone];
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        return (
          <g key={i}>
            <line x1={A.x + ux * r} y1={A.y + uy * r} x2={B.x - ux * (r + (e.directed ? 2 : 0))} y2={B.y - uy * (r + (e.directed ? 2 : 0))}
              stroke={stroke} strokeWidth={sw} strokeLinecap="round" markerEnd={e.directed ? `url(#arrow-${tone})` : undefined}
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
            {e.w !== undefined && (
              <g>
                <rect x={mx - 11} y={my - 9} width={22} height={18} rx={4} fill="#0f172a" />
                <text x={mx} y={my + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={tone === 'dim' ? '#475569' : '#e2e8f0'} fontFamily="monospace">{e.w}</text>
              </g>
            )}
          </g>
        );
      })}
      {nodes.map((n) => {
        const [fill, stroke, text] = NODE_FILL[n.tone ?? 'normal'];
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={stroke} strokeWidth={n.tone === 'active' || n.tone === 'hit' ? 3.5 : 2} style={{ transition: 'fill 0.3s, stroke 0.3s' }} />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={text} fontFamily="monospace">{n.label ?? n.id}</text>
            {n.above !== undefined && <text x={n.x} y={n.y - r - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fcd34d">{n.above}</text>}
            {n.below !== undefined && <text x={n.x} y={n.y + r + 14} textAnchor="middle" fontSize={11} fill="#94a3b8">{n.below}</text>}
          </g>
        );
      })}
    </svg>
  );
};

/* ───────────── sequences: queue / stack / list ───────────── */

export type SeqItem = { v: React.ReactNode; tone?: CellTone; top?: React.ReactNode; bottom?: React.ReactNode; struck?: boolean };

/** A row of boxes (queue, deque, list). `empty` is shown when there is nothing. */
export const Seq = ({ items, empty = '（空）', size = 'md', left, right }: { items: SeqItem[]; empty?: string; size?: 'sm' | 'md'; left?: string; right?: string }) => (
  <div className="flex flex-wrap items-end gap-1.5 min-h-[64px]">
    {left && <span className="self-center text-[10px] font-bold text-slate-500">{left}</span>}
    {items.length === 0 && <span className="self-center text-xs text-slate-500">{empty}</span>}
    {items.map((it, i) => <ValueCell key={i} value={it.v} tone={it.tone} top={it.top} bottom={it.bottom} struck={it.struck} size={size} />)}
    {right && <span className="self-center text-[10px] font-bold text-slate-500">{right}</span>}
  </div>
);

/** A vertical stack (top at the top). */
export const StackView = ({ items, empty = '（空）', width = 'w-40' }: { items: { v: React.ReactNode; tone?: CellTone; note?: React.ReactNode }[]; empty?: string; width?: string }) => (
  <div className={`flex flex-col-reverse gap-1 ${width} rounded-lg border-x-2 border-b-2 border-slate-600 p-1.5 min-h-[60px]`}>
    {items.length === 0 && <span className="py-2 text-center text-xs text-slate-500">{empty}</span>}
    {items.map((it, i) => (
      <motion.div key={i} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-md border px-2 py-1 text-center font-mono text-xs font-bold ${TONE[it.tone ?? 'normal']}`}>
        {it.v}{it.note !== undefined && <span className="ml-1.5 font-sans text-[10px] font-normal opacity-80">{it.note}</span>}
      </motion.div>
    ))}
  </div>
);

/* ───────────── 2D table (DP) ───────────── */

export type TCell = { v: React.ReactNode; tone?: CellTone; note?: React.ReactNode };

export const Table2D = ({ colHeads, rows, corner = '' }: { colHeads: React.ReactNode[]; rows: { head: React.ReactNode; cells: TCell[] }[]; corner?: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="mx-auto border-separate border-spacing-1 font-mono text-sm">
      <thead>
        <tr>
          <th className="px-1 text-[10px] font-bold text-slate-500">{corner}</th>
          {colHeads.map((h, i) => <th key={i} className="min-w-[2.5rem] px-1 text-[11px] font-bold text-slate-400">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <th className="whitespace-nowrap px-1 text-right text-[11px] font-bold text-slate-400">{r.head}</th>
            {r.cells.map((c, j) => (
              <td key={j} className={`h-10 min-w-[2.5rem] rounded-md border text-center font-bold transition-colors duration-300 ${TONE[c.tone ?? 'normal']}`}>
                <div>{c.v}</div>
                {c.note !== undefined && <div className="text-[9px] font-normal leading-none opacity-80">{c.note}</div>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Two panels side by side on wide screens. */
export const Split = ({ children }: { children: React.ReactNode }) => (
  <div className="grid w-full gap-3 md:grid-cols-2">{children}</div>
);
