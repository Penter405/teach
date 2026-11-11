import React from 'react';

// Registry: eagerly imports every numbered animation in src/animations (e.g. 1.tsx, 28.tsx)
const modules = import.meta.glob('../animations/*.tsx', { eager: true }) as Record<string, { default: React.ComponentType<{ step: number }> }>;

const registry: Record<number, (step: number) => React.ReactNode> = {};

for (const path in modules) {
  // Match filenames like "../animations/1.tsx", "../animations/20.tsx", etc.
  const match = path.match(/\/(\d+)\.tsx$/);
  if (match) {
    const id = parseInt(match[1], 10);
    const Component = modules[path].default;
    if (Component) {
      registry[id] = (s: number) => <Component step={s} />;
    }
  }
}

export function getAnimationRenderer(id: number | undefined): ((step: number) => React.ReactNode) | undefined {
  if (id === undefined || id === null) return undefined;
  return registry[id];
}

export default registry;
