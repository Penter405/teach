"""
演算法樹 (Algorithm Tree)

思考流程：
  問題發現 -> 問題特性 -> 可用的演算法 -> 得到了什麼 -> 繼續或解決

  root.child      : (特性 trait,      這個特性是什麼)
  trait.child     : (演算法 algorithm, 為什麼這個特性讓它可行)
  algorithm.child : (收穫 gain,        具體得到了什麼)
  gain.child      : (終點 outcome,     已解決 / 遇到新問題)
  algorithm.next  : (演算法,           遇到新限制時可以繼續往哪裡走)

修改後執行 `python algorithm_tree.py`，會重新產生 web_src/src/algoTreeData.ts
"""


class Node:
    def __init__(self, name, category="", time="", space="", ds="", desc=""):
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
memo = Node("記憶化 (Memoization)", "動態規劃", "O(states + transitions)", "O(states)", "Hash Map / Array",
"遞迴過程中會重複遇到相同狀態。\n"
"可以儲存已經計算過的結果。\n"
"避免重複計算相同子問題。")
tabulation = Node("表格化 (Tabulation)", "動態規劃", "O(states + transitions)", "O(states)", "Array / Table",
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


# ════════════════════════════════════════════
# Layer 1 ── 問題特性 (Problem Traits)
# ════════════════════════════════════════════
def trait(name, desc):
    t = Node(name, "特性", desc=desc)
    root.child.append((t, desc))
    return t

t_none = trait("沒有特殊結構 (No Special Structure)",
"資料無序，也沒有可利用的額外資訊。\n只能逐一檢查每個元素。")
t_small = trait("資料量小或接近有序 (Small or Nearly Sorted)",
"n 很小，或大部分元素已經在正確位置。\n簡單的方法反而最快。")
t_mono = trait("有序／單調性 (Sorted / Monotonic)",
"資料已排序，或答案隨位置單調變化。\n可以一次排除一大段不可能的範圍。")
t_uniform = trait("數值分布均勻 (Uniform Distribution)",
"有序資料的數值大致平均分布。\n可以由數值估算位置。")
t_space = trait("可以用空間換時間 (Extra Memory Allowed)",
"允許使用額外記憶體建立索引或快取。")
t_int = trait("整數鍵值且範圍小 (Small Integer Keys)",
"鍵值是整數，範圍 k 不比 n 大太多。\n可以直接當成陣列索引。")
t_range = trait("連續區間 (Contiguous Range)",
"問題關心的是一段連續的子陣列或區間。")
t_dynamic = trait("資料會動態修改 (Dynamic Updates)",
"查詢之間資料會被插入、刪除或修改。\n不能只做一次前處理。")
t_extreme = trait("反覆取最大／最小 (Repeated Min / Max)",
"過程中需要一再取得目前的極值。")
t_divide = trait("可拆成子問題 (Decomposable)",
"大問題可以切成形式相同的小問題，\n再把小問題的答案組合起來。")
t_overlap = trait("子問題重複出現 (Overlapping Subproblems)",
"拆解過程中，同一個狀態會被計算很多次。")
t_states = trait("狀態有限且不會增加 (Finite, Acyclic States)",
"狀態數量有上限，且狀態之間的依賴沒有環。\n可以排出計算順序。")
t_enum = trait("需要枚舉候選解 (Enumerate Candidates)",
"答案是一組選擇的組合或排列，\n需要嘗試多種可能。")
t_bound = trait("求最佳解且可估界 (Optimize with Bounds)",
"要找最佳解，而且能估計分支的上下界。")
t_graph = trait("圖：無權或只需遍歷 (Unweighted Graph)",
"資料是點與邊的關係，\n每條邊的成本相同或只需要走訪。")
t_weight = trait("圖：邊有非負權重 (Non-negative Weights)",
"每條邊有成本，且成本都 ≥ 0。")
t_neg = trait("圖：可能有負權重 (Negative Weights)",
"有些邊的成本是負的。")
t_connect = trait("需要連通性／合併集合 (Connectivity)",
"關心哪些點彼此相連，或要不斷合併群組。")
t_greedy = trait("局部最佳可推得全域最佳 (Greedy Choice)",
"每一步選目前最好的選擇，最後就是整體最佳解。")

def use(t, algo, reason):
    t.child.append((algo, reason))

use(t_none, linear, "不需要任何前處理，逐一比較即可。")
use(t_none, bubble, "只靠相鄰比較與交換就能排序，最直觀的暴力解。")
use(t_small, insertion, "接近有序時幾乎不用移動，最佳情況 O(n)。")
use(t_small, bubble, "資料量小時 O(n²) 仍可接受，實作最簡單。")
use(t_mono, binary, "有序 → 看中間值就能丟掉一半。")
use(t_mono, interpolation, "有序是前提，再配合均勻分布估算位置。")
use(t_mono, two_pointers, "指標只會往一個方向移動，不需要回頭。")
use(t_mono, sliding, "視窗是否合法隨邊界單調變化，左右端點都只前進。")
use(t_mono, monotonic_stack, "維持堆疊內元素單調，被擋住的元素永遠不會再成為答案。")
use(t_mono, monotonic_queue, "維持佇列單調，隊首永遠是視窗內的極值。")
use(t_uniform, interpolation, "由數值直接推估目標所在位置。")
use(t_space, hash_lookup, "先建 Hash Table，查找變成 O(1)。")
use(t_space, prefix, "多存一個前綴和陣列，區間和一次相減就得到。")
use(t_space, memo, "用表格記住算過的狀態。")
use(t_space, merge, "用 O(n) 額外空間換取穩定且保證 O(n log n)。")
use(t_space, counting, "用 O(k) 計數陣列取代比較。")
use(t_int, counting, "鍵值直接當索引計數，不需要比較。")
use(t_range, sliding, "新增右端、移除左端，答案可以增量更新。")
use(t_range, prefix, "區間 [l, r] 的和 = P[r] − P[l−1]。")
use(t_range, fenwick, "區間和可以拆成兩個前綴和。")
use(t_range, segment, "把區間切成 O(log n) 段預先算好的區塊。")
use(t_range, monotonic_queue, "在移動中的區間裡維護極值。")
use(t_dynamic, fenwick, "單點修改只影響 O(log n) 個節點。")
use(t_dynamic, segment, "修改沿著樹往上更新，支援區間修改。")
use(t_dynamic, heap, "插入與刪除後仍能維持堆積性質。")
use(t_dynamic, dsu, "集合可以隨時合併，查詢仍近乎 O(1)。")
use(t_extreme, heap, "頂端永遠是最大／最小值。")
use(t_extreme, heap_sort, "反覆取出最大值，就是排序。")
use(t_extreme, monotonic_queue, "隊首就是視窗內的極值。")
use(t_extreme, dijkstra, "每次取出目前距離最小的節點。")
use(t_extreme, prim, "每次取出連到生成樹的最小邊。")
use(t_divide, recursion, "直接用函式呼叫自己來表達子問題。")
use(t_divide, merge, "切成兩半各自排序，再合併。")
use(t_divide, quick, "用 pivot 分成左右兩邊，再各自排序。")
use(t_overlap, memo, "第二次遇到同一狀態時直接查表。")
use(t_overlap, tabulation, "每個狀態只算一次。")
use(t_states, tabulation, "依照依賴順序由小到大填表，不需遞迴。")
use(t_states, memo, "狀態數有限，快取大小有上限。")
use(t_enum, backtracking, "逐步做選擇，不合法就退回上一步。")
use(t_enum, dfs, "把選擇過程看成一棵樹，深度優先走訪。")
use(t_enum, branch_bound, "枚舉的同時用界限剪枝。")
use(t_bound, branch_bound, "上下界不可能更好的分支直接剪掉。")
use(t_graph, bfs, "一層一層擴展，第一次到達就是最短。")
use(t_graph, dfs, "一路走到底再回頭，適合探索結構。")
use(t_weight, dijkstra, "非負權重保證已確定的最短距離不會被更新。")
use(t_weight, floyd, "節點數量小時，一次求出所有點對。")
use(t_weight, kruskal, "邊依權重排序，由小到大挑選。")
use(t_weight, prim, "從一個點開始，逐步加入最小邊。")
use(t_neg, bellman, "做 V−1 輪鬆弛，負邊也能正確處理，並能偵測負環。")
use(t_neg, floyd, "允許負權重邊（但不能有負環）。")
use(t_connect, dsu, "find / union 判斷是否同一群。")
use(t_connect, kruskal, "用 DSU 確保加入的邊不形成環。")
use(t_connect, dfs, "從一點出發能走到的就是同一個連通塊。")
use(t_greedy, dijkstra, "每次確定距離最小的點。")
use(t_greedy, kruskal, "每次選最小且不成環的邊。")
use(t_greedy, prim, "每次選連到樹的最小邊。")


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


# ════════════════════════════════════════════
# Layer 4 ── 繼續或解決 (Continue or Solved)
# ════════════════════════════════════════════
outcome = Node("繼續或已解決 (Continue or Solved)", "終點",
desc="問題已經解決 → 結束。\n"
     "還不夠快、或出現新的限制 → 帶著新的特性回到「問題發現」，繼續往下走。")
for g in [g_baseline, g_log, g_lookup, g_sorted, g_linear, g_range, g_extreme,
          g_structure, g_dp, g_search, g_shortest, g_conn, g_mst]:
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
    ids, order = {}, []

    def visit(n, prefix=""):
        if id(n) in ids:
            return
        zh, en = split_name(n.name)
        base = slug(en) or f"node-{len(ids)}"
        if n.category == "特性":
            base = "trait-" + base
        elif n.category == "收穫":
            base = "gain-" + base
        ids[id(n)] = base
        order.append(n)
        for child, _ in n.child:
            visit(child)

    visit(root)

    def kind_of(n):
        return {"root": "root", "特性": "trait", "收穫": "gain", "終點": "outcome"}.get(n.category, "algorithm")

    nodes, edges, nexts = [], [], []
    for n in order:
        zh, en = split_name(n.name)
        kind = kind_of(n)
        nodes.append({"id": ids[id(n)], "labelZh": zh, "label": en, "kind": kind,
                      "category": n.category, "time": n.time, "space": n.space,
                      "ds": n.ds, "desc": n.desc.strip()})
        for child, reason in n.child:
            edges.append({"from": ids[id(n)], "to": ids[id(child)],
                          "reason": reason.strip(), "kind": kind_of(child)})
        for target, reason in n.next:
            nexts.append({"from": ids[id(n)], "to": ids[id(target)], "reason": reason.strip()})

    body = ("// ── Algorithm Tree Data ──\n"
            "// AUTO-GENERATED by algorithm_tree.py — edit the Python file, then run:\n"
            "//   python algorithm_tree.py\n"
            "// Flow: 問題發現 → 問題特性 → 可用的演算法 → 得到了什麼 → 繼續或解決\n\n"
            "export type AlgoNodeKind = 'root' | 'trait' | 'algorithm' | 'gain' | 'outcome';\n\n"
            "export interface AlgoNode {\n  id: string;\n  label: string;\n  labelZh: string;\n"
            "  kind: AlgoNodeKind;\n  category: string;\n  time: string;\n  space: string;\n"
            "  ds: string;\n  desc: string;\n}\n\n"
            "/** kind = the kind of the edge's target node */\n"
            "export interface AlgoEdge {\n  from: string;\n  to: string;\n  reason: string;\n"
            "  kind: AlgoNodeKind;\n}\n\n"
            "export interface AlgoNext {\n  from: string;\n  to: string;\n  reason: string;\n}\n\n"
            f"export const ALGO_ROOT_ID = {json.dumps(ids[id(root)])};\n"
            f"export const ALGO_OUTCOME_ID = {json.dumps(ids[id(outcome)])};\n\n"
            f"export const algoNodes: AlgoNode[] = {json.dumps(nodes, ensure_ascii=False, indent=2)};\n\n"
            f"export const algoEdges: AlgoEdge[] = {json.dumps(edges, ensure_ascii=False, indent=2)};\n\n"
            f"/** 遇到新限制時可以繼續往哪裡走（顯示在詳細面板） */\n"
            f"export const algoNext: AlgoNext[] = {json.dumps(nexts, ensure_ascii=False, indent=2)};\n")
    with open(path, "w", encoding="utf-8") as f:
        f.write(body)
    count = lambda k: sum(1 for x in nodes if x["kind"] == k)
    print(f"Exported {count('trait')} traits, {count('algorithm')} algorithms, "
          f"{count('gain')} gains, {len(edges)} edges, {len(nexts)} continue-paths -> {path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    export(os.path.join(here, "web_src", "src", "algoTreeData.ts"))
