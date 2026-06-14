#!/usr/bin/env wolframscript

(* 
  recoveryPrediction.wl 
  Predicts Recovery Timeline and Effort
*)

If[Length[$ScriptCommandLine] < 2,
    Print["Usage: wolframscript -script recoveryPrediction.wl '<json>'"];
    Exit[1]
];

jsonInput = $ScriptCommandLine[[2]];
data = ImportString[jsonInput, "RawJSON"];

assetType = Lookup[data, "assetType", "Bank Account"];
hasNominee = Lookup[data, "hasNominee", False];
delayYears = N[Lookup[data, "delayYears", 0]];
isDisputed = Lookup[data, "isDisputed", False];

(* Base days *)
baseTimeline = Which[
    assetType == "Bank Account", 30,
    assetType == "Mutual Fund", 45,
    assetType == "Insurance", 60,
    assetType == "Real Estate", 180,
    True, 45
];

(* Multipliers *)
multiplier = 1.0;
If[Not[hasNominee], multiplier *= 2.5]; (* Needs succession certificate *)
If[delayYears > 10, multiplier *= 1.5]; (* Archive retrieval *)
If[isDisputed, multiplier *= 3.0]; (* Legal delays *)

estimatedDays = Round[baseTimeline * multiplier];

result = <|
    "estimatedDays" -> estimatedDays,
    "estimatedMonths" -> Round[estimatedDays / 30.0, 0.1],
    "timeline" -> If[estimatedDays <= 90, "Short", If[estimatedDays <= 180, "Medium", "Long"]],
    "analysis" -> "Timeline computed using asset class baselines and legal friction multipliers."
|>;

Print[ExportString[result, "JSON", "Compact" -> True]];
