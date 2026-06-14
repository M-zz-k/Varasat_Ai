(* ::Package:: *)

compareScenarios[principal_, inflationRate_] := 
  Module[{delays = {0, 5, 10}, labels = {"Immediate", "5 Years", "10 Years"}, scenarios},
    
    scenarios = MapThread[
      Module[{delay = #1, label = #2, fv, realVal, diff},
        fv = Round[principal]; (* Nominal value assuming dormant non-interest bearing by default, or just use principal. For comparison, let's keep FV = principal. *)
        realVal = Round[principal / (1 + inflationRate)^delay];
        diff = fv - realVal;
        
        <|
          "scenario" -> label,
          "delayYears" -> delay,
          "futureValue" -> fv,
          "purchasingImpact" -> realVal,
          "difference" -> diff
        |>
      ] &,
      {delays, labels}
    ];
    scenarios
  ]

If[Length[$ScriptCommandLine] >= 3,
  Module[{principal, inflationRate, result, jsonOutput},
    principal = ToExpression[$ScriptCommandLine[[2]]];
    inflationRate = ToExpression[$ScriptCommandLine[[3]]];
    
    result = compareScenarios[principal, inflationRate];
    
    jsonOutput = ExportString[<|
      "module" -> "analytics/scenarioComparison",
      "inputs" -> <|"principal" -> principal, "inflationRate" -> inflationRate|>,
      "calculation" -> "Evaluated across delay={0,5,10}",
      "result" -> result,
      "explanation" -> "Compared the financial consequences of claim delays over 0, 5, and 10 year scenarios."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
