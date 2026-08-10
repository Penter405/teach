// Animation 2: print(3) 的執行過程
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function PrintThreeAnim({ step }: { step: number }) {
    // step 0: Show print(3)
    // step 1: Mark print() as Function (Verb), 3 as Noun
    // step 2: print() acts on 3
    // step 3: Digital Console screen displays 3

    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full min-h-[300px] relative font-mono text-slate-800 dark:text-white select-none">
            {/* Code Area */}
            <div className="flex items-center text-4xl font-bold relative min-h-[80px]">
                <div className="flex items-center relative">
                    <div className="flex flex-col items-center relative">
                        <motion.span animate={{ color: step >= 1 ? '#a855f7' : '' }}>print(</motion.span>
                        <AnimatePresence>
                            {step >= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-2 text-[11px] font-semibold text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded absolute -bottom-7 whitespace-nowrap"
                                >
                                    Function (動詞)
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col items-center relative px-1">
                        <motion.span animate={{ y: step === 2 ? 8 : 0, scale: step === 2 ? 1.1 : 1 }} className="text-blue-500 font-extrabold">
                            3
                        </motion.span>
                        <AnimatePresence>
                            {step >= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-2 text-[11px] font-semibold text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded absolute -bottom-7 whitespace-nowrap"
                                >
                                    受詞 (名詞)
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.span animate={{ color: step >= 1 ? '#a855f7' : '' }}>)</motion.span>
                </div>
            </div>

            {/* Action Arrow */}
            <AnimatePresence>
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 5 }}
                        exit={{ opacity: 0 }}
                        className="text-purple-500 font-extrabold text-2xl -my-4"
                    >
                        ↓
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Console Area */}
            <motion.div
                initial={{ opacity: 0.4, y: 10 }}
                animate={{ opacity: step >= 3 ? 1 : 0.6, y: 0 }}
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
                        {step >= 3 && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-white font-extrabold"
                            >
                                3
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}