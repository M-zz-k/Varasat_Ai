(* ::Package:: *)

optimizePriority[assetsList_] := 
  Module[{ranked},
    If[Length[assetsList] == 0, Return[{}]];
    
    ranked = Map[
      Module[{amount = #["amount"], urgency = #["urgency"] /. _Missing -> 1, docsComplete = #["docsComplete"] /. _Missing -> True, riskDelay = #["riskDelay"] /. _Missing -> 1, score},
        score = (amount / 100000) * urgency * (If[docsComplete, 1.5, 0.5]) / Max[1, riskDelay];
        <|
          "type" -> #["type"], 
          "score" -> Round[score, 0.1], 
          "reason" -> If[docsComplete, "High priority due to complete documentation", "Deprioritized due to missing documentation"]
        |>
      ] &,
      assetsList
    ];
    
    SortBy[ranked, -#["score"] &]
  ]

If[Length[$ScriptCommandLine] >= 2,
  Module[{jsonInput, assetsList, result, jsonOutput},
    jsonInput = $ScriptCommandLine[[2]];
    assetsList = ImportString[jsonInput, "JSON"];
    
    result = <|"ranking" -> optimizePriority[assetsList]|>;
    
    jsonOutput = ExportString[<|
      "moduleName" -> "intelligence/assetPriorityOptimization",
      "inputs" -> <|"assetsCount" -> Length[assetsList]|>,
      "method" -> "Heuristic Priority Scaling",
      "calculation" -> "Score = (Value/10^5) * Urgency * DocsMultiplier / Risk",
      "result" -> result,
      "explanation" -> "Calculated a recovery priority score supporting optimal staging of asset retrieval."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
