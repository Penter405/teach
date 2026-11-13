// Animation 36: L9 Set — 只有 key 的 hash table、重複被擋下、交集查表、bitmask 類比
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, Gate, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

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

// 0 start | 1 {1, 2, 3} | 2 a = | 3 a.add(2) | 4 {2, 3, 4} | 5 a & {…} | 6 len() | 7 print
const NOW = ['', '建立 set {1, 2, 3}', '執行 a = {1, 2, 3}', '執行 a.add(2)', '建立 set {2, 3, 4}', '計算 a & {2, 3, 4}', '執行 len({2, 3})', '執行 print(2)'];

export default function SetHashAnim({ step }: { step: number }) {
  const s = clampStep(step, 8);
  const d = (k: number): TokState => (s === k ? 'done' : 'normal');

  const regs: Reg[] = [
    { name: 'HASH', value: s === 3 ? '2' : s === 5 ? '2 · 3 · 4' : '—', hot: s === 3 || s === 5 },
    { name: 'IDX', value: s === 3 ? '2 % 8 = 2' : s === 5 ? '2 · 3 · 4' : '—', hot: s === 3 || s === 5 },
    { name: 'R1', value: s === 3 ? '已存在 → 不寫' : s === 5 ? '✓ ✓ ✗' : s >= 6 ? '2' : '—', hot: s === 3 || s === 5 || s === 6 },
    { name: 'WRITES', value: s === 1 ? '3' : s === 3 ? '0' : s === 4 ? '3' : s === 5 ? '2' : '—', hot: s === 1 || s === 3 || s === 4 || s === 5 },
  ];
  const alu =
    s === 3 ? { op: 'CMP', a: 'slot2', b: '2', out: '相同 → 拒絕' }
    : s === 5 ? { op: 'LOOKUP', a: 'b 的每個元素', b: 'a', out: '{2, 3}' }
    : s === 6 ? { op: 'LEN', a: '{2, 3}', out: '2' }
    : null;

  const cells: Cell[] = [
    { header: 'names' },
    ...(s >= 2 ? [{ addr: '0x40', label: 'a', value: '→ 0x50', ptr: true, hot: s === 2 } as Cell] : []),
    ...(s >= 1 ? [{ header: 'set a（8 格 × 2 bytes，每格存 int 物件的位址；int 的 hash 就是自己，% 8 決定格子）' } as Cell,
      ...setCells(0x50, 'a', [1, 2, 3], s === 1 ? [1, 2, 3] : s === 3 ? [2] : s === 5 ? [2, 3] : [], s === 5 ? [4] : [])] : []),
    ...(s >= 4 ? [{ header: '{2, 3, 4}（暫時的 set）' } as Cell, ...setCells(0x60, 'b', [2, 3, 4], s === 4 || s === 5 ? [2, 3, 4] : [])] : []),
    ...(s >= 5 ? [{ header: 'a & b（新的 set）' } as Cell, ...setCells(0x70, 'a&b', [2, 3], s === 5 || s === 6 ? [2, 3] : [])] : []),
    { header: 'int 物件 1~4（小整數事先建好、共用）' },
    ...[1, 2, 3, 4].map((n) => ({ addr: '0x4' + (8 + n).toString(16).toUpperCase(), value: String(n) } as Cell)),
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'build a' }
    : s === 2 ? { active: true, toRam: true, label: 'store a' }
    : s === 3 ? { active: true, toRam: false, label: 'read slot 2' }
    : s === 4 ? { active: true, toRam: true, label: 'build b' }
    : s === 5 ? { active: true, toRam: true, label: 'lookup → new set' }
    : s === 6 ? { active: true, toRam: false, label: 'read len' }
    : { active: false };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[s] || '還沒開始執行'}>
        <CodePanel>
          <Line pc={s <= 1}><Tok s={d(2)}>a =</Tok> <Tok s={d(1)}>{'{'}1, 2, 3{'}'}</Tok></Line>
          <Line pc={s === 2} jump={s === 3 ? '重複：什麼都沒寫入' : undefined}><Tok s={s === 3 ? 'active' : 'normal'}>a.add(2)</Tok></Line>
          <Line pc={s >= 3} dim={s < 3}>
            <Tok s={d(7)}>print(</Tok>
            {s <= 4 ? (
              <><Tok>len(</Tok><Tok>a &amp; </Tok><Tok s={d(4)}>{'{'}2, 3, 4{'}'}</Tok><Tok>)</Tok></>
            ) : s === 5 ? (
              <><Tok>len(</Tok><Tok s="done">{'{'}2, 3{'}'}</Tok><Tok>)</Tok></>
            ) : <Tok s={d(6)}>2</Tok>}
            <Tok s={d(7)}>)</Tok>
          </Line>
        </CodePanel>

        {s === 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-pink-400/60 p-2">
            <div className="text-[10px] font-bold text-pink-200">類比：把集合想成 8 條電線（第 n 條有電 = n 在集合裡）</div>
            <Gate kind="AND" a="a 00001110" b="b 00011100" out="00001100" label="AND 閘：兩邊都有電才通過 → {2, 3}" />
            <div className="text-[9px] text-slate-400">（CPython 實際是用查表來做交集，這裡只是硬體類比）</div>
          </motion.div>
        )}

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={s >= 7 ? ['2'] : []} active={s === 7} />
      </Board>
    </div>
  );
}
