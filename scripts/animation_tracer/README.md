# animation_tracer：演算法動畫產生器

真的執行一段 Python，每做**一個動作**就記一步，產生動畫要用的資料和課程裡的預告 / 執行後文字。動畫 38 號之後都是這樣做的。

```bash
python scripts/animation_tracer/run.py            # 全部重新產生
python scripts/animation_tracer/run.py 41,83      # 只產生這幾支
```

需要 Python 3.9 以上，不用安裝其他套件。

## 它會做什麼

1. 讀 `specs.py` 裡的 `SPECS[N]`，用 `tracer.py` 執行那段程式。
2. 寫出 `web_src/src/animations/trace/N.ts`（動畫元件 `N.tsx` 讀它）。
3. 找出 `docs/content/data.json` 裡所有 `animationId == N` 的區塊，更新 `caption`、`steps`（預告）、`results`（執行後）。

所以 `trace/*.ts` 和那些區塊的 `steps` / `results` **不要手改**，下次執行會被蓋掉。要改就改 `specs.py`。

## 檔案

| 檔案 | 用途 |
|---|---|
| `tracer.py` | 執行器：一步 = 一個動作，記下預告、執行後、改寫過的那一行、變數 |
| `specs.py` | 每一支動畫要跑的程式、說明文字、輔助函式 |
| `run.py` | 執行全部（或指定的）spec，寫出 trace 檔並更新 `data.json` |

## 一個 spec

```python
SPECS[41] = dict(
    caption='二分搜尋：在 [1,3,4,4,4,7,9,12] 找最左邊的 4',   # 動畫標題（也會寫進 data.json）
    intro='a 已經排好序；左閉右開 [lo, hi)',                    # 第 0 步的「執行後」
    src='''
def lower_bound(a, target):
    lo = 0
    hi = len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo

a = [1, 3, 4, 4, 4, 7, 9, 12]
print(lower_bound(a, 4))
''',
    notes={
        'hi = mid': ('mid 可能就是答案，留著；左邊可能還有', True),   # 每次都加
        'return lo': 'lo == hi：只剩一個可能，就是答案',              # 只加第一次
    },
)
```

| 欄位 | 意思 |
|---|---|
| `caption` | 動畫標題 |
| `intro` | 還沒開始執行時要說的話 |
| `src` | 要執行的程式，也就是動畫裡顯示的程式碼 |
| `notes` | 補充說明：key 是那一行程式裡的一段文字（找第一個出現的位置），value 是說明。寫成 `(文字, True)` 代表每次走到那一行都加 |
| `env` | 程式開始前就存在的東西，例如 `INF`、`heappush`，或當成一個動作的輔助函式 |

### 輔助函式（一步帶過）

不是這支動畫重點的函式，可以放進 `env`，它會像 `len()` 一樣只算一步。例如 4 皇后的 `ok(r, c)`、二分答案的 `hours()`、樹的直徑的 `farthest()`。在 `specs.py` 最下面的 `CALLDESC` 可以寫它的說明：

```python
CALLDESC = {'ok': '檢查 (r, c) 會不會被前面的皇后攻擊', …}
```

## 什麼算一個動作

| 動作 | 例子 | 預告 → 執行後 |
|---|---|---|
| 運算子 | `lo + hi` | `lo + hi：0 + 8` → `得到 8。算式變成 mid = 8 // 2` |
| 比較 | `a[mid] >= target` | `4 >= 4` → `是 True` |
| `and` / `or` / `not` | `stack and a[stack[-1]] < x` | 會說明有沒有短路 |
| 取值 | `a[mid]` | `a[4]：拿 index 4 的值` → `是 4` |
| 呼叫 | `len(a)`、`q.popleft()`、`heappush(pq, x)` | 會寫出回傳值和哪個容器變了 |
| 呼叫自己寫的函式 | `fact(n - 1)` | 進入函式、stack 多一層；return 時回到原來那一行 |
| 指定 | `mid = …`、`dp[i][c] = …`、`a, b = b, a % b` | `mid → 4` |
| if / while / for | | 條件成立 → 進入；不成立 → 跳過 / 離開迴圈 |
| return、break、continue、def | | |

變數名稱、常數不算一步（它們跟著用到它們的運算一起）。

## 支援的 Python

函式（含遞迴）、`if` / `elif` / `else`、`while`、`for`、`break`、`continue`、`return`、指定（含 `a, b = …`、`a[i] = …`、`a[i][j] = …`、`+=`）、運算子、比較（不能連寫 `a < b < c`）、`and` / `or` / `not`、索引和切片、list / tuple / dict / set 的字面值、任何內建函式和方法。

**不支援**：list comprehension、lambda、f-string、`with`、`try`、class、`import`（要用的東西放進 `env`）、一行同時指定多個變數（`a = b = 0`，請分兩行寫）。

## 步數

步數 = 動作的數量，例子太大會很長。目前最長的是 4 皇后 158 步。建議控制在 120 步以內：把資料改小，或把不是重點的部分放進 `env` 當成一步。

## 改完之後

```bash
python scripts/animation_tracer/run.py N
cd web_src && npm run lint && npm run dev
```

如果改了程式裡的變數名稱，對應的 `animations/N.tsx` 也要改（它用 `st.vars.變數名` 畫圖）。
