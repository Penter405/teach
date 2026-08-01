import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bolt, Zap, CheckCircle2, ChevronRight, Play, SkipBack, ArrowRight, ExternalLink, XCircle, Trophy, Code2 } from 'lucide-react';
import { ContentBlock, QuizQuestion, PracticeProblem } from './courseData';
import { AIChat } from './AIChat';
import { MatchingExercise } from './MatchingExercise';

interface LessonContentProps {
  key?: React.Key;
  block: ContentBlock;
  index: number;
}

export function LessonContent({ block, index }: LessonContentProps) {
  const delay = Math.min(index * 0.06, 0.5); // Staggered animation delay

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="mb-8"
    >
      {renderBlock(block)}
    </motion.div>
  );
}

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case 'heading':
      return <h2 className="font-headline text-2xl font-semibold text-slate-800 dark:text-white mb-4 leading-snug">{block.text}</h2>;

    case 'paragraph':
      return <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-4">{block.text}</p>;

    case 'code':
      return <RenderCodeBlock block={block} />;

    case 'callout':
      return <RenderCallout block={block} />;

    case 'diagram':
      return <RenderDiagram block={block} />;

    case 'list':
      return <RenderList block={block} />;

    case 'animation':
      return <RenderAnimation block={block} />;

    case 'quiz':
      return <RenderQuiz block={block} />;

    case 'practice':
      return <RenderPractice block={block} />;

    case 'ai-chat':
      return <RenderAIChat block={block} />;

    case 'matching':
      return <MatchingExercise block={block} />;

    default:
      return null;
  }
}

// ── AI Chat ──
function RenderAIChat({ block }: { block: ContentBlock }) {
  return (
    <div className="mb-8 mt-4">
      <AIChat 
        title={block.title || 'AI 助教'} 
        subtitle={block.subtitle}
        coursePrompt={block.coursePrompt || ''}
      />
    </div>
  );
}

// ── Code Block ──
function RenderCodeBlock({ block }: { block: ContentBlock }) {
  // Simple highlighter for basic python syntax
  const highlightPython = (code: string) => {
    let result = code;
    
    // Comments
    result = result.replace(/(#.*)$/gm, '__C_START__$1__SPAN_END__');
    // Strings
    result = result.replace(/(&quot;.*?&quot;|&#x27;.*?&#x27;|".*?"|'.*?')/g, '__S_START__$1__SPAN_END__');
    
    // Keywords
    const keywords = ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'as', 'True', 'False', 'None', 'and', 'or', 'not', 'is', 'break', 'continue', 'pass', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'self'];
    keywords.forEach(kw => {
      const re = new RegExp(`\\b(${kw})\\b`, 'g');
      result = result.replace(re, `__K_START__$1__SPAN_END__`);
    });
    
    // Built-ins
    const builtins = ['print', 'input', 'len', 'range', 'int', 'str', 'float', 'bool', 'list', 'dict', 'tuple', 'type', 'sum', 'max', 'min', 'enumerate', 'append', 'split', 'get', 'keys'];
    builtins.forEach(fn => {
      const re = new RegExp(`\\b(${fn})(?=\\()`, 'g');
      result = result.replace(re, `__B_START__$1__SPAN_END__`);
    });
    
    // Numbers
    result = result.replace(/\b(\d+\.?\d*)\b/g, `__N_START__$1__SPAN_END__`);

    // Restore to HTML
    result = result
      .replace(/__C_START__/g, '<span class="text-slate-500">')
      .replace(/__S_START__/g, '<span class="text-green-400">')
      .replace(/__K_START__/g, '<span class="text-purple-400">')
      .replace(/__B_START__/g, '<span class="text-blue-400">')
      .replace(/__N_START__/g, '<span class="text-orange-400">')
      .replace(/__SPAN_END__/g, '</span>');

    return result;
  };

  const codeHtml = highlightPython(block.code || '');

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-sm mb-6 border border-slate-800">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="font-mono text-xs font-semibold text-purple-300 tracking-wider uppercase">{block.language || 'python'}</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-80" />
        </div>
      </div>
      <div className="p-4 md:p-6 overflow-x-auto">
        <pre className="font-mono text-[14px] leading-relaxed text-slate-200 m-0 w-full">
          <code dangerouslySetInnerHTML={{ __html: codeHtml }} />
        </pre>
      </div>
    </div>
  );
}

// ── Callout ──
function RenderCallout({ block }: { block: ContentBlock }) {
  const labelLower = (block.label || '').toLowerCase();
  
  let variant = 'info';
  let styles = "bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 dark:border-sky-500 text-sky-900 dark:text-sky-100";
  let labelColor = "text-sky-700 dark:text-sky-400";
  
  if (['重要', '注意', '小心', 'important', 'warning'].some(k => labelLower.includes(k))) {
    variant = 'warn';
    styles = "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-500 text-amber-900 dark:text-amber-100";
    labelColor = "text-amber-700 dark:text-amber-500";
  } else if (['比喻', '記住', 'tip', '練習'].some(k => labelLower.includes(k))) {
    variant = 'tip';
    styles = "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 dark:border-purple-500 text-purple-900 dark:text-purple-100";
    labelColor = "text-purple-700 dark:text-purple-400";
  }

  return (
    <div className={`p-6 rounded-r-xl shadow-sm mb-6 ${styles}`}>
      <div className={`font-sans text-xs font-bold uppercase tracking-widest mb-2 ${labelColor}`}>
        {block.label}
      </div>
      <div className="text-[15px] leading-relaxed opacity-90">
        {block.text}
      </div>
    </div>
  );
}

// ── List ──
function RenderList({ block }: { block: ContentBlock }) {
  if (block.style === 'definition') {
    return (
      <ul className="grid gap-3 mb-6">
        {block.items?.map((item, i) => (
          <li key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700/50 items-baseline shadow-sm">
            <span className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400 shrink-0 min-w-[60px]">
              {item.term}
            </span>
            <span className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.definition}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // Directory/standard style
  return (
    <ul className="grid gap-2 mb-6">
      {block.items?.map((item, i) => (
        <li key={i} className="flex items-center gap-3 p-3 pl-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[15px] text-slate-700 dark:text-slate-300 shadow-sm transition-transform hover:translate-x-1 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800">
          <span className="opacity-70 text-lg">📁</span>
          <span>{typeof item === 'string' ? item : item.text || ''}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Diagrams ──
function RenderDiagram({ block }: { block: ContentBlock }) {
  const id = block.diagramId;
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 w-full overflow-hidden">
      <div className="flex justify-center w-full overflow-hidden pb-4 flex-wrap gap-4">
        {id === 'course-structure-timeline' && <TimelineDiagram />}
        {id === 'input-process-output' && <IPODiagram />}
        {id === 'basic-coding-flow' && <IPODiagram />}
        {id === 'interpreter-vs-compiler' && <IVCDiagram />}
        {id === 'class-object-flow' && <COFDiagram />}
        {id === 'cpu-ram-cycle' && <CRCDiagram />}
        {id === 'variable-memory-map' && <VMMDiagram />}
        {id === 'python-code-types' && <PCTDiagram />}
        {id === 'class-blueprint' && <CBPDiagram />}
        
        {/* Fallback if diagram component not mapped */}
        {![
          'course-structure-timeline', 'input-process-output', 'basic-coding-flow', 'interpreter-vs-compiler',
          'class-object-flow', 'cpu-ram-cycle', 'variable-memory-map', 'python-code-types', 'class-blueprint'
        ].includes(id || '') && (
          <div className="py-12 px-6 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl w-full">
            <p className="text-slate-500 dark:text-slate-400 font-medium">📊 {block.caption || id || 'Diagram Placeholder'}</p>
          </div>
        )}
      </div>
      
      {block.caption && (
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400 font-medium italic border-t border-slate-100 dark:border-slate-800/50 pt-4">
          {block.caption}
        </div>
      )}
    </div>
  );
}

// Diagram sub-components
const TimelineDiagram = () => (
  <div className="flex items-center gap-0 w-full min-w-[280px] sm:min-w-[400px]">
    <div className="flex flex-col items-center flex-1 z-10 px-4">
      <div className="font-headline text-sm font-semibold mb-3 text-slate-800 dark:text-white whitespace-nowrap">總則</div>
      <div className="w-4 h-4 rounded-full bg-cyan-600 dark:bg-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.5)]"></div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 whitespace-nowrap">全面介紹</div>
    </div>
    
    <div className="h-1 flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-500 dark:to-purple-500 -mx-6 mt-[-20px]"></div>
    
    <div className="flex flex-col items-center flex-1 z-10 px-4">
      <div className="font-headline text-sm font-semibold mb-3 text-slate-800 dark:text-white whitespace-nowrap">分則</div>
      <div className="w-4 h-4 rounded-full bg-purple-600 dark:bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.5)]"></div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 whitespace-nowrap">特定分析</div>
    </div>
    
    <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 ml-[-24px] mt-[-20px]"></div>
    
    <div className="flex flex-col items-center z-10 pl-2">
      <div className="font-headline text-xs font-semibold mb-3 text-slate-400 whitespace-nowrap">time →</div>
      <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
    </div>
  </div>
);

const IPODiagram = () => (
  <div className="flex flex-wrap items-center justify-center gap-4 py-8">
    <div className="flex flex-col items-center gap-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 p-6 rounded-2xl min-w-[130px] border border-cyan-200 dark:border-cyan-800 transition-transform hover:-translate-y-1">
      <span className="text-4xl">📥</span>
      <span className="font-headline font-bold text-sm tracking-wide uppercase">Input</span>
    </div>
    
    <div className="text-slate-400 text-2xl font-bold animate-pulse mx-2">→</div>
    
    <div className="flex flex-col items-center gap-3 bg-slate-800 text-white p-6 rounded-2xl min-w-[140px] shadow-lg transition-transform hover:-translate-y-1">
      <span className="text-4xl text-sky-400">💻</span>
      <span className="font-headline font-bold text-sm tracking-wide uppercase">Process</span>
      <span className="font-mono text-[10px] text-green-400 tracking-widest opacity-80">11010110</span>
    </div>
    
    <div className="text-slate-400 text-2xl font-bold animate-pulse mx-2">→</div>
    
    <div className="flex flex-col items-center gap-3 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 p-6 rounded-2xl min-w-[130px] border border-purple-200 dark:border-purple-800 transition-transform hover:-translate-y-1">
      <span className="text-4xl">📤</span>
      <span className="font-headline font-bold text-sm tracking-wide uppercase">Output</span>
    </div>
  </div>
);

const IVCDiagram = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
    <div className="flex flex-col items-center text-center p-6 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50 rounded-2xl transition-transform hover:scale-[1.02]">
      <span className="text-3xl mb-3 block">✅</span>
      <h3 className="font-headline text-xl font-bold text-cyan-900 dark:text-cyan-100 mb-1">直譯器 Interpreter</h3>
      <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-4 uppercase tracking-wider">Python 使用</p>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-left w-full h-20 flex flex-col justify-center mb-4 font-mono text-xs text-slate-700 dark:text-slate-300">
        <div>a = 5</div>
        <div>print(a)</div>
      </div>
      <p className="text-sm text-cyan-800 dark:text-cyan-200/80 leading-relaxed font-medium">從頭看，從頭寫<br/>逐行執行，立即回饋</p>
    </div>
    
    <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl transition-transform hover:scale-[1.02] hover:underline decoration-2">
      <span className="text-3xl mb-3 block opacity-50 grayscale">❌</span>
      <h3 className="font-headline text-xl font-bold text-slate-800 dark:text-white mb-1">編譯器 Compiler</h3>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">C# 使用</p>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-left w-full h-20 flex flex-col justify-center mb-4 font-mono text-xs text-slate-500 dark:text-slate-300 opacity-90">
        <div>main()</div>
        <div>print(a)</div>
        <div>a = 5</div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">先看過一遍再從某個地方開始<br/>速度快：只要 50ms</p>
    </div>
  </div>
);

const COFDiagram = () => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-10 w-full">
    <div className="p-8 bg-sky-100 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100 rounded-2xl text-center min-w-[180px] shadow-sm transform transition-transform hover:-translate-y-1">
      <h3 className="font-headline text-2xl font-bold mb-2 tracking-tight">Class</h3>
      <p className="text-sm font-medium opacity-80 uppercase tracking-widest">藍圖 / 論文</p>
    </div>
    
    <div className="flex flex-col items-center gap-1 text-slate-400">
      <span className="text-3xl animate-pulse sm:rotate-0 rotate-90">→</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">實例化</span>
    </div>
    
    <div className="p-8 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100 rounded-2xl text-center min-w-[180px] shadow-sm transform transition-transform hover:-translate-y-1">
      <h3 className="font-headline text-2xl font-bold mb-2 tracking-tight">Object</h3>
      <p className="text-sm font-medium opacity-80 uppercase tracking-widest">實作 / 實體</p>
    </div>
  </div>
);

const CRCDiagram = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 w-full max-w-3xl">
    <div className="flex flex-col items-center text-center p-6 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50 rounded-2xl transition-transform hover:scale-105">
      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl shadow-sm mb-4">👨‍💻</div>
      <h3 className="font-headline text-lg font-bold text-cyan-900 dark:text-cyan-100 mb-2">Programmer</h3>
      <p className="text-sm text-cyan-700 dark:text-cyan-400 font-medium">寫 Code</p>
    </div>
    
    <div className="flex flex-col items-center text-center p-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-transform hover:scale-105 shadow-md relative z-10 scale-110 sm:my-0 my-4">
      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl shadow-md mb-4 border-2 border-slate-200 dark:border-slate-700">🧠</div>
      <h3 className="font-headline text-xl font-bold text-slate-800 dark:text-white mb-2">RAM</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">暫存資料 & 指令</p>
      
      {/* Connector lines for desktop */}
      <div className="hidden sm:block absolute top-[40px] left-[-40px] w-[50px] h-0.5 bg-dashed border-t-2 border-slate-300 dark:border-slate-600 border-dashed z-0"></div>
      <div className="hidden sm:block absolute top-[40px] right-[-40px] w-[50px] h-0.5 bg-dashed border-t-2 border-slate-300 dark:border-slate-600 border-dashed z-0"></div>
    </div>
    
    <div className="flex flex-col items-center text-center p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-2xl transition-transform hover:scale-105">
      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl shadow-sm mb-4">⚙️</div>
      <h3 className="font-headline text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">CPU</h3>
      <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">處理 & 執行</p>
    </div>
  </div>
);

const VMMDiagram = () => {
  const rows = [
    { name: 'a', addr: '0x7f3a01', value: '5', active: false },
    { name: 'b', addr: '0x7f3a01', value: '5', active: true },
    { name: 'a', addr: '0x7f3a09', value: '10', active: true },
  ];
  
  return (
    <div className="flex flex-col gap-4 py-8 w-full max-w-xl">
      {rows.map((r, i) => (
        <div key={i} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border ${r.active ? 'border-sky-200 dark:border-sky-800/50 shadow-sm' : 'border-slate-100 dark:border-slate-700 opacity-60'} transition-all hover:bg-white dark:hover:bg-slate-800`}>
          <div className="w-12 h-12 flex items-center justify-center font-mono text-xl font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            {r.name}
          </div>
          
          <div className="text-slate-400 text-xl font-bold px-2">→</div>
          
          <div className="font-mono text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-md shadow-inner text-center mx-2 w-[110px]">
            {r.addr}
          </div>
          
          <div className="text-slate-400 text-xl font-bold px-2">→</div>
          
          <div className="w-16 h-12 flex items-center justify-center font-mono text-xl font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800/50 rounded-lg">
            {r.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const PCTDiagram = () => (
  <div className="flex flex-col items-center gap-8 py-6 w-full max-w-2xl">
    <div className="bg-slate-800 text-white font-headline font-bold text-lg px-8 py-3 rounded-full shadow-lg border border-slate-700 relative z-20">
      Python Code
    </div>
    
    <div className="relative w-full flex flex-col sm:flex-row gap-6 sm:gap-12 justify-center">
      {/* Branch lines */}
      <div className="hidden sm:block absolute top-[-32px] left-1/2 w-[1px] h-8 bg-slate-300 dark:bg-slate-700 z-10"></div>
      <div className="hidden sm:block absolute top-[-1px] left-[25%] right-[25%] h-[1px] bg-slate-300 dark:bg-slate-700 z-10"></div>
      <div className="hidden sm:block absolute top-0 left-[25%] w-[1px] h-6 bg-slate-300 dark:bg-slate-700 z-10"></div>
      <div className="hidden sm:block absolute top-0 right-[25%] w-[1px] h-6 bg-slate-300 dark:bg-slate-700 z-10"></div>
      
      {/* Normal */}
      <div className="flex-1 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-2xl p-6 z-20 transition-transform hover:-translate-y-1">
        <h3 className="font-headline text-xl font-bold text-cyan-900 dark:text-cyan-100 mb-4 border-b border-cyan-200 dark:border-cyan-800/50 pb-2">普通</h3>
        <ul className="space-y-3 font-mono text-sm text-cyan-800 dark:text-cyan-300">
          <li className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            function 函式
          </li>
          <li className="flex items-center gap-2">
             <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            class → object
          </li>
        </ul>
      </div>
      
      {/* Special */}
      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 z-20 transition-transform hover:-translate-y-1">
        <h3 className="font-headline text-xl font-bold text-purple-900 dark:text-purple-100 mb-4 border-b border-purple-200 dark:border-purple-800/50 pb-2">特別</h3>
        <ul className="space-y-3 font-mono text-sm text-purple-800 dark:text-purple-300">
          <li className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            if / else 條件
          </li>
          <li className="flex items-center gap-2">
             <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            for / while 迴圈
          </li>
        </ul>
      </div>
    </div>
  </div>
);

const CBPDiagram = () => (
  <div className="flex flex-col items-center gap-6 py-6 w-full max-w-sm">
    <div className="w-full bg-sky-100 dark:bg-sky-900/30 border border-sky-300 dark:border-sky-700 rounded-2xl p-6 text-center shadow-sm">
      <h3 className="font-headline text-xl font-bold text-sky-900 dark:text-sky-100 mb-4 tracking-tight">Class（藍圖）</h3>
      <div className="flex flex-col gap-2">
        <div className="bg-white/60 dark:bg-black/20 font-mono text-xs py-2 px-3 rounded text-sky-800 dark:text-sky-300 text-left border border-white dark:border-transparent">__init__(self, ...)</div>
        <div className="bg-white/60 dark:bg-black/20 font-mono text-xs py-2 px-3 rounded text-sky-800 dark:text-sky-300 text-left border border-white dark:border-transparent">method(self, ...)</div>
        <div className="bg-white/60 dark:bg-black/20 font-mono text-xs py-2 px-3 rounded text-sky-800 dark:text-sky-300 text-left border border-white dark:border-transparent">self.property = ...</div>
      </div>
    </div>
    <div className="flex flex-col justify-center items-center h-10 w-10 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-full z-10 -my-4 animate-bounce shrink-0 relative">
       <span className="text-slate-500 dark:text-slate-400 font-bold">↓</span>
    </div>
    <div className="w-full bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-2xl p-6 text-center shadow-sm relative pt-8">
      <h3 className="font-headline text-xl font-bold text-purple-900 dark:text-purple-100 mb-3 tracking-tight">Object（實體）</h3>
      <div className="bg-white/60 dark:bg-black/20 font-mono text-sm py-2 px-4 rounded-lg text-purple-800 dark:text-purple-300 font-medium border border-white dark:border-transparent inline-block">
        my_obj = ClassName()
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════
// ── ANIMATIONS ──
// ═══════════════════════════════════════════════
function AnimationStepper({ steps, children }: { steps: string[]; children: (step: number) => React.ReactNode }) {
  const safeSteps = steps?.length ? steps : [''];
  const total = safeSteps.length;
  const [step, setStep] = useState(0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 w-full">
      <div className="flex justify-center w-full min-h-[200px] items-center py-4">
        {children(step)}
      </div>
      <div className="mt-4 px-2">
        <div className="flex items-center gap-1 mb-3">
          {safeSteps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center mb-4 min-h-[40px]">
          Step {step + 1}: {safeSteps[step]}
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={() => setStep(0)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Reset"><SkipBack size={16} /></button>
          <button onClick={() => setStep(Math.max(0, step - 1))} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Previous"><ChevronRight size={16} className="rotate-180" /></button>
          <button onClick={() => setStep(Math.min(total - 1, step + 1))} className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-medium text-sm flex items-center gap-1"><Play size={14} /> Next</button>
        </div>
      </div>
    </div>
  );
}

function RenderAnimation({ block }: { block: ContentBlock }) {
  const id = block.animationId;
  const steps = block.steps || [];

  const animationMap: Record<string, (step: number) => React.ReactNode> = {
    'data-flow-animation': (s) => <DataFlowAnim step={s} />,
    'problem-decompose': (s) => <ProblemDecomposeAnim step={s} />,
    'interpreter-exec': (s) => <InterpreterExecAnim step={s} />,
    'class-world': (s) => <ClassWorldAnim step={s} />,
    'builtin-class': (s) => <BuiltinClassAnim step={s} />,
    'self-binding': (s) => <SelfBindingAnim step={s} />,
    'reflection-inspect': (s) => <ReflectionInspectAnim step={s} />,
    'data-pipeline': (s) => <DataPipelineAnim step={s} />,
    'gc-animation': (s) => <GCAnimationAnim step={s} />,
    'pointer-animation': (s) => <PointerAnim step={s} />,
    'immutable-swap': (s) => <ImmutableSwapAnim step={s} />,
    'mutable-ref': (s) => <MutableRefAnim step={s} />,
    'indent-animation': (s) => <IndentAnim step={s} />,
    'house-analogy': (s) => <HouseAnalogyAnim step={s} />,
    'immutable-house': (s) => <ImmutableHouseAnim step={s} />,
    'mutable-house': (s) => <MutableHouseAnim step={s} />,
    'subject-verb-object': (s) => <SubjectVerbObjectAnim step={s} />,
    'assign-x-2': (s) => <AssignX2Anim step={s} />,
    'add-3-5': (s) => <Add35Anim step={s} />,
    'combo-assign-add': (s) => <ComboAssignAddAnim step={s} />,
  };

  const renderer = animationMap[id || ''];

  return (
    <div>
      <AnimationStepper steps={steps}>
        {renderer || (() => <div className="text-slate-400">🎬 {block.caption || id}</div>)}
      </AnimationStepper>
      {block.caption && (
        <div className="-mt-4 mb-6 text-center text-sm text-slate-500 dark:text-slate-400 font-medium italic">{block.caption}</div>
      )}
    </div>
  );
}

// ── Individual Animation Components ──

const Box = ({ children, active, color = 'cyan', className = '' }: { children: React.ReactNode; active: boolean; color?: string; className?: string }) => {
  const colors: Record<string, string> = {
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700 text-cyan-900 dark:text-cyan-100',
    purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100',
    slate: 'bg-slate-800 border-slate-700 text-white',
    amber: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100',
    green: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100',
    red: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
  };
  return (
    <motion.div animate={{ scale: active ? 1.05 : 1, opacity: active ? 1 : 0.5 }} transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`p-4 rounded-xl border font-headline font-bold text-center text-sm ${colors[color] || colors.cyan} ${className}`}>
      {children}
    </motion.div>
  );
};

const AnimArrow = ({ active }: { active: boolean }) => (
  <motion.div animate={{ opacity: active ? 1 : 0.2, x: active ? [0, 4, 0] : 0 }} transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatType: 'loop' }}
    className="text-slate-400 text-xl font-bold mx-2">→</motion.div>
);

const DataFlowAnim = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2 flex-wrap justify-center">
    <Box active={step === 0} color="cyan" className="min-w-[160px]">
      <div className="text-xs tracking-wide uppercase opacity-70">Input</div>
      <div className="mt-1 flex items-center justify-center gap-2 font-mono text-sm">
        <span className="px-2 py-1 rounded-md bg-white/70 dark:bg-white/10 border border-cyan-300 dark:border-cyan-700 shadow-sm">
          WASD
        </span>
        <motion.span
          animate={step === 0 ? { scale: [1, 1.14, 1], boxShadow: ['0 0 0 rgba(251,191,36,0)', '0 0 18px rgba(251,191,36,0.6)', '0 0 0 rgba(251,191,36,0)'] } : { scale: 1, boxShadow: '0 0 0 rgba(251,191,36,0)' }}
          transition={{ duration: 0.9, repeat: step === 0 ? Infinity : 0 }}
          className={`px-2 py-1 rounded-md border font-bold ${step === 0 ? 'bg-amber-200 border-amber-500 text-amber-900 shadow' : 'bg-white/70 dark:bg-white/10 border-cyan-200 dark:border-cyan-700 text-cyan-900 dark:text-cyan-100'}`}
        >
          F
        </motion.span>
      </div>
      <div className="mt-1 text-xs text-cyan-900 dark:text-cyan-100/80">按下 F</div>
    </Box>
    <AnimArrow active={step === 0 || step === 1} />
    <Box active={step === 1} color="slate" className="min-w-[180px]">
      <div className="text-xs tracking-wide uppercase opacity-70">Process</div>
      <motion.div
        animate={step === 1 ? { opacity: [0.72, 1, 0.72] } : { opacity: 1 }}
        transition={{ duration: 1.2, repeat: step === 1 ? Infinity : 0 }}
        className="mt-1 font-mono text-sm bg-black/30 rounded-md px-3 py-2 border border-slate-700 text-white text-left"
      >
        if (press F):<br />
        &nbsp;&nbsp;enter_car()
      </motion.div>
      <div className="mt-1 text-xs text-slate-200/80">程式判斷附近車輛</div>
    </Box>
    <AnimArrow active={step === 1 || step === 2} />
    <Box active={step === 2} color="purple" className="min-w-[190px]">
      <div className="text-xs tracking-wide uppercase opacity-70">Output · Secondary Screen</div>
      <div className="mt-2 w-full rounded-lg border border-purple-300 dark:border-purple-700 bg-white/70 dark:bg-purple-900/30 p-2 shadow-inner">
        <div className="text-[11px] text-purple-700 dark:text-purple-200 font-semibold mb-1">顯示器</div>
        <div className="flex items-center justify-center text-2xl gap-2 overflow-hidden">
          <motion.span animate={step === 2 ? { x: [0, 14, 26], opacity: [1, 1, 0.95] } : { x: 0, opacity: 1 }} transition={{ duration: 1.4, repeat: step === 2 ? Infinity : 0, repeatDelay: 0.2 }}>🚶‍♂️</motion.span>
          <motion.span animate={step === 2 ? { opacity: [0.2, 1, 0.2], x: [0, 4, 0] } : { opacity: 0.5, x: 0 }} transition={{ duration: 1, repeat: step === 2 ? Infinity : 0 }}>→</motion.span>
          <span>🚗</span>
        </div>
        <div className="text-[11px] text-purple-900 dark:text-purple-100/80 text-center mt-1">螢幕提示「進入車輛」</div>
      </div>
    </Box>
  </div>
);

const ProblemDecomposeAnim = ({ step }: { step: number }) => {
  return (
    <div className="flex flex-col items-center justify-center h-40 w-full relative">
      {/* Base Problem Block */}
      <motion.div
        animate={{ 
          scale: step === 0 ? 1 : 0.8,
          opacity: step === 0 ? 1 : 0,
          y: step === 0 ? 0 : -20 
        }}
        className="absolute w-32 h-32 bg-slate-800 rounded-2xl flex items-center justify-center border-4 border-slate-700 shadow-xl z-10"
      >
        <span className="text-4xl">🧩</span>
      </motion.div>

      {/* Decomposed Pieces */}
      <div className="flex gap-4 sm:gap-8 items-center justify-center relative z-20">
        {[
          { icon: '🔍', delay: 0 },
          { icon: '✂️', delay: 0.1 },
          { icon: '🛠️', delay: 0.2 }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5, x: 0 }}
            animate={{ 
              opacity: step >= 1 ? 1 : 0,
              scale: step >= 1 ? 1 : 0.5,
              y: step >= 2 ? 0 : (i === 1 ? -10 : 10),
              x: step >= 2 ? 0 : (i === 0 ? 40 : i === 2 ? -40 : 0)
            }}
            transition={{ duration: 0.5, delay: step >= 2 ? item.delay : 0, type: 'spring' }}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 relative
              ${step >= 3 ? 'bg-cyan-50 dark:bg-cyan-900/40 border-cyan-300 dark:border-cyan-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
          >
            {item.icon}
            
            {/* Checkmarks in final step */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: item.delay + 0.2, type: 'spring' }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white"
                >
                  <CheckCircle2 size={14} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      {/* Connecting Path */}
      {step >= 2 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <motion.line
            x1="30%" y1="50%" x2="70%" y2="50%"
            stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"
            className="text-slate-300 dark:text-slate-700"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
        </svg>
      )}
    </div>
  );
};

const InterpreterExecAnim = ({ step }: { step: number }) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-12 w-full max-w-2xl h-48 relative">
      {/* Source Code Document */}
      <motion.div 
        animate={{ scale: step === 0 ? 1.05 : 1, opacity: step >= 0 ? 1 : 0 }}
        className="w-24 sm:w-32 h-36 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col p-3 relative z-10"
      >
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-3" />
        <div className="w-3/4 h-2 bg-cyan-200 dark:bg-cyan-900 rounded-full mb-2" />
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
        <div className="w-1/2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
        
        {/* Glow effect when active */}
        <motion.div animate={{ opacity: step === 0 ? 1 : 0 }} className="absolute inset-0 border-2 border-cyan-400 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
      </motion.div>

      {/* Traveling Data Packet */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ 
          x: step === 1 ? 0 : step > 1 ? 60 : -60,
          opacity: step === 1 ? 1 : 0,
          scale: step === 1 ? [1, 1.2, 1] : 1
        }}
        transition={{ duration: 0.6, repeat: step === 1 ? Infinity : 0 }}
        className="absolute z-20 w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
      />

      {/* Interpreter Machine */}
      <motion.div
        animate={{ 
          scale: step === 2 ? 1.1 : 1,
          boxShadow: step === 2 ? '0 0 30px rgba(168,85,247,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}
        className="w-32 sm:w-40 h-40 bg-[#1e293b] rounded-2xl flex flex-col items-center justify-center border-2 border-slate-700 relative z-10 overflow-hidden"
      >
        <Bolt className={`w-10 h-10 ${step === 2 ? 'text-purple-400 animate-spin-slow' : 'text-slate-500'}`} />
        <div className={`mt-2 font-mono text-xs font-bold tracking-widest ${step === 2 ? 'text-purple-300' : 'text-slate-500'}`}>INTERPRETER</div>
        
        {/* Processing scanline */}
        <motion.div
          animate={{ top: step === 2 ? ['0%', '100%'] : '0%', opacity: step === 2 ? [0, 1, 0] : 0 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute left-0 w-full h-1 bg-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
        />
      </motion.div>

      {/* Output Console */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : -20 }}
        className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 w-28 h-20 bg-black/80 backdrop-blur-md rounded-lg border border-slate-700 flex items-center justify-center shadow-2xl z-30"
      >
        <span className="font-mono text-green-400 text-xl font-bold">5</span>
      </motion.div>
    </div>
  );
};

const SelfBindingAnim = ({ step }: { step: number }) => {
  return (
    <div className="flex items-center justify-center gap-8 sm:gap-20 w-full h-48 relative">
      {/* Blueprint (Class) */}
      <motion.div
        animate={{ scale: step === 0 ? 1.05 : 1 }}
        className="w-32 h-40 bg-cyan-50/50 dark:bg-cyan-900/20 border-2 border-dashed border-cyan-400 rounded-xl flex flex-col items-center justify-center relative z-10"
      >
        <div className="font-mono text-cyan-700 dark:text-cyan-300 font-bold mb-4">Dog</div>
        {/* The 'self' parameter socket */}
        <motion.div 
          animate={{ 
            backgroundColor: step >= 2 ? 'rgba(168,85,247,0.2)' : 'rgba(6,182,212,0.1)',
            borderColor: step >= 2 ? 'rgba(168,85,247,1)' : 'rgba(6,182,212,0.5)'
          }}
          className="px-3 py-1 rounded-full border-2 font-mono text-xs font-bold text-cyan-800 dark:text-cyan-200 transition-colors"
        >
          self
        </motion.div>
      </motion.div>

      {/* Object (Instance) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: -40 }}
        animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.5, x: step >= 1 ? 0 : -40 }}
        className="w-24 h-24 bg-purple-100 dark:bg-purple-900/40 rounded-2xl shadow-xl flex items-center justify-center relative z-10 backdrop-blur-md"
      >
        {/* Glow behind object */}
        <motion.div animate={{ opacity: step >= 3 ? 1 : 0 }} className="absolute inset-0 bg-purple-400 blur-xl opacity-30 -z-10 rounded-full" />
        <span className="text-3xl">🐕</span>
        
        {/* Success badge */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 text-white shadow-lg">
              <CheckCircle2 size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Connecting Laser/String */}
      {step >= 2 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <motion.path
            d="M 120 96 Q 200 150 280 96"
            fill="none"
            stroke="url(#purpleGlow)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};

const ClassWorldAnim = ({ step }: { step: number }) => {
  const examples = [
    { title: 's = 5', detail: "type(s) → <class 'int'>", color: 'amber', showAt: 1 },
    { title: 'text = "hi"', detail: "type(text) → <class 'str'>", color: 'green', showAt: 2 },
    { title: 'function greet()', detail: "type(greet) → <class 'function'>", color: 'slate', showAt: 3 },
  ];

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Box active={step <= 1} color="cyan" className="min-w-[140px]">class</Box>
        <motion.div animate={{ opacity: step >= 1 ? 1 : 0.25, x: step >= 1 ? [0, 6, 0] : 0 }} transition={{ duration: 0.8, repeat: step >= 1 ? Infinity : 0 }} className="text-slate-400 text-2xl font-bold">
          →
        </motion.div>
        <Box active={step >= 1} color="purple" className="min-w-[140px]">object</Box>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {examples.map((example, index) => (
          <motion.div
            key={example.title}
            animate={{ opacity: step >= example.showAt ? 1 : 0.18, y: step >= example.showAt ? [0, -4, 0] : 8, scale: step === example.showAt ? [1, 1.04, 1] : 1 }}
            transition={{ duration: 0.9, repeat: step === example.showAt ? Infinity : 0, delay: index * 0.08 }}
            className={`rounded-2xl border p-4 text-left shadow-sm ${
              example.color === 'amber'
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : example.color === 'green'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <div className="font-mono text-sm font-bold">{example.title}</div>
            <div className={`mt-2 text-xs ${example.color === 'slate' ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>{example.detail}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{ opacity: step >= 3 ? 1 : 0.28, y: step >= 3 ? [0, -3, 0] : 0 }}
        transition={{ duration: 1.1, repeat: step >= 3 ? Infinity : 0 }}
        className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-900 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-100"
      >
        Python 會把很多 data 與 function 都放進 class / object 的世界觀裡。
      </motion.div>
    </div>
  );
};

const BuiltinClassAnim = ({ step }: { step: number }) => {
  const splitPieces = step >= 3 ? ['hi', 'there'] : ['hi there'];

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          animate={{ scale: step <= 1 ? [1, 1.03, 1] : 1, opacity: 1 }}
          transition={{ duration: 1, repeat: step <= 1 ? Infinity : 0 }}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800 dark:bg-amber-900/20"
        >
          <div className="font-mono text-sm font-bold text-amber-900 dark:text-amber-100">s = 8</div>
          <div className="mt-2 text-xs text-amber-800 dark:text-amber-200">其實可以想成 `s = int(value=8)`</div>
          <motion.div
            animate={{ opacity: step >= 1 ? 1 : 0.15, x: step >= 1 ? [0, 8, 0] : 0 }}
            transition={{ duration: 0.9, repeat: step >= 1 ? Infinity : 0 }}
            className="mt-3 rounded-xl border border-amber-300 bg-white/80 px-3 py-2 font-mono text-xs text-amber-900 shadow-sm dark:border-amber-700 dark:bg-black/20 dark:text-amber-100"
          >
            int(value=8) → object
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ scale: step >= 2 ? [1, 1.03, 1] : 1, opacity: step >= 2 ? 1 : 0.32 }}
          transition={{ duration: 1, repeat: step >= 2 ? Infinity : 0 }}
          className="rounded-2xl border border-green-200 bg-green-50 p-4 text-left dark:border-green-800 dark:bg-green-900/20"
        >
          <div className="font-mono text-sm font-bold text-green-900 dark:text-green-100">text = "hi there"</div>
          <div className="mt-2 text-xs text-green-800 dark:text-green-200">str 物件內建 method，例如 `split()`</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {splitPieces.map((piece, index) => (
              <motion.span
                key={`${piece}-${index}`}
                initial={{ opacity: 0.2, y: 6 }}
                animate={{ opacity: 1, y: 0, x: step >= 3 ? [0, index === 0 ? -6 : 6, 0] : 0 }}
                transition={{ duration: 0.7, repeat: step >= 3 ? Infinity : 0 }}
                className="rounded-full border border-green-300 bg-white/90 px-3 py-1 font-mono text-xs text-green-900 dark:border-green-700 dark:bg-black/20 dark:text-green-100"
              >
                {piece}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: step >= 2 ? 1 : 0.22 }}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
      >
        `int`、`str` 都是內建 class，所以它們有自己的 type、property 和 method。
      </motion.div>
    </div>
  );
};

const ReflectionInspectAnim = ({ step }: { step: number }) => {
  return (
    <div className="flex items-center justify-center w-full h-56 relative perspective-1000">
      {/* Center Object */}
      <motion.div 
        animate={{ rotateY: step > 0 ? 15 : 0, scale: step > 0 ? 0.9 : 1 }}
        className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center relative z-10 transform-style-3d"
      >
        <span className="text-4xl text-white font-mono font-bold">x</span>
        
        {/* X-Ray Scanning Line */}
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ top: '-10%', opacity: 0 }}
              animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
              className="absolute left-0 w-full h-2 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] z-20"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Extracted Metadata Floating Chips */}
      <AnimatePresence>
        {step >= 2 && (
          <>
            <motion.div initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: 1, x: -80, y: -60 }} className="absolute z-20 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">class 'list'</span>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: 1, x: 90, y: -20 }} className="absolute z-20 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">append()</span>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: 1, x: -70, y: 60 }} className="absolute z-20 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">clear()</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deep Inspection Tooltip */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 90, y: -20 }}
            animate={{ opacity: 1, scale: 1, x: 120, y: -50 }}
            className="absolute z-30 p-3 w-40 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl"
          >
            <div className="font-mono text-[10px] text-cyan-400 mb-1">help(append)</div>
            <div className="text-[10px] text-slate-300 leading-tight">Append object to the end of the list.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DataPipelineAnim = ({ step }: { step: number }) => {
  const stages = [
    { icon: '📡', label: 'Collect', color: 'cyan' },
    { icon: '💾', label: 'Store', color: 'purple' },
    { icon: '⚙️', label: 'Process', color: 'slate' },
    { icon: '🗑️', label: 'Clean', color: 'red' },
    { icon: '📤', label: 'Output', color: 'green' },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {stages.map((s, i) => (
        <React.Fragment key={i}>
          <Box active={step === i} color={s.color as any} className="min-w-[80px]"><span className="text-xl block mb-1">{s.icon}</span>{s.label}</Box>
          {i < stages.length - 1 && <AnimArrow active={step === i} />}
        </React.Fragment>
      ))}
    </div>
  );
};

const GCAnimationAnim = ({ step }: { step: number }) => {
  const nodes = [
    { label: 'obj_A', refs: step < 3 ? (step < 2 ? 1 : 0) : 0 },
    { label: 'obj_B', refs: 2 },
  ];
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Reference Count</div>
      {nodes.map((n, i) => (
        <motion.div key={i} animate={{ opacity: n.refs === 0 && step >= 3 ? 0.2 : 1, scale: n.refs === 0 && step >= 3 ? 0.9 : 1 }}
          transition={{ duration: 0.5 }} className={`flex items-center justify-between w-full p-4 rounded-xl border ${n.refs === 0 && step >= 3 ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 line-through' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
          <span className="font-mono font-bold text-sm">{n.label}</span>
          <span className={`font-mono text-sm font-bold px-3 py-1 rounded ${n.refs > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>refs: {n.refs}</span>
        </motion.div>
      ))}
      {step >= 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 font-medium">🗑️ obj_A 被垃圾回收！</motion.div>}
    </div>
  );
};

const PointerAnim = ({ step }: { step: number }) => {
  // Arrow path calculations
  const getPath = (stepLevel: number) => {
    if (stepLevel < 1) return "M 60 120 C 60 120, 60 120, 60 120"; // Hidden
    if (stepLevel < 3) return "M 80 120 C 140 120, 140 60, 200 60"; // Points to 5
    return "M 80 120 C 140 120, 140 180, 200 180"; // Points to 10
  };

  return (
    <div className="flex items-center justify-between w-full max-w-sm h-60 relative px-4">
      {/* Variables Column */}
      <div className="flex flex-col justify-center h-full z-10">
        <motion.div 
          animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.8 }}
          className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center relative"
        >
          <span className="font-mono font-bold text-slate-700 dark:text-slate-200">a</span>
          {/* Pulsing origin dot */}
          {step >= 1 && <div className="absolute -right-1 w-3 h-3 bg-cyan-500 rounded-full" />}
        </motion.div>
      </div>

      {/* Visual Curved Pointer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
          </marker>
        </defs>
        <motion.path
          d={getPath(step)}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="3"
          markerEnd={step >= 1 ? "url(#arrowhead)" : ""}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: step >= 1 ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        {/* Animated pulse traveling along the line */}
        {step === 2 && (
          <motion.circle r="4" fill="#67e8f9" filter="drop-shadow(0 0 4px #06b6d4)">
            <animateMotion dur="1.5s" repeatCount="indefinite" path={getPath(2)} />
          </motion.circle>
        )}
      </svg>

      {/* Memory Blocks Column */}
      <div className="flex flex-col justify-between h-full py-8 gap-8 z-10">
        {/* Memory cell: 5 */}
        <motion.div 
          animate={{ 
            opacity: step >= 0 ? 1 : 0,
            y: step >= 0 ? 0 : 20,
            borderColor: step >= 1 && step < 3 ? 'rgba(6,182,212,1)' : 'rgba(226,232,240,0.5)' // Highlight if pointed
          }}
          className="w-24 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border-2 flex flex-col items-center justify-center shadow-lg relative"
        >
          <span className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-400">5</span>
          <span className="absolute -top-5 font-mono text-[10px] text-slate-400">0x7f01</span>
        </motion.div>

        {/* Memory cell: 10 */}
        <motion.div 
          animate={{ 
            opacity: step >= 3 ? 1 : 0,
            y: step >= 3 ? 0 : -20,
            borderColor: step >= 3 ? 'rgba(6,182,212,1)' : 'rgba(226,232,240,0.5)' // Highlight if pointed
          }}
          className="w-24 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border-2 flex flex-col items-center justify-center shadow-lg relative"
        >
          <span className="font-mono text-2xl font-bold text-purple-600 dark:text-purple-400">10</span>
          <span className="absolute -bottom-5 font-mono text-[10px] text-slate-400">0x7f09</span>
        </motion.div>
      </div>
    </div>
  );
};

const ImmutableSwapAnim = ({ step }: { step: number }) => (
  <div className="flex flex-col items-center gap-4 w-full max-w-sm">
    <div className="flex items-center gap-4 w-full">
      <motion.div animate={{ opacity: step <= 1 ? 1 : 0.3 }} className="flex-1 p-4 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700 text-center">
        <div className="font-mono text-lg font-bold text-cyan-800 dark:text-cyan-200">5</div>
        <div className="text-xs text-cyan-600 mt-1">0x7f01</div>
      </motion.div>
      {step >= 2 && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 text-center">
          <div className="font-mono text-lg font-bold text-purple-800 dark:text-purple-200">10</div>
          <div className="text-xs text-purple-600 mt-1">0x7f09</div>
        </motion.div>
      )}
    </div>
    <motion.div animate={{ x: step >= 2 ? 60 : 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="px-6 py-2 bg-slate-800 text-white rounded-full font-mono font-bold text-sm shadow-lg">a ↓</motion.div>
    {step >= 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 dark:text-slate-400 italic">舊物件 5 無引用 → 垃圾回收</motion.div>}
  </div>
);

const MutableRefAnim = ({ step }: { step: number }) => {
  const listContent = step >= 2 ? '[1,2,3,4]' : '[1,2,3]';
  const copyContent = step >= 4 ? '[1,2,3]' : '[1,2,3]';
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex items-center gap-4">
        <Box active={step <= 2} color="cyan" className="flex-1"><span className="text-xs block mb-1">a</span>{listContent}</Box>
        {step >= 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 dark:text-slate-400 font-mono">b = a</motion.div>}
        {step >= 1 && <Box active={step === 2} color="cyan" className="flex-1"><span className="text-xs block mb-1">b (ref)</span>{listContent}</Box>}
      </div>
      {step >= 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-amber-600 dark:text-amber-400 font-medium">⚠️ a.append(4) → b 也受影響！</motion.div>}
      {step >= 3 && (
        <div className="flex items-center gap-4 mt-2">
          <Box active={step === 4} color="green" className="flex-1"><span className="text-xs block mb-1">c (copy)</span>{copyContent}</Box>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 dark:text-slate-400">獨立副本</motion.div>
        </div>
      )}
      {step >= 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-green-600 dark:text-green-400 font-medium">✅ a 改變 → c 不受影響</motion.div>}
    </div>
  );
};

const IndentAnim = ({ step }: { step: number }) => {
  return (
    <div className="flex items-center justify-center w-full max-w-md h-40 relative perspective-1000">
      {/* Structural Container */}
      <div className="w-64 bg-slate-900 rounded-xl p-6 flex flex-col items-start justify-center shadow-2xl border border-slate-800 relative overflow-hidden">
        
        {/* Glowing Indentation Block (Appears in Python step) */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: step >= 2 ? '24px' : '0px',
            opacity: step >= 2 ? 1 : 0 
          }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="absolute left-0 top-0 bottom-0 bg-cyan-500/20 border-r border-cyan-400/50"
        />

        {/* Outer Scope */}
        <div className="w-16 h-4 bg-slate-700 rounded-full mb-3" />
        
        {/* Inner Scope Container */}
        <motion.div 
          animate={{ x: step >= 2 ? 24 : 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="flex items-center w-full relative"
        >
          {/* Left Brace (C-style) */}
          <motion.span
            animate={{ 
              opacity: step >= 1 ? 0 : 1,
              y: step >= 1 ? 20 : 0,
              rotate: step >= 1 ? -45 : 0
            }}
            className="absolute -left-4 font-mono text-2xl text-amber-500 font-bold"
          >
            {'{'}
          </motion.span>
          
          <div className="w-24 h-4 bg-purple-500/80 rounded-full my-2 ml-4" />

          {/* Right Brace (C-style) */}
          <motion.span
            animate={{ 
              opacity: step >= 1 ? 0 : 1,
              y: step >= 1 ? 20 : 0,
              rotate: step >= 1 ? 45 : 0
            }}
            className="absolute right-12 font-mono text-2xl text-amber-500 font-bold"
          >
            {'}'}
          </motion.span>
        </motion.div>

        {/* Outer Scope Close */}
        <div className="w-12 h-4 bg-slate-700 rounded-full mt-3" />

        {/* Colon (Python style) */}
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: step >= 2 ? 1 : 0, scale: step >= 2 ? 1 : 0 }}
          className="absolute right-4 top-5 font-mono text-xl text-cyan-400 font-bold"
        >
          :
        </motion.span>
      </div>
      
      {/* Success Tick */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-2 -bottom-2 w-10 h-10 bg-green-500 rounded-full border-4 border-surface dark:border-slate-950 flex items-center justify-center text-white shadow-xl z-20"
          >
            <CheckCircle2 size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HouseAnalogyAnim = ({ step }: { step: number }) => {
  return (
    <div className="relative w-full max-w-sm h-64 flex items-center justify-center">
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 border-4 border-dashed border-cyan-400/50 rounded-3xl bg-cyan-50/20 dark:bg-cyan-900/10 z-0 flex flex-col justify-end items-center pb-4"
          >
            <span className="font-headline font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase text-sm bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800">Object</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center mt-6">
        {/* House Sign / Variable Name */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : -20 }}
          className="bg-sky-500 text-white font-mono font-bold text-xl px-4 py-1 rounded-md shadow-lg border-2 border-white dark:border-slate-800 mb-2 z-20 h-10 flex items-center justify-center"
        >
          x
        </motion.div>

        {/* House */}
        <motion.div 
          animate={{ scale: step >= 0 ? 1 : 0.8 }}
          className="relative w-40 h-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-end pb-4 mt-2"
        >
          {/* Roof */}
          <div className="absolute -top-12 w-0 h-0 border-l-[80px] border-l-transparent border-r-[80px] border-r-transparent border-b-[60px] border-b-rose-500" />
          
          {/* Guy inside */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 1 ? 1 : 0 }}
            className="flex flex-col items-center h-full justify-end"
          >
            <span className="text-4xl mb-1">🧍</span>
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-mono font-bold px-3 py-1 rounded-full text-sm border border-amber-300 dark:border-amber-700">
              12329
            </div>
          </motion.div>
        </motion.div>

        {/* Address Sign */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: step >= 2 ? 1 : 0, x: step >= 2 ? 0 : 20 }}
          className="absolute -right-8 bottom-4 flex flex-col items-center"
        >
          <div className="w-1 h-12 bg-slate-400" />
          <div className="bg-slate-700 text-white font-mono text-[10px] px-2 py-1 rounded border-2 border-slate-500 -mt-2">
            0x7A9B
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ImmutableHouseAnim = ({ step }: { step: number }) => {
  return (
    <div className="w-full max-w-lg h-64 flex items-center justify-center gap-4 sm:gap-8 relative mt-6">
      {/* Old House */}
      <motion.div 
        animate={{ 
          opacity: step >= 3 ? 0.3 : 1,
          scale: step === 1 ? [1, 1.05, 0.95, 1.05, 0.95, 1] : 1
        }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center"
      >
        <motion.div 
          animate={{ opacity: step < 3 ? 1 : 0, y: step < 3 ? 0 : -20 }}
          className="bg-sky-500 text-white font-mono font-bold text-xl px-4 py-1 rounded-md shadow-lg border-2 border-white dark:border-slate-800 mb-2 z-20 h-10 flex items-center justify-center"
        >
          x
        </motion.div>
        
        <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-end pb-4 mt-2">
          <div className="absolute -top-10 w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-b-[48px] border-b-rose-500" />
          
          <div className="flex flex-col items-center relative w-full h-full justify-end">
            <span className="text-3xl mb-1">🧍</span>
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-mono font-bold px-3 py-1 rounded-full text-sm border border-amber-300 dark:border-amber-700">
              5
            </div>
            {/* Shake effect X */}
            <AnimatePresence>
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <XCircle className="w-12 h-12 text-red-500 bg-white rounded-full drop-shadow-md" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* New House */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative flex flex-col items-center"
          >
            <motion.div 
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : -20 }}
              className="bg-sky-500 text-white font-mono font-bold text-xl px-4 py-1 rounded-md shadow-lg border-2 border-white dark:border-slate-800 mb-2 z-20 h-10 flex items-center justify-center"
            >
              x
            </motion.div>
            
            <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-end pb-4 mt-2">
              <div className="absolute -top-10 w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-b-[48px] border-b-purple-500" />
              
              <div className="flex flex-col items-center h-full justify-end">
                <span className="text-3xl mb-1">🧍</span>
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-mono font-bold px-3 py-1 rounded-full text-sm border border-amber-300 dark:border-amber-700">
                  10
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MutableHouseAnim = ({ step }: { step: number }) => {
  return (
    <div className="w-full max-w-sm h-64 flex flex-col items-center justify-center relative mt-6">
      <div className="bg-sky-500 text-white font-mono font-bold text-lg px-4 py-1 rounded-md shadow-lg border-2 border-white dark:border-slate-800 mb-2 z-20 h-10 flex items-center justify-center">
        my_list
      </div>
      
      <div className="relative w-64 h-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-end pb-6 mt-2">
        <div className="absolute -top-12 w-0 h-0 border-l-[128px] border-l-transparent border-r-[128px] border-r-transparent border-b-[60px] border-b-green-500" />
        
        <div className="flex items-end justify-center gap-2 relative h-16 w-full">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">🧍</span>
            <span className="bg-slate-100 dark:bg-slate-700 font-mono text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">1</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">🧍</span>
            <span className="bg-slate-100 dark:bg-slate-700 font-mono text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">2</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">🧍</span>
            <span className="bg-slate-100 dark:bg-slate-700 font-mono text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">3</span>
          </div>
          
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center ml-1"
              >
                <span className="text-3xl mb-1">🧍‍♂️</span>
                <span className="bg-amber-200 dark:bg-amber-700/50 text-amber-900 dark:text-amber-100 font-mono font-bold text-xs px-2 py-0.5 rounded border border-amber-300 dark:border-amber-600 shadow-sm">4</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Address Sign */}
      <motion.div
        animate={{ 
          scale: step >= 3 ? [1, 1.2, 1] : 1,
          boxShadow: step >= 3 ? ['0 0 0 rgba(16,185,129,0)', '0 0 20px rgba(16,185,129,0.5)', '0 0 0 rgba(16,185,129,0)'] : '0 0 0 rgba(16,185,129,0)'
        }}
        transition={{ duration: 0.6, repeat: step >= 3 ? 3 : 0 }}
        className="absolute bottom-4 right-8 flex flex-col items-center rounded-lg"
      >
        <div className="w-1 h-8 bg-slate-400" />
        <div className="bg-slate-700 text-white font-mono text-[10px] px-2 py-1 rounded border-2 border-slate-500 -mt-1">
          0x9F2C
        </div>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// ── KNOWLEDGE CHECK (QUIZ) ──
// ═══════════════════════════════════════════════

function RenderQuiz({ block }: { block: ContentBlock }) {
  const questions = block.questions || [];
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showScore, setShowScore] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (revealed[qIdx]) return; // already answered
    setSelected(prev => ({ ...prev, [qIdx]: optIdx }));
    setRevealed(prev => ({ ...prev, [qIdx]: true }));

    // Check if all answered
    const newRevealed = { ...revealed, [qIdx]: true };
    if (Object.keys(newRevealed).length === questions.length) {
      setTimeout(() => setShowScore(true), 600);
    }
  };

  const correctCount = questions.filter((q, i) => selected[i] === q.answer).length;

  return (
    <div className="mt-12 mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="font-headline text-xl font-bold text-slate-800 dark:text-white">Knowledge Check</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">驗證你的理解</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const isRevealed = revealed[qIdx];
          const isCorrect = selected[qIdx] === q.answer;

          return (
            <motion.div
              key={qIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: qIdx * 0.1 }}
              className={`p-6 rounded-2xl border transition-colors duration-300 ${
                isRevealed
                  ? isCorrect
                    ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                    : 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                  : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50'
              }`}
            >
              <p className="text-[15px] font-semibold text-slate-800 dark:text-white mb-4 leading-relaxed">
                <span className="text-slate-400 dark:text-slate-500 mr-2 font-mono text-sm">{qIdx + 1}.</span>
                {q.question}
              </p>

              <div className="grid gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selected[qIdx] === optIdx;
                  const isAnswer = q.answer === optIdx;

                  let optionStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 cursor-pointer';

                  if (isRevealed) {
                    if (isAnswer) {
                      optionStyle = 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200';
                    } else if (isSelected && !isAnswer) {
                      optionStyle = 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 opacity-70';
                    } else {
                      optionStyle = 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 opacity-50';
                    }
                  }

                  return (
                    <motion.button
                      key={optIdx}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      disabled={isRevealed}
                      whileTap={!isRevealed ? { scale: 0.98 } : {}}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${optionStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                        isRevealed && isAnswer
                          ? 'bg-green-500 text-white border-green-500'
                          : isRevealed && isSelected && !isAnswer
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                      }`}>
                        {isRevealed && isAnswer ? <CheckCircle2 size={14} /> : isRevealed && isSelected ? <XCircle size={14} /> : String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isRevealed && isAnswer && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 text-xs font-bold">✓ 正確</motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Score Summary */}
      <AnimatePresence>
        {showScore && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.5 }}
            className={`mt-6 p-6 rounded-2xl border text-center ${
              correctCount === questions.length
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : correctCount >= questions.length / 2
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="text-3xl mb-2">
              {correctCount === questions.length ? '🎉' : correctCount >= questions.length / 2 ? '👍' : '💪'}
            </div>
            <p className="font-headline font-bold text-lg text-slate-800 dark:text-white">
              {correctCount} / {questions.length} 正確
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {correctCount === questions.length
                ? '完美！你已經完全掌握了這個概念！'
                : correctCount >= questions.length / 2
                  ? '不錯！再複習一下錯的題目吧。'
                  : '建議重新閱讀本節內容後再試一次。'}
            </p>
            <button
              onClick={() => { setSelected({}); setRevealed({}); setShowScore(false); }}
              className="mt-4 px-5 py-2 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:scale-105 transition-transform"
            >
              重新作答
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
// ── PRACTICE ON LEETCODE ──
// ═══════════════════════════════════════════════

function RenderPractice({ block }: { block: ContentBlock }) {
  const problems = block.problems || [];
  if (problems.length === 0) return null;

  const diffColors: Record<string, string> = {
    Easy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  return (
    <div className="mt-8 mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Practice</span>
          <h3 className="font-headline text-xl font-bold text-slate-800 dark:text-white">Practice on LeetCode</h3>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        透過以下題目練習本節所學的概念。專注於理解 Input → Process → Output 的思維模式。
      </p>

      {/* Problem Cards */}
      <div className="grid gap-4">
        {problems.map((p, i) => (
          <motion.a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ x: 4 }}
            className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-lg transition-all cursor-pointer"
          >
            {/* Difficulty Badge */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border shrink-0 ${diffColors[p.difficulty] || diffColors.Easy}`}>
              {p.difficulty}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-headline font-bold text-slate-800 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                {p.title}
              </h4>
              {p.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{p.description}</p>
              )}
            </div>

            {/* Arrow */}
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}

const SubjectVerbObjectAnim = ({ step }: { step: number }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-2xl py-4">
      {/* Photo 1: 主詞 動詞 受詞 */}
      <div className="flex gap-8 sm:gap-16 text-center text-lg sm:text-xl font-headline font-bold text-slate-700 dark:text-slate-300">
        <div className="flex flex-col items-center w-24">
          <span className="mb-2">主詞</span>
          {(step >= 1) && <motion.span initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="text-slate-400 font-bold text-2xl">↓</motion.span>}
        </div>
        <div className="flex flex-col items-center w-24">
          <span className="mb-2">動詞</span>
          {(step >= 1) && <motion.span initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="text-slate-400 font-bold text-2xl">↓</motion.span>}
        </div>
        <div className="flex flex-col items-center w-24">
          <span className="mb-2">受詞</span>
          {(step >= 1) && <motion.span initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="text-slate-400 font-bold text-2xl">↓</motion.span>}
        </div>
      </div>

      {/* Code representation */}
      {step >= 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center font-mono text-xl sm:text-3xl gap-2 mt-2 h-16"
        >
          {/* Subject */}
          <motion.div
            animate={{ 
              opacity: step === 1 ? 0.8 : (step === 2 ? 0.2 : 1),
            }}
            className={`px-4 py-2 rounded-xl transition-all w-32 flex justify-center ${
              step >= 3 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-600 border-solid shadow-sm' 
                : 'border-2 border-dashed border-slate-400 text-slate-500 bg-slate-100/50 dark:bg-slate-800/50'
            }`}
          >
            {step >= 3 ? '鬧鐘' : 'python'}
          </motion.div>

          {/* DOT */}
          <AnimatePresence>
            {step >= 3 ? (
              <motion.span 
                key="dot"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-slate-800 dark:text-slate-200 font-black mx-1"
              >
                .
              </motion.span>
            ) : <span className="mx-2 w-3"></span>}
          </AnimatePresence>

          {/* Verb */}
          <div className="px-3 py-2 text-cyan-600 dark:text-cyan-400 font-bold w-24 flex justify-center">
            {step >= 3 ? '叫' : 'print'}
          </div>

          {/* Parentheses and Object */}
          <div className="flex items-center text-slate-800 dark:text-slate-200 w-32 justify-center gap-1">
            {step >= 2 && <span className="text-cyan-500 font-bold">(</span>}
            <div className={`px-2 py-1 font-medium ${step >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
              {step >= 3 ? '"06:00"' : '3'}
            </div>
            {step >= 2 && <span className="text-cyan-500 font-bold">)</span>}
          </div>
        </motion.div>
      )}

      {/* Explanatory text */}
      <div className="h-16 mt-6 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-cyan-800 dark:text-cyan-200 bg-cyan-100/80 dark:bg-cyan-900/40 px-6 py-3 rounded-xl text-sm sm:text-base font-medium shadow-sm border border-cyan-200 dark:border-cyan-800"
            >
              python 主詞隱藏起來了，這叫做 <strong className="font-headline tracking-wide">Function (函式)</strong>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-purple-800 dark:text-purple-200 bg-purple-100/80 dark:bg-purple-900/40 px-6 py-3 rounded-xl text-sm sm:text-base font-medium shadow-sm border border-purple-200 dark:border-purple-800"
            >
              主詞是明確的物件，中間加上「.」，這叫做 <strong className="font-headline tracking-wide">Method (方法)</strong>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Dynamic Arrows Helper ─── */
const DynamicArrows = ({
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
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  if (!coords) return null;

  const offset = 10; // how far above the top of the element
  const arcHeight = 30; // how high the curve arcs
  const armLen = 7; // arrowhead arm length

  // Start point: above verb center
  const sx = coords.vx;
  const sy = coords.vy - offset;

  // Left endpoint: above left noun center
  const lx = coords.lx;
  const ly = coords.ly - offset;
  // Right endpoint: above right noun center
  const rx = coords.rx;
  const ry = coords.ry - offset;

  // Control points (arc upward)
  const lcx = (sx + lx) / 2;
  const lcy = Math.min(sy, ly) - arcHeight;
  const rcx = (sx + rx) / 2;
  const rcy = Math.min(sy, ry) - arcHeight;

  // Shorten paths: compute point at t=0.88 on the quadratic bezier
  const qAt = (t: number, p0: number, p1: number, p2: number) =>
    (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  const tEnd = 0.88;
  const lEndX = qAt(tEnd, sx, lcx, lx);
  const lEndY = qAt(tEnd, sy, lcy, ly);
  const rEndX = qAt(tEnd, sx, rcx, rx);
  const rEndY = qAt(tEnd, sy, rcy, ry);

  // Split bezier control point for shortened curve
  const splitCtrl = (t: number, p0: number, p1: number) =>
    (1 - t) * p0 + t * p1;
  const lCtrlX = splitCtrl(tEnd, sx, lcx);
  const lCtrlY = splitCtrl(tEnd, sy, lcy);
  const rCtrlX = splitCtrl(tEnd, sx, rcx);
  const rCtrlY = splitCtrl(tEnd, sy, rcy);

  // Tangent at t=1 of original bezier: direction = P2 - P1
  const lTanX = lx - lcx;
  const lTanY = ly - lcy;
  const rTanX = rx - rcx;
  const rTanY = ry - rcy;

  // Normalize and compute V-arrowhead arms
  const vArrow = (tipX: number, tipY: number, tanX: number, tanY: number) => {
    const len = Math.sqrt(tanX * tanX + tanY * tanY);
    const dx = tanX / len;
    const dy = tanY / len;
    // backward direction
    const bx = -dx;
    const by = -dy;
    // perpendicular
    const px = -dy;
    const py = dx;
    // two arms at ~30deg spread
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

const AssignX2Anim = ({ step }: { step: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const verbRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full min-h-[200px] relative">
      {/* Code Area */}
      <div ref={containerRef} className="flex items-start justify-center gap-6 relative">
        {/* x */}
        <div ref={leftRef} className="flex flex-col items-center">
          <motion.div animate={{ scale: step >= 2 ? 1.1 : 1 }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white">x</motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded">名詞 (variable)</motion.div>
        </div>

        {/* = */}
        <div className="flex flex-col items-center relative z-10">
          <div ref={verbRef}>
            <motion.div animate={{ scale: step >= 2 ? 1.4 : 1, color: step >= 2 ? '#ec4899' : '' }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white transition-colors">=</motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} className="mt-2 text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 px-2 py-1 rounded">動詞 (operator)</motion.div>
        </div>

        {/* 2 */}
        <div ref={rightRef} className="flex flex-col items-center">
          <motion.div animate={{ scale: step >= 2 ? 1.1 : 1 }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white">2</motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded">名詞 (integer)</motion.div>
        </div>

        {/* Dynamic Arrows */}
        <DynamicArrows containerRef={containerRef} verbRef={verbRef} leftRef={leftRef} rightRef={rightRef} color="#ec4899" show={step >= 2} animateIn={true} />
      </div>

      {/* RAM Area */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : 20 }}
        className="w-48 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700 p-4 shadow-lg relative"
      >
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Memory (RAM)</div>
        <div className="flex items-center justify-between">
          <div className="font-mono font-bold text-lg text-cyan-600 dark:text-cyan-400">x</div>
          <div className="w-16 h-0.5 bg-slate-400 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-slate-400" />
          </div>
          <div className="w-10 h-10 bg-white dark:bg-slate-900 border-2 border-green-500 rounded flex items-center justify-center font-mono font-bold text-lg text-green-600 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            2
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Add35Anim = ({ step }: { step: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const verbRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center justify-center h-48 w-full relative">
      <div ref={containerRef} className="flex items-start justify-center gap-6 relative">
        {/* 3 */}
        <div ref={leftRef} className="flex flex-col items-center relative">
          <motion.div animate={{ opacity: step >= 2 ? 0.3 : 1 }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white relative">
            3
            {step >= 2 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
          </motion.div>
          <motion.div animate={{ opacity: step >= 2 ? 0 : 1 }} className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded">名詞 (integer)</motion.div>
        </div>

        {/* + */}
        <div className="flex flex-col items-center relative z-10">
          <div ref={verbRef}>
            <motion.div animate={{ scale: step === 1 ? 1.4 : 1, color: step === 1 ? '#8b5cf6' : '', opacity: step >= 2 ? 0.3 : 1 }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white transition-colors relative">
              +
              {step >= 2 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
            </motion.div>
          </div>
          <motion.div animate={{ opacity: step >= 2 ? 0 : 1 }} className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">動詞 (operator)</motion.div>
        </div>

        {/* 5 */}
        <div ref={rightRef} className="flex flex-col items-center relative">
          <motion.div animate={{ opacity: step >= 2 ? 0.3 : 1 }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white relative">
            5
            {step >= 2 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
          </motion.div>
          <motion.div animate={{ opacity: step >= 2 ? 0 : 1 }} className="mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded">名詞 (integer)</motion.div>
        </div>

        {/* Dynamic Arrows */}
        <DynamicArrows containerRef={containerRef} verbRef={verbRef} leftRef={leftRef} rightRef={rightRef} color="#8b5cf6" show={step >= 1 && step < 2} animateIn={true} />
      </div>
      
      {/* Return Value */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div
            initial={{ scale: 0, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: -60, opacity: 1 }}
            className="absolute font-mono text-5xl font-extrabold text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] z-20"
          >
            8
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-amber-600 dark:text-amber-400 whitespace-nowrap bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">Return value</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ComboAssignAddAnim = ({ step }: { step: number }) => {
  const assignContainerRef = useRef<HTMLDivElement>(null);
  const assignLeftRef = useRef<HTMLDivElement>(null);
  const assignVerbRef = useRef<HTMLDivElement>(null);
  const assignRightRef = useRef<HTMLDivElement>(null);

  const addContainerRef = useRef<HTMLDivElement>(null);
  const addLeftRef = useRef<HTMLDivElement>(null);
  const addVerbRef = useRef<HTMLDivElement>(null);
  const addRightRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full min-h-[200px] relative">
      {/* Code Area */}
      <div ref={assignContainerRef} className="flex items-start justify-center gap-4 relative">
        {/* x */}
        <div ref={assignLeftRef} className="flex flex-col items-center">
          <motion.div animate={{ scale: step >= 2 ? 1.1 : 1 }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white">x</motion.div>
          <motion.div className="mt-2 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded">名詞</motion.div>
        </div>

        {/* = */}
        <div className="flex flex-col items-center relative z-10">
          <div ref={assignVerbRef}>
            <motion.div animate={{ scale: step >= 2 ? 1.4 : 1, color: step >= 2 ? '#ec4899' : '' }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white transition-colors">=</motion.div>
          </div>
          <motion.div className="mt-2 text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 px-1.5 py-0.5 rounded">動詞 (assign)</motion.div>
        </div>

        {/* The 3 + 5 part → becomes 8 */}
        <div ref={assignRightRef} className="flex gap-4 relative">
          <motion.div animate={{ opacity: step >= 1 ? 0 : 1 }} className="flex gap-4">
            <div ref={addContainerRef} className="flex gap-4 relative">
              <div ref={addLeftRef} className="flex flex-col items-center">
                <div className="font-mono text-4xl font-bold text-slate-800 dark:text-white relative">
                  3
                  {step === 1 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
                </div>
                <div className="mt-2 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded">名詞</div>
              </div>
              
              <div className="flex flex-col items-center relative z-10">
                <div ref={addVerbRef}>
                  <div className="font-mono text-4xl font-bold text-purple-500 relative">
                    +
                    {step === 1 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">動詞 (add)</div>
              </div>

              <div ref={addRightRef} className="flex flex-col items-center">
                <div className="font-mono text-4xl font-bold text-slate-800 dark:text-white relative">
                  5
                  {step === 1 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
                </div>
                <div className="mt-2 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded">名詞</div>
              </div>

              {/* Dynamic Add Arrows */}
              <DynamicArrows containerRef={addContainerRef} verbRef={addVerbRef} leftRef={addLeftRef} rightRef={addRightRef} color="#8b5cf6" show={step === 1} />
            </div>
          </motion.div>
          
          {/* Return value popping up */}
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0, position: 'absolute', top: 0, left: '50%', x: '-50%' }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-mono text-4xl font-extrabold text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] z-20 flex flex-col items-center"
              >
                8
                <div className="mt-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-200">Return value</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Assign Arrows */}
        <DynamicArrows containerRef={assignContainerRef} verbRef={assignVerbRef} leftRef={assignLeftRef} rightRef={assignRightRef} color="#ec4899" show={step >= 2} />
      </div>

      {/* RAM Area */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : 20 }}
        className="w-48 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700 p-4 shadow-lg relative mt-6 md:mt-0"
      >
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Memory (RAM)</div>
        <div className="flex items-center justify-between">
          <div className="font-mono font-bold text-lg text-cyan-600 dark:text-cyan-400">x</div>
          <div className="w-16 h-0.5 bg-slate-400 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-slate-400" />
          </div>
          <div className="w-10 h-10 bg-white dark:bg-slate-900 border-2 border-green-500 rounded flex items-center justify-center font-mono font-bold text-lg text-green-600 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            8
          </div>
        </div>
      </motion.div>
    </div>
  );
};
