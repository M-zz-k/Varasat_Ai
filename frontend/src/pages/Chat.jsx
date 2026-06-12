import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useDocumentStore } from '../stores/useDocumentStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'English',  label: 'English'  },
  { code: 'Hindi',    label: 'Hindi'    },
  { code: 'Kannada',  label: 'Kannada'  },
  { code: 'Tamil',    label: 'Tamil'    },
  { code: 'Telugu',   label: 'Telugu'   },
  { code: 'Marathi',  label: 'Marathi'  },
  { code: 'Bengali',  label: 'Bengali'  },
  { code: 'Gujarati', label: 'Gujarati' },
];

const SUGGESTION_PROMPTS = [
  { icon: 'bank',      text: 'My father passed away. How do I find his bank accounts?' },
  { icon: 'document',  text: 'My mother had an LIC policy. How do I claim it?'         },
  { icon: 'scroll',    text: 'How do I get a Legal Heir Certificate?'                   },
  { icon: 'briefcase', text: "What documents do I need to recover my husband's PF?"     },
];

// ─── Inline SVG Icons ──────────────────────────────────────────────────────────

function SuggestionIcon({ name }) {
  switch (name) {
    case 'bank':
      return <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 10l9-7 9 7M3 10v11a1 1 0 001 1h5v-4h4v4h5a1 1 0 001-1V10" /></svg>;
    case 'document':
      return <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'scroll':
      return <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" /></svg>;
    case 'briefcase':
      return <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
    default:
      return null;
  }
}

const MitraIcon = () => (
  <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/>
  </svg>
);

const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Text Renderer ─────────────────────────────────────────────────────────────
// Renders markdown-style **bold** and bullet points cleanly

function FormattedText({ text }) {
  if (!text) return null;

  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-1.5" />;

        // Render **bold** correctly (close with **)
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} className="text-amber-400 font-extrabold">{part}</strong>
            : part
        );

        const isBullet  = line.trim().startsWith('- ') || line.trim().startsWith('• ');
        const isNumList = /^\d+\.\s/.test(line.trim());

        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              <span>{rendered}</span>
            </div>
          );
        }
        if (isNumList) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="text-slate-400 font-bold flex-shrink-0 min-w-[18px]">
                {line.trim().match(/^\d+/)?.[0]}.
              </span>
              <span>{rendered}</span>
            </div>
          );
        }

        return <div key={i}>{rendered}</div>;
      })}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return (
    <div className={`flex items-end gap-3 mb-4 max-w-[88%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser
          ? 'bg-slate-800 border border-slate-700'
          : 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-md shadow-amber-500/10'
      }`}>
        {isUser ? <UserIcon /> : <MitraIcon />}
      </div>

      {/* Bubble */}
      <div className={`group relative p-4 rounded-2xl text-sm leading-relaxed break-words shadow-sm transition-all ${
        isUser
          ? 'bg-slate-900 border border-slate-800 text-white rounded-tr-none'
          : 'bg-slate-900/60 border border-slate-800/80 text-slate-200 rounded-tl-none'
      }`}>

        {/* Copy button (AI messages only) */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Copy"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        )}

        <div className="pr-5">
          <FormattedText text={msg.content} />
        </div>

        {/* Timestamp */}
        <div className="text-[10px] text-slate-500 mt-2 text-right font-mono">{time}</div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4 self-start">
      <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-b from-amber-400 to-amber-600 shadow-md shadow-amber-500/10">
        <MitraIcon />
      </div>
      <div className="bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Chat() {
  const { t, lang, toggleLanguage } = useTranslation();
  const ocrResults = useDocumentStore(state => state.ocrResults);

  const getInitialMessage = () => {
    if (ocrResults) {
      const pName = ocrResults.person_name?.value || ocrResults.person_name || 'Ramesh Kumar';
      const assetType = ocrResults.asset_type?.value || ocrResults.asset_type || 'Bank Account';
      const inst = ocrResults.institution?.value || ocrResults.institution || 'State Bank of India';
      const amt = ocrResults.amount?.value || ocrResults.amount || '8,80,000';
      const nom = ocrResults.nominee?.value || ocrResults.nominee || 'None Registered';

      return `Namaste! I see you just analyzed a document for **${pName}**.\n\nHere are the details we discovered:\n- **Asset Type**: **${assetType}**\n- **Institution**: **${inst}**\n- **Amount**: **₹${amt}**\n- **Nominee Status**: **${nom}**\n\nI can help you prepare the claim forms, write a formal claim letter, or explain the exact legal steps to claim this asset. What would you like to do first?`;
    }
    return t('chat.welcome');
  };

  const [messages, setMessages] = useState(() => [
    {
      role:      'assistant',
      content:   getInitialMessage(),
      timestamp: new Date().toISOString(),
      id:        'welcome',
    }
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [language, setLanguage] = useState('English');
  const [error,    setError]    = useState('');

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Core send handler — calls backend JSON endpoint ────────────────────────
  async function handleSend(textToSend) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setError('');

    const userMsg = {
      role:      'user',
      content:   text,
      timestamp: new Date().toISOString(),
      id:        `user-${Date.now()}`,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Placeholder for the streaming assistant reply
    const assistantId = `msg-${Date.now()}`;
    setMessages(prev => [...prev, {
      role:      'assistant',
      content:   '',
      timestamp: new Date().toISOString(),
      id:        assistantId,
    }]);

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, language, sessionId: 'default' }),
      });

      if (!res.ok) {
        let errMsg = 'Failed to communicate with Varasat Mitra.';
        try {
          const errJson = await res.json();
          errMsg = errJson?.error?.message || errJson?.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const contentType = res.headers.get('content-type') || '';

      // ── Handle JSON response (current backend) ──────────────────────────────
      if (contentType.includes('application/json')) {
        const data = await res.json();
        const reply = data.reply || data.message || 'Varasat Mitra responded.';
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: reply } : m)
        );
      }
      // ── Handle SSE / text stream (future backend upgrade) ──────────────────
      else if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
        const reader  = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            for (const line of chunk.split('\n')) {
              if (line.startsWith('data: ')) {
                const raw = line.slice(6).trim();
                if (raw === '[DONE]') { done = true; break; }
                try {
                  const parsed = JSON.parse(raw);
                  if (parsed.text) {
                    accumulated += parsed.text;
                    setMessages(prev =>
                      prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
                    );
                  }
                } catch (_) {}
              }
            }
          }
        }
      }
      // ── Unknown content type — try reading as text ─────────────────────────
      else {
        const raw = await res.text();
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: raw || 'No response received.' } : m)
        );
      }
    } catch (err) {
      console.error('[Chat] Error:', err);
      // Replace the empty placeholder with error message
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: '⚠️ ' + (err.message || 'Something went wrong. Please try again.') }
            : m
        )
      );
      setError(err.message || 'Failed to query Varasat Mitra.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function handleClear() {
    if (loading) return;
    try {
      await fetch('/api/chat/clear', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId: 'default' }),
      });
    } catch (_) {}
    setMessages([INITIAL_MESSAGE]);
    setError('');
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-300 flex flex-col relative overflow-hidden">

      {/* Ambient orbs */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] -bottom-40 -right-40 pointer-events-none" />

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-slate-400 hover:text-white font-bold text-xs px-2.5 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-800/50 transition-all mr-1"
          >
            ← Home
          </Link>

          <div className="w-9 h-9 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20">
            <MitraIcon />
          </div>

          <div>
            <h1 className="font-extrabold text-white text-sm leading-none">{t('chat.title')}</h1>
            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{t('chat.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-400 transition-all cursor-pointer"
          >
            <svg style={{ width: '1rem', height: '1rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l7.5-7.5L21 21M16.5 15h3.75M3 5.25h16.5M3.75 3v15m9-15v15" />
            </svg>
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-800/50 cursor-pointer disabled:opacity-40 transition-all"
          >
            {t('chat.clear')}
          </button>
        </div>
      </header>

      {/* ── Chat area ── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col overflow-y-auto pb-36">

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-xs font-semibold">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-3 text-red-400 hover:text-red-200 cursor-pointer font-bold">✕</button>
          </div>
        )}

        {/* Messages */}
        <div className="flex flex-col flex-1">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* ── Suggestion prompts (only when fresh) ── */}
      {messages.length === 1 && !loading && (
        <div className="fixed bottom-24 inset-x-0 max-w-2xl mx-auto px-4 sm:px-6 z-30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTION_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                className="flex items-start gap-2.5 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer backdrop-blur-sm"
              >
                <SuggestionIcon name={p.icon} />
                <span className="mt-0.5">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input footer ── */}
      <footer className="fixed bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 py-3 px-4 sm:px-6 z-40">
        <div className="max-w-3xl mx-auto w-full">
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 items-center"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              disabled={loading}
              className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm font-semibold outline-none border-none px-3 py-1"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold text-xs h-9 px-4 tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <SendIcon />
                  {t('chat.send')}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-600 mt-1.5 font-medium">
            Varasat Mitra is an AI assistant. Always verify legal advice with a qualified professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
