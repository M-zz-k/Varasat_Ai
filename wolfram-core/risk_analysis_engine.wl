(* ::Package:: *)

(* 
  Varasat AI - Risk Analysis Engine (Monte Carlo Version)
  Language: Wolfram Language
  Description: Generates a probabilistic Risk Score using Monte Carlo simulations.
  It models the uncertainty of real-world claim friction by running 1,000 iterations 
  of randomized claim paths with stochastic variances applied to missing documents.
*)

BeginPackage["Varasat`RiskAnalysis`"]

CalculateClaimRiskScore::usage = "CalculateClaimRiskScore[assetAmount, hasNominee, missingDocsList] executes a Monte Carlo simulation to calculate the probability of claim friction."

Begin["`Private`"]

baseFrictionProbability = 0.05;
highValueThreshold = 500000;

(* Mean doc impact weightings - Monte Carlo will apply variance around these *)
docFrictionMeans = <|
    "DeathCertificate" -> 0.85,
    "OriginalPassbook" -> 0.15,
    "LegalHeirCertificate" -> 0.40,
    "NomineeID" -> 0.20,
    "SuccessionCertificate" -> 0.50
|>;

(* Monte Carlo Core Module *)
CalculateClaimRiskScore[assetAmount_?NumericQ, hasNominee_?(BooleanQ[#] || IntegerQ[#] &), missingDocsList_List] := Module[
    {
        numSimulations = 1000, 
        nomineePenalty, amountPenalty,
        simulatedDocPenalties, simulationResults,
        meanRiskScore, confidenceInterval, riskTier,
        frictionFactors
    },
    
    (* Static deterministic penalties *)
    nomineePenalty = If[TrueQ[hasNominee] || hasNominee === 1, 0.0, 0.35];
    amountPenalty = If[assetAmount > highValueThreshold, 0.20, 0.0];
    
    (* Run Monte Carlo Simulation: 1000 iterations *)
    simulationResults = Table[
        Module[{docPenalty, rawScore, variance},
            docPenalty = Total[
                Map[
                    With[{meanImpact = If[KeyExistsQ[docFrictionMeans, #], docFrictionMeans[#], 0.05]},
                        (* Apply normally distributed stochastic variance to the impact of missing this document *)
                        variance = RandomVariate[NormalDistribution[0, 0.05]];
                        Max[0, meanImpact + variance]
                    ] &, 
                    missingDocsList
                ]
            ];
            
            rawScore = baseFrictionProbability + nomineePenalty + amountPenalty + docPenalty;
            
            (* Sigmoid normalization *)
            1.0 - Exp[-rawScore]
        ],
        {numSimulations}
    ];
    
    (* Statistical Analysis of Simulation *)
    meanRiskScore = Mean[simulationResults];
    confidenceInterval = Quantile[simulationResults, {0.05, 0.95}];
    
    (* Risk classification *)
    riskTier = Which[
        meanRiskScore < 0.25, "Low",
        meanRiskScore < 0.60, "Medium",
        meanRiskScore < 0.85, "High",
        True, "Critical"
    ];
    
    (* Explainability metrics *)
    frictionFactors = Select[{
        If[nomineePenalty > 0, "No registered nominee (+35% base friction)", Null],
        If[amountPenalty > 0, "High asset value triggers strict legal scrutiny (+20% base friction)", Null],
        If[Length[missingDocsList] > 0, "Missing required documents: " <> StringJoin[Riffle[missingDocsList, ", "]], Null]
    }, # =!= Null &];

    (* Return structured JSON-compatible association *)
    <|
        "Status" -> "Success",
        "Engine" -> "Monte Carlo Risk Simulator",
        "Iterations" -> numSimulations,
        "AssetAmount" -> assetAmount,
        "MeanRiskScore" -> Round[meanRiskScore, 0.01],
        "ConfidenceInterval" -> Round[confidenceInterval, 0.01],
        "RiskTier" -> riskTier,
        "EstimatedDelayMonths" -> Round[meanRiskScore * 12, 1],
        "FrictionFactors" -> frictionFactors
    |>
]

End[]
EndPackage[]
