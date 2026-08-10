// Animation 3: InterpreterExecAnim
import React from 'react';
import { motion } from 'motion/react';
import { Bolt } from 'lucide-react';

export default function Animation({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-12 w-full max-w-2xl h-48 relative">
      {/* Source Code Document */}
      <motion.div 
        animate={{ scale: step === 0 ? 1.05 : 1, opacity: step >= 0 ? 1 : 0 }}
        className="w-24 sm:w-32 h-36 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col p-3 relative z-10"
      >
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-3" />
        <div className="w-3/4 h-2 bg-cyan-200 dark:bg-cyan-900 rounded-full mb-2" />
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
        <div className="w-1/2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
        
        {/* Glow effect when active */}
        <motion.div animate={{ opacity: step === 0 ? 1 : 0 }} className="absolute inset-0 border-2 border-cyan-400 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
      </motion.div>

      {/* Traveling Data Packet */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ 
          x: step === 1 ? 0 : step > 1 ? 60 : -60,
          opacity: step === 1 ? 1 : 0,
          scale: step === 1 ? [1, 1.2, 1] : 1
        }}
        transition={{ duration: 0.6, repeat: step === 1 ? Infinity : 0 }}
        className="absolute z-20 w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
      />

      {/* Interpreter Machine */}
      <motion.div
        animate={{ 
          scale: step === 2 ? 1.1 : 1,
          boxShadow: step === 2 ? '0 0 30px rgba(168,85,247,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}
        className="w-32 sm:w-40 h-40 bg-[#1e293b] rounded-2xl flex flex-col items-center justify-center border-2 border-slate-700 relative z-10 overflow-hidden"
      >
        <Bolt className={`w-10 h-10 ${step === 2 ? 'text-purple-400 animate-spin-slow' : 'text-slate-500'}`} />
        <div className={`mt-2 font-mono text-xs font-bold tracking-widest ${step === 2 ? 'text-purple-300' : 'text-slate-500'}`}>INTERPRETER</div>
        
        {/* Processing scanline */}
        <motion.div
          animate={{ top: step === 2 ? ['0%', '100%'] : '0%', opacity: step === 2 ? [0, 1, 0] : 0 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute left-0 w-full h-1 bg-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
        />
      </motion.div>

      {/* Output Console */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : -20 }}
        className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 w-28 h-20 bg-black/80 backdrop-blur-md rounded-lg border border-slate-700 flex items-center justify-center shadow-2xl z-30"
      >
        <span className="font-mono text-green-400 text-xl font-bold">5</span>
      </motion.div>
    </div>
  );
}
