(* ::Package:: *)
(* ============================================================
   VARASAT — Asset Growth Analysis Engine
   Module: analytics/assetGrowthAnalysis.wl
   
   Responsibilities:
     1. Asset-type-specific growth rate modelling
     2. 15-year projection trajectories  
     3. Compound Annual Growth Rate (CAGR) calculation
     4. Inflation-real return calculation (Fisher equation)
     5. Growth ranking across asset types
     6. Breakeven recovery year identification
   ============================================================ *)

(* ── Asset Classification Rates ──────────────────────────── *)
(* Based on long-term Indian financial market averages *)
assetGrowthRate[type_] :=
  Which[
    type == "Bank",        0.065,  (* SB rate avg 6.5% *)
    type == "FD",          0.075,  (* FD avg 7.5%       *)
    type == "Insurance",   0.055,  (* Traditional LIC   *)
    type == "ULIP",        0.10,   (* Market-linked LIC *)
    type == "Investments", 0.13,   (* Equity MF avg     *)
    type == "MutualFund",  0.12,   (* Diversified MF    *)
    type == "PPF",         0.071,  (* PPF current rate  *)
    type == "EPF",         0.082,  (* EPF rate 2024     *)
    type == "Property",    0.09,   (* Real estate India  *)
    True,                  0.07    (* Default            *)
  ]

(* ── CAGR Computation ────────────────────────────────────── *)
calculateCAGR[beginValue_, endValue_, years_] :=
  If[years > 0 && beginValue > 0,
    N[((endValue / beginValue)^(1 / years) - 1) * 100],
    0.0
  ]

(* ── Real Return (Fisher Equation) ──────────────────────── *)
(* (1 + nominal) / (1 + inflation) - 1 *)
calculateRealReturn[nominalRate_, inflationRate_] :=
  N[((1 + nominalRate) / (1 + inflationRate) - 1) * 100]

(* ── Breakeven Recovery Year ─────────────────────────────── *)
(* Year at which nominal growth offsets cumulative inflation *)
findBreakevenYear[amount_, growthRate_, inflationRate_, maxYears_] :=
  Module[{breakeven = -1},
    Do[
      If[
        N[amount * (1 + growthRate)^y] > N[amount * (1 + inflationRate)^y * 1.1],
        (* 10% real gain threshold *)
        breakeven = y; Break[],
        Null
      ],
      {y, 1, maxYears}
    ];
    breakeven
  ]

(* ── Single Asset Projection ─────────────────────────────── *)
projectSingleAsset[type_, amount_, inflationRate_, maxYears_] :=
  Module[{rate = assetGrowthRate[type], realRate, cagrFinal, breakeven},
    realRate  = calculateRealReturn[rate, inflationRate];
    cagrFinal = calculateCAGR[amount, amount * (1 + rate)^maxYears, maxYears];
    breakeven = findBreakevenYear[amount, rate, inflationRate, maxYears];
    <|
      "type"               -> type,
      "nominalGrowthRate"  -> Round[rate * 100, 0.1],
      "realReturnRate"     -> Round[realRate, 0.2],
      "cagr"               -> Round[cagrFinal, 0.1],
      "breakevenYear"      -> breakeven,
      "growthTrajectory"   -> Table[
        <|
          "year"         -> y,
          "nominalValue" -> Round[N[amount * (1 + rate)^y]],
          "realValue"    -> Round[N[amount * (1 + rate)^y / (1 + inflationRate)^y]],
          "inflationLoss" -> Round[N[amount * (1 + inflationRate)^y - amount]]
        |>,
        {y, 0, maxYears}
      ]
    |>
  ]

(* ── Portfolio Multi-Asset Growth ────────────────────────── *)
compareAssetPerformance[assets_, inflationRate_, maxYears_] :=
  Module[{projections, ranked},
    projections = Map[
      projectSingleAsset[#["type"], #["amount"], inflationRate, maxYears] &,
      assets
    ];
    (* Rank by real return rate descending *)
    ranked = SortBy[projections, -#["realReturnRate"] &];
    <|
      "assetTrajectories"  -> projections,
      "rankedByRealReturn" -> Map[<|"type" -> #["type"], "realReturn" -> #["realReturnRate"]|> &, ranked],
      "bestPerforming"     -> If[Length[ranked] > 0, ranked[[1]]["type"], "N/A"],
      "worstPerforming"    -> If[Length[ranked] > 0, ranked[[-1]]["type"], "N/A"]
    |>
  ]

(* ── Entry Point ─────────────────────────────────────────── *)
If[Length[$ScriptCommandLine] >= 2,
  Module[{jsonInput, assetsList, inflationRate, maxYears, result, jsonOutput},
    jsonInput     = $ScriptCommandLine[[2]];
    assetsList    = ImportString[jsonInput, "JSON"];
    inflationRate = If[Length[$ScriptCommandLine] >= 3, ToExpression[$ScriptCommandLine[[3]]], 0.06];
    maxYears      = If[Length[$ScriptCommandLine] >= 4, ToExpression[$ScriptCommandLine[[4]]], 10];

    result = compareAssetPerformance[assetsList, inflationRate, maxYears];

    jsonOutput = ExportString[<|
      "moduleName"  -> "analytics/assetGrowthAnalysis",
      "version"     -> "2.0-enhanced",
      "inputs"      -> <|
        "assetsCount"   -> Length[assetsList],
        "inflationRate" -> inflationRate,
        "maxYears"      -> maxYears
      |>,
      "method"      -> "Asset-Classified Exponential Growth with Fisher Real Return",
      "calculation" -> "NV=P(1+r)^t; RV=NV/(1+i)^t; RealReturn=((1+r)/(1+i)-1)*100",
      "result"      -> result,
      "explanation" -> StringJoin[
        "Generated asset-type-specific growth trajectories using Indian market rates. ",
        "Real returns computed using Fisher equation. ",
        "Breakeven year identifies when nominal gain materially exceeds inflation drag. ",
        "Assets ranked by real return to guide recovery prioritisation."
      ]
    |>, "JSON", "Compact" -> True];

    Print[jsonOutput];
  ]
]
