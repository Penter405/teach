// Animation 20: ComboAssignAddAnim
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DynamicArrows } from './DynamicArrows';

export default function Animation({ step }: { step: number }) {
  const assignContainerRef = useRef<HTMLDivElement>(null);
  const assignLeftRef = useRef<HTMLDivElement>(null);
  const assignVerbRef = useRef<HTMLDivElement>(null);
  const assignRightRef = useRef<HTMLDivElement>(null);

  const addContainerRef = useRef<HTMLDivElement>(null);
  const addLeftRef = useRef<HTMLDivElement>(null);
  const addVerbRef = useRef<HTMLDivElement>(null);
  const addRightRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full min-h-[200px] relative">
      {/* Code Area */}
      <div ref={assignContainerRef} className="flex items-start justify-center gap-4 relative">
        {/* x */}
        <div ref={assignLeftRef} className="flex flex-col items-center">
          <motion.div animate={{ scale: step >= 2 ? 1.1 : 1 }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white">x</motion.div>
          <motion.div className="mt-2 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded">名詞</motion.div>
        </div>

        {/* = */}
        <div className="flex flex-col items-center relative z-10">
          <div ref={assignVerbRef}>
            <motion.div animate={{ scale: step >= 2 ? 1.4 : 1, color: step >= 2 ? '#ec4899' : '' }} className="font-mono text-4xl font-bold text-slate-800 dark:text-white transition-colors">=</motion.div>
          </div>
          <motion.div className="mt-2 text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 px-1.5 py-0.5 rounded">動詞 (assign)</motion.div>
        </div>

        {/* The 3 + 5 part → becomes 8 */}
        <div ref={assignRightRef} className="flex gap-4 relative">
          <motion.div animate={{ opacity: step >= 1 ? 0 : 1 }} className="flex gap-4">
            <div ref={addContainerRef} className="flex gap-4 relative">
              <div ref={addLeftRef} className="flex flex-col items-center">
                <div className="font-mono text-4xl font-bold text-slate-800 dark:text-white relative">
                  3
                  {step === 1 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
                </div>
                <div className="mt-2 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded">名詞</div>
              </div>
              
              <div className="flex flex-col items-center relative z-10">
                <div ref={addVerbRef}>
                  <div className="font-mono text-4xl font-bold text-purple-500 relative">
                    +
                    {step === 1 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">動詞 (add)</div>
              </div>

              <div ref={addRightRef} className="flex flex-col items-center">
                <div className="font-mono text-4xl font-bold text-slate-800 dark:text-white relative">
                  5
                  {step === 1 && <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-12 transform -translate-y-1/2"></div>}
                </div>
                <div className="mt-2 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded">名詞</div>
              </div>

              {/* Dynamic Add Arrows */}
              <DynamicArrows containerRef={addContainerRef} verbRef={addVerbRef} leftRef={addLeftRef} rightRef={addRightRef} color="#8b5cf6" show={step === 1} />
            </div>
          </motion.div>
          
          {/* Return value popping up */}
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0, position: 'absolute', top: 0, left: '50%', x: '-50%' }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-mono text-4xl font-extrabold text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] z-20 flex flex-col items-center"
              >
                8
                <div className="mt-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-200">Return value</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Assign Arrows */}
        <DynamicArrows containerRef={assignContainerRef} verbRef={assignVerbRef} leftRef={assignLeftRef} rightRef={assignRightRef} color="#ec4899" show={step >= 2} />
      </div>

      {/* RAM Area */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : 20 }}
        className="w-48 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700 p-4 shadow-lg relative mt-6 md:mt-0"
      >
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Memory (RAM)</div>
        <div className="flex items-center justify-between">
          <div className="font-mono font-bold text-lg text-cyan-600 dark:text-cyan-400">x</div>
          <div className="w-16 h-0.5 bg-slate-400 relative">
            <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 border-y-[4px] border-transparent border-l-[6px] border-l-slate-400 border-r-0" />
          </div>
          <div className="w-10 h-10 bg-white dark:bg-slate-900 border-2 border-green-500 rounded flex items-center justify-center font-mono font-bold text-lg text-green-600 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            8
          </div>
        </div>
      </motion.div>
    </div>
  );
}
