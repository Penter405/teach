import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Loader2, MessageCircle, RefreshCw, Send, XCircle } from 'lucide-react';

interface StudentUser {
  name?: string;
  email?: string;
}

interface TeacherMessage {
  role: 'student' | 'teacher';
  text: string;
  createdAt?: string;
}

interface TeacherQuestion {
  _id: string;
  question: string;
  reply?: string;
  messages?: TeacherMessage[];
  status: 'open' | 'answered' | 'closed';
  closedBy?: 'student' | 'teacher' | null;
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

function getMessages(question?: TeacherQuestion): TeacherMessage[] {
  if (!question) return [];
  if (question.messages?.length) return question.messages;

  const messages: TeacherMessage[] = [{ role: 'student', text: question.question, createdAt: question.createdAt }];
  if (question.reply) {
    messages.push({ role: 'teacher', text: question.reply, createdAt: question.answeredAt });
  }
  return messages;
}

export function TeacherQuestionPanel({
  lessonId,
  lessonTitle,
  moduleId,
  moduleTitle,
  student,
}: TeacherQuestionPanelProps) {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [composingNew, setComposingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const studentEmail = student?.email?.trim().toLowerCase() || '';
  const studentName = student?.name?.trim() || studentEmail || 'Student';
  const selectedQuestion = questions.find((question) => question._id === selectedId);
  const activeMessages = useMemo(() => getMessages(selectedQuestion), [selectedQuestion]);
  const canContinue = selectedQuestion && selectedQuestion.status !== 'closed' && !composingNew;

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

      const nextQuestions = data.questions || [];
      setQuestions(nextQuestions);
      const openQuestion = nextQuestions.find((question: TeacherQuestion) => question.status !== 'closed');
      const nextSelected = openQuestion?._id || nextQuestions[0]?._id || '';
      setSelectedId((current) => (nextQuestions.some((question: TeacherQuestion) => question._id === current) ? current : nextSelected));
      setComposingNew(nextQuestions.length === 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [lessonId, studentEmail]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [activeMessages.length, selectedId]);

  const updateQuestion = (updatedQuestion: TeacherQuestion) => {
    setQuestions((current) => {
      const exists = current.some((question) => question._id === updatedQuestion._id);
      if (!exists) return [updatedQuestion, ...current];
      return current.map((question) => (question._id === updatedQuestion._id ? updatedQuestion : question));
    });
    setSelectedId(updatedQuestion._id);
    setComposingNew(false);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !studentEmail) return;

    setSending(true);
    setMessage(null);

    try {
      const isNewThread = composingNew || !selectedQuestion || selectedQuestion.status === 'closed';
      const response = await fetch(
        isNewThread ? `${API_BASE}/api/questions` : `${API_BASE}/api/questions?id=${encodeURIComponent(selectedQuestion._id)}`,
        {
          method: isNewThread ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isNewThread
              ? {
                  lessonId,
                  lessonTitle,
                  moduleId,
                  moduleTitle,
                  studentEmail,
                  studentName,
                  question: text,
                }
              : {
                  role: 'student',
                  message: text,
                },
          ),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send message.');
      }

      setInputText('');
      updateQuestion(data.question);
      setMessage('Sent to your teacher.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    if (!selectedQuestion || selectedQuestion.status === 'closed' || sending) return;
    setSending(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/questions?id=${encodeURIComponent(selectedQuestion._id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close', closedBy: 'student' }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to close chat.');
      }

      updateQuestion(data.question);
      setMessage('Chat closed. You can reask with a new chat.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to close chat.');
    } finally {
      setSending(false);
    }
  };

  const startReask = () => {
    setComposingNew(true);
    setSelectedId('');
    setInputText('');
    setMessage('Start a new ask for this lesson.');
  };

  return (
    <div className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-cyan-500/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-headline font-bold text-sm text-slate-800 dark:text-white truncate">Talk to teacher</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {selectedQuestion?.status === 'closed' ? 'Closed chat' : 'Live teacher thread'}
            </p>
          </div>
        </div>
        <button
          onClick={loadQuestions}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-300 disabled:opacity-50"
          title="Refresh"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/60 flex gap-2 overflow-x-auto">
          {questions.map((question, index) => (
            <button
              key={question._id}
              onClick={() => {
                setSelectedId(question._id);
                setComposingNew(false);
                setMessage(null);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition-colors ${
                selectedId === question._id && !composingNew
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Ask {questions.length - index}
              {question.status === 'closed' && <span className="ml-1 opacity-70">closed</span>}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading chat...
          </div>
        )}

        {!loading && !selectedQuestion && !composingNew && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 text-sm text-slate-500 dark:text-slate-400">
            <MessageCircle className="w-10 h-10 mb-3 opacity-40" />
            No chat for this lesson yet.
          </div>
        )}

        {composingNew && (
          <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/30 p-4 text-sm text-cyan-700 dark:text-cyan-200">
            New ask. Your teacher will see this as a fresh thread.
          </div>
        )}

        <AnimatePresence>
          {activeMessages.map((chatMessage, index) => (
            <motion.div
              key={`${selectedId}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${chatMessage.role === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  chatMessage.role === 'student'
                    ? 'bg-cyan-600 text-white rounded-br-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-700'
                }`}
              >
                {chatMessage.role === 'teacher' && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Teacher
                  </div>
                )}
                <p className="whitespace-pre-wrap">{chatMessage.text}</p>
                <p className={`mt-2 text-[10px] font-mono ${chatMessage.role === 'student' ? 'text-cyan-100' : 'text-slate-400'}`}>
                  {formatDate(chatMessage.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {selectedQuestion?.status === 'closed' && !composingNew && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4 text-sm text-slate-600 dark:text-slate-300">
            This chat was closed by {selectedQuestion.closedBy || 'someone'}. It cannot continue.
            <button onClick={startReask} className="mt-3 w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-700">
              Reask
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700/60">
        {canContinue && (
          <button
            onClick={closeChat}
            disabled={sending}
            className="mb-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Close this chat
          </button>
        )}
        <textarea
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          placeholder={selectedQuestion?.status === 'closed' && !composingNew ? 'Tap Reask to start a new chat.' : 'Message your teacher...'}
          rows={3}
          disabled={!studentEmail || sending || (selectedQuestion?.status === 'closed' && !composingNew)}
          className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || sending || !studentEmail || (selectedQuestion?.status === 'closed' && !composingNew)}
          className="mt-3 w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 hover:bg-cyan-700 transition-colors disabled:opacity-40"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {composingNew || !selectedQuestion ? 'Send new ask' : 'Send message'}
        </button>
        {message && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{message}</p>}
      </div>
    </div>
  );
}
