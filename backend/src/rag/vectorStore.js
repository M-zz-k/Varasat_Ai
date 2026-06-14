'use strict';

/**
 * Lightweight Semantic Retrieval Engine (Vector Store)
 * 
 * Implements a pure JavaScript Term Frequency - Inverse Document Frequency (TF-IDF) 
 * matrix and Cosine Similarity to simulate vector retrieval without heavy native C++ 
 * dependencies (like FAISS or ChromaDB), ensuring 100% Hackathon reliability.
 */

class VectorStore {
  constructor() {
    this.documents = [];
    this.vocab = {}; // mapping of word to its document frequency
    this.vectors = []; // storing tf-idf vectors for each document
  }

  // Basic tokenizer: lowercase, remove non-alphanumeric, split by spaces
  tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2); // ignore very short stop-words essentially
  }

  // Build the TF-IDF index
  indexDocuments(docs) {
    this.documents = docs;
    this.vocab = {};
    
    // 1. Calculate Document Frequency (DF) for each term
    const docTokensList = docs.map(doc => {
      const allText = `${doc.topic} ${doc.assetType} ${doc.tags.join(' ')} ${doc.content}`;
      const tokens = this.tokenize(allText);
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(token => {
        this.vocab[token] = (this.vocab[token] || 0) + 1;
      });
      return tokens;
    });

    // 2. Build TF-IDF vectors for each document
    const N = docs.length;
    this.vectors = docTokensList.map(tokens => {
      const vector = {};
      
      // Calculate Term Frequency (TF)
      const termCount = {};
      tokens.forEach(token => {
        termCount[token] = (termCount[token] || 0) + 1;
      });

      // Calculate TF-IDF
      for (const token in termCount) {
        const tf = termCount[token] / tokens.length;
        const idf = Math.log(N / (this.vocab[token] || 1)) + 1; // +1 to prevent 0 idf
        vector[token] = tf * idf;
      }
      return vector;
    });
  }

  // Vectorize a query using the existing vocabulary (IDF)
  vectorizeQuery(query) {
    const tokens = this.tokenize(query);
    const vector = {};
    const termCount = {};
    const N = this.documents.length;
    
    tokens.forEach(token => {
      termCount[token] = (termCount[token] || 0) + 1;
    });

    for (const token in termCount) {
      // Only consider words that exist in our corpus vocabulary
      if (this.vocab[token]) {
        const tf = termCount[token] / tokens.length;
        const idf = Math.log(N / this.vocab[token]) + 1;
        vector[token] = tf * idf;
      }
    }
    return vector;
  }

  // Compute cosine similarity between two sparse vectors
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const key in vecA) {
      if (vecB[key]) {
        dotProduct += vecA[key] * vecB[key];
      }
      normA += vecA[key] * vecA[key];
    }

    for (const key in vecB) {
      normB += vecB[key] * vecB[key];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Retrieve top K most similar documents
  search(query, topK = 2) {
    if (this.documents.length === 0) return [];

    const queryVector = this.vectorizeQuery(query);
    
    // Add extra weight for direct tag matches
    const rawTokens = this.tokenize(query);

    const scoredDocs = this.documents.map((doc, idx) => {
      const docVector = this.vectors[idx];
      let sim = this.cosineSimilarity(queryVector, docVector);
      
      // Bonus for direct tag hits (heuristic boost)
      doc.tags.forEach(tag => {
        if (rawTokens.includes(tag.toLowerCase())) {
          sim += 0.2; // 20% boost per tag hit
        }
      });

      return {
        ...doc,
        similarityScore: Math.round(sim * 100) / 100
      };
    });

    scoredDocs.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // Filter out zero-similarity docs
    const results = scoredDocs.filter(d => d.similarityScore > 0).slice(0, topK);
    return results;
  }
}

// Singleton instance
const vectorStore = new VectorStore();

module.exports = vectorStore;
