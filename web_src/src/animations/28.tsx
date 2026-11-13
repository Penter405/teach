// Animation 28: L1 輸入與輸出 — 鍵盤 → buffer → DRAM → CPU → stdout → 螢幕
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, Keyboard, Buffer, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

export default function IOHardwareAnim({ step }: { step: number }) {
  const s = clampStep(step, 7);

  // ── line 1: age = int(input("Age: ")) — 由內而外
  const ageS: TokState = s < 4 ? 'dim' : s === 4 ? 'active' : 'normal';
  const intS: TokState = s < 3 ? 'dim' : s === 3 ? 'active' : 'normal';
  const inputS: TokState = s < 2 ? 'active' : 'done';

  // ── line 2: print(f"明年 {age + 1} 歲")
  const l2Dim = s < 5;

  const regs: Reg[] = [
    { name: 'R1', value: s === 3 ? "0x32 '2'" : s >= 5 ? '25' : '0', hot: s === 3 || s === 5 },
    { name: 'R2', value: s === 3 ? "0x35 '5'" : s >= 5 ? '1' : '0', hot: s === 3 || s === 5 },
    { name: 'R3', value: s >= 5 ? '26' : s >= 3 ? '25' : '0', bin: s >= 5 ? '00011010' : s >= 3 ? '00011001' : undefined, hot: s === 3 || s === 4 || s === 5 },
  ];

  const alu =
    s === 3 ? { op: 'DIGITS', a: '(0x32−0x30)×10', b: '(0x35−0x30)', out: '25' }
    : s === 5 ? { op: 'ADD', a: '25', b: '1', out: '26' }
    : null;

  const cells: Cell[] = [
    { header: 'names (symbol table)' },
    ...(s >= 4 ? [{ addr: '0x40', label: 'age', value: '→ 0x58', ptr: true, hot: s === 4 } as Cell] : []),
    { header: 'objects' },
    { addr: '0x48', value: '"Age: "', note: 'str 常數' },
    ...(s >= 2 ? [{ addr: '0x50', value: '"25"', note: '0x32 0x35 (字元碼)', hot: s === 2 || s === 3 } as Cell] : []),
    ...(s >= 4 ? [{ addr: '0x58', value: '25', note: 'int 00011001', hot: s === 4 || s === 5 } as Cell] : []),
    ...(s >= 5 ? [{ addr: '0x59', value: '26', note: 'int (暫時結果)', hot: s === 5 } as Cell] : []),
    ...(s >= 6 ? [{ addr: '0x60', value: '"明年 26 歲"', note: 'str (f-string)', hot: s === 6 } as Cell] : []),
  ];

  const bus =
    s === 2 ? { active: true, toRam: true, label: 'store "25"' }
    : s === 3 ? { active: true, toRam: false, label: "load '2' '5'" }
    : s === 4 ? { active: true, toRam: true, label: 'store 25' }
    : s === 5 ? { active: true, toRam: false, label: 'load age' }
    : s === 6 ? { active: true, toRam: true, label: 'build str' }
    : { active: false, toRam: true };

  const screenLines: React.ReactNode[] = [<span key="p">Age: {s >= 1 ? <span className="text-white">25</span> : null}</span>];
  if (s >= 6) screenLines.push(<span key="o" className="text-white">明年 26 歲</span>);

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          <Line pc={s < 5}>
            <Tok s={ageS}>age =</Tok>{' '}
            <Tok s={intS}>int(</Tok>
            {s < 4 ? (
              <Tok s={inputS}>{s < 2 ? 'input("Age: ")' : '"25"'}</Tok>
            ) : null}
            {s < 4 ? <Tok s={intS}>)</Tok> : <Tok s="done">25</Tok>}
          </Line>
          <Line pc={s >= 5} dim={l2Dim}>
            <Tok s={s === 6 ? 'active' : l2Dim ? 'normal' : 'dim'}>print(f"明年 {'{'}</Tok>
            <Tok s={s === 5 ? 'active' : s === 6 ? 'done' : 'normal'}>{s === 6 ? '26' : 'age + 1'}</Tok>
            <Tok s={s === 6 ? 'active' : l2Dim ? 'normal' : 'dim'}>{'}'} 歲")</Tok>
          </Line>
        </CodePanel>

        {/* I/O devices */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Keyboard keys={['2', '5', 'Enter']} pressed={s === 1 ? ['2', '5', 'Enter'] : []} />
          <Buffer name={s >= 2 ? 'INPUT BUFFER (已讀走)' : 'INPUT BUFFER (OS)'} bytes={s >= 1 ? ['0x32', '0x35', '0x0A'] : []} active={s === 1} />
          <Buffer name={s >= 6 ? 'STDOUT BUFFER → flush' : 'STDOUT BUFFER'} bytes={s >= 6 ? ['明年 26 歲', '\\n'] : []} active={s === 6} />
          <Screen lines={screenLines} active={s === 0 || s === 6} cursor={s <= 1} />
        </div>

        {s <= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-bold text-amber-300">
            ⏸ CPU 停在 input()，等待鍵盤的 Enter
          </motion.div>
        )}

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
      </Board>
    </div>
  );
}
