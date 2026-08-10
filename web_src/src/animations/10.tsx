// Animation 10: PointerAnim
import React from 'react';
import { motion } from 'motion/react';

export default function Animation({ step }: { step: number }) {
  // Arrow path calculations
  const getPath = (stepLevel: number) => {
    if (stepLevel < 1) return "M 60 120 C 60 120, 60 120, 60 120"; // Hidden
    if (stepLevel < 3) return "M 80 120 C 140 120, 140 60, 200 60"; // Points to 5
    return "M 80 120 C 140 120, 140 180, 200 180"; // Points to 10
  };

  return (
    <div className="flex items-center justify-between w-full max-w-sm h-60 relative px-4">
      {/* Variables Column */}
      <div className="flex flex-col justify-center h-full z-10">
        <motion.div 
          animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.8 }}
          className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center relative"
        >
          <span className="font-mono font-bold text-slate-700 dark:text-slate-200">a</span>
          {/* Pulsing origin dot */}
          {step >= 1 && <div className="absolute -right-1 w-3 h-3 bg-cyan-500 rounded-full" />}
        </motion.div>
      </div>

      {/* Visual Curved Pointer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
          </marker>
        </defs>
        <motion.path
          d={getPath(step)}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="3"
          markerEnd={step >= 1 ? "url(#arrowhead)" : ""}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: step >= 1 ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        {/* Animated pulse traveling along the line */}
        {step === 2 && (
          <motion.circle r="4" fill="#67e8f9" filter="drop-shadow(0 0 4px #06b6d4)">
            <animateMotion dur="1.5s" repeatCount="indefinite" path={getPath(2)} />
          </motion.circle>
        )}
      </svg>

      {/* Memory Blocks Column */}
      <div className="flex flex-col justify-between h-full py-8 gap-8 z-10">
        {/* Memory cell: 5 */}
        <motion.div 
          animate={{ 
            opacity: step >= 0 ? 1 : 0,
            y: step >= 0 ? 0 : 20,
            borderColor: step >= 1 && step < 3 ? 'rgba(6,182,212,1)' : 'rgba(226,232,240,0.5)' // Highlight if pointed
          }}
          className="w-24 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border-2 flex flex-col items-center justify-center shadow-lg relative"
        >
          <span className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-400">5</span>
          <span className="absolute -top-5 font-mono text-[10px] text-slate-400">0x7f01</span>
        </motion.div>

        {/* Memory cell: 10 */}
        <motion.div 
          animate={{ 
            opacity: step >= 3 ? 1 : 0,
            y: step >= 3 ? 0 : -20,
            borderColor: step >= 3 ? 'rgba(6,182,212,1)' : 'rgba(226,232,240,0.5)' // Highlight if pointed
          }}
          className="w-24 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border-2 flex flex-col items-center justify-center shadow-lg relative"
        >
          <span className="font-mono text-2xl font-bold text-purple-600 dark:text-purple-400">10</span>
          <span className="absolute -bottom-5 font-mono text-[10px] text-slate-400">0x7f09</span>
        </motion.div>
      </div>
    </div>
  );
}
