(* ::Package:: *)

calculateFutureValue[principal_, rate_, years_] := principal * (1 + rate)^years;

If[Length[$ScriptCommandLine] >= 4,
  Module[{principal, rate, years, fv, jsonOutput},
    principal = ToExpression[$ScriptCommandLine[[2]]];
    rate = ToExpression[$ScriptCommandLine[[3]]];
    years = ToExpression[$ScriptCommandLine[[4]]];
    
    fv = Round[calculateFutureValue[principal, rate, years]];
    
    jsonOutput = ExportString[<|
      "module" -> "core/financialModels",
      "inputs" -> <|"principal" -> principal, "rate" -> rate, "years" -> years|>,
      "calculation" -> "FV = P(1+r)^t",
      "result" -> fv,
      "explanation" -> "Computed future value using standard compound interest formula."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
