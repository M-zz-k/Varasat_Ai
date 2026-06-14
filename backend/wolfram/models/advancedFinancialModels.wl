(* ::Package:: *)

calculateFutureValue[principal_, rate_, years_] := Round[principal * (1 + rate)^years]
calculatePresentValue[futureValue_, rate_, years_] := Round[futureValue / (1 + rate)^years]
calculateInflationImpact[principal_, inflationRate_, years_] := 
  principal - calculatePresentValue[principal, inflationRate, years]
calculateDelayedRecoveryCost[principal_, growthRate_, inflationRate_, years_] := 
  Round[(principal * (1 + growthRate)^years) - (principal / (1 + inflationRate)^years)]

compareRecoveryScenarios[principal_, growthRate_, inflationRate_] := 
  Module[{delays = {0, 1, 5, 10}, labels = {"Immediate", "1 Year Delay", "5 Year Delay", "10 Year Delay"}},
    MapThread[
      <|
        "scenario" -> #2,
        "delayYears" -> #1,
        "futureValue" -> calculateFutureValue[principal, growthRate, #1],
        "purchasingImpact" -> calculateInflationImpact[principal, inflationRate, #1],
        "opportunityCost" -> calculateDelayedRecoveryCost[principal, growthRate, inflationRate, #1]
      |> &,
      {delays, labels}
    ]
  ]

If[Length[$ScriptCommandLine] >= 5,
  Module[{amount, inflation, delay, growth, result, jsonOutput},
    amount = ToExpression[$ScriptCommandLine[[2]]];
    inflation = ToExpression[$ScriptCommandLine[[3]]];
    delay = ToExpression[$ScriptCommandLine[[4]]];
    growth = ToExpression[$ScriptCommandLine[[5]]];
    
    result = <|
      "futureValue" -> calculateFutureValue[amount, growth, delay],
      "presentValue" -> calculatePresentValue[amount, inflation, delay],
      "inflationImpact" -> calculateInflationImpact[amount, inflation, delay],
      "delayedRecoveryCost" -> calculateDelayedRecoveryCost[amount, growth, inflation, delay],
      "scenarios" -> compareRecoveryScenarios[amount, growth, inflation]
    |>;
    
    jsonOutput = ExportString[<|
      "moduleName" -> "models/advancedFinancialModels",
      "inputs" -> <|"assetAmount" -> amount, "inflationRate" -> inflation, "timeDelay" -> delay, "growthRate" -> growth|>,
      "method" -> "Compound Interest and Discounting",
      "calculation" -> "FV = P(1+r)^t; PV = FV/(1+i)^t; Impact = P - PV",
      "result" -> result,
      "explanation" -> "Computed future nominal values and evaluated real purchasing power loss due to inflation over delayed periods."
    |>, "JSON", "Compact" -> True];
    Print[jsonOutput];
  ]
]
