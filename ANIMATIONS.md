# 動畫系統

課程裡的動畫都是「一步一步執行」的：學生按 **執行** 走一步，按 **預告** 先看下一步會做什麼。所有動畫的清單在 [algo_animations.md](algo_animations.md)。

## 規則

| 名詞 | 意思 |
|---|---|
| 動作 | 一個運算子（`+ - * / // % == < and not` …）、一次取值 `a[i]`、一次呼叫（`print()`、`len()`、`bin()`、`q.append()` …）、一次 `=`、一次 if / while / for 的判斷、一次 return |
| 一步 | 做**一個**動作。step 0 = 還沒開始執行 |
| 預告 | 下一個動作**會**做什麼（不會真的執行） |
| 執行 | 做完這個動作，畫面變成做完之後的樣子 |

課程 JSON 的動畫區塊用 `steps` 放預告文字、`results` 放執行後的文字，兩個陣列長度一樣，都等於步數。

## 檔案在哪裡

```text
web_src/src/
├── LessonContent.tsx        # AnimationStepper：播放器（按鈕、鍵盤、預告、放大、固定高度）
├── animations/
│   ├── N.tsx                # 第 N 號動畫：export default function ({ step }) { … }
│   └── trace/N.ts           # 演算法動畫的執行資料（自動產生）
└── animation_kit/
    ├── registry.tsx         # 用 import.meta.glob 載入 animations/*.tsx，id = 檔名的數字
    ├── shared.tsx           # Box、AnimArrow（1 ～ 27 號用）
    ├── HardwareKit.tsx      # CPU / Bus / DRAM / 螢幕 / 鍵盤 / CodePanel / Line / Tok（28 ～ 37 號用）
    ├── bits.ts              # 硬體畫面的顯示設定（二進位、記憶體表格…）
    ├── stepSize.tsx         # 每一步的高度都一樣，畫面不會跳
    ├── preview.ts           # 預告：比較這一步和下一步的程式碼 token，標出下一步要處理的部分
    ├── DynamicArrows.tsx
    └── AlgoKit.tsx          # 演算法動畫用（38 號之後）：TraceView、GraphView、Seq、StackView、Table2D…
```

## 播放器（AnimationStepper）

| 操作 | 按鈕 | 鍵盤 |
|---|---|---|
| 執行（下一步） | 執行 | `→`、空白鍵、Enter |
| 預告 | 預告 | `↓`、`P` |
| 上一步 | ◀ | `←` |
| 回到開頭 | ⏮ | Home |
| 跳到某一步 | 上方的小圓點 | |
| 全螢幕放大 | 放大鈕 | |

- 播放器會先把每一步都畫一次（看不見），量出最高的那一步，整個動畫就固定成那個高度，所以步與步之間不會跳動。
- **預告**：有 `results` 時，顯示 `steps[下一步]`。程式碼面板裡下一步要處理的 token 也會被標起來（`preview.ts` 比較兩步的 `Tok`）。

## 三種動畫

### 1 ～ 27 號：概念動畫

用 `shared.tsx` 的 `Box`、`AnimArrow` 和 `motion` 自己排版，例如 Input → Process → Output、House Analogy。步數少（3 ～ 6 步），沒有 `results`。

### 28 ～ 37 號：硬體動畫（熟悉語法模組）

用 `HardwareKit.tsx` 的 `Board`、`CodePanel`、`Line`、`Tok`、`CPU`、`Bus`、`RAM`、`Screen`，把一行 Python 在 CPU、暫存器、DRAM 裡怎麼跑畫出來。每一步的狀態寫在元件裡，`steps`、`results` 寫在 `data.json`。

### 38 號之後：演算法動畫（由程式產生）

不是手寫每一步，而是用 `scripts/animation_tracer/` **真的執行**一段 Python，每做一個動作就記一步：

1. `scripts/animation_tracer/specs.py` 寫好要跑的程式（這也是動畫裡顯示的程式碼）。
2. `python scripts/animation_tracer/run.py` 執行它，產生 `animations/trace/N.ts`，同時把預告 / 執行後的文字寫進 `data.json`。
3. `animations/N.tsx` 用 `TraceView` 畫出共同的部分，只要再畫自己的圖。

`TraceView` 會自動畫：

- 「現在在做什麼」＋「執行後」
- 程式碼：目前那一行換成算到一半的樣子，剛算出來的值框起來（`mid = ⟦8⟧ // 2` → `mid = ⟦4⟧`）
- 變數（純量）
- call stack（有呼叫函式時）
- 螢幕（有 `print` 時）

每一步的資料（`TraceStep`）：

| 欄位 | 意思 |
|---|---|
| `pre` / `post` | 預告 / 執行後的文字 |
| `line` | 第幾行（從 1 開始） |
| `expr` | 那一行做完這個動作之後的樣子，`⟦ ⟧` 是剛產生的值 |
| `kind` | `binop`、`compare`、`subscript`、`call`、`call_user`、`assign`、`if`、`while`、`for`、`return`… |
| `vars` | 這一步之後所有變數的值（JSON） |
| `ref` | 這個動作讀或寫的格子，例如 `['dp', 1, 0]` = `dp[1][0]` |
| `stack` | 目前的函式呼叫 |
| `out` | 螢幕上的輸出 |

## 新增一支動畫

### 演算法動畫（建議）

1. 在 `scripts/animation_tracer/specs.py` 加一個 `SPECS[N] = dict(caption=…, intro=…, src='''…''', notes={…})`。
2. 執行 `python scripts/animation_tracer/run.py N`，確認步數（建議 120 步以內，太多就把例子改小）。
3. 新增 `web_src/src/animations/N.tsx`：

   ```tsx
   import React from 'react';
   import T from './trace/N';
   import { TraceView, Stage, Seq, touches } from '../animation_kit/AlgoKit';

   export default function MyAnim({ step }: { step: number }) {
     return (
       <TraceView T={T} step={step}>
         {(st) => (
           <Stage title="a">
             <Seq items={(st.vars.a ?? []).map((v: number, i: number) => ({ v, tone: touches(st, 'a', i) ? 'active' : 'normal' }))} />
           </Stage>
         )}
       </TraceView>
     );
   }
   ```

4. 在 `data.json` 的某一課放 `{ "type": "animation", "animationId": N }`，再跑一次 `run.py N`，它會幫你填好 `caption`、`steps`、`results`。

詳細用法見 [scripts/animation_tracer/README.md](scripts/animation_tracer/README.md)。

### 手寫動畫

1. 新增 `web_src/src/animations/N.tsx`，`export default function ({ step }: { step: number })`，用 `clampStep(step, 步數)`。
2. 在 `data.json` 放動畫區塊，`steps`（和 `results`）的數量要等於步數。
3. 要讓預告標出程式碼，程式碼要用 `HardwareKit` 的 `CodePanel` / `Line` / `Tok` 畫。

`registry.tsx` 會自動找到新檔案，不用另外註冊。

## AlgoKit 零件

| 零件 | 用途 |
|---|---|
| `TraceView`、`TraceCode` | 演算法動畫的外框和程式碼面板 |
| `AlgoBoard`、`Stage`、`Note`、`Split`、`VarRow` | 外框、標題區、說明、左右並排、變數 |
| `ValueCell`、`Seq` | 一格 / 一排格子（陣列、queue、deque） |
| `StackView` | 直的堆疊（call stack、單調堆疊） |
| `Table2D` | DP 表格 |
| `GraphView` | 圖和樹（固定座標，邊可以有方向和權重） |
| `touches(st, 'dp', 1, 0)`、`wrote(st, 'dist')` | 判斷這一步有沒有讀 / 寫某一格 |

顏色（`tone`）：`active` 黃 = 正在處理、`yes` 綠 = 完成 / 確定、`blue` 藍、`hit` 紅、`no` 灰、`dim` 更淡的灰。
