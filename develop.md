# 開發文件

## 整體架構

```text
瀏覽器（GitHub Pages：docs/）
  ├─ index.html + assets/*.js   ← web_src build 出來
  ├─ 執行時 fetch ./content/data.json  ← 課程內容
  └─ 呼叫 API（預設 https://teach-beige.vercel.app，可用 VITE_API_URL 改）
        └─ api/*.js（Vercel serverless）→ MongoDB、Gemini、Google OAuth
```

- **前端**：React 19、Vite 6、Tailwind CSS 4、`motion`（動畫）、`lucide-react`（圖示）。
- **課程內容**不打包進 JS：`courseData.ts` 的 `loadCourseData()` 在 React 畫面出來之前 fetch `./content/data.json`。所以改內容不用重新 build。
- **開發時**：`vite.config.ts` 裡的 `serve-docs-content` 外掛把 `/content` 指到 `../docs/content`。
- **build**：`outDir: '../docs'`、`emptyOutDir: false`（不會刪掉 `docs/content/`）、`base: './'`。

## 前端檔案（web_src/src）

| 檔案 | 用途 |
|---|---|
| `main.tsx` | 進入點：先 `loadCourseData()`，再畫 `App` |
| `App.tsx` | 頁面：`login`、`path`（學習路徑）、`lesson`、`tree`（語法樹）、`tree-node`、`algo-tree`；Google 登入；問老師視窗 |
| `courseData.ts` | `data.json` 的型別（`Module`、`Lesson`、`ContentBlock`…）和讀取函式 |
| `Sidebar.tsx` | 模組 / 課程側欄 |
| `LessonContent.tsx` | 依 `type` 畫每一個區塊；`AnimationStepper` 是動畫播放器（預告、執行、上一步、放大） |
| `animations/N.tsx` | 第 N 號動畫，`registry.tsx` 用 `import.meta.glob` 自動載入 |
| `animations/trace/N.ts` | 演算法動畫的執行資料（由 `scripts/animation_tracer` 產生，不要手改） |
| `animation_kit/` | 動畫共用零件，見 [ANIMATIONS.md](ANIMATIONS.md) |
| `AIChat.tsx` | `ai-chat` 區塊：送到 `/api/chat` 讓 Gemini 批改 |
| `MatchingExercise.tsx` | `matching` 區塊：拖拉分類 |
| `TeacherQuestionPanel.tsx` | 問老師：`/api/questions` |
| `CodeSyntaxTree.tsx`、`codeTreeData.ts`、`NodeExplainPage.tsx` | Code 語法樹和節點說明頁 |
| `AlgorithmTree.tsx`、`GoalTree.tsx`、`SolveWizard.tsx`、`algoTreeData.ts` | 演算法樹（判斷樹、任務樹、解題流程） |
| `ZoomViewer.tsx` | 動畫 / 圖的放大檢視 |
| `auth.ts` | 登入資訊 |

## 演算法樹的資料

`algorithm_tree.py` 是演算法樹唯一的資料來源（節點、問題、答案、解題流程的規則、資料結構）。改完執行：

```bash
python algorithm_tree.py      # 重新產生 web_src/src/algoTreeData.ts
```

`devide_algorithm_tree` 是拆解問題四個步驟的設計筆記。

## API（api/，部署在 Vercel）

| 檔案 | 用途 |
|---|---|
| `config.js` | 回傳 Google OAuth 的 client ID 給前端 |
| `login.js` | 驗證 Google ID token（只接受 gmail.com），記錄使用者 |
| `chat.js` | 驗證登入後呼叫 Gemini 批改 `ai-chat`（只允許 `ALLOWED_MODELS` 裡的模型，有長度上限） |
| `questions.js` | 問老師：GET 列表、POST 新問題、PATCH 回覆 / 關閉；老師由 `TEACHER_EMAILS` 決定 |
| `stats.js` | 回傳使用者人數 |
| `_db.js` | MongoDB 連線（mongoose）和 `User`、`Question` model |

CORS 只允許 `https://penter405.github.io` 和本機的 5500 port（`config.js`、`stats.js` 允許所有來源）。

### 環境變數（Vercel）

| 名稱 | 用途 |
|---|---|
| `Client_ID`（或 `GOOGLE_CLIENT_ID`） | Google OAuth client ID |
| `MongoDB` | MongoDB 連線字串 |
| `Gemini_API_key` | Gemini API key |
| `TEACHER_EMAILS` | 老師的 email，用逗號分開 |

前端（`web_src/.env*`）：`VITE_API_URL` 可以把 API 指到別的網址。

## 部署

- **網站**：`.github/workflows/deploy.yml` 在 push 到 `main` 時，把 `docs/` 上傳到 GitHub Pages。所以要先用 `update_course.sh` / `update_course.bat` build，再 commit `docs/`。
- **API**：Vercel 依 `vercel.json`（`buildCommand: npm run build`、`outputDirectory: docs`），`api/` 會自動變成 serverless function。

## 常見工作

| 想做的事 | 要改哪裡 |
|---|---|
| 新增 / 修改課程內容 | `docs/content/data.json`（格式見 [CONTENT_FORMAT.md](CONTENT_FORMAT.md)） |
| 加一張圖 | 放到 `docs/content/image/N.png`，區塊寫 `{"type": "image", "imageId": N}` |
| 新增一支動畫 | `web_src/src/animations/N.tsx`，區塊寫 `animationId: N`（見 [ANIMATIONS.md](ANIMATIONS.md)） |
| 改演算法動畫的程式或例子 | `scripts/animation_tracer/specs.py`，然後 `python scripts/animation_tracer/run.py` |
| 改演算法樹 | `algorithm_tree.py`，然後 `python algorithm_tree.py` |
| 改外觀規範 | 參考 [DESIGN.md](DESIGN.md) |

## 檢查

```bash
cd web_src
npm run lint      # tsc --noEmit
npm run build
```
