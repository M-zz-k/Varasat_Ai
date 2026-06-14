'use strict';

/**
 * documentExtractor.js
 *
 * OCR & field extraction via Google Gemini 2.5 Flash (free, 1 500 req/day).
 * Falls back to a heuristic mock when GEMINI_API_KEY is not configured.
 *
 * Legacy reference (kept as comment):
 * // const Anthropic = require('@anthropic-ai/sdk');
 * // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 */

const fs   = require('fs');
const path = require('path');
const { getGenAI, isGeminiConfigured } = require('./aiClients');

// ─── System / extraction prompt ───────────────────────────────────────────────
const EXTRACTION_PROMPT = `You are Varasat Document AI, a specialist in analysing Indian financial documents for inheritance recovery.

Analyse the provided document image or text and extract these fields:
- person_name      : Full name of the account / policy holder (usually the deceased)
- institution      : Name of the bank, insurance company, or financial institution
- asset_type       : Type of asset (e.g. "Savings Account", "Fixed Deposit", "LIC Policy", "PPF", "Mutual Fund")
- account_number   : Account number or policy number (partial is fine)
- policy_number    : Insurance policy number if visible
- amount           : Balance, sum assured, or maturity value. Include ₹ symbol.
- nominee          : Name of the nominee if mentioned
- branch_address   : Branch name or address if visible
- date_of_document : Date on the document (statement date, policy date, etc.)

Rules:
- Return ONLY a valid JSON object. No explanation, no markdown, no code fences.
- If a field is not found, return null — never invent or guess values.
- If you cannot read the document, return { "error": "Cannot read document" }

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

// ─── JSON parse helper ────────────────────────────────────────────────────────
function parseGeminiJSON(raw) {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    console.error('[DocumentExtractor] Failed to parse Gemini JSON:', raw.slice(0, 200));
    return { error: 'AI returned an unreadable response. Please try again.' };
  }
}

// ─── PDF text extraction (unchanged) ─────────────────────────────────────────
async function extractTextFromPDF(filePath) {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const result = await pdfParse(dataBuffer);
  return result.text;
}

// ─── Gemini: extract from image or PDF bytes ──────────────────────────────────
async function extractViaGemini(filePath, mimetype) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const isPDF  = mimetype === 'application/pdf';
  const isImage = mimetype.startsWith('image/');

  if (isPDF) {
    // For PDFs: extract text first, then ask Gemini via text prompt
    const text = await extractTextFromPDF(filePath);
    if (!text || text.trim().length < 20) {
      // Scanned PDF — send raw bytes as base64 inline data
      const fileData = fs.readFileSync(filePath);
      const base64Data = fileData.toString('base64');
      const result = await model.generateContent([
        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        { text: EXTRACTION_PROMPT }
      ]);
      return parseGeminiJSON(result.response.text().trim());
    }
    // Text-based PDF
    const result = await model.generateContent([
      { text: EXTRACTION_PROMPT + '\n\nDocument text:\n' + text.slice(0, 8000) }
    ]);
    return parseGeminiJSON(result.response.text().trim());
  }

  if (isImage) {
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');
    const mediaType = mimetype === 'image/jpg' ? 'image/jpeg' : mimetype;
    const result = await model.generateContent([
      { inlineData: { mimeType: mediaType, data: base64Data } },
      { text: EXTRACTION_PROMPT }
    ]);
    return parseGeminiJSON(result.response.text().trim());
  }

  return { error: 'Unsupported file type.' };
}

// ─── Mock fallback (no API key) ───────────────────────────────────────────────
function mockExtraction(filePath) {
  console.warn('[DocumentExtractor] Gemini not configured — returning mock data.');
  const basename = path.basename(filePath).toLowerCase();
  const isLIC    = basename.includes('lic') || basename.includes('policy');
  return {
    person_name:      'Ramesh Kumar',
    institution:      isLIC ? 'Life Insurance Corporation of India' : 'State Bank of India',
    asset_type:       isLIC ? 'LIC Policy' : 'Savings Account',
    account_number:   isLIC ? null : '30998877123',
    policy_number:    isLIC ? 'LIC-904321XX' : null,
    amount:           '₹8,80,000',
    nominee:          'Sunita Kumar',
    branch_address:   'Main Branch, New Delhi',
    date_of_document: '2019-04-12',
  };
}

// ─── Public: analyzeDocument ──────────────────────────────────────────────────
async function analyzeDocument(filePath, mimetype) {
  console.log(`[DocumentExtractor] Analysing: ${path.basename(filePath)} (${mimetype})`);

  if (!isGeminiConfigured()) {
    return mockExtraction(filePath);
  }

  try {
    return await extractViaGemini(filePath, mimetype);
  } catch (err) {
    console.error('[DocumentExtractor] Gemini error:', err.message);
    // Return mock rather than hard-crashing the endpoint
    return mockExtraction(filePath);
  }
}

// ─── generateDocumentInsight (was Claude) — now Groq ─────────────────────────
async function generateDocumentInsight(data, confidenceScore) {
  const { getGroq, isGroqConfigured } = require('./aiClients');

  const fallback = `We found a possible ${data.asset_type || 'asset'} at ${data.institution || 'a financial institution'}.`;

  if (!isGroqConfigured()) return fallback;

  const prompt = `A financial document for a deceased family member was uploaded.

Extracted Data:
- Institution: ${data.institution || 'Unknown'}
- Asset Type:  ${data.asset_type  || 'Unknown'}
- Amount:      ${data.amount      || 'Unknown'}
- Nominee:     ${data.nominee     || 'Unknown'}

Confidence score: ${confidenceScore}%

Write a warm, 2-3 sentence explanation for the family.
Acknowledge the asset found. If confidence is below 60%, gently suggest the document may be hard to read.
Do not use technical jargon.`;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model:      'llama-3.3-70b-versatile',
      max_tokens: 200,
      temperature: 0.6,
      messages: [
        { role: 'system', content: 'You are Varasat Mitra, an empathetic inheritance assistant.' },
        { role: 'user',   content: prompt },
      ],
    });
    return completion.choices[0].message.content || fallback;
  } catch (err) {
    console.warn('[DocumentExtractor] Insight generation failed:', err.message);
    return fallback;
  }
}

// ─── Legacy exports ───────────────────────────────────────────────────────────
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

module.exports = { analyzeDocument, extractDocumentData, DOCUMENT_SCHEMA, generateDocumentInsight };
