import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Something went wrong.';
    return Promise.reject(new Error(message));
  }
);

/**
 * analyzeFinancialImpact
 *
 * Calls POST /api/analytics/impact which:
 *   1. Sends calculations to Wolfram Language engine
 *   2. Claude explains the results in plain language
 *
 * @param {number} amount        - Asset value in INR
 * @param {number} years         - Years asset was unclaimed
 * @param {number} inflationRate - e.g. 0.06 for 6% (optional, default 0.06)
 */
export async function analyzeFinancialImpact(amount, years, inflationRate = 0.06) {
  const response = await api.post('/analytics/impact', {
    amount:        Number(amount),
    years:         Number(years),
    inflationRate: Number(inflationRate),
  });
  return response.data;
}

/**
 * analyzeWithWolframEngine
 *
 * Calls POST /api/wolfram/analyze which uses real .wl scripts to compute
 * multi-faceted financial models, scoring, and risk analytics.
 */
export async function analyzeWithWolframEngine(assets, delayYears, inflationRate, claimData) {
  const response = await api.post('/wolfram/analyze', {
    assets,
    delayYears: Number(delayYears),
    inflationRate: Number(inflationRate),
    claimData
  });
  return response.data;
}
