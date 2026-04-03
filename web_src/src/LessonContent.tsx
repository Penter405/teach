import React from 'react';
import { motion } from 'motion/react';
import { Bolt, Zap, CheckCircle2, ChevronRight, Play, SkipBack, SkipForward, ArrowRight, ExternalLink } from 'lucide-react';
import { ContentBlock } from './courseData';

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
    result = result.replace(/(#.*)$/gm, '<span class="text-slate-500">$1</span>');
    // Strings
    result = result.replace(/(&quot;.*?&quot;|&#x27;.*?&#x27;|".*?"|'.*?')/g, '<span class="text-green-400">$1</span>');
    // Keywords
    const keywords = ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'as', 'True', 'False', 'None', 'and', 'or', 'not', 'is', 'break', 'continue', 'pass', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'self'];
    keywords.forEach(kw => {
      const re = new RegExp(`\\b(${kw})\\b(?!")`, 'g');
      result = result.replace(re, `<span class="text-purple-400">$1</span>`);
    });
    // Built-ins
    const builtins = ['print', 'input', 'len', 'range', 'int', 'str', 'float', 'bool', 'list', 'dict', 'tuple', 'type', 'sum', 'max', 'min', 'enumerate', 'append', 'split', 'get', 'keys'];
    builtins.forEach(fn => {
      const re = new RegExp(`\\b(${fn})(?=\\()`, 'g');
      result = result.replace(re, `<span class="text-blue-400">$1</span>`);
    });
    // Numbers
    result = result.replace(/\b(\d+\.?\d*)\b(?!")/g, `<span class="text-orange-400">$1</span>`);

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
