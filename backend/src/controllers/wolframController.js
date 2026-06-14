'use strict';

const wolframEngineService = require('../wolfram/wolframEngineService');

/**
 * POST /api/wolfram/full-analysis
 */
async function handleFullAnalysis(req, res) {
    const { assets = [], delayYears = 0, inflationRate = 0.06, claimData = {} } = req.body;
    
    // Default assetClarity to true if missing
    if (claimData.assetClarity === undefined) claimData.assetClarity = true;
    
    try {
        const fullAnalysis = await wolframEngineService.runFullAnalysisPipeline(
            assets, delayYears, inflationRate, claimData
        );

        return res.json({
            success: true,
            data: fullAnalysis,
            _engineInfo: "Varasat Computational Intelligence Engine powered by Wolfram Language"
        });
        
    } catch (error) {
        console.error('[WolframController] Analysis failed:', error);
        return res.status(500).json({ success: false, error: 'Wolfram engine analysis failed' });
    }
}

module.exports = {
    handleFullAnalysis
};
