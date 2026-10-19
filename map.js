/**
 * ASTRA-C2 // Tactical Air Picture (Leaflet Map Controller)
 * Real-time tracks, SAM Threat Domes, AWACS Coverage, Dynamic Vectors & Retask Animation
 * Basemap provider: Esri Dark Gray Base / Satellite (100% Free, Zero Watermark, No API Key Required)
 */

const AstraMap = {
  map: null,
  currentTileLayer: null,
  activeBasemap: 'dark', // 'dark', 'satellite', 'osm'
  markers: {},
  airbaseMarkers: [],
  samCircles: [],
  corridorLayers: [],
  vectorLayers: [],
  awacsCircle: null,
  hvtMarker: null,
  retaskPolyline: null,

  // Basemap Tile Providers (NO API KEY REQUIRED, ZERO WATERMARK)
  tileProviders: {
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      options: { maxZoom: 14, subdomains: ['server'] }
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: { maxZoom: 14 }
    },
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: { maxZoom: 14 }
    }
  },

  // Spatially deconflicted air asset state (Northern Theatre / Western Air Command)
  assets: [
    {
      id: 'tiger01',
      callsign: 'TIGER-01',
      type: 'RAFALE F3-R',
      side: 'bluefor',
      category: 'fighter',
      coords: [33.85, 74.45], // Northern Sector CAP (Pir Panjal Ridge)
      heading: 50,
      altitudeFt: 32000,
      mach: 1.15,
      fuel: 74,
      bingoFuel: 22,
      pilot: 'WG CDR V. SHARMA',
      loadout: ['2x METEOR BVR', '2x MICA-IR', '2x SCALP-EG'],
      missionRole: 'COMBAT AIR PATROL (SECTOR 2)',
      stealthRcs: true,
      origin: 'AMBALA AFS',
      status: 'ON-STATION'
    },
    {
      id: 'tiger02',
      callsign: 'TIGER-02',
      type: 'RAFALE F3-R',
      side: 'bluefor',
      category: 'fighter',
      coords: [33.55, 74.15], // Wingman orbit
      heading: 50,
      altitudeFt: 32500,
      mach: 1.12,
      fuel: 71,
      bingoFuel: 22,
      pilot: 'SQN LDR R. KAPOOR',
      loadout: ['2x METEOR BVR', '2x MICA-RF', '2x HAMMER PGM'],
      missionRole: 'WINGMAN ESCORT (TIGER-01)',
      stealthRcs: true,
      origin: 'AMBALA AFS',
      status: 'ON-STATION'
    },
    {
      id: 'garuda11',
      callsign: 'GARUDA-11',
      type: 'SU-30MKI SUPER',
      side: 'bluefor',
      category: 'strike',
      coords: [31.95, 74.90], // Ingress axis from Halwara
      heading: 330,
      altitudeFt: 28000,
      mach: 1.35,
      fuel: 82,
      bingoFuel: 26,
      pilot: 'WG CDR K. RAWAT',
      loadout: ['1x BRAHMOS-A', '4x R-77-1 BVR', '2x R-73'],
      missionRole: 'DEEP STANDOFF STRIKE ALERT',
      stealthRcs: false,
      origin: 'HALWARA AFS',
      status: 'INGRESS'
    },
    {
      id: 'bravo04',
      callsign: 'BRAVO-04',
      type: 'LCA TEJAS MK1A',
      side: 'bluefor',
      category: 'fighter',
      coords: [32.70, 75.30], // Forward Jammu sector point defense
      heading: 20,
      altitudeFt: 24000,
      mach: 0.98,
      fuel: 62,
      bingoFuel: 20,
      pilot: 'FLT LT S. NAIR',
      loadout: ['2x ASTRA MK1 BVR', '2x ASRAAM', 'EL/M-2052 AESA'],
      missionRole: 'FORWARD SECTOR POINT DEFENSE',
      stealthRcs: false,
      origin: 'ADAMPUR AFS',
      status: 'ON-STATION'
    },
    {
      id: 'netra01',
      callsign: 'NETRA-AWACS',
      type: 'DRDO EMB-145 AEW&C',
      side: 'bluefor',
      category: 'support',
      coords: [33.20, 76.90], // High altitude surveillance orbit
      heading: 90,
      altitudeFt: 34000,
      mach: 0.76,
      fuel: 88,
      bingoFuel: 25,
      pilot: 'GP CAPT M. SEN',
      loadout: ['ACTIVE AESA RADAR', 'ESM/ELINT SUITE', 'IFF MK-XII'],
      missionRole: 'SURVEILLANCE & BATTLESPACE C2',
      stealthRcs: false,
      origin: 'BHATINDA AFS',
      status: 'ORBITING'
    },
    {
      id: 'varuna01',
      callsign: 'VARUNA-01',
      type: 'IL-78 MKI TANKER',
      side: 'bluefor',
      category: 'tanker',
      coords: [31.10, 76.40], // Rear safe aerial refuelling racetrack
      heading: 270,
      altitudeFt: 26000,
      mach: 0.72,
      fuel: 94,
      bingoFuel: 30,
      pilot: 'WG CDR D. MENON',
      loadout: ['3x UPAZ-1A REFUELLING PODS', '110,000 LBS OFFLOAD'],
      missionRole: 'AERIAL REFUELLING ORBIT TRACK',
      stealthRcs: false,
      origin: 'AGRA AFS',
      status: 'ORBITING'
    },
    // OPFOR / Hostile contacts
    {
      id: 'bogey99',
      callsign: 'BOGEY-99 (HOSTILE)',
      type: 'J-10CE VIGOROUS DRAGON',
      side: 'opfor',
      category: 'hostile',
      coords: [35.20, 74.40], // Northern contested ingress
      heading: 165,
      altitudeFt: 36000,
      mach: 1.45,
      fuel: 65,
      bingoFuel: 20,
      pilot: 'UNKNOWN OPFOR',
      loadout: ['PL-15 BVR', 'PL-10', 'KLJ-7A AESA'],
      missionRole: 'HOSTILE AIRSPACE INTRUSION',
      stealthRcs: false,
      origin: 'SKARDU AIR BASE',
      status: 'HOSTILE INGRESS'
    },
    {
      id: 'drone44',
      callsign: 'TRACK-44 (UCAV)',
      type: 'WING LOONG II ARMED DRONE',
      side: 'opfor',
      category: 'hostile',
      coords: [34.45, 73.80], // Border ridge surveillance
      heading: 190,
      altitudeFt: 18000,
      mach: 0.42,
      fuel: 80,
      bingoFuel: 15,
      pilot: 'UNMANNED GCS',
      loadout: ['4x BLUE ARROW 7 PGM', 'EO/IR POD'],
      missionRole: 'HOSTILE RECCE / SECTOR SURVEILLANCE',
      stealthRcs: false,
      origin: 'FORWARD STRIP',
      status: 'LOITERING'
    }
  ],

  // Ground SAM Threat Sites (Surface to Air Missiles)
  samSites: [
    {
      id: 'sam-hq9',
      name: 'HQ-9B BATTERY (SECTOR N-4)',
      type: 'LONG-RANGE WEZ',
      coords: [35.40, 75.30],
      rangeKm: 150, // Weapon Engagement Zone
      color: '#ff334b',
      fillOpacity: 0.16
    },
    {
      id: 'sam-ly80',
      name: 'LY-80 MED-RANGE AIR DEFENSE',
      type: 'MEDIUM-RANGE WEZ',
      coords: [34.30, 73.60],
      rangeKm: 60,
      color: '#f97316',
      fillOpacity: 0.20
    },
    {
      id: 'sam-pantsir',
      name: 'PANTSIR-S1 POINT DEFENSE UNIT',
      type: 'CLOSE POINT WEZ',
      coords: [34.75, 75.10],
      rangeKm: 22,
      color: '#eab308',
      fillOpacity: 0.28
    }
  ],

  // Key Airbases
  airbases: [
    { code: 'AMB', name: 'AMBALA AFS', coords: [30.37, 76.82], sqn: '17 Sqn (Rafale F3-R)' },
    { code: 'ADP', name: 'ADAMPUR AFS', coords: [31.43, 75.76], sqn: '45 Sqn (LCA Tejas)' },
    { code: 'HLW', name: 'HALWARA AFS', coords: [30.75, 75.63], sqn: '222 Sqn (Su-30MKI)' },
    { code: 'SXR', name: 'SRINAGAR AFS', coords: [33.99, 74.77], sqn: 'Forward Intercept Wing' },
    { code: 'IXL', name: 'LEH AIR BASE', coords: [34.15, 77.58], sqn: 'High Altitude Staging' }
  ],

  // Safe Air Corridor
  safeCorridor: [
    [30.40, 76.80], // Ambala
    [31.45, 76.20], // Adampur transit
    [32.65, 75.40], // Jammu forward corridor
    [33.70, 74.60]  // Kashmir patrol gate
  ],

  // Emergent HVT Pop-up Coordinates
  hvtTarget: {
    id: 'hvt-alpha',
    name: 'HVT-ALPHA: Mobile TEL & Radar Convoy',
    coords: [34.65, 75.05],
    detectedTime: 'T+03:38:00',
    timeWindowMins: 4.8
  },

  /**
   * Initialize Map
   */
  init() {
    const mapElement = document.getElementById('tacticalMap');
    if (!mapElement) return;

    // Center on Northern Theatre (Western Air Command)
    this.map = L.map('tacticalMap', {
      center: [33.15, 75.75],
      zoom: 7.8,
      minZoom: 6,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Set Initial Basemap (Esri Dark Gray - NO API KEY REQUIRED, ZERO WATERMARK)
    this.setBasemap('dark');

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Render components
    this.renderAirbases();
    this.renderSamThreatDomes();
    this.renderSafeCorridors();
    this.renderAwacsCoverage();
    this.renderAssetMarkers();
    this.renderHvtTarget();

    // Attach map event listeners
    this.attachEvents();
  },

  /**
   * Set Basemap dynamically
   */
  setBasemap(styleKey) {
    this.activeBasemap = styleKey;
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    const provider = this.tileProviders[styleKey] || this.tileProviders.dark;
    this.currentTileLayer = L.tileLayer(provider.url, provider.options).addTo(this.map);

    // Adjust tile container CSS filter based on basemap style
    const mapEl = document.getElementById('tacticalMap');
    if (mapEl) {
      if (styleKey === 'satellite') {
        mapEl.classList.add('map-satellite-mode');
        mapEl.classList.remove('map-dark-mode');
      } else {
        mapEl.classList.add('map-dark-mode');
        mapEl.classList.remove('map-satellite-mode');
      }
    }
  },

  /**
   * Render Airbases with compact tactical military badges
   */
  renderAirbases() {
    this.airbaseMarkers = [];
    this.airbases.forEach(base => {
      const icon = L.divIcon({
        className: 'custom-airbase-icon',
        html: `
          <div class="tactical-airbase-chip">
            <i class="fa-solid fa-plane-departure airbase-chip-icon"></i>
            <span class="airbase-chip-text">${base.code}</span>
          </div>
        `,
        iconSize: [44, 20],
        iconAnchor: [22, 10]
      });

      const m = L.marker(base.coords, { icon }).addTo(this.map)
        .bindTooltip(`<b>${base.name}</b><br><span style="color:#38bdf8">${base.sqn}</span>`, {
          direction: 'top',
          className: 'tactical-tooltip'
        });
      this.airbaseMarkers.push(m);
    });
  },

  /**
   * Render SAM Threat Domes (Weapon Engagement Zones)
   */
  renderSamThreatDomes() {
    this.samSites.forEach(sam => {
      // Circle representing missile WEZ
      const circle = L.circle(sam.coords, {
        radius: sam.rangeKm * 1000,
        color: sam.color,
        fillColor: sam.color,
        fillOpacity: sam.fillOpacity,
        weight: 1.5,
        dashArray: '4, 6'
      }).addTo(this.map);

      // Center radar mast icon
      const centerMarker = L.circleMarker(sam.coords, {
        radius: 4,
        color: sam.color,
        fillColor: sam.color,
        fillOpacity: 1,
        weight: 2
      }).addTo(this.map).bindTooltip(
        `<b style="color:${sam.color}; font-family:'JetBrains Mono'">${sam.name}</b><br>
         WEZ Range: <b>${sam.rangeKm} km</b><br>Threat: ${sam.type}`, 
        { direction: 'right' }
      );

      this.samCircles.push(circle, centerMarker);
    });
  },

  /**
   * Render Safe Air Corridor (Vajra-1)
   */
  renderSafeCorridors() {
    const corridor = L.polyline(this.safeCorridor, {
      color: '#00e5ff',
      weight: 2.5,
      dashArray: '8, 8',
      opacity: 0.7
    }).addTo(this.map);

    // Label along corridor
    const midPoint = this.safeCorridor[2];
    const labelMarker = L.marker(midPoint, {
      icon: L.divIcon({
        className: 'corridor-label',
        html: `<span style="font-family:'JetBrains Mono'; font-size:9px; color:#00e5ff; background:rgba(7,13,24,0.85); padding:2px 6px; border:1px solid rgba(0,229,255,0.4); border-radius:2px; box-shadow: 0 0 8px rgba(0,229,255,0.25);">CORRIDOR VAJRA-1 (FL250-FL320)</span>`,
        iconSize: [180, 20],
        iconAnchor: [90, 10]
      })
    }).addTo(this.map);

    this.corridorLayers.push(corridor, labelMarker);
  },

  /**
   * Render AWACS Surveillance Coverage
   */
  renderAwacsCoverage() {
    const netra = this.assets.find(a => a.id === 'netra01');
    if (!netra) return;

    this.awacsCircle = L.circle(netra.coords, {
      radius: 260 * 1000, // 260km AESA radar detection horizon
      color: '#c084fc',
      fillColor: '#c084fc',
      fillOpacity: 0.05,
      weight: 1.2,
      dashArray: '4, 8'
    }).addTo(this.map);
  },

  /**
   * Render Asset Markers with SVG and Live Vectors
   */
  renderAssetMarkers() {
    this.assets.forEach(asset => {
      this.createOrUpdateMarker(asset);
    });
  },

  /**
   * Create or update a specific asset marker with anti-collision layout
   */
  createOrUpdateMarker(asset) {
    const isBlue = asset.side === 'bluefor';
    const isSupport = asset.category === 'support' || asset.category === 'tanker';
    const color = isBlue ? (isSupport ? (asset.category === 'support' ? '#c084fc' : '#ffb020') : '#00e5ff') : '#ff334b';
    const iconClass = isSupport ? (asset.category === 'support' ? 'fa-satellite-dish' : 'fa-gas-pump') : 'fa-jet-fighter';

    // SVG Tactical icon with rotation heading
    const markerHtml = `
      <div class="tactical-marker-wrap" style="transform: rotate(${asset.heading}deg);">
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(7, 13, 24, 0.94);
          border: 2px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          box-shadow: 0 0 10px ${color};
        ">
          <i class="fa-solid ${iconClass}" style="font-size: 13px;"></i>
        </div>
        <div class="vector-heading-lead" style="
          position: absolute;
          top: -10px;
          left: 13px;
          width: 2px;
          height: 10px;
          background: ${color};
        "></div>
      </div>
      <div class="aircraft-callsign-pill" style="
        position: absolute;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'JetBrains Mono', monospace;
        font-size: 9px;
        font-weight: 700;
        color: ${color};
        background: rgba(5, 8, 14, 0.92);
        padding: 1px 5px;
        border-radius: 2px;
        white-space: nowrap;
        border: 1px solid ${color}44;
        box-shadow: 0 2px 8px rgba(0,0,0,0.7);
        pointer-events: none;
      ">
        ${asset.callsign} <span style="color:#94a3b8; font-size:8px;">${asset.mach ? `M${asset.mach}` : ''}</span>
      </div>
    `;

    const icon = L.divIcon({
      className: `tactical-aircraft-icon ${asset.id}`,
      html: markerHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    if (this.markers[asset.id]) {
      this.markers[asset.id].setLatLng(asset.coords);
      this.markers[asset.id].setIcon(icon);
    } else {
      const marker = L.marker(asset.coords, { icon }).addTo(this.map);
      marker.on('click', () => {
        this.selectAsset(asset);
      });
      this.markers[asset.id] = marker;
    }
  },

  /**
   * Render Emergent HVT Target
   */
  renderHvtTarget() {
    const icon = L.divIcon({
      className: 'hvt-marker-pulse',
      html: `
        <div style="
          position: relative;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 2px solid #ff334b;
            animation: pulseGlow 1.2s infinite;
          "></div>
          <div style="
            width: 18px;
            height: 18px;
            background: #ff334b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            box-shadow: 0 0 15px #ff334b;
          ">
            <i class="fa-solid fa-crosshairs" style="font-size: 10px;"></i>
          </div>
          <div style="
            position: absolute;
            top: 36px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            color: #ff334b;
            background: rgba(7, 13, 24, 0.92);
            padding: 1px 5px;
            border: 1px solid #ff334b;
            border-radius: 2px;
            white-space: nowrap;
          ">
            HVT-ALPHA
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    this.hvtMarker = L.marker(this.hvtTarget.coords, { icon }).addTo(this.map)
      .bindTooltip(
        `<b style="color:#ff334b; font-family:'JetBrains Mono'">EMERGENT TARGET: HVT-ALPHA</b><br>
         Mobile SAM TEL & Radar Convoys<br>Priority: <b>TIER-1 (CRITICAL)</b>`,
        { direction: 'top' }
      );
  },

  /**
   * Select asset and open telemetry HUD
   */
  selectAsset(asset) {
    if (window.AstraApp) {
      window.AstraApp.showAssetHud(asset);
    }
  },

  /**
   * Animate Retasking Dynamic Reroute
   * Reroutes TIGER-01 around the SAM dome to hit HVT-ALPHA
   */
  animateRetaskExecution(candidate) {
    const tiger = this.assets.find(a => a.id === (candidate ? candidate.id : 'tiger01'));
    if (!tiger) return;

    // Generate evasive waypoints avoiding HQ-9B SAM
    const evasionWaypoints = AstraOptimizer.generateSamEvasionPath(
      tiger.coords,
      this.hvtTarget.coords,
      this.samSites
    );

    // Remove existing retask line if any
    if (this.retaskPolyline) {
      this.map.removeLayer(this.retaskPolyline);
    }

    // Draw glowing animated cyan attack vector
    this.retaskPolyline = L.polyline(evasionWaypoints, {
      color: '#00e5ff',
      weight: 3,
      dashArray: '6, 6',
      opacity: 0.95
    }).addTo(this.map);

    // Smooth camera pan to show action corridor
    this.map.fitBounds(L.latLngBounds(evasionWaypoints), {
      padding: [80, 80],
      duration: 1.5
    });

    // Animate aircraft along waypoints
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < evasionWaypoints.length) {
        tiger.coords = evasionWaypoints[step];
        tiger.heading = 75; // Turn to ingress heading
        tiger.missionRole = `RETASKED STRIKE -> HVT-ALPHA (${candidate ? candidate.bestWeapon : 'SCALP-EG'})`;
        tiger.mach = 1.35; // Accelerate to combat ingress speed
        this.createOrUpdateMarker(tiger);
      } else {
        clearInterval(interval);
      }
    }, 1200);
  },

  /**
   * Toggle map layers
   */
  toggleLayer(layerName, isActive) {
    if (layerName === 'sam') {
      this.samCircles.forEach(c => {
        if (isActive) c.addTo(this.map);
        else this.map.removeLayer(c);
      });
    } else if (layerName === 'corridor') {
      this.corridorLayers.forEach(l => {
        if (isActive) l.addTo(this.map);
        else this.map.removeLayer(l);
      });
    } else if (layerName === 'airbases') {
      this.airbaseMarkers.forEach(m => {
        if (isActive) m.addTo(this.map);
        else this.map.removeLayer(m);
      });
    } else if (layerName === 'awacs') {
      if (this.awacsCircle) {
        if (isActive) this.awacsCircle.addTo(this.map);
        else this.map.removeLayer(this.awacsCircle);
      }
    } else if (layerName === 'radar') {
      const radarOverlay = document.getElementById('radarOverlay');
      if (radarOverlay) {
        radarOverlay.style.display = isActive ? 'block' : 'none';
      }
    }
  },

  /**
   * Attach map control events
   */
  attachEvents() {
    const resetBtn = document.getElementById('resetMapCenterBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.map.setView([33.15, 75.75], 7.8, { animate: true });
        if (window.AstraApp) window.AstraApp.playAudioFx('click');
      });
    }

    // Basemap selector events
    const baseDark = document.getElementById('basemapDark');
    const baseSat = document.getElementById('basemapSat');
    if (baseDark) {
      baseDark.addEventListener('click', () => {
        this.setBasemap('dark');
        baseDark.classList.add('active');
        if (baseSat) baseSat.classList.remove('active');
        if (window.AstraApp) window.AstraApp.playAudioFx('click');
      });
    }
    if (baseSat) {
      baseSat.addEventListener('click', () => {
        this.setBasemap('satellite');
        baseSat.classList.add('active');
        if (baseDark) baseDark.classList.remove('active');
        if (window.AstraApp) window.AstraApp.playAudioFx('click');
      });
    }
  }
};
