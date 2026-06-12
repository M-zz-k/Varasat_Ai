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

/** Renders plain text with basic **bold** markdown and numbered lists nicely */
function FormattedText({ text }) {
  if (!text) return null;

  // Split on newlines, render each line
  const lines = text.split('\n');

  return (
    <div>
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} style={{ height: '0.5rem' }} />;

        // Bold: replace **text** with <strong>
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} style={{ color: '#f0c040', fontWeight: 700 }}>{part}</strong>
            : part
        );

        // Detect numbered list items (e.g. "1. Step")
        const isListItem = /^\d+\.\s/.test(line.trim());

        return (
          <div key={i} style={{
            display: 'flex',
            gap: isListItem ? '0.4rem' : 0,
            marginBottom: isListItem ? '0.3rem' : 0,
            alignItems: 'flex-start',
          }}>
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
    <div style={{
      display:        'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      alignItems:     'flex-end',
      gap:            '0.6rem',
      marginBottom:   '1rem',
      animation:      'fadeInUp 0.2s ease both',
    }}>

      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: '42px', height: '42px', flexShrink: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4a017, #8b6010)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem',
          boxShadow: '0 2px 10px rgba(212,160,23,0.3)',
        }}>⚖️</div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth:     '75%',
        padding:      '1rem 1.2rem',
        borderRadius: isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
        background:   isUser
          ? 'linear-gradient(135deg, #1a4fa0 0%, #1e3a7a 100%)'
          : 'rgba(22, 42, 78, 0.9)',
        border:       isUser
          ? '1px solid rgba(100,150,255,0.25)'
          : '1px solid rgba(212,160,23,0.2)',
        color:        '#e8f0ff',
        fontSize:     '1rem',       // larger for elderly readability
        lineHeight:   1.7,
        wordBreak:    'break-word',
        boxShadow:    isUser
          ? '0 4px 16px rgba(26,79,160,0.3)'
          : '0 4px 16px rgba(0,0,0,0.3)',
      }}>
        <FormattedText text={msg.content} />

        {/* Timestamp */}
        <div style={{
          fontSize:   '0.72rem',
          color:      isUser ? 'rgba(180,200,255,0.6)' : 'rgba(140,165,200,0.6)',
          marginTop:  '0.5rem',
          textAlign:  'right',
        }}>
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
            hour:   '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: '42px', height: '42px', flexShrink: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #1a3a8f)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>👤</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: '0.6rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        width: '42px', height: '42px', flexShrink: 0,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #d4a017, #8b6010)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.25rem',
      }}>⚖️</div>

      <div style={{
        padding: '1rem 1.25rem',
        background: 'rgba(22,42,78,0.9)',
        border: '1px solid rgba(212,160,23,0.2)',
        borderRadius: '20px 20px 20px 6px',
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            display:         'inline-block',
            width:           '9px',
            height:          '9px',
            borderRadius:    '50%',
            background:      '#d4a017',
            animation:       'bounce 1.3s ease infinite',
            animationDelay:  `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1.25rem',
      background: 'rgba(200,50,50,0.15)',
      border: '1px solid rgba(220,80,80,0.4)',
      borderRadius: '10px',
      color: '#fca5a5',
      fontSize: '0.9rem',
      marginBottom: '0.75rem',
      gap: '0.75rem',
    }}>
      <span>⚠️ {message}</span>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none',
        color: '#fca5a5', cursor: 'pointer', fontSize: '1rem', flexShrink: 0,
      }}>✕</button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Chat() {
  const [messages,  setMessages]  = useState([INITIAL_MESSAGE]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [language,  setLanguage]  = useState('English');
  const [error,     setError]     = useState('');
  const [charCount, setCharCount] = useState(0);

  // Stable session ID for the whole page lifetime
  const [sessionId] = useState(() => `vs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Send a message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const userText = (overrideText ?? input).trim();
    if (!userText || loading) return;

    setError('');
    setInput('');
    setCharCount(0);

    // Optimistically add user message to UI
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

  // ── Clear / start new session ──────────────────────────────────────────────
  async function handleNewChat() {
    if (!window.confirm('Start a new conversation? Your current chat will be cleared.')) return;
    await clearChatSession(sessionId).catch(() => {});
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date().toISOString() }]);
    setError('');
    setInput('');
    setCharCount(0);
  }

  // ── Keyboard: Enter to send, Shift+Enter for newline ──────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Character counter ─────────────────────────────────────────────────────
  function handleInputChange(e) {
    const val = e.target.value;
    if (val.length <= 2000) {
      setInput(val);
      setCharCount(val.length);
    }
  }

  const canSend = input.trim().length > 0 && !loading;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100vh',
      background:    'linear-gradient(160deg, #080f1e 0%, #0d1a30 50%, #111f38 100%)',
      fontFamily:    "'Inter', 'Noto Sans Devanagari', sans-serif",
    }}>

      {/* ── Keyframe styles (injected once) ── */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0);    }
          30%            { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        textarea:focus { outline: none; }
        select option  { background: #0f1f3d; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,160,23,0.25); border-radius: 3px; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <header style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0.9rem 1.5rem',
        background:     'rgba(8,15,30,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom:   '1px solid rgba(212,160,23,0.18)',
        flexShrink:     0,
        gap:            '0.75rem',
      }}>

        {/* Left: back + avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link to="/" style={{
            color: '#8fa4c8', textDecoration: 'none',
            fontSize: '0.95rem', fontWeight: 600,
            padding: '0.3rem 0.6rem',
            borderRadius: '8px',
            transition: 'background 0.15s',
          }}>← Home</Link>

          <div style={{
            width: '46px', height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4a017, #8b6010)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: '0 0 0 3px rgba(212,160,23,0.2)',
          }}>⚖️</div>

          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f0f4ff' }}>
              Varasat Mitra
            </div>
            <div style={{
              fontSize: '0.75rem', color: '#10b981',
              display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px',
            }}>
              <span style={{
                width: '7px', height: '7px',
                borderRadius: '50%', background: '#10b981', display: 'inline-block',
                boxShadow: '0 0 6px #10b981',
              }} />
              AI Inheritance Guide
            </div>
          </div>
        </div>

        {/* Right: language selector + new chat button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              background:   'rgba(26,53,96,0.7)',
              border:       '1px solid rgba(212,160,23,0.25)',
              borderRadius: '9px',
              color:        '#d0dcf0',
              padding:      '0.45rem 0.75rem',
              fontSize:     '0.88rem',
              cursor:       'pointer',
            }}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button
            onClick={handleNewChat}
            title="Start a new conversation"
            style={{
              padding:      '0.45rem 0.85rem',
              background:   'rgba(212,160,23,0.1)',
              border:       '1px solid rgba(212,160,23,0.25)',
              borderRadius: '9px',
              color:        '#d4a017',
              fontSize:     '0.85rem',
              cursor:       'pointer',
              fontWeight:   600,
              transition:   'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,160,23,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,160,23,0.1)'}
          >🔄 New Chat</button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          MESSAGES AREA
      ══════════════════════════════════════════════════════════════════════ */}
      <main style={{
        flex:      1,
        overflowY: 'auto',
        padding:   '1.5rem 1.25rem 0.5rem',
        display:   'flex',
        flexDirection: 'column',
      }}>

        {/* Suggestion chips — shown only before any user message */}
        {messages.length === 1 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontSize: '0.82rem', color: '#5a7a9a',
              textAlign: 'center', marginBottom: '0.75rem',
            }}>
              — Quick start — tap a question below —
            </p>
            <div style={{
              display:   'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap:       '0.6rem',
            }}>
              {SUGGESTION_PROMPTS.map(s => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '0.6rem',
                    padding:      '0.85rem 1rem',
                    background:   'rgba(22,42,78,0.6)',
                    border:       '1px solid rgba(212,160,23,0.18)',
                    borderRadius: '14px',
                    color:        '#c8d8f0',
                    fontSize:     '0.92rem',
                    textAlign:    'left',
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                    lineHeight:   1.4,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background    = 'rgba(212,160,23,0.12)';
                    e.currentTarget.style.borderColor   = 'rgba(212,160,23,0.4)';
                    e.currentTarget.style.color         = '#f0f4ff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background    = 'rgba(22,42,78,0.6)';
                    e.currentTarget.style.borderColor   = 'rgba(212,160,23,0.18)';
                    e.currentTarget.style.color         = '#c8d8f0';
                  }}
                >
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{s.icon}</span>
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map(msg => (
          <MessageBubble key={msg.id || msg.timestamp} msg={msg} />
        ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={bottomRef} style={{ height: '8px' }} />
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          INPUT AREA
      ══════════════════════════════════════════════════════════════════════ */}
      <footer style={{
        padding:        '0.85rem 1.25rem 1.1rem',
        background:     'rgba(8,15,30,0.97)',
        borderTop:      '1px solid rgba(212,160,23,0.14)',
        flexShrink:     0,
      }}>

        {/* Error banner */}
        {error && (
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        )}

        {/* Input row */}
        <div style={{
          display:      'flex',
          gap:          '0.6rem',
          alignItems:   'flex-end',
          background:   'rgba(18,35,65,0.8)',
          border:       `1px solid ${canSend ? 'rgba(212,160,23,0.45)' : 'rgba(212,160,23,0.18)'}`,
          borderRadius: '16px',
          padding:      '0.65rem 0.65rem 0.65rem 1.1rem',
          transition:   'border-color 0.2s',
        }}>

          {/* Text area */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here… (Press Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={loading}
            style={{
              flex:        1,
              background:  'transparent',
              border:      'none',
              outline:     'none',
              color:       '#e8f0ff',
              fontSize:    '1rem',       // larger for readability
              lineHeight:  1.6,
              resize:      'none',
              maxHeight:   '140px',
              overflowY:   'auto',
              fontFamily:  "'Inter', 'Noto Sans Devanagari', sans-serif",
              opacity:     loading ? 0.6 : 1,
            }}
          />

          {/* Voice button (placeholder) */}
          <button
            title="Voice input — coming soon"
            disabled
            style={{
              width:        '44px',
              height:       '44px',
              borderRadius: '12px',
              background:   'rgba(212,160,23,0.08)',
              border:       '1px solid rgba(212,160,23,0.15)',
              color:        '#6a7a90',
              fontSize:     '1.15rem',
              cursor:       'not-allowed',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              flexShrink:   0,
            }}
          >🎙️</button>

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!canSend}
            title="Send message"
            style={{
              width:        '44px',
              height:       '44px',
              borderRadius: '12px',
              background:   canSend
                ? 'linear-gradient(135deg, #d4a017, #b8860b)'
                : 'rgba(212,160,23,0.1)',
              border:       'none',
              cursor:       canSend ? 'pointer' : 'not-allowed',
              color:        canSend ? '#0f1f3d' : '#3a5070',
              fontSize:     '1.2rem',
              fontWeight:   700,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              flexShrink:   0,
              transition:   'all 0.15s',
              transform:    canSend ? 'scale(1)' : 'scale(0.95)',
              boxShadow:    canSend ? '0 4px 14px rgba(212,160,23,0.35)' : 'none',
            }}
          >➤</button>
        </div>

        {/* Footer row: char count + disclaimer */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginTop:      '0.45rem',
          padding:        '0 0.2rem',
        }}>
          <span style={{ fontSize: '0.7rem', color: '#3a5070' }}>
            {charCount > 0 ? `${charCount} / 2000` : ''}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#3a5070' }}>
            Varasat Mitra may make mistakes. Consult a qualified lawyer for legal decisions.
          </span>
        </div>
      </footer>
    </div>
  );
}
