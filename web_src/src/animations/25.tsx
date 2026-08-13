// AnimationId: 25 - StringJoinAnim.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function StringJoinAnim({ step }: { step: number }) {
    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full min-h-[220px] relative font-mono text-slate-800 dark:text-white select-none">
            <div className="flex items-center text-3xl font-bold relative h-20">
                <AnimatePresence mode="popLayout" initial={false}>
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                            className="flex flex-col items-center relative"
                        >
                            <div className="flex items-center">
                                <span className="text-green-500">'-'</span>
                                <span className="text-blue-500">.join(</span>
                                <span className="text-purple-500">['a', 'b']</span>
                                <span className="text-blue-500">)</span>
                            </div>
                            
                            {/* Tags */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="absolute -bottom-10 flex w-full justify-between text-[10px] md:text-xs font-semibold"
                            >
                                <span className="text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded -ml-4">主詞</span>
                                <span className="text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">Method</span>
                                <span className="text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded -mr-4">受詞(名詞)</span>
                            </motion.div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-amber-500 font-extrabold text-5xl drop-shadow-sm">'a-b'</span>
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-3 text-xs font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded"
                            >
                                Return 值
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}