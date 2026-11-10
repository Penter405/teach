import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  Network,
  AlignVerticalSpaceAround,
  AlignHorizontalSpaceAround,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Flag,
  Gift,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  ListChecks,
  Route,
  Wrench,
} from 'lucide-react';
import {
  algoNodes, algoEdges, algoNext, customStructures, ALGO_ROOT_ID, ALGO_OUTCOME_ID,
  AlgoNode, AlgoEdge, AlgoNodeKind,
} from './algoTreeData';
import { SolveWizard } from './SolveWizard';
import { GoalTree } from './GoalTree';

// Flow: 問題發現 → 判斷樹（是非題／選擇題）→ 可用的演算法 → 得到了什麼 → 繼續或解決
// The decision part is a real tree: every answer is exclusive, so a problem has exactly one path.

type LayoutMode = 'vertical' | 'horizontal';

interface NodePosition { x: number; y: number; width: number; height: number }

// ── Constants ──
const SIZE = {
  desktop: { w: 176, h: 64, gapCross: 18, gapLayerV: 120, gapLayerH: 190, pad: 70 },
  mobile: { w: 132, h: 58, gapCross: 10, gapLayerV: 96, gapLayerH: 120, pad: 56 },
};

// ── Colours (literal class strings so Tailwind keeps them) ──
interface CatStyle { box: string; text: string; dot: string; label: string }
const ROOT_STYLE: CatStyle = { box: 'bg-gradient-to-br from-emerald-500 to-cyan-500 border-emerald-400', text: 'text-white', dot: 'bg-gradient-to-r from-emerald-500 to-cyan-500', label: '問題發現' };
const YESNO_STYLE: CatStyle = { box: 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-500', text: 'text-slate-800 dark:text-slate-100', dot: 'bg-white dark:bg-slate-800', label: '是非題' };
const CHOICE_STYLE: CatStyle = { box: 'bg-slate-700 dark:bg-slate-200 border-slate-700 dark:border-slate-200', text: 'text-white dark:text-slate-900', dot: 'bg-slate-700 dark:bg-slate-200', label: '選擇題' };
const GAIN_STYLE: CatStyle = { box: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-700', text: 'text-yellow-900 dark:text-yellow-200', dot: 'bg-yellow-400', label: '得到了什麼' };
const OUTCOME_STYLE: CatStyle = { box: 'bg-gradient-to-br from-amber-400 to-rose-500 border-amber-300', text: 'text-white', dot: 'bg-gradient-to-r from-amber-400 to-rose-500', label: '繼續或解決' };
const CATEGORY_STYLES: Record<string, CatStyle> = {
  '搜尋':     { box: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-700', text: 'text-cyan-800 dark:text-cyan-200', dot: 'bg-cyan-400', label: '搜尋' },
  '排序':     { box: 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700', text: 'text-sky-800 dark:text-sky-200', dot: 'bg-sky-400', label: '排序' },
  '陣列':     { box: 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700', text: 'text-teal-800 dark:text-teal-200', dot: 'bg-teal-400', label: '陣列' },
  '區間查詢': { box: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700', text: 'text-indigo-800 dark:text-indigo-200', dot: 'bg-indigo-400', label: '區間查詢' },
  '遞迴':     { box: 'bg-violet-50 dark:bg-violet-950/60 border-violet-300 dark:border-violet-700', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-400', label: '遞迴' },
  '動態規劃': { box: 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700', text: 'text-purple-800 dark:text-purple-200', dot: 'bg-purple-400', label: '動態規劃' },
  '最佳化':   { box: 'bg-fuchsia-50 dark:bg-fuchsia-950/60 border-fuchsia-300 dark:border-fuchsia-700', text: 'text-fuchsia-800 dark:text-fuchsia-200', dot: 'bg-fuchsia-400', label: '最佳化' },
  '圖論':     { box: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700', text: 'text-emerald-800 dark:text-emerald-200', dot: 'bg-emerald-400', label: '圖論' },
  '最短路徑': { box: 'bg-lime-50 dark:bg-lime-950/60 border-lime-300 dark:border-lime-700', text: 'text-lime-800 dark:text-lime-200', dot: 'bg-lime-400', label: '最短路徑' },
  '最小生成樹': { box: 'bg-green-50 dark:bg-green-950/60 border-green-300 dark:border-green-700', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-400', label: '最小生成樹' },
  '數學':     { box: 'bg-pink-50 dark:bg-pink-950/60 border-pink-300 dark:border-pink-700', text: 'text-pink-800 dark:text-pink-200', dot: 'bg-pink-400', label: '數學' },
  '字串':     { box: 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700', text: 'text-rose-800 dark:text-rose-200', dot: 'bg-rose-400', label: '字串' },
  '資料結構': { box: 'bg-orange-50 dark:bg-orange-950/60 border-orange-300 dark:border-orange-700', text: 'text-orange-800 dark:text-orange-200', dot: 'bg-orange-400', label: '資料結構' },
};
const FALLBACK_STYLE: CatStyle = { box: 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600', text: 'text-slate-800 dark:text-slate-200', dot: 'bg-slate-400', label: '其他' };

const STAGES: Record<number, { label: string; tag: string; dot: string }> = {
  1: { label: '步驟 1 需要優化嗎', tag: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700', dot: 'bg-amber-400' },
  2: { label: '步驟 2 了解資料', tag: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900 dark:text-sky-200 dark:border-sky-700', dot: 'bg-sky-400' },
  3: { label: '步驟 3 問題要什麼', tag: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900 dark:text-violet-200 dark:border-violet-700', dot: 'bg-violet-400' },
};
/** an algorithm can be several leaves; `ref` is the id of the algorithm itself */
const algoIdOf = (n: AlgoNode) => n.ref || n.id;

function styleFor(n: AlgoNode): CatStyle {
  switch (n.kind) {
    case 'root': return ROOT_STYLE;
    case 'question': return n.qtype === 'choice' ? CHOICE_STYLE : YESNO_STYLE;
    case 'gain': return GAIN_STYLE;
    case 'outcome': return OUTCOME_STYLE;
    default: return CATEGORY_STYLES[n.category] ?? FALLBACK_STYLE;
  }
}

const EDGE_STYLES: Record<AlgoNodeKind, { cls: string; marker: string; width: number; base: number; dash?: string }> = {
  root:      { cls: 'stroke-slate-400 dark:stroke-slate-500', marker: 'fill-slate-400 dark:fill-slate-500', width: 1.75, base: 0.7 },
  question:  { cls: 'stroke-slate-400 dark:stroke-slate-500', marker: 'fill-slate-400 dark:fill-slate-500', width: 1.75, base: 0.7 },
  algorithm: { cls: 'stroke-emerald-400 dark:stroke-emerald-500', marker: 'fill-emerald-400 dark:fill-emerald-500', width: 2, base: 0.8 },
  gain:      { cls: 'stroke-yellow-400 dark:stroke-yellow-500', marker: 'fill-yellow-400 dark:fill-yellow-500', width: 1.5, base: 0.5 },
  outcome:   { cls: 'stroke-amber-400 dark:stroke-amber-500', marker: 'fill-amber-400 dark:fill-amber-500', width: 1.5, base: 0.6, dash: '6 5' },
};

// ── Graph helpers ──
const nodeById = new Map<string, AlgoNode>(algoNodes.map(n => [n.id, n]));
const structureById = new Map(customStructures.map(c => [c.id, c]));
const outgoing = new Map<string, AlgoEdge[]>();
const incoming = new Map<string, AlgoEdge[]>();
for (const n of algoNodes) { outgoing.set(n.id, []); incoming.set(n.id, []); }
for (const e of algoEdges) { outgoing.get(e.from)!.push(e); incoming.get(e.to)!.push(e); }

const isTreeNode = (id: string) => {
  const k = nodeById.get(id)!.kind;
  return k === 'root' || k === 'question' || k === 'algorithm';
};
/** children inside the decision tree (questions / algorithms), in answer order */
const treeChildren = (id: string) =>
  nodeById.get(id)!.kind === 'algorithm' ? [] : outgoing.get(id)!.filter(e => isTreeNode(e.to));
const treeParent = (id: string) => incoming.get(id)!.find(e => isTreeNode(e.from));

const depthOf = new Map<string, number>();
(function walk(id: string, d: number) {
  depthOf.set(id, d);
  treeChildren(id).forEach(e => walk(e.to, d + 1));
})(ALGO_ROOT_ID, 0);

/** The question → answer steps from the root down to `id`. */
function pathTo(id: string): AlgoEdge[] {
  const steps: AlgoEdge[] = [];
  let cur = treeParent(id);
  while (cur) { steps.unshift(cur); cur = treeParent(cur.from); }
  return steps;
}

// ── Visibility (auto-collapse) ──
/**
 * With auto-collapse on, the tree only shows as many leaves as fit on screen (`capacity`).
 * Questions are opened shallow-first while the leaves still fit; others stay folded ("+N")
 * until clicked (`expanded`). The root is always open.
 */
function computeVisible(autoCollapse: boolean, expanded: Set<string>, capacity: number): Set<string> {
  const visible = new Set<string>([ALGO_ROOT_ID]);
  if (!autoCollapse) {
    algoNodes.forEach(n => visible.add(n.id));
    return visible;
  }
  let leaves = 1;
  const queue = [ALGO_ROOT_ID];
  // BFS so shallow questions open first
  while (queue.length) {
    const id = queue.shift()!;
    const kids = treeChildren(id);
    if (!kids.length) continue;
    const forced = id === ALGO_ROOT_ID || expanded.has(id);
    if (forced || leaves + kids.length - 1 <= capacity) {
      kids.forEach(e => { visible.add(e.to); queue.push(e.to); });
      leaves += kids.length - 1;
    }
  }
  // gains of visible algorithms, and the outcome
  algoEdges.forEach(e => {
    if (visible.has(e.from) && nodeById.get(e.from)!.kind === 'algorithm') visible.add(e.to);
  });
  if (algoNodes.some(n => n.kind === 'gain' && visible.has(n.id))) visible.add(ALGO_OUTCOME_ID);
  return visible;
}

/** Open every question on the path to `id`. */
function revealPath(id: string, expanded: Set<string>): Set<string> {
  const next = new Set(expanded);
  const kind = nodeById.get(id)!.kind;
  if (kind === 'gain' || kind === 'outcome') return next;
  pathTo(id).forEach(step => next.add(step.from));
  return next;
}

// ── Layout ──
function calculateLayout(layout: LayoutMode, isMobile: boolean, visible: Set<string>) {
  const s = isMobile ? SIZE.mobile : SIZE.desktop;
  const positions = new Map<string, NodePosition>();
  const crossSize = layout === 'vertical' ? s.w : s.h;
  const crossStep = crossSize + s.gapCross;
  const layerStep = layout === 'vertical' ? s.h + s.gapLayerV : s.w + s.gapLayerH;
  const place = (id: string, along: number, cross: number) =>
    positions.set(id, layout === 'vertical'
      ? { x: cross, y: along, width: s.w, height: s.h }
      : { x: along, y: cross, width: s.w, height: s.h });

  // tidy tree: leaves take consecutive slots, parents sit centred over their children
  let slot = 0;
  let maxDepth = 0;
  const crossOf = new Map<string, number>();
  (function lay(id: string) {
    const d = depthOf.get(id)!;
    maxDepth = Math.max(maxDepth, d);
    const kids = treeChildren(id).filter(e => visible.has(e.to));
    let c: number;
    if (!kids.length) {
      c = s.pad + slot * crossStep;
      slot++;
    } else {
      kids.forEach(e => lay(e.to));
      c = (crossOf.get(kids[0].to)! + crossOf.get(kids[kids.length - 1].to)!) / 2;
    }
    crossOf.set(id, c);
    place(id, s.pad + d * layerStep, c);
  })(ALGO_ROOT_ID);

  // gains: one column after the deepest visible node, near the algorithms that lead to them
  const gainAlong = s.pad + (maxDepth + 1) * layerStep;
  const gains = algoNodes
    .filter(n => n.kind === 'gain' && visible.has(n.id))
    .map(n => {
      const from = incoming.get(n.id)!.map(e => crossOf.get(e.from)).filter((v): v is number => v !== undefined);
      return { id: n.id, want: from.length ? from.reduce((a, b) => a + b, 0) / from.length : s.pad };
    })
    .sort((a, b) => a.want - b.want);
  let last = -Infinity;
  gains.forEach(g => {
    const c = Math.max(g.want, last + crossStep);
    last = c;
    crossOf.set(g.id, c);
    place(g.id, gainAlong, c);
  });

  const outcomeAlong = gainAlong + layerStep;
  if (visible.has(ALGO_OUTCOME_ID) && gains.length) {
    const c = (crossOf.get(gains[0].id)! + crossOf.get(gains[gains.length - 1].id)!) / 2;
    crossOf.set(ALGO_OUTCOME_ID, c);
    place(ALGO_OUTCOME_ID, outcomeAlong, c);
  }

  let maxCross = 0;
  crossOf.forEach(c => { maxCross = Math.max(maxCross, c + crossSize); });
  const alongEnd = outcomeAlong + (layout === 'vertical' ? s.h : s.w);
  const bounds = layout === 'vertical'
    ? { width: maxCross + 40, height: alongEnd + 24 }
    : { width: alongEnd + 24, height: maxCross + 40 };
  return { positions, bounds, pad: s.pad, gainAlong, outcomeAlong };
}

function edgePath(from: NodePosition, to: NodePosition, layout: LayoutMode) {
  if (layout === 'vertical') {
    const sx = from.x + from.width / 2, sy = from.y + from.height;
    const ex = to.x + to.width / 2, ey = to.y;
    const my = sy + Math.min(60, (ey - sy) / 2);
    return `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`;
  }
  const sx = from.x + from.width, sy = from.y + from.height / 2;
  const ex = to.x, ey = to.y + to.height / 2;
  const mx = sx + Math.min(70, (ex - sx) / 2);
  return `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`;
}

/** The loop from 「繼續」 back to 「問題發現」, drawn around the outside of the tree. */
function loopPath(outcome: NodePosition, root: NodePosition, layout: LayoutMode) {
  const r = 24, edge = 22;
  if (layout === 'horizontal') {
    const sx = outcome.x + outcome.width / 2, sy = outcome.y;
    const ex = root.x + root.width / 2, ey = root.y;
    return `M ${sx} ${sy} L ${sx} ${edge + r} Q ${sx} ${edge} ${sx - r} ${edge} L ${ex + r} ${edge} Q ${ex} ${edge} ${ex} ${edge + r} L ${ex} ${ey}`;
  }
  const sx = outcome.x, sy = outcome.y + outcome.height / 2;
  const ex = root.x, ey = root.y + root.height / 2;
  return `M ${sx} ${sy} L ${edge + r} ${sy} Q ${edge} ${sy} ${edge} ${sy - r} L ${edge} ${ey + r} Q ${edge} ${ey} ${edge + r} ${ey} L ${ex} ${ey}`;
}

// ── Edge ──
function AlgoEdgePath({ edge, from, to, layout, state }: {
  key?: string;
  edge: AlgoEdge; from: NodePosition; to: NodePosition; layout: LayoutMode;
  state: 'normal' | 'active' | 'dim';
}) {
  const st = EDGE_STYLES[edge.kind];
  const opacity = state === 'active' ? 1 : state === 'dim' ? 0.07 : st.base;
  return (
    <motion.path
      d={edgePath(from, to, layout)}
      fill="none"
      strokeWidth={state === 'active' ? st.width + 1.25 : st.width}
      strokeDasharray={st.dash}
      markerEnd={`url(#arrow-${edge.kind})`}
      className={st.cls}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{ pathLength: { duration: 0.6, ease: 'easeOut' }, opacity: { duration: 0.2 } }}
    />
  );
}

/** The answer written on a branch: 是 / 否 / option text. */
function AnswerLabel({ edge, to, layout, isMobile, dim }: {
  key?: string;
  edge: AlgoEdge; to: NodePosition; layout: LayoutMode; isMobile: boolean; dim: boolean;
}) {
  if (!edge.answer) return null;
  const cls =
    edge.answer === '是' ? 'fill-emerald-600 dark:fill-emerald-400' :
    edge.answer === '否' ? 'fill-rose-600 dark:fill-rose-400' :
    'fill-sky-800 dark:fill-sky-200';
  const common = {
    className: `${cls} stroke-[#f7f9fb] dark:stroke-slate-950 font-bold`,
    strokeWidth: 5,
    style: { fontSize: isMobile ? 10 : 12, paintOrder: 'stroke' as const, transition: 'opacity 0.2s' },
    opacity: dim ? 0.15 : 1,
  };
  return layout === 'horizontal'
    ? <text x={to.x - 10} y={to.y + to.height / 2 - 7} textAnchor="end" {...common}>{edge.answer}</text>
    : <text x={to.x + to.width / 2} y={to.y - 10} textAnchor="middle" {...common}>{edge.answer}</text>;
}

// ── Node ──
function AlgoNodeBox({ node, pos, isMobile, state, onClick, onHover, onLeave, hiddenCount, canFold, onToggleFold }: {
  key?: string;
  node: AlgoNode; pos: NodePosition; isMobile: boolean;
  state: 'normal' | 'active' | 'selected' | 'dim';
  onClick: () => void; onHover: () => void; onLeave: () => void;
  hiddenCount: number; canFold: boolean; onToggleFold: () => void;
}) {
  const st = styleFor(node);
  const isQ = node.kind === 'question';
  const special = node.kind === 'root' || node.kind === 'outcome';
  const Icon = node.kind === 'outcome' ? Flag : node.kind === 'gain' ? Gift : null;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: state === 'dim' ? 0.22 : 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'backOut' }}
    >
      <foreignObject x={pos.x} y={pos.y} width={pos.width} height={pos.height} style={{ overflow: 'visible' }}>
        <div
          onClick={onClick}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          className={`relative w-full h-full ${isQ ? 'rounded-xl' : 'rounded-2xl'} border-2 cursor-pointer px-2 flex flex-col items-center justify-center text-center leading-tight select-none
            ${st.box} ${special ? 'shadow-lg' : 'shadow-sm'}
            ${state === 'selected' ? 'ring-4 ring-emerald-400/60 dark:ring-emerald-500/50' : ''}
            ${state === 'active' || state === 'selected' ? 'shadow-xl' : ''}`}
          style={{
            transform: state === 'active' || state === 'selected' ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {isQ && (
            <span className={`absolute -top-2.5 left-2 px-1.5 rounded-md text-[9px] font-bold tracking-wider border whitespace-nowrap
              ${STAGES[node.stage]?.tag ?? STAGES[3].tag}`}>
              {`步驟${node.stage} · ${node.qtype === 'choice' ? '選擇題' : '是非題'}`}
            </span>
          )}
          <span className={`flex items-center gap-1 font-headline font-bold ${isMobile ? 'text-[11px]' : 'text-[13px]'} ${st.text} max-w-full`}>
            {Icon && <Icon className="w-3 h-3 flex-shrink-0 opacity-80" />}
            <span className={isQ ? 'line-clamp-2' : 'truncate'}>{node.labelZh}</span>
          </span>
          {!(isQ && isMobile) && (
            <span className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} font-medium opacity-70 ${st.text} truncate max-w-full`}>
              {node.label}
            </span>
          )}
          {node.time && !isMobile && (
            <span className={`font-mono text-[9px] mt-0.5 opacity-70 ${st.text} truncate max-w-full`}>{node.time}</span>
          )}
          {node.customDs?.length > 0 && !isMobile && (
            <span
              title={`需要自己寫：${node.customDs.map(id => structureById.get(id)?.name).join('、')}`}
              className="absolute -bottom-2.5 left-2 px-1.5 rounded-md text-[9px] font-bold border whitespace-nowrap bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700"
            >
              🔧 自己寫
            </span>
          )}
          {(hiddenCount > 0 || canFold) && (
            <button
              onClick={e => { e.stopPropagation(); onToggleFold(); }}
              title={hiddenCount > 0 ? `展開 ${hiddenCount} 個答案` : '收合'}
              aria-label={hiddenCount > 0 ? `Expand ${hiddenCount} hidden answers` : 'Collapse answers'}
              className={`absolute -top-2.5 -right-2.5 min-w-[26px] h-[22px] px-1.5 rounded-full text-[11px] font-bold font-mono shadow-md border-2 border-white dark:border-slate-900 transition-transform hover:scale-110
                ${hiddenCount > 0 ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-400 dark:bg-slate-600 text-white'}`}
            >
              {hiddenCount > 0 ? `+${hiddenCount}` : '−'}
            </button>
          )}
        </div>
      </foreignObject>
    </motion.g>
  );
}

// ── Detail panel ──
function Lines({ text, bullet = 'text-emerald-500' }: { text: string; bullet?: string }) {
  return (
    <ul className="mt-1.5 space-y-1">
      {text.split('\n').filter(Boolean).map((line, i) => (
        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex gap-1.5">
          <span className={`${bullet} mt-[1px]`}>•</span><span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
      <Icon className="w-3.5 h-3.5" /> {children}
    </h3>
  );
}

function AnswerChip({ answer }: { answer: string }) {
  const cls =
    answer === '是' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' :
    answer === '否' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' :
    'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200';
  return <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap ${cls}`}>{answer}</span>;
}

function LinkCard({ id, reason, tone, onSelect, answer }: {
  key?: string;
  id: string; reason: string; tone: 'slate' | 'emerald' | 'yellow' | 'amber'; onSelect: (id: string) => void; answer?: string;
}) {
  const n = nodeById.get(id)!;
  const tones = {
    slate: 'border-slate-200 dark:border-slate-700',
    emerald: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20',
    yellow: 'border-yellow-200 dark:border-yellow-900 bg-yellow-50/60 dark:bg-yellow-950/20',
    amber: 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      {answer && <div className="mb-1.5"><AnswerChip answer={answer} /></div>}
      <button onClick={() => onSelect(id)} className="text-[12px] font-bold text-slate-800 dark:text-slate-100 hover:underline text-left">
        {n.kind === 'question' ? '→ ' : n.kind === 'algorithm' ? '✓ ' : ''}{n.labelZh} <span className="font-normal text-slate-400">· {n.label}</span>
      </button>
      {reason && reason !== answer && <Lines text={reason} />}
    </div>
  );
}

function StructureCard({ ds }: { key?: string; ds: { id: string; name: string; desc: string; code: string } }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(ds.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <div className="rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50/60 dark:bg-orange-950/20 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[12px] font-bold text-orange-900 dark:text-orange-200">🔧 {ds.name}</div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{ds.desc}</p>
        </div>
        <button onClick={() => setOpen(v => !v)}
          className="flex-shrink-0 text-[11px] font-bold px-2 py-1 rounded-md bg-orange-200/70 dark:bg-orange-900 text-orange-900 dark:text-orange-100 hover:bg-orange-200">
          {open ? '收起' : '看模板'}
        </button>
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

function DetailPanel({ nodeId, onClose, onSelect }: { nodeId: string; onClose: () => void; onSelect: (id: string) => void }) {
  const node = nodeById.get(nodeId)!;
  const st = styleFor(node);
  const ins = incoming.get(nodeId)!;
  const outs = outgoing.get(nodeId)!;
  const nexts = algoNext.filter(x => x.from === algoIdOf(node));
  const comesFrom = algoNext.filter(x => x.to === algoIdOf(node));
  const sameAlgoLeaves = node.kind === 'algorithm' ? algoNodes.filter(n => algoIdOf(n) === algoIdOf(node) && n.id !== nodeId) : [];
  const path = node.kind === 'question' || node.kind === 'algorithm'
    ? pathTo(nodeId).filter(step => step.from !== ALGO_ROOT_ID)
    : [];
  const kindLabel =
    node.kind === 'root' ? '問題發現' :
    node.kind === 'question' ? `${STAGES[node.stage]?.label ?? ''} · ${node.qtype === 'choice' ? '選擇題（選項互斥）' : '是非題'}` :
    node.kind === 'algorithm' ? `可用的演算法 · ${node.category}` :
    node.kind === 'gain' ? '得到了什麼' : '繼續或解決';

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute top-0 right-0 bottom-0 z-[60] w-full sm:w-[400px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto"
    >
      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 ${st.dot}`} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{kindLabel}</span>
            </div>
            <h2 className="font-headline text-xl font-bold text-slate-900 dark:text-white">{node.labelZh}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{node.label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {node.kind === 'algorithm' && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: '時間 Time', v: node.time },
              { k: '空間 Space', v: node.space },
              { k: '資料結構 DS', v: node.ds },
            ].map(c => (
              <div key={c.k} className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-2">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{c.k}</div>
                <div className="font-mono text-[11px] text-slate-700 dark:text-slate-200 mt-0.5 break-words">{c.v || '—'}</div>
              </div>
            ))}
          </div>
        )}

        {node.desc && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {node.kind === 'algorithm' ? '什麼時候使用' : node.kind === 'question' ? '怎麼判斷' : '說明'}
            </div>
            <Lines text={node.desc} bullet="text-slate-400" />
          </div>
        )}

        {/* The unique sequence of answers from the root */}
        {path.length > 0 && (
          <section>
            <SectionTitle icon={Route}>判斷路徑（唯一）</SectionTitle>
            <ol className="mt-2 space-y-1.5">
              {path.map((step, i) => (
                <li key={step.from} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-slate-400 w-4 text-right">{i + 1}.</span>
                  <button onClick={() => onSelect(step.from)} className="text-left text-slate-700 dark:text-slate-200 hover:underline flex-1">
                    {nodeById.get(step.from)!.labelZh}
                  </button>
                  <AnswerChip answer={step.answer} />
                </li>
              ))}
            </ol>
          </section>
        )}

        {sameAlgoLeaves.length > 0 && (
          <section>
            <SectionTitle icon={Route}>也可以從其他路徑走到 · {sameAlgoLeaves.length}</SectionTitle>
            <div className="mt-2 space-y-2">
              {sameAlgoLeaves.map(leaf => (
                <button key={leaf.id} onClick={() => onSelect(leaf.id)}
                  className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {pathTo(leaf.id).filter(st => st.from !== ALGO_ROOT_ID).map(st => <AnswerChip key={st.from} answer={st.answer} />)}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ROOT */}
        {node.kind === 'root' && (
          <section>
            <SectionTitle icon={HelpCircle}>從第一個問題開始</SectionTitle>
            <div className="mt-2 space-y-2.5">
              {outs.map(e => <LinkCard key={e.to} id={e.to} reason={e.reason} tone="slate" onSelect={onSelect} />)}
            </div>
          </section>
        )}

        {/* QUESTION */}
        {node.kind === 'question' && (
          <section>
            <SectionTitle icon={ListChecks}>
              {node.qtype === 'choice' ? `選項（只會符合一個） · ${outs.length}` : '答案'}
            </SectionTitle>
            <div className="mt-2 space-y-2.5">
              {outs.map(e => (
                <LinkCard key={e.to} id={e.to} reason={e.reason} answer={e.answer}
                  tone={nodeById.get(e.to)!.kind === 'algorithm' ? 'emerald' : 'slate'} onSelect={onSelect} />
              ))}
            </div>
          </section>
        )}

        {/* ALGORITHM */}
        {node.kind === 'algorithm' && node.customDs?.length > 0 && (
          <section>
            <SectionTitle icon={Wrench}>需要自己寫的資料結構</SectionTitle>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Python 沒有內建，要自己寫（heapq、deque、dict 是內建的，直接用就好）。</p>
            <div className="mt-2 space-y-3">
              {node.customDs.map(id => {
                const ds = structureById.get(id);
                if (!ds) return null;
                return <StructureCard key={id} ds={ds} />;
              })}
            </div>
          </section>
        )}
        {node.kind === 'algorithm' && (
          <>
            <section>
              <SectionTitle icon={Gift}>得到了什麼</SectionTitle>
              <div className="mt-2 space-y-2.5">
                {outs.map(e => <LinkCard key={e.to} id={e.to} reason={e.reason} tone="yellow" onSelect={onSelect} />)}
              </div>
            </section>
            {nexts.length > 0 && (
              <section>
                <SectionTitle icon={RotateCcw}>遇到新限制 → 繼續</SectionTitle>
                <div className="mt-2 space-y-2.5">
                  {nexts.map(x => <LinkCard key={x.to} id={x.to} reason={x.reason} tone="amber" onSelect={onSelect} />)}
                </div>
              </section>
            )}
            {comesFrom.length > 0 && (
              <section>
                <SectionTitle icon={ArrowRight}>常常是從這裡優化過來</SectionTitle>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {comesFrom.map(x => (
                    <button key={x.from} onClick={() => onSelect(x.from)}
                      className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                      {nodeById.get(x.from)!.labelZh}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* GAIN */}
        {node.kind === 'gain' && (
          <>
            <section>
              <SectionTitle icon={ArrowRight}>由這些演算法得到 · {new Set(ins.map(e => algoIdOf(nodeById.get(e.from)!))).size}</SectionTitle>
              <div className="mt-2 space-y-2.5">
                {ins.filter((e, i) => ins.findIndex(x => algoIdOf(nodeById.get(x.from)!) === algoIdOf(nodeById.get(e.from)!)) === i)
                  .map(e => <LinkCard key={e.from} id={algoIdOf(nodeById.get(e.from)!)} reason={e.reason} tone="emerald" onSelect={onSelect} />)}
              </div>
            </section>
            <button onClick={() => onSelect(ALGO_OUTCOME_ID)}
              className="w-full text-left rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 hover:bg-amber-100 dark:hover:bg-amber-900/30">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-amber-700 dark:text-amber-300">
                <Flag className="w-3.5 h-3.5" /> 下一步：繼續或已解決
              </div>
              <Lines text={outs[0]?.reason ?? ''} bullet="text-amber-500" />
            </button>
          </>
        )}

        {/* OUTCOME */}
        {node.kind === 'outcome' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3">
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">✓ 已解決</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">時間與空間都夠用 → 結束。</p>
              </div>
              <button onClick={() => onSelect(ALGO_ROOT_ID)}
                className="text-left rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                <div className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> 繼續</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">還不夠快或有新限制 → 回到問題發現。</p>
              </button>
            </div>
            <section>
              <SectionTitle icon={Gift}>來自這些收穫 · {ins.length}</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ins.map(e => (
                  <button key={e.from} onClick={() => onSelect(e.from)}
                    className="text-xs px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40">
                    {nodeById.get(e.from)!.labelZh}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </motion.aside>
  );
}

// ── Main Page ──
export function AlgorithmTreePage({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'wizard' | 'goal' | 'tree'>('wizard');
  const [layout, setLayout] = useState<LayoutMode>('horizontal');
  const [isMobile, setIsMobile] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoCollapse, setAutoCollapse] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [viewport, setViewport] = useState({ w: 1280, h: 800 });

  useEffect(() => {
    const read = () => {
      setIsMobile(window.innerWidth < 640);
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  // How many leaves fit across the screen at the current zoom
  const capacity = useMemo(() => {
    const sz = isMobile ? SIZE.mobile : SIZE.desktop;
    const room = layout === 'horizontal' ? viewport.h - 170 - sz.pad : viewport.w - 48 - sz.pad;
    const per = (layout === 'horizontal' ? sz.h : sz.w) + sz.gapCross;
    return Math.max(4, Math.floor(room / zoom / per));
  }, [layout, isMobile, viewport, zoom]);

  const visible = useMemo(() => computeVisible(autoCollapse, expanded, capacity), [autoCollapse, expanded, capacity]);
  const { positions, bounds, pad, gainAlong, outcomeAlong } = useMemo(
    () => calculateLayout(layout, isMobile, visible),
    [layout, isMobile, visible]
  );

  const hiddenChildren = (id: string) =>
    autoCollapse ? treeChildren(id).filter(e => !visible.has(e.to)).length : 0;
  const toggleFold = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (hiddenChildren(id) > 0) next.add(id);
    else {
      next.delete(id);
      // folding a question also folds everything opened below it
      const drop = (x: string) => treeChildren(x).forEach(e => { next.delete(e.to); drop(e.to); });
      drop(id);
    }
    return next;
  });
  const openNode = (id: string) => {
    setSelectedId(id);
    if (hiddenChildren(id) > 0) setExpanded(prev => new Set(prev).add(id));
  };
  /** Jump from the detail panel: make sure the target is on screen. */
  const jumpTo = (id: string) => {
    setSelectedId(id);
    if (autoCollapse && !visible.has(id)) setExpanded(prev => revealPath(id, prev));
  };

  // Highlight the whole path through the focused node: up to the root, down to the outcome.
  const focusId = hoveredId ?? selectedId;
  const focus = useMemo(() => {
    if (!focusId) return null;
    const nodes = new Set<string>([focusId]);
    const edges = new Set<string>();
    const walk = (id: string, dir: 'up' | 'down') => {
      const list = dir === 'up' ? incoming.get(id)! : outgoing.get(id)!;
      for (const e of list) {
        const next = dir === 'up' ? e.from : e.to;
        edges.add(`${e.from}->${e.to}`);
        if (!nodes.has(next)) { nodes.add(next); walk(next, dir); }
      }
    };
    walk(focusId, 'up');
    walk(focusId, 'down');
    return { nodes, edges };
  }, [focusId]);

  const legendCategories = useMemo(
    () => Array.from(new Set(algoNodes.filter(n => n.kind === 'algorithm').map(n => n.category))),
    []
  );

  const rootPos = positions.get(ALGO_ROOT_ID);
  const outcomePos = positions.get(ALGO_OUTCOME_ID);
  const s = isMobile ? SIZE.mobile : SIZE.desktop;

  const fit = () => {
    const vw = window.innerWidth - 48, vh = window.innerHeight - 170;
    setZoom(Math.max(0.25, Math.min(1, +(Math.min(vw / bounds.width, vh / bounds.height)).toFixed(2))));
  };

  const visibleEdges = algoEdges.filter(e => positions.has(e.from) && positions.has(e.to));
  const titleStyle = { fontSize: isMobile ? 11 : 13, letterSpacing: '0.05em', paintOrder: 'stroke' as const };
  const titleCls = 'fill-slate-400 dark:fill-slate-500 stroke-[#f7f9fb] dark:stroke-slate-950 font-headline font-bold';
  const firstQ = pad + (layout === 'horizontal' ? s.w + s.gapLayerH : s.h + s.gapLayerV);
  const stageTitles = [
    { label: '問題發現', along: pad },
    { label: '步驟 1～3：判斷（是非題／選擇題）→ 步驟 4：演算法', along: firstQ },
    { label: '得到了什麼', along: gainAlong },
    { label: '繼續或解決', along: outcomeAlong },
  ];

  return (
    <div className="h-screen bg-surface dark:bg-slate-950 flex flex-col transition-colors duration-500 overflow-hidden">
      {/* Header */}
      <nav className="w-full flex-shrink-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-xs sm:text-sm font-semibold uppercase tracking-wider"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 dark:text-emerald-400 min-w-0">
            <Network className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline font-headline font-bold text-xs sm:text-base tracking-tight truncate">Algorithm Tree</span>
          </div>
          <div className="flex items-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5" role="tablist">
            {([['wizard', '解題流程'], ['goal', '任務樹'], ['tree', '判斷樹']] as const).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all
                  ${tab === id
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'tree' && <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Auto-collapse switch */}
          <label
            className="flex items-center gap-2 cursor-pointer select-none px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            title="畫面放不下的分支先收合，點擊問題後才展開（關閉則顯示全部）"
          >
            <span className="hidden lg:inline text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">自動收合</span>
            <button
              role="switch"
              aria-checked={autoCollapse}
              aria-label="Auto-collapse crowded branches"
              onClick={() => { setAutoCollapse(v => !v); setExpanded(new Set()); }}
              className={`relative w-9 h-5 rounded-full transition-colors ${autoCollapse ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoCollapse ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </label>

          {/* Zoom */}
          <div className="flex items-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button onClick={() => setZoom(z => Math.max(0.25, +(z - 0.1).toFixed(2)))} className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" aria-label="Zoom out">
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => setZoom(1)} className="px-1 text-[10px] sm:text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 w-10 sm:w-12" aria-label="Reset zoom">
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))} className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" aria-label="Zoom in">
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={fit} title="Fit to screen" aria-label="Fit to screen"
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-l border-slate-200 dark:border-slate-700">
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Layout toggle */}
          <div className="flex items-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
            {(['horizontal', 'vertical'] as LayoutMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setLayout(mode)}
                title={mode === 'vertical' ? 'Top → Down' : 'Left → Right'}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all
                  ${layout === mode
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                {mode === 'vertical'
                  ? <AlignVerticalSpaceAround className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  : <AlignHorizontalSpaceAround className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span className="hidden md:inline">{mode === 'vertical' ? 'Top → Down' : 'Left → Right'}</span>
              </button>
            ))}
          </div>
        </div>}
      </nav>

      {tab === 'wizard' && (
        <div className="flex-1 min-h-0">
          <SolveWizard onOpenInTree={id => { setTab('tree'); jumpTo(id); }} />
        </div>
      )}

      {tab === 'goal' && (
        <div className="flex-1 min-h-0">
          <GoalTree onOpenInTree={id => { setTab('tree'); jumpTo(id); }} />
        </div>
      )}

      {tab === 'tree' && <>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-auto" onClick={() => setSelectedId(null)}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative mx-auto p-4 sm:p-6" style={{ width: bounds.width * zoom + 48, height: bounds.height * zoom + 48 }}>
            <svg
              key={`${layout}-${isMobile}`}
              width={bounds.width * zoom}
              height={bounds.height * zoom}
              viewBox={`0 0 ${bounds.width} ${bounds.height}`}
              style={{ overflow: 'visible' }}
              onClick={e => e.stopPropagation()}
              aria-label="Algorithm decision tree"
            >
              <defs>
                {(Object.keys(EDGE_STYLES) as AlgoNodeKind[]).map(k => (
                  <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className={EDGE_STYLES[k].marker} />
                  </marker>
                ))}
              </defs>

              {/* Stage titles */}
              {stageTitles.map(t => layout === 'horizontal' ? (
                <text key={t.label} x={t.along} y={pad - 18} className={titleCls} strokeWidth={5} style={titleStyle}>{t.label}</text>
              ) : (
                <text key={t.label} x={34} y={t.along - 18} className={titleCls} strokeWidth={5} style={titleStyle}>{t.label}</text>
              ))}

              {/* Loop: 繼續 → 回到問題發現 */}
              {rootPos && outcomePos && (
                <g opacity={focus && !focus.nodes.has(ALGO_OUTCOME_ID) ? 0.15 : 1}>
                  <path
                    d={loopPath(outcomePos, rootPos, layout)}
                    fill="none" strokeWidth={2} strokeDasharray="6 5"
                    markerEnd="url(#arrow-outcome)"
                    className="stroke-amber-400 dark:stroke-amber-500"
                  />
                  {layout === 'horizontal' ? (
                    <text x={(outcomePos.x + rootPos.x + s.w) / 2} y={14} textAnchor="middle"
                      className="fill-amber-600 dark:fill-amber-400 font-bold" style={{ fontSize: isMobile ? 10 : 12 }}>
                      ↺ 繼續：遇到新問題，回到問題發現
                    </text>
                  ) : (
                    <text x={14} y={(outcomePos.y + rootPos.y) / 2} textAnchor="middle"
                      transform={`rotate(-90 14 ${(outcomePos.y + rootPos.y) / 2})`}
                      className="fill-amber-600 dark:fill-amber-400 font-bold" style={{ fontSize: isMobile ? 10 : 12 }}>
                      ↺ 繼續：遇到新問題，回到問題發現
                    </text>
                  )}
                </g>
              )}

              {/* Edges — highlighted ones last so they draw on top */}
              {[...visibleEdges]
                .sort((a, b) => {
                  if (!focus) return 0;
                  return (focus.edges.has(`${a.from}->${a.to}`) ? 1 : 0) - (focus.edges.has(`${b.from}->${b.to}`) ? 1 : 0);
                })
                .map(e => {
                  const key = `${e.from}->${e.to}`;
                  const state = !focus ? 'normal' : focus.edges.has(key) ? 'active' : 'dim';
                  return <AlgoEdgePath key={key} edge={e} from={positions.get(e.from)!} to={positions.get(e.to)!} layout={layout} state={state} />;
                })}

              {/* Answers on the branches */}
              {visibleEdges.filter(e => e.answer).map(e => (
                <AnswerLabel key={`a-${e.from}->${e.to}`} edge={e} to={positions.get(e.to)!} layout={layout} isMobile={isMobile}
                  dim={!!focus && !focus.edges.has(`${e.from}->${e.to}`)} />
              ))}

              {algoNodes.map(n => {
                const pos = positions.get(n.id);
                if (!pos) return null;
                const state =
                  selectedId === n.id ? 'selected' :
                  !focus ? 'normal' :
                  focus.nodes.has(n.id) ? (n.id === focusId ? 'active' : 'normal') : 'dim';
                return (
                  <AlgoNodeBox
                    key={n.id}
                    node={n}
                    pos={pos}
                    isMobile={isMobile}
                    state={state}
                    onClick={() => openNode(n.id)}
                    onHover={() => !isMobile && setHoveredId(n.id)}
                    onLeave={() => setHoveredId(null)}
                    hiddenCount={hiddenChildren(n.id)}
                    canFold={autoCollapse && expanded.has(n.id) && n.id !== ALGO_ROOT_ID}
                    onToggleFold={() => toggleFold(n.id)}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        <AnimatePresence>
          {selectedId && (
            <DetailPanel key={selectedId} nodeId={selectedId} onClose={() => setSelectedId(null)} onSelect={jumpTo} />
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 flex-wrap">
        {[1, 2, 3].map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${STAGES[k].dot}`} />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">{STAGES[k].label}</span>
          </div>
        ))}
        {[ROOT_STYLE, CHOICE_STYLE, YESNO_STYLE, GAIN_STYLE, OUTCOME_STYLE].map(st => (
          <div key={st.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 ${st.dot}`} />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">{st.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="px-1 rounded text-[9px] font-bold bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700">🔧</span>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">需要自己寫的資料結構</span>
        </div>
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap pl-3 sm:pl-4 border-l border-slate-200 dark:border-slate-700">
          {legendCategories.map(cat => {
            const st = CATEGORY_STYLES[cat] ?? FALLBACK_STYLE;
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      </>}
    </div>
  );
}
