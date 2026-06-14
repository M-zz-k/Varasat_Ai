(* ::Package:: *)

generateGrowthChartData[principal_, inflationRate_, years_] := 
  Module[{data},
    data = Table[
      <|
        "year" -> yr, 
        "nominalValue" -> Round[principal], (* Assume dormant zero nominal growth *)
        "realValue" -> Round[principal / (1 + inflationRate)^yr]
      |>,
      {yr, 0, years}
    ];
    data
  ]

If[Length[$ScriptCommandLine] >= 4,
  Module[{principal, inflationRate, years, result, jsonOutput},
    principal = ToExpression[$ScriptCommandLine[[2]]];
    inflationRate = ToExpression[$ScriptCommandLine[[3]]];
    years = ToExpression[$ScriptCommandLine[[4]]];
    
    result = generateGrowthChartData[principal, inflationRate, years];
    
    jsonOutput = ExportString[<|
      "module" -> "visualization/chartGenerator",
      "inputs" -> <|"principal" -> principal, "inflationRate" -> inflationRate, "years" -> years|>,
      "calculation" -> "Generated discrete time-series points",
      "result" -> result,
      "explanation" -> "Generated Cartesian coordinate data mapping the compound decay curve for frontend rendering."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
