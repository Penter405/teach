import { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  Lock, 
  Moon, 
  Sun, 
  HelpCircle, 
  ChevronRight, 
  Layout,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { courseData, getFlatLessons, findLesson } from './courseData';
import { LessonContent } from './LessonContent';
import { Sidebar } from './Sidebar';

// --- Types ---
type Page = 'login' | 'path' | 'lesson';

// --- Constants ---
const IMAGES = {
  explorerLogin: "https://lh3.googleusercontent.com/aida-public/AB6AXuACcSj7i9fMM7i1ZctzGn1EWkZSVpiCkd5-wO3zU_xQZRL0ZZmWp8lZF4Z0_NFA1zXkrOnBYakfpuxedzESaWLGLht6jXHch91F-U2t9sw19FjTTPcvF4a_B66oWO-YolHkCGJnhH9AXj7lY-g2SsMrKKsZ5RYryaNtoNKcm-S0r2cr7L_MNsBl0otjxGnxlkAcHppQB0E_uJxLRZdsFcDlkQ4azfphOLi46RPx9U_75WUh33ubs7kNQI4i132kDSMQqtFwP49WXHnj",
  explorerPath: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_BpYUtQmzuiXe7RCk0RG_hkuOweCv-qcDXEfGlBZkqyaUa0XHcUcp5YxhOSR2SdWcDgA08otmOBAJDHxbaZJ8mcq_E5Zs8mJoEp2IiUL563mpettY115BIOSIV1w2m4-qiSmAuDYxx-x3k7x3ML72t2v27TvPhvG2iLONH9mZSrVpVXgMN8beEHYmGJlnNXZc_s40tRq48_Cz8nz5LeDBbFn2pM4JB2sYw5C1DWqBKPBoCh4oy6QdZrI2dkvbdKYYcei-s7NmmRwi",
  explorerLesson: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiUK-Xq9eqixMs_LhSsKB7uiD-tEC4NY93W5JYmrbAIhI6rHc-nW4c1qPV2gqbYmgjIddwV5BtGsRl41hYiG8LBtMJJ9n9JAWrh308PSok3Gy6Rzra2XRStRuPodOOcBzpuiBuCDtStKbfGncfXGAo4T6lpMjE_TqxKOnLPZr7WpLL0PjWQC8gAHIyUVXTYwCVaFW5CbjRgJR3rrIQIU7B0-earQu8THstKkHHxKNJgnu7EQNw9cVYwO0B7K0btPb3LyWmkiI9K35B"
};

// --- Components ---

const ThemeToggle = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => (
  <button 
    onClick={onToggle}
    className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all text-slate-700 dark:text-slate-200"
  >
    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
);

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const handleGoogleSuccess = async (response: any) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin();
      } else {
        alert("Login failed! Reason: " + (data.errorDetials || data.message));
      }
    } catch (e) {
      console.error(e);
      alert("Verification error.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen bg-surface dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-500">
        <header className="w-full top-0 sticky bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-center items-center h-16 px-6 z-50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between w-full max-w-7xl">
            <div className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-headline">
              {courseData.course.title}
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center relative px-4 py-12">
          {/* Background blurred circles */}
          <div className="absolute top-10 -left-20 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 -right-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px]"></div>

          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
              
              <div className="text-center space-y-4 mb-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-6">🐍</div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Welcome student</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {courseData.course.subtitle} — {courseData.course.version}
                </p>
              </div>

              <div className="flex justify-center w-full mb-8">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log('Login Failed')}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 w-full text-center flex flex-col items-center gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  By signing in, you agree to our policies.
                </p>
                <div className="flex gap-4">
                  <a href="privacy.html" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">Privacy Policy</a>
                  <a href="tos.html" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">Terms of Service</a>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
};

const LearningPathPage = ({ onSelectModule, onSelectLesson }: { onSelectModule: () => void, onSelectLesson: (id: string) => void }) => {
  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-500">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50">
        <div className="text-2xl font-bold font-headline flex items-center gap-3">
          <span className="text-xl">🐍</span>
          <span>{courseData.course.title}</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="font-headline font-bold text-cyan-600 dark:text-white border-b-2 border-cyan-500 dark:border-slate-500 py-1">Curriculum Area</a>
        </nav>
        <div className="flex items-center gap-4">
        </div>
      </header>

      <main className="relative min-h-screen pt-32 pb-24 px-6 md:px-12">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-cyan-50 dark:from-cyan-900/10 to-transparent -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center mb-24 relative">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 text-xs font-bold uppercase tracking-widest mb-6">
              V {courseData.course.version}
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
              Mastering <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400">Python</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              {courseData.course.subtitle} A systemic journey from basic concepts to deep object-oriented paradigms.
            </p>
          </motion.div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Path Line */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-purple-500 to-slate-200 dark:to-slate-800 rounded-full opacity-30"></div>
          
          <div className="relative flex flex-col gap-12 md:gap-24">
            {courseData.modules.map((mod, index) => {
              const isEven = index % 2 === 0;
              const firstLessonId = mod.lessons[0]?.id;
              
              return (
                <motion.div 
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center group pl-16 md:pl-0`}
                >
                  {/* Content Box */}
                  <div className={`md:w-1/2 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16 text-left'} w-full relative z-10`}>
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl transition-all hover:shadow-2xl hover:border-cyan-200 dark:hover:border-slate-700">
                      
                      {/* Explorer Image for Module 2 */}
                      {index === 1 && (
                        <motion.div 
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className={`absolute -top-20 ${isEven ? 'right-10' : 'left-10'} w-24 h-24 z-30 hidden md:block`}
                        >
                          <img src={IMAGES.explorerPath} alt="Explorer" className="w-full h-full object-contain drop-shadow-2xl" referrerPolicy="no-referrer" />
                        </motion.div>
                      )}

                      <div className={`flex items-center gap-3 mb-4 ${isEven ? 'md:justify-end' : ''}`}>
                        <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner">{mod.icon}</span>
                        <span className="text-cyan-700 dark:text-cyan-400 font-headline text-xs font-bold tracking-widest uppercase">Module 0{index + 1}</span>
                      </div>
                      
                      <h3 className="font-headline text-3xl font-bold text-slate-900 dark:text-white mb-2">{mod.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mb-6 uppercase tracking-wider">{mod.titleEn}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-8 mt-4">
                        {mod.lessons.map((les, i) => (
                           <button 
                             key={les.id}
                             className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors border ${
                               i === 0 
                                ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100'
                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                             }`}
                             onClick={(e) => {
                               e.stopPropagation();
                               onSelectLesson(les.id);
                             }}
                           >
                             {les.title}
                           </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          onSelectModule();
                          if (firstLessonId) onSelectLesson(firstLessonId);
                        }}
                        className={`bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 hover:shadow-lg flex items-center gap-2 ${isEven ? 'ml-auto' : ''}`}
                      >
                        Start Module <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Timeline Node */}
                  <div className="absolute left-[22px] md:left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-slate-900 border-4 border-cyan-500 rounded-full z-20 shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
                </motion.div>
              );
            })}

            {/* Final Destination */}
            <div className="relative flex justify-center py-16 pl-16 md:pl-0 mt-8">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center relative z-20 shadow-inner">
                <span className="text-3xl">🎯</span>
              </div>
              <div className="absolute -bottom-2 font-headline text-slate-500 font-bold tracking-widest uppercase text-[10px]">Course Complete</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const LessonPage = ({ lessonId, onBack, onLessonChange }: { lessonId: string, onBack: () => void, onLessonChange: (id: string) => void }) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const flatLessons = getFlatLessons();
  const mainRef = useRef<HTMLElement>(null);
  
  const currentData = findLesson(lessonId);
  const lesson = currentData?.lesson;
  const module = currentData?.module;
  
  const currentIndex = flatLessons.findIndex(l => l.id === lessonId);
  const currentFlatLesson = flatLessons[currentIndex];
  const possiblePrev = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const possibleNext = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  const prevLesson = possiblePrev?.moduleId === currentFlatLesson?.moduleId ? possiblePrev : null;
  const nextLesson = possibleNext?.moduleId === currentFlatLesson?.moduleId ? possibleNext : null;

  useEffect(() => {
    if (module && !expandedModules.includes(module.id)) {
      setExpandedModules(prev => [...prev, module.id]);
    }
  }, [module]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };
  
  const handleLessonChange = (id: string) => {
    onLessonChange(id);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!lesson || !module) return null;

  return (
    <div className="h-screen bg-surface dark:bg-slate-950 flex flex-col transition-colors duration-500">
      <nav className="w-full flex-shrink-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-4 md:px-6 py-3">
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-semibold uppercase tracking-wider"
          >
            <ChevronRight className="w-5 h-5 rotate-180" /> Back to Map
          </button>
        </div>
        <div className="font-mono text-xs text-slate-400 hidden sm:block">
          {currentIndex + 1} / {flatLessons.length}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className="hidden lg:block w-72 flex-shrink-0 z-40 bg-transparent relative border-r border-slate-200/50 dark:border-slate-800/50">
           <Sidebar 
             currentLessonId={lessonId}
             expandedModules={expandedModules}
             onToggleModule={toggleModule}
             onSelectLesson={handleLessonChange}
           />
        </aside>

        <main ref={mainRef} className="flex-1 overflow-y-auto bg-surface dark:bg-[#0B1015]">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 lg:px-16 min-h-full flex flex-col relative">
            
            <motion.header 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 pb-8 border-b border-slate-200 dark:border-slate-800/60"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-6 font-mono">
                <span className="text-cyan-600 dark:text-cyan-400">{module.icon} Module 0{courseData.modules.findIndex(m=>m.id===module.id)+1}</span>
                <span className="opacity-50">/</span>
                <span>{module.title}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-slate-900 dark:text-white mb-4 leading-[1.1] tracking-tight">
                {lesson.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-6">
                 <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium">
                  {lesson.titleEn}
                 </p>
                 <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono border border-slate-200 dark:border-slate-700">
                   Pages {lesson.pdfPages.join('–')}
                 </span>
              </div>
            </motion.header>

            <div className="flex-1">
              {lesson.content.map((block, index) => (
                <LessonContent key={`${lesson.id}-${index}`} block={block} index={index} />
              ))}
            </div>

            <footer className="mt-24 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 pb-20">
              {prevLesson ? (
                <button 
                  onClick={() => handleLessonChange(prevLesson.id)}
                  className="flex-1 flex flex-col items-start p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left group"
                >
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1 group-hover:text-cyan-600 transition-colors">Previous</span>
                  <span className="font-headline font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{prevLesson.title}</span>
                </button>
              ) : (
                <button 
                  onClick={onBack}
                  className="flex-1 flex flex-col items-start p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left group"
                >
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1 group-hover:text-cyan-600 transition-colors">Beginning of Module</span>
                  <span className="font-headline font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Go Back to Map</span>
                </button>
              )}
              
              {nextLesson ? (
                <button 
                   onClick={() => handleLessonChange(nextLesson.id)}
                   className="flex-1 flex flex-col items-end p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-right group"
                 >
                   <span className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1 group-hover:text-purple-600 transition-colors">Next</span>
                   <span className="font-headline font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{nextLesson.title}</span>
                 </button>
              ) : (
                <button 
                  onClick={onBack}
                  className="flex-1 flex flex-col items-end p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-right group"
                >
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1 group-hover:text-purple-600 transition-colors">Module Complete</span>
                  <span className="font-headline font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Go Back to Map</span>
                </button>
              )}
            </footer>
          </div>
          
          <motion.img 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            src={IMAGES.explorerLesson} 
            alt="Explorer" 
            className="fixed bottom-10 right-10 w-24 h-24 hidden xl:block drop-shadow-2xl opacity-80 hover:opacity-100 transition-opacity" 
            referrerPolicy="no-referrer" 
          />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentLessonId, setCurrentLessonId] = useState<string>('les-01-01');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-200 selection:text-cyan-900 dark:selection:bg-cyan-900 dark:selection:text-cyan-100">
      <AnimatePresence mode="wait">
        {currentPage === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginPage onLogin={() => setCurrentPage('path')} />
          </motion.div>
        )}

        {currentPage === 'path' && (
          <motion.div
            key="path"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LearningPathPage 
              onSelectModule={() => setCurrentPage('lesson')} 
              onSelectLesson={(lessonId) => {
                setCurrentLessonId(lessonId);
                setCurrentPage('lesson');
              }}
            />
          </motion.div>
        )}

        {currentPage === 'lesson' && (
          <motion.div
            key="lesson"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LessonPage 
              lessonId={currentLessonId}
              onLessonChange={setCurrentLessonId}
              onBack={() => setCurrentPage('path')} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-6 z-[100]">
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      </div>
    </div>
  );
}
