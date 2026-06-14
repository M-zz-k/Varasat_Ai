#!/usr/bin/env wolframscript

(* 
  financialModels.wl 
  Calculates Future Value and Asset Growth Impact
*)

If[Length[$ScriptCommandLine] < 2,
    Print["Usage: wolframscript -script financialModels.wl '<json>'"];
    Exit[1]
];

jsonInput = $ScriptCommandLine[[2]];
data = ImportString[jsonInput, "RawJSON"];

amount = N[Lookup[data, "amount", 0]];
inflationRate = N[Lookup[data, "inflationRate", 0.06]];
delayYears = N[Lookup[data, "delayYears", 0]];

(* Future Value Impact *)
futureValue = amount * (1 + inflationRate)^delayYears;
purchasingPowerImpact = futureValue - amount;
realValueToday = amount / (1 + inflationRate)^delayYears;

(* Asset Growth Simulation *)
(* Simulating how the asset would have grown in a standard 8% mutual fund vs inflation *)
marketReturnRate = 0.08;
marketValue = amount * (1 + marketReturnRate)^delayYears;
opportunityLoss = marketValue - amount;

result = <|
    "futureValue" -> Round[futureValue],
    "purchasingPowerImpact" -> Round[purchasingPowerImpact],
    "realValueToday" -> Round[realValueToday],
    "marketOpportunityLoss" -> Round[opportunityLoss],
    "analysis" -> "Wolfram simulated the financial trajectory over " <> ToString[delayYears] <> " years. The opportunity cost of capital is highly significant."
|>;

Print[ExportString[result, "JSON", "Compact" -> True]];
