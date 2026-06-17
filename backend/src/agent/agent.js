'use strict';

const { getGroq, isGroqConfigured } = require('../ai/aiClients');
const {
  executeKnowledgeSearch,
  executeWolframAnalysis,
  executeDocumentAnalysis,
  executePdfGeneration,
} = require('./tools');

const AGENT_SYSTEM_PROMPT_BASE = `You are Varasat AI Agent, the central router for an advanced inheritance system.

ARCHITECTURE ROUTING RULES:
You orchestrate 4 specialized engines. Do NOT try to perform these tasks yourself:
1. Document Understanding: Handled by OCR.
2. Legal Guidance: Handled by knowledgeSearchTool (RAG).
3. Financial Computation: Handled by wolframAnalysisTool (Wolfram Engine).
4. Document Generation: Handled by pdfGenerationTool.

You have access to these tools:
1. knowledgeSearchTool  — Route here for legal guidance, procedures, or required documents.
2. wolframAnalysisTool  — Route here for ANY financial modeling, numerical computation, projections, inflation/time calculations.
3. documentAnalysisTool  — Route here to trigger OCR document extraction.
4. pdfGenerationTool     — Route here to generate final claim PDFs.

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
- Keep calculations transparent. You MUST say: "Wolfram calculates..." or "Verified Mathematical Calculation". DO NOT say "AI predicted".`;

/**
 * Build the full system prompt with a strict language instruction prepended.
 * This ensures every LLM call responds in the user's chosen language.
 */
function buildSystemPrompt(language) {
  const langMap = {
    Hindi:   'Hindi (हिन्दी)',
    Kannada: 'Kannada (ಕನ್ನಡ)',
    English: 'English',
  };
  const langLabel = langMap[language] || 'English';
  const langInstruction = language === 'English'
    ? `LANGUAGE RULE: You MUST respond entirely in English. Do not use any other language.`
    : `LANGUAGE RULE: You MUST respond entirely in ${langLabel}. Every word of your answer must be in ${langLabel}. Do NOT respond in English or any other language. This is mandatory.`;
  return `${langInstruction}\n\n${AGENT_SYSTEM_PROMPT_BASE}`;
}

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
const OFFLINE_REPLIES = {
  English: "I'm here to help with your inheritance claim. Please configure GROQ_API_KEY to enable full AI responses.",
  Hindi:   "मैं आपके उत्तराधिकार दावे में मदद के लिए यहाँ हूँ। पूर्ण AI प्रतिक्रियाओं के लिए GROQ_API_KEY कॉन्फ़िगर करें।",
  Kannada: "ನಾನು ನಿಮ್ಮ ಉತ್ತರಾಧಿಕಾರ ಕ್ಲೇಮಿನಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ। ಪೂರ್ಣ AI ಪ್ರತಿಕ್ರಿಯೆಗಳಿಗಾಗಿ GROQ_API_KEY ಕಾನ್ಫಿಗರ್ ಮಾಡಿ.",
};

async function runAgent(messages, language = 'English') {
  console.log(`[Agent] Starting run with ${messages.length} messages, language=${language}.`);

  if (!isGroqConfigured()) {
    return {
      intent: "offline",
      toolUsed: "none",
      retrievedContext: "",
      finalResponse: OFFLINE_REPLIES[language] || OFFLINE_REPLIES.English,
    };
  }

  const groq = getGroq();

  const systemPrompt = buildSystemPrompt(language);

  // Step 1: Ask Groq for tool actions (or a direct reply in the correct language)
  const step1 = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 512,
    temperature: 0.1,
    messages: [
      { role: 'system', content: systemPrompt },
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

    // Step 2: Feed result back to Groq for synthesis in the correct language
    const langMap = { Hindi: 'Hindi (हिन्दी)', Kannada: 'Kannada (ಕನ್ನಡ)', English: 'English' };
    const langLabel = langMap[language] || 'English';
    const augmentedMessages = [
      ...messages,
      { role: 'assistant', content: step1Text },
      { role: 'user', content: `Tool results:\n${combinedContext}\n\nNow please answer the user's original question combining this context. Use: "Varasat AI retrieves relevant guidance and assists users." if explaining claims. IMPORTANT: Your entire response MUST be in ${langLabel} only.` },
    ];

    const step2 = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      temperature: 0.5,
      messages: [
        { role: 'system', content: systemPrompt },
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
