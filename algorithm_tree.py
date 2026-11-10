"""
演算法樹 (Algorithm Tree)

思考流程（拆解問題）：
  1 真的需要優化嗎 -> 2 了解資料 -> 3 問題要什麼 -> 4 演算法 -> 得到了什麼 -> 繼續或解決

  判斷樹的每個節點是一個問題（是非題／選擇題），答案互斥，
  所以一個問題只會走出唯一一條路徑。同一個演算法可以出現在不同的葉子。

  ask(..., stage) : 建立問題節點（"yesno" 是非題 / "choice" 選擇題；stage = 屬於第幾步）
  yes/no/opt(...) : 答案 -> 下一個問題或演算法
  algorithm.child : (收穫 gain,   具體得到了什麼)
  gain.child      : (終點 outcome, 已解決 / 遇到新問題)
  algorithm.next  : (演算法,       遇到新限制時可以繼續往哪裡走)

解題流程（網頁上的互動步驟分頁）的選項與比對條件在檔案後段的 WIZARD_GROUPS 與 RULES。
Python 沒有內建、要自己寫的資料結構（樹狀陣列、線段樹…）在 CUSTOM_DS，哪些演算法用到它們在 USES_DS。

修改後執行 `python algorithm_tree.py`，會重新產生 web_src/src/algoTreeData.ts
"""


class Node:
    registry = []         # 所有建立過的節點：用來檢查每個演算法都能在判斷樹與解題流程中走到

    def __init__(self, name, category="", time="", space="", ds="", desc=""):
        Node.registry.append(self)
        self.name = name
        self.category = category
        self.time = time
        self.space = space
        self.ds = ds
        self.desc = desc      # 說明（特性的意思 / 演算法何時使用 / 收穫的意義）
        self.child = []       # [(Node, reason)]
        self.next = []        # [(Node, reason)]  遇到新限制時繼續的方向


# ════════════════════════════════════════════
# Layer 0 ── 問題發現 (Root)
# ════════════════════════════════════════════
root = Node("問題發現 (Problem Discovery)", "root",
            desc="先觀察問題本身有什麼特性，再決定要用哪個演算法。")


# ════════════════════════════════════════════
# Layer 2 ── 可用的演算法 (Algorithms)
# desc = 什麼時候適合使用
# ════════════════════════════════════════════

# Searching
linear = Node("線性搜尋 (Linear Search)", "搜尋", "O(n)", "O(1)", "Array",
"需要在未排序的集合中尋找特定元素。\n"
"不需要額外的資料結構或前處理。")
binary = Node("二分搜尋 (Binary Search)", "搜尋", "O(log n)", "O(1)", "Sorted Array",
"資料已經排序，且支援隨機存取。\n"
"可以每次排除一半的搜尋範圍。")
hash_lookup = Node("雜湊查找 (Hash Lookup)", "搜尋", "O(1) expected", "O(n)", "Hash Set / Hash Map",
"需要大量精確查找。\n"
"允許使用額外記憶體建立索引。\n"
"Hash 操作具有良好的預期效能。")
interpolation = Node("插值搜尋 (Interpolation Search)", "搜尋", "O(log log n) average", "O(1)", "Sorted Array",
"資料已經排序。\n"
"數值分布近似均勻。\n"
"可以根據搜尋值估算可能的位置。")

# Sorting
bubble = Node("氣泡排序 (Bubble Sort)", "排序", "O(n^2)", "O(1)", "Array",
"資料量小。\n"
"需要簡單的原地排序。\n"
"可以接受 O(n²) 的時間複雜度。")
insertion = Node("插入排序 (Insertion Sort)", "排序", "O(n^2)", "O(1)", "Array",
"資料量小或資料接近排序完成。\n"
"需要利用已排序部分減少移動次數。")
merge = Node("合併排序 (Merge Sort)", "排序", "O(n log n)", "O(n)", "Array",
"需要穩定排序。\n"
"需要保證最壞情況為 O(n log n)。\n"
"允許使用 O(n) 額外記憶體。")
quick = Node("快速排序 (Quick Sort)", "排序", "O(n log n) average", "O(log n) average", "Array",
"重視平均情況下的排序效能。\n"
"可以接受 O(n²) 的最壞情況。")
heap_sort = Node("堆積排序 (Heap Sort)", "排序", "O(n log n)", "O(1)", "Heap",
"需要保證 O(n log n) 的最壞時間。\n"
"希望額外空間維持 O(1)。")
counting = Node("計數排序 (Counting Sort)", "排序", "O(n + k)", "O(k)", "Array",
"資料是整數鍵值。\n"
"鍵值範圍 k 相對於資料量 n 足夠小。\n"
"可以利用計數取代比較排序。")

# Two Pointers / Sliding Window
two_pointers = Node("雙指標 (Two Pointers)", "陣列", "O(n)", "O(1)", "Array",
"資料已排序或可以先排序。\n"
"指標移動具有單調性。\n"
"可以透過移動指標排除不必要的比較。")
sliding = Node("滑動視窗 (Sliding Window)", "陣列", "O(n)", "O(1)", "Array / Deque",
"題目需要處理連續區間。\n"
"新增或移除區間元素時，可以增量更新結果。\n"
"不需要每次重新計算整個區間。")

# Prefix Sum / Range Query
prefix = Node("前綴和 (Prefix Sum)", "區間查詢", "O(n) build, O(1) query", "O(n)", "Array",
"需要大量查詢連續區間總和。\n"
"原始陣列不會被修改。\n"
"可以接受 O(n) 的前處理成本。")
fenwick = Node("樹狀陣列 (Fenwick Tree)", "區間查詢", "O(log n) update/query", "O(n)", "Binary Indexed Tree",
"需要動態修改單一位置的數值。\n"
"同時需要前綴和或區間和查詢。\n"
"更新與查詢都希望達到 O(log n)。")
segment = Node("線段樹 (Segment Tree)", "區間查詢", "O(log n) update/query", "O(n)", "Tree",
"需要動態區間查詢。\n"
"查詢操作可能是區間最小值、最大值或總和。\n"
"需要支援更一般化的區間操作。")

# Recursion / Dynamic Programming
recursion = Node("遞迴 (Recursion)", "遞迴", "Problem dependent", "O(depth)", "Call Stack",
"問題可以自然拆解成較小的子問題。\n"
"子問題之間具有遞迴關係。")
backtracking = Node("回溯 (Backtracking)", "搜尋", "Exponential worst case", "O(depth)", "Stack / Path",
"需要枚舉可能的候選解。\n"
"可以在部分候選解不符合條件時提前停止搜尋。")
memo = Node("動態規劃・記憶化 (DP: Memoization)", "動態規劃", "O(states + transitions)", "O(states)", "Hash Map / Array",
"動態規劃的 Top-down 寫法。\n"
"遞迴過程中會重複遇到相同狀態。\n"
"可以儲存已經計算過的結果。\n"
"避免重複計算相同子問題。")
tabulation = Node("動態規劃・表格化 (DP: Tabulation)", "動態規劃", "O(states + transitions)", "O(states)", "Array / Table",
"動態規劃的 Bottom-up 寫法。\n"
"子問題之間存在可計算的依賴順序。\n"
"可以按照依賴順序由小問題推導大問題。\n"
"不需要依賴遞迴呼叫堆疊。")
branch_bound = Node("分支限界 (Branch and Bound)", "最佳化", "Exponential worst case", "Problem dependent", "Priority Queue / Stack",
"需要尋找最佳解。\n"
"可以計算候選分支的上下界。\n"
"能夠排除不可能優於目前最佳解的分支。")

# Graph
bfs = Node("廣度優先搜尋 (BFS)", "圖論", "O(V + E)", "O(V)", "Queue",
"需要在無權圖中尋找最短路徑。\n"
"或需要按照距離層級遍歷圖形。")
dfs = Node("深度優先搜尋 (DFS)", "圖論", "O(V + E)", "O(V)", "Stack / Recursion",
"需要深入探索圖形。\n"
"需要判斷連通性、尋找環或進行拓樸相關操作。")
dijkstra = Node("Dijkstra", "最短路徑", "O((V + E) log V)", "O(V)", "Min Heap",
"需要尋找單一起點的最短路徑。\n"
"所有邊的權重都必須非負。\n"
"可以使用 Min Heap 快速取得目前距離最小的節點。")
bellman = Node("Bellman-Ford", "最短路徑", "O(VE)", "O(V)", "Array",
"需要尋找單一起點的最短路徑。\n"
"圖中可能存在負權重邊。\n"
"也可以用來偵測可達的負權重環。")
floyd = Node("Floyd-Warshall", "最短路徑", "O(V^3)", "O(V^2)", "2D Array",
"需要計算所有節點彼此之間的最短路徑。\n"
"節點數量足夠小，可以接受 O(V³) 的成本。")
kruskal = Node("Kruskal", "最小生成樹", "O(E log E)", "O(V)", "DSU",
"需要建立最小生成樹。\n"
"可以按照邊權重由小到大處理。\n"
"使用 DSU 判斷是否形成環。")
prim = Node("Prim", "最小生成樹", "O(E log V)", "O(V)", "Min Heap",
"需要建立最小生成樹。\n"
"可以逐步選擇連接目前生成樹的最小權重邊。\n"
"使用 Min Heap 加速選擇。")

# Data Structures
heap = Node("堆積 / 優先佇列 (Heap / Priority Queue)", "資料結構", "O(log n) insert/pop", "O(n)", "Heap",
"需要反覆取得目前的最大值或最小值。\n"
"需要動態插入及移除元素。")
dsu = Node("並查集 (Disjoint Set Union)", "資料結構", "O(alpha(n)) amortized", "O(n)", "Parent Array",
"需要維護多個互不相交的集合。\n"
"需要快速合併集合及判斷兩個元素是否屬於同一集合。")
monotonic_stack = Node("單調堆疊 (Monotonic Stack)", "資料結構", "O(n) total", "O(n)", "Stack",
"需要尋找每個元素左側或右側最近的較大／較小元素。\n"
"可以利用單調性排除不再需要的元素。")
monotonic_queue = Node("單調佇列 (Monotonic Queue)", "資料結構", "O(n) total", "O(n)", "Deque",
"需要持續查詢滑動視窗中的最大值或最小值。\n"
"可以利用單調性移除不可能成為答案的元素。")

# 補充：常見但先前缺少的演算法
brute = Node("暴力枚舉 (Brute Force)", "最佳化", "Exponential / O(n^k)", "Problem dependent", "Loops / Recursion",
"列出所有可能的答案，逐一檢查。\n"
"一定正確，可以當作驗證更快解法的基準。")
divide_conquer = Node("分治法 (Divide and Conquer)", "遞迴", "Often O(n log n)", "O(log n) ~ O(n)", "Recursion",
"問題可以切成互不重疊、形式相同的子問題。\n"
"子問題各自解完後，可以有效率地合併答案。")
greedy = Node("貪婪演算法 (Greedy)", "最佳化", "Often O(n log n)", "O(1) ~ O(n)", "Sort / Heap",
"每一步都選「目前看起來最好」的選擇。\n"
"可以證明局部最佳選擇不會讓全域答案變差。")
binary_answer = Node("二分答案 (Binary Search on Answer)", "搜尋", "O(log R × check)", "O(1)", "—",
"直接求答案很難，但「給定答案 x，檢查是否可行」很容易。\n"
"可行性隨 x 單調變化（x 可行 → 更大的 x 也可行）。")
topo = Node("拓樸排序 (Topological Sort)", "圖論", "O(V + E)", "O(V)", "Queue / In-degree",
"事情之間有先後依賴（A 要在 B 之前）。\n"
"依賴關係沒有環（有向無環圖 DAG）。")
kmp = Node("KMP 字串比對 (KMP)", "字串", "O(n + m)", "O(m)", "Failure Function",
"需要在長文字中找出某個模式字串。\n"
"暴力比對 O(nm) 太慢，失配時不想從頭再比。")
trie = Node("字典樹 (Trie)", "字串", "O(L) per op", "O(total chars)", "Tree",
"有大量字串需要查詢、或需要依照前綴搜尋。\n"
"許多字串共用相同的前綴。")

# 課程（docs/content/data.json）裡出現的其他演算法
trial_div = Node("試除法 (Trial Division)", "數學", "O(√n)", "O(1)", "—",
"判斷一個數是不是質數，或做質因數分解。\n"
"只要試到 √n：如果 n = a × b，a 和 b 至少有一個 ≤ √n。")
sieve = Node("埃氏篩 (Sieve of Eratosthenes)", "數學", "O(n log log n)", "O(n)", "Bool Array",
"要知道 1～n 之間所有的質數，或判斷很多個數。\n"
"從小到大，把每個質數的倍數都劃掉。")
rank_compress = Node("座標壓縮 (Coordinate Compression)", "排序", "O(n log n)", "O(n)", "Sort + Dict",
"需要知道每個元素「排第幾名」。\n"
"或數值很大、但只在乎大小順序：排序後用 dict 把數值換成名次。")
shunting = Node("運算式轉換 (Shunting-yard)", "資料結構", "O(n)", "O(n)", "Stack",
"把中序運算式轉成後序（或直接計算）。\n"
"用堆疊暫存運算子，依優先順序與括號決定何時輸出。")
mo = Node("莫隊演算法 (Mo's Algorithm)", "區間查詢", "O((n + q)√n)", "O(n)", "Sort + Counter",
"很多次區間查詢，而且可以離線（先讀完所有查詢）。\n"
"答案不能用前綴相減（例如區間內不同值的個數），\n"
"但加入／移除一個元素時，答案可以 O(1) 更新。")
knap01 = Node("0/1 背包 (0/1 Knapsack)", "動態規劃", "O(n·W)", "O(W)", "1D Array",
"每個物品最多選一次，容量有限，求最大價值。\n"
"dp[w] = 容量 w 時的最佳價值；容量要由大到小更新，才不會重複選。")
knap_unb = Node("無限背包 (Unbounded Knapsack)", "動態規劃", "O(n·W)", "O(W)", "1D Array",
"每個物品可以選任意多次（0/n）。\n"
"和 0/1 背包一樣，但容量由小到大更新，同一個物品可以重複使用。")
lcs = Node("最長共同子序列 (LCS)", "動態規劃", "O(n·m)", "O(n·m)", "2D Table",
"比較兩個序列，找最長的共同子序列（不必連續）。\n"
"dp[i][j] = 前 i 個與前 j 個的答案。")
lis = Node("最長遞增子序列 (LIS)", "動態規劃", "O(n log n)", "O(n)", "Array + Binary Search",
"找一個序列中最長的遞增子序列。\n"
"基本 DP 是 O(n²)；用「二分搜尋＋貪婪」維護每個長度的最小結尾，可以做到 O(n log n)。")
interval_dp = Node("分割／區間 DP (Interval DP)", "動態規劃", "O(n³)", "O(n²)", "2D Table",
"把序列切成幾段，或把相鄰的區間合併。\n"
"dp[l][r] = 區間 [l, r] 的最佳答案，由所有切點 k 組合而來。")
tree_traversal = Node("樹的走訪 (Tree Traversal)", "圖論", "O(n)", "O(h)", "Recursion / Stack",
"依照前序（node→left→right）、中序（left→node→right）或後序（left→right→node）拜訪每個節點。")
tree_diameter = Node("樹的直徑 (Tree Diameter)", "圖論", "O(n)", "O(n)", "BFS",
"樹上每個點的最遠距離。\n"
"最遠的點一定是直徑的一端：三次 BFS 找出直徑兩端，答案 = max(到兩端的距離)。")
func_graph = Node("找環＋記憶化 (Functional Graph)", "圖論", "O(n)", "O(n)", "Array",
"每個點只有一條出去的邊（例如每個人只寄給一個人）。\n"
"從任何點出發最後都會進入一個環：找出環，環外的點 = 1 + 下一個點的答案。")
bipartite = Node("二分圖判定 (Bipartite Check)", "圖論", "O(V + E)", "O(V)", "Queue + Color",
"能不能把點分成兩組，讓每條邊的兩端都在不同組。\n"
"用 BFS 著色：相鄰的點塗不同顏色，發現同色相鄰就不是二分圖。")


# ════════════════════════════════════════════
# Layer 1 ── 判斷樹 (Decision Tree)，依照「拆解問題」四個步驟
#
#   步驟 1  真的需要優化嗎？        暴力解跑得完 → 直接用暴力解
#   步驟 2  了解資料                形狀（常數／線性／關聯）→ 存取方式 → 資料特性
#   步驟 3  問題要什麼              要輸出什麼、查幾次、答案能否 O(1) 空間、問題結構
#   步驟 4  演算法（葉子）
#
# 每個節點是一個問題：
#   - 是非題 (yesno)：只有「是」「否」
#   - 選擇題 (choice)：選項彼此互斥，只會符合其中一個
# 所以同一個問題只會走出「唯一一條路徑」。
# 同一個演算法可以出現在不同的葉子（例如 DP 可以從「常數」或「線性」資料走到），
# 匯出時每個葉子都是獨立的節點。
# ════════════════════════════════════════════
ANSWERS = {}   # (id(question), id(child)) -> 答案文字（顯示在連線上）

def ask(name, desc, qtype, stage):
    q = Node(name, "問題", desc=desc)
    q.qtype = qtype            # "yesno" | "choice"
    q.stage = stage            # 1 / 2 / 3
    return q

def opt(q, answer, child, note=""):
    """q 的答案 answer 通往 child。note = 補充說明（顯示在面板）"""
    q.child.append((child, note or answer))
    ANSWERS[(id(q), id(child))] = answer

def yes(q, child, note=""):
    opt(q, "是", child, note)

def no(q, child, note=""):
    opt(q, "否", child, note)


# ════ 步驟 1：真的需要優化嗎？ ════
q_need = ask("暴力解跑得完嗎？ (Does brute force fit?)",
"用「解題流程」第 1 步算算看：資料量 n、暴力解的複雜度、語言速度、時間限制。\n"
"Python 大約每秒 10⁷ 次簡單運算。", "yesno", 1)
root.child.append((q_need, "先確定到底需不需要優化。"))
yes(q_need, brute, "跑得完就不需要優化：寫出正確的暴力解就完成了。")

# ════ 步驟 2：資料的形狀 ════
q_shape = ask("資料的形狀？ (Shape of the data?)",
"三個選項互斥：\n常數 = 單一值或固定大小（例如只給一個 n）；\n"
"線性 = 一串元素（陣列、字串、串列）；\n關聯 = 元素之間有關係（圖、樹、鍵值對應）。", "choice", 2)
no(q_need, q_shape, "暴力太慢，需要優化 → 先了解資料。")


def structure_subtree(parent, answer, note, dp_kinds=False):
    """「求一個最佳值／方法數」的問題結構判斷（常數資料與線性資料都會用到）"""
    q_greedy = ask("每步選最好就是最佳？ (Greedy choice provable?)",
    "能證明：每一步都選「目前看起來最好」的，最後就是全域最佳解。", "yesno", 3)
    opt(parent, answer, q_greedy, note)
    yes(q_greedy, greedy, "直接貪婪，通常排序後一次掃描。")
    q_overlap = ask("子問題會重複出現嗎？ (Overlapping subproblems?)",
    "拆解時，同一個「狀態」會被算很多次。", "yesno", 3)
    no(q_greedy, q_overlap, "貪婪不保證最佳（或找得到反例）。")
    q_o1 = ask("答案只依賴前幾個狀態？ (Only a few previous states?)",
    "例如 f(i) 只用到 f(i−1)、f(i−2)：答案可以只用 O(1) 空間，不需要儲存所有答案。", "yesno", 3)
    if dp_kinds:
        q_dp_kind = ask("是哪一種 DP？ (Which kind of DP?)",
        "常見的 DP 題型，五個選項互斥。都不像就選「一般狀態」。", "choice", 3)
        yes(q_overlap, q_dp_kind, "這就是動態規劃 (DP)：每個狀態只算一次。")
        q_knap_once = ask("每個物品最多選一次？ (Each item at most once?)",
        "是 = 0/1 背包；否 = 同一個物品可以選很多次（0/n）。", "yesno", 3)
        opt(q_dp_kind, "背包：選物品、容量有限", q_knap_once, "在容量限制下選物品，求最大價值或方法數。")
        yes(q_knap_once, knap01, "容量由大到小更新 dp，每個物品只會用到一次。")
        no(q_knap_once, knap_unb, "容量由小到大更新 dp，同一個物品可以重複用。")
        opt(q_dp_kind, "兩個序列的共同部分", lcs, "dp[i][j]：第一個序列前 i 個、第二個前 j 個。")
        opt(q_dp_kind, "最長遞增子序列", lis, "O(n²) DP，或二分搜尋＋貪婪 O(n log n)。")
        opt(q_dp_kind, "切成幾段／合併區間", interval_dp, "dp[l][r]：枚舉切點 k。")
        opt(q_dp_kind, "一般狀態", q_o1, "例如走樓梯、1D DP：自己定義狀態與轉移。")
    else:
        yes(q_overlap, q_o1, "這就是動態規劃 (DP)：每個狀態只算一次。")
    yes(q_o1, tabulation, "Bottom-up，只保留幾個變數（滾動陣列），空間 O(1)。")
    q_dp_order = ask("大部分狀態都要算，且順序好排？ (Fill the whole table?)",
    "幾乎所有狀態都會用到，而且能排出由小到大的計算順序。", "yesno", 3)
    no(q_o1, q_dp_order, "需要記住很多狀態。")
    yes(q_dp_order, tabulation, "Bottom-up：依序填表，沒有遞迴成本。")
    no(q_dp_order, memo, "Top-down：遞迴＋快取，只算需要的狀態。（狀態很多時注意 dict 成本）")
    q_bound = ask("能估計分支的上下界嗎？ (Bounds available?)",
    "對一個部分解，能算出「最好也只能到多少」。", "yesno", 3)
    no(q_overlap, q_bound, "子問題各自獨立。")
    yes(q_bound, branch_bound, "用界限剪掉不可能更好的分支。")
    no(q_bound, backtracking, "逐一嘗試所有選擇，不合法就退回（找最佳時要比較全部）。")


# ──── 2A. 常數資料 ────
q_c_goal = ask("要的答案是？ (Constant input: what answer?)",
"資料只有一個值或固定大小，重點在問題本身。五個選項互斥。", "choice", 3)
opt(q_shape, "常數", q_c_goal, "例如只給一個 n，或固定大小的盤面。")
opt(q_c_goal, "最小（大）可行答案", binary_answer, "能檢查「答案 x 可不可行」，且可行性隨 x 單調。")
structure_subtree(q_c_goal, "一個最佳值／方法數", "最大值、最小值、有幾種方法。")
opt(q_c_goal, "所有可行解", backtracking, "列出所有組合／排列：逐步選擇，不合法就退回。")
q_merge = ask("拆成多個獨立子問題再合併？ (Split & merge?)",
"切成兩個以上互不重疊的子問題，各自解完後合併。", "yesno", 3)
opt(q_c_goal, "由子問題組合出答案", q_merge, "答案可以由較小問題的答案算出。")
q_prime_many = ask("要判斷很多個數（一整個範圍）？ (Many numbers?)",
"例如「1～n 之間所有的質數」或很多筆查詢，而不是只判斷一個數。", "yesno", 3)
opt(q_c_goal, "質數／因數", q_prime_many, "判斷質數、質因數分解。")
yes(q_prime_many, sieve, "先篩一次，之後每次查詢 O(1)。")
no(q_prime_many, trial_div, "只有一個數：試除到 √n 就夠了。")
yes(q_merge, divide_conquer, "分治法：切、解、合併。")
no(q_merge, recursion, "一般遞迴：每次縮小一點。")

# ──── 2B. 線性資料 ────
q_access = ask("存取方式？ (How can you access it?)",
"兩個選項互斥：能不能用索引直接拿到第 i 個元素。", "choice", 2)
opt(q_shape, "線性", q_access, "一串元素：陣列、字串、串列。")

# 只能依序走過
q_seq_goal = ask("要輸出什麼？ (Sequential data: what output?)",
"只能從頭一個一個讀（串流、linked list、檔案）。三個選項互斥。", "choice", 3)
opt(q_access, "只能依序走過", q_seq_goal, "串流、linked list、檔案。")
opt(q_seq_goal, "找某個值", linear, "只能逐一比較。")
opt(q_seq_goal, "排序", merge, "合併排序只需要依序讀寫，適合 linked list。")
opt(q_seq_goal, "區間（子陣列）答案", sliding, "一邊讀一邊維護視窗，不必回頭。")

# 隨機存取
q_lin_goal = ask("要輸出什麼？ (Array: what output?)",
"依照「要輸出什麼」分類，選項彼此互斥。", "choice", 3)
opt(q_access, "隨機存取 O(1)", q_lin_goal, "可以用索引直接拿第 i 個元素（list、陣列、字串）。")

#   找某個值
q_sorted = ask("資料已經排序嗎？ (Already sorted?)", "資料由小到大（或大到小）排好。", "yesno", 2)
opt(q_lin_goal, "找某個值", q_sorted, "某個值在不在、在哪裡。")
q_uniform = ask("數值分布均勻嗎？ (Uniformly distributed?)", "已排序的數值大致平均分布。", "yesno", 2)
yes(q_sorted, q_uniform, "可以利用順序排除範圍。")
yes(q_uniform, interpolation, "由數值估算位置，平均 O(log log n)。")
no(q_uniform, binary, "每次排除一半，O(log n)。")
q_many = ask("要查很多次嗎？ (Many queries?)", "同一份資料要回答很多次查找。", "yesno", 3)
no(q_sorted, q_many, "無序資料。")
yes(q_many, hash_lookup, "先建 Hash Table（O(n) 空間），之後每次 O(1)。")
no(q_many, linear, "只查一次，不值得做前處理。")

#   排序
q_sort_int = ask("鍵值是範圍小的整數？ (Small integer keys?)",
"鍵值都是整數，而且範圍 k 不比資料量 n 大太多。", "yesno", 2)
opt(q_lin_goal, "排序", q_sort_int, "輸出排好序的資料。")
yes(q_sort_int, counting, "直接計數，O(n + k)。")
q_sort_state = ask("資料的狀況？ (Size / order of data?)", "三個選項互斥。", "choice", 2)
no(q_sort_int, q_sort_state, "需要比較排序。")
opt(q_sort_state, "幾乎已排好", insertion, "大部分元素已在正確位置，插入排序接近 O(n)。")
opt(q_sort_state, "很少且未排好", bubble, "資料量小，用最簡單的方法。")
q_sort_need = ask("最在意什麼？ (What matters most?)", "三個選項互斥：穩定、最壞保證＋省空間、平均速度。", "choice", 3)
opt(q_sort_state, "很多且未排好", q_sort_need, "需要 O(n log n) 的排序。")
opt(q_sort_need, "穩定", merge, "相同鍵值保持原本順序。")
opt(q_sort_need, "最壞保證＋O(1) 空間", heap_sort, "不能接受 O(n²)，也不能多用記憶體。")
opt(q_sort_need, "平均最快", quick, "平均 O(n log n)，常數小。")

#   區間
q_range = ask("區間要做什麼？ (Range: what is asked?)", "三個選項互斥。", "choice", 3)
opt(q_lin_goal, "區間（子陣列）答案", q_range, "答案和某一段連續的子陣列有關。")
opt(q_range, "找符合條件的子陣列", sliding, "最長／最短／個數，左右端點都只往前，O(1) 空間。")
opt(q_range, "固定視窗的最大／最小", monotonic_queue, "視窗往前滑，每次要視窗內的極值。")
q_update = ask("查詢之間資料會修改？ (Updates between queries?)", "多次區間查詢之間，陣列的值會不會被改。", "yesno", 2)
opt(q_range, "很多次區間查詢", q_update, "反覆問「[l, r] 的值是多少」。")
q_additive = ask("答案能用前綴相減嗎？ (Prefix-subtractable?)",
"像總和、個數可以用「前 r 個 − 前 l−1 個」算出；不同值的個數、眾數就不行。", "yesno", 3)
no(q_update, q_additive, "資料不變，可以先做前處理。")
yes(q_additive, prefix, "前綴和：O(n) 前處理，每次 O(1)。")
no(q_additive, mo, "離線排序查詢，移動兩個指標：O((n + q)√n)。")
q_sum_only = ask("只需要區間和嗎？ (Sum only?)", "只問總和，不問最小值／最大值等其他運算。", "yesno", 3)
yes(q_update, q_sum_only, "需要支援修改。")
yes(q_sum_only, fenwick, "樹狀陣列，程式最短。")
no(q_sum_only, segment, "需要 min / max 或區間修改 → 線段樹。")

#   其他輸出
opt(q_lin_goal, "反覆取最大／最小", heap, "資料不斷加入或移除，每次要目前的極值。")
opt(q_lin_goal, "最近的較大／較小", monotonic_stack, "對每個位置找左邊或右邊第一個更大（小）的元素。")
q_pair_sorted = ask("已排序或可以先排序？ (Sorted, or can sort?)",
"排序後不影響答案（例如只要找數值，不要原本的位置）。", "yesno", 2)
opt(q_lin_goal, "一對元素", q_pair_sorted, "找兩個（一組）元素滿足條件。")
yes(q_pair_sorted, two_pointers, "兩個指標往中間靠，O(n)，O(1) 空間。")
no(q_pair_sorted, hash_lookup, "邊走邊把看過的值放進 Hash：O(n) 時間、O(n) 空間。")
opt(q_lin_goal, "最小（大）可行答案", binary_answer, "能檢查「答案 x 可不可行」，且可行性隨 x 單調。")
opt(q_lin_goal, "字串比對", kmp, "在長度 n 的文字中找長度 m 的模式。")
opt(q_lin_goal, "前綴查詢", trie, "存很多字串，並依前綴查詢。")
opt(q_lin_goal, "每個元素的名次", rank_compress, "排序後用 dict 記下每個數值的名次。")
opt(q_lin_goal, "運算式轉換／計算", shunting, "中序轉後序、計算 + - * / 和括號。")
structure_subtree(q_lin_goal, "一個最佳值／方法數", "例如最長遞增子序列、背包、走樓梯。", dp_kinds=True)

# ──── 2C. 關聯資料 ────
q_rel = ask("是哪一種關係？ (What kind of relation?)",
"兩個選項互斥：點與點之間有邊（圖、樹），或鍵對應到值（dict）。", "choice", 2)
opt(q_shape, "關聯", q_rel, "元素之間有關係。")

q_kv = ask("要做什麼？ (Key-value: what to do?)", "三個選項互斥。", "choice", 3)
opt(q_rel, "鍵值對應", q_kv, "dict / map：一個鍵對應一個值。")
opt(q_kv, "依鍵查找", hash_lookup, "dict 本身就是雜湊表，平均 O(1)。")
opt(q_kv, "依前綴查找", trie, "鍵是字串，要依前綴找。")
opt(q_kv, "依鍵的大小找範圍", binary, "把鍵排序後二分搜尋範圍的起點與終點。")

q_graph = ask("要求什麼？ (Graph: what is asked?)", "圖的問題，依照「要輸出什麼」分類，選項彼此互斥。", "choice", 3)
opt(q_rel, "圖／樹", q_graph, "有點，也有點與點之間的邊（道路、關係、依賴）。")
q_sp_all = ask("要所有點對，且點很少？ (All pairs, small V?)",
"需要「每一對點」之間的最短距離，而且點數很少（約數百以內）。", "yesno", 3)
opt(q_graph, "最短路徑", q_sp_all, "求某些點之間的最短距離。")
yes(q_sp_all, floyd, "三層迴圈 O(V³)，一次求出所有點對。")
q_weight = ask("邊的權重是？ (Edge weights?)", "三個選項互斥：沒有權重、全部非負、有負數。", "choice", 2)
no(q_sp_all, q_weight, "只需要從一個起點出發。")
opt(q_weight, "沒有權重", bfs, "每條邊成本相同，第一次走到就是最短。")
opt(q_weight, "全部 ≥ 0", dijkstra, "非負權重，每次確定距離最小的點。")
opt(q_weight, "有負數", bellman, "有負權重，需要 V−1 輪鬆弛，也能偵測負環。")
q_dense = ask("圖很稠密嗎？ (Dense graph, E ≈ V²?)", "邊數接近 V²（幾乎每兩點之間都有邊）。", "yesno", 2)
opt(q_graph, "最小生成樹", q_dense, "用最小總成本把所有點連起來。")
yes(q_dense, prim, "從一點往外長，配合 Min Heap。")
no(q_dense, kruskal, "邊不多：把邊排序，用 DSU 避免成環。")
q_cycle = ask("依賴關係有環嗎？ (Do dependencies form a cycle?)", "A→B→…→A：有環就排不出合法順序。", "yesno", 2)
opt(q_graph, "排出先後順序", q_cycle, "事情之間有依賴（A 要在 B 之前）。")
no(q_cycle, topo, "DAG：反覆取出入度為 0 的點。")
yes(q_cycle, dfs, "先用 DFS 找出環（無法排序，需要回報或拆環）。")
opt(q_graph, "動態判斷連通", dsu, "邊會一直加入，並且反覆問「兩點是否連通」。")
opt(q_graph, "走訪／連通塊／找環", dfs, "只需要走過整張圖，找連通塊、環或路徑。")
opt(q_graph, "前序／中序／後序", tree_traversal, "依固定順序拜訪樹的每個節點。")
opt(q_graph, "分成兩組", bipartite, "相鄰的點要在不同組：BFS 著色。")
q_far = ask("是哪一種圖？ (What kind of graph?)",
"兩個選項互斥：樹（沒有環、n−1 條邊），或每個點只有一條出去的邊。", "choice", 2)
opt(q_graph, "每個點能走多遠", q_far, "每個點的最遠距離，或從每個點出發能走到幾個點。")
opt(q_far, "一棵樹", tree_diameter, "最遠的點一定是直徑的一端。")
opt(q_far, "每點只有一條出去的邊", func_graph, "一定會走進環：找環＋記憶化。")


# ════════════════════════════════════════════
# Layer 3 ── 得到了什麼 (What You Gain)
# ════════════════════════════════════════════
def gain(name, desc):
    return Node(name, "收穫", desc=desc)

g_baseline = gain("正確的暴力解 (Correct Baseline)",
"一定正確，但通常是 O(n) 或 O(n²)。\n可以當作驗證更快解法的基準。")
g_log = gain("O(log n) 搜尋 (Logarithmic Search)",
"每一步排除一大部分，搜尋次數變成 log n。")
g_lookup = gain("O(1) 查找 (Constant-time Lookup)",
"用額外空間建立索引，查詢不再需要掃描。")
g_sorted = gain("有序的資料 (Sorted Data)",
"資料排好序之後，就多了「有序」這個特性，\n可以接著使用二分搜尋、雙指標等方法。")
g_linear = gain("O(n²) → O(n) 一次掃描 (Single Pass)",
"每個元素只進出一次，消除巢狀迴圈。")
g_range = gain("快速區間查詢 (Fast Range Queries)",
"區間查詢從 O(n) 降到 O(1) 或 O(log n)。")
g_extreme = gain("O(log n) 取得極值 (Fast Min / Max)",
"不必每次掃描全部元素找最大／最小值。")
g_structure = gain("清楚的子問題結構 (Recursive Structure)",
"寫出遞迴關係式，看清楚狀態與轉移。\n接著可以檢查是否有重複子問題。")
g_dp = gain("指數 → 多項式 (Exponential → Polynomial)",
"每個狀態只計算一次，時間 = 狀態數 × 轉移數。")
g_search = gain("可行解／最佳解 (All or Best Solutions)",
"系統化地找到所有可行解或最佳解，\n並透過剪枝減少搜尋量。")
g_shortest = gain("最短路徑 (Shortest Paths)",
"得到起點到各點（或所有點對）的最短距離。")
g_conn = gain("連通性與圖的結構 (Connectivity)",
"知道哪些點相連、是否有環、連通塊有幾個。")
g_mst = gain("最小生成樹 (Minimum Spanning Tree)",
"用最小總成本把所有點連起來。")
g_order = gain("合法的處理順序 (Valid Order)",
"得到一個滿足所有依賴關係的順序，或發現依賴中有環。")
g_prime = gain("質數與因數 (Primes & Factors)",
"不必對每個數從頭試除，判斷質數變快。")
g_text = gain("線性時間字串處理 (Linear-time Strings)",
"字串比對或查詢不再需要 O(nm) 的暴力比較。")

def gives(algo, g, reason):
    algo.child.append((g, reason))

gives(linear, g_baseline, "O(n) 一定找得到（如果存在）。")
gives(bubble, g_baseline, "O(n²) 但保證排好序，適合當作基準。")
gives(bubble, g_sorted, "得到有序資料。")
gives(insertion, g_sorted, "接近有序時 O(n) 就完成排序。")
gives(merge, g_sorted, "穩定排序，保證 O(n log n)。")
gives(quick, g_sorted, "平均 O(n log n)，常數小。")
gives(heap_sort, g_sorted, "保證 O(n log n)，額外空間 O(1)。")
gives(counting, g_sorted, "O(n + k)，突破比較排序的 O(n log n) 下界。")
gives(binary, g_log, "O(n) → O(log n)。")
gives(interpolation, g_log, "平均 O(log log n)，比二分更快。")
gives(hash_lookup, g_lookup, "O(n) → O(1) 預期時間。")
gives(two_pointers, g_linear, "兩層迴圈 O(n²) → O(n)。")
gives(sliding, g_linear, "每個區間重算 O(nk) → O(n)。")
gives(monotonic_stack, g_linear, "找下一個更大元素 O(n²) → O(n)。")
gives(monotonic_queue, g_linear, "視窗極值 O(nk) → O(n)。")
gives(prefix, g_range, "前處理 O(n)，每次查詢 O(1)。")
gives(fenwick, g_range, "修改與查詢都是 O(log n)。")
gives(segment, g_range, "支援 min / max / sum 與區間修改，O(log n)。")
gives(heap, g_extreme, "取極值 O(1)，插入／刪除 O(log n)。")
gives(recursion, g_structure, "寫出遞迴式與終止條件。")
gives(memo, g_dp, "Top-down：只算需要的狀態。")
gives(tabulation, g_dp, "Bottom-up：沒有遞迴深度限制，常數更小。")
gives(backtracking, g_search, "列出所有可行解，提早剪掉不合法的分支。")
gives(branch_bound, g_search, "用界限剪枝，更快找到最佳解。")
gives(bfs, g_shortest, "無權圖最短路徑 O(V + E)。")
gives(bfs, g_conn, "按層走訪所有可到達的點。")
gives(dfs, g_conn, "連通塊、環、拓樸排序。")
gives(dsu, g_conn, "動態維護連通性，近乎 O(1)。")
gives(dijkstra, g_shortest, "非負權重單源最短路徑。")
gives(bellman, g_shortest, "可處理負權重，並偵測負環。")
gives(floyd, g_shortest, "所有點對最短路徑。")
gives(kruskal, g_mst, "O(E log E) 得到最小生成樹。")
gives(prim, g_mst, "稠密圖中更有效率。")
gives(brute, g_baseline, "一定正確，但通常是指數時間。")
gives(divide_conquer, g_structure, "子問題各自獨立，合併後常見 O(n log n)。")
gives(greedy, g_search, "若可證明正確，通常比 DP 更快、更簡單。")
gives(binary_answer, g_log, "只需要 O(log R) 次 check(x)。")
gives(topo, g_order, "O(V + E) 得到順序，同時能偵測環。")
gives(kmp, g_text, "O(nm) → O(n + m)。")
gives(trie, g_text, "每次查詢 O(L)，與字串總數無關。")
gives(trial_div, g_prime, "O(n) → O(√n)。")
gives(sieve, g_prime, "篩一次 O(n log log n)，之後每次查詢 O(1)。")
gives(rank_compress, g_sorted, "大數值換成 1～n 的名次，可以直接當陣列索引。")
gives(shunting, g_order, "得到可以直接由左到右計算的後序式。")
gives(mo, g_range, "無法前綴相減的區間查詢：O(nq) → O((n + q)√n)。")
gives(knap01, g_dp, "指數級的選或不選 → O(n·W)。")
gives(knap_unb, g_dp, "O(n·W)，同一物品可以重複選。")
gives(lcs, g_dp, "指數級的枚舉子序列 → O(n·m)。")
gives(lis, g_dp, "O(2ⁿ) → O(n²) DP → O(n log n)。")
gives(interval_dp, g_dp, "指數級的切法 → O(n³)。")
gives(tree_traversal, g_conn, "每個節點拜訪一次，O(n)。")
gives(tree_diameter, g_shortest, "每個點各 BFS 一次 O(n²) → 三次 BFS O(n)。")
gives(func_graph, g_conn, "每個點各模擬一次 O(n²) → O(n)。")
gives(bipartite, g_conn, "O(V + E) 判斷，並得到分組。")


# ════════════════════════════════════════════
# Layer 4 ── 繼續或解決 (Continue or Solved)
# ════════════════════════════════════════════
outcome = Node("繼續或已解決 (Continue or Solved)", "終點",
desc="問題已經解決 → 結束。\n"
     "還不夠快、或出現新的限制 → 帶著新的特性回到「問題發現」，繼續往下走。")
for g in [g_baseline, g_log, g_lookup, g_sorted, g_linear, g_range, g_extreme,
          g_structure, g_dp, g_search, g_shortest, g_conn, g_mst, g_order, g_text, g_prime]:
    g.child.append((outcome, "夠用了 → 已解決；\n出現新限制 → 回到問題特性，繼續優化。"))


# ════════════════════════════════════════════
# 繼續：遇到新限制時，可以往哪裡走 (Continue paths)
# ════════════════════════════════════════════
def nxt(a, b, reason):
    a.next.append((b, reason))

nxt(linear, binary, "資料已經排序且支援隨機存取 → 每次排除一半。")
nxt(linear, hash_lookup, "需要大量精確查找 → 以額外空間換取 O(1) 預期查找。")
nxt(linear, heap, "每次都要線性掃描找極值 → 改用 Heap，O(log n)。")
nxt(linear, monotonic_stack, "對每個元素往左右掃描找更大值 O(n²) → 單調堆疊 O(n)。")
nxt(binary, interpolation, "數值分布均勻 → 用內插估算位置，平均 O(log log n)。")
nxt(bubble, insertion, "資料接近排序完成 → 插入排序可提早停止比較。")
nxt(bubble, merge, "資料量增加，O(n²) 過慢 → 需要穩定 O(n log n)。")
nxt(bubble, quick, "資料量增加，O(n²) 過慢 → 平均 O(n log n)。")
nxt(insertion, merge, "資料量變大且不再接近排序 → 穩定 O(n log n)。")
nxt(quick, heap_sort, "無法接受 O(n²) 最壞情況，又要 O(1) 空間。")
nxt(merge, counting, "鍵值是小範圍整數 → 不用比較，O(n + k)。")
nxt(quick, counting, "鍵值是小範圍整數 → 不用比較，O(n + k)。")
nxt(two_pointers, sliding, "兩指標之間維護的是連續區間 → 增量更新答案。")
nxt(sliding, monotonic_queue, "需要即時取得視窗內的極值 → 單調佇列 O(1) 查詢。")
nxt(prefix, fenwick, "陣列會被修改，重建前綴和 O(n) 太慢 → O(log n) 更新。")
nxt(fenwick, segment, "需要 min / max 或區間修改 → 線段樹。")
nxt(recursion, memo, "遞迴過程存在重複子問題 → 快取狀態結果。")
nxt(recursion, backtracking, "需要列舉所有候選解並可剪枝。")
nxt(memo, tabulation, "狀態有明確依賴順序 → Bottom-up，避免遞迴堆疊。")
nxt(backtracking, memo, "回溯時反覆遇到相同狀態 → 快取結果。")
nxt(backtracking, branch_bound, "目標是最佳解且可估界 → 剪掉不可能更好的分支。")
nxt(bfs, dijkstra, "邊開始有（非負）權重，層數不等於距離。")
nxt(dijkstra, bellman, "出現負權重邊，貪婪選擇不再正確。")
nxt(dijkstra, floyd, "需要所有點對最短路徑，且 V 很小。")
nxt(dfs, dsu, "邊不斷加入，需要反覆查詢連通性。")
nxt(dfs, backtracking, "需要列舉所有路徑或組合，不合法時退回。")
nxt(kruskal, prim, "圖非常稠密 (E ≈ V²)，排序所有邊太貴。")
nxt(divide_conquer, memo, "切出來的子問題其實會重複 → 動態規劃（記憶化）。")
nxt(greedy, tabulation, "找到反例，貪婪不保證最佳 → 動態規劃。")
nxt(brute, branch_bound, "能估計上下界 → 剪掉不可能更好的分支。")
nxt(brute, memo, "列舉時同一狀態重複出現 → 動態規劃。")
nxt(recursion, divide_conquer, "子問題互不重疊，可以各自解完再合併。")
nxt(binary, binary_answer, "要找的不是某個元素，而是「最小可行的答案」。")
nxt(dfs, topo, "需要依照依賴關係排出處理順序。")
nxt(linear, kmp, "在文字中逐一比對模式字串 O(nm) 太慢。")
nxt(hash_lookup, trie, "需要依照前綴查詢，Hash 做不到。")
nxt(trial_div, sieve, "要判斷很多個數 → 先篩一次。")
nxt(prefix, mo, "答案不能用前綴相減（例如不同值的個數）→ 離線＋莫隊。")
nxt(tabulation, lis, "遞增子序列的 O(n²) DP 太慢 → 二分搜尋＋貪婪 O(n log n)。")
nxt(knap01, knap_unb, "同一個物品可以選很多次 → 更新順序改成由小到大。")
nxt(bfs, tree_diameter, "要每個點的最遠距離 → 只需要直徑兩端的三次 BFS。")
nxt(dfs, bipartite, "要把點分成兩組 → 走訪時順便著色。")
nxt(brute, func_graph, "每個點只有一條出去的邊，從每點模擬太慢 → 找環＋記憶化。")


# ════════════════════════════════════════════
# 非內建的資料結構 (Data structures Python does not have built in)
#
# heapq、collections.deque、dict、set 是 Python 內建的，直接用就好；
# 下面這些 Python 沒有，要自己寫。用到它們的演算法會在網頁上標「自己寫」，
# 並在詳細面板附上模板程式碼。
# ════════════════════════════════════════════
CUSTOM_DS = [
    ("fenwick", "樹狀陣列 (Fenwick Tree / BIT)",
     "單點加值、前綴和都是 O(log n)。關鍵是 i & -i：取出 i 最低位的 1。",
     r'''
class Fenwick:
    """樹狀陣列：單點加值、前綴和，都是 O(log n)。索引從 1 開始。"""
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    def add(self, i, v):              # a[i] += v
        while i <= self.n:
            self.tree[i] += v
            i += i & -i               # 跳到下一個「管到 i」的格子

    def prefix(self, i):              # a[1] + … + a[i]
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & -i               # 去掉最低位的 1
        return s

    def range_sum(self, l, r):        # a[l] + … + a[r]
        return self.prefix(r) - self.prefix(l - 1)


fw = Fenwick(5)
for i, x in enumerate([3, 2, 3, 1, 2], start=1):
    fw.add(i, x)
print(fw.range_sum(2, 4))   # 2 + 3 + 1 = 6
fw.add(3, 10)               # a[3] 變成 13
print(fw.range_sum(2, 4))   # 16
'''),
    ("segment", "線段樹 (Segment Tree)",
     "單點修改、區間查詢（最小值、最大值、總和都可以）都是 O(log n)。",
     r'''
class SegmentTree:
    """線段樹（區間最小值）：單點修改、區間查詢，都是 O(log n)。索引從 0 開始。"""
    def __init__(self, data):
        self.n = 1
        while self.n < len(data):
            self.n *= 2
        INF = float("inf")
        self.t = [INF] * (2 * self.n)
        self.t[self.n:self.n + len(data)] = data          # 葉子放原始資料
        for i in range(self.n - 1, 0, -1):                # 由下往上建
            self.t[i] = min(self.t[2 * i], self.t[2 * i + 1])

    def update(self, i, v):                               # a[i] = v
        i += self.n
        self.t[i] = v
        while i > 1:
            i //= 2
            self.t[i] = min(self.t[2 * i], self.t[2 * i + 1])

    def query(self, l, r):                                # min(a[l..r])
        res = float("inf")
        l += self.n
        r += self.n + 1
        while l < r:
            if l & 1:
                res = min(res, self.t[l]); l += 1
            if r & 1:
                r -= 1; res = min(res, self.t[r])
            l //= 2
            r //= 2
        return res


st = SegmentTree([5, 2, 8, 6, 3])
print(st.query(0, 2))   # min(5, 2, 8) = 2
st.update(1, 9)
print(st.query(0, 2))   # min(5, 9, 8) = 5
print(st.query(2, 4))   # min(8, 6, 3) = 3
'''),
    ("dsu", "並查集 (Disjoint Set Union)",
     "合併兩組、判斷是否同一組，近乎 O(1)。Kruskal 用它判斷加入的邊會不會成環。",
     r'''
class DSU:
    """並查集：合併兩個集合、問兩個元素是否同一組，近乎 O(1)。"""
    def __init__(self, n):
        self.parent = list(range(n))   # 一開始每個人自己一組
        self.size = [1] * n

    def find(self, x):                 # 找 x 這一組的代表（順便路徑壓縮）
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):             # 合併 a、b 兩組；已經同一組就回傳 False
        a, b = self.find(a), self.find(b)
        if a == b:
            return False
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a             # 小的接到大的下面
        self.size[a] += self.size[b]
        return True


dsu = DSU(5)
dsu.union(0, 1)
dsu.union(3, 4)
print(dsu.find(0) == dsu.find(1))   # True
print(dsu.find(1) == dsu.find(3))   # False
print(dsu.union(0, 1))              # False：已經同一組（Kruskal 用這個判斷會不會成環）
'''),
    ("trie", "字典樹 (Trie)",
     "共用前綴的字串存在同一條路上；插入、查詢、數前綴都是 O(字串長度)。",
     r'''
class Trie:
    """字典樹：插入、查詢、數前綴，都是 O(字串長度)。"""
    def __init__(self):
        self.root = {}                 # 每個節點是一個 dict：字母 → 下一個節點
        self.END = "$"                 # 記「有字串在這裡結束」

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {"#": 0})
            node["#"] += 1             # 有幾個字串經過這個節點
        node[self.END] = True

    def contains(self, word):
        node = self._walk(word)
        return node is not None and self.END in node

    def count_prefix(self, prefix):    # 有幾個字串以 prefix 開頭
        node = self._walk(prefix)
        return node["#"] if node else 0

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node


t = Trie()
for w in ["apple", "app", "apply", "bat"]:
    t.insert(w)
print(t.contains("app"), t.contains("ap"))   # True False
print(t.count_prefix("app"))                 # 3
'''),
    ("binary_tree", "二元樹 (Binary Tree)",
     "每個節點最多兩個孩子。Python 沒有內建的樹，要自己定義節點 class。",
     r'''
class TreeNode:
    """二元樹的節點：每個節點最多兩個孩子。"""
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def preorder(node, out):     # node → left → right
    if node:
        out.append(node.val)
        preorder(node.left, out)
        preorder(node.right, out)

def inorder(node, out):      # left → node → right
    if node:
        inorder(node.left, out)
        out.append(node.val)
        inorder(node.right, out)

def postorder(node, out):    # left → right → node
    if node:
        postorder(node.left, out)
        postorder(node.right, out)
        out.append(node.val)


#     1
#    / \
#   2   3
#      / \
#     4   5
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.right.left = TreeNode(4)
root.right.right = TreeNode(5)

for f in (preorder, inorder, postorder):
    out = []
    f(root, out)
    print(f.__name__, out)
# preorder [1, 2, 3, 4, 5]
# inorder [2, 1, 4, 3, 5]
# postorder [2, 4, 5, 3, 1]
'''),
    ("graph", "圖：鄰接串列 (Adjacency List)",
     "用 dict / list 記下每個點連到哪些點。圖的演算法都從這一步開始。",
     r'''
from collections import defaultdict, deque

# 圖：用「鄰接串列」存 —— 每個點記下它連到哪些點
edges = [(1, 2), (1, 3), (3, 4), (3, 5)]

graph = defaultdict(list)
for a, b in edges:
    graph[a].append(b)
    graph[b].append(a)          # 無向圖：兩個方向都要加（有向圖只加 a → b）

# 有權重的圖：存 (鄰居, 權重)
weighted = defaultdict(list)
for a, b, w in [(1, 2, 7), (1, 3, 2), (3, 2, 1)]:
    weighted[a].append((b, w))
    weighted[b].append((a, w))

# 用 BFS 走過整張圖
def bfs(start):
    dist = {start: 0}
    q = deque([start])
    while q:
        u = q.popleft()
        for v in graph[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

print(dict(graph))     # {1: [2, 3], 2: [1], 3: [1, 4, 5], 4: [3], 5: [3]}
print(bfs(1))          # {1: 0, 2: 1, 3: 1, 4: 2, 5: 2}
print(weighted[3])     # [(1, 2), (2, 1)]
'''),
]

USES_DS = {
    fenwick: ["fenwick"],
    segment: ["segment"],
    dsu: ["dsu"],
    kruskal: ["dsu"],
    trie: ["trie"],
    tree_traversal: ["binary_tree"],
    bfs: ["graph"], dfs: ["graph"], dijkstra: ["graph"], bellman: ["graph"],
    prim: ["graph"], topo: ["graph"], bipartite: ["graph"], tree_diameter: ["graph"],
}


# ════════════════════════════════════════════
# 解題流程 (Solve Wizard) —— 網頁上的「互動步驟」分頁
#
#   1. 真的需要優化嗎？   算算看暴力解能不能通過（網頁上計算）
#   2. 了解資料           形狀（單選）＋ 存取方式（單選）＋ 資料特性（多選）
#   3. 問題要什麼         輸出（單選）＋ 查詢次數 ＋ 答案能否 O(1) 空間 ＋ 問題結構（多選）
#   4. 找到演算法         依照 RULES 比對 2、3 的選擇
#
# 2 和 3 是兩件不同的事，可以分開選；第 4 步一定同時考慮兩邊。
# ════════════════════════════════════════════

# (id, 步驟, 標題, 類型 single/multi, [(選項 id, 名稱, 說明), ...])
WIZARD_GROUPS = [
    ("shape", 2, "資料的形狀", "single", [
        ("shape_const",  "常數",  "單一值或固定大小（例如：一個整數 n、固定 3×3 的盤面）。"),
        ("shape_linear", "線性",  "一串元素：陣列、字串、串列。"),
        ("shape_rel",    "關聯",  "元素之間有關係：圖、樹、鍵值對應。"),
    ]),
    ("access", 2, "存取方式", "single", [
        ("acc_random", "隨機存取 O(1)", "可以用索引直接拿到第 i 個元素（list、陣列）。"),
        ("acc_seq",    "只能依序走過",   "只能從頭一個一個讀（串流、linked list、檔案）。"),
        ("acc_link",   "透過關係找",     "透過鍵、指標或邊找到下一個（dict、樹、圖）。"),
    ]),
    ("traits", 2, "資料特性（可多選）", "multi", [
        ("tr_sorted",   "已排序／單調",       "資料已排序，或答案隨位置單調變化。"),
        ("tr_uniform",  "數值分布均勻",       "排序後的數值大致平均分布。"),
        ("tr_smallint", "整數且範圍小",       "鍵值是整數，範圍 k 不比 n 大太多。"),
        ("tr_small",    "資料量很小",         "n 很小（例如 ≤ 20～50）。"),
        ("tr_nearly",   "幾乎已排好",         "大部分元素已在正確位置。"),
        ("tr_dynamic",  "會動態修改",         "查詢之間資料會被插入、刪除或修改。"),
        ("tr_weighted", "邊有權重",           "圖的每條邊有不同成本。"),
        ("tr_negative", "有負權重",           "有些邊的成本是負的。"),
        ("tr_dag",      "有依賴且無環",       "A 必須在 B 之前，而且依賴沒有環（DAG）。"),
        ("tr_dense",    "圖很稠密",           "邊數接近 V²。"),
        ("tr_tree",     "是一棵樹",           "沒有環，n 個點、n−1 條邊。"),
        ("tr_func",     "每點只有一條出去的邊", "每個點恰好指向一個點（例如每個人只寄給一個人）。"),
    ]),
    ("output", 3, "要輸出什麼", "single", [
        ("out_find",     "找某個值",           "某個值在不在、在哪裡。"),
        ("out_sort",     "排序後的資料",       "把資料排好。"),
        ("out_range",    "區間（子陣列）答案", "和一段連續子陣列有關的答案。"),
        ("out_extreme",  "反覆取最大／最小",   "過程中一再要目前的極值。"),
        ("out_nearest",  "最近的較大／較小",   "每個元素左右第一個更大（小）的元素。"),
        ("out_pair",     "一對元素",           "找兩個（一組）元素滿足條件。"),
        ("out_minfeas",  "最小（大）可行答案", "能檢查「答案 x 可不可行」。"),
        ("out_path",     "最短路徑",           "點與點之間的最短距離。"),
        ("out_mst",      "最小生成樹",         "用最小成本連接所有點。"),
        ("out_order",    "先後順序",           "排出滿足依賴的順序。"),
        ("out_connect",  "連通／走訪",         "哪些點相連、有沒有環。"),
        ("out_optimal",  "一個最佳值",         "最大值、最小值、方法數。"),
        ("out_all",      "所有可行解",         "列出所有組合／排列／方案。"),
        ("out_match",    "字串比對",           "在文字中找模式。"),
        ("out_prefix",   "前綴查詢",           "依前綴查很多字串。"),
        ("out_prime",    "質數／因數",         "判斷質數、質因數分解。"),
        ("out_rank",     "每個元素的名次",     "每個數排第幾。"),
        ("out_expr",     "運算式轉換／計算",   "中序轉後序、計算有括號的算式。"),
        ("out_traverse", "前序／中序／後序",   "依固定順序拜訪樹的每個節點。"),
        ("out_twocolor", "分成兩組",           "相鄰的點要在不同組。"),
        ("out_far",      "每個點能走多遠",     "每個點的最遠距離，或能走到幾個點。"),
    ]),
    ("queries", 3, "要查詢幾次", "single", [
        ("q_once", "一次", "只需要回答一次。"),
        ("q_many", "很多次", "同一份資料要回答很多次 → 值得先做前處理。"),
    ]),
    ("o1", 3, "答案可以只用 O(1) 空間嗎？", "single", [
        ("o1_yes", "可以", "不需要儲存所有中間答案，只要保留目前需要的幾個值。"),
        ("o1_no",  "不行", "需要記住很多中間結果。"),
    ]),
    ("detail", 3, "問題的結構與細節（可多選）", "multi", [
        ("st_divide",      "可拆成子問題",       "大問題可以切成形式相同的小問題。"),
        ("st_overlap",     "子問題會重複",       "同一個狀態會被算很多次。"),
        ("st_greedy",      "每步選最好就是最佳", "能證明貪婪選擇是對的。"),
        ("st_bound",       "能估計上下界",       "對部分解能算出「最好也只能到多少」。"),
        ("need_allpairs",  "要所有點對",         "最短路徑要每一對點之間的距離。"),
        ("need_stable",    "排序要穩定",         "相同鍵值要保持原本順序。"),
        ("need_worst",     "要最壞情況保證",     "不能接受偶爾變成 O(n²)。"),
        ("range_window",   "固定長度視窗",       "區間是一個往前滑動、長度固定的視窗。"),
        ("range_sumonly",  "只需要區間和",       "不需要 min / max 等其他運算。"),
        ("range_nonadd",   "答案不能前綴相減",   "例如區間內不同值的個數、眾數。"),
    ]),
    ("dpkind", 3, "如果是 DP，是哪一種？", "single", [
        ("dp_knap01",  "背包：每個物品最多一次", "容量有限，每個物品選或不選。"),
        ("dp_knapunb", "背包：物品可重複選",     "同一個物品可以選很多次（0/n）。"),
        ("dp_twoseq",  "兩個序列的共同部分",     "例如最長共同子序列。"),
        ("dp_lis",     "最長遞增子序列",         "一個序列裡最長的遞增子序列。"),
        ("dp_split",   "切成幾段／合併區間",     "枚舉切點。"),
    ]),
]

# 演算法的條件：
#   all  = 全部都要符合        any  = 至少符合一個
#   none = 不能出現            bonus = 符合會更適合（排序用）
#   note = 成本提醒（顯示在結果卡片）
RULES = {
    linear:          dict(all=["out_find"], bonus=["q_once", "acc_seq"]),
    binary:          dict(all=["out_find", "tr_sorted", "acc_random"]),
    interpolation:   dict(all=["out_find", "tr_sorted", "tr_uniform", "acc_random"]),
    hash_lookup:     dict(all=["out_find", "q_many"], bonus=["o1_no"],
                          note="需要 O(n) 額外空間；建表本身也要 O(n) 時間，只查一次時不划算。"),
    bubble:          dict(all=["out_sort", "tr_small"]),
    insertion:       dict(all=["out_sort"], any=["tr_nearly", "tr_small"]),
    merge:           dict(all=["out_sort"], bonus=["need_stable", "need_worst", "acc_seq"]),
    quick:           dict(all=["out_sort", "acc_random"], none=["need_worst", "need_stable"]),
    heap_sort:       dict(all=["out_sort", "acc_random"], bonus=["need_worst", "o1_yes"], none=["need_stable"]),
    counting:        dict(all=["out_sort", "tr_smallint"]),
    two_pointers:    dict(all=["out_pair", "tr_sorted"], bonus=["o1_yes", "acc_random"]),
    sliding:         dict(all=["out_range"], none=["q_many", "range_window"], bonus=["o1_yes"]),
    monotonic_queue: dict(all=["range_window"], any=["out_range", "out_extreme"]),
    prefix:          dict(all=["out_range", "q_many"], none=["tr_dynamic", "range_nonadd"],
                          note="前處理 O(n) 時間與空間，之後每次 O(1)。"),
    fenwick:         dict(all=["out_range", "q_many", "tr_dynamic", "range_sumonly"], none=["range_nonadd"]),
    segment:         dict(all=["out_range", "q_many", "tr_dynamic"], none=["range_sumonly", "range_nonadd"]),
    heap:            dict(all=["out_extreme"], none=["range_window"], bonus=["tr_dynamic"]),
    monotonic_stack: dict(all=["out_nearest"]),
    binary_answer:   dict(all=["out_minfeas"]),
    bfs:             dict(all=["shape_rel", "out_path"], none=["tr_weighted", "need_allpairs"]),
    dijkstra:        dict(all=["shape_rel", "out_path", "tr_weighted"], none=["tr_negative", "need_allpairs"]),
    bellman:         dict(all=["shape_rel", "out_path", "tr_negative"], none=["need_allpairs"]),
    floyd:           dict(all=["shape_rel", "out_path", "need_allpairs"], bonus=["tr_small"],
                          note="O(V³)：V = 500 時約 1.25 億次運算，Python 會太慢。"),
    kruskal:         dict(all=["shape_rel", "out_mst"], none=["tr_dense"]),
    prim:            dict(all=["shape_rel", "out_mst", "tr_dense"]),
    topo:            dict(all=["shape_rel", "out_order", "tr_dag"]),
    dsu:             dict(all=["out_connect", "tr_dynamic"]),
    dfs:             dict(all=["shape_rel", "out_connect"], none=["tr_dynamic"]),
    kmp:             dict(all=["out_match"]),
    trie:            dict(all=["out_prefix"], bonus=["q_many"]),
    greedy:          dict(all=["st_greedy"], any=["out_optimal", "out_mst", "out_path"]),
    tabulation:      dict(all=["st_overlap", "out_optimal"], bonus=["o1_yes"],
                          none=["dp_knap01", "dp_knapunb", "dp_twoseq", "dp_lis", "dp_split"],
                          note="只依賴前幾個狀態時，可以只保留幾個變數（滾動陣列），空間變 O(1)。"),
    memo:            dict(all=["st_overlap", "out_optimal"], bonus=["o1_no"],
                          none=["dp_knap01", "dp_knapunb", "dp_twoseq", "dp_lis", "dp_split"],
                          note="狀態很多時要小心：每個狀態都要寫進 dict（雜湊＋配置記憶體），"
                               "也要付出遞迴呼叫的成本，不一定比表格化或暴力快。"),
    backtracking:    dict(all=["out_all"]),
    branch_bound:    dict(all=["out_optimal", "st_bound"], none=["st_overlap", "st_greedy"]),
    divide_conquer:  dict(all=["st_divide"], none=["st_overlap"]),
    recursion:       dict(all=["st_divide"], none=["st_overlap"], bonus=["tr_small"]),
    trial_div:       dict(all=["out_prime"], none=["q_many"]),
    sieve:           dict(all=["out_prime", "q_many"]),
    rank_compress:   dict(all=["out_rank"]),
    shunting:        dict(all=["out_expr"]),
    mo:              dict(all=["out_range", "q_many", "range_nonadd"], none=["tr_dynamic"],
                          note="Python 很慢：n、q 到 2×10⁵ 時可能要十幾秒。像「不同值個數」也可以改用離線＋樹狀陣列，O((n + q) log n)。"),
    knap01:          dict(all=["st_overlap", "dp_knap01"]),
    knap_unb:        dict(all=["st_overlap", "dp_knapunb"]),
    lcs:             dict(all=["st_overlap", "dp_twoseq"]),
    lis:             dict(all=["st_overlap", "dp_lis"]),
    interval_dp:     dict(all=["st_overlap", "dp_split"], note="O(n³)：n 到幾百還可以，n 到幾千就太慢。"),
    tree_traversal:  dict(all=["shape_rel", "tr_tree", "out_traverse"]),
    tree_diameter:   dict(all=["shape_rel", "tr_tree", "out_far"]),
    func_graph:      dict(all=["shape_rel", "tr_func", "out_far"]),
    bipartite:       dict(all=["shape_rel", "out_twocolor"]),
    brute:           dict(all=[], note="永遠可行的基準解：先寫出來驗證答案，再用第 1 步算算看夠不夠快。"),
}

# ════════════════════════════════════════════
# Export to the web app (web_src/src/algoTreeData.ts)
# ════════════════════════════════════════════
import json, os, re

def split_name(name):
    m = re.match(r"^(.*\S)\s+\(([^()]*)\)\s*$", name)  # split at the last "(English)"
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return name, name

def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")

def export(path):
    used = set()

    def new_id(base):
        base = base or "node"
        while base in used:
            base += "-2"
        used.add(base)
        return base

    def kind_of(n):
        return {"root": "root", "問題": "question", "收穫": "gain", "終點": "outcome"}.get(n.category, "algorithm")

    nodes, edges, nexts = [], [], []
    algo_first = {}   # id(algorithm Node) -> 第一個葉子的 id（也是演算法本身的 id）
    seen_q = set()

    def add_node(n, nid, ref=""):
        zh, en = split_name(n.name)
        nodes.append({"id": nid, "labelZh": zh, "label": en, "kind": kind_of(n),
                      "category": n.category, "time": n.time, "space": n.space,
                      "ds": n.ds, "desc": n.desc.strip(),
                      "qtype": getattr(n, "qtype", ""), "stage": getattr(n, "stage", 0),
                      "ref": ref, "customDs": USES_DS.get(n, []) if kind_of(n) == "algorithm" else []})

    # 收穫與終點
    gain_ids = {}
    gain_list = []
    def collect_gains(n):
        for child, _ in n.child:
            if kind_of(child) == "gain" and id(child) not in gain_ids:
                gain_ids[id(child)] = new_id("gain-" + slug(split_name(child.name)[1]))
                gain_list.append(child)
    outcome_id = new_id(slug(split_name(outcome.name)[1]))
    root_id = new_id(slug(split_name(root.name)[1]))
    add_node(root, root_id)

    # 判斷樹：問題節點只能出現一次；演算法每出現一次就是一個新的葉子
    def walk(n, nid):
        if n.category == "問題":
            answers = [ANSWERS[(id(n), id(c))] for c, _ in n.child]
            assert len(answers) == len(set(answers)), f"{n.name} 的答案重複: {answers}"
            if n.qtype == "yesno":
                assert sorted(answers) == ["否", "是"], f"{n.name} 是非題需要「是」和「否」: {answers}"
            else:
                assert len(answers) >= 2, f"{n.name} 選擇題至少要兩個選項"
        for child, reason in n.child:
            if child.category == "問題":
                assert id(child) not in seen_q, f"問題「{child.name}」出現在兩個地方 —— 路徑會不唯一"
                seen_q.add(id(child))
                cid = new_id("q-" + slug(split_name(child.name)[1]))
                add_node(child, cid)
            else:
                assert kind_of(child) == "algorithm", f"{child.name} 不是問題也不是演算法"
                assert child.child, f"{child.name} 沒有連到任何收穫"
                if id(child) not in algo_first:
                    cid = new_id(slug(split_name(child.name)[1]))
                    algo_first[id(child)] = cid
                else:
                    cid = new_id(algo_first[id(child)])
                add_node(child, cid, ref=algo_first[id(child)])
                collect_gains(child)
                for g, g_reason in child.child:
                    edges.append({"from": cid, "to": gain_ids[id(g)], "reason": g_reason.strip(),
                                  "kind": "gain", "answer": ""})
            edges.append({"from": nid, "to": cid, "reason": reason.strip(), "kind": kind_of(child),
                          "answer": ANSWERS.get((id(n), id(child)), "")})
            if child.category == "問題":
                walk(child, cid)

    walk(root, root_id)

    for g in gain_list:
        add_node(g, gain_ids[id(g)])
        for child, reason in g.child:
            edges.append({"from": gain_ids[id(g)], "to": outcome_id, "reason": reason.strip(),
                          "kind": "outcome", "answer": ""})
    add_node(outcome, outcome_id)

    for n in RULES:
        assert id(n) in algo_first, f"{n.name} 有設定 RULES，但沒有出現在判斷樹的任何葉子"
        for target, reason in n.next:
            nexts.append({"from": algo_first[id(n)], "to": algo_first[id(target)], "reason": reason.strip()})

    # 每一個演算法都必須：(1) 是判斷樹的某個葉子  (2) 在解題流程的 RULES 裡有條件
    all_algos = [n for n in Node.registry if kind_of(n) == "algorithm"]
    for n in all_algos:
        assert id(n) in algo_first, f"{n.name} 沒有出現在判斷樹的任何葉子"
        assert n in RULES, f"{n.name} 沒有在解題流程的 RULES 裡設定條件"
    # 解題流程：每個演算法的條件都要「選得出來」（同一個單選群組不能要求兩個選項）
    single_group = {o[0]: g[0] for g in WIZARD_GROUPS if g[3] == "single" for o in g[4]}
    for n, r in RULES.items():
        groups = [single_group[o] for o in r.get("all", []) if o in single_group]
        assert len(groups) == len(set(groups)), f"{n.name} 的條件在同一個單選群組裡要求了兩個選項"
        assert not set(r.get("all", [])) & set(r.get("none", [])), f"{n.name} 的 all 和 none 互相矛盾"

    ds_ids = {c[0] for c in CUSTOM_DS}
    for n, used in USES_DS.items():
        assert id(n) in algo_first, f"{n.name} 用到自製資料結構，但不在判斷樹裡"
        for u in used:
            assert u in ds_ids, f"{n.name} 用到不存在的資料結構 {u}"
    structures = [{"id": c[0], "name": c[1], "desc": c[2], "code": c[3].strip()} for c in CUSTOM_DS]

    ids = {k: v for k, v in algo_first.items()}
    order = [n for n in RULES]

    # ── 解題流程資料 ──
    option_ids = {o[0] for g in WIZARD_GROUPS for o in g[4]}
    for n_id in algo_first:
        assert any(id(n) == n_id for n in RULES), "判斷樹裡有演算法沒有在 RULES 裡設定條件"
    rules = []
    for n, r in RULES.items():
        for key in ("all", "any", "none", "bonus"):
            for o in r.get(key, []):
                assert o in option_ids, f"{n.name} 的條件 {o} 不存在於 WIZARD_GROUPS"
        rules.append({"algo": ids[id(n)], "all": r.get("all", []), "any": r.get("any", []),
                      "none": r.get("none", []), "bonus": r.get("bonus", []), "note": r.get("note", "")})
    groups = [{"id": g[0], "step": g[1], "title": g[2], "type": g[3],
               "options": [{"id": o[0], "label": o[1], "desc": o[2]} for o in g[4]]} for g in WIZARD_GROUPS]

    body = ("// ── Algorithm Tree Data ──\n"
            "// AUTO-GENERATED by algorithm_tree.py — edit the Python file, then run:\n"
            "//   python algorithm_tree.py\n"
            "// Flow: 步驟1 需要優化嗎 → 步驟2 了解資料 → 步驟3 問題要什麼 → 步驟4 演算法 → 得到了什麼 → 繼續或解決\n\n"
            "export type AlgoNodeKind = 'root' | 'question' | 'algorithm' | 'gain' | 'outcome';\n\n"
            "export interface AlgoNode {\n  id: string;\n  label: string;\n  labelZh: string;\n"
            "  kind: AlgoNodeKind;\n  category: string;\n  time: string;\n  space: string;\n"
            "  ds: string;\n  desc: string;\n  /** question nodes: 'yesno' 是非題 | 'choice' 選擇題 */\n  qtype: '' | 'yesno' | 'choice';\n"
            "  /** question nodes: which step of 拆解問題 (1 需要優化嗎 / 2 了解資料 / 3 問題要什麼) */\n  stage: number;\n"
            "  /** algorithm leaves: id of the algorithm this leaf stands for (same algorithm can be several leaves) */\n  ref: string;\n"
            "  /** non-built-in data structures this algorithm needs you to write (ids in customStructures) */\n  customDs: string[];\n}\n\n"
            "/** kind = the kind of the edge's target node */\n"
            "export interface AlgoEdge {\n  from: string;\n  to: string;\n  reason: string;\n"
            "  kind: AlgoNodeKind;\n  /** answer to the question (是 / 否 / option text) */\n  answer: string;\n}\n\n"
            "export interface AlgoNext {\n  from: string;\n  to: string;\n  reason: string;\n}\n\n"
            f"export const ALGO_ROOT_ID = {json.dumps(root_id)};\n"
            f"export const ALGO_OUTCOME_ID = {json.dumps(outcome_id)};\n\n"
            f"export const algoNodes: AlgoNode[] = {json.dumps(nodes, ensure_ascii=False, indent=2)};\n\n"
            f"export const algoEdges: AlgoEdge[] = {json.dumps(edges, ensure_ascii=False, indent=2)};\n\n"
            f"/** 遇到新限制時可以繼續往哪裡走（顯示在詳細面板） */\n"
            f"export const algoNext: AlgoNext[] = {json.dumps(nexts, ensure_ascii=False, indent=2)};\n\n"
            "// ── 解題流程 (Solve Wizard) ──\n"
            "export interface WizardOption {\n  id: string;\n  label: string;\n  desc: string;\n}\n\n"
            "export interface WizardGroup {\n  id: string;\n  step: number;\n  title: string;\n"
            "  type: 'single' | 'multi';\n  options: WizardOption[];\n}\n\n"
            "export interface AlgoRule {\n  algo: string;\n  all: string[];\n  any: string[];\n"
            "  none: string[];\n  bonus: string[];\n  note: string;\n}\n\n"
            f"export const wizardGroups: WizardGroup[] = {json.dumps(groups, ensure_ascii=False, indent=2)};\n\n"
            f"export const algoRules: AlgoRule[] = {json.dumps(rules, ensure_ascii=False, indent=2)};\n\n"
            "// ── 非內建的資料結構：要自己寫 ──\n"
            "export interface CustomStructure {\n  id: string;\n  name: string;\n  desc: string;\n  code: string;\n}\n\n"
            f"export const customStructures: CustomStructure[] = {json.dumps(structures, ensure_ascii=False, indent=2)};\n")
    with open(path, "w", encoding="utf-8") as f:
        f.write(body)
    count = lambda k: sum(1 for x in nodes if x["kind"] == k)
    print(f"Exported {count('question')} questions, {count('algorithm')} leaves ({len(algo_first)} algorithms), "
          f"{count('gain')} gains, {len(edges)} edges, {len(nexts)} continue-paths, {len(rules)} wizard rules -> {path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    export(os.path.join(here, "web_src", "src", "algoTreeData.ts"))
