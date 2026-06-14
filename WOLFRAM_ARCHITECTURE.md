# Varasat Computational Architecture

Varasat relies on a dual-intelligence architecture that cleanly separates generative reasoning from deterministic mathematical modelling.

## The Dual-Intelligence Paradigm

**Data Flow Architecture:**
```text
React
 |
Node.js Backend
 |
AI Agent
 |
--------------------------------
|              |               |
RAG          Wolfram        Document AI
Knowledge    Engine         Extraction
 |
Claude/Gemini Reasoning
```

### 1. Claude/Gemini (Generative Intelligence)
- **Natural Language Reasoning**: Interprets user intent, simplifies complex legal jargon, and communicates empathetically with heirs (Varasat Saathi).
- **RAG Knowledge Retrieval**: Queries vector databases to inject factual context about succession laws and affidavit requirements.
- **Computer Vision**: Extracts structural data (names, dates, amounts) from raw unstructured documents.

### 2. Wolfram Language Engine (Computational Intelligence)
- **Mathematical Computation**: Handles all rigorous financial calculations, ensuring absolute precision free from LLM hallucination.
- **Risk Modelling**: Computes deterministic readiness scores using explicit algorithmic weights rather than arbitrary generative guessing.
- **Simulation**: Uses mathematical bounded randomness (Monte Carlo methodologies) to estimate recovery timelines based on document availability.

## Ultimate Wolfram Integration (`backend/wolfram/`)

The repository contains a highly developed native engine of `.wl` scripts executing distinct models:
- `/models`: Unifies advanced financial structures (Compound Interest, Delayed Recovery Costs, Present/Future Values).
- `/analytics`: Projects asset growth trajectories, simulates multiple recovery delay bounds, and profiles portfolio intelligence.
- `/intelligence`: Heuristic optimization logic for prioritizing asset recovery sequences and checking document readiness scoring.
- `/visualization`: Native generation of Recharts-compatible discrete data arrays mapping out computational timelines.
- `/tests`: Native `.wlt` Wolfram test frameworks asserting computational correctness directly in the engine language.

*Note: Wolfram is explicitly used for "Computational Support" (e.g., Claim Readiness, Document Completeness, Recovery Priorities). It does not predict legal outcomes or claim approvals.*
