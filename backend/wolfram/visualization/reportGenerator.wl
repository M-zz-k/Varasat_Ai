(* ::Package:: *)

generateSummaryReport[assetCount_, totalValue_, riskScore_] := 
  Module[{report},
    report = "Wolfram Computational Audit: " <> ToString[assetCount] <> " assets evaluated at total nominal value Rs." <> 
             ToString[Round[totalValue]] <> ". Overall risk priority score calculated at " <> ToString[riskScore] <> "/100.";
    <|"summary" -> report|>
  ]

If[Length[$ScriptCommandLine] >= 4,
  Module[{assetCount, totalValue, riskScore, result, jsonOutput},
    assetCount = ToExpression[$ScriptCommandLine[[2]]];
    totalValue = ToExpression[$ScriptCommandLine[[3]]];
    riskScore = ToExpression[$ScriptCommandLine[[4]]];
    
    result = generateSummaryReport[assetCount, totalValue, riskScore];
    
    jsonOutput = ExportString[<|
      "module" -> "visualization/reportGenerator",
      "inputs" -> <|"assetCount" -> assetCount, "totalValue" -> totalValue, "riskScore" -> riskScore|>,
      "calculation" -> "String synthesis",
      "result" -> result,
      "explanation" -> "Synthesized a structured executive string for injection into the final PDF."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
