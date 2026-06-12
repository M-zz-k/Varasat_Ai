'use strict';

const { loadKnowledgeBase } = require('./knowledgeLoader');

/**
 * Very lightweight MVP retriever using keyword overlap and scoring.
 * (Replaces ChromaDB/FAISS to prevent Hackathon build risks)
 * 
 * @param {string} query - The user's search query from the Agent
 * @param {number} topK - Number of results to return
 * @returns {Array} - Array of top matching document contents
 */
function searchKnowledgeBase(query, topK = 2) {
  const docs = loadKnowledgeBase();
  if (!docs || docs.length === 0) return [];

  const normalizedQuery = query.toLowerCase();
  
  // Very basic NLP tokenization
  const tokens = normalizedQuery.split(/[\s,.\-\?]+/).filter(t => t.length > 2);

  const scoredDocs = docs.map(doc => {
    let score = 0;
    
    // Exact tag matches give high score
    doc.tags.forEach(tag => {
      if (normalizedQuery.includes(tag.toLowerCase())) {
        score += 10;
      }
    });

    // Token matches in content give smaller score
    const contentLower = doc.content.toLowerCase();
    tokens.forEach(token => {
      if (contentLower.includes(token)) {
        score += 2;
      }
    });

    return { ...doc, score };
  });

  // Sort descending by score
  scoredDocs.sort((a, b) => b.score - a.score);

  // Filter out zero-score docs
  const relevantDocs = scoredDocs.filter(d => d.score > 0);

  // Return the topK contents formatted as text
  return relevantDocs.slice(0, topK).map(d => `[Source: ${d.topic}]\n${d.content}`);
}

module.exports = { searchKnowledgeBase };
