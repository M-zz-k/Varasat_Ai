'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { 
  agentTools, 
  executeKnowledgeSearch, 
  executeFinancialAnalysis, 
  executeInheritanceDistribution,
  executeRiskAnalysis,
  executeDocumentAnalysis, 
  executePdfGeneration 
} = require('./tools');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AGENT_SYSTEM_PROMPT = `You are Varasat AI Agent, an advanced inheritance assistant.
You have access to specialized tools, specifically native Wolfram Language engines, to provide mathematically sound and procedurally correct answers.

IMPORTANT RULES:
1. ALWAYS use 'knowledgeSearchTool' when a user asks about the process, required documents, or steps for an inheritance claim.
2. ALWAYS use 'financialAnalysisTool' (Wolfram Engine) when a user asks about asset value forecasting or inflation over time.
3. ALWAYS use 'inheritanceDistributionTool' (Wolfram Engine) when a user asks how to split assets among family members.
4. ALWAYS use 'riskAnalysisTool' (Wolfram Engine) when a user asks about the probability of success or delays in claiming.
5. If a user asks to analyze a document, use 'documentAnalysisTool'.
6. If a user asks to generate a legal document, use 'pdfGenerationTool'.

SAFETY RULES:
- NEVER say "I found your bank account". Say "I identified possible assets."
- NEVER provide guaranteed legal outcomes.
- Base numerical answers strictly on the JSON outputs returned by the Wolfram tools.`;

async function runAgent(messages) {
  console.log(`[Agent] Starting run with ${messages.length} messages.`);
  
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: AGENT_SYSTEM_PROMPT,
    messages: messages,
    tools: agentTools,
  });

  if (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    messages.push({ role: 'assistant', content: response.content });

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
            resultString = await executeFinancialAnalysis(args.amount, args.years, args.inflationRate, args.missedInterestRate);
            break;
          case 'inheritanceDistributionTool':
            resultString = await executeInheritanceDistribution(args.totalValue, args.heirs);
            break;
          case 'riskAnalysisTool':
            resultString = await executeRiskAnalysis(args.amount, args.hasNominee, args.missingDocs);
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

    messages.push({ role: 'user', content: toolResults });

    console.log(`[Agent] Returning tool results to Claude for synthesis.`);
    const finalResponse = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: AGENT_SYSTEM_PROMPT,
      messages: messages,
      tools: agentTools,
    });

    return {
      reply: finalResponse.content.find(c => c.type === 'text')?.text || "I processed that using my tools.",
      updatedMessages: messages,
      assistantMessage: finalResponse.content
    };
  }

  return {
    reply: response.content.find(c => c.type === 'text')?.text || "I'm here to help.",
    updatedMessages: messages,
    assistantMessage: response.content
  };
}

module.exports = { runAgent };
