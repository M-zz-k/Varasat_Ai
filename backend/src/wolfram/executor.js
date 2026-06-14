'use strict';

const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Path to the wolfram scripts directory
const WOLFRAM_DIR = path.resolve(__dirname, '../../../../wolfram');

/**
 * Node.js fallback implementations to ensure the app doesn't crash 
 * if wolframscript isn't installed in the demo environment.
 */
const fallbacks = {
    'financialModels.wl': (data) => {
        const amount = data.amount || 0;
        const inflationRate = data.inflationRate || 0.06;
        const delayYears = data.delayYears || 0;
        const fv = amount * Math.pow(1 + inflationRate, delayYears);
        const marketRet = amount * Math.pow(1 + 0.08, delayYears);
        return {
            futureValue: Math.round(fv),
            purchasingPowerImpact: Math.round(fv - amount),
            realValueToday: Math.round(amount / Math.pow(1 + inflationRate, delayYears)),
            marketOpportunityLoss: Math.round(marketRet - amount),
            analysis: `Node fallback: Simulated financial trajectory over ${delayYears} years. Opportunity cost is high.`
        };
    },
    'assetScoring.wl': (data) => {
        const amount = data.amount || 0;
        const docCompleteness = data.docCompleteness || 0;
        const nomineeAvailable = data.nomineeAvailable || false;
        const delayYears = data.delayYears || 0;
        
        let score = docCompleteness * 40;
        if (nomineeAvailable) score += 30;
        score += Math.min(amount / 500000, 1) * 20;
        score -= Math.min(delayYears * 1.5, 10);
        
        const finalScore = Math.max(0, Math.min(100, Math.round(score)));
        return {
            priorityScore: finalScore,
            risk: finalScore >= 80 ? "Low" : finalScore >= 50 ? "Medium" : "High",
            reason: nomineeAvailable && docCompleteness > 0.8 ? "Nominee available and documents complete" : "Missing critical documents or nominee"
        };
    },
    'riskAnalysis.wl': (data) => {
        const missingDocs = data.missingDocs || 0;
        const noNominee = data.noNominee || false;
        const amount = data.amount || 0;
        const delayYears = data.delayYears || 0;

        let riskScore = 0;
        if (missingDocs > 0) riskScore += missingDocs * 15;
        if (noNominee) riskScore += 35;
        if (amount > 1000000) riskScore += 10;
        if (delayYears > 5) riskScore += (delayYears - 5) * 2;
        
        const finalRiskScore = Math.max(0, Math.min(100, riskScore));
        let riskLevel = finalRiskScore < 30 ? "Low" : finalRiskScore < 60 ? "Medium" : "High";
        
        let factors = [];
        if (missingDocs > 0) factors.push(`${missingDocs} missing documents`);
        if (noNominee) factors.push("No registered nominee");
        if (amount > 1000000) factors.push("High asset value (scrutiny)");
        if (delayYears > 5) factors.push(`Long delay (${delayYears} years)`);

        return {
            riskLevel,
            riskScore: finalRiskScore,
            factors
        };
    },
    'recoveryPrediction.wl': (data) => {
        const type = data.assetType || "Bank Account";
        const hasNominee = data.hasNominee || false;
        const delayYears = data.delayYears || 0;
        const isDisputed = data.isDisputed || false;

        let base = type === "Real Estate" ? 180 : type === "Insurance" ? 60 : type === "Mutual Fund" ? 45 : 30;
        let mult = 1.0;
        if (!hasNominee) mult *= 2.5;
        if (delayYears > 10) mult *= 1.5;
        if (isDisputed) mult *= 3.0;

        const estDays = Math.round(base * mult);
        return {
            estimatedDays: estDays,
            estimatedMonths: Math.round((estDays / 30) * 10) / 10,
            timeline: estDays <= 90 ? "Short" : estDays <= 180 ? "Medium" : "Long",
            analysis: "Node fallback: Timeline computed using baseline multipliers."
        };
    }
};

/**
 * Execute a Wolfram Language script.
 * Falls back to Node.js equivalent if wolframscript isn't installed.
 */
async function executeWolframScript(scriptName, argsObject) {
    const scriptPath = path.join(WOLFRAM_DIR, scriptName);
    const jsonString = JSON.stringify(argsObject);
    
    // Command wraps JSON in single quotes, so we need to escape them if necessary.
    // For Windows compatibility, sometimes double quotes are better, but wolframscript
    // handles strings better if we just pass it as an argument correctly.
    // We'll use cross-platform safe argument passing.
    
    try {
        console.log(`[Wolfram Engine] Executing ${scriptName}...`);
        // Escaping for windows powershell/cmd is tricky, better to try/catch
        const command = `wolframscript -script "${scriptPath}" "${jsonString.replace(/"/g, '\\"')}"`;
        
        const { stdout, stderr } = await execPromise(command, { timeout: 5000 });
        
        if (stderr && stderr.trim().length > 0) {
            console.warn(`[Wolfram Engine] Warning from script: ${stderr}`);
        }

        const result = JSON.parse(stdout.trim());
        result._engine = "Wolfram Language";
        return result;
    } catch (error) {
        console.warn(`[Wolfram Engine] wolframscript failed or not installed. Falling back to Node.js engine for ${scriptName}`);
        
        if (fallbacks[scriptName]) {
            const result = fallbacks[scriptName](argsObject);
            result._engine = "Node.js Fallback Engine (Wolfram Math)";
            return result;
        } else {
            throw new Error(`No fallback available for ${scriptName}`);
        }
    }
}

module.exports = {
    executeWolframScript
};
