'use strict';

/**
 * graphExplainer.js
 *
 * Explains the family asset graph in plain language via Groq.
 *
 * Legacy reference (kept as comment):
 * // const Anthropic = require('@anthropic-ai/sdk');
 * // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 */

const { getGroq, isGroqConfigured } = require('./aiClients');

const EXPLAINER_SYSTEM = `You are Varasat Mitra, explaining a deceased family member's discovered assets to the next of kin.

Rules:
- Write in simple, plain English (or Hindi if asked).
- Do NOT use financial jargon.
- Refer to the deceased respectfully.
- Summarise total assets and value clearly.
- Mention which assets seem easiest to claim first (those with nominees registered).
- End with one encouraging sentence.
- Keep it to 3-4 short paragraphs.`;

/**
 * explainGraph
 * @param {Object} graph    - { nodes, edges }
 * @param {string} language - 'English', 'Hindi', etc.
 */
async function explainGraph(graph, language = 'English') {
  const assets   = graph.nodes.filter(n => n.type === 'asset');
  const persons  = graph.nodes.filter(n => n.type === 'person');
  const deceased = persons.find(p => p.data?.status === 'deceased');
  const deceasedName = deceased?.data?.name || 'the deceased';
  const totalValue   = assets.reduce((sum, a) => sum + (a.data?.amount || 0), 0);

  const assetList = assets.map(a =>
    `- ${a.data?.asset_type || a.data?.assetType || a.label || 'Asset'}: ` +
    `${a.data?.institution || 'Unknown institution'}` +
    (a.data?.amount ? ` (₹${Number(a.data.amount).toLocaleString('en-IN')})` : '') +
    ` [Status: ${a.data?.status || 'Unknown'}]`
  ).join('\n');

  // ─── Deterministic fallback ──────────────────────────────────────────────
  const fallback = `I found ${assets.length} possible asset(s) connected to ${deceasedName}, with an estimated total value of ₹${totalValue.toLocaleString('en-IN')}. Please review each asset and begin the claim process with the relevant institution.`;

  if (!isGroqConfigured()) return fallback;

  const prompt = `Family Asset Knowledge Graph Summary:

Deceased person: ${deceasedName}
Total assets discovered: ${assets.length}
Total estimated value: ₹${totalValue.toLocaleString('en-IN')}
Language for explanation: ${language}

Assets found:
${assetList || 'No assets found yet.'}

Please explain this to the family in a warm, simple way following the system rules.`;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  512,
      temperature: 0.6,
      messages: [
        { role: 'system', content: EXPLAINER_SYSTEM },
        { role: 'user',   content: prompt },
      ],
    });
    return completion.choices[0].message.content || fallback;
  } catch (err) {
    console.error('[GraphExplainer] Groq error:', err.message);
    return fallback;
  }
}

module.exports = { explainGraph };
