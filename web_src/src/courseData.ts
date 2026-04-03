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
  type: 'heading' | 'paragraph' | 'code' | 'callout' | 'diagram' | 'list' | 'animation' | 'quiz' | 'practice';
  text?: string;
  code?: string;
  language?: string;
  label?: string;
  diagramId?: string;
  animationId?: string;
  caption?: string;
  style?: string;
  items?: any[];
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
import data from '../../python_course/data.json';

export const courseData: CourseData = data as CourseData;

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
