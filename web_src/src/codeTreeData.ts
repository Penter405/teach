// ── Code Syntax Tree Data ──
// Parsed from code_syntax_tree.txt + code_syntax_tree_explain_node.txt

export interface TreeNode {
  id: string;
  label: string;
  labelZh: string;
  brief: string;       // Short tooltip (for hover on lesson page)
  category: 'root' | 'structure' | 'singo' | 'verb' | 'noun' | 'leaf';
  children: TreeNode[];
}

export interface NodeExplanation {
  id: string;
  title: string;
  titleZh: string;
  brief: string;
  fullExplanation: string;   // Markdown-ish text for the explain page
}

// ── Tree Structure ──
export const codeTree: TreeNode = {
  id: 'code',
  label: 'Code',
  labelZh: '程式碼',
  brief: '程式的本質：輸入 → 處理 → 輸出',
  category: 'root',
  children: [
    {
      id: 'structure',
      label: 'Structure',
      labelZh: '結構',
      brief: '控制程式流程的區塊結構',
      category: 'structure',
      children: [
        {
          id: 'loop_structure',
          label: 'Loop Structure',
          labelZh: '迴圈結構',
          brief: '重複執行某段程式碼（for, while）',
          category: 'leaf',
          children: [],
        },
        {
          id: 'choosing_structure',
          label: 'Choosing Structure',
          labelZh: '判斷結構',
          brief: '根據條件決定執行哪段程式碼（if, elif, else）',
          category: 'leaf',
          children: [],
        },
      ],
    },
    {
      id: 'singo',
      label: 'Singo',
      labelZh: '單行（非結構）',
      brief: '不是結構的程式碼，由名詞和動詞組成',
      category: 'singo',
      children: [
        {
          id: 'verb',
          label: 'Verb',
          labelZh: '動詞',
          brief: '程式裡「做事」的部分：operator, function, method',
          category: 'verb',
          children: [
            {
              id: 'operator',
              label: 'Operator',
              labelZh: '運算子',
              brief: '長得像數學符號的動詞（=, +, -, *, / 等）',
              category: 'leaf',
              children: [],
            },
            {
              id: 'function',
              label: 'Function',
              labelZh: '函式',
              brief: '一團字右邊配上() — 代表一個動作，如 print()',
              category: 'leaf',
              children: [],
            },
            {
              id: 'method',
              label: 'Method',
              labelZh: '方法',
              brief: '名詞.動作() — 跟某個名詞有關的動作',
              category: 'leaf',
              children: [],
            },
          ],
        },
        {
          id: 'noun',
          label: 'Noun',
          labelZh: '名詞',
          brief: '程式裡「資料」的部分：各種 data type 和 variable',
          category: 'noun',
          children: [
            {
              id: 'all_data_type',
              label: 'All Data Type',
              labelZh: '所有資料型態',
              brief: 'int, float, str, bool, list, tuple, set, dict, None',
              category: 'leaf',
              children: [],
            },
            {
              id: 'variable',
              label: 'Variable',
              labelZh: '變數',
              brief: '給資料一個名字，用來找到並使用它',
              category: 'leaf',
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

// ── Full Explanations (for Node Explain Page) ──
export const nodeExplanations: Record<string, NodeExplanation> = {
  code: {
    id: 'code',
    title: 'Code',
    titleZh: '程式碼',
    brief: '程式的本質：輸入 → 處理 → 輸出',
    fullExplanation: `程式架構：輸入 處理 輸出
程式碼的結構：名詞 動詞

程式的目的，讓使用者輸入資料(名詞), (用動詞)處理它，一直處理，直到處理出一個滿意的資訊(名詞). 最後用一個叫做 print 的動詞印出來。`,
  },
  structure: {
    id: 'structure',
    title: 'Structure',
    titleZh: '結構',
    brief: '控制程式流程的區塊結構',
    fullExplanation: `結構是用來控制程式執行流程的區塊。

在 Python 中：
• 單行結構：利用「換行」達成
• 區塊結構：利用「縮排」達成（不使用大括號）

區塊結構分為「結構控制」與「受結構控制」兩部分。`,
  },
  loop_structure: {
    id: 'loop_structure',
    title: 'Loop Structure',
    titleZh: '迴圈結構',
    brief: '重複執行某段程式碼（for, while）',
    fullExplanation: `迴圈結構讓你重複執行某段程式碼。

例如：寫出 10 個 "hi"，就是「有一件事要做 10 次」。

Python 的迴圈：
• for 迴圈：知道要做幾次時使用
• while 迴圈：不確定次數，持續到條件不成立

for i in range(10):
    print("hi")`,
  },
  choosing_structure: {
    id: 'choosing_structure',
    title: 'Choosing Structure',
    titleZh: '判斷結構',
    brief: '根據條件決定執行哪段程式碼（if, elif, else）',
    fullExplanation: `判斷結構讓程式根據條件選擇不同的路徑執行。

舉例說明條件判斷與輸出：
• 按下 F → 進入載具
• 輸入名字 → 印出名字

if 條件:
    # 條件成立時執行
elif 另一個條件:
    # 另一個條件成立時執行
else:
    # 都不成立時執行`,
  },
  singo: {
    id: 'singo',
    title: 'Singo (Not Structure)',
    titleZh: '單行（非結構）',
    brief: '不是結構的程式碼，由名詞和動詞組成',
    fullExplanation: `Singo 代表「非結構」的程式碼 — 也就是單行的程式碼。

每一行程式碼都可以拆解成：
• 名詞（Noun）：資料
• 動詞（Verb）：對資料做的動作

例如：print("hello")
• print 是動詞（function）
• "hello" 是名詞（str 資料型態）`,
  },
  verb: {
    id: 'verb',
    title: 'Verb',
    titleZh: '動詞',
    brief: '程式裡「做事」的部分：operator, function, method',
    fullExplanation: `動詞是程式裡面「做事」的部分。

動詞有三種：
1. Operator（運算子）— 長得像數學符號
2. Function（函式）— 一團字右邊配上()
3. Method（方法）— 名詞.動作()`,
  },
  operator: {
    id: 'operator',
    title: 'Operator',
    titleZh: '運算子',
    brief: '長得像數學符號的動詞（=, +, -, *, / 等）',
    fullExplanation: `Operator 長得很像數學課本裡面的符號，又可以分成以下幾種功能：

1. 變數相關
=  → 將某個名詞存入記憶體，需要的時候用他的名字請程式找出資料

2. 真數學計算
+ - * ÷ 之類的
通常他們的左右兩邊會配上數學有關的資料
例如：3.14 + 3.14 * 3 ÷ 2
按照數學的規則先乘除後加減（operator 都有先後順序的）

3. 很難的數學計算
例如機率、排列組合的數學有個東西叫做集合
有些符號是給他們用的`,
  },
  function: {
    id: 'function',
    title: 'Function',
    titleZh: '函式',
    brief: '一團字右邊配上() — 代表一個動作，如 print()',
    fullExplanation: `Function 是個一團字的右邊配上()，例如：說你好()、吃飯()

代表一個動作，() 內可以放入這個動作會處理的「名詞」
（只要你確定放進來的最後會變成名詞，就可以放進來，例如 3+5 最後會變成 8，是個名詞，可以放 3+5 進去）

要確定 function 會做什麼事情，可以看他的名字。
例如 print()：print 在英文叫做印東西，所以代表程式裡面有 print() 的話，就會做 print（印出來）的動作

如果你用 help() 這個 function 檢查 print，你會看到大概像這樣：
def print(*x):
    """let x shown on your screen"""`,
  },
  method: {
    id: 'method',
    title: 'Method',
    titleZh: '方法',
    brief: '名詞.動作() — 跟某個名詞有關的動作',
    fullExplanation: `Method 其實就是名詞的右邊寫一個 . 然後再寫一個屬於那個名詞的動作。

他是個動作，只不過跟 . 左邊的名詞有關係。

例如：
numbers = [1, 2, 3]
numbers.append(4)    # append 是 list 的 method
# [1, 2, 3, 4]

name = "hello"
name.upper()         # upper 是 str 的 method
# "HELLO"`,
  },
  noun: {
    id: 'noun',
    title: 'Noun',
    titleZh: '名詞',
    brief: '程式裡「資料」的部分：各種 data type 和 variable',
    fullExplanation: `名詞是程式裡面「資料」的部分。

在 Python 裡，data type（資料型態）指的是：
一個資料在電腦中被分類的種類，決定它可以做什麼操作。

名詞分為：
• All Data Type — 所有的資料型態
• Variable — 給資料一個名字的機制`,
  },
  all_data_type: {
    id: 'all_data_type',
    title: 'All Data Type',
    titleZh: '所有資料型態',
    brief: 'int, float, str, bool, list, tuple, set, dict, None',
    fullExplanation: `Python 常見 data type（資料型態）：

• int（整數）→ 例如 10, -3 → 沒有小數的數字
• float（浮點數）→ 例如 3.14, 0.5 → 小數
• str（字串）→ 例如 "hello" → 文字
• bool（布林值）→ True, False → 是/否判斷
• list（列表）→ [1,2,3] → 可以改變的一組資料
• tuple（元組）→ (1,2,3) → 不可改變的一組資料
• set（集合）→ {1,2,3} → 不重複資料
• dict（字典）→ {"a":1} → key-value 資料
• NoneType（空值）→ None → 表示沒有資料

Python 的特色是不用先宣告型態：
C/C++：int x = 10;
Python：x = 10
Python 會在執行時（runtime）自己判斷 x 是 int。`,
  },
  variable: {
    id: 'variable',
    title: 'Variable',
    titleZh: '變數',
    brief: '給資料一個名字，用來找到並使用它',
    fullExplanation: `變數（Variable）：資料放入 RAM 後需建立變數並 pointer 到資料的 RAM address，否則會被當作垃圾回收，程式再也找不到資料。

CPU 會在 RAM 找空間，把值轉成 binary（0和1）寫入。
變數存的是 RAM address，想要資料要去 RAM 看一堆 binary code。

重要概念：
• Immutable object（不可變物件）— 裡面的資料不能被修改。若要改變變數的資料，只能換一個家（指向另一個 object）。
  類型：int, float, complex, bool, str, tuple, frozenset, bytes

• Mutable object（可變物件）— 可以改變裡面的資料、把 object 變大或變小。
  類型：list, set, dict
  注意：可能是 coped 或 reference，可用 id() function 來檢查。

變數作用域：在函式中若要修改外部變數，可使用 global 或 nonlocal。`,
  },
};

// ── Helper: flatten tree for iteration ──
export function flattenTree(node: TreeNode): TreeNode[] {
  const result: TreeNode[] = [node];
  for (const child of node.children) {
    result.push(...flattenTree(child));
  }
  return result;
}

// ── Category color mapping ──
export function getCategoryColor(category: TreeNode['category']): {
  bg: string;
  bgDark: string;
  text: string;
  textDark: string;
  border: string;
  borderDark: string;
  glow: string;
} {
  switch (category) {
    case 'root':
      return {
        bg: 'bg-gradient-to-br from-cyan-500 to-purple-500',
        bgDark: 'dark:from-cyan-600 dark:to-purple-600',
        text: 'text-white',
        textDark: 'dark:text-white',
        border: 'border-cyan-400',
        borderDark: 'dark:border-cyan-500',
        glow: 'shadow-[0_0_24px_rgba(6,182,212,0.35)]',
      };
    case 'structure':
      return {
        bg: 'bg-cyan-50',
        bgDark: 'dark:bg-cyan-900/30',
        text: 'text-cyan-800',
        textDark: 'dark:text-cyan-200',
        border: 'border-cyan-300',
        borderDark: 'dark:border-cyan-700',
        glow: 'shadow-[0_0_16px_rgba(6,182,212,0.2)]',
      };
    case 'singo':
      return {
        bg: 'bg-purple-50',
        bgDark: 'dark:bg-purple-900/30',
        text: 'text-purple-800',
        textDark: 'dark:text-purple-200',
        border: 'border-purple-300',
        borderDark: 'dark:border-purple-700',
        glow: 'shadow-[0_0_16px_rgba(110,59,216,0.2)]',
      };
    case 'verb':
      return {
        bg: 'bg-amber-50',
        bgDark: 'dark:bg-amber-900/30',
        text: 'text-amber-800',
        textDark: 'dark:text-amber-200',
        border: 'border-amber-300',
        borderDark: 'dark:border-amber-700',
        glow: 'shadow-[0_0_16px_rgba(217,119,6,0.2)]',
      };
    case 'noun':
      return {
        bg: 'bg-emerald-50',
        bgDark: 'dark:bg-emerald-900/30',
        text: 'text-emerald-800',
        textDark: 'dark:text-emerald-200',
        border: 'border-emerald-300',
        borderDark: 'dark:border-emerald-700',
        glow: 'shadow-[0_0_16px_rgba(16,185,129,0.2)]',
      };
    default: // leaf
      return {
        bg: 'bg-slate-50',
        bgDark: 'dark:bg-slate-800/60',
        text: 'text-slate-700',
        textDark: 'dark:text-slate-300',
        border: 'border-slate-300',
        borderDark: 'dark:border-slate-600',
        glow: '',
      };
  }
}
