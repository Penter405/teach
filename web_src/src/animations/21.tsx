// Animation 1: len('ABC') 的語法與 Return
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function LenFunctionAnim({ step }: { step: number }) {
    // step 0: Show len('ABC'), mark len() as Function (Verb) and 'ABC' as Object (Noun)
    // step 1: Draw arrow from Function to target object 'ABC'
    // step 2: len('ABC') disappears, Return value 3 emerges

    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full min-h-[260px] relative font-mono text-slate-800 dark:text-white select-none">
            <div className="flex items-center text-4xl font-bold relative h-20">
                <AnimatePresence mode="popLayout">
                    {step < 2 ? (
                        <motion.div key="len-code" exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-1 relative">
                            {/* Function / Verb */}
                            <div className="flex flex-col items-center relative">
                                <span className="text-purple-500">len(</span>
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 text-[11px] font-semibold text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded absolute -bottom-7 whitespace-nowrap"
                                >
                                    Function (動詞)
                                </motion.div>
                            </div>

                            {/* Object / Noun */}
                            <div className="flex flex-col items-center relative">
                                <span className="text-green-500 font-extrabold">'ABC'</span>
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 text-[11px] font-semibold text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-300 px-2 py-0.5 rounded absolute -bottom-7 whitespace-nowrap"
                                >
                                    受詞 (名詞)
                                </motion.div>
                            </div>

                            <span className="text-purple-500">)</span>

                            {/* Arrow from Function to Object */}
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    className="absolute -top-6 left-2 right-2 flex justify-center items-center pointer-events-none"
                                >
                                    <div className="w-full h-0.5 bg-purple-400 relative">
                                        <div className="absolute right-0 -top-1 w-2 h-2 border-r-2 border-t-2 border-purple-400 transform rotate-45" />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="len-return"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-amber-500 font-extrabold text-5xl drop-shadow-md">3</span>
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-[11px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded absolute -bottom-7 whitespace-nowrap"
                            >
                                Return 值 (名詞)
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}