'use strict';

const express = require('express');
const router  = express.Router();
const { handleImpactAnalysis } = require('../controllers/analyticsController');

/**
 * POST /api/analytics/impact
 *
 * Runs Wolfram Language financial calculations on an inherited asset.
 *
 * Body:
 *   {
 *     amount:        number,   // Asset value in INR (e.g. 500000)
 *     years:         number,   // Years asset was unclaimed (e.g. 10)
 *     inflationRate: number    // Optional. Decimal (e.g. 0.06). Default: 0.06
 *   }
 *
 * Response:
 *   {
 *     success:          boolean,
 *     original_amount:  string,
 *     years_delayed:    number,
 *     analysis: {
 *       futureValue, purchasingPowerLoss, realValueToday, annualRecoveryBenefit, ...
 *     },
 *     financial_insight: string   (Claude's plain-language explanation)
 *   }
 */
router.post('/impact', handleImpactAnalysis);

module.exports = router;
