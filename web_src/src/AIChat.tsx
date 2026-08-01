import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface AIChatProps {
  /** Context about the current chapter/course for the AI */
  coursePrompt?: string;
  /** Which Gemini model to use, defaults to gemini-3.5-flash-lite */
  model?: string;
  /** Optional title shown above the chat */
  title?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://teach-beige.vercel.app';

// Simple markdown-ish renderer for AI responses
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<pre class="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-xl p-4 my-3 overflow-x-auto text-sm font-mono border border-slate-700"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Bullet lists
  html = html.replace(/^\s*[-•]\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-2 space-y-1">$&</ul>');

  // Numbered lists
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300">$1</li>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h4 class="font-semibold text-base mt-3 mb-1 text-slate-800 dark:text-slate-200">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="font-bold text-lg mt-4 mb-2 text-slate-800 dark:text-slate-200">$1</h3>');

  // Line breaks (but not inside <pre>)
  html = html.replace(/\n/g, '<br/>');

  // Clean up excessive <br/> inside pre
  html = html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/g, (_match, attrs, content) => {
    return `<pre${attrs}>${content.replace(/<br\/>/g, '\n')}</pre>`;
  });

  return html;
}

export function AIChat({ coursePrompt, model = 'gemini-3.5-flash-lite', title }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildFullPrompt = (userMessage: string): string => {
    // Build conversation context
    let fullPrompt = '';

    // Add conversation history for context
    for (const msg of messages) {
      if (msg.role === 'user') {
        fullPrompt += `使用者：${msg.text}\n`;
      } else {
        fullPrompt += `助教：${msg.text}\n`;
      }
    }

    // Add current user message
    fullPrompt += `使用者：${userMessage}\n助教：`;

    return fullPrompt;
  };

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput('');
    setError(null);

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const fullPrompt = buildFullPrompt(userText);

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: fullPrompt, coursePrompt }),
      });

      const data = await res.json();

      if (data.success && data.text) {
        setMessages([...newMessages, { role: 'assistant', text: data.text }]);
      } else {
        setError(data.message || 'AI 回應失敗，請稍後再試。');
      }
    } catch (err: any) {
      setError('網路錯誤：' + (err.message || '無法連線到伺服器'));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setInput('');
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm text-slate-800 dark:text-white">
              {title || 'AI 助教'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Powered by Gemini · {model}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="重新開始對話"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="h-[360px] overflow-y-auto px-4 py-4 space-y-4 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
              嗨！我是你的 AI 助教 ✨<br />
              有任何關於這個章節的問題都可以問我喔！
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-md shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-bl-md border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div
                    className="prose-sm prose-slate dark:prose-invert [&_pre]:!bg-slate-900 [&_pre]:!text-slate-100"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                  />
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5 justify-start"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>思考中...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700/60 px-4 py-3 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入你的問題..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
          按 Enter 發送 · Shift+Enter 換行
        </p>
      </div>
    </div>
  );
}
