'use strict';

/**
 * assetAnalyzer.js
 *
 * Pure Node.js asset confidence scoring & value analysis.
 * Replaces Wolfram Alpha API calls with identical local math.
 *
 * Legacy reference (kept as comment):
 * // const WOLFRAM_URL = 'https://api.wolframalpha.com/v1/result';
 * // async function callWolframNum(query) { ... }
 */

// ─── Confidence Scoring ───────────────────────────────────────────────────────
/**
 * calculateConfidence
 *
 * Deterministic confidence score (0–100) based on the presence and quality
 * of extracted fields. Exact same formula that was sent to Wolfram:
 *   ((presentEssential * 1.5) + presentOptional) / (totalEssential * 1.5 + totalOptional) * 100
 *
 * @param {Object} extractedData - The JSON extracted by Gemini
 * @returns {Promise<number>} - Confidence score percentage
 */
async function calculateConfidence(extractedData) {
  if (!extractedData || extractedData.error) return 0;

  const essentialFields = ['institution', 'asset_type', 'amount', 'person_name'];
  const optionalFields  = ['account_number', 'policy_number', 'nominee', 'branch_address', 'date_of_document'];

  let presentEssential = 0;
  let presentOptional  = 0;

  essentialFields.forEach(field => {
    if (extractedData[field] && String(extractedData[field]).trim().length > 0) presentEssential++;
  });

  optionalFields.forEach(field => {
    if (extractedData[field] && String(extractedData[field]).trim().length > 0) presentOptional++;
  });

  const totalEssential = essentialFields.length; // 4
  const totalOptional  = optionalFields.length;  // 5

  // Exact formula: weighted essential fields matter more
  const score = ((presentEssential * 1.5) + presentOptional) / (totalEssential * 1.5 + totalOptional) * 100;

  console.log(`[AssetAnalyzer] Confidence: ${presentEssential}/${totalEssential} essential, ${presentOptional}/${totalOptional} optional → ${score.toFixed(1)}%`);
  return Math.min(100, Math.max(0, Math.round(score)));
}

// ─── Asset Value Analysis ─────────────────────────────────────────────────────
/**
 * analyzeAssetValue
 *
 * Parses the raw amount string and applies 1-year inflation discount at 6%.
 * Exact same formula that was sent to Wolfram:
 *   amount / (1 + 0.06)^1
 *
 * @param {string} rawAmount - e.g., "₹ 5,00,000"
 * @returns {Promise<number>}
 */
async function analyzeAssetValue(rawAmount) {
  if (!rawAmount) return 0;

  const cleaned = String(rawAmount).replace(/[₹,\sa-zA-Z]/g, '');
  const numeric = parseFloat(cleaned);

  if (!cleaned || isNaN(numeric)) return 0;

  const realValue = numeric / Math.pow(1 + 0.06, 1);
  console.log(`[AssetAnalyzer] Real value (1yr@6% discount): ₹${Math.round(realValue)}`);
  return Math.round(realValue);
}

module.exports = { calculateConfidence, analyzeAssetValue };
