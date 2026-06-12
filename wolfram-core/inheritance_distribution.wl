(* ::Package:: *)

(* 
  Varasat AI - Inheritance Distribution Engine 
  Language: Wolfram Language
  Description: Computes rule-based fractional distribution of total asset value 
  based on family structures (Hindu Succession Act models).
*)

BeginPackage["Varasat`InheritanceDistribution`"]

CalculateDistribution::usage = "CalculateDistribution[totalValue, heirsList] calculates the financial distribution of assets among legal heirs based on weighted relationship tiers."

Begin["`Private`"]

(* Define hierarchical weighting classes for Class 1 Heirs under standard Indian succession framework *)
tierWeights = <|
    "Spouse" -> 1.0,
    "Son" -> 1.0,
    "Daughter" -> 1.0,
    "Mother" -> 1.0,
    "Father" -> 0.5, (* Class 2 heir, normally excluded if Class 1 exists, but kept for model *)
    "Sibling" -> 0.25
|>;

(* Core Distribution Module *)
CalculateDistribution[totalValue_?NumericQ, heirsList_List] := Module[
    {
        validHeirs, class1Exists, activeHeirs, 
        totalWeight, distributionModel, fractionalShare
    },
    
    (* Filter out unsupported relations and assign base weights *)
    validHeirs = Select[heirsList, KeyExistsQ[tierWeights, #["Relation"]] &];
    
    If[Length[validHeirs] == 0,
        Return[<|"Status" -> "Error", "Message" -> "No valid heirs identified"|>]
    ];
    
    (* Check for presence of Class 1 heirs (Spouse, Son, Daughter, Mother) *)
    class1Exists = AnyTrue[validHeirs, MemberQ[{"Spouse", "Son", "Daughter", "Mother"}, #["Relation"]] &];
    
    (* If Class 1 heirs exist, exclude Class 2 heirs (Father, Sibling) entirely from pool *)
    activeHeirs = If[class1Exists,
        Select[validHeirs, MemberQ[{"Spouse", "Son", "Daughter", "Mother"}, #["Relation"]] &],
        validHeirs
    ];
    
    (* Calculate total divisor weight *)
    totalWeight = Total[tierWeights[#["Relation"]] & /@ activeHeirs];
    
    (* Generate fractional financial splits per active heir *)
    distributionModel = Map[
        With[{shareRatio = tierWeights[#["Relation"]] / totalWeight},
            <|
                "Name" -> #["Name"],
                "Relation" -> #["Relation"],
                "FractionalShare" -> Round[shareRatio, 0.001],
                "AllocatedValue" -> Round[totalValue * shareRatio, 2]
            |>
        ] &, 
        activeHeirs
    ];
    
    (* Return structured JSON-compatible association *)
    <|
        "Status" -> "Success",
        "TotalAssetValue" -> totalValue,
        "TotalActiveHeirs" -> Length[activeHeirs],
        "Class1Triggered" -> class1Exists,
        "Distribution" -> distributionModel
    |>
]

End[]
EndPackage[]
