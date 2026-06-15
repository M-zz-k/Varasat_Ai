'use strict';

const axios = require('axios');

/**
 * Split text into chunks of ≤ maxLen characters, breaking at sentence
 * boundaries where possible so audio sounds natural.
 */
function chunkText(text, maxLen = 190) {
  // Try to split at sentence-ending punctuation (English + Devanagari + Kannada)
  const sentences = text.match(/[^.!?।॥।\n]+[.!?।॥।\n]*/g) || [text];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen) {
      if (current.trim()) chunks.push(current.trim());
      // If single sentence is too long, hard-split it
      if (sentence.length > maxLen) {
        let remaining = sentence;
        while (remaining.length > maxLen) {
          chunks.push(remaining.slice(0, maxLen));
          remaining = remaining.slice(maxLen);
        }
        current = remaining;
      } else {
        current = sentence;
      }
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

/**
 * POST /api/tts
 * Body: { text: string, lang: string }  — lang is BCP-47 prefix e.g. 'kn', 'hi', 'en'
 * Returns: audio/mpeg binary (concatenated MP3 chunks)
 */
async function handleTTS(req, res) {
  const { text, lang = 'en' } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  const chunks = chunkText(text.trim());
  console.log(`[TTS] Generating audio for lang=${lang}, ${chunks.length} chunk(s)`);

  const audioBuffers = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
          'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,*/*;q=0.8',
        },
      });
      audioBuffers.push(Buffer.from(response.data));
    } catch (err) {
      console.error(`[TTS] Chunk fetch failed: ${err.message}`);
      // Skip failed chunks rather than crashing
    }
  }

  if (audioBuffers.length === 0) {
    return res.status(502).json({ error: 'TTS service unavailable. Try again.' });
  }

  const combined = Buffer.concat(audioBuffers);
  res.set('Content-Type', 'audio/mpeg');
  res.set('Cache-Control', 'no-store');
  res.send(combined);
}

module.exports = { handleTTS };
