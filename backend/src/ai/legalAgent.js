'use strict';

/**
 * legalAgent.js
 *
 * Generates a conversational claim recommendation via Groq (llama-3.3-70b-versatile).
 *
 * Legacy reference (kept as comment):
 * // const Anthropic = require('@anthropic-ai/sdk');
 * // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 */

const { getGroq, isGroqConfigured, classifyGroqError } = require('./aiClients');

/**
 * generateLegalExplanation
 *
 * @param {Object} claimScores - { eligibilityScore, riskScore, complexity, estimatedDays }
 * @param {Object} assetData   - { assetType, amount, institution, nomineeExists }
 * @returns {Promise<{ recommendation: string, requiredDocuments: string[] }>}
 */
async function generateLegalExplanation(claimScores, assetData) {
  const fallback = {
    recommendation: `Based on mathematical analysis, your claim complexity is ${claimScores.complexity}. It may take around ${claimScores.estimatedDays} days to process. ${assetData.nomineeExists ? 'Having a registered nominee will speed things up.' : 'Since there is no registered nominee, a Succession Certificate will be required.'}`,
    requiredDocuments: [
      'Death Certificate (original + 2 copies)',
      'Identity Proof of Claimant (Aadhaar / PAN)',
      `Original ${assetData.assetType || 'asset'} document (passbook / policy bond / statement)`,
      ...(assetData.nomineeExists ? [] : ['Legal Heir Certificate or Succession Certificate']),
      'Institution Claim Form (available at branch)',
    ],
  };

  if (!isGroqConfigured()) return fallback;

  const prompt = `You are Varasat Mitra, an empathetic inheritance assistant for Indian families.

Asset Details:
- Type:            ${assetData.assetType  || 'Unknown'}
- Institution:     ${assetData.institution || 'Unknown'}
- Nominee Exists:  ${assetData.nomineeExists ? 'Yes' : 'No'}

Mathematical Analysis Results:
- Eligibility Score:      ${claimScores.eligibilityScore}/100
- Risk Score:             ${claimScores.riskScore}/100
- Complexity:             ${claimScores.complexity}
- Estimated Processing:   ${claimScores.estimatedDays} days

Tasks:
1. Explain the claim route simply and warmly (2–3 sentences max).
2. List the required documents for this specific claim type.

Respond ONLY with valid JSON in this exact format — no markdown, no extra text:
{
  "recommendation": "A warm, simple 2-3 sentence explanation.",
  "requiredDocuments": ["Document 1", "Document 2", "Document 3"]
}`;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  400,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You are Varasat Mitra. Explain legal processes simply. Return pure JSON only.' },
        { role: 'user',   content: prompt },
      ],
    });

    const raw = completion.choices[0].message.content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    return JSON.parse(raw);
  } catch (err) {
    console.warn('[LegalAgent] Groq failed:', err.message);
    return fallback;
  }
}

module.exports = { generateLegalExplanation };
