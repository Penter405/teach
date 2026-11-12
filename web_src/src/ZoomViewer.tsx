// Full-screen viewer used for images and animations.
// - Opens fitted to the screen; wheel / pinch / +− buttons to zoom, drag to pan.
// - Double-click toggles between "fit" and 2× of fit.
// - Esc, the ✕ button, or a click on the dark background closes it.
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize, Minus, Plus, X } from 'lucide-react';

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

interface ZoomViewerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Shown in a fixed bar under the zoomed content (not scaled), e.g. animation step controls. */
  footer?: React.ReactNode;
  /** Caption shown at the top-left. */
  title?: React.ReactNode;
  /** Extra keyboard handling (e.g. ← → for animation steps). Return true if handled. */
  onKey?: (e: KeyboardEvent) => boolean;
  /** Largest scale the initial "fit" may pick. */
  maxFit?: number;
}

export function ZoomViewer({ open, onClose, children, footer, title, onKey, maxFit = 4 }: ZoomViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [fitScale, setFitScale] = useState(1);
  const [ready, setReady] = useState(false);
  const touched = useRef(false); // user zoomed/panned → stop auto-refit on resize
  const view = useRef({ scale: 1, x: 0, y: 0 });
  view.current = { scale, x: offset.x, y: offset.y };

  // ── fit content to the stage ──
  const fit = useCallback(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return false;
    const w = content.offsetWidth;
    const h = content.offsetHeight;
    if (!w || !h) return false;
    const s = clamp(Math.min((stage.clientWidth * 0.94) / w, (stage.clientHeight * 0.94) / h), MIN_SCALE, maxFit);
    setFitScale(s);
    setScale(s);
    setOffset({ x: 0, y: 0 });
    setReady(true);
    return true;
  }, [maxFit]);

  useLayoutEffect(() => {
    if (!open) return;
    touched.current = false;
    setReady(false);
    const content = contentRef.current;
    if (!content) return;
    // Content (e.g. an image) may not have a size yet — refit once it does.
    const ro = new ResizeObserver(() => {
      if (!touched.current) fit();
    });
    ro.observe(content);
    fit();
    const onResize = () => { if (!touched.current) fit(); };
    window.addEventListener('resize', onResize);
    return () => { ro.disconnect(); window.removeEventListener('resize', onResize); };
  }, [open, fit]);

  // ── zoom around a point (stage-centre coordinates) ──
  const zoomAt = useCallback((nextScale: number, px = 0, py = 0) => {
    const { scale: s, x, y } = view.current;
    const ns = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    touched.current = true;
    setScale(ns);
    setOffset({ x: px - ((px - x) * ns) / s, y: py - ((py - y) * ns) / s });
  }, []);

  const toStage = (clientX: number, clientY: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  };

  // Wheel must be non-passive to prevent page scroll.
  useEffect(() => {
    const stage = stageRef.current;
    if (!open || !stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toStage(e.clientX, e.clientY);
      zoomAt(view.current.scale * Math.exp(-e.deltaY * 0.0015), p.x, p.y);
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [open, zoomAt]);

  // ── keyboard + scroll lock ──
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (onKey?.(e)) { e.preventDefault(); return; }
      if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') zoomAt(view.current.scale * 1.25);
      else if (e.key === '-') zoomAt(view.current.scale / 1.25);
      else if (e.key === '0') { touched.current = false; fit(); }
    };
    window.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = prev; };
  }, [open, onClose, onKey, zoomAt, fit]);

  // ── drag to pan, two fingers to pinch ──
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: boolean; onContent: boolean; startDist: number; startScale: number; last: { x: number; y: number } } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-zoom-ui]')) return;
    stageRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current = {
      moved: gesture.current?.moved ?? false,
      onContent: gesture.current?.onContent ?? !!contentRef.current?.contains(e.target as Node),
      startDist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      startScale: view.current.scale,
      last: { x: e.clientX, y: e.clientY },
    };
    if (pointers.current.size === 1) {
      gesture.current.moved = false;
      gesture.current.onContent = !!contentRef.current?.contains(e.target as Node);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && g.startDist > 0) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = toStage((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
      zoomAt((g.startScale * d) / g.startDist, mid.x, mid.y);
      g.moved = true;
      return;
    }
    const dx = e.clientX - g.last.x;
    const dy = e.clientY - g.last.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) g.moved = true;
    g.last = { x: e.clientX, y: e.clientY };
    if (g.moved) {
      touched.current = true;
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasDrag = gesture.current?.moved;
    const startedOnContent = gesture.current?.onContent;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      if (gesture.current) { gesture.current.last = p; gesture.current.startDist = 0; }
      return;
    }
    if (pointers.current.size === 0) {
      // A plain click on the dark background (not on the content) closes the viewer.
      if (!wasDrag && !startedOnContent && e.type === 'pointerup') onClose();
      gesture.current = null;
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const p = toStage(e.clientX, e.clientY);
    if (view.current.scale > fitScale * 1.5) { touched.current = false; fit(); }
    else zoomAt(fitScale * 2, p.x, p.y);
  };

  if (!open) return null;

  const btn = 'p-2 rounded-lg text-slate-200 hover:bg-white/10 transition-colors';

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950/90 backdrop-blur-sm" role="dialog" aria-modal="true">
      {/* top bar */}
      <div data-zoom-ui className="flex items-center gap-2 px-3 sm:px-5 h-14 shrink-0 text-slate-200">
        <div className="flex-1 min-w-0 truncate text-sm font-medium text-slate-300">{title}</div>
        <span className="hidden md:inline text-xs text-slate-500 mr-2">滾輪縮放 · 拖曳移動 · 雙擊放大 · Esc 關閉</span>
        <button className={btn} onClick={() => zoomAt(scale / 1.25)} aria-label="Zoom out"><Minus size={18} /></button>
        <button className="w-14 text-center text-xs font-mono tabular-nums text-slate-300 hover:text-white" onClick={() => { touched.current = false; fit(); }} title="Fit to screen">
          {Math.round(scale * 100)}%
        </button>
        <button className={btn} onClick={() => zoomAt(scale * 1.25)} aria-label="Zoom in"><Plus size={18} /></button>
        <button className={btn} onClick={() => { touched.current = false; fit(); }} aria-label="Fit to screen"><Maximize size={18} /></button>
        <button className={`${btn} ml-1`} onClick={onClose} aria-label="Close"><X size={20} /></button>
      </div>

      {/* stage */}
      <div
        ref={stageRef}
        className="relative flex-1 min-h-0 overflow-hidden touch-none cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        <div
          ref={contentRef}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            opacity: ready ? 1 : 0,
          }}
        >
          {children}
        </div>
      </div>

      {footer && <div data-zoom-ui className="shrink-0">{footer}</div>}
    </div>,
    document.body,
  );
}
