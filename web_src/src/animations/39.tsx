// Animation 39: 數學 · 埃氏篩 (Sieve of Eratosthenes) — sieve(30)
// The grid IS the bool array is_p[0..30]. One step = one action. Step 0 = nothing has run yet.
// 0 start | 1 is_p[0], is_p[1] = False | 2 p=2 prime | 3 cross 4,6,…,30 | 4 p=3 prime | 5 cross 9,12,…,30
// 6 p=4 already crossed → skip | 7 p=5 prime | 8 cross 25,30 | 9 p=6: 36 > 30 → stop | 10 collect primes
import React from 'react';
import { CodePanel, Line, Tok, clampStep, type TokState } from '../animation_kit/HardwareKit';
import { AlgoBoard, Stage, ValueCell, VarRow, Note, type CellTone } from '../animation_kit/AlgoKit';

const TOTAL = 11;
const N = 30;
const NUMS = Array.from({ length: N + 1 }, (_, i) => i);

/** prime p → [step it is found, step its multiples are crossed] */
const FOUND: Record<number, number> = { 2: 2, 3: 4, 5: 7 };
const CROSS: Record<number, number> = { 2: 3, 3: 5, 5: 8 };
/** the p the loop is looking at on each step */
const P_AT: Record<number, number> = { 2: 2, 3: 2, 4: 3, 5: 3, 6: 4, 7: 5, 8: 5, 9: 6 };

const NOW = [
  '',
  'is_p[0] = is_p[1] = False：0 和 1 不是質數',
  'p = 2：is_p[2] 是 True → 2 是質數',
  '劃掉 2 的倍數：從 2² = 4 開始，4, 6, 8, …, 30',
  'p = 3：is_p[3] 是 True → 3 是質數',
  '劃掉 3 的倍數：從 3² = 9 開始，9, 12, 15, …, 30',
  'p = 4：is_p[4] 是 False（已經被 2 劃掉）→ 跳過',
  'p = 5：is_p[5] 是 True → 5 是質數',
  '劃掉 5 的倍數：從 5² = 25 開始，25, 30',
  'p = 6：6 × 6 = 36 > 30 → 離開迴圈',
  '沒被劃掉的就是質數',
];

/** primes whose crossing has happened by step s and that cross k */
const crossers = (k: number, s: number) =>
  [2, 3, 5].filter((p) => CROSS[p] <= s && k >= p * p && k % p === 0);

export default function SieveAnim({ step }: { step: number }) {
  const s = clampStep(step, TOTAL);
  const p = P_AT[s];
  const crossingP = [2, 3, 5].find((q) => CROSS[q] === s);

  let marks = 0;
  let again = 0;
  NUMS.forEach((k) => {
    const c = crossers(k, s);
    marks += c.length;
    if (c.length > 1) again += c.length - 1;
  });

  const cell = (k: number): { tone: CellTone; struck: boolean; circle: boolean; top?: React.ReactNode; bottom?: React.ReactNode } => {
    if (k <= 1) return { tone: s >= 1 ? 'dim' : 'normal', struck: s >= 1, circle: false, bottom: s === 1 ? 'False' : undefined };
    const c = crossers(k, s);
    const isPrimeFound = FOUND[k] !== undefined && FOUND[k] <= s;
    const isP = p === k;
    if (isPrimeFound) {
      return { tone: isP && s <= 8 ? 'active' : 'yes', struck: false, circle: true, top: isP ? 'p' : undefined, bottom: s === FOUND[k] ? '質數' : undefined };
    }
    if (c.length) {
      const now = crossingP !== undefined && c.includes(crossingP) && k >= crossingP * crossingP;
      if (now) {
        const before = c.length > 1;
        return {
          tone: 'hit', struck: true, circle: false,
          top: k === crossingP * crossingP ? `${crossingP}²` : `×${crossingP}`,
          bottom: before ? '又劃一次' : undefined,
        };
      }
      if (isP) return { tone: 'active', struck: true, circle: false, top: 'p', bottom: s === 6 ? '跳過' : s === 9 ? '36 > 30' : undefined };
      return { tone: 'no', struck: true, circle: false };
    }
    if (s === 10) return { tone: 'yes', struck: false, circle: true, bottom: '質數' };
    return { tone: 'normal', struck: false, circle: false };
  };

  const condTok = p ? `${p * p} <= 30` : 'p * p <= n';
  const checkTok = s === 2 || s === 4 || s === 7 ? 'True' : s === 6 ? 'False' : 'is_p[p]';
  const rangeTok = crossingP ? `range(${crossingP * crossingP}, 31, ${crossingP})` : 'range(p * p, n + 1, p)';
  const st = (on: boolean): TokState => (on ? 'done' : 'normal');
  const primes = NUMS.filter((k) => k >= 2 && crossers(k, 10).length === 0);

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={NOW[s]}>
        <CodePanel>
          <Line>def sieve(n):</Line>
          <Line indent={1}>is_p = [True] * (n + 1)</Line>
          <Line indent={1} pc={s === 1}><Tok s={st(s === 1)}>is_p[0] = is_p[1] = False</Tok></Line>
          <Line indent={1}>p = 2</Line>
          <Line indent={1} pc={s === 9} jump={s === 9 ? '36 > 30 → 離開迴圈' : undefined}>
            while <Tok s={st(s >= 2 && s <= 9)}>{condTok}</Tok>:
          </Line>
          <Line indent={2} pc={s === 2 || s === 4 || s === 6 || s === 7} jump={s === 6 ? 'False → 跳過，p += 1' : undefined}>
            if <Tok s={st(s === 2 || s === 4 || s === 6 || s === 7)}>{checkTok}</Tok>:
          </Line>
          <Line indent={3}>for m in <Tok s={st(crossingP !== undefined)}>{rangeTok}</Tok>:</Line>
          <Line indent={4} pc={crossingP !== undefined}><Tok s={crossingP ? 'active' : 'normal'}>is_p[m] = False</Tok></Line>
          <Line indent={2}>p += 1</Line>
          <Line indent={1} pc={s === 10}><Tok s={st(s === 10)}>{s === 10 ? `[${primes.join(', ')}]` : '[i for i in range(n + 1) if is_p[i]]'}</Tok></Line>
        </CodePanel>

        <VarRow
          vars={[
            { name: 'n', value: N },
            { name: 'p', value: p ?? '—', hot: p !== undefined },
            { name: '劃了幾次', value: marks, hot: crossingP !== undefined },
            { name: '重複劃', value: again, hot: crossingP !== undefined && again > 0 },
          ]}
        />

        <Stage
          title="is_p[0..30]（劃掉 = False）"
          right={<span className="text-[10px] text-slate-400"><span className="text-emerald-300">● 質數</span>　<span className="text-rose-300">／ 這一步劃掉</span></span>}
        >
          <div className="grid grid-cols-6 sm:grid-cols-10 justify-items-center gap-x-1 gap-y-0.5">
            {NUMS.map((k) => {
              const c = cell(k);
              return <ValueCell key={k} value={k} size="sm" tone={c.tone} struck={c.struck} circle={c.circle} top={c.top} bottom={c.bottom} />;
            })}
          </div>
        </Stage>

        {s === 3 && <Note>2 本身是質數不能劃，所以從 2 × 2 = 4 開始，每隔 2 格劃一個。</Note>}
        {s === 5 && (
          <Note tone="rose">
            為什麼從 3² = 9 開始？3 × 2 = 6 已經被 2 劃過了。但 12、18、24、30 還是會被 2 和 3 各劃一次：這就是篩法的重複工作。
          </Note>
        )}
        {s === 6 && <Note>4 已經是 False，它的倍數也一定是 2 的倍數，早就劃掉了 → 不用再劃。</Note>}
        {s === 9 && <Note>只要 p² &gt; n 就可以停：剩下的合數一定有一個 ≤ √n 的質因數，早就被劃掉了。</Note>}
        {s === 10 && (
          <Note tone="emerald">
            一共劃了 {marks} 次（其中 {again} 次是重複的），比 n = 30 還少。總工作量 ≈ n·(1/2 + 1/3 + 1/5 + …) = O(n log log n)。
          </Note>
        )}
      </AlgoBoard>
    </div>
  );
}
