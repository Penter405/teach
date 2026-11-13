// Animation 36: L9 Set — 只有 key 的 hash table、重複被擋下、交集查表、bitmask 類比
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, Gate, clampStep, type Cell, type Reg } from '../animation_kit/HardwareKit';

// One set = 8 slots × 2 bytes; each slot holds the ADDRESS of an int object.
// An int's hash is itself, so n lives in slot n % 8.
const setCells = (base: number, label: string, items: number[], hot: number[] = [], miss: number[] = []): Cell[] =>
  Array.from({ length: 8 }, (_, i) => i)
    .filter((i) => items.includes(i) || miss.includes(i))
    .map((i) => ({
      addr: '0x' + (base + i * 2).toString(16).toUpperCase(),
      label: i === Math.min(...items) ? `${label}[${i}]` : `[${i}]`,
      value: items.includes(i) ? `→ 0x4${(8 + i).toString(16).toUpperCase()}` : 'NULL',
      hot: hot.includes(i),
      warn: miss.includes(i),
      note: miss.includes(i) ? `slot ${i} 是空的 → ${i} 不在 a 裡` : undefined,
    } as Cell));

export default function SetHashAnim({ step }: { step: number }) {
  const s = clampStep(step, 6);

  const regs: Reg[] = [
    { name: 'HASH', value: s === 1 ? '2' : s === 3 ? '2 · 3 · 4' : '—', hot: s === 1 || s === 3 },
    { name: 'IDX', value: s === 1 ? '2 % 8 = 2' : s === 3 ? '2 · 3 · 4' : '—', hot: s === 1 || s === 3 },
    { name: 'R1', value: s === 1 ? '已存在 → 不寫' : s === 3 ? '✓ ✓ ✗' : s === 4 ? '0b00001100' : s === 5 ? '2' : '—', hot: s >= 1 },
    { name: 'WRITES', value: s === 1 ? '0' : s >= 3 ? '2' : '—', hot: s === 1 },
  ];
  const alu =
    s === 1 ? { op: 'CMP', a: 'slot2', b: '2', out: '相同 → 拒絕' }
    : s === 3 ? { op: 'LOOKUP', a: 'b 的每個元素', b: 'a', out: '{2, 3}' }
    : s === 4 ? { op: 'AND', a: '00001110', b: '00011100', out: '00001100' }
    : s === 5 ? { op: 'LEN', a: '{2, 3}', out: '2' }
    : null;

  const cells: Cell[] = [
    { header: 'names' },
    { addr: '0x40', label: 'a', value: '→ 0x50', ptr: true },
    { header: 'set a（8 格 × 2 bytes，每格存 int 物件的位址；int 的 hash 就是自己，% 8 決定格子）' },
    ...setCells(0x50, 'a', [1, 2, 3], s === 1 ? [2] : s === 3 ? [2, 3] : [], s === 3 ? [4] : []),
    ...(s >= 2 ? [{ header: '{2, 3, 4}（暫時的 set）' } as Cell, ...setCells(0x60, 'b', [2, 3, 4], s === 3 ? [2, 3, 4] : [])] : []),
    ...(s >= 3 ? [{ header: 'a & b（新的 set）' } as Cell, ...setCells(0x70, 'a&b', [2, 3], s >= 3 ? [2, 3] : [])] : []),
    { header: 'int 物件 1~4（小整數事先建好、共用）' },
    ...[1, 2, 3, 4].map((n) => ({ addr: '0x4' + (8 + n).toString(16).toUpperCase(), value: String(n) } as Cell)),
  ];

  const bus =
    s === 1 ? { active: true, toRam: false, label: 'read slot 2' }
    : s === 2 ? { active: true, toRam: true, label: 'build b' }
    : s === 3 ? { active: true, toRam: true, label: 'lookup → new set' }
    : s === 5 ? { active: true, toRam: false, label: 'read len' }
    : { active: false };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          <Line pc={s === 0}>a = {'{'}1, 2, 3{'}'}</Line>
          <Line pc={s === 1} jump={s === 1 ? '重複：什麼都沒寫入' : undefined}>a.add(2)</Line>
          <Line pc={s >= 2} dim={s < 2}>
            <Tok s={s === 5 ? 'active' : s >= 2 ? 'dim' : 'normal'}>print(len(</Tok>
            {s <= 3 ? <Tok s={s >= 2 ? 'active' : 'normal'}>a &amp; {'{'}2, 3, 4{'}'}</Tok> : <Tok s="done">{'{'}2, 3{'}'}</Tok>}
            <Tok s={s === 5 ? 'active' : s >= 2 ? 'dim' : 'normal'}>))</Tok>
          </Line>
        </CodePanel>

        {s === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-pink-400/60 p-2">
            <div className="text-[10px] font-bold text-pink-200">類比：把集合想成 8 條電線（第 n 條有電 = n 在集合裡）</div>
            <Gate kind="AND" a="a 00001110" b="b 00011100" out="00001100" label="AND 閘：兩邊都有電才通過 → {2, 3}" />
            <div className="text-[9px] text-slate-400">（CPython 實際是用上一步的查表來做交集，這裡只是硬體類比）</div>
          </motion.div>
        )}

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={s >= 5 ? ['2'] : []} active={s === 5} />
      </Board>
    </div>
  );
}
