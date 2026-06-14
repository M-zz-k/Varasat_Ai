(* ::Package:: *)

simulateRecoveryTimeline[nomineeAvailable_, docsComplete_] := 
  Module[{baseTime, fast, normal, delayed},
    baseTime = If[nomineeAvailable && docsComplete, 30, 
                 If[nomineeAvailable, 60, 
                 If[docsComplete, 120, 180]]];
                 
    fast = Round[baseTime * RandomReal[{0.8, 0.95}]];
    normal = baseTime;
    delayed = Round[baseTime * RandomReal[{1.2, 1.5}]];
    
    <|"fastRecoveryDays" -> fast, "normalRecoveryDays" -> normal, "delayedRecoveryDays" -> delayed|>
  ]

If[Length[$ScriptCommandLine] >= 3,
  Module[{nomineeAvailable, docsComplete, result, jsonOutput},
    nomineeAvailable = ToExpression[$ScriptCommandLine[[2]]];
    docsComplete = ToExpression[$ScriptCommandLine[[3]]];
    
    result = simulateRecoveryTimeline[nomineeAvailable, docsComplete];
    
    jsonOutput = ExportString[<|
      "module" -> "analytics/recoverySimulation",
      "inputs" -> <|"nomineeAvailable" -> nomineeAvailable, "docsComplete" -> docsComplete|>,
      "calculation" -> "Monte Carlo simulation bounding delay variance",
      "result" -> result,
      "explanation" -> "Simulation based estimate of recovery timelines across three confidence intervals."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
