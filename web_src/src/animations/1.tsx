// Animation 1: DataFlowAnim (data-flow-animation)
import React from 'react';
import { motion } from 'motion/react';
import { Box, AnimArrow } from './shared';

export default function Animation({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <Box active={step === 0} color="cyan" className="min-w-[160px]">
        <div className="text-xs tracking-wide uppercase opacity-70">Input</div>
        <div className="mt-1 flex items-center justify-center gap-2 font-mono text-sm">
          <span className="px-2 py-1 rounded-md bg-white/70 dark:bg-white/10 border border-cyan-300 dark:border-cyan-700 shadow-sm">
            WASD
          </span>
          <motion.span
            animate={step === 0 ? { scale: [1, 1.14, 1], boxShadow: ['0 0 0 rgba(251,191,36,0)', '0 0 18px rgba(251,191,36,0.6)', '0 0 0 rgba(251,191,36,0)'] } : { scale: 1, boxShadow: '0 0 0 rgba(251,191,36,0)' }}
            transition={{ duration: 0.9, repeat: step === 0 ? Infinity : 0 }}
            className={`px-2 py-1 rounded-md border font-bold ${step === 0 ? 'bg-amber-200 border-amber-500 text-amber-900 shadow' : 'bg-white/70 dark:bg-white/10 border-cyan-200 dark:border-cyan-700 text-cyan-900 dark:text-cyan-100'}`}
          >
            F
          </motion.span>
        </div>
        <div className="mt-1 text-xs text-cyan-900 dark:text-cyan-100/80">按下 F</div>
      </Box>
      <AnimArrow active={step === 0 || step === 1} />
      <Box active={step === 1} color="slate" className="min-w-[180px]">
        <div className="text-xs tracking-wide uppercase opacity-70">Process</div>
        <motion.div
          animate={step === 1 ? { opacity: [0.72, 1, 0.72] } : { opacity: 1 }}
          transition={{ duration: 1.2, repeat: step === 1 ? Infinity : 0 }}
          className="mt-1 font-mono text-sm bg-black/30 rounded-md px-3 py-2 border border-slate-700 text-white text-left"
        >
          if (press F):<br />
          &nbsp;&nbsp;enter_car()
        </motion.div>
        <div className="mt-1 text-xs text-slate-200/80">程式判斷附近車輛</div>
      </Box>
      <AnimArrow active={step === 1 || step === 2} />
      <Box active={step === 2} color="purple" className="min-w-[190px]">
        <div className="text-xs tracking-wide uppercase opacity-70">Output · Secondary Screen</div>
        <div className="mt-2 w-full rounded-lg border border-purple-300 dark:border-purple-700 bg-white/70 dark:bg-purple-900/30 p-2 shadow-inner">
          <div className="text-[11px] text-purple-700 dark:text-purple-200 font-semibold mb-1">顯示器</div>
          <div className="flex items-center justify-center text-2xl gap-2 overflow-hidden">
            <motion.span animate={step === 2 ? { x: [0, 14, 26], opacity: [1, 1, 0.95] } : { x: 0, opacity: 1 }} transition={{ duration: 1.4, repeat: step === 2 ? Infinity : 0, repeatDelay: 0.2 }}>🚶‍♂️</motion.span>
            <motion.span animate={step === 2 ? { opacity: [0.2, 1, 0.2], x: [0, 4, 0] } : { opacity: 0.5, x: 0 }} transition={{ duration: 1, repeat: step === 2 ? Infinity : 0 }}>→</motion.span>
            <span>🚗</span>
          </div>
          <div className="text-[11px] text-purple-900 dark:text-purple-100/80 text-center mt-1">螢幕提示「進入車輛」</div>
        </div>
      </Box>
    </div>
  );
}
