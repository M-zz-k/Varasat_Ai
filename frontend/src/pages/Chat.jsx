import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { sendMessage, clearChatSession } from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'English',  label: '🇬🇧 English'  },
  { code: 'Hindi',    label: '🇮🇳 Hindi'    },
  { code: 'Kannada',  label: '🇮🇳 Kannada'  },
  { code: 'Tamil',    label: '🇮🇳 Tamil'    },
  { code: 'Telugu',   label: '🇮🇳 Telugu'   },
  { code: 'Marathi',  label: '🇮🇳 Marathi'  },
  { code: 'Bengali',  label: '🇮🇳 Bengali'  },
  { code: 'Gujarati', label: '🇮🇳 Gujarati' },
];

const SUGGESTION_PROMPTS = [
  { icon: '🏦', text: 'My father passed away. How do I find his bank accounts?' },
  { icon: '📋', text: 'My mother had an LIC policy. How do I claim it?'         },
  { icon: '📜', text: 'How do I get a Legal Heir Certificate?'                   },
  { icon: '💼', text: 'What documents do I need to recover my husband\'s PF?'   },
];

const INITIAL_MESSAGE = {
  role:      'assistant',
  content:   '🙏 Namaste! I am **Varasat Mitra**, your inheritance recovery guide.\n\nI help Indian families find and claim assets belonging to deceased family members — bank accounts, insurance policies, provident funds, shares, and more.\n\nI am sorry for your loss. Please tell me:\n\n1. Who passed away (your relation to them)?\n2. What kind of assets are you trying to recover?',
  timestamp: new Date().toISOString(),
  id:        'welcome',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FormattedText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-2" />;

        // Bold text parser
        const parts = line.split(/\*\*(.*?)\*\//g);
        const rendered = parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} className="text-amber-500 font-extrabold">{part}</strong>
            : part
        );

        const isListItem = /^\d+\.\s/.test(line.trim());

        return (
          <div 
            key={i} 
            className={`flex items-start ${isListItem ? 'gap-1.5 mb-1 pl-2' : ''}`}
          >
            {rendered}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-end gap-3 mb-4 max-w-[80%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
      
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${
        isUser 
          ? 'bg-slate-800 text-white border border-slate-700' 
          : 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/10'
      }`}>
        {isUser ? '👤' : '⚖️'}
      </div>

      {/* Bubble Container */}
      <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-[14px] leading-relaxed break-words relative transition-all ${
        isUser 
          ? 'bg-slate-900 border border-slate-800 text-white rounded-tr-none' 
          : 'bg-slate-900/60 border border-slate-850/80 text-slate-200 rounded-tl-none'
      }`}>
        <FormattedText text={msg.content} />

        {/* Timestamp */}
        <div className="text-[10px] text-slate-500 mt-2 text-right">
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
            hour:   '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4 self-start">
      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/10">
        ⚖️
      </div>

      <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span 
            key={i} 
            className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce-subtle"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl text-red-400 text-xs font-semibold mb-3">
      <span>⚠️ {message}</span>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-300 font-bold text-sm">✕</button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Chat() {
  const [messages,  setMessages]  = useState([INITIAL_MESSAGE]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [language,  setLanguage]  = useState('English');
  const [error,     setError]     = useState('');
  const [charCount, setCharCount] = useState(0);

  const [sessionId] = useState(() => `vs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async (overrideText) => {
    const userText = (overrideText ?? input).trim();
    if (!userText || loading) return;

    setError('');
    setInput('');
    setCharCount(0);

    const userMsg = {
      role:      'user',
      content:   userText,
      timestamp: new Date().toISOString(),
      id:        `u-${Date.now()}`,
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await sendMessage(userText, language, sessionId);
      if (!data.success) throw new Error(data.error || 'Unexpected error.');

      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   data.reply,
        timestamp: new Date().toISOString(),
        id:        `a-${Date.now()}`,
      }]);
    } catch (err) {
      setError(err.message || 'Could not reach Varasat Mitra. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, language, loading, sessionId]);

  async function handleNewChat() {
    if (!window.confirm('Start a new conversation? Your current chat will be cleared.')) return;
    await clearChatSession(sessionId).catch(() => {});
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date().toISOString() }]);
    setError('');
    setInput('');
    setCharCount(0);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInputChange(e) {
    const val = e.target.value;
    if (val.length <= 2000) {
      setInput(val);
      setCharCount(val.length);
    }
  }

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="h-screen bg-slate-950 flex flex-col font-sans antialiased text-slate-300 relative overflow-hidden">
      
      {/* Glowing backdrop vectors */}
      <div className="absolute w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none"></div>

      <style>{`
        .animate-bounce-subtle {
          animation: bounce 1.4s ease infinite;
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 flex-shrink-0 z-10">
        
        {/* Header Left */}
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="text-slate-400 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-850/50 transition-all mr-2"
          >
            ← Home
          </Link>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-lg shadow-md shadow-amber-500/10">
            ⚖️
          </div>

          <div>
            <h1 className="font-extrabold text-white text-sm leading-none">Varasat Mitra</h1>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Inheritance Guide
            </div>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-850/80 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 cursor-pointer outline-none focus:border-amber-500"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button
            onClick={handleNewChat}
            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-500 hover:bg-amber-500/20 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
          >
            🔄 New Chat
          </button>
        </div>
      </header>

      {/* ── Messages Stream ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col z-10 scrollbar-thin scrollbar-thumb-amber-500/20">
        
        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="max-w-3xl mx-auto w-full mb-8">
            <p className="text-center text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">
              — Quick start prompts —
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {SUGGESTION_PROMPTS.map(s => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-3.5 bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-left cursor-pointer transition-all hover:bg-slate-900 hover:border-amber-500/30 group"
                >
                  <span className="text-2xl transition-transform group-hover:scale-110 duration-200">{s.icon}</span>
                  <span className="text-slate-300 group-hover:text-white text-xs font-semibold leading-relaxed">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col">
          {messages.map(msg => (
            <MessageBubble key={msg.id || msg.timestamp} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} className="h-4" />
        </div>
      </main>

      {/* ── Footer / Text Input Area ─────────────────────────────────────── */}
      <footer className="px-6 py-4 bg-slate-900/60 backdrop-blur-md border-t border-slate-850/80 flex-shrink-0 z-10">
        <div className="max-w-3xl mx-auto w-full">
          
          {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

          {/* Typing Area Container */}
          <div className="flex items-end gap-3 bg-slate-950 border border-slate-850 focus-within:border-amber-500/30 rounded-xl p-3.5 transition-colors">
            
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Varasat Mitra a question... (Enter to send, Shift+Enter for newline)"
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent border-none text-white text-sm placeholder-slate-600 outline-none resize-none max-h-24 overflow-y-auto leading-relaxed"
            />

            {/* Inactive Voice Indicator */}
            <button
              title="Voice input"
              disabled
              className="w-10 h-10 rounded-lg bg-slate-900/40 border border-slate-850 text-slate-600 text-lg flex items-center justify-center flex-shrink-0 cursor-not-allowed"
            >
              🎙️
            </button>

            {/* Submit Action */}
            <button
              onClick={() => handleSend()}
              disabled={!canSend}
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                canSend 
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-bold hover:scale-[1.02] shadow-sm shadow-amber-500/20 cursor-pointer' 
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
            >
              ➤
            </button>
          </div>

          {/* Footer Metadata */}
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-[10px] text-slate-500 font-bold">
              {charCount > 0 ? `${charCount} / 2000` : ''}
            </span>
            <span className="text-[10px] text-slate-500 leading-none">
              Varasat Mitra details are AI-generated. Verify all official documentation before final processing.
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
