'use strict';

const { searchKnowledgeBase } = require('../rag/retriever');
const { executeWolframScript } = require('../wolfram/executor');

/**
 * ── Anthropic/Groq Tool Schemas ──
 */
const agentTools = [
  {
    name: 'knowledgeSearchTool',
    description: 'Searches the RAG knowledge base for information about inheritance claim procedures, required documents, LIC, banking rules, and succession certificates. Use when the user asks what documents are needed, how to claim, or needs inheritance guidance.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query (e.g. "What documents are needed for LIC claim?")'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'wolframAnalysisTool',
    description: 'Calculates financial impact, inflation, delay calculation, or asset value analysis using the Wolfram Language mathematical engine. Use this when the user asks how much value their inheritance lost after X years, or requests a financial calculation.',
    input_schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'The original asset amount in INR'
        },
        years: {
          type: 'number',
          description: 'The number of years the asset has been unclaimed'
        },
        inflationRate: {
          type: 'number',
          description: 'The annual inflation rate as a decimal (default 0.06)'
        }
      },
      required: ['amount', 'years']
    }
  },
  {
    name: 'documentAnalysisTool',
    description: 'Use this when the user explicitly asks to analyze an uploaded document (like a bank statement or ID).',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'pdfGenerationTool',
    description: 'Use this when the user asks to create an affidavit, indemnity bond, claim letter, or legal document.',
    input_schema: {
      type: 'object',
      properties: {
        documentType: {
          type: 'string',
          description: 'The type of document (e.g., "Affidavit")'
        }
      },
      required: ['documentType']
    }
  }
];

/**
 * ── Tool Implementations ──
 */

async function executeKnowledgeSearch(query) {
  console.log(`[Agent Tool] Executing knowledgeSearchTool for: "${query}"`);
  const results = searchKnowledgeBase(query);
  
  if (results.length === 0) {
    return "No specific procedure found in the knowledge base. Please advise the user to consult a legal professional or the specific institution.";
  }
  
  const formattedResults = results.map(r => `Topic: ${r.topic}
Asset Type: ${r.assetType}
Timeline: ${r.timeline}
Required Documents: ${r.requiredDocuments.join(', ')}
Content: ${r.content}
Similarity Score: ${r.similarityScore}
`).join('\n\n');

  return `RAG Knowledge Base Results:\n\n${formattedResults}`;
}

async function executeWolframAnalysis(amount, years, inflationRate = 0.06) {
  console.log(`[Agent Tool] Executing wolframAnalysisTool: ₹${amount}, ${years}yrs`);
  try {
    // Attempting to call the new nested script if `executeWolframScript` is updated, 
    // but assuming standard node service fallback exists or standard script execution works.
    // For safety, we can use the new wolframEngineService here or stick to the legacy executor 
    // based on how `tools.js` was previously defined. Since we recently created `wolframEngineService.js`, 
    // let's use it directly for ultimate reliability.
    const { runFinancialModels } = require('../wolfram/wolframEngineService');
    const result = await runFinancialModels(amount, inflationRate, years, 0.08); // Assuming 8% growth
    
    return `Wolfram Language Engine Results:
    Original Amount: ₹${amount}
    Years Delayed: ${years}
    Future Value (if invested): ₹${result.result.futureValue}
    Purchasing Power Impact (Loss): ₹${result.result.inflationImpact}
    Delayed Recovery Cost: ₹${result.result.delayedRecoveryCost}
    
    IMPORTANT: Emphasize these numbers and transparently state: "Wolfram performs mathematical and financial analysis to support recovery decisions." Do not claim to "predict inheritance".`;
  } catch (error) {
    return `Error calculating financial impact: ${error.message}`;
  }
}

async function executeDocumentAnalysis() {
  console.log(`[Agent Tool] Executing documentAnalysisTool`);
  return `System Directive: Tell the user that Varasat can securely analyze their financial documents, but they must go to the "Get Started" or "/analyze" page to upload their file. Do not pretend you can read files through the chat interface.`;
}

async function executePdfGeneration(documentType) {
  console.log(`[Agent Tool] Executing pdfGenerationTool for: ${documentType}`);
  return `System Directive: Tell the user that Varasat can generate their ${documentType}, and instruct them to navigate to the "Analyze Claim" or "/generate-document" section of the app. Do not try to generate the raw text of the document here in the chat.`;
}

module.exports = {
  agentTools,
  executeKnowledgeSearch,
  executeWolframAnalysis,
  executeDocumentAnalysis,
  executePdfGeneration
};
