import React, { useState, useEffect, useRef } from 'react';
import { ContentBlock } from './courseData';

interface MatchingExerciseProps {
  block: ContentBlock;
}

export function MatchingExercise({ block }: MatchingExerciseProps) {
  const items = block.items || [];
  const categories = block.categories || [];
  
  // Randomize items on mount
  const [shuffledItems, setShuffledItems] = useState(items);
  useEffect(() => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledItems(arr);
  }, [items]);

  const [state, setState] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [svgLines, setSvgLines] = useState<React.ReactNode[]>([]);

  // Draw lines between connected items and categories
  const drawLines = () => {
    if (!boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const newLines: React.ReactNode[] = [];

    Object.entries(state).forEach(([itemId, catId]) => {
      const itemBtn = boardRef.current?.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement;
      const catBtn = boardRef.current?.querySelector(`[data-category="${catId}"]`) as HTMLElement;
      
      if (itemBtn && catBtn) {
        const itemRect = itemBtn.getBoundingClientRect();
        const catRect = catBtn.getBoundingClientRect();
        
        const startX = itemRect.right - boardRect.left;
        const startY = itemRect.top + itemRect.height / 2 - boardRect.top;
        const endX = catRect.left - boardRect.left;
        const endY = catRect.top + catRect.height / 2 - boardRect.top;
        
        newLines.push(
          <line
            key={itemId}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#00687b"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="transition-all duration-300"
          />
        );
      }
    });
    setSvgLines(newLines);
  };

  useEffect(() => {
    drawLines();
    window.addEventListener('resize', drawLines);
    return () => window.removeEventListener('resize', drawLines);
  }, [state, shuffledItems]); // Redraw when state changes

  const handleItemClick = (itemId: string) => {
    if (isChecked) return;
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(itemId);
    }
  };

  const handleCategoryClick = (catId: string) => {
    if (isChecked || !selectedItemId) return;
    setState(prev => ({
      ...prev,
      [selectedItemId]: catId
    }));
    setSelectedItemId(null);
  };

  const handleCheck = () => {
    setIsChecked(true);
  };

  const handleReset = () => {
    setState({});
    setSelectedItemId(null);
    setIsChecked(false);
  };

  const correctCount = items.filter(item => state[item.id] === item.category).length;
  const isAllCorrect = correctCount === items.length;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {block.difficulty && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                {block.difficulty}
              </span>
            )}
            <h3 className="font-headline font-bold text-lg text-slate-800 dark:text-white">
              {block.title}
            </h3>
          </div>
          {block.subtitle && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{block.subtitle}</p>
          )}
        </div>
        <div className="px-3 py-1 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
          🔗 連連看
        </div>
      </div>

      {/* Board */}
      <div className="p-6">
        <div ref={boardRef} className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          
          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {svgLines}
          </svg>

          {/* Left Column (Items) */}
          <div className="flex flex-col gap-3 z-10">
            {shuffledItems.map(item => {
              const isSelected = selectedItemId === item.id;
              const isConnected = !!state[item.id];
              const assignedCategory = state[item.id];
              const isCorrect = isChecked && assignedCategory === item.category;
              const isWrong = isChecked && assignedCategory && assignedCategory !== item.category;

              let btnClass = "relative flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer bg-white dark:bg-slate-800 ";
              
              if (isCorrect) {
                btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20";
              } else if (isWrong) {
                btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20";
              } else if (isSelected) {
                btnClass += "border-teal-500 ring-2 ring-teal-500/20 bg-teal-50 dark:bg-teal-900/20";
              } else if (isConnected) {
                btnClass += "border-teal-500/30 bg-slate-50 dark:bg-slate-800/50";
              } else {
                btnClass += "border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm";
              }

              return (
                <button
                  key={item.id}
                  data-item-id={item.id}
                  onClick={() => handleItemClick(item.id)}
                  disabled={isChecked}
                  className={btnClass}
                >
                  <code className="font-mono text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                    {item.text}
                  </code>
                  {assignedCategory && (
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full ml-3">
                      {assignedCategory}
                    </span>
                  )}
                  {isCorrect && <span className="absolute -top-2 -right-2 text-lg">✅</span>}
                  {isWrong && <span className="absolute -top-2 -right-2 text-lg">❌</span>}
                </button>
              );
            })}
          </div>

          {/* Center (Progress) */}
          <div className="hidden md:flex items-center justify-center min-w-[80px] h-full z-10 text-center">
            <div className="font-mono text-sm font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full whitespace-nowrap">
              {Object.keys(state).length} / {items.length}
            </div>
          </div>

          {/* Right Column (Categories) */}
          <div className="flex flex-col gap-3 z-10">
            {categories.map(cat => {
              const count = Object.values(state).filter(v => v === cat).length;
              return (
                <button
                  key={cat}
                  data-category={cat}
                  onClick={() => handleCategoryClick(cat)}
                  disabled={isChecked}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all cursor-pointer bg-white dark:bg-slate-800 shadow-sm text-left"
                >
                  <span className="text-xl">
                    {cat === 'Function' ? '⚡' : cat === 'Method' ? '🔧' : '➕'}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex-1">
                    {cat}
                  </span>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions & Result */}
      <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
        {!isChecked ? (
          <button
            onClick={handleCheck}
            disabled={Object.keys(state).length === 0}
            className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ 檢查答案
          </button>
        ) : (
          <>
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition-all"
            >
              ↺ 重新作答
            </button>
            <div className={`px-4 py-2 rounded-xl font-semibold text-sm ${isAllCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
              {isAllCorrect 
                ? `🎉 全部正確！太厲害了！ (${correctCount}/${items.length})` 
                : `💪 答對 ${correctCount}/${items.length} 題，紅色的再想想看！`
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}
