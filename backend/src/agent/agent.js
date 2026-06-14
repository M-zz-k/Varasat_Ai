'use strict';

/**
 * agent.js
 *
 * Orchestrates tool-augmented conversations using Groq (llama-3.3-70b-versatile).
 * Groq does not yet support native function calling the same way Claude does,
 * so we use a prompt-guided approach: the model decides which tool to invoke
 * by emitting a JSON action block, and we execute it.
 *
 * Legacy reference (kept as comment):
 * // const Anthropic = require('@anthropic-ai/sdk');
 * // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 */

const { getGroq, isGroqConfigured } = require('../ai/aiClients');
const {
  executeKnowledgeSearch,
  executeWolframAnalysis,
  executeDocumentAnalysis,
  executePdfGeneration,
} = require('./tools');

// ─── System prompt ────────────────────────────────────────────────────────────
const AGENT_SYSTEM_PROMPT = `You are Varasat AI Agent, an advanced inheritance assistant for Indian families.

You have access to these tools:
1. knowledgeSearchTool  — Use when the user asks about the process, required documents, or steps for any inheritance claim.
2. wolframAnalysisTool  — Use when the user asks about asset value over time, financial loss, or requires mathematical intelligence.
3. documentAnalysisTool  — Use when the user explicitly asks to analyze a document.
4. pdfGenerationTool     — Use when the user explicitly asks to generate a legal document or PDF.

To use a tool, respond ONLY with this exact JSON (no other text):
{"action":"TOOL_CALL","tool":"<toolName>","args":{"query":"<if needed>","amount":<number or null>,"years":<number or null>,"inflationRate":<number or null>,"documentType":"<if needed>"}}

After receiving the tool result, respond in natural language to the user.

SAFETY RULES:
- NEVER guarantee legal outcomes.
- NEVER say "I found your bank account". Say "Based on documents provided..."
- Be empathetic and warm.
- Keep calculations transparent. Say: "Wolfram performs mathematical and financial analysis to support recovery decisions."
- Cite that process information follows standard Indian financial procedures.`;

// ─── Tool dispatcher ──────────────────────────────────────────────────────────
async function dispatchTool(toolName, args) {
  switch (toolName) {
    case 'knowledgeSearchTool':
      return await executeKnowledgeSearch(args.query || '');
    case 'wolframAnalysisTool':
      return await executeWolframAnalysis(args.amount, args.years, args.inflationRate || 0.06);
    case 'documentAnalysisTool':
      return await executeDocumentAnalysis();
    case 'pdfGenerationTool':
      return await executePdfGeneration(args.documentType || 'claim-letter');
    default:
      return `Unknown tool: ${toolName}`;
  }
}

// ─── Try to parse an action block from LLM output ─────────────────────────────
function tryParseAction(text) {
  try {
    const match = text.match(/\{[\s\S]*?"action"\s*:\s*"TOOL_CALL"[\s\S]*?\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return null;
}

// ─── Main agent runner ────────────────────────────────────────────────────────
/**
 * runAgent
 *
 * @param {Array} messages - Conversation history [{role, content}]
 * @returns {{ reply: string, updatedMessages: Array, assistantMessage: string }}
 */
async function runAgent(messages) {
  console.log(`[Agent] Starting run with ${messages.length} messages.`);

  // ── Offline fallback ────────────────────────────────────────────────────────
  if (!isGroqConfigured()) {
    const lastUser = messages.findLast(m => m.role === 'user');
    const fallback = `I'm here to help with your inheritance claim. ${lastUser?.content ? `You asked: "${lastUser.content}"` : ''} Please configure GROQ_API_KEY in the backend .env to enable full AI responses.`;
    return { reply: fallback, updatedMessages: messages, assistantMessage: fallback };
  }

  const groq = getGroq();

  // Step 1: Ask Groq what to do
  const step1 = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    max_tokens:  512,
    temperature: 0.2,
    messages: [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      ...messages,
    ],
  });

  const step1Text = step1.choices[0].message.content;
  console.log(`[Agent] Step 1 response: ${step1Text.slice(0, 100)}...`);

  // Step 2: Check if it wants to call a tool
  const action = tryParseAction(step1Text);

  if (action?.tool) {
    console.log(`[Agent] Tool requested: ${action.tool}`);
    let toolResult = '';
    try {
      toolResult = await dispatchTool(action.tool, action.args || {});
    } catch (err) {
      toolResult = `Tool execution failed: ${err.message}`;
    }

    // Step 3: Feed result back to Groq for synthesis
    const augmentedMessages = [
      ...messages,
      { role: 'assistant', content: step1Text },
      { role: 'user',      content: `Tool result from ${action.tool}:\n${toolResult}\n\nNow please answer the user's original question using this information.` },
    ];

    const step2 = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  1024,
      temperature: 0.5,
      messages: [
        { role: 'system', content: AGENT_SYSTEM_PROMPT },
        ...augmentedMessages,
      ],
    });

    const finalReply = step2.choices[0].message.content;

    return {
      reply:            finalReply,
      updatedMessages:  augmentedMessages,
      assistantMessage: finalReply,
    };
  }

  // No tool needed — direct reply
  return {
    reply:            step1Text,
    updatedMessages:  [...messages, { role: 'assistant', content: step1Text }],
    assistantMessage: step1Text,
  };
}

module.exports = { runAgent };
