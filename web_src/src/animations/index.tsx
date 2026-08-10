import React from 'react';

// Use Vite's import.meta.glob to eagerly import all .tsx files in the animations directory
const modules = import.meta.glob('./*.tsx', { eager: true }) as Record<string, { default: React.ComponentType<{ step: number }> }>;

const registry: Record<number, (step: number) => React.ReactNode> = {};

for (const path in modules) {
  // Match filenames like "./1.tsx", "./20.tsx", etc.
  const match = path.match(/\.\/(\d+)\.tsx$/);
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
