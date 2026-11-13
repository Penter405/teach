"""The program each animation runs. One spec per animation id.
src    the code shown in the animation (traced one action per step)
env    things that exist before the program starts (helpers treated as one action, like len())
notes  {line: text} extra explanation added to the 執行後 text (first time; (text, True) = every time)
"""
import heapq, math
from bisect import bisect_left
from decimal import Decimal, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_FLOOR, ROUND_CEILING
from collections import deque

INF = float('inf')

# helpers used as black boxes (one step each)
def ok(r, c):
    """4 queens: is (r, c) safe given place (read from the caller's global)"""
    for qr, qc in enumerate(SPECS_STATE['g']['place']):
        if qc == c or abs(qr - r) == abs(qc - c):
            return False
    return True

SPECS_STATE = {}

def hours(piles, k):
    return sum((p + k - 1) // k for p in piles)

def farthest(adj, s):
    dist = [-1] * len(adj); dist[s] = 0; q = deque([s])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1: dist[v] = dist[u] + 1; q.append(v)
    far = max(range(len(adj)), key=lambda i: dist[i])
    return far, dist[far]

def find(x):
    while PARENT[x] != x:
        x = PARENT[x]
    return x

PARENT = [0, 1, 2, 3]

SPECS = {}

# ───────────── math ─────────────
SPECS[38] = dict(caption='試除法：is_prime(91)，只試到 √n', intro='91 = 7 × 13，看起來像質數', src='''
def is_prime(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

print(is_prime(91))
''', notes={'while d * d': ('d * d <= n 就是 d ≤ √n：只試到 √91 ≈ 9.5', True), 'return False\n        d': '找到因數，不用再試下去'})

SPECS[39] = dict(caption='埃氏篩：sieve(20)，從 p² 開始劃掉倍數', intro='is_p[i] 代表 i 是不是質數', src='''
n = 20
is_p = [True] * (n + 1)
is_p[0] = False
is_p[1] = False
p = 2
while p * p <= n:
    if is_p[p]:
        for m in range(p * p, n + 1, p):
            is_p[m] = False
    p += 1
''', notes={'if is_p[p]': ('is_p[p] 還是 True → p 是質數', True), 'for m in': '從 p² 開始：比 p² 小的倍數早就被更小的質數劃掉了'})

SPECS[60] = dict(caption='快速冪：fast_pow(2, 10)，10 → 5 → 2 → 1 → 0', intro='用分治：xⁿ = (x^(n//2))²，奇數再多乘一個 x', src='''
def fast_pow(x, n):
    if n == 0:
        return 1
    half = fast_pow(x, n // 2)
    if n % 2 == 0:
        return half * half
    return half * half * x

print(fast_pow(2, 10))
''')

SPECS[90] = dict(caption='捨入規則：2.5 和 2.675 要往哪邊走', intro='Decimal 用字串建立才準', env=dict(Decimal=Decimal, ROUND_HALF_UP=ROUND_HALF_UP, ROUND_HALF_EVEN=ROUND_HALF_EVEN), src='''
x = Decimal("2.5")
up = x.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
even = x.quantize(Decimal("1"), rounding=ROUND_HALF_EVEN)
r = round(2.5)
f = Decimal(2.675)
d = Decimal("2.675")
ans = d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
''', notes={'up =': 'HALF_UP：剛好一半 → 遠離 0', 'even =': 'HALF_EVEN：剛好一半 → 取偶數', 'r = round': 'round() 用的就是 HALF_EVEN', 'f = Decimal': 'float 的 2.675 其實存成 2.67499999…', 'ans =': '用字串建立的 Decimal 才是真的 2.675'})

SPECS[91] = dict(caption='輾轉相除：gcd(48, 18)，用正方形切長方形', intro='a × b 的長方形，每次切掉最大的正方形', src='''
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

print(gcd(48, 18))
''', notes={'a, b = b': ('a % b = 切掉 b × b 的正方形之後剩下的寬', True)})

# ───────────── data structure ─────────────
SPECS[92] = dict(caption='二元樹 ↔ list：index i 的子節點是 2i+1、2i+2', intro='一層一層、由左到右放進 list', src='''
tree = [1, 2, 3, 4, 5, 6, 7]
i = 1
left = tree[2 * i + 1]
right = tree[2 * i + 2]
j = 5
parent = tree[(j - 1) // 2]
''', notes={'left =': '節點 2 的左子節點', 'right =': '節點 2 的右子節點', 'parent =': '節點 6 的父節點'})

SPECS[54] = dict(caption='heap：push 5, 3, 8, 1，每次往上換（上浮）', intro='規則：父節點 ≤ 子節點，所以最小的在 h[0]', src='''
def push(h, x):
    h.append(x)
    i = len(h) - 1
    while i > 0:
        p = (i - 1) // 2
        if h[p] <= h[i]:
            break
        h[p], h[i] = h[i], h[p]
        i = p

h = []
push(h, 5)
push(h, 3)
push(h, 8)
push(h, 1)
''', notes={'p = (i - 1)': ('p 是 i 的父節點', True), 'break': ('父節點已經比較小 → 位置對了', True), 'h[p], h[i] =': ('比父節點小 → 交換，往上一層', True)})

SPECS[55] = dict(caption='單調堆疊：[2,1,5,3,6,4] 的下一個更大元素', intro='堆疊放「還沒找到答案」的 index，由下到上遞減', src='''
a = [2, 1, 5, 3, 6, 4]
ans = [-1] * len(a)
stack = []
for i, x in enumerate(a):
    while stack and a[stack[-1]] < x:
        ans[stack.pop()] = x
    stack.append(i)
''', notes={'ans[stack.pop()]': ('堆疊頂端比 x 小：它右邊第一個更大的就是 x', True), 'stack.append(i)': ('x 自己進堆疊等答案', True)})

SPECS[56] = dict(caption='單調佇列：[1,3,-1,-3,5,3]，k = 3 的視窗最大值', intro='deque 放可能成為最大值的 index，由前到後遞減', src='''
a = [1, 3, -1, -3, 5, 3]
k = 3
dq = deque()
res = []
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x:
        dq.pop()
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()
    if i >= k - 1:
        res.append(a[dq[0]])
''', notes={'dq.pop()': ('比 x 小的以後都不可能是最大 → 從後面踢掉', True), 'dq.popleft()': ('最前面的已經滑出視窗', True), 'res.append': ('最前面的就是這個視窗的最大值', True)})

SPECS[57] = dict(caption='並查集：union 與 find（路徑壓縮）', intro='parent[i] = i 的父節點；root 的父節點是自己', src='''
parent = [0, 1, 2, 3, 4, 5]

def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]

def union(a, b):
    ra = find(a)
    rb = find(b)
    if ra != rb:
        parent[rb] = ra

union(0, 1)
union(2, 3)
union(1, 3)
find(3)
''', notes={'parent[x] = find': ('路徑壓縮：直接接到 root', True), 'parent[rb] = ra': ('把一棵樹的 root 接到另一棵的 root 底下', True)})

SPECS[73] = dict(caption='Fenwick tree：查詢往下跳 i -= i&-i，更新往上跳 i += i&-i', intro='a = [5, 2, 9, 1, 6, 3, 8, 4]（1-indexed）；tree[i] 管「i 往左數 lowbit(i) 個」', src='''
tree = [0, 5, 7, 9, 17, 6, 9, 8, 38]

def prefix_sum(i):
    total = 0
    while i > 0:
        total += tree[i]
        i -= i & -i
    return total

def update(i, delta):
    while i < len(tree):
        tree[i] += delta
        i += i & -i

print(prefix_sum(7))
update(3, 2)
''', notes={'i -= i & -i': ('i & -i 只留最右邊的 1：去掉它，往下跳', True), 'i += i & -i': ('往上跳到下一個「範圍包含 i」的格子', True)})

# ───────────── binary search ─────────────
SPECS[41] = dict(caption='二分搜尋：在 [1,3,4,4,4,7,9,12] 找最左邊的 4', intro='a 已經排好序；左閉右開 [lo, hi)', src='''
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
''', notes={'hi = mid': ('mid 可能就是答案，留著；左邊可能還有', True), 'lo = mid + 1': ('mid 太小，連它一起丟掉', True), 'return lo': 'lo == hi：只剩一個可能，就是答案'})

SPECS[44] = dict(caption='二分答案：piles = [3,6,7,11]，8 小時內吃完的最小速度', intro='hours(piles, k) = 速度 k 要吃幾小時（每堆無條件進位）；速度越快越容易成立', env=dict(hours=hours), src='''
piles = [3, 6, 7, 11]
h = 8
lo = 1
hi = max(piles)
while lo < hi:
    mid = (lo + hi) // 2
    if hours(piles, mid) <= h:
        hi = mid
    else:
        lo = mid + 1
print(lo)
''', notes={'hi = mid': ('✓ mid 可以 → 答案是 mid 或更小', True), 'lo = mid + 1': ('✗ mid 太慢 → 答案比 mid 大', True)})

# ───────────── recursion ─────────────
SPECS[59] = dict(caption='遞迴：fact(4) 的 call stack 堆高再回傳', intro='fact(n) = n × fact(n − 1)，fact(1) = 1', src='''
def fact(n):
    if n == 1:
        return 1
    return n * fact(n - 1)

print(fact(4))
''', notes={'return 1': 'base case：不再呼叫自己，stack 從這裡開始往回收'})

SPECS[62] = dict(caption='回溯：4 皇后（ok(r, c) = 這格安不安全）', intro='一列放一個皇后；place[r] = 第 r 列放在第幾行', env=dict(ok=ok), src='''
n = 4
place = []

def go(r):
    if r == n:
        return True
    for c in range(n):
        if ok(r, c):
            place.append(c)
            if go(r + 1):
                return True
            place.pop()
    return False

go(0)
''', notes={'place.append(c)': ('放下去，往下一列', True), 'place.pop()': ('這條路走不通 → 拿掉剛剛放的（還原）', True), 'return False': ('這一列每一格都不行 → 退回上一列', True)})

# ───────────── tree ─────────────
SPECS[78] = dict(caption='前序走訪：node → left → right（-1 = 沒有子節點）', intro='樹：1 的子節點 2、3；2 的子節點 4、5；3 的左子節點 6', src='''
left = [-1, 2, 4, 6, -1, -1, -1]
right = [-1, 3, 5, -1, -1, -1, -1]
out = []

def preorder(node):
    if node == -1:
        return
    out.append(node)
    preorder(left[node])
    preorder(right[node])

preorder(1)
''', notes={'out.append(node)': ('先記下自己（pre = node 在最前面）', True)})

SPECS[81] = dict(caption='樹的直徑：兩次 BFS（farthest = BFS 找最遠的點）', intro='樹：6 – 0 – 1 – 3 – 4 – 5，1 – 2', env=dict(farthest=farthest), src='''
adj = [[1, 6], [0, 2, 3], [1], [1, 4], [3, 5], [4], [0]]
A, dA = farthest(adj, 0)
B, d = farthest(adj, A)
print(d)
''', notes={'A, dA': '從任何一點出發，最遠的點一定是直徑的一端', 'B, d': '從 A 出發最遠的點 B，A 到 B 就是直徑'})

# ───────────── graph ─────────────
G6 = '[[1, 2], [0, 3, 4], [0, 5], [1], [1, 5], [2, 4]]'
SPECS[76] = dict(caption='BFS：用 queue 一圈一圈往外走', intro='圖：0–1、0–2、1–3、1–4、2–5、4–5', src=f'''
adj = {G6}
dist = [-1] * 6
dist[0] = 0
q = deque([0])
while q:
    u = q.popleft()
    for v in adj[u]:
        if dist[v] == -1:
            dist[v] = dist[u] + 1
            q.append(v)
''', notes={'if dist[v] == -1': ('-1 = 還沒走到', True), 'dist[v] = dist[u] + 1': ('第一次走到就是最短距離', True), 'q.append(v)': ('放進 queue 時就已經標記了，不會重複放', True)})

SPECS[77] = dict(caption='DFS：一條路走到底，沒路了再退回', intro='同一張圖：0–1、0–2、1–3、1–4、2–5、4–5', src=f'''
adj = {G6}
seen = [False] * 6
order = []

def dfs(u):
    seen[u] = True
    order.append(u)
    for v in adj[u]:
        if not seen[v]:
            dfs(v)

dfs(0)
''', notes={'dfs(v)': ('往沒走過的鄰居走下去', True)})

SPECS[79] = dict(caption='拓樸排序（Kahn）：入度變 0 就可以做', intro='先修關係：0→2、1→2、2→3、1→4、4→3', src='''
adj = [[2], [2, 4], [3], [], [3]]
indeg = [0, 0, 0, 0, 0]
for u in range(5):
    for v in adj[u]:
        indeg[v] += 1
q = deque()
for i in range(5):
    if indeg[i] == 0:
        q.append(i)
order = []
while q:
    u = q.popleft()
    order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)
''', notes={'indeg[v] += 1': ('有一條邊指向 v → v 多一個要等的', True), 'q.append(i)': ('沒有要等的 → 現在就能做', True), 'indeg[v] -= 1': ('u 做完了，v 少一個要等的', True)})

SPECS[80] = dict(caption='二分圖判定：BFS 塗兩種顏色', intro='正方形 0–1–2–3–0；color 0 = 紅、1 = 藍、-1 = 還沒塗', src='''
adj = [[1, 3], [0, 2], [1, 3], [0, 2]]
color = [-1, -1, -1, -1]
color[0] = 0
q = deque([0])
ok = True
while q:
    u = q.popleft()
    for v in adj[u]:
        if color[v] == -1:
            color[v] = 1 - color[u]
            q.append(v)
        elif color[v] == color[u]:
            ok = False
print(ok)
''', notes={'color[v] = 1 - color[u]': ('塗和 u 相反的顏色', True), 'ok = False': ('兩端同色就不是二分圖', True)})

SPECS[83] = dict(caption='Dijkstra：每次確定最近的點，再鬆弛它的鄰居', intro='A=0、B=1、C=2、D=3；邊 A–B 4、A–C 1、C–B 2、B–D 1、C–D 5', env=dict(INF=INF, heappush=heapq.heappush, heappop=heapq.heappop), src='''
adj = [[(1, 4), (2, 1)], [(0, 4), (2, 2), (3, 1)], [(0, 1), (1, 2), (3, 5)], [(1, 1), (2, 5)]]
dist = [INF] * 4
dist[0] = 0
pq = [(0, 0)]
while pq:
    d, u = heappop(pq)
    if d > dist[u]:
        continue
    for v, w in adj[u]:
        if d + w < dist[v]:
            dist[v] = d + w
            heappush(pq, (dist[v], v))
''', notes={'d, u = heappop': ('heap 裡最小的：還沒確定的點裡，目前最近的', True), 'continue': ('舊的資料：u 早就確定了', True), 'if d + w': ('經過 u 再走到 v 比較近嗎？', True), 'dist[v] = d + w': ('鬆弛：找到更短的路就更新', True)})

SPECS[86] = dict(caption='Kruskal：邊由短到長，會形成環的跳過（find = 找 root）', intro='邊已經由短到長排好；A=0、B=1、C=2、D=3', env=dict(find=find), src='''
edges = [(1, 0, 2), (1, 1, 3), (2, 2, 1), (4, 0, 1), (5, 2, 3)]
total = 0
for w, u, v in edges:
    ru = find(u)
    rv = find(v)
    if ru == rv:
        continue
    PARENT[ru] = rv
    total += w
''', notes={'if ru == rv': ('同一群：連上去會形成環', True), 'continue': ('跳過這條邊', True), 'PARENT[ru] = rv': ('不同群：連上，兩群合併', True)})

SPECS[87] = dict(caption='Prim：從 A 開始長出去，每次挑最便宜的邊', intro='A=0、B=1、C=2、D=3；邊 A–B 4、A–C 1、C–B 2、B–D 1、C–D 5', env=dict(heappush=heapq.heappush, heappop=heapq.heappop), src='''
adj = [[(1, 4), (2, 1)], [(0, 4), (2, 2), (3, 1)], [(0, 1), (1, 2), (3, 5)], [(1, 1), (2, 5)]]
in_tree = [False] * 4
pq = [(0, 0)]
total = 0
while pq:
    w, u = heappop(pq)
    if in_tree[u]:
        continue
    in_tree[u] = True
    total += w
    for v, wv in adj[u]:
        if not in_tree[v]:
            heappush(pq, (wv, v))
''', notes={'w, u = heappop': ('拿出最便宜的候選邊', True), 'continue': ('另一端已經在樹裡 → 用了會有環', True), 'in_tree[u] = True': ('u 進樹', True)})

# ───────────── DP ─────────────
SPECS[65] = dict(caption='記憶化：fib(5) 同樣的 argument 只算一次', intro='沒有記憶化要呼叫 15 次', src='''
memo = {}

def fib(n):
    if n < 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]

print(fib(5))
''', notes={'return memo[n]\n    memo': ('算過了 → 直接從 memo 拿，下面整枝都不用算', True), 'memo[n] = fib': ('算完存進 memo', True)})

SPECS[66] = dict(caption='1D DP：爬樓梯，dp[i] = dp[i-1] + dp[i-2]', intro='一次爬 1 或 2 階；dp[i] = 爬到第 i 階有幾種方法', src='''
n = 6
dp = [0] * (n + 1)
dp[0] = 1
dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]
print(dp[n])
''', notes={'dp[i] = dp': ('最後一步不是跨 1 階就是跨 2 階', True)})

SPECS[67] = dict(caption='0/1 背包：容量 3，物品 (重 1, 值 6)、(重 2, 值 10)', intro='dp[i][c] = 只看前 i 個物品、容量 c 的最大價值', src='''
items = [(1, 6), (2, 10)]
dp = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
for i in range(1, 3):
    w, v = items[i - 1]
    for c in range(4):
        dp[i][c] = dp[i - 1][c]
        if c >= w:
            dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)
print(dp[2][3])
''', notes={'dp[i][c] = dp[i - 1][c]': ('不拿第 i 個：和上一列一樣', True), 'dp[i][c] = max': ('拿第 i 個：上一列往左 w 格 + v（只看上一列 → 每個物品最多拿一次）', True)})

SPECS[68] = dict(caption='無限背包：硬幣 {1, 3, 4} 湊 6 最少幾枚', intro='dp[c] = 湊出 c 元最少要幾枚', env=dict(INF=INF), src='''
coins = [1, 3, 4]
dp = [0, INF, INF, INF, INF, INF, INF]
for coin in coins:
    for c in range(coin, 7):
        dp[c] = min(dp[c], dp[c - coin] + 1)
print(dp[6])
''', notes={'dp[c] = min': ('c 從小到大：dp[c − coin] 可能已經用過這枚硬幣，沒關係（可以重複用）', True)})

SPECS[70] = dict(caption='LIS：memo + 二分搜尋（bisect_left 找第一個 ≥ x 的位置）', intro='memo[k] = 長度 k+1 的遞增子序列，結尾最小可以是多少', env=dict(bisect_left=bisect_left), src='''
a = [3, 1, 4, 1, 5, 9, 2, 6]
memo = []
for x in a:
    i = bisect_left(memo, x)
    if i == len(memo):
        memo.append(x)
    else:
        memo[i] = x
print(len(memo))
''', notes={'memo.append(x)': ('比 memo 全部都大 → 接在最後，變長', True), 'memo[i] = x': ('換掉：同樣長度，結尾變小，以後更好接', True)})

SPECS[71] = dict(caption='區間 DP：石頭合併 [3, 4, 5]，按區間長度填表', intro='dp[l][r] = 把第 l ～ r 堆合併成一堆的最小代價；pre = 前綴和', env=dict(INF=INF), src='''
pre = [0, 3, 7, 12]
dp = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
for length in range(2, 4):
    for l in range(4 - length):
        r = l + length - 1
        best = INF
        for k in range(l, r):
            best = min(best, dp[l][k] + dp[k + 1][r])
        dp[l][r] = best + pre[r + 1] - pre[l]
print(dp[0][2])
''', notes={'best = min': ('從 k 和 k+1 中間切一刀', True), 'dp[l][r] = best': ('最後一次合併的代價 = 區間總和', True)})

SPECS[82] = dict(caption='環 DP：4 → 3 → 2 → 1 → 2，先找環再往回填答案', intro='nxt[i] = i 的下一個點；state 0 沒走過、1 走到一半、2 完成', src='''
nxt = [0, 2, 1, 2, 3]
ans = [0, 0, 0, 0, 0]
state = [0, 0, 0, 0, 0]
path = []
u = 4
while state[u] == 0:
    state[u] = 1
    path.append(u)
    u = nxt[u]
size = len(path) - path.index(u)
for j in range(size):
    x = path.pop()
    ans[x] = size
    state[x] = 2
while path:
    x = path.pop()
    ans[x] = 1 + ans[nxt[x]]
    state[x] = 2
''', notes={'state[u] = 1': ('標記「走到一半」', True), 'size =': '碰到走到一半的點 → 找到環', 'ans[x] = size': ('環上的點：答案 = 環長', True), 'ans[x] = 1 +': ('環外的點：1 + 下一個點的答案', True)})

SPECS[61] = dict(caption='bitmask：mask = 5 (101₂) 代表選哪些數', intro='nums = [3, 5, 2]；第 i 位是 1 → 選 nums[i]', src='''
nums = [3, 5, 2]
mask = 5
pick = []
for i in range(3):
    if mask >> i & 1:
        pick.append(nums[i])
print(bin(mask), pick)
''', notes={'if mask >> i': ('mask >> i & 1 = mask 的第 i 位', True)})

# Kruskal's find reads PARENT: make it part of env so the snapshot shows it
SPECS[86]['env']['PARENT'] = PARENT

CALLDESC = {'ok': '檢查 (r, c) 會不會被前面的皇后攻擊', 'hours': '算速度 mid 要吃幾小時', 'farthest': 'BFS：找最遠的點和距離',
            'find': '找 root（一直往 parent 走）', 'bisect_left': '二分搜尋：第一個 ≥ x 的位置',
            'Decimal': '做出 Decimal（十進位的數）', 'quantize': '依格式和規則捨入', 'round': '內建的捨入', 'enumerate': '一次拿 index 和值'}
