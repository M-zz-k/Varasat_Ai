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

const INTERACTIVE_EXPLAINER_SYSTEM = `You are Varasat Mitra, a friendly, patient, and trustworthy local assistant.
Your job is to explain a family asset map to someone with low digital and financial literacy.

STRICT RULES:
1. Write in simple, conversational, everyday language. Do NOT use legal, technical, or complex financial jargon.
2. Short sentences. Voice-friendly.
3. NEVER claim ownership is legally confirmed. Use phrases like "According to available records," "This suggests," "You may need to verify."
4. Structure your response EXACTLY with these 4 sections (use these exact headings):
   A. What is shown in the map?
   B. Important connections:
   C. Important things to check:
   D. Simple action guidance:
5. Output must be in the requested language, translated naturally.`;

/**
 * explainAssetMapInteractive
 * Specifically tailored for the "Explain My Asset Map" button with A,B,C,D structure.
 * @param {Object} graphData - The graph { nodes, edges }
 * @param {string} language  - The requested language
 */
async function explainAssetMapInteractive(graphData, language = 'English') {
  const assets   = graphData.nodes.filter(n => n.type === 'asset');
  const persons  = graphData.nodes.filter(n => n.type === 'person');
  
  const assetList = assets.map(a => 
    `- Asset: ${a.data?.asset_type || a.data?.assetType || a.label} at ${a.data?.institution || 'unknown place'}. Estimated amount: ₹${a.data?.amount || 0}`
  ).join('\\n');

  const personList = persons.map(p => 
    `- Person: ${p.data?.name || p.label} (${p.data?.role || 'Family Member'})`
  ).join('\\n');

  const fallback = `A. What is shown in the map?
This map shows your family members and the assets connected to them based on the documents you provided.

B. Important connections:
We found ${assets.length} possible asset(s) linked to your family. 

C. Important things to check:
Please verify these records with the actual banks or institutions. The system cannot guarantee legal ownership.

D. Simple action guidance:
Your next step is to gather the original documents for these assets and proceed to generate the claim forms.`;

  if (!isGroqConfigured()) return fallback;

  const prompt = `Please explain this family asset map to the user in ${language}. Follow the 4-part structure (A, B, C, D) exactly.

Here is the data found from their documents:
Persons identified:
${personList}

Assets identified:
${assetList}

Remember: Be friendly, simple, and do not use technical jargon.`;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  800,
      temperature: 0.5,
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
