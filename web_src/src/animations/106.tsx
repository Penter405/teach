// Animation 106: 字串刪除2char · 證明 — 為什麼只看相鄰的刪法就夠
// Hand-written (no tracer): a proof, not code running. s = aababcc, R_i = s with s[i], s[i+1] removed.
// 1) R_1 vs R_3 cell by cell (equal, far apart)  2) R_1 vs R_4 (one break → different)
// 3) adjacent links s[i] == s[i+2]  4) count segments = n − 1 − same.
// steps / results in data.json (STEPS of each) come from TEXT below: change both together.
import React from 'react';
import { AlgoBoard, Stage, Note, ValueCell, TONE, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep } from '../animation_kit/HardwareKit';
import { Stat } from '../animation_kit/AlgoHelpers';

export const S = 'aababcc';
const N = S.length;
const M = N - 1; // number of ways to delete
const R = Array.from({ length: M }, (_, i) => S.slice(0, i) + S.slice(i + 2));
const LINK = Array.from({ length: M - 1 }, (_, i) => S[i] === S[i + 2]);
const SAME = LINK.filter(Boolean).length;
// segment number of each R_i (consecutive R joined by links)
const SEG: number[] = [];
R.forEach((_, i) => SEG.push(i === 0 ? 0 : SEG[i - 1] + (LINK[i - 1] ? 0 : 1)));

/** which s index R_i uses at position k */
const src = (i: number, k: number) => (k < i ? k : k + 2);

type Cmp = { i: number; j: number; done: number[]; now: number[] };
type Step = { now: string; post: string; cmp?: Cmp; read?: number[]; links: number; cur?: number; groups?: boolean };

const ks = (i: number, j: number, zone: 'out' | 'mid') =>
  Array.from({ length: N - 2 }, (_, k) => k).filter((k) => (zone === 'mid' ? k >= i && k < j : k < i || k >= j));

function compareSteps(i: number, j: number): Step[] {
  const out: Step[] = [];
  const done: number[] = [];
  const name = `R_${i} 和 R_${j}`;
  const before = ks(i, j, 'out').filter((k) => k < i);
  const after = ks(i, j, 'out').filter((k) => k >= j);
  out.push({
    now: `比 ${name}：位置 k < ${i}${after.length ? ` 和 k ≥ ${j}` : ''}`,
    post: `k < ${i}：兩邊都還沒刪到，都是 s[k]；k ≥ ${j}：兩邊都跳過 2 個字，都是 s[k+2]。這兩區一定一樣，只要看中間`,
    cmp: { i, j, done: [], now: [...before, ...after] },
    links: 0,
  });
  done.push(...before, ...after);
  for (const k of ks(i, j, 'mid')) {
    const a = S[k + 2], b = S[k];
    const same = a === b;
    out.push({
      now: `比 ${name}：位置 k = ${k}（中間這區）`,
      post: `R_${i} 已經跳過 2 個字，是 s[${k + 2}] = ${a}；R_${j} 還沒刪到，是 s[${k}] = ${b}，${same ? '一樣' : `不一樣 → R_${i} ≠ R_${j}`}`,
      cmp: { i, j, done: [...done], now: [k] },
      read: [k, k + 2],
      links: 0,
    });
    done.push(k);
    if (!same) break;
  }
  return out;
}

const c13 = compareSteps(1, 3);
const c14 = compareSteps(1, 4);
const last = (a: Step[]) => a[a.length - 1].cmp!;

export const TEXT: Step[] = [
  {
    now: `還沒開始：s = ${S}，n = ${N}，共 ${M} 種刪法 R_0 … R_${M - 1}`,
    post: 'R_i = 刪掉 s[i]、s[i+1] 後剩下的字串。先看：隔很遠的 R_i、R_j 什麼時候會一樣？',
    links: 0,
  },
  ...c13,
  {
    now: 'R_1 和 R_3 比完',
    post: '每一格都一樣，所以 R_1 == R_3。中間用到的條件剛好是 s[1] == s[3]、s[2] == s[4]',
    cmp: { ...last(c13), done: [...last(c13).done, ...last(c13).now], now: [] },
    links: 0,
  },
  ...c14,
  {
    now: '得到規則',
    post: 'R_i == R_j ⇔ k = i, i+1, …, j−1 每一個都 s[k] == s[k+2]。中間斷一個，兩個就不一樣',
    cmp: { ...last(c14), done: [...last(c14).done, ...last(c14).now], now: [] },
    links: 0,
  },
  ...LINK.map((ok, i): Step => ({
    now: `看相鄰的 R_${i}、R_${i + 1}：比 s[${i}] 和 s[${i + 2}]`,
    post: ok
      ? `s[${i}] = s[${i + 2}] = ${S[i]}，R_${i} == R_${i + 1}，連一條線`
      : `s[${i}] = ${S[i]} ≠ s[${i + 2}] = ${S[i + 2]}，不連線`,
    read: [i, i + 2],
    links: i + 1,
    cur: i,
  })),
  {
    now: '數段數',
    post: `${M} 種刪法連了 same = ${SAME} 條線，剩 ${M} − ${SAME} = ${M - SAME} 段。一段 = 一種字串，不同段一定不同（不然中間會連起來）`,
    links: M - 1,
    groups: true,
  },
];
export const STEPS = TEXT.length;

const SEG_TONE: CellTone[] = ['blue', 'yes']; // alternate so neighbouring segments differ

export default function DeleteTwoProofAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  const st = TEXT[s];
  const cmp = st.cmp;
  const rowsOn = cmp ? [cmp.i, cmp.j] : st.cur !== undefined ? [st.cur, st.cur + 1] : [];

  const cmpTone = (k: number): CellTone => {
    if (!cmp) return 'dim';
    const eq = S[src(cmp.i, k)] === S[src(cmp.j, k)];
    if (cmp.now.includes(k)) return eq ? 'active' : 'hit';
    if (cmp.done.includes(k)) return eq ? 'yes' : 'hit';
    return 'dim';
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={st.now} post={st.post} switches={[]} wide>
        <Stage title="s（黃色 = 這一步在比的兩個字）">
          <div className="flex flex-wrap gap-1.5">
            {S.split('').map((c, k) => (
              <ValueCell key={k} value={c} top={`${k}`} tone={st.read?.includes(k) ? 'active' : 'normal'} size="sm" />
            ))}
          </div>
        </Stage>

        <div className="grid w-full gap-3 @3xl:grid-cols-2">
          <Stage title={`${M} 種刪法排成一排（相鄰一樣就連線）`} right={st.groups ? <span className="text-[11px] text-slate-300">同色 = 同一段</span> : undefined}>
            <div className="flex flex-col">
              {R.map((r, i) => {
                const on = rowsOn.includes(i);
                return (
                  <React.Fragment key={i}>
                    <div className={`flex items-center gap-2 rounded-lg px-2 py-1 ${on ? 'bg-amber-500/10 ring-1 ring-amber-400' : ''}`}>
                      <span className={`w-9 shrink-0 font-mono text-xs font-bold ${on ? 'text-amber-200' : 'text-slate-400'}`}>R_{i}</span>
                      <div className="flex gap-0.5">
                        {S.split('').map((c, k) => {
                          const del = k === i || k === i + 1;
                          return (
                            <span key={k} className={`flex h-6 w-6 items-center justify-center rounded border font-mono text-xs ${del ? 'border-slate-800 text-slate-600 line-through' : 'border-slate-600 bg-slate-800 text-slate-100'}`}>{c}</span>
                          );
                        })}
                      </div>
                      <span className="text-slate-500">→</span>
                      <span className={`rounded-md border px-2 py-0.5 font-mono text-sm font-bold ${st.groups ? TONE[SEG_TONE[SEG[i] % 2]] : 'border-slate-700 bg-slate-900 text-slate-200'}`}>{r}</span>
                      {st.groups && <span className="whitespace-nowrap text-[11px] text-slate-400">第 {SEG[i] + 1} 段</span>}
                    </div>
                    {i < M - 1 && (
                      <div className="flex h-5 items-center pl-4 text-[10px] font-bold">
                        {i < st.links
                          ? LINK[i]
                            ? <span className="text-emerald-300">┃ 連線：s[{i}] = s[{i + 2}]</span>
                            : <span className="text-slate-500">╳ 不連：s[{i}] ≠ s[{i + 2}]</span>
                          : null}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </Stage>

          <div className="flex flex-col gap-3">
            <Stage title={cmp ? `一格一格比 R_${cmp.i} 和 R_${cmp.j}（長度都是 ${N - 2}）` : '一格一格比兩種刪法'}>
              {cmp ? (
                <div className="flex flex-col gap-1">
                  {[cmp.i, cmp.j].map((row) => (
                    <div key={row} className="flex items-end gap-2">
                      <span className="w-9 shrink-0 pb-5 font-mono text-xs font-bold text-slate-400">R_{row}</span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: N - 2 }, (_, k) => (
                          <ValueCell key={k} value={S[src(row, k)]} size="sm" tone={cmpTone(k)}
                            top={row === cmp.i ? `k=${k}` : undefined} bottom={`s[${src(row, k)}]`} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pl-11 text-[10px] text-slate-400">
                    <span>k &lt; {cmp.i}：都是 s[k]</span>
                    <span>·</span>
                    <span>{cmp.i} ≤ k &lt; {cmp.j}：s[k+2] 對 s[k]</span>
                    <span>·</span>
                    <span>k ≥ {cmp.j}：都是 s[k+2]</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">{st.links > 0 ? '規則：R_i == R_j ⇔ 中間每個 k 都 s[k] == s[k+2]，所以只要看相鄰的線' : '下一步開始比'}</p>
              )}
            </Stage>
            {s >= c13.length + c14.length + 2 ? (
              <Note tone="emerald">R_i == R_j ⇔ k = i … j−1 全部 s[k] == s[k+2] ⇔ R_i 到 R_j 中間的線全部連著。所以一樣的刪法是連續的一段。</Note>
            ) : (
              <Note tone="sky">如果隔很遠的 R_i、R_j 可以一樣、中間卻沒連起來，只數相鄰的線就會算錯。下面證明不會發生。</Note>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Stat label="連了幾條線（same）" value={LINK.slice(0, st.links).filter(Boolean).length} hot={st.cur !== undefined && LINK[st.cur]} tone="emerald" />
              <Stat label={`答案 = ${M} − same`} value={st.groups ? M - SAME : '?'} hot={!!st.groups} />
            </div>
          </div>
        </div>
      </AlgoBoard>
    </div>
  );
}
