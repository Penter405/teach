// Animation 29: L2 運算子 — ALU、Flags、邏輯閘（巢狀運算由內而外）
import React from 'react';
import { motion } from 'motion/react';
import { Board, CodePanel, Line, Tok, CPU, Bus, RAM, HwRow, Gate, clampStep, type Cell, type Reg, type TokState } from '../animation_kit/HardwareKit';

// 0 start | 1 3 + 5 | 2 8 - 3 | 3 x = | 4 x > 4 | 5 x % 2 | 6 1 == 1 | 7 and | 8 ok =
const NOW = ['', '計算 3 + 5', '計算 8 - 3', '執行 x = 5', '計算 x > 4', '計算 x % 2', '計算 1 == 1', '計算 True and True', '執行 ok = True'];

export default function OperatorALUAnim({ step }: { step: number }) {
  const s = clampStep(step, 9);
  const d = (k: number): TokState => (s === k ? 'done' : 'normal');

  // line 1: x = 3 + 5 - 3
  const rhs1 =
    s === 0 ? (<><Tok>3 + 5</Tok> <Tok>- 3</Tok></>)
    : s === 1 ? (<><Tok s="done">8</Tok> <Tok>- 3</Tok></>)
    : (<Tok s={d(2)}>5</Tok>);

  // line 2: ok = x > 4 and x % 2 == 1   (優先順序：%  >  比較  >  and)
  const left = s >= 4 ? <Tok s={d(4)}>True</Tok> : <Tok>x &gt; 4</Tok>;
  const right =
    s < 5 ? <Tok>x % 2 == 1</Tok>
    : s === 5 ? (<><Tok s="done">1</Tok> <Tok>== 1</Tok></>)
    : <Tok s={d(6)}>True</Tok>;

  const R = (r1: string, r2: string, r3: string, r4: string): Reg[] => [
    { name: 'R1', value: r1, hot: s !== 0 && s !== 3 && s !== 8 },
    { name: 'R2', value: r2, hot: s !== 0 && s !== 3 && s !== 8 },
    { name: 'R3', value: r3, hot: s >= 1 && s <= 7 },
    { name: 'R4', value: r4, hot: s === 5 },
  ];
  const regsByStep: Reg[][] = [
    R('0', '0', '0', '0'),
    R('3', '5', '8', '0'),
    R('8', '3', '5', '0'),
    R('8', '3', '5', '0'),
    R('5', '4', '1', '0'),
    R('5', '2', '2 (商)', '1 (餘)'),
    R('1', '1', '0', '1'),
    R('1', '1', '1', '1'),
    R('1', '1', '1', '1'),
  ];
  const r3Bin = [undefined, '00001000', '00000101', '00000101', '00000001', '00000010', '00000000', '00000001', '00000001'][s];
  const regs = regsByStep[s].map((r) => (r.name === 'R3' ? { ...r, bin: r3Bin } : r));

  const alu =
    s === 1 ? { op: 'ADD', a: '3', b: '5', out: '8' }
    : s === 2 ? { op: 'SUB', a: '8', b: '3', out: '5' }
    : s === 4 ? { op: 'CMP', a: '5', b: '4', out: '5−4=1' }
    : s === 5 ? { op: 'DIV', a: '5', b: '2', out: '商2 餘1' }
    : s === 6 ? { op: 'CMP', a: '1', b: '1', out: '1−1=0' }
    : s === 7 ? { op: 'AND', a: '1', b: '1', out: '1' }
    : null;
  const flags = s === 4 ? { Z: 0, N: 0 } : s === 6 ? { Z: 1, N: 0 } : { Z: 0, N: 0 };

  const cells: Cell[] = [
    { header: 'names' },
    ...(s >= 3 ? [{ addr: '0x40', label: 'x', value: '→ 0x49', ptr: true, hot: s === 3 || s === 4 || s === 5, note: s === 3 ? '5 是小整數：Python 早就建好，x 直接指向它' : undefined } as Cell] : []),
    ...(s >= 8 ? [{ addr: '0x42', label: 'ok', value: '→ 0x4F', ptr: true, hot: s === 8 } as Cell] : []),
    { header: 'objects' },
    { addr: '0x48', value: '3', note: '兩個 3 是同一個物件', hot: s === 1 || s === 2 },
    { addr: '0x49', value: '5', note: 'int 常數', hot: s === 1 },
    { addr: '0x4A', value: '4', note: 'int 常數', hot: s === 4 },
    { addr: '0x4B', value: '2', note: 'int 常數', hot: s === 5 },
    { addr: '0x4C', value: '1', note: 'int 常數', hot: s === 6 },
    { addr: '0x4D', value: '8', note: '8 也是小整數，早就建好了', hot: s === 1 },
    { addr: '0x4F', value: 'True', note: 'True 只有一個，大家共用', hot: s === 4 || s >= 6 },
  ];

  const bus =
    s === 1 ? { active: true, toRam: false, label: 'load 3, 5' }
    : s === 2 ? { active: true, toRam: false, label: 'load 3' }
    : s === 3 ? { active: true, toRam: true, label: 'store x' }
    : s === 4 ? { active: true, toRam: false, label: 'load x, 4' }
    : s === 5 ? { active: true, toRam: false, label: 'load 2' }
    : s === 8 ? { active: true, toRam: true, label: 'store ok' }
    : { active: false };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <Board now={NOW[s] || '還沒開始執行'}>
        <CodePanel>
          <Line pc={s < 3}>
            <Tok s={s < 3 ? 'dim' : d(3)}>x =</Tok> {rhs1}
          </Line>
          <Line pc={s >= 3} dim={s < 3}>
            <Tok s={d(8)}>ok =</Tok>{' '}
            {s <= 6 ? (<>{left} <Tok>and</Tok> {right}</>) : <Tok s={d(7)}>True</Tok>}
          </Line>
        </CodePanel>

        <HwRow>
          <CPU
            regs={regs}
            alu={alu}
            flags={flags}
            extra={
              s === 7 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex justify-center">
                  <Gate kind="AND" a="1" b="1" out="1" label="and = 兩條線都通電才輸出 1" />
                </motion.div>
              ) : s === 5 ? (
                <div className="mt-1 text-[10px] text-amber-200">一次除法同時得到「商」和「餘數」：// 拿 R3，% 拿 R4</div>
              ) : null
            }
          />
          <Bus {...bus} />
          <RAM cells={cells} wide />
        </HwRow>
      </Board>
    </div>
  );
}
