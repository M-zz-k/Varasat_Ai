'use strict';

/**
 * documentController.js
 *
 * All Claude/Anthropic references removed.
 * - OCR: Google Gemini 2.0 Flash (via documentExtractor.js)
 * - PDF: pdfkit (via pdfGenerator.js)
 * - Confidence / value scoring: pure Node.js math (assetAnalyzer.js)
 */

const { analyzeDocument, generateDocumentInsight } = require('../ai/documentExtractor');
const { calculateConfidence, analyzeAssetValue }   = require('../wolfram/assetAnalyzer');
const { generateLegalDocument }                    = require('../ai/legalDocumentGenerator');
const { createPDF }                                = require('../utils/pdfGenerator');
const fs = require('fs').promises;

// ─── POST /api/document/upload ────────────────────────────────────────────────
async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error:   'No file uploaded. Please attach a PDF or image.',
      });
    }

    const { originalname, filename, size, mimetype } = req.file;

    return res.json({
      success: true,
      message: 'File uploaded successfully.',
      file: {
        originalName: originalname,
        savedAs:      filename,
        size:         `${(size / 1024).toFixed(1)} KB`,
        type:         mimetype,
        url:          `/uploads/${filename}`,
      },
    });
  } catch (error) {
    console.error('[DocumentController] Upload error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ─── POST /api/document/analyze ───────────────────────────────────────────────
async function handleAnalyze(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success:     false,
        asset_found: false,
        error:       'No file uploaded. Please attach a PDF, JPG, or PNG document.',
      });
    }

    const { originalname, filename, size, mimetype, path: filePath } = req.file;
    console.log(`[Analyze] ${originalname} (${mimetype}, ${(size / 1024).toFixed(1)} KB)`);

    // Step 1: Gemini OCR extraction
    const extracted = await analyzeDocument(filePath, mimetype);

    if (extracted.error) {
      return res.status(422).json({
        success:     false,
        asset_found: false,
        error:       extracted.error,
        file: { originalName: originalname, savedAs: filename, size: `${(size / 1024).toFixed(1)} KB`, type: mimetype, url: `/uploads/${filename}` },
      });
    }

    const assetFound = !!(extracted.institution || extracted.asset_type || extracted.amount);

    let confidenceScore  = 0;
    let realValueToday   = 0;
    let financialInsight = '';

    if (assetFound) {
      // Step 2: Wolfram Financial Computation
      confidenceScore  = await calculateConfidence(extracted);
      
      const parsedAmount = parseFloat((extracted.amount || '0').replace(/,/g, ''));
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        try {
          const { runFinancialModels } = require('../wolfram/wolframEngineService');
          const wolframData = await runFinancialModels(parsedAmount, 0.06, 8, 0.08); // 8 years dormancy as default example
          
          realValueToday = parsedAmount - wolframData.result.inflationImpact;
          
          // Step 3: Format Wolfram Insight directly
          financialInsight = `[Wolfram Financial Insight - Verified Mathematical Calculation]
Original amount: ₹${parsedAmount.toLocaleString('en-IN')}
Dormancy period: 8 years

Wolfram calculates:
• Inflation-adjusted purchasing power loss: ₹${wolframData.result.inflationImpact.toLocaleString('en-IN')}
• Missed interest / Opportunity loss: ₹${wolframData.result.opportunityCost?.toLocaleString('en-IN') || wolframData.result.delayedRecoveryCost?.toLocaleString('en-IN')}
• Estimated current value: ₹${realValueToday.toLocaleString('en-IN')}

Asset Value Projection:
• After 5 years: ₹${Math.round(realValueToday * Math.pow(1.08, 5)).toLocaleString('en-IN')}
• After 10 years: ₹${Math.round(realValueToday * Math.pow(1.08, 10)).toLocaleString('en-IN')}

Delay Impact Calculator: Waiting 3 more years may reduce effective financial value by ₹${Math.round(parsedAmount * Math.pow(1.06, 11) - parsedAmount * Math.pow(1.06, 8)).toLocaleString('en-IN')}

Calculated using:
✓ Asset amount
✓ Time duration
✓ Inflation assumptions
✓ Interest model`;
        } catch (e) {
          console.warn('[Wolfram] Error calculating insight:', e);
          realValueToday = await analyzeAssetValue(extracted.amount);
          financialInsight = await generateDocumentInsight(extracted, confidenceScore);
        }
      } else {
        financialInsight = await generateDocumentInsight(extracted, confidenceScore);
      }
      
      extracted.confidence_score = confidenceScore;
      extracted.real_value_today = realValueToday;
    }

    return res.json({
      success:          true,
      assetFound,
      data:             extracted,
      financialInsight,
      file: { originalName: originalname, savedAs: filename, size: `${(size / 1024).toFixed(1)} KB`, type: mimetype, url: `/uploads/${filename}` },
    });

  } catch (error) {
    console.error('[DocumentController] Analyze error:', error.message);
    return res.status(500).json({
      success:    false,
      assetFound: false,
      error: { code: 'AI_SERVICE_ERROR', message: 'AI analysis failed. Please try again or use a clearer image.', retryable: true },
    });
  } finally {
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
        console.log(`[Security] Automatically deleted extracted file: ${req.file.path}`);
      } catch (err) {
        console.error(`[Security] Failed to delete extracted file: ${req.file.path}`, err.message);
      }
    }
  }
}

// ─── POST /api/document/generate-pdf ─────────────────────────────────────────
async function handleGeneratePDF(req, res) {
  try {
    const { documentType, claimData } = req.body;

    if (!documentType || !claimData) {
      return res.status(400).json({ error: 'documentType and claimData are required.' });
    }

    console.log(`[DocumentController] Generating ${documentType} for ${claimData.claimantName}`);

    // Step 1: Groq generates structured legal text
    const aiContent = await generateLegalDocument(documentType, claimData);

    // Step 2: pdfkit streams the PDF to the client
    const safeType = documentType.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Varasat_${safeType}.pdf`;

    await createPDF(aiContent, claimData, res, filename);

  } catch (error) {
    console.error('[DocumentController] Generate PDF error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF document.' });
    } else {
      res.end();
    }
  }
}

module.exports = { handleUpload, handleAnalyze, handleGeneratePDF };
