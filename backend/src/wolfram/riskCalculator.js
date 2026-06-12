'use strict';

/**
 * riskCalculator.js
 *
 * Wolfram Language Risk Scoring Engine for Varasat Fraud Detection.
 *
 * Wolfram computes:
 *   - Weighted risk score from mismatch counts and severity
 *   - Name similarity index (Levenshtein distance ratio via Wolfram)
 *   - Document completeness score
 *   - Composite fraud confidence
 *
 * Why Wolfram (not JavaScript)?
 *   - Provides an independent, verifiable calculation source
 *   - Wolfram's EditDistance[] gives mathematically precise string similarity
 *   - Risk weightings follow actuarial scoring models
 */

const axios = require('axios');

const WOLFRAM_URL     = 'https://api.wolframalpha.com/v1/result';
const WOLFRAM_TIMEOUT = 12000;

// ─── Core Wolfram caller ──────────────────────────────────────────────────────

async function callWolfram(query) {
  const appId = process.env.WOLFRAM_APP_ID;
  if (!appId || appId === 'your_wolfram_app_id_here') {
    throw new Error('WOLFRAM_APP_ID not configured');
  }

  const response = await axios.get(WOLFRAM_URL, {
    params:       { appid: appId, i: query },
    timeout:      WOLFRAM_TIMEOUT,
    responseType: 'text',
  });

  const result = response.data?.trim();
  if (!result || result.toLowerCase().includes('did not understand')) {
    throw new Error(`Wolfram could not compute: "${query}"`);
  }
  return result;
}

async function callWolframNum(expr) {
  const raw = await callWolfram(expr);
  const cleaned = raw
    .replace(/×10\^(\d+)/g, 'e$1')
    .replace(/[^0-9.\-e]/g, '');
  const n = parseFloat(cleaned);
  if (isNaN(n)) throw new Error(`Non-numeric from Wolfram: ${raw}`);
  return n;
}

// ─── Wolfram Calculations ─────────────────────────────────────────────────────

/**
 * computeRiskScore
 *
 * Wolfram expression:
 *   risk = Min[100, (criticalMismatches*40 + mediumMismatches*20 + minorMismatches*8) * (1 + missingDocsFactor)]
 *
 * Where missingDocsFactor = missingDocs / totalExpectedDocs
 *
 * This gives a 0–100 risk score.
 *
 * @param {number} criticalMismatches  - e.g. name mismatch = critical
 * @param {number} mediumMismatches    - e.g. date discrepancy
 * @param {number} minorMismatches     - e.g. address format difference
 * @param {number} missingDocs         - number of missing documents
 * @param {number} totalExpectedDocs   - total docs that should be present
 */
async function computeRiskScore(
  criticalMismatches  = 0,
  mediumMismatches    = 0,
  minorMismatches     = 0,
  missingDocs         = 0,
  totalExpectedDocs   = 5
) {
  const missingFactor = totalExpectedDocs > 0 ? missingDocs / totalExpectedDocs : 0;
  const expr = `Min[100, (${criticalMismatches}*40 + ${mediumMismatches}*20 + ${minorMismatches}*8) * (1 + ${missingFactor})]`;
  console.log(`[Wolfram Risk] Score query: ${expr}`);

  try {
    return await callWolframNum(expr);
  } catch {
    // Fallback computation if Wolfram is unavailable
    const base = (criticalMismatches * 40) + (mediumMismatches * 20) + (minorMismatches * 8);
    return Math.min(100, base * (1 + missingFactor));
  }
}

/**
 * computeNameSimilarity
 *
 * Wolfram computes the edit distance between two name strings as a similarity %.
 * Formula: (1 - EditDistance(a,b) / Max(len(a), len(b))) * 100
 *
 * Wolfram's EditDistance is the Levenshtein distance — the industry standard.
 *
 * @param {string} nameA - e.g. "Ramesh Kumar"
 * @param {string} nameB - e.g. "Rajesh Kumar"
 * @returns {Promise<number>} - 0-100 where 100 = identical
 */
async function computeNameSimilarity(nameA, nameB) {
  if (!nameA || !nameB) return 0;

  const a    = nameA.toLowerCase().trim();
  const b    = nameB.toLowerCase().trim();
  const maxL = Math.max(a.length, b.length);

  if (maxL === 0) return 100;
  if (a === b)    return 100;

  // Wolfram EditDistance expression
  const expr = `(1 - EditDistance["${a}", "${b}"] / ${maxL}) * 100`;
  console.log(`[Wolfram Risk] Name similarity query: ${expr}`);

  try {
    const sim = await callWolframNum(expr);
    return Math.max(0, Math.min(100, sim));
  } catch {
    // JS fallback — Levenshtein distance
    return jsLevenshteinSimilarity(a, b) * 100;
  }
}

/**
 * computeDocumentCompletenessScore
 *
 * Score = (presentFields / totalExpectedFields) * 100
 * Wolfram computes the ratio to 4 significant figures.
 *
 * @param {number} presentFields
 * @param {number} totalFields
 */
async function computeDocumentCompletenessScore(presentFields, totalFields) {
  if (!totalFields || totalFields === 0) return 0;

  const expr = `(${presentFields} / ${totalFields}) * 100`;
  console.log(`[Wolfram Risk] Completeness query: ${expr}`);

  try {
    return await callWolframNum(expr);
  } catch {
    return (presentFields / totalFields) * 100;
  }
}

/**
 * computeCompositeConfidence
 *
 * Combines risk score and completeness into a single fraud confidence %.
 * Formula: confidence = (riskScore * 0.7) + ((100 - completeness) * 0.3)
 *
 * Higher value = higher confidence that fraud/mismatch exists.
 *
 * @param {number} riskScore    - 0-100
 * @param {number} completeness - 0-100
 */
async function computeCompositeConfidence(riskScore, completeness) {
  const expr = `Min[100, (${riskScore} * 0.7) + ((100 - ${completeness}) * 0.3)]`;
  console.log(`[Wolfram Risk] Composite confidence query: ${expr}`);

  try {
    return await callWolframNum(expr);
  } catch {
    return Math.min(100, (riskScore * 0.7) + ((100 - completeness) * 0.3));
  }
}

// ─── Main public function ─────────────────────────────────────────────────────

/**
 * calculateFraudRisk
 *
 * Orchestrates all 4 Wolfram risk calculations for a document comparison.
 *
 * @param {Object} params
 * @param {string}   params.nameA              - Name from death certificate / primary doc
 * @param {string}   params.nameB              - Name from bank / asset document
 * @param {number}   params.criticalMismatches
 * @param {number}   params.mediumMismatches
 * @param {number}   params.minorMismatches
 * @param {number}   params.presentFields      - Fields successfully extracted
 * @param {number}   params.totalFields        - Total expected fields
 * @param {number}   params.missingDocs
 * @param {number}   params.totalExpectedDocs
 *
 * @returns {Promise<{
 *   riskScore, riskLevel, nameSimilarity,
 *   documentCompleteness, compositeConfidence,
 *   engine
 * }>}
 */
async function calculateFraudRisk({
  nameA = '', nameB = '',
  criticalMismatches  = 0,
  mediumMismatches    = 0,
  minorMismatches     = 0,
  presentFields       = 0,
  totalFields         = 10,
  missingDocs         = 0,
  totalExpectedDocs   = 5,
}) {
  console.log('[Wolfram Risk] Starting risk calculation…');

  const [riskScore, nameSimilarity, completeness] = await Promise.all([
    computeRiskScore(criticalMismatches, mediumMismatches, minorMismatches, missingDocs, totalExpectedDocs),
    computeNameSimilarity(nameA, nameB),
    computeDocumentCompletenessScore(presentFields, totalFields),
  ]);

  // Apply name similarity penalty: low similarity → increases risk
  const namePenalty    = nameSimilarity < 80 ? (80 - nameSimilarity) * 0.5 : 0;
  const adjustedRisk   = Math.min(100, riskScore + namePenalty);

  const compositeConfidence = await computeCompositeConfidence(adjustedRisk, completeness);

  const riskLevel = adjustedRisk >= 70 ? 'High'
    : adjustedRisk >= 40              ? 'Medium'
    : 'Low';

  return {
    riskScore:             parseFloat(adjustedRisk.toFixed(1)),
    riskLevel,
    nameSimilarity:        parseFloat(nameSimilarity.toFixed(1)),
    documentCompleteness:  parseFloat(completeness.toFixed(1)),
    compositeConfidence:   parseFloat(compositeConfidence.toFixed(1)),
    engine:                'Wolfram Alpha Risk Engine',
    calculatedAt:          new Date().toISOString(),
  };
}

// ─── JS Fallback: Levenshtein similarity ─────────────────────────────────────

function jsLevenshteinSimilarity(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  const maxLen = Math.max(m, n);
  return maxLen === 0 ? 1 : 1 - dp[m][n] / maxLen;
}

module.exports = {
  calculateFraudRisk,
  computeNameSimilarity,
  computeRiskScore,
};
