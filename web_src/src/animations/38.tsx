// Animation 38: 數學 · 試除法 (Trial Division) — is_prime(91)
// 91 = 7 × 13 looks like a prime, so it is a good example.
// One step = one action. Step 0 = nothing has run yet.
// 0 start | 1 n < 2? | 2–7 try d = 2…7 (7 divides → return False) | 8 why only up to √n | 9 compare n = 97
import React from 'react';
import { CodePanel, Line, Tok, clampStep } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, ValueCell, VarRow, Note, type CellTone } from '../animation_kit/AlgoKit';

const TOTAL = 10;
const DIVS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const ROOT = 9; // ⌊√91⌋ = ⌊√97⌋ = 9

const NOW = [
  '',
  '檢查 n < 2：91 < 2 是 False，繼續',
  '試 d = 2：91 % 2 = 1，不整除',
  '試 d = 3：91 % 3 = 1，不整除',
  '試 d = 4：91 % 4 = 3，不整除',
  '試 d = 5：91 % 5 = 1，不整除',
  '試 d = 6：91 % 6 = 1，不整除',
  '試 d = 7：91 % 7 = 0 → 找到因數，return False',
  '為什麼只試到 √n：因數一定成對出現',
  '換成 n = 97：2～9 都不整除 → return True',
];

export default function TrialDivisionAnim({ step }: { step: number }) {
  const s = clampStep(step, TOTAL);
  const n = s === 9 ? 97 : 91;
  const d = s >= 2 && s <= 7 ? s : s === 8 ? 7 : s === 9 ? 10 : 2;
  const found = s === 7 || s === 8;

  // divisor row
  const cell = (k: number): { tone: CellTone; bottom?: React.ReactNode; top?: React.ReactNode } => {
    if (k > ROOT) {
      if (s === 8 && k === 13) return { tone: 'yes', top: '配對', bottom: '91 ÷ 7' };
      return { tone: 'dim', bottom: s >= 1 ? '不用試' : undefined };
    }
    if (s === 9) return { tone: 'no', bottom: `餘 ${97 % k}` };
    if (s < 2 || k > Math.min(s, 7)) return { tone: 'normal' };
    const r = n % k;
    if (k === s && s <= 7) return { tone: r === 0 ? 'yes' : 'active', top: 'd', bottom: `91 % ${k} = ${r}` };
    if (r === 0) return { tone: 'yes', top: s === 8 ? '配對' : undefined, bottom: '整除 ✓' };
    return { tone: 'no', bottom: `餘 ${r}` };
  };

  const tried = s === 9 ? 8 : s >= 2 ? Math.min(s, 7) - 1 : 0;

  // code (shows the value each part has on this step)
  const cond = s >= 2 && s <= 7 ? `${d * d} <= ${n}` : s === 9 ? '100 <= 97' : 'd * d <= n';
  const mod = s >= 2 && s <= 7 ? `${n % d} == 0` : 'n % d == 0';

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={NOW[s]}>
        <CodePanel>
          <Line>def is_prime(n):</Line>
          <Line indent={1} pc={s === 1}>
            if <Tok s={s === 1 ? 'done' : 'normal'}>{s === 1 ? 'False' : 'n < 2'}</Tok>: return False
          </Line>
          <Line indent={1}>d = 2</Line>
          <Line indent={1} pc={s === 9} jump={s === 9 ? '100 > 97 → 離開迴圈' : undefined}>
            while <Tok s={(s >= 2 && s <= 7) || s === 9 ? 'done' : 'normal'}>{cond}</Tok>:
          </Line>
          <Line indent={2} pc={s >= 2 && s <= 7}>
            if <Tok s={s >= 2 && s <= 7 ? 'done' : 'normal'}>{mod}</Tok>: <Tok s={s === 7 ? 'active' : 'normal'}>return False</Tok>
          </Line>
          <Line indent={2} dim={found}>d += 1</Line>
          <Line indent={1}><Tok s={s === 9 ? 'active' : 'normal'}>return True</Tok></Line>
        </CodePanel>

        <VarRow
          vars={[
            { name: 'n', value: n, hot: s === 1 || s === 9 },
            { name: 'd', value: s >= 2 ? d : '—', hot: s >= 2 && s <= 7 },
            { name: '試了幾次', value: tried, hot: s >= 2 && s <= 7 },
            { name: 'return', value: s >= 7 && s <= 8 ? 'False（不是質數）' : s === 9 ? 'True（質數）' : '—', hot: s === 7 || s === 9 },
          ]}
        />

        <Stage title={`除數 d（n = ${n}）`} right={<span className="text-[10px] text-amber-300">√{n} ≈ {Math.sqrt(n).toFixed(2)}</span>}>
          <div className="flex flex-wrap items-end justify-center gap-1.5">
            {DIVS.map((k) => {
              const c = cell(k);
              return (
                <React.Fragment key={k}>
                  {k === ROOT + 1 && (
                    <div className="mx-1 flex flex-col items-center self-stretch">
                      <span className="text-[9px] font-bold text-amber-300 whitespace-nowrap">√n</span>
                      <div className="w-[3px] flex-1 rounded bg-amber-400/80" />
                    </div>
                  )}
                  <ValueCell value={k} tone={c.tone} top={c.top} bottom={c.bottom} />
                </React.Fragment>
              );
            })}
          </div>
        </Stage>

        {s === 1 && <Note>0 和 1 不是質數，先排除。√91 ≈ 9.5，所以 d 只要試 2 ～ 9。</Note>}
        {s >= 2 && s <= 6 && <Note>餘數不是 0 → 不是因數，換下一個 d。</Note>}
        {s === 7 && <Note tone="rose">91 = 7 × 13：一找到因數就可以停，不用再試下去。</Note>}
        {s === 8 && (
          <Note tone="amber">
            91 的因數配對：1 × 91、7 × 13。每一對裡，小的那個 ≤ √91 ≤ 大的那個。
            所以只要試 √n 左邊，有因數就一定會在左邊先遇到。時間 O(√n)。
          </Note>
        )}
        {s === 9 && (
          <Note tone="emerald">
            97 的 d 試到 9 都不整除，10 × 10 = 100 &gt; 97 就停：只試了 8 次，而不是 2 ～ 96 的 95 次。
          </Note>
        )}
      </AlgoBoard>
    </div>
  );
}
