// Animation 59: 遞迴 · fact(4) — the call stack grows, then returns
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, StackView, Note, Split } from '../animation_kit/AlgoKit';
import { CodePanel, Line, Tok } from '../animation_kit/HardwareKit';

export const STEPS = [
  '開始（還沒執行）',
  '呼叫 fact(4)：要先算 fact(3)',
  '呼叫 fact(3)：要先算 fact(2)',
  '呼叫 fact(2)：要先算 fact(1)',
  'fact(1)：base case，直接 return 1',
  'fact(2) 拿到 1：return 2 × 1 = 2',
  'fact(3) 拿到 2：return 3 × 2 = 6',
  'fact(4) 拿到 6：return 4 × 6 = 24',
];
const RET: Record<number, number> = { 1: 1, 2: 2, 3: 6, 4: 24 };

export default function RecursionAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const depth = s === 0 ? 0 : s <= 4 ? s : 8 - s;
  const ns = [4, 3, 2, 1].slice(0, depth);
  const doneN = s >= 4 ? s - 3 : 99; // n of the frame that returns now
  const top = ns[ns.length - 1];
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Split>
          <CodePanel>
            <Line>def fact(n):</Line>
            <Line indent={1} pc={s === 4}>if n == 1:</Line>
            <Line indent={2} pc={s === 4}><Tok s={s === 4 ? 'done' : 'normal'}>return 1</Tok></Line>
            <Line indent={1} pc={(s >= 1 && s <= 3) || s >= 5}>
              return <Tok s={s >= 5 ? 'done' : 'normal'}>{s >= 5 ? `${top} * ${RET[top - 1]}` : 'n * '}</Tok>{s < 5 && <Tok s={s >= 1 && s <= 3 ? 'active' : 'normal'}>fact(n - 1)</Tok>}
            </Line>
          </CodePanel>
          <Stage title="call stack（上面是正在跑的）">
            <div className="flex justify-center">
              <StackView width="w-56" items={ns.map((n) => ({
                v: `fact(${n})`,
                tone: n === top ? (n === doneN ? 'yes' : 'active') : 'normal',
                note: n === doneN ? `return ${RET[n]}` : n === top ? '' : `等 fact(${n - 1})`,
              }))} />
            </div>
          </Stage>
        </Split>
        {s === 4 && <Note>base case 不再呼叫自己，堆疊從這裡開始往回收。</Note>}
        {s === 7 && <Note tone="emerald">堆疊最多疊了 4 層：遞迴深度 = n，太深就會 RecursionError。</Note>}
      </AlgoBoard>
    </div>
  );
}
