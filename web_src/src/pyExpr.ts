// A tiny Python *expression* evaluator for code-quiz answers (integers only).
// Same precedence and results as Python for:
//   or  and  not  ==  !=  <  <=  >  >=  (chained)  |  ^  &  <<  >>  +  -  *  //  %  unary - + ~  **
//   ( )  True  False  int literals (0b / 0o / 0x / _)  variable names  x.bit_count()  x.bit_length()  abs()
// Integers are BigInt, so & | ^ ~ >> on negative numbers behave like Python (infinite two's complement).

export type PyVal = bigint | boolean;

export class PyError extends Error {}

type Tok = { k: 'num'; v: bigint } | { k: 'name'; v: string } | { k: 'op'; v: string } | { k: 'end' };

const OPS = ['**', '//', '<<', '>>', '<=', '>=', '==', '!=', '(', ')', '+', '-', '*', '%', '&', '|', '^', '~', '<', '>', '.', ','];

export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) {
      const m = /^(0[bB][01_]+|0[oO][0-7_]+|0[xX][0-9a-fA-F_]+|[0-9][0-9_]*)/.exec(src.slice(i))!;
      const text = m[0].replace(/_/g, '');
      if (/[.eE]/.test(src[i + m[0].length] ?? '') && !/^0[xX]/.test(text)) throw new PyError('只能用整數，不能用小數');
      if (/^0[0-9]+$/.test(text) && /[1-9]/.test(text)) throw new PyError('Python 的整數不能用 0 開頭（二進位要寫 0b）');
      out.push({ k: 'num', v: BigInt(text) });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i))!;
      out.push({ k: 'name', v: m[0] });
      i += m[0].length;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (!op) {
      if (c === '/') throw new PyError('/ 會得到小數，整數除法用 //');
      if (c === '=') throw new PyError('只要寫算式，不用寫 = 指定');
      throw new PyError(`看不懂的符號：${c}`);
    }
    out.push({ k: 'op', v: op });
    i += op.length;
  }
  out.push({ k: 'end' });
  return out;
}

/** operator tokens used in an answer, e.g. ['>>', '&'] (for "don't use …" rules) */
export function usedOps(src: string): string[] {
  return tokenize(src).flatMap((t) => (t.k === 'op' ? [t.v] : t.k === 'name' && ['and', 'or', 'not'].includes(t.v) ? [t.v] : []));
}

const KEYWORDS = new Set(['and', 'or', 'not', 'True', 'False', 'None', 'if', 'else', 'in', 'is', 'lambda']);

const int = (v: PyVal): bigint => (typeof v === 'boolean' ? (v ? 1n : 0n) : v);
const truthy = (v: PyVal) => (typeof v === 'boolean' ? v : v !== 0n);
const floorDiv = (a: bigint, b: bigint) => {
  if (b === 0n) throw new PyError('ZeroDivisionError：不能除以 0');
  const q = a / b;
  return (a % b !== 0n) && ((a < 0n) !== (b < 0n)) ? q - 1n : q;
};
const pyMod = (a: bigint, b: bigint) => a - floorDiv(a, b) * b;
const LIMIT = 1n << 4096n;
const big = (v: bigint) => {
  if (v > LIMIT || v < -LIMIT) throw new PyError('數字太大了');
  return v;
};

type Node = () => PyVal;
export type Compiled = (vars: Record<string, bigint>) => PyVal;

/** Parses once, then evaluates lazily so `and` / `or` / chained comparisons short-circuit like Python. */
export function compile(src: string, names: string[]): Compiled {
  if (!src.trim()) throw new PyError('還沒有輸入');
  const t = tokenize(src);
  let p = 0;
  const peek = () => t[p];
  const isOp = (v: string) => { const x = t[p]; return x.k === 'op' && x.v === v; };
  const isKw = (v: string) => { const x = t[p]; return x.k === 'name' && x.v === v; };
  const expect = (v: string) => {
    if (!isOp(v)) throw new PyError(`這裡少了 ${v}`);
    p++;
  };
  // & | ^ on two bools stay bool in Python (True & False == False)
  const bitop = (a: PyVal, b: PyVal, f: (x: bigint, y: bigint) => bigint): PyVal =>
    typeof a === 'boolean' && typeof b === 'boolean' ? f(int(a), int(b)) !== 0n : f(int(a), int(b));
  const binLoop = (next: () => Node, ops: string[], f: (op: string, a: PyVal, b: PyVal) => PyVal): Node => {
    let a = next();
    while (peek().k === 'op' && ops.includes((peek() as { v: string }).v)) {
      const op = (t[p++] as { v: string }).v;
      const L = a, R = next();
      a = () => f(op, L(), R());
    }
    return a;
  };

  // lowest → highest
  const orExpr = (): Node => {
    let a = andExpr();
    while (isKw('or')) { p++; const L = a, R = andExpr(); a = () => { const v = L(); return truthy(v) ? v : R(); }; }
    return a;
  };
  const andExpr = (): Node => {
    let a = notExpr();
    while (isKw('and')) { p++; const L = a, R = notExpr(); a = () => { const v = L(); return truthy(v) ? R() : v; }; }
    return a;
  };
  const notExpr = (): Node => {
    if (isKw('not')) { p++; const A = notExpr(); return () => !truthy(A()); }
    return compare();
  };
  const CMP = ['==', '!=', '<', '<=', '>', '>='];
  const compare = (): Node => {
    const first = bor();
    const rest: [string, Node][] = [];
    while (peek().k === 'op' && CMP.includes((peek() as { v: string }).v)) {
      const op = (t[p++] as { v: string }).v;
      rest.push([op, bor()]);
    }
    if (!rest.length) return first;
    return () => {
      let a = int(first());
      for (const [op, R] of rest) {
        const b = int(R());
        const ok = op === '==' ? a === b : op === '!=' ? a !== b : op === '<' ? a < b : op === '<=' ? a <= b : op === '>' ? a > b : a >= b;
        if (!ok) return false;
        a = b;
      }
      return true;
    };
  };
  const bor = (): Node => binLoop(bxor, ['|'], (_, a, b) => bitop(a, b, (x, y) => x | y));
  const bxor = (): Node => binLoop(band, ['^'], (_, a, b) => bitop(a, b, (x, y) => x ^ y));
  const band = (): Node => binLoop(shift, ['&'], (_, a, b) => bitop(a, b, (x, y) => x & y));
  const shift = (): Node => binLoop(arith, ['<<', '>>'], (op, a, b) => {
    const k = int(b);
    if (k < 0n) throw new PyError('ValueError：位移的格數不能是負的');
    if (op === '<<' && k > 4096n) throw new PyError('數字太大了');
    return op === '<<' ? big(int(a) << k) : int(a) >> k;
  });
  const arith = (): Node => binLoop(term, ['+', '-'], (op, a, b) => big(op === '+' ? int(a) + int(b) : int(a) - int(b)));
  const term = (): Node => binLoop(unary, ['*', '//', '%'], (op, a, b) =>
    big(op === '*' ? int(a) * int(b) : op === '//' ? floorDiv(int(a), int(b)) : pyMod(int(a), int(b))));
  const unary = (): Node => {
    if (isOp('-')) { p++; const A = unary(); return () => big(-int(A())); }
    if (isOp('+')) { p++; const A = unary(); return () => int(A()); }
    if (isOp('~')) { p++; const A = unary(); return () => ~int(A()); }
    return power();
  };
  const power = (): Node => {
    const A = postfix();
    if (!isOp('**')) return A;
    p++;
    const B = unary();                     // right side binds unary: -2 ** 2 == -(2 ** 2)
    return () => {
      const a = int(A()), b = int(B());
      if (b < 0n) throw new PyError('負的次方會得到小數');
      if (b > 4096n) throw new PyError('數字太大了');
      return big(a ** b);
    };
  };
  const postfix = (): Node => {
    let a = atom();
    while (isOp('.')) {
      p++;
      const m = peek();
      if (m.k !== 'name') throw new PyError('. 後面要接 method 名稱');
      p++;
      expect('(');
      expect(')');
      if (m.v !== 'bit_count' && m.v !== 'bit_length') throw new PyError(`這裡只能用 .bit_count() 和 .bit_length()，不能用 .${m.v}()`);
      const A = a;
      a = () => {
        const x = int(A());
        const bits = (x < 0n ? -x : x).toString(2).replace(/^0$/, '');
        return BigInt(m.v === 'bit_length' ? bits.length : bits.split('1').length - 1);
      };
    }
    return a;
  };
  const atom = (): Node => {
    const x = peek();
    if (x.k === 'num') { p++; return () => x.v; }
    if (x.k === 'op' && x.v === '(') {
      p++;
      const v = orExpr();
      expect(')');
      return v;
    }
    if (x.k === 'name') {
      p++;
      if (x.v === 'True') return () => true;
      if (x.v === 'False') return () => false;
      if (x.v === 'abs' && isOp('(')) { p++; const A = orExpr(); expect(')'); return () => { const v = int(A()); return v < 0n ? -v : v; }; }
      if (KEYWORDS.has(x.v)) throw new PyError(`這裡不能用 ${x.v}`);
      if (isOp('(')) throw new PyError(`這裡不能呼叫 ${x.v}()`);
      if (!names.includes(x.v)) throw new PyError(`NameError：沒有變數 ${x.v}（可以用的：${names.join('、')}）`);
      return () => env[x.v];
    }
    if (x.k === 'end') throw new PyError('算式還沒寫完');
    throw new PyError(`這裡不能放 ${x.v}`);
  };

  let env: Record<string, bigint> = {};
  const root = orExpr();
  if (peek().k !== 'end') {
    const x = peek();
    throw new PyError(`多了 ${x.k === 'num' ? String(x.v) : (x as { v: string }).v}：一次只寫一個算式`);
  }
  return (vars) => { env = vars; return root(); };
}

export function evaluate(src: string, vars: Record<string, bigint>): PyVal {
  return compile(src, Object.keys(vars))(vars);
}

/** how Python would print it */
export const show = (v: PyVal) => (typeof v === 'boolean' ? (v ? 'True' : 'False') : v.toString());
/** Python ==  (True == 1) */
export const pyEq = (a: PyVal, b: PyVal) => int(a) === int(b);
