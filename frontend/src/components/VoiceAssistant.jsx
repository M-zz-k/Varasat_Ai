import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function VoiceAssistant() {
  const [language, setLanguage] = useState('English');
  const [state, setState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Your browser doesn't support speech recognition. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setState('listening');
      setError('');
      setTranscript('');
      setAiResponse('');
    };

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setState('processing');
      await handleProcessText(text);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setError(`Microphone error: ${event.error}. Please check permissions.`);
      setState('idle');
    };

    recognition.onend = () => {
      if (state === 'listening') {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;
  }, [language]); 

  const handleProcessText = async (text) => {
    try {
      const res = await axios.post('/api/chat', {
        message: text,
        language: language,
      });

      const reply = res.data.reply;
      setAiResponse(reply);
      speakText(reply);
    } catch (err) {
      console.error(err);
      setError('Varasat AI failed to process your request.');
      setState('idle');
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      setState('idle');
      return;
    }

    setState('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (language === 'Hindi') utterance.lang = 'hi-IN';
    else if (language === 'Kannada') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setState('idle');
    };

    utterance.onerror = () => {
      setState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleListen = () => {
    if (error && !window.SpeechRecognition && !window.webkitSpeechRecognition) return;

    if (state === 'listening') {
      recognitionRef.current?.stop();
      setState('idle');
    } else if (state === 'speaking') {
      window.speechSynthesis.cancel();
      setState('idle');
    } else {
      if (recognitionRef.current) {
        if (language === 'Hindi') recognitionRef.current.lang = 'hi-IN';
        else if (language === 'Kannada') recognitionRef.current.lang = 'kn-IN';
        else recognitionRef.current.lang = 'en-IN';
        
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const getStateUI = () => {
    switch (state) {
      case 'listening':
        return { text: 'Listening...', color: '#ef4444', class: 'bg-red-500', anim: 'pulse-ring' };
      case 'processing':
        return { text: 'Thinking...', color: '#d97706', class: 'bg-amber-600', anim: 'spin-slow' };
      case 'speaking':
        return { text: 'Responding...', color: '#4f46e5', class: 'bg-indigo-600', anim: 'bounce-subtle' };
      default:
        return { text: 'Tap to speak', color: '#0f172a', class: 'bg-slate-900', anim: '' };
    }
  };

  const ui = getStateUI();

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 md:p-8 text-center max-w-md mx-auto shadow-xs font-sans">
      <div className="mb-6">
        <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
          Language / भाषा
        </label>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={state !== 'idle'}
          className="bg-white border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-50 transition-all"
        >
          <option value="English">English</option>
          <option value="Hindi">हिन्दी (Hindi)</option>
          <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
        </select>
      </div>

      <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
        {/* Animated ring background */}
        <div className={`absolute inset-0 rounded-full opacity-15 ${ui.class} ${ui.anim}`}></div>
        
        <button
          onClick={toggleListen}
          className={`relative z-10 w-20 h-20 rounded-full cursor-pointer flex items-center justify-center text-white text-3xl shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 ${ui.class}`}
        >
          {state === 'speaking' ? '🔊' : '🎤'}
        </button>
      </div>

      <h3 className="text-lg font-bold mb-2 transition-all duration-300" style={{ color: ui.color }}>{ui.text}</h3>

      {error && <div className="text-red-500 text-xs mt-2 font-medium">{error}</div>}

      <div className="mt-6 bg-white border border-slate-200/80 rounded-xl p-4 text-left min-h-[96px] shadow-2xs flex flex-col justify-center">
        {transcript && (
          <div className="text-slate-400 text-xs italic mb-2">
            "{transcript}"
          </div>
        )}
        {aiResponse ? (
          <div className="text-slate-700 text-sm font-medium leading-relaxed">
            {aiResponse}
          </div>
        ) : (
          !transcript && (
            <div className="text-slate-400 text-xs text-center">
              Your conversation will appear here
            </div>
          )
        )}
      </div>

      <style>{`
        .pulse-ring {
          animation: pulse 1.5s infinite;
        }
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        .bounce-subtle {
          animation: bounce 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
