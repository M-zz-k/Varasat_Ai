'use strict';

const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Path to the new dedicated wolfram scripts directory
const WOLFRAM_DIR = path.resolve(__dirname, '../../../wolfram');

/**
 * Node.js fallback implementations to ensure the app doesn't crash 
 * if wolframscript isn't installed in the demo environment.
 */
const fallbacks = {
    'assetValuation.wl': (args) => {
        // [principal, inflationRate, years]
        const principal = parseFloat(args[0]) || 0;
        const inflationRate = parseFloat(args[1]) || 0.06;
        const years = parseFloat(args[2]) || 0;
        
        const fv = principal; // assuming 0% growth
        const futureReal = principal / Math.pow(1 + inflationRate, years);
        const impactLoss = fv - futureReal;
        
        return {
            futureValue: Math.round(fv),
            impact: Math.round(impactLoss),
            explanation: `Dormant assets lose real purchasing power due to inflation compounding over ${years} years.`
        };
    },
    'claimRiskModel.wl': (args) => {
        // [assetValue, docsComplete, nomineeAvailable, delayYears]
        const assetValue = parseFloat(args[0]) || 0;
        const docsComplete = args[1] === 'True';
        const nomineeAvailable = args[2] === 'True';
        const delayYears = parseFloat(args[3]) || 0;
        
        let deductions = 0;
        if (!docsComplete) deductions += 35;
        if (!nomineeAvailable) deductions += 40;
        deductions += Math.min(delayYears * 2, 20);
        if (assetValue > 1000000 && !nomineeAvailable) deductions += 10;
        
        const score = Math.max(0, 100 - deductions);
        const riskLevel = score >= 80 ? "Low" : score >= 50 ? "Medium" : "High";
        const reason = "Risk score computed. " + 
          (!nomineeAvailable ? "Absence of nominee increases legal complexity. " : "") +
          (!docsComplete ? "Missing documents require affidavit preparation. " : "");
          
        return { score: Math.round(score), riskLevel, reason };
    },
    'recoverySimulation.wl': (args) => {
        // [nomineeAvailable, docsComplete]
        const nomineeAvailable = args[0] === 'True';
        const docsComplete = args[1] === 'True';
        
        let baseTime = nomineeAvailable && docsComplete ? 30 : nomineeAvailable ? 60 : docsComplete ? 120 : 180;
        
        return {
            fastRecoveryDays: Math.round(baseTime * 0.85),
            normalRecoveryDays: baseTime,
            delayedRecoveryDays: Math.round(baseTime * 1.35)
        };
    },
    'portfolioAnalysis.wl': (args) => {
        // [jsonInput]
        const assetsList = JSON.parse(args[0]);
        if (assetsList.length === 0) return { totalValue: 0, distribution: [], growthComparison: [] };
        
        let totalValue = 0;
        assetsList.forEach(a => totalValue += a.amount);
        
        const distribution = assetsList.map(a => ({
            type: a.type,
            amount: a.amount,
            percentage: Math.round((a.amount / totalValue) * 1000) / 10
        }));
        
        const growthComparison = assetsList.map(a => {
            const rate = a.type === 'Bank' ? 0.06 : a.type === 'Insurance' ? 0.05 : a.type === 'Mutual Funds' ? 0.12 : 0.07;
            return {
                type: a.type,
                estimated10YrGrowth: Math.round(a.amount * Math.pow(1 + rate, 10) - a.amount)
            };
        });
        
        return { totalValue: Math.round(totalValue), distribution, growthComparison };
    },
    'eligibilityEngine.wl': (args) => {
        // [nomineeAvailable, amount, docsComplete]
        const nomineeAvailable = args[0] === 'True';
        const amount = parseFloat(args[1]) || 0;
        const docsComplete = args[2] === 'True';
        
        let score = 0;
        if (nomineeAvailable) score += 50;
        if (amount < 500000) score += 20;
        if (docsComplete) score += 30;
        
        const fastTrackProbability = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";
        
        return { eligibilityScore: score, fastTrackProbability };
    }
};

/**
 * Execute a Wolfram Language script.
 */
async function executeWolframScript(scriptName, argsList) {
    const scriptPath = path.join(WOLFRAM_DIR, scriptName);
    
    try {
        console.log(`[Wolfram Engine] Executing ${scriptName}...`);
        
        // Build arguments string: "arg1" "arg2"
        const argsString = argsList.map(arg => {
            if (typeof arg === 'string' && (arg.startsWith('{') || arg.startsWith('['))) {
                // escape quotes for JSON string argument
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
        result._engine = "Wolfram Language";
        return result;
    } catch (error) {
        console.warn(`[Wolfram Engine] wolframscript failed or not installed. Falling back to Node.js engine for ${scriptName}`);
        
        if (fallbacks[scriptName]) {
            const result = fallbacks[scriptName](argsList);
            result._engine = "Node.js Fallback Engine (Wolfram Math)";
            return result;
        } else {
            throw new Error(`No fallback available for ${scriptName}`);
        }
    }
}

/**
 * Core Service exposing individual functions
 */
async function runFinancialAnalysis(assetAmount, inflationRate, yearsDelayed) {
    return executeWolframScript('assetValuation.wl', [assetAmount, inflationRate, yearsDelayed]);
}

async function runRiskAnalysis(assetValue, documentCompleteness, nomineeAvailable, delayYears) {
    return executeWolframScript('claimRiskModel.wl', [
        assetValue, 
        documentCompleteness ? 'True' : 'False', 
        nomineeAvailable ? 'True' : 'False', 
        delayYears
    ]);
}

async function runRecoverySimulation(nomineeAvailable, documentCompleteness) {
    return executeWolframScript('recoverySimulation.wl', [
        nomineeAvailable ? 'True' : 'False', 
        documentCompleteness ? 'True' : 'False'
    ]);
}

async function runPortfolioAnalysis(assetsArray) {
    return executeWolframScript('portfolioAnalysis.wl', [JSON.stringify(assetsArray)]);
}

async function runEligibilityCheck(nomineeAvailable, assetValue, documentCompleteness) {
    return executeWolframScript('eligibilityEngine.wl', [
        nomineeAvailable ? 'True' : 'False', 
        assetValue, 
        documentCompleteness ? 'True' : 'False'
    ]);
}

module.exports = {
    runFinancialAnalysis,
    runRiskAnalysis,
    runRecoverySimulation,
    runPortfolioAnalysis,
    runEligibilityCheck
};
