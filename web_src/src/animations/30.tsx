// Animation 30: L3 選擇結構 — Program Counter 與條件跳躍（巢狀 if）
import React from 'react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Screen, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

// PC = the NEXT instruction. 0 start | 1 age = 20 | 2 has_id = "n" | 3 age >= 18 | 4 if True → 進入
// 5 has_id == "y" | 6 if False → jump 0x18 | 7 print（印完自動跳過外層 else）
const PCS = ['0x00', '0x04', '0x08', '0x08', '0x0C', '0x0C', '0x18', '0x24'];
const NOW = ['', '執行 age = 20', '執行 has_id = "n"', '計算 age >= 18', 'if True：進入內層', '計算 has_id == "y"', 'if False：跳到 else', '執行 print("請出示證件")'];

export default function BranchPCAnim({ step }: { step: number }) {
  const s = clampStep(step, 8);
  const pc = PCS[s];
  const d = (k: number): TokState => (s === k ? 'done' : 'normal');

  const outerElseDim = s >= 4; // 外層條件 True → 外層 else 會被跳過
  const innerIfBodyDim = s >= 6; // 內層條件 False → print("可以進入") 被跳過
  const pcMoved = s === 1 || s === 2 || s === 4 || s === 6 || s === 7;

  const regs: Reg[] = [
    { name: 'PC', value: pc, hot: pcMoved },
    { name: 'R1', value: s === 3 ? '20' : s === 5 ? "0x6E 'n'" : '0', hot: s === 3 || s === 5 },
    { name: 'R2', value: s === 3 ? '18' : s === 5 ? "0x79 'y'" : '0', hot: s === 3 || s === 5 },
  ];
  const alu = s === 3 ? { op: 'CMP', a: '20', b: '18', out: '2 (≥0)' } : s === 5 ? { op: 'CMP', a: '0x6E', b: '0x79', out: '−11 (≠0)' } : null;
  const flags = s >= 5 ? { Z: 0, N: 1 } : { Z: 0, N: 0 };

  const cells: Cell[] = [
    { header: 'code (指令也住在 DRAM)' },
    { addr: '0x00–0x24', value: '10 條指令', note: `PC → ${pc}`, hot: pcMoved },
    { header: 'names' },
    ...(s >= 1 ? [{ addr: '0x40', label: 'age', value: '→ 0x48', ptr: true, hot: s === 1 || s === 3 } as Cell] : []),
    ...(s >= 2 ? [{ addr: '0x42', label: 'has_id', value: '→ 0x4A', ptr: true, hot: s === 2 || s === 5 } as Cell] : []),
    { header: 'objects (程式裡的常數)' },
    { addr: '0x48', value: '20', note: 'int', hot: s === 1 || s === 3 },
    { addr: '0x49', value: '18', note: 'int 常數', hot: s === 3 },
    { addr: '0x4A', value: '"n"', note: '0x6E', hot: s === 2 || s === 5 },
    { addr: '0x4B', value: '"y"', note: '0x79', hot: s === 5 },
  ];

  const bus =
    s === 1 ? { active: true, toRam: true, label: 'store age' }
    : s === 2 ? { active: true, toRam: true, label: 'store has_id' }
    : s === 3 ? { active: true, toRam: false, label: 'load age, 18' }
    : s === 5 ? { active: true, toRam: false, label: 'load has_id, "y"' }
    : s === 4 || s === 6 || s === 7 ? { active: true, toRam: false, label: `fetch ${pc}` }
    : { active: false };

  const L = (addr: string, indent: number, body: React.ReactNode, dim = false, jump?: string) => (
    <Line addr={addr} pc={pc === addr} indent={indent} dim={dim} jump={jump}>{body}</Line>
  );

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[s] || '還沒開始執行'}>
        <CodePanel>
          {L('0x00', 0, <><Tok s={d(1)}>age =</Tok> 20</>)}
          {L('0x04', 0, <><Tok s={d(2)}>has_id =</Tok> "n"</>)}
          {L('0x08', 0, <>if <Tok s={s === 4 ? 'active' : d(3)}>{s >= 3 ? 'True' : 'age >= 18'}</Tok>:</>, false, s === 4 ? 'True → 往下走' : undefined)}
          {L('0x0C', 1, <>if <Tok s={s === 6 ? 'active' : d(5)}>{s >= 5 ? 'False' : 'has_id == "y"'}</Tok>:</>, false, s === 6 ? 'False → jump 0x18' : undefined)}
          {L('0x10', 2, <>print("可以進入")</>, innerIfBodyDim)}
          {L('0x14', 1, <>else:</>)}
          {L('0x18', 2, <Tok s={d(7)}>print("請出示證件")</Tok>, false, s === 7 ? '印完 → jump 0x24（跳過外層 else）' : undefined)}
          {L('0x1C', 0, <>else:</>, outerElseDim)}
          {L('0x20', 1, <>print("未成年")</>, outerElseDim)}
          {L('0x24', 0, <span className="text-slate-500"># 程式結束</span>)}
        </CodePanel>

        <HwRow>
          <CPU regs={regs} alu={alu} flags={flags} />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
        <Screen lines={s >= 7 ? ['請出示證件'] : []} active={s === 7} />
      </Board>
    </div>
  );
}
