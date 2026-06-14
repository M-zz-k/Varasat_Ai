'use strict';

/**
 * claimAnalyzer.js
 *
 * Pure Node.js claim scoring engine.
 * Replaces Wolfram Alpha API calls with identical local math.
 *
 * Legacy reference (kept as comment):
 * // const WOLFRAM_URL = 'https://api.wolframalpha.com/v1/result';
 * // async function callWolframNum(query) { ... }
 */

// ─── Amount Parser ────────────────────────────────────────────────────────────
function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const cleaned = String(amountStr).replace(/[₹,\sa-zA-Z]/g, '');
  return parseFloat(cleaned) || 0;
}

// ─── Core Scoring (same formulas as Wolfram expressions) ─────────────────────
/**
 * analyzeClaimScores
 *
 * All three expressions mirror the exact Wolfram queries:
 *   eligibilityScore: min(100, max(0, 40 + (nomineeVal * 40) + (docCount * 5)))
 *   riskScore:        min(100, max(0, (amount / 100000) * (1 - nomineeVal) * 10 + 5))
 *   estimatedDays:    15 + (30 * (1 - nomineeVal)) + (amount / 500000)
 *
 * @param {Object} data - { amount, nomineeExists, documentCount, assetType }
 * @returns {Promise<{ eligibilityScore, riskScore, complexity, estimatedDays }>}
 */
async function analyzeClaimScores(data) {
  const amount      = parseAmount(data.amount);
  const nomineeVal  = data.nomineeExists ? 1 : 0;
  const docCount    = Math.max(1, data.documentCount || 1);

  // Eligibility: higher when nominee exists and more docs are provided
  const eligibilityScore = Math.min(100, Math.max(0,
    40 + (nomineeVal * 40) + (docCount * 5)
  ));

  // Risk: higher for large amounts without a nominee
  const riskScore = Math.min(100, Math.max(0,
    (amount / 100_000) * (1 - nomineeVal) * 10 + 5
  ));

  // Time estimate in days
  const rawDays    = 15 + (30 * (1 - nomineeVal)) + (amount / 500_000);
  const estimatedDays = Math.round(rawDays);

  // Derived complexity
  let complexity = 'Medium';
  if (riskScore < 15 && nomineeVal === 1) complexity = 'Low';
  if (riskScore > 50 || nomineeVal === 0) complexity = 'High';

  console.log(`[ClaimAnalyzer] eligibility=${Math.round(eligibilityScore)} risk=${Math.round(riskScore)} days=${estimatedDays} complexity=${complexity}`);

  return {
    eligibilityScore: Math.round(eligibilityScore),
    riskScore:        Math.round(riskScore),
    complexity,
    estimatedDays,
  };
}

module.exports = { analyzeClaimScores };
