// Animation 35: L8 Dictionary — hash 電路、% 取格子、碰撞探測、直接跳到位址
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

// hash 值為示意（真實 str hash 每次執行會不同）
// Each slot stores hash + the ADDRESS of the key object + the ADDRESS of the value object.
const TABLE: (null | { h: number; k: string; v: string })[] = [null, null, null, null, null, { h: 3045, k: '0x48', v: '0x4E' }, { h: 9157, k: '0x4B', v: '0x4F' }, null];

export default function DictHashAnim({ step }: { step: number }) {
  const s = clampStep(step, 6);

  // print(scores.get("amy", 0) + 10)
  const getTok =
    s <= 3 ? <Tok s="active">scores.get("amy", 0)</Tok> : s === 4 ? <Tok s="done">90</Tok> : null;
  const plusS: TokState = s === 5 ? 'active' : 'dim';

  const look = s === 2 || s === 3 ? 5 : s === 4 ? 6 : -1;

  const regs: Reg[] = [
    { name: 'HASH', value: s >= 1 ? '9157' : '—', hot: s === 1 },
    { name: 'IDX', value: s >= 4 ? '6' : s >= 2 ? '5' : '—', hot: s === 2 || s === 3 || s === 4 },
    { name: 'R1', value: s === 3 ? '"bob"≠"amy"' : s >= 4 ? '90' : '—', hot: s === 3 || s === 4 },
    { name: 'R2', value: s === 5 ? '100' : '—', hot: s === 5 },
  ];
  const alu =
    s === 1 ? { op: 'HASH', a: '"amy"', out: '9157' }
    : s === 2 ? { op: 'MOD', a: '9157', b: '8', out: '5' }
    : s === 3 ? { op: 'CMP', a: 'key', b: '"amy"', out: '不同 → 下一格' }
    : s === 4 ? { op: 'CMP', a: 'key', b: '"amy"', out: '相同 ✓' }
    : s === 5 ? { op: 'ADD', a: '90', b: '10', out: '100' }
    : null;

  const cells: Cell[] = [
    { header: 'names' },
    { addr: '0x40', label: 'scores', value: '→ 0x50', ptr: true },
    { header: 'hash table（8 格 × 8 bytes：hash · key 的位址 · value 的位址）' },
    ...TABLE.flatMap((e, i) => {
      if (!e) return [];
      const base = 0x50 + i * 8;
      const a = (o: number) => '0x' + (base + o).toString(16).toUpperCase();
      return [
        { addr: a(0), label: `[${i}] hash`, value: String(e.h), hot: i === look, note: i === look ? `slot ${i} 從 0x${base.toString(16).toUpperCase()} 開始` : undefined },
        { addr: a(2), label: 'key', value: '→ ' + e.k, hot: i === look },
        { addr: a(4), label: 'value', value: '→ ' + e.v, hot: i === look },
      ] as Cell[];
    }),
    { header: 'key / value 物件' },
    { addr: '0x48', value: '"bob"' },
    { addr: '0x4B', value: '"amy"' },
    { addr: '0x4E', value: '70' },
    { addr: '0x4F', value: '90' },
  ];

  const bus =
    s === 2 ? { active: true, toRam: false, label: 'jump slot 5' }
    : s === 3 ? { active: true, toRam: false, label: 'probe slot 6' }
    : s === 4 ? { active: true, toRam: false, label: 'load 90' }
    : { active: false };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          <Line>scores = {'{'}"bob": 70, "amy": 90{'}'}</Line>
          <Line pc>
            <Tok s={s === 5 ? 'active' : 'dim'}>print(</Tok>
            {s < 5 ? getTok : <Tok s="done">100</Tok>}
            {s < 5 && <Tok s={plusS}> + 10</Tok>}
            <Tok s={s === 5 ? 'active' : 'dim'}>)</Tok>
          </Line>
        </CodePanel>

        {s === 1 || s === 2 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 font-mono text-xs text-slate-200">
            <span className="rounded bg-slate-800 px-2 py-1">"amy"</span>→
            <span className="rounded border-2 border-pink-400 bg-slate-900 px-2 py-1 text-pink-200 font-bold">HASH 電路</span>→
            <span className="rounded bg-slate-800 px-2 py-1">9157</span>
            {s === 2 && (<>→<span className="rounded border-2 border-pink-400 bg-slate-900 px-2 py-1 text-pink-200 font-bold">% 8</span>→<span className="rounded bg-amber-600 px-2 py-1 font-bold">slot 5</span></>)}
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
