// Animation 9: GCAnimationAnim
import React from 'react';
import { motion } from 'motion/react';

export default function Animation({ step }: { step: number }) {
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
}
