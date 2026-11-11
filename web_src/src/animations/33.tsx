// Animation 33: L6 字串 Method — str 是 DRAM 裡連續的 bytes；index = 位址計算；immutable → 新區塊
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

const Bytes = ({ base, chars, hot = [] }: { base: number; chars: string; hot?: number[] }) => (
  <div className="flex gap-0.5">
    {chars.split('').map((c, i) => (
      <motion.div
        key={i}
        animate={{ backgroundColor: hot.includes(i) ? '#b45309' : '#1e293b' }}
        className="flex flex-col items-center rounded px-1 py-0.5 min-w-[34px] border border-slate-600"
      >
        <span className="text-[8px] text-slate-400">[{i}]</span>
        <span className="text-sm font-bold text-emerald-200">{c}</span>
        <span className="text-[8px] text-amber-200">{'0x' + c.charCodeAt(0).toString(16).toUpperCase()}</span>
        <span className="text-[7px] text-slate-500">{'0x' + (base + i).toString(16).toUpperCase()}</span>
      </motion.div>
    ))}
  </div>
);

export default function StringBytesAnim({ step }: { step: number }) {
  const s = clampStep(step, 5);

  // print("hello"[1:4].upper())
  const sliceTok =
    s <= 1 ? <Tok s="active">"hello"[1:4]</Tok> : s === 2 ? <Tok s="done">"ell"</Tok> : s === 3 ? <Tok s="active">"ell"</Tok> : null;
  const upperS: TokState = s === 3 ? 'active' : 'dim';
  const printS: TokState = s === 4 ? 'active' : 'dim';

  const regs: Reg[] = [
    { name: 'BASE', value: s >= 3 ? '0x2100' : '0x2000', hot: s === 1 || s === 3 },
    { name: 'IDX', value: s === 1 ? '1' : s === 2 ? '1 … 3' : s >= 3 ? '0 … 2' : '0', hot: s === 1 || s === 2 },
    { name: 'ADDR', value: s === 1 ? '0x2001' : s === 2 ? '0x2001–0x2003' : s >= 3 ? '0x2200' : '—', hot: s === 1 || s === 2 },
    { name: 'R1', value: s === 1 ? "0x65 'e'" : s === 3 ? "0x6C → 0x4C" : s === 4 ? '"ELL"' : '0', hot: s === 1 || s === 3 },
  ];
  const alu = s === 1 ? { op: 'ADD', a: 'BASE 0x2000', b: 'IDX 1', out: '0x2001' } : s === 3 ? { op: 'SUB', a: "0x6C 'l'", b: '0x20', out: "0x4C 'L'" } : null;

  const cells: Cell[] = [
    { header: 'objects (str = 連續的 bytes)' },
    { addr: '0x2000', value: <Bytes base={0x2000} chars="hello" hot={s === 1 ? [1] : s === 2 ? [1, 2, 3] : []} />, hot: s <= 2 },
    ...(s >= 2 ? [{ addr: '0x2100', value: <Bytes base={0x2100} chars="ell" hot={s === 3 ? [0, 1, 2] : []} />, hot: s === 2 || s === 3 } as Cell] : []),
    ...(s >= 3 ? [{ addr: '0x2200', value: <Bytes base={0x2200} chars="ELL" hot={s === 3 ? [0, 1, 2] : []} />, hot: s >= 3 } as Cell] : []),
  ];

  const bus =
    s === 1 ? { active: true, toRam: false, label: 'load 0x2001' }
    : s === 2 ? { active: true, toRam: true, label: 'copy 3 bytes' }
    : s === 3 ? { active: true, toRam: true, label: 'write 新區塊' }
    : s === 4 ? { active: true, toRam: false, label: 'load "ELL"' }
    : { active: false };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          <Line pc>
            <Tok s={printS}>print(</Tok>
            {s < 4 ? (
              <>
                {sliceTok}
                <Tok s={upperS}>.upper()</Tok>
              </>
            ) : (
              <Tok s="done">"ELL"</Tok>
            )}
            <Tok s={printS}>)</Tok>
          </Line>
          {s === 3 && (
            <div className="mt-1 text-[11px] font-sans text-sky-300 pl-5">主詞 "ell" ． 動詞 upper() → method 是物件自己的動作</div>
          )}
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={s >= 4 ? ['ELL'] : []} active={s === 4} />
      </Board>
    </div>
  );
}
