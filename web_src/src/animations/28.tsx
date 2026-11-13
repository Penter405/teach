// Animation 28: L1 輸入與輸出 — 鍵盤 → buffer → DRAM → CPU → stdout → 螢幕
// One step = one action. Step 0 = nothing has run yet. The code shows the result of each step;
// ▶ marks the line the next action is on.
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, Keyboard, Buffer, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

// 0 start | 1 input() shows prompt, waits | 2 keys → buffer | 3 input() returns "25"
// 4 int("25") → 25 | 5 age = | 6 age + 1 | 7 f-string | 8 print
const NOW = ['', '執行 input("Age: ")：顯示提示、等鍵盤', '鍵盤輸入 2、5、Enter（input() 還在等）', 'input() 回傳 "25"', '執行 int("25")', '執行 age = 25', '計算 age + 1', '組成 f-string "明年 26 歲"', '執行 print("明年 26 歲")'];

export default function IOHardwareAnim({ step }: { step: number }) {
  const s = clampStep(step, 9);
  const d = (k: number): TokState => (s === k ? 'done' : 'normal');

  const regs: Reg[] = [
    { name: 'R1', value: s === 4 ? "0x32 '2'" : s >= 6 ? '25' : '0', hot: s === 4 || s === 6 },
    { name: 'R2', value: s === 4 ? "0x35 '5'" : s >= 6 ? '1' : '0', hot: s === 4 || s === 6 },
    { name: 'R3', value: s >= 6 ? '26' : s >= 4 ? '25' : '0', bin: s >= 6 ? '00011010' : s >= 4 ? '00011001' : undefined, hot: s === 4 || s === 5 || s === 6 },
  ];

  const alu =
    s === 4 ? { op: 'DIGITS', a: '(0x32−0x30)×10', b: '(0x35−0x30)', out: '25' }
    : s === 6 ? { op: 'ADD', a: '25', b: '1', out: '26' }
    : null;

  const cells: Cell[] = [
    { header: 'names (symbol table)' },
    ...(s >= 5 ? [{ addr: '0x40', label: 'age', value: '→ 0x58', ptr: true, hot: s === 5 } as Cell] : []),
    { header: 'objects' },
    { addr: '0x48', value: '"Age: "', note: 'str 常數', hot: s === 1 },
    ...(s >= 3 ? [{ addr: '0x50', value: '"25"', note: '0x32 0x35 (字元碼)', hot: s === 3 || s === 4 } as Cell] : []),
    ...(s >= 4 ? [{ addr: '0x58', value: '25', note: 'int 00011001', hot: s === 4 || s === 6 } as Cell] : []),
    ...(s >= 6 ? [{ addr: '0x59', value: '26', note: 'int (暫時結果)', hot: s === 6 } as Cell] : []),
    ...(s >= 7 ? [{ addr: '0x60', value: '"明年 26 歲"', note: 'str (f-string)', hot: s === 7 || s === 8 } as Cell] : []),
  ];

  const bus =
    s === 3 ? { active: true, toRam: true, label: 'store "25"' }
    : s === 4 ? { active: true, toRam: false, label: "load '2' '5'" }
    : s === 5 ? { active: true, toRam: true, label: 'store age' }
    : s === 6 ? { active: true, toRam: false, label: 'load age' }
    : s === 7 ? { active: true, toRam: true, label: 'build str' }
    : s === 8 ? { active: true, toRam: false, label: 'load str → stdout' }
    : { active: false, toRam: true };

  const screenLines: React.ReactNode[] = s >= 1 ? [<span key="p">Age: {s >= 2 ? <span className="text-white">25</span> : null}</span>] : [];
  if (s >= 8) screenLines.push(<span key="o" className="text-white">明年 26 歲</span>);

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[s] || '還沒開始執行'}>
        <CodePanel>
          {/* line 1: age = int(input("Age: "))  — 由內而外 */}
          <Line pc={s <= 4}>
            <Tok s={s < 5 ? 'dim' : d(5)}>age =</Tok>{' '}
            {s <= 3 ? (
              <>
                <Tok s={s < 3 ? 'dim' : 'normal'}>int(</Tok>
                {s <= 2
                  ? <Tok s={s === 1 || s === 2 ? 'active' : 'normal'}>input("Age: ")</Tok>
                  : <Tok s="done">"25"</Tok>}
                <Tok s={s < 3 ? 'dim' : 'normal'}>)</Tok>
              </>
            ) : (
              <Tok s={d(4)}>25</Tok>
            )}
          </Line>
          {/* line 2: print(f"明年 {age + 1} 歲") */}
          <Line pc={s >= 5} dim={s < 5}>
            {s <= 6 ? (
              <>
                <Tok>print(f"明年 {'{'}</Tok>
                <Tok s={d(6)}>{s >= 6 ? '26' : 'age + 1'}</Tok>
                <Tok>{'}'} 歲")</Tok>
              </>
            ) : (
              <>
                <Tok s={d(8)}>print(</Tok>
                <Tok s={d(7)}>"明年 26 歲"</Tok>
                <Tok s={d(8)}>)</Tok>
              </>
            )}
          </Line>
        </CodePanel>

        {/* I/O devices */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Keyboard keys={['2', '5', 'Enter']} pressed={s === 2 ? ['2', '5', 'Enter'] : []} />
          <Buffer name={s >= 3 ? 'INPUT BUFFER (已讀走)' : 'INPUT BUFFER (OS)'} bytes={s >= 2 ? ['0x32', '0x35', '0x0A'] : []} active={s === 2} />
          <Buffer name={s >= 8 ? 'STDOUT BUFFER → flush' : 'STDOUT BUFFER'} bytes={s >= 8 ? ['明年 26 歲', '\\n'] : []} active={s === 8} />
          <Screen lines={screenLines} active={s === 1 || s === 8} cursor={s >= 1 && s <= 2} />
        </div>

        {(s === 1 || s === 2) && (
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
