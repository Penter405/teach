// This script extracts animation components from LessonContent.tsx into individual numbered files.
// Run with: node extract_animations.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcFile = join(__dirname, '..', 'web_src', 'src', 'LessonContent.tsx');
const animDir = join(__dirname, '..', 'web_src', 'src', 'animations');

const src = readFileSync(srcFile, 'utf-8');
const lines = src.split(/\r?\n/);

// Animation definitions: [number, startLine (0-indexed), endLine (exclusive), componentName, needsExtra]
const animations = [
  // [num, startMarker, componentName, extraImports]
  [2, 'ProblemDecomposeAnim', ['CheckCircle2']],
  [3, 'InterpreterExecAnim', ['Bolt']],
  [4, 'ClassWorldAnim', []],
  [5, 'BuiltinClassAnim', []],
  [6, 'SelfBindingAnim', ['CheckCircle2']],
  [7, 'ReflectionInspectAnim', []],
  [8, 'DataPipelineAnim', []],
  [9, 'GCAnimationAnim', []],
  [10, 'PointerAnim', []],
  [11, 'ImmutableSwapAnim', []],
  [12, 'MutableRefAnim', []],
  [13, 'IndentAnim', ['CheckCircle2']],
  [14, 'HouseAnalogyAnim', []],
  [15, 'ImmutableHouseAnim', ['XCircle']],
  [16, 'MutableHouseAnim', []],
  [17, 'SubjectVerbObjectAnim', []],
  [18, 'AssignX2Anim', ['DynamicArrows']],
  [19, 'Add35Anim', ['DynamicArrows']],
  [20, 'ComboAssignAddAnim', ['DynamicArrows']],
];

function findComponentBounds(name) {
  const startPattern = `const ${name} = `;
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith(startPattern)) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) {
    console.error(`Could not find ${name}`);
    return null;
  }
  
  // Find the end: look for `};` at the start of a line (closing the const)
  let braceCount = 0;
  let inBody = false;
  for (let i = startIdx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{' || ch === '(') { braceCount++; inBody = true; }
      if (ch === '}' || ch === ')') braceCount--;
    }
    if (inBody && braceCount <= 0) {
      return { start: startIdx, end: i + 1 };
    }
  }
  return null;
}

for (const [num, name, extras] of animations) {
  const bounds = findComponentBounds(name);
  if (!bounds) {
    console.error(`Skipping ${name}`);
    continue;
  }
  
  const body = lines.slice(bounds.start, bounds.end).join('\n');
  
  // Build the file
  const needsBox = body.includes('<Box ') || body.includes('<AnimArrow');
  const needsAnimatePresence = body.includes('AnimatePresence');
  const needsUseRef = body.includes('useRef');
  const needsUseState = body.includes('useState');
  const needsUseCallback = body.includes('useCallback');
  const needsUseLayoutEffect = body.includes('useLayoutEffect');
  const needsUseEffect = body.includes('useEffect');
  
  let imports = `import React from 'react';\n`;
  
  // React hooks
  const hooks = [];
  if (needsUseRef) hooks.push('useRef');
  if (needsUseState) hooks.push('useState');
  if (needsUseCallback) hooks.push('useCallback');
  if (needsUseLayoutEffect) hooks.push('useLayoutEffect');
  if (needsUseEffect) hooks.push('useEffect');
  if (hooks.length > 0) {
    imports = `import React, { ${hooks.join(', ')} } from 'react';\n`;
  }
  
  // motion/react
  const motionImports = ['motion'];
  if (needsAnimatePresence) motionImports.push('AnimatePresence');
  imports += `import { ${motionImports.join(', ')} } from 'motion/react';\n`;
  
  // lucide-react
  const lucideImports = [];
  for (const extra of extras) {
    if (extra !== 'DynamicArrows' && body.includes(extra)) {
      lucideImports.push(extra);
    }
  }
  // Also check for common icons used
  if (body.includes('<Bolt ')) lucideImports.push('Bolt');
  if (body.includes('<CheckCircle2 ')) lucideImports.push('CheckCircle2');
  if (body.includes('<XCircle ')) lucideImports.push('XCircle');
  // Dedupe
  const uniqueLucide = [...new Set(lucideImports)];
  if (uniqueLucide.length > 0) {
    imports += `import { ${uniqueLucide.join(', ')} } from 'lucide-react';\n`;
  }
  
  // shared imports
  if (needsBox) {
    const sharedImports = [];
    if (body.includes('<Box ')) sharedImports.push('Box');
    if (body.includes('<AnimArrow')) sharedImports.push('AnimArrow');
    imports += `import { ${sharedImports.join(', ')} } from './shared';\n`;
  }
  
  // Transform body: replace `const XxxAnim = (` with `export default function Animation(`
  let transformed = body
    .replace(`const ${name} = ({ step }: { step: number }) => {`, `export default function Animation({ step }: { step: number }) {`)
    .replace(`const ${name} = ({ step }: { step: number }) => (`, `export default function Animation({ step }: { step: number }) {\n  return (`)
    // Close the function if it was an arrow with implicit return
    .replace(/\r?\n$/, '');
  
  // If it was an arrow function with parens, we need to add the closing brace
  if (body.startsWith(`const ${name} = ({ step }: { step: number }) => (`)) {
    // Need to wrap in return and close function
    transformed = transformed.replace(/\);\s*$/, ');\n}');
  }
  
  // Remove trailing semicolon from `};`
  transformed = transformed.replace(/\};\s*$/, '}');

  const fileContent = `// Animation ${num}: ${name}\n${imports}\n${transformed}\n`;
  
  const outFile = join(animDir, `${num}.tsx`);
  writeFileSync(outFile, fileContent, 'utf-8');
  console.log(`Created ${num}.tsx (${name})`);
}

console.log('Done! All animation files extracted.');
