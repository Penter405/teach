// Animation 6: SelfBindingAnim
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function Animation({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-8 sm:gap-20 w-full h-48 relative">
      {/* Blueprint (Class) */}
      <motion.div
        animate={{ scale: step === 0 ? 1.05 : 1 }}
        className="w-32 h-40 bg-cyan-50/50 dark:bg-cyan-900/20 border-2 border-dashed border-cyan-400 rounded-xl flex flex-col items-center justify-center relative z-10"
      >
        <div className="font-mono text-cyan-700 dark:text-cyan-300 font-bold mb-4">Dog</div>
        {/* The 'self' parameter socket */}
        <motion.div 
          animate={{ 
            backgroundColor: step >= 2 ? 'rgba(168,85,247,0.2)' : 'rgba(6,182,212,0.1)',
            borderColor: step >= 2 ? 'rgba(168,85,247,1)' : 'rgba(6,182,212,0.5)'
          }}
          className="px-3 py-1 rounded-full border-2 font-mono text-xs font-bold text-cyan-800 dark:text-cyan-200 transition-colors"
        >
          self
        </motion.div>
      </motion.div>

      {/* Object (Instance) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: -40 }}
        animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.5, x: step >= 1 ? 0 : -40 }}
        className="w-24 h-24 bg-purple-100 dark:bg-purple-900/40 rounded-2xl shadow-xl flex items-center justify-center relative z-10 backdrop-blur-md"
      >
        {/* Glow behind object */}
        <motion.div animate={{ opacity: step >= 3 ? 1 : 0 }} className="absolute inset-0 bg-purple-400 blur-xl opacity-30 -z-10 rounded-full" />
        <span className="text-3xl">🐕</span>
        
        {/* Success badge */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 text-white shadow-lg">
              <CheckCircle2 size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Connecting Laser/String */}
      {step >= 2 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <motion.path
            d="M 120 96 Q 200 150 280 96"
            fill="none"
            stroke="url(#purpleGlow)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
}
