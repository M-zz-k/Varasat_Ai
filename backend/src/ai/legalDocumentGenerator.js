'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * generateLegalDocument
 *
 * Uses Claude to generate structured legal text for inheritance claims.
 * 
 * @param {string} documentType - e.g., 'Affidavit', 'Indemnity Bond', 'Claim Letter'
 * @param {Object} claimData - { claimantName, deceasedName, relation, institution, assetType, amount }
 * @returns {Promise<Object>} - { title: string, content: string, sections: string[] }
 */
async function generateLegalDocument(documentType, claimData) {
  const prompt = `You are Varasat Legal Document Assistant.
Generate a simple inheritance claim document for Indian jurisdiction.

Document Type: ${documentType}

Claim Details:
- Claimant Name: ${claimData.claimantName || '[Name]'}
- Deceased Name: ${claimData.deceasedName || '[Name]'}
- Relationship: ${claimData.relation || '[Relation]'}
- Institution: ${claimData.institution || '[Institution]'}
- Asset Type: ${claimData.assetType || '[Asset]'}
- Amount: ${claimData.amount || '[Amount]'}

Instructions:
1. Create clear formal wording suitable for the specified document type.
2. Structure the document logically with a title, a main preamble/content paragraph, and an array of specific clauses or points (sections).
3. Do NOT provide false legal guarantees.
4. Return ONLY valid JSON in this exact format:
{
  "title": "Document Title",
  "content": "Main introductory text / preamble...",
  "sections": [
    "1. First clause...",
    "2. Second clause..."
  ]
}`;

  try {
    const response = await client.messages.create({
      model:      'claude-3-5-sonnet-latest',
      max_tokens: 800,
      system:     'You are a legal document generator. Return pure JSON only. Do not add markdown blocks.',
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].text;
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('[LegalDocumentGenerator] AI generation failed:', error.message);
    
    // Fallback template
    return {
      title: `${documentType} for Inheritance Claim`,
      content: `I, ${claimData.claimantName || '[Name]'}, the ${claimData.relation || '[Relation]'} of late ${claimData.deceasedName || '[Name]'}, hereby state that the information provided regarding the ${claimData.assetType || '[Asset]'} at ${claimData.institution || '[Institution]'} is true to the best of my knowledge.`,
      sections: [
        `That late ${claimData.deceasedName || '[Name]'} held an asset amounting to approximately ₹${claimData.amount || '[Amount]'}.`,
        `That I am making this claim for the release of the aforementioned asset.`
      ]
    };
  }
}

module.exports = { generateLegalDocument };
