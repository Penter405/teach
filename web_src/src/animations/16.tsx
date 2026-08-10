// Animation 16: MutableHouseAnim
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Animation({ step }: { step: number }) {
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
}
