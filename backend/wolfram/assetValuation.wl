(* ::Package:: *)

(* 
  Asset Valuation Model
  Computes the compound interest growth and purchasing power loss due to inflation.
*)

calculateFutureValue[principal_, rate_, years_] := 
  principal * (1 + rate)^years;

calculatePurchasingPowerLoss[principal_, inflationRate_, years_] := 
  Module[{futureNominal, futureReal},
    futureNominal = calculateFutureValue[principal, 0.0, years]; (* Assuming 0% growth if dormant *)
    futureReal = principal / (1 + inflationRate)^years;
    futureNominal - futureReal
  ];

calculateAssetGrowth[principal_, growthRate_, years_] := 
  principal * (1 + growthRate)^years - principal;

(* Command Line Argument Parsing *)
If[Length[$ScriptCommandLine] >= 4,
  Module[{principal, inflationRate, years, fv, impactLoss, jsonOutput},
    principal = ToExpression[$ScriptCommandLine[[2]]];
    inflationRate = ToExpression[$ScriptCommandLine[[3]]];
    years = ToExpression[$ScriptCommandLine[[4]]];
    
    fv = calculateFutureValue[principal, 0.0, years]; (* Dormant implies no interest usually, or fixed interest *)
    impactLoss = calculatePurchasingPowerLoss[principal, inflationRate, years];
    
    jsonOutput = ExportString[
      <|
        "futureValue" -> Round[fv],
        "impact" -> Round[impactLoss],
        "explanation" -> "Dormant assets lose real purchasing power due to inflation compounding over " <> ToString[years] <> " years."
      |>,
      "JSON", "Compact" -> True
    ];
    
    Print[jsonOutput];
  ]
]
