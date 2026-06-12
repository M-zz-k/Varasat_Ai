(* ::Package:: *)

(* 
  Varasat AI - Asset Valuation Model (Dynamic Curve Version)
  Language: Wolfram Language
  Description: Evaluates Net Present Value (NPV) using dynamic mathematical 
  curves rather than static flat multipliers. Uses Double Declining Balance for 
  depreciating assets, and continuous compounding for appreciating assets.
*)

BeginPackage["Varasat`AssetValuationModel`"]

EvaluateAssetNPV::usage = "EvaluateAssetNPV[currentValue, assetClass, yearsDelayed] evaluates adjusted NPV using dynamic curves."

Begin["`Private`"]

assetClassVectors = <|
    "Cash" -> -0.06,
    "Gold" -> 0.08,  
    "Equity" -> 0.12, 
    "RealEstate" -> 0.07, 
    "Vehicle" -> -0.15 
|>;

(* Core NPV Evaluation Module *)
EvaluateAssetNPV[currentValue_?NumericQ, assetClass_String, yearsDelayed_?NumericQ] := Module[
    {
        vectorRate, adjustedNPV, valuationDelta, 
        isAppreciating, assessmentMessage,
        depreciationFactor, curveModel
    },
    
    vectorRate = If[KeyExistsQ[assetClassVectors, assetClass], 
        assetClassVectors[assetClass], 
        assetClassVectors["Cash"]
    ];
    
    isAppreciating = vectorRate > 0;

    (* Apply Dynamic Curve based on asset type *)
    If[assetClass === "Vehicle",
        (* Double Declining Balance Model for rapid early depreciation *)
        depreciationFactor = Abs[vectorRate] * 2;
        adjustedNPV = currentValue * Max[0, (1 - depreciationFactor)^yearsDelayed];
        curveModel = "Double Declining Balance Curve",
        
        (* Continuous Compounding Model for market/equity/real estate *)
        adjustedNPV = currentValue * Exp[vectorRate * yearsDelayed];
        curveModel = "Continuous Compounding Curve"
    ];
    
    valuationDelta = adjustedNPV - currentValue;
    
    assessmentMessage = If[isAppreciating,
        "The asset has appreciated using continuous market models (" <> ToString[assetClass] <> ").",
        "The asset has depreciated or lost purchasing power due to physical decay or inflation."
    ];

    (* Return structured JSON-compatible association *)
    <|
        "Status" -> "Success",
        "Engine" -> "Dynamic Asset Curve Valuator",
        "InputParameters" -> <|
            "OriginalValue" -> currentValue,
            "AssetClass" -> assetClass,
            "YearsDelayed" -> yearsDelayed
        |>,
        "ValuationResults" -> <|
            "AppliedVectorRate" -> vectorRate,
            "CurveModelApplied" -> curveModel,
            "AdjustedNPV" -> Round[adjustedNPV, 2],
            "ValuationDelta" -> Round[valuationDelta, 2],
            "IsAppreciating" -> isAppreciating,
            "Assessment" -> assessmentMessage
        |>
    |>
]

End[]
EndPackage[]
