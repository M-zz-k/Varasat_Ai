(* ::Package:: *)

(* 
  Recovery Simulation
  Uses simulation models to estimate fast, normal, and delayed recovery timelines in days.
*)

simulateRecoveryTimeline[nomineeAvailable_, docsComplete_] := 
  Module[{baseTime, fast, normal, delayed, jsonOutput},
    
    (* Base time in days *)
    baseTime = If[nomineeAvailable && docsComplete, 30, 
                 If[nomineeAvailable, 60, 
                 If[docsComplete, 120, 180]]];
                 
    fast = Round[baseTime * RandomReal[{0.8, 0.95}]];
    normal = baseTime;
    delayed = Round[baseTime * RandomReal[{1.2, 1.5}]];
    
    <|
      "fastRecoveryDays" -> fast,
      "normalRecoveryDays" -> normal,
      "delayedRecoveryDays" -> delayed
    |>
  ]

(* Command Line Argument Parsing *)
If[Length[$ScriptCommandLine] >= 3,
  Module[{nomineeAvailable, docsComplete, result, jsonOutput},
    nomineeAvailable = ToExpression[$ScriptCommandLine[[2]]];
    docsComplete = ToExpression[$ScriptCommandLine[[3]]];
    
    result = simulateRecoveryTimeline[nomineeAvailable, docsComplete];
    
    jsonOutput = ExportString[result, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
