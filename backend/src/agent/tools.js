'use strict';

const { searchKnowledgeBase } = require('../rag/retriever');
const { executeWolframModule } = require('../wolframBridge');

const agentTools = [
  {
    name: 'knowledgeSearchTool',
    description: 'Searches the RAG knowledge base for information about inheritance claim procedures, required documents, LIC, banking rules, and succession certificates.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query' }
      },
      required: ['query']
    }
  },
  {
    name: 'financialAnalysisTool',
    description: 'Calculates the financial impact of delayed claims using the Wolfram Engine Stochastic Volatility model. Use this for inflation, future value, opportunity cost, or market forecasting.',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Original asset amount in INR' },
        years: { type: 'number', description: 'Years the asset has been unclaimed' },
        inflationRate: { type: 'number', description: 'Annual inflation rate as a decimal (default 0.06)' },
        missedInterestRate: { type: 'number', description: 'Annual missed interest rate (default 0.07)' }
      },
      required: ['amount', 'years']
    }
  },
  {
    name: 'inheritanceDistributionTool',
    description: 'Calculates the exact fractional financial distribution among legal heirs using the Wolfram Engine Hindu Succession Act model.',
    input_schema: {
      type: 'object',
      properties: {
        totalValue: { type: 'number', description: 'Total asset value in INR' },
        heirs: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'List of heir relations (e.g., ["Spouse", "Son", "Brother"])'
        }
      },
      required: ['totalValue', 'heirs']
    }
  },
  {
    name: 'riskAnalysisTool',
    description: 'Evaluates the probability of claim friction based on missing documents using the Wolfram Engine Monte Carlo Risk Simulator.',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Asset amount in INR' },
        hasNominee: { type: 'boolean', description: 'Is there a registered nominee?' },
        missingDocs: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'List of missing documents (e.g., ["DeathCertificate", "LegalHeirCertificate"])' 
        }
      },
      required: ['amount', 'hasNominee']
    }
  },
  {
    name: 'documentAnalysisTool',
    description: 'Use this when the user explicitly asks to analyze a bank statement or document.',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'pdfGenerationTool',
    description: 'Use this when the user asks to create an affidavit, indemnity bond, or legal document.',
    input_schema: {
      type: 'object',
      properties: { documentType: { type: 'string' } },
      required: ['documentType']
    }
  }
];

async function executeKnowledgeSearch(query) {
  const results = searchKnowledgeBase(query);
  if (results.length === 0) return "No specific procedure found in RAG knowledge base.";
  return `RAG Knowledge Base Results:\n\n${results.join('\n\n')}`;
}

async function executeFinancialAnalysis(amount, years, inflationRate = 0.06, missedInterestRate = 0.07) {
  console.log(`[Agent Tool] Routing to Wolfram Bridge: SimulateFinancialImpact`);
  const result = await executeWolframModule(
    'compound_interest_simulation.wl', 
    'Varasat`CompoundInterestSimulation`', 
    'SimulateFinancialImpact', 
    [amount, years, inflationRate, missedInterestRate]
  );
  return `Wolfram Engine Results: ${JSON.stringify(result, null, 2)}`;
}

async function executeInheritanceDistribution(totalValue, heirs) {
  console.log(`[Agent Tool] Routing to Wolfram Bridge: CalculateDistribution`);
  // Convert heirs array into the map expected by the Wolfram model
  const formattedHeirs = heirs.map(h => { return {"Name": "Heir", "Relation": h}; });
  const result = await executeWolframModule(
    'inheritance_distribution.wl', 
    'Varasat`InheritanceDistribution`', 
    'CalculateDistribution', 
    [totalValue, formattedHeirs]
  );
  return `Wolfram Engine Results: ${JSON.stringify(result, null, 2)}`;
}

async function executeRiskAnalysis(amount, hasNominee, missingDocs = []) {
  console.log(`[Agent Tool] Routing to Wolfram Bridge: CalculateClaimRiskScore`);
  const result = await executeWolframModule(
    'risk_analysis_engine.wl', 
    'Varasat`RiskAnalysis`', 
    'CalculateClaimRiskScore', 
    [amount, hasNominee, missingDocs]
  );
  return `Wolfram Engine Results: ${JSON.stringify(result, null, 2)}`;
}

async function executeDocumentAnalysis() {
  return `System Directive: Instruct user to use UI.`;
}

async function executePdfGeneration(documentType) {
  return `System Directive: Instruct user to use UI to generate ${documentType}.`;
}

module.exports = {
  agentTools,
  executeKnowledgeSearch,
  executeFinancialAnalysis,
  executeInheritanceDistribution,
  executeRiskAnalysis,
  executeDocumentAnalysis,
  executePdfGeneration
};
