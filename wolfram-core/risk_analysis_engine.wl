(* ::Package:: *)

(* 
  Varasat AI - Risk Analysis Engine
  Language: Wolfram Language
  Description: Evaluates the probability of claim friction based on missing 
  documents, lack of nomination, and high monetary thresholds.
*)

BeginPackage["Varasat`RiskAnalysis`"]

CalculateClaimRiskScore::usage = "CalculateClaimRiskScore[assetAmount, hasNominee, missingDocsList] calculates a probability-based risk score for experiencing friction or delays in asset recovery."

Begin["`Private`"]

(* Base friction constants based on Indian banking heuristics *)
baseFrictionProbability = 0.05;
highValueThreshold = 500000; (* 5 Lakhs INR triggers strict KYC/Legal Heir requirements *)

(* Document impact weightings *)
docFrictionWeights = <|
    "DeathCertificate" -> 0.90, (* Critical *)
    "OriginalPassbook" -> 0.15,
    "LegalHeirCertificate" -> 0.40,
    "NomineeID" -> 0.20,
    "SuccessionCertificate" -> 0.50
|>;

(* Core Risk Evaluation Module *)
CalculateClaimRiskScore[assetAmount_?NumericQ, hasNominee_?(BooleanQ[#] || IntegerQ[#] &), missingDocsList_List] := Module[
    {
        nomineePenalty, amountPenalty, docPenalty, 
        rawRiskScore, normalizedRiskScore, riskTier,
        frictionFactors
    },
    
    (* Coerce boolean flag *)
    nomineePenalty = If[TrueQ[hasNominee] || hasNominee === 1, 0.0, 0.35];
    
    (* High value penalty: strict branch manager scrutiny *)
    amountPenalty = If[assetAmount > highValueThreshold, 0.20, 0.0];
    
    (* Document penalties *)
    docPenalty = Total[
        Map[If[KeyExistsQ[docFrictionWeights, #], docFrictionWeights[#], 0.05] &, missingDocsList]
    ];
    
    (* Accumulate raw probabilities *)
    rawRiskScore = baseFrictionProbability + nomineePenalty + amountPenalty + docPenalty;
    
    (* Normalize risk score between 0.0 and 1.0 using Sigmoid-like dampening for extreme cases *)
    normalizedRiskScore = 1.0 - Exp[-rawRiskScore];
    
    (* Classify risk tier *)
    riskTier = Which[
        normalizedRiskScore < 0.25, "Low",
        normalizedRiskScore < 0.60, "Medium",
        normalizedRiskScore < 0.85, "High",
        True, "Critical"
    ];
    
    (* Generate explanation factors *)
    frictionFactors = Select[{
        If[nomineePenalty > 0, "No registered nominee (+35% base friction)", Null],
        If[amountPenalty > 0, "High asset value triggers strict legal scrutiny (+20% base friction)", Null],
        If[Length[missingDocsList] > 0, "Missing required documents: " <> StringJoin[Riffle[missingDocsList, ", "]], Null]
    }, # =!= Null &];

    (* Return structured JSON-compatible association *)
    <|
        "Status" -> "Success",
        "AssetAmount" -> assetAmount,
        "RiskScore" -> Round[normalizedRiskScore, 0.01],
        "RiskTier" -> riskTier,
        "EstimatedDelayMonths" -> Round[normalizedRiskScore * 12, 1], (* Basic heuristic mapping *)
        "FrictionFactors" -> frictionFactors
    |>
]

End[]
EndPackage[]
