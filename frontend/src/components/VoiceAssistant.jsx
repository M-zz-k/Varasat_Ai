import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const LANGUAGES = [
  { value: 'English', label: 'English',           lang: 'en-IN', fallbackLang: 'en-US' },
  { value: 'Hindi',   label: 'हिन्दी (Hindi)',     lang: 'hi-IN', fallbackLang: 'hi'    },
  { value: 'Kannada', label: 'ಕನ್ನಡ (Kannada)',   lang: 'kn-IN', fallbackLang: 'kn'    },
];

/**
 * Returns a Promise that resolves to the full voices list.
 * On Chrome, voices load async — wait up to 2s for voiceschanged.
 */
function loadVoices() {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) return resolve([]);
    const current = synth.getVoices();
    if (current.length > 0) return resolve(current);
    const onChanged = () => {
      synth.removeEventListener('voiceschanged', onChanged);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', onChanged);
    // Timeout fallback — resolve empty after 2s
    setTimeout(() => { synth.removeEventListener('voiceschanged', onChanged); resolve(synth.getVoices()); }, 2000);
  });
}

/**
 * Pick the best voice for a given lang entry.
 * Priority: exact lang match > prefix match > any voice
 */
function pickBestVoice(voices, langEntry) {
  if (!voices.length || !langEntry) return null;
  // 1. Exact BCP-47 match (e.g. kn-IN)
  let v = voices.find(v => v.lang === langEntry.lang);
  // 2. Fallback lang prefix (e.g. kn)
  if (!v) v = voices.find(v => v.lang === langEntry.fallbackLang);
  // 3. Broader prefix match (e.g. anything starting with "kn")
  if (!v) v = voices.find(v => v.lang.startsWith(langEntry.lang.split('-')[0]));
  return v || null;
}

export default function VoiceAssistant() {
  const [language, setLanguage]     = useState('English');
  const [state, setState]           = useState('idle'); // idle|listening|processing|speaking
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError]           = useState('');
  const [ttsWarning, setTtsWarning] = useState('');
  const [textInput, setTextInput]   = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [isSupported, setIsSupported]     = useState(true);
  const [speechRate, setSpeechRate]       = useState(0.88);
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  const recognitionRef   = useRef(null);
  const stateRef         = useRef('idle');
  const sessionId        = useRef('voice-' + Math.random().toString(36).slice(2));
  const utteranceRef     = useRef(null);
  const stoppedManually  = useRef(false); // prevents onerror fallback when user stops speech

  const updateState = useCallback((s) => {
    stateRef.current = s;
    setState(s);
  }, []);

  // Load voices on mount and whenever voiceschanged fires
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  // Warn if current language has no TTS voice available
  useEffect(() => {
    if (!window.speechSynthesis) return;
    if (language === 'English') { setTtsWarning(''); return; }
    // No warning needed — backend TTS handles missing voices automatically
    setTtsWarning('');
  }, [language, availableVoices]);

  // ── Text-to-speech ─────────────────────────────────────────────────────────
  const audioRef = useRef(null);

  // ── Backend TTS (Google Translate proxy) ──────────────────────────────────
  const speakWithBackend = useCallback(async (text, langCode) => {
    try {
      console.log(`[TTS] Using backend proxy for lang=${langCode}`);
      setIsSpeaking(true);
      updateState('speaking');

      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: langCode }),
      });

      if (!res.ok) throw new Error(`TTS API error: ${res.status}`);

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); }

      const audio = new Audio(url);
      audio.playbackRate = Math.max(0.5, Math.min(speechRate / 0.88, 2));
      audioRef.current   = audio;

      audio.onended = () => { setIsSpeaking(false); updateState('idle'); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); updateState('idle'); };

      await audio.play();
    } catch (err) {
      console.error('[TTS] Backend TTS failed:', err);
      setIsSpeaking(false);
      updateState('idle');
      setError('Audio playback failed. The text response is shown above.');
    }
  }, [speechRate, updateState]);

  // ── Text-to-speech (dual path) ────────────────────────────────────────────
  const speakText = useCallback(async (text) => {
    if (!text) return;

    // Cancel any existing speech — mark as manual stop so onerror won't re-trigger backend
    stoppedManually.current = true;
    window.speechSynthesis?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    // Small delay to let the cancel event flush before we start a new utterance
    await new Promise(r => setTimeout(r, 80));
    stoppedManually.current = false;

    const langEntry  = LANGUAGES.find(l => l.value === language);
    const targetLang = langEntry?.lang        || 'en-IN'; // e.g. kn-IN
    const shortLang  = langEntry?.fallbackLang || 'en';    // e.g. kn

    // Check for native browser voice
    const voices = await loadVoices();
    const voice  = pickBestVoice(voices, langEntry);

    if (voice) {
      // ─ Path A: native Web Speech API ─────────────────────────────────────
      console.log(`[TTS] Native voice: ${voice.name} (${voice.lang})`);
      const utterance  = new SpeechSynthesisUtterance(text);
      utterance.lang   = targetLang;
      utterance.voice  = voice;
      utterance.rate   = speechRate;
      utterance.pitch  = 1;
      utterance.onstart = () => { stoppedManually.current = false; setIsSpeaking(true);  updateState('speaking'); };
      utterance.onend   = () => { setIsSpeaking(false); updateState('idle'); };
      utterance.onerror = (e) => {
        // 'interrupted' / 'canceled' means the user stopped it — do NOT fall back to backend
        if (e.error === 'interrupted' || e.error === 'canceled' || stoppedManually.current) {
          console.log('[TTS] Speech stopped by user, skipping backend fallback.');
          setIsSpeaking(false);
          updateState('idle');
          return;
        }
        console.warn('[TTS] Native voice error, falling back to backend:', e.error);
        speakWithBackend(text, shortLang);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      // ─ Path B: backend Google Translate TTS proxy ─────────────────────────
      await speakWithBackend(text, shortLang);
    }
  }, [language, speechRate, speakWithBackend, updateState]);

  const stopSpeaking = useCallback(() => {
    stoppedManually.current = true;   // guard against onerror triggering backend fallback
    window.speechSynthesis?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(false);
    updateState('idle');
  }, [updateState]);


  // ── Process text through backend AI ──────────────────────────────────────────
  const handleProcessText = useCallback(async (text) => {
    if (!text?.trim()) return;
    updateState('processing');
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/chat`, {
        message: text.trim(),
        language,
        sessionId: sessionId.current,
      });

      const reply = res.data?.reply || `I'm here to help with your inheritance queries.`;
      setAiResponse(reply);
      speakText(reply);
    } catch (err) {
      console.error('[VoiceAssistant] API error:', err);
      setAiResponse('Could not reach Varasat AI. Please check your connection and try again.');
      setError('Connection error. Please try again.');
      updateState('idle');
    }
  }, [language, speakText, updateState]);

  // ── Setup Speech Recognition ──────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setShowTextInput(true);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const recognition         = new SpeechRecognition();
    recognition.continuous    = false;
    recognition.interimResults = true;

    const langEntry  = LANGUAGES.find(l => l.value === language);
    recognition.lang = langEntry?.lang || 'en-IN';

    recognition.onstart = () => {
      updateState('listening');
      setError('');
      setTranscript('');
      setAiResponse('');
      setIsSpeaking(false);
    };

    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        setTranscript(final);
        recognition.stop();
        handleProcessText(final);
      } else {
        setTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      console.error('[SpeechRecognition]', event.error);
      if (event.error === 'no-speech') {
        setError('No speech detected. Try again or type below.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow mic permissions in your browser.');
        setShowTextInput(true);
      } else {
        setError(`Error: ${event.error}. Try typing instead.`);
        setShowTextInput(true);
      }
      updateState('idle');
    };

    recognition.onend = () => {
      if (stateRef.current === 'listening') updateState('idle');
    };

    recognitionRef.current = recognition;
    return () => { try { recognition.abort(); } catch {} };
  }, [language]); // eslint-disable-line

  // ── Toggle mic ────────────────────────────────────────────────────────────────
  const toggleListen = () => {
    const cur = stateRef.current;
    if (cur === 'listening') { recognitionRef.current?.stop(); updateState('idle'); return; }
    if (cur === 'speaking')  { stopSpeaking(); return; }
    if (cur === 'processing') return;

    if (!recognitionRef.current) { setShowTextInput(true); return; }

    try {
      stopSpeaking();
      setTranscript('');
      setAiResponse('');
      setError('');
      recognitionRef.current.start();
    } catch (e) {
      setError('Could not start microphone. Please use the text input below.');
      setShowTextInput(true);
    }
  };

  // ── Text input submit ─────────────────────────────────────────────────────────
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || state === 'processing') return;
    setTranscript(textInput.trim());
    setTextInput('');
    await handleProcessText(textInput.trim());
  };

  // ── State UI ──────────────────────────────────────────────────────────────────
  const getStateUI = () => {
    switch (state) {
      case 'listening':
        return { text: 'Listening… speak now', color: '#ef4444',
          btnClass: 'bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.55)]',
          ringClass: 'bg-red-400', anim: 'pulse-ring' };
      case 'processing':
        return { text: 'Varasat AI is thinking…', color: '#d97706',
          btnClass: 'bg-amber-600 shadow-[0_0_24px_rgba(217,119,6,0.55)]',
          ringClass: 'bg-amber-500', anim: 'spin-slow' };
      case 'speaking':
        return { text: 'Speaking — click to stop', color: '#4f46e5',
          btnClass: 'bg-indigo-600 shadow-[0_0_24px_rgba(79,70,229,0.55)]',
          ringClass: 'bg-indigo-500', anim: 'bounce-subtle' };
      default:
        return { text: isSupported ? 'Tap mic to speak' : 'Type your question',
          color: '#0f172a', btnClass: 'bg-slate-900 hover:bg-slate-800',
          ringClass: 'bg-slate-700', anim: '' };
    }
  };
  const ui = getStateUI();

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 md:p-8 text-center max-w-md mx-auto shadow-xs font-sans">

      {/* Language selector */}
      <div className="mb-5">
        <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
          Language / भाषा / ಭಾಷೆ
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={state !== 'idle'}
          className="bg-white border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 transition-all"
        >
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {/* Mic Button */}
      {isSupported && (
        <div className="relative w-28 h-28 mx-auto mb-2 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full opacity-20 ${ui.ringClass} ${ui.anim}`} />
          {state === 'listening' && (
            <div className="absolute inset-[-10px] rounded-full border-2 border-red-400/40 pulse-ring-outer" />
          )}
          {state === 'speaking' && (
            <div className="absolute inset-[-10px] rounded-full border-2 border-indigo-400/40 pulse-ring-outer" />
          )}

          <button
            id="voice-toggle-btn"
            onClick={toggleListen}
            disabled={state === 'processing'}
            title={state === 'idle' ? 'Click to speak' : state === 'listening' ? 'Click to stop' : state === 'speaking' ? 'Click to stop reading' : ''}
            className={`relative z-10 w-20 h-20 rounded-full cursor-pointer flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${ui.btnClass}`}
          >
            {state === 'processing' ? (
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : state === 'speaking' ? (
              /* Animated soundwave bars */
              <div className="flex items-end gap-[3px] h-8">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1.5 bg-white rounded-full soundbar" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : state === 'listening' ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Waveform bars when speaking (below mic) */}
      {state === 'speaking' && (
        <div className="flex items-end justify-center gap-1 h-6 mb-1">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
            <div
              key={i}
              className="w-1 bg-indigo-400 rounded-full waveform-bar"
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>
      )}

      {/* Status text */}
      <h3 className="text-base font-bold mb-3 transition-all duration-300" style={{ color: ui.color }}>
        {ui.text}
      </h3>

      {/* Error */}
      {error && (
        <div className="text-red-500 text-xs mb-3 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* TTS voice warning — shown when no voice is installed for selected language */}
      {ttsWarning && (
        <div className="text-amber-700 text-xs mb-3 font-medium bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-left">
          <div className="flex items-start gap-1.5">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <div>
              <span className="font-bold block mb-0.5">No {language} voice installed on this device.</span>
              {language === 'Kannada' && (
                <span>
                  To hear Kannada audio: <strong>Windows Settings → Time &amp; Language → Language &amp; region → Add a language → search "Kannada" → install "Text-to-speech"</strong>. Then restart Chrome.
                </span>
              )}
              {language === 'Hindi' && (
                <span>
                  To hear Hindi audio: <strong>Windows Settings → Time &amp; Language → Language &amp; region → Add a language → search "Hindi" → install "Text-to-speech"</strong>. Then restart Chrome.
                </span>
              )}
              <span className="block mt-1 text-amber-600 italic">The text response above is still in {language} — only audio playback is unavailable.</span>
            </div>
          </div>
        </div>
      )}

      {/* Conversation area */}
      <div className="mt-2 bg-white border border-slate-200/80 rounded-xl p-4 text-left min-h-[96px] shadow-2xs flex flex-col gap-2">
        {transcript && (
          <div className="text-slate-400 text-xs italic border-l-2 border-slate-200 pl-2">
            You: "{transcript}"
          </div>
        )}

        {aiResponse ? (
          <>
            <div className="text-slate-700 text-sm font-medium leading-relaxed">
              {aiResponse}
            </div>

            {/* ── Listen / Stop button ── */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
              <button
                id="tts-listen-btn"
                onClick={() => isSpeaking ? stopSpeaking() : speakText(aiResponse)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isSpeaking
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="5" width="4" height="14" rx="1"/>
                      <rect x="14" y="5" width="4" height="14" rx="1"/>
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                    🔊 Listen Again
                  </>
                )}
              </button>

              {/* Speed control */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[10px] text-slate-400 font-semibold">Speed</span>
                {[{ label: '0.75×', val: 0.75 }, { label: '1×', val: 0.88 }, { label: '1.25×', val: 1.15 }].map(s => (
                  <button
                    key={s.val}
                    onClick={() => setSpeechRate(s.val)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all ${
                      speechRate === s.val
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : !transcript ? (
          <div className="text-slate-400 text-xs text-center my-auto">
            {isSupported
              ? 'Tap the mic and ask about inheritance claims, documents, or asset recovery.'
              : 'Type your question below to get help with inheritance claims.'}
          </div>
        ) : null}
      </div>

      {/* Toggle text input */}
      <button
        type="button"
        onClick={() => setShowTextInput(v => !v)}
        className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
      >
        {showTextInput ? 'Hide text input' : 'Prefer typing? Use text input'}
      </button>

      {/* Text input */}
      {showTextInput && (
        <form onSubmit={handleTextSubmit} className="mt-3 flex gap-2">
          <input
            id="voice-text-input"
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Ask about inheritance, documents, claims…"
            disabled={state === 'processing'}
            className="flex-1 bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || state === 'processing'}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 transition-all"
          >
            {state === 'processing' ? '…' : 'Ask'}
          </button>
        </form>
      )}

      <style>{`
        /* ── Mic button ring animations ── */
        .pulse-ring {
          animation: va-pulse 1.4s ease-in-out infinite;
        }
        .pulse-ring-outer {
          animation: va-pulse-outer 1.6s ease-in-out infinite;
        }
        .spin-slow {
          animation: va-spin 2.5s linear infinite;
        }
        .bounce-subtle {
          animation: va-bounce 1.8s ease-in-out infinite;
        }
        @keyframes va-pulse {
          0%   { transform: scale(0.92); opacity: 0.4; }
          50%  { transform: scale(1.2);  opacity: 0.1; }
          100% { transform: scale(0.92); opacity: 0.4; }
        }
        @keyframes va-pulse-outer {
          0%   { transform: scale(0.95); opacity: 0.5; }
          50%  { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes va-spin  { 100% { transform: rotate(360deg); } }
        @keyframes va-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-7px); }
        }

        /* ── Soundwave bars inside the mic button ── */
        .soundbar {
          animation: soundbar 0.7s ease-in-out infinite alternate;
          height: 6px;
        }
        @keyframes soundbar {
          0%   { height: 4px;  opacity: 0.6; }
          100% { height: 28px; opacity: 1; }
        }

        /* ── Waveform bars below the button ── */
        .waveform-bar {
          animation: waveform 0.8s ease-in-out infinite alternate;
          height: 4px;
        }
        @keyframes waveform {
          0%   { height: 3px;  opacity: 0.4; }
          100% { height: 22px; opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
