'use strict';

const fs = require('fs');
const path = require('path');
const { getGenAI, isGeminiConfigured } = require('./aiClients');

const COMPLEX_EXTRACTION_PROMPT = `You are Varasat Document AI, specializing in complex Indian family property documents.
Extract the following information from the provided document image or text into a structured JSON format:
- documentType: The type of document (e.g., "Will", "Property Deed", "Family Settlement").
- people: A list of people mentioned. Each object should have "name" and "role".
- assets: A list of assets found. Each object should have "institution", "type", "value", and "details".
- relationships: A list of relationships. Each object should have "source" (person name), "target" (asset or person name), and "relation" (e.g., "owns", "father_of").
- confidenceScore: An integer from 0 to 100 representing your confidence in the extraction.

Required JSON shape EXACTLY:
{
  "documentType": "",
  "people": [{"name": "", "role": ""}],
  "assets": [{"institution": "", "type": "", "value": "", "details": ""}],
  "relationships": [{"source": "", "target": "", "relation": ""}],
  "confidenceScore": 0
}
Do not return markdown, only the raw JSON string.`;

function parseGeminiJSON(raw) {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[ComplexDocumentExtractor] Failed to parse JSON:', raw.substring(0, 100));
    return mockComplexExtraction();
  }
}

async function extractViaGemini(filePath, mimetype) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');
  
  let mediaType = mimetype;
  if (mimetype === 'application/pdf' || mimetype.startsWith('image/')) {
    if (mimetype === 'image/jpg') mediaType = 'image/jpeg';
    const result = await model.generateContent([
      { inlineData: { mimeType: mediaType, data: base64Data } },
      { text: COMPLEX_EXTRACTION_PROMPT }
    ]);
    return parseGeminiJSON(result.response.text());
  }
  
  return mockComplexExtraction();
}

function mockComplexExtraction() {
  console.warn('[ComplexDocumentExtractor] Using mock complex extraction data.');
  return {
    documentType: "Ancestral Property Deed",
    people: [
      { name: "Harish Chandra", role: "Deceased / Original Owner" },
      { name: "Rahul Chandra", role: "Son / Claimant" },
      { name: "Geeta Devi", role: "Wife / Co-owner" }
    ],
    assets: [
      { institution: "Agricultural Land Dept", type: "Farm Land", value: "₹25,00,000", details: "Plot 42, Village Ramgarh" },
      { institution: "State Bank", type: "Joint Account", value: "₹4,50,000", details: "Acct 5588" }
    ],
    relationships: [
      { source: "Harish Chandra", target: "Farm Land", relation: "owns" },
      { source: "Harish Chandra", target: "Joint Account", relation: "co-owns" },
      { source: "Geeta Devi", target: "Joint Account", relation: "co-owns" },
      { source: "Harish Chandra", target: "Rahul Chandra", relation: "father_of" },
      { source: "Rahul Chandra", target: "Farm Land", relation: "heir_to" }
    ],
    confidenceScore: 92
  };
}

async function analyzeComplexDocument(filePath, mimetype) {
  console.log(`[ComplexDocumentExtractor] Analysing: ${path.basename(filePath)} (${mimetype})`);
  
  if (!isGeminiConfigured()) {
    return mockComplexExtraction();
  }

  try {
    return await extractViaGemini(filePath, mimetype);
  } catch (err) {
    console.error('[ComplexDocumentExtractor] Gemini error:', err.message);
    return mockComplexExtraction();
  }
}

module.exports = { analyzeComplexDocument };
