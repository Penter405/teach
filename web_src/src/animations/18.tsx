// Animation 18: AssignX2Anim
import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { DynamicArrows } from './DynamicArrows';

export default function Animation({ step }: { step: number }) {
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
            <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 border-y-[4px] border-transparent border-l-[6px] border-l-slate-400 border-r-0" />
          </div>
          <div className="w-10 h-10 bg-white dark:bg-slate-900 border-2 border-green-500 rounded flex items-center justify-center font-mono font-bold text-lg text-green-600 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            2
          </div>
        </div>
      </motion.div>
    </div>
  );
}
