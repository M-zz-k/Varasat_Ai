'use strict';

const path               = require('path');
const { analyzeDocument, generateDocumentInsight } = require('../ai/documentExtractor');
const { calculateConfidence, analyzeAssetValue } = require('../wolfram/assetAnalyzer');
const { generateLegalDocument } = require('../ai/legalDocumentGenerator');
const { createPDF } = require('../utils/pdfGenerator');

// ─── POST /api/document/upload  (existing — basic save) ──────────────────────
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

// ─── POST /api/document/analyze  (new — AI extraction) ───────────────────────
/**
 * Accepts a multipart file (field: "file"), runs Claude AI analysis,
 * and returns structured asset data.
 *
 * Response shape:
 * {
 *   success:     true | false,
 *   asset_found: true | false,
 *   data: {
 *     person_name, institution, asset_type, account_number,
 *     policy_number, amount, nominee, branch_address,
 *     date_of_document, confidence_score
 *   },
 *   file: { originalName, size, type, url }
 * }
 */
async function handleAnalyze(req, res) {
  try {
    // ── Validate file ────────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success:     false,
        asset_found: false,
        error:       'No file uploaded. Please attach a PDF, JPG, or PNG document.',
      });
    }

    const { originalname, filename, size, mimetype, path: filePath } = req.file;
    console.log(`[Analyze] Received: ${originalname} (${mimetype}, ${(size / 1024).toFixed(1)} KB)`);

    // ── Run AI extraction ────────────────────────────────────────────────────
    const extracted = await analyzeDocument(filePath, mimetype);

    // ── Handle AI-level errors ───────────────────────────────────────────────
    if (extracted.error) {
      return res.status(422).json({
        success:     false,
        asset_found: false,
        error:       extracted.error,
        file: {
          originalName: originalname,
          savedAs:      filename,
          size:         `${(size / 1024).toFixed(1)} KB`,
          type:         mimetype,
          url:          `/uploads/${filename}`,
        },
      });
    }

    // ── Decide if an asset was found ─────────────────────────────────────────
    // We consider an asset "found" if at least institution or asset_type is present
    const assetFound =
      !!(extracted.institution || extracted.asset_type || extracted.amount);

    let confidenceScore = 0;
    let realValueToday = 0;
    let financialInsight = '';

    if (assetFound) {
      // ── Step 3: Wolfram Analysis ─────────────────────────────────────────────
      // We delegate numerical and completeness scoring strictly to Wolfram
      confidenceScore = await calculateConfidence(extracted);
      realValueToday = await analyzeAssetValue(extracted.amount);
      
      // Inject Wolfram-computed data back into the result
      extracted.confidence_score = confidenceScore;
      extracted.real_value_today = realValueToday;

      // ── Step 4: AI Insight Generation ────────────────────────────────────────
      financialInsight = await generateDocumentInsight(extracted, confidenceScore);
    }

    return res.json({
      success:          true,
      assetFound:       assetFound,
      data:             extracted,
      financialInsight: financialInsight,
      file: {
        originalName: originalname,
        savedAs:      filename,
        size:         `${(size / 1024).toFixed(1)} KB`,
        type:         mimetype,
        url:          `/uploads/${filename}`,
      },
    });
  } catch (error) {
    console.error('[DocumentController] Analyze error:', error.message);

    // Distinguish API key errors
    if (error.status === 401 || (error.message && error.message.includes('API key'))) {
      return res.status(500).json({
        success:     false,
        asset_found: false,
        error:       'AI service is misconfigured. Please check your ANTHROPIC_API_KEY.',
      });
    }

    return res.status(500).json({
      success:     false,
      assetFound:  false,
      error:       'AI analysis failed. Please try again or use a clearer image.',
    });
  }
}

// ─── POST /api/document/generate-pdf (new — AI to PDF stream) ────────────────
/**
 * Accepts document requirements, generates structured text via Claude,
 * and streams a formatted PDF directly to the client.
 */
async function handleGeneratePDF(req, res) {
  try {
    const { documentType, claimData } = req.body;

    if (!documentType || !claimData) {
      return res.status(400).json({ error: 'documentType and claimData are required' });
    }

    console.log(`[DocumentController] Generating ${documentType} for ${claimData.claimantName}`);

    // 1. Generate structured legal text using Claude
    const aiContent = await generateLegalDocument(documentType, claimData);

    // 2. Stream the PDF directly back to the client
    const safeType = documentType.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Varasat_${safeType}.pdf`;
    
    // We do NOT return res.json() here because createPDF streams to res directly
    await createPDF(aiContent, claimData, res, filename);

  } catch (error) {
    console.error('[DocumentController] Generate PDF error:', error.message);
    
    // If headers are already sent, we can't send a JSON error
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF document.' });
    } else {
      res.end(); // Terminate the broken stream
    }
  }
}

module.exports = { handleUpload, handleAnalyze, handleGeneratePDF };
