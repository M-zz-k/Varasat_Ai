VerificationTest[
  Get["../intelligence/documentReadinessModel.wl"];
  Module[{res = analyzeDocumentReadiness[{"Doc1", "Doc2", "Doc3"}, {}, True]},
    res["readinessScore"]
  ],
  100,
  TestID -> "Readiness_Perfect"
]

VerificationTest[
  Module[{res = analyzeDocumentReadiness[{"Doc1", "Doc2", "Doc3"}, {"Doc3"}, False]},
    res["readinessScore"]
  ],
  40,
  TestID -> "Readiness_MissingDocs_NoAssetInfo"
]
