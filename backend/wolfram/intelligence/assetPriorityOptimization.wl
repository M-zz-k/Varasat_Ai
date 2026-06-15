(* ::Package:: *)
(* ============================================================
   VARASAT — Asset Priority Optimization Engine
   Module: intelligence/assetPriorityOptimization.wl
   
   Responsibilities:
     1. Multi-factor priority scoring (5 weighted factors)
     2. Inflation erosion factor per asset
     3. Legal complexity estimation
     4. Time-sensitive decay urgency
     5. Ranked recommendations with actionable guidance
     6. Portfolio recovery sequencing (stage 1/2/3)
   ============================================================ *)

(* ── Inflation Erosion Per Asset ─────────────────────────── *)
calculateAssetErosion[amount_, inflationRate_, delayYears_] :=
  Module[{pv},
    pv = N[amount / (1 + inflationRate)^delayYears];
    <|
      "erosionAmount"  -> Round[amount - pv],
      "erosionPercent" -> If[amount > 0, Round[N[((amount - pv) / amount) * 100], 0.1], 0.0],
      "remainingValue" -> Round[pv]
    |>
  ]

(* ── Legal Complexity Score ──────────────────────────────── *)
legalComplexityScore[assetType_] :=
  Which[
    assetType == "Bank",       1,  (* Simplest — bank succession *)
    assetType == "FD",         1,
    assetType == "Insurance",  2,  (* Requires claim form + nominee *)
    assetType == "ULIP",       2,
    assetType == "PPF",        2,
    assetType == "EPF",        2,
    assetType == "MutualFund", 3,  (* Transmission requires demat *)
    assetType == "Property",   5,  (* Highest — probate often needed *)
    True,                      2   (* Default medium complexity *)
  ]

(* ── Multi-Factor Priority Score ────────────────────────────
   Factors and weights:
     F1 (35%): Normalised asset value (₹10L = full score)
     F2 (25%): Inflation erosion severity
     F3 (20%): Recovery urgency (delay-based)
     F4 (10%): Documentation readiness bonus
     F5 (10%): Legal complexity penalty (inverse — simpler = higher)
*)
calculatePriorityScore[amount_, delayYears_, inflationRate_, docsComplete_, urgency_, assetType_] :=
  Module[{f1, f2, f3, f4, f5, erosion, complexity, raw},
    (* F1: Value weight normalised at ₹10L → 35 pts *)
    f1 = Min[35, N[(amount / 1000000) * 35]];

    (* F2: Inflation erosion severity → 25 pts *)
    erosion = calculateAssetErosion[amount, inflationRate, delayYears];
    f2 = Min[25, N[(erosion["erosionPercent"] / 60) * 25]];

    (* F3: Delay urgency — exponential urgency for older claims → 20 pts *)
    f3 = Min[20, N[(1 - Exp[-delayYears / 8]) * 20]];

    (* F4: Docs readiness → 10 pts *)
    f4 = If[docsComplete, 10, 0];

    (* F5: Legal simplicity → 10 pts (simpler = higher) *)
    complexity = legalComplexityScore[assetType];
    f5 = N[(1 - (complexity - 1) / 4) * 10];

    raw = f1 + f2 + f3 + f4 + f5;
    <|
      "totalScore"         -> Round[Min[100, Max[0, raw]]],
      "valueWeight"        -> Round[f1, 0.1],
      "erosionWeight"      -> Round[f2, 0.1],
      "urgencyWeight"      -> Round[f3, 0.1],
      "readinessWeight"    -> Round[f4, 0.1],
      "complexityWeight"   -> Round[f5, 0.1],
      "legalComplexity"    -> complexity
    |>
  ]

(* ── Ranked Asset List ───────────────────────────────────── *)
optimizePriority[assetsList_, inflationRate_] :=
  Module[{ranked, staged},
    If[Length[assetsList] == 0, Return[<|"ranking" -> {}, "stages" -> {}|>]];

    ranked = SortBy[
      Map[
        Module[{
          amount       = #["amount"],
          assetType    = #["type"],
          delayYears   = #["delayYears"] /. _Missing -> 5,
          docsComplete = #["docsComplete"] /. _Missing -> True,
          urgency      = #["urgency"] /. _Missing -> 1,
          scoreData, erosion, guidance
        },
          scoreData = calculatePriorityScore[amount, delayYears, inflationRate, docsComplete, urgency, assetType];
          erosion   = calculateAssetErosion[amount, inflationRate, delayYears];
          guidance  = Which[
            scoreData["totalScore"] >= 75, "CRITICAL: Initiate claim immediately",
            scoreData["totalScore"] >= 55, "HIGH: Begin recovery within 30 days",
            scoreData["totalScore"] >= 35, "MEDIUM: Schedule within 90 days",
            True,                          "LOW: Plan recovery this quarter"
          ];
          <|
            "type"           -> assetType,
            "amount"         -> amount,
            "priorityScore"  -> scoreData["totalScore"],
            "scoreBreakdown" -> scoreData,
            "erosionAnalysis" -> erosion,
            "guidance"       -> guidance,
            "legalComplexity" -> scoreData["legalComplexity"]
          |>
        ] &,
        assetsList
      ],
      -#["priorityScore"] &
    ];

    (* Stage sequencing: group into 3 recovery stages *)
    staged = {
      <|"stage" -> 1, "label" -> "Immediate Priority", "assets" ->
        Select[ranked, #["priorityScore"] >= 70 &]|>,
      <|"stage" -> 2, "label" -> "Secondary Priority", "assets" ->
        Select[ranked, 40 <= #["priorityScore"] < 70 &]|>,
      <|"stage" -> 3, "label" -> "Later Stage",        "assets" ->
        Select[ranked, #["priorityScore"] < 40 &]|>
    };

    <|
      "ranking"        -> ranked,
      "recoveryStages" -> staged,
      "topPriority"    -> If[Length[ranked] > 0, ranked[[1]]["type"], "N/A"],
      "totalAssets"    -> Length[ranked]
    |>
  ]

(* ── Entry Point ─────────────────────────────────────────── *)
If[Length[$ScriptCommandLine] >= 2,
  Module[{jsonInput, assetsList, inflationRate, result, jsonOutput},
    jsonInput     = $ScriptCommandLine[[2]];
    assetsList    = ImportString[jsonInput, "JSON"];
    inflationRate = If[Length[$ScriptCommandLine] >= 3, ToExpression[$ScriptCommandLine[[3]]], 0.06];

    result = optimizePriority[assetsList, inflationRate];

    jsonOutput = ExportString[<|
      "moduleName"  -> "intelligence/assetPriorityOptimization",
      "version"     -> "2.0-enhanced",
      "inputs"      -> <|"assetsCount" -> Length[assetsList], "inflationRate" -> inflationRate|>,
      "method"      -> "5-Factor Weighted Priority Scoring with 3-Stage Recovery Sequencing",
      "calculation" -> "Score = F1(Value) + F2(Erosion) + F3(Urgency) + F4(Readiness) + F5(Complexity)",
      "result"      -> result,
      "explanation" -> StringJoin[
        "Priority scores computed using 5 weighted factors: asset value (35%), ",
        "inflation erosion severity (25%), delay urgency (20%), ",
        "document readiness (10%), and legal complexity (10% inverse). ",
        "Assets staged into 3 recovery phases for optimal sequencing."
      ]
    |>, "JSON", "Compact" -> True];

    Print[jsonOutput];
  ]
]
