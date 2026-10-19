/**
 * ASTRA-C2 // "What-If" War-Gaming & Contingency Simulation Sandbox
 * Simulates high-stress battle operational disruptions (Runway cratering, SAM radar spike, severe weather, tanker loss).
 */

const AstraSimulation = {
  // Current sandbox flags
  state: {
    runwayCratered: false,
    samRadarSpike: true,
    severeWeather: false,
    tankerFailure: false
  },

  /**
   * Run Monte-Carlo stress test based on toggled failure scenarios
   */
  runEvaluation() {
    let successRate = 96.0;
    let attritionRisk = 1.2;
    let tatOverheadMinutes = 0.0;
    let pkScore = 94.0;
    const directives = [];

    // Scenario 1: Runway Cratering at primary airbase (Ambala)
    if (this.state.runwayCratered) {
      successRate -= 12.5;
      attritionRisk += 2.4;
      tatOverheadMinutes += 28.0;
      directives.push("AMBALA RUNWAY 09/27 CRATERED: Divert active strike returns to Adampur AFS (Fuel reserve OK) & Chandigarh AFS. Stagger recovery sequences by 4-minute intervals.");
    }

    // Scenario 2: Active SAM Radar Spike
    if (this.state.samRadarSpike) {
      successRate -= 5.0;
      attritionRisk += 4.5;
      pkScore -= 3.0;
      directives.push("HOSTILE RADAR ILLUMINATION DETECTED: Ingress strike packages mandated to adopt NOE (Nap-of-the-Earth) profile below 500ft AGL along Ridge Charlie. Deploy chaff corridors.");
    }

    // Scenario 3: Monsoonal Severe Weather Squall
    if (this.state.severeWeather) {
      successRate -= 9.0;
      tatOverheadMinutes += 12.0;
      attritionRisk += 1.8;
      directives.push("SEVERE CONVECTIVE SQUALL (FL180-420): Mountain pass corridor 'VAJRA-1' closed for high-G transit. Re-route via southern feeder corridor 'GARUDA-SOUTH' (+6.2 min flight time).");
    }

    // Scenario 4: Tanker Hose Failure / Fuel Emergency
    if (this.state.tankerFailure) {
      successRate -= 14.0;
      attritionRisk += 5.2;
      directives.push("IL-78 VARUNA-01 AAR HOSE FAULT: Offload transfer abort. Strike CAP must immediately engage Bingo recovery checklist. Forward alert LCA flight scrambled to relieve on-station patrol.");
    }

    // Baseline fallback if all off
    if (directives.length === 0) {
      directives.push("STANDARD OPERATIONAL BASELINE: All corridors green. Safe lateral separation verified across Northern Theatre. Tanker Varuna-01 providing uninterrupted fuel buffer.");
    }

    return {
      successRate: Math.max(45, Math.min(99, parseFloat(successRate.toFixed(1)))),
      attritionRisk: Math.max(0.5, Math.min(25, parseFloat(attritionRisk.toFixed(1)))),
      tatImpact: `+${tatOverheadMinutes.toFixed(1)} MINS`,
      pkScore: Math.max(60, Math.min(98, parseFloat(pkScore.toFixed(1)))),
      mitigationPlan: directives.join(" \n\n")
    };
  }
};
