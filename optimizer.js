/**
 * ASTRA-C2 // AI Optimization & Decision Support Algorithms
 * Includes Weapon-Target Assignment (WTA), Threat Avoidance, and 4D Deconfliction.
 */

const AstraOptimizer = {
  // Target specs for contingencies
  TARGET_CATALOG: {
    'HVT_TEL_RADAR': {
      name: 'Mobile SAM TEL & Radar Mast (HQ-9B Battery)',
      type: 'Air Defense / Radar',
      priority: 1,
      targetHardness: 0.85,
      ecmRating: 0.8,
      recommendedMunition: ['SCALP-EG', 'BrahMos-A', 'HAMMER PGM', 'Spice-2000']
    },
    'HOSTILE_INTERCEPTOR': {
      name: 'J-10CE Interceptor Flight (2x Aircraft)',
      type: 'Air-to-Air Combat',
      priority: 1,
      targetHardness: 0.6,
      ecmRating: 0.75,
      recommendedMunition: ['Meteor BVR', 'Astra Mk2', 'R-77-1', 'MICA-IR']
    },
    'DRONE_SWARM': {
      name: 'Low-RCS Ingress Drone Swarm (12x UCAV)',
      type: 'Swarm Saturation',
      priority: 2,
      targetHardness: 0.3,
      ecmRating: 0.4,
      recommendedMunition: ['Astra Mk1', 'ASRAAM', 'Internal 30mm Cannon']
    }
  },

  /**
   * Weapon-Target Assignment (WTA) Evaluator
   * Solves multi-criteria optimization across airborne & alert assets
   * Score = w1*(1 - TTI_norm) + w2*Fuel_norm + w3*Pk + w4*Ps - w5*ATO_penalty
   */
  evaluateRetaskCandidates(targetType, assets, threatSites) {
    const targetSpec = this.TARGET_CATALOG[targetType] || this.TARGET_CATALOG['HVT_TEL_RADAR'];
    
    const weights = {
      tti: 0.25,       // Time to Intercept
      fuel: 0.20,      // Fuel State & Loiter
      pk: 0.25,        // Weapon-Target Pairing Pk
      survival: 0.20,  // Threat Avoidance / Stealth
      ato: 0.10        // Impact on existing ATO mission
    };

    const results = assets
      .filter(a => a.side === 'bluefor' && (a.category === 'fighter' || a.category === 'strike'))
      .map(asset => {
        // 1. Time to Intercept (mins) based on distance & Mach
        const estDistanceKm = this.calculateDistanceKm(asset.coords, [33.1, 75.8]); // Target area
        const speedKmph = asset.mach * 1060; // Approx km/h at altitude
        const ttiMinutes = parseFloat(((estDistanceKm / speedKmph) * 60).toFixed(1));

        // Normalized TTI (0 to 1, faster is better)
        const ttiScore = Math.max(0, 1 - (ttiMinutes / 20));

        // 2. Fuel Reserve Score
        const fuelScore = Math.max(0, (asset.fuel - asset.bingoFuel) / (100 - asset.bingoFuel));

        // 3. Weapon Pk (Probability of Kill) against target
        let bestWeapon = 'GUN/SHORT_BVR';
        let pkScore = 0.55;

        asset.loadout.forEach(item => {
          if (targetSpec.recommendedMunition.some(m => item.includes(m))) {
            if (item.includes('SCALP') || item.includes('BrahMos')) {
              pkScore = Math.max(pkScore, 0.95);
              bestWeapon = item;
            } else if (item.includes('Meteor') || item.includes('HAMMER')) {
              pkScore = Math.max(pkScore, 0.92);
              bestWeapon = item;
            } else if (item.includes('Astra') || item.includes('Spice')) {
              pkScore = Math.max(pkScore, 0.88);
              bestWeapon = item;
            }
          }
        });

        // 4. Survival Probability (Ps) through SAM domes
        const closestSamDistKm = Math.min(...threatSites.map(sam => 
          this.calculateDistanceKm(asset.coords, sam.coords) - sam.rangeKm
        ));
        let survivalScore = 0.95;
        if (closestSamDistKm < 0) {
          // Inside SAM dome
          survivalScore = asset.stealthRcs ? 0.82 : 0.65;
        } else if (closestSamDistKm < 30) {
          survivalScore = 0.88;
        }

        // 5. ATO Disruption Penalty (DCA high priority = higher disruption penalty)
        let atoPenalty = 0.15;
        if (asset.missionRole.includes('VIP') || asset.missionRole.includes('RESCUE')) {
          atoPenalty = 0.45;
        } else if (asset.missionRole.includes('PATROL')) {
          atoPenalty = 0.10;
        }

        // Combined Overall Score (0 to 100%)
        const compositeScore = (
          weights.tti * ttiScore +
          weights.fuel * fuelScore +
          weights.pk * pkScore +
          weights.survival * survivalScore -
          weights.ato * atoPenalty
        ) * 100;

        return {
          id: asset.id,
          callsign: asset.callsign,
          type: asset.type,
          pilot: asset.pilot,
          ttiMinutes,
          fuelCurrent: asset.fuel,
          bingoFuel: asset.bingoFuel,
          bestWeapon,
          pk: Math.round(pkScore * 100),
          survival: Math.round(survivalScore * 100),
          compositeScore: parseFloat(compositeScore.toFixed(1)),
          recommendedRoute: `Corridor G-4 (NOE at FL120, Terrain Masked around Ridge Charlie)`,
          stealthCapable: asset.stealthRcs || false
        };
      });

    // Sort by composite score descending
    return results.sort((a, b) => b.compositeScore - a.compositeScore);
  },

  /**
   * Calculate Geodesic Distance between two [lat, lng] coordinates (in km)
   */
  calculateDistanceKm(coords1, coords2) {
    const R = 6371; // Earth radius in km
    const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
    const dLon = (coords2[1] - coords1[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  },

  /**
   * Generates dynamic threat-evading waypoints skirting around SAM bubbles
   */
  generateSamEvasionPath(startCoords, targetCoords, samThreats) {
    // Generate curved midpoint avoiding SAM centers
    const midLat = (startCoords[0] + targetCoords[0]) / 2;
    const midLng = (startCoords[1] + targetCoords[1]) / 2;

    // Check if straight line intersects any SAM
    let offsetLng = 0.45; // Dog-leg eastward/southward around ridge
    samThreats.forEach(sam => {
      const distToMid = this.calculateDistanceKm([midLat, midLng], sam.coords);
      if (distToMid < sam.rangeKm) {
        offsetLng += 0.35; // Increase clearance buffer
      }
    });

    const waypoints = [
      startCoords,
      [midLat - 0.2, midLng + offsetLng],
      [midLat + 0.15, midLng + (offsetLng * 0.7)],
      targetCoords
    ];

    return waypoints;
  },

  /**
   * Evaluates 4D Airspace Separation (Lateral & Vertical)
   */
  check4DDeconfliction(sorties) {
    const conflicts = [];
    for (let i = 0; i < sorties.length; i++) {
      for (let j = i + 1; j < sorties.length; j++) {
        const s1 = sorties[i];
        const s2 = sorties[j];

        const distKm = this.calculateDistanceKm(s1.coords, s2.coords);
        const altDiffFt = Math.abs(s1.altitudeFt - s2.altitudeFt);

        // Conflict condition: < 15km lateral and < 1500ft vertical separation
        if (distKm < 15 && altDiffFt < 1500) {
          conflicts.push({
            sortie1: s1.callsign,
            sortie2: s2.callsign,
            lateralKm: distKm,
            altDiffFt: altDiffFt,
            risk: 'HIGH_COLLISION_POTENTIAL'
          });
        }
      }
    }
    return conflicts;
  }
};
