"""Operator-level Python tracer for the teaching animations.

Runs a small Python program for real and records ONE STEP PER ACTION:
an operator (+ - * // % == < and not …), an index a[i], a call (len(), print(), q.append() …),
an assignment, an if / while / for decision, a return, a def.

For every step it records
  pre   預告：this action will do …
  post  執行後：what it left behind
  line  the code line (1-based) the action is on
  expr  that line after the action, values substituted; the value just produced is wrapped in ⟦ ⟧
  vars  a JSON snapshot of the watched variables
  ...   kind / ref / stack / out for the drawings

Only the subset of Python the animations use is supported.
"""
import ast, copy, json, math, io, operator, re
from collections import deque

BIN = {ast.Add: '+', ast.Sub: '-', ast.Mult: '*', ast.Div: '/', ast.FloorDiv: '//', ast.Mod: '%', ast.Pow: '**',
       ast.BitAnd: '&', ast.BitOr: '|', ast.BitXor: '^', ast.LShift: '<<', ast.RShift: '>>'}
BINF = {'+': operator.add, '-': operator.sub, '*': operator.mul, '/': operator.truediv, '//': operator.floordiv,
        '%': operator.mod, '**': operator.pow, '&': operator.and_, '|': operator.or_, '^': operator.xor,
        '<<': operator.lshift, '>>': operator.rshift}
CMP = {ast.Lt: '<', ast.LtE: '<=', ast.Gt: '>', ast.GtE: '>=', ast.Eq: '==', ast.NotEq: '!=',
       ast.In: 'in', ast.NotIn: 'not in', ast.Is: 'is', ast.IsNot: 'is not'}
CMPF = {'<': operator.lt, '<=': operator.le, '>': operator.gt, '>=': operator.ge, '==': operator.eq, '!=': operator.ne,
        'in': lambda a, b: a in b, 'not in': lambda a, b: a not in b, 'is': operator.is_, 'is not': operator.is_not}
OPNAME = {'+': '加', '-': '減', '*': '乘', '/': '除', '//': '整數除法', '%': '取餘數', '**': '次方',
          '&': 'AND', '|': 'OR', '^': 'XOR', '<<': '左移', '>>': '右移'}
CALLDESC = {
    'len': '算長度', 'range': '做出 range 物件（只記 start / stop / step）', 'print': '印到螢幕', 'min': '取最小', 'max': '取最大',
    'abs': '取絕對值', 'sum': '加總', 'bin': '轉成二進位字串', 'int': '轉成 int', 'str': '轉成字串', 'sorted': '排序成新的 list',
    'list': '做出 list', 'set': '做出 set', 'divmod': '同時算商和餘數', 'deque': '做出 deque', 'reversed': '反過來走',
    'append': '放到最後', 'appendleft': '放到最前面', 'pop': '拿出最後一個', 'popleft': '從前面拿出一個', 'add': '加進 set',
    'remove': '移除', 'discard': '移除', 'heappush': '放進 heap（往上換到對的位置）', 'heappop': '拿出最小的（最後一個補到頂端再往下換）',
    'index': '找位置', 'count': '數有幾個', 'copy': '複製', 'sort': '原地排序', 'extend': '接在後面',
}

SID = 0


class Return(Exception):
    def __init__(self, v): self.v = v
class Break(Exception): pass
class Continue(Exception): pass


def jv(x, depth=0):
    """value → JSON-friendly"""
    if isinstance(x, bool) or x is None or isinstance(x, str): return x
    if isinstance(x, int): return x
    if isinstance(x, float):
        if math.isinf(x): return '∞' if x > 0 else '-∞'
        return round(x, 6)
    if isinstance(x, (list, tuple, deque)): return [jv(v, depth + 1) for v in x]
    if isinstance(x, (set, frozenset)): return sorted((jv(v, depth + 1) for v in x), key=lambda v: (str(type(v)), v))
    if isinstance(x, dict): return {str(k): jv(v, depth + 1) for k, v in x.items()}
    if isinstance(x, range): return f'range({x.start}, {x.stop}' + (f', {x.step})' if x.step != 1 else ')')
    if callable(x): return f'<{getattr(x, "__name__", "function")}>'
    return repr(x)


def rp(x):
    """short repr for text"""
    if isinstance(x, float) and math.isinf(x): return 'inf' if x > 0 else '-inf'
    if isinstance(x, deque): return 'deque(' + repr(list(x)) + ')'
    if isinstance(x, range): return jv(x)
    if isinstance(x, UserFn): return f'<函式 {x.name}>'
    r = repr(x)
    return r if len(r) <= 60 else r[:57] + '…'


class UserFn:
    def __init__(self, node): self.node, self.name = node, node.name


class Tracer:
    def __init__(self, src, env=None, watch=None, notes=None, intro='程式還沒開始跑', max_steps=400):
        self.src = src.strip('\n')
        self.lines = self.src.split('\n')
        self.tree = ast.parse(self.src)
        self.g = dict(env or {})
        self.g.setdefault('deque', deque)
        self.watch = watch            # names to snapshot (None = every simple variable)
        self.notes = notes or {}      # {line: text} → first time only; {line: (text, True)} → every time
        self.noted = set()
        self.calldesc = {}
        self.frames = []              # call frames: {fn, locals, line, stmt, header}
        self.steps = []
        self.out = []
        self.max_steps = max_steps
        self.vals = {}                # marker → repr
        self.cur_sid = None
        self.steps.append(dict(pre='還沒開始執行', post=intro, line=1, expr=None, kind='start', vars={}, stack=[], out=[]))

    # ───────── display ─────────
    def mark(self, node, value):
        """replace an evaluated node by a marker standing for its value"""
        global SID
        SID += 1
        m = f'⁣{SID}⁣'
        self.vals[m] = rp(value)
        node.__class__ = ast.Name
        node.id = m
        node.ctx = ast.Load()
        self.cur_sid = m
        return value

    def render(self, text, plain=False):
        def sub(mo):
            m = mo.group(0)
            v = self.vals.get(m, '?')
            return v if plain or m != self.cur_sid else f'⟦{v}⟧'
        return re.sub('⁣\\d+⁣', sub, text)

    def header(self, fr):
        st = fr['stmt']
        if st is None: return None
        line_src = self.lines[st.lineno - 1].strip()
        if isinstance(st, ast.If):
            kw = 'elif' if line_src.startswith('elif') else 'if'
            return f'{kw} {ast.unparse(st.test)}:'
        if isinstance(st, ast.While): return f'while {ast.unparse(st.test)}:'
        if isinstance(st, ast.For): return f'for {ast.unparse(st.target)} in {ast.unparse(st.iter)}:'
        if isinstance(st, (ast.FunctionDef,)): return line_src
        if isinstance(st, ast.Return): return 'return' + ('' if st.value is None else ' ' + ast.unparse(st.value))
        return ast.unparse(st)

    def expr_now(self, plain=False):
        fr = self.frames[-1] if self.frames else self.top
        h = self.header(fr)
        return None if h is None else self.render(h, plain)

    # ───────── snapshot ─────────
    def snapshot(self):
        names = {}
        for k, v in self.g.items():
            if k.startswith('_') or isinstance(v, (type,)) or (callable(v) and not isinstance(v, UserFn)) or type(v).__name__ == 'module': continue
            if isinstance(v, UserFn): continue
            if self.watch is None or k in self.watch: names[k] = jv(v)
        if self.frames:
            for k, v in self.frames[-1]['locals'].items():
                if isinstance(v, UserFn) or callable(v): continue
                if self.watch is None or k in self.watch: names[k] = jv(v)
        stack = [dict(fn=f['fn'], args={k: rp(v) for k, v in f['args'].items()}, line=f['line']) for f in self.frames]
        return names, stack

    def emit(self, pre, post, kind, line=None, **extra):
        fr = self.frames[-1] if self.frames else self.top
        line = line or fr['line']
        if kind in ('assign', 'if', 'while', 'return', 'stmt', 'for', 'break', 'continue', 'def', 'call_user') and line in self.notes:
            note = self.notes[line]
            every = isinstance(note, tuple)
            if every or line not in self.noted:
                post = post + '。' + (note[0] if every else note)
                self.noted.add(line)
        expr = self.expr_now()
        vars_, stack = self.snapshot()
        self.steps.append(dict(pre=pre, post=post, line=line, expr=expr, kind=kind, vars=vars_, stack=stack, out=list(self.out), **extra))
        self.cur_sid = None
        if len(self.steps) > self.max_steps: raise RuntimeError('too many steps')

    def after(self):
        """「算式變成 …」 for the post text"""
        e = self.expr_now(plain=True)
        return f'算式變成 {e}' if e else ''

    # ───────── names ─────────
    def lookup(self, name):
        if self.frames and name in self.frames[-1]['locals']: return self.frames[-1]['locals'][name]
        if name in self.g: return self.g[name]
        import builtins
        return getattr(builtins, name)

    def store(self, name, v):
        if self.frames: self.frames[-1]['locals'][name] = v
        else: self.g[name] = v

    def src_of(self, node):
        return self.render(ast.unparse(node), plain=True)

    # ───────── expressions ─────────
    def ev(self, n):
        if isinstance(n, ast.Constant): return n.value
        if isinstance(n, ast.Name):
            if n.id in self.vals: raise RuntimeError('re-evaluating a marker')
            return self.lookup(n.id)
        if isinstance(n, ast.UnaryOp):
            if isinstance(n.op, ast.USub) and isinstance(n.operand, ast.Constant): return -n.operand.value
            v = self.ev(n.operand)
            if isinstance(n.op, ast.Not):
                r = not v
                self.mark(n, r); self.emit(f'not {rp(v)}', f'得到 {rp(r)}。{self.after()}', 'unary')
                return r
            if isinstance(n.op, ast.USub):
                r = -v
                self.mark(n, r); self.emit(f'-{rp(v)}', f'得到 {rp(r)}。{self.after()}', 'unary')
                return r
            raise NotImplementedError(ast.dump(n))
        if isinstance(n, ast.BinOp):
            src = self.src_of(n)
            a = self.ev(n.left); b = self.ev(n.right)
            op = BIN[type(n.op)]
            r = BINF[op](a, b)
            lit = f'{rp(a)} {op} {rp(b)}'
            pre = f'{src}：{lit}' if src != lit else lit
            if op in ('//', '%', '&', '|', '^', '<<', '>>', '**'): pre += f'（{OPNAME[op]}）'
            self.mark(n, r)
            self.emit(pre, f'得到 {rp(r)}。{self.after()}', 'binop', op=op)
            return r
        if isinstance(n, ast.Compare):
            assert len(n.ops) == 1, 'chained compare not supported'
            src = self.src_of(n)
            a = self.ev(n.left); b = self.ev(n.comparators[0])
            op = CMP[type(n.ops[0])]
            r = CMPF[op](a, b)
            lit = f'{rp(a)} {op} {rp(b)}'
            pre = f'{src}：{lit}' if src != lit else lit
            self.mark(n, r)
            self.emit(pre, f'是 {rp(r)}。{self.after()}', 'compare', op=op)
            return r
        if isinstance(n, ast.BoolOp):
            kw = 'and' if isinstance(n.op, ast.And) else 'or'
            v = None
            for i, x in enumerate(n.values):
                v = self.ev(x)
                last = i == len(n.values) - 1
                if (kw == 'and' and not v) or (kw == 'or' and v) or last:
                    break
            if (kw == 'and' and not v and not last) or (kw == 'or' and v and not last):
                why = f'{kw}：左邊已經是 {rp(v)} → 整個就是 {rp(v)}（右邊不用算）'
            else:
                why = f'{kw}：結果是最後算的 {rp(v)}'
            self.mark(n, v); self.emit(why, self.after() or f'得到 {rp(v)}', 'boolop')
            return v
        if isinstance(n, ast.Subscript):
            obj_src = self.src_of(n.value)
            obj = self.ev(n.value)
            if isinstance(n.slice, ast.Slice):
                lo = self.ev(n.slice.lower) if n.slice.lower else None
                hi = self.ev(n.slice.upper) if n.slice.upper else None
                r = obj[lo:hi]
                self.mark(n, r)
                self.emit(f'{obj_src}[{"" if lo is None else lo}:{"" if hi is None else hi}]：切片，複製出一段', f'得到 {rp(r)}。{self.after()}', 'subscript', ref=[obj_src, f'{lo}:{hi}'])
                return r
            i = self.ev(n.slice)
            r = obj[i]
            what = f'查 key {rp(i)}' if isinstance(obj, dict) else f'拿 index {rp(i)} 的值'
            path = self.path_of(n.value) + [jv(i)]
            n._path = path
            self.mark(n, r)
            self.emit(f'{obj_src}[{rp(i)}]：{what}', f'是 {rp(r)}。{self.after()}', 'subscript', ref=path)
            return r
        if isinstance(n, ast.Attribute):
            return getattr(self.ev(n.value), n.attr)
        if isinstance(n, (ast.Tuple, ast.List)):
            vals = [self.ev(e) for e in n.elts]
            return tuple(vals) if isinstance(n, ast.Tuple) else list(vals)
        if isinstance(n, ast.Set):
            return {self.ev(e) for e in n.elts}
        if isinstance(n, ast.Dict):
            return {self.ev(k): self.ev(v) for k, v in zip(n.keys, n.values)}
        if isinstance(n, ast.Call):
            return self.call(n)
        if isinstance(n, ast.IfExp):
            c = self.ev(n.test)
            v = self.ev(n.body if c else n.orelse)
            self.mark(n, v); self.emit(f'{"if 成立" if c else "if 不成立"} → 取 {rp(v)}', self.after(), 'ifexp')
            return v
        raise NotImplementedError(ast.dump(n))

    def call(self, n):
        f = n.func
        bound_name = None
        if isinstance(f, ast.Attribute):
            obj_src = self.src_of(f.value)
            obj = self.ev(f.value)
            fn = getattr(obj, f.attr)
            fname = f.attr
            bound_name = obj_src if type(obj).__name__ != 'module' else None
            shown = f'{obj_src}.{f.attr}'
        else:
            fn = self.ev(f)
            fname = f.id if isinstance(f, ast.Name) else '?'
            shown = fname
        args = [self.ev(a) for a in n.args]
        kwargs = {k.arg: self.ev(k.value) for k in n.keywords}
        arg_txt = ', '.join([rp(a) for a in args] + [f'{k}={rp(v)}' for k, v in kwargs.items()])
        if isinstance(fn, UserFn):
            return self.call_user(n, fn, args, arg_txt)
        # snapshot containers that might change
        before, _ = self.snapshot()
        if fname == 'print':
            buf = io.StringIO(); print(*args, **kwargs, file=buf)
            self.out.extend(buf.getvalue().rstrip('\n').split('\n'))
            r = None
        else:
            r = fn(*args, **kwargs)
        after, _ = self.snapshot()
        changed = [k for k in after if before.get(k) != after.get(k)]
        desc = self.calldesc.get(fname) or CALLDESC.get(fname, '呼叫')
        pre = f'{self.src_of(n)}：{desc}'
        parts = []
        if r is not None: parts.append(f'回傳 {rp(r)}')
        for k in changed: parts.append(f'{k} 變成 {rp(self.lookup(k)) if k in after else after[k]}')
        if fname == 'print': parts.append('螢幕多一行：' + ' '.join(str(a) for a in args))
        if r is not None:
            self.mark(n, r)
        self.emit(pre, '；'.join(parts) or '完成', 'call', fn=fname, target=bound_name, changed=changed)
        return r

    def call_user(self, n, fn, args, arg_txt):
        node = fn.node
        params = [a.arg for a in node.args.args]
        loc = dict(zip(params, args))
        self.emit(f'呼叫 {fn.name}({arg_txt})', '進入 ' + fn.name + '：' + ('、'.join(f'{p} → {rp(v)}' for p, v in loc.items()) or '沒有參數') + '，stack 多一層', 'call_user', fn=fn.name)
        self.frames.append(dict(fn=fn.name, locals=loc, args=dict(loc), line=node.body[0].lineno, stmt=None))
        try:
            self.block(node.body)
            v = None
            self.frames[-1]['stmt'] = None
            self.emit(f'{fn.name} 跑到最後：回傳 None', f'{fn.name} 結束，stack 少一層', 'end', line=node.body[-1].end_lineno)
        except Return as R:
            v = R.v
        self.frames.pop()
        self.mark(n, v)
        return v

    # ───────── statements ─────────
    def block(self, body):
        for st in body: self.stmt(st)

    def begin(self, st):
        fr = self.frames[-1] if self.frames else self.top
        fr['stmt'] = copy.deepcopy(st)
        fr['line'] = st.lineno
        return fr['stmt']

    def path_of(self, node):
        """['dp', 1] for the container a subscript reads from"""
        if hasattr(node, '_path'): return list(node._path)
        if isinstance(node, ast.Name) and node.id not in self.vals: return [node.id]
        return ['?']

    def truth(self, test_node, c):
        """'pq 不是空的' instead of '[(0, 0)]' when the condition is a bare name"""
        if isinstance(test_node, ast.Name) and test_node.id not in self.vals:
            v = self.lookup(test_node.id)
            if isinstance(v, (list, deque, dict, set, str)): return f'{test_node.id} {"不是空的" if v else "是空的"}'
            if isinstance(v, (int, float)) and not isinstance(v, bool): return f'{test_node.id} = {rp(v)}，{"不是 0" if v else "是 0"}'
        return rp(c)

    def assign_target(self, t, v, src_v):
        if isinstance(t, ast.Name):
            self.store(t.id, v)
            return f'{t.id} =：名稱 {t.id} 指向 {rp(v)}', f'{t.id} → {rp(v)}', dict(var=t.id)
        if isinstance(t, ast.Subscript):
            obj_src = self.src_of(t.value)
            # the container of a store target (dp[i] in dp[i][c] = …) is looked up silently
            scope = dict(self.g); scope.update(self.frames[-1]['locals'] if self.frames else {})
            obj = eval(compile(ast.Expression(copy.deepcopy(t.value)), '<t>', 'eval'), scope)
            if isinstance(t.value, ast.Subscript):
                inner = copy.deepcopy(t.value)
                t.value._path = self.path_of(inner.value) + [jv(eval(compile(ast.Expression(inner.slice), '<t>', 'eval'), scope))]
            i = self.ev(t.slice)
            old = obj[i] if (isinstance(obj, dict) and i in obj) or (not isinstance(obj, dict)) else None
            path = self.path_of(t.value) + [jv(i)]
            obj[i] = v
            return (f'{obj_src}[{rp(i)}] =：{obj_src}[{rp(i)}] 從 {rp(old)} 改成 {rp(v)}' if old is not None else f'{obj_src}[{rp(i)}] =：新增 key {rp(i)} → {rp(v)}',
                    f'{obj_src} 變成 {rp(obj)}', dict(ref=path, var=path[0]))
        if isinstance(t, ast.Tuple):
            names = []
            for e, x in zip(t.elts, v):
                self.assign_target(e, x, None); names.append(ast.unparse(e))
            return (f'{", ".join(names)} =：同時指向 {", ".join(rp(x) for x in v)}',
                    '、'.join(f'{a} → {rp(x)}' for a, x in zip(names, v)), dict(var=names[0]))
        raise NotImplementedError(ast.dump(t))

    def stmt(self, st):
        if isinstance(st, ast.FunctionDef):
            self.begin(st)
            self.store(st.name, UserFn(st))
            self.emit(f'def {st.name}：名稱 {st.name} 指向函式', '函式內容還沒執行', 'def')
            return
        if isinstance(st, ast.Assign):
            w = self.begin(st)
            v = self.ev(w.value)
            pre, post, ex = self.assign_target(w.targets[0], v, None)
            self.emit(pre, post, 'assign', **ex)
            return
        if isinstance(st, ast.AugAssign):
            w = self.begin(st)
            op = BIN[type(w.op)]
            t = w.target
            cur = self.lookup(t.id) if isinstance(t, ast.Name) else None
            if isinstance(t, ast.Subscript):
                obj = self.ev(copy.deepcopy(t.value)); i = self.ev(copy.deepcopy(t.slice)); cur = obj[i]
            rhs = self.ev(w.value)
            r = BINF[op](cur, rhs)
            tsrc = ast.unparse(t)
            # show the new value on the line: target op= value → value
            self.vals_tmp = None
            fr = self.frames[-1] if self.frames else self.top
            fake = ast.parse(f'{tsrc} = 0').body[0]
            fake.value = ast.Constant(0)
            fr['stmt'] = fake
            self.mark(fake.value, r)
            self.emit(f'{tsrc} {op} {rp(rhs)}：{rp(cur)} {op} {rp(rhs)}（{tsrc} {op}= 就是 {tsrc} = {tsrc} {op} …）', f'得到 {rp(r)}。{self.after()}', 'binop', op=op)
            pre, post, ex = self.assign_target(fake.targets[0], r, None)
            self.emit(pre, post, 'assign', **ex)
            return
        if isinstance(st, ast.Expr):
            w = self.begin(st)
            n_before = len(self.steps)
            self.ev(w.value)
            # a call statement (q.append(v) …): the note goes on its own step
            note = self.notes.get(st.lineno)
            last = self.steps[-1]
            if note and len(self.steps) > n_before and last['line'] == st.lineno and last['kind'] == 'call':
                every = isinstance(note, tuple)
                if every or st.lineno not in self.noted:
                    last['post'] += '。' + (note[0] if every else note)
                    self.noted.add(st.lineno)
            return
        if isinstance(st, ast.Return):
            w = self.begin(st)
            v = None if w.value is None else self.ev(w.value)
            fn = self.frames[-1]['fn'] if self.frames else '?'
            back = (self.frames[-2] if len(self.frames) > 1 else self.top)['line']
            self.emit(f'return {rp(v)}：{fn} 結束，把 {rp(v)} 交回去', f'{fn} 回傳 {rp(v)}，stack 少一層' + (f'，回到第 {back} 行' if back else ''), 'return')
            raise Return(v)
        if isinstance(st, ast.If):
            w = self.begin(st)
            c = self.ev(w.test)
            tc = self.truth(w.test, c)
            kw = 'elif' if self.lines[st.lineno - 1].strip().startswith('elif') else 'if'
            if c:
                self.emit(f'{kw} {tc}：條件成立 → 進入', f'往下執行第 {st.body[0].lineno} 行', 'if', taken=True)
                self.block(st.body)
            else:
                if st.orelse:
                    nxt = st.orelse[0].lineno
                    self.emit(f'{kw} {tc}：條件不成立 → 跳過', f'跳到第 {nxt} 行' + ('（elif）' if isinstance(st.orelse[0], ast.If) and self.lines[nxt - 1].strip().startswith('elif') else '（else）'), 'if', taken=False)
                    self.block(st.orelse)
                else:
                    self.emit(f'{kw} {tc}：條件不成立 → 跳過', '跳過這個 if 區塊', 'if', taken=False)
            return
        if isinstance(st, ast.While):
            while True:
                w = self.begin(st)
                c = self.ev(w.test)
                tw = self.truth(w.test, c)
                if not c:
                    self.emit(f'while {tw}：條件不成立 → 離開迴圈', '跳到迴圈後面', 'while', taken=False)
                    return
                self.emit(f'while {tw}：條件成立 → 進入迴圈', f'往下執行第 {st.body[0].lineno} 行', 'while', taken=True)
                try:
                    self.block(st.body)
                except Break:
                    return
                except Continue:
                    pass
        if isinstance(st, ast.For):
            w = self.begin(st)
            it_src = self.src_of(st.iter)
            it_val = self.ev(w.iter)
            it = iter(list(it_val) if isinstance(it_val, (list, deque)) else it_val)
            while True:
                fr = self.frames[-1] if self.frames else self.top
                fr['line'] = st.lineno
                try:
                    x = next(it)
                except StopIteration:
                    fr['stmt'] = copy.deepcopy(st); fr['stmt'].iter = w.iter
                    self.emit(f'for：{it_src} 沒有下一個了 → 離開迴圈', '跳到迴圈後面', 'for', taken=False)
                    return
                fr['stmt'] = copy.deepcopy(st); fr['stmt'].iter = w.iter
                pre_, post_, ex = self.assign_target(st.target, x, None)
                tname = ast.unparse(st.target)
                self.emit(f'for：從 {it_src} 拿下一個 → {tname} = {rp(x)}', post_, 'for', taken=True, **ex)
                try:
                    self.block(st.body)
                except Break:
                    return
                except Continue:
                    pass
        if isinstance(st, ast.Break):
            self.begin(st); self.emit('break：跳出迴圈', '跳到迴圈後面', 'break'); raise Break()
        if isinstance(st, ast.Continue):
            self.begin(st); self.emit('continue：跳回迴圈開頭', '剩下的這一輪不做了', 'continue'); raise Continue()
        if isinstance(st, ast.Pass):
            return
        raise NotImplementedError(ast.dump(st))

    def run(self):
        self.top = dict(fn='<main>', locals=None, line=1, stmt=None)
        try:
            self.block(self.tree.body)
        except Return:
            pass
        return self.steps

    def dump(self):
        return dict(code=self.lines, steps=self.steps)
