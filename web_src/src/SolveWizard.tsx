import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Database, Target, Sparkles, RotateCcw, Check, AlertTriangle, ArrowRight, Network } from 'lucide-react';
import { algoNodes, algoEdges, wizardGroups, algoRules, customStructures, WizardGroup, AlgoRule } from './algoTreeData';

// 解題流程：1 真的需要優化嗎 → 2 了解資料 ＋ 3 問題要什麼（兩者分開選，可並列）→ 4 找到演算法

const nodeById = new Map(algoNodes.map(n => [n.id, n]));
const optionLabel = new Map<string, string>();
const optionGroup = new Map<string, WizardGroup>();
wizardGroups.forEach(g => g.options.forEach(o => { optionLabel.set(o.id, o.label); optionGroup.set(o.id, g); }));
const gainsOf = (algoId: string) =>
  algoEdges.filter(e => e.from === algoId && e.kind === 'gain').map(e => ({ gain: nodeById.get(e.to)!, reason: e.reason }));

const CATEGORY_DOT: Record<string, string> = {
  '搜尋': 'bg-cyan-400', '排序': 'bg-sky-400', '陣列': 'bg-teal-400', '區間查詢': 'bg-indigo-400',
  '遞迴': 'bg-violet-400', '動態規劃': 'bg-purple-400', '最佳化': 'bg-fuchsia-400', '圖論': 'bg-emerald-400',
  '最短路徑': 'bg-lime-400', '最小生成樹': 'bg-green-400', '字串': 'bg-rose-400', '數學': 'bg-pink-400', '資料結構': 'bg-orange-400',
};

// ── Step 1: brute-force estimate ──
const COMPLEXITIES: { id: string; label: string; f: (n: number) => number }[] = [
  { id: 'n', label: 'O(n)', f: n => n },
  { id: 'nlogn', label: 'O(n log n)', f: n => n * Math.max(1, Math.log2(n)) },
  { id: 'n2', label: 'O(n²)', f: n => n * n },
  { id: 'n3', label: 'O(n³)', f: n => n * n * n },
  { id: '2n', label: 'O(2ⁿ)', f: n => (n > 1000 ? Infinity : Math.pow(2, n)) },
  { id: 'nfact', label: 'O(n!)', f: n => { let r = 1; for (let i = 2; i <= n; i++) { r *= i; if (r > 1e300) return Infinity; } return r; } },
];
const LANGS = [
  { id: 'py', label: 'Python', speed: 1e7, hint: '約 10⁷ 次簡單運算／秒' },
  { id: 'cpp', label: 'C / C++', speed: 1e8, hint: '約 10⁸ 次簡單運算／秒' },
];
const TARGETS = [
  { label: 'O(n log n)', f: (n: number) => n * Math.max(1, Math.log2(n)) },
  { label: 'O(n)', f: (n: number) => n },
  { label: 'O(log n) 或 O(1)', f: (n: number) => Math.max(1, Math.log2(n)) },
];

function fmt(x: number) {
  if (!isFinite(x)) return '∞';
  if (x < 1000) return x.toFixed(x < 10 ? 2 : 0);
  const e = Math.floor(Math.log10(x));
  return `${(x / Math.pow(10, e)).toFixed(1)} × 10${String(e).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('')}`;
}
function fmtTime(sec: number) {
  if (!isFinite(sec)) return '比宇宙年齡還久';
  if (sec < 1e-3) return '< 1 毫秒';
  if (sec < 1) return `${(sec * 1000).toFixed(0)} 毫秒`;
  if (sec < 120) return `${sec.toFixed(1)} 秒`;
  if (sec < 7200) return `${(sec / 60).toFixed(0)} 分鐘`;
  if (sec < 172800) return `${(sec / 3600).toFixed(0)} 小時`;
  if (sec < 3.15e7 * 2) return `${(sec / 86400).toFixed(0)} 天`;
  return `${fmt(sec / 3.15e7)} 年`;
}

// ── Matching ──
interface Match { rule: AlgoRule; score: number; matched: string[]; bonus: string[]; missing: string[]; }

function evaluate(selected: Set<string>) {
  const full: Match[] = [];
  const partial: Match[] = [];
  for (const rule of algoRules) {
    if (!rule.all.length && !rule.any.length) continue; // baseline (brute force) is shown separately
    const matched = rule.all.filter(o => selected.has(o));
    const anyHit = rule.any.filter(o => selected.has(o));
    const conflicts = rule.none.filter(o => selected.has(o));
    const missing = rule.all.filter(o => !selected.has(o));
    if (rule.any.length && !anyHit.length) missing.push(rule.any.map(o => optionLabel.get(o)).join(' 或 '));
    const bonus = rule.bonus.filter(o => selected.has(o));
    const m: Match = { rule, score: matched.length + anyHit.length + bonus.length * 0.5, matched: [...matched, ...anyHit], bonus, missing };
    if (conflicts.length) continue;
    // a missing option from a single-choice group where something else is already picked
    // (e.g. a different output) is a real mismatch, not "one step away"
    const contradicted = rule.all.some(o => {
      const g = optionGroup.get(o)!;
      return !selected.has(o) && g.type === 'single' && g.options.some(x => selected.has(x.id));
    });
    if (contradicted) continue;
    if (!missing.length) full.push(m);
    else if (missing.length === 1 && matched.length + anyHit.length >= 1 && rule.all.length + (rule.any.length ? 1 : 0) >= 2) partial.push(m);
  }
  full.sort((a, b) => b.score - a.score);
  partial.sort((a, b) => b.score - a.score);
  return { full, partial };
}

// ── UI pieces ──
function StepCard({ n, icon: Icon, title, subtitle, children, tone = 'slate' }: {
  n: number; icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string; children: React.ReactNode;
  tone?: 'slate' | 'emerald';
}) {
  return (
    <section className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm
      ${tone === 'emerald' ? 'border-emerald-300 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-headline font-bold">
          {n}
        </div>
        <div className="min-w-0">
          <h2 className="font-headline font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-emerald-500" /> {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function OptionGroup({ group, selected, onToggle }: { key?: string; group: WizardGroup; selected: Set<string>; onToggle: (g: WizardGroup, id: string) => void }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{group.title}</h3>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md
          ${group.type === 'multi'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
            : 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'}`}>
          {group.type === 'multi' ? '多選' : '單選'}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {group.options.map(o => {
          const on = selected.has(o.id);
          return (
            <button
              key={o.id}
              onClick={() => onToggle(group, o.id)}
              title={o.desc}
              aria-pressed={on}
              className={`group text-left px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5
                ${on
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-400'}`}
            >
              {group.type === 'multi'
                ? <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${on ? 'bg-white border-white' : 'border-slate-400'}`}>{on && <Check className="w-3 h-3 text-emerald-600" />}</span>
                : <span className={`w-3.5 h-3.5 rounded-full border-2 ${on ? 'border-white bg-white/40' : 'border-slate-400'}`} />}
              {o.label}
            </button>
          );
        })}
      </div>
      {/* description of selected options */}
      {group.options.filter(o => selected.has(o.id)).map(o => (
        <p key={o.id} className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">· {o.label}：{o.desc}</p>
      ))}
    </div>
  );
}

function Chip({ children, tone }: { key?: string; children: React.ReactNode; tone: 'ok' | 'bonus' | 'miss' }) {
  const cls = {
    ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    bonus: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
    miss: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  }[tone];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${cls}`}>{children}</span>;
}

function ResultCard({ m, kind, onOpenInTree }: { key?: string; m: Match; kind: 'full' | 'partial'; onOpenInTree: (id: string) => void }) {
  const algo = nodeById.get(m.rule.algo)!;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-xl border p-3 sm:p-4 ${kind === 'full'
        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${CATEGORY_DOT[algo.category] ?? 'bg-slate-400'}`} />
            <span className="font-headline font-bold text-slate-900 dark:text-white">{algo.labelZh}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{algo.label} · <span className="font-mono">{algo.time}</span> · 空間 <span className="font-mono">{algo.space}</span></div>
        </div>
        <button onClick={() => onOpenInTree(algo.id)} title="在判斷樹中查看"
          className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline">
          <Network className="w-3.5 h-3.5" /> 判斷樹
        </button>
      </div>
      {algo.customDs?.length > 0 && (
        <button onClick={() => onOpenInTree(algo.id)} title="在判斷樹中看模板程式碼"
          className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-700 hover:underline">
          🔧 需要自己寫：{algo.customDs.map(id => customStructures.find(c => c.id === id)?.name.split(' (')[0]).join('、')}
        </button>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {m.matched.map(o => <Chip key={o} tone="ok"><Check className="w-3 h-3" />{optionLabel.get(o)}</Chip>)}
        {m.bonus.map(o => <Chip key={o} tone="bonus">+ {optionLabel.get(o)}</Chip>)}
        {kind === 'partial' && m.missing.map(x => <Chip key={x} tone="miss">還差：{optionLabel.get(x) ?? x}</Chip>)}
      </div>
      {kind === 'full' && gainsOf(algo.id).map(g => (
        <p key={g.gain.id} className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold text-yellow-700 dark:text-yellow-300">得到：{g.gain.labelZh}</span>　{g.reason}
        </p>
      ))}
      {m.rule.note && kind === 'full' && (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-1.5 flex gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {m.rule.note}
        </p>
      )}
    </motion.div>
  );
}

// ── Main ──
export function SolveWizard({ onOpenInTree }: { onOpenInTree: (id: string) => void }) {
  const [n, setN] = useState(100000);
  const [cx, setCx] = useState('n2');
  const [lang, setLang] = useState('py');
  const [limit, setLimit] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const speed = LANGS.find(l => l.id === lang)!.speed;
  const ops = COMPLEXITIES.find(c => c.id === cx)!.f(Math.max(1, n));
  const seconds = ops / speed;
  const passes = seconds <= limit;
  const target = TARGETS.find(t => t.f(Math.max(1, n)) / speed <= limit) ?? TARGETS[TARGETS.length - 1];

  const toggle = (g: WizardGroup, id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else {
      if (g.type === 'single') g.options.forEach(o => next.delete(o.id));
      next.add(id);
    }
    return next;
  });

  const { full, partial } = useMemo(() => evaluate(selected), [selected]);
  const brute = algoRules.find(r => !r.all.length && !r.any.length);
  const step2 = wizardGroups.filter(g => g.step === 2);
  const step3 = wizardGroups.filter(g => g.step === 3);
  const picked2 = step2.some(g => g.options.some(o => selected.has(o.id)));
  const picked3 = step3.some(g => g.options.some(o => selected.has(o.id)));

  const inputCls = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">拆解問題：四個步驟</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">先確定要不要優化，再分別看「資料」和「問題要什麼」，最後兩邊一起決定演算法。</p>
          </div>
          <button onClick={() => setSelected(new Set())}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <RotateCcw className="w-4 h-4" /> 重新選擇
          </button>
        </div>

        {/* Step 1 */}
        <StepCard n={1} icon={Calculator} title="真的需要優化嗎？" subtitle="先算算看：暴力解能不能在時間內跑完。">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
              <span>資料量 n</span>
              <input type="number" min={1} value={n} onChange={e => setN(Math.max(1, Number(e.target.value) || 1))} className={inputCls} />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
              <span>暴力解的複雜度</span>
              <select value={cx} onChange={e => setCx(e.target.value)} className={inputCls}>
                {COMPLEXITIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
              <span>語言</span>
              <select value={lang} onChange={e => setLang(e.target.value)} className={inputCls}>
                {LANGS.map(l => <option key={l.id} value={l.id}>{l.label}（{l.hint}）</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
              <span>時間限制（秒）</span>
              <input type="number" min={0.1} step={0.5} value={limit} onChange={e => setLimit(Math.max(0.1, Number(e.target.value) || 1))} className={inputCls} />
            </label>
          </div>
          <div className={`mt-4 rounded-xl p-3 sm:p-4 border ${passes
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'}`}>
            <div className="text-sm text-slate-700 dark:text-slate-200">
              約 <span className="font-mono font-bold">{fmt(ops)}</span> 次運算 → 預估 <span className="font-bold">{fmtTime(seconds)}</span>
            </div>
            <div className={`mt-1 font-bold ${passes ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
              {passes
                ? '✓ 暴力解就能通過 → 不需要優化，寫出正確的暴力解就完成了。'
                : `✗ 太慢了，需要優化。目標：至少 ${target.label}。往下看第 2、3 步。`}
            </div>
          </div>
        </StepCard>

        {/* Steps 2 & 3 side by side: two different things, chosen separately */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 items-start">
          <StepCard n={2} icon={Database} title="了解資料" subtitle="資料長什麼樣子、怎麼存取、有什麼特性。">
            {step2.map(g => <OptionGroup key={g.id} group={g} selected={selected} onToggle={toggle} />)}
          </StepCard>
          <StepCard n={3} icon={Target} title="問題要什麼" subtitle="要輸出什麼、查幾次、答案要不要存全部、問題的結構。">
            {step3.map(g => <OptionGroup key={g.id} group={g} selected={selected} onToggle={toggle} />)}
          </StepCard>
        </div>

        {/* Step 4 */}
        <StepCard n={4} icon={Sparkles} title="根據資料與問題，找到演算法" subtitle="同時考慮第 2 步和第 3 步的選擇。" tone="emerald">
          {!picked2 || !picked3 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4" />
              {!picked2 && !picked3 ? '請先在第 2 步和第 3 步做選擇。' : !picked2 ? '還需要第 2 步（了解資料）的選擇。' : '還需要第 3 步（問題要什麼）的選擇。'}
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2">完全符合 · {full.length}</h3>
                {full.length === 0
                  ? <p className="text-sm text-slate-500 dark:text-slate-400">目前沒有完全符合的演算法。看看下面「還差一個條件」的選項，或調整選擇。</p>
                  : <div className="grid md:grid-cols-2 gap-3"><AnimatePresence>{full.map(m => <ResultCard key={m.rule.algo} m={m} kind="full" onOpenInTree={onOpenInTree} />)}</AnimatePresence></div>}
              </div>
              {partial.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-2">還差一個條件 · {partial.length}</h3>
                  <div className="grid md:grid-cols-2 gap-3"><AnimatePresence>{partial.slice(0, 8).map(m => <ResultCard key={m.rule.algo} m={m} kind="partial" onOpenInTree={onOpenInTree} />)}</AnimatePresence></div>
                </div>
              )}
            </div>
          )}
          {brute && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold">基準解：{nodeById.get(brute.algo)!.labelZh}</span>　{brute.note}
            </div>
          )}
        </StepCard>
      </div>
    </div>
  );
}
