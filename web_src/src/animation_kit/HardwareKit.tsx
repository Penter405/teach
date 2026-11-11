// HardwareKit: shared hardware-style parts for animations 28–37 (熟悉語法)
// Rules:
//  - DIM (half-hidden): code that is waiting for its turn stays visible at ~50% opacity, never 0
//  - DRAM cells and CPU registers are ALWAYS rendered (never hidden), only highlighted
import React from 'react';
import { motion } from 'motion/react';

export const DIM = 0.45;

export const clampStep = (step: number, n: number) => Math.max(0, Math.min(step, n - 1));

/* ───────────────────────── Code ───────────────────────── */

export type TokState = 'normal' | 'active' | 'dim' | 'done';

export const Tok = ({ children, s = 'normal', className = '' }: { children: React.ReactNode; s?: TokState; className?: string }) => {
  const style =
    s === 'active'
      ? 'bg-amber-500/25 text-amber-200 ring-2 ring-amber-400'
      : s === 'done'
        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/70 font-extrabold'
        : '';
  return (
    <motion.span
      animate={{ opacity: s === 'dim' ? DIM : 1, scale: s === 'active' ? 1.05 : 1 }}
      transition={{ duration: 0.35 }}
      className={`inline-block rounded px-0.5 ${style} ${className}`}
    >
      {children}
    </motion.span>
  );
};

export const Line = ({
  children, addr, pc = false, dim = false, indent = 0, jump,
}: { children?: React.ReactNode; addr?: string; pc?: boolean; dim?: boolean; indent?: number; jump?: string }) => (
  <motion.div
    animate={{ opacity: dim ? DIM : 1 }}
    transition={{ duration: 0.35 }}
    className={`flex items-center gap-2 whitespace-pre rounded px-1 py-[1px] ${pc ? 'bg-amber-400/15' : ''}`}
  >
    <span className="w-3 shrink-0 text-amber-400 text-xs">{pc ? '▶' : ''}</span>
    {addr !== undefined && <span className="w-9 shrink-0 text-[10px] text-slate-500">{addr}</span>}
    <span style={{ paddingLeft: indent * 18 }}>{children}</span>
    {jump && (
      <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="ml-2 text-[10px] font-sans font-bold text-pink-300 bg-pink-500/15 rounded px-1.5">
        {jump}
      </motion.span>
    )}
  </motion.div>
);

export const CodePanel = ({ children, title = 'Python' }: { children: React.ReactNode; title?: string }) => (
  <div className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 font-mono text-[13px] md:text-[15px] text-slate-100 shadow-lg overflow-x-auto">
    <div className="mb-1 text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500">{title}</div>
    {children}
  </div>
);

/* ───────────────────────── Board ───────────────────────── */

export const Board = ({ children }: { children: React.ReactNode }) => (
  <div
    className="w-full flex flex-col gap-3 rounded-2xl border border-emerald-800 p-3 md:p-4 select-none"
    style={{
      backgroundColor: '#052e1f',
      backgroundImage:
        'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)',
      backgroundSize: '18px 18px',
    }}
  >
    {children}
  </div>
);

export const HwRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-0 w-full">{children}</div>
);

/* ───────────────────────── CPU ───────────────────────── */

export type Reg = { name: string; value: React.ReactNode; bin?: string; hot?: boolean };
export type Alu = { op: string; a?: React.ReactNode; b?: React.ReactNode; out?: React.ReactNode } | null;

const Pins = ({ side }: { side: 'top' | 'bottom' }) => (
  <div className={`absolute left-4 right-4 ${side === 'top' ? '-top-[7px]' : '-bottom-[7px]'} flex justify-between pointer-events-none`}>
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="w-1.5 h-[7px] bg-amber-400/70 rounded-sm" />
    ))}
  </div>
);

export const CPU = ({ regs, alu = null, flags, extra }: { regs: Reg[]; alu?: Alu; flags?: { Z: number; N: number } | null; extra?: React.ReactNode }) => (
  <div className="relative w-full md:w-60 shrink-0 rounded-xl border-2 border-sky-500/70 bg-slate-900 p-3 shadow-[0_0_18px_rgba(14,165,233,0.25)]">
    <Pins side="top" />
    <Pins side="bottom" />
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[11px] font-bold tracking-widest text-sky-300">CPU</span>
      <span className="text-[9px] text-slate-500">registers</span>
    </div>
    <div className="flex flex-col gap-1">
      {regs.map((r) => (
        <motion.div
          key={r.name}
          animate={{ boxShadow: r.hot ? '0 0 0 2px #fbbf24, 0 0 12px rgba(251,191,36,0.45)' : '0 0 0 1px #334155' }}
          className="flex items-center gap-2 rounded-md bg-slate-800 px-2 py-1 font-mono"
        >
          <span className="w-12 shrink-0 text-[10px] font-bold text-sky-400">{r.name}</span>
          <motion.span
            key={String(typeof r.value === 'string' || typeof r.value === 'number' ? r.value : r.name)}
            initial={{ scale: 1.35, color: '#fbbf24' }}
            animate={{ scale: 1, color: '#f1f5f9' }}
            transition={{ duration: 0.45 }}
            className="text-sm font-bold"
          >
            {r.value}
          </motion.span>
          {r.bin && <span className="ml-auto text-[9px] text-emerald-400/80">{r.bin}</span>}
        </motion.div>
      ))}
    </div>
    {/* ALU is hardware: always on screen, idle when unused */}
    <motion.div
      animate={{ borderColor: alu ? '#f472b6' : '#334155' }}
      className="mt-2 rounded-lg border-2 bg-slate-950 px-2 py-1.5"
    >
      <div className="text-[9px] font-bold tracking-widest text-pink-300">ALU</div>
      <div className="font-mono text-xs text-slate-200 min-h-[18px]">
        {alu ? (
          <motion.span key={alu.op + String(alu.out)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-pink-300 font-bold">{alu.op}</span>
            {alu.a !== undefined && <> {alu.a}</>}
            {alu.b !== undefined && <>, {alu.b}</>}
            {alu.out !== undefined && <> → <span className="text-amber-300 font-bold">{alu.out}</span></>}
          </motion.span>
        ) : (
          <span className="text-slate-600">idle</span>
        )}
      </div>
    </motion.div>
    {flags && (
      <div className="mt-1.5 flex gap-2 font-mono text-[10px]">
        <span className="text-slate-400">FLAGS</span>
        <span className={flags.Z ? 'text-amber-300 font-bold' : 'text-slate-500'}>Z={flags.Z}</span>
        <span className={flags.N ? 'text-amber-300 font-bold' : 'text-slate-500'}>N={flags.N}</span>
      </div>
    )}
    {extra}
  </div>
);

/* ───────────────────────── Bus ───────────────────────── */

export const Bus = ({ active = false, toRam = true, label }: { active?: boolean; toRam?: boolean; label?: string }) => (
  <div className="relative flex md:flex-1 min-w-[56px] items-center justify-center py-2 md:py-0">
    {/* horizontal trace (desktop) */}
    <div className="hidden md:block relative w-full h-1.5 rounded bg-amber-600/50">
      {active && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]"
          initial={{ left: toRam ? '0%' : '100%' }}
          animate={{ left: toRam ? ['0%', '95%'] : ['95%', '0%'] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
    {/* vertical trace (mobile) */}
    <div className="md:hidden relative h-8 w-1.5 rounded bg-amber-600/50">
      {active && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]"
          animate={{ top: toRam ? ['0%', '80%'] : ['80%', '0%'] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
    <div className="absolute md:-top-1 left-1/2 -translate-x-1/2 md:translate-x-[-50%] ml-10 md:ml-0 whitespace-nowrap text-[9px] font-bold tracking-wider text-amber-300/90">
      {label ?? 'BUS'}
    </div>
  </div>
);

/* ───────────────────────── DRAM ───────────────────────── */

export type Cell =
  | { header: string }
  | { addr: string; label?: React.ReactNode; value: React.ReactNode; note?: React.ReactNode; hot?: boolean; stale?: boolean; ptr?: boolean };

export const RAM = ({ cells, title = 'DRAM', wide = false }: { cells: Cell[]; title?: string; wide?: boolean }) => (
  <div className={`relative w-full ${wide ? 'md:w-80' : 'md:w-64'} shrink-0 rounded-xl border-2 border-emerald-500/60 bg-slate-900 p-3 shadow-[0_0_18px_rgba(16,185,129,0.2)]`}>
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[11px] font-bold tracking-widest text-emerald-300">{title}</span>
      <span className="text-[9px] text-slate-500">memory unit</span>
    </div>
    <div className="flex flex-col gap-1">
      {cells.map((c, i) =>
        'header' in c ? (
          <div key={'h' + i} className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">{c.header}</div>
        ) : (
          <motion.div
            key={c.addr}
            layout
            initial={{ opacity: 0, x: 10 }}
            animate={{
              opacity: 1,
              x: 0,
              boxShadow: c.hot ? '0 0 0 2px #fbbf24, 0 0 12px rgba(251,191,36,0.45)' : '0 0 0 1px #334155',
            }}
            className={`flex items-center gap-2 rounded-md px-2 py-1 font-mono ${c.stale ? 'bg-slate-800/60 border border-dashed border-slate-500' : 'bg-slate-800'}`}
          >
            <span className="w-11 shrink-0 text-[9px] text-slate-500">{c.addr}</span>
            {c.label !== undefined && <span className="shrink-0 text-[11px] font-bold text-cyan-300">{c.label}</span>}
            <span className={`text-sm font-bold ${c.stale ? 'text-slate-400' : c.ptr ? 'text-violet-300' : 'text-emerald-300'}`}>{c.value}</span>
            {c.note !== undefined && <span className="ml-auto text-[9px] text-slate-400 text-right">{c.note}</span>}
          </motion.div>
        ),
      )}
    </div>
  </div>
);

/* ───────────────────────── I/O devices ───────────────────────── */

export const Screen = ({ lines, active = false, cursor = false }: { lines: React.ReactNode[]; active?: boolean; cursor?: boolean }) => (
  <motion.div
    animate={{ boxShadow: active ? '0 0 0 2px #22d3ee, 0 0 14px rgba(34,211,238,0.4)' : '0 0 0 1px #334155' }}
    className="w-full rounded-lg bg-black p-2 font-mono text-sm text-green-400 min-h-[56px]"
  >
    <div className="mb-1 text-[9px] font-sans font-bold tracking-widest text-slate-500">SCREEN</div>
    {lines.map((l, i) => (
      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{l}</motion.div>
    ))}
    {cursor && (
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="inline-block w-2 h-4 bg-green-400 align-middle" />
    )}
  </motion.div>
);

export const Keyboard = ({ keys, pressed = [] }: { keys: string[]; pressed?: string[] }) => (
  <div className="w-full rounded-lg bg-slate-800 p-2">
    <div className="mb-1 text-[9px] font-bold tracking-widest text-slate-400">KEYBOARD</div>
    <div className="flex gap-1 flex-wrap">
      {keys.map((k) => {
        const on = pressed.includes(k);
        return (
          <motion.div
            key={k}
            animate={{ y: on ? 2 : 0, backgroundColor: on ? '#fbbf24' : '#e2e8f0' }}
            className="min-w-[30px] px-1.5 h-7 rounded flex items-center justify-center font-mono text-xs font-bold text-slate-800 shadow-[0_2px_0_#64748b]"
          >
            {k}
          </motion.div>
        );
      })}
    </div>
  </div>
);

export const Buffer = ({ name, bytes, active = false }: { name: string; bytes: React.ReactNode[]; active?: boolean }) => (
  <motion.div
    animate={{ boxShadow: active ? '0 0 0 2px #fbbf24' : '0 0 0 1px #334155' }}
    className="w-full rounded-lg bg-slate-900 p-2"
  >
    <div className="mb-1 text-[9px] font-bold tracking-widest text-slate-400">{name}</div>
    <div className="flex gap-1 min-h-[26px]">
      {bytes.map((b, i) => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-[11px] text-amber-200">
          {b}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

/* Small label used under a piece of hardware */
export const Tag = ({ children, tone = 'amber' }: { children: React.ReactNode; tone?: 'amber' | 'pink' | 'sky' | 'emerald' }) => {
  const t = {
    amber: 'bg-amber-400/15 text-amber-200 border-amber-400/50',
    pink: 'bg-pink-400/15 text-pink-200 border-pink-400/50',
    sky: 'bg-sky-400/15 text-sky-200 border-sky-400/50',
    emerald: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/50',
  }[tone];
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg border px-2 py-1 text-[11px] font-bold ${t}`}>
      {children}
    </motion.div>
  );
};

/* Logic gate (AND / OR) drawn as a real gate symbol; wires light up when 1 */
export const Gate = ({ kind = 'AND', a, b, out, label }: { kind?: 'AND' | 'OR'; a: string; b: string; out: string; label?: string }) => {
  const on = (v: string) => v !== '0' && v !== 'False' && !/^0b0+$/.test(v);
  const wire = (v: string) => (on(v) ? '#fbbf24' : '#475569');
  const body = kind === 'AND' ? 'M120 10 H150 A30 30 0 0 1 150 70 H120 Z' : 'M115 10 Q155 10 175 40 Q155 70 115 70 Q132 40 115 10 Z';
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 270 80" className="w-64 h-20">
        <line x1="0" y1="25" x2="122" y2="25" stroke={wire(a)} strokeWidth="4" />
        <line x1="0" y1="55" x2="122" y2="55" stroke={wire(b)} strokeWidth="4" />
        <path d={body} fill="#0f172a" stroke="#f472b6" strokeWidth="3" />
        <line x1="180" y1="40" x2="270" y2="40" stroke={wire(out)} strokeWidth="4" />
        <text x="4" y="18" fill="#e2e8f0" fontSize="11" fontFamily="monospace">{a}</text>
        <text x="4" y="73" fill="#e2e8f0" fontSize="11" fontFamily="monospace">{b}</text>
        <text x="132" y="45" fill="#f9a8d4" fontSize="12" fontWeight="bold" fontFamily="monospace">{kind}</text>
        <text x="186" y="32" fill="#fcd34d" fontSize="12" fontWeight="bold" fontFamily="monospace">{out}</text>
      </svg>
      {label && <div className="text-[10px] text-slate-400">{label}</div>}
    </div>
  );
};
