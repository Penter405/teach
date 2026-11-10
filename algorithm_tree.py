"""
演算法樹 (Algorithm Tree)

思考流程：
  問題發現 -> 判斷樹（是非題／選擇題）-> 可用的演算法 -> 得到了什麼 -> 繼續或解決

  判斷樹的每個節點是一個問題，答案互斥，所以一個問題只會走出唯一一條路徑，
  最後抵達唯一一個演算法（每個演算法只出現在一個葉子）。

  ask(...)        : 建立問題節點（"yesno" 是非題 / "choice" 選擇題）
  yes/no/opt(...) : 答案 -> 下一個問題或演算法
  algorithm.child : (收穫 gain,   具體得到了什麼)
  gain.child      : (終點 outcome, 已解決 / 遇到新問題)
  algorithm.next  : (演算法,       遇到新限制時可以繼續往哪裡走)

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


# ════════════════════════════════════════════
# Layer 1 ── 問題判斷樹 (Decision Tree)
#
# 每個節點是一個問題：
#   - 是非題 (yes/no)：只有「是」「否」兩個答案
#   - 選擇題 (choice)：選項彼此互斥，只會符合其中一個
# 所以同一個問題只會走出「唯一一條路徑」，最後抵達唯一一個演算法。
# ════════════════════════════════════════════
ANSWERS = {}   # (id(question), id(child)) -> 答案文字（顯示在連線上）

def ask(name, desc, qtype):
    q = Node(name, "問題", desc=desc)
    q.qtype = qtype            # "yesno" | "choice"
    return q

def opt(q, answer, child, note=""):
    """q 的答案 answer 通往 child。note = 補充說明（顯示在面板）"""
    q.child.append((child, note or answer))
    ANSWERS[(id(q), id(child))] = answer

def yes(q, child, note=""):
    opt(q, "是", child, note)

def no(q, child, note=""):
    opt(q, "否", child, note)


# ── 第一層：資料是什麼形式？ ──
q_data = ask("資料是什麼形式？ (What kind of input?)",
"先看輸入長什麼樣子。四個選項互斥：\n"
"圖 = 有「點」和「點之間的邊」；字串 = 要對文字做比對或查詢；\n"
"序列 = 一串數字／元素；選擇 = 沒有現成資料要處理，而是要「做一連串決定」或「把問題拆小」。",
"choice")
root.child.append((q_data, "從輸入的形式開始判斷。"))

# ════ A. 圖 ════
q_graph = ask("要求什麼？ (Graph: what is asked?)",
"圖的問題，依照「要輸出什麼」分成五種，彼此互斥。", "choice")
opt(q_data, "圖", q_graph, "有點，也有點與點之間的邊（道路、關係、依賴）。")

q_sp_all = ask("要所有點對，且點很少？ (All pairs, small V?)",
"需要「每一對點」之間的最短距離，而且點數很少（約數百以內）。", "yesno")
opt(q_graph, "最短路徑", q_sp_all, "求某些點之間的最短距離。")
yes(q_sp_all, floyd, "三層迴圈 O(V³)，一次求出所有點對。")

q_weight = ask("邊的權重是？ (Edge weights?)",
"三個選項互斥：沒有權重、全部非負、有負數。", "choice")
no(q_sp_all, q_weight, "只需要從一個起點出發。")
opt(q_weight, "沒有權重", bfs, "每條邊成本相同，第一次走到就是最短。")
opt(q_weight, "全部 ≥ 0", dijkstra, "非負權重，每次確定距離最小的點。")
opt(q_weight, "有負數", bellman, "有負權重，需要 V−1 輪鬆弛，也能偵測負環。")

q_dense = ask("圖很稠密嗎？ (Dense graph, E ≈ V²?)",
"邊數接近 V²（幾乎每兩點之間都有邊）。", "yesno")
opt(q_graph, "最小生成樹", q_dense, "用最小總成本把所有點連起來。")
yes(q_dense, prim, "從一點往外長，配合 Min Heap。")
no(q_dense, kruskal, "邊不多：把邊排序，用 DSU 避免成環。")

opt(q_graph, "排出先後順序", topo, "事情之間有依賴（A 要在 B 之前），要排出合法順序。")
opt(q_graph, "動態判斷連通", dsu, "邊會一直加入，並且反覆問「兩點是否連通」。")
opt(q_graph, "走訪／連通塊／找環", dfs, "只需要走過整張圖，找連通塊、環或路徑。")

# ════ B. 字串 ════
q_str = ask("要對字串做什麼？ (Strings: what to do?)",
"兩個選項互斥：在一段文字裡找模式，或管理很多字串。", "choice")
opt(q_data, "字串", q_str, "要對文字做比對或查詢。")
opt(q_str, "在文字中找模式", kmp, "在長度 n 的文字中找長度 m 的模式。")
opt(q_str, "大量字串／前綴查詢", trie, "存很多字串，並依前綴查詢。")

# ════ C. 序列／陣列 ════
q_task = ask("主要任務是？ (Sequence: main task?)",
"依照「要輸出什麼」分類，七個選項互斥。", "choice")
opt(q_data, "序列／陣列", q_task, "一串數字或元素。")

# C1 排序
q_sort_int = ask("鍵值是範圍小的整數？ (Small integer keys?)",
"鍵值都是整數，而且範圍 k 不比資料量 n 大太多。", "yesno")
opt(q_task, "排序", q_sort_int, "輸出排好序的資料。")
yes(q_sort_int, counting, "直接計數，O(n + k)。")
q_sort_state = ask("資料的狀況？ (Size / order of data?)",
"三個選項互斥。", "choice")
no(q_sort_int, q_sort_state, "需要比較排序。")
opt(q_sort_state, "幾乎已排好", insertion, "大部分元素已在正確位置，插入排序接近 O(n)。")
opt(q_sort_state, "很少且未排好", bubble, "資料量小，用最簡單的方法。")
q_sort_need = ask("最在意什麼？ (What matters most?)",
"三個選項互斥：穩定、最壞保證＋省空間、平均速度。", "choice")
opt(q_sort_state, "很多且未排好", q_sort_need, "需要 O(n log n) 的排序。")
opt(q_sort_need, "穩定", merge, "相同鍵值保持原本順序。")
opt(q_sort_need, "最壞保證＋O(1) 空間", heap_sort, "不能接受 O(n²)，也不能多用記憶體。")
opt(q_sort_need, "平均最快", quick, "平均 O(n log n)，常數小。")

# C2 查找
q_find = ask("資料的狀態？ (Data state for lookup?)",
"三個選項互斥。", "choice")
opt(q_task, "找某個值", q_find, "判斷某個值在不在、在哪裡。")
opt(q_find, "未排序、只查一次", linear, "不值得做前處理，逐一比較。")
opt(q_find, "未排序、查很多次", hash_lookup, "先建 Hash Table，之後每次 O(1)。")
q_uniform = ask("數值分布均勻嗎？ (Uniformly distributed?)",
"已排序的數值大致平均分布。", "yesno")
opt(q_find, "已排序", q_uniform, "可以利用順序排除範圍。")
yes(q_uniform, interpolation, "由數值估算位置，平均 O(log log n)。")
no(q_uniform, binary, "每次排除一半，O(log n)。")

# C3 區間
q_range = ask("區間要做什麼？ (Range: what is asked?)",
"三個選項互斥。", "choice")
opt(q_task, "區間（子陣列）問題", q_range, "答案和某一段連續的子陣列有關。")
opt(q_range, "找符合條件的子陣列", sliding, "最長／最短／個數，左右端點都只往前。")
opt(q_range, "固定視窗的最大／最小", monotonic_queue, "視窗往前滑，每次要視窗內的極值。")
q_update = ask("查詢之間資料會修改？ (Updates between queries?)",
"多次區間查詢之間，陣列的值會不會被改。", "yesno")
opt(q_range, "很多次區間查詢", q_update, "反覆問「[l, r] 的值是多少」。")
no(q_update, prefix, "資料不變：前綴和 O(1) 查詢。")
q_sum_only = ask("只需要區間和嗎？ (Sum only?)",
"只問總和，不問最小值／最大值等其他運算。", "yesno")
yes(q_update, q_sum_only, "需要支援修改。")
yes(q_sum_only, fenwick, "樹狀陣列，程式最短。")
no(q_sum_only, segment, "需要 min / max 或區間修改 → 線段樹。")

# C4~C7
opt(q_task, "反覆取最大／最小", heap, "資料不斷加入或移除，每次要目前的極值。")
opt(q_task, "每個元素找最近的較大／較小", monotonic_stack, "對每個位置找左邊或右邊第一個更大（小）的元素。")
opt(q_task, "找一對元素滿足條件", two_pointers, "資料已排序（或可先排序），找兩個數的組合。")
opt(q_task, "找最小（大）的可行答案", binary_answer, "能檢查「答案 x 可不可行」，且可行性隨 x 單調。")

# ════ D. 做一連串選擇／拆解問題 ════
q_greedy = ask("每步選最好就是最佳？ (Greedy choice provable?)",
"能證明：每一步都選「目前看起來最好」的，最後就是全域最佳解。", "yesno")
opt(q_data, "做選擇／拆解問題", q_greedy, "沒有現成資料要處理，而是要做一連串決定或把問題拆小。")
yes(q_greedy, greedy, "直接貪婪，通常排序後一次掃描。")
q_overlap = ask("子問題會重複出現嗎？ (Overlapping subproblems?)",
"拆解時，同一個「狀態」會被算很多次。", "yesno")
no(q_greedy, q_overlap, "貪婪不保證最佳（或找得到反例）。")
q_dp_order = ask("大部分狀態都要算，且順序好排？ (Fill the whole table?)",
"幾乎所有狀態都會用到，而且能排出由小到大的計算順序。", "yesno")
yes(q_overlap, q_dp_order, "這就是動態規劃 (DP)：每個狀態只算一次。")
yes(q_dp_order, tabulation, "Bottom-up：依序填表。")
no(q_dp_order, memo, "Top-down：遞迴＋快取，只算需要的狀態。")
q_goal = ask("要的答案是？ (What answer is needed?)",
"三個選項互斥。", "choice")
no(q_overlap, q_goal, "子問題各自獨立。")
opt(q_goal, "列出所有可行解", backtracking, "逐步選擇，不合法就退回。")
q_bound = ask("能估計分支的上下界嗎？ (Bounds available?)",
"對一個部分解，能算出「最好也只能到多少」。", "yesno")
opt(q_goal, "一個最佳解", q_bound, "要在所有可能中找最好的。")
yes(q_bound, branch_bound, "用界限剪掉不可能更好的分支。")
no(q_bound, brute, "只能全部試過。")
q_merge = ask("拆成多個獨立子問題再合併？ (Split & merge?)",
"切成兩個以上互不重疊的子問題，各自解完後合併。", "yesno")
opt(q_goal, "由子問題組合出答案", q_merge, "答案可以由較小問題的答案算出。")
yes(q_merge, divide_conquer, "分治法：切、解、合併。")
no(q_merge, recursion, "一般遞迴：每次縮小一點。")


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


# ════════════════════════════════════════════
# Layer 4 ── 繼續或解決 (Continue or Solved)
# ════════════════════════════════════════════
outcome = Node("繼續或已解決 (Continue or Solved)", "終點",
desc="問題已經解決 → 結束。\n"
     "還不夠快、或出現新的限制 → 帶著新的特性回到「問題發現」，繼續往下走。")
for g in [g_baseline, g_log, g_lookup, g_sorted, g_linear, g_range, g_extreme,
          g_structure, g_dp, g_search, g_shortest, g_conn, g_mst, g_order, g_text]:
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
        if n.category == "問題":
            base = "q-" + base
        elif n.category == "收穫":
            base = "gain-" + base
        while base in ids.values():
            base += "-2"
        ids[id(n)] = base
        order.append(n)
        for child, _ in n.child:
            visit(child)

    visit(root)

    def kind_of(n):
        return {"root": "root", "問題": "question", "收穫": "gain", "終點": "outcome"}.get(n.category, "algorithm")

    # 檢查：判斷樹必須是真正的樹 —— 每個問題／演算法只有一個上層，所以路徑唯一
    tree_parents = {}
    for n in order:
        if n is root or n.category == "問題":
            for child, _ in n.child:
                tree_parents.setdefault(id(child), []).append(n.name)
    for n in order:
        if kind_of(n) in ("question", "algorithm"):
            ps = tree_parents.get(id(n), [])
            assert len(ps) == 1, f"{n.name} 應該只有一個上層，但有 {len(ps)} 個: {ps}"
        if n.category == "問題":
            answers = [ANSWERS[(id(n), id(c))] for c, _ in n.child]
            assert len(answers) == len(set(answers)), f"{n.name} 的答案重複: {answers}"
            if n.qtype == "yesno":
                assert sorted(answers) == ["否", "是"], f"{n.name} 是非題需要「是」和「否」: {answers}"
            else:
                assert len(answers) >= 2, f"{n.name} 選擇題至少要兩個選項"
        if kind_of(n) == "algorithm":
            assert n.child, f"{n.name} 沒有連到任何收穫"

    nodes, edges, nexts = [], [], []
    for n in order:
        zh, en = split_name(n.name)
        kind = kind_of(n)
        nodes.append({"id": ids[id(n)], "labelZh": zh, "label": en, "kind": kind,
                      "category": n.category, "time": n.time, "space": n.space,
                      "ds": n.ds, "desc": n.desc.strip(),
                      "qtype": getattr(n, "qtype", "")})
        for child, reason in n.child:
            edges.append({"from": ids[id(n)], "to": ids[id(child)],
                          "reason": reason.strip(), "kind": kind_of(child),
                          "answer": ANSWERS.get((id(n), id(child)), "")})
        for target, reason in n.next:
            nexts.append({"from": ids[id(n)], "to": ids[id(target)], "reason": reason.strip()})

    body = ("// ── Algorithm Tree Data ──\n"
            "// AUTO-GENERATED by algorithm_tree.py — edit the Python file, then run:\n"
            "//   python algorithm_tree.py\n"
            "// Flow: 問題發現 → 判斷樹（是非題／選擇題）→ 可用的演算法 → 得到了什麼 → 繼續或解決\n\n"
            "export type AlgoNodeKind = 'root' | 'question' | 'algorithm' | 'gain' | 'outcome';\n\n"
            "export interface AlgoNode {\n  id: string;\n  label: string;\n  labelZh: string;\n"
            "  kind: AlgoNodeKind;\n  category: string;\n  time: string;\n  space: string;\n"
            "  ds: string;\n  desc: string;\n  /** question nodes: 'yesno' 是非題 | 'choice' 選擇題 */\n  qtype: '' | 'yesno' | 'choice';\n}\n\n"
            "/** kind = the kind of the edge's target node */\n"
            "export interface AlgoEdge {\n  from: string;\n  to: string;\n  reason: string;\n"
            "  kind: AlgoNodeKind;\n  /** answer to the question (是 / 否 / option text) */\n  answer: string;\n}\n\n"
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
    print(f"Exported {count('question')} questions, {count('algorithm')} algorithms, "
          f"{count('gain')} gains, {len(edges)} edges, {len(nexts)} continue-paths -> {path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    export(os.path.join(here, "web_src", "src", "algoTreeData.ts"))
