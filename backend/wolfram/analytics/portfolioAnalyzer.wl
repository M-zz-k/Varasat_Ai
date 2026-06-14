(* ::Package:: *)

analyzePortfolio[assetsList_] := 
  Module[{totalValue, distribution, growthComparison, types, amounts},
    If[Length[assetsList] == 0,
      Return[<|"totalValue" -> 0, "distribution" -> {}, "growthComparison" -> {}|>]
    ];
    
    types = assetsList[[All, "type"]];
    amounts = assetsList[[All, "amount"]];
    totalValue = Total[amounts];
    
    distribution = MapThread[
      <|"type" -> #1, "amount" -> #2, "percentage" -> Round[#2 / totalValue * 100, 0.1]|> &,
      {types, amounts}
    ];
    
    growthComparison = MapThread[
      Module[{rate = Which[#1 == "Bank", 0.06, #1 == "Insurance", 0.05, #1 == "Mutual Funds", 0.12, True, 0.07]},
        <|"type" -> #1, "estimated10YrGrowth" -> Round[#2 * (1 + rate)^10 - #2]|>
      ] &,
      {types, amounts}
    ];
    
    <|"totalValue" -> Round[totalValue], "distribution" -> distribution, "growthComparison" -> growthComparison|>
  ]

If[Length[$ScriptCommandLine] >= 2,
  Module[{jsonInput, assetsList, result, jsonOutput},
    jsonInput = $ScriptCommandLine[[2]];
    assetsList = ImportString[jsonInput, "JSON"];
    
    result = analyzePortfolio[assetsList];
    
    jsonOutput = ExportString[<|
      "module" -> "analytics/portfolioAnalyzer",
      "inputs" -> <|"assetsCount" -> Length[assetsList]|>,
      "calculation" -> "Weighted distribution and exponential growth estimation",
      "result" -> result,
      "explanation" -> "Analyzed portfolio distribution and projected 10-year yields."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
