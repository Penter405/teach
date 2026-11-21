// 所有動畫共用的「顯示設定」：熟悉語法的硬體開關（bits.ts 的 HwView）、Python ↔ 中文步驟（codeLang.tsx）…
//  - createViewSetting(key, 預設值)：一個設定 = 一個 store，存在 localStorage，所有畫面一起更新
//  - Switch：板子上面那一排開關的樣子（硬體板、演算法板、程式碼區塊都用它）
//  - useViewVersion()：任何一個設定改了就會變；播放器用它重新量「每一步裡最高的那一步」，
//    所以動畫的高度永遠是「目前這組設定」下最高的那一步
import React, { useSyncExternalStore } from 'react';

export type ViewSetting<T> = {
  get: () => T;
  set: (v: T) => void;
  use: () => T;
  subscribe: (l: () => void) => () => void;
};

let version = 0;
const anyListeners = new Set<() => void>();
const subscribeAny = (l: () => void) => { anyListeners.add(l); return () => { anyListeners.delete(l); }; };

/** `load` reads an older saved format; default: JSON at `key` */
export function createViewSetting<T>(key: string, fallback: T, load?: () => T | undefined): ViewSetting<T> {
  let value = fallback;
  try {
    const v = load ? load() : (JSON.parse(localStorage.getItem(key) ?? 'null') as T | null);
    if (v !== undefined && v !== null) value = v;
  } catch { /* storage unavailable */ }
  const listeners = new Set<() => void>();
  const s: ViewSetting<T> = {
    get: () => value,
    set: (v) => {
      value = v;
      try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ }
      version++;
      listeners.forEach((l) => l());
      anyListeners.forEach((l) => l());
    },
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    // eslint-disable-next-line react-hooks/rules-of-hooks
    use: () => useSyncExternalStore(s.subscribe, s.get, () => fallback),
  };
  return s;
}

/** changes whenever any view setting changes (the player measures the tallest step again) */
export const useViewVersion = () => useSyncExternalStore(subscribeAny, () => version, () => 0);

/** one on / off switch in the row on top of a board */
export const Switch = ({ on, label, hint, onChange, muted = false }: { on: boolean; label: React.ReactNode; hint: string; onChange: (v: boolean) => void; muted?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    title={hint}
    onClick={() => onChange(!on)}
    onPointerDown={(e) => e.stopPropagation()}
    className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] font-bold hover:bg-emerald-500/10 ${muted ? 'text-slate-400' : 'text-emerald-100/90'}`}
  >
    <span className={`relative inline-block h-[16px] w-[28px] shrink-0 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-slate-600'}`}>
      <span className={`absolute top-[2px] h-[12px] w-[12px] rounded-full bg-white shadow transition-all ${on ? 'left-[14px]' : 'left-[2px]'}`} />
    </span>
    {label}
  </button>
);

/** the row of switches on top of a board (right-aligned, wraps on narrow screens) */
export const SwitchRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1" aria-label="顯示設定">{children}</div>
);

/**
 * One switch, as an object. Boards take a list of these (`switches` parameter), so an animation can
 * choose its switches: <AlgoBoard switches={[CODE_LANG_SWITCH, mySwitch]}>, <TraceView switches={[]}>, <Board switches={…}>.
 * The `use…` fields are hooks (called while drawing).
 */
export type SwitchDef = {
  id: string;
  label: React.ReactNode;
  hint: string;
  /** hook: is it on now */
  useOn: () => boolean;
  set: (on: boolean) => void;
  /** hook: show it at all (default: always) */
  useVisible?: () => boolean;
  /** hook: a different label for this moment (e.g. 「這支還沒有」) */
  useLabel?: () => React.ReactNode;
  /** hook: grey label (on, but has no effect here) */
  useMuted?: () => boolean;
};

/** a switch for a boolean view setting */
export const boolSwitch = (id: string, setting: ViewSetting<boolean>, label: React.ReactNode, hint: string): SwitchDef =>
  ({ id, label, hint, useOn: setting.use, set: setting.set });

/** draws one SwitchDef */
export const ViewSwitch = ({ def }: { def: SwitchDef }) => {
  const on = def.useOn();
  const visible = def.useVisible ? def.useVisible() : true;
  const label = def.useLabel ? def.useLabel() : def.label;
  const muted = def.useMuted ? def.useMuted() : false;
  if (!visible) return null;
  return <Switch on={on} label={label} hint={def.hint} onChange={def.set} muted={muted} />;
};

/** a row of SwitchDefs (nothing when the list is empty) */
export const SwitchBar = ({ switches }: { switches: SwitchDef[] }) =>
  switches.length ? <SwitchRow>{switches.map((d) => <ViewSwitch key={d.id} def={d} />)}</SwitchRow> : null;
