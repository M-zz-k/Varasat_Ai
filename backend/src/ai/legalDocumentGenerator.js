'use strict';

/**
 * legalDocumentGenerator.js
 *
 * Generates structured legal document text via Groq (llama-3.3-70b-versatile).
 * The text is then passed to pdfGenerator.js to produce the final PDF.
 *
 * Legacy reference (kept as comment):
 * // const Anthropic = require('@anthropic-ai/sdk');
 * // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 */

const { getGroq, isGroqConfigured } = require('./aiClients');

/**
 * generateLegalDocument
 *
 * @param {string} documentType - 'Affidavit', 'Indemnity Bond', 'Claim Letter'
 * @param {Object} claimData    - { claimantName, deceasedName, relation, institution, assetType, amount }
 * @returns {Promise<{ title: string, content: string, sections: string[] }>}
 */
async function generateLegalDocument(documentType, claimData) {
  // ─── Deterministic fallback (works without any API key) ──────────────────
  const fallback = {
    title:   `${documentType} for Inheritance Claim`,
    content: `I, ${claimData.claimantName || '[Name]'}, the ${claimData.relation || '[Relation]'} of late ${claimData.deceasedName || '[Name]'}, hereby state that the information provided regarding the ${claimData.assetType || '[Asset]'} at ${claimData.institution || '[Institution]'} is true to the best of my knowledge and belief.`,
    sections: [
      `1. That late ${claimData.deceasedName || '[Name]'} held an asset (${claimData.assetType || 'financial asset'}) at ${claimData.institution || '[Institution]'} amounting to approximately ₹${claimData.amount || '[Amount]'}.`,
      `2. That the deponent is the rightful legal heir / nominee entitled to claim the above-mentioned asset.`,
      `3. That no other person has any right, title, or interest in the said asset to the best of the deponent's knowledge.`,
      `4. That the deponent undertakes to indemnify ${claimData.institution || 'the institution'} against any future claim arising from this disbursement.`,
    ],
  };

  if (!isGroqConfigured()) {
    console.warn('[LegalDocumentGenerator] Groq not configured — using fallback template.');
    return fallback;
  }

  const prompt = `You are Varasat Legal Document Assistant.
Generate a formal inheritance claim document for Indian jurisdiction.

Document Type: ${documentType}

Claim Details:
- Claimant Name:  ${claimData.claimantName || '[Name]'}
- Deceased Name:  ${claimData.deceasedName || '[Name]'}
- Relationship:   ${claimData.relation     || '[Relation]'}
- Institution:    ${claimData.institution  || '[Institution]'}
- Asset Type:     ${claimData.assetType    || '[Asset]'}
- Amount:         ${claimData.amount       || '[Amount]'}
- Financial Value (Today): ${claimData.realValueToday || 'N/A'}
- Financial Insight: ${claimData.financialInsight ? '\n' + claimData.financialInsight : 'None provided.'}

Instructions:
1. Create formal, clear wording suitable for ${documentType}.
2. Structure with a title, main preamble paragraph, and 4-6 numbered clauses.
3. If Financial Insight is provided, add an explicit final section titled "Financial & Impact Calculation" that details the Wolfram financial insights to strengthen the claim.
4. Do NOT provide false legal guarantees.
5. Return ONLY valid JSON — no markdown, no code fences:
{
  "title": "Document Title Here",
  "content": "Main introductory preamble text...",
  "sections": [
    "1. First clause...",
    "2. Second clause..."
  ]
}`;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  800,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a legal document generator. Return pure JSON only. No markdown blocks.' },
        { role: 'user',   content: prompt },
      ],
    });

    const raw = completion.choices[0].message.content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    return JSON.parse(raw);
  } catch (err) {
    console.warn('[LegalDocumentGenerator] Groq failed:', err.message);
    return fallback;
  }
}

module.exports = { generateLegalDocument };
