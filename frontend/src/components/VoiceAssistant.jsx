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
  }, [language]); // Re-init if language changes (though we set lang on start)

  const handleProcessText = async (text) => {
    try {
      // Reuse the existing AI Chat endpoint
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
    
    // Attempt to set correct language for synthesis
    if (language === 'Hindi') utterance.lang = 'hi-IN';
    else if (language === 'Kannada') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-IN';

    // Rate and pitch adjustments for elderly-friendly clear voice
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
      // Start listening
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

  // UI mapping for states
  const getStateUI = () => {
    switch (state) {
      case 'listening':
        return { text: 'Listening...', color: '#ef4444', anim: 'pulse-ring' };
      case 'processing':
        return { text: 'Thinking...', color: '#f59e0b', anim: 'spin-slow' };
      case 'speaking':
        return { text: 'Responding...', color: '#3b82f6', anim: 'bounce-subtle' };
      default:
        return { text: 'Tap to speak', color: '#d4a017', anim: '' };
    }
  };

  const ui = getStateUI();

  return (
    <div style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: '24px', padding: '2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto', backdropFilter: 'blur(10px)' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={state !== 'idle'}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#f0f4ff', border: '1px solid #4a5e80', fontSize: '1rem', cursor: 'pointer' }}
        >
          <option value="English">English</option>
          <option value="Hindi">हिन्दी (Hindi)</option>
          <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
        </select>
      </div>

      <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
        {/* Animated ring background */}
        <div className={ui.anim} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', background: ui.color, opacity: 0.2 }}></div>
        
        <button
          onClick={toggleListen}
          style={{
            position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
            background: `linear-gradient(135deg, ${ui.color}, #1e3a8a)`,
            border: 'none', borderRadius: '50%', cursor: 'pointer',
            fontSize: '3rem', color: '#fff', boxShadow: `0 0 20px ${ui.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          {state === 'speaking' ? '🔊' : '🎤'}
        </button>
      </div>

      <h3 style={{ margin: '0 0 0.5rem 0', color: ui.color, fontSize: '1.4rem' }}>{ui.text}</h3>

      {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem' }}>{error}</div>}

      <div style={{ marginTop: '1.5rem', minHeight: '80px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem', textAlign: 'left' }}>
        {transcript && (
          <div style={{ marginBottom: '0.5rem', color: '#a0b8d0', fontSize: '1rem', fontStyle: 'italic' }}>
            "{transcript}"
          </div>
        )}
        {aiResponse && (
          <div style={{ color: '#f0f4ff', fontSize: '1.1rem', lineHeight: 1.5 }}>
            {aiResponse}
          </div>
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
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
