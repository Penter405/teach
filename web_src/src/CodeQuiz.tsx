// code-quiz block: the student types one Python expression per question; codeQuizCheck.ts checks it in the browser.
import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Terminal, Lightbulb, Eye, RotateCcw } from 'lucide-react';
import type { ContentBlock, CodeQuizQuestion } from './courseData';
import { checkAnswer, type Result } from './codeQuizCheck';

function Question({ q, idx, onResult }: { q: CodeQuizQuestion; idx: number; onResult: (ok: boolean) => void }) {
  const [src, setSrc] = useState('');
  const [res, setRes] = useState<Result | null>(null);
  const [hint, setHint] = useState(false);
  const [reveal, setReveal] = useState(false);
  const names = Object.keys(q.vars);

  const run = () => {
    const r = checkAnswer(q, src);
    setRes(r);
    onResult(r.ok);
  };

  const box = res?.ok
    ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
    : res
      ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
      className={`p-5 rounded-2xl border transition-colors duration-300 ${box}`}
    >
      <p className="text-[15px] font-semibold text-slate-800 dark:text-white mb-3 leading-relaxed">
        <span className="text-slate-400 dark:text-slate-500 mr-2 font-mono text-sm">{idx + 1}.</span>
        {q.question}
      </p>

      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        {names.map((n) => (
          <span key={n} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 font-mono text-slate-600 dark:text-slate-300">
            {n}：{q.vars[n][0]} ～ {q.vars[n][1]}
          </span>
        ))}
        {q.ban?.length ? (
          <span className="rounded-md border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 font-mono text-rose-600 dark:text-rose-300">
            不能用：{q.ban.join('  ')}
          </span>
        ) : null}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); run(); }}
        className="flex items-center gap-2"
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 focus-within:border-cyan-400 dark:focus-within:border-cyan-600">
          <span className="font-mono text-sm text-slate-400">&gt;&gt;&gt;</span>
          <input
            value={src}
            onChange={(e) => { setSrc(e.target.value); setRes(null); }}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder="寫一個 Python 算式"
            className="w-full bg-transparent py-2.5 font-mono text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>
        <button type="submit" className="shrink-0 rounded-xl bg-slate-800 dark:bg-white px-4 py-2.5 text-sm font-bold text-white dark:text-slate-900 hover:scale-105 transition-transform">
          檢查
        </button>
      </form>

      {res && (
        <div className={`mt-3 flex items-start gap-2 text-sm ${res.ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
          {res.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
          <div>
            <div className="font-semibold">{res.ok ? `對了！${res.n} 組測試都通過` : res.msg}</div>
            {!res.ok && res.detail && <div className="mt-0.5 font-mono text-xs opacity-90">{res.detail}</div>}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {q.hint && (
          <button onClick={() => setHint((h) => !h)} className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline">
            <Lightbulb size={13} /> {hint ? '收起提示' : '提示'}
          </button>
        )}
        <button onClick={() => setReveal((r) => !r)} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:underline">
          <Eye size={13} /> {reveal ? '收起答案' : '看答案'}
        </button>
      </div>
      {hint && q.hint && <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">{q.hint}</div>}
      {reveal && (
        <div className="mt-2 rounded-lg bg-slate-100 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <code className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{q.answer}</code>
          {q.explain && <span className="ml-2">{q.explain}</span>}
        </div>
      )}
    </motion.div>
  );
}

export function CodeQuiz({ block }: { block: ContentBlock }) {
  // same `questions` key as the multiple-choice quiz; here each one is a CodeQuizQuestion
  const questions = useMemo(() => (block.questions ?? []) as unknown as CodeQuizQuestion[], [block]);
  const [passed, setPassed] = useState<Record<number, boolean>>({});
  const [round, setRound] = useState(0);
  const done = Object.values(passed).filter(Boolean).length;

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
          <Terminal className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-headline text-xl font-bold text-slate-800 dark:text-white">{block.title || 'Coding Check'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {block.subtitle || '每題寫一個 Python 算式，變數已經有值，不用 print'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${done === questions.length ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {done} / {questions.length}
          </span>
          {done > 0 && (
            <button onClick={() => { setPassed({}); setRound((r) => r + 1); }} title="重新作答" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <Question key={`${round}-${i}`} q={q} idx={i} onResult={(ok) => setPassed((p) => ({ ...p, [i]: ok }))} />
        ))}
      </div>
    </div>
  );
}
