'use strict';

/**
 * claimAnalyzer.js
 *
 * Wolfram Language Claim Intelligence Engine
 * Computes deterministic scores for inheritance claims.
 */

const axios = require('axios');

const WOLFRAM_URL     = 'https://api.wolframalpha.com/v1/result';
const WOLFRAM_TIMEOUT = 12000;

async function callWolframNum(query) {
  const appId = process.env.WOLFRAM_APP_ID;
  if (!appId || appId === 'your_wolfram_app_id_here') {
    throw new Error('WOLFRAM_APP_ID not configured');
  }

  const response = await axios.get(WOLFRAM_URL, {
    params:       { appid: appId, i: query },
    timeout:      WOLFRAM_TIMEOUT,
    responseType: 'text',
  });

  const raw = response.data?.trim();
  if (!raw || raw.toLowerCase().includes('did not understand')) {
    throw new Error(`Wolfram could not compute: "${query}"`);
  }

  const cleaned = raw
    .replace(/×10\^(\d+)/g, 'e$1')
    .replace(/[^0-9.\-e]/g, '');
  const n = parseFloat(cleaned);
  
  if (isNaN(n)) throw new Error(`Non-numeric from Wolfram: ${raw}`);
  return n;
}

/**
 * Parses raw amount to a number.
 */
function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const cleaned = String(amountStr).replace(/[₹,\sa-zA-Z]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Uses Wolfram to compute claim metrics.
 * 
 * @param {Object} data 
 * { amount: number/string, nomineeExists: boolean, documentCount: number, assetType: string }
 */
async function analyzeClaimScores(data) {
  const amount = parseAmount(data.amount);
  const nomineeVal = data.nomineeExists ? 1 : 0;
  const docCount = data.documentCount || 1;

  // 1. Eligibility Score (0-100)
  // Higher if nominee exists and more documents are provided.
  const eligExpr = `min(100, max(0, 40 + (${nomineeVal} * 40) + (${docCount} * 5)))`;
  
  // 2. Risk Score (0-100)
  // Higher risk for large amounts without a nominee.
  const riskExpr = `min(100, max(0, (${amount} / 100000) * (1 - ${nomineeVal}) * 10 + 5))`;

  // 3. Base Time (Days)
  // Nominee route is faster. Large amounts take longer.
  const timeExpr = `15 + (30 * (1 - ${nomineeVal})) + (${amount} / 500000)`;

  let eligibilityScore = 50;
  let riskScore = 20;
  let estimatedDays = 30;

  try {
    console.log(`[Wolfram ClaimAnalyzer] Querying scores for amount ${amount}, nominee ${data.nomineeExists}`);
    
    // We run them sequentially for safety, or we could do Promise.all if we want speed.
    // Given Wolfram API rate limits on free tier, sequential is safer.
    eligibilityScore = await callWolframNum(eligExpr);
    riskScore        = await callWolframNum(riskExpr);
    const rawDays    = await callWolframNum(timeExpr);
    estimatedDays    = Math.round(rawDays);
    
  } catch (error) {
    console.warn('[Wolfram ClaimAnalyzer] Fallback calculations used:', error.message);
    eligibilityScore = Math.min(100, Math.max(0, 40 + (nomineeVal * 40) + (docCount * 5)));
    riskScore        = Math.min(100, Math.max(0, (amount / 100000) * (1 - nomineeVal) * 10 + 5));
    estimatedDays    = Math.round(15 + (30 * (1 - nomineeVal)) + (amount / 500000));
  }

  // Derived Complexity
  let complexity = 'Medium';
  if (riskScore < 15 && nomineeVal === 1) complexity = 'Low';
  if (riskScore > 50 || nomineeVal === 0) complexity = 'High';

  return {
    eligibilityScore: Math.round(eligibilityScore),
    riskScore: Math.round(riskScore),
    complexity,
    estimatedDays
  };
}

module.exports = { analyzeClaimScores };
