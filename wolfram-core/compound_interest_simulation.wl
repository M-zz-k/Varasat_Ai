(* ::Package:: *)

(* 
  Varasat AI - Compound Interest Simulation Engine
  Language: Wolfram Language
  Description: Generates multi-scenario financial impact reports including 
  missed interest accumulation and inflation-adjusted purchasing power erosion.
*)

BeginPackage["Varasat`CompoundInterestSimulation`"]

SimulateFinancialImpact::usage = "SimulateFinancialImpact[principal, years, inflationRate, missedInterestRate] returns a comparative scenario analysis."

Begin["`Private`"]

(* Core Simulation Module *)
SimulateFinancialImpact[principal_?NumericQ, years_?NumericQ, inflationRate_?NumericQ, missedInterestRate_?NumericQ] := Module[
    {
        futureValueIfInvested, realValueToday, 
        purchasingPowerLoss, opportunityCost, 
        annualRecoveryBenefit, lossPercentage
    },
    
    (* Future Value: What it would be worth if invested in a standard FD at the missed rate *)
    futureValueIfInvested = principal * (1 + missedInterestRate)^years;
    
    (* Real Value Today: What the principal is actually worth now in terms of purchasing power *)
    realValueToday = principal / (1 + inflationRate)^years;
    
    (* Purchasing Power Loss: The absolute INR drop in real value *)
    purchasingPowerLoss = principal - realValueToday;
    
    (* Opportunity Cost: The difference between what could have been earned vs what is currently held (stagnant) *)
    opportunityCost = futureValueIfInvested - principal;
    
    (* Annual Recovery Benefit: How much is saved/earned by claiming it this year vs waiting another year *)
    (* (It stops inflation erosion and starts earning interest again) *)
    annualRecoveryBenefit = (principal * (1 + missedInterestRate)) - (realValueToday / (1 + inflationRate));
    
    (* Percentage Metrics *)
    lossPercentage = (purchasingPowerLoss / principal) * 100;

    (* Return structured JSON-compatible association *)
    <|
        "Status" -> "Success",
        "InputParameters" -> <|
            "Principal" -> principal,
            "YearsDelayed" -> years,
            "InflationRate" -> inflationRate,
            "MissedInterestRate" -> missedInterestRate
        |>,
        "SimulationResults" -> <|
            "FutureValueIfInvested" -> Round[futureValueIfInvested, 2],
            "RealValueToday" -> Round[realValueToday, 2],
            "PurchasingPowerLoss" -> Round[purchasingPowerLoss, 2],
            "OpportunityCost" -> Round[opportunityCost, 2],
            "AnnualRecoveryBenefit" -> Round[annualRecoveryBenefit, 2],
            "PurchasingPowerLossPercent" -> Round[lossPercentage, 2]
        |>
    |>
]

End[]
EndPackage[]
