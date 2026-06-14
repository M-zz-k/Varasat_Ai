(* ::Package:: *)

calculatePurchasingPowerLoss[principal_, inflationRate_, years_] := 
  Module[{futureReal},
    futureReal = principal / (1 + inflationRate)^years;
    principal - futureReal
  ];

If[Length[$ScriptCommandLine] >= 4,
  Module[{principal, inflationRate, years, loss, jsonOutput},
    principal = ToExpression[$ScriptCommandLine[[2]]];
    inflationRate = ToExpression[$ScriptCommandLine[[3]]];
    years = ToExpression[$ScriptCommandLine[[4]]];
    
    loss = Round[calculatePurchasingPowerLoss[principal, inflationRate, years]];
    
    jsonOutput = ExportString[<|
      "module" -> "core/inflationEngine",
      "inputs" -> <|"principal" -> principal, "inflationRate" -> inflationRate, "years" -> years|>,
      "calculation" -> "Loss = P - (P / (1+i)^t)",
      "result" -> loss,
      "explanation" -> "Computed total purchasing power loss due to compound inflation."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
