'use strict';

/**
 * financialAnalytics.js
 *
 * Pure Node.js financial mathematics engine.
 * Replaces all Wolfram Alpha API calls with equivalent local math.
 * Results are mathematically identical — Wolfram was just calling these same formulas.
 *
 * Legacy reference (kept as comment):
 * // const WOLFRAM_BASE_URL = 'https://api.wolframalpha.com/v1/result';
 * // async function callWolframExpression(expr) { ... }
 */

// ─── INR Formatter ────────────────────────────────────────────────────────────
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

// ─── Core Math Functions (exact same formulas Wolfram was computing) ──────────

function computeFutureValue(amount, years, inflationRate) {
  // FV = P × (1 + r)^n
  return amount * Math.pow(1 + inflationRate, years);
}

function computeRealValueToday(amount, years, inflationRate) {
  // PV = P / (1 + r)^n
  return amount / Math.pow(1 + inflationRate, years);
}

function computePurchasingPowerLoss(amount, years, inflationRate) {
  const realValue = computeRealValueToday(amount, years, inflationRate);
  return amount - realValue;
}

function computeRecoveryBenefit(amount, inflationRate) {
  // Gain from recovering now vs waiting 1 more year
  return amount * inflationRate;
}

function computeLossPercentage(amount, years, inflationRate) {
  const loss = computePurchasingPowerLoss(amount, years, inflationRate);
  return (loss / amount) * 100;
}

// ─── Yearly breakdown (for charts) ───────────────────────────────────────────
function buildYearlyData(amount, years, inflationRate) {
  return Array.from({ length: years }, (_, i) => {
    const yr  = i + 1;
    const fv  = Math.round(amount * Math.pow(1 + inflationRate, yr));
    const rv  = Math.round(amount / Math.pow(1 + inflationRate, yr));
    return {
      year:              yr,
      futureValue:       fv,
      realValue:         rv,
      cumulativeLoss:    amount - rv,
      inflationEroded:   parseFloat(((amount - rv) / amount * 100).toFixed(1)),
    };
  });
}

// ─── Public: calculateAssetImpact ─────────────────────────────────────────────

/**
 * calculateAssetImpact
 *
 * Drop-in replacement for the old Wolfram-powered version.
 * Returns the exact same shape as before so analyticsController doesn't break.
 *
 * @param {number} amount        - Asset value in INR (e.g. 500000)
 * @param {number} years         - Years asset was unclaimed (e.g. 10)
 * @param {number} inflationRate - Annual inflation rate as decimal (e.g. 0.06)
 * @returns {Object}             - Structured financial analysis result
 */
async function calculateAssetImpact(amount, years, inflationRate = 0.06) {
  console.log(`[Finance] Calculating asset impact: ₹${amount}, ${years} yrs, ${(inflationRate * 100).toFixed(1)}% inflation`);

  const futureValue         = computeFutureValue(amount, years, inflationRate);
  const purchasingPowerLoss = computePurchasingPowerLoss(amount, years, inflationRate);
  const recoveryBenefit     = computeRecoveryBenefit(amount, inflationRate);
  const lossPercentage      = computeLossPercentage(amount, years, inflationRate);
  const realValueNow        = amount - purchasingPowerLoss;
  const yearlyData          = buildYearlyData(amount, years, inflationRate);

  return {
    input: {
      originalAmount: amount,
      yearsDelayed:   years,
      inflationRate:  `${(inflationRate * 100).toFixed(1)}%`,
    },

    wolfram: {
      futureValue:                Math.round(futureValue),
      purchasingPowerLoss:        Math.round(purchasingPowerLoss),
      realValueToday:             Math.round(realValueNow),
      annualRecoveryBenefit:      Math.round(recoveryBenefit),
      purchasingPowerLossPercent: parseFloat(lossPercentage.toFixed(2)),
    },

    formatted: {
      originalAmount:        formatINR(amount),
      futureValue:           formatINR(Math.round(futureValue)),
      purchasingPowerLoss:   formatINR(Math.round(purchasingPowerLoss)),
      realValueToday:        formatINR(Math.round(realValueNow)),
      annualRecoveryBenefit: formatINR(Math.round(recoveryBenefit)),
      lossPercent:           `${lossPercentage.toFixed(1)}%`,
    },

    yearlyData,

    calculatedAt: new Date().toISOString(),
    engine:       'Varasat Financial Engine (Node.js)',
  };
}

module.exports = {
  calculateAssetImpact,
  formatINR,
  // Legacy exports kept for any direct importers
  callWolframShortAnswer: () => { throw new Error('Wolfram removed — use calculateAssetImpact()'); },
  callWolframExpression:  () => { throw new Error('Wolfram removed — use calculateAssetImpact()'); },
};
