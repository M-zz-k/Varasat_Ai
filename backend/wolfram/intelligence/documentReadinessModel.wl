(* ::Package:: *)

analyzeDocumentReadiness[requiredDocs_, missingDocs_, assetInfoAvailable_] := 
  Module[{totalDocs, missingCount, readinessScore, recommendation},
    totalDocs = Length[requiredDocs];
    missingCount = Length[missingDocs];
    
    readinessScore = Round[Max[0, 100 - (missingCount / Max[1, totalDocs] * 60) - (If[assetInfoAvailable, 0, 40])]];
    
    recommendation = Which[
      readinessScore >= 80, "Documentation is highly complete. Proceed to next stage.",
      readinessScore >= 50, "Some documentation missing. Collection recommended.",
      True, "Critical documentation missing. Prioritize gathering missing items."
    ];
    
    <|
      "readinessScore" -> readinessScore,
      "missingItems" -> missingDocs,
      "recommendation" -> recommendation
    |>
  ]

If[Length[$ScriptCommandLine] >= 4,
  Module[{required, missing, assetInfo, result, jsonOutput},
    required = ImportString[$ScriptCommandLine[[2]], "JSON"];
    missing = ImportString[$ScriptCommandLine[[3]], "JSON"];
    assetInfo = ToExpression[$ScriptCommandLine[[4]]];
    
    result = analyzeDocumentReadiness[required, missing, assetInfo];
    
    jsonOutput = ExportString[<|
      "moduleName" -> "intelligence/documentReadinessModel",
      "inputs" -> <|"requiredCount" -> Length[required], "missingCount" -> Length[missing], "assetInfoAvailable" -> assetInfo|>,
      "method" -> "Algorithmic Completeness Deduction",
      "calculation" -> "Score = 100 - (Missing/Total * 60) - AssetInfoPenalty",
      "result" -> result,
      "explanation" -> "Evaluated documentation completeness providing a readiness score without making legal decisions."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
