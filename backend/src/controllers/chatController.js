'use strict';

/**
 * chatController.js
 *
 * Handles /api/chat using Groq (llama-3.3-70b-versatile).
 * Falls back to rule-based offline responses when GROQ_API_KEY is absent.
 *
 * Legacy reference (kept as comment):
 * // const { generateAIResponse, clearSession } = require('../ai/claude');
 */

const { getGroq, isGroqConfigured } = require('../ai/aiClients');

// ── Conversation memory (in-process) ────────────────────────────────────────
const sessions = new Map();
const MAX_SESSION_MESSAGES = 20; // keep last 20 turns

function getSession(sessionId) {
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  return sessions.get(sessionId);
}

function clearSession(sessionId) {
  sessions.delete(sessionId);
}

// ── Varasat Mitra system prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Varasat Mitra, an AI assistant specialising in Indian inheritance law and dormant asset recovery.

Your role:
- Help claimants understand their rights regarding unclaimed bank accounts, LIC policies, EPF/provident funds, PPF, post office savings, mutual funds, and shares.
- Guide them through the exact step-by-step process specific to their situation.
- Respond in the user's language — if they write in Hindi, respond in Hindi; otherwise respond in English.
- Be empathetic, warm, and legally accurate for Indian jurisdiction.
- Refer to relevant Indian laws: Indian Succession Act 1925, Depositories Act, IEPF rules, Insurance Act 1938.
- When mentioning forms, use their official names (e.g. Form ISR-3, LIC Form 3783, EPF Form 20).

SAFETY RULES:
- Never guarantee legal outcomes.
- Never say "I found your account". Say "Based on what you've told me..."
- If you are unsure, advise consulting a local civil lawyer.`;

// ── Smart offline KB (no API needed) ─────────────────────────────────────────
const OFFLINE_KB = [
  {
    keywords: ['bank', 'account', 'savings', 'fd', 'fixed deposit', 'sbi', 'hdfc', 'icici', 'pnb'],
    reply: `To claim a **bank account** of a deceased person:\n\n1. Death Certificate (original + 2 copies)\n2. Your Aadhaar Card and PAN Card\n3. Account passbook or statement\n4. Bank's claim form (available at branch)\n5. Succession Certificate (only if no nominee is registered)\n\nIf a **nominee is registered**, the bank transfers funds after identity verification — usually within **30–45 business days**.\n\nIf there is **no nominee**, you will need a **Legal Heir Certificate** from the SDM/Tehsildar office, or a Succession Certificate from the Civil Court for larger amounts.`,
  },
  {
    keywords: ['lic', 'insurance', 'policy', 'maturity', 'life insurance', 'claim settlement'],
    reply: `To claim an **LIC insurance policy** after the policyholder's death:\n\n1. Death Certificate (original + 2 photocopies)\n2. Original policy bond document\n3. Claimant's Identity Proof (Aadhaar/PAN)\n4. Filled LIC Claim Form 3783 (from any LIC branch)\n5. Bank account details for NEFT transfer\n6. Nominee's ID proof if nominee is registered\n\nSubmit at the **servicing LIC branch**. Nominee claims are settled in **15–30 days**. Without a nominee, a Succession Certificate is needed.\n\nTrack your claim at: **licindia.in**`,
  },
  {
    keywords: ['pf', 'epf', 'provident fund', 'gratuity', 'uan', 'epfo', 'pension'],
    reply: `To claim **EPF/Provident Fund** of a deceased member:\n\n1. Death Certificate\n2. PF account number or UAN of the deceased\n3. Legal Heir Certificate or Succession Certificate\n4. Bank account of nominee/legal heir (with cancelled cheque)\n5. **Form 20** — PF Withdrawal by nominee\n6. **Form 10-D** — Monthly pension claim\n\nFile at the **EPFO regional office** or online at **epfindia.gov.in**.\nNominee claims settle in **30–60 days**.`,
  },
  {
    keywords: ['mutual fund', 'sip', 'units', 'folio', 'nav', 'shares', 'equity', 'demat', 'nsdl', 'cdsl'],
    reply: `To claim **Mutual Fund units or shares** of a deceased investor:\n\n1. Death Certificate\n2. Transmission Request Form (from the AMC or depository)\n3. KYC documents of the claimant (Aadhaar, PAN, photo)\n4. Original statement or folio number\n5. Succession Certificate (if no nominee is registered)\n\nFor **registered nominees**, contact the AMC directly. Units are transmitted within **30 days**.\n\nFor **demat shares**, contact your broker or CDSL/NSDL. Use **ISR-3 form** for transmission.`,
  },
  {
    keywords: ['legal heir', 'succession', 'certificate', 'court', 'probate', 'will', 'tehsildar', 'sdm'],
    reply: `A **Legal Heir Certificate** confirms your right to inherit when there is no nominee.\n\n**How to get it:**\n1. Visit your local Tehsildar / SDM office\n2. Fill the application form (varies by state)\n3. Attach: Death Certificate, your Aadhaar, Ration Card, Affidavit on stamp paper\n4. Pay the fee (₹50–₹200)\n5. Issued in **15–30 working days**\n\nFor a **Succession Certificate** (for financial assets): Apply at the Civil Court under Section 372 of the Indian Succession Act. Takes **2–6 months**.`,
  },
  {
    keywords: ['ppf', 'post office', 'nsc', 'kisan', 'post', 'rd', 'recurring'],
    reply: `To claim **PPF or Post Office Savings** of a deceased account holder:\n\n1. Death Certificate\n2. PPF passbook or account number\n3. Claimant's Aadhaar + PAN\n4. **Form G** — Claim by nominee (from the Post Office)\n5. If no nominee: Succession Certificate\n\nVisit the **originating Post Office branch**. Nominee claims are processed in **30–45 days**. Interest continues to accrue until the account closure date.`,
  },
  {
    keywords: ['iepf', 'unclaimed', 'dividend', 'shares transfer', 'investor education'],
    reply: `If shares or dividends were transferred to **IEPF (Investor Education and Protection Fund)**:\n\n1. File **Form IEPF-5** on the MCA portal: **iepf.gov.in**\n2. Send the physical form + documents to the company's Nodal Officer\n3. Attach: Death Certificate, legal heir documents, Aadhaar, PAN\n4. The process takes **60–90 days**\n\nThe Government of India maintains IEPF to protect investor rights. Claims can be filed by nominees or legal heirs.`,
  },
];

function getOfflineReply(message) {
  const lower = message.toLowerCase();
  for (const item of OFFLINE_KB) {
    if (item.keywords.some(kw => lower.includes(kw))) return item.reply;
  }
  return `Namaste! I am **Varasat Mitra** 🙏\n\nI help Indian families recover dormant inherited assets. I can guide you on:\n\n- 🏦 Bank accounts (savings, FD, PPF)\n- 🛡️ LIC & insurance policies\n- 💼 EPF/Provident Fund\n- 📈 Mutual funds & shares\n- 📮 Post Office savings\n- 📄 Legal Heir Certificate / Succession Certificate\n- 💰 IEPF unclaimed dividends\n\nPlease tell me what type of asset you need help with, and I will walk you through the exact process.\n\n*(Note: Running in offline mode — responses are based on standard Indian financial procedures.)*`;
}

// ── Controller ────────────────────────────────────────────────────────────────

/**
 * POST /api/chat
 * Body: { message: string, language?: string, sessionId?: string }
 */
async function handleChat(req, res) {
  const { message, language = 'English', sessionId = 'default' } = req.body;

  // Validation
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }
  if (message.trim().length > 2000) {
    return res.status(400).json({ success: false, error: 'Message is too long. Keep it under 2000 characters.' });
  }

  // Offline mode
  if (!isGroqConfigured()) {
    console.log('[Chat] Offline mode — GROQ_API_KEY not configured.');
    return res.json({ success: true, reply: getOfflineReply(message.trim()), sessionId, mode: 'offline' });
  }

  try {
    const history = getSession(sessionId);

    // Append new user message
    history.push({ role: 'user', content: message.trim() });

    // Trim old messages
    if (history.length > MAX_SESSION_MESSAGES) {
      history.splice(0, history.length - MAX_SESSION_MESSAGES);
    }

    console.log(`[Chat] sessionId=${sessionId} lang=${language} msgs=${history.length}`);

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  1024,
      temperature: 0.7,
      stream:      false,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
      ],
    });

    const reply = completion.choices[0].message.content;

    // Save assistant reply in session
    history.push({ role: 'assistant', content: reply });

    return res.json({ success: true, reply, sessionId, mode: 'ai' });

  } catch (err) {
    console.error('[ChatController] Groq error:', err.message);

    // 429 rate limit
    if (err?.status === 429 || err?.message?.includes('rate_limit')) {
      return res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment.', retryable: true },
      });
    }

    // Fall back to offline KB
    const reply = getOfflineReply(message.trim());
    return res.json({ success: true, reply, sessionId, mode: 'offline' });
  }
}

/**
 * POST /api/chat/clear
 */
async function handleClearSession(req, res) {
  const { sessionId = 'default' } = req.body;
  clearSession(sessionId);
  return res.json({ success: true, message: 'Session cleared.' });
}

module.exports = { handleChat, handleClearSession };
