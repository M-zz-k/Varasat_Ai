'use strict';

/**
 * graphExplainer.js
 *
 * AI Explanation Layer for the Family Asset Knowledge Graph.
 * Claude reads the graph structure and writes a warm, plain-language
 * summary for the family — NOT financial calculations (those are Wolfram's job).
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXPLAINER_SYSTEM = `You are Varasat Mitra, explaining a deceased family member's discovered assets to the next of kin.

You will receive a summary of the family's asset knowledge graph and must write a warm, empathetic, clear explanation.

Rules:
- Write in simple, plain English (or Hindi if asked).
- Do NOT use financial jargon.
- Refer to the deceased respectfully.
- Summarise total assets and value clearly.
- Mention which assets seem easiest to claim first.
- End with one encouraging sentence.
- Keep it to 3-4 short paragraphs.`;

/**
 * explainGraph
 *
 * Takes the graph data and generates a Claude explanation.
 * @param {Object} graph  - Graph from graphStore
 * @param {string} language - 'English', 'Hindi', etc.
 * @returns {Promise<string>}
 */
async function explainGraph(graph, language = 'English') {
  const assets  = graph.nodes.filter(n => n.type === 'asset');
  const persons = graph.nodes.filter(n => n.type === 'person');
  const deceased = persons.find(p => p.data?.status === 'deceased');
  const deceasedName = deceased?.data?.name || 'the deceased';

  const totalValue = assets.reduce((sum, a) => sum + (a.data?.amount || 0), 0);

  const assetList = assets.map(a =>
    `- ${a.data?.assetType || a.label}: ${a.data?.institution || 'Unknown institution'}` +
    (a.data?.amount ? ` (₹${a.data.amount.toLocaleString('en-IN')})` : '') +
    ` [Status: ${a.data?.status || 'Unknown'}]`
  ).join('\n');

  const prompt = `Family Asset Knowledge Graph Summary:

Deceased person: ${deceasedName}
Total assets discovered: ${assets.length}
Total estimated value: ₹${totalValue.toLocaleString('en-IN')}
Language for explanation: ${language}

Assets found:
${assetList || 'No assets found yet.'}

Please explain this to the family in a warm, simple way.`;

  try {
    const response = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 512,
      system:     EXPLAINER_SYSTEM,
      messages:   [{ role: 'user', content: prompt }],
    });
    return response.content[0].text;
  } catch (err) {
    console.error('[GraphExplainer] Claude error:', err.message);
    return `I found ${assets.length} possible asset(s) connected to ${deceasedName}, with an estimated total value of ₹${totalValue.toLocaleString('en-IN')}. Please review each asset and begin the claim process with the relevant institution.`;
  }
}

module.exports = { explainGraph };
