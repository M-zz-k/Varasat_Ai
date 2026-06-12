'use strict';

const { calculateAssetImpact } = require('../wolfram/financialAnalytics');
const Anthropic                = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Claude explanation prompt ────────────────────────────────────────────────
// IMPORTANT: Claude does NOT perform any math here.
// Claude receives Wolfram's already-computed numbers and translates them
// into plain, empathetic language for grieving family members.

const EXPLAINER_SYSTEM = `You are Varasat Mitra's financial explainer.

Your ONLY role is to explain numbers that have already been computed by Wolfram Language — India's most trusted mathematical engine. You do NOT calculate anything yourself.

Given the Wolfram-computed financial impact of an unclaimed inheritance asset, write a warm, simple, empathetic explanation (3–4 short paragraphs) in plain English that a non-financial person in a rural Indian family can understand.

Rules:
- Never recalculate or verify the numbers — they are already correct (from Wolfram).
- Use simple language. No financial jargon.
- Be empathetic. The family may have lost a loved one.
- Mention that recovering the asset now is better than waiting further.
- Do NOT use bullet points. Write in flowing, conversational paragraphs.
- End with one encouraging sentence about taking action.`;

/**
 * generateClaudeExplanation
 *
 * Claude receives Wolfram's pre-computed numbers and explains them simply.
 * Claude does NOT perform any mathematical reasoning here.
 *
 * @param {Object} wolframResult - Output from calculateAssetImpact()
 * @returns {Promise<string>}    - Plain-language explanation
 */
async function generateClaudeExplanation(wolframResult) {
  const { input, formatted, wolfram } = wolframResult;

  const prompt = `Wolfram Language has computed the following financial impact for an unclaimed inheritance asset in India:

Original Asset Amount: ${formatted.originalAmount}
Years the Asset Remained Unclaimed: ${input.yearsDelayed} years
Annual Inflation Rate Used: ${input.inflationRate}

Wolfram Computation Results:
- What the money could have grown to (if invested): ${formatted.futureValue}
- Purchasing Power Loss (in today's terms): ${formatted.purchasingPowerLoss}
- Percentage of value eroded by inflation: ${wolfram.purchasingPowerLossPercent}%
- Real value remaining today: ${formatted.realValueToday}
- Financial benefit of recovering it NOW vs waiting one more year: ${formatted.annualRecoveryBenefit}

Please explain these Wolfram-computed results to a grieving Indian family in simple, warm, encouraging language.`;

  const response = await client.messages.create({
    model:      'claude-opus-4-5',
    max_tokens: 512,
    system:     EXPLAINER_SYSTEM,
    messages:   [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * POST /api/analytics/impact
 *
 * Flow:
 *   1. Validate input
 *   2. Wolfram computes all financial metrics (4 parallel calls)
 *   3. Claude explains the results in plain language
 *   4. Return combined response
 *
 * Body: { amount, years, inflationRate? }
 */
async function handleImpactAnalysis(req, res) {
  try {
    const {
      amount,
      years,
      inflationRate = 0.06,   // default: 6% (RBI historical average)
    } = req.body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error:   'amount must be a positive number (e.g. 500000)',
      });
    }
    if (!years || typeof years !== 'number' || years <= 0 || years > 100) {
      return res.status(400).json({
        success: false,
        error:   'years must be a positive number between 1 and 100',
      });
    }
    if (inflationRate <= 0 || inflationRate >= 1) {
      return res.status(400).json({
        success: false,
        error:   'inflationRate must be between 0 and 1 (e.g. 0.06 for 6%)',
      });
    }

    console.log(`[Analytics] Request: ₹${amount}, ${years}yrs, ${inflationRate * 100}% inflation`);

    // ── Step 1: Wolfram computes everything ─────────────────────────────────
    const wolframResult = await calculateAssetImpact(amount, years, inflationRate);

    // ── Step 2: Claude explains Wolfram's numbers ───────────────────────────
    let insight = '';
    try {
      insight = await generateClaudeExplanation(wolframResult);
    } catch (claudeErr) {
      // If Claude fails, we still return Wolfram data
      console.warn('[Analytics] Claude explanation failed:', claudeErr.message);
      insight = `This asset has lost approximately ${wolframResult.formatted.lossPercent} of its purchasing power over ${years} years. Recovering it now prevents further erosion.`;
    }

    // ── Response ────────────────────────────────────────────────────────────
    return res.json({
      success: true,

      // Original inputs (echoed)
      original_amount: wolframResult.formatted.originalAmount,
      years_delayed:   years,
      inflation_rate:  wolframResult.input.inflationRate,

      // Wolfram-computed financial analysis
      analysis: {
        futureValue:              wolframResult.formatted.futureValue,
        purchasingPowerLoss:      wolframResult.formatted.purchasingPowerLoss,
        purchasingPowerLossPercent: wolframResult.wolfram.purchasingPowerLossPercent,
        realValueToday:           wolframResult.formatted.realValueToday,
        annualRecoveryBenefit:    wolframResult.formatted.annualRecoveryBenefit,
        engine:                   wolframResult.engine,
        calculatedAt:             wolframResult.calculatedAt,
      },

      // Claude's plain-language explanation of Wolfram's numbers
      financial_insight: insight,

      // Raw Wolfram numbers for frontend charts/display
      raw: wolframResult.wolfram,
    });

  } catch (error) {
    console.error('[AnalyticsController] Error:', error.message);

    // Handle Wolfram API key not configured
    if (error.message.includes('WOLFRAM_APP_ID')) {
      return res.status(503).json({
        success: false,
        error:   'Wolfram analytics engine is not configured. Please add WOLFRAM_APP_ID to .env',
        hint:    'Get a free API key at: https://developer.wolframalpha.com/portal/myapps',
      });
    }

    return res.status(500).json({
      success: false,
      error:   error.message || 'Financial analysis failed. Please try again.',
    });
  }
}

module.exports = { handleImpactAnalysis };
