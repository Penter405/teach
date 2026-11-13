# 課程內容格式（docs/content/data.json）

網站上所有的課都寫在 `docs/content/data.json`。網站執行時才讀這個檔，所以改完存檔、重新整理頁面就能看到（不用 build）。型別定義在 `web_src/src/courseData.ts`。

## 整體結構

```json
{
  "course": { "title": "PythonClassPenter", "subtitle": "…", "version": "2026y11m11d", "language": "zh-TW" },
  "modules": [
    {
      "id": "module-1792648168328",
      "title": "math",
      "titleEn": "math",
      "icon": "📖",
      "lessons": [
        {
          "id": "lesson-1792648168328",
          "title": "質數 (Prime)",
          "titleEn": "Prime",
          "pdfPages": [],
          "content": [ { "type": "heading", "text": "什麼是質數" }, … ]
        }
      ]
    }
  ]
}
```

- `id` 要唯一。新的模組 / 課習慣用 `module-<時間戳>`、`lesson-<時間戳>`。
- 模組和課在畫面上的順序 = 陣列的順序。
- `pdfPages`：對應原始 PDF 講義的頁碼，沒有就放 `[]`。

## 區塊（content 裡的每一個物件）

### heading / paragraph

```json
{ "type": "heading", "text": "判斷一個數：試除法" }
{ "type": "paragraph", "text": "第一段。\n\n空一行就是下一段。" }
```

### code

```json
{ "type": "code", "language": "python", "code": "def is_prime(n):\n    …" }
```

### callout（重點框）

```json
{ "type": "callout", "label": "重點", "text": "條件寫 d * d <= n，不要寫 d <= n ** 0.5。" }
```

`label` 是框的標題，例如「重點」「小心」「觀察」。

### list

```json
{ "type": "list", "style": "definition", "items": [ { "term": "時間", "definition": "O(√n)" } ] }
```

不寫 `style` 就是一般清單：`items` 放字串（或 `{"text": "…"}`），每一項前面會有 📁。

### image

```json
{ "type": "image", "imageId": 21, "caption": "題目說什麼？" }
```

圖片放在 `docs/content/image/21.png`。

### diagram

```json
{ "type": "diagram", "diagramId": "basic-coding-flow", "caption": "…" }
```

`diagramId` 對應 `LessonContent.tsx` 裡寫好的圖：`course-structure-timeline`、`input-process-output`、`basic-coding-flow`、`interpreter-vs-compiler`、`class-object-flow`、`cpu-ram-cycle`、`variable-memory-map`、`python-code-types`、`class-blueprint`。

### animation

```json
{
  "type": "animation",
  "animationId": 41,
  "caption": "二分搜尋：在 [1,3,4,4,4,7,9,12] 找最左邊的 4",
  "steps":   ["還沒開始執行", "def lower_bound：名稱 lower_bound 指向函式", …],
  "results": ["a 已經排好序；左閉右開 [lo, hi)", "函式內容還沒執行", …]
}
```

- `animationId` = `web_src/src/animations/<id>.tsx`。
- `steps[k]`：**預告**，第 k 步會做什麼。
- `results[k]`：**執行後**，第 k 步做完留下什麼。可以省略（舊的動畫 1 ～ 27 沒有）。
- `steps` 的數量就是動畫的步數，要和動畫元件一致。演算法動畫（38 號之後）的 `steps`、`results` 由 `scripts/animation_tracer/run.py` 自動填，**不要手改**，改了下次產生會被蓋掉。

詳見 [ANIMATIONS.md](ANIMATIONS.md)。

### quiz

```json
{
  "type": "quiz",
  "questions": [
    { "question": "91 是質數嗎？", "options": ["是", "不是，91 = 7 × 13"], "answer": 1 }
  ]
}
```

`answer` 是正確選項的 index（從 0 開始）。

### practice（LeetCode / ZeroJudge 題目）

```json
{
  "type": "practice",
  "problems": [
    { "title": "Count Primes", "difficulty": "Medium", "url": "https://leetcode.com/problems/count-primes/", "description": "埃氏篩" }
  ]
}
```

`difficulty`：`Easy`、`Medium`、`Hard`。

### ai-chat（AI 批改的練習）

```json
{
  "type": "ai-chat",
  "title": "Coding：質因數分解",
  "subtitle": "用試除法輸出分解結果",
  "difficulty": "Medium",
  "coursePrompt": "請讓學生完成 Python Coding 題：……不要直接給答案。"
}
```

`coursePrompt` 是給 AI 的指示（題目、限制、怎麼引導）。學生要先登入才能用。

### matching（分類配對）

```json
{
  "type": "matching",
  "title": "動詞分類",
  "subtitle": "以下哪些是 function、哪些是 method、哪些是 operator？",
  "difficulty": "Easy",
  "categories": ["Function", "Method", "Operator"],
  "items": [ { "id": "len", "text": "len()", "category": "Function" } ]
}
```

## 寫課的習慣

目前比較完整的課大致是這個順序：

1. `heading` + `paragraph`：這課要解決什麼問題
2. `animation`：先看它怎麼動
3. `code`：可以直接執行的範例（輸出寫在註解）
4. `callout` / `list`：重點、什麼時候用、時間複雜度
5. `quiz`
6. `ai-chat`：一題 Coding 練習
7. `practice`：LeetCode 題目

## 檢查 JSON

```bash
python -c "import json; json.load(open('docs/content/data.json', encoding='utf-8')); print('ok')"
```
