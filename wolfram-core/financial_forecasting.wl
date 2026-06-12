(* ::Package:: *)

(* 
  Varasat AI - Financial Forecasting Engine
  Language: Wolfram Language
  Description: Generates multi-year exponential time-series projections 
  to forecast future asset value vs inflation erosion.
*)

BeginPackage["Varasat`FinancialForecasting`"]

GenerateForecastTimeSeries::usage = "GenerateForecastTimeSeries[principal, inflationRate, growthRate, years] returns a time-series projection of an asset's nominal and real value."

Begin["`Private`"]

(* Core Time-Series Forecasting Module *)
GenerateForecastTimeSeries[principal_?NumericQ, inflationRate_?NumericQ, growthRate_?NumericQ, maxYears_Integer] := Module[
    {
        yearsArray, nominalSeries, realSeries, 
        cumulativeLossSeries, forecastData
    },
    
    (* Validate inputs to prevent infinite series *)
    If[maxYears < 1 || maxYears > 50,
        Return[<|"Status" -> "Error", "Message" -> "Years must be between 1 and 50"|>]
    ];

    (* Generate arrays for mapping *)
    yearsArray = Range[0, maxYears];
    
    (* Nominal Value: purely based on assumed growth (e.g., FD interest rate) *)
    nominalSeries = Map[(principal * (1 + growthRate)^#) &, yearsArray];
    
    (* Real Value: discounted by inflation rate representing purchasing power *)
    realSeries = Map[(principal * ((1 + growthRate) / (1 + inflationRate))^#) &, yearsArray];
    
    (* Cumulative Loss of Purchasing Power against nominal expectation *)
    cumulativeLossSeries = nominalSeries - realSeries;

    (* Zip arrays into a structured dataset *)
    forecastData = Table[
        <|
            "Year" -> yearsArray[[i]],
            "NominalValue" -> Round[nominalSeries[[i]], 2],
            "RealValue" -> Round[realSeries[[i]], 2],
            "PurchasingPowerLoss" -> Round[cumulativeLossSeries[[i]], 2]
        |>,
        {i, 1, Length[yearsArray]}
    ];

    (* Return structured JSON-compatible association *)
    <|
        "Status" -> "Success",
        "InitialPrincipal" -> principal,
        "AssumedInflation" -> inflationRate,
        "AssumedGrowth" -> growthRate,
        "ForecastHorizon" -> maxYears,
        "FinalNominalValue" -> Last[forecastData]["NominalValue"],
        "FinalRealValue" -> Last[forecastData]["RealValue"],
        "TotalValueEroded" -> Last[forecastData]["PurchasingPowerLoss"],
        "TimeSeriesData" -> forecastData
    |>
]

End[]
EndPackage[]
