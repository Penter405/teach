// 量動畫高度用的頁面（scripts/measure_animations.py 開它）：measure.html?aid=N&w=內容寬度，只畫一支動畫，用真的播放器。
import { createRoot } from 'react-dom/client';
import './index.css';
import { LessonContent } from './LessonContent';
const q = new URLSearchParams(location.search);
fetch('/content/data.json').then(r => r.json()).then((d) => {
  const blocks = d.modules.flatMap((m: any) => m.lessons.flatMap((l: any) => l.content.map((b: any) => ({ ...b, _lesson: l.title }))));
  const b = blocks.find((x: any) => x.type === 'animation' && String(x.animationId) === q.get('aid'));
  (window as any).__lesson = b?._lesson ?? null;
  createRoot(document.getElementById('root')!).render(<div style={{ width: Math.max(320, (Number(q.get("w")) || 0)) || undefined }} className="mx-auto p-0">{b ? <LessonContent block={b} index={0} /> : <p>none</p>}</div>);
});
