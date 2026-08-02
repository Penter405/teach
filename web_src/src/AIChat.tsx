import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Loader2, RotateCcw, Send, Sparkles, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface AIChatProps {
  coursePrompt?: string;
  model?: string;
  title?: string;
  subtitle?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://teach-beige.vercel.app';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderMarkdown(text: string): string {
  let html = escapeHtml(text);

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-xl p-4 my-3 overflow-x-auto text-sm font-mono border border-slate-700"><code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>');
  html = html.replace(/^### (.+)$/gm, '<h4 class="font-semibold text-base mt-3 mb-1 text-slate-800 dark:text-slate-200">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="font-bold text-lg mt-4 mb-2 text-slate-800 dark:text-slate-200">$1</h3>');
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-2 space-y-1">$&</ul>');
  html = html.replace(/\n/g, '<br/>');

  return html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/g, (_match, attrs, content) => {
    return `<pre${attrs}>${content.replace(/<br\/>/g, '\n')}</pre>`;
  });
}

export function AIChat({
  coursePrompt,
  model = 'gemini-3.5-flash-lite',
  title = 'Talk to teacher',
  subtitle = 'Ask about this lesson and get a guided answer.',
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading, error]);

  const buildFullPrompt = (userMessage: string): string => {
    const history = messages
      .map((message) => `${message.role === 'user' ? 'Student' : 'Teacher'}: ${message.text}`)
      .join('\n');

    return [
      'You are a patient programming teacher for this Python course.',
      'Answer in the same language as the student when possible.',
      'Prefer hints, short examples, and step-by-step reasoning over giving only final answers.',
      history ? `Conversation so far:\n${history}` : '',
      `Student: ${userMessage}`,
      'Teacher:',
    ].filter(Boolean).join('\n\n');
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setError(null);

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: buildFullPrompt(userText),
          coursePrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.text) {
        throw new Error(data.message || data.error || 'Teacher response failed.');
      }

      setMessages([...nextMessages, { role: 'assistant', text: data.text }]);
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : 'Unable to reach the teacher service.';
      setError(message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-headline font-bold text-sm text-slate-800 dark:text-white truncate">{title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">Powered by {model}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[300px]">
              <strong className="text-slate-700 dark:text-slate-300 mb-2 block">{subtitle}</strong>
              Include the exact step, error, or code you are stuck on.
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-md shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-bl-md border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div
                    className="prose-sm prose-slate dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
                  />
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{message.text}</span>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700/60 px-4 py-3 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your teacher..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(event) => {
              const textarea = event.target as HTMLTextAreaElement;
              textarea.style.height = 'auto';
              textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">Enter to send, Shift+Enter for a new line.</p>
      </div>
    </div>
  );
}
