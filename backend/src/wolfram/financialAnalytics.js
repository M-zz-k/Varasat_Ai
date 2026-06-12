'use strict';

/**
 * financialAnalytics.js
 *
 * Wolfram Language Financial Analytics Engine for Varasat.
 *
 * Architecture:
 *   User data → Node.js builds Wolfram query strings →
 *   Wolfram Alpha API executes real mathematical computation →
 *   Results returned as structured JSON →
 *   Claude explains results in plain language (separate step)
 *
 * Wolfram Alpha API used:
 *   Short Answers API:  https://api.wolframalpha.com/v1/result
 *   Full Results API:   https://api.wolframalpha.com/v2/query
 *
 * Why Wolfram (not JavaScript math)?
 *   - Wolfram is a full symbolic computation engine, not a calculator.
 *   - Handles units, rounding, significant figures, and mathematical precision natively.
 *   - The same engine behind Wolfram|Alpha and Mathematica.
 *   - Results are independently verifiable: users can type the same query into wolframalpha.com.
 */

const axios = require('axios');

const WOLFRAM_BASE_URL    = 'https://api.wolframalpha.com/v1/result';
const WOLFRAM_QUERY_URL   = 'https://api.wolframalpha.com/v2/query';
const WOLFRAM_TIMEOUT_MS  = 15000;

// ─── Core Wolfram caller ──────────────────────────────────────────────────────

/**
 * callWolframShortAnswer
 *
 * Sends a natural-language or mathematical query to the Wolfram Alpha
 * Short Answers API and returns the plain-text result string.
 *
 * @param {string} query  - Wolfram-compatible query (math expression or NL)
 * @returns {Promise<string>} - Plain text answer from Wolfram
 */
async function callWolframShortAnswer(query) {
  const appId = process.env.WOLFRAM_APP_ID;

  if (!appId || appId === 'your_wolfram_app_id_here') {
    throw new Error('WOLFRAM_APP_ID is not configured in .env');
  }

  const response = await axios.get(WOLFRAM_BASE_URL, {
    params:  { appid: appId, i: query },
    timeout: WOLFRAM_TIMEOUT_MS,
    // Wolfram returns plain text, not JSON
    responseType: 'text',
  });

  const result = response.data?.trim();
  if (!result || result === 'Wolfram|Alpha did not understand your input') {
    throw new Error(`Wolfram could not compute: "${query}"`);
  }

  return result;
}

/**
 * callWolframExpression
 *
 * Evaluates a pure mathematical expression via Wolfram.
 * More reliable than natural language for exact numeric results.
 *
 * Examples:
 *   "500000 * (1 + 0.06)^10"  → future value
 *   "500000 / (1 + 0.06)^10"  → present value (purchasing power)
 *
 * @param {string} expr - Mathematical expression string
 * @returns {Promise<number>} - Numeric result
 */
async function callWolframExpression(expr) {
  const rawAnswer = await callWolframShortAnswer(expr);

  // Wolfram returns answers like "895423.82" or "8.95424×10^5"
  // Normalise scientific notation to decimal
  const normalised = rawAnswer
    .replace(/×10\^(\d+)/g, 'e$1')
    .replace(/[^0-9.\-e]/g, '');

  const value = parseFloat(normalised);
  if (isNaN(value)) {
    throw new Error(`Wolfram returned non-numeric result for "${expr}": ${rawAnswer}`);
  }
  return value;
}

// ─── Financial Calculation Functions ─────────────────────────────────────────

/**
 * computeFutureValue
 *
 * Uses Wolfram to compute compound interest future value.
 * Wolfram expression: amount * (1 + rate)^years
 *
 * This answers: "What would this asset be worth today if it had been
 * invested at the inflation rate instead of sitting unclaimed?"
 *
 * @param {number} amount        - Original asset amount in INR
 * @param {number} years         - Years the asset was delayed / unclaimed
 * @param {number} inflationRate - Annual inflation rate (e.g. 0.06 for 6%)
 * @returns {Promise<number>}    - Future value in INR
 */
async function computeFutureValue(amount, years, inflationRate) {
  // Wolfram Language expression for compound growth
  const expr = `${amount} * (1 + ${inflationRate})^${years}`;
  console.log(`[Wolfram] Future value query: ${expr}`);
  return await callWolframExpression(expr);
}

/**
 * computePurchasingPowerLoss
 *
 * Uses Wolfram to compute how much purchasing power has been lost.
 * Wolfram expression: amount - (amount / (1 + rate)^years)
 *
 * This answers: "In today's terms, how much less is this money worth
 * compared to when it was first deposited?"
 *
 * @param {number} amount
 * @param {number} years
 * @param {number} inflationRate
 * @returns {Promise<number>}
 */
async function computePurchasingPowerLoss(amount, years, inflationRate) {
  // Real value of money after inflation erodes it
  const realValueExpr    = `${amount} / (1 + ${inflationRate})^${years}`;
  const realValue        = await callWolframExpression(realValueExpr);
  const purchasingLoss   = amount - realValue;

  console.log(`[Wolfram] Purchasing power loss: ${purchasingLoss.toFixed(2)}`);
  return purchasingLoss;
}

/**
 * computeRecoveryBenefit
 *
 * Uses Wolfram to calculate the net benefit of recovering the asset now
 * versus it sitting unclaimed for more years.
 *
 * Expressed as: what 1 year of further delay would cost.
 * Wolfram expression: amount * (1 + rate)^1 - amount
 *
 * @param {number} amount
 * @param {number} inflationRate
 * @returns {Promise<number>}
 */
async function computeRecoveryBenefit(amount, inflationRate) {
  const expr = `${amount} * (1 + ${inflationRate}) - ${amount}`;
  console.log(`[Wolfram] Recovery benefit (1-yr gain) query: ${expr}`);
  return await callWolframExpression(expr);
}

/**
 * computeInflationAdjustedPercentage
 *
 * Uses Wolfram to compute the percentage loss due to inflation.
 * Wolfram expression: ((amount - amount/(1+rate)^years) / amount) * 100
 *
 * @param {number} amount
 * @param {number} years
 * @param {number} inflationRate
 * @returns {Promise<number>} - Percentage (e.g. 44.16)
 */
async function computeInflationAdjustedPercentage(amount, years, inflationRate) {
  const expr = `((${amount} - ${amount}/(1+${inflationRate})^${years}) / ${amount}) * 100`;
  console.log(`[Wolfram] Purchasing power loss % query: ${expr}`);
  return await callWolframExpression(expr);
}

// ─── Main public function ─────────────────────────────────────────────────────

/**
 * calculateAssetImpact
 *
 * The primary function called by the analytics controller.
 * Orchestrates 4 separate Wolfram Language computations in parallel,
 * then returns a structured result object.
 *
 * @param {number} amount        - Asset value in INR (e.g. 500000)
 * @param {number} years         - Years asset was unclaimed (e.g. 10)
 * @param {number} inflationRate - Annual inflation rate as decimal (e.g. 0.06)
 * @returns {Promise<Object>}    - Structured financial analysis result
 */
async function calculateAssetImpact(amount, years, inflationRate = 0.06) {
  console.log(`[Wolfram] Starting asset impact analysis: ₹${amount}, ${years} yrs, ${inflationRate * 100}% inflation`);

  // ── Run all 4 Wolfram calculations in parallel ────────────────────────────
  const [
    futureValue,
    purchasingPowerLoss,
    recoveryBenefit,
    lossPercentage,
  ] = await Promise.all([
    computeFutureValue(amount, years, inflationRate),
    computePurchasingPowerLoss(amount, years, inflationRate),
    computeRecoveryBenefit(amount, inflationRate),
    computeInflationAdjustedPercentage(amount, years, inflationRate),
  ]);

  const realValueNow = amount - purchasingPowerLoss;

  return {
    // Inputs (echoed back for transparency)
    input: {
      originalAmount:  amount,
      yearsDelayed:    years,
      inflationRate:   `${(inflationRate * 100).toFixed(1)}%`,
    },

    // Wolfram computation results
    wolfram: {
      // What the asset could have grown to if invested at inflation rate
      futureValue:            Math.round(futureValue),

      // How much of its real purchasing power is gone
      purchasingPowerLoss:    Math.round(purchasingPowerLoss),

      // Real value remaining in today's money
      realValueToday:         Math.round(realValueNow),

      // Annual gain from recovering it NOW vs waiting one more year
      annualRecoveryBenefit:  Math.round(recoveryBenefit),

      // Percentage of purchasing power eroded
      purchasingPowerLossPercent: parseFloat(lossPercentage.toFixed(2)),
    },

    // Formatted display strings (INR)
    formatted: {
      originalAmount:         formatINR(amount),
      futureValue:            formatINR(Math.round(futureValue)),
      purchasingPowerLoss:    formatINR(Math.round(purchasingPowerLoss)),
      realValueToday:         formatINR(Math.round(realValueNow)),
      annualRecoveryBenefit:  formatINR(Math.round(recoveryBenefit)),
      lossPercent:            `${lossPercentage.toFixed(1)}%`,
    },

    // Metadata
    calculatedAt: new Date().toISOString(),
    engine:       'Wolfram Alpha Computational Intelligence',
  };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees (₹ with Indian comma system).
 * e.g. 1500000 → "₹15,00,000"
 */
function formatINR(amount) {
  const num = Math.abs(Math.round(amount));
  const str = num.toString();
  let result = '';

  if (str.length <= 3) {
    result = str;
  } else {
    result = str.slice(-3);
    let remaining = str.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + ',' + result;
      remaining = remaining.slice(0, -2);
    }
    result = remaining + ',' + result;
  }

  return `₹${result}`;
}

module.exports = {
  calculateAssetImpact,
  callWolframShortAnswer,   // exported for testing
  callWolframExpression,    // exported for testing
  formatINR,
};
