'use strict';

/**
 * fraudAgent.js
 *
 * Detects potential inconsistencies in submitted documents using Groq
 * (llama-3.3-70b-versatile). Pure heuristic scoring available as fallback.
 *
 * Legacy reference (kept as comment):
 * // const Anthropic = require('@anthropic-ai/sdk');
 * // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 */

const { getGroq, isGroqConfigured } = require('./aiClients');

// ─── Heuristic rule-based fallback ───────────────────────────────────────────
function heuristicFraudScore(documentData) {
  let riskScore = 0;
  const flags   = [];

  const { amount, nominee, institution, asset_type, date_of_document } = documentData;

  // Large amount without nominee raises risk
  const numericAmount = parseFloat(String(amount || '0').replace(/[₹,\s]/g, ''));
  if (numericAmount > 5_000_000 && !nominee) {
    riskScore += 30;
    flags.push('High-value asset with no registered nominee.');
  }

  // Missing institution
  if (!institution) {
    riskScore += 20;
    flags.push('Institution name is missing or unreadable.');
  }

  // Date plausibility
  if (date_of_document) {
    const year = parseInt(date_of_document.toString().slice(0, 4), 10);
    if (year < 1947 || year > new Date().getFullYear()) {
      riskScore += 25;
      flags.push('Document date appears implausible.');
    }
  }

  const level = riskScore < 20 ? 'LOW' : riskScore < 45 ? 'MEDIUM' : 'HIGH';
  return {
    riskScore,
    riskLevel: level,
    flags,
    recommendation: level === 'LOW'
      ? 'The document appears legitimate. Proceed with claim.'
      : level === 'MEDIUM'
      ? 'Minor inconsistencies detected. We recommend verifying the document at the institution.'
      : 'Significant inconsistencies detected. Please consult a legal professional before proceeding.',
  };
}

/**
 * assessFraudRisk
 * @param {Object} documentData - Extracted document fields
 * @returns {Promise<{ riskScore, riskLevel, flags, recommendation }>}
 */
async function assessFraudRisk(documentData) {
  if (!isGroqConfigured()) {
    console.warn('[FraudAgent] Groq not configured — using heuristic scoring.');
    return heuristicFraudScore(documentData);
  }

  const prompt = `You are a fraud detection specialist reviewing an Indian inheritance document.

Extracted document data:
${JSON.stringify(documentData, null, 2)}

Check for:
1. Missing critical fields (name, institution, amount)
2. Implausible dates or amounts
3. Mismatched information
4. Document type inconsistencies

Return ONLY valid JSON (no markdown, no explanation):
{
  "riskScore": 0-100,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "flags": ["flag1", "flag2"],
  "recommendation": "Short recommendation text."
}`;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  350,
      temperature: 0.1,
      messages: [
        { role: 'system', content: 'You are a fraud detection AI. Return pure JSON only.' },
        { role: 'user',   content: prompt },
      ],
    });

    const raw = completion.choices[0].message.content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    return JSON.parse(raw);
  } catch (err) {
    console.warn('[FraudAgent] Groq error, falling back to heuristic:', err.message);
    return heuristicFraudScore(documentData);
  }
}

module.exports = { assessFraudRisk };
