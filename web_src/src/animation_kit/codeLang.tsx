// 程式碼顯示 Python 還是中文步驟（pseudo code）。所有動畫、程式碼區塊共用一個設定（viewSettings.tsx）。
// 開關放在每塊板子最上面那一排（和熟悉語法的硬體開關同一排、同一個樣子）。
import React from 'react';
import { createViewSetting, ViewSwitch, type SwitchDef } from './viewSettings';

export type CodeLang = 'python' | 'pseudo';
const KEY = 'teach_code_lang';

const codeLang = createViewSetting<CodeLang>(KEY, 'python', () => {
  const raw = localStorage.getItem(KEY);
  return raw === 'pseudo' || raw === '"pseudo"' ? 'pseudo' : 'python';
});
export const useCodeLang = codeLang.use;
export const setCodeLang = codeLang.set;

/** does the animation being shown have 中文步驟? The player provides it (registry.hasPseudo); default true */
export const PseudoAvailable = React.createContext(true);

/** the 中文步驟 switch, as an object (put it in a board's `switches` list; boards include it by default) */
export const CODE_LANG_SWITCH: SwitchDef = {
  id: 'codeLang',
  label: '中文步驟',
  hint: '程式碼改用中文步驟（pseudo code）顯示，一行對一行；所有動畫一起切換',
  useOn: () => useCodeLang() === 'pseudo',
  set: (v) => setCodeLang(v ? 'pseudo' : 'python'),
  useLabel: () => {
    const available = React.useContext(PseudoAvailable);
    return useCodeLang() === 'pseudo' && !available ? '中文步驟（這支還沒有，先顯示 Python）' : '中文步驟';
  },
  useMuted: () => {
    const available = React.useContext(PseudoAvailable);
    return useCodeLang() === 'pseudo' && !available;
  },
};

/** just the 中文步驟 switch (code blocks use it) */
export const CodeLangToggle = () => <ViewSwitch def={CODE_LANG_SWITCH} />;
