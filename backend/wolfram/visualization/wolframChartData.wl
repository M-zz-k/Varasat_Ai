(* ::Package:: *)

generateTimelineData[principal_, growthRate_, inflationRate_, maxYears_] := 
  Table[
    <|
      "year" -> y,
      "nominalValue" -> Round[principal * (1 + growthRate)^y],
      "realValue" -> Round[(principal * (1 + growthRate)^y) / (1 + inflationRate)^y]
    |>,
    {y, 0, maxYears}
  ]

If[Length[$ScriptCommandLine] >= 5,
  Module[{principal, growthRate, inflationRate, maxYears, result, jsonOutput},
    principal = ToExpression[$ScriptCommandLine[[2]]];
    growthRate = ToExpression[$ScriptCommandLine[[3]]];
    inflationRate = ToExpression[$ScriptCommandLine[[4]]];
    maxYears = ToExpression[$ScriptCommandLine[[5]]];
    
    result = generateTimelineData[principal, growthRate, inflationRate, maxYears];
    
    jsonOutput = ExportString[<|
      "moduleName" -> "visualization/wolframChartData",
      "inputs" -> <|"principal" -> principal, "growthRate" -> growthRate, "inflationRate" -> inflationRate, "maxYears" -> maxYears|>,
      "method" -> "Discrete Data Point Generation",
      "calculation" -> "Generated points mapping nominal and real value over time",
      "result" -> result,
      "explanation" -> "Generated Cartesian timeline data specifically structured for React Recharts visualization."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
