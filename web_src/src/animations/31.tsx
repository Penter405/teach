// Animation 31: L4 迴圈 — PC 往回跳、counter register、continue（巢狀 if 在 for 裡）
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg } from '../animation_kit/HardwareKit';

// step: 0 init | 1 i=1 check | 2 total+=1 | 3 jump back, i=2 | 4 i=2 continue | 5 i=3 total+=3 | 6 exit + print
const PCS = ['0x04', '0x08', '0x10', '0x04', '0x0C', '0x10', '0x18'];
const I = ['1', '1', '1', '2', '2', '3', '4'];
const TOTAL = ['0', '0', '1', '1', '1', '4', '4'];

export default function LoopPCAnim({ step }: { step: number }) {
  const s = clampStep(step, 7);
  const pc = PCS[s];

  const regs: Reg[] = [
    { name: 'PC', value: pc, hot: s === 3 || s === 4 || s === 6 },
    { name: 'CNT', value: I[s], hot: s === 0 || s === 3 || s === 6 },
    { name: 'R2', value: s === 2 ? '0 → 1' : s === 5 ? '1 → 4' : TOTAL[s], hot: s === 2 || s === 5 },
  ];
  const alu =
    s === 1 ? { op: 'CMP', a: 'i=1', b: '2', out: '≠ → False' }
    : s === 2 ? { op: 'ADD', a: '0', b: '1', out: '1' }
    : s === 4 ? { op: 'CMP', a: 'i=2', b: '2', out: '= → True' }
    : s === 5 ? { op: 'ADD', a: '1', b: '3', out: '4' }
    : s === 6 ? { op: 'CMP', a: 'i=4', b: 'stop 4', out: '到頂 → 結束' }
    : null;
  const flags = s === 4 || s === 6 ? { Z: 1, N: 0 } : { Z: 0, N: s === 1 ? 1 : 0 };

  const cells: Cell[] = [
    { header: 'code' },
    { addr: '0x00–0x18', value: '7 條指令', note: `PC → ${pc}`, hot: s === 3 || s === 4 || s === 6 },
    { header: 'names' },
    { addr: '0x40', label: 'total', value: `→ 0x5${TOTAL[s]}`, ptr: true, hot: s === 2 || s === 5, note: s === 2 || s === 5 ? 'total 改指向新的 int 物件' : undefined },
    { addr: '0x42', label: 'i', value: `→ 0x5${s === 6 ? '3' : I[s]}`, ptr: true, hot: s === 0 || s === 3 },
    { header: 'range(1, 4) 物件：只存 3 個數' },
    { addr: '0x48', label: 'start', value: '1', hot: s === 0, note: s === 0 ? '不會先做出 [1, 2, 3]' : undefined },
    { addr: '0x49', label: 'stop', value: '4', hot: s === 6 },
    { addr: '0x4A', label: 'step', value: '1', hot: s === 0 },
    { header: 'int 物件 0~4（小整數 Python 事先建好，大家共用）' },
    ...['0', '1', '2', '3', '4'].map((v) => ({ addr: '0x5' + v, value: v } as Cell)),
  ];

  const bus =
    s === 2 || s === 5 ? { active: true, toRam: true, label: 'load → add → store' }
    : s === 3 || s === 4 ? { active: true, toRam: false, label: 'fetch 0x04 (往回)' }
    : s === 6 ? { active: true, toRam: false, label: 'fetch 0x18' }
    : s === 0 ? { active: true, toRam: false, label: 'read range' }
    : { active: false };

  const jumpAt = (addr: string) => {
    if (s === 3 && addr === '0x14') return '↩ jump 0x04';
    if (s === 4 && addr === '0x0C') return '↩ continue: jump 0x04';
    if (s === 1 && addr === '0x08') return 'False → 跳過 continue';
    if (s === 6 && addr === '0x04') return '迴圈結束 → jump 0x18';
    return undefined;
  };
  const L = (addr: string, indent: number, body: React.ReactNode, dim = false) => (
    <Line addr={addr} pc={pc === addr || (s === 3 && addr === '0x14')} indent={indent} dim={dim} jump={jumpAt(addr)}>{body}</Line>
  );

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          {L('0x00', 0, <>total = 0</>)}
          {L('0x04', 0, <>for <Tok s={s === 0 || s === 3 ? 'active' : 'normal'}>i</Tok> in range(1, 4):</>)}
          {L('0x08', 1, <>if <Tok s={s === 1 || s === 4 ? 'active' : 'normal'}>i == 2</Tok>:</>)}
          {L('0x0C', 2, <>continue</>, s === 1 || s === 2)}
          {L('0x10', 1, <Tok s={s === 2 || s === 5 ? 'active' : 'normal'}>total += i</Tok>, s === 4)}
          {L('0x14', 0, <span className="text-slate-500"># 迴圈底：回到 0x04</span>)}
          {L('0x18', 0, <Tok s={s === 6 ? 'done' : 'normal'}>print(total)</Tok>, s < 6)}
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} flags={flags} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={s >= 6 ? ['4'] : []} active={s === 6} />
      </Board>
    </div>
  );
}
