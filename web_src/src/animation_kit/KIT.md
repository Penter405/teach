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
├── codeLang.tsx      程式碼顯示 Python 還是中文步驟（所有動畫共用的設定、切換按鈕）
└── registry.tsx      自動載入 animations/N.tsx；hasPseudo(id) = 這支動畫有沒有中文步驟
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
| `stack` | 紫（虛線框） | 遞迴 / DFS 還沒結束的呼叫：進去了、還沒 return（和正在處理的 `active` 分開，見 100、105） |

自己畫的格子要同樣的顏色：`toneClass(tone)`（Tailwind class）、`toneFill(tone)`（SVG 的 `[fill, stroke, text]`）。

## AlgoKit.tsx

### 外框

| 零件 | 用法 |
|---|---|
| `TraceView` | `<TraceView T={T} step={step} hide={['idx']} show={[…]} noStack>{(st, s) => 圖}</TraceView>`。自動畫：現在在做什麼、執行後、程式碼（目前那行換成算到一半）、動作卡片、純量變數、call stack、螢幕。`hide` 拿掉不想顯示的變數；`show` 只顯示這些。排版（`index.css` 的 `.trace-grid`）：長的放在短的旁邊，不讓兩個長的疊在一起——窄：程式碼 → call stack／動作／變數 → 圖；中：圖 + call stack／動作／變數 ｜ 程式碼（圖比程式碼高時，call stack 那些改放程式碼下面）；很寬：圖 ｜ 程式碼 ｜ call stack／動作／變數。程式碼太寬（超過 70%）就整個排成一欄 |
| `AlgoBoard` | 手寫動畫的外框：`<AlgoBoard now="…" post="…" wide>…</AlgoBoard>` |
| `Stage` | 有標題的一區：`<Stage title="dp" right={<span>…</span>}>…</Stage>`。注意標題會轉成大寫 |
| `FitWidth` | `<FitWidth>寬的圖</FitWidth>`：欄位不夠寬時把圖等比例縮小（不會放大），不用左右捲動。固定寬度的自訂圖用它（見 95） |
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
| `GraphView` | 圖 / 樹：`nodes={[{ id, x, y, label, tone, above, below }]}`、`edges={[{ a, b, w, tone, directed, bend }]}`；邊的 tone：`normal`、`active`、`chosen`、`dim`、`hit`。`bend` = 把邊彎成弧線（a→b 和 b→a 兩條邊都給同樣的 `bend` 就不會疊在一起，見 100） |

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

0-indexed 的資料加 `first={0}`（塊 = `l // block`，起點是空區間 `[0, -1]`），見 96。`travel(..., { l: 0, r: -1 })` 也要給同樣的起點。

**`QueryList`**：查詢小標籤，做完 = 藍、現在 = 黃、還沒 = 灰。`extra={(q) => …}` 可以加答案。

**`Stat`**：一個大數字＋標題（總步數、總權重）。`hot` 會亮。

## HardwareKit.tsx（28 ～ 37 號）

| 零件 | 用途 |
|---|---|
| `Board` | 硬體動畫的外框。預設「三欄排列」：CPU ｜ DRAM ｜ Python（板子寬 ≥ 860px；更窄時 CPU + Python 在上、DRAM 在下）。開關存在 localStorage `teach_hw_view_v3` |
| `CodePanel`、`Line`、`Tok` | 程式碼；`Line pc` = 正在跑的那行，`Tok s="active" | "done" | "dim"`。**預告**靠比較兩步的 `Tok` 標出下一步要處理的地方，所以手寫動畫的程式碼也要用它們。中文步驟：`<Line pseudo={…}>`（讀者選中文步驟時顯示它）、`<CodePanel pseudo>`（標題跟著變） |
| `CPU`、`Bus`、`RAM`、`Screen`、`Keyboard`、`Buffer` | 機器的各部分 |
| `Bits`、`Tag`、`Gate` | 二進位、標籤、邏輯閘 |
| `clampStep(step, 步數)` | 把 step 限制在 0 ～ 步數 − 1。手寫動畫一定要用 |

## 中文步驟（pseudo code）

讀者在播放器下面切換 **Python ↔ 中文步驟**，所有動畫共用一個設定。

| 動畫 | 怎麼加中文步驟 |
|---|---|
| tracer | `specs.py` 的 spec 加 `pseudo='''…'''`：和 `src` 一樣多行、一樣縮排。`{運算式}` 會在跑的時候換成那一刻的值（和 Python 一樣：`{1 + ans[nxt[x]]}` → `1 + ans[⟦2⟧]` → `1 + ⟦2⟧` → `⟦3⟧`）。`TraceView` 自己會切換，不用改 N.tsx。見 82 |
| 手寫（有程式碼的） | 每個 `<Line>` 給 `pseudo`，`<CodePanel pseudo>`，N.tsx `export const HAS_PSEUDO = true`。目前那一行的值自己算，用 `codeTokens('r ← dfs(⟦5⟧, 1)')` 畫。見 105 |
| 沒有程式碼的 | 不用做（切換只會提示「還沒有中文步驟」） |

寫法：同一行講同一件事；變數名稱不變（變數區、call stack 才對得起來）；指定用 `←`、比較用 `= ≠ ≤ ≥`；說意思，不要照念語法（`color[node] >= 0` → 「node 的 dfs 還沒結束」）；一行太長在窄的欄位會換行，括號裡的說明寫短一點。

| 函式 / 零件 | 意思 |
|---|---|
| `useCodeLang()` | 目前是 `'python'` 還是 `'pseudo'`（`codeLang.tsx`） |
| `CodeLangSwitch` | 切換按鈕（播放器已經放了，動畫裡不用放） |
| `codeTokens(text)` | 一行程式碼 → `Tok`，`⟦v⟧` 畫成剛算出來的值（AlgoKit） |

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

- 不是重點的函式放進 `env`，只算一步，例如 Mo's 的 `add(i)` / `remove(i)`。它可以用 `SPECS_STATE['g']` 讀寫程式裡的變數，然後在 `CALLDESC` 寫說明。兩支動畫的輔助函式同名但做的事不一樣時（例如 94、97、98 都有 `add`），在那個 spec 裡寫 `calldesc={'add': '…'}`，只對那支有效。
- 開頭的資料（`a = [...]`）不算步數，第 0 步就看得到。
- 步數太多：資料改小、把輔助函式放進 `env`。`x += 1` 是兩步（運算＋指定）。
- 函式裡可以用 `global x, y`（不算一步）：指定 `x = …` 會改到外面的 `x`，見 100。
- `qs` 這類很長的資料，tuple 裡不加空白，程式碼面板才放得下。

## 檢查

```bash
python scripts/animation_tracer/run.py N      # 產生 trace，更新 data.json
cd web_src && npm run lint && npm run dev
```

看三件事：第 0 步、中間一步、最後一步；窄螢幕（約 800px）也看一次。
