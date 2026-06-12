const { analyzeClaimScores } = require('../wolfram/claimAnalyzer');
const { generateLegalExplanation } = require('../ai/legalAgent');

// Mock claim store (replace with DB in Phase 2)
const claims = {};

/**
 * POST /api/claim/analyze
 * Body: { assetData: Object, userDetails: Object }
 */
async function analyzeClaim(req, res) {
  try {
    const { assetData, userDetails } = req.body;

    if (!assetData) {
      return res.status(400).json({ error: 'assetData is required.' });
    }

    // 1. Wolfram Mathematical Analysis
    const analysis = await analyzeClaimScores(assetData);

    // 2. AI Legal Explanation
    const aiResponse = await generateLegalExplanation(analysis, assetData);

    const result = {
      success: true,
      analysis,
      recommendation: aiResponse.recommendation,
      requiredDocuments: aiResponse.requiredDocuments
    };

    // Store with a simple ID
    const claimId = `CLM-${Date.now()}`;
    claims[claimId] = { ...result, claimId, status: 'Analyzing' };

    return res.json({ claimId, ...result });
  } catch (error) {
    console.error('[ClaimController] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/claim/:claimId
 * Returns the stored claim status.
 */
async function getClaimStatus(req, res) {
  try {
    const { claimId } = req.params;
    const claim = claims[claimId];

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found.' });
    }

    return res.json(claim);
  } catch (error) {
    console.error('[ClaimController] Status error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { analyzeClaim, getClaimStatus };
