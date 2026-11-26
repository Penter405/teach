// Animation 108: x & -x 只留最右邊的 1 — hand-written, not traced.
// x = 104 = 01101000₂ (8 bits shown). -x = ~x + 1: flip every bit, then +1 carries through the
// trailing 1s (x's trailing 0s) and stops at x's lowest 1. So x and -x agree from that bit down and
// are opposite above it; AND keeps only that bit.
// steps / results in data.json (10 of each) were written from the same data: change both together.
import React from 'react';
import { AlgoBoard, Stage, ValueCell, Note, FitWidth, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';

export const STEPS = 10;
const W = 8;
const X = 104;
const LOW = 3;                                // bit index of x's lowest 1
const bit = (v: number, b: number) => (v >> b) & 1;
const NOTX = ~X;                              // -105
const NEG = -X;                               // ~x + 1
const AND = X & -X;                           // 8
const BITS = Array.from({ length: W }, (_, i) => W - 1 - i);   // 7 … 0, left to right

const NOW = [
  '想要：只留 x 最右邊的 1（和它後面的 0）',
  '~x：每一位反過來',
  '看 ~x 的右邊',
  '~x + 1：第 0 位 1 + 1',
  '第 1 位：1 + 進位 1',
  '第 2 位：1 + 進位 1',
  '第 3 位：0 + 進位 1',
  '比較 x 和 -x',
  'x & -x：兩個都是 1 才是 1',
  '結果',
];
const POST = [
  'x = 104 = 01101000₂。答案應該是 00001000₂ = 8',
  '~x = 10010111₂（Python 印出 -105）：0 變 1、1 變 0',
  'x 後面的 0 在 ~x 變成一串 1，x 最右邊的 1 在 ~x 變成 0',
  '1 + 1 = 10₂：寫 0，進位 1',
  '寫 0，進位 1',
  '寫 0，進位 1',
  '寫 1，沒有進位了，左邊都不變。~x + 1 = 10011000₂ = -104，就是 -x',
  '第 3 位和它右邊：x 和 -x 一模一樣（1 後面都是 0）；左邊：每一位都相反',
  '左邊每一位都是一個 0、一個 1 → 全部是 0；右邊只有第 3 位兩個都是 1 → 00001000₂',
  'x & -x = 8 = 2³：最右邊的 1 在第 3 位，後面 3 個 0。Fenwick tree 就是用它跳：i += i & -i',
];

type Cell = { v: React.ReactNode; tone: CellTone; top?: string; bottom?: string };
type Row = { name: string; cells: Cell[]; value: string };

export default function LowbitAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const right = (b: number) => b <= LOW;      // the part where x and -x agree

  // row x
  const xRow: Row = {
    name: 'x',
    value: String(X),
    cells: BITS.map((b) => ({
      v: bit(X, b),
      top: String(b),
      bottom: b === LOW ? '最右邊的 1' : undefined,
      tone: s === 0 && b === LOW ? 'active'
        : s === 2 ? (b === LOW ? 'active' : b < LOW ? 'blue' : 'normal')
        : s === 7 ? (right(b) ? 'yes' : 'hit')
        : s >= 8 ? (right(b) ? (b === LOW ? 'yes' : 'normal') : 'no')
        : 'normal',
    })),
  };

  // row ~x
  const notRow: Row = {
    name: '~x',
    value: String(NOTX),
    cells: BITS.map((b) => ({
      v: bit(NOTX, b),
      tone: s === 1 ? 'active'
        : s === 2 ? (b === LOW ? 'active' : b < LOW ? 'blue' : 'normal')
        : s >= 3 && s <= 6 && b <= s - 3 ? 'no'
        : 'normal',
    })),
  };

  // row ~x + 1, built one bit per step (steps 3 – 6 handle bits 0 – 3)
  const done = (b: number) => s >= 7 || b <= s - 3;
  const negRow: Row = {
    name: '~x + 1 = -x',
    value: s >= 6 ? String(NEG) : '…',
    cells: BITS.map((b) => {
      const cur = s >= 3 && s <= 6 && b === s - 3;
      const carryIn = s >= 3 && s <= 5 && b === s - 2;
      return {
        v: done(b) ? bit(NEG, b) : bit(NOTX, b),
        top: carryIn ? '進位 1' : cur && b === 0 ? '+1' : undefined,
        bottom: cur ? (bit(NOTX, b) ? '1+1 → 0' : '0+1 → 1') : undefined,
        tone: cur ? 'active'
          : s === 7 ? (right(b) ? 'yes' : 'hit')
          : s >= 8 ? (right(b) ? (b === LOW ? 'yes' : 'normal') : 'no')
          : done(b) ? 'yes'
          : 'dim',
      };
    }),
  };

  // row x & -x
  const andRow: Row = {
    name: 'x & -x',
    value: String(AND),
    cells: BITS.map((b) => ({ v: bit(AND, b), tone: b === LOW ? 'yes' : right(b) ? 'dim' : 'no' })),
  };

  const rows = [xRow, ...(s >= 1 ? [notRow] : []), ...(s >= 3 ? [negRow] : []), ...(s >= 8 ? [andRow] : [])];

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={NOW[s]} post={POST[s]} wide>
        <Stage title="8 位二進位（上面的數字 = 第幾位）">
          <FitWidth>
            <div className="flex flex-col gap-1">
              {rows.map((r, k) => (
                <div key={r.name} className={`flex items-center gap-2 ${k === 3 ? 'mt-1 border-t border-slate-700 pt-2' : ''}`}>
                  <span className="w-28 shrink-0 text-right font-mono text-sm font-bold text-slate-300">{r.name}</span>
                  {/* small gap after 4 bits, like 0110 1000 */}
                  <div className="flex gap-1">
                    {r.cells.map((c, i) => (
                      <div key={i} className={`flex w-9 justify-center ${i === 4 ? 'ml-2' : ''}`}>
                        <ValueCell value={c.v} tone={c.tone} top={c.top} bottom={c.bottom} size="sm" />
                      </div>
                    ))}
                  </div>
                  <span className="w-16 shrink-0 font-mono text-sm text-slate-400">= {r.value}</span>
                </div>
              ))}
            </div>
          </FitWidth>
        </Stage>
        {s === 1 && (
          <Note tone="amber">Python 的整數沒有固定位數：~x = -x − 1，左邊其實是無限多個 1。這裡只畫 8 位，再往左也只是一直「x 是 0、~x 是 1」，結果一樣。</Note>
        )}
        {s >= 7 && s <= 8 && (
          <Note tone="sky">綠 = x 和 -x 一樣（最右邊的 1 和後面的 0）；{s === 7 ? '紅 = 每一位都相反' : '灰 = 一個 0 一個 1，AND 之後是 0'}</Note>
        )}
        {s === 9 && (
          <Note tone="emerald">x &amp; -x = x &amp; (~x + 1)：反過來再加 1，進位一路把尾巴的 1 變回 0，停在最右邊的 1。所以只有那一位兩邊都是 1。</Note>
        )}
      </AlgoBoard>
    </div>
  );
}
