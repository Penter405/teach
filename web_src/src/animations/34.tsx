// Animation 34: L7 List Method — 指標陣列、容量、搬家、insert 位移、pop
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

type Slot = string | null;
// int objects 10 / 20 / 30 / 40 / 5 each live at their own address
const OBJ: Record<string, string> = { '10': '0x5000', '20': '0x5001', '30': '0x5002', '40': '0x5003', '5': '0x5004' };

export default function ListMemoryAnim({ step }: { step: number }) {
  const s = clampStep(step, 7);

  const LEN = [2, 3, 4, 4, 5, 4, 4][s];
  const CAP = [3, 3, 6, 6, 6, 6, 6][s];
  const writes = ['2', '1', '1 (原地擴充)', '4 次位移', '1', '0', '0'][s];

  // The item array stays at 0x4100 the whole time: when it is full, it grows into the
  // free bytes right after it, so nums keeps pointing at the same list object.
  const slots: Slot[] =
    s === 0 ? ['10', '20', null]
    : s === 1 ? ['10', '20', '30']
    : s === 2 ? ['10', '20', '30', '40', null, null]
    : s === 3 ? ['10', '10', '20', '30', '40', null]
    : ['5', '10', '20', '30', '40', null];
  const hotSlots = s === 1 ? [2] : s === 2 ? [3, 4, 5] : s === 3 ? [1, 2, 3, 4] : s === 4 ? [0] : s === 5 ? [4] : [];

  const regs: Reg[] = [
    { name: 'LEN', value: String(LEN), hot: s !== 3 },
    { name: 'CAP', value: String(CAP), hot: s === 2 },
    { name: 'R1', value: s === 1 ? '→30' : s === 2 ? '→40' : s === 3 ? 'shift ×4' : s === 4 ? '→5' : s >= 5 ? '→40' : '—', hot: s >= 1 },
    { name: 'WRITES', value: writes, hot: s >= 1 && s <= 4 },
  ];
  const alu =
    s === 1 ? { op: 'CMP', a: 'len 2', b: 'cap 3', out: '有空位' }
    : s === 2 ? { op: 'CMP', a: 'len 3', b: 'cap 3', out: '滿了 → 往後擴充' }
    : s === 5 ? { op: 'SUB', a: 'len 5', b: '1', out: '4' }
    : null;

  const ints = ['10', '20', ...(s >= 1 ? ['30'] : []), ...(s >= 2 ? ['40'] : []), ...(s >= 4 ? ['5'] : [])];

  const cells: Cell[] = [
    { header: 'names' },
    { addr: '0x0F00', label: 'nums', value: '→ 0x4000', ptr: true, note: 'id(nums) 從頭到尾不變', hot: s === 2 },
    { header: 'list object（mutable：位址不變，改的是裡面）' },
    { addr: '0x4000', label: 'len', value: String(LEN), hot: s !== 3 && s !== 6 },
    { addr: '0x4001', label: 'cap', value: String(CAP), hot: s === 2 },
    { addr: '0x4002', label: 'items', value: '→ 0x4100' },
    { header: s >= 2 ? '指標陣列（容量 3 → 6：後面沒人用，原地往後長）' : '指標陣列（容量 3）' },
    ...slots.map((v, i) => ({
      addr: '0x' + (0x4100 + i * 2).toString(16).toUpperCase(),
      label: `[${i}]`,
      value: v === null ? 'NULL' : '→ ' + OBJ[v],
      hot: hotSlots.includes(i),
      note: i === 4 && s === 5 ? 'pop：len 變 4，這格不用清掉' : undefined,
    } as Cell)),
    { header: 'int objects（清單只存指標）' },
    ...ints.map((v) => ({ addr: OBJ[v], value: v, hot: (s === 1 && v === '30') || (s === 2 && v === '40') || (s === 4 && v === '5') } as Cell)),
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'write 1 slot' }
    : s === 2 ? { active: true, toRam: true, label: 'grow + write 1' }
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
          <Line pc={s === 2} jump={s === 2 ? '滿了：原地擴充容量' : undefined}>nums.append(40)</Line>
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
          <div className="text-[10px] text-slate-400 md:w-1/2">容量數字為示意。list 是 mutable：nums 一直指向同一個 list 物件 (0x4000)。只有當後面的位址已經被別的物件占用時，指標陣列才需要整排搬到新位址（改的是 items，不是 nums）。</div>
          <div className="md:w-1/2"><Screen lines={s >= 6 ? ['40'] : []} active={s === 6} /></div>
        </div>
      </Board>
    </div>
  );
}
