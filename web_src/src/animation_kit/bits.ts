// Turns the values animations already pass to CPU/RAM (mostly strings like '26', '"F"',
// '→ 0x2120', 'True') into typed data with real bits, so the hardware view can show
// them in easy / medium / hard mode without changing every animation.
import { useSyncExternalStore } from 'react';

/* ───────────────────────── view setting (shared by every board) ───────────────────────── */

export type HwMode = 'easy' | 'medium' | 'hard';
export type BitStyle = 'digits' | 'lights';
export type HwView = { mode: HwMode; bitStyle: BitStyle };

const KEY = 'teach_hw_view';
const DEFAULT_VIEW: HwView = { mode: 'easy', bitStyle: 'digits' };

function load(): HwView {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && ['easy', 'medium', 'hard'].includes(v.mode) && ['digits', 'lights'].includes(v.bitStyle)) return v;
  } catch { /* storage unavailable */ }
  return DEFAULT_VIEW;
}

let view: HwView = load();
const listeners = new Set<() => void>();

export function setHwView(patch: Partial<HwView>) {
  view = { ...view, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(view)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Current view setting; every board re-renders together when it changes. */
export const useHwView = () => useSyncExternalStore(subscribe, () => view, () => DEFAULT_VIEW);

/* ───────────────────────── encoding ───────────────────────── */

export type DataKind = 'int' | 'bool' | 'float' | 'str' | 'char' | 'pointer' | 'empty' | 'text';

export type Data = {
  kind: DataKind;
  /** Bytes as 8-character bit strings, most significant byte first. Empty for kind 'text'. */
  bytes: string[];
  /** Bytes were cut off to keep the row short. */
  truncated?: boolean;
  /** Type name shown in easy / medium mode. */
  type: string;
};

const MAX_BYTES = 24; // the memory grid wraps long strings onto the next row

const byte = (n: number) => (n & 0xff).toString(2).padStart(8, '0');

function intBytes(n: number): string[] {
  const size = n >= -128 && n <= 127 ? 1 : n >= -32768 && n <= 32767 ? 2 : 4;
  const out: string[] = [];
  for (let i = size - 1; i >= 0; i--) out.push(byte(Math.floor(n / 2 ** (8 * i))));
  return out;
}

function floatBytes(f: number): string[] {
  const dv = new DataView(new ArrayBuffer(4));
  dv.setFloat32(0, f);
  return [0, 1, 2, 3].map((i) => byte(dv.getUint8(i)));
}

function strBytes(s: string): { bytes: string[]; truncated: boolean } {
  const all = Array.from(new TextEncoder().encode(s)).map(byte);
  return { bytes: all.slice(0, MAX_BYTES), truncated: all.length > MAX_BYTES };
}

const TEXT = (): Data => ({ kind: 'text', bytes: [], type: '' });

/** Work out the type and bits of a value. Anything that is not plain data (a formula,
 *  a note, a React element) comes back as kind 'text' and is shown unchanged. */
export function encode(value: unknown): Data {
  if (typeof value === 'number') value = String(value);
  if (typeof value === 'boolean') value = value ? 'True' : 'False';
  if (typeof value !== 'string') return TEXT();
  const v = value.trim();

  if (v === '' || v === '—' || v === '-' || v === '(空)') return { kind: 'empty', bytes: ['00000000'], type: '空' };
  if (v === 'True' || v === 'False') return { kind: 'bool', bytes: [byte(v === 'True' ? 1 : 0)], type: 'bool' };
  if (v === 'None') return { kind: 'pointer', bytes: [byte(0), byte(0)], type: 'None' };
  if (v === 'NULL') return { kind: 'pointer', bytes: [byte(0), byte(0)], type: 'NULL' };

  // 26  /  -3  /  2 (商)
  let m = v.match(/^(-?\d+)(\s*\(.*\))?$/);
  if (m) {
    const n = Number(m[1]);
    if (Number.isSafeInteger(n) && Math.abs(n) < 2 ** 31) return { kind: 'int', bytes: intBytes(n), type: 'int' };
  }
  // 3.14
  if (/^-?\d+\.\d+$/.test(v)) return { kind: 'float', bytes: floatBytes(Number(v)), type: 'float' };
  // 0b00001100
  m = v.match(/^0b([01]+)$/);
  if (m) {
    const bits = m[1].padStart(Math.ceil(m[1].length / 8) * 8, '0');
    return { kind: 'int', bytes: bits.match(/.{8}/g)!.slice(-4), type: 'int' };
  }
  // 0x35 '5'  → one character byte
  m = v.match(/^0x([0-9a-fA-F]{1,2}) '(.)'$/);
  if (m) return { kind: 'char', bytes: [byte(parseInt(m[1], 16))], type: 'char' };
  // 0x7FE8  /  → 0x2120  /  → code 0x00   → an address
  m = v.match(/^(?:→\s*(?:code\s+)?)?0x([0-9a-fA-F]{1,4})$/);
  if (m) {
    const a = parseInt(m[1], 16);
    return { kind: 'pointer', bytes: [byte(a >> 8), byte(a)], type: v.startsWith('→') ? 'pointer' : 'address' };
  }
  // "amy"
  m = v.match(/^"([^"]*)"$/);
  if (m) {
    const { bytes, truncated } = strBytes(m[1]);
    return { kind: 'str', bytes: bytes.length ? bytes : [], truncated, type: 'str' };
  }
  return TEXT();
}

/** Registers are fixed-size: always show at least 16 bits (zero-extended), at most 32. */
export function asRegister(d: Data): Data {
  if (d.kind === 'text') return d;
  let bytes = d.bytes;
  let truncated = d.truncated;
  if (bytes.length > 4) { bytes = bytes.slice(0, 4); truncated = true; }
  const fill = d.kind === 'int' && bytes[0]?.[0] === '1' ? '11111111' : '00000000'; // sign-extend negatives
  while (bytes.length < 2) bytes = [fill, ...bytes];
  return { ...d, bytes, truncated };
}

/** '0x2000' + 3 bytes → '0x2000–0x2002' */
export function addrRange(addr: string, nBytes: number) {
  const m = addr.match(/^0x([0-9a-fA-F]+)$/);
  if (!m || nBytes <= 1) return addr;
  const start = parseInt(m[1], 16);
  const end = (start + nBytes - 1).toString(16).toUpperCase().padStart(m[1].length, '0');
  return `${addr}–0x${end}`;
}
