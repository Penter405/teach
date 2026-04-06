# Python 課程完整講義（含設計筆記）

## 導覽頁 (目錄)
![Image: Page 2.png]
- **what is code**
- **怎麼理解題目**
- **Python介紹**
- **Python課程** (包含眾多子章節)

---

## 1. What is code
> 統整頁面：Page 3, 4, 17, 45, 49

### 1.1 執行程式的流程 (Page 3)
![Image: Page 3.png]
- **核心流程**：Input 資料 → 處理資料 → Output 資料。
- **[動畫設計需求]**：
  - 在 **Input 方塊**下方加入一個包含 WASD+F 的鍵盤圖示。
  - **第一階段**：Input 方塊亮起時，鍵盤的 **F 鍵**同步亮起。
  - **第二階段**：箭頭從 Input 指向 **Process 方塊**時，F 鍵燈滅，Process 方塊下方亮起虛擬碼：`if (按下F) then 進入載具`。
  - **第三階段**：**Output 方塊**亮起，下方顯示「小人進入載具」的畫面。
  - *註：若版權不允許使用網路圖片，需重新繪製原創圖示。*

### 1.2 核心概念 (Page 4)
![Image: Page 4.png]
- **程式本質**：程式 = 做很多有關資料的事情。

---

## 2. 怎麼理解題目
> 統整頁面：Page 5, 50

### 2.1 拆分步驟 (Page 5, 50)
![Image: Page 5.png]
- **教學目標**：確保學生掌握「拆分步驟」的概念。
- **[設計邏輯]**：
  - **初始狀態**：資料為空。
  - **循環流程**：Input 資料 → 記憶 (Remember) → 處理 (Process) → 再次記憶 (Remember)。此循環可根據需求重複多次。
  - **最終狀態**：產出目標結果。
- **範例應用**：
  - 寫出 10 個 "hi"：有一件事要做 10 次，那件事叫做 `print("hi")`。
  - 找 10 個數字的最大值：需要 `list` 來存放這 10 個不斷被「記住」的輸入值，最後再處理找出 Max。

---

## 3. Python 介紹
> 統整頁面：Page 6-15, 46-47, 52-54, 56-58

### 3.1 用直譯器 (Page 7, 46)
![Image: Page 7.png]
- **直譯器 (Python)**：從頭看、從頭寫（一行行執行）。
- **編譯器 (C 語言)**：先看過一遍，再從 `main()` 開始執行，速度極快（約 50ms）。
- **[視覺設計修正]**：當滑鼠停留在「編譯器 (Compiler)」區塊時，動畫方塊顯示底線。**特別注意：** 移除所有可能出現在圖片中的水平滾動條 (Scroll line/bar)，保持視覺清爽。

### 3.2 物件導向 (OOP)
![Image: Page 8-12.png]
- **萬物皆物件**：在 Python 中，Data = Class，連 `function` 也是一個 Class。(Page 47, 57)
- **核心概念**：
  - **Class 與 Object**：初始化一個 Class（如：人類），存入變數後稱為 Object。
  - **內容設定**：包含 Property (屬性) 與 Method (方法)。
  - **`__init__`**：自動執行，用於設定初始屬性（如：身高、血量）。
  - **`self`**：代表物件本身（例如 `Lucky=dog()`，`self` 指的就是 `Lucky`）。
- **內建 Class**：(Page 53-54)
  - `int`：`s=8` 等同於 `s=int(value=8)`，`s` 是物件。
  - `str`：字串物件內建 Method，如 `s.split()`。

### 3.3 反射 (Reflection)
![Image: Page 13-15.png]
- **公式**：反射 = 自省 (Introspection) + 動態操作。
- **工具**：`dir()`, `help()`, `type()`。
- **動態方法**：`getattr()` (取得/呼叫), `setattr()` (修改), `delattr()` (刪除)。

---

## 4. Python 課程 (子章節與資料生命週期)
> 統整頁面：Page 16-41, 51, 59-61
![Image: Page 16.png]

### 4.1 收集資料 (Page 18-21)
![Image: Page 18.png]
- **RAM 的重要性**：CPU 只關心 RAM 裡的資料。
- **C vs. Python**：C 需手動管理空間；Python 將資料寫成 Class，由 CPU 自動進行垃圾回收 (Garbage Collection)。

### 4.2 儲存與刪除資料 (Page 22-25)
![Image: Page 22.png]
- **變數與指標**：建立變數指向 RAM 地址。若無變數指向，資料會被回收（刪除沒用的資料）。

### 4.3 變數與資料的關係 (Page 26-34)
- **Immutable (不可變)**：資料不可改，換值等於換地址。包含 `int`, `str`, `tuple` 等。
- **Mutable (可變)**：可在原地址修改資料。包含 `list`, `set`, `dict`。
  - **注意差異**：搬出去住 (Coped) vs. 改裝房子 (Reference / In-place)。可用 `id()` 檢查。

### 4.4 處理資料：程式結構 (Page 35-41, 51)
![Image: Page 35.png]
- **結構對比**：
  - **C 語言**：`;` 結尾，`{ }` 包裹區塊。
  - **Python**：**換行**代表單行，**縮排**代表區塊。
- **控制結構 (特別的 Code)**：`if`, `else`, `for`, `while`。(Page 51)

### 4.5 寫出有用的資料：Return (Page 59-61)
![Image: Page 59.png]
- **Return 的本質**：「把 A 換成 B」。
- **邏輯理解**：如同數學算式 `3(5+8) -> 3(13)`，函式執行完後會被其 Return 值取代。這是寫出有用資料的最後一步。