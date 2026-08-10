// DynamicArrows - Shared helper for animations 18, 19, 20
import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { motion } from 'motion/react';

export const DynamicArrows = ({
  containerRef,
  verbRef,
  leftRef,
  rightRef,
  color,
  show,
  animateIn = false,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  verbRef: React.RefObject<HTMLDivElement | null>;
  leftRef: React.RefObject<HTMLDivElement | null>;
  rightRef: React.RefObject<HTMLDivElement | null>;
  color: string;
  show: boolean;
  animateIn?: boolean;
}) => {
  const [coords, setCoords] = useState<{
    vx: number; vy: number;
    lx: number; ly: number;
    rx: number; ry: number;
  } | null>(null);

  const measure = useCallback(() => {
    const c = containerRef.current;
    const v = verbRef.current;
    const l = leftRef.current;
    const r = rightRef.current;
    if (!c || !v || !l || !r) return;
    const cr = c.getBoundingClientRect();
    const vr = v.getBoundingClientRect();
    const lr = l.getBoundingClientRect();
    const rr = r.getBoundingClientRect();
    setCoords({
      vx: vr.left + vr.width / 2 - cr.left,
      vy: vr.top - cr.top,
      lx: lr.left + lr.width / 2 - cr.left,
      ly: lr.top - cr.top,
      rx: rr.left + rr.width / 2 - cr.left,
      ry: rr.top - cr.top,
    });
  }, [containerRef, verbRef, leftRef, rightRef]);

  useLayoutEffect(() => { measure(); }, [measure]);
  useEffect(() => {
    measure();
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 200);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  if (!coords) return null;

  const offset = 10;
  const arcHeight = 30;
  const armLen = 7;

  const sx = coords.vx;
  const sy = coords.vy - offset;
  const lx = coords.lx;
  const ly = coords.ly - offset;
  const rx = coords.rx;
  const ry = coords.ry - offset;

  const lcx = (sx + lx) / 2;
  const lcy = Math.min(sy, ly) - arcHeight;
  const rcx = (sx + rx) / 2;
  const rcy = Math.min(sy, ry) - arcHeight;

  const qAt = (t: number, p0: number, p1: number, p2: number) =>
    (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  const tEnd = 0.88;
  const lEndX = qAt(tEnd, sx, lcx, lx);
  const lEndY = qAt(tEnd, sy, lcy, ly);
  const rEndX = qAt(tEnd, sx, rcx, rx);
  const rEndY = qAt(tEnd, sy, rcy, ry);

  const splitCtrl = (t: number, p0: number, p1: number) =>
    (1 - t) * p0 + t * p1;
  const lCtrlX = splitCtrl(tEnd, sx, lcx);
  const lCtrlY = splitCtrl(tEnd, sy, lcy);
  const rCtrlX = splitCtrl(tEnd, sx, rcx);
  const rCtrlY = splitCtrl(tEnd, sy, rcy);

  const lTanX = lx - lcx;
  const lTanY = ly - lcy;
  const rTanX = rx - rcx;
  const rTanY = ry - rcy;

  const vArrow = (tipX: number, tipY: number, tanX: number, tanY: number) => {
    const len = Math.sqrt(tanX * tanX + tanY * tanY);
    const dx = tanX / len;
    const dy = tanY / len;
    const bx = -dx;
    const by = -dy;
    const px = -dy;
    const py = dx;
    const spread = 0.5;
    const a1x = tipX + (bx + px * spread) * armLen;
    const a1y = tipY + (by + py * spread) * armLen;
    const a2x = tipX + (bx - px * spread) * armLen;
    const a2y = tipY + (by - py * spread) * armLen;
    return `${a1x.toFixed(1)},${a1y.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${a2x.toFixed(1)},${a2y.toFixed(1)}`;
  };

  const leftArrowhead = vArrow(lx, ly, lTanX, lTanY);
  const rightArrowhead = vArrow(rx, ry, rTanX, rTanY);

  const leftPath = `M ${sx},${sy} Q ${lCtrlX.toFixed(1)},${lCtrlY.toFixed(1)} ${lEndX.toFixed(1)},${lEndY.toFixed(1)}`;
  const rightPath = `M ${sx},${sy} Q ${rCtrlX.toFixed(1)},${rCtrlY.toFixed(1)} ${rEndX.toFixed(1)},${rEndY.toFixed(1)}`;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible', opacity: show ? 1 : 0, transition: 'opacity 0.3s' }}>
      {animateIn ? (
        <>
          <motion.path d={leftPath} fill="none" stroke={color} strokeWidth="3" strokeDasharray="5,5" initial={{ pathLength: 0 }} animate={{ pathLength: show ? 1 : 0 }} transition={{ duration: 0.5 }} />
          <motion.path d={rightPath} fill="none" stroke={color} strokeWidth="3" strokeDasharray="5,5" initial={{ pathLength: 0 }} animate={{ pathLength: show ? 1 : 0 }} transition={{ duration: 0.5 }} />
          <motion.polyline points={leftArrowhead} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: 0.3 }} />
          <motion.polyline points={rightArrowhead} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: 0.3 }} />
        </>
      ) : (
        <>
          <path d={leftPath} fill="none" stroke={color} strokeWidth="3" strokeDasharray="5,5" />
          <path d={rightPath} fill="none" stroke={color} strokeWidth="3" strokeDasharray="5,5" />
          <polyline points={leftArrowhead} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={rightArrowhead} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
};
