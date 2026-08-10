// Animation registry - maps animation numbers to their components
// Each animation is in its own numbered file (1.tsx, 2.tsx, etc.)
import React from 'react';

// Import all animations
import Animation1 from './1';
import Animation2 from './2';
import Animation3 from './3';
import Animation4 from './4';
import Animation5 from './5';
import Animation6 from './6';
import Animation7 from './7';
import Animation8 from './8';
import Animation9 from './9';
import Animation10 from './10';
import Animation11 from './11';
import Animation12 from './12';
import Animation13 from './13';
import Animation14 from './14';
import Animation15 from './15';
import Animation16 from './16';
import Animation17 from './17';
import Animation18 from './18';
import Animation19 from './19';
import Animation20 from './20';

/**
 * Registry mapping animation number/ID to its React component.
 * Supports both numeric IDs (new) and legacy string IDs (backward compat).
 */
const animationRegistry: Record<string | number, (step: number) => React.ReactNode> = {
  // Numeric IDs (new system)
  1: (s) => <Animation1 step={s} />,
  2: (s) => <Animation2 step={s} />,
  3: (s) => <Animation3 step={s} />,
  4: (s) => <Animation4 step={s} />,
  5: (s) => <Animation5 step={s} />,
  6: (s) => <Animation6 step={s} />,
  7: (s) => <Animation7 step={s} />,
  8: (s) => <Animation8 step={s} />,
  9: (s) => <Animation9 step={s} />,
  10: (s) => <Animation10 step={s} />,
  11: (s) => <Animation11 step={s} />,
  12: (s) => <Animation12 step={s} />,
  13: (s) => <Animation13 step={s} />,
  14: (s) => <Animation14 step={s} />,
  15: (s) => <Animation15 step={s} />,
  16: (s) => <Animation16 step={s} />,
  17: (s) => <Animation17 step={s} />,
  18: (s) => <Animation18 step={s} />,
  19: (s) => <Animation19 step={s} />,
  20: (s) => <Animation20 step={s} />,

  // Legacy string IDs (backward compatibility with existing data.json)
  'data-flow-animation': (s) => <Animation1 step={s} />,
  'problem-decompose': (s) => <Animation2 step={s} />,
  'interpreter-exec': (s) => <Animation3 step={s} />,
  'class-world': (s) => <Animation4 step={s} />,
  'builtin-class': (s) => <Animation5 step={s} />,
  'self-binding': (s) => <Animation6 step={s} />,
  'reflection-inspect': (s) => <Animation7 step={s} />,
  'data-pipeline': (s) => <Animation8 step={s} />,
  'gc-animation': (s) => <Animation9 step={s} />,
  'pointer-animation': (s) => <Animation10 step={s} />,
  'immutable-swap': (s) => <Animation11 step={s} />,
  'mutable-ref': (s) => <Animation12 step={s} />,
  'indent-animation': (s) => <Animation13 step={s} />,
  'house-analogy': (s) => <Animation14 step={s} />,
  'immutable-house': (s) => <Animation15 step={s} />,
  'mutable-house': (s) => <Animation16 step={s} />,
  'subject-verb-object': (s) => <Animation17 step={s} />,
  'assign-x-2': (s) => <Animation18 step={s} />,
  'add-3-5': (s) => <Animation19 step={s} />,
  'combo-assign-add': (s) => <Animation20 step={s} />,
};

export function getAnimationRenderer(id: string | number | undefined): ((step: number) => React.ReactNode) | undefined {
  if (id === undefined || id === null) return undefined;
  return animationRegistry[id];
}

export default animationRegistry;
