// Shared animation utilities used by all animation components
import React from 'react';
import { motion } from 'motion/react';

export const Box = ({ children, active, color = 'cyan', className = '' }: { children: React.ReactNode; active: boolean; color?: string; className?: string }) => {
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

export const AnimArrow = ({ active }: { active: boolean }) => (
  <motion.div animate={{ opacity: active ? 1 : 0.2, x: active ? [0, 4, 0] : 0 }} transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatType: 'loop' }}
    className="text-slate-400 text-xl font-bold mx-2">→</motion.div>
);
