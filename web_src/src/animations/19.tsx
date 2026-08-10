// Animation 19: Add35Anim
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DynamicArrows } from './DynamicArrows';

export default function Animation({ step }: { step: number }) {
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
}
