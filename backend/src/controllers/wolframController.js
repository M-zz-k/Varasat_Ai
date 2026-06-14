'use strict';

const { executeWolframScript } = require('../wolfram/executor');

/**
 * POST /api/wolfram/analyze
 * Comprehensive asset analysis using Wolfram Language computational intelligence.
 */
exports.analyzeAssets = async (req, res) => {
    try {
        const { assets, delayYears } = req.body;
        
        if (!assets || !Array.isArray(assets)) {
            return res.status(400).json({ error: "Missing or invalid 'assets' array." });
        }

        const analysisResults = {
            totalAmount: 0,
            financialImpact: null,
            priorityScore: null,
            riskLevel: null,
            recoveryPrediction: null,
            analysis: ""
        };

        // Aggregate assets for high-level analysis
        let totalVal = 0;
        let missingDocs = 0;
        let noNominee = false;
        let totalCompleteness = 0;

        assets.forEach(a => {
            totalVal += Number(a.amount) || 0;
            if (a.documentStatus === 'Missing' || a.status === 'Missing') missingDocs++;
            if (!a.nominee || a.nominee === 'None' || a.nomineeAvailable === false) noNominee = true;
            totalCompleteness += (a.completeness || 0.8);
        });

        analysisResults.totalAmount = totalVal;
        let avgCompleteness = assets.length > 0 ? (totalCompleteness / assets.length) : 0;
        const delay = Number(delayYears) || 0;

        // 1. Financial Impact
        analysisResults.financialImpact = await executeWolframScript('financialModels.wl', {
            amount: totalVal,
            inflationRate: 0.06,
            delayYears: delay
        });

        // 2. Risk Analysis
        analysisResults.riskLevel = await executeWolframScript('riskAnalysis.wl', {
            missingDocs: missingDocs,
            noNominee: noNominee,
            amount: totalVal,
            delayYears: delay
        });

        // 3. Priority Scoring
        analysisResults.priorityScore = await executeWolframScript('assetScoring.wl', {
            assetType: assets[0] ? assets[0].type : "Mixed",
            amount: totalVal,
            nomineeAvailable: !noNominee,
            docCompleteness: avgCompleteness,
            delayYears: delay
        });

        // 4. Recovery Prediction
        analysisResults.recoveryPrediction = await executeWolframScript('recoveryPrediction.wl', {
            assetType: assets[0] ? assets[0].type : "Mixed",
            hasNominee: !noNominee,
            delayYears: delay,
            isDisputed: false
        });

        analysisResults.analysis = `Wolfram Language mathematical modeling completed. Asset erosion stands at ₹${analysisResults.financialImpact.purchasingPowerImpact}. Priority score is ${analysisResults.priorityScore.priorityScore}/100. Recovery timeline is estimated at ${analysisResults.recoveryPrediction.estimatedMonths} months.`;

        res.json(analysisResults);
    } catch (error) {
        console.error("[Wolfram Controller Error]", error);
        res.status(500).json({ error: "Wolfram computation failed", details: error.message });
    }
};
