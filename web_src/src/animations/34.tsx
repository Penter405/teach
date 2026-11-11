// Animation 34: L7 List Method — 指標陣列、容量、搬家、insert 位移、pop
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

type Slot = string | null;
const Slots = ({ slots, len, hot = [], moving = [] }: { slots: Slot[]; len: number; hot?: number[]; moving?: number[] }) => (
  <div className="flex gap-0.5 flex-wrap">
    {slots.map((v, i) => (
      <motion.div
        key={i}
        animate={{
          backgroundColor: hot.includes(i) ? '#b45309' : moving.includes(i) ? '#7c3aed' : '#1e293b',
        }}
        className={`flex flex-col items-center rounded px-1 py-0.5 min-w-[34px] border ${i < len ? 'border-slate-500' : 'border-dashed border-slate-600'}`}
      >
        <span className="text-[8px] text-slate-400">[{i}]</span>
        <span className={`text-xs font-bold ${v === null ? 'text-slate-600' : i < len ? 'text-violet-200' : 'text-slate-500'}`}>{v === null ? '·' : '→' + v}</span>
      </motion.div>
    ))}
  </div>
);

export default function ListMemoryAnim({ step }: { step: number }) {
  const s = clampStep(step, 7);

  const LEN = [2, 3, 4, 4, 5, 4, 4][s];
  const CAP = [3, 3, 6, 6, 6, 6, 6][s];
  const writes = ['2', '1', '3 搬 + 1', '4 次位移', '1', '0', '0'][s];

  const oldBlock: Slot[] = s === 0 ? ['10', '20', null] : ['10', '20', '30'];
  const newBlock: Slot[] =
    s === 2 ? ['10', '20', '30', '40', null, null]
    : s === 3 ? ['10', '10', '20', '30', '40', null]
    : ['5', '10', '20', '30', '40', null];

  const regs: Reg[] = [
    { name: 'LEN', value: String(LEN), hot: s !== 3 },
    { name: 'CAP', value: String(CAP), hot: s === 2 },
    { name: 'R1', value: s === 1 ? '→30' : s === 2 ? '→40' : s === 3 ? 'shift ×4' : s === 4 ? '→5' : s >= 5 ? '→40' : '—', hot: s >= 1 },
    { name: 'WRITES', value: writes, hot: s >= 1 && s <= 4 },
  ];
  const alu =
    s === 1 ? { op: 'CMP', a: 'len 2', b: 'cap 3', out: '有空位' }
    : s === 2 ? { op: 'CMP', a: 'len 3', b: 'cap 3', out: '滿了 → 搬家' }
    : s === 5 ? { op: 'SUB', a: 'len 5', b: '1', out: '4' }
    : null;

  const cells: Cell[] = [
    { header: 'names' },
    { addr: '0x0F00', label: 'nums', value: '→ 0x4000', ptr: true },
    { header: 'list object' },
    { addr: '0x4000', value: `len=${LEN}  cap=${CAP}`, note: `items → ${s >= 2 ? '0x4200' : '0x4100'}`, hot: true },
    { header: s >= 2 ? '指標陣列（舊區塊已釋放，資料還在）' : '指標陣列' },
    { addr: '0x4100', value: <Slots slots={oldBlock} len={s >= 2 ? 0 : LEN} hot={s === 1 ? [2] : []} moving={s === 2 ? [0, 1, 2] : []} />, stale: s >= 2 },
    ...(s >= 2 ? [{ addr: '0x4200', value: <Slots slots={newBlock} len={LEN} hot={s === 2 ? [3] : s === 4 ? [0] : s >= 5 ? [4] : []} moving={s === 2 ? [0, 1, 2] : s === 3 ? [1, 2, 3, 4] : []} />, hot: true } as Cell] : []),
    { header: 'int objects (清單只存指標)' },
    { addr: '0x5000', value: '10 · 20 · 30 · 40 · 5', note: '各自住在別處' },
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'write 1 slot' }
    : s === 2 ? { active: true, toRam: true, label: 'copy 3 + write 1' }
    : s === 3 ? { active: true, toRam: true, label: 'shift 4 slots' }
    : s === 4 ? { active: true, toRam: true, label: 'write slot 0' }
    : s === 5 ? { active: true, toRam: false, label: 'read slot 4' }
    : { active: false };

  const printS: TokState = s === 6 ? 'active' : 'dim';

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          <Line pc={s === 0}>nums = [10, 20]</Line>
          <Line pc={s === 1} jump={s === 1 ? '快：1 次寫入' : undefined}>nums.append(30)</Line>
          <Line pc={s === 2} jump={s === 2 ? '滿了：整排搬家' : undefined}>nums.append(40)</Line>
          <Line pc={s === 3 || s === 4} jump={s === 3 ? '慢：每格往右挪' : undefined}>nums.insert(0, 5)</Line>
          <Line pc={s >= 5} dim={s < 5}>
            <Tok s={s >= 5 ? printS : 'normal'}>print(</Tok>
            {s === 5 ? <Tok s="active">nums.pop()</Tok> : s === 6 ? <Tok s="done">40</Tok> : <Tok>nums.pop()</Tok>}
            <Tok s={s >= 5 ? printS : 'normal'}>)</Tok>
          </Line>
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="text-[10px] text-slate-400 md:w-1/2">容量數字為示意；CPython 會多留空位，讓 append 大多數時候只要寫 1 格。</div>
          <div className="md:w-1/2"><Screen lines={s >= 6 ? ['40'] : []} active={s === 6} /></div>
        </div>
      </Board>
    </div>
  );
}
