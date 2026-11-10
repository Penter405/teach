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
  Lightbulb,
  Gift,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import {
  algoNodes, algoEdges, algoNext, ALGO_ROOT_ID, ALGO_OUTCOME_ID,
  AlgoNode, AlgoEdge, AlgoNodeKind,
} from './algoTreeData';

// Flow: 問題發現 → 問題特性 → 可用的演算法 → 得到了什麼 → 繼續或解決

// ── Types ──
type LayoutMode = 'vertical' | 'horizontal';

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Constants ──
const SIZE = {
  desktop: { w: 176, h: 64, gapCross: 18, gapLayerV: 150, gapLayerH: 170, pad: 70 },
  mobile: { w: 132, h: 56, gapCross: 10, gapLayerV: 110, gapLayerH: 90, pad: 56 },
};

const LAYER_ORDER: AlgoNodeKind[] = ['root', 'trait', 'algorithm', 'gain', 'outcome'];
const LAYER_TITLES: Record<AlgoNodeKind, { zh: string; en: string }> = {
  root: { zh: '問題發現', en: 'Problem' },
  trait: { zh: '問題特性', en: 'Traits' },
  algorithm: { zh: '可用的演算法', en: 'Algorithms' },
  gain: { zh: '得到了什麼', en: 'What you gain' },
  outcome: { zh: '繼續或解決', en: 'Continue / Solved' },
};

// ── Colours (literal class strings so Tailwind keeps them) ──
interface CatStyle { box: string; text: string; dot: string; label: string }
const KIND_STYLES: Partial<Record<AlgoNodeKind, CatStyle>> = {
  root:    { box: 'bg-gradient-to-br from-emerald-500 to-cyan-500 border-emerald-400', text: 'text-white', dot: 'bg-gradient-to-r from-emerald-500 to-cyan-500', label: '問題發現' },
  trait:   { box: 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 border-dashed', text: 'text-slate-700 dark:text-slate-200', dot: 'bg-slate-400', label: '問題特性' },
  gain:    { box: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-700', text: 'text-yellow-900 dark:text-yellow-200', dot: 'bg-yellow-400', label: '得到了什麼' },
  outcome: { box: 'bg-gradient-to-br from-amber-400 to-rose-500 border-amber-300', text: 'text-white', dot: 'bg-gradient-to-r from-amber-400 to-rose-500', label: '繼續或解決' },
};
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
  '資料結構': { box: 'bg-orange-50 dark:bg-orange-950/60 border-orange-300 dark:border-orange-700', text: 'text-orange-800 dark:text-orange-200', dot: 'bg-orange-400', label: '資料結構' },
};
const FALLBACK_STYLE: CatStyle = { box: 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600', text: 'text-slate-800 dark:text-slate-200', dot: 'bg-slate-400', label: '其他' };
const styleFor = (n: AlgoNode) => KIND_STYLES[n.kind] ?? CATEGORY_STYLES[n.category] ?? FALLBACK_STYLE;

const EDGE_STYLES: Record<AlgoNodeKind, { cls: string; marker: string; width: number; base: number; dash?: string }> = {
  root:      { cls: 'stroke-slate-300 dark:stroke-slate-600', marker: 'fill-slate-300 dark:fill-slate-600', width: 1.5, base: 0.5 },
  trait:     { cls: 'stroke-slate-300 dark:stroke-slate-600', marker: 'fill-slate-300 dark:fill-slate-600', width: 1.5, base: 0.6 },
  algorithm: { cls: 'stroke-emerald-400 dark:stroke-emerald-500', marker: 'fill-emerald-400 dark:fill-emerald-500', width: 1.75, base: 0.55 },
  gain:      { cls: 'stroke-yellow-400 dark:stroke-yellow-500', marker: 'fill-yellow-400 dark:fill-yellow-500', width: 1.75, base: 0.6 },
  outcome:   { cls: 'stroke-amber-400 dark:stroke-amber-500', marker: 'fill-amber-400 dark:fill-amber-500', width: 1.75, base: 0.7, dash: '6 5' },
};

// ── Graph helpers ──
const nodeById = new Map<string, AlgoNode>(algoNodes.map(n => [n.id, n]));
const outgoing = new Map<string, AlgoEdge[]>();
const incoming = new Map<string, AlgoEdge[]>();
for (const n of algoNodes) { outgoing.set(n.id, []); incoming.set(n.id, []); }
for (const e of algoEdges) { outgoing.get(e.from)!.push(e); incoming.get(e.to)!.push(e); }

/** Fixed layers by kind, ordered with barycenter sweeps to reduce edge crossings. */
function computeLayers(): string[][] {
  const layers: string[][] = LAYER_ORDER.map(k => algoNodes.filter(n => n.kind === k).map(n => n.id));
  const pos = new Map<string, number>();
  const reindex = () => layers.forEach(l => l.forEach((id, i) => pos.set(id, (i + 0.5) / l.length)));
  reindex();
  const avg = (xs: number[], fallback: number) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : fallback);

  for (let pass = 0; pass < 8; pass++) {
    // downward: order by parents
    for (let d = 2; d <= 3; d++) {
      const b = (id: string) => avg(incoming.get(id)!.map(e => pos.get(e.from)!), pos.get(id)!);
      layers[d] = [...layers[d]].sort((x, y) => b(x) - b(y));
      reindex();
    }
    // upward: order by children
    for (let d = 2; d >= 1; d--) {
      const b = (id: string) => avg(outgoing.get(id)!.map(e => pos.get(e.to)!), pos.get(id)!);
      layers[d] = [...layers[d]].sort((x, y) => b(x) - b(y));
      reindex();
    }
  }
  return layers;
}
const FULL_LAYERS = computeLayers();

// ── Auto-collapse ──
/**
 * Which nodes are shown.
 * With auto-collapse on, a column only gets as many nodes as fit on screen (`capacity`).
 * Parents are opened in order while their children still fit; a parent whose children
 * don't fit stays folded (shows "+N") until the user clicks it (`expanded`).
 */
function computeVisible(autoCollapse: boolean, expanded: Set<string>, capacity: number): Set<string> {
  if (!autoCollapse) return new Set(algoNodes.map(n => n.id));
  const visible = new Set<string>([ALGO_ROOT_ID]);
  for (let d = 0; d < FULL_LAYERS.length - 1; d++) {
    const parents = FULL_LAYERS[d].filter(id => visible.has(id));
    const nextLayer = new Set(FULL_LAYERS[d + 1]);
    const countNext = () => FULL_LAYERS[d + 1].filter(id => visible.has(id)).length;
    const open = (id: string) => outgoing.get(id)!.forEach(e => { if (nextLayer.has(e.to)) visible.add(e.to); });
    // 1) parents the user opened (and the root) always show their children
    parents.filter(id => id === ALGO_ROOT_ID || expanded.has(id)).forEach(open);
    // 2) other parents open only while their children still fit
    for (const id of parents) {
      if (id === ALGO_ROOT_ID || expanded.has(id)) continue;
      const newKids = outgoing.get(id)!.filter(e => !visible.has(e.to)).length;
      if (countNext() + newKids <= capacity) open(id);
    }
  }
  return visible;
}

/** Open the parents needed to make `id` visible (used when jumping from the detail panel). */
function revealPath(id: string, expanded: Set<string>, capacity: number): Set<string> {
  const next = new Set(expanded);
  const visit = (target: string, depth = 0) => {
    const vis = computeVisible(true, next, capacity);
    if (vis.has(target) || depth > 8) return;
    const parents = incoming.get(target)!.map(e => e.from);
    const parent = parents.find(p => vis.has(p)) ?? parents[0];
    if (!parent) return;
    visit(parent, depth + 1);
    next.add(parent);
  };
  visit(id);
  return next;
}

function calculateLayout(layout: LayoutMode, isMobile: boolean, visible: Set<string>) {
  // keep the full-graph order so nodes don't jump around when parents open/close
  const LAYERS = FULL_LAYERS.map(l => l.filter(id => visible.has(id)));
  const s = isMobile ? SIZE.mobile : SIZE.desktop;
  const positions = new Map<string, NodePosition>();
  const crossSize = layout === 'vertical' ? s.w : s.h;
  const layerStep = layout === 'vertical' ? s.h + s.gapLayerV : s.w + s.gapLayerH;
  const widest = Math.max(1, ...LAYERS.map(l => l.length));
  const fullSpan = widest * crossSize + (widest - 1) * s.gapCross;
  const layerStarts: number[] = [];

  LAYERS.forEach((layer, d) => {
    // spread smaller layers across the full span so edges stay gentle
    const slot = fullSpan / Math.max(1, layer.length);
    const along = s.pad + d * layerStep;
    layerStarts.push(along);
    layer.forEach((id, i) => {
      const cross = s.pad + i * slot + (slot - crossSize) / 2;
      positions.set(id, layout === 'vertical'
        ? { x: cross, y: along, width: s.w, height: s.h }
        : { x: along, y: cross, width: s.w, height: s.h });
    });
  });

  const alongEnd = s.pad + (LAYERS.length - 1) * layerStep + (layout === 'vertical' ? s.h : s.w);
  const crossEnd = s.pad + fullSpan;
  const bounds = layout === 'vertical'
    ? { width: crossEnd + 24, height: alongEnd + 24 }
    : { width: alongEnd + 24, height: crossEnd + 24 };
  return { positions, bounds, layerStarts, pad: s.pad };
}

function edgePath(from: NodePosition, to: NodePosition, layout: LayoutMode) {
  if (layout === 'vertical') {
    const sx = from.x + from.width / 2, sy = from.y + from.height;
    const ex = to.x + to.width / 2, ey = to.y;
    const my = (sy + ey) / 2;
    return `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`;
  }
  const sx = from.x + from.width, sy = from.y + from.height / 2;
  const ex = to.x, ey = to.y + to.height / 2;
  const mx = (sx + ex) / 2;
  return `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`;
}

/** The loop from 「繼續」 back to 「問題發現」, drawn around the outside of the tree. */
function loopPath(outcome: NodePosition, root: NodePosition, layout: LayoutMode, pad: number) {
  const r = 24;
  if (layout === 'horizontal') {
    const sx = outcome.x + outcome.width / 2, sy = outcome.y;
    const ex = root.x + root.width / 2, ey = root.y;
    const top = 22;
    return `M ${sx} ${sy} L ${sx} ${top + r} Q ${sx} ${top} ${sx - r} ${top} L ${ex + r} ${top} Q ${ex} ${top} ${ex} ${top + r} L ${ex} ${ey}`;
  }
  const sx = outcome.x, sy = outcome.y + outcome.height / 2;
  const ex = root.x, ey = root.y + root.height / 2;
  const left = 22;
  return `M ${sx} ${sy} L ${left + r} ${sy} Q ${left} ${sy} ${left} ${sy - r} L ${left} ${ey + r} Q ${left} ${ey} ${left + r} ${ey} L ${ex} ${ey}`;
}

// ── Edge ──
function AlgoEdgePath({ edge, from, to, layout, state }: {
  key?: string;
  edge: AlgoEdge; from: NodePosition; to: NodePosition; layout: LayoutMode;
  state: 'normal' | 'active' | 'dim';
}) {
  const st = EDGE_STYLES[edge.kind];
  const opacity = state === 'active' ? 1 : state === 'dim' ? 0.06 : st.base;
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
      transition={{ pathLength: { duration: 0.7, ease: 'easeOut' }, opacity: { duration: 0.2 } }}
    />
  );
}

// ── Node ──
function AlgoNodeBox({ node, pos, isMobile, state, onClick, onHover, onLeave, hiddenCount, canFold, onToggleFold }: {
  key?: string;
  node: AlgoNode; pos: NodePosition; isMobile: boolean;
  state: 'normal' | 'active' | 'selected' | 'dim';
  onClick: () => void; onHover: () => void; onLeave: () => void;
  /** children still hidden (folded) */
  hiddenCount: number;
  /** this node was opened and can be folded again */
  canFold: boolean;
  onToggleFold: () => void;
}) {
  const st = styleFor(node);
  const special = node.kind === 'root' || node.kind === 'outcome';
  const Icon = node.kind === 'outcome' ? Flag : node.kind === 'gain' ? Gift : node.kind === 'trait' ? Lightbulb : null;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: state === 'dim' ? 0.22 : 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'backOut' }}
    >
      <foreignObject x={pos.x} y={pos.y} width={pos.width} height={pos.height} style={{ overflow: 'visible' }}>
        <div
          onClick={onClick}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          className={`relative w-full h-full rounded-2xl border-2 cursor-pointer px-2 flex flex-col items-center justify-center text-center leading-tight select-none
            ${st.box} ${special ? 'shadow-lg' : 'shadow-sm'}
            ${state === 'selected' ? 'ring-4 ring-emerald-400/60 dark:ring-emerald-500/50' : ''}
            ${state === 'active' || state === 'selected' ? 'shadow-xl' : ''}`}
          style={{
            transform: state === 'active' || state === 'selected' ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <span className={`flex items-center gap-1 font-headline font-bold ${isMobile ? 'text-[11px]' : 'text-[13px]'} ${st.text} max-w-full`}>
            {Icon && <Icon className="w-3 h-3 flex-shrink-0 opacity-80" />}
            <span className="truncate">{node.labelZh}</span>
          </span>
          <span className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} font-medium opacity-75 ${st.text} truncate max-w-full`}>
            {node.label}
          </span>
          {node.time && !isMobile && (
            <span className={`font-mono text-[9px] mt-0.5 opacity-70 ${st.text} truncate max-w-full`}>{node.time}</span>
          )}
          {(hiddenCount > 0 || canFold) && (
            <button
              onClick={e => { e.stopPropagation(); onToggleFold(); }}
              title={hiddenCount > 0 ? `展開 ${hiddenCount} 個子節點` : '收合子節點'}
              aria-label={hiddenCount > 0 ? `Expand ${hiddenCount} hidden children` : 'Collapse children'}
              className={`absolute -top-2.5 -right-2.5 min-w-[26px] h-[22px] px-1.5 rounded-full text-[11px] font-bold font-mono shadow-md border-2 border-white dark:border-slate-900 transition-transform hover:scale-110
                ${hiddenCount > 0
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-slate-400 dark:bg-slate-600 text-white'}`}
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

function LinkCard({ id, reason, tone, onSelect, prefix = '' }: {
  key?: string;
  id: string; reason: string; tone: 'slate' | 'emerald' | 'yellow' | 'amber'; onSelect: (id: string) => void; prefix?: string;
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
      <button onClick={() => onSelect(id)} className="text-[12px] font-bold text-slate-800 dark:text-slate-100 hover:underline text-left">
        {prefix}{n.labelZh} <span className="font-normal text-slate-400">· {n.label}</span>
      </button>
      <Lines text={reason} />
    </div>
  );
}

function DetailPanel({ nodeId, onClose, onSelect }: { nodeId: string; onClose: () => void; onSelect: (id: string) => void }) {
  const node = nodeById.get(nodeId)!;
  const st = styleFor(node);
  const ins = incoming.get(nodeId)!;
  const outs = outgoing.get(nodeId)!;
  const nexts = algoNext.filter(x => x.from === nodeId);
  const comesFrom = algoNext.filter(x => x.to === nodeId);

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
              <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {LAYER_TITLES[node.kind].zh}{node.kind === 'algorithm' ? ` · ${node.category}` : ''}
              </span>
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
              {node.kind === 'algorithm' ? '什麼時候使用' : '說明'}
            </div>
            <Lines text={node.desc} bullet="text-slate-400" />
          </div>
        )}

        {/* ROOT */}
        {node.kind === 'root' && (
          <section>
            <SectionTitle icon={Lightbulb}>先觀察：問題有哪些特性？ · {outs.length}</SectionTitle>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {outs.map(e => (
                <button key={e.to} onClick={() => onSelect(e.to)}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                  {nodeById.get(e.to)!.labelZh}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* TRAIT */}
        {node.kind === 'trait' && (
          <section>
            <SectionTitle icon={ArrowRight}>這個特性讓這些演算法可用 · {outs.length}</SectionTitle>
            <div className="mt-2 space-y-2.5">
              {outs.map(e => <LinkCard key={e.to} id={e.to} reason={e.reason} tone="emerald" onSelect={onSelect} />)}
            </div>
          </section>
        )}

        {/* ALGORITHM */}
        {node.kind === 'algorithm' && (
          <>
            <section>
              <SectionTitle icon={Lightbulb}>因為問題有這些特性</SectionTitle>
              <div className="mt-2 space-y-2.5">
                {ins.map(e => <LinkCard key={e.from} id={e.from} reason={e.reason} tone="slate" onSelect={onSelect} />)}
              </div>
            </section>
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
                  {nexts.map(x => <LinkCard key={x.to} id={x.to} reason={x.reason} tone="amber" onSelect={onSelect} prefix="→ " />)}
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
              <SectionTitle icon={ArrowRight}>由這些演算法得到 · {ins.length}</SectionTitle>
              <div className="mt-2 space-y-2.5">
                {ins.map(e => <LinkCard key={e.from} id={e.from} reason={e.reason} tone="emerald" onSelect={onSelect} />)}
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
  const [layout, setLayout] = useState<LayoutMode>('horizontal');
  const [isMobile, setIsMobile] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [autoCollapse, setAutoCollapse] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const [viewport, setViewport] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const read = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  // How many nodes fit in one column (Left → Right) or row (Top → Down) at the current zoom
  const capacity = useMemo(() => {
    const sz = isMobile ? SIZE.mobile : SIZE.desktop;
    const room = layout === 'horizontal' ? viewport.h - 170 - sz.pad : viewport.w - 48 - sz.pad;
    const per = (layout === 'horizontal' ? sz.h : sz.w) + sz.gapCross;
    return Math.max(4, Math.floor(room / zoom / per));
  }, [layout, isMobile, viewport, zoom]);

  const visible = useMemo(() => computeVisible(autoCollapse, expanded, capacity), [autoCollapse, expanded, capacity]);
  const { positions, bounds, layerStarts, pad } = useMemo(
    () => calculateLayout(layout, isMobile, visible),
    [layout, isMobile, visible]
  );

  const hiddenChildren = (id: string) =>
    autoCollapse ? outgoing.get(id)!.filter(e => !visible.has(e.to)).length : 0;
  const toggleFold = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (hiddenChildren(id) > 0) next.add(id); else next.delete(id);
    // folding a parent also folds what was opened below it
    if (!next.has(id)) {
      const drop = (x: string) => outgoing.get(x)!.forEach(e => { if (next.delete(e.to)) drop(e.to); });
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
    if (autoCollapse && !visible.has(id)) setExpanded(prev => revealPath(id, prev, capacity));
  };

  // Focus = hovered node, otherwise the selected one.
  // Highlight the whole path through it: upstream to the root, downstream to the outcome.
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

  const rootPos = positions.get(ALGO_ROOT_ID)!;
  const outcomePos = positions.get(ALGO_OUTCOME_ID)!;
  const s = isMobile ? SIZE.mobile : SIZE.desktop;

  const fit = () => {
    const vw = window.innerWidth - 48, vh = window.innerHeight - 170;
    setZoom(Math.max(0.25, Math.min(1, +(Math.min(vw / bounds.width, vh / bounds.height)).toFixed(2))));
  };

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
            <span className="font-headline font-bold text-xs sm:text-base tracking-tight truncate">Algorithm Tree</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Auto-collapse switch */}
          <label
            className="flex items-center gap-2 cursor-pointer select-none px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            title="畫面放不下的子節點先收合，點擊父節點後才展開（關閉則顯示全部）"
          >
            <span className="hidden lg:inline text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">自動收合</span>
            <button
              role="switch"
              aria-checked={autoCollapse}
              aria-label="Auto-collapse crowded parents"
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
        </div>
      </nav>

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
              aria-label="Algorithm tree: problem, traits, algorithms, gains, continue or solved"
            >
              <defs>
                {(Object.keys(EDGE_STYLES) as AlgoNodeKind[]).map(k => (
                  <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className={EDGE_STYLES[k].marker} />
                  </marker>
                ))}
              </defs>

              {/* Column / row titles for each stage */}
              {LAYER_ORDER.map((k, d) => {
                const along = layerStarts[d];
                const center = along + (layout === 'horizontal' ? s.w : s.h) / 2;
                return layout === 'horizontal' ? (
                  <text key={k} x={center} y={pad - 12} textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500 stroke-[#f7f9fb] dark:stroke-slate-950 font-headline font-bold" strokeWidth={5} style={{ fontSize: isMobile ? 11 : 13, letterSpacing: '0.05em', paintOrder: 'stroke' }}>
                    {`${d + 1}. ${LAYER_TITLES[k].zh}`}
                  </text>
                ) : (
                  <text key={k} x={34} y={along - 12}
                    className="fill-slate-400 dark:fill-slate-500 stroke-[#f7f9fb] dark:stroke-slate-950 font-headline font-bold" strokeWidth={5} style={{ fontSize: isMobile ? 11 : 13, letterSpacing: '0.05em', paintOrder: 'stroke' }}>
                    {`${d + 1}. ${LAYER_TITLES[k].zh}`}
                  </text>
                );
              })}

              {/* Loop: 繼續 → 回到問題發現 */}
              {rootPos && outcomePos && (
                <g opacity={focus && !focus.nodes.has(ALGO_OUTCOME_ID) ? 0.15 : 1}>
                  <path
                    d={loopPath(outcomePos, rootPos, layout, pad)}
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
              {[...algoEdges]
                .sort((a, b) => {
                  if (!focus) return 0;
                  return (focus.edges.has(`${a.from}->${a.to}`) ? 1 : 0) - (focus.edges.has(`${b.from}->${b.to}`) ? 1 : 0);
                })
                .map(e => {
                  const from = positions.get(e.from), to = positions.get(e.to);
                  if (!from || !to) return null;
                  const key = `${e.from}->${e.to}`;
                  const state = !focus ? 'normal' : focus.edges.has(key) ? 'active' : 'dim';
                  return <AlgoEdgePath key={key} edge={e} from={from} to={to} layout={layout} state={state} />;
                })}

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
                    hiddenCount={hiddenChildren(n.id)}
                    canFold={autoCollapse && expanded.has(n.id) && n.id !== ALGO_ROOT_ID}
                    onToggleFold={() => toggleFold(n.id)}
                    onHover={() => !isMobile && setHoveredId(n.id)}
                    onLeave={() => setHoveredId(null)}
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
        {(['root', 'trait', 'gain', 'outcome'] as AlgoNodeKind[]).map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${KIND_STYLES[k]!.dot}`} />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">{KIND_STYLES[k]!.label}</span>
          </div>
        ))}
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
    </div>
  );
}
