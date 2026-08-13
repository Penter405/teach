// AnimationId: 26 - MethodComboAnim.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function MethodComboAnim({ step }: { step: number }) {
    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full min-h-[260px] relative font-mono text-slate-800 dark:text-white select-none">
            <div className="flex items-center text-2xl md:text-3xl font-bold relative h-20">
                <AnimatePresence mode="popLayout" initial={false}>
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                            className="flex items-center"
                        >
                            <span className="text-slate-400 font-black mr-1">(</span>
                            <span className="text-green-500">'-'</span>
                            <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-4">.join(</span>
                            <span className="text-purple-500">['a','b']</span>
                            <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-4">)</span>
                            <span className="text-slate-400 font-black ml-1">)</span>
                            <span className="text-pink-500 opacity-70">.upper()</span>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                            className="flex flex-col items-center relative"
                        >
                            <div className="flex items-center">
                                <span className="text-slate-400 font-black mr-1">(</span>
                                <span className="text-amber-500">'a-b'</span>
                                <span className="text-slate-400 font-black ml-1">)</span>
                                <span className="text-pink-500 underline decoration-pink-500/50 underline-offset-4">.upper()</span>
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="absolute -bottom-8 left-0 right-0 text-center text-[11px] md:text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded font-semibold whitespace-nowrap"
                            >
                                第 1 步：Return 內部字串
                            </motion.div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-red-500 font-extrabold text-5xl drop-shadow-md">'A-B'</span>
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-3 text-[11px] font-semibold text-red-700 bg-red-100 dark:bg-red-950 dark:text-red-300 px-2.5 py-0.5 rounded whitespace-nowrap"
                            >
                                最終 Return 值
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}