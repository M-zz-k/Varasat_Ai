'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * generateLegalExplanation
 * 
 * Takes analytical scores computed by Wolfram and generates a conversational,
 * elderly-friendly explanation of the claim route and required documents.
 * 
 * @param {Object} wolframScores - { eligibilityScore, riskScore, complexity, estimatedDays }
 * @param {Object} assetData - { assetType, amount, institution, nomineeExists }
 * @returns {Promise<Object>} - { recommendation: string, requiredDocuments: string[] }
 */
async function generateLegalExplanation(wolframScores, assetData) {
  const prompt = `You are Varasat Mitra, an empathetic inheritance assistant.
We have used our Wolfram Language calculation engine to analyze an inheritance claim for an asset.

Asset Details:
- Type: ${assetData.assetType || 'Unknown'}
- Institution: ${assetData.institution || 'Unknown'}
- Nominee Exists: ${assetData.nomineeExists ? 'Yes' : 'No'}

Wolfram Analysis Results:
- Eligibility Score: ${wolframScores.eligibilityScore}/100
- Complexity: ${wolframScores.complexity}
- Estimated Processing Time: ${wolframScores.estimatedDays} days

Your task is to:
1. Explain the claim route simply and warmly based on these scores.
2. List the likely required documents.

Respond ONLY with valid JSON in this exact format:
{
  "recommendation": "A warm, simple explanation of the claim route and the Wolfram time/complexity estimates (2-3 sentences max).",
  "requiredDocuments": ["Document 1", "Document 2", "Document 3"]
}

Do not include any other text or markdown outside the JSON.`;

  try {
    const response = await client.messages.create({
      model:      'claude-3-5-sonnet-latest',
      max_tokens: 400,
      system:     'You are Varasat Mitra. Explain legal processes simply. Do not use complex jargon. Return pure JSON.',
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].text;
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('[LegalAgent] Failed to generate AI explanation:', error.message);
    return {
      recommendation: `Based on a mathematical analysis, your claim complexity is ${wolframScores.complexity}. It may take around ${wolframScores.estimatedDays} days to process.`,
      requiredDocuments: ['Death Certificate', 'Identity Proof of Claimant', 'Original Asset Document']
    };
  }
}

module.exports = { generateLegalExplanation };
