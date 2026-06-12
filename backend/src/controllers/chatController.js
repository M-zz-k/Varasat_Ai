const { generateAIResponse, clearSession } = require('../ai/claude');

// ── Smart offline responses keyed by topic ────────────────────────────────────
// Used when the AI API is unavailable or not configured.

const OFFLINE_RESPONSES = [
  {
    keywords: ['bank', 'account', 'savings', 'fd', 'fixed deposit', 'sbi', 'hdfc', 'icici'],
    reply: `To claim a **bank account** of a deceased person, you need:\n\n1. Death Certificate of the account holder\n2. Your Aadhaar Card and PAN Card\n3. Account passbook or statement\n4. Succession Certificate (if no nominee is registered)\n5. Bank's claim form (available at branch)\n\nIf a **nominee is registered**, the process is faster — the bank will transfer funds after identity verification. If no nominee, you may need a **Legal Heir Certificate** from the SDM/Tehsildar office.\n\nVisit your nearest branch with these documents. The claim is usually processed in **30–45 business days**.`
  },
  {
    keywords: ['lic', 'insurance', 'policy', 'maturity', 'life insurance'],
    reply: `To claim an **LIC insurance policy** after a policyholder's death:\n\n1. Death Certificate (original + 2 photocopies)\n2. Original policy bond document\n3. Claimant's Identity Proof (Aadhaar/PAN)\n4. Filled LIC Claim Form 3783 (from any LIC branch)\n5. Bank account details for fund transfer\n6. Nominee's ID proof if nominee is registered\n\nSubmit to the **servicing LIC branch**. If a nominee is registered, funds are released in **15–30 days**. If no nominee, a Succession Certificate is required.\n\nYou can also track your claim at: licindia.in`
  },
  {
    keywords: ['pf', 'epf', 'provident fund', 'gratuity', 'uan', 'epfo'],
    reply: `To claim **EPF (Employee Provident Fund)** of a deceased member:\n\n1. Death Certificate\n2. PF account number or UAN of the deceased\n3. Legal Heir Certificate or Succession Certificate\n4. Bank account of the nominee/legal heir\n5. Form 10-D (Pension Claim) — from EPFO office\n6. Form 20 (PF Withdrawal by nominee)\n\nFile the claim at the **EPFO regional office** or online at **epfindia.gov.in**. Nominees receive funds in **30–60 days**.\n\nIf there is no nominee registered, legal heirs must provide a Succession Certificate.`
  },
  {
    keywords: ['mutual fund', 'sip', 'units', 'folio', 'nav', 'shares', 'equity'],
    reply: `To claim **Mutual Fund units** or **shares** of a deceased investor:\n\n1. Death Certificate\n2. Transmission Request Form (from the AMC/depository)\n3. KYC documents of the claimant\n4. Original statement/folio details\n5. Succession Certificate (if no nominee)\n\nFor **registered nominees**, contact the AMC (e.g., SBI MF, HDFC AMC) directly with the above. Units are transmitted within **30 days**.\n\nFor **demat shares**, contact CDSL or NSDL and the depository participant (broker) for transmission.`
  },
  {
    keywords: ['legal heir', 'succession', 'certificate', 'court', 'probate', 'will'],
    reply: `A **Legal Heir Certificate** confirms your right to inherit assets when there is no nominee.\n\n**How to get it:**\n1. Visit your local Tehsildar/SDM (Sub-Divisional Magistrate) office\n2. Fill Form (varies by state)\n3. Attach: Death Certificate, your Aadhaar, Ration Card, and an Affidavit\n4. Pay the prescribed fee (₹50–₹200)\n5. Issued in **15–30 working days**\n\nFor **Succession Certificate** (required for financial assets): Apply at the Civil Court. Requires a petition under Section 372 of the Indian Succession Act. Takes **2–6 months**.\n\nA **registered Will** simplifies inheritance — Probate from High Court is needed for property.`
  },
  {
    keywords: ['ppf', 'post office', 'nsc', 'kisan', 'post'],
    reply: `To claim **PPF or Post Office Savings** of a deceased account holder:\n\n1. Death Certificate\n2. PPF passbook or account number\n3. Claimant's Aadhaar + PAN\n4. Form G (Claim by nominee) from the Post Office\n5. If no nominee: Succession Certificate\n\nVisit the **originating Post Office branch** with these documents. PPF nominee claims are processed in **30–45 days**. Interest continues to accrue until the date of closure.`
  },
];

function getOfflineResponse(message) {
  const lower = message.toLowerCase();
  for (const item of OFFLINE_RESPONSES) {
    if (item.keywords.some(kw => lower.includes(kw))) {
      return item.reply;
    }
  }
  // Generic fallback
  return `Namaste! I am Varasat Mitra. I help Indian families recover dormant inherited assets.\n\nI can guide you on claiming:\n- **Bank accounts** (savings, FD, PPF)\n- **LIC & insurance policies**\n- **EPF/Provident Fund**\n- **Mutual funds & shares**\n- **Getting a Legal Heir Certificate**\n\nPlease tell me what type of asset you need help with, and I will walk you through the exact process step by step.\n\n*(Note: AI service is currently in offline mode. Responses are based on standard Indian financial procedures.)*`;
}

/**
 * POST /api/chat
 *
 * Request body: { message: string, language?: string, sessionId?: string }
 * Response: { success: true, reply: string, sessionId: string }
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

  // ── Check if API key is configured ─────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isApiConfigured = apiKey && apiKey !== 'your_anthropic_api_key_here' && apiKey.startsWith('sk-');

  // ── Call Claude if available, else use offline mode ─────────────────────────
  try {
    if (!isApiConfigured) {
      // Offline mode: use rule-based knowledge base responses
      console.log(`[Chat] Offline mode — no valid API key. Serving KB response.`);
      const reply = getOfflineResponse(message.trim());
      return res.status(200).json({ success: true, reply, sessionId, mode: 'offline' });
    }

    console.log(`[Chat] sessionId=${sessionId} lang=${language} msg="${message.slice(0, 60)}..."`);
    const reply = await generateAIResponse(message.trim(), language, sessionId);

    return res.status(200).json({ success: true, reply, sessionId, mode: 'ai' });

  } catch (error) {
    console.error('[ChatController] Error:', error.message);

    // On any AI failure, fall back to offline mode instead of returning error
    const offlineReply = getOfflineResponse(message.trim());
    return res.status(200).json({
      success: true,
      reply: offlineReply,
      sessionId,
      mode: 'offline',
    });
  }
}

/**
 * POST /api/chat/clear
 */
async function handleClearSession(req, res) {
  const { sessionId = 'default' } = req.body;
  try { clearSession(sessionId); } catch (_) {}
  return res.json({ success: true, message: 'Session cleared.' });
}

module.exports = { handleChat, handleClearSession };
