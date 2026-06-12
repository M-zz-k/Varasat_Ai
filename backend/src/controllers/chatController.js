const { generateAIResponse, clearSession } = require('../ai/claude');

/**
 * POST /api/chat
 *
 * Request body:
 *   { message: string, language?: string, sessionId?: string }
 *
 * Response:
 *   { success: true, reply: string, sessionId: string }
 *   { success: false, error: string }        ← on failure
 */
async function handleChat(req, res) {
  const { message, language = 'English', sessionId = 'default' } = req.body;

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Message is required and cannot be empty.',
    });
  }

  if (message.trim().length > 2000) {
    return res.status(400).json({
      success: false,
      error: 'Message is too long. Please keep it under 2000 characters.',
    });
  }

  // ── Call Claude ────────────────────────────────────────────────────────────
  try {
    console.log(`[Chat] sessionId=${sessionId} lang=${language} msg="${message.slice(0, 60)}..."`);

    const reply = await generateAIResponse(message.trim(), language, sessionId);

    return res.status(200).json({
      success: true,
      reply,
      sessionId,
    });
  } catch (error) {
    console.error('[ChatController] Claude API error:', error.message);

    // Check if it's an API key issue
    if (error.message.includes('API key') || error.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'AI service is not configured. Please contact support.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Varasat Mitra is temporarily unavailable. Please try again in a moment.',
    });
  }
}

/**
 * POST /api/chat/clear
 * Clears the conversation history for a session.
 *
 * Request body: { sessionId: string }
 */
async function handleClearSession(req, res) {
  const { sessionId = 'default' } = req.body;
  clearSession(sessionId);
  return res.json({ success: true, message: 'Session cleared.' });
}

module.exports = { handleChat, handleClearSession };
