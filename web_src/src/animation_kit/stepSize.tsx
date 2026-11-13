// Keeps every part of an animation the same size on every step.
//
// The stepper renders every step once, invisibly ("measure"), reads the height of each
// marked part, and then gives the visible animation ("show") those heights as minimums.
// Parts that only appear on some steps keep their space reserved on the other steps,
// so nothing below them jumps.
import React, { createContext, useContext } from 'react';

export type StepLayout = {
  /** tallest height seen for each part, by key */
  heights: Record<string, number>;
  /** order of the parts inside each column, merged across all steps */
  order: Record<string, string[]>;
};

type Ctx = { mode: 'off' | 'measure' | 'show'; layout?: StepLayout };
const StepSizeCtx = createContext<Ctx>({ mode: 'off' });

export const StepSizeProvider = ({ value, children }: { value: Ctx; children: React.ReactNode }) => (
  <StepSizeCtx.Provider value={value}>{children}</StepSizeCtx.Provider>
);

export const useStepSize = () => useContext(StepSizeCtx);

/** Props for an element whose height should stay fixed across steps. */
export function useSlot(key: string): { 'data-slot': string; style?: React.CSSProperties } {
  const { mode, layout } = useStepSize();
  const h = mode === 'show' ? layout?.heights[key] : undefined;
  return { 'data-slot': key, style: h ? { minHeight: h } : undefined };
}

/* Stable key for a child element: its component + how many of that component came before. */
const typeIds = new WeakMap<object, number>();
let nextTypeId = 1;
function typeKey(t: unknown): string {
  if (typeof t === 'string') return t;
  if (t && (typeof t === 'object' || typeof t === 'function')) {
    if (!typeIds.has(t as object)) typeIds.set(t as object, nextTypeId++);
    return 't' + typeIds.get(t as object);
  }
  return 'x';
}

/**
 * A column of parts (e.g. the CPU/memory row, the screen). Each part gets a fixed-height
 * cell; parts missing on this step still get an empty cell of the right height.
 */
export const SlotColumn = ({ col, className, children }: { col: string; className?: string; children: React.ReactNode }) => {
  const { mode, layout } = useStepSize();
  const counts: Record<string, number> = {};
  const present: { key: string; node: React.ReactNode }[] = [];
  React.Children.toArray(children).forEach((c) => {
    const t = typeKey(React.isValidElement(c) ? c.type : typeof c);
    counts[t] = (counts[t] ?? 0) + 1;
    present.push({ key: `${col}:${t}#${counts[t]}`, node: c });
  });

  let keys = present.map((p) => p.key);
  if (mode === 'show' && layout?.order[col]) {
    const merged = [...layout.order[col]];
    keys.forEach((k) => { if (!merged.includes(k)) merged.push(k); });
    keys = merged;
  }
  const byKey = new Map(present.map((p) => [p.key, p.node]));

  return (
    <div className={className} data-slot-col={col}>
      {keys.map((k) => {
        const h = mode === 'show' ? layout?.heights[k] : undefined;
        const node = byKey.get(k);
        if (node === undefined && !h) return null;
        // grid: the part stretches to fill the reserved height
        return (
          <div key={k} data-slot={k} className="grid min-w-0" style={h ? { minHeight: h } : undefined}>
            {node ?? null}
          </div>
        );
      })}
    </div>
  );
};

/** Read heights and order from the invisible renders of every step. */
export function measureLayout(ghosts: (HTMLElement | null)[]): StepLayout {
  const heights: Record<string, number> = {};
  const order: Record<string, string[]> = {};
  for (const g of ghosts) {
    if (!g) continue;
    g.querySelectorAll<HTMLElement>('[data-slot]').forEach((el) => {
      const k = el.dataset.slot!;
      heights[k] = Math.max(heights[k] ?? 0, Math.ceil(el.getBoundingClientRect().height));
    });
    g.querySelectorAll<HTMLElement>('[data-slot-col]').forEach((colEl) => {
      const col = colEl.dataset.slotCol!;
      const list = (order[col] ??= []);
      let prev = -1;
      Array.from(colEl.children).forEach((child) => {
        const k = (child as HTMLElement).dataset.slot;
        if (!k) return;
        const at = list.indexOf(k);
        if (at === -1) { list.splice(prev + 1, 0, k); prev += 1; }
        else if (at > prev) prev = at;
      });
    });
  }
  return { heights, order };
}
