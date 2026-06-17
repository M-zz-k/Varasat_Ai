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
- Keep it to 3-4 short paragraphs.
- AI SAFETY RULE: NEVER use absolute statements like "You own this property" or "This is yours". Instead, use phrases like "Available records suggest...", "This information indicates...", or "Further verification may be required."`;

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

const INTERACTIVE_EXPLAINER_SYSTEM = `You are Varasat Mitra, a friendly, patient, and trustworthy local assistant.
Your job is to explain discovered family assets to someone with low digital and financial literacy.

STRICT RULES:
1. Write in simple, conversational, everyday language. Do NOT use legal, technical, or complex financial jargon.
2. Short sentences. Voice-friendly.
3. NEVER claim ownership is legally confirmed. Do NOT say "You own this". Use phrases like "According to available records," "This suggests," "You may need to verify."
4. Do NOT use headers like A, B, C, D. Just write 3 to 4 simple, natural sentences.
5. Example format: "We found information about 3 assets linked to Ramesh Kumar. These include an SBI account, LIC policy, and HDFC mutual fund. You can start the official claim process for these."
6. Output must be entirely in the requested language, translated naturally.`;

/**
 * explainAssetMapInteractive
 * @param {Object} graphData - The graph { nodes, edges }
 * @param {string} language  - The requested language
 */
async function explainAssetMapInteractive(graphData, language = 'English') {
  const assets   = graphData.nodes.filter(n => n.type === 'asset');
  const persons  = graphData.nodes.filter(n => n.type === 'person');
  
  const assetList = assets.map(a => 
    `- ${a.data?.asset_type || a.data?.assetType || a.label} at ${a.data?.institution || 'unknown place'} (₹${a.data?.amount || 0})`
  ).join('\\n');

  const personList = persons.map(p => p.data?.name || p.label).join(', ');

  const isHindi = language === 'Hindi' || language === 'hi' || language === 'hi-IN';
  
  const fallback = isHindi 
    ? `आपके परिवार के सदस्य ${personList || 'मृतक'} के नाम से ${assets.length} संपत्तियों की जानकारी मिली है। इनमें ${assets.map(a => a.data?.institution || 'संस्थान').join(', ')} शामिल हैं। इनके लिए आगे सरकारी प्रक्रिया के अनुसार दावा किया जा सकता है। कृपया इसे बैंक से सत्यापित करें।`
    : `We found information about ${assets.length} assets linked to ${personList || 'your family member'}. These include accounts at ${assets.map(a => a.data?.institution || 'institutions').join(', ')}. You can start the official claim process for these, but please verify with the official records.`;

  if (!isGroqConfigured()) return fallback;

  const prompt = `Please explain these family assets to the user in ${language}. Keep it to a few simple sentences.

Persons:
${personList}

Assets found:
${assetList}

Remember: Be friendly, simple, and do not use technical words like 'nodes' or 'graph'.`;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  500,
      temperature: 0.4,
      messages: [
        { role: 'system', content: INTERACTIVE_EXPLAINER_SYSTEM },
        { role: 'user',   content: prompt },
      ],
    });
    return completion.choices[0].message.content || fallback;
  } catch (err) {
    console.error('[GraphExplainer] Interactive explain error:', err.message);
    return fallback;
  }
}

module.exports = { explainGraph, explainAssetMapInteractive };
