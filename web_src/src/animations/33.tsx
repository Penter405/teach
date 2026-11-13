// Animation 33: L6 字串 Method — str 是 DRAM 裡連續的 bytes；index = 位址計算；immutable → 新區塊
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

export default function StringBytesAnim({ step }: { step: number }) {
  const s = clampStep(step, 5);

  // print("hello"[1:4].upper())
  const sliceTok =
    s <= 1 ? <Tok s="active">"hello"[1:4]</Tok> : s === 2 ? <Tok s="done">"ell"</Tok> : s === 3 ? <Tok s="active">"ell"</Tok> : null;
  const upperS: TokState = s === 3 ? 'active' : 'dim';
  const printS: TokState = s === 4 ? 'active' : 'dim';

  const regs: Reg[] = [
    { name: 'BASE', value: s >= 3 ? '0x50' : '0x48', hot: s === 1 || s === 3 },
    { name: 'IDX', value: s === 1 ? '1' : s === 2 ? '1 … 3' : s >= 3 ? '0 … 2' : '0', hot: s === 1 || s === 2 },
    { name: 'ADDR', value: s === 1 ? '0x49' : s === 2 ? '0x49–0x4B' : s >= 3 ? '0x58' : '—', hot: s === 1 || s === 2 },
    { name: 'R1', value: s === 1 ? "0x65 'e'" : s === 3 ? "0x6C → 0x4C" : s === 4 ? '"ELL"' : '0', hot: s === 1 || s === 3 },
  ];
  const alu = s === 1 ? { op: 'ADD', a: 'BASE 0x48', b: 'IDX 1', out: '0x49' } : s === 3 ? { op: 'SUB', a: "0x6C 'l'", b: '0x20', out: "0x4C 'L'" } : null;

  const cells: Cell[] = [
    { header: 'objects (str = 連續的 bytes)' },
    { addr: '0x48', value: '"hello"', hotBytes: s === 1 ? [1] : s === 2 ? [1, 2, 3] : undefined, hot: s <= 2, note: s === 1 ? '[1] = 0x48 + 1' : undefined },
    ...(s >= 2 ? [{ addr: '0x50', value: '"ell"', hotBytes: s === 3 ? [0, 1, 2] : undefined, hot: s === 2 || s === 3, note: s === 2 ? '切片 = 複製到新區塊' : undefined } as Cell] : []),
    ...(s >= 3 ? [{ addr: '0x58', value: '"ELL"', hotBytes: s === 3 ? [0, 1, 2] : undefined, hot: s >= 3, note: s === 3 ? 'immutable：upper() 寫到新區塊' : undefined } as Cell] : []),
  ];

  const bus =
    s === 1 ? { active: true, toRam: false, label: 'load 0x49' }
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
