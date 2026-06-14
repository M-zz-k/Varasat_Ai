(* ::Package:: *)

(* 
  Eligibility Rule Engine
  Uses rules to determine fast track claim probability.
*)

checkEligibility[nomineeAvailable_, amount_, docsComplete_] := 
  Module[{score = 0, probability, threshold = 500000},
    
    If[nomineeAvailable, score += 50];
    If[amount < threshold, score += 20];
    If[docsComplete, score += 30];
    
    probability = Which[
      score >= 80, "High",
      score >= 50, "Medium",
      True, "Low"
    ];
    
    <|
      "eligibilityScore" -> score,
      "fastTrackProbability" -> probability
    |>
  ]

(* Command Line Argument Parsing *)
If[Length[$ScriptCommandLine] >= 4,
  Module[{nomineeAvailable, amount, docsComplete, result, jsonOutput},
    nomineeAvailable = ToExpression[$ScriptCommandLine[[2]]];
    amount = ToExpression[$ScriptCommandLine[[3]]];
    docsComplete = ToExpression[$ScriptCommandLine[[4]]];
    
    result = checkEligibility[nomineeAvailable, amount, docsComplete];
    
    jsonOutput = ExportString[result, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
