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

// Very basic offline fallback logic
function getOfflineReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('bank')) return "To claim a bank account, submit the Death Certificate and Account Passbook to the branch. Varasat AI retrieves relevant guidance and assists users.";
  if (lower.includes('lic') || lower.includes('insurance')) return "Submit the Original Policy Bond, Death Certificate, and LIC Claim Form 3783. Varasat AI retrieves relevant guidance and assists users.";
  return "Namaste! I am Varasat Mitra. I help Indian families recover dormant inherited assets. (Running in offline mode)";
}

/**
 * POST /api/chat
 * Body: { message: string, language?: string, sessionId?: string }
 */
async function handleChat(req, res) {
  const { message, language = 'English', sessionId = 'default' } = req.body;

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
    let reply = getOfflineReply(queryForAgent);
    if (language !== 'English') {
      reply = await translateText(reply, 'English', language);
    }
    return res.json({ success: true, reply, sessionId, mode: 'offline' });
  }

  try {
    const history = getSession(sessionId);
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
    let reply = getOfflineReply(queryForAgent);
    return res.json({ success: true, reply, sessionId, mode: 'error_fallback' });
  }
}

async function handleClearSession(req, res) {
  const { sessionId = 'default' } = req.body;
  clearSession(sessionId);
  return res.json({ success: true, message: 'Session cleared.' });
}

module.exports = { handleChat, handleClearSession };
