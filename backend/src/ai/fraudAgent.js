'use strict';

/**
 * fraudAgent.js
 *
 * Varasat Fraud Detection AI
 *
 * Architecture:
 *   1. Wolfram Language calculates risk scores (name similarity, completeness, weighted risk)
 *   2. Claude AI reasons about the anomalies and explains them in plain language
 *
 * Claude does NOT calculate numbers.
 * Wolfram does NOT write explanations.
 * Each engine does what it is best at.
 */

const Anthropic             = require('@anthropic-ai/sdk');
const { calculateFraudRisk } = require('../wolfram/riskCalculator');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Claude fraud reasoning prompt ───────────────────────────────────────────

const FRAUD_SYSTEM = `You are Varasat's Fraud Detection AI — a document verification specialist for Indian inheritance claims.

Wolfram Language has already computed numerical risk scores. Your job is to:
1. Reason about the specific mismatches found in the documents
2. Explain why each mismatch could be concerning OR harmless
3. Give a clear recommendation

You do NOT recalculate numbers. You interpret them.

Output format — return ONLY a valid JSON object with this exact shape:
{
  "issues": [
    {
      "type": "name_mismatch | date_discrepancy | amount_discrepancy | document_missing | identity_conflict",
      "severity": "Critical | Medium | Minor",
      "description": "Plain English description of the issue",
      "likelyCause": "Possible innocent explanation OR red flag",
      "recommendation": "What the family should do"
    }
  ],
  "summary": "Overall 2-3 sentence plain language summary for the family",
  "immediateAction": "The single most important thing to do right now"
}

Rules:
- Be empathetic. The family is grieving. Avoid accusatory language.
- Distinguish between clerical errors (harmless) and genuine fraud risk.
- Name spellings can differ across old Indian documents — acknowledge this.
- Always suggest official verification steps, never personal accusations.
- Return ONLY the JSON. No markdown. No code fences.`;

// ─── Field extraction helpers ─────────────────────────────────────────────────

/**
 * Count non-null fields in an extracted document object.
 */
function countPresentFields(doc) {
  if (!doc || typeof doc !== 'object') return 0;
  return Object.values(doc).filter(v => v !== null && v !== undefined && v !== '').length;
}

/**
 * Classify mismatches from a comparison array.
 */
function classifyMismatches(mismatches) {
  let critical = 0, medium = 0, minor = 0;

  for (const m of mismatches) {
    if (m.severity === 'Critical') critical++;
    else if (m.severity === 'Medium') medium++;
    else minor++;
  }
  return { critical, medium, minor };
}

// ─── Main exported function ───────────────────────────────────────────────────

/**
 * checkFraud
 *
 * Compares documents and runs the Wolfram + Claude fraud detection pipeline.
 *
 * @param {Object} params
 * @param {Object} params.primaryDoc     - Death certificate / identity document fields
 * @param {Array}  params.assetDocs      - Array of extracted asset document fields
 * @param {string} params.deceasedName   - Expected name of deceased
 *
 * @returns {Promise<{
 *   riskLevel, riskScore, confidence,
 *   issues, summary, immediateAction,
 *   wolfram, engine
 * }>}
 */
async function checkFraud({ primaryDoc = {}, assetDocs = [], deceasedName = '' }) {
  console.log('[FraudAgent] Starting fraud detection analysis…');

  // ── Step 1: Build mismatches list ─────────────────────────────────────────
  const mismatches = [];
  const assetNames = [];

  for (const doc of assetDocs) {
    if (!doc) continue;

    const docName = doc.person_name || doc.personName || '';
    if (docName) assetNames.push(docName);

    // Name mismatch check
    if (deceasedName && docName && normalise(docName) !== normalise(deceasedName)) {
      mismatches.push({
        field:    'person_name',
        severity: 'Critical',
        expected: deceasedName,
        found:    docName,
        docType:  doc.asset_type || doc.assetType || 'Asset Document',
        note:     `Death certificate name "${deceasedName}" vs document name "${docName}"`,
      });
    }

    // Amount anomaly: zero or implausible amount
    const amount = parseFloat(String(doc.amount || '0').replace(/[₹,\s]/g, ''));
    if (doc.amount && (amount === 0 || amount < 0)) {
      mismatches.push({
        field:    'amount',
        severity: 'Medium',
        expected: 'Positive amount',
        found:    String(doc.amount),
        docType:  doc.asset_type || 'Asset Document',
        note:     'Amount value is zero or negative — document may be incomplete.',
      });
    }

    // Missing critical fields
    if (!doc.institution && !doc.institution) {
      mismatches.push({
        field:    'institution',
        severity: 'Minor',
        expected: 'Institution name',
        found:    'null',
        docType:  doc.asset_type || 'Document',
        note:     'Institution name could not be extracted.',
      });
    }
  }

  // ── Step 2: Wolfram calculates risk scores ────────────────────────────────
  const { critical, medium, minor } = classifyMismatches(mismatches);
  const totalFields   = 8; // person_name, institution, asset_type, account_number, amount, nominee, branch, date
  const presentFields = Math.max(0, countPresentFields(assetDocs[0] || {}) - mismatches.filter(m => m.severity === 'Critical').length);
  const missingDocs   = Math.max(0, 3 - assetDocs.length); // expect at least 3 docs

  // Wolfram computes: risk score, name similarity, completeness, composite confidence
  const nameB = assetNames[0] || '';
  const wolframResult = await calculateFraudRisk({
    nameA:              deceasedName,
    nameB,
    criticalMismatches: critical,
    mediumMismatches:   medium,
    minorMismatches:    minor,
    presentFields,
    totalFields,
    missingDocs,
    totalExpectedDocs:  3,
  });

  // ── Step 3: Claude reasons about the mismatches ───────────────────────────
  let claudeResult = { issues: [], summary: '', immediateAction: '' };

  const claudePrompt = `You are reviewing inheritance documents for the deceased person: "${deceasedName}".

Wolfram Language computed these risk scores:
- Risk Score: ${wolframResult.riskScore}/100
- Risk Level: ${wolframResult.riskLevel}
- Name Similarity (deceased vs asset doc): ${wolframResult.nameSimilarity}%
- Document Completeness: ${wolframResult.documentCompleteness}%
- Fraud Confidence: ${wolframResult.compositeConfidence}%

Mismatches detected (${mismatches.length} total):
${mismatches.length > 0
    ? mismatches.map((m, i) => `${i + 1}. [${m.severity}] ${m.note} (in: ${m.docType})`).join('\n')
    : 'No direct mismatches found. Documents appear consistent.'}

Asset documents provided: ${assetDocs.length}
Names found in asset documents: ${assetNames.join(', ') || 'None'}

Analyse these findings and return the JSON response.`;

  try {
    const response = await client.messages.create({
      model:    'claude-opus-4-5',
      max_tokens: 800,
      system:   FRAUD_SYSTEM,
      messages: [{ role: 'user', content: claudePrompt }],
    });

    const raw = response.content[0].text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    claudeResult = JSON.parse(raw);
  } catch (err) {
    console.warn('[FraudAgent] Claude parse failed:', err.message);
    claudeResult = {
      issues: mismatches.map(m => ({
        type:           'document_mismatch',
        severity:       m.severity,
        description:    m.note,
        likelyCause:    'Could be a clerical difference or genuinely different person.',
        recommendation: 'Obtain certified copies from the relevant institution and compare.',
      })),
      summary:         `${mismatches.length} potential issue(s) found. Wolfram computed a ${wolframResult.riskLevel} risk level.`,
      immediateAction: 'Consult a qualified legal advisor before proceeding with the claim.',
    };
  }

  // ── Final response ────────────────────────────────────────────────────────
  return {
    success:         true,
    riskLevel:       wolframResult.riskLevel,
    riskScore:       wolframResult.riskScore,
    confidence:      wolframResult.compositeConfidence,
    nameSimilarity:  wolframResult.nameSimilarity,
    issues:          claudeResult.issues         || [],
    summary:         claudeResult.summary        || '',
    immediateAction: claudeResult.immediateAction || '',
    wolfram: {
      riskScore:            wolframResult.riskScore,
      nameSimilarity:       wolframResult.nameSimilarity,
      documentCompleteness: wolframResult.documentCompleteness,
      compositeConfidence:  wolframResult.compositeConfidence,
      engine:               wolframResult.engine,
    },
    mismatches,
    analysedAt: new Date().toISOString(),
  };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function normalise(name) {
  return name?.toLowerCase().replace(/[^a-z\s]/g, '').trim() || '';
}

module.exports = { checkFraud };
