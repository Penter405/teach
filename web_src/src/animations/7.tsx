// Animation 7: ReflectionInspectAnim
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Animation({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center w-full h-56 relative perspective-1000">
      {/* Center Object */}
      <motion.div 
        animate={{ rotateY: step > 0 ? 15 : 0, scale: step > 0 ? 0.9 : 1 }}
        className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center relative z-10 transform-style-3d"
      >
        <span className="text-4xl text-white font-mono font-bold">x</span>
        
        {/* X-Ray Scanning Line */}
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ top: '-10%', opacity: 0 }}
              animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
              className="absolute left-0 w-full h-2 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] z-20"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Extracted Metadata Floating Chips */}
      <AnimatePresence>
        {step >= 2 && (
          <>
            <motion.div initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: 1, x: -80, y: -60 }} className="absolute z-20 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">class 'list'</span>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: 1, x: 90, y: -20 }} className="absolute z-20 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">append()</span>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: 1, x: -70, y: 60 }} className="absolute z-20 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">clear()</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deep Inspection Tooltip */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 90, y: -20 }}
            animate={{ opacity: 1, scale: 1, x: 120, y: -50 }}
            className="absolute z-30 p-3 w-40 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl"
          >
            <div className="font-mono text-[10px] text-cyan-400 mb-1">help(append)</div>
            <div className="text-[10px] text-slate-300 leading-tight">Append object to the end of the list.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
