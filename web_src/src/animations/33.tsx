// Animation 33: L6 字串 Method — str 是 DRAM 裡連續的 bytes；index = 位址計算；immutable → 新區塊
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

// 0 start | 1 "hello"[1:4] | 2 .upper() | 3 print
const NOW = ['', '執行切片 "hello"[1:4]', '執行 "ell".upper()', '執行 print("ELL")'];

export default function StringBytesAnim({ step }: { step: number }) {
  const s = clampStep(step, 4);
  const d = (k: number): TokState => (s === k ? 'done' : 'normal');

  const regs: Reg[] = [
    { name: 'BASE', value: s >= 2 ? '0x50' : '0x48', hot: s === 1 || s === 2 },
    { name: 'IDX', value: s === 1 ? '1 … 3' : s >= 2 ? '0 … 2' : '0', hot: s === 1 || s === 2 },
    { name: 'ADDR', value: s === 1 ? '0x49–0x4B' : s >= 2 ? '0x58' : '—', hot: s === 1 || s === 2 },
    { name: 'R1', value: s === 1 ? "0x65 'e'" : s === 2 ? "0x6C → 0x4C" : s === 3 ? '"ELL"' : '0', hot: s >= 1 },
  ];
  const alu = s === 1 ? { op: 'ADD', a: 'BASE 0x48', b: 'IDX 1', out: '0x49' } : s === 2 ? { op: 'SUB', a: "0x6C 'l'", b: '0x20', out: "0x4C 'L'" } : null;

  const cells: Cell[] = [
    { header: 'objects (str = 連續的 bytes)' },
    { addr: '0x48', value: '"hello"', hotBytes: s === 1 ? [1, 2, 3] : undefined, hot: s === 1, note: s === 1 ? '[1] 的位址 = 0x48 + 1，直接算出來' : undefined },
    ...(s >= 1 ? [{ addr: '0x50', value: '"ell"', hotBytes: s === 2 ? [0, 1, 2] : undefined, hot: s === 1 || s === 2, note: s === 1 ? '切片 = 複製 3 個 bytes 到新區塊' : undefined } as Cell] : []),
    ...(s >= 2 ? [{ addr: '0x58', value: '"ELL"', hotBytes: s === 2 ? [0, 1, 2] : undefined, hot: s >= 2, note: s === 2 ? 'immutable：upper() 寫到新區塊' : undefined } as Cell] : []),
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'copy 3 bytes' }
    : s === 2 ? { active: true, toRam: true, label: 'write 新區塊' }
    : s === 3 ? { active: true, toRam: false, label: 'load "ELL"' }
    : { active: false };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[s] || '還沒開始執行'}>
        <CodePanel>
          <Line pc>
            <Tok s={d(3)}>print(</Tok>
            {s === 0 ? <Tok>"hello"[1:4]</Tok> : s === 1 ? <Tok s="done">"ell"</Tok> : null}
            {s <= 1 ? <Tok>.upper()</Tok> : <Tok s={d(2)}>"ELL"</Tok>}
            <Tok s={d(3)}>)</Tok>
          </Line>
          {s === 2 && (
            <div className="mt-1 text-[11px] font-sans text-sky-300 pl-5">主詞 "ell" ． 動詞 upper() → method 是物件自己的動作</div>
          )}
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={s >= 3 ? ['ELL'] : []} active={s === 3} />
      </Board>
    </div>
  );
}
