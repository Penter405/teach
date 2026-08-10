// Animation 4: ClassWorldAnim
import React from 'react';
import { motion } from 'motion/react';
import { Box } from './shared';

export default function Animation({ step }: { step: number }) {
  const examples = [
    { title: 's = 5', detail: "type(s) → <class 'int'>", color: 'amber', showAt: 1 },
    { title: 'text = "hi"', detail: "type(text) → <class 'str'>", color: 'green', showAt: 2 },
    { title: 'function greet()', detail: "type(greet) → <class 'function'>", color: 'slate', showAt: 3 },
  ];

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Box active={step <= 1} color="cyan" className="min-w-[140px]">class</Box>
        <motion.div animate={{ opacity: step >= 1 ? 1 : 0.25, x: step >= 1 ? [0, 6, 0] : 0 }} transition={{ duration: 0.8, repeat: step >= 1 ? Infinity : 0 }} className="text-slate-400 text-2xl font-bold">
          →
        </motion.div>
        <Box active={step >= 1} color="purple" className="min-w-[140px]">object</Box>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {examples.map((example, index) => (
          <motion.div
            key={example.title}
            animate={{ opacity: step >= example.showAt ? 1 : 0.18, y: step >= example.showAt ? [0, -4, 0] : 8, scale: step === example.showAt ? [1, 1.04, 1] : 1 }}
            transition={{ duration: 0.9, repeat: step === example.showAt ? Infinity : 0, delay: index * 0.08 }}
            className={`rounded-2xl border p-4 text-left shadow-sm ${
              example.color === 'amber'
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : example.color === 'green'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <div className="font-mono text-sm font-bold">{example.title}</div>
            <div className={`mt-2 text-xs ${example.color === 'slate' ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>{example.detail}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{ opacity: step >= 3 ? 1 : 0.28, y: step >= 3 ? [0, -3, 0] : 0 }}
        transition={{ duration: 1.1, repeat: step >= 3 ? Infinity : 0 }}
        className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-900 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-100"
      >
        Python 會把很多 data 與 function 都放進 class / object 的世界觀裡。
      </motion.div>
    </div>
  );
}
