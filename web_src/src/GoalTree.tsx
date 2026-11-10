import React, { useMemo, useState } from 'react';
import { ChevronRight, Search, Network, ChevronsDownUp, ChevronsUpDown, Database } from 'lucide-react';
import { algoNodes, goalTree, customStructures, dataStructures, GoalItem, DataStructure } from './algoTreeData';

// 任務樹：問題發現 → [任務] → [條件] → 演算法 或 資料結構（同一個可以出現在不同任務下）

type Group = { label: string; children: GoalItem[] };
const isGroup = (x: GoalItem): x is Group => 'children' in x;

const nodeById = new Map(algoNodes.map(n => [n.id, n]));
const structureName = new Map(customStructures.map(c => [c.id, c.name.split(' (')[0]]));
const dsById = new Map(dataStructures.map(d => [d.id, d]));
const isDs = (x: GoalItem): x is { ds: string } => 'ds' in x;

const CATEGORY_DOT: Record<string, string> = {
  '搜尋': 'bg-cyan-400', '排序': 'bg-sky-400', '陣列': 'bg-teal-400', '區間查詢': 'bg-indigo-400',
  '遞迴': 'bg-violet-400', '動態規劃': 'bg-purple-400', '最佳化': 'bg-fuchsia-400', '圖論': 'bg-emerald-400',
  '最短路徑': 'bg-lime-400', '最小生成樹': 'bg-green-400', '字串': 'bg-rose-400', '資料結構': 'bg-orange-400', '數學': 'bg-pink-400',
};

/** stable path keys so each group can be opened/closed on its own */
function keyOf(path: number[]) { return path.join('.'); }

function allGroupKeys(items: GoalItem[], path: number[] = [], out: string[] = []) {
  items.forEach((it, i) => {
    if (isGroup(it)) { out.push(keyOf([...path, i])); allGroupKeys(it.children, [...path, i], out); }
  });
  return out;
}

function matches(item: GoalItem, q: string): boolean {
  if (!q) return true;
  if (isGroup(item)) return item.label.toLowerCase().includes(q) || item.children.some(c => matches(c, q));
  if (isDs(item)) {
    const d = dsById.get(item.ds);
    return !!d && (d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || '資料結構'.includes(q));
  }
  const n = nodeById.get(item.algo);
  return !!n && (n.labelZh.toLowerCase().includes(q) || n.label.toLowerCase().includes(q) || n.category.includes(q));
}

function Leaf({ id, onOpenInTree }: { id: string; onOpenInTree: (id: string) => void }) {
  const n = nodeById.get(id);
  if (!n) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${CATEGORY_DOT[n.category] ?? 'bg-slate-400'}`} />
      <span className="font-headline font-bold text-sm text-slate-900 dark:text-white">{n.labelZh}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{n.label}</span>
      <span className="flex flex-wrap gap-1 basis-full sm:basis-auto sm:ml-1">
        {[['Time', n.time], ['Space', n.space], ['DS', n.ds]].filter(([, v]) => v).map(([k, v]) => (
          <span key={k} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span className="text-slate-400">{k}:</span> {v}
          </span>
        ))}
        {n.customDs.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-700">
            🔧 自己寫：{n.customDs.map(d => structureName.get(d)).join('、')}
          </span>
        )}
      </span>
      <button onClick={() => onOpenInTree(id)} title="在判斷樹中查看詳細與判斷路徑"
        className="ml-auto flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline">
        <Network className="w-3.5 h-3.5" /> 判斷樹
      </button>
    </div>
  );
}

function DsLeaf({ ds, onOpenInTree }: { ds: DataStructure; onOpenInTree: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(ds.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <div className={`rounded-xl border px-3 py-2 shadow-sm ${ds.builtin
      ? 'border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/30'
      : 'border-orange-200 dark:border-orange-900 bg-orange-50/70 dark:bg-orange-950/30'}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Database className={`w-3.5 h-3.5 flex-shrink-0 ${ds.builtin ? 'text-sky-500' : 'text-orange-500'}`} />
        <span className="font-headline font-bold text-sm text-slate-900 dark:text-white">{ds.name}</span>
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900">資料結構</span>
        {ds.builtin
          ? <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-900/60 dark:text-sky-200 dark:border-sky-700">Python 內建</span>
          : <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-700">🔧 要自己寫</span>}
        <span className="ml-auto flex items-center gap-3">
          <button onClick={() => setOpen(v => !v)} className="text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:underline">
            {open ? '收起' : ds.builtin ? '看用法' : '看模板'}
          </button>
          {ds.algo && (
            <button onClick={() => onOpenInTree(ds.algo)} title="在判斷樹中查看"
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline">
              <Network className="w-3.5 h-3.5" /> 判斷樹
            </button>
          )}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{ds.desc}</p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {ds.ops.map(o => (
          <span key={o.op} className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-sans">{o.op}:</span> {o.cost}
          </span>
        ))}
      </div>
      {open && (
        <div className="relative mt-2">
          <button onClick={copy} className="absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-100 hover:bg-slate-600">
            {copied ? '已複製' : '複製'}
          </button>
          <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 text-slate-100 p-3 text-[11px] leading-relaxed font-mono whitespace-pre">{ds.code}</pre>
        </div>
      )}
    </div>
  );
}

function Branch({ items, path, open, toggle, q, forceOpen = false, onOpenInTree }: {
  items: GoalItem[]; path: number[]; open: Set<string>; toggle: (k: string) => void; q: string;
  /** a search matched an ancestor: show this whole subtree, opened */
  forceOpen?: boolean;
  onOpenInTree: (id: string) => void;
}) {
  return (
    <ul className={`space-y-2 ${path.length ? 'ml-3 sm:ml-4 pl-4 sm:pl-5 border-l-2 border-slate-200 dark:border-slate-700' : ''}`}>
      {items.map((it, i) => {
        if (!matches(it, q)) return null;
        const p = [...path, i];
        const k = keyOf(p);
        const connector = path.length
          ? <span aria-hidden className="absolute -left-4 sm:-left-5 top-4 w-3 sm:w-4 border-t-2 border-slate-200 dark:border-slate-700" />
          : null;
        if (isDs(it)) {
          const d = dsById.get(it.ds);
          return d ? <li key={k} className="relative">{connector}<DsLeaf ds={d} onOpenInTree={onOpenInTree} /></li> : null;
        }
        if (!isGroup(it)) {
          return <li key={k} className="relative">{connector}<Leaf id={it.algo} onOpenInTree={onOpenInTree} /></li>;
        }
        const isOpen = q || forceOpen ? true : open.has(k);
        // if the group's own label matches the search, show everything under it
        const selfMatch = !!q && it.label.toLowerCase().includes(q);
        const top = path.length === 0;
        const count = (function countLeaves(x: GoalItem): number { return isGroup(x) ? x.children.reduce((a, c) => a + countLeaves(c), 0) : 1; })(it);
        return (
          <li key={k} className="relative">
            {connector}
            <button onClick={() => toggle(k)} aria-expanded={isOpen}
              className={`group flex items-center gap-1.5 text-left rounded-lg px-2 py-1 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
                ${top ? 'text-base sm:text-lg font-headline font-bold text-slate-900 dark:text-white' : 'text-sm font-semibold text-slate-700 dark:text-slate-200'}`}>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              <span><span className="text-slate-400 font-normal">[</span>{it.label}<span className="text-slate-400 font-normal">]</span></span>
              {!isOpen && <span className="ml-1 text-[11px] font-mono font-normal text-slate-400">{count}</span>}
            </button>
            {isOpen && (
              <div className="mt-2">
                <Branch items={it.children} path={p} open={open} toggle={toggle} q={selfMatch ? '' : q}
                  forceOpen={forceOpen || !!q} onOpenInTree={onOpenInTree} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function GoalTree({ onOpenInTree }: { onOpenInTree: (id: string) => void }) {
  const everyKey = useMemo(() => allGroupKeys(goalTree), []);
  const [open, setOpen] = useState<Set<string>>(() => new Set(everyKey));
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const toggle = (k: string) => setOpen(prev => {
    const next = new Set(prev);
    if (next.has(k)) next.delete(k); else next.add(k);
    return next;
  });

  const shown = goalTree.filter(it => matches(it, q)).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <h1 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">我們要做什麼？</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          問題發現 → [任務] → [條件] → 演算法 或 資料結構。同一個可以出現在不同任務下；要一步一步判斷，請用「判斷樹」。
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />演算法</span>
          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-sky-500" />資料結構：Python 內建</span>
          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-orange-500" />資料結構：要自己寫</span>
        </div>

        <div className="mt-3 mb-5 flex flex-wrap items-center gap-2">
          <label className="flex-1 min-w-[200px] flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜尋演算法、資料結構或任務，例如：背包、heapq、區間"
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none" />
          </label>
          <button onClick={() => setOpen(new Set(everyKey))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-400">
            <ChevronsUpDown className="w-4 h-4" /> 全部展開
          </button>
          <button onClick={() => setOpen(new Set())}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-400">
            <ChevronsDownUp className="w-4 h-4" /> 全部收合
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4 sm:p-6">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-headline font-bold text-sm shadow">
            問題發現 Problem Discovery
          </div>
          {shown === 0
            ? <p className="text-sm text-slate-500 dark:text-slate-400">找不到「{query}」。</p>
            : <Branch items={goalTree} path={[]} open={open} toggle={toggle} q={q} onOpenInTree={onOpenInTree} />}
        </div>
      </div>
    </div>
  );
}
