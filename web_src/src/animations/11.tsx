// Animation 11: ImmutableSwapAnim
import React from 'react';
import { motion } from 'motion/react';

export default function Animation({ step }: { step: number }) {
  return (
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
}
