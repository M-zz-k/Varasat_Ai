'use strict';

const { getGroq, isGroqConfigured } = require('../ai/aiClients');
const {
  executeKnowledgeSearch,
  executeWolframAnalysis,
  executeDocumentAnalysis,
  executePdfGeneration,
} = require('./tools');

const AGENT_SYSTEM_PROMPT = `You are Varasat AI Agent, an advanced inheritance assistant for Indian families.

You have access to these tools:
1. knowledgeSearchTool  — Use when the user asks about the process, required documents, or steps for any inheritance claim.
2. wolframAnalysisTool  — Use when the user asks about asset value over time, financial loss, or requires mathematical intelligence.
3. documentAnalysisTool  — Use when the user explicitly asks to analyze an uploaded document.
4. pdfGenerationTool     — Use when the user explicitly asks to generate a legal document or PDF like an affidavit.

To use one or more tools, respond ONLY with a JSON array of actions (no other text). If a query is mixed (e.g., "How to claim LIC and how much value did I lose in 5 years?"), call both tools.
Example:
[
  {"action":"TOOL_CALL","tool":"knowledgeSearchTool","args":{"query":"How to claim LIC"}},
  {"action":"TOOL_CALL","tool":"wolframAnalysisTool","args":{"amount":100000,"years":5}}
]

If no tool is needed, respond with standard natural language.

SAFETY RULES:
- NEVER guarantee legal outcomes.
- "Varasat AI retrieves relevant guidance and assists users."
- Keep calculations transparent. Say: "Wolfram performs mathematical and financial analysis to support recovery decisions."`;

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

function tryParseActions(text) {
  try {
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].action === "TOOL_CALL") {
        return parsed;
      }
    }
  } catch {}
  return null;
}

/**
 * runAgent
 */
async function runAgent(messages) {
  console.log(`[Agent] Starting run with ${messages.length} messages.`);

  if (!isGroqConfigured()) {
    return {
      intent: "offline",
      toolUsed: "none",
      retrievedContext: "",
      finalResponse: "I'm here to help with your inheritance claim. Please configure GROQ_API_KEY to enable full AI responses."
    };
  }

  const groq = getGroq();

  // Step 1: Ask Groq for tool actions
  const step1 = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 512,
    temperature: 0.1,
    messages: [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      ...messages,
    ],
  });

  const step1Text = step1.choices[0].message.content;
  const actions = tryParseActions(step1Text);

  if (actions && actions.length > 0) {
    console.log(`[Agent] Tools requested: ${actions.map(a => a.tool).join(', ')}`);
    
    let combinedContext = '';
    const toolsUsed = [];

    for (const action of actions) {
      if (action.tool) {
        toolsUsed.push(action.tool);
        let toolResult = '';
        try {
          toolResult = await dispatchTool(action.tool, action.args || {});
        } catch (err) {
          toolResult = `Tool execution failed: ${err.message}`;
        }
        combinedContext += `--- Result from ${action.tool} ---\n${toolResult}\n\n`;
      }
    }

    // Step 2: Feed result back to Groq for synthesis
    const augmentedMessages = [
      ...messages,
      { role: 'assistant', content: step1Text },
      { role: 'user', content: `Tool results:\n${combinedContext}\n\nNow please answer the user's original question combining this context. Use: "Varasat AI retrieves relevant guidance and assists users." if explaining claims.` },
    ];

    const step2 = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      temperature: 0.5,
      messages: [
        { role: 'system', content: AGENT_SYSTEM_PROMPT },
        ...augmentedMessages,
      ],
    });

    const finalReply = step2.choices[0].message.content;

    return {
      intent: "tool_augmented",
      toolUsed: toolsUsed.join(', '),
      retrievedContext: combinedContext,
      finalResponse: finalReply
    };
  }

  // No tool needed
  return {
    intent: "direct_reply",
    toolUsed: "none",
    retrievedContext: "",
    finalResponse: step1Text
  };
}

module.exports = { runAgent };
