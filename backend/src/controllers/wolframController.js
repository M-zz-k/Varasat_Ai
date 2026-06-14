'use strict';

const wolframService = require('../wolfram/wolframService');

/**
 * POST /api/wolfram/analyze
 * Body:
 * {
 *   assets: [{ type: "Bank", amount: 245000 }],
 *   delayYears: 10,
 *   inflationRate: 0.06,
 *   claimData: { nomineeAvailable: true, documentsComplete: true }
 * }
 */
async function handleAnalyze(req, res) {
    const { assets = [], delayYears = 0, inflationRate = 0.06, claimData = {} } = req.body;
    
    const nomineeAvailable = claimData.nomineeAvailable || false;
    const documentsComplete = claimData.documentsComplete || false;
    
    // Calculate total asset value
    const totalAmount = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
    
    try {
        // Execute the 5 core Wolfram modules concurrently
        const [
            financialAnalysis,
            riskAnalysis,
            recoverySimulation,
            portfolioAnalysis,
            eligibility
        ] = await Promise.all([
            wolframService.runFinancialAnalysis(totalAmount, inflationRate, delayYears),
            wolframService.runRiskAnalysis(totalAmount, documentsComplete, nomineeAvailable, delayYears),
            wolframService.runRecoverySimulation(nomineeAvailable, documentsComplete),
            wolframService.runPortfolioAnalysis(assets),
            wolframService.runEligibilityCheck(nomineeAvailable, totalAmount, documentsComplete)
        ]);

        return res.json({
            success: true,
            financialAnalysis,
            riskAnalysis,
            recoverySimulation,
            portfolioAnalysis,
            eligibility,
            _engineInfo: "Core Financial Intelligence Engine powered by Wolfram Language"
        });
        
    } catch (error) {
        console.error('[WolframController] Analysis failed:', error);
        return res.status(500).json({ success: false, error: 'Wolfram engine analysis failed' });
    }
}

module.exports = {
    handleAnalyze
};
