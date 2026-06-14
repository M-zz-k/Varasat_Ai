(* ::Package:: *)

calculateClaimRisk[docsComplete_, nomineeAvailable_, assetClarity_] := 
  Module[{docsWeight = 0.40, nomineeWeight = 0.30, clarityWeight = 0.30, 
          docsScore, nomineeScore, clarityScore, finalScore, riskLevel, factors},
    
    docsScore = If[docsComplete, 0, 100];
    nomineeScore = If[nomineeAvailable, 0, 100];
    clarityScore = If[assetClarity, 0, 100];
    
    finalScore = (docsScore * docsWeight) + (nomineeScore * nomineeWeight) + (clarityScore * clarityWeight);
    
    riskLevel = Which[
      finalScore >= 70, "High Risk",
      finalScore >= 35, "Medium Risk",
      True, "Low Risk"
    ];
    
    factors = <|
      "Document completeness (40%)" -> If[docsComplete, "Satisfied", "Missing"],
      "Nominee availability (30%)" -> If[nomineeAvailable, "Satisfied", "Missing"],
      "Asset information clarity (30%)" -> If[assetClarity, "Satisfied", "Missing"]
    |>;
    
    <|"score" -> Round[finalScore], "riskLevel" -> riskLevel, "factors" -> factors|>
  ]

If[Length[$ScriptCommandLine] >= 4,
  Module[{docsComplete, nomineeAvailable, assetClarity, result, jsonOutput},
    docsComplete = ToExpression[$ScriptCommandLine[[2]]];
    nomineeAvailable = ToExpression[$ScriptCommandLine[[3]]];
    assetClarity = ToExpression[$ScriptCommandLine[[4]]];
    
    result = calculateClaimRisk[docsComplete, nomineeAvailable, assetClarity];
    
    jsonOutput = ExportString[<|
      "module" -> "intelligence/claimRiskEngine",
      "inputs" -> <|"docsComplete" -> docsComplete, "nomineeAvailable" -> nomineeAvailable, "assetClarity" -> assetClarity|>,
      "calculation" -> "Weighted deductions: Docs 40%, Nominee 30%, Clarity 30%",
      "result" -> result,
      "explanation" -> "Computed readiness score evaluating structural missing components."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
