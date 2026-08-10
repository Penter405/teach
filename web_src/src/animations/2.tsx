// Animation 2: ProblemDecomposeAnim
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function Animation({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 w-full relative">
      {/* Base Problem Block */}
      <motion.div
        animate={{ 
          scale: step === 0 ? 1 : 0.8,
          opacity: step === 0 ? 1 : 0,
          y: step === 0 ? 0 : -20 
        }}
        className="absolute w-32 h-32 bg-slate-800 rounded-2xl flex items-center justify-center border-4 border-slate-700 shadow-xl z-10"
      >
        <span className="text-4xl">🧩</span>
      </motion.div>

      {/* Decomposed Pieces */}
      <div className="flex gap-4 sm:gap-8 items-center justify-center relative z-20">
        {[
          { icon: '🔍', delay: 0 },
          { icon: '✂️', delay: 0.1 },
          { icon: '🛠️', delay: 0.2 }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5, x: 0 }}
            animate={{ 
              opacity: step >= 1 ? 1 : 0,
              scale: step >= 1 ? 1 : 0.5,
              y: step >= 2 ? 0 : (i === 1 ? -10 : 10),
              x: step >= 2 ? 0 : (i === 0 ? 40 : i === 2 ? -40 : 0)
            }}
            transition={{ duration: 0.5, delay: step >= 2 ? item.delay : 0, type: 'spring' }}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 relative
              ${step >= 3 ? 'bg-cyan-50 dark:bg-cyan-900/40 border-cyan-300 dark:border-cyan-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
          >
            {item.icon}
            
            {/* Checkmarks in final step */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: item.delay + 0.2, type: 'spring' }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white"
                >
                  <CheckCircle2 size={14} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      {/* Connecting Path */}
      {step >= 2 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <motion.line
            x1="30%" y1="50%" x2="70%" y2="50%"
            stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"
            className="text-slate-300 dark:text-slate-700"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
        </svg>
      )}
    </div>
  );
}
