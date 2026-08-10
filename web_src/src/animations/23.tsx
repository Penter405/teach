// Animation 3: print(len('ABC')) 的由內而外執行
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function NestedFunctionAnim({ step }: { step: number }) {
    // step 0: Show print(len('ABC')) with clear inner/outer markers
    // step 1: Focus inner layer: len('ABC') turns into Return value 3
    // step 2: Code becomes print(3)
    // step 3: Execute outer layer: print() outputs 3 in Console

    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full min-h-[320px] relative font-mono text-slate-800 dark:text-white select-none">
            {/* Code Display Area */}
            <div className="flex items-center text-3xl md:text-4xl font-bold relative min-h-[90px]">
                {/* Outer Verb: print() */}
                <span className="text-purple-500">print(</span>

                <AnimatePresence mode="popLayout">
                    {step < 2 ? (
                        <motion.div key="inner-expression" exit={{ opacity: 0, scale: 0.8 }} className="flex items-center relative">
                            {/* Inner Verb: len() */}
                            <span className={`transition-colors duration-300 ${step === 1 ? 'text-amber-500 font-extrabold' : 'text-purple-400'}`}>
                                len(
                            </span>

                            {/* Noun: 'ABC' */}
                            <span className="text-green-500 font-extrabold">'ABC'</span>

                            <span className={`transition-colors duration-300 ${step === 1 ? 'text-amber-500 font-extrabold' : 'text-purple-400'}`}>
                                )
                            </span>

                            {/* Step 0 Labels */}
                            {step === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-8 left-0 right-0 flex justify-center">
                                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded whitespace-nowrap">
                                        1. 先算內層 len()
                                    </span>
                                </motion.div>
                            )}

                            {/* Step 1 Evaluation Arrow */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-7 left-0 right-0 text-center">
                                    <span className="text-[11px] font-bold text-amber-500 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                                        Return 3
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="inner-result" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center relative">
                            <span className="text-amber-500 font-extrabold text-4xl mx-1">3</span>
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-8 left-0 right-0 flex justify-center">
                                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded whitespace-nowrap">
                                        2. 再算外層 print()
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <span className="text-purple-500">)</span>
            </div>

            {/* Console Display Area */}
            <motion.div
                initial={{ opacity: 0.4, y: 10 }}
                animate={{ opacity: step === 3 ? 1 : 0.5, y: 0 }}
                className="w-full max-w-sm bg-slate-900 rounded-lg border border-slate-700 p-4 shadow-xl relative overflow-hidden"
            >
                <div className="flex gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="text-[10px] text-slate-500 ml-1 font-sans">Console Output</span>
                </div>
                <div className="text-xl text-slate-300 flex items-center min-h-[32px]">
                    <span className="text-green-500 mr-2 font-bold">&gt;</span>
                    <AnimatePresence>
                        {step === 3 && (
                            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-white font-extrabold">
                                3
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}