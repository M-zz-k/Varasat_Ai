(* ::Package:: *)

projectAssetGrowth[type_, amount_, maxYears_] := 
  Module[{rate = Which[type == "Bank", 0.06, type == "Insurance", 0.05, type == "Investments", 0.12, True, 0.07]},
    Table[
      <|"year" -> y, "value" -> Round[amount * (1 + rate)^y]|>,
      {y, 0, maxYears}
    ]
  ]

compareAssetPerformance[assets_] := 
  Module[{types, amounts, maxYears = 10},
    Map[
      <|"type" -> #["type"], "growthTrajectory" -> projectAssetGrowth[#["type"], #["amount"], maxYears]|> &,
      assets
    ]
  ]

If[Length[$ScriptCommandLine] >= 2,
  Module[{jsonInput, assetsList, result, jsonOutput},
    jsonInput = $ScriptCommandLine[[2]];
    assetsList = ImportString[jsonInput, "JSON"];
    
    result = <|
      "assetTrajectories" -> compareAssetPerformance[assetsList]
    |>;
    
    jsonOutput = ExportString[<|
      "moduleName" -> "analytics/assetGrowthAnalysis",
      "inputs" -> <|"assetsCount" -> Length[assetsList]|>,
      "method" -> "Discrete Exponential Growth Projection",
      "calculation" -> "y(t) = P(1+r)^t grouped by asset classification rates",
      "result" -> result,
      "explanation" -> "Generated year-wise growth curve data for Bank deposits, Insurance, and Investments over a 10-year horizon."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
