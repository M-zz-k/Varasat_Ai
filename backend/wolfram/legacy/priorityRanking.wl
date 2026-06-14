(* ::Package:: *)

rankRecoveryPriority[assetsList_] := 
  Module[{scoredAssets},
    If[Length[assetsList] == 0, Return[{}]];
    
    scoredAssets = Map[
      Module[{val = #["amount"], risk = #["riskScore"], urgency = #["urgencyFactor"], priority},
        (* Priority favors high value, high urgency, low risk *)
        priority = (val / 100000) * urgency / Max[1, risk];
        <|"type" -> #["type"], "priorityScore" -> Round[priority, 0.1]|>
      ] &,
      assetsList
    ];
    
    SortBy[scoredAssets, -#["priorityScore"] &]
  ]

If[Length[$ScriptCommandLine] >= 2,
  Module[{jsonInput, assetsList, result, jsonOutput},
    jsonInput = $ScriptCommandLine[[2]];
    assetsList = ImportString[jsonInput, "JSON"];
    
    result = rankRecoveryPriority[assetsList];
    
    jsonOutput = ExportString[<|
      "module" -> "intelligence/priorityRanking",
      "inputs" -> <|"assetsCount" -> Length[assetsList]|>,
      "calculation" -> "P = (Value / 10^5) * Urgency / Max(1, Risk)",
      "result" -> result,
      "explanation" -> "Ranked multiple assets to determine the optimal recovery sequencing path."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
