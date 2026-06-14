(* ::Package:: *)

calculateEligibility[nomineeAvailable_, amount_, docsComplete_] := 
  Module[{score = 0, probability},
    If[nomineeAvailable, score += 50];
    If[amount < 500000, score += 20];
    If[docsComplete, score += 30];
    
    probability = Which[
      score >= 80, "High Readiness",
      score >= 50, "Medium Readiness",
      True, "Low Readiness"
    ];
    <|"score" -> score, "readiness" -> probability|>
  ]

If[Length[$ScriptCommandLine] >= 4,
  Module[{nomineeAvailable, amount, docsComplete, result, jsonOutput},
    nomineeAvailable = ToExpression[$ScriptCommandLine[[2]]];
    amount = ToExpression[$ScriptCommandLine[[3]]];
    docsComplete = ToExpression[$ScriptCommandLine[[4]]];
    
    result = calculateEligibility[nomineeAvailable, amount, docsComplete];
    
    jsonOutput = ExportString[<|
      "module" -> "intelligence/eligibilityScoring",
      "inputs" -> <|"nomineeAvailable" -> nomineeAvailable, "amount" -> amount, "docsComplete" -> docsComplete|>,
      "calculation" -> "Additive structural heuristics scoring",
      "result" -> result,
      "explanation" -> "Scored the overall claim readiness based on primary heuristic thresholds."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
