// Animation 35: L8 Dictionary — hash 電路、% 取格子、碰撞探測、直接跳到位址
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

// hash 值為示意（真實 str hash 每次執行會不同）
// Each slot stores hash + the ADDRESS of the key object + the ADDRESS of the value object.
const TABLE: (null | { h: number; k: string; v: string })[] = [null, null, null, null, null, { h: 3045, k: '0x48', v: '0x4E' }, { h: 9157, k: '0x4B', v: '0x4F' }, null];

// 0 start | 1 build dict | 2 scores = | 3 scores.get("amy", 0) | 4 90 + 10 | 5 print
const NOW = ['', '建立 dict {"bob": 70, "amy": 90}', '執行 scores = {…}', '執行 scores.get("amy", 0)', '計算 90 + 10', '執行 print(100)'];

export default function DictHashAnim({ step }: { step: number }) {
  const s = clampStep(step, 6);
  const d = (k: number): TokState => (s === k ? 'done' : 'normal');

  const regs: Reg[] = [
    { name: 'HASH', value: s === 3 ? '9157' : '—', hot: s === 3 },
    { name: 'IDX', value: s === 3 ? '5 → 6' : '—', hot: s === 3 },
    { name: 'R1', value: s >= 3 ? '90' : '—', hot: s === 3 || s === 4 },
    { name: 'R2', value: s >= 4 ? '100' : '—', hot: s === 4 },
  ];
  const alu =
    s === 3 ? { op: 'HASH', a: '"amy"', out: '9157 % 8 = 5' }
    : s === 4 ? { op: 'ADD', a: '90', b: '10', out: '100' }
    : null;

  const cells: Cell[] = [
    { header: 'names' },
    ...(s >= 2 ? [{ addr: '0x40', label: 'scores', value: '→ 0x50', ptr: true, hot: s === 2 } as Cell] : []),
    ...(s >= 1 ? [{ header: 'hash table（8 格 × 8 bytes：hash · key 的位址 · value 的位址）' } as Cell] : []),
    ...(s >= 1 ? TABLE.flatMap((e, i) => {
      if (!e) return [];
      const base = 0x50 + i * 8;
      const a = (o: number) => '0x' + (base + o).toString(16).toUpperCase();
      const look = s === 3 && (i === 5 || i === 6);
      const note = s === 3 ? (i === 5 ? 'slot 5："bob" ≠ "amy" → 看下一格' : '"amy" ✓ → 取出 value') : s === 1 ? `slot ${i} 從 0x${base.toString(16).toUpperCase()} 開始` : undefined;
      return [
        { addr: a(0), label: `[${i}] hash`, value: String(e.h), hot: look || s === 1, note },
        { addr: a(2), label: 'key', value: '→ ' + e.k, hot: look },
        { addr: a(4), label: 'value', value: '→ ' + e.v, hot: look && i === 6 },
      ] as Cell[];
    }) : []),
    { header: 'key / value 物件' },
    { addr: '0x48', value: '"bob"' },
    { addr: '0x4B', value: '"amy"', hot: s === 3 },
    { addr: '0x4E', value: '70' },
    { addr: '0x4F', value: '90', hot: s === 3 || s === 4 },
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'build table' }
    : s === 2 ? { active: true, toRam: true, label: 'store scores' }
    : s === 3 ? { active: true, toRam: false, label: 'slot 5 → slot 6 → load 90' }
    : { active: false };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[s] || '還沒開始執行'}>
        <CodePanel>
          <Line pc={s <= 1}><Tok s={d(2)}>scores =</Tok> <Tok s={d(1)}>{'{'}"bob": 70, "amy": 90{'}'}</Tok></Line>
          <Line pc={s >= 2} dim={s < 2}>
            <Tok s={d(5)}>print(</Tok>
            {s <= 2 ? <><Tok>scores.get("amy", 0)</Tok><Tok> + 10</Tok></>
              : s === 3 ? <><Tok s="done">90</Tok><Tok> + 10</Tok></>
              : <Tok s={d(4)}>100</Tok>}
            <Tok s={d(5)}>)</Tok>
          </Line>
        </CodePanel>

        {s === 3 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-slate-200">
            <span className="rounded bg-slate-800 px-2 py-1">"amy"</span>→
            <span className="rounded border-2 border-pink-400 bg-slate-900 px-2 py-1 text-pink-200 font-bold">HASH 電路</span>→
            <span className="rounded bg-slate-800 px-2 py-1">9157</span>
            →<span className="rounded border-2 border-pink-400 bg-slate-900 px-2 py-1 text-pink-200 font-bold">% 8</span>→<span className="rounded bg-slate-700 px-2 py-1 line-through">slot 5 "bob"</span>→<span className="rounded bg-amber-600 px-2 py-1 font-bold">slot 6 "amy" → 90</span>
          </motion.div>
        ) : null}

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="text-[10px] text-slate-400 md:w-1/2">hash 數值為示意。重點：不管 dict 多大，都是「算出格子 → 直接跳過去」，不用從頭一格一格找。</div>
          <div className="md:w-1/2"><Screen lines={s >= 5 ? ['100'] : []} active={s === 5} /></div>
        </div>
      </Board>
    </div>
  );
}
