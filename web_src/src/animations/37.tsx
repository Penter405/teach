// Animation 37: L10 綜合 — 整台機器一起動：dict 查表 + 迴圈 PC + call stack + ALU + 螢幕
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg } from '../animation_kit/HardwareKit';

const PCS = ['0x0C', '0x10', '0x04', '0x10', '0x04', '0x10'];

export default function WholeMachineAnim({ step }: { step: number }) {
  const s = clampStep(step, 6);
  const pc = PCS[s];
  const name = s >= 4 ? 'bob' : 'amy';
  const score = s >= 4 ? '55' : '90';

  // print(name, grade(scores[name]))  — 由內而外
  const innerDone = s >= 2;
  const gradeDone = s === 3 || s === 5;
  const grade = s >= 4 ? '"F"' : '"P"';
  const printLine =
    gradeDone ? (
      <><Tok s="active">print(name, </Tok><Tok s="done">{grade}</Tok><Tok s="active">)</Tok></>
    ) : (
      <>
        <Tok s="dim">print(name, </Tok>
        <Tok s={s === 2 || s === 4 ? 'active' : 'dim'}>grade(</Tok>
        {innerDone ? <Tok s="done">{score}</Tok> : <Tok s={s === 1 ? 'active' : 'normal'}>scores[name]</Tok>}
        <Tok s={s === 2 || s === 4 ? 'active' : 'dim'}>)</Tok>
        <Tok s="dim">)</Tok>
      </>
    );

  const regs: Reg[] = [
    { name: 'PC', value: pc, hot: true },
    { name: 'SP', value: s === 2 || s === 4 ? '0x9C' : '0xA0', hot: s === 2 || s === 4 },
    { name: 'RET', value: s >= 4 ? '"F"' : s >= 2 ? '"P"' : '—', hot: s === 2 || s === 4 },
    { name: 'R1', value: s === 0 ? '"amy"' : s === 1 ? '90' : s === 2 ? '90' : s === 4 ? '55' : '—', hot: s <= 2 || s === 4 },
  ];
  const alu =
    s === 1 ? { op: 'HASH', a: '"amy"', out: 'slot → 90' }
    : s === 2 ? { op: 'CMP', a: '90', b: '60', out: 'N=0 → "P"' }
    : s === 4 ? { op: 'CMP', a: '55', b: '60', out: 'N=1 → "F"' }
    : null;
  const flags = s === 4 ? { Z: 0, N: 1 } : { Z: 0, N: 0 };

  const frameStale = !(s === 2 || s === 4);
  const cells: Cell[] = [
    { header: 'names' },
    { addr: '0x40', label: 'grade', value: '→ code 0x00', ptr: true, hot: s === 2 || s === 4 },
    { addr: '0x42', label: 'scores', value: '→ 0x50', ptr: true, hot: s === 1 },
    { addr: '0x44', label: 'name', value: s >= 4 ? '→ 0x4B' : '→ 0x48', ptr: true, hot: s === 0 || s === 4, note: s === 0 || s === 4 ? 'name 指向 dict 裡同一個 key 物件' : undefined },
    { header: 'dict (hash table：hash · key 的位址 · value 的位址)' },
    { addr: '0x78', label: '[5] hash', value: '9157', hot: s === 1 },
    { addr: '0x7A', label: 'key', value: '→ 0x48', hot: s === 1 },
    { addr: '0x7C', label: 'value', value: '→ 0x4E', hot: s === 1 },
    { addr: '0x80', label: '[6] hash', value: '3045', hot: s === 4 },
    { addr: '0x82', label: 'key', value: '→ 0x4B', hot: s === 4 },
    { addr: '0x84', label: 'value', value: '→ 0x4F', hot: s === 4 },
    { header: 'key / value 物件' },
    { addr: '0x48', value: '"amy"' },
    { addr: '0x4B', value: '"bob"' },
    { addr: '0x4E', value: '90' },
    { addr: '0x4F', value: '55' },
    { header: 'stack' },
    ...(s >= 2
      ? [
          { addr: '0x9E', label: 'ret', value: '0x10', note: 'frame grade', hot: !frameStale, stale: frameStale } as Cell,
          { addr: '0x9C', label: 's', value: s >= 4 ? '→ 0x4F' : '→ 0x4E', hot: !frameStale, stale: frameStale, note: !frameStale ? '參數 s 也只存位址：和 dict 共用同一個 int 物件' : undefined } as Cell,
        ]
      : [{ addr: '0x9E', value: '(空)', stale: true } as Cell]),
  ];

  const bus =
    s === 0 ? { active: true, toRam: false, label: 'next key' }
    : s === 1 ? { active: true, toRam: false, label: 'hash → load 90' }
    : s === 2 || s === 4 ? { active: true, toRam: true, label: 'push frame' }
    : { active: true, toRam: false, label: 'pop / fetch' };

  const screen: string[] = [];
  if (s >= 3) screen.push('amy P');
  if (s >= 5) screen.push('bob F');

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          <Line addr="0x00">def grade(s):</Line>
          <Line addr="0x04" pc={pc === '0x04'} indent={1} jump={s === 2 || s === 4 ? 'return → 0x10' : undefined}>
            return "P" if <Tok s={s === 2 || s === 4 ? 'active' : 'normal'}>s &gt;= 60</Tok> else "F"
          </Line>
          <Line addr="0x08">scores = {'{'}"amy": 90, "bob": 55{'}'}</Line>
          <Line addr="0x0C" pc={pc === '0x0C'} jump={s === 4 ? '↩ 下一個 key' : s === 5 ? '沒有 key 了 → 結束' : undefined}>
            for <Tok s={s === 0 ? 'active' : 'normal'}>name</Tok> in scores:
          </Line>
          <Line addr="0x10" pc={pc === '0x10'} indent={1}>{printLine}</Line>
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} flags={flags} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={screen} active={s === 3 || s === 5} />
      </Board>
    </div>
  );
}
