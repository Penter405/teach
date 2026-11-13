// Animation 37: L10 綜合 — 整台機器一起動：dict 查表 + 迴圈 PC + call stack + ALU + 螢幕
// One step = one action; PC = the NEXT instruction.
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

// Steps 4–10 run once for "amy", steps 11–17 repeat them for "bob" (phase = the same 4–10).
// 0 start | 1 def grade | 2 build dict | 3 scores = | 4 for: name = … | 5 scores[name] | 6 call grade(…)
// 7 s >= 60 | 8 "P" if … else "F" | 9 return | 10 print | 18 for: no key left → end
const TOTAL = 19;
const PC_BY_PHASE: Record<number, string> = { 0: '0x00', 1: '0x08', 2: '0x08', 3: '0x0C', 4: '0x10', 5: '0x10', 6: '0x04', 7: '0x04', 8: '0x04', 9: '0x10', 10: '0x0C', 18: '0x14' };

export default function WholeMachineAnim({ step }: { step: number }) {
  const s = clampStep(step, TOTAL);
  const p = s <= 10 ? s : s <= 17 ? s - 7 : 18; // phase
  const bob = s >= 11;
  const pc = PC_BY_PHASE[p];
  const prevPc = s > 0 ? PC_BY_PHASE[s - 1 <= 10 ? s - 1 : s - 1 <= 17 ? s - 8 : 18] : pc;

  const name = bob ? '"bob"' : '"amy"';
  const score = bob ? '55' : '90';
  const pass = !bob;
  const grade = pass ? '"P"' : '"F"';
  const inFrame = p >= 6 && p <= 8;

  const NOW: Record<number, string> = {
    1: '執行 def grade：名稱 grade 指向函式',
    2: '建立 dict {"amy": 90, "bob": 55}',
    3: '執行 scores = {…}',
    4: `for：name = ${name}`,
    5: `執行 scores[name]（查 ${name}）`,
    6: `呼叫 grade(${score})`,
    7: `計算 s >= 60（${score} >= 60）`,
    8: `"P" if ${pass ? 'True' : 'False'} else "F" → ${grade}`,
    9: `grade return ${grade}`,
    10: `執行 print(name, ${grade})`,
    18: 'for：沒有下一個 key → 離開迴圈',
  };
  const d = (k: number): TokState => (p === k ? 'done' : 'normal');

  const regs: Reg[] = [
    { name: 'PC', value: pc, hot: pc !== prevPc },
    { name: 'SP', value: inFrame ? '0x9C' : '0xA0', hot: p === 6 || p === 9 },
    { name: 'RET', value: s >= 16 ? '"F"' : s >= 9 ? '"P"' : '—', hot: p === 9 },
    { name: 'R1', value: p === 4 ? name : p >= 5 && p <= 8 ? score : '—', hot: p >= 4 && p <= 7 },
  ];
  const alu =
    p === 5 ? { op: 'HASH', a: name, out: `slot → ${score}` }
    : p === 7 ? { op: 'CMP', a: score, b: '60', out: pass ? 'N=0 → True' : 'N=1 → False' }
    : null;
  const flags = s >= 14 ? { Z: 0, N: 1 } : { Z: 0, N: 0 };

  const frameStale = !inFrame;
  const cells: Cell[] = [
    { header: 'names' },
    ...(s >= 1 ? [{ addr: '0x40', label: 'grade', value: '→ code 0x00', ptr: true, hot: s === 1 || p === 6 } as Cell] : []),
    ...(s >= 3 ? [{ addr: '0x42', label: 'scores', value: '→ 0x78', ptr: true, hot: s === 3 || p === 5 } as Cell] : []),
    ...(s >= 4 ? [{ addr: '0x44', label: 'name', value: bob ? '→ 0x4B' : '→ 0x48', ptr: true, hot: p === 4, note: p === 4 ? 'name 指向 dict 裡同一個 key 物件' : undefined } as Cell] : []),
    ...(s >= 2 ? [
      { header: 'dict (hash table：hash · key 的位址 · value 的位址)' } as Cell,
      { addr: '0x78', label: '[5] hash', value: '9157', hot: s === 2 || (p === 5 && !bob) } as Cell,
      { addr: '0x7A', label: 'key', value: '→ 0x48', hot: p === 5 && !bob } as Cell,
      { addr: '0x7C', label: 'value', value: '→ 0x4E', hot: p === 5 && !bob } as Cell,
      { addr: '0x80', label: '[6] hash', value: '3045', hot: s === 2 || (p === 5 && bob) } as Cell,
      { addr: '0x82', label: 'key', value: '→ 0x4B', hot: p === 5 && bob } as Cell,
      { addr: '0x84', label: 'value', value: '→ 0x4F', hot: p === 5 && bob } as Cell,
    ] : []),
    { header: 'key / value 物件（程式裡的常數）' },
    { addr: '0x48', value: '"amy"' },
    { addr: '0x4B', value: '"bob"' },
    { addr: '0x4E', value: '90', hot: p === 5 && !bob },
    { addr: '0x4F', value: '55', hot: p === 5 && bob },
    { header: 'stack' },
    ...(s >= 6
      ? [
          { addr: '0x9E', label: 'ret', value: '0x10', note: 'frame grade', hot: p === 6, stale: frameStale } as Cell,
          { addr: '0x9C', label: 's', value: bob ? '→ 0x4F' : '→ 0x4E', hot: p === 6, stale: frameStale, note: p === 6 ? '參數 s 也只存位址：和 dict 共用同一個 int 物件' : undefined } as Cell,
        ]
      : [{ addr: '0x9E', value: '(空)', stale: true } as Cell]),
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'store grade' }
    : s === 2 ? { active: true, toRam: true, label: 'build dict' }
    : s === 3 ? { active: true, toRam: true, label: 'store scores' }
    : p === 4 ? { active: true, toRam: true, label: 'next key → store name' }
    : p === 5 ? { active: true, toRam: false, label: `hash → load ${score}` }
    : p === 6 ? { active: true, toRam: true, label: 'push frame' }
    : p === 7 ? { active: true, toRam: false, label: 'load s, 60' }
    : p === 9 ? { active: true, toRam: false, label: 'pop → ret addr' }
    : pc !== prevPc ? { active: true, toRam: false, label: `fetch ${pc}` }
    : { active: false };

  // line 0x04: return "P" if s >= 60 else "F"
  const ret =
    p === 7 ? (<><Tok>"P" if </Tok><Tok s="done">{pass ? 'True' : 'False'}</Tok><Tok> else "F"</Tok></>)
    : p === 8 || p === 9 ? <Tok s={d(8)}>{grade}</Tok>
    : (<><Tok>"P" if </Tok><Tok>s &gt;= 60</Tok><Tok> else "F"</Tok></>);

  // line 0x10: print(name, grade(scores[name]))  — 由內而外
  const printLine =
    p >= 9 && p <= 10 ? (
      <><Tok s={d(10)}>print(name, </Tok><Tok s={d(9)}>{grade}</Tok><Tok s={d(10)}>)</Tok></>
    ) : (
      <>
        <Tok>print(name, </Tok>
        <Tok s={p === 6 ? 'active' : 'normal'}>grade(</Tok>
        {p >= 5 && p <= 8 ? <Tok s={d(5)}>{score}</Tok> : <Tok>scores[name]</Tok>}
        <Tok s={p === 6 ? 'active' : 'normal'}>)</Tok>
        <Tok>)</Tok>
      </>
    );

  const screen: string[] = [];
  if (s >= 10) screen.push('amy P');
  if (s >= 17) screen.push('bob F');

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[p] || '還沒開始執行'}>
        <CodePanel>
          <Line addr="0x00" pc={pc === '0x00'}><Tok s={s === 1 ? 'done' : 'normal'}>def grade(s):</Tok></Line>
          <Line addr="0x04" pc={pc === '0x04'} indent={1} jump={p === 9 ? 'return → 0x10' : undefined}>
            <Tok s={p === 9 ? 'active' : 'normal'}>return</Tok> {ret}
          </Line>
          <Line addr="0x08" pc={pc === '0x08'}>
            <Tok s={s === 3 ? 'done' : 'normal'}>scores =</Tok> <Tok s={s === 2 ? 'done' : 'normal'}>{'{'}"amy": 90, "bob": 55{'}'}</Tok>
          </Line>
          <Line addr="0x0C" pc={pc === '0x0C'} jump={p === 18 ? '沒有 key 了 → 結束' : undefined}>
            for <Tok s={p === 4 ? 'done' : p === 18 ? 'active' : 'normal'}>name</Tok> in scores:
          </Line>
          <Line addr="0x10" pc={pc === '0x10'} indent={1} jump={p === 10 ? '↩ 回到 for' : undefined}>{printLine}</Line>
          <Line addr="0x14" pc={pc === '0x14'}><span className="text-slate-500"># 程式結束</span></Line>
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} flags={flags} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={screen} active={p === 10} />
      </Board>
    </div>
  );
}
