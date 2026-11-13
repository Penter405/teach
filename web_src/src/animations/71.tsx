// Animation 71: DP · 區間 DP — merge stones [3,4,5,6], fill by interval length
import React from 'react';
import { clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, Table2D, Seq, Note, type CellTone } from '../animation_kit/AlgoKit';

export const STEPS = [
  '開始：dp[l][r] = 把第 l ～ r 堆合併成一堆的最小代價',
  '長度 1：只有一堆，不用合併 → 0',
  '長度 2：[0,1] = 3 + 4 = 7、[1,2] = 9、[2,3] = 11',
  '長度 3：[0,2] = min(0 + 9, 7 + 0) + 12 = 19；[1,3] = min(0 + 11, 9 + 0) + 15 = 24',
  '長度 4：[0,3] 試三個切點：0 + 24、7 + 11、19 + 0 → 最小 18（從 1、2 中間切），+ 18 = 36',
];
const A = [3, 4, 5, 6];
const DP = [[0, 7, 19, 36], [0, 0, 9, 24], [0, 0, 0, 11], [0, 0, 0, 0]];

export default function IntervalAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS.length);
  const tone = (l: number, r: number): CellTone => {
    const len = r - l + 1;
    if (r < l) return 'dim';
    if (s === 4 && ((l === 0 && r === 1) || (l === 2 && r === 3))) return 'blue';
    if (len === s) return 'active';
    if (len < s) return 'yes';
    return 'normal';
  };
  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={STEPS[s]}>
        <Stage title="石頭">
          <div className="flex justify-center">
            <Seq items={A.map((v, i) => ({ v, top: `[${i}]`, tone: s === 4 ? (i <= 1 ? 'blue' : 'hit') : 'normal', bottom: s === 4 ? (i <= 1 ? '左半 7' : '右半 11') : undefined }))} />
          </div>
        </Stage>
        <Stage title="dp[l][r]（列 l、行 r；只用右上半）">
          <Table2D corner="l＼r" colHeads={[0, 1, 2, 3]}
            rows={DP.map((row, l) => ({ head: l, cells: row.map((v, r) => ({ v: r < l ? '—' : r - l + 1 <= s ? v : '', tone: tone(l, r) })) }))} />
        </Stage>
        {s === 2 && <Note>同一條斜線上的格子長度一樣：填表是一條斜線一條斜線往右上填。</Note>}
        {s === 4 && <Note tone="emerald">最後一次合併的代價永遠是整段總和 18；要選的是「從哪裡切」讓兩半加起來最小。</Note>}
      </AlgoBoard>
    </div>
  );
}
