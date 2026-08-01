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

## 4. Computer science in coding steps
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
## 5 實際寫寫看
### 5.1 從生活中發現 Code 
#### 1.請寫出早上起床到出門上班中，的十件事情。其中要寫出用身體的哪個部分，對什麼物體做了什麼動作，物體可以是自己本身。並按照先後順序寫出來。
##### 例如:用手搓搓眼睛。拿起手機看新聞。
#### 2.在英文中，一個句子會有主詞、動詞、受詞
#### animation : photo 1: 主詞 動詞 受詞 , photo 2: photo 1 是橫向的，現在我們在那三個node的下面畫箭頭，在photo 2 長這樣 python(虛線框框，表示這個不用寫出來) print 3 , photo 3: 在3個左右邊放(). 然後讓python(虛線框框) 透明度變高(更透明) ，告訴user這是 function。 photo 4: 讓主詞框框變成有東西，並且主詞跟動詞之間有.  ，讓user知道這是method
#### 現在把這些事情寫成 主詞.動詞(受詞) 的格式 ，如果主詞不是人，例如你的鬧鐘，那麼請用 動詞(受詞) 的形式表達(也就是function)
#### (這很明顯是申論題，有沒有方法讓我的web import chatgpt? 我記得有個html語法是可以import youtube url 的，還是說只能用backend api? 這點我們要討論)
#### 5-1 explain(shown after user finished quizzes):在解本題的過程中，我們可以學到如何把一件題目說的事情拆解成小步驟，如果題目要你寫一段code 關於成功起床並且狀態滿滿的出門，那麼我們就會把問題拆成很多小步驟，例如我麼寫的10個早上的事情。並且這些小問題有順序性。(當然實際寫code的時候，順序可能會變換，例如說早起直接刷牙跟先吃早簪，如果兩個都能達成狀態滿滿的出門，那他們的順序就沒什麼差別，its up to you)。並且你可以學到function 跟 method 的差別，function 是屬於Python的 ，所以如果今天python 強制所有code都要寫成 method 的形式( 也就是 主詞.動詞(受詞) )，那們原本是function的前面就會多一個 主詞，像是 python.print(3) 。翻譯成本題就會變成 你的手機.鬧鐘叫("06:00") ,下一行事情可能是 你的手.關鬧鐘("手機") (你的手.關鬧鐘("手機") 這行的主詞是你，主詞是人，所以它本來就是method)
#### (也許explain 可以寫成動畫)
### 5.2 常見的名詞
### 5.3 常見的動詞
#### 前面我們有講過程式的大架構是 input , process , output。 在process 裡面我們會寫很多程式碼，而這些程式碼大多數都是動詞。however 關於 input 跟 output, 在python 中 ，其實是兩個 function: input() 跟 print()
#### input(), 這個function 會讓user在鍵盤輸入東西， 他會將輸入的記起來，當使用者按下鍵盤的enter，這個function 就會回傳剛剛記住的鍵盤輸入，用字串的形式回傳
