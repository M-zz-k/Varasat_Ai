'use strict';

const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

const WOLFRAM_DIR = path.resolve(__dirname, '../../../wolfram');

/**
 * Node.js fallback implementations mirroring the structural logic of the Ultimate .wl modules.
 */
const fallbacks = {
    'models/advancedFinancialModels.wl': (args) => {
        const principal = parseFloat(args[0]) || 0;
        const inflationRate = parseFloat(args[1]) || 0;
        const delayYears = parseFloat(args[2]) || 0;
        const growthRate = parseFloat(args[3]) || 0;
        
        const fv = Math.round(principal * Math.pow(1 + growthRate, delayYears));
        const pv = Math.round(principal / Math.pow(1 + inflationRate, delayYears));
        const impact = principal - pv;
        const cost = fv - pv;
        
        const scenarios = [0, 1, 5, 10].map(y => ({
            scenario: y === 0 ? "Immediate" : y === 1 ? "1 Year Delay" : y === 5 ? "5 Year Delay" : "10 Year Delay",
            delayYears: y,
            futureValue: Math.round(principal * Math.pow(1 + growthRate, y)),
            purchasingImpact: Math.round(principal - (principal / Math.pow(1 + inflationRate, y))),
            opportunityCost: Math.round((principal * Math.pow(1 + growthRate, y)) - (principal / Math.pow(1 + inflationRate, y)))
        }));

        return { moduleName: "models/advancedFinancialModels", inputs: { principal, inflationRate, delayYears, growthRate }, method: "Compound Interest and Discounting", calculation: "FV = P(1+r)^t; PV = FV/(1+i)^t", result: { futureValue: fv, presentValue: pv, inflationImpact: impact, delayedRecoveryCost: cost, scenarios }, explanation: "Computed future nominal values and evaluated real purchasing power loss." };
    },
    'analytics/assetGrowthAnalysis.wl': (args) => {
        const assetsList = JSON.parse(args[0]);
        const assetTrajectories = assetsList.map(a => {
            const rate = a.type === 'Bank' ? 0.06 : a.type === 'Insurance' ? 0.05 : a.type === 'Investments' ? 0.12 : 0.07;
            const traj = [];
            for(let y=0; y<=10; y++) traj.push({ year: y, value: Math.round(a.amount * Math.pow(1+rate, y)) });
            return { type: a.type, growthTrajectory: traj };
        });
        return { moduleName: "analytics/assetGrowthAnalysis", inputs: { assetsCount: assetsList.length }, method: "Discrete Exponential Growth Projection", calculation: "y(t) = P(1+r)^t", result: { assetTrajectories }, explanation: "Generated year-wise growth curve data." };
    },
    'analytics/recoveryScenarioSimulation.wl': (args) => {
        const principal = parseFloat(args[0]) || 0;
        const docsComplete = args[1] === 'True';
        const nomineeAvailable = args[2] === 'True';
        const baseDelay = (docsComplete && nomineeAvailable) ? 30 : (docsComplete || nomineeAvailable) ? 90 : 180;
        return { moduleName: "analytics/recoveryScenarioSimulation", inputs: { principal, docsComplete, nomineeAvailable }, method: "Monte Carlo Scenario Bounds", calculation: "T = f(Docs, Nominee) * [0.8, 1.0, 1.5]", result: { fastScenario: { label: "Fast Recovery Scenario", days: Math.round(baseDelay * 0.8), valuePreserved: principal }, normalScenario: { label: "Normal Recovery Scenario", days: baseDelay, valuePreserved: principal }, delayedScenario: { label: "Delayed Recovery Scenario", days: Math.round(baseDelay * 1.5), valuePreserved: Math.round(principal * 0.98) } }, explanation: "Simulation based on provided assumptions. Simulated distinct timeline ranges." };
    },
    'analytics/portfolioIntelligence.wl': (args) => {
        const assetsList = JSON.parse(args[0]);
        let totalAssets = 0;
        assetsList.forEach(a => totalAssets += a.amount);
        const distribution = assetsList.map(a => ({ type: a.type, percentage: Math.round((a.amount / totalAssets) * 1000) / 10 }));
        return { moduleName: "analytics/portfolioIntelligence", inputs: { assetsCount: assetsList.length }, method: "Aggregation and Proportional Weighting", calculation: "Weight = (Asset Amount / Total Amount) * 100", result: { totalAssets, distribution }, explanation: "Calculated total asset valuation and determined proportional diversification." };
    },
    'intelligence/assetPriorityOptimization.wl': (args) => {
        const assetsList = JSON.parse(args[0]);
        const ranking = assetsList.map(a => {
            const urgency = a.urgency || 1;
            const docsComplete = a.docsComplete !== undefined ? a.docsComplete : true;
            const riskDelay = a.riskDelay || 1;
            const score = (a.amount / 100000) * urgency * (docsComplete ? 1.5 : 0.5) / Math.max(1, riskDelay);
            return { type: a.type, score: Math.round(score * 10) / 10, reason: docsComplete ? "High priority due to complete documentation" : "Deprioritized due to missing documentation" };
        }).sort((a, b) => b.score - a.score);
        return { moduleName: "intelligence/assetPriorityOptimization", inputs: { assetsCount: assetsList.length }, method: "Heuristic Priority Scaling", calculation: "Score = (Value/10^5) * Urgency * DocsMultiplier / Risk", result: { ranking }, explanation: "Calculated a recovery priority score." };
    },
    'intelligence/documentReadinessModel.wl': (args) => {
        const requiredDocs = JSON.parse(args[0]);
        const missingDocs = JSON.parse(args[1]);
        const assetInfoAvailable = args[2] === 'True';
        const totalDocs = requiredDocs.length;
        const missingCount = missingDocs.length;
        const readinessScore = Math.round(Math.max(0, 100 - (missingCount / Math.max(1, totalDocs) * 60) - (assetInfoAvailable ? 0 : 40)));
        const recommendation = readinessScore >= 80 ? "Documentation is highly complete. Proceed to next stage." : readinessScore >= 50 ? "Some documentation missing. Collection recommended." : "Critical documentation missing. Prioritize gathering missing items.";
        return { moduleName: "intelligence/documentReadinessModel", inputs: { requiredCount: totalDocs, missingCount, assetInfoAvailable }, method: "Algorithmic Completeness Deduction", calculation: "Score = 100 - (Missing/Total * 60) - AssetInfoPenalty", result: { readinessScore, missingItems: missingDocs, recommendation }, explanation: "Evaluated documentation completeness providing a readiness score." };
    },
    'visualization/wolframChartData.wl': (args) => {
        const principal = parseFloat(args[0]) || 0;
        const growthRate = parseFloat(args[1]) || 0;
        const inflationRate = parseFloat(args[2]) || 0;
        const maxYears = parseInt(args[3]) || 0;
        const result = [];
        for (let y = 0; y <= maxYears; y++) {
            result.push({ year: y, nominalValue: Math.round(principal * Math.pow(1+growthRate, y)), realValue: Math.round(principal * Math.pow(1+growthRate, y) / Math.pow(1+inflationRate, y)) });
        }
        return { moduleName: "visualization/wolframChartData", inputs: { principal, growthRate, inflationRate, maxYears }, method: "Discrete Data Point Generation", calculation: "Generated points mapping nominal and real value over time", result, explanation: "Generated Cartesian timeline data specifically structured for React Recharts visualization." };
    }
};

async function executeNestedScript(scriptPathRelative, argsList) {
    const scriptPath = path.join(WOLFRAM_DIR, scriptPathRelative);
    
    try {
        console.log(`[Wolfram Engine] Executing ${scriptPathRelative}...`);
        
        const argsString = argsList.map(arg => {
            if (typeof arg === 'string' && (arg.startsWith('{') || arg.startsWith('['))) {
                return `"${arg.replace(/"/g, '\\"')}"`;
            }
            return `"${arg}"`;
        }).join(' ');
        
        const command = `wolframscript -script "${scriptPath}" ${argsString}`;
        const { stdout, stderr } = await execPromise(command, { timeout: 8000 });
        
        if (stderr && stderr.trim().length > 0) {
            console.warn(`[Wolfram Engine] Warning from script: ${stderr}`);
        }

        const result = JSON.parse(stdout.trim());
        result._engine = "Wolfram Language Core";
        return result;
    } catch (error) {
        console.warn(`[Wolfram Engine] Falling back to Node.js Engine for ${scriptPathRelative}`);
        
        if (fallbacks[scriptPathRelative]) {
            const result = fallbacks[scriptPathRelative](argsList);
            result._engine = "Node.js Computational Fallback (Wolfram Model)";
            return result;
        } else {
            throw new Error(`No fallback available for ${scriptPathRelative}`);
        }
    }
}

// Named functions requested by user
const runFinancialModels = (principal, inflationRate, delayYears, growthRate) => executeNestedScript('models/advancedFinancialModels.wl', [principal, inflationRate, delayYears, growthRate]);
const runScenarioSimulation = (principal, docsComplete, nomineeAvailable) => executeNestedScript('analytics/recoveryScenarioSimulation.wl', [principal, docsComplete ? 'True' : 'False', nomineeAvailable ? 'True' : 'False']);
const runPriorityAnalysis = (assetsArray) => executeNestedScript('intelligence/assetPriorityOptimization.wl', [JSON.stringify(assetsArray)]);
const runDocumentReadiness = (requiredDocs, missingDocs, assetInfoAvailable) => executeNestedScript('intelligence/documentReadinessModel.wl', [JSON.stringify(requiredDocs), JSON.stringify(missingDocs), assetInfoAvailable ? 'True' : 'False']);

async function runFullAnalysisPipeline(assetsArray, delayYears, inflationRate, claimData) {
    const nomineeAvailable = claimData.nomineeAvailable;
    const docsComplete = claimData.documentsComplete;
    const assetClarity = claimData.assetClarity;
    
    const totalValue = assetsArray.reduce((sum, a) => sum + (a.amount || 0), 0);
    const growthRate = 0.08; // assume 8% avg growth
    
    const [
        financialModels,
        assetGrowth,
        scenarioSimulation,
        portfolioIntel,
        priorityAnalysis,
        docReadiness,
        chartData
    ] = await Promise.all([
        runFinancialModels(totalValue, inflationRate, delayYears, growthRate),
        executeNestedScript('analytics/assetGrowthAnalysis.wl', [JSON.stringify(assetsArray)]),
        runScenarioSimulation(totalValue, docsComplete, nomineeAvailable),
        executeNestedScript('analytics/portfolioIntelligence.wl', [JSON.stringify(assetsArray)]),
        runPriorityAnalysis(assetsArray),
        runDocumentReadiness(["Death Certificate", "Legal Heir Certificate", "Succession Certificate"], docsComplete ? [] : ["Succession Certificate"], assetClarity),
        executeNestedScript('visualization/wolframChartData.wl', [totalValue, growthRate, inflationRate, 10])
    ]);

    return {
        financialModel: financialModels,
        assetGrowthAnalysis: assetGrowth,
        recoverySimulation: scenarioSimulation,
        portfolioAnalysis: portfolioIntel,
        priorityOptimization: priorityAnalysis,
        documentReadiness: docReadiness,
        chartData: chartData
    };
}

module.exports = {
    runFullAnalysisPipeline,
    runFinancialModels,
    runScenarioSimulation,
    runPriorityAnalysis,
    runDocumentReadiness
};
