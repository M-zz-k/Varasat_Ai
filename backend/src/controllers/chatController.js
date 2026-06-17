'use strict';

const { isGroqConfigured } = require('../ai/aiClients');
const { runAgent } = require('../agent/agent');

const sessions = new Map();
const MAX_SESSION_MESSAGES = 20;

function getSession(sessionId) {
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  return sessions.get(sessionId);
}

function clearSession(sessionId) {
  sessions.delete(sessionId);
}

// Offline fallback replies per language
const OFFLINE_REPLIES = {
  English: {
    bank:      "To claim a bank account, submit the Death Certificate and Account Passbook to the branch. Varasat AI retrieves relevant guidance and assists users.",
    insurance: "Submit the Original Policy Bond, Death Certificate, and LIC Claim Form 3783. Varasat AI retrieves relevant guidance and assists users.",
    default:   "Namaste! I am Varasat Mitra. I help Indian families recover dormant inherited assets. (Running in offline mode)",
  },
  Hindi: {
    bank:      "बैंक खाते का दावा करने के लिए, शाखा में मृत्यु प्रमाण पत्र और खाता पासबुक जमा करें। वरासत AI प्रासंगिक मार्गदर्शन प्राप्त करता है और उपयोगकर्ताओं की सहायता करता है।",
    insurance: "मूल पॉलिसी बॉन्ड, मृत्यु प्रमाण पत्र और LIC दावा फॉर्म 3783 जमा करें। वरासत AI प्रासंगिक मार्गदर्शन प्राप्त करता है।",
    default:   "नमस्ते! मैं वरासत मित्र हूँ। मैं भारतीय परिवारों को निष्क्रिय विरासत संपत्ति वापस करने में सहायता करता हूँ। (ऑफ़लाइन मोड में चल रहा है)",
  },
  Kannada: {
    bank:      "ಬ್ಯಾಂಕ್ ಖಾತೆಯನ್ನು ಕ್ಲೇಮ್ ಮಾಡಲು, ಶಾಖೆಯಲ್ಲಿ ಮರಣ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಖಾತೆ ಪಾಸ್ಬುಕ್ ಸಲ್ಲಿಸಿರಿ. ವರಾಸತ್ AI ಸಂಬಂಧಿತ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯುತ್ತದೆ ಮತ್ತು ಬಳಕೆದಾರರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    insurance: "ಮೂಲ ಪಾಲಿಸಿ ಬಾಂಡ್, ಮರಣ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು LIC ಕ್ಲೇಮ್ ಫಾರ್ಮ್ 3783 ಸಲ್ಲಿಸಿರಿ. ವರಾಸತ್ AI ಸಂಬಂಧಿತ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯುತ್ತದೆ.",
    default:   "ನಮಸ್ಕಾರ! ನಾನು ವರಾಸತ್ ಮಿತ್ರ. ನಾನು ಭಾರತೀಯ ಕುಟುಂಬಗಳಿಗೆ ನಿಷ್ಕ್ರಿಯ ವಾರಸು (ಉತ್ತರಾಧಿಕಾರ) ಆಸ್ತಿ ವಾಪಸ್ ಪಡೆಯಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. (ಆಫ್ಲೈನ್ ಮೋಡ್ನಲ್ಲಿ ಚಲಿಸುತ್ತಿದೆ)",
  },
};

function getOfflineReply(message, language = 'English') {
  const lower = message.toLowerCase();
  const replies = OFFLINE_REPLIES[language] || OFFLINE_REPLIES.English;
  if (lower.includes('bank')) return replies.bank;
  if (lower.includes('lic') || lower.includes('insurance')) return replies.insurance;
  return replies.default;
}

/**
 * POST /api/chat
 * Body: { message: string, language?: string, sessionId?: string }
 */
async function handleChat(req, res) {
  const { message, language = 'English', sessionId = 'default', documentContext } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }

  const { translateText } = require('../ai/bhashiniService');

  let queryForAgent = message.trim();
  if (language !== 'English') {
    queryForAgent = await translateText(queryForAgent, language, 'English');
  }

  if (!isGroqConfigured()) {
    console.log('[Chat] Offline mode.');
    let reply = getOfflineReply(queryForAgent, language);
    return res.json({ success: true, reply, sessionId, mode: 'offline' });
  }

  try {
    const history = getSession(sessionId);

    // If fresh session and we have document context, inject it
    if (history.length === 0 && documentContext) {
      history.push({
        role: 'system',
        content: `The user has just uploaded and analyzed an inheritance document with the following details. Use this context to answer their questions: ${JSON.stringify(documentContext)}`
      });
    }

    // Store the original user message (in their language) for context
    history.push({ role: 'user', content: queryForAgent });

    if (history.length > MAX_SESSION_MESSAGES) {
      history.splice(0, history.length - MAX_SESSION_MESSAGES);
    }

    console.log(`[Chat] Routing message to Agent... sessionId=${sessionId}, language=${language}`);

    // Pass language so the agent responds natively in the right language
    const agentResponse = await runAgent(history, language);

    // Save assistant reply internally
    history.push({ role: 'assistant', content: agentResponse.finalResponse });

    // The LLM already responded in the correct language — no translation needed
    // Only attempt Bhashini translation if it's configured (optional enhancement)
    let finalResponse = agentResponse.finalResponse;
    if (language !== 'English') {
      try {
        const translated = await translateText(finalResponse, 'English', language);
        // Only use translation if it returned something different (Bhashini was active)
        if (translated && translated !== finalResponse) {
          finalResponse = translated;
        }
      } catch (_) {
        // Bhashini not configured — LLM native response is already in correct language
      }
    }

    return res.json({ 
      success: true, 
      reply: finalResponse,
      intent: agentResponse.intent,
      toolUsed: agentResponse.toolUsed,
      retrievedContext: agentResponse.retrievedContext,
      sessionId, 
      mode: 'agentic_rag' 
    });

  } catch (err) {
    console.error('[ChatController] Error:', err.message);
    let reply = getOfflineReply(queryForAgent, language);
    return res.json({ success: true, reply, sessionId, mode: 'error_fallback' });
  }
}

async function handleClearSession(req, res) {
  const { sessionId = 'default' } = req.body;
  clearSession(sessionId);
  return res.json({ success: true, message: 'Session cleared.' });
}

module.exports = { handleChat, handleClearSession };
