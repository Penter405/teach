// Animation 12: MutableRefAnim
import React from 'react';
import { motion } from 'motion/react';
import { Box } from './shared';

export default function Animation({ step }: { step: number }) {
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
}
