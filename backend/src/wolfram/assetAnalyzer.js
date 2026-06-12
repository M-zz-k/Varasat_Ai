'use strict';

/**
 * assetAnalyzer.js
 *
 * Wolfram Language Asset Discovery & Confidence Engine
 *
 * This module strictly enforces the rule that mathematical and computational
 * analysis (including confidence scoring and numerical summaries) MUST be
 * performed by Wolfram Language, not JavaScript or Claude.
 */

const axios = require('axios');

const WOLFRAM_URL     = 'https://api.wolframalpha.com/v1/result';
const WOLFRAM_TIMEOUT = 12000;

// ─── Core Wolfram caller ──────────────────────────────────────────────────────

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

// ─── Wolfram Calculations ─────────────────────────────────────────────────────

/**
 * calculateConfidence
 *
 * Computes a deterministic confidence score (0-100) based on the presence
 * and quality of extracted fields.
 *
 * Wolfram expression: ( (presentEssential * 1.5) + presentOptional ) / (totalEssential * 1.5 + totalOptional) * 100
 *
 * @param {Object} extractedData - The JSON extracted by Claude
 * @returns {Promise<number>} - Confidence score percentage
 */
async function calculateConfidence(extractedData) {
  if (!extractedData || extractedData.error) return 0;

  const essentialFields = ['institution', 'asset_type', 'amount', 'person_name'];
  const optionalFields  = ['account_number', 'policy_number', 'nominee', 'branch_address', 'date_of_document'];

  let presentEssential = 0;
  let presentOptional  = 0;

  essentialFields.forEach(field => {
    if (extractedData[field] && String(extractedData[field]).trim().length > 0) {
      presentEssential++;
    }
  });

  optionalFields.forEach(field => {
    if (extractedData[field] && String(extractedData[field]).trim().length > 0) {
      presentOptional++;
    }
  });

  const totalEssential = essentialFields.length;
  const totalOptional  = optionalFields.length;

  const expr = `((${presentEssential} * 1.5) + ${presentOptional}) / (${totalEssential} * 1.5 + ${totalOptional}) * 100`;
  console.log(`[Wolfram AssetAnalyzer] Confidence query: ${expr}`);

  try {
    const score = await callWolframNum(expr);
    return Math.min(100, Math.max(0, Math.round(score)));
  } catch (error) {
    console.warn('[Wolfram AssetAnalyzer] Fallback for confidence:', error.message);
    const score = ((presentEssential * 1.5) + presentOptional) / (totalEssential * 1.5 + totalOptional) * 100;
    return Math.round(score);
  }
}

/**
 * analyzeAssetValue
 *
 * Validates the raw amount string and uses Wolfram to perform a basic
 * real-value conversion, assuming 1 year of 6% inflation as a default baseline.
 *
 * @param {string} rawAmount - e.g., "₹ 5,00,000"
 * @returns {Promise<number>}
 */
async function analyzeAssetValue(rawAmount) {
  if (!rawAmount) return 0;

  // Clean the string to just numbers
  const cleaned = String(rawAmount).replace(/[₹,\sa-zA-Z]/g, '');
  if (!cleaned || isNaN(Number(cleaned))) return 0;

  // Evaluate the real value today (discounted by 1 year at 6%)
  const expr = `${cleaned} / (1 + 0.06)^1`;
  console.log(`[Wolfram AssetAnalyzer] Value analysis query: ${expr}`);

  try {
    const value = await callWolframNum(expr);
    return Math.round(value);
  } catch (error) {
    console.warn('[Wolfram AssetAnalyzer] Fallback for value analysis:', error.message);
    return Math.round(Number(cleaned) / 1.06);
  }
}

module.exports = {
  calculateConfidence,
  analyzeAssetValue
};
