(* ::Package:: *)

(* 
  Varasat AI - Master Computational Engine
  Language: Wolfram Language
  Description: The primary orchestrator for the entire Varasat computational pipeline.
  It loads individual domain modules (Risk, Valuation, Forecasting, Distribution) 
  and combines their isolated logic into a unified financial intelligence report.
  This file serves as the definitive entry point for the backend JS bridge.
*)

BeginPackage["Varasat`MasterEngine`"]

(* Load submodules. Note: Paths must be handled by the caller or be in $Path. 
   For this architecture, we assume the JS bridge will load them explicitly. *)
Needs["Varasat`RiskAnalysis`"];
Needs["Varasat`AssetValuationModel`"];
Needs["Varasat`FinancialForecasting`"];
Needs["Varasat`CompoundInterestSimulation`"];
Needs["Varasat`InheritanceDistribution`"];

ExecuteFullVarasatPipeline::usage = "ExecuteFullVarasatPipeline[assetData, heirData] runs the entire Varasat suite (Risk, Value, Distribution) and returns a unified JSON-compatible structure."

Begin["`Private`"]

(* Master Orchestration Function *)
ExecuteFullVarasatPipeline[assetAmount_?NumericQ, assetClass_String, yearsDelayed_?NumericQ, hasNominee_?(BooleanQ[#] || IntegerQ[#] &), missingDocs_List, expectedInflation_?NumericQ, expectedGrowth_?NumericQ, heirsList_List] := Module[
    {
        riskReport, valuationReport, forecastReport, distributionReport, 
        pipelineStatus
    },
    
    (* 1. Run Monte Carlo Risk Analysis *)
    riskReport = Varasat`RiskAnalysis`CalculateClaimRiskScore[assetAmount, hasNominee, missingDocs];
    
    (* 2. Run Dynamic Curve Asset Valuation *)
    valuationReport = Varasat`AssetValuationModel`EvaluateAssetNPV[assetAmount, assetClass, yearsDelayed];
    
    (* 3. Run Stochastic Financial Forecasting *)
    forecastReport = Varasat`FinancialForecasting`GenerateForecastTimeSeries[assetAmount, expectedInflation, expectedGrowth, 10]; (* 10 year forward outlook *)
    
    (* 4. Run Heir Distribution Logic *)
    distributionReport = If[Length[heirsList] > 0,
        Varasat`InheritanceDistribution`CalculateDistribution[valuationReport["ValuationResults"]["AdjustedNPV"], heirsList],
        "No heirs provided for distribution."
    ];
    
    (* Determine overall pipeline health *)
    pipelineStatus = If[riskReport["Status"] === "Success" && valuationReport["Status"] === "Success", "Complete", "Partial Errors Detected"];

    (* Return Master Unified JSON-compatible association *)
    <|
        "PipelineStatus" -> pipelineStatus,
        "Timestamp" -> DateString["ISODateTime"],
        "Engine" -> "Varasat Master Computational Pipeline (Wolfram)",
        
        "IntelligenceModules" -> <|
            "RiskAnalysis" -> riskReport,
            "AssetValuation" -> valuationReport,
            "ForwardForecast" -> forecastReport,
            "HeirDistribution" -> distributionReport
        |>
    |>
]

End[]
EndPackage[]
