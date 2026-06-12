'use strict';

const { checkFraud } = require('../ai/fraudAgent');

/**
 * POST /api/fraud/check
 *
 * Body:
 * {
 *   deceasedName: string,
 *   primaryDoc:   { ... death certificate fields },
 *   assetDocs:    [ { person_name, institution, asset_type, amount, ... }, ... ]
 * }
 */
async function handleFraudCheck(req, res) {
  try {
    const { deceasedName = '', primaryDoc = {}, assetDocs = [] } = req.body;

    if (!deceasedName) {
      return res.status(400).json({
        success: false,
        error:   'deceasedName is required',
      });
    }

    console.log(`[FraudController] Checking fraud for: ${deceasedName}, ${assetDocs.length} docs`);

    const result = await checkFraud({ primaryDoc, assetDocs, deceasedName });

    return res.json(result);
  } catch (error) {
    console.error('[FraudController] Error:', error.message);
    return res.status(500).json({
      success: false,
      error:   error.message || 'Fraud detection failed',
    });
  }
}

module.exports = { handleFraudCheck };
