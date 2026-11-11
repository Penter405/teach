// Animation 32: L5 函式 — Call Stack：push frame、PC 跳躍、return register（巢狀呼叫 double(add(1, 2))）
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

const PCS = ['0x10', '0x04', '0x10', '0x0C', '0x04', '0x10', '0x10'];
const SP = ['0x7FE8', '0x7FD0', '0x7FE8', '0x7FD8', '0x7FB8', '0x7FE8', '0x7FE8'];

export default function CallStackAnim({ step }: { step: number }) {
  const s = clampStep(step, 7);
  const pc = PCS[s];

  // main line: result = double(add(1, 2))
  const resS: TokState = s === 6 ? 'active' : 'dim';
  const dblS: TokState = s >= 3 && s <= 5 ? 'active' : 'dim';
  const inner =
    s <= 1 ? <Tok s="active">add(1, 2)</Tok>
    : s <= 4 ? <Tok s="done">3</Tok>
    : null;

  const regs: Reg[] = [
    { name: 'PC', value: pc, hot: true },
    { name: 'SP', value: SP[s], hot: s !== 0 && s !== 6 },
    { name: 'RET', value: s >= 5 ? '6' : s >= 2 ? '3' : '—', hot: s === 2 || s === 5 },
    { name: 'R1', value: s === 2 ? '1 + 2' : s === 5 ? '3 + 3' : '0', hot: s === 2 || s === 5 },
  ];
  const alu = s === 2 ? { op: 'ADD', a: 'a=1', b: 'b=2', out: '3' } : s === 5 ? { op: 'ADD', a: 'a=3', b: 'b=3', out: '6' } : null;

  // Stack frames — popped frames stay in DRAM (stale) until overwritten
  const frameA: Cell[] =
    s === 0 ? []
    : s <= 2 ? [
        { addr: '0x7FE0', label: 'ret', value: '0x10', note: 'frame add #1', hot: s === 1, stale: s === 2 },
        { addr: '0x7FD8', label: 'a', value: '1', hot: s === 1, stale: s === 2 },
        { addr: '0x7FD0', label: 'b', value: '2', hot: s === 1, stale: s === 2 },
      ]
    : [
        { addr: '0x7FE0', label: 'ret', value: '0x10', note: 'frame double', hot: s === 3, stale: s >= 5 },
        { addr: '0x7FD8', label: 'n', value: '3', hot: s === 3, stale: s >= 5 },
        { addr: '0x7FD0', label: 'b', value: '2', note: '舊資料 (沒被覆蓋)', stale: true },
      ];
  const frameB: Cell[] =
    s >= 4 ? [
      { addr: '0x7FC8', label: 'ret', value: '0x0C', note: 'frame add #2', hot: s === 4, stale: s >= 5 },
      { addr: '0x7FC0', label: 'a', value: '3', hot: s === 4, stale: s >= 5 },
      { addr: '0x7FB8', label: 'b', value: '3', hot: s === 4, stale: s >= 5 },
    ] : [];

  const cells: Cell[] = [
    { header: 'code' },
    { addr: '0x00', label: 'add', value: 'def (0x00–0x04)', hot: pc === '0x04' },
    { addr: '0x08', label: 'double', value: 'def (0x08–0x0C)', hot: pc === '0x0C' },
    { addr: '0x10', label: 'main', value: 'result = …', hot: pc === '0x10' },
    { header: 'names' },
    ...(s >= 6 ? [{ addr: '0x0F00', label: 'result', value: '→ 6', ptr: true, hot: true } as Cell] : []),
    { header: 'stack ↓ (由高位址往低位址長)' },
    ...(frameA.length ? frameA : [{ addr: '0x7FE0', value: '(空)', stale: true } as Cell]),
    ...frameB,
  ];

  const bus =
    s === 1 || s === 3 || s === 4 ? { active: true, toRam: true, label: 'push frame' }
    : s === 2 || s === 5 ? { active: true, toRam: false, label: 'pop → ret addr' }
    : s === 6 ? { active: true, toRam: true, label: 'store result' }
    : { active: false };

  const jumpAt = (addr: string) => {
    if (s === 1 && addr === '0x10') return 'call → jump 0x04';
    if (s === 3 && addr === '0x10') return 'call → jump 0x0C';
    if (s === 4 && addr === '0x0C') return 'call → jump 0x04';
    if (s === 2 && addr === '0x04') return 'return → 0x10';
    if (s === 5 && addr === '0x04') return 'return → 0x0C → return → 0x10';
    return undefined;
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          <Line addr="0x00">def add(a, b):</Line>
          <Line addr="0x04" pc={pc === '0x04'} indent={1} jump={jumpAt('0x04')}>
            return <Tok s={s === 2 || s === 5 ? 'active' : 'normal'}>a + b</Tok>
          </Line>
          <Line addr="0x08">def double(n):</Line>
          <Line addr="0x0C" pc={pc === '0x0C'} indent={1} jump={jumpAt('0x0C')}>
            return <Tok s={s === 4 ? 'active' : 'normal'}>add(n, n)</Tok>
          </Line>
          <Line addr="0x10" pc={pc === '0x10'} jump={jumpAt('0x10')}>
            <Tok s={resS}>result =</Tok>{' '}
            {s >= 5 ? (
              <Tok s="done">6</Tok>
            ) : (
              <>
                <Tok s={dblS}>double(</Tok>
                {inner}
                <Tok s={dblS}>)</Tok>
              </>
            )}
          </Line>
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
      </Board>
    </div>
  );
}
