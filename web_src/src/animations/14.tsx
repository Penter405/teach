// Animation 14: HouseAnalogyAnim
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Animation({ step }: { step: number }) {
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
}
