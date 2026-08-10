// Animation 17: SubjectVerbObjectAnim
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Animation({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-2xl py-4">
      {/* Photo 1: 主詞 動詞 受詞 */}
      <div className="flex gap-8 sm:gap-16 text-center text-lg sm:text-xl font-headline font-bold text-slate-700 dark:text-slate-300">
        <div className="flex flex-col items-center w-24">
          <span className="mb-2">主詞</span>
          {(step >= 1) && <motion.span initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="text-slate-400 font-bold text-2xl">↓</motion.span>}
        </div>
        <div className="flex flex-col items-center w-24">
          <span className="mb-2">動詞</span>
          {(step >= 1) && <motion.span initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="text-slate-400 font-bold text-2xl">↓</motion.span>}
        </div>
        <div className="flex flex-col items-center w-24">
          <span className="mb-2">受詞</span>
          {(step >= 1) && <motion.span initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="text-slate-400 font-bold text-2xl">↓</motion.span>}
        </div>
      </div>

      {/* Code representation */}
      {step >= 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center font-mono text-xl sm:text-3xl gap-2 mt-2 h-16"
        >
          {/* Subject */}
          <motion.div
            animate={{ 
              opacity: step === 1 ? 0.8 : (step === 2 ? 0.2 : 1),
            }}
            className={`px-4 py-2 rounded-xl transition-all w-32 flex justify-center ${
              step >= 3 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-600 border-solid shadow-sm' 
                : 'border-2 border-dashed border-slate-400 text-slate-500 bg-slate-100/50 dark:bg-slate-800/50'
            }`}
          >
            {step >= 3 ? '鬧鐘' : 'python'}
          </motion.div>

          {/* DOT */}
          <AnimatePresence>
            {step >= 3 ? (
              <motion.span 
                key="dot"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-slate-800 dark:text-slate-200 font-black mx-1"
              >
                .
              </motion.span>
            ) : <span className="mx-2 w-3"></span>}
          </AnimatePresence>

          {/* Verb */}
          <div className="px-3 py-2 text-cyan-600 dark:text-cyan-400 font-bold w-24 flex justify-center">
            {step >= 3 ? '叫' : 'print'}
          </div>

          {/* Parentheses and Object */}
          <div className="flex items-center text-slate-800 dark:text-slate-200 w-32 justify-center gap-1">
            {step >= 2 && <span className="text-cyan-500 font-bold">(</span>}
            <div className={`px-2 py-1 font-medium ${step >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
              {step >= 3 ? '"06:00"' : '3'}
            </div>
            {step >= 2 && <span className="text-cyan-500 font-bold">)</span>}
          </div>
        </motion.div>
      )}

      {/* Explanatory text */}
      <div className="h-16 mt-6 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-cyan-800 dark:text-cyan-200 bg-cyan-100/80 dark:bg-cyan-900/40 px-6 py-3 rounded-xl text-sm sm:text-base font-medium shadow-sm border border-cyan-200 dark:border-cyan-800"
            >
              python 主詞隱藏起來了，這叫做 <strong className="font-headline tracking-wide">Function (函式)</strong>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-purple-800 dark:text-purple-200 bg-purple-100/80 dark:bg-purple-900/40 px-6 py-3 rounded-xl text-sm sm:text-base font-medium shadow-sm border border-purple-200 dark:border-purple-800"
            >
              主詞是明確的物件，中間加上「.」，這叫做 <strong className="font-headline tracking-wide">Method (方法)</strong>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
