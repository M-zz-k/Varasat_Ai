(* ::Package:: *)

analyzeAsset[type_, amount_, yearsDelayed_] := 
  Module[{complexity},
    complexity = Which[
      type == "Real Estate", 0.9,
      type == "Bank", 0.2,
      type == "Insurance", 0.4,
      True, 0.5
    ];
    <|"type" -> type, "amount" -> amount, "complexityFactor" -> complexity|>
  ]

If[Length[$ScriptCommandLine] >= 4,
  Module[{type, amount, years, result, jsonOutput},
    type = $ScriptCommandLine[[2]];
    amount = ToExpression[$ScriptCommandLine[[3]]];
    years = ToExpression[$ScriptCommandLine[[4]]];
    
    result = analyzeAsset[type, amount, years];
    
    jsonOutput = ExportString[<|
      "module" -> "analytics/assetAnalysis",
      "inputs" -> <|"type" -> type, "amount" -> amount, "yearsDelayed" -> years|>,
      "calculation" -> "Complexity mapping based on asset class",
      "result" -> result,
      "explanation" -> "Evaluated individual asset complexity for recovery."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
