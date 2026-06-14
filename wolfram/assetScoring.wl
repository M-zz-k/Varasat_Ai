#!/usr/bin/env wolframscript

(* 
  assetScoring.wl 
  Calculates Recovery Priority Score (0-100)
*)

If[Length[$ScriptCommandLine] < 2,
    Print["Usage: wolframscript -script assetScoring.wl '<json>'"];
    Exit[1]
];

jsonInput = $ScriptCommandLine[[2]];
data = ImportString[jsonInput, "RawJSON"];

assetType = Lookup[data, "assetType", "Bank Account"];
amount = N[Lookup[data, "amount", 0]];
nomineeAvailable = Lookup[data, "nomineeAvailable", False];
docCompleteness = N[Lookup[data, "docCompleteness", 0]]; (* 0 to 1 *)
delayYears = N[Lookup[data, "delayYears", 0]];

(* Base score from doc completeness *)
score = docCompleteness * 40;

(* Nominee bonus *)
If[nomineeAvailable, score += 30];

(* Amount factor (higher amount = higher priority up to a cap) *)
amountFactor = Min[amount / 500000, 1] * 20;
score += amountFactor;

(* Delay penalty (longer delay = harder to recover, slight drop in priority) *)
delayPenalty = Min[delayYears * 1.5, 10];
score -= delayPenalty;

(* Normalize between 0 and 100 *)
finalScore = Max[0, Min[100, Round[score]]];

riskLevel = Which[
    finalScore >= 80, "Low",
    finalScore >= 50, "Medium",
    True, "High"
];

reason = If[nomineeAvailable && docCompleteness > 0.8, 
    "Nominee available and documents complete", 
    "Missing critical documents or nominee, increasing complexity"
];

result = <|
    "priorityScore" -> finalScore,
    "risk" -> riskLevel,
    "reason" -> reason
|>;

Print[ExportString[result, "JSON", "Compact" -> True]];
