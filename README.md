# [WEB_URL](https://penter405.github.io/teach/)

# PythonClassPenter（Cipher Slate）

一個互動式的 Python 與演算法課程網站。課程內容寫在一個 JSON 檔裡，網站把它畫成「學習路徑 → 課程頁」，每一課可以有程式碼、測驗、AI 練習、LeetCode 題目，以及一步一步執行的動畫。

目前有 18 個模組、89 課、71 個動畫區塊（動畫元件 1 ～ 92 號）。

## 網站有什麼

| 功能 | 說明 |
|---|---|
| 學習路徑 | 依模組列出所有課，左邊側欄可以收合 |
| 課程頁 | 標題、段落、程式碼、重點框、圖片、清單、測驗、配對練習、LeetCode 題目 |
| 動畫 | 每一課可以嵌入動畫；**預告**＝下一個動作會做什麼，**執行**＝做完這個動作 |
| AI 練習 | `ai-chat` 區塊：學生寫答案，Gemini 依課程提示批改 |
| 問老師 | 學生可以在課程頁傳問題給老師（老師名單由環境變數設定） |
| Code 語法樹 | 把一行程式拆成名詞 / 動詞來看 |
| 演算法樹 | 判斷樹、任務樹、解題流程：依照資料和問題的特性找到演算法 |
| Google 登入 | 只允許 Google 帳號登入，用來記錄學生和問題 |

## 快速開始

```bash
cd web_src
npm install
npm run dev        # http://localhost:3000
```

開發伺服器會把 `docs/content/` 當成 `/content/`，所以改 `docs/content/data.json` 之後重新整理就能看到，不用重新 build。

## 更新網站

```bash
./update_course.sh          # macOS / Linux
update_course.bat           # Windows（一定要在 repo 根目錄執行）
```

兩個腳本都會 build `web_src/`，把舊的 `docs/assets/*.js、*.css` 搬到 `docs/assets/old/`，再把新的 build 放進 `docs/`。之後 `git push` 到 `main`，GitHub Actions 會把 `docs/` 部署到 GitHub Pages。

只改課程內容（`docs/content/data.json`、圖片）時不用 build，直接 push 就好。

## 專案結構

```text
teach/
├── docs/                      # GitHub Pages 發布的資料夾（build 結果 + 課程內容）
│   ├── index.html, assets/    # Vite build 出來的網站（不要手動改）
│   └── content/
│       ├── data.json          # ★ 全部的課程內容（執行時才讀取）
│       ├── image/             # 課程圖片 1.png、2.png …（imageId 對應檔名）
│       └── hand_note/         # 手寫筆記圖片
├── web_src/                   # React + Vite + Tailwind 前端原始碼
│   └── src/
│       ├── App.tsx            # 頁面切換：登入 / 學習路徑 / 課程 / 語法樹 / 演算法樹
│       ├── LessonContent.tsx  # 把 data.json 的區塊畫出來（含動畫播放器）
│       ├── animations/        # 動畫元件 N.tsx（N = animationId），trace/ 是動畫的執行資料
│       ├── animation_kit/     # 動畫共用零件（HardwareKit、AlgoKit…）
│       ├── AlgorithmTree.tsx, GoalTree.tsx, SolveWizard.tsx, algoTreeData.ts
│       └── …                  # 其他元件，見 develop.md
├── api/                       # Vercel serverless API（登入、AI 批改、問老師、統計）
├── scripts/
│   ├── animation_tracer/      # 產生演算法動畫的工具（執行真的 Python，一個動作一步）
│   └── extract_animations.mjs # 舊工具：把動畫從 LessonContent.tsx 拆成獨立檔案
├── algorithm_tree.py          # 演算法樹的資料來源 → 產生 web_src/src/algoTreeData.ts
├── update_course.sh / .bat    # build 並發布到 docs/
├── .github/workflows/deploy.yml  # push 到 main 時部署 docs/ 到 GitHub Pages
└── vercel.json                # Vercel 設定（API）
```

## 文件

| 檔案 | 內容 |
|---|---|
| [develop.md](develop.md) | 架構、元件、API、環境變數、部署 |
| [CONTENT_FORMAT.md](CONTENT_FORMAT.md) | `data.json` 的格式：模組、課、每一種區塊 |
| [ANIMATIONS.md](ANIMATIONS.md) | 動畫系統：播放器、預告 / 執行、怎麼新增一支動畫 |
| [algo_animations.md](algo_animations.md) | 所有動畫的清單（編號、在哪一課、幾步） |
| [scripts/animation_tracer/README.md](scripts/animation_tracer/README.md) | 演算法動畫產生器的用法 |
| [DESIGN.md](DESIGN.md) | 視覺設計規範（The Guided Synthesist） |
| whats_in_canva.md、whats_in_canva2.md | 早期從 PDF 講義整理的大綱與動畫設計筆記 |
