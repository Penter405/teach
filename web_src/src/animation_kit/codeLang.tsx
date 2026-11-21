// 程式碼要顯示成 Python 還是中文步驟（pseudo code）。所有動畫共用一個設定，存在 localStorage。
// 播放器（LessonContent 的 AnimationStepper）放 <CodeLangSwitch />；畫程式碼的零件用 useCodeLang() 決定顯示哪一種。
import React, { useSyncExternalStore } from 'react';

export type CodeLang = 'python' | 'pseudo';
const KEY = 'teach_code_lang';

let lang: CodeLang = 'python';
try { if (localStorage.getItem(KEY) === 'pseudo') lang = 'pseudo'; } catch { /* storage unavailable */ }
const listeners = new Set<() => void>();

export function setCodeLang(v: CodeLang) {
  lang = v;
  try { localStorage.setItem(KEY, v); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useCodeLang = () => useSyncExternalStore(subscribe, () => lang, (): CodeLang => 'python');

/** Python | 中文步驟。`available = false`：這支動畫還沒有中文步驟（切過去還是顯示 Python，旁邊提示一行） */
export const CodeLangSwitch = ({ available = true, dark = false }: { available?: boolean; dark?: boolean }) => {
  const cur = useCodeLang();
  const btn = (v: CodeLang, label: string) => (
    <button
      type="button"
      onClick={() => setCodeLang(v)}
      aria-pressed={cur === v}
      className={`px-3 py-1.5 text-xs font-medium transition-colors ${cur === v
        ? 'bg-cyan-600 text-white'
        : dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>程式碼</span>
      <div className={`inline-flex overflow-hidden rounded-lg border ${dark ? 'border-slate-600' : 'border-slate-200 dark:border-slate-700'}`} role="group" aria-label="程式碼顯示方式">
        {btn('python', 'Python')}
        {btn('pseudo', '中文步驟')}
      </div>
      {cur === 'pseudo' && !available && (
        <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>這支動畫還沒有中文步驟，先顯示 Python</span>
      )}
    </div>
  );
};
