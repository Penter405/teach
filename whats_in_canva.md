# Python 課程講義大綱 (Pages 1 - 41)

## 目錄與導覽頁 (Page 2)
![Image: Page 2.png]
- **what is code**
- **怎麼理解題目**
- **Python介紹**
- **Python課程**(這裡面有很多子章節)

---

## 1. What is code (Page 3 - 4)
![Image: Page 3.png]
- **執行程式的流程**：input資料 → 處理資料 → output資料。
- 舉例說明條件判斷與輸出（如：按下 F 進入載具、輸入名字並印出）。

![Image: Page 4.png]
- **核心概念**：程式 = 做很多有關資料的事情。

---

## 2. 怎麼理解題目 (Page 5)
![Image: Page 5.png]
- **拆解問題**：將複雜要求拆解成具體動作（例如：寫出 10 個 "hi"，就是「有一件事要做 10 次」）。
- **資料儲存與分析**：面對大量輸入（如：輸入 10 個 int 找最大值），需要一個地方放很多東西，而 `list` 是一個好地方。

---

## 3. Python 介紹 (Page 6 - 15)
![Image: Page 6.png]
本章節涵蓋三大主題：用直譯器、物件導向、反射 (Reflection)。

### 3.1 用直譯器 (Page 7)
![Image: Page 7.png]
- **直譯器 (Python)**：從頭看、從頭寫（一行行執行）。
- **編譯器 (如 C 語言)**：先看過一遍，再從某個地方（如 `main()`）開始執行。

### 3.2 物件導向 (Page 8 - 12)
![Image: Page 8.png]
- **Class 與 Object**：初始化一個 class（如「人類」），將其放入變數中，該變數就稱為 object（物件）。變數本身叫做 variable。

![Image: Page 9.png]
- **內容設定**：Class 內部可以設定 Property（屬性）與 Method（方法）。

![Image: Page 10.png]
- **`__init__` 方法**：直譯器會自動幫你執行一次，通常用來設定初始的屬性（如：身高、攻擊力、血量）。

![Image: Page 11.png]
- **`self` 概念應用**：以 `class dog()` 為例，`self` 代表物件本身。建立物件 `Lucky=dog()` 後，各方法的 `self` 就相當於 `Lucky`，藉此設定屬性（如 `Lucky.hp`）。

![Image: Page 12.png]
- **模組匯入**：以 `import math` 為例的說明。

### 3.3 反射 (Reflection) (Page 13 - 15)
![Image: Page 13.png]
- **核心概念**：反射 = 自省 (Introspection) + 動態操作。

![Image: Page 14.png]
- **自省**：檢查物件的屬性或 function 的用法（包含：`dir()`, `help()`, `type()`）。

![Image: Page 15.png]
- **動態操作**：
  - `getattr()`：檢查屬性是否存在並取得，若是方法還能呼叫。
  - `setattr()`：檢查並動態新增/修改屬性。
  - `delattr()`：檢查並動態刪除屬性。

---

## 4. Python 課程子章節 (Page 16 - 41)
![Image: Page 16.png]
課程流程：收集資料 → 儲存資料 → 處理資料 → 刪除沒用的資料 → 寫出有用的資料 → 變數與資料的關係。

![Image: Page 17.png]
- 在處理資料之前，我們需要讓電腦「得知資料」（例如：想刷題需要先拿到題目）。

### 4.1 收集資料 (Page 18 - 21)
![Image: Page 18.png]
- CPU 只 care **RAM 裡面的資料**，CPU 看了資料之後才能處理。

![Image: Page 19.png]
- 有很多方法能把資料放到 RAM。

![Image: Page 20.png]
- 在 C 語言中，RAM 空間分為 fixed space（預設，上手 easy）與 variable space（上手 hard）。

![Image: Page 21.png]
- 在 Python 中，資料被寫成 class，在判斷是否回收時會做很多吃 CPU 的分析（Garbage Collection），很多事都叫 CPU 幫你做。

### 4.2 儲存資料 (Page 22 - 34)
![Image: Page 22.png]
- **變數 (Variable)**：資料放入 RAM 後需建立變數並 pointer 到資料的 RAM address，否則會被當作垃圾回收，程式再也找不到資料。

  ![Image: Page 23.png]
  ![Image: Page 24.png]
  ![Image: Page 25.png]
  - CPU 會在 RAM 找空間，把值轉成 binary（0和1）寫入。變數存的是 RAM address，想要資料要去 RAM 看一堆 binary code。

  ![Image: Page 26.png]
  ![Image: Page 27.png]
  - **Immutable object (不可變物件)**：裡面的資料不能被修改 (Data const)。若要改變變數的資料，只能換一個家 (指向另一個 object)。

  ![Image: Page 28.png]
  ![Image: Page 29.png]
  - **變數作用域**：在函式中若要修改外部變數，可使用 `global` 或 `nonlocal` 讓 code 知道你想對哪個變數做事。

  ![Image: Page 30.png]
  ![Image: Page 31.png]
  - **Mutable object (可變物件)**：可以改變裡面的資料、把 object 變大或變小。
    - **搬出去住 (Coped)**：只影響某個 variable。
    - **改裝房子 (Reference / in-place)**：會影響所有指向這個 object 的 variable。

  ![Image: Page 32.png]
  - 對於 mutable object，可能會是 coped 或 reference，可用 `id()` function 來檢查。

  ![Image: Page 33.png]
  - **Immutable 類型範例**：`int`, `float`, `complex`, `bool`, `str`, `tuple`, `frozenset`, `bytes`。

  ![Image: Page 34.png]
  - **Mutable 類型範例**：`list`, `set`, `dict`。

### 4.3 處理資料：程式結構 (Page 35 - 41)
![Image: Page 35.png]
![Image: Page 36.png]
- **C 語言的結構**：
  - 單行結構：結尾寫下 `;`。
  - 區塊結構：受控制部分會用 `{ }` 包起來。

![Image: Page 37.png]
![Image: Page 38.png]
- 區塊結構分為「結構控制」與「受結構控制」兩部分。

![Image: Page 39.png]
- **Python 的結構**：
  - 單行結構：利用 **換行** 達成。
  - 區塊結構：利用 **縮排** 達成（不使用大括號）。

![Image: Page 40.png]
![Image: Page 41.png]
- 單行結構與相關程式碼範例展示。