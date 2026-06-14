# Varasat Computational Architecture

Varasat relies on a dual-intelligence architecture that cleanly separates generative reasoning from deterministic mathematical modelling.

## The Dual-Intelligence Paradigm

### 1. Claude/Gemini (Generative Intelligence)
- **Natural Language Reasoning**: Interprets user intent, simplifies complex legal jargon, and communicates empathetically with heirs (Varasat Saathi).
- **RAG Knowledge Retrieval**: Queries vector databases to inject factual context about succession laws and affidavit requirements.
- **Computer Vision**: Extracts structural data (names, dates, amounts) from raw unstructured documents.

### 2. Wolfram Language Engine (Computational Intelligence)
- **Mathematical Computation**: Handles all rigorous financial calculations, ensuring absolute precision free from LLM hallucination.
- **Risk Modelling**: Computes deterministic readiness scores using explicit algorithmic weights rather than arbitrary generative guessing.
- **Simulation**: Uses mathematical bounded randomness (Monte Carlo methodologies) to estimate recovery timelines based on document availability.

## Deep Wolfram Integration (`backend/wolfram/`)

The repository contains a deeply nested set of 10+ `.wl` scripts executing distinct models:
- `/core`: Base formulas for Present Value and discrete compound growth mapping.
- `/analytics`: Distribution of multi-class asset portfolios and inflation projections.
- `/intelligence`: Heuristic risk scoring evaluating structural missing components (documents vs. nominees).
- `/visualization`: Generation of exact Cartesian plotting points for React UI components.

*Note: Wolfram is explicitly used for "Computational Support" (e.g., Claim Readiness, Document Completeness, Recovery Priorities). It does not predict legal outcomes or claim approvals.*
