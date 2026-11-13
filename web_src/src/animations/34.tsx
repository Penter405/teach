// Animation 34: L7 List Method — 指標陣列、容量、搬家、insert 位移、pop
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

type Slot = string | null;
// int objects 10 / 20 / 30 / 40 / 5 each live at their own address
const OBJ: Record<string, string> = { '10': '0x60', '20': '0x61', '30': '0x62', '40': '0x63', '5': '0x64' };

// 0 start | 1 [10, 20] | 2 nums = | 3 append(30) | 4 append(40) | 5 insert(0, 5) | 6 nums.pop() | 7 print
const NOW = ['', '建立 list [10, 20]', '執行 nums = [10, 20]', '執行 nums.append(30)', '執行 nums.append(40)', '執行 nums.insert(0, 5)', '執行 nums.pop()', '執行 print(40)'];

export default function ListMemoryAnim({ step }: { step: number }) {
  const s = clampStep(step, 8);
  const d = (k: number): TokState => (s === k ? 'done' : 'normal');
  const hasList = s >= 1;

  const LEN = [0, 2, 2, 3, 4, 5, 4, 4][s];
  const CAP = [0, 3, 3, 3, 6, 6, 6, 6][s];
  const writes = ['—', '2', '0', '1', '1 (原地擴充)', '4 次位移 + 1', '0', '0'][s];

  // The item array stays at 0x50 the whole time: when it is full, it grows into the
  // free bytes right after it, so nums keeps pointing at the same list object.
  const slots: Slot[] =
    s === 0 ? []
    : s <= 2 ? ['10', '20', null]
    : s === 3 ? ['10', '20', '30']
    : s === 4 ? ['10', '20', '30', '40', null, null]
    : ['5', '10', '20', '30', '40', null];
  const hotSlots = s === 1 ? [0, 1] : s === 3 ? [2] : s === 4 ? [3, 4, 5] : s === 5 ? [0, 1, 2, 3, 4] : s === 6 ? [4] : [];

  const regs: Reg[] = [
    { name: 'LEN', value: hasList ? String(LEN) : '—', hot: s === 1 || (s >= 3 && s <= 6) },
    { name: 'CAP', value: hasList ? String(CAP) : '—', hot: s === 1 || s === 4 },
    { name: 'R1', value: s === 3 ? '→30' : s === 4 ? '→40' : s === 5 ? 'shift ×4, →5' : s >= 6 ? '→40' : '—', hot: s >= 3 },
    { name: 'WRITES', value: writes, hot: s === 1 || (s >= 3 && s <= 5) },
  ];
  const alu =
    s === 3 ? { op: 'CMP', a: 'len 2', b: 'cap 3', out: '有空位' }
    : s === 4 ? { op: 'CMP', a: 'len 3', b: 'cap 3', out: '滿了 → 往後擴充' }
    : s === 6 ? { op: 'SUB', a: 'len 5', b: '1', out: '4' }
    : null;

  const ints = ['10', '20', ...(s >= 3 ? ['30'] : []), ...(s >= 4 ? ['40'] : []), ...(s >= 5 ? ['5'] : [])];

  const cells: Cell[] = [
    { header: 'names' },
    ...(s >= 2 ? [{ addr: '0x40', label: 'nums', value: '→ 0x48', ptr: true, note: 'id(nums) 從頭到尾不變', hot: s === 2 || s === 4 } as Cell] : []),
    ...(hasList ? [
      { header: 'list object（mutable：位址不變，改的是裡面）' } as Cell,
      { addr: '0x48', label: 'len', value: String(LEN), hot: s === 1 || (s >= 3 && s <= 6) } as Cell,
      { addr: '0x49', label: 'cap', value: String(CAP), hot: s === 1 || s === 4 } as Cell,
      { addr: '0x4A', label: 'items', value: '→ 0x50' } as Cell,
      { header: s >= 4 ? '指標陣列（容量 3 → 6：後面沒人用，原地往後長）' : '指標陣列（容量 3）' } as Cell,
    ] : []),
    ...slots.map((v, i) => ({
      addr: '0x' + (0x50 + i * 2).toString(16).toUpperCase(),
      label: `[${i}]`,
      value: v === null ? 'NULL' : '→ ' + OBJ[v],
      hot: hotSlots.includes(i),
      note: i === 4 && s === 6 ? 'pop：len 變 4，這格不用清掉' : i === 0 && s === 5 ? '每格先往右挪，再寫入第 0 格' : undefined,
    } as Cell)),
    { header: 'int objects（清單只存指標）' },
    ...ints.map((v) => ({ addr: OBJ[v], value: v, hot: (s === 3 && v === '30') || (s === 4 && v === '40') || (s === 5 && v === '5') || (s >= 6 && v === '40') } as Cell)),
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'build list' }
    : s === 2 ? { active: true, toRam: true, label: 'store nums' }
    : s === 3 ? { active: true, toRam: true, label: 'write 1 slot' }
    : s === 4 ? { active: true, toRam: true, label: 'grow + write 1' }
    : s === 5 ? { active: true, toRam: true, label: 'shift 4 slots + write slot 0' }
    : s === 6 ? { active: true, toRam: false, label: 'read slot 4' }
    : { active: false };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[s] || '還沒開始執行'}>
        <CodePanel>
          <Line pc={s <= 1}><Tok s={d(2)}>nums =</Tok> <Tok s={d(1)}>[10, 20]</Tok></Line>
          <Line pc={s === 2} jump={s === 3 ? '快：1 次寫入' : undefined}><Tok s={s === 3 ? 'active' : 'normal'}>nums.append(30)</Tok></Line>
          <Line pc={s === 3} jump={s === 4 ? '滿了：原地擴充容量' : undefined}><Tok s={s === 4 ? 'active' : 'normal'}>nums.append(40)</Tok></Line>
          <Line pc={s === 4} jump={s === 5 ? '慢：每格往右挪' : undefined}><Tok s={s === 5 ? 'active' : 'normal'}>nums.insert(0, 5)</Tok></Line>
          <Line pc={s >= 5} dim={s < 5}>
            <Tok s={d(7)}>print(</Tok>
            {s >= 6 ? <Tok s={d(6)}>40</Tok> : <Tok>nums.pop()</Tok>}
            <Tok s={d(7)}>)</Tok>
          </Line>
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="text-[10px] text-slate-400 md:w-1/2">容量數字為示意。list 是 mutable：nums 一直指向同一個 list 物件 (0x48)。只有當後面的位址已經被別的物件占用時，指標陣列才需要整排搬到新位址（改的是 items，不是 nums）。</div>
          <div className="md:w-1/2"><Screen lines={s >= 7 ? ['40'] : []} active={s === 7} /></div>
        </div>
      </Board>
    </div>
  );
}
