import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { courseData, Module, Lesson } from './courseData';

interface SidebarProps {
  currentLessonId: string;
  expandedModules: string[];
  onToggleModule: (moduleId: string) => void;
  onSelectLesson: (lessonId: string) => void;
}

export function Sidebar({ currentLessonId, expandedModules, onToggleModule, onSelectLesson }: SidebarProps) {
  return (
    <div className="w-full h-full flex flex-col bg-surface-container dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/50 overscroll-contain">
      <div className="p-6 bg-surface-container-high dark:bg-slate-900/80 sticky top-0 z-10 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container dark:from-sky-600 dark:to-cyan-400 flex items-center justify-center text-xl text-white shadow-sm flex-shrink-0">
            🐍
          </div>
          <div className="min-w-0">
            <h2 className="font-headline text-lg font-bold text-slate-800 dark:text-white truncate tracking-tight">{courseData.course.title}</h2>
            <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate tracking-widest">{courseData.course.version}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {courseData.modules.map((mod, index) => {
          const isExpanded = expandedModules.includes(mod.id);
          const hasActiveLesson = mod.lessons.some(l => l.id === currentLessonId);
          
          return (
            <div key={mod.id} className="mb-2">
              <button
                onClick={() => onToggleModule(mod.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isExpanded || hasActiveLesson 
                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700' 
                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xl w-6 text-center">{mod.icon}</span>
                <span className={`flex-1 text-left font-headline text-[13px] tracking-wide uppercase font-bold truncate ${
                   hasActiveLesson ? 'text-primary dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {mod.title}
                </span>
                <ChevronRight 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
                />
              </button>
              
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-1 pr-2 relative">
                      {/* Left timeline line */}
                      <div className="absolute left-[25px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800 z-0" />
                      
                      {mod.lessons.map(les => {
                        const isActive = les.id === currentLessonId;
                        return (
                          <button
                            key={les.id}
                            onClick={() => onSelectLesson(les.id)}
                            className={`relative z-10 w-full flex items-center text-left py-2.5 pl-12 pr-4 text-sm transition-all focus:outline-none ${
                              isActive
                                ? 'text-primary dark:text-sky-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200 hover:pl-[50px]'
                            }`}
                          >
                            {/* Active indicator dot */}
                            <div className={`absolute left-[21.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full transition-colors border-2 border-surface-container dark:border-slate-900 ${
                              isActive ? 'bg-tertiary shadow-[0_0_8px_rgba(110,59,216,0.5)]' : 'bg-transparent border-slate-300 dark:border-slate-700 group-hover:border-slate-500'
                            }`} />
                            
                            <span className="truncate">{les.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
