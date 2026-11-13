// Animation 30: L3 選擇結構 — Program Counter 與條件跳躍（巢狀 if）
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg } from '../animation_kit/HardwareKit';

const PCS = ['0x08', '0x08', '0x0C', '0x0C', '0x18', '0x24'];

export default function BranchPCAnim({ step }: { step: number }) {
  const s = clampStep(step, 6);
  const pc = PCS[s];

  const outerElseDim = s >= 2; // 外層條件 True → 外層 else 會被跳過
  const innerIfBodyDim = s >= 4; // 內層條件 False → print("可以進入") 被跳過

  const regs: Reg[] = [
    { name: 'PC', value: pc, hot: s === 2 || s === 4 || s === 5 },
    { name: 'R1', value: s === 1 ? '20' : s === 3 ? "0x6E 'n'" : '0', hot: s === 1 || s === 3 },
    { name: 'R2', value: s === 1 ? '18' : s === 3 ? "0x79 'y'" : '0', hot: s === 1 || s === 3 },
  ];
  const alu = s === 1 ? { op: 'CMP', a: '20', b: '18', out: '2 (≥0)' } : s === 3 ? { op: 'CMP', a: '0x6E', b: '0x79', out: '−11 (≠0)' } : null;
  const flags = s === 1 || s === 2 ? { Z: 0, N: 0 } : s >= 3 ? { Z: 0, N: 1 } : { Z: 0, N: 0 };

  const cells: Cell[] = [
    { header: 'code (指令也住在 DRAM)' },
    { addr: '0x00–0x24', value: '9 條指令', note: `PC 正在讀 ${pc}`, hot: s === 2 || s === 4 || s === 5 },
    { header: 'names' },
    { addr: '0x40', label: 'age', value: '→ 0x48', ptr: true, hot: s === 1 },
    { addr: '0x42', label: 'has_id', value: '→ 0x4A', ptr: true, hot: s === 3 },
    { header: 'objects' },
    { addr: '0x48', value: '20', note: 'int', hot: s === 1 },
    { addr: '0x49', value: '18', note: 'int 常數', hot: s === 1 },
    { addr: '0x4A', value: '"n"', note: '0x6E', hot: s === 3 },
    { addr: '0x4B', value: '"y"', note: '0x79', hot: s === 3 },
  ];

  const bus =
    s === 1 ? { active: true, toRam: false, label: 'load age, 18' }
    : s === 3 ? { active: true, toRam: false, label: 'load has_id, "y"' }
    : s === 2 || s === 4 || s === 5 ? { active: true, toRam: false, label: `fetch ${pc}` }
    : { active: false };

  const L = (addr: string, indent: number, body: React.ReactNode, dim = false, jump?: string) => (
    <Line addr={addr} pc={pc === addr} indent={indent} dim={dim} jump={jump}>{body}</Line>
  );

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board>
        <CodePanel>
          {L('0x00', 0, <>age = 20</>)}
          {L('0x04', 0, <>has_id = "n"</>)}
          {L('0x08', 0, <>if <Tok s={s === 1 ? 'active' : s >= 2 ? 'done' : 'normal'}>{s >= 2 ? 'True' : 'age >= 18'}</Tok>:</>, false, s === 2 ? 'True → 往下走' : undefined)}
          {L('0x0C', 1, <>if <Tok s={s === 3 ? 'active' : s >= 4 ? 'done' : 'normal'}>{s >= 4 ? 'False' : 'has_id == "y"'}</Tok>:</>, false, s === 4 ? 'False → jump 0x18' : undefined)}
          {L('0x10', 2, <>print("可以進入")</>, innerIfBodyDim)}
          {L('0x14', 1, <>else:</>)}
          {L('0x18', 2, <Tok s={s === 5 ? 'done' : s === 4 ? 'active' : 'normal'}>print("請出示證件")</Tok>, false, s === 5 ? '執行完 → jump 0x24' : undefined)}
          {L('0x1C', 0, <>else:</>, outerElseDim)}
          {L('0x20', 1, <>print("未成年")</>, outerElseDim)}
          {L('0x24', 0, <span className="text-slate-500"># 程式結束</span>)}
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} flags={flags} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={s >= 5 ? ['請出示證件'] : []} active={s === 5} />
      </Board>
    </div>
  );
}
