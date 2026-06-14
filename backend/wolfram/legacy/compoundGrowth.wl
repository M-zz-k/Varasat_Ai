(* ::Package:: *)

calculateAssetGrowth[principal_, growthRate_, years_] := 
  principal * (1 + growthRate)^years - principal;

If[Length[$ScriptCommandLine] >= 4,
  Module[{principal, growthRate, years, growth, jsonOutput},
    principal = ToExpression[$ScriptCommandLine[[2]]];
    growthRate = ToExpression[$ScriptCommandLine[[3]]];
    years = ToExpression[$ScriptCommandLine[[4]]];
    
    growth = Round[calculateAssetGrowth[principal, growthRate, years]];
    
    jsonOutput = ExportString[<|
      "module" -> "core/compoundGrowth",
      "inputs" -> <|"principal" -> principal, "growthRate" -> growthRate, "years" -> years|>,
      "calculation" -> "Growth = P(1+r)^t - P",
      "result" -> growth,
      "explanation" -> "Computed discrete asset growth over the specified term."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
