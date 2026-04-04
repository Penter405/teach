import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bolt, Zap, CheckCircle2, ChevronRight, Play, SkipBack, SkipForward, ArrowRight, ExternalLink, XCircle, Trophy, Code2 } from 'lucide-react';
import { ContentBlock, QuizQuestion, PracticeProblem } from './courseData';

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

    default:
      return null;
  }
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
      <div className="flex justify-center w-full overflow-x-auto pb-4">
        {id === 'course-structure-timeline' && <TimelineDiagram />}
        {id === 'input-process-output' && <IPODiagram />}
        {id === 'interpreter-vs-compiler' && <IVCDiagram />}
        {id === 'class-object-flow' && <COFDiagram />}
        {id === 'cpu-ram-cycle' && <CRCDiagram />}
        {id === 'variable-memory-map' && <VMMDiagram />}
        {id === 'python-code-types' && <PCTDiagram />}
        {id === 'class-blueprint' && <CBPDiagram />}
        
        {/* Fallback if diagram component not mapped */}
        {![
          'course-structure-timeline', 'input-process-output', 'interpreter-vs-compiler',
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
  <div className="flex items-center gap-0 w-full min-w-[400px]">
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
    
    <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl transition-transform hover:scale-[1.02]">
      <span className="text-3xl mb-3 block opacity-50 grayscale">❌</span>
      <h3 className="font-headline text-xl font-bold text-slate-800 dark:text-white mb-1">編譯器 Compiler</h3>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">C# 使用</p>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-left w-full h-20 flex flex-col justify-center mb-4 font-mono text-xs text-slate-500 opacity-80">
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
          
          <div className="font-mono text-xs md:text-sm font-semibold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-md shadow-inner text-center mx-2 w-[110px]">
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
  const [step, setStep] = useState(0);
  const total = steps.length;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 w-full overflow-hidden">
      <div className="flex justify-center w-full min-h-[200px] items-center py-4">
        {children(step)}
      </div>
      <div className="mt-4 px-2">
        <div className="flex items-center gap-1 mb-3">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center mb-4 min-h-[40px]">
          Step {step + 1}: {steps[step]}
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
    'self-binding': (s) => <SelfBindingAnim step={s} />,
    'reflection-inspect': (s) => <ReflectionInspectAnim step={s} />,
    'data-pipeline': (s) => <DataPipelineAnim step={s} />,
    'gc-animation': (s) => <GCAnimationAnim step={s} />,
    'pointer-animation': (s) => <PointerAnim step={s} />,
    'immutable-swap': (s) => <ImmutableSwapAnim step={s} />,
    'mutable-ref': (s) => <MutableRefAnim step={s} />,
    'indent-animation': (s) => <IndentAnim step={s} />,
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
    <Box active={step === 0} color="cyan"><span className="text-2xl mb-1 block">📥</span>Input</Box>
    <AnimArrow active={step === 0} />
    <Box active={step === 1} color="slate"><span className="text-2xl mb-1 block">💻</span>Process</Box>
    <AnimArrow active={step === 1} />
    <Box active={step === 2} color="purple"><span className="text-2xl mb-1 block">📤</span>Output</Box>
  </div>
);

const ProblemDecomposeAnim = ({ step }: { step: number }) => {
  const items = ['📋 閱讀題目', '🔑 識別關鍵詞', '✂️ 拆分步驟', '💻 逐一實現'];
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {items.map((item, i) => (
        <motion.div key={i} animate={{ opacity: i <= step ? 1 : 0.2, x: i <= step ? 0 : 20 }} transition={{ duration: 0.4, delay: 0.05 }}
          className={`p-3 rounded-lg text-sm font-medium flex items-center gap-3 ${i <= step ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-900 dark:text-cyan-100 border border-cyan-200 dark:border-cyan-800' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border border-slate-100 dark:border-slate-700'}`}>
          <span className="text-lg">{item.split(' ')[0]}</span><span>{item.split(' ').slice(1).join(' ')}</span>
        </motion.div>
      ))}
    </div>
  );
};

const InterpreterExecAnim = ({ step }: { step: number }) => {
  const lines = ['a = 5', 'print(a)'];
  const outputs = ['', '', '', '>>> 5'];
  return (
    <div className="flex gap-6 w-full max-w-lg">
      <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-sm">
        {lines.map((line, i) => {
          const lineStep = i * 2;
          return (
            <motion.div key={i} animate={{ backgroundColor: step === lineStep || step === lineStep + 1 ? 'rgba(8,145,178,0.15)' : 'transparent' }} transition={{ duration: 0.3 }}
              className="flex items-center gap-3 py-1 px-2 rounded">
              <span className="text-slate-500 text-xs w-4">{i + 1}</span>
              <span className={step >= lineStep ? 'text-slate-200' : 'text-slate-600'}>{line}</span>
              {(step === lineStep || step === lineStep + 1) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-cyan-400 ml-auto" />}
            </motion.div>
          );
        })}
      </div>
      <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-xl p-4 flex flex-col justify-end">
        <span className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Output</span>
        <motion.div animate={{ opacity: step >= 3 ? 1 : 0 }} className="font-mono text-sm text-green-600 dark:text-green-400">{outputs[step] || ''}</motion.div>
      </div>
    </div>
  );
};

const SelfBindingAnim = ({ step }: { step: number }) => {
  const highlights = ['定義 class', '呼叫建構子', 'self 綁定', '屬性存取'];
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <Box active={step === 0} color="cyan" className="w-full">class Dog: __init__(self, name)</Box>
      {step >= 1 && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-sm text-slate-500">Lucky = Dog("Lucky")</motion.div>}
      {step >= 2 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl w-full justify-center">
          <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">self</span>
          <span className="text-purple-400 animate-pulse">→</span>
          <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">Lucky</span>
        </motion.div>
      )}
      {step >= 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
          self.name = Lucky.name = "Lucky" ✓
        </motion.div>
      )}
    </div>
  );
};

const ReflectionInspectAnim = ({ step }: { step: number }) => {
  const results = ['x = [1, 2, 3]', "type(x) → <class 'list'>", "dir(x) → ['append', 'clear', ...]", "help(x.append) → 用法說明"];
  return (
    <div className="flex flex-col gap-3 w-full max-w-md font-mono text-sm">
      {results.map((r, i) => (
        <motion.div key={i} animate={{ opacity: i <= step ? 1 : 0.15, x: i <= step ? 0 : 12 }} transition={{ duration: 0.35 }}
          className={`p-3 rounded-lg border ${i <= step ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
          <span className="text-cyan-400 mr-2">{'>>>'}</span>{r}
        </motion.div>
      ))}
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
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Reference Count</div>
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
  const rows = [
    { show: step >= 0, name: 'RAM', addr: '0x7f01', val: '5', highlight: step === 0 },
    { show: step >= 1, name: 'a', addr: '0x7f01', val: '→', highlight: step === 1 },
    { show: step >= 2, name: 'a → val', addr: '', val: '5', highlight: step === 2 },
    { show: step >= 3, name: 'a', addr: '0x7f09', val: '10 (新)', highlight: step === 3 },
  ];
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {rows.filter(r => r.show).map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className={`flex items-center justify-between p-3 rounded-lg border text-sm font-mono ${r.highlight ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
          <span className="font-bold text-purple-600 dark:text-purple-400 w-20">{r.name}</span>
          {r.addr && <span className="text-slate-500 text-xs">{r.addr}</span>}
          <span className="font-bold text-cyan-700 dark:text-cyan-300">{r.val}</span>
        </motion.div>
      ))}
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
    {step >= 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500 italic">舊物件 5 無引用 → 垃圾回收</motion.div>}
  </div>
);

const MutableRefAnim = ({ step }: { step: number }) => {
  const listContent = step >= 2 ? '[1,2,3,4]' : '[1,2,3]';
  const copyContent = step >= 4 ? '[1,2,3]' : '[1,2,3]';
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex items-center gap-4">
        <Box active={step <= 2} color="cyan" className="flex-1"><span className="text-xs block mb-1">a</span>{listContent}</Box>
        {step >= 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 font-mono">b = a</motion.div>}
        {step >= 1 && <Box active={step === 2} color="cyan" className="flex-1"><span className="text-xs block mb-1">b (ref)</span>{listContent}</Box>}
      </div>
      {step >= 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-amber-600 dark:text-amber-400 font-medium">⚠️ a.append(4) → b 也受影響！</motion.div>}
      {step >= 3 && (
        <div className="flex items-center gap-4 mt-2">
          <Box active={step === 4} color="green" className="flex-1"><span className="text-xs block mb-1">c (copy)</span>{copyContent}</Box>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500">獨立副本</motion.div>
        </div>
      )}
      {step >= 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-green-600 dark:text-green-400 font-medium">✅ a 改變 → c 不受影響</motion.div>}
    </div>
  );
};

const IndentAnim = ({ step }: { step: number }) => {
  const cLines = ['if (x > 3) {', '    printf("big");', '}'];
  const pyLines = ['if x > 3:', '    print("big")', ''];
  const lines = step <= 1 ? cLines : pyLines;
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <motion.span animate={{ opacity: step <= 1 ? 1 : 0.4 }} className="text-xs font-bold text-slate-500 uppercase tracking-widest">C Language</motion.span>
        <motion.span animate={{ opacity: step >= 2 ? 1 : 0.4 }} className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Python</motion.span>
      </div>
      <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm">
        {lines.map((line, i) => (
          <motion.div key={`${step}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
            className="text-slate-200 py-0.5">{line || <span className="text-slate-700">// removed</span>}</motion.div>
        ))}
      </div>
      {step === 1 && <p className="text-xs text-amber-500 mt-2 text-center">移除 {'{ }'} ...</p>}
      {step === 2 && <p className="text-xs text-cyan-500 mt-2 text-center">加上冒號 : ...</p>}
      {step === 3 && <p className="text-xs text-green-500 mt-2 text-center font-medium">✅ 用縮排取代大括號！</p>}
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
