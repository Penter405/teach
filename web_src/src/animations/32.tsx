// Animation 32: L5 函式 — Call Stack：push frame、PC 跳躍、return register（巢狀呼叫 double(add(1, 2))）
// One step = one action; PC = the NEXT instruction.
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

// 0 start | 1 def add | 2 def double | 3 call add(1, 2) | 4 a + b | 5 return 3
// 6 call double(3) | 7 call add(n, n) | 8 a + b | 9 add return 6 | 10 double return 6 | 11 result =
const PCS = ['0x00', '0x08', '0x10', '0x04', '0x04', '0x10', '0x0C', '0x04', '0x04', '0x0C', '0x10', '0x14'];
const SP = ['0x80', '0x80', '0x80', '0x7A', '0x7A', '0x80', '0x7C', '0x74', '0x74', '0x7C', '0x80', '0x80'];
const NOW = ['', '執行 def add：名稱 add 指向函式', '執行 def double：名稱 double 指向函式', '呼叫 add(1, 2)', '計算 a + b', 'add return 3', '呼叫 double(3)', '呼叫 add(n, n)', '計算 a + b', 'add return 6', 'double return 6', '執行 result = 6'];

export default function CallStackAnim({ step }: { step: number }) {
  const s = clampStep(step, 12);
  const pc = PCS[s];
  const d = (k: number): TokState => (s === k ? 'done' : 'normal');

  const regs: Reg[] = [
    { name: 'PC', value: pc, hot: s > 0 && PCS[s] !== PCS[s - 1] },
    { name: 'SP', value: SP[s], hot: s > 0 && SP[s] !== SP[s - 1] },
    { name: 'RET', value: s >= 9 ? '6' : s >= 5 ? '3' : '—', hot: s === 5 || s === 9 || s === 10 },
    { name: 'R1', value: s === 4 ? '3' : s === 8 ? '6' : '0', hot: s === 4 || s === 8 },
  ];
  const alu = s === 4 ? { op: 'ADD', a: 'a=1', b: 'b=2', out: '3' } : s === 8 ? { op: 'ADD', a: 'a=3', b: 'b=3', out: '6' } : null;

  // Stack frames — popped frames stay in DRAM (stale) until overwritten
  const frameA: Cell[] =
    s < 3 ? []
    : s <= 5 ? [
        { addr: '0x7E', label: 'ret', value: '0x10', note: 'frame add #1', hot: s === 3, stale: s === 5 },
        { addr: '0x7C', label: 'a', value: '→ 0x49', hot: s === 3, stale: s === 5 },
        { addr: '0x7A', label: 'b', value: '→ 0x4A', hot: s === 3, stale: s === 5 },
      ]
    : [
        { addr: '0x7E', label: 'ret', value: '0x10', note: 'frame double', hot: s === 6, stale: s >= 10 },
        { addr: '0x7C', label: 'n', value: '→ 0x4B', hot: s === 6, stale: s >= 10 },
        { addr: '0x7A', label: 'b', value: '→ 0x4A', note: '舊資料 (沒被覆蓋)', stale: true },
      ];
  const frameB: Cell[] =
    s >= 7 ? [
      { addr: '0x78', label: 'ret', value: '0x0C', note: 'frame add #2', hot: s === 7, stale: s >= 9 },
      { addr: '0x76', label: 'a', value: '→ 0x4B', hot: s === 7, stale: s >= 9 },
      { addr: '0x74', label: 'b', value: '→ 0x4B', hot: s === 7, stale: s >= 9 },
    ] : [];

  const cells: Cell[] = [
    { header: 'code' },
    { addr: '0x00', label: 'add', value: 'def (0x00–0x04)', hot: s === 1 || pc === '0x04' },
    { addr: '0x08', label: 'double', value: 'def (0x08–0x0C)', hot: s === 2 || pc === '0x0C' },
    { addr: '0x10', label: 'main', value: 'result = …', hot: pc === '0x10' },
    { header: 'names' },
    ...(s >= 1 ? [{ addr: '0x40', label: 'add', value: '→ code 0x00', ptr: true, hot: s === 1 } as Cell] : []),
    ...(s >= 2 ? [{ addr: '0x42', label: 'double', value: '→ code 0x08', ptr: true, hot: s === 2 } as Cell] : []),
    ...(s >= 11 ? [{ addr: '0x44', label: 'result', value: '→ 0x4E', ptr: true, hot: true } as Cell] : []),
    { header: 'int 物件（小整數事先建好、共用；區域變數也只存位址）' },
    ...['1', '2', '3', '6'].map((v) => ({ addr: '0x4' + (8 + Number(v)).toString(16).toUpperCase(), value: v, hot: (s === 4 && v === '3') || (s === 8 && v === '6') } as Cell)),
    { header: 'stack ↓ (由高位址往低位址長)' },
    ...(frameA.length ? frameA : [{ addr: '0x7E', value: '(空)', stale: true } as Cell]),
    ...frameB,
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'store add' }
    : s === 2 ? { active: true, toRam: true, label: 'store double' }
    : s === 3 || s === 6 || s === 7 ? { active: true, toRam: true, label: 'push frame' }
    : s === 4 || s === 8 ? { active: true, toRam: false, label: 'load a, b' }
    : s === 5 || s === 9 || s === 10 ? { active: true, toRam: false, label: 'pop → ret addr' }
    : s === 11 ? { active: true, toRam: true, label: 'store result' }
    : { active: false };

  const jumpAt = (addr: string) => {
    if (s === 3 && addr === '0x10') return 'call → jump 0x04';
    if (s === 6 && addr === '0x10') return 'call → jump 0x0C';
    if (s === 7 && addr === '0x0C') return 'call → jump 0x04';
    if (s === 5 && addr === '0x04') return 'return → 0x10';
    if (s === 9 && addr === '0x04') return 'return → 0x0C';
    if (s === 10 && addr === '0x0C') return 'return → 0x10';
    return undefined;
  };

  // main line: result = double(add(1, 2))
  const main =
    s <= 4 ? (<><Tok>double(</Tok><Tok s={s === 3 ? 'active' : 'normal'}>add(1, 2)</Tok><Tok>)</Tok></>)
    : s <= 9 ? (<><Tok s={s === 6 ? 'active' : 'normal'}>double(</Tok><Tok s={d(5)}>3</Tok><Tok s={s === 6 ? 'active' : 'normal'}>)</Tok></>)
    : <Tok s={d(10)}>6</Tok>;

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[s] || '還沒開始執行'}>
        <CodePanel>
          <Line addr="0x00" pc={pc === '0x00'}><Tok s={d(1)}>def add(a, b):</Tok></Line>
          <Line addr="0x04" pc={pc === '0x04'} indent={1} jump={jumpAt('0x04')}>
            <Tok s={s === 5 || s === 9 ? 'active' : 'normal'}>return</Tok>{' '}
            {s === 4 || s === 5 ? <Tok s={d(4)}>3</Tok> : s === 8 || s === 9 ? <Tok s={d(8)}>6</Tok> : <Tok>a + b</Tok>}
          </Line>
          <Line addr="0x08" pc={pc === '0x08'}><Tok s={d(2)}>def double(n):</Tok></Line>
          <Line addr="0x0C" pc={pc === '0x0C'} indent={1} jump={jumpAt('0x0C')}>
            <Tok s={s === 10 ? 'active' : 'normal'}>return</Tok>{' '}
            {s === 9 || s === 10 ? <Tok s={d(9)}>6</Tok> : <Tok s={s === 7 ? 'active' : 'normal'}>add(n, n)</Tok>}
          </Line>
          <Line addr="0x10" pc={pc === '0x10'} jump={jumpAt('0x10')}>
            <Tok s={d(11)}>result =</Tok> {main}
          </Line>
          <Line addr="0x14" pc={pc === '0x14'}><span className="text-slate-500"># 程式結束</span></Line>
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
