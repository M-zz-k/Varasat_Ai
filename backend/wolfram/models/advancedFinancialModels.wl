(* ::Package:: *)
(* ============================================================
   VARASAT — Advanced Financial Intelligence Engine
   Module: models/advancedFinancialModels.wl
   
   Responsibilities:
     1. Inflation-adjusted present value (discounted cash flow)
     2. Future value projection (compound growth)
     3. Delayed recovery opportunity cost
     4. Financial depreciation over dormancy period
     5. Family impact conversion (relatable human metrics)
     6. Recovery Priority Score (0-100 composite)
     7. Year-by-year depreciation schedule
     8. Effective annual loss rate
   ============================================================ *)

(* ── Core Financial Primitives ───────────────────────────── *)

(* Future value using compound interest *)
calculateFutureValue[principal_, rate_, years_] :=
  N[principal * (1 + rate)^years]

(* Present value / inflation-adjusted purchasing power *)
calculatePresentValue[principal_, inflationRate_, years_] :=
  N[principal / (1 + inflationRate)^years]

(* Purchasing power erosion *)
calculateInflationImpact[principal_, inflationRate_, years_] :=
  principal - calculatePresentValue[principal, inflationRate, years]

(* Opportunity cost of delay: what was foregone by not investing *)
calculateOpportunityCost[principal_, growthRate_, inflationRate_, years_] :=
  calculateFutureValue[principal, growthRate, years] -
    calculatePresentValue[principal, inflationRate, years]

(* Effective annual loss rate — how quickly the asset decays in real terms *)
calculateEffectiveAnnualLossRate[principal_, inflationRate_, years_] :=
  Module[{inflationImpact},
    inflationImpact = calculateInflationImpact[principal, inflationRate, years];
    If[years > 0 && principal > 0,
      N[(inflationImpact / principal / years) * 100],
      0.0
    ]
  ]

(* ── Depreciation Schedule ───────────────────────────────── *)
(* Returns year-by-year table of nominal vs real value *)
generateDepreciationSchedule[principal_, growthRate_, inflationRate_, maxYears_] :=
  Table[
    Module[{nominalVal, realVal, lossToDate, lossPercent},
      nominalVal = N[principal * (1 + growthRate)^y];
      realVal    = N[principal / (1 + inflationRate)^y];
      lossToDate = principal - realVal;
      lossPercent = If[principal > 0, N[(lossToDate / principal) * 100], 0.0];
      <|
        "year"            -> y,
        "nominalValue"    -> Round[nominalVal],
        "realValue"       -> Round[realVal],
        "purchasingLoss"  -> Round[lossToDate],
        "lossPercentage"  -> Round[lossPercent, 0.1],
        "opportunityCost" -> Round[nominalVal - realVal]
      |>
    ],
    {y, 0, maxYears}
  ]

(* ── Recovery Priority Score ─────────────────────────────── *)
(*
   Composite scoring model (0–100):
   Factors:
     W1 (40%) = Asset value weight — normalised to ₹10L baseline
     W2 (30%) = Delay urgency — penalises longer dormancy
     W3 (20%) = Inflation erosion severity
     W4 (10%) = Recovery feasibility (documents / nominee)
*)
calculateRecoveryPriorityScore[principal_, delayYears_, inflationRate_, docsComplete_, nomineeAvailable_] :=
  Module[{w1, w2, w3, w4, inflationImpact, erosionSeverity, docScore, raw, score},
    (* W1: value weight, normalised — capped at 40 *)
    w1 = Min[40, N[(principal / 1000000) * 40]];

    (* W2: delay urgency — longer delay = higher urgency, diminishing returns *)
    w2 = Min[30, N[(1 - Exp[-delayYears / 10]) * 30]];

    (* W3: inflation erosion severity *)
    inflationImpact   = calculateInflationImpact[principal, inflationRate, delayYears];
    erosionSeverity   = If[principal > 0, N[(inflationImpact / principal) * 100], 0];
    w3 = Min[20, N[(erosionSeverity / 100) * 20]];

    (* W4: readiness penalty — max 10 points for readiness *)
    docScore = (If[docsComplete, 1, 0] + If[nomineeAvailable, 1, 0]) / 2;
    w4 = N[docScore * 10];

    raw   = w1 + w2 + w3 + w4;
    score = Round[Min[100, Max[0, raw]]];
    <|
      "score"              -> score,
      "valueWeight"        -> Round[w1, 0.1],
      "urgencyWeight"      -> Round[w2, 0.1],
      "erosionWeight"      -> Round[w3, 0.1],
      "readinessWeight"    -> Round[w4, 0.1],
      "interpretation"     -> Which[
        score >= 80, "CRITICAL — Immediate recovery strongly recommended",
        score >= 60, "HIGH — Recovery should be initiated within 1 month",
        score >= 40, "MEDIUM — Recovery recommended within 3 months",
        True,        "LOW — Plan recovery within 6 months"
      ]
    |>
  ]

(* ── Family Impact Conversion ────────────────────────────── *)
(*
   Converts rupee loss into relatable household equivalents
   using Indian average cost benchmarks (2024 data).
*)
calculateFamilyImpact[financialLoss_] :=
  Module[{
    avgGroceryMonth  = 7500,   (* ₹7,500/month per family *)
    avgSchoolFeeYear = 40000,  (* ₹40,000/year private school *)
    avgMedicalCost   = 120000, (* ₹1.2L hospital procedure *)
    avgRentMonth     = 12000,  (* ₹12,000/month rental *)
    avgWeddingCost   = 500000, (* ₹5L budget wedding *)
    avgCollegeYear   = 80000   (* ₹80,000/year college fees *)
  },
    <|
      "groceriesMonths"         -> Round[financialLoss / avgGroceryMonth],
      "schoolFeeYears"          -> Round[financialLoss / avgSchoolFeeYear, 0.1],
      "medicalProcedures"       -> Round[financialLoss / avgMedicalCost, 0.1],
      "monthsOfRent"            -> Round[financialLoss / avgRentMonth],
      "weddingFundContribution" -> Round[(financialLoss / avgWeddingCost) * 100, 1],
      "collegeYears"            -> Round[financialLoss / avgCollegeYear, 0.1],
      "humanSummary"            -> StringJoin[
        "Financial loss equivalent to approximately ",
        ToString[Round[financialLoss / avgGroceryMonth]],
        " months of family groceries or ",
        ToString[Round[financialLoss / avgSchoolFeeYear, 0.1]],
        " years of school fees."
      ]
    |>
  ]

(* ── Scenario Comparison ─────────────────────────────────── *)
compareRecoveryScenarios[principal_, growthRate_, inflationRate_] :=
  Module[{delays = {0, 1, 3, 5, 10},
          labels = {"Immediate", "1 Year Delay", "3 Year Delay", "5 Year Delay", "10 Year Delay"}},
    MapThread[
      <|
        "scenario"          -> #2,
        "delayYears"        -> #1,
        "futureValue"       -> Round[calculateFutureValue[principal, growthRate, #1]],
        "realValue"         -> Round[calculatePresentValue[principal, inflationRate, #1]],
        "purchasingLoss"    -> Round[calculateInflationImpact[principal, inflationRate, #1]],
        "opportunityCost"   -> Round[calculateOpportunityCost[principal, growthRate, inflationRate, #1]],
        "netEffectiveLoss"  -> Round[calculateInflationImpact[principal, inflationRate, #1] +
                                     calculateOpportunityCost[principal, growthRate, inflationRate, #1] * 0.4]
      |> &,
      {delays, labels}
    ]
  ]

(* ── Entry Point ─────────────────────────────────────────── *)
If[Length[$ScriptCommandLine] >= 5,
  Module[{amount, inflation, delay, growth, pv, fv, loss, oppCost, score,
          impact, schedule, scenarios, annualLossRate, result, jsonOutput,
          docsComplete, nomineeAvailable},

    amount   = ToExpression[$ScriptCommandLine[[2]]];
    inflation = ToExpression[$ScriptCommandLine[[3]]];
    delay    = ToExpression[$ScriptCommandLine[[4]]];
    growth   = ToExpression[$ScriptCommandLine[[5]]];

    (* Optional args — default True if missing *)
    docsComplete      = If[Length[$ScriptCommandLine] >= 6, ToExpression[$ScriptCommandLine[[6]]], True];
    nomineeAvailable  = If[Length[$ScriptCommandLine] >= 7, ToExpression[$ScriptCommandLine[[7]]], True];

    pv             = calculatePresentValue[amount, inflation, delay];
    fv             = calculateFutureValue[amount, growth, delay];
    loss           = amount - pv;
    oppCost        = calculateOpportunityCost[amount, growth, inflation, delay];
    annualLossRate = calculateEffectiveAnnualLossRate[amount, inflation, delay];
    impact         = calculateFamilyImpact[loss];
    score          = calculateRecoveryPriorityScore[amount, delay, inflation, docsComplete, nomineeAvailable];
    schedule       = generateDepreciationSchedule[amount, growth, inflation, Min[delay + 5, 15]];
    scenarios      = compareRecoveryScenarios[amount, growth, inflation];

    result = <|
      "originalAmount"       -> amount,
      "futureValue"          -> Round[fv],
      "presentValue"         -> Round[pv],
      "inflationImpact"      -> Round[loss],
      "opportunityCost"      -> Round[oppCost],
      "effectiveAnnualLossRate" -> Round[annualLossRate, 0.01],
      "delayedRecoveryCost"  -> Round[loss + oppCost * 0.5],
      "recoveryPriorityScore" -> score,
      "familyImpact"         -> impact,
      "depreciationSchedule" -> schedule,
      "scenarios"            -> scenarios,
      "recoverySummary"      -> <|
        "originalAmount"          -> amount,
        "inflationAdjustedValue"  -> Round[pv],
        "totalLoss"               -> Round[loss],
        "opportunityCost"         -> Round[oppCost],
        "recoveryEfficiencyScore" -> score[["score"]]
      |>
    |>;

    jsonOutput = ExportString[<|
      "moduleName"  -> "models/advancedFinancialModels",
      "version"     -> "2.0-enhanced",
      "inputs"      -> <|
        "assetAmount"     -> amount,
        "inflationRate"   -> inflation,
        "delayYears"      -> delay,
        "growthRate"      -> growth,
        "docsComplete"    -> docsComplete,
        "nomineeAvailable" -> nomineeAvailable
      |>,
      "method"      -> "Multi-Factor Discounted Cash Flow with Recovery Priority Scoring",
      "calculation" -> "FV=P(1+r)^t; PV=P/(1+i)^t; OppCost=FV-PV; PriorityScore=W1+W2+W3+W4",
      "result"      -> result,
      "explanation" -> StringJoin[
        "Wolfram Financial Intelligence Engine computed inflation-adjusted present value, ",
        "opportunity cost of delayed recovery, year-by-year depreciation schedule, ",
        "Recovery Priority Score (composite of value, urgency, erosion, and readiness), ",
        "and human-impact metrics translating rupee loss into household equivalents."
      ]
    |>, "JSON", "Compact" -> True];

    Print[jsonOutput];
  ]
]
