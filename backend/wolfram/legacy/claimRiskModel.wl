(* ::Package:: *)

(* 
  Claim Risk Model
  Calculates a 0-100 score based on documentation, nominee status, and asset age.
*)

calculateRiskScore[assetValue_, docsComplete_, nomineeAvailable_, delayYears_] := 
  Module[{baseScore = 100, deductions = 0, riskLevel, reason},
    
    (* Deductions based on missing elements *)
    If[Not[docsComplete], deductions += 35];
    If[Not[nomineeAvailable], deductions += 40];
    
    (* Time penalty *)
    deductions += Min[delayYears * 2, 20];
    
    (* Value complexity penalty: higher value without nominee is riskier *)
    If[assetValue > 1000000 && Not[nomineeAvailable], deductions += 10];
    
    baseScore = Max[0, baseScore - deductions];
    
    riskLevel = Which[
      baseScore >= 80, "Low",
      baseScore >= 50, "Medium",
      True, "High"
    ];
    
    reason = "Risk score computed. " <> 
      If[Not[nomineeAvailable], "Absence of nominee increases legal complexity. ", ""] <>
      If[Not[docsComplete], "Missing documents require affidavit preparation. ", ""];
      
    <|
      "score" -> Round[baseScore],
      "riskLevel" -> riskLevel,
      "reason" -> reason
    |>
  ]

(* Command Line Argument Parsing *)
If[Length[$ScriptCommandLine] >= 5,
  Module[{assetValue, docsComplete, nomineeAvailable, delayYears, result, jsonOutput},
    assetValue = ToExpression[$ScriptCommandLine[[2]]];
    docsComplete = ToExpression[$ScriptCommandLine[[3]]];
    nomineeAvailable = ToExpression[$ScriptCommandLine[[4]]];
    delayYears = ToExpression[$ScriptCommandLine[[5]]];
    
    result = calculateRiskScore[assetValue, docsComplete, nomineeAvailable, delayYears];
    
    jsonOutput = ExportString[result, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
