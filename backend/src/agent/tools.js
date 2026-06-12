'use strict';

const { searchKnowledgeBase } = require('../rag/retriever');
const { callWolframExpression } = require('../wolfram/financialAnalytics');

// Note: For document analysis and PDF generation, we normally need file buffers
// or complex state. For this MVP agent, we'll keep them as mocked tool triggers
// that tell the AI how to guide the user to the correct UI pages.

/**
 * ── Anthropic Tool Schemas ──
 * These JSON objects tell Claude what tools are available and what arguments they take.
 */
const agentTools = [
  {
    name: 'knowledgeSearchTool',
    description: 'Searches the RAG knowledge base for information about inheritance claim procedures, required documents, LIC, banking rules, and succession certificates.',
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
    name: 'financialAnalysisTool',
    description: 'Calculates the future value or inflation impact of an asset using the Wolfram Language mathematical engine. Use this when the user asks how much money they lost due to inflation or delay.',
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
    description: 'Use this when the user explicitly asks to analyze a bank statement or document. This tool does NOT actually analyze it, but tells the user how to use the UI to do so.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'pdfGenerationTool',
    description: 'Use this when the user asks to create an affidavit, indemnity bond, or legal document.',
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
  
  return `RAG Knowledge Base Results:\n\n${results.join('\n\n')}`;
}

async function executeFinancialAnalysis(amount, years, inflationRate = 0.06) {
  console.log(`[Agent Tool] Executing financialAnalysisTool: ₹${amount}, ${years}yrs`);
  try {
    // Formula: amount * (1 + inflation)^years
    const exprFutureValue = `${amount} * (1 + ${inflationRate})^${years}`;
    const fv = await callWolframExpression(exprFutureValue);
    
    const exprRealValue = `${amount} / (1 + ${inflationRate})^${years}`;
    const realValue = await callWolframExpression(exprRealValue);
    
    const loss = amount - realValue;
    
    return `Wolfram Financial Engine Results:
    Original Amount: ₹${amount}
    Years Delayed: ${years}
    Future Value (if invested): ₹${Math.round(fv)}
    Purchasing Power Impact: ₹${Math.round(loss)}
    Real Value Today: ₹${Math.round(realValue)}
    
    Tell the user these numbers and emphasize that delaying further will erode more purchasing power.`;
  } catch (error) {
    return `Error calculating financial impact: ${error.message}`;
  }
}

async function executeDocumentAnalysis() {
  console.log(`[Agent Tool] Executing documentAnalysisTool`);
  return `System Directive: Tell the user that Varasat can securely analyze their financial documents, but they must go to the "Discover Assets" or "Analyse Document" page to upload their file. Do not pretend you can read files through the chat interface.`;
}

async function executePdfGeneration(documentType) {
  console.log(`[Agent Tool] Executing pdfGenerationTool for: ${documentType}`);
  return `System Directive: Tell the user that Varasat can generate their ${documentType}, and instruct them to navigate to the "Analyze Claim" -> "Generate Documents" section of the app after completing their asset discovery. Do not try to generate the raw text of the document here in the chat.`;
}

module.exports = {
  agentTools,
  executeKnowledgeSearch,
  executeFinancialAnalysis,
  executeDocumentAnalysis,
  executePdfGeneration
};
