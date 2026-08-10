// Animation 13: IndentAnim
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function Animation({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center w-full max-w-md h-40 relative perspective-1000">
      {/* Structural Container */}
      <div className="w-64 bg-slate-900 rounded-xl p-6 flex flex-col items-start justify-center shadow-2xl border border-slate-800 relative overflow-hidden">
        
        {/* Glowing Indentation Block (Appears in Python step) */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: step >= 2 ? '24px' : '0px',
            opacity: step >= 2 ? 1 : 0 
          }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="absolute left-0 top-0 bottom-0 bg-cyan-500/20 border-r border-cyan-400/50"
        />

        {/* Outer Scope */}
        <div className="w-16 h-4 bg-slate-700 rounded-full mb-3" />
        
        {/* Inner Scope Container */}
        <motion.div 
          animate={{ x: step >= 2 ? 24 : 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="flex items-center w-full relative"
        >
          {/* Left Brace (C-style) */}
          <motion.span
            animate={{ 
              opacity: step >= 1 ? 0 : 1,
              y: step >= 1 ? 20 : 0,
              rotate: step >= 1 ? -45 : 0
            }}
            className="absolute -left-4 font-mono text-2xl text-amber-500 font-bold"
          >
            {'{'}
          </motion.span>
          
          <div className="w-24 h-4 bg-purple-500/80 rounded-full my-2 ml-4" />

          {/* Right Brace (C-style) */}
          <motion.span
            animate={{ 
              opacity: step >= 1 ? 0 : 1,
              y: step >= 1 ? 20 : 0,
              rotate: step >= 1 ? 45 : 0
            }}
            className="absolute right-12 font-mono text-2xl text-amber-500 font-bold"
          >
            {'}'}
          </motion.span>
        </motion.div>

        {/* Outer Scope Close */}
        <div className="w-12 h-4 bg-slate-700 rounded-full mt-3" />

        {/* Colon (Python style) */}
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: step >= 2 ? 1 : 0, scale: step >= 2 ? 1 : 0 }}
          className="absolute right-4 top-5 font-mono text-xl text-cyan-400 font-bold"
        >
          :
        </motion.span>
      </div>
      
      {/* Success Tick */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-2 -bottom-2 w-10 h-10 bg-green-500 rounded-full border-4 border-surface dark:border-slate-950 flex items-center justify-center text-white shadow-xl z-20"
          >
            <CheckCircle2 size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
