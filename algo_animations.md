# 動畫清單

所有動畫都在 `web_src/src/animations/<編號>.tsx`。動畫系統的說明見 [ANIMATIONS.md](ANIMATIONS.md)。

- **概念**（1 ～ 27）：手寫的概念動畫，沒有 `results`。
- **硬體**（28 ～ 37）：CPU / DRAM / 螢幕，熟悉語法模組。
- **演算法**（38 之後）：由 `scripts/animation_tracer` 執行真的程式產生，一步 = 一個動作。要改程式或例子，改 `specs.py` 再跑 `run.py`。

## 概念動畫

| # | 在哪一課 | 內容 | 步數 |
|---|---|---|---|
| 1 | What is code › Input → Process → Output | 鍵盤 F → 程式判斷 → 螢幕顯示「進入車輛」 | 3 |
| 2 | 怎麼理解題目 › 拆解問題的思維 | 將複雜問題逐步拆解為可執行的子任務 | 4 |
| 3 | Python 介紹 › 直譯器 vs 編譯器 | 直譯器逐行執行程式碼的過程 | 4 |
| 4 | Python 介紹 › Class、Object 與萬物皆物件 | 從 class 到 object，再到 data / function 一起進入物件世界 | 4 |
| 5 | Python 介紹 › Property、Method 與內建 Class | 內建 class：`int` 與 `str` 不是魔法，而是已經寫好的 class | 4 |
| 6 | Python 介紹 › __init__ 與 self | self 如何綁定到具體的物件實例 | 4 |
| 7 | Python 介紹 › 反射 — 自省 | 使用 dir()、help()、type() 檢查物件資訊 | 4 |
| 8 | Computer Science in Coding Steps › 收集資料 | 五階段資料處理管線 | 5 |
| 9 | Computer Science in Coding Steps › 收集資料 | Python 垃圾回收機制：自動掃描並回收無用物件 | 4 |
| 10 | Computer Science in Coding Steps › 儲存與刪除資料 | 變數 → 記憶體位址 → 值 的指向關係 | 4 |
| 11 | Computer Science in Coding Steps › 儲存與刪除資料<br>Computer Science in Coding Steps › 變數與資料的關係 | 不可變物件：變數改值 = 搬家（指向新物件） | 4 |
| 12 | Computer Science in Coding Steps › 儲存與刪除資料<br>Computer Science in Coding Steps › 變數與資料的關係 | Copy（搬出去住）vs Reference（改裝房子） | 5 |
| 13 | Computer Science in Coding Steps › 處理資料：程式結構 | C 語言 {} 結構 vs Python 縮排結構的對照 | 4 |
| 14 | 課程先修概念 › RAM 裡發生了什麼 — House Analogy | 🏠 House = Variable Name, 🧍 Guy = Value, 📍 Address Sign = RAM Address | 4 |
| 15 | 課程先修概念 › Immutable vs Mutable（用 House Analogy 解釋） | Immutable：guy 不能變 → 只好搬到新 house | 4 |
| 16 | 課程先修概念 › Immutable vs Mutable（用 House Analogy 解釋） | Mutable：可以直接改 guy，house 不用換 | 4 |
| 17 | 語法 › 從生活中發現 Code | 從自然語言到程式語法的對應 | 4 |
| 18 | 語法 › 動詞組合技 | x = 2 的語法解析與記憶體變化 | 4 |
| 19 | 語法 › 動詞組合技 | 3 + 5 的執行與 Return | 3 |
| 20 | 語法 › 動詞組合技 | x = 3 + 5 的完整執行過程 | 4 |
| 21 | 語法 › 動詞組合技 | len("ABC") 的語法與 Return | 3 |
| 22 | 語法 › 動詞組合技 | print(3) 的執行過程 | 4 |
| 23 | 語法 › 動詞組合技 | print(len("ABC")) 的由內而外執行 | 4 |
| 24 | 語法 › 動詞組合技 | 'abc'.upper() 的語法與 Return | 3 |
| 25 | 語法 › 動詞組合技 | '-'.join(['a', 'b']) 的語法與 Return | 3 |
| 26 | 語法 › 動詞組合技 | ('-'.join(['a', 'b'])).upper() 的連續技能發動 | 3 |
| 27 | Dynamic programming › Longest common subsequence | LCS 最長公共子序列 DP 視覺化 | 6 |

## 硬體動畫

| # | 在哪一課 | 內容 | 步數 |
|---|---|---|---|
| 28 | 熟悉語法 › Lesson 1：輸入與輸出 | ⌨️ 鍵盤 → buffer → DRAM → CPU → 螢幕：age = int(input()) 由內而外 | 9 |
| 29 | 熟悉語法 › Lesson 2：運算子 | 🧮 ALU 的工作日常：x = 3 + 5 - 3 與 ok = x > 4 and x % 2 == 1 | 9 |
| 30 | 熟悉語法 › Lesson 3：選擇結構 | 🔀 Program Counter 跳躍：巢狀 if 在硬體裡就是「條件跳轉」 | 8 |
| 31 | 熟悉語法 › Lesson 4：迴圈 | 🔁 迴圈 = PC 往回跳：for 裡面包著 if / continue | 21 |
| 32 | 熟悉語法 › Lesson 5：函式 | 📚 Call Stack：result = double(add(1, 2)) 由內而外 | 12 |
| 33 | 熟悉語法 › Lesson 6：字串 Method | 🔤 字串在 DRAM 裡是一排連續的 bytes：print("hello"[1:4].upper()) | 4 |
| 34 | 熟悉語法 › Lesson 7：List Method | 📦 List 是一排指標格子：append、搬家、insert、pop 的成本 | 8 |
| 35 | 熟悉語法 › Lesson 8：Dictionary Method | #️⃣ Dictionary = Hash Table：print(scores.get("amy", 0) + 10) | 6 |
| 36 | 熟悉語法 › Lesson 9：Set Method | 🧩 Set = 只有 key 的 Hash Table：print(len(a & {2, 3, 4})) | 8 |
| 37 | 熟悉語法 › Lesson 10：綜合 Coding | 🖥️ 整台機器一起動：dict 查表 + 迴圈 + call stack + ALU + 螢幕 | 19 |

## 演算法動畫

| # | 在哪一課 | 內容 | 步數 |
|---|---|---|---|
| 38 | math › 質數 (Prime) | 試除法：is_prime(91)，只試到 √n | 54 |
| 39 | math › 質數 (Prime) | 埃氏篩：sieve(20)，從 p² 開始劃掉倍數 | 66 |
| 41 | binary search › 二分搜尋：最左與最右 | 二分搜尋：在 [1,3,4,4,4,7,9,12] 找最左邊的 4 | 39 |
| 44 | binary search › 二分答案 | 二分答案：piles = [3,6,7,11]，8 小時內吃完的最小速度 | 46 |
| 54 | data sturcture(data type that not built in) › heap 優先佇列 | heap：push 5, 3, 8, 1，每次往上換（上浮） | 82 |
| 55 | data sturcture(data type that not built in) › 單調堆疊與單調佇列 | 單調堆疊：[2,1,5,3,6,4] 的下一個更大元素 | 69 |
| 56 | data sturcture(data type that not built in) › 單調堆疊與單調佇列 | 單調佇列：[1,3,-1,-3,5,3]，k = 3 的視窗最大值 | 119 |
| 57 | data sturcture(data type that not built in) › union_find 並查集 | 並查集：union 與 find（路徑壓縮） | 99 |
| 59 | recursion › 遞迴基本 | 遞迴：fact(4) 的 call stack 堆高再回傳 | 25 |
| 60 | math › GCD 與快速冪 | 快速冪：fast_pow(2, 10)，10 → 5 → 2 → 1 → 0 | 49 |
| 61 | bit › bit 位元 | bitmask：mask = 5 (101₂) 代表選哪些數 | 24 |
| 62 | recursion › backtracking 回溯 | 回溯：4 皇后（ok(r, c) = 這格安不安全） | 158 |
| 65 | Dynamic programming › DP introduction | 記憶化：fib(5) 同樣的 argument 只算一次 | 74 |
| 66 | Dynamic programming › 1d DP | 1D DP：爬樓梯，dp[i] = dp[i-1] + dp[i-2] | 47 |
| 67 | Dynamic programming › bag 0/1 | 0/1 背包：容量 3，物品 (重 1, 值 6)、(重 2, 值 10) | 121 |
| 68 | Dynamic programming › bag 0/n (free amount) | 無限背包：硬幣 {1, 3, 4} 湊 6 最少幾枚 | 106 |
| 70 | Dynamic programming › longest increasing subsequence | LIS：memo + 二分搜尋（bisect_left 找第一個 ≥ x 的位置） | 62 |
| 71 | Dynamic programming › splited math | 區間 DP：石頭合併 [3, 4, 5]，按區間長度填表 | 91 |
| 73 | data sturcture(data type that not built in) › Fenwick tree (binary indexed tree) | Fenwick tree：查詢往下跳 i -= i&-i，更新往上跳 i += i&-i | 69 |
| 76 | graph 演算法 › BFS 與 DFS | BFS：用 queue 一圈一圈往外走 | 106 |
| 77 | graph 演算法 › BFS 與 DFS | DFS：一條路走到底，沒路了再退回 | 90 |
| 78 | Tree algorithm › tree search 樹的走訪 | 前序走訪：node → left → right（-1 = 沒有子節點） | 75 |
| 79 | graph 演算法 › AOV 拓樸排序 | 拓樸排序（Kahn）：入度變 0 就可以做 | 126 |
| 80 | graph 演算法 › 二分圖 (bipartite) | 二分圖判定：BFS 塗兩種顏色 | 93 |
| 81 | Tree algorithm › 樹的直徑 | 樹的直徑：兩次 BFS（farthest = BFS 找最遠的點） | 7 |
| 82 | Dynamic programming › cycle DP | 環 DP：4 → 3 → 2 → 1 → 2，先找環再往回填答案 | 70 |
| 83 | graph 演算法 › 兩點間最短路徑 Dijkstra | Dijkstra：每次確定最近的點，再鬆弛它的鄰居 | 123 |
| 86 | graph 演算法 › min span tree (Prim or Kruskal) | Kruskal：邊由短到長，會形成環的跳過（find = 找 root） | 50 |
| 87 | graph 演算法 › min span tree (Prim or Kruskal) | Prim：從 A 開始長出去，每次挑最便宜的邊 | 104 |
| 90 | math › 四捨五入 (Decimal) | 捨入規則：2.5 和 2.675 要往哪邊走 | 18 |
| 91 | math › GCD 與快速冪 | 輾轉相除：gcd(48, 18)，用正方形切長方形 | 15 |
| 92 | data sturcture(data type that not built in) › binary tree 二元樹 | 二元樹 ↔ list：index i 的子節點是 2i+1、2i+2 | 16 |

## 還沒有動畫的演算法

`algorithm_tree.py` 裡這些演算法還沒有對應的課和動畫：線性搜尋、插值搜尋、雜湊查找、各種排序（氣泡、插入、合併、快速、堆積、計數）、座標壓縮、雙指標、滑動視窗、Shunting-yard、分支限界、貪婪、前綴和、線段樹、莫隊（錯題本有一課）、Bellman-Ford、Floyd-Warshall、KMP、字典樹。
