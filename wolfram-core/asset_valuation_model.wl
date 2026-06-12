(* ::Package:: *)

(* 
  Varasat AI - Asset Valuation Model
  Language: Wolfram Language
  Description: Evaluates Net Present Value (NPV) and comparative valuation 
  between liquid assets (cash/deposits) and illiquid assets (real estate, physical gold) 
  adjusting for depreciation and market growth rates.
*)

BeginPackage["Varasat`AssetValuationModel`"]

EvaluateAssetNPV::usage = "EvaluateAssetNPV[currentValue, assetClass, yearsDelayed] evaluates the adjusted Net Present Value of an asset considering specific class depreciation or growth vectors."

Begin["`Private`"]

(* Asset Class Market Growth/Depreciation Vectors (Annualized) *)
assetClassVectors = <|
    "Cash" -> -0.06, (* Subject to flat inflation erosion *)
    "Gold" -> 0.08,  (* Historical appreciation *)
    "Equity" -> 0.12, (* Historical market return *)
    "RealEstate" -> 0.07, (* Standard property appreciation *)
    "Vehicle" -> -0.15 (* Standard mechanical depreciation *)
|>;

(* Core NPV Evaluation Module *)
EvaluateAssetNPV[currentValue_?NumericQ, assetClass_String, yearsDelayed_?NumericQ] := Module[
    {
        vectorRate, adjustedNPV, valuationDelta, 
        isAppreciating, assessmentMessage
    },
    
    (* Fetch the asset class vector or default to Cash (pure inflation erosion) *)
    vectorRate = If[KeyExistsQ[assetClassVectors, assetClass], 
        assetClassVectors[assetClass], 
        assetClassVectors["Cash"]
    ];
    
    (* Calculate Adjusted Net Present Value *)
    adjustedNPV = currentValue * (1 + vectorRate)^yearsDelayed;
    
    (* Calculate the delta from original value *)
    valuationDelta = adjustedNPV - currentValue;
    
    (* Boolean flag for appreciation *)
    isAppreciating = vectorRate > 0;
    
    (* Generate assessment message *)
    assessmentMessage = If[isAppreciating,
        "The asset has appreciated due to market forces (" <> ToString[assetClass] <> " at " <> ToString[vectorRate * 100] <> "% annualized).",
        "The asset has depreciated or lost purchasing power (" <> ToString[assetClass] <> " at " <> ToString[vectorRate * 100] <> "% annualized)."
    ];

    (* Return structured JSON-compatible association *)
    <|
        "Status" -> "Success",
        "InputParameters" -> <|
            "OriginalValue" -> currentValue,
            "AssetClass" -> assetClass,
            "YearsDelayed" -> yearsDelayed
        |>,
        "ValuationResults" -> <|
            "AppliedVectorRate" -> vectorRate,
            "AdjustedNPV" -> Round[adjustedNPV, 2],
            "ValuationDelta" -> Round[valuationDelta, 2],
            "IsAppreciating" -> isAppreciating,
            "Assessment" -> assessmentMessage
        |>
    |>
]

End[]
EndPackage[]
