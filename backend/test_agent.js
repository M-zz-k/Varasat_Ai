'use strict';

// Load env for Groq API
require('dotenv').config({ path: __dirname + '/.env' });
const { runAgent } = require('./src/agent/agent');

async function testSuite() {
  console.log("=== RUNNING AGENT RAG & WOLFRAM INTEGRATION TESTS ===\n");

  const testCases = [
    {
      name: "Test 1: RAG Knowledge Query",
      query: "What documents are required for LIC claim?",
      expectedTool: "knowledgeSearchTool"
    },
    {
      name: "Test 2: Wolfram Financial Query",
      query: "What happens if my 500000 inheritance recovery is delayed 10 years?",
      expectedTool: "wolframAnalysisTool"
    },
    {
      name: "Test 3: PDF Generation Query",
      query: "Create affidavit for my claim",
      expectedTool: "pdfGenerationTool"
    },
    {
      name: "Test 4: Mixed Intelligence Query",
      query: "What documents are required for bank claim and how much value is lost if 200000 is delayed 5 years?",
      expectedTool: ["knowledgeSearchTool", "wolframAnalysisTool"]
    }
  ];

  for (const tc of testCases) {
    console.log(`\n\n--- ${tc.name} ---`);
    console.log(`Question: "${tc.query}"`);
    
    try {
      const result = await runAgent([{ role: 'user', content: tc.query }]);
      console.log(`[Intent]: ${result.intent}`);
      console.log(`[Tool Used]: ${result.toolUsed}`);
      console.log(`[Response snippet]: ${result.finalResponse.substring(0, 150)}...`);
      
      const success = Array.isArray(tc.expectedTool) 
        ? tc.expectedTool.every(t => result.toolUsed.includes(t))
        : result.toolUsed.includes(tc.expectedTool);

      if (success) {
        console.log(`✅ Passed (Expected: ${tc.expectedTool})`);
      } else {
        console.log(`❌ Failed (Expected: ${tc.expectedTool}, Got: ${result.toolUsed})`);
      }
    } catch (err) {
      console.error(`❌ Error running test: ${err.message}`);
    }
  }
}

testSuite();
