"""量每一支動畫在課程頁面上有多高，找出超過高度上限的。

    cd web_src && npm run dev            # 另一個視窗先開開發伺服器（http://localhost:3000）
    python scripts/measure_animations.py            # 全部
    python scripts/measure_animations.py 100,105    # 只量這幾支
    python scripts/measure_animations.py --zh       # 中文步驟模式

需要 playwright：pip install playwright && python -m playwright install chromium

量的是：
  box   播放器固定的動畫高度 = 目前設定下最高的那一步
  card  整張卡片（標題 + 動畫 + 進度條 + 說明 + 按鈕）
上限：1920×1080 的螢幕扣掉瀏覽器和餘裕，card ≤ 900px（課程頁的內容寬度約 1520px）。
也量 1440 寬的筆電（內容寬度約 1040px）當參考。
"""
import json, os, sys
from playwright.sync_api import sync_playwright

LIMIT = 900
SCREENS = {1920: 1520, 1440: 1040}          # 螢幕寬度 → 課程內容寬度（側邊欄 288px + 左右留白）
URL = 'http://localhost:3000/measure.html'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def all_ids():
    d = json.load(open(os.path.join(ROOT, 'docs', 'content', 'data.json'), encoding='utf-8'))
    return sorted({b['animationId'] for m in d['modules'] for l in m['lessons'] for b in l['content'] if b['type'] == 'animation'})


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    zh = '--zh' in sys.argv
    ids = [int(x) for x in args[0].split(',')] if args else all_ids()
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for vw, cw in SCREENS.items():
            pg = b.new_page(viewport={'width': vw, 'height': 1080})
            if zh:
                pg.add_init_script("localStorage.setItem('teach_code_lang', '\"pseudo\"')")
            for i in ids:
                pg.goto(f'{URL}?aid={i}&w={cw}')
                pg.wait_for_timeout(2200)          # the player measures every step after fonts load
                r = pg.evaluate("""() => { const v = document.querySelector('[data-previewing]'); if (!v) return null;
                    const stage = v.parentElement; return { box: parseInt(stage.style.minHeight) || stage.offsetHeight, card: stage.parentElement.offsetHeight, lesson: window.__lesson } }""")
                res.setdefault(i, {})[vw] = r
            pg.close()
        b.close()
    print(f'{"id":>4} {"card@1920":>10} {"card@1440":>10}  lesson')
    over = []
    for i in ids:
        a, c = res[i].get(1920) or {}, res[i].get(1440) or {}
        flag = ' ← 超過' if (a.get('card') or 0) > LIMIT else ''
        print(f'{i:>4} {a.get("card", "-"):>10} {c.get("card", "-"):>10}  {a.get("lesson") or ""}{flag}')
        if flag: over.append(i)
    print(f'\n1920×1080 超過 {LIMIT}px：{over or "沒有"}')


if __name__ == '__main__':
    main()
