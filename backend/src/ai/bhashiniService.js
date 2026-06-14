'use strict';

const axios = require('axios');

/**
 * bhashiniService.js
 * 
 * Safely handles official Bhashini ULCA Translation (NMT) API integration.
 * If credentials are not provided in .env, it fails-safe back to standard text.
 */

// Bhashini Language Codes Mapping
const LANGUAGE_CODES = {
  'English': 'en',
  'Hindi': 'hi',
  'Kannada': 'kn'
};

function isBhashiniConfigured() {
  return process.env.BHASHINI_USER_ID && process.env.BHASHINI_API_KEY && process.env.BHASHINI_PIPELINE_ID;
}

/**
 * Get the compute authorization token using User ID and API Key.
 * Note: In production, this token should be cached.
 */
async function getPipelineToken() {
  const url = 'https://meity-auth.ulca.org.in/ulca/apis/v0/model/getModelsPipeline';
  
  const headers = {
    'userID': process.env.BHASHINI_USER_ID,
    'ulcaApiKey': process.env.BHASHINI_API_KEY,
    'Content-Type': 'application/json'
  };

  const body = {
    pipelineTasks: [
      { taskType: 'translation' }
    ],
    pipelineRequestConfig: {
      pipelineId: process.env.BHASHINI_PIPELINE_ID
    }
  };

  const response = await axios.post(url, body, { headers });
  
  // Extract inference API key and callback URL from pipeline config
  const pipelineConfig = response.data.pipelineConfiguration;
  const inferenceApiKey = response.data.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value;
  const callbackUrl = response.data.pipelineInferenceAPIEndPoint?.callbackUrl;
  
  if (!inferenceApiKey || !callbackUrl) {
    throw new Error('Could not retrieve Bhashini Inference Keys');
  }

  // Find the translation service ID
  const translationService = pipelineConfig.find(p => p.taskType === 'translation');
  const serviceId = translationService?.config[0]?.serviceId;

  return { inferenceApiKey, callbackUrl, serviceId };
}

/**
 * Translate text via Bhashini NMT
 * 
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language name (e.g. 'Hindi')
 * @param {string} targetLang - Target language name (e.g. 'English')
 * @returns {string} - Translated text
 */
async function translateText(text, sourceLang, targetLang) {
  if (!text || text.trim() === '') return text;
  
  const srcCode = LANGUAGE_CODES[sourceLang];
  const tgtCode = LANGUAGE_CODES[targetLang];

  // If language isn't supported or no translation needed, return original
  if (!srcCode || !tgtCode || srcCode === tgtCode) return text;

  // If Bhashini keys are not in .env, gracefully fallback
  if (!isBhashiniConfigured()) {
    console.warn(`[Bhashini NMT] Keys missing. Mocking translation from ${sourceLang} to ${targetLang}.`);
    // During hackathon offline mode, we bypass translation to avoid crashes.
    return text; 
  }

  try {
    const { inferenceApiKey, callbackUrl, serviceId } = await getPipelineToken();

    const headers = {
      'Content-Type': 'application/json',
      [inferenceApiKey.name || 'Authorization']: inferenceApiKey.value || inferenceApiKey
    };

    // Bhashini Compute Payload
    const body = {
      pipelineTasks: [
        {
          taskType: 'translation',
          config: {
            language: {
              sourceLanguage: srcCode,
              targetLanguage: tgtCode
            },
            serviceId: serviceId
          }
        }
      ],
      inputData: {
        input: [
          { source: text }
        ]
      }
    };

    const response = await axios.post(callbackUrl, body, { headers });

    // Extract translation from response
    const translationList = response.data.pipelineResponse.find(r => r.taskType === 'translation');
    const translatedText = translationList?.output[0]?.target;

    return translatedText || text;

  } catch (error) {
    console.error('[Bhashini NMT] Translation failed:', error.message);
    // Graceful fail-safe so chat doesn't break
    return text;
  }
}

module.exports = {
  translateText,
  isBhashiniConfigured
};
