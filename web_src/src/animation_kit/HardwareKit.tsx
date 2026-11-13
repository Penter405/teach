// HardwareKit: shared hardware-style parts for animations 28–37 (熟悉語法)
// Rules:
//  - DIM (half-hidden): code that is waiting for its turn stays visible at ~50% opacity, never 0
//  - DRAM cells and CPU registers are ALWAYS rendered (never hidden), only highlighted
import React from 'react';
import { motion } from 'motion/react';
import { SlotColumn, useSlot, useStepSize } from './stepSize';
import { addrRange, asRegister, encode, setHwView, useHwView, type BitStyle, type Data, type HwMode, type HwView } from './bits';

export const DIM = 0.45;

export const clampStep = (step: number, n: number) => Math.max(0, Math.min(step, n - 1));

/* ───────────────────────── Code ───────────────────────── */

export type TokState = 'normal' | 'active' | 'dim' | 'done';

const textOf = (n: React.ReactNode): string =>
  React.Children.toArray(n).map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : React.isValidElement(c) ? textOf((c.props as { children?: React.ReactNode }).children) : '')).join('');

export const Tok = ({ children, s = 'normal', className = '' }: { children: React.ReactNode; s?: TokState; className?: string }) => {
  const style =
    s === 'active'
      ? 'bg-amber-500/25 text-amber-200 ring-2 ring-amber-400'
      : s === 'done'
        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/70 font-extrabold'
        : '';
  const text = textOf(children);
  return (
    <motion.span
      data-tok=""
      data-tok-state={s}
      animate={{ opacity: s === 'dim' ? DIM : 1, scale: s === 'active' ? 1.05 : 1 }}
      transition={{ duration: 0.35 }}
      className={`inline-block rounded px-0.5 ${style} ${className}`}
    >
      {s === 'done' ? (
        // a result replacing the expression it came from: pops in, like simplifying math
        <motion.span
          key={text}
          className="inline-block"
          initial={{ opacity: 0, scale: 1.6, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        >
          {children}
        </motion.span>
      ) : children}
    </motion.span>
  );
};

export const Line = ({
  children, addr, pc = false, dim = false, indent = 0, jump, io,
}: { children?: React.ReactNode; addr?: string; pc?: boolean; dim?: boolean; indent?: number; jump?: string; io?: React.ReactNode }) => (
  <motion.div
    animate={{ opacity: dim ? DIM : 1 }}
    transition={{ duration: 0.35 }}
    data-line=""
    data-pc={pc ? '1' : '0'}
    className={`flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-pre rounded px-1 py-[1px] ${pc ? 'bg-amber-400/15' : ''}`}
  >
    <span className="w-3 shrink-0 text-amber-400 text-xs">{pc ? '▶' : ''}</span>
    {addr !== undefined && <span className="w-9 shrink-0 text-[10px] text-slate-500">{addr}</span>}
    <span style={{ paddingLeft: indent * 18 }}>{children}</span>
    {jump && (
      <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="ml-2 text-[10px] font-sans font-bold text-pink-300 bg-pink-500/15 rounded px-1.5">
        {jump}
      </motion.span>
    )}
    {io}
  </motion.div>
);

export const CodePanel = ({ children, title = 'Python' }: { children: React.ReactNode; title?: string }) => (
  <div className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 font-mono text-[13px] md:text-[15px] text-slate-100 shadow-lg overflow-x-auto">
    <div className="mb-1 text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500">{title}</div>
    {children}
  </div>
);

/* ───────────────────────── Board ───────────────────────── */

/* Bits drawn as 0/1 digits or as lights. One group per byte. */
export const Bits = ({
  bytes, style, tone = 'emerald', small = false, truncated = false,
}: { bytes: string[]; style: BitStyle; tone?: 'emerald' | 'red' | 'blue' | 'slate'; small?: boolean; truncated?: boolean }) => {
  const color = { emerald: '#6ee7b7', red: '#f87171', blue: '#93c5fd', slate: '#94a3b8' }[tone];
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {bytes.map((b, bi) => (
        <span key={bi} className="inline-flex gap-[2px]">
          {b.split('').map((bit, i) =>
            style === 'lights' ? (
              <motion.span
                key={i}
                animate={{
                  backgroundColor: bit === '1' ? '#fbbf24' : '#1e293b',
                  boxShadow: bit === '1' ? '0 0 6px rgba(251,191,36,0.8)' : 'inset 0 0 0 1px #475569',
                }}
                transition={{ duration: 0.3 }}
                className={`${small ? 'w-[7px] h-[7px]' : 'w-[9px] h-[9px]'} rounded-full inline-block`}
              />
            ) : (
              <motion.span
                key={i}
                animate={{ color: bit === '1' ? color : '#64748b', backgroundColor: bit === '1' ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.6)' }}
                transition={{ duration: 0.3 }}
                className={`inline-flex items-center justify-center rounded-[2px] font-mono font-bold leading-none ${small ? 'w-[8px] h-[12px] text-[8px]' : 'w-[9px] h-[14px] text-[10px]'}`}
              >
                {bit}
              </motion.span>
            ),
          )}
        </span>
      ))}
      {truncated && <span className="text-[10px] text-slate-500">…</span>}
    </span>
  );
};

/* Display switches shown on every board; the choice is shared by all boards. */
const Switch = ({ on, label, hint, onChange }: { on: boolean; label: string; hint: string; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    title={hint}
    onClick={() => onChange(!on)}
    onPointerDown={(e) => e.stopPropagation()}
    className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] font-bold text-emerald-100/90 hover:bg-emerald-500/10"
  >
    <span className={`relative inline-block h-[16px] w-[28px] rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-slate-600'}`}>
      <span className={`absolute top-[2px] h-[12px] w-[12px] rounded-full bg-white shadow transition-all ${on ? 'left-[14px]' : 'left-[2px]'}`} />
    </span>
    {label}
  </button>
);

export const HwViewControl = () => {
  const v = useHwView();
  const anyBinary = v.memBinary || v.cpuBinary;
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1" aria-label="顯示設定">
      <Switch on={v.memBinary} label="記憶體二進位" hint="記憶體裡的資料用 0 和 1 顯示" onChange={(x) => setHwView({ memBinary: x })} />
      <Switch on={v.cpuBinary} label="CPU 二進位" hint="暫存器裡的資料用 0 和 1 顯示" onChange={(x) => setHwView({ cpuBinary: x })} />
      <Switch on={v.memTable} label="記憶體表格" hint="記憶體畫成一整塊格子板，一格 = 1 byte" onChange={(x) => setHwView({ memTable: x })} />
      <Switch on={v.moreRegs} label="更多暫存器" hint="顯示 IR、MAR、MDR，以及作業系統的輸入／輸出暫存區" onChange={(x) => setHwView({ moreRegs: x })} />
      <Switch on={v.asmLevel} label="組合語言" hint="「現在在做什麼」改用組合語言（assembly）顯示" onChange={(x) => setHwView({ asmLevel: x })} />
      <Switch on={v.threeCol} label="三欄排列" hint="CPU ｜ DRAM ｜ Python 排成三欄（畫面夠寬時）" onChange={(x) => setHwView({ threeCol: x })} />
      <Switch on={v.ioBar} label="I/O 放說明欄" hint="鍵盤、螢幕放在下方一整條；關掉時放在 input()、print 旁邊" onChange={(x) => setHwView({ ioBar: x })} />
      {anyBinary && <Switch on={v.bitStyle === 'lights'} label="燈號" hint="0 / 1 改用燈亮、燈滅表示" onChange={(x) => setHwView({ bitStyle: x ? 'lights' : 'digits' })} />}
    </div>
  );
};

/* ───────── helpers that read what an animation put on the board ───────── */

type El = React.ReactElement<Record<string, unknown> & { children?: React.ReactNode }>;
const isEl = (c: unknown): c is El => React.isValidElement(c);
const kids = (c: El) => c.props.children as React.ReactNode;

/** Walk every element under a node. */
function walk(node: React.ReactNode, fn: (e: El) => void) {
  React.Children.forEach(node, (c) => {
    if (!isEl(c)) return;
    fn(c);
    if (kids(c) !== undefined) walk(kids(c), fn);
  });
}

/** Remove elements of some types (deep), collecting them. */
function strip(node: React.ReactNode, types: unknown[], found: El[]): React.ReactNode {
  return React.Children.map(node, (c) => {
    if (!isEl(c)) return c;
    if (types.includes(c.type)) { found.push(c); return null; }
    if (kids(c) === undefined || typeof c.type === 'string' && false) return c;
    return React.cloneElement(c, undefined, strip(kids(c), types, found));
  });
}

/** Map every <Line> under a node. */
function mapLines(node: React.ReactNode, fn: (line: El, index: number) => El, counter = { n: 0 }): React.ReactNode {
  return React.Children.map(node, (c) => {
    if (!isEl(c)) return c;
    if (c.type === Line) return fn(c, counter.n++);
    if (kids(c) === undefined) return c;
    return React.cloneElement(c, undefined, mapLines(kids(c), fn, counter));
  });
}

const str = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : textOf(v as React.ReactNode).trim());

/** Work out "現在在做什麼", IR, MAR and MDR from the code, ALU, bus and memory of this step. */
function deriveCpu(code: React.ReactNode, cpu: El | undefined, bus: El | undefined, ram: El | undefined): CpuDerived {
  const active: string[] = [];
  let pcLine = '';
  const jumps: string[] = [];
  walk(code, (e) => {
    if (e.type === Tok && e.props.s === 'active') active.push(textOf(kids(e)).trim());
    if (e.type === Line) {
      if (e.props.pc) pcLine = textOf(kids(e)).trim();
      if (e.props.jump) jumps.push(String(e.props.jump));
    }
  });
  const regs = (cpu?.props.regs as Reg[] | undefined) ?? [];
  const { gp } = namedRegs(regs);
  const alu = cpu?.props.alu as Alu | undefined;
  const busOn = !!bus?.props.active;
  const toRam = bus?.props.toRam !== false;
  const busLabel = bus?.props.label ? String(bus.props.label) : '';

  // memory cells touched this step (hot), names vs. data
  let section = '';
  const hotData: { addr: string; value: string; label?: string }[] = [];
  const hotNames: { addr: string; value: string; label: string }[] = [];
  for (const c of ((ram?.props.cells as Cell[] | undefined) ?? [])) {
    if ('header' in c) { section = c.header; continue; }
    if (!c.hot) continue;
    const v = str(c.value);
    if (/name|symbol/i.test(section)) hotNames.push({ addr: c.addr, value: v, label: str(c.label) });
    else if (/^0x[0-9a-f]+$/i.test(c.addr) && encode(c.value).kind !== 'text') hotData.push({ addr: c.addr, value: v, label: c.label !== undefined ? str(c.label) : undefined });
  }

  const regFor = (v: unknown) => {
    const t = str(v);
    return gp.find((r) => str(r.value) === t)?.name;
  };

  const asm: { ins: string; note?: string }[] = [];
  const OP: Record<string, string> = { ADD: '+', SUB: '-', MUL: '×', DIV: '÷', MOD: '%', AND: 'and', OR: 'or' };
  let mem: { addr: string; value: string } | undefined;
  // a memory cell only becomes LOAD / STORE when a register really holds that value
  const moves = hotData.map((h) => ({ ...h, reg: regFor(h.value) })).filter((h) => h.reg).slice(0, 2);
  if (busOn && !toRam) {
    for (const h of moves) asm.push({ ins: `LOAD  ${h.reg}, [${h.addr}]`, note: `把 ${h.value} 從 DRAM 搬進 ${h.reg}` });
    if (!moves.length) asm.push({ ins: 'LOAD', note: busLabel || '從 DRAM 讀資料進 CPU' });
    mem = moves[0];
  }
  let aluIns = '';
  if (alu) {
    const a = alu.a !== undefined ? regFor(alu.a) ?? str(alu.a) : '';
    const b = alu.b !== undefined ? regFor(alu.b) ?? str(alu.b) : '';
    const out = alu.out !== undefined ? regFor(alu.out) : undefined;
    aluIns = `${alu.op.padEnd(5)} ${[a, b].filter(Boolean).join(', ')}`.trim();
    const sa = alu.a !== undefined ? str(alu.a) : '', sb = alu.b !== undefined ? str(alu.b) : '';
    const what = alu.op === 'CMP' ? `比較 ${sa} 和 ${sb}` : OP[alu.op] ? `${sa} ${OP[alu.op]} ${sb}` : [sa, sb].filter(Boolean).join('、');
    asm.push({ ins: aluIns, note: `${what}${alu.out !== undefined ? ` → ${str(alu.out)}` : ''}${out ? `（結果放進 ${out}）` : ''}` });
  }
  if (busOn && toRam) {
    for (const h of moves) asm.push({ ins: `STORE ${h.reg}, [${h.addr}]`, note: `把 ${h.value} 寫回 DRAM` });
    const named = hotNames.filter((n) => busLabel && busLabel.includes(n.label)).slice(0, 1);
    for (const n of named) asm.push({ ins: `STORE [${n.label}], ${n.value.replace(/^→\s*/, '')}`, note: `名稱 ${n.label} 改存這個位址` });
    if (!moves.length && !named.length) asm.push({ ins: 'STORE', note: busLabel || '把資料寫回 DRAM' });
    mem = moves[0] ?? (named[0] ? { addr: named[0].addr, value: named[0].value } : undefined);
  }
  const realJumps = jumps.filter((j) => /跳|回|→|jump|return|下一個/i.test(j));
  for (const j of realJumps.slice(0, 1)) asm.push({ ins: 'JMP', note: j });
  if (!asm.length) asm.push({ ins: 'NOP', note: '這一步 CPU 沒有新的指令（在等待或只是說明）' });

  // Python level
  const act = active.join(' ').replace(/\s+/g, ' ');
  let python: string;
  if (alu && act) python = `計算 ${act}`;
  else if (busOn && toRam && hotNames.length) python = `把結果交給名稱 ${hotNames.map((n) => n.label).join('、')}`;
  else if (busOn && !toRam && act) python = `讀取 ${act} 需要的資料`;
  else if (act) python = `執行 ${act}`;
  else if (realJumps.length) python = `跳到別行：${realJumps[0]}`;
  else if (pcLine) python = `執行 ${pcLine.replace(/\s+/g, ' ')}`;
  else python = '準備開始';

  const firstIns = (aluIns || asm[0].ins).replace(/\s+/g, ' ');
  return { python, asm, ir: firstIns === 'NOP' ? '—' : firstIns, mar: mem?.addr ?? '—', mdr: mem?.value ?? '—' };
}

/* ── keyboard / screen as small badges ── */
const KeyCaps = ({ keys, pressed }: { keys: string[]; pressed: string[] }) => (
  <span className="inline-flex gap-1">
    {keys.map((k) => (
      <motion.span
        key={k}
        animate={{ y: pressed.includes(k) ? 1 : 0, backgroundColor: pressed.includes(k) ? '#fbbf24' : '#e2e8f0' }}
        className="rounded px-1.5 font-mono text-[11px] font-bold text-slate-900 shadow-[0_2px_0_#94a3b8]"
      >
        {k}
      </motion.span>
    ))}
  </span>
);
const BufBytes = ({ el }: { el: El }) => (
  <span className="inline-flex items-center gap-1 text-[10px] text-slate-300">
    <span className="text-slate-400">{str(el.props.name)}</span>
    {((el.props.bytes as React.ReactNode[]) ?? []).map((b, i) => <span key={i} className="rounded bg-slate-700 px-1 font-mono">{b}</span>)}
  </span>
);
const InBadge = ({ kb, bufs, more, echo }: { kb?: El; bufs: El[]; more: boolean; echo?: El }) => (
  <span className="ml-1 inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-sky-400/60 bg-sky-500/15 px-2 py-0.5 font-sans text-[11px] text-sky-100 whitespace-normal">
    <span className="text-base font-bold leading-none">⟵</span> ⌨
    {kb && <KeyCaps keys={(kb.props.keys as string[]) ?? []} pressed={(kb.props.pressed as string[]) ?? []} />}
    {more && bufs.map((b, i) => <BufBytes key={i} el={b} />)}
    {echo && ((echo.props.lines as React.ReactNode[]) ?? []).slice(-1).map((l, i) => (
      <span key={i} className="inline-flex items-center gap-1 text-slate-300">🖥 <span className="rounded bg-black px-1.5 font-mono text-[12px] text-green-400">{l}</span></span>
    ))}
  </span>
);
const OutBadge = ({ scr, bufs, more }: { scr?: El; bufs: El[]; more: boolean }) => {
  const lines = ((scr?.props.lines as React.ReactNode[]) ?? []).slice(-2);
  const on = !!scr?.props.active;
  return (
    <motion.span
      animate={{ boxShadow: on ? '0 0 0 2px #4ade80, 0 0 12px rgba(74,222,128,0.5)' : '0 0 0 0 transparent' }}
      className={`ml-1 inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 font-sans text-[11px] text-emerald-100 whitespace-normal ${lines.length ? '' : 'opacity-50'}`}
    >
      <span className="text-base font-bold leading-none">⟶</span> 🖥
      {lines.length
        ? lines.map((l, i) => <span key={i} className="rounded bg-black px-1.5 font-mono text-[12px] text-green-400">{l}</span>)
        : <span className="text-slate-400">（還沒輸出）</span>}
      {more && bufs.map((b, i) => <BufBytes key={i} el={b} />)}
    </motion.span>
  );
};

/* Board: CPU top-left, Python top-right, memory full width below.
   三欄排列: CPU | DRAM | Python.  Phones: one column. */
/** `now`: what this step did, in Python terms (shown as 現在在做什麼). Derived from the code if left out. */
export const Board = ({ children, now }: { children: React.ReactNode; now?: string }) => {
  const view = useHwView();
  // rows that some step uses keep their space on every step
  const stepSize = useStepSize();
  const reserved = (col: string) => stepSize.mode === 'show' && (stepSize.layout?.order[col]?.length ?? 0) > 0;
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 1) take the keyboard / screen / buffers out of wherever the animation put them
  const ioFound: El[] = [];
  const all = React.Children.toArray(strip(children, [Screen, Keyboard, Buffer], ioFound));
  const screen = ioFound.find((e) => e.type === Screen);
  const keyboard = ioFound.find((e) => e.type === Keyboard);
  const buffers = ioFound.filter((e) => e.type === Buffer);
  const inBufs = buffers.filter((b) => /input/i.test(str(b.props.name)));
  const outBufs = buffers.filter((b) => !/input/i.test(str(b.props.name)));

  const codeEls = all.filter((c) => isEl(c) && c.type === CodePanel) as El[];
  let rest = all.filter((c) => !(isEl(c) && c.type === CodePanel));
  // drop wrappers that became empty after removing the I/O parts
  rest = rest.filter((c) => !(isEl(c) && typeof c.type === 'string' && React.Children.toArray(kids(c)).length === 0));

  // 2) the CPU / bus / memory row
  const hwIdx = rest.findIndex((c) => isEl(c) && c.type === HwRow);
  const hw = hwIdx >= 0 ? (rest[hwIdx] as El) : undefined;
  const parts = hw ? React.Children.toArray(kids(hw)) : [];
  const cpuEl = parts.find((c) => isEl(c) && c.type === CPU) as El | undefined;
  const busEl = parts.find((c) => isEl(c) && c.type === Bus) as El | undefined;
  const ramEl = parts.find((c) => isEl(c) && c.type === RAM) as El | undefined;
  const others = parts.filter((c) => c !== cpuEl && c !== busEl && c !== ramEl);
  const restOthers = rest.filter((_, i) => i !== hwIdx);

  const derivedRaw = deriveCpu(codeEls, cpuEl, busEl, ramEl);
  const derived = now ? { ...derivedRaw, python: now } : derivedRaw;
  const cpu = cpuEl ? React.cloneElement(cpuEl, { derived, fill: true }) : null;

  // 3) I/O next to input() / print (unless the strip under the board is chosen)
  const showInline = !view.ioBar && (screen || keyboard);
  let code: React.ReactNode = codeEls;
  if (showInline) {
    const lines: { text: string; pc: boolean }[] = [];
    walk(codeEls, (e) => { if (e.type === Line) lines.push({ text: textOf(kids(e)), pc: !!e.props.pc }); });
    const inIdx = keyboard ? Math.max(0, lines.findIndex((l) => /input\(/.test(l.text))) : -1;
    const printIdxs = lines.map((l, i) => (/print\(/.test(l.text) ? i : -1)).filter((i) => i >= 0);
    const lastOut = str(((screen?.props.lines as React.ReactNode[]) ?? []).slice(-1)[0] ?? '');
    let outIdx = -1;
    if (screen && printIdxs.length) {
      outIdx = printIdxs.find((i) => lastOut && lines[i].text.includes(lastOut))
        ?? printIdxs.find((i) => lines[i].pc)
        ?? printIdxs[printIdxs.length - 1];
    } else if (screen) outIdx = lines.length - 1;
    // a print line "has run" once it is the current line or shows an active / finished part
    const ran: boolean[] = [];
    walk(codeEls, (e) => {
      if (e.type !== Line) return;
      let r = !!e.props.pc;
      walk(kids(e), (t) => { if (t.type === Tok && (t.props.s === 'active' || t.props.s === 'done')) r = true; });
      ran.push(r);
    });
    const printRan = outIdx >= 0 && (ran[outIdx] || ran.slice(outIdx + 1).some(Boolean));
    const echoInInput = !!keyboard && !printRan;
    code = mapLines(codeEls, (line, i) =>
      i === inIdx ? React.cloneElement(line, { io: <InBadge kb={keyboard} bufs={inBufs} more={view.moreRegs} echo={echoInInput ? screen : undefined} /> })
      : i === outIdx ? React.cloneElement(line, { io: <OutBadge scr={echoInInput ? undefined : screen} bufs={outBufs} more={view.moreRegs} /> })
      : line);
  }
  const ioStrip = (screen || keyboard) && view.ioBar ? (
    <div className="flex flex-wrap items-stretch gap-2">
      {keyboard && <div className="min-w-[12rem] flex-1">{keyboard}</div>}
      {view.moreRegs && buffers.map((b, i) => <div key={i} className="min-w-[12rem] flex-1">{b}</div>)}
      {screen && <div className="min-w-[12rem] flex-[2]">{screen}</div>}
    </div>
  ) : null;

  const threeCol = view.threeCol && w >= 1100;
  const layout: 'three' | 'split' | 'stack' = w < 700 ? 'stack' : threeCol ? 'three' : 'split';
  const codeCol = (cls: string) => <SlotColumn col="code" className={`flex flex-col gap-3 min-w-0 ${cls}`}>{code}</SlotColumn>;

  let body: React.ReactNode;
  if (layout === 'three' && hw) {
    body = (
      <div className="flex flex-row items-stretch w-full">
        {cpu && <div className="flex shrink-0 w-[23rem]">{cpu}</div>}
        {busEl ?? <div className="w-3" />}
        {ramEl && <div className="flex min-w-0 flex-1">{ramEl}</div>}
        <div className="w-3 shrink-0" />
        {codeCol('w-[26rem] shrink-0')}
      </div>
    );
  } else if (layout === 'split' && hw) {
    body = (
      <>
        <div className="flex flex-row items-stretch gap-3 w-full">
          {cpu && <div className="flex shrink-0 w-[23rem]">{cpu}</div>}
          {codeCol('flex-1')}
        </div>
        {busEl && <div className="flex justify-start pl-40">{React.cloneElement(busEl, { vertical: true })}</div>}
        {ramEl && <div className="flex w-full">{ramEl}</div>}
      </>
    );
  } else {
    body = (
      <>
        {codeCol('')}
        {cpu}
        {busEl && <div className="flex justify-center">{React.cloneElement(busEl, { vertical: true })}</div>}
        {ramEl}
      </>
    );
  }

  return (
    <div
      ref={ref}
      className="w-full flex flex-col gap-3 rounded-2xl border border-emerald-800 p-3 md:p-4 select-none"
      style={{
        backgroundColor: '#052e1f',
        backgroundImage:
          'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    >
      <HwViewControl />
      {body}
      {others}
      {(restOthers.length > 0 || reserved('rest')) && <SlotColumn col="rest" className="flex flex-col gap-3 min-w-0">{restOthers}</SlotColumn>}
      {(ioStrip || reserved('io')) && <SlotColumn col="io" className="flex flex-col gap-3 min-w-0">{ioStrip}</SlotColumn>}
    </div>
  );
};

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

/* ── register naming ──
   Real CPUs have a few kinds of registers. General-purpose ones are just numbered (R1, R2…);
   names like LEN / HASH in the animations are general-purpose registers that currently hold
   that value, so they become "R<n> · 現在放：…". */
type RegInfo = { zh: string; en: string; desc: string };
const INFO: Record<string, RegInfo> = {
  PC: { zh: '程式計數器', en: 'Program Counter', desc: '下一行要執行的程式在哪個位址' },
  IR: { zh: '指令暫存器', en: 'Instruction Register', desc: '正在執行的那一條指令' },
  SP: { zh: '堆疊指標', en: 'Stack Pointer', desc: 'stack 現在長到哪個位址（呼叫函式時用）' },
  MAR: { zh: '記憶體位址暫存器', en: 'Memory Address Register', desc: 'CPU 要讀／寫的 DRAM 位址' },
  MDR: { zh: '記憶體資料暫存器', en: 'Memory Data Register', desc: '剛從 DRAM 搬來、或準備寫回 DRAM 的資料' },
  GP: { zh: '通用暫存器', en: 'General-Purpose Register', desc: '放 ALU 要算的數字和算出來的結果；ALU 只能算暫存器裡的數' },
  FLAGS: { zh: '旗標暫存器', en: 'Flags Register', desc: '上一次計算的結果是不是 0（Z）、是不是負數（N）；if、> 這些判斷靠它' },
  ALU: { zh: '運算電路', en: 'Arithmetic Logic Unit', desc: '真正做加減乘除、比較、邏輯運算的電路' },
};
const HOLDS: Record<string, string> = {
  RET: '函式回傳值（RET）', LEN: 'list 長度（len）', CAP: 'list 容量（cap）', WRITES: '寫入次數',
  HASH: 'hash 值', IDX: '格子編號（index）', BASE: '起點位址（BASE）', ADDR: '要讀的位址', CNT: '迴圈計數（i）',
};
export const regTitle = (name: string) => INFO[name]?.zh ?? name;

export type GpReg = Reg & { num: number; holds?: string };
/** Keep R1…R4 as they are; give every other general-purpose register the lowest free number. */
export function namedRegs(regs: Reg[]) {
  const pc = regs.find((r) => r.name === 'PC');
  const sp = regs.find((r) => r.name === 'SP');
  const gp = regs.filter((r) => r !== pc && r !== sp);
  const used = new Set(gp.map((r) => /^R(\d+)$/.exec(r.name)?.[1]).filter(Boolean).map(Number));
  let next = 1;
  const out: GpReg[] = gp.map((r) => {
    const m = /^R(\d+)$/.exec(r.name);
    if (m) return { ...r, num: Number(m[1]) };
    while (used.has(next)) next++;
    used.add(next);
    return { ...r, num: next, name: 'R' + next, holds: HOLDS[r.name] ?? r.name };
  });
  out.sort((a, b) => a.num - b.num);
  return { pc, sp, gp: out };
}

/* Memory slot labels that are abbreviations */
const SLOT_NAMES: Record<string, string> = { ret: '返回位址' };
const slotLabel = (l: React.ReactNode) => (typeof l === 'string' && SLOT_NAMES[l] ? SLOT_NAMES[l] : l);

const TypeBadge = ({ type }: { type: string }) =>
  type ? <span className="shrink-0 rounded px-1 text-[9px] font-bold text-orange-300 bg-orange-400/10 border border-orange-400/40">{type}</span> : null;

/** Chinese name + abbreviation + English name; tap / hover shows what it is for. */
const InfoName = ({ k, abbr, size = 'sm' }: { k: keyof typeof INFO | string; abbr?: string; size?: 'sm' | 'xs' }) => {
  const info = INFO[k];
  const [open, setOpen] = React.useState(false);
  if (!info) return <span className="font-bold text-sky-300">{abbr ?? k}</span>;
  return (
    <span
      className="relative inline-flex min-w-0 cursor-help items-baseline gap-1 font-sans"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className={`${size === 'sm' ? 'text-[11px]' : 'text-[10px]'} whitespace-nowrap font-bold text-sky-300`}>{info.zh}</span>
      {abbr !== '' && <span className="whitespace-nowrap font-mono text-[9px] text-sky-500/80">{abbr ?? k}</span>}
      <span className="truncate text-[9px] text-slate-500">{info.en}</span>
      {open && (
        <span className="absolute left-0 top-full z-30 mt-1 w-56 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-normal leading-snug text-slate-900 shadow-xl">
          <b>{info.zh} {abbr ?? (k === 'GP' ? '' : k)}</b>：{info.desc}
        </span>
      )}
    </span>
  );
};

/** One register on one line (binary: bits on a second line). */
const RegRow = ({ name, k, r, mode, bitStyle, holds }: { name?: string; k: string; r: Reg; mode: HwMode; bitStyle: BitStyle; holds?: string }) => {
  const d = asRegister(encode(r.value));
  const showBits = mode !== 'easy' && d.kind !== 'text';
  const value = (
    <motion.span
      key={String(typeof r.value === 'string' || typeof r.value === 'number' ? r.value : r.name)}
      initial={{ scale: 1.25, color: '#fbbf24' }}
      animate={{ scale: 1, color: '#f1f5f9' }}
      transition={{ duration: 0.45 }}
      className="origin-right whitespace-nowrap text-sm font-bold"
    >
      {r.value}
    </motion.span>
  );
  return (
    <motion.div
      animate={{ boxShadow: r.hot ? '0 0 0 2px #fbbf24, 0 0 12px rgba(251,191,36,0.45)' : '0 0 0 1px #334155' }}
      className="flex flex-col gap-0.5 rounded-md bg-slate-800 px-2 py-1 font-mono"
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {k === 'GP'
          ? <span className="w-6 shrink-0 text-[11px] font-bold text-sky-300">{name}</span>
          : <InfoName k={k} />}
        {k === 'GP' && !showBits && <span className="shrink-0">{value}</span>}
        {holds && <span className="min-w-0 truncate font-sans text-[10px] text-amber-300/90">現在放：{holds}</span>}
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {k !== 'GP' && !showBits && value}
          {d.kind !== 'text' && d.kind !== 'empty' && <TypeBadge type={d.type} />}
        </span>
      </div>
      {showBits && <Bits bytes={d.bytes} truncated={d.truncated} style={bitStyle} tone="red" small />}
    </motion.div>
  );
};

/** What the CPU is doing this step, worked out by the Board from code / ALU / bus / memory. */
export type CpuDerived = {
  python: string;
  asm: { ins: string; note?: string }[];
  ir: string;
  mar: string;
  mdr: string;
};

const Section = ({ zh, en, children }: { zh: string; en: string; children: React.ReactNode }) => (
  <div className="mt-2 first:mt-0">
    <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{zh} · {en}</div>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

export const CPU = ({
  regs, alu = null, flags, extra, fill = false, derived,
}: { regs: Reg[]; alu?: Alu; flags?: { Z: number; N: number } | null; extra?: React.ReactNode; fill?: boolean; derived?: CpuDerived }) => {
  const view = useHwView();
  const mode: HwMode = view.cpuBinary ? 'medium' : 'easy';
  const bitStyle = view.bitStyle;
  const slot = useSlot('cpu');
  const { pc, sp, gp } = namedRegs(regs);
  const f = flags ?? { Z: 0, N: 0 };
  return (
    <div {...slot} className={`relative w-full ${fill ? 'min-w-0 flex-1' : 'md:w-[23rem] shrink-0'} rounded-xl border-2 border-sky-500/70 bg-slate-900 p-3 shadow-[0_0_18px_rgba(14,165,233,0.25)]`}>
      <Pins side="top" />
      <Pins side="bottom" />
      <div className="mb-2 text-[11px] font-bold tracking-widest text-sky-300">CPU</div>

      {/* what is happening right now */}
      {derived && (
        <div data-now={derived.python}>
        <Section zh="現在在做什麼" en="Now">
          <div className="rounded-lg border-2 border-amber-500/80 bg-amber-950/30 px-2.5 py-1.5">
            {view.asmLevel ? (
              <>
                <div className="text-[9px] font-bold tracking-widest text-amber-300">▶ 組合語言 · ASSEMBLY</div>
                <div className="mt-0.5 flex flex-col font-mono text-[11px] leading-[1.55]">
                  {derived.asm.map((a, i) => (
                    <motion.div key={a.ins + i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="whitespace-pre-wrap">
                      <span className="font-bold text-amber-300">{a.ins}</span>
                      {a.note && <span className="text-slate-300">  ; {a.note}</span>}
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-[9px] font-bold tracking-widest text-amber-300">▶ PYTHON</div>
                <motion.div key={derived.python} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-0.5 text-[13px] font-bold text-amber-100">
                  {derived.python}
                </motion.div>
              </>
            )}
          </div>
        </Section>
        </div>
      )}

      <Section zh="運算" en="Arithmetic">
        <motion.div animate={{ borderColor: alu ? '#f472b6' : '#334155' }} className="rounded-lg border-2 bg-slate-950 px-2 py-1.5">
          <InfoName k="ALU" abbr="" size="xs" />
          <div className="min-h-[18px] font-mono text-xs text-slate-200">
            {alu ? (
              <motion.span key={alu.op + String(alu.out)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <span className="font-bold text-pink-300">{alu.op}</span>
                {alu.a !== undefined && <> {alu.a}</>}
                {alu.b !== undefined && <>, {alu.b}</>}
                {alu.out !== undefined && <> → <span className="font-bold text-amber-300">{alu.out}</span></>}
              </motion.span>
            ) : <span className="text-slate-600">idle</span>}
          </div>
        </motion.div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-1 font-mono text-[10px]">
          <InfoName k="FLAGS" size="xs" />
          <span className={f.Z ? 'font-bold text-amber-300' : 'text-slate-500'}>等於 Z={f.Z}</span>
          <span className={f.N ? 'font-bold text-amber-300' : 'text-slate-500'}>負數 N={f.N}</span>
        </div>
      </Section>

      <Section zh="控制" en="Control">
        <RegRow k="PC" r={pc ?? { name: 'PC', value: '—' }} mode={mode} bitStyle={bitStyle} />
        {view.moreRegs && <RegRow k="IR" r={{ name: 'IR', value: derived?.ir ?? '—', hot: !!derived?.ir && derived.ir !== '—' }} mode="easy" bitStyle={bitStyle} />}
      </Section>

      <Section zh="暫存器" en="Registers">
        <div className="px-1"><InfoName k="GP" abbr="" size="xs" /></div>
        {gp.map((r) => <RegRow key={r.name} k="GP" name={r.name} holds={r.holds} r={r} mode={mode} bitStyle={bitStyle} />)}
        <RegRow k="SP" r={sp ?? { name: 'SP', value: '—' }} mode={mode} bitStyle={bitStyle} />
        {view.moreRegs && (
          <>
            <RegRow k="MAR" r={{ name: 'MAR', value: derived?.mar ?? '—', hot: !!derived?.mar && derived.mar !== '—' }} mode={mode} bitStyle={bitStyle} />
            <RegRow k="MDR" r={{ name: 'MDR', value: derived?.mdr ?? '—', hot: !!derived?.mdr && derived.mdr !== '—' }} mode={mode} bitStyle={bitStyle} />
          </>
        )}
      </Section>
      {extra}
    </div>
  );
};

/* ───────────────────────── Bus ───────────────────────── */

export const Bus = ({ active = false, toRam = true, label, vertical = false }: { active?: boolean; toRam?: boolean; label?: string; vertical?: boolean }) => (
  <div className={`relative flex min-w-[56px] items-center justify-center ${vertical ? 'py-2' : 'md:flex-1 md:max-w-[120px] py-2 md:py-0'}`}>
    {/* horizontal trace (desktop) */}
    <div className={`${vertical ? 'hidden' : 'hidden md:block'} relative w-full h-1.5 rounded bg-amber-600/50`}>
      {active && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]"
          initial={{ left: toRam ? '0%' : '100%' }}
          animate={{ left: toRam ? ['0%', '95%'] : ['95%', '0%'] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
    {/* vertical trace (mobile, or when memory sits under the CPU) */}
    <div className={`${vertical ? '' : 'md:hidden'} relative h-8 w-1.5 rounded bg-amber-600/50`}>
      {active && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]"
          animate={{ top: toRam ? ['0%', '80%'] : ['80%', '0%'] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
    <div className={`absolute whitespace-nowrap text-[9px] font-bold tracking-wider text-amber-300/90 ${vertical ? 'left-full top-1/2 -translate-y-1/2 -ml-4' : 'md:-top-1 left-1/2 -translate-x-1/2 md:translate-x-[-50%] ml-10 md:ml-0'}`}>
      {label ?? 'BUS'}
    </div>
  </div>
);

/* ───────────────────────── DRAM ───────────────────────── */

export type Cell =
  | { header: string }
  | {
      addr: string; label?: React.ReactNode; value: React.ReactNode; note?: React.ReactNode;
      hot?: boolean; stale?: boolean; ptr?: boolean;
      /** Highlight only these byte offsets (e.g. one character of a str, one slot of a list). */
      hotBytes?: number[];
      /** Red highlight (e.g. a lookup that missed). */
      warn?: boolean;
    };

type DataCell = Extract<Cell, { addr: string }>;

/* Memory is drawn as one continuous grid of bytes (rows of 8, or 4 / 2 on narrow screens).
   Every value covers its real address range; unused bytes stay visible as empty blocks.
   Names live in a separate symbol table at the top. */

const ADDR_W = 58;
const byteWidth = (mode: HwMode) => (mode === 'easy' ? 34 : 62);
const parseAddr = (a: string) => (/^0x[0-9a-fA-F]+$/.test(a) ? parseInt(a, 16) : null);
const hex = (n: number, w = n < 0x100 ? 2 : 4) => '0x' + n.toString(16).toUpperCase().padStart(w, '0');

type Alloc = { start: number; len: number; cell: DataCell; d: Data; truncated: boolean; section: string };
type Opaque = { at: number; cell: DataCell; section: string };

/** A thin "(" or ")" drawn like one pen stroke, empty inside. */
const Paren = ({ side, color }: { side: 'left' | 'right'; color: string }) => (
  <svg
    aria-hidden
    viewBox="0 0 10 100"
    preserveAspectRatio="none"
    className="pointer-events-none absolute top-0 h-full w-[9px]"
    style={side === 'left' ? { left: -6 } : { right: -6 }}
  >
    <path
      d={side === 'left' ? 'M8 3 C1 30, 1 70, 8 97' : 'M2 3 C9 30, 9 70, 2 97'}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

/** 8 bits of one byte, sized to exactly one grid column. */
const ByteBits = ({ byte, style, tone, hot }: { byte: string; style: BitStyle; tone: 'red' | 'blue' | 'emerald' | 'dim'; hot?: boolean }) => {
  const on = { red: '#f87171', blue: '#93c5fd', emerald: '#6ee7b7', dim: '#64748b' }[tone];
  return (
    <span className={`flex items-center justify-center gap-[1px] rounded-[3px] py-[2px] ${hot ? 'bg-amber-500/30' : ''}`} style={{ width: byteWidth('medium') }}>
      {byte.split('').map((bit, i) =>
        style === 'lights' ? (
          <motion.span
            key={i}
            animate={{
              backgroundColor: bit === '1' ? '#fbbf24' : '#1e293b',
              boxShadow: bit === '1' ? '0 0 5px rgba(251,191,36,0.85)' : 'inset 0 0 0 1px #475569',
            }}
            transition={{ duration: 0.3 }}
            className="w-[6px] h-[6px] rounded-full inline-block"
          />
        ) : (
          <motion.span
            key={i}
            animate={{ color: bit === '1' ? on : '#475569' }}
            transition={{ duration: 0.3 }}
            className="w-[6px] text-center font-mono text-[9px] font-bold leading-[12px]"
          >
            {bit}
          </motion.span>
        ),
      )}
    </span>
  );
};

/** Pick 8 / 4 / 2 bytes per row to fit the available width. */
function useBytesPerRow(ref: React.RefObject<HTMLDivElement | null>, mode: HwMode) {
  const [bpr, setBpr] = React.useState(8);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pick = () => {
      const w = el.clientWidth;
      const bw = byteWidth(mode);
      setBpr([16, 8, 4, 2].find((n) => ADDR_W + n * bw <= w) ?? 2);
    };
    pick();
    const ro = new ResizeObserver(pick);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, mode]);
  return bpr;
}

type PointerProps = {
  role?: 'button'; tabIndex?: number; title?: string; className?: string;
  onClick?: (e: React.MouseEvent) => void; onKeyDown?: (e: React.KeyboardEvent) => void; onPointerDown?: (e: React.PointerEvent) => void;
};

/* Memory table: one big board. Every square is one byte (8 bits / 8 lights, or the value
   when binary is off). ( ) mark which squares a value takes and its type; names are squares
   too (they hold an address). No section titles, no skipped rows. */
const SQ_W = 66;
const MemTable = ({
  symbols, allocs, view, width, pointedAt, selected, pointerProps,
}: {
  symbols: DataCell[]; allocs: Alloc[]; view: HwView; width: number; pointedAt: Set<number>;
  selected: number | null; pointerProps: (c: DataCell) => PointerProps;
}) => {
  const binary = view.memBinary;
  // names live on the board as well
  const items: (Alloc & { sym?: boolean })[] = [...allocs];
  for (const c of symbols) {
    const at = parseAddr(c.addr);
    const d = encode(c.value);
    if (at === null || d.kind === 'text') continue;
    items.push({ start: at, len: d.bytes.length, cell: c, d, truncated: false, section: 'names', sym: true });
  }
  items.sort((a, b) => a.start - b.start);
  for (let i = 0; i < items.length - 1; i++) {
    const room = items[i + 1].start - items[i].start;
    if (items[i].len > room) { items[i].len = Math.max(1, room); items[i].truncated = true; }
  }
  if (!items.length) return null;

  const bpr = [16, 8, 4, 2].find((n) => ADDR_W + n * SQ_W <= (width || 9999)) ?? 2;
  // after choosing how many fit, stretch the squares to fill the column
  const sq = width ? Math.max(SQ_W, Math.min(120, Math.floor((width - ADDR_W) / bpr))) : SQ_W;
  const firstRow = Math.floor(items[0].start / bpr);
  const lastRow = Math.floor(Math.max(...items.map((a) => a.start + a.len - 1)) / bpr);

  const bitsOf = (byte: string, dim: boolean) => (
    <span className="flex items-center justify-center gap-[1px]">
      {byte.split('').map((bit, i) =>
        view.bitStyle === 'lights' ? (
          <motion.span
            key={i}
            animate={{ backgroundColor: bit === '1' ? '#fbbf24' : '#1e293b', boxShadow: bit === '1' ? '0 0 5px rgba(251,191,36,0.85)' : 'inset 0 0 0 1px #475569' }}
            transition={{ duration: 0.3 }}
            className="h-[6px] w-[6px] rounded-full"
          />
        ) : (
          <motion.span
            key={i}
            animate={{ color: bit === '1' ? (dim ? '#93c5fd' : '#6ee7b7') : '#475569' }}
            transition={{ duration: 0.3 }}
            className="w-[6px] text-center font-mono text-[10px] font-bold leading-none"
          >
            {bit}
          </motion.span>
        ),
      )}
    </span>
  );

  const square = (key: React.Key, content: React.ReactNode, cls: string) => (
    <div key={key} className={`mx-[3px] flex h-[30px] items-center justify-center rounded-[3px] border ${cls}`} style={{ width: sq - 6 }}>
      {content}
    </div>
  );

  const rows: React.ReactNode[] = [];
  for (let r = firstRow; r <= lastRow; r++) {
    const base = r * bpr;
    const segs: React.ReactNode[] = [];
    let col = 0;
    while (col < bpr) {
      const addr = base + col;
      const a = items.find((x) => addr >= x.start && addr < x.start + x.len);
      if (!a) {
        segs.push(<div key={'f' + col} style={{ width: sq }}>{square(0, binary ? bitsOf('00000000', false) : null, 'border-slate-700 bg-slate-950/70')}</div>);
        col++;
        continue;
      }
      const segEnd = Math.min(a.start + a.len, base + bpr);
      const segLen = segEnd - addr;
      const first = addr === a.start;
      const last = segEnd === a.start + a.len;
      const freed = !!a.cell.stale;
      const color = freed ? '#60a5fa' : a.sym ? '#22d3ee' : '#fb923c';
      const isSel = selected === a.start;
      const hotAt = (off: number) => a.cell.hot && (!a.cell.hotBytes || a.cell.hotBytes.includes(off));
      const tintFor = (off: number) =>
        a.cell.warn ? 'border-red-400/80 bg-red-500/25'
        : isSel ? 'border-fuchsia-400 bg-fuchsia-500/30'
        : hotAt(off) ? 'border-amber-400/80 bg-amber-500/25'
        : pointedAt.has(a.start) ? 'border-violet-400/70 bg-violet-500/20'
        : 'border-slate-700 bg-slate-950/70';
      const label = first ? (
        a.sym
          ? <>{a.cell.label} <span className="text-cyan-200/70">{typeof a.cell.value === 'string' ? a.cell.value : ''}</span></>
          : freed ? '已釋放'
          : <>{a.cell.label !== undefined && <>{slotLabel(a.cell.label)}: </>}{a.d.type}</>
      ) : <span className="text-slate-500">…</span>;
      const pp = a.sym || targetOf(a.cell) !== null ? pointerProps(a.cell) : {};
      const valueText = typeof a.cell.value === 'string' || typeof a.cell.value === 'number' ? a.cell.value : '';

      segs.push(
        <motion.div
          key={'a' + a.start + '-' + col}
          {...pp}
          animate={{ boxShadow: isSel ? '0 0 14px rgba(232,121,249,0.85)' : '0 0 0 rgba(0,0,0,0)' }}
          className={`relative flex rounded-md ${pp.className ?? ''}`}
          style={{ width: segLen * sq }}
        >
          <span className="absolute -top-[17px] left-1 z-10 whitespace-nowrap text-[10px] font-bold leading-[12px]" style={{ color }}>
            {isSel && first ? <span className="text-fuchsia-300">★ </span> : null}{label}
          </span>
          {binary ? (
            Array.from({ length: segLen }, (_, i) => square(i, bitsOf(a.d.bytes[addr - a.start + i] ?? '00000000', freed), tintFor(addr - a.start + i)))
          ) : (
            // binary off: one box spanning the squares, showing the value
            <div
              className={`mx-[3px] flex h-[30px] flex-1 items-center justify-center overflow-hidden rounded-[3px] border font-mono text-[12px] font-bold ${tintFor(0)} ${
                freed ? 'text-slate-400' : a.d.kind === 'pointer' ? 'text-violet-200' : 'text-emerald-200'
              }`}
            >
              <span className="truncate px-1">{first ? valueText : ''}</span>
            </div>
          )}
          {first && <Paren side="left" color={color} />}
          {last && <Paren side="right" color={color} />}
        </motion.div>,
      );
      col += segLen;
    }
    rows.push(
      <div key={r} className="flex items-end">
        <span className="shrink-0 pb-[8px] font-mono text-[10px] text-slate-500" style={{ width: ADDR_W }}>{hex(base)}</span>
        {segs}
      </div>,
    );
  }
  return <div className="flex flex-col gap-[22px] pt-4">{rows}</div>;
};

const targetOf = (c: DataCell) => {
  const m = typeof c.value === 'string' ? c.value.match(/^→\s*(?:code\s+)?0x([0-9a-fA-F]+)$/) : null;
  return m ? parseInt(m[1], 16) : null;
};

export const RAM = ({ cells, title = 'DRAM' }: { cells: Cell[]; title?: string; wide?: boolean }) => {
  const view = useHwView();
  const mode: HwMode = view.memBinary ? 'medium' : 'easy';
  const bitStyle = view.bitStyle;
  // Tap a pointer (a name, or a slot holding an address) to select the object it points to.
  const [selected, setSelected] = React.useState<number | null>(null);
  const selectFrom = (c: DataCell) => {
    const t = targetOf(c);
    if (t !== null) setSelected((cur) => (cur === t ? null : t));
  };
  const pointerProps = (c: DataCell): PointerProps =>
    targetOf(c) === null ? {} : {
      role: 'button',
      tabIndex: 0,
      title: '點一下：選取它指向的物件',
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectFrom(c); },
      onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectFrom(c); } },
      onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
      className: 'cursor-pointer hover:brightness-125',
    };
  const ramSlot = useSlot('ram:' + title);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const bpr = useBytesPerRow(gridRef, mode);
  const [gridW, setGridW] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    setGridW(el.clientWidth);
    const ro = new ResizeObserver(() => setGridW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, view.memTable]);
  const bw = byteWidth(mode);

  // ── sort cells into the symbol table, byte allocations, and things that are not bytes ──
  const symbols: DataCell[] = [];
  const allocs: Alloc[] = [];
  const opaque: Opaque[] = [];
  let section = '';
  for (const c of cells) {
    if ('header' in c) { section = c.header; continue; }
    if (/name|symbol/i.test(section)) { symbols.push(c); continue; }
    const at = parseAddr(c.addr);
    const d = encode(c.value);
    if (at === null || d.kind === 'text') { opaque.push({ at: at ?? -1, cell: c, section }); continue; }
    allocs.push({ start: at, len: Math.max(1, d.bytes.length), cell: c, d, truncated: !!d.truncated, section });
  }
  allocs.sort((a, b) => a.start - b.start);
  // Objects that a highlighted name / pointer points at get a violet outline (name → address → object).
  const pointedAt = new Set<number>();
  for (const c of [...symbols, ...allocs.map((a) => a.cell)]) {
    if (!c.hot || typeof c.value !== 'string') continue;
    const m = c.value.match(/^→\s*0x([0-9a-fA-F]+)$/);
    if (m) pointedAt.add(parseInt(m[1], 16));
  }
  // A value can't run into the next one: cut it off there.
  for (let i = 0; i < allocs.length - 1; i++) {
    const room = allocs[i + 1].start - allocs[i].start;
    if (allocs[i].len > room) { allocs[i].len = Math.max(1, room); allocs[i].truncated = true; }
  }

  // ── rows to draw: rows that hold data, short gaps shown as empty rows, long gaps collapsed ──
  type RowItem = { kind: 'row'; r: number } | { kind: 'gap'; from: number; to: number } | { kind: 'opaque'; o: Opaque } | { kind: 'caption'; text: string };
  const used = new Set<number>();
  allocs.forEach((a) => { for (let b = a.start; b < a.start + a.len; b++) used.add(Math.floor(b / bpr)); });
  // where the names themselves live (shown on rows that are drawn anyway)
  const symRanges = symbols.flatMap((c) => {
    const at = parseAddr(c.addr);
    const d = encode(c.value);
    return at === null || d.kind === 'text' ? [] : [{ start: at, len: d.bytes.length, bytes: d.bytes, name: typeof c.label === 'string' ? c.label : 'name' }];
  });
  const items: { key: number; item: RowItem }[] = [];
  [...used].sort((a, b) => a - b).forEach((r, i, arr) => {
    if (i > 0) {
      const prev = arr[i - 1];
      if (r - prev - 1 === 1) items.push({ key: (prev + 1) * bpr, item: { kind: 'row', r: prev + 1 } });
      else if (r - prev - 1 > 1) items.push({ key: (prev + 1) * bpr, item: { kind: 'gap', from: (prev + 1) * bpr, to: r * bpr - 1 } });
    }
    items.push({ key: r * bpr, item: { kind: 'row', r } });
  });
  opaque.forEach((o) => items.push({ key: o.at < 0 ? -1 : o.at - 0.5, item: { kind: 'opaque', o } }));
  items.sort((a, b) => a.key - b.key);
  // captions (the animation's section headers) before the first row that belongs to them
  const out: RowItem[] = [];
  let lastCaption = '';
  for (const { item } of items) {
    const sec =
      item.kind === 'opaque' ? item.o.section
      : item.kind === 'row' ? allocs.find((a) => Math.floor(a.start / bpr) === item.r)?.section ?? lastCaption
      : lastCaption;
    if (sec && sec !== lastCaption) { out.push({ kind: 'caption', text: sec }); lastCaption = sec; }
    out.push(item);
  }

  const showType = true;
  const ring = (a: Alloc) =>
    a.cell.warn ? '0 0 0 2px #f87171'
    : a.cell.hot && !a.cell.hotBytes ? '0 0 0 2px #fbbf24, 0 0 10px rgba(251,191,36,0.45)'
    : selected === a.start ? '0 0 0 3px #c084fc, 0 0 16px rgba(192,132,252,0.9)'
    : pointedAt.has(a.start) ? '0 0 0 2px #a78bfa, 0 0 10px rgba(167,139,250,0.5)'
    : '0 0 0 0 transparent';

  const renderRow = (r: number) => {
    const base = r * bpr;
    const parts: React.ReactNode[] = [];
    let col = 0;
    while (col < bpr) {
      const addr = base + col;
      const a = allocs.find((x) => addr >= x.start && addr < x.start + x.len);
      if (!a) {
        // bytes that hold a name from the symbol table (drawn in the box above)
        const sym = symRanges.find((x) => addr >= x.start && addr < x.start + x.len);
        parts.push(
          <div key={'u' + col} style={{ gridColumn: `${col + 2} / span 1` }} className="relative flex items-end" title={sym ? `symbol table：${sym.name}` : undefined}>
            {sym && addr === sym.start && (
              <span className="absolute -top-[13px] left-0.5 whitespace-nowrap text-[9px] font-bold leading-none text-cyan-400/80">{sym.name}</span>
            )}
            {mode === 'easy'
              ? <span className={`w-full h-[22px] rounded-[3px] border border-dashed ${sym ? 'border-cyan-500/60 bg-cyan-500/10' : 'border-slate-700/80'}`} />
              : <ByteBits byte={sym?.bytes[addr - sym.start] ?? '00000000'} style={bitStyle} tone="dim" />}
          </div>,
        );
        col++;
        continue;
      }
      const segEnd = Math.min(a.start + a.len, base + bpr);
      const segLen = segEnd - addr;
      const first = addr === a.start;
      const last = segEnd === a.start + a.len;
      const freed = !!a.cell.stale;
      const off = addr - a.start;
      const bytes = a.d.bytes.slice(off, off + segLen);
      while (bytes.length < segLen) bytes.push('00000000');
      const hotAt = (i: number) => !!a.cell.hotBytes?.includes(off + i);
      const labelText = (
        <>
          {a.cell.label !== undefined && <span className="text-cyan-300">{slotLabel(a.cell.label)}</span>}
          {a.cell.label !== undefined && showType && <span className="text-slate-500">: </span>}
          {showType && (freed ? <span className="text-blue-300">已釋放 freed</span> : <span>{a.d.type}</span>)}
        </>
      );
      const bracket = freed ? 'rgba(96,165,250,0.8)' : 'rgba(251,146,60,0.85)';

      parts.push(
        <motion.div
          key={'a' + a.start + '-' + col}
          {...pointerProps(a.cell)}
          style={{ gridColumn: `${col + 2} / span ${segLen}` }}
          animate={{ boxShadow: ring(a) }}
          className={`relative flex flex-col justify-end rounded-md px-[1px] ${mode === 'easy' && freed ? 'opacity-60' : ''} ${pointerProps(a.cell).className ?? ''}`}
        >
          {(
            <span className={`block truncate text-[9px] leading-[11px] font-bold px-0.5 ${freed ? 'text-blue-300' : 'text-orange-300'}`}>
              {first ? labelText : <span className="text-slate-500">…</span>}
            </span>
          )}
          {mode === 'easy' ? (
            <span
              className={`flex items-center justify-center h-[22px] rounded-[3px] font-mono text-[11px] font-bold truncate px-1 ${
                freed ? 'border border-dashed border-slate-500 text-slate-400' : a.d.kind === 'pointer' ? 'bg-violet-500/15 text-violet-200' : 'bg-emerald-500/10 text-emerald-200'
              } ${a.cell.hotBytes?.length ? '' : ''}`}
            >
              {first ? a.cell.value : ''}
              {a.cell.hotBytes && bytes.map((_, i) => hotAt(i) && (
                <span key={i} className="absolute bottom-0 h-[22px] rounded-[3px] bg-amber-500/35" style={{ left: i * bw + 2, width: bw - 2 }} />
              ))}
            </span>
          ) : (
            <span className="flex">
              {bytes.map((b, i) => (
                <ByteBits key={i} byte={b} style={bitStyle} tone={freed ? 'blue' : 'red'} hot={hotAt(i)} />
              ))}
            </span>
          )}
          {selected === a.start && first && <span className="absolute -top-3 right-0 text-[10px] font-bold text-fuchsia-300">★ 選取</span>}
          {mode !== 'easy' && first && <Paren side="left" color={bracket} />}
          {mode !== 'easy' && last && <Paren side="right" color={bracket} />}
          {last && a.truncated && <span className="absolute -right-2 bottom-0 text-[10px] text-slate-500">…</span>}
        </motion.div>,
      );
      col += segLen;
    }
    return (
      <div key={'r' + r} className="grid items-end gap-y-0.5" style={{ gridTemplateColumns: `${ADDR_W}px repeat(${bpr}, ${bw}px)` }}>
        <span className="self-end pb-[3px] font-mono text-[9px] text-slate-500" style={{ gridColumn: '1 / span 1' }}>{hex(base)}</span>
        {parts}
      </div>
    );
  };

  if (view.memTable) {
    return (
      <div {...ramSlot} className="relative w-full md:flex-[3] min-w-0 rounded-xl border-2 border-emerald-500/60 bg-slate-900 p-3 shadow-[0_0_18px_rgba(16,185,129,0.2)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-emerald-300">{title}</span>
          <span className="text-[9px] text-slate-500">1 格 = 1 byte{selected !== null ? ` · 選取 ${hex(selected)}` : ''}</span>
        </div>
        <div ref={gridRef} className="w-full overflow-hidden">
          <MemTable symbols={symbols} allocs={allocs} view={view} width={gridW} pointedAt={pointedAt} selected={selected} pointerProps={pointerProps} />
        </div>
      </div>
    );
  }

  const hotNotes = [...allocs.map((a) => a.cell), ...opaque.map((o) => o.cell)].filter((c) => c.hot && c.note !== undefined);

  return (
    <div {...ramSlot} className="relative w-full md:flex-[3] min-w-0 rounded-xl border-2 border-emerald-500/60 bg-slate-900 p-3 shadow-[0_0_18px_rgba(16,185,129,0.2)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-widest text-emerald-300">{title}</span>
        <span className="text-[9px] text-slate-500">memory unit · {bpr} bytes / row</span>
      </div>

      {symbols.length > 0 && (
        <div className="mb-2 rounded-lg border border-dashed border-cyan-500/50 p-2">
          <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-cyan-400/80">symbol table</div>
          <div className="flex flex-col gap-0.5">
            {symbols.map((c) => {
              const d = encode(c.value);
              return (
                <motion.div
                  key={c.addr}
                  layout
                  {...pointerProps(c)}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0, boxShadow: targetOf(c) !== null && targetOf(c) === selected ? '0 0 0 2px #e879f9' : c.hot ? '0 0 0 2px #fbbf24' : '0 0 0 1px #334155' }}
                  className={`flex items-center gap-2 rounded-md bg-slate-800 px-2 py-0.5 font-mono ${pointerProps(c).className ?? ''}`}
                >
                  <span className="min-w-[3.5rem] text-[11px] font-bold text-cyan-300">{c.label}</span>
                  <span className="text-[12px] font-bold text-violet-300">{c.value}</span>
                  {c.note !== undefined && <span className="ml-auto text-[9px] text-slate-400">{c.note}</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div ref={gridRef} className="flex flex-col gap-1 w-full overflow-hidden">
        {out.map((it, i) => {
          if (it.kind === 'caption') return <div key={'c' + i} className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">{it.text}</div>;
          if (it.kind === 'gap') {
            return (
              <div key={'g' + it.from} className="flex items-center gap-2 font-mono text-[9px] text-slate-600">
                <span className="flex-1 border-t border-dashed border-slate-700" />⋯ {hex(it.from)}–{hex(it.to)} 未使用<span className="flex-1 border-t border-dashed border-slate-700" />
              </div>
            );
          }
          if (it.kind === 'opaque') {
            const c = it.o.cell;
            return (
              <motion.div
                key={'o' + c.addr}
                animate={{ boxShadow: c.hot ? '0 0 0 2px #fbbf24' : '0 0 0 1px #334155' }}
                className="flex items-center gap-2 rounded-md border border-dashed border-slate-600 bg-slate-800/60 px-2 py-1 font-mono"
              >
                <span className="text-[9px] text-slate-500" style={{ width: ADDR_W - 8 }}>{c.addr}</span>
                {c.label !== undefined && <span className="text-[11px] font-bold text-cyan-300">{slotLabel(c.label)}</span>}
                <span className="text-[12px] font-bold italic text-slate-300">{c.value}</span>
                {c.note !== undefined && <span className="ml-auto text-[9px] text-slate-400">{c.note}</span>}
              </motion.div>
            );
          }
          return renderRow(it.r);
        })}
      </div>

      {hotNotes.length > 0 && (
        <div className="mt-2 flex flex-col gap-0.5 border-t border-slate-700/70 pt-1.5">
          {hotNotes.map((c, i) => (
            <div key={i} className="text-[10px] text-amber-200/90">
              <span className="font-mono text-slate-500">{c.addr}</span> {c.note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────────────────────── I/O devices ───────────────────────── */

/* Fixed height across steps (see stepSize.tsx) */
export const Screen = (p: { lines: React.ReactNode[]; active?: boolean; cursor?: boolean }) => {
  const slot = useSlot('screen');
  return <div {...slot} className="grid w-full"><ScreenBody {...p} /></div>;
};
const ScreenBody = ({ lines, active = false, cursor = false }: { lines: React.ReactNode[]; active?: boolean; cursor?: boolean }) => (
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

/* Fixed height across steps (see stepSize.tsx) */
export const Keyboard = (p: { keys: string[]; pressed?: string[] }) => {
  const slot = useSlot('keyboard');
  return <div {...slot} className="grid w-full"><KeyboardBody {...p} /></div>;
};
const KeyboardBody = ({ keys, pressed = [] }: { keys: string[]; pressed?: string[] }) => (
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

/* Fixed height across steps (see stepSize.tsx) */
export const Buffer = (p: { name: string; bytes: React.ReactNode[]; active?: boolean }) => {
  const slot = useSlot('buf:' + p.name);
  return <div {...slot} className="grid w-full"><BufferBody {...p} /></div>;
};
const BufferBody = ({ name, bytes, active = false }: { name: string; bytes: React.ReactNode[]; active?: boolean }) => (
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
