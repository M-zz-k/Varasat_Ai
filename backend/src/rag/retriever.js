'use strict';

const vectorStore = require('./vectorStore');

/**
 * Semantic Retriever for RAG.
 * Uses the initialized Vector Store to find the most relevant context.
 * 
 * @param {string} query - The user's search query from the Agent
 * @param {number} topK - Number of results to return
 * @returns {Array} - Array of top matching structured documents
 */
function searchKnowledgeBase(query, topK = 2) {
  // Search the vector store directly (it was initialized by knowledgeLoader)
  const results = vectorStore.search(query, topK);

  // Map to the required structured format for the AI context
  return results.map(doc => ({
    topic: doc.topic,
    assetType: doc.assetType,
    content: doc.content,
    requiredDocuments: doc.requiredDocuments,
    timeline: doc.timeline,
    similarityScore: doc.similarityScore
  }));
}

module.exports = { searchKnowledgeBase };
