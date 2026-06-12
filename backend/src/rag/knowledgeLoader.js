'use strict';

const fs = require('fs');
const path = require('path');

let knowledgeCache = null;

/**
 * Loads the RAG knowledge base into memory.
 */
function loadKnowledgeBase() {
  if (knowledgeCache) return knowledgeCache;

  const dataPath = path.join(__dirname, 'documents', 'knowledge.json');
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    knowledgeCache = JSON.parse(data);
    console.log(`[RAG Loader] Loaded ${knowledgeCache.length} knowledge documents into memory.`);
    return knowledgeCache;
  } catch (error) {
    console.error('[RAG Loader] Failed to load knowledge base:', error);
    return [];
  }
}

module.exports = { loadKnowledgeBase };
