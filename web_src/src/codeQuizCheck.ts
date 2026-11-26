// Checks a code-quiz answer: compile the student's expression, then compare it with the question's
// `answer` on fixed `tests` plus seeded random values from `vars` (Python rules, see pyExpr.ts).
import type { CodeQuizQuestion } from './courseData';
import { compile, usedOps, show, pyEq, PyError, type PyVal } from './pyExpr';

export type Result = { ok: boolean; n?: number; msg?: string; detail?: string };
type Env = Record<string, bigint>;

const RANDOM_TESTS = 40;

// small seeded RNG so every student gets the same tests for a question
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildTests(q: CodeQuizQuestion): Env[] {
  const names = Object.keys(q.vars);
  const out: Env[] = [];
  const seen = new Set<string>();
  const add = (e: Env) => {
    const key = names.map((n) => String(e[n])).join(',');
    if (!seen.has(key)) { seen.add(key); out.push(e); }
  };
  for (const t of q.tests ?? []) add(Object.fromEntries(names.map((n) => [n, BigInt(t[n])])));
  const r = rng(q.question + q.answer);
  for (let k = 0; k < RANDOM_TESTS; k++) {
    add(Object.fromEntries(names.map((n) => {
      const [lo, hi] = q.vars[n];
      return [n, BigInt(lo + Math.floor(r() * (hi - lo + 1)))];
    })));
  }
  return out;
}

/** 44 → "44（0b101100）" so the student can see the bits */
function withBits(v: PyVal) {
  if (typeof v === 'boolean') return show(v);
  const b = v < 0n ? '-0b' + (-v).toString(2) : '0b' + v.toString(2);
  return `${v}（${b}）`;
}
const envText = (e: Env) => Object.entries(e).map(([k, v]) => `${k} = ${v}`).join('，');

export function checkAnswer(q: CodeQuizQuestion, src: string): Result {
  const names = Object.keys(q.vars);
  let student;
  try {
    student = compile(src, names);
  } catch (e) {
    if (e instanceof PyError) return { ok: false, msg: e.message };
    throw e;
  }
  const banned = (q.ban ?? []).filter((op) => usedOps(src).includes(op));
  if (banned.length) return { ok: false, msg: `這題不能用 ${banned.join('、')}` };
  const ref = compile(q.answer, names);
  const tests = buildTests(q);
  let n = 0;
  for (const e of tests) {
    let want: PyVal;
    try { want = ref(e); } catch { continue; }          // the question's own range has no answer here
    n++;
    let got: PyVal;
    try {
      got = student(e);
    } catch (err) {
      if (err instanceof PyError) return { ok: false, msg: `${envText(e)} 的時候出錯`, detail: err.message };
      throw err;
    }
    if (!pyEq(got, want)) {
      return { ok: false, msg: `${envText(e)} 的時候不對`, detail: `你的算式 = ${withBits(got)}，應該是 ${withBits(want)}` };
    }
  }
  return { ok: true, n };
}
