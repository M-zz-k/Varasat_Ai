(* ::Package:: *)
(* ============================================================
   VARASAT — Portfolio Intelligence Engine
   Module: analytics/portfolioIntelligence.wl
   
   Responsibilities:
     1. Total portfolio valuation
     2. Weighted asset diversification analysis
     3. Concentration risk identification (Herfindahl Index)
     4. Inflation-adjusted portfolio net worth
     5. Recovery value estimation post legal costs
     6. Asset liquidity scoring
   ============================================================ *)

(* ── Herfindahl-Hirschman Concentration Index ────────────── *)
(*
   HHI = Sum(share_i^2) * 10000
   HHI < 1500  → Diversified
   HHI 1500-2500 → Moderate concentration
   HHI > 2500   → Highly concentrated
*)
calculateHHI[distribution_] :=
  Module[{shares},
    shares = Map[#["percentage"] / 100 &, distribution];
    Round[Total[Map[#^2 &, shares]] * 10000]
  ]

(* ── Asset Liquidity Scoring ─────────────────────────────── *)
assetLiquidityScore[type_] :=
  Which[
    type == "Bank",        95,  (* Highly liquid *)
    type == "FD",          80,  (* Penalty for premature withdrawal *)
    type == "Insurance",   60,  (* Surrender value penalty *)
    type == "ULIP",        50,  (* Lock-in + market risk *)
    type == "PPF",         40,  (* 15-year lock-in *)
    type == "EPF",         50,  (* Conditional withdrawal *)
    type == "MutualFund",  85,  (* T+2 redemption *)
    type == "Investments", 75,  (* Market-dependent *)
    type == "Property",    10,  (* Highly illiquid *)
    True,                  60   (* Default *)
  ]

(* ── Portfolio Summary ────────────────────────────────────── *)
calculateTotalAssets[assetsList_] :=
  Total[Map[#["amount"] &, assetsList]]

calculateAssetDistribution[assetsList_] :=
  Module[{total = calculateTotalAssets[assetsList]},
    Map[
      <|
        "type"           -> #["type"],
        "amount"         -> #["amount"],
        "percentage"     -> Round[N[(#["amount"] / total) * 100], 0.1],
        "liquidityScore" -> assetLiquidityScore[#["type"]]
      |> &,
      assetsList
    ]
  ]

generatePortfolioSummary[assetsList_, inflationRate_, delayYears_] :=
  Module[{total, distribution, hhi, wAvgLiquidity, inflAdjTotal, concentrationRisk},
    If[Length[assetsList] == 0,
      Return[<|"totalAssets" -> 0, "distribution" -> {}, "hhi" -> 0|>]
    ];

    total        = calculateTotalAssets[assetsList];
    distribution = calculateAssetDistribution[assetsList];
    hhi          = calculateHHI[distribution];

    (* Weighted average liquidity score *)
    wAvgLiquidity = Round[N[
      Total[Map[(#["percentage"] / 100) * #["liquidityScore"] &, distribution]]
    ], 0.1];

    (* Inflation-adjusted net worth *)
    inflAdjTotal = Round[N[total / (1 + inflationRate)^delayYears]];

    concentrationRisk = Which[
      hhi < 1500,  "LOW — Well diversified",
      hhi <= 2500, "MEDIUM — Moderate concentration",
      True,        "HIGH — Portfolio highly concentrated in one asset class"
    ];

    <|
      "totalNominalValue"     -> total,
      "inflationAdjustedValue" -> inflAdjTotal,
      "purchasingPowerLoss"   -> total - inflAdjTotal,
      "distribution"          -> distribution,
      "herfindahlIndex"       -> hhi,
      "concentrationRisk"     -> concentrationRisk,
      "weightedLiquidityScore" -> wAvgLiquidity,
      "liquidityRating"       -> Which[
        wAvgLiquidity >= 75, "HIGH — Portfolio highly liquid",
        wAvgLiquidity >= 50, "MEDIUM — Moderate liquidity",
        True,                "LOW — Illiquid assets dominate"
      ],
      "recoveryComplexityIndex" -> Round[N[(hhi / 10000) * (1 - wAvgLiquidity / 100) * 100], 0.1]
    |>
  ]

(* ── Entry Point ─────────────────────────────────────────── *)
If[Length[$ScriptCommandLine] >= 2,
  Module[{jsonInput, assetsList, inflationRate, delayYears, result, jsonOutput},
    jsonInput     = $ScriptCommandLine[[2]];
    assetsList    = ImportString[jsonInput, "JSON"];
    inflationRate = If[Length[$ScriptCommandLine] >= 3, ToExpression[$ScriptCommandLine[[3]]], 0.06];
    delayYears    = If[Length[$ScriptCommandLine] >= 4, ToExpression[$ScriptCommandLine[[4]]], 5];

    result = generatePortfolioSummary[assetsList, inflationRate, delayYears];

    jsonOutput = ExportString[<|
      "moduleName"  -> "analytics/portfolioIntelligence",
      "version"     -> "2.0-enhanced",
      "inputs"      -> <|
        "assetsCount"   -> Length[assetsList],
        "inflationRate" -> inflationRate,
        "delayYears"    -> delayYears
      |>,
      "method"      -> "HHI Concentration Analysis with Weighted Liquidity Scoring",
      "calculation" -> "HHI=Sum(s_i^2)*10000; wLiquidity=Sum(share_i*liquidity_i); RealNW=NW/(1+i)^t",
      "result"      -> result,
      "explanation" -> StringJoin[
        "Calculated Herfindahl-Hirschman Index for portfolio concentration risk. ",
        "Weighted average liquidity score across asset types using Indian market benchmarks. ",
        "Inflation-adjusted net worth shows real purchasing power retained. ",
        "Recovery Complexity Index (0-100) guides claim sequencing strategy."
      ]
    |>, "JSON", "Compact" -> True];

    Print[jsonOutput];
  ]
]
