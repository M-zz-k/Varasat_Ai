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

  if (!isGroqConfigured()) {
    console.log('[Chat] Offline mode.');
    return res.json({ success: true, reply: getOfflineReply(message.trim()), sessionId, mode: 'offline' });
  }

  try {
    const history = getSession(sessionId);
    history.push({ role: 'user', content: message.trim() + (language !== 'English' ? ` (Please reply in ${language})` : '') });

    if (history.length > MAX_SESSION_MESSAGES) {
      history.splice(0, history.length - MAX_SESSION_MESSAGES);
    }

    console.log(`[Chat] Routing message to Agent... sessionId=${sessionId}`);

    // Call Agent instead of direct LLM
    const agentResponse = await runAgent(history);

    // Save assistant reply
    history.push({ role: 'assistant', content: agentResponse.finalResponse });

    // Send complete diagnostic packet
    return res.json({ 
      success: true, 
      reply: agentResponse.finalResponse,
      intent: agentResponse.intent,
      toolUsed: agentResponse.toolUsed,
      retrievedContext: agentResponse.retrievedContext,
      sessionId, 
      mode: 'agentic_rag' 
    });

  } catch (err) {
    console.error('[ChatController] Error:', err.message);
    const reply = getOfflineReply(message.trim());
    return res.json({ success: true, reply, sessionId, mode: 'offline' });
  }
}

async function handleClearSession(req, res) {
  const { sessionId = 'default' } = req.body;
  clearSession(sessionId);
  return res.json({ success: true, message: 'Session cleared.' });
}

module.exports = { handleChat, handleClearSession };
