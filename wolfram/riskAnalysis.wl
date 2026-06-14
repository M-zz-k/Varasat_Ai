#!/usr/bin/env wolframscript

(* 
  riskAnalysis.wl 
  Inheritance Claim Risk Model
*)

If[Length[$ScriptCommandLine] < 2,
    Print["Usage: wolframscript -script riskAnalysis.wl '<json>'"];
    Exit[1]
];

jsonInput = $ScriptCommandLine[[2]];
data = ImportString[jsonInput, "RawJSON"];

missingDocs = Lookup[data, "missingDocs", 0]; (* Number of missing docs *)
noNominee = Lookup[data, "noNominee", False];
amount = N[Lookup[data, "amount", 0]];
delayYears = N[Lookup[data, "delayYears", 0]];

riskScore = 0;

If[missingDocs > 0, riskScore += missingDocs * 15];
If[noNominee, riskScore += 35];
If[amount > 1000000, riskScore += 10]; (* High value attracts scrutiny *)
If[delayYears > 5, riskScore += (delayYears - 5) * 2];

finalRiskScore = Max[0, Min[100, riskScore]];

riskLevel = Which[
    finalRiskScore < 30, "Low",
    finalRiskScore < 60, "Medium",
    True, "High"
];

factors = {};
If[missingDocs > 0, AppendTo[factors, ToString[missingDocs] <> " missing documents"]];
If[noNominee, AppendTo[factors, "No registered nominee"]];
If[amount > 1000000, AppendTo[factors, "High asset value (scrutiny)"]];
If[delayYears > 5, AppendTo[factors, "Long delay (" <> ToString[delayYears] <> " years)"]];

result = <|
    "riskLevel" -> riskLevel,
    "riskScore" -> finalRiskScore,
    "factors" -> factors
|>;

Print[ExportString[result, "JSON", "Compact" -> True]];
