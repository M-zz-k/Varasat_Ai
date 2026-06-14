(* ::Package:: *)

calculateTotalAssets[assetsList_] := Total[Map[#["amount"] &, assetsList]]

calculateAssetDistribution[assetsList_] := 
  Module[{total = calculateTotalAssets[assetsList]},
    Map[
      <|"type" -> #["type"], "percentage" -> Round[(#["amount"] / total) * 100, 0.1]|> &,
      assetsList
    ]
  ]

generatePortfolioSummary[assetsList_] := 
  Module[{total, distribution},
    If[Length[assetsList] == 0, Return[<|"totalAssets" -> 0, "distribution" -> {}|>]];
    total = calculateTotalAssets[assetsList];
    distribution = calculateAssetDistribution[assetsList];
    <|"totalAssets" -> total, "distribution" -> distribution|>
  ]

If[Length[$ScriptCommandLine] >= 2,
  Module[{jsonInput, assetsList, result, jsonOutput},
    jsonInput = $ScriptCommandLine[[2]];
    assetsList = ImportString[jsonInput, "JSON"];
    
    result = generatePortfolioSummary[assetsList];
    
    jsonOutput = ExportString[<|
      "moduleName" -> "analytics/portfolioIntelligence",
      "inputs" -> <|"assetsCount" -> Length[assetsList]|>,
      "method" -> "Aggregation and Proportional Weighting",
      "calculation" -> "Weight = (Asset Amount / Total Amount) * 100",
      "result" -> result,
      "explanation" -> "Calculated total asset valuation and determined proportional diversification across the portfolio."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
