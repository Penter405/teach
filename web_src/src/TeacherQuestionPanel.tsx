import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Loader2, MessageCircle, Send } from 'lucide-react';

interface StudentUser {
  name?: string;
  email?: string;
}

interface TeacherQuestion {
  _id: string;
  question: string;
  reply?: string;
  status: 'open' | 'answered';
  createdAt: string;
  answeredAt?: string;
}

interface TeacherQuestionPanelProps {
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  moduleTitle: string;
  student: StudentUser | null;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://teach-beige.vercel.app';

function formatDate(value?: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function TeacherQuestionPanel({
  lessonId,
  lessonTitle,
  moduleId,
  moduleTitle,
  student,
}: TeacherQuestionPanelProps) {
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const studentEmail = student?.email?.trim().toLowerCase() || '';
  const studentName = student?.name?.trim() || studentEmail || 'Student';

  const loadQuestions = async () => {
    if (!studentEmail) return;
    setLoading(true);
    setMessage(null);

    try {
      const params = new URLSearchParams({ studentEmail, lessonId });
      const response = await fetch(`${API_BASE}/api/questions?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load questions.');
      }

      setQuestions(data.questions || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [lessonId, studentEmail]);

  const handleSubmit = async () => {
    const question = questionText.trim();
    if (!question || sending || !studentEmail) return;

    setSending(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          lessonTitle,
          moduleId,
          moduleTitle,
          studentEmail,
          studentName,
          question,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send question.');
      }

      setQuestionText('');
      setQuestions((current) => [data.question, ...current]);
      setMessage('Question sent to your teacher.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send question.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-cyan-500/10">
        <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline font-bold text-sm text-slate-800 dark:text-white truncate">Talk to teacher</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Send a question for this lesson.</p>
        </div>
      </div>

      <div className="p-4 border-b border-slate-200 dark:border-slate-700/60">
        <textarea
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          placeholder="Describe where you are stuck..."
          rows={5}
          disabled={!studentEmail || sending}
          className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!questionText.trim() || sending || !studentEmail}
          className="mt-3 w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 hover:bg-cyan-700 transition-colors disabled:opacity-40"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send to teacher
        </button>
        {message && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{message}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading questions...
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 text-sm text-slate-500 dark:text-slate-400">
            <MessageCircle className="w-10 h-10 mb-3 opacity-40" />
            No questions sent for this lesson yet.
          </div>
        )}

        <AnimatePresence>
          {questions.map((question) => (
            <motion.div
              key={question._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[11px] font-mono text-slate-400">{formatDate(question.createdAt)}</span>
                <span className={`text-[11px] font-bold rounded-full px-2 py-1 ${
                  question.status === 'answered'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                }`}>
                  {question.status === 'answered' ? 'Answered' : 'Waiting'}
                </span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{question.question}</p>
              {question.reply && (
                <div className="mt-3 rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Teacher reply
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{question.reply}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
