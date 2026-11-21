"""The program each animation runs. One spec per animation id.
src    the code shown in the animation (traced one action per step)
env    things that exist before the program starts (helpers treated as one action, like len())
calldesc {name: text} description of an env helper for this spec only (overrides CALLDESC, e.g. two specs both call add)
notes  {line: text} extra explanation added to the 執行後 text (first time; (text, True) = every time)
"""
import heapq, math
from bisect import bisect_left
from decimal import Decimal, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_FLOOR, ROUND_CEILING
from collections import deque, defaultdict

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

PARENT = [0, 1, 2]

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

SPECS[39] = dict(caption='埃氏篩：sieve(12)，從 p² 開始劃掉倍數', intro='is_p[i] 代表 i 是不是質數', src='''
n = 12
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

SPECS[54] = dict(caption='heap：push 5, 3, 1，每次往上換（上浮）', intro='規則：父節點 ≤ 子節點，所以最小的在 h[0]', src='''
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
push(h, 1)
''', notes={'p = (i - 1)': ('p 是 i 的父節點', True), 'break': ('父節點已經比較小 → 位置對了', True), 'h[p], h[i] =': ('比父節點小 → 交換，往上一層', True)})

SPECS[55] = dict(caption='單調堆疊：[2,1,5,3] 的下一個更大元素', intro='堆疊放「還沒找到答案」的 index，由下到上遞減', src='''
a = [2, 1, 5, 3]
ans = [-1] * len(a)
stack = []
for i, x in enumerate(a):
    while stack and a[stack[-1]] < x:
        ans[stack.pop()] = x
    stack.append(i)
''', notes={'ans[stack.pop()]': ('堆疊頂端比 x 小：它右邊第一個更大的就是 x', True), 'stack.append(i)': ('x 自己進堆疊等答案', True)})

SPECS[56] = dict(caption='單調佇列：[3,1,2,0]，k = 2 的視窗最大值', intro='deque 放可能成為最大值的 index，由前到後遞減', src='''
a = [3, 1, 2, 0]
k = 2
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
parent = [0, 1, 2]

def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]

def union(a, b):
    ra = find(a)
    rb = find(b)
    if ra != rb:
        parent[rb] = ra

union(1, 2)
union(0, 1)
find(2)
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

SPECS[62] = dict(caption='回溯：4 皇后，第 0 列已經放在第 0 行，看它怎麼一路試、一路退回', intro='一列放一個皇后；place[r] = 第 r 列放在第幾行。第 0 列已經放好，從第 1 列開始試', env=dict(ok=ok), src='''
n = 4
place = [0]

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

go(1)
''', notes={'place.append(c)': ('放下去，往下一列', True), 'place.pop()': ('這條路走不通 → 拿掉剛剛放的（還原）', True), 'return False': ('這一列每一格都不行 → 退回上一列', True)})

# ───────────── tree ─────────────
SPECS[78] = dict(caption='前序走訪：node → left → right（-1 = 沒有子節點）', intro='樹：1 的子節點 2、3；2 的左子節點 4', src='''
left = [-1, 2, 4, -1, -1]
right = [-1, 3, -1, -1, -1]
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
G6 = '[[1, 2], [0, 3], [0, 3], [1, 2]]'
SPECS[76] = dict(caption='BFS：用 queue 一圈一圈往外走', intro='圖：0–1、0–2、1–3、2–3（3 可以從 1 也可以從 2 走到）', src=f'''
adj = {G6}
dist = [-1] * 4
dist[0] = 0
q = deque([0])
while q:
    u = q.popleft()
    for v in adj[u]:
        if dist[v] == -1:
            dist[v] = dist[u] + 1
            q.append(v)
''', notes={'if dist[v] == -1': ('-1 = 還沒走到', True), 'dist[v] = dist[u] + 1': ('第一次走到就是最短距離', True), 'q.append(v)': ('放進 queue 時就已經標記了，不會重複放', True)})

SPECS[77] = dict(caption='DFS：一條路走到底，沒路了再退回', intro='同一張圖：0–1、0–2、1–3、2–3', src=f'''
adj = {G6}
seen = [False] * 4
order = []

def dfs(u):
    seen[u] = True
    order.append(u)
    for v in adj[u]:
        if not seen[v]:
            dfs(v)

dfs(0)
''', notes={'dfs(v)': ('往沒走過的鄰居走下去', True)})

SPECS[79] = dict(caption='拓樸排序（Kahn）：入度變 0 就可以做', intro='先修關係：0→2、1→2、2→3、1→3；indeg = 每個點有幾條邊指向它（要先等幾個）', src='''
adj = [[2], [2, 3], [3], []]
indeg = [0, 0, 2, 2]
q = deque()
for i in range(4):
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
''', notes={'q.append(i)': ('沒有要等的 → 現在就能做', True), 'indeg[v] -= 1': ('u 做完了，v 少一個要等的', True)})

SPECS[80] = dict(caption='二分圖判定：三角形 0–1–2，BFS 塗兩種顏色', intro='三角形 0–1–2（奇數長度的環）；color 0 = 紅、1 = 藍、-1 = 還沒塗', src='''
adj = [[1, 2], [0, 2], [0, 1]]
color = [-1, -1, -1]
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

SPECS[83] = dict(caption='Dijkstra：每次確定最近的點，再鬆弛它的鄰居', intro='A=0、B=1、C=2；邊 A–B 4、A–C 1、C–B 2', env=dict(INF=INF, heappush=heapq.heappush, heappop=heapq.heappop), src='''
adj = [[(1, 4), (2, 1)], [(0, 4), (2, 2)], [(0, 1), (1, 2)]]
dist = [INF] * 3
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

SPECS[86] = dict(caption='Kruskal：邊由短到長，會形成環的跳過（find = 找 root）', intro='邊已經由短到長排好；A=0、B=1、C=2', env=dict(find=find), src='''
edges = [(1, 0, 2), (2, 2, 1), (4, 0, 1)]
total = 0
for w, u, v in edges:
    ru = find(u)
    rv = find(v)
    if ru == rv:
        continue
    PARENT[ru] = rv
    total += w
''', notes={'if ru == rv': ('同一群：連上去會形成環', True), 'continue': ('跳過這條邊', True), 'PARENT[ru] = rv': ('不同群：連上，兩群合併', True)})

SPECS[87] = dict(caption='Prim：從 A 開始長出去，每次挑最便宜的邊', intro='A=0、B=1、C=2；邊 A–B 4、A–C 1、C–B 2', env=dict(heappush=heapq.heappush, heappop=heapq.heappop), src='''
adj = [[(1, 4), (2, 1)], [(0, 4), (2, 2)], [(0, 1), (1, 2)]]
in_tree = [False] * 3
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
SPECS[65] = dict(caption='記憶化：fib(4) 同樣的 argument 只算一次', intro='沒有記憶化要呼叫 9 次', src='''
memo = {}

def fib(n):
    if n < 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]

print(fib(4))
''', notes={'return memo[n]\n    memo': ('算過了 → 直接從 memo 拿，下面整枝都不用算', True), 'memo[n] = fib': ('算完存進 memo', True)})

SPECS[66] = dict(caption='1D DP：爬樓梯，dp[i] = dp[i-1] + dp[i-2]', intro='一次爬 1 或 2 階；dp[i] = 爬到第 i 階有幾種方法', src='''
n = 4
dp = [0] * (n + 1)
dp[0] = 1
dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]
print(dp[n])
''', notes={'dp[i] = dp': ('最後一步不是跨 1 階就是跨 2 階', True)})

SPECS[67] = dict(caption='0/1 背包：容量 2，物品 (重 1, 值 6)、(重 2, 值 10)', intro='dp[i][c] = 只看前 i 個物品、容量 c 的最大價值；prev = 上一列、cur = 這一列', src='''
items = [(1, 6), (2, 10)]
dp = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
for i in range(1, 3):
    w, v = items[i - 1]
    prev = dp[i - 1]
    cur = dp[i]
    for c in range(3):
        cur[c] = prev[c]
        if c >= w:
            cur[c] = max(cur[c], prev[c - w] + v)
print(dp[2][2])
''', notes={'cur[c] = prev[c]': ('不拿第 i 個：和上一列一樣', True), 'cur[c] = max': ('拿第 i 個：上一列往左 w 格 + v（只看上一列 → 每個物品最多拿一次）', True)})

SPECS[68] = dict(caption='無限背包：硬幣 {1, 3, 4} 湊 6 最少幾枚', intro='dp[c] = 湊出 c 元最少要幾枚；只用 1 元硬幣時 dp[c] = c，接著把 3 元、4 元也拿來試', src='''
coins = [3, 4]
dp = [0, 1, 2, 3, 4, 5, 6]
for coin in coins:
    for c in range(coin, 7):
        dp[c] = min(dp[c], dp[c - coin] + 1)
print(dp[6])
''', notes={'dp[c] = min': ('c 從小到大：dp[c − coin] 可能已經用過這枚硬幣，沒關係（可以重複用）', True)})

SPECS[70] = dict(caption='LIS：memo + 二分搜尋（bisect_left 找第一個 ≥ x 的位置）', intro='memo[k] = 長度 k+1 的遞增子序列，結尾最小可以是多少', env=dict(bisect_left=bisect_left), src='''
a = [3, 1, 4, 2]
memo = []
for x in a:
    i = bisect_left(memo, x)
    if i == len(memo):
        memo.append(x)
    else:
        memo[i] = x
print(len(memo))
''', notes={'memo.append(x)': ('比 memo 全部都大 → 接在最後，變長', True), 'memo[i] = x': ('換掉：同樣長度，結尾變小，以後更好接', True)})

SPECS[71] = dict(caption='區間 DP：石頭合併 [3, 4, 5]，最後一個區間要從哪裡切', intro='dp[l][r] = 把第 l ～ r 堆合併成一堆的最小代價；長度 2 的已經算好（3+4 = 7、4+5 = 9），pre = 前綴和', env=dict(INF=INF), src='''
pre = [0, 3, 7, 12]
dp = [[0, 7, 0], [0, 0, 9], [0, 0, 0]]
for length in range(3, 4):
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

# ───────────── Mo's algorithm ─────────────
def add(i):
    """Mo's: put a[i] into the window; distinct +1 when its count goes 0 → 1"""
    g = SPECS_STATE['g']
    x = g['a'][i]
    g['cnt'][x] += 1
    if g['cnt'][x] == 1:
        g['distinct'] += 1

def remove(i):
    """Mo's: take a[i] out of the window; distinct −1 when its count goes 1 → 0"""
    g = SPECS_STATE['g']
    x = g['a'][i]
    g['cnt'][x] -= 1
    if g['cnt'][x] == 0:
        g['distinct'] -= 1

SPECS[94] = dict(caption="Mo's：兩個指標依序走到每一筆查詢，每次只加入或移除一個元素",
    intro='a 從 index 1 開始；查詢已經依「左端點在第幾塊、塊內右端點由小到大」排好，(l, r, 原本的編號)；目前區間 [cur_l, cur_r] 一開始是空的',
    env=dict(add=add, remove=remove), src='''
a = [0, 2, 1, 1, 3, 1, 4, 5, 2]
qs = [(2,5,0), (3,5,4), (2,6,1), (2,7,2), (3,8,3), (4,4,5)]
cnt = [0, 0, 0, 0, 0, 0]
distinct = 0
ans = [0, 0, 0, 0, 0, 0]
cur_l = 1
cur_r = 0
for l, r, idx in qs:
    while cur_r < r:
        cur_r += 1
        add(cur_r)
    while cur_l > l:
        cur_l -= 1
        add(cur_l)
    while cur_r > r:
        remove(cur_r)
        cur_r -= 1
    while cur_l < l:
        remove(cur_l)
        cur_l += 1
    ans[idx] = distinct
print(ans)
''', notes={'cur_r += 1': ('右指標往右一格', True), 'cur_l -= 1': ('左指標往左一格', True), 'remove(cur_r)': ('先移除 a[cur_r]，右指標再往左', True), 'remove(cur_l)': ('先移除 a[cur_l]，左指標再往右', True), 'ans[idx] = distinct': ('區間已經是 [l, r]：答案存回原本的編號', True)})
CALLDESC['add'] = '把 a[i] 放進區間：cnt[a[i]] += 1，從 0 變 1 時 distinct += 1'
CALLDESC['remove'] = '把 a[i] 拿出區間：cnt[a[i]] -= 1，從 1 變 0 時 distinct -= 1'

# ───────────── recursion on linear data ─────────────
SPECS[95] = dict(caption='先加後乘：f(5,2)*1+2，每個函式吃掉自己那段，回傳 (值, 下一個位置)',
    intro='t 是切好的 token（數字已經轉成 int），# = 結尾。一般先乘後加會得到 5；先加後乘是 3 * (1+2) = 9',
    src='''
def mul_expr(i):
    v, i = add_expr(i)
    while t[i] == '*':
        w, i = add_expr(i + 1)
        v = v * w
    return v, i

def add_expr(i):
    v, i = factor(i)
    while t[i] == '+':
        w, i = factor(i + 1)
        v = v + w
    return v, i

def factor(i):
    if t[i] != 'f':
        return t[i], i + 1
    args = []
    i = i + 1
    while t[i] != ')':
        v, i = mul_expr(i + 1)
        args.append(v)
    return max(args) - min(args), i + 1

t = ['f','(',5,',',2,')','*',1,'+',2,'#']
ans, end = mul_expr(0)
''', notes={
        'return t[i], i + 1': ('數字：自己就是答案，吃掉 1 格', True),
        'i = i + 1': '跳過 f，i 停在 (',
        'v, i = mul_expr(i + 1)': ('跳過 ( 或 ,；每個參數又是一個完整的算式 → 遞迴', True),
        'args.append(v)': ('這個參數算完了，i 停在 , 或 )', True),
        'return max(args)': 'i + 1 吃掉 )：f(...) 整段變成一個數字',
        'v = v + w': ('+ 在內層：先算', True),
        'v = v * w': ('* 在最外層：兩邊的 + 都算完了才乘', True),
    })

# ───────────── Mo's algorithm：學生的兩種寫法 ─────────────
def mo_key(x):
    """Mo's sort key = lambda x: (x[0] // end, x[1])"""
    return (x[0] // SPECS_STATE['g']['end'], x[1])

def mo_add(x, ans):
    """student's add(x, ans): d[x] += 1, return ans + 1 when it became 1"""
    d = SPECS_STATE['g']['d']
    d[x] += 1
    if d[x] == 1:
        ans += 1
    return ans

def mo_remove(x, ans):
    d = SPECS_STATE['g']['d']
    d[x] -= 1
    if d[x] == 0:
        ans -= 1
    return ans

SPECS[97] = dict(caption="Mo's：先排序查詢，再把兩個指標移到每一筆查詢",
    intro='輸入已經讀好（0-indexed）：queries = (l, r, 原本的編號)；d = 每個值在目前區間出現幾次；一開始區間是空的 [0, -1]',
    env=dict(defaultdict=defaultdict, mo_key=mo_key, add=mo_add, remove=mo_remove),
    calldesc={'mo_key': '就是 lambda x: (x[0] // end, x[1])',
              'add': 'd[x] += 1；從 0 變 1 代表多一種值，回傳 ans + 1',
              'remove': 'd[x] -= 1；從 1 變 0 代表少一種值，回傳 ans - 1',
              'defaultdict': '做一個沒有的 key 預設是 0 的 dict'},
    src='''
a = 5
nums = [1, 2, 1, 3, 2]
queries = [(1,3,0), (3,4,1), (0,2,2)]
ans = [0, 0, 0]
end = int(a ** 0.5)
d = defaultdict(int)
queries.sort(key=mo_key)
cur_r = -1
cur_l = 0
cur_ans = 0
for l, r, idx in queries:
    while cur_l > l:
        cur_l -= 1
        cur_ans = add(nums[cur_l], cur_ans)
    while cur_r < r:
        cur_r += 1
        cur_ans = add(nums[cur_r], cur_ans)
    while cur_l < l:
        cur_ans = remove(nums[cur_l], cur_ans)
        cur_l += 1
    while cur_r > r:
        cur_ans = remove(nums[cur_r], cur_ans)
        cur_r -= 1
    ans[idx] = cur_ans
print(ans)
''', notes={'end = int': '塊的大小 ≈ √n', 'queries.sort': '主要依 l 在第幾塊，次要依 r 由小到大', 'cur_l -= 1': ('左指標往左一格：區間變大', True), 'cur_r += 1': ('右指標往右一格：區間變大', True),
             'cur_ans = remove(nums[cur_l]': ('先移除 nums[cur_l]，左指標再往右', True), 'cur_ans = remove(nums[cur_r]': ('先移除 nums[cur_r]，右指標再往左', True),
             'ans[idx] = cur_ans': ('區間已經是 [l, r]：答案存回原本的編號', True)})

def bit_add(index, target):
    """student's add: Fenwick point update on last_ocuur"""
    g = SPECS_STATE['g']
    t = g['last_ocuur']
    while index < g['d_size']:
        t[index] += target
        index += index & -index

def bit_get(index):
    t = SPECS_STATE['g']['last_ocuur']
    s = 0
    while index > 0:
        s += t[index]
        index -= index & -index
    return s

SPECS[98] = dict(caption='每個數字只保留最後出現的位置：Fenwick tree 數區間裡有幾種值',
    intro='d 從 index 1 開始；interval[b] = 右端點是 b 的查詢的左端點；last_ocuur 是 Fenwick tree（add / get 的細節見 Fenwick tree 那一課）',
    env=dict(defaultdict=defaultdict, add=bit_add, get=bit_get),
    calldesc={'add': 'Fenwick：位置 index 加上 target',
              'get': 'Fenwick：位置 1 ～ index 加起來（有幾個 1）',
              'defaultdict': '做一個沒有的 key 預設是 0 的 dict'},
    src='''
d_size = 6
d = [0, 1, 2, 1, 3, 2]
interval = {3: [1], 5: [2, 4]}
need = [(1,3), (2,5), (4,5)]
result = {}
last_ocuur = [0, 0, 0, 0, 0, 0, 0]
appear = defaultdict(int)
for back in range(1, d_size):
    add(back, 1)
    if d[back] in appear:
        add(appear[d[back]], -1)
    appear[d[back]] = back
    if back in interval:
        for begin in interval[back]:
            found = get(back) - get(begin - 1)
            result[(begin, back)] = found
for begin, end in need:
    print(result[(begin, end)])
''', notes={'add(back, 1)': ('先在新的位置標 1', True), 'add(appear[d[back]], -1)': ('這個值以前出現過：舊的位置改回 0，每個值只留最右邊的 1', True),
             'appear[d[back]] = back': ('記住這個值最後出現在哪', True), 'found = get': ('[begin, back] 裡有幾個 1 = 有幾種不同的值', True)})

# ───────────── 特殊郵件：學生的遞迴 DFS（functional graph 找環 + 記憶化） ─────────────
SPECS[100] = dict(caption='特殊郵件（遞迴）：撞到「這一輪正在走」的人 = 找到環；環上的人答案 = 環長，其他人 = 1 + 下一個人',
    intro='nxt[i] = i 收到後寄給誰：1 → 2 → 1 是環，3 → 1 是尾巴。color[i]：-1 沒走過、≥ 0 這一輪正在走（第幾層）、-2 走完；vis[i] = 從 i 開始有幾個人收到（0 = 還沒算）',
    src='''
def dfs(node, s):
    global cycle, st
    if vis[node] > 0:
        return vis[node]
    if color[node] >= 0:
        cycle = True
        st = node
        return s - color[node]
    color[node] = s
    count = dfs(nxt[node], s + 1)
    color[node] = -2
    if cycle:
        vis[node] = count
        if node == st:
            cycle = False
        return count
    vis[node] = count + 1
    return count + 1

n = 3
nxt = [0, 2, 1, 1]
vis = [0, 0, 0, 0]
color = [-1, -1, -1, -1]
cycle = False
st = 0
for i in range(1, n + 1):
    dfs(i, 0)
print(vis.index(max(vis)))
''', notes={'if vis[node] > 0': 'vis > 0 = 算過了，直接拿答案',
             'if color[node] >= 0': 'color ≥ 0 = 這一輪的路上已經有他 → 繞回來了',
             'st = node': '記住環從誰開始，退回到他時就離開環',
             'return s - color[node]': '環長 = 現在第幾層 − 他當初在第幾層',
             'color[node] = s': ('標成「這一輪正在走」，記下第幾層', True),
             'color[node] = -2': '走完了，不在這一輪的路上',
             'vis[node] = count\n': ('還在環裡：答案 = 環長', True),
             'cycle = False': '退回到環的起點：再往回的人都不在環上',
             'vis[node] = count + 1': ('不在環上：自己 1 個 + 下一個人的答案', True)})

# ───────────── tree center：一圈一圈剝葉子 ─────────────
SPECS[102] = dict(caption='樹中心：每一輪把所有葉子（deg = 1）一起拿掉，剩下 ≤ 2 個點就是中心',
    intro='樹：0 – 1 – 2 – 3 – 4，2 – 5。deg[u] = u 還連著幾條邊；q = 這一輪的葉子；left = 還剩幾個點',
    src='''
g = [[1], [0, 2], [1, 3, 5], [2, 4], [3], [2]]
deg = [1, 2, 3, 2, 1, 1]
q = [0, 4, 5]
left = 6
while left > 2:
    nq = []
    for u in q:
        left -= 1
        for v in g[u]:
            deg[v] -= 1
            if deg[v] == 1:
                nq.append(v)
    q = nq
print(q)
''', notes={'while left > 2': ('剩 1 或 2 個點就停：它們就是中心', True),
             'nq = []': ('nq 收集「下一輪」的葉子', True),
             'left -= 1': ('拿掉葉子 u', True),
             'deg[v] -= 1': ('u 被拿掉，鄰居少一條邊（已經拿掉的鄰居變 0 或負數也沒關係，不會再用到）', True),
             'nq.append(v)': ('v 變成新的葉子，下一輪拿掉', True),
             'q = nq': ('這一輪的葉子都拿掉了：每個點離最遠的葉子都近了 1', True)})

# ───────────── articulation point：Tarjan ─────────────
def tj_visit(u):
    """tin[u] = low[u] = t; t += 1"""
    g = SPECS_STATE['g']
    g['tin'][u] = g['t']
    g['low'][u] = g['t']
    g['t'] += 1

SPECS[104] = dict(caption='割點（Tarjan）：子節點 v 繞不回 u 的上面（low[v] ≥ tin[u]），拿掉 u 就會斷開',
    intro='圖：三角形 0 – 1 – 2，再加 1 – 3。從 0 開始 DFS。tin[u] = 第幾個走到；low[u] = 從 u 的子樹（可以走一條回頭的邊）最早能碰到的 tin',
    env=dict(visit=tj_visit),
    calldesc={'visit': 'tin[u] = low[u] = t（第幾個走到），t 加 1'},
    src='''
def dfs(u, p):
    visit(u)
    kids = 0
    for v in g[u]:
        if v == p:
            continue
        if tin[v] != -1:
            low[u] = min(low[u], tin[v])
        else:
            dfs(v, u)
            kids += 1
            low[u] = min(low[u], low[v])
            if p != -1 and low[v] >= tin[u]:
                cut[u] = True
    if p == -1 and kids >= 2:
        cut[u] = True

g = [[1, 2], [0, 2, 3], [0, 1], [1]]
tin = [-1, -1, -1, -1]
low = [0, 0, 0, 0]
cut = [False, False, False, False]
t = 0
dfs(0, -1)
print(cut)
''', notes={'if v == p': ('來的那條邊不算回頭', True),
             'low[u] = min(low[u], tin[v])': ('v 已經走過：這是一條回頭的邊，u 可以直接碰到 tin[v]', True),
             'low[u] = min(low[u], low[v])': ('v 的子樹能碰到的，u 也能碰到', True),
             'if p != -1 and low[v]': ('low[v] ≥ tin[u] 代表 v 那一塊最多只能碰到 u，繞不到 u 的上面', True),
             'cut[u] = True\n    if': '拿掉 u，v 那一塊就和其他點斷開',
             'if p == -1 and kids': '根沒有上面：要看它有沒有兩個以上互不相連的子樹',
             })
