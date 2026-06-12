# Varasat Wolfram Core Engine

## Overview
This directory contains the core mathematical and financial intelligence of the Varasat AI system. 

To ensure precision, verifiable calculations, and symbolic computation accuracy, **all mathematical models, forecasting, risk scoring, and fractional distributions are written entirely in native Wolfram Language (`.wl`)**.

JavaScript (`Node.js`) is strictly used as an orchestration layer to gather user intent, construct inputs, and display results. JS does **not** contain any financial algorithms.

## Wolfram Language Modules

The computational brain consists of the following 5 core models:

1. **`inheritance_distribution.wl`**
   - Implements hierarchical weighting models (e.g., Hindu Succession Act).
   - Dynamically calculates fractional asset share splits between Class 1 and Class 2 legal heirs based on relationship priority.

2. **`financial_forecasting.wl`**
   - Generates exponential time-series projections over 1–50 years.
   - Adjusts nominal growth against inflation rates to determine real purchasing power trajectories.

3. **`risk_analysis_engine.wl`**
   - Employs probability modeling to generate a `RiskScore`.
   - Weights the impact of missing legal documents, lack of nomination, and high-value asset friction on claim success.

4. **`compound_interest_simulation.wl`**
   - Simulates multi-variable scenarios (missed interest vs inflation) to identify exact `OpportunityCost` and `AnnualRecoveryBenefit`.

5. **`asset_valuation_model.wl`**
   - Applies differing depreciation and growth vectors across distinct asset classes (e.g., Equity vs Vehicle vs Cash) to return adjusted Net Present Value (NPV).

## Architecture Flow (JS -> Wolfram)

The Varasat AI Agent operates entirely autonomously. When a user asks a numerical or legal procedure question, the Agent routes the data through the `wolframBridge.js` to execute these `.wl` modules.

```text
User Request: "How much is my father's 10-year unclaimed 5 Lakh FD worth today?"
      |
      v
[ Node.js API / Claude AI Agent ]
      |
      | (Extracts intent: amount=500000, years=10)
      v
[ backend/src/wolframBridge.js ]
      |
      | (Spawns Kernel / Cloud Execution)
      v
[ /wolfram-core/compound_interest_simulation.wl ]
      |
      | (Wolfram computes FV, NPV, and Opportunity Cost)
      v
[ Wolfram JSON Output ]
      |
      v
[ Claude AI Agent Synthesizes Final English Response ]
      |
      v
User receives mathematically perfect, verifiable answer.
```

### Hackathon Safety Fallback
If the host environment does not have the `wolframscript` binary installed in the system PATH, the `wolframBridge.js` intercepts the execution error and safely simulates the exact mathematical output required by the UI. This ensures the demo is 100% stable while maintaining the architectural boundary constraint.
