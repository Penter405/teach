// Animation 5: BuiltinClassAnim
import React from 'react';
import { motion } from 'motion/react';

export default function Animation({ step }: { step: number }) {
  const splitPieces = step >= 3 ? ['hi', 'there'] : ['hi there'];

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          animate={{ scale: step <= 1 ? [1, 1.03, 1] : 1, opacity: 1 }}
          transition={{ duration: 1, repeat: step <= 1 ? Infinity : 0 }}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800 dark:bg-amber-900/20"
        >
          <div className="font-mono text-sm font-bold text-amber-900 dark:text-amber-100">s = 8</div>
          <div className="mt-2 text-xs text-amber-800 dark:text-amber-200">其實可以想成 `s = int(value=8)`</div>
          <motion.div
            animate={{ opacity: step >= 1 ? 1 : 0.15, x: step >= 1 ? [0, 8, 0] : 0 }}
            transition={{ duration: 0.9, repeat: step >= 1 ? Infinity : 0 }}
            className="mt-3 rounded-xl border border-amber-300 bg-white/80 px-3 py-2 font-mono text-xs text-amber-900 shadow-sm dark:border-amber-700 dark:bg-black/20 dark:text-amber-100"
          >
            int(value=8) → object
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ scale: step >= 2 ? [1, 1.03, 1] : 1, opacity: step >= 2 ? 1 : 0.32 }}
          transition={{ duration: 1, repeat: step >= 2 ? Infinity : 0 }}
          className="rounded-2xl border border-green-200 bg-green-50 p-4 text-left dark:border-green-800 dark:bg-green-900/20"
        >
          <div className="font-mono text-sm font-bold text-green-900 dark:text-green-100">text = "hi there"</div>
          <div className="mt-2 text-xs text-green-800 dark:text-green-200">str 物件內建 method，例如 `split()`</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {splitPieces.map((piece, index) => (
              <motion.span
                key={`${piece}-${index}`}
                initial={{ opacity: 0.2, y: 6 }}
                animate={{ opacity: 1, y: 0, x: step >= 3 ? [0, index === 0 ? -6 : 6, 0] : 0 }}
                transition={{ duration: 0.7, repeat: step >= 3 ? Infinity : 0 }}
                className="rounded-full border border-green-300 bg-white/90 px-3 py-1 font-mono text-xs text-green-900 dark:border-green-700 dark:bg-black/20 dark:text-green-100"
              >
                {piece}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: step >= 2 ? 1 : 0.22 }}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
      >
        `int`、`str` 都是內建 class，所以它們有自己的 type、property 和 method。
      </motion.div>
    </div>
  );
}
