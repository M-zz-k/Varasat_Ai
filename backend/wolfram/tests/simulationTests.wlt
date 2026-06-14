VerificationTest[
  Get["../analytics/recoveryScenarioSimulation.wl"];
  Module[{res = simulateRecovery[100000, True, True]},
    res["normalScenario"]["days"]
  ],
  30,
  TestID -> "Simulation_NormalScenario_Optimal"
]

VerificationTest[
  Module[{res = simulateRecovery[100000, False, False]},
    res["delayedScenario"]["days"]
  ],
  270,
  TestID -> "Simulation_DelayedScenario_WorstCase"
]

VerificationTest[
  Module[{res = simulateRecovery[100000, False, False]},
    res["delayedScenario"]["valuePreserved"]
  ],
  98000,
  TestID -> "Simulation_ValuePreserved_WorstCase"
]
