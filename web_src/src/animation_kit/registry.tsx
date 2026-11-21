import React from 'react';

// Registry: eagerly imports every numbered animation in src/animations (e.g. 1.tsx, 28.tsx)
const modules = import.meta.glob('../animations/*.tsx', { eager: true }) as Record<string, { default: React.ComponentType<{ step: number }> }>;

const registry: Record<number, (step: number) => React.ReactNode> = {};

// 中文步驟 (pseudo code): traced animations have it when trace/N.ts has `pseudo`;
// hand-written ones say so with `export const HAS_PSEUDO = true` in N.tsx
const traces = import.meta.glob('../animations/trace/*.ts', { eager: true }) as Record<string, { default?: { pseudo?: string[] } }>;
const pseudoIds = new Set<number>();
for (const path in traces) {
  const m = path.match(/\/(\d+)\.ts$/);
  if (m && traces[path].default?.pseudo?.length) pseudoIds.add(parseInt(m[1], 10));
}

for (const path in modules) {
  // Match filenames like "../animations/1.tsx", "../animations/20.tsx", etc.
  const match = path.match(/\/(\d+)\.tsx$/);
  if (match) {
    const id = parseInt(match[1], 10);
    const Component = modules[path].default;
    if ((modules[path] as { HAS_PSEUDO?: boolean }).HAS_PSEUDO) pseudoIds.add(id);
    if (Component) {
      registry[id] = (s: number) => <Component step={s} />;
    }
  }
}

export function getAnimationRenderer(id: number | undefined): ((step: number) => React.ReactNode) | undefined {
  if (id === undefined || id === null) return undefined;
  return registry[id];
}

/** does animation `id` have a 中文步驟 version of its code? */
export const hasPseudo = (id: number | undefined) => id !== undefined && pseudoIds.has(id);

export default registry;
