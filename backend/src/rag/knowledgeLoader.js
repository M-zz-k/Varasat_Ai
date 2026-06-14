'use strict';

const fs = require('fs');
const path = require('path');
const vectorStore = require('./vectorStore');

let knowledgeCache = null;

/**
 * Loads the RAG knowledge base into memory and initializes the Vector Store.
 */
function loadKnowledgeBase() {
  if (knowledgeCache) return knowledgeCache;

  const dataPath = path.join(__dirname, 'documents', 'knowledge.json');
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    knowledgeCache = JSON.parse(data);
    
    // Prepare documents and create mathematical embeddings
    vectorStore.indexDocuments(knowledgeCache);
    console.log(`[RAG Loader] Loaded and indexed ${knowledgeCache.length} knowledge documents into the Lightweight Vector Store.`);
    
    return knowledgeCache;
  } catch (error) {
    console.error('[RAG Loader] Failed to load knowledge base:', error);
    return [];
  }
}

// Force load on startup
loadKnowledgeBase();

module.exports = { loadKnowledgeBase };
