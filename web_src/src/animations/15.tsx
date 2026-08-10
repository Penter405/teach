// Animation 15: ImmutableHouseAnim
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle } from 'lucide-react';

export default function Animation({ step }: { step: number }) {
  return (
    <div className="w-full max-w-lg h-64 flex items-center justify-center gap-4 sm:gap-8 relative mt-6">
      {/* Old House */}
      <motion.div 
        animate={{ 
          opacity: step >= 3 ? 0.3 : 1,
          scale: step === 1 ? [1, 1.05, 0.95, 1.05, 0.95, 1] : 1
        }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center"
      >
        <motion.div 
          animate={{ opacity: step < 3 ? 1 : 0, y: step < 3 ? 0 : -20 }}
          className="bg-sky-500 text-white font-mono font-bold text-xl px-4 py-1 rounded-md shadow-lg border-2 border-white dark:border-slate-800 mb-2 z-20 h-10 flex items-center justify-center"
        >
          x
        </motion.div>
        
        <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-end pb-4 mt-2">
          <div className="absolute -top-10 w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-b-[48px] border-b-rose-500" />
          
          <div className="flex flex-col items-center relative w-full h-full justify-end">
            <span className="text-3xl mb-1">🧍</span>
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-mono font-bold px-3 py-1 rounded-full text-sm border border-amber-300 dark:border-amber-700">
              5
            </div>
            {/* Shake effect X */}
            <AnimatePresence>
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <XCircle className="w-12 h-12 text-red-500 bg-white rounded-full drop-shadow-md" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* New House */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative flex flex-col items-center"
          >
            <motion.div 
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : -20 }}
              className="bg-sky-500 text-white font-mono font-bold text-xl px-4 py-1 rounded-md shadow-lg border-2 border-white dark:border-slate-800 mb-2 z-20 h-10 flex items-center justify-center"
            >
              x
            </motion.div>
            
            <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-end pb-4 mt-2">
              <div className="absolute -top-10 w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-b-[48px] border-b-purple-500" />
              
              <div className="flex flex-col items-center h-full justify-end">
                <span className="text-3xl mb-1">🧍</span>
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-mono font-bold px-3 py-1 rounded-full text-sm border border-amber-300 dark:border-amber-700">
                  10
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
