'use strict';

/**
 * analyticsController.js
 *
 * POST /api/analytics/impact
 *
 * Uses pure Node.js math (financialAnalytics.js) for all computation.
 * Uses Groq (llama-3.3-70b-versatile) to explain results in plain language.
 *
 * Legacy references (kept as comments):
 * // const Anthropic = require('@anthropic-ai/sdk');
 * // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 * // Wolfram Alpha API removed — see financialAnalytics.js
 */

const { calculateAssetImpact } = require('../wolfram/financialAnalytics');
const { getGroq, isGroqConfigured } = require('../ai/aiClients');

// ─── Groq explanation prompt ──────────────────────────────────────────────────
const EXPLAINER_SYSTEM = `You are Varasat Mitra's financial explainer.

Your ONLY role is to explain pre-computed financial numbers in warm, simple, empathetic language that a non-financial person in a rural Indian family can understand.

Rules:
- Never recalculate or verify the numbers — they are already correct.
- Use simple language. No financial jargon.
- Be empathetic. The family may have lost a loved one.
- Mention that recovering the asset now is better than waiting further.
- Do NOT use bullet points. Write in flowing, conversational paragraphs.
- End with one encouraging sentence about taking action.
- 3–4 short paragraphs maximum.`;

async function generateGroqExplanation(calcResult) {
  const { input, formatted, wolfram } = calcResult;

  const prompt = `The following financial impact was computed for an unclaimed inheritance asset in India:

Original Asset Amount: ${formatted.originalAmount}
Years the Asset Remained Unclaimed: ${input.yearsDelayed} years
Annual Inflation Rate: ${input.inflationRate}

Computed Results:
- What the money could have grown to (if invested): ${formatted.futureValue}
- Purchasing Power Loss (in today's terms): ${formatted.purchasingPowerLoss}
- Percentage of value eroded by inflation: ${wolfram.purchasingPowerLossPercent}%
- Real value remaining today: ${formatted.realValueToday}
- Financial benefit of recovering NOW vs waiting one more year: ${formatted.annualRecoveryBenefit}

Please explain these results to a grieving Indian family in simple, warm, encouraging language.`;

  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    max_tokens:  512,
    temperature: 0.6,
    messages: [
      { role: 'system', content: EXPLAINER_SYSTEM },
      { role: 'user',   content: prompt },
    ],
  });

  return completion.choices[0].message.content;
}

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * POST /api/analytics/impact
 * Body: { amount: number, years: number, inflationRate?: number }
 */
async function handleImpactAnalysis(req, res) {
  try {
    const {
      amount,
      years,
      inflationRate = 0.06,  // default: 6% (RBI historical average)
    } = req.body;

    // Input validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PRINCIPAL', message: 'amount must be a positive number (e.g. 500000)', retryable: false },
      });
    }
    if (!years || typeof years !== 'number' || years <= 0 || years > 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_YEARS', message: 'years must be a positive number between 1 and 100', retryable: false },
      });
    }
    if (inflationRate <= 0 || inflationRate >= 1) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_RATE', message: 'inflationRate must be between 0 and 1 (e.g. 0.06 for 6%)', retryable: false },
      });
    }

    console.log(`[Analytics] ₹${amount}, ${years} yrs, ${(inflationRate * 100).toFixed(1)}% inflation`);

    // Step 1: Pure math computation (instant, no API)
    const calcResult = await calculateAssetImpact(amount, years, inflationRate);

    // Step 2: Groq explains the numbers in plain language (graceful degradation)
    let financial_insight = `This asset has lost approximately ${calcResult.formatted.lossPercent} of its purchasing power over ${years} years. Recovering it now will prevent further erosion and secure the family's rightful inheritance.`;

    if (isGroqConfigured()) {
      try {
        financial_insight = await generateGroqExplanation(calcResult);
      } catch (groqErr) {
        console.warn('[Analytics] Groq explanation failed, using fallback:', groqErr.message);
      }
    }

    return res.json({
      success: true,

      // Original inputs (echoed)
      original_amount: calcResult.formatted.originalAmount,
      years_delayed:   years,
      inflation_rate:  calcResult.input.inflationRate,

      // Computed financial analysis
      analysis: {
        futureValue:                calcResult.formatted.futureValue,
        purchasingPowerLoss:        calcResult.formatted.purchasingPowerLoss,
        purchasingPowerLossPercent: calcResult.wolfram.purchasingPowerLossPercent,
        realValueToday:             calcResult.formatted.realValueToday,
        annualRecoveryBenefit:      calcResult.formatted.annualRecoveryBenefit,
        engine:                     calcResult.engine,
        calculatedAt:               calcResult.calculatedAt,
      },

      // Plain-language explanation
      financial_insight,

      // Raw numbers for frontend charts
      raw:        calcResult.wolfram,
      yearlyData: calcResult.yearlyData,
    });

  } catch (error) {
    console.error('[AnalyticsController] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_SERVICE_ERROR', message: error.message || 'Financial analysis failed. Please try again.', retryable: true },
    });
  }
}

module.exports = { handleImpactAnalysis };
