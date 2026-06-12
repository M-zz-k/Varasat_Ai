'use strict';

const fs         = require('fs');
const path       = require('path');
const Anthropic  = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── System prompt ────────────────────────────────────────────────────────────
const EXTRACTION_SYSTEM_PROMPT = `You are Varasat Document AI, a specialist in analysing Indian financial documents for inheritance recovery.

Analyse the provided document image or text and extract the following fields:

- person_name      : Full name of the account holder / policy holder (usually the deceased)
- institution      : Name of the bank, insurance company, or financial institution
- asset_type       : Type of asset (e.g. "Savings Account", "Fixed Deposit", "LIC Policy", "PPF", "Mutual Fund", "Shares", "NPS")
- account_number   : Account number or policy number (partial is fine; mask middle digits if full number visible)
- policy_number    : Insurance policy number if this is an insurance document
- amount           : The balance, sum assured, or maturity value. Include currency symbol ₹ if Indian Rupees.
- nominee          : Name of the nominee if mentioned anywhere in the document
- branch_address   : Branch name or address of the institution if visible
- date_of_document : Date on the document (statement date, policy date, passbook date)

Rules:
- Return ONLY a valid JSON object. No explanation, no markdown, no code fences.
- If a field is not found, return null for that field — never invent or guess values.
- Do NOT make up account numbers, amounts, or names.
- If you cannot read the document at all, return { "error": "Cannot read document" } and nothing else.

Required JSON shape:
{
  "person_name": string | null,
  "institution": string | null,
  "asset_type": string | null,
  "account_number": string | null,
  "policy_number": string | null,
  "amount": string | null,
  "nominee": string | null,
  "branch_address": string | null,
  "date_of_document": string | null
}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a file buffer to a base64 string and derive its Claude media type.
 * Claude Vision accepts: image/jpeg, image/png, image/gif, image/webp
 */
function toBase64Vision(buffer, mimetype) {
  const base64 = buffer.toString('base64');
  // Normalise mimetype (multer may give 'image/jpg' which Claude doesn't accept)
  const mediaType = mimetype === 'image/jpg' ? 'image/jpeg' : mimetype;
  return { base64, mediaType };
}

/**
 * Parse a PDF file using pdf-parse and return its text content.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function extractTextFromPDF(filePath) {
  // Lazy-require so non-PDF uploads don't pay the import cost
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const result = await pdfParse(dataBuffer);
  return result.text;
}

/**
 * Ask Claude to extract structured data from raw text (used for PDFs).
 * @param {string} text
 * @returns {Promise<Object>}
 */
async function extractFromText(text) {
  const truncated = text.slice(0, 8000); // Claude token limit safety

  const response = await client.messages.create({
    model:      'claude-3-5-sonnet-latest',
    max_tokens: 512,
    system:     EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role:    'user',
        content: `Here is the text extracted from a financial document. Please analyse it and return the JSON:\n\n${truncated}`,
      },
    ],
  });

  return parseClaudeJSON(response.content[0].text);
}

/**
 * Ask Claude Vision to extract structured data from an image.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<Object>}
 */
async function extractFromImage(buffer, mimetype) {
  const { base64, mediaType } = toBase64Vision(buffer, mimetype);

  const response = await client.messages.create({
    model:      'claude-3-5-sonnet-latest',
    max_tokens: 512,
    system:     EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type:   'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: 'Analyse this financial document image and return the JSON as instructed.',
          },
        ],
      },
    ],
  });

  return parseClaudeJSON(response.content[0].text);
}

/**
 * Safely parse Claude's JSON response.
 * Strips accidental markdown fences if present.
 */
function parseClaudeJSON(raw) {
  try {
    // Strip ```json ... ``` fences
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    console.error('[DocumentExtractor] Failed to parse Claude JSON:', raw);
    return { error: 'AI returned an unreadable response. Please try again.' };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * analyzeDocument — the main function called by the controller.
 *
 * Accepts both images (uses Claude Vision) and PDFs (text extraction → Claude).
 *
 * @param {string} filePath  - Absolute path to the saved file.
 * @param {string} mimetype  - MIME type from Multer.
 * @returns {Promise<Object>} - Structured extraction result.
 */
async function analyzeDocument(filePath, mimetype) {
  console.log(`[DocumentExtractor] Analysing: ${path.basename(filePath)} (${mimetype})`);

  const isPDF   = mimetype === 'application/pdf';
  const isImage = mimetype.startsWith('image/');

  if (isPDF) {
    const text = await extractTextFromPDF(filePath);
    if (!text || text.trim().length < 20) {
      // Scanned PDF — no selectable text; fall back to a message
      return {
        error:   'This PDF appears to be a scanned image. Please upload a JPG or PNG of the document instead for better AI analysis.',
        _scanned: true,
      };
    }
    return await extractFromText(text);
  }

  if (isImage) {
    const buffer = fs.readFileSync(filePath);
    return await extractFromImage(buffer, mimetype);
  }

  return { error: 'Unsupported file type.' };
}

// ─── Legacy exports (keep backward compat) ───────────────────────────────────
async function extractDocumentData(filePath) {
  return analyzeDocument(filePath, filePath.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
}

const DOCUMENT_SCHEMA = {
  person_name:      null,
  institution:      null,
  asset_type:       null,
  account_number:   null,
  policy_number:    null,
  amount:           null,
  nominee:          null,
  branch_address:   null,
  date_of_document: null,
};

/**
 * Ask Claude to explain the asset and the Wolfram-computed confidence score.
 */
async function generateDocumentInsight(data, confidenceScore) {
  const prompt = `A financial document for a deceased family member was uploaded.
  
Extracted Data:
- Institution: ${data.institution || 'Unknown'}
- Asset Type: ${data.asset_type || 'Unknown'}
- Amount: ${data.amount || 'Unknown'}
- Nominee: ${data.nominee || 'Unknown'}

Wolfram Language computed a confidence score of ${confidenceScore}% for this extraction.

Write a very brief, warm, 2-3 sentence explanation for the family. 
Acknowledge the asset found (if any). If the confidence is below 60%, gently suggest the document might be hard to read.
Do not use technical jargon.`;

  try {
    const response = await client.messages.create({
      model:      'claude-3-5-sonnet-latest',
      max_tokens: 200,
      system:     'You are Varasat Mitra, an empathetic inheritance assistant. Explain document findings simply.',
      messages:   [{ role: 'user', content: prompt }],
    });
    return response.content[0].text;
  } catch (error) {
    console.warn('[DocumentExtractor] Insight generation failed:', error.message);
    return `We found a possible ${data.asset_type || 'asset'} at ${data.institution || 'a financial institution'}.`;
  }
}

module.exports = { analyzeDocument, extractDocumentData, DOCUMENT_SCHEMA, generateDocumentInsight };
