// Animation 27: LCS (Longest Common Subsequence) DP Visualization
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

// ── Example data ──
const STR_A = ['a', 'b', 'c', 'd', 'e'];
const STR_B = ['b', 'e', 'c', 'f', 'd'];

// Chars that appear in BOTH strings (valid matches)
const COMMON = new Set(['b', 'c', 'd', 'e']);
// Matching edges (indices in A → indices in B that share the same char)
const EDGES: [number, number, string][] = [
    [1, 0, 'b'], // A[1]=b ↔ B[0]=b
    [2, 2, 'c'], // A[2]=c ↔ B[2]=c
    [3, 4, 'd'], // A[3]=d ↔ B[4]=d
    [4, 1, 'e'], // A[4]=e ↔ B[1]=e
];

// ── Premax DP table (simplified 5×5 for B-index rows × A-index cols) ──
// dp[i][j] = length of LCS considering B[0..i] matched against A[0..j]
const DP: number[][] = [
    //  a  b  c  d  e
    [0, 1, 1, 1, 1], // b
    [0, 1, 1, 1, 1], // e
    [0, 1, 2, 2, 2], // c
    [0, 1, 2, 2, 2], // f
    [0, 1, 2, 3, 3], // d
];

// Colors for edges
const EDGE_COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

// ── Char pill component ──
const CharPill = ({
    ch,
    active,
    impossible,
    highlight,
    delay = 0,
}: {
    ch: string;
    active: boolean;
    impossible?: boolean;
    highlight?: boolean;
    delay?: number;
}) => (
    <motion.div
        animate={{
            scale: active ? 1.15 : 1,
            opacity: impossible ? 0.25 : active ? 1 : 0.7,
        }}
        transition={{ duration: 0.35, delay }}
        className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-extrabold text-lg border-2 transition-colors duration-300 ${impossible
                ? 'border-red-400 bg-red-100 dark:bg-red-900/20 text-red-400 line-through'
                : highlight
                    ? 'border-green-400 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white'
            }`}
    >
        {ch}
    </motion.div>
);

// ── Step label badge ──
const Badge = ({
    children,
    color = 'blue',
    delay = 0,
}: {
    children: React.ReactNode;
    color?: string;
    delay?: number;
}) => {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300',
        amber: 'text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300',
        green: 'text-green-700 bg-green-100 dark:bg-green-950 dark:text-green-300',
        purple: 'text-purple-700 bg-purple-100 dark:bg-purple-950 dark:text-purple-300',
        pink: 'text-pink-700 bg-pink-100 dark:bg-pink-950 dark:text-pink-300',
        cyan: 'text-cyan-700 bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-300',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35 }}
            className={`text-[11px] md:text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${colorMap[color] ?? colorMap.blue}`}
        >
            {children}
        </motion.div>
    );
};

export default function LCSDPAnim({ step }: { step: number }) {
    return (
        <div className="flex flex-col items-center justify-center gap-5 w-full min-h-[340px] relative font-mono text-slate-800 dark:text-white select-none px-2">
            <AnimatePresence mode="popLayout" initial={false}>
                {/* ─── Step 0: Show Two Strings ─── */}
                {step === 0 && (
                    <motion.div
                        key="s0"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                        className="flex flex-col items-center gap-6"
                    >
                        <Badge color="blue">給定兩個字串，找出最長公共子序列 (LCS)</Badge>
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-blue-500 w-8">A:</span>
                                <div className="flex gap-2">
                                    {STR_A.map((ch, i) => (
                                        <CharPill key={i} ch={ch} active delay={i * 0.06} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-purple-500 w-8">B:</span>
                                <div className="flex gap-2">
                                    {STR_B.map((ch, i) => (
                                        <CharPill key={i} ch={ch} active delay={i * 0.06 + 0.3} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ─── Step 1: Magnifying Glass — filter impossible chars ─── */}
                {step === 1 && (
                    <motion.div
                        key="s1"
                        initial={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                        className="flex flex-col items-center gap-5"
                    >
                        {/* Magnifying glass icon */}
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                            className="text-5xl select-none"
                        >
                            🔍
                        </motion.div>
                        <Badge color="amber">
                            放大鏡：找尋「不可能的字元」— 只出現在其中一個字串的字元
                        </Badge>
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-blue-500 w-8">A:</span>
                                <div className="flex gap-2">
                                    {STR_A.map((ch, i) => (
                                        <CharPill
                                            key={i}
                                            ch={ch}
                                            active
                                            impossible={!COMMON.has(ch)}
                                            highlight={COMMON.has(ch)}
                                            delay={i * 0.08}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-purple-500 w-8">B:</span>
                                <div className="flex gap-2">
                                    {STR_B.map((ch, i) => (
                                        <CharPill
                                            key={i}
                                            ch={ch}
                                            active
                                            impossible={!COMMON.has(ch)}
                                            highlight={COMMON.has(ch)}
                                            delay={i * 0.08 + 0.3}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex gap-4 text-[10px] font-semibold"
                        >
                            <span className="text-red-500">
                                ✗ 'a' 只在 A、'f' 只在 B → 不可能配對
                            </span>
                            <span className="text-green-500">
                                ✓ b, c, d, e 兩邊都有
                            </span>
                        </motion.div>
                    </motion.div>
                )}

                {/* ─── Step 2: Bipartite Graph ─── */}
                {step === 2 && (
                    <motion.div
                        key="s2"
                        initial={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                        className="flex flex-col items-center gap-5"
                    >
                        <Badge color="purple">簡化成圖狀結構：相同字元之間連線</Badge>
                        {/* Bipartite graph using SVG */}
                        <div className="relative" style={{ width: 280, height: 200 }}>
                            {/* SVG for edges */}
                            <svg
                                className="absolute inset-0"
                                width="280"
                                height="200"
                                style={{ overflow: 'visible' }}
                            >
                                {EDGES.map(([ai, bi], idx) => {
                                    const x1 = ai * 56 + 24;
                                    const y1 = 30;
                                    const x2 = bi * 56 + 24;
                                    const y2 = 170;
                                    return (
                                        <motion.line
                                            key={idx}
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke={EDGE_COLORS[idx]}
                                            strokeWidth={2.5}
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.8 }}
                                            transition={{ delay: 0.3 + idx * 0.2, duration: 0.5 }}
                                        />
                                    );
                                })}
                            </svg>
                            {/* Top row (A) */}
                            <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
                                {STR_A.map((ch, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: COMMON.has(ch) ? 1 : 0.3, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${COMMON.has(ch)
                                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                                                : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400'
                                            }`}
                                    >
                                        {ch}
                                    </motion.div>
                                ))}
                            </div>
                            {/* Row labels */}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                className="absolute -left-8 top-2 text-[10px] font-bold text-blue-400"
                            >
                                A
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                className="absolute -left-8 bottom-2 text-[10px] font-bold text-purple-400"
                            >
                                B
                            </motion.span>
                            {/* Bottom row (B) */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                                {STR_B.map((ch, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: COMMON.has(ch) ? 1 : 0.3, y: 0 }}
                                        transition={{ delay: i * 0.06 + 0.2 }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${COMMON.has(ch)
                                                ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300'
                                                : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400'
                                            }`}
                                    >
                                        {ch}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        {/* Edge legend */}
                        <div className="flex gap-3 flex-wrap justify-center">
                            {EDGES.map(([ai, bi, ch], idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + idx * 0.15 }}
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded"
                                    style={{
                                        color: EDGE_COLORS[idx],
                                        backgroundColor: `${EDGE_COLORS[idx]}18`,
                                    }}
                                >
                                    A[{ai}]={ch} ↔ B[{bi}]={ch}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ─── Step 3: Max non-crossing lines ─── */}
                {step === 3 && (
                    <motion.div
                        key="s3"
                        initial={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                        className="flex flex-col items-center gap-5"
                    >
                        <Badge color="green">
                            問題簡化：找最多連線，且它們不能交叉！
                        </Badge>
                        <div className="relative" style={{ width: 280, height: 180 }}>
                            <svg
                                className="absolute inset-0"
                                width="280"
                                height="180"
                                style={{ overflow: 'visible' }}
                            >
                                {/* Show edges: b, c, d are non-crossing (selected); e crosses → dashed */}
                                {EDGES.map(([ai, bi, ch], idx) => {
                                    const x1 = ai * 56 + 24;
                                    const y1 = 26;
                                    const x2 = bi * 56 + 24;
                                    const y2 = 154;
                                    const isCrossing = ch === 'e'; // e (A[4]→B[1]) crosses b and c
                                    return (
                                        <motion.line
                                            key={idx}
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke={isCrossing ? '#ef4444' : EDGE_COLORS[idx]}
                                            strokeWidth={isCrossing ? 2 : 3}
                                            strokeDasharray={isCrossing ? '6 4' : undefined}
                                            strokeLinecap="round"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: isCrossing ? 0.4 : 1 }}
                                            transition={{ delay: 0.2 + idx * 0.15, duration: 0.4 }}
                                        />
                                    );
                                })}
                            </svg>
                            {/* Top row */}
                            <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
                                {STR_A.map((ch, i) => (
                                    <div
                                        key={i}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${COMMON.has(ch)
                                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                                                : 'border-slate-300/40 bg-slate-100/50 dark:bg-slate-800/50 text-slate-400/40'
                                            }`}
                                    >
                                        {ch}
                                    </div>
                                ))}
                            </div>
                            {/* Bottom row */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                                {STR_B.map((ch, i) => (
                                    <div
                                        key={i}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${COMMON.has(ch)
                                                ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300'
                                                : 'border-slate-300/40 bg-slate-100/50 dark:bg-slate-800/50 text-slate-400/40'
                                            }`}
                                    >
                                        {ch}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex gap-3 text-[10px] font-semibold"
                            >
                                <span className="text-blue-500">━ 可選（不交叉）</span>
                                <span className="text-red-400">╌ 交叉 → 不能同時選</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="text-[10px] text-slate-500 dark:text-slate-400 text-center max-w-[280px]"
                            >
                                兩條線交叉 = 子序列順序矛盾，所以選最多不交叉的線 = LCS
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* ─── Step 4: Premax recurrence explanation ─── */}
                {step === 4 && (
                    <motion.div
                        key="s4"
                        initial={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                        className="flex flex-col items-center gap-5"
                    >
                        <Badge color="pink">
                            再簡化：用 premax 轉移！
                        </Badge>
                        {/* Visual explanation */}
                        <div className="flex flex-col items-center gap-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 max-w-sm">
                            {/* Current line highlight */}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-300">
                                    目前這條線（連到 B[i]）
                                </span>
                            </motion.div>
                            {/* Arrow */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-400 text-xl"
                            >
                                ↓
                            </motion.div>
                            {/* Premax explanation */}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-300">
                                    之前的線 = premax（前綴最大值）
                                </span>
                            </motion.div>
                            {/* Arrow */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-slate-400 text-xl"
                            >
                                ↓
                            </motion.div>
                            {/* Find non-connected max */}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <span className="text-xs font-bold text-green-600 dark:text-green-300">
                                    找沒有連到目前線的最大 premax
                                </span>
                            </motion.div>
                        </div>
                        {/* Formula */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-slate-900 rounded-lg border border-slate-700 px-4 py-3 shadow-xl"
                        >
                            <div className="text-sm text-slate-300 font-mono">
                                <span className="text-pink-400">dp[i][j]</span>
                                <span className="text-slate-500"> = </span>
                                <span className="text-cyan-400">max</span>
                                <span className="text-slate-500">(</span>
                                <span className="text-amber-400">dp[i-1][j]</span>
                                <span className="text-slate-500">, </span>
                                <span className="text-green-400">dp[i][j-1]</span>
                                <span className="text-slate-500">, </span>
                                <span className="text-purple-400">dp[i-1][j-1]+1</span>
                                <span className="text-slate-500">)</span>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="text-[10px] text-center text-slate-500 dark:text-slate-400 max-w-[300px]"
                        >
                            premax 確保我們只看「不交叉」的線中最好的，+1 代表選了當前這條
                        </motion.div>
                    </motion.div>
                )}

                {/* ─── Step 5: 2D DP Table ─── */}
                {step === 5 && (
                    <motion.div
                        key="s5"
                        initial={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        className="flex flex-col items-center gap-4"
                    >
                        <Badge color="cyan">展開成 2D 表格，逐格填入！</Badge>
                        {/* DP Table */}
                        <div className="overflow-x-auto">
                            <table className="border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-9 h-9" />
                                        {STR_A.map((ch, i) => (
                                            <th
                                                key={i}
                                                className="w-9 h-9 text-center text-[11px] font-bold text-blue-500"
                                            >
                                                {ch}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {STR_B.map((bch, r) => (
                                        <tr key={r}>
                                            <td className="w-9 h-9 text-center text-[11px] font-bold text-purple-500">
                                                {bch}
                                            </td>
                                            {DP[r].map((val, c) => {
                                                const isMatch =
                                                    STR_A[c] === bch && val > 0 && (r === 0 || c === 0 || val > DP[r - 1][c - 1]);
                                                return (
                                                    <td key={c} className="w-9 h-9 p-0">
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{
                                                                delay: (r * STR_A.length + c) * 0.06,
                                                                duration: 0.25,
                                                            }}
                                                            className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded border ${isMatch
                                                                    ? 'border-green-400 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                                }`}
                                                        >
                                                            {val}
                                                        </motion.div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Result callout */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8 }}
                            className="flex items-center gap-2"
                        >
                            <span className="text-xs font-semibold text-slate-500">
                                答案 = 右下角 =
                            </span>
                            <span className="text-2xl font-extrabold text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                                {DP[DP.length - 1][STR_A.length - 1]}
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
