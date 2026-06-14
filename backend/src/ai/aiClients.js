'use strict';

/**
 * aiClients.js
 *
 * Singleton AI client instances shared across the entire backend.
 * Uses Groq (free tier, llama-3.3-70b-versatile) for text generation
 * and Google Gemini (free tier, gemini-2.5-flash) for document OCR.
 *
 * Kept @anthropic-ai/sdk as a commented-out fallback reference.
 * // const Anthropic = require('@anthropic-ai/sdk');
 * // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 */

require('dotenv').config();
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Groq client (chat + claim analysis + whisper) ────────────────────────────
let groqClient = null;
function getGroq() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      console.warn('[AI] GROQ_API_KEY not configured — Groq features will use offline fallback.');
    }
    groqClient = new Groq({ apiKey: apiKey || '' });
  }
  return groqClient;
}

// ─── Gemini client (document OCR) ─────────────────────────────────────────────
let genAI = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('[AI] GEMINI_API_KEY not configured — Gemini OCR will use mock data.');
    }
    genAI = new GoogleGenerativeAI(apiKey || '');
  }
  return genAI;
}

// ─── Check helpers ─────────────────────────────────────────────────────────────
function isGroqConfigured() {
  const k = process.env.GROQ_API_KEY;
  return !!(k && k !== 'your_groq_api_key_here' && k.length > 10);
}

function isGeminiConfigured() {
  const k = process.env.GEMINI_API_KEY;
  return !!(k && k !== 'your_gemini_api_key_here' && k.length > 10);
}

// ─── Error classifier ─────────────────────────────────────────────────────────
function classifyGroqError(err) {
  if (err?.status === 429 || err?.message?.includes('rate_limit')) {
    return { status: 429, body: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment.', retryable: true } } };
  }
  return { status: 500, body: { error: { code: 'AI_SERVICE_ERROR', message: 'AI service temporarily unavailable. Please try again.', retryable: true } } };
}

module.exports = { getGroq, getGenAI, isGroqConfigured, isGeminiConfigured, classifyGroqError };
