'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { 
  agentTools, 
  executeKnowledgeSearch, 
  executeFinancialAnalysis, 
  executeDocumentAnalysis, 
  executePdfGeneration 
} = require('./tools');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AGENT_SYSTEM_PROMPT = `You are Varasat AI Agent, an advanced inheritance assistant for Indian families.
You have access to specialized tools. You must use them to provide reliable, mathematically sound, and procedurally correct answers.

IMPORTANT RULES:
1. ALWAYS use the 'knowledgeSearchTool' when a user asks about the process, required documents, or steps for an inheritance claim (e.g., LIC, Bank, Mutual Fund). Do NOT guess the legal procedure.
2. ALWAYS use the 'financialAnalysisTool' when a user asks about the value of an asset over time, inflation, or how much they lost/gained.
3. If a user asks to analyze a document, use 'documentAnalysisTool'.
4. If a user asks to generate a legal document, use 'pdfGenerationTool'.

SAFETY RULES:
- NEVER say "I found your bank account". Say "I identified possible assets from the documents provided."
- NEVER provide guaranteed legal outcomes.
- If you use the knowledgeSearchTool, cite that the information comes from standard Indian financial procedures.
- Be empathetic and warm.`;

/**
 * runAgent
 * 
 * Takes a conversation history, sends it to Claude with tools, 
 * executes any requested tools, and returns the final AI string.
 */
async function runAgent(messages) {
  console.log(`[Agent] Starting run with ${messages.length} messages.`);
  
  // Step 1: Send user message and tools to Claude
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: AGENT_SYSTEM_PROMPT,
    messages: messages,
    tools: agentTools,
  });

  // Check if Claude decided to use a tool
  if (response.stop_reason === 'tool_use') {
    // Claude wants to use a tool. Find the tool_use blocks.
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    
    // We must append Claude's request to the history so we can reply to it
    messages.push({ role: 'assistant', content: response.content });

    // Execute each tool Claude requested
    const toolResults = [];
    for (const block of toolUseBlocks) {
      const toolName = block.name;
      const args = block.input;
      let resultString = '';

      try {
        switch (toolName) {
          case 'knowledgeSearchTool':
            resultString = await executeKnowledgeSearch(args.query);
            break;
          case 'financialAnalysisTool':
            resultString = await executeFinancialAnalysis(args.amount, args.years, args.inflationRate);
            break;
          case 'documentAnalysisTool':
            resultString = await executeDocumentAnalysis();
            break;
          case 'pdfGenerationTool':
            resultString = await executePdfGeneration(args.documentType);
            break;
          default:
            resultString = `Error: Unknown tool ${toolName}`;
        }
      } catch (err) {
        resultString = `Tool execution failed: ${err.message}`;
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: resultString,
      });
    }

    // Append the tool results to the conversation
    messages.push({ role: 'user', content: toolResults });

    // Step 2: Send the tool results back to Claude so it can formulate the final answer
    console.log(`[Agent] Returning tool results to Claude for synthesis.`);
    const finalResponse = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: AGENT_SYSTEM_PROMPT,
      messages: messages,
      tools: agentTools, // pass tools again just in case it wants to call another one
    });

    // We assume the second turn finishes the conversation for this MVP
    return {
      reply: finalResponse.content.find(c => c.type === 'text')?.text || "I processed that using my tools.",
      updatedMessages: messages,
      assistantMessage: finalResponse.content
    };
  }

  // Claude did NOT use a tool, it just replied directly.
  return {
    reply: response.content.find(c => c.type === 'text')?.text || "I'm here to help.",
    updatedMessages: messages,
    assistantMessage: response.content
  };
}

module.exports = { runAgent };
