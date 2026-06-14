VerificationTest[
  Get["../models/advancedFinancialModels.wl"];
  calculateFutureValue[100000, 0.05, 10],
  162889,
  TestID -> "FutureValue_Calculation_1"
]

VerificationTest[
  calculatePresentValue[162889, 0.05, 10],
  100000,
  TestID -> "PresentValue_Calculation_1"
]

VerificationTest[
  calculateInflationImpact[100000, 0.06, 5],
  25274,
  TestID -> "InflationImpact_Calculation_1"
]
