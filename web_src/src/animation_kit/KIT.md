# animation_kit 使用手冊

這份是「零件目錄」：做一支新動畫時，先在這裡找現成的零件和函式，不要重寫。
動畫系統怎麼運作（播放器、預告、tracer）見 [ANIMATIONS.md](../../../ANIMATIONS.md)。

```text
animation_kit/
├── AlgoKit.tsx       外框、程式碼、格子、圖、表格、TraceView（演算法動畫的骨架）
├── AlgoHelpers.tsx   從 38 ～ 92 號抽出來的小函式 + 指標 / 計數 / 查詢的零件
├── HardwareKit.tsx   CPU、DRAM、螢幕、鍵盤、CodePanel / Line / Tok（28 ～ 37 號）
├── shared.tsx        Box、AnimArrow（1 ～ 27 號的概念動畫）
├── bits.ts           硬體畫面的顯示設定、把值編成 bytes
├── stepSize.tsx      每一步一樣高（播放器在用，動畫通常不用碰）
├── preview.ts        預告時標出下一步要處理的 Tok（播放器在用）
└── registry.tsx      自動載入 animations/N.tsx
```

## 選哪一種做法

| 想做的動畫 | 做法 | 例子 |
|---|---|---|
| 一段程式怎麼一步一步跑（迴圈、指標、DP、圖） | **tracer**：寫 `specs.py` → `run.py N` → `N.tsx` 用 `TraceView` 畫圖 | 41、56、83、94 |
| 比較幾種策略、畫統計、跟「程式怎麼跑」無關 | **手寫**：`AlgoBoard` + 零件，自己算每一步的狀態，`data.json` 的 `steps` / `results` 自己寫 | 93 |
| 硬體裡發生什麼事 | `HardwareKit` 的 `Board`、`CPU`、`RAM`… | 28 ～ 37 |
| 概念示意（幾個方塊、箭頭） | `shared.tsx` 的 `Box`、`AnimArrow` + `motion` | 1 ～ 27 |

## 一支動畫的樣子

```tsx
// animations/N.tsx
import React from 'react';
import T from './trace/N';
import { TraceView, Stage, Seq } from '../animation_kit/AlgoKit';
import { arr, rwTone, ptrLabel } from '../animation_kit/AlgoHelpers';

export default function MyAnim({ step }: { step: number }) {
  return (
    <TraceView T={T} step={step}>
      {(st, s) => {                       // st = 這一步的資料，s = 第幾步
        const a = arr(st, 'a');
        const { lo, hi, mid } = st.vars;
        return (
          <Stage title="a">
            <Seq items={a.map((v, i) => ({ v, tone: rwTone(st, 'a', [i]), top: ptrLabel(i, { lo, hi, mid }) }))} />
          </Stage>
        );
      }}
    </TraceView>
  );
}
```

- `export default function (props: { step: number })`，檔名就是編號，`registry.tsx` 會自己找到。
- 畫面只看 `step`，不要有自己的 state（播放器會先把每一步都畫一次量高度）。
- 顏色只用 `CellTone`，別自己挑。

## 顏色：CellTone

| tone | 顏色 | 用在 |
|---|---|---|
| `normal` | 灰 | 一般 |
| `active` | 黃＋外框 | 這一步正在讀 / 正在處理 |
| `yes` | 綠 | 剛寫入、完成、確定、在區間裡 |
| `blue` | 藍 | 迴圈變數指到的、已處理過 |
| `hit` | 紅＋外框 | 衝突、被移除、會被攻擊 |
| `no` | 淡灰 | 排除了 |
| `dim` | 更淡 | 不用看 / 還沒用到 |

自己畫的格子要同樣的顏色：`toneClass(tone)`（Tailwind class）、`toneFill(tone)`（SVG 的 `[fill, stroke, text]`）。

## AlgoKit.tsx

### 外框

| 零件 | 用法 |
|---|---|
| `TraceView` | `<TraceView T={T} step={step} hide={['idx']} show={[…]} noStack>{(st, s) => 圖}</TraceView>`。自動畫：現在在做什麼、執行後、程式碼（目前那行換成算到一半）、動作卡片、純量變數、call stack、螢幕。`hide` 拿掉不想顯示的變數；`show` 只顯示這些 |
| `AlgoBoard` | 手寫動畫的外框：`<AlgoBoard now="…" post="…" wide>…</AlgoBoard>` |
| `Stage` | 有標題的一區：`<Stage title="dp" right={<span>…</span>}>…</Stage>`。注意標題會轉成大寫 |
| `Split` | 兩區左右並排（窄螢幕上下） |
| `Note` | 一段說明框，`tone="sky" | "emerald" | "rose" | "amber"` |
| `VarRow` | `name = value` 小標籤，`hot` 會亮 |

### 格子和序列

| 零件 | 用法 |
|---|---|
| `ValueCell` | 一格：`value`、`tone`、`top`、`bottom`、`struck`（劃掉）、`circle`、`size="sm"` |
| `Seq` | 一排格子（list、queue、deque）：`items={[{ v, tone, top, bottom, struck }]}`、`left="出" right="進"`、`empty="（空）"` |
| `StackView` | 直的堆疊，上面是頂：`items={[{ v, tone, note }]}` |
| `Table2D` | DP 表格：`colHeads`、`rows={[{ head, cells: [{ v, tone, note }] }]}`、`corner` |
| `GraphView` | 圖 / 樹：`nodes={[{ id, x, y, label, tone, above, below }]}`、`edges={[{ a, b, w, tone, directed }]}`；邊的 tone：`normal`、`active`、`chosen`、`dim`、`hit` |

### 讀這一步的資料

| 函式 | 意思 |
|---|---|
| `touches(st, 'dp', 1, 0)` | 這一步讀或寫了 `dp[1][0]` |
| `wrote(st, 'dist')` | 這一步改了 `dist`（指定、`for`、或 `append` 這類方法） |
| `st.vars.x` | 這一步之後 `x` 的值 |
| `st.kind` | `binop`、`compare`、`subscript`、`call`、`call_user`、`assign`、`if`、`while`、`for`、`return`… |
| `st.taken` | if / while / for 這次有沒有進去 |
| `st.fn` / `st.changed` | 呼叫了哪個函式 / 哪些容器被方法改了 |
| `st.ref` | 讀寫的格子，例如 `['dp', 1, 0]` |

## AlgoHelpers.tsx

### 小函式

| 函式 | 取代的寫法 | 例子 |
|---|---|---|
| `arr(st, 'a', fallback?)` | `st.vars.a ?? []` | `const dp = arr(st, 'dp')` |
| `rwTone(st, 'dp', [k], otherwise?)` | `touches(…) ? (st.kind === 'assign' ? 'yes' : 'active') : …` | `tone: rwTone(st, 'dist', [k], d < 0 ? 'dim' : 'normal')` |
| `ptrLabel(i, { lo, hi, mid })` | `[i === lo ? 'lo' : '', …].filter(Boolean).join(' ')` | `top: ptrLabel(i, { lo, hi, mid })` |
| `inRange(i, lo, hi, halfOpen?)` | `i >= lo && i <= hi` | 視窗、二分搜尋的範圍 |
| `sameEdge(a, b, u, v, directed?)` | `(a === u && b === v) \|\| (b === u && a === v)` | 標出正在看的邊 |
| `upTo(T, s)` | `T.steps.slice(0, s + 1)` | 看歷史 |
| `count(T, s, pred)` | `…filter(pred).length` | 第幾輪：`count(T, s, x => x.kind === 'for' && !!x.taken) - 1` |
| `collect(T, s, pred, pick)` | `forEach` + `push` | 選過的邊：`collect(T, s, x => x.ref?.[0] === 'PARENT', x => \`${x.vars.u}-${x.vars.v}\`)` |
| `prevStep(T, s)` | `T.steps[s - 1]` | 和上一步比：`arr(prevStep(T, s), 'cnt')` |
| `posNodes(POS, id => ({ tone, below }))` | `Object.entries(POS).map(…)` | 固定座標的圖 |
| `heapLayout(n, { width, top, dy })` | 手寫 `POS` | heap、線段樹、存在 list 裡的完全二元樹 |
| `forestLayout(parent)` | 57 號的 `layout()` | 並查集的森林 |
| `travel(queries, order, done?)` | — | 依 `order` 處理查詢，兩個指標總共走幾步 |
| `toneClass(tone)` / `toneFill(tone)` | 複製 Tailwind 字串 | 自己畫的棋盤、Fenwick 範圍、SVG |

### 零件

**`PointerSeq`**：一排格子，下面有會「滑過去」的指標，後面可以有一條區間色帶。雙指標、滑動視窗、Mo's 都用它。

```tsx
<PointerSeq
  first={1}                                   // items[0] 是 index 1（1-indexed，不畫 a[0]）
  items={a.slice(1).map((v) => ({ v }))}
  range={{ from: cur_l, to: cur_r }}          // 閉區間；to < from 就不畫（空區間）
  pointers={[
    { name: 'cur_l', at: cur_l },             // 顏色：amber（預設）、sky、emerald、rose
    { name: 'cur_r', at: cur_r, color: 'sky' },
  ]}
/>
```

同一格有好幾個指標會往下疊。`index={null}` 不顯示上面的 index，`size="sm"` 小格子。

**`CountBars`**：`cnt[x]` 的長條圖。給 `prev`（上一步的 cnt），0 → 1 的那條會變綠、1 → 0 變紅。

```tsx
<CountBars counts={cnt} keys={[1, 2, 3, 4, 5]} hot={a[i]} prev={arr(prevStep(T, s), 'cnt')} max={3} />
```

**`QueryPlot`**：每筆查詢是一個點 (l, r)，畫出依 `order` 走過的路徑和分塊的條紋。

```tsx
<QueryPlot n={8} queries={QS} order={order} done={k} block={3} color="#38bdf8" />
```

**`QueryList`**：查詢小標籤，做完 = 藍、現在 = 黃、還沒 = 灰。`extra={(q) => …}` 可以加答案。

**`Stat`**：一個大數字＋標題（總步數、總權重）。`hot` 會亮。

## HardwareKit.tsx（28 ～ 37 號）

| 零件 | 用途 |
|---|---|
| `Board` | 硬體動畫的外框 |
| `CodePanel`、`Line`、`Tok` | 程式碼；`Line pc` = 正在跑的那行，`Tok s="active" | "done" | "dim"`。**預告**靠比較兩步的 `Tok` 標出下一步要處理的地方，所以手寫動畫的程式碼也要用它們 |
| `CPU`、`Bus`、`RAM`、`Screen`、`Keyboard`、`Buffer` | 機器的各部分 |
| `Bits`、`Tag`、`Gate` | 二進位、標籤、邏輯閘 |
| `clampStep(step, 步數)` | 把 step 限制在 0 ～ 步數 − 1。手寫動畫一定要用 |

## 常見動畫的配方

| 演算法 | 零件 |
|---|---|
| 雙指標 / 滑動視窗 | `PointerSeq`（`range` = 視窗）＋ `VarRow` 或 `Stat` 顯示答案 |
| 二分搜尋 | `Seq` ＋ `ptrLabel(i, { lo, hi, mid })` ＋ `struck` 標排除的 |
| 計數、出現次數 | `CountBars` |
| 離線查詢（Mo's） | `QueryPlot`、`QueryList`、`PointerSeq`、`CountBars` |
| stack / queue / heap | `StackView`、`Seq left="出" right="進"`、`GraphView` ＋ `heapLayout` |
| DP | `Seq`（1D）或 `Table2D`（2D）＋ `rwTone` |
| 圖 | `GraphView` ＋ `posNodes` ＋ `sameEdge`；距離陣列用 `Seq size="sm"` |
| 並查集 | `GraphView` ＋ `forestLayout` |

## tracer 的小技巧

- 不是重點的函式放進 `env`，只算一步，例如 Mo's 的 `add(i)` / `remove(i)`。它可以用 `SPECS_STATE['g']` 讀寫程式裡的變數，然後在 `CALLDESC` 寫說明。
- 開頭的資料（`a = [...]`）不算步數，第 0 步就看得到。
- 步數太多：資料改小、把輔助函式放進 `env`。`x += 1` 是兩步（運算＋指定）。
- `qs` 這類很長的資料，tuple 裡不加空白，程式碼面板才放得下。

## 檢查

```bash
python scripts/animation_tracer/run.py N      # 產生 trace，更新 data.json
cd web_src && npm run lint && npm run dev
```

看三件事：第 0 步、中間一步、最後一步；窄螢幕（約 800px）也看一次。
