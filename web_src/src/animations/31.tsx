// Animation 31: L4 迴圈 — PC 往回跳、counter register、continue（巢狀 if 在 for 裡）
// One step = one action; PC = the NEXT instruction.
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

type Kind = 'start' | 'init' | 'range' | 'next' | 'cmp' | 'if' | 'add' | 'store' | 'back' | 'continue' | 'exit' | 'print';
type Row = { k: Kind; pc: string; i?: number; total: number; cmp?: boolean; sum?: number; now: string };

const ROWS: Row[] = [
  { k: 'start', pc: '0x00', total: -1, now: '' },
  { k: 'init', pc: '0x04', total: 0, now: '執行 total = 0' },
  { k: 'range', pc: '0x04', total: 0, now: '執行 range(1, 4)：做出 range 物件' },
  { k: 'next', pc: '0x08', i: 1, total: 0, now: 'for：i = 1' },
  { k: 'cmp', pc: '0x08', i: 1, total: 0, cmp: false, now: '計算 i == 2' },
  { k: 'if', pc: '0x10', i: 1, total: 0, cmp: false, now: 'if False：跳過 continue' },
  { k: 'add', pc: '0x10', i: 1, total: 0, sum: 1, now: '計算 total + i' },
  { k: 'store', pc: '0x14', i: 1, total: 1, now: '執行 total = 1' },
  { k: 'back', pc: '0x04', i: 1, total: 1, now: '迴圈底：跳回 for' },
  { k: 'next', pc: '0x08', i: 2, total: 1, now: 'for：i = 2' },
  { k: 'cmp', pc: '0x08', i: 2, total: 1, cmp: true, now: '計算 i == 2' },
  { k: 'if', pc: '0x0C', i: 2, total: 1, cmp: true, now: 'if True：進入 continue' },
  { k: 'continue', pc: '0x04', i: 2, total: 1, now: '執行 continue：跳回 for' },
  { k: 'next', pc: '0x08', i: 3, total: 1, now: 'for：i = 3' },
  { k: 'cmp', pc: '0x08', i: 3, total: 1, cmp: false, now: '計算 i == 2' },
  { k: 'if', pc: '0x10', i: 3, total: 1, cmp: false, now: 'if False：跳過 continue' },
  { k: 'add', pc: '0x10', i: 3, total: 1, sum: 4, now: '計算 total + i' },
  { k: 'store', pc: '0x14', i: 3, total: 4, now: '執行 total = 4' },
  { k: 'back', pc: '0x04', i: 3, total: 4, now: '迴圈底：跳回 for' },
  { k: 'exit', pc: '0x18', i: 3, total: 4, now: 'for：range 用完 → 離開迴圈' },
  { k: 'print', pc: '0x18', i: 3, total: 4, now: '執行 print(total)' },
];

export default function LoopPCAnim({ step }: { step: number }) {
  const s = clampStep(step, ROWS.length);
  const r = ROWS[s];
  const prev = ROWS[Math.max(0, s - 1)];
  const pc = r.pc;
  const pcMoved = s > 0 && r.pc !== prev.pc;

  const regs: Reg[] = [
    { name: 'PC', value: pc, hot: pcMoved },
    { name: 'CNT', value: r.i !== undefined ? String(r.i) : '—', hot: r.k === 'next' || r.k === 'exit' },
    { name: 'R2', value: r.k === 'add' ? String(r.sum) : r.total >= 0 ? String(r.total) : '0', hot: r.k === 'add' || r.k === 'store' },
  ];
  const alu =
    r.k === 'cmp' ? { op: 'CMP', a: `i=${r.i}`, b: '2', out: r.cmp ? '= → True' : '≠ → False' }
    : r.k === 'add' ? { op: 'ADD', a: String(r.total), b: String(r.i), out: String(r.sum) }
    : r.k === 'exit' ? { op: 'CMP', a: 'next 4', b: 'stop 4', out: '到頂 → 結束' }
    : null;
  const flags = r.k === 'exit' || (r.k === 'cmp' && r.cmp) ? { Z: 1, N: 0 } : { Z: 0, N: r.k === 'cmp' ? 1 : 0 };

  const intHot = (v: number) => (r.k === 'add' && v === r.sum) || (r.k === 'next' && v === r.i) || (r.k === 'init' && v === 0);
  const cells: Cell[] = [
    { header: 'code' },
    { addr: '0x00–0x18', value: '7 條指令', note: `PC → ${pc}`, hot: pcMoved },
    { header: 'names' },
    ...(r.total >= 0 ? [{ addr: '0x40', label: 'total', value: `→ 0x5${r.total}`, ptr: true, hot: r.k === 'init' || r.k === 'store', note: r.k === 'store' ? 'total 改指向另一個 int 物件（不是改掉舊的）' : undefined } as Cell] : []),
    ...(r.i !== undefined ? [{ addr: '0x42', label: 'i', value: `→ 0x5${r.i}`, ptr: true, hot: r.k === 'next' } as Cell] : []),
    ...(s >= 2 ? [
      { header: 'range(1, 4) 物件：只存 3 個數' } as Cell,
      { addr: '0x48', label: 'start', value: '1', hot: r.k === 'range', note: r.k === 'range' ? '不會先做出 [1, 2, 3]' : undefined } as Cell,
      { addr: '0x49', label: 'stop', value: '4', hot: r.k === 'range' || r.k === 'exit' } as Cell,
      { addr: '0x4A', label: 'step', value: '1', hot: r.k === 'range' } as Cell,
    ] : []),
    { header: 'int 物件 0~4（小整數 Python 事先建好，大家共用）' },
    ...[0, 1, 2, 3, 4].map((v) => ({ addr: '0x5' + v, value: String(v), hot: intHot(v) } as Cell)),
  ];

  const bus =
    r.k === 'init' ? { active: true, toRam: true, label: 'store total' }
    : r.k === 'range' ? { active: true, toRam: true, label: 'build range' }
    : r.k === 'next' ? { active: true, toRam: true, label: 'read range → store i' }
    : r.k === 'cmp' ? { active: true, toRam: false, label: 'load i, 2' }
    : r.k === 'add' ? { active: true, toRam: false, label: 'load total, i' }
    : r.k === 'store' ? { active: true, toRam: true, label: 'store total' }
    : r.k === 'print' ? { active: true, toRam: false, label: 'load total' }
    : pcMoved ? { active: true, toRam: false, label: `fetch ${pc}` }
    : { active: false };

  const jumpAt = (addr: string) => {
    if (r.k === 'if' && addr === '0x08') return r.cmp ? 'True → 進入' : 'False → 跳過 continue';
    if (r.k === 'back' && addr === '0x14') return '↩ jump 0x04';
    if (r.k === 'continue' && addr === '0x0C') return '↩ continue: jump 0x04';
    if (r.k === 'exit' && addr === '0x04') return '沒有下一個 → jump 0x18';
    return undefined;
  };
  const L = (addr: string, indent: number, body: React.ReactNode, dim = false) => (
    <Line addr={addr} pc={pc === addr} indent={indent} dim={dim} jump={jumpAt(addr)}>{body}</Line>
  );

  const condTok: TokState = r.k === 'cmp' ? 'done' : r.k === 'if' ? 'active' : 'normal';
  const condText = r.k === 'cmp' || r.k === 'if' ? (r.cmp ? 'True' : 'False') : 'i == 2';

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={r.now || '還沒開始執行'}>
        <CodePanel>
          {L('0x00', 0, <><Tok s={r.k === 'init' ? 'done' : 'normal'}>total =</Tok> 0</>)}
          {L('0x04', 0, <>for <Tok s={r.k === 'next' ? 'done' : r.k === 'exit' ? 'active' : 'normal'}>i</Tok> in <Tok s={r.k === 'range' ? 'done' : 'normal'}>range(1, 4)</Tok>:</>)}
          {L('0x08', 1, <>if <Tok s={condTok}>{condText}</Tok>:</>)}
          {L('0x0C', 2, <Tok s={r.k === 'continue' ? 'active' : 'normal'}>continue</Tok>)}
          {/* total += i  ≡  total = total + i：先算加法，再改 total 指向 */}
          {L('0x10', 1, r.k === 'add'
            ? <><Tok>total =</Tok> <Tok s="done">{String(r.sum)}</Tok></>
            : r.k === 'store'
              ? <><Tok s="done">total =</Tok> <Tok>{String(r.total)}</Tok></>
              : <Tok>total += i</Tok>)}
          {L('0x14', 0, <Tok s={r.k === 'back' ? 'active' : 'normal'}><span className="text-slate-500"># 迴圈底：回到 0x04</span></Tok>)}
          {L('0x18', 0, <Tok s={r.k === 'print' ? 'done' : 'normal'}>print(total)</Tok>, s < 19)}
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} flags={flags} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={r.k === 'print' ? ['4'] : []} active={r.k === 'print'} />
      </Board>
    </div>
  );
}
