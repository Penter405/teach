import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, GitBranch, AlignVerticalSpaceAround, AlignHorizontalSpaceAround } from 'lucide-react';
import { codeTree, getCategoryColor, TreeNode } from './codeTreeData';

// ── Types ──
type LayoutMode = 'vertical' | 'horizontal';

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Constants ──
const NODE_WIDTH = 150;
const NODE_HEIGHT = 68;
const V_GAP_X = 40;
const V_GAP_Y = 90;
const H_GAP_X = 90;
const H_GAP_Y = 40;

// ── Tree Layout Calculator ──
function calculateLayout(
  node: TreeNode,
  layout: LayoutMode,
  depth: number = 0,
  siblingIndex: number = 0,
  positions: Map<string, NodePosition> = new Map(),
  nextSlot: { value: number } = { value: 0 }
): Map<string, NodePosition> {
  if (node.children.length === 0) {
    // Leaf node
    if (layout === 'vertical') {
      positions.set(node.id, {
        x: nextSlot.value * (NODE_WIDTH + V_GAP_X),
        y: depth * (NODE_HEIGHT + V_GAP_Y),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    } else {
      positions.set(node.id, {
        x: depth * (NODE_WIDTH + H_GAP_X),
        y: nextSlot.value * (NODE_HEIGHT + H_GAP_Y),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    }
    nextSlot.value++;
  } else {
    // Parent node — recurse children first
    const childPositions: NodePosition[] = [];
    node.children.forEach((child, i) => {
      calculateLayout(child, layout, depth + 1, i, positions, nextSlot);
      const childPos = positions.get(child.id);
      if (childPos) childPositions.push(childPos);
    });

    // Center parent over its children
    const firstChild = childPositions[0];
    const lastChild = childPositions[childPositions.length - 1];
    
    if (layout === 'vertical') {
      const centerX = (firstChild.x + lastChild.x) / 2;
      positions.set(node.id, {
        x: centerX,
        y: depth * (NODE_HEIGHT + V_GAP_Y),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    } else {
      const centerY = (firstChild.y + lastChild.y) / 2;
      positions.set(node.id, {
        x: depth * (NODE_WIDTH + H_GAP_X),
        y: centerY,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    }
  }

  return positions;
}

// ── SVG Edge Component ──
function TreeEdge({ 
  from, to, layout 
}: { 
  key?: string | number;
  from: NodePosition; to: NodePosition; layout: LayoutMode 
}) {
  let d: string;
  
  if (layout === 'vertical') {
    const startX = from.x + from.width / 2;
    const startY = from.y + from.height;
    const endX = to.x + to.width / 2;
    const endY = to.y;
    const midY = (startY + endY) / 2;
    d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  } else {
    const startX = from.x + from.width;
    const startY = from.y + from.height / 2;
    const endX = to.x;
    const endY = to.y + to.height / 2;
    const midX = (startX + endX) / 2;
    d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  }

  return (
    <motion.path
      d={d}
      fill="none"
      strokeWidth={2}
      className="stroke-slate-300 dark:stroke-slate-600"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
}

// ── Tree Node Component ──
function TreeNodeComponent({
  node,
  position,
  onNodeClick,
  isHovered,
  onHover,
  onLeave,
}: {
  key?: string | number;
  node: TreeNode;
  position: NodePosition;
  onNodeClick: (id: string) => void;
  isHovered: boolean;
  onHover: (id: string) => void;
  onLeave: () => void;
}) {
  const colors = getCategoryColor(node.category);
  const isRoot = node.category === 'root';

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'backOut' }}
    >
      <foreignObject
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
      >
        <div
          className={`
            w-full h-full rounded-2xl cursor-pointer
            flex flex-col items-center justify-center gap-1
            transition-all duration-200
            border-2
            ${isRoot ? colors.bg : `${colors.bg} ${colors.bgDark}`}
            ${colors.border} ${colors.borderDark}
            ${isHovered ? `scale-110 ${colors.glow} z-50` : 'scale-100'}
          `}
          style={{ 
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onClick={() => onNodeClick(node.id)}
          onMouseEnter={() => onHover(node.id)}
          onMouseLeave={onLeave}
        >
          <span className={`font-headline text-sm font-bold tracking-tight ${isRoot ? colors.text : `${colors.text} ${colors.textDark}`}`}>
            {node.label}
          </span>
          <span className={`text-[11px] font-medium opacity-70 ${isRoot ? 'text-white/80' : `${colors.text} ${colors.textDark}`}`}>
            {node.labelZh}
          </span>
        </div>
      </foreignObject>
    </motion.g>
  );
}

// ── Tooltip ──
function NodeTooltip({ 
  node, position 
}: { 
  key?: string | number;
  node: TreeNode; position: NodePosition 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute z-[100] pointer-events-none"
      style={{
        left: position.x + position.width / 2,
        top: position.y - 10,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-xl px-4 py-3 shadow-xl border border-slate-200 dark:border-slate-700 max-w-[260px]">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {node.brief}
        </p>
        <div className="mt-2 text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest">
          Click to explore →
        </div>
      </div>
    </motion.div>
  );
}

// ── Recursive edge + node renderer ──
function renderTree(
  node: TreeNode,
  positions: Map<string, NodePosition>,
  layout: LayoutMode,
  onNodeClick: (id: string) => void,
  hoveredId: string | null,
  onHover: (id: string) => void,
  onLeave: () => void,
): { edges: React.ReactNode[]; nodes: React.ReactNode[] } {
  const result = { edges: [] as React.ReactNode[], nodes: [] as React.ReactNode[] };
  const pos = positions.get(node.id);
  if (!pos) return result;

  // Edges from this node to children
  for (const child of node.children) {
    const childPos = positions.get(child.id);
    if (childPos) {
      result.edges.push(
        <TreeEdge key={`${node.id}-${child.id}`} from={pos} to={childPos} layout={layout} />
      );
    }
    // Recurse
    const childResult = renderTree(child, positions, layout, onNodeClick, hoveredId, onHover, onLeave);
    result.edges.push(...childResult.edges);
    result.nodes.push(...childResult.nodes);
  }

  // This node
  result.nodes.push(
    <TreeNodeComponent
      key={node.id}
      node={node}
      position={pos}
      onNodeClick={onNodeClick}
      isHovered={hoveredId === node.id}
      onHover={onHover}
      onLeave={onLeave}
    />
  );

  return result;
}

// ── Main Component ──
export function CodeSyntaxTreePage({
  onBack,
  onNodeClick,
}: {
  onBack: () => void;
  onNodeClick: (nodeId: string) => void;
}) {
  const [layout, setLayout] = useState<LayoutMode>('vertical');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const positions = useMemo(
    () => calculateLayout(codeTree, layout),
    [layout]
  );

  // Calculate SVG bounds
  const bounds = useMemo(() => {
    let maxX = 0, maxY = 0;
    positions.forEach((pos) => {
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });
    return { width: maxX + 60, height: maxY + 60 };
  }, [positions]);

  const { edges, nodes } = useMemo(
    () => renderTree(codeTree, positions, layout, onNodeClick, hoveredId, (id) => setHoveredId(id), () => setHoveredId(null)),
    [positions, layout, onNodeClick, hoveredId]
  );

  const hoveredNode = hoveredId ? findNode(codeTree, hoveredId) : null;
  const hoveredPos = hoveredId ? positions.get(hoveredId) : null;

  return (
    <div className="h-screen bg-surface dark:bg-slate-950 flex flex-col transition-colors duration-500 overflow-hidden">
      {/* Header */}
      <nav className="w-full flex-shrink-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-4 md:px-6 py-3">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-semibold uppercase tracking-wider"
          >
            <ChevronRight className="w-5 h-5 rotate-180" /> Back
          </button>

          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
            <GitBranch className="w-5 h-5" />
            <span className="font-headline font-bold text-base tracking-tight">Code Syntax Tree</span>
          </div>
        </div>

        {/* Layout Toggle */}
        <button
          onClick={() => setLayout(l => l === 'vertical' ? 'horizontal' : 'vertical')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        >
          {layout === 'vertical' ? (
            <>
              <AlignVerticalSpaceAround className="w-4 h-4" />
              <span className="hidden sm:inline">Top → Down</span>
            </>
          ) : (
            <>
              <AlignHorizontalSpaceAround className="w-4 h-4" />
              <span className="hidden sm:inline">Left → Right</span>
            </>
          )}
        </button>
      </nav>

      {/* Tree Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center relative"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-500/5 dark:bg-cyan-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative p-8" style={{ minWidth: bounds.width, minHeight: bounds.height }}>
          <svg
            width={bounds.width}
            height={bounds.height}
            className="absolute top-8 left-8"
            style={{ overflow: 'visible' }}
          >
            {edges}
            {nodes}
          </svg>

          {/* Tooltip overlay */}
          <AnimatePresence>
            {hoveredNode && hoveredPos && (
              <NodeTooltip key={hoveredId} node={hoveredNode} position={hoveredPos} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6 flex-wrap">
        {[
          { label: 'Root', cls: 'bg-gradient-to-r from-cyan-500 to-purple-500' },
          { label: 'Structure', cls: 'bg-cyan-200 dark:bg-cyan-800' },
          { label: 'Singo', cls: 'bg-purple-200 dark:bg-purple-800' },
          { label: 'Verb', cls: 'bg-amber-200 dark:bg-amber-800' },
          { label: 'Noun', cls: 'bg-emerald-200 dark:bg-emerald-800' },
          { label: 'Leaf', cls: 'bg-slate-200 dark:bg-slate-700' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.cls}`} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helper: find node by id ──
function findNode(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}
