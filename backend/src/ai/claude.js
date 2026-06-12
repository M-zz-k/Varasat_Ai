require('dotenv').config();
const { runAgent } = require('../agent/agent');

// ─── In-memory session store ──────────────────────────────────────────────────
// Key: sessionId → Array of {role, content}
const sessions = {};

/**
 * generateAIResponse — the primary public function used by the controller.
 * Now routes through the Agent Tool-Use Orchestrator!
 *
 * @param {string} message   - The user's latest message.
 * @param {string} language  - User's preferred language.
 * @param {string} sessionId - Unique session identifier.
 * @returns {Promise<string>} - The Agent's final reply text.
 */
async function generateAIResponse(message, language = 'English', sessionId = 'default') {
  const messageToSend =
    language && language !== 'English'
      ? `[User's preferred language: ${language}. Please reply in ${language}.]\n\n${message}`
      : message;

  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }
  let history = sessions[sessionId];

  // Append user message
  history.push({ role: 'user', content: messageToSend });

  // Run the Agent Orchestrator (it handles tool calls internally)
  const agentResult = await runAgent(history);

  // The agent may have added tool_use and tool_result blocks to the history.
  // We need to append its final response to the history array so the next turn works.
  history = agentResult.updatedMessages;
  history.push({ role: 'assistant', content: agentResult.assistantMessage });

  // Keep at most the last 30 messages to stay within limits (tools generate more turns)
  if (history.length > 30) {
    history = history.slice(-30);
  }
  sessions[sessionId] = history;

  return agentResult.reply;
}

/**
 * clearSession
 */
function clearSession(sessionId) {
  delete sessions[sessionId];
}

// Legacy alias
async function chatWithClaude(userMessage, history = [], language = 'English') {
  const tempId = `legacy-${Date.now()}`;
  sessions[tempId] = [...history];
  const reply = await generateAIResponse(userMessage, language, tempId);
  delete sessions[tempId];
  return reply;
}

module.exports = { generateAIResponse, chatWithClaude, clearSession };

