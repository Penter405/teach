// ── Types ──

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface PracticeProblem {
  title: string;
  titleEn?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  url: string;
  description?: string;
}

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'code' | 'callout' | 'diagram' | 'image' | 'list' | 'animation' | 'quiz' | 'practice' | 'ai-chat' | 'matching';
  text?: string;
  title?: string;
  subtitle?: string;
  coursePrompt?: string;
  difficulty?: string;
  code?: string;
  language?: string;
  label?: string;
  diagramId?: string;
  imageId?: number;
  animationId?: number;
  caption?: string;
  style?: string;
  items?: any[];
  categories?: string[];
  steps?: string[];
  // Quiz
  questions?: QuizQuestion[];
  // Practice
  problems?: PracticeProblem[];
}

export interface Lesson {
  id: string;
  title: string;
  titleEn: string;
  pdfPages: number[];
  content: ContentBlock[];
}

export interface Module {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  lessons: Lesson[];
}

export interface CourseData {
  course: {
    title: string;
    subtitle: string;
    version: string;
    language: string;
  };
  modules: Module[];
}

export interface FlatLesson extends Lesson {
  moduleId: string;
  moduleTitle: string;
  moduleIcon: string;
}

// ── Data ──
// Data is loaded at runtime via fetch() so that editing data.json
// does NOT require a rebuild — just copy it to docs/ and push.
// loadCourseData() must be called (and awaited) before React renders.

export let courseData: CourseData = {} as CourseData;

export async function loadCourseData(): Promise<void> {
  const response = await fetch('./data.json');
  if (!response.ok) throw new Error(`Failed to load data.json: ${response.status}`);
  const data = await response.json();
  courseData = data as CourseData;
}

export function getFlatLessons(): FlatLesson[] {
  const flat: FlatLesson[] = [];
  courseData.modules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      flat.push({
        ...les,
        moduleId: mod.id,
        moduleTitle: mod.title,
        moduleIcon: mod.icon,
      });
    });
  });
  return flat;
}

export function findLesson(lessonId: string): { lesson: Lesson; module: Module } | null {
  for (const mod of courseData.modules) {
    const found = mod.lessons.find((l) => l.id === lessonId);
    if (found) return { lesson: found, module: mod };
  }
  return null;
}
