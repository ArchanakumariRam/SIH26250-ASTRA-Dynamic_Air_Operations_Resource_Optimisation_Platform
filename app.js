/**
 * ASTRA-C2 // Core Application Orchestrator
 * Telemetry loop, Audio synthesizer, View routing, WTA UI, Canvas 4D Profiler, and Datalink streaming.
 */

const AstraApp = {
  activeView: 'copView',
  audioEnabled: true,
  audioCtx: null,
  selectedCandidateId: 'tiger01',
  missionElapsedSeconds: 13339, // T+03:42:19
  eventLogCounter: 1,

  // Squadrons Data
  squadrons: [
    {
      id: 'sqn17',
      name: 'No. 17 Squadron "Golden Arrows"',
      base: 'Ambala AFS (Forward Sector)',
      aircraft: 'Dassault Rafale F3-R',
      totalAirframes: 18,
      serviceable: 16,
      mcr: '88.8%',
      avgTat: '28 MINS',
      fuelStock: '94%',
      pilotsAlert1: 12,
      weapons: ['Meteor BVR', 'MICA-IR/RF', 'SCALP-EG', 'HAMMER PGM', 'Thales RBE2 AESA']
    },
    {
      id: 'sqn222',
      name: 'No. 222 Squadron "Tigersharks"',
      base: 'Halwara / Thanjavur Detachment',
      aircraft: 'Sukhoi Su-30MKI Super',
      totalAirframes: 16,
      serviceable: 14,
      mcr: '87.5%',
      avgTat: '36 MINS',
      fuelStock: '91%',
      pilotsAlert1: 10,
      weapons: ['BrahMos-A ALCM', 'R-77-1 BVR', 'R-73', 'Kh-31P ARM', 'Bars N011M PESA']
    },
    {
      id: 'sqn45',
      name: 'No. 45 Squadron "Flying Daggers"',
      base: 'Adampur Forward Air Base',
      aircraft: 'LCA Tejas Mk1A',
      totalAirframes: 10,
      serviceable: 9,
      mcr: '90.0%',
      avgTat: '24 MINS',
      fuelStock: '88%',
      pilotsAlert1: 8,
      weapons: ['Astra Mk1 BVR', 'ASRAAM', 'Python-5', 'EL/M-2052 AESA Pod']
    },
    {
      id: 'sqn07',
      name: 'No. 7 Squadron "Battle Axes"',
      base: 'Gwalior AFS (Reserve Swing Wing)',
      aircraft: 'Mirage 2000I/TI Vajra',
      totalAirframes: 12,
      serviceable: 10,
      mcr: '83.3%',
      avgTat: '34 MINS',
      fuelStock: '86%',
      pilotsAlert1: 6,
      weapons: ['MICA EM/IR', 'Spice-2000 PGM', 'Crystal Maze', 'RDY-3 Radar']
    }
  ],

  // Munitions Stockpile Data
  weaponsStockpile: [
    { name: 'METEOR BVR MISSILE', category: 'Air-to-Air (Ramjet)', count: 48, max: 60, status: 'EXCELLENT' },
    { name: 'ASTRA MK1/MK2 BVR', category: 'Air-to-Air (Indigenous)', count: 86, max: 100, status: 'OPTIMAL' },
    { name: 'SCALP-EG CRUISE MISSILE', category: 'Standoff Deep Strike', count: 24, max: 32, status: 'READY' },
    { name: 'BRAHMOS-A AIR-LAUNCHED', category: 'Supersonic Standoff (Mach 3)', count: 18, max: 24, status: 'PRIMED' },
    { name: 'HAMMER (AASM) PGM', category: 'Precision Guided Munition', count: 64, max: 80, status: 'OPTIMAL' },
    { name: 'SPICE-2000 PENETRATOR', category: 'Bunker Buster / Standoff', count: 32, max: 40, status: 'READY' }
  ],

  // ATO Sorties Schedule
  atoSorties: [
    { id: 'ATO-TR-0101', type: 'CAP', callsign: 'TIGER-01', aircraft: 'Rafale F3-R', base: 'Ambala AFS', target: 'Northern Ridge Sector-2', tot: 'ON-STATION', phase: 'Combat Patrol', fuel: '74%' },
    { id: 'ATO-TR-0102', type: 'CAP', callsign: 'TIGER-02', aircraft: 'Rafale F3-R', base: 'Ambala AFS', target: 'Northern Ridge Sector-2', tot: 'ON-STATION', phase: 'Wingman Escort', fuel: '71%' },
    { id: 'ATO-TR-0201', type: 'STRIKE', callsign: 'GARUDA-11', aircraft: 'Su-30MKI', base: 'Halwara AFS', target: 'Sector 4 Standoff Gate', tot: 'T+04:15:00', phase: 'Ingress Vector', fuel: '82%' },
    { id: 'ATO-TR-0301', type: 'CAP', callsign: 'BRAVO-04', aircraft: 'Tejas Mk1A', base: 'Adampur AFS', target: 'Forward Buffer Zone', tot: 'ON-STATION', phase: 'Low-Alt Orbit', fuel: '62%' },
    { id: 'ATO-TR-0010', type: 'AEW', callsign: 'NETRA-01', aircraft: 'DRDO EMB-145', base: 'Bhatinda AFS', target: 'Orbit Alpha (FL340)', tot: 'ON-STATION', phase: 'Radar Surveillance', fuel: '88%' },
    { id: 'ATO-TR-0020', type: 'AAR', callsign: 'VARUNA-01', aircraft: 'Il-78 MKI', base: 'Agra AFS', target: 'Orbit Echo (FL260)', tot: 'ON-STATION', phase: 'Refuelling Track', fuel: '94%' },
    { id: 'ATO-TR-0401', type: 'SEAD', callsign: 'VAJRA-09', aircraft: 'Mirage 2000I', base: 'Gwalior AFS', target: 'Western SAM Corridor', tot: 'T+05:00:00', phase: 'Alert-5 Scramble', fuel: '100%' }
  ],

  // Datalink Transmission Messages
  datalinkFeeds: [
    { tag: 'INFO', msg: 'IACCS Link-16 node handshake verified. 48 airframes reporting Mode-5 IFF.' },
    { tag: 'WARN', msg: 'AWACS Netra reports radar strobe anomaly at 33°48\'N bearing 340. Classifying contact.' },
    { tag: 'ALERT', msg: 'HQ-9B Surface-to-Air Radar mast detected moving into active track mode (Sector N-4).' },
    { tag: 'SUCCESS', msg: 'AAR Varuna-01 completed offload transfer to Tiger flight. 14,000 lbs fuel delivered.' },
    { tag: 'INFO', msg: 'Deconfliction engine completed 4D corridor validation for Day-1 ATO cycle. 0 spatial conflicts.' },
    { tag: 'ALERT', msg: 'Emergent HVT-ALPHA confirmed: Mobile TEL convoy spotted at Grid NV-9104.' }
  ],

  /**
   * App Initialization
   */
  init() {
    window.AstraApp = this;
    
    // Init Audio Context on first interaction
    this.initAudio();

    // Start clocks & timers
    this.startClocks();

    // Init Map
    AstraMap.init();

    // Setup Navigation Tabs
    this.setupNavigation();

    // Setup Sidebar Assets
    this.renderCopAssetList();

    // Setup Retasking & WTA View
    this.renderRetaskWorkspace();

    // Setup Fleet & Squadrons View
    this.renderFleetDashboard();

    // Setup 4D Deconfliction View & Canvas
    this.renderDeconflictionView();

    // Setup ATO Sortie Board
    this.renderAtoTable();

    // Setup "What-If" Simulation View
    this.setupSimulationView();

    // Setup Action Listeners & Modals
    this.setupActionListeners();

    // Start Datalink Stream simulation
    this.startDatalinkStream();

    // Live Telemetry Tick (updates aircraft slightly for realism)
    this.startTelemetryHeartbeat();
  },

  /**
   * Web Audio API Synthesizer (Realistic tactical military tones)
   */
  initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioCtx = new AudioContext();
    }

    const audioBtn = document.getElementById('audioToggleBtn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        this.audioEnabled = !this.audioEnabled;
        const icon = document.getElementById('audioIcon');
        const label = document.getElementById('audioLabel');
        if (this.audioEnabled) {
          icon.className = 'fa-solid fa-volume-high';
          label.textContent = 'AUDIO FX ON';
          audioBtn.style.color = 'var(--accent-cyan)';
          this.playAudioFx('click');
        } else {
          icon.className = 'fa-solid fa-volume-xmark';
          label.textContent = 'MUTED';
          audioBtn.style.color = '#64748b';
        }
      });
    }
  },

  playAudioFx(type) {
    if (!this.audioEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'alert') {
      // Dual-tone high military alert
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(880, now);
      osc2.frequency.setValueAtTime(1174, now);
      osc1.frequency.setValueAtTime(700, now + 0.15);
      osc2.frequency.setValueAtTime(950, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'radar') {
      // High subtle radar blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'confirm') {
      // Pleasant tactical authorization chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  },

  /**
   * Real-time Mission Clocks
   */
  startClocks() {
    const zuluEl = document.getElementById('zuluClock');
    const istEl = document.getElementById('istClock');
    const metEl = document.getElementById('metTimer');

    setInterval(() => {
      const now = new Date();
      // Zulu
      if (zuluEl) {
        zuluEl.textContent = now.toISOString().substring(11, 19) + 'Z';
      }
      // IST
      if (istEl) {
        istEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
      }
      // MET (Mission Elapsed Time)
      this.missionElapsedSeconds++;
      if (metEl) {
        const hrs = String(Math.floor(this.missionElapsedSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((this.missionElapsedSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(this.missionElapsedSeconds % 60).padStart(2, '0');
        metEl.textContent = `T+${hrs}:${mins}:${secs}`;
      }
    }, 1000);
  },

  /**
   * Tab Navigation Logic
   */
  setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-view');
        this.switchView(targetView);
      });
    });
  },

  switchView(viewId) {
    this.playAudioFx('click');
    this.activeView = viewId;

    // Update nav tab UI
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-view') === viewId);
    });

    // Update view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active-panel', panel.id === viewId);
    });

    // Refresh map if switching to COP
    if (viewId === 'copView' && AstraMap.map) {
      setTimeout(() => {
        AstraMap.map.invalidateSize();
      }, 100);
    }

    // Refresh canvas if switching to Deconflict
    if (viewId === 'deconflictView') {
      setTimeout(() => {
        this.drawAltitudeCanvas();
      }, 100);
    }
  },

  /**
   * Render COP Left Sidebar Asset List
   */
  renderCopAssetList() {
    const container = document.getElementById('copAssetList');
    if (!container) return;

    container.innerHTML = '';
    const searchVal = (document.getElementById('trackSearchInput')?.value || '').toLowerCase();

    AstraMap.assets
      .filter(a => 
        a.callsign.toLowerCase().includes(searchVal) || 
        a.type.toLowerCase().includes(searchVal) ||
        a.missionRole.toLowerCase().includes(searchVal)
      )
      .forEach(asset => {
        const isBlue = asset.side === 'bluefor';
        const card = document.createElement('div');
        card.className = `asset-card-compact ${asset.side} ${asset.category}`;
        card.id = `card-${asset.id}`;

        card.innerHTML = `
          <div class="asset-compact-top">
            <span class="asset-callsign">${asset.callsign}</span>
            <span class="asset-type-badge">${asset.type}</span>
          </div>
          <div class="asset-compact-metrics">
            <span>ALT: FL${Math.round(asset.altitudeFt / 100)}</span>
            <span>MACH: ${asset.mach}</span>
            <span class="${asset.fuel < asset.bingoFuel + 10 ? 'text-warning' : 'secure-green'}">FUEL: ${asset.fuel}%</span>
          </div>
          <div class="asset-compact-task">
            <i class="fa-solid fa-crosshairs text-cyan"></i>
            <span>${asset.missionRole}</span>
          </div>
        `;

        card.addEventListener('click', () => {
          AstraMap.selectAsset(asset);
          // Highlight card
          document.querySelectorAll('.asset-card-compact').forEach(c => c.classList.remove('active-track'));
          card.classList.add('active-track');
          // Center on asset in map
          AstraMap.map.setView(asset.coords, 8, { animate: true });
        });

        container.appendChild(card);
      });
  },

  /**
   * Floating Asset Telemetry HUD
   */
  showAssetHud(asset) {
    this.playAudioFx('radar');
    const hud = document.getElementById('assetTelemetryHud');
    if (!hud) return;

    document.getElementById('hudCallsign').textContent = asset.callsign;
    document.getElementById('hudType').textContent = asset.type;
    document.getElementById('hudPilot').textContent = asset.pilot;
    document.getElementById('hudAlt').textContent = `FL${Math.round(asset.altitudeFt / 100)} (${asset.altitudeFt.toLocaleString()} FT)`;
    document.getElementById('hudSpeed').textContent = `MACH ${asset.mach} (${Math.round(asset.mach * 660)} KTS)`;
    document.getElementById('hudFuel').textContent = `${asset.fuel}% (BINGO: ${asset.bingoFuel}%)`;
    document.getElementById('hudLoadout').textContent = asset.loadout.join(', ');
    document.getElementById('hudMission').textContent = asset.missionRole;

    hud.classList.remove('hidden');

    // Retask action from HUD
    const hudRetaskBtn = document.getElementById('hudRetaskBtn');
    if (hudRetaskBtn) {
      hudRetaskBtn.onclick = () => {
        this.switchView('retaskView');
        this.selectCandidate(asset.id);
      };
    }
  },

  /**
   * Render Retasking Workspace (AI Weapon-Target Assignment)
   */
  renderRetaskWorkspace() {
    const candidateList = document.getElementById('candidateList');
    if (!candidateList) return;

    // Run WTA algorithm
    const candidates = AstraOptimizer.evaluateRetaskCandidates(
      'HVT_TEL_RADAR',
      AstraMap.assets,
      AstraMap.samSites
    );

    candidateList.innerHTML = '';
    candidates.forEach((cand, index) => {
      const card = document.createElement('div');
      card.className = `candidate-card ${cand.id === this.selectedCandidateId ? 'selected-candidate' : ''}`;
      card.id = `cand-${cand.id}`;

      card.innerHTML = `
        <div class="cand-header">
          <span class="cand-rank">#${index + 1} RECOMMENDED SORTIE</span>
          <span class="cand-score">${cand.compositeScore}% MATCH</span>
        </div>
        <div style="font-family: var(--font-display); font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px;">
          ${cand.callsign} <span style="font-size: 11px; color: var(--accent-cyan); font-family: var(--font-mono)">(${cand.type})</span>
        </div>
        <div class="cand-body">
          <div class="cand-metric">
            <span class="cand-lbl">ETA TO INTERCEPT:</span>
            <span class="cand-val highlight-cyan">${cand.ttiMinutes} MINS</span>
          </div>
          <div class="cand-metric">
            <span class="cand-lbl">WEAPON Pk:</span>
            <span class="cand-val secure-green">${cand.pk}%</span>
          </div>
          <div class="cand-metric">
            <span class="cand-lbl">BEST WEAPON:</span>
            <span class="cand-val">${cand.bestWeapon}</span>
          </div>
          <div class="cand-metric">
            <span class="cand-lbl">SURVIVAL CHANCE:</span>
            <span class="cand-val secure-green">${cand.survival}%</span>
          </div>
        </div>
        <div class="cand-bar-wrap">
          <div class="cand-bar-label">
            <span>AI OPTIMIZATION CONFIDENCE</span>
            <span>${cand.compositeScore}%</span>
          </div>
          <div class="stat-progress-bar">
            <div class="progress-fill fill-cyan" style="width: ${cand.compositeScore}%"></div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectCandidate(cand.id);
      });

      candidateList.appendChild(card);
    });

    // Render solution details for selected candidate
    this.renderRetaskSolutionCard(candidates);
  },

  selectCandidate(candidateId) {
    this.playAudioFx('click');
    this.selectedCandidateId = candidateId;
    document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected-candidate'));
    const target = document.getElementById(`cand-${candidateId}`);
    if (target) target.classList.add('selected-candidate');

    const candidates = AstraOptimizer.evaluateRetaskCandidates('HVT_TEL_RADAR', AstraMap.assets, AstraMap.samSites);
    this.renderRetaskSolutionCard(candidates);
  },

  renderRetaskSolutionCard(candidates) {
    const container = document.getElementById('retaskSolutionCard');
    if (!container) return;

    const cand = candidates.find(c => c.id === this.selectedCandidateId) || candidates[0];
    if (!cand) return;

    container.innerHTML = `
      <div class="solution-hero-card">
        <div class="solution-hero-top">
          <div>
            <div class="solution-callsign">${cand.callsign}</div>
            <div class="solution-airframe">${cand.type} • PILOT: ${cand.pilot}</div>
          </div>
          <span class="badge-status status-ok">AI MATCH SCORE: ${cand.compositeScore}%</span>
        </div>

        <div class="solution-tactical-specs">
          <div class="spec-tile">
            <span class="spec-lbl">EST. INTERCEPT ETA</span>
            <span class="spec-val highlight-cyan">${cand.ttiMinutes} MINS</span>
          </div>
          <div class="spec-tile">
            <span class="spec-lbl">WEAPON SELECTION</span>
            <span class="spec-val">${cand.bestWeapon}</span>
          </div>
          <div class="spec-tile">
            <span class="spec-lbl">PROBABILITY OF KILL (Pk)</span>
            <span class="spec-val secure-green">${cand.pk}%</span>
          </div>
          <div class="spec-tile">
            <span class="spec-lbl">SURVIVAL CHANCE</span>
            <span class="spec-val secure-green">${cand.survival}%</span>
          </div>
        </div>

        <div class="route-recalc-breakdown">
          <div style="font-family: var(--font-display); font-size: 11px; font-weight: 700; color: #fff;">
            <i class="fa-solid fa-route text-cyan"></i> DYNAMIC RE-ROUTING FLIGHT PLAN (SAM EVASION ENVELOPE)
          </div>
          <div class="route-steps-list">
            <div class="route-step">
              <span class="step-dot"></span>
              <span class="step-name">1. BREAK OFF SECTOR 2 COMBAT AIR PATROL</span>
              <span class="step-alt">DESCENT TO FL180</span>
              <span class="step-stat">INITIATED</span>
            </div>
            <div class="route-step">
              <span class="step-dot"></span>
              <span class="step-name">2. TERRAIN MASKING ALONG RIDGE CHARLIE (CLEAR HQ-9B SAM BY 18.5 KM)</span>
              <span class="step-alt">NOE AT 500 FT</span>
              <span class="step-stat secure-green">DECONFLICTED</span>
            </div>
            <div class="route-step">
              <span class="step-dot"></span>
              <span class="step-name">3. POP-UP TO FL120 & STANDOFF LAUNCH (${cand.bestWeapon})</span>
              <span class="step-alt">STANDOFF 42 KM</span>
              <span class="step-stat highlight-cyan">WEAPONS AWAY</span>
            </div>
            <div class="route-step">
              <span class="step-dot"></span>
              <span class="step-name">4. HIGH-G EVASION TURN & EGRESS TO ADAMPUR AFS</span>
              <span class="step-alt">CLIMB TO FL380</span>
              <span class="step-stat">RTB SAFE</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Execute Retask Action
   */
  executeRetaskAuthorization() {
    this.playAudioFx('confirm');
    const candidates = AstraOptimizer.evaluateRetaskCandidates('HVT_TEL_RADAR', AstraMap.assets, AstraMap.samSites);
    const cand = candidates.find(c => c.id === this.selectedCandidateId) || candidates[0];

    // Switch to Map to show tactical rerouting animation
    this.switchView('copView');

    // Trigger Leaflet rerouting animation
    AstraMap.animateRetaskExecution(cand);

    // Broadcast C2 log message
    this.addC2EventLog(
      'ALERT',
      `RETASK AUTHORIZED: ${cand.callsign} re-routed to strike HVT-ALPHA with ${cand.bestWeapon}. Evasion path confirmed.`
    );

    // Update ATO Sortie Board
    const atoSortie = this.atoSorties.find(s => s.callsign === cand.callsign);
    if (atoSortie) {
      atoSortie.mission = 'DYNAMIC RETASK - STRIKE';
      atoSortie.target = 'HVT-ALPHA (TEL Radar)';
      atoSortie.phase = 'Combat Ingress';
      this.renderAtoTable();
    }

    // Update Banner
    const banner = document.getElementById('contingencyBanner');
    if (banner) {
      banner.style.border = '1px solid var(--accent-green)';
      banner.style.background = 'linear-gradient(90deg, rgba(0, 255, 136, 0.15) 0%, rgba(7, 13, 24, 0.95) 100%)';
      document.getElementById('contingencyTitle').textContent = `RETASK IN EXECUTION: ${cand.callsign} EN ROUTE TO HVT-ALPHA`;
      document.getElementById('contingencyDesc').textContent = `Aircraft is navigating along terrain-masked Corridor G-4 avoiding HQ-9B radar lobe. Weapon release calculated in 03:20 mins.`;
    }

    // Remove pending retask badge alert
    const badge = document.getElementById('pendingRetaskBadge');
    if (badge) {
      badge.textContent = 'EXECUTED';
      badge.className = 'badge-status status-ok';
    }

    // Show toast
    this.showToast(`RETASK AUTHORIZED // ${cand.callsign} EN ROUTE (Pk: ${cand.pk}%)`);
  },

  /**
   * Render Fleet & Squadron Dashboard
   */
  renderFleetDashboard() {
    const sqnContainer = document.getElementById('squadronGrid');
    const weaponsContainer = document.getElementById('weaponsGrid');
    if (!sqnContainer || !weaponsContainer) return;

    // Render Squadrons
    sqnContainer.innerHTML = '';
    this.squadrons.forEach(sqn => {
      const card = document.createElement('div');
      card.className = 'squadron-card';
      card.innerHTML = `
        <div class="squadron-header">
          <div>
            <div class="sqn-title">${sqn.name}</div>
            <div class="sqn-base"><i class="fa-solid fa-location-dot"></i> ${sqn.base}</div>
          </div>
          <span class="badge-status status-ok">${sqn.mcr} MCR</span>
        </div>
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); margin-bottom: 10px;">
          ${sqn.aircraft}
        </div>
        <div class="sqn-stats-row">
          <div class="sqn-stat-box">
            <div class="sqn-stat-lbl">AIRFRAMES</div>
            <div class="sqn-stat-num">${sqn.serviceable}/${sqn.totalAirframes}</div>
          </div>
          <div class="sqn-stat-box">
            <div class="sqn-stat-lbl">AVG TAT</div>
            <div class="sqn-stat-num highlight-cyan">${sqn.avgTat}</div>
          </div>
          <div class="sqn-stat-box">
            <div class="sqn-stat-lbl">PILOTS READY-1</div>
            <div class="sqn-stat-num secure-green">${sqn.pilotsAlert1}</div>
          </div>
        </div>
        <div class="pylon-loadout-preview">
          <div class="pylon-title">ARMAMENT & SENSOR PYRAMID:</div>
          <div class="pylon-badges">
            ${sqn.weapons.map(w => `<span class="pylon-tag">${w}</span>`).join('')}
          </div>
        </div>
      `;
      sqnContainer.appendChild(card);
    });

    // Render Munitions Stockpile
    weaponsContainer.innerHTML = '';
    this.weaponsStockpile.forEach(w => {
      const pct = Math.round((w.count / w.max) * 100);
      const card = document.createElement('div');
      card.className = 'weapon-stock-card';
      card.innerHTML = `
        <div class="w-name">${w.name}</div>
        <div class="w-category">${w.category}</div>
        <div class="w-stock-level">
          <span style="color:#64748b">INVENTORY:</span>
          <span class="highlight-cyan font-bold">${w.count} / ${w.max} (${pct}%)</span>
        </div>
        <div class="stat-progress-bar">
          <div class="progress-fill fill-cyan" style="width: ${pct}%"></div>
        </div>
      `;
      weaponsContainer.appendChild(card);
    });
  },

  /**
   * Render 4D Airspace Deconfliction View & Canvas Profiler
   */
  renderDeconflictionView() {
    const tableBody = document.getElementById('deconflictTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const corridorRows = [
      { name: 'CORRIDOR VAJRA-1', sortie: 'TIGER-01 & 02 (Rafale)', alt: 'FL250 - FL320', lat: '12.4 KM BUFFER', time: '12:00Z - 13:30Z', sam: '+38 KM STAGGER', stat: 'DECONFLICTED' },
      { name: 'STANDOFF GATE 4', sortie: 'GARUDA-11 (Su-30MKI)', alt: 'FL260 - FL280', lat: '18.0 KM BUFFER', time: '12:15Z - 14:00Z', sam: '+24 KM STAGGER', stat: 'DECONFLICTED' },
      { name: 'AEW ORBIT ALPHA', sortie: 'NETRA-01 (EMB-145)', alt: 'FL340 (FIXED)', lat: '35.0 KM RACEWAY', time: 'CONTINUOUS', sam: '+90 KM SAFE', stat: 'DECONFLICTED' },
      { name: 'AAR ORBIT ECHO', sortie: 'VARUNA-01 (Il-78 MKI)', alt: 'FL260 (FIXED)', lat: '20.0 KM ORBIT', time: 'CONTINUOUS', sam: '+110 KM SAFE', stat: 'DECONFLICTED' },
      { name: 'NOE PENETRATION', sortie: 'RETASK TIGER-01', alt: '0 - 500 FT AGL', lat: 'TERRAIN MASKED', time: 'T+03:45 - 04:00', sam: 'SAM BLIND SPOT', stat: 'OPTIMIZED' }
    ];

    corridorRows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color:var(--accent-cyan); font-weight:700;">${row.name}</td>
        <td>${row.sortie}</td>
        <td class="highlight-cyan">${row.alt}</td>
        <td>${row.lat}</td>
        <td>${row.time}</td>
        <td class="secure-green">${row.sam}</td>
        <td><span class="badge-status status-ok">${row.stat}</span></td>
      `;
      tableBody.appendChild(tr);
    });

    this.drawAltitudeCanvas();
  },

  /**
   * 4D Altitude Profiler Canvas Drawing
   */
  drawAltitudeCanvas() {
    const canvas = document.getElementById('altitudeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#03060c';
    ctx.fillRect(0, 0, width, height);

    // Draw Altitude Flight Level Grid Lines (FL000 to FL500)
    ctx.strokeStyle = 'rgba(30, 58, 98, 0.4)';
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillStyle = '#475569';

    for (let fl = 0; fl <= 500; fl += 100) {
      const y = height - (fl / 500) * (height - 40) - 20;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(`FL${String(fl).padStart(3, '0')}`, 5, y + 3);
    }

    // Draw Terrain Contour at Bottom (Mountain ridges / Leh sector)
    ctx.fillStyle = 'rgba(0, 255, 136, 0.12)';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, height - 20);

    const terrainPoints = [
      [40, height - 25],
      [150, height - 35],
      [300, height - 70],
      [450, height - 120], // High Mountain Ridge Charlie
      [600, height - 85],
      [750, height - 140], // Pass
      [900, height - 55],
      [1100, height - 30],
      [width, height - 25]
    ];

    terrainPoints.forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(width, height);
    ctx.lineTo(40, height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00ff88';
    ctx.fillText('TERRAIN MASKING ENVELOPE (RIDGE CHARLIE - NOE PROFILE)', 460, height - 125);

    // Draw SAM Threat Ceiling (HQ-9B WEZ Envelope: Red hatched area)
    ctx.fillStyle = 'rgba(255, 51, 75, 0.12)';
    ctx.strokeStyle = '#ff334b';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.rect(650, 40, 400, height - 130);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff334b';
    ctx.fillText('HQ-9B SAM ENGAGEMENT CEILING (FL450)', 660, 55);

    // Draw AWACS Orbit Line (Purple FL340)
    const yAwacs = height - (340 / 500) * (height - 40) - 20;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, yAwacs);
    ctx.lineTo(500, yAwacs);
    ctx.stroke();
    ctx.fillStyle = '#c084fc';
    ctx.fillText('NETRA-AWACS ORBIT (FL340)', 100, yAwacs - 8);

    // Draw Tanker Orbit Line (Amber FL260)
    const yTanker = height - (260 / 500) * (height - 40) - 20;
    ctx.strokeStyle = '#ffb020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, yTanker);
    ctx.lineTo(600, yTanker);
    ctx.stroke();
    ctx.fillStyle = '#ffb020';
    ctx.fillText('VARUNA-01 TANKER ORBIT (FL260)', 140, yTanker - 8);

    // Draw Strike Flight Profile (Cyan curve from FL320 down to NOE then pop-up)
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(60, height - (320 / 500) * (height - 40) - 20);
    ctx.bezierCurveTo(
      250, height - (320 / 500) * (height - 40) - 20,
      350, height - 90,
      500, height - 90 // Low altitude NOE ingress under radar
    );
    ctx.lineTo(750, height - 90);
    // Pop up attack to FL140
    ctx.bezierCurveTo(
      820, height - 90,
      860, height - (140 / 500) * (height - 40) - 20,
      950, height - (140 / 500) * (height - 40) - 20
    );
    ctx.stroke();

    ctx.fillStyle = '#00e5ff';
    ctx.fillText('TIGER-01 DYNAMIC RETASK PROFILE (NOE PENETRATION -> POP-UP LAUNCH)', 260, height - 100);
  },

  /**
   * Render ATO Sortie Board
   */
  renderAtoTable() {
    const tableBody = document.getElementById('atoTableBody');
    if (!tableBody) return;

    const filter = document.getElementById('atoTypeFilter')?.value || 'ALL';
    tableBody.innerHTML = '';

    this.atoSorties
      .filter(s => filter === 'ALL' || s.type === filter)
      .forEach(sortie => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="color:var(--accent-cyan); font-weight:700;">${sortie.id}</td>
          <td><span class="badge-sub">${sortie.type}</span></td>
          <td style="font-weight:700; color:#fff;">${sortie.callsign}</td>
          <td>${sortie.aircraft}</td>
          <td>${sortie.base}</td>
          <td class="highlight-cyan">${sortie.target}</td>
          <td>${sortie.tot}</td>
          <td class="secure-green"><i class="fa-solid fa-plane-up"></i> ${sortie.phase}</td>
          <td>${sortie.fuel}</td>
          <td>
            <button class="btn-tactical btn-small btn-secondary" onclick="AstraApp.switchView('copView')">
              <i class="fa-solid fa-eye"></i> TRACK
            </button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
  },

  /**
   * Setup "What-If" Contingency Simulation Sandbox
   */
  setupSimulationView() {
    const runwayToggle = document.getElementById('simRunwayToggle');
    const samToggle = document.getElementById('simSamToggle');
    const weatherToggle = document.getElementById('simWeatherToggle');
    const tankerToggle = document.getElementById('simTankerToggle');
    const executeBtn = document.getElementById('executeSimBtn');

    const updateSim = () => {
      this.playAudioFx('click');
      AstraSimulation.state.runwayCratered = runwayToggle ? runwayToggle.checked : false;
      AstraSimulation.state.samRadarSpike = samToggle ? samToggle.checked : false;
      AstraSimulation.state.severeWeather = weatherToggle ? weatherToggle.checked : false;
      AstraSimulation.state.tankerFailure = tankerToggle ? tankerToggle.checked : false;

      // Update labels
      if (document.getElementById('simRunwayLabel')) document.getElementById('simRunwayLabel').textContent = runwayToggle.checked ? 'ACTIVE' : 'INACTIVE';
      if (document.getElementById('simSamLabel')) document.getElementById('simSamLabel').textContent = samToggle.checked ? 'ACTIVE' : 'INACTIVE';
      if (document.getElementById('simWeatherLabel')) document.getElementById('simWeatherLabel').textContent = weatherToggle.checked ? 'ACTIVE' : 'INACTIVE';
      if (document.getElementById('simTankerLabel')) document.getElementById('simTankerLabel').textContent = tankerToggle.checked ? 'ACTIVE' : 'INACTIVE';

      const results = AstraSimulation.runEvaluation();
      document.getElementById('simSuccessRate').textContent = `${results.successRate}%`;
      document.getElementById('simAttritionRisk').textContent = `${results.attritionRisk}%`;
      document.getElementById('simTatImpact').textContent = results.tatImpact;
      document.getElementById('simPkScore').textContent = `${results.pkScore}%`;
      document.getElementById('simMitigationText').textContent = results.mitigationPlan;

      // Color code success rate
      const successEl = document.getElementById('simSuccessRate');
      if (results.successRate < 80) successEl.style.color = 'var(--accent-red)';
      else if (results.successRate < 90) successEl.style.color = 'var(--accent-amber)';
      else successEl.style.color = 'var(--accent-cyan)';
    };

    [runwayToggle, samToggle, weatherToggle, tankerToggle].forEach(el => {
      if (el) el.addEventListener('change', updateSim);
    });

    if (executeBtn) {
      executeBtn.addEventListener('click', () => {
        this.playAudioFx('confirm');
        this.showToast('MONTE-CARLO 10,000-RUN SIMULATION CONVERGED (0.18s)');
        updateSim();
      });
    }

    // Run initial eval
    updateSim();
  },

  /**
   * Action Listeners, Buttons, and Modal Popups
   */
  setupActionListeners() {
    // Retask Authorization from Retasking screen
    const authorizeRetaskBtn = document.getElementById('authorizeRetaskBtn');
    if (authorizeRetaskBtn) {
      authorizeRetaskBtn.addEventListener('click', () => this.executeRetaskAuthorization());
    }

    // Top Header: Run AI Optimizer
    const runOptimizerBtn = document.getElementById('runOptimizerBtn');
    if (runOptimizerBtn) {
      runOptimizerBtn.addEventListener('click', () => {
        this.playAudioFx('confirm');
        this.showToast('AI OPTIMIZER RE-CONVERGED: ALL 48 SORTIES BALANCED');
        this.renderRetaskWorkspace();
      });
    }

    // Top Header: Inject Contingency Modal
    const triggerBtn = document.getElementById('triggerContingencyBtn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        this.openContingencyModal();
      });
    }

    // Modal Close / Actions
    const modal = document.getElementById('contingencyModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalDismissBtn = document.getElementById('modalDismissBtn');
    const modalReviewBtn = document.getElementById('modalReviewBtn');
    const modalInstantAuthBtn = document.getElementById('modalInstantAuthBtn');

    if (modalCloseBtn) modalCloseBtn.onclick = () => modal.classList.add('hidden');
    if (modalDismissBtn) modalDismissBtn.onclick = () => modal.classList.add('hidden');
    if (modalReviewBtn) {
      modalReviewBtn.onclick = () => {
        modal.classList.add('hidden');
        this.switchView('retaskView');
      };
    }
    if (modalInstantAuthBtn) {
      modalInstantAuthBtn.onclick = () => {
        modal.classList.add('hidden');
        this.executeRetaskAuthorization();
      };
    }

    // Close Floating Asset HUD
    const closeHudBtn = document.getElementById('closeHudBtn');
    if (closeHudBtn) {
      closeHudBtn.onclick = () => {
        document.getElementById('assetTelemetryHud').classList.add('hidden');
      };
    }

    // Search filter for COP tracks
    const trackSearchInput = document.getElementById('trackSearchInput');
    if (trackSearchInput) {
      trackSearchInput.addEventListener('input', () => this.renderCopAssetList());
    }

    // ATO Type Filter
    const atoTypeFilter = document.getElementById('atoTypeFilter');
    if (atoTypeFilter) {
      atoTypeFilter.addEventListener('change', () => this.renderAtoTable());
    }

    // Map Layer Toggles
    const toggleAirbases = document.getElementById('toggleAirbases');
    const toggleSam = document.getElementById('toggleSamRings');
    const toggleCorridors = document.getElementById('toggleCorridors');
    const toggleAwacs = document.getElementById('toggleAwacs');
    const toggleRadarSweep = document.getElementById('toggleRadarSweep');

    const handlePillToggle = (btn, layerKey) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const isActive = btn.classList.contains('active');
        AstraMap.toggleLayer(layerKey, isActive);
        this.playAudioFx('click');
      });
    };

    handlePillToggle(toggleAirbases, 'airbases');
    handlePillToggle(toggleSam, 'sam');
    handlePillToggle(toggleCorridors, 'corridor');
    handlePillToggle(toggleAwacs, 'awacs');
    handlePillToggle(toggleRadarSweep, 'radar');
  },

  openContingencyModal() {
    this.playAudioFx('alert');
    const modal = document.getElementById('contingencyModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  },

  /**
   * Real-time Datalink event stream
   */
  startDatalinkStream() {
    const streamContainer = document.getElementById('c2EventStream');
    if (!streamContainer) return;

    // Initial logs
    this.datalinkFeeds.forEach(item => {
      this.addC2EventLog(item.tag, item.msg);
    });

    // Auto append simulated tactical feed every 6 seconds
    const cyclicMessages = [
      { tag: 'INFO', msg: 'Halwara Sector Control: Su-30MKI Garuda-11 confirmed locked onto datalink track 402.' },
      { tag: 'WARN', msg: 'Tactical EW receiver detects frequency hopping from Skardu sector (Band X).' },
      { tag: 'SUCCESS', msg: 'Airspace corridor Vajra-1 clear. Civil traffic hold verified over Amritsar-Jammu corridor.' },
      { tag: 'INFO', msg: 'Astra-Mk2 telemetry downlink: Pk verification 91.2% at 85 km slant range.' },
      { tag: 'WARN', msg: 'Tiger-02 reports light mountain icing at FL320. Altitude deconfliction verified.' }
    ];

    let index = 0;
    setInterval(() => {
      const feed = cyclicMessages[index % cyclicMessages.length];
      this.addC2EventLog(feed.tag, feed.msg);
      index++;
    }, 7000);
  },

  addC2EventLog(tag, msg) {
    const container = document.getElementById('c2EventStream');
    if (!container) return;

    const card = document.createElement('div');
    const tagClass = tag === 'ALERT' ? 'alert' : (tag === 'WARN' ? 'warn' : 'success');
    card.className = `c2-log-card ${tagClass}`;

    const now = new Date();
    const timeStr = now.toISOString().substring(11, 19) + 'Z';

    card.innerHTML = `
      <div class="log-meta">
        <span>#LOG-${String(this.eventLogCounter++).padStart(4, '0')} // [${tag}]</span>
        <span>${timeStr}</span>
      </div>
      <div class="log-msg">${msg}</div>
    `;

    container.insertBefore(card, container.firstChild);

    // Keep log max length 20
    if (container.children.length > 20) {
      container.removeChild(container.lastChild);
    }
  },

  /**
   * Live Telemetry Heartbeat (aircraft slightly shifts coords to demonstrate live tactical movement)
   */
  startTelemetryHeartbeat() {
    setInterval(() => {
      AstraMap.assets.forEach(asset => {
        if (asset.side === 'bluefor') {
          // Slight realistic drift
          asset.coords[0] += (Math.random() - 0.49) * 0.003;
          asset.coords[1] += (Math.random() - 0.49) * 0.003;
          // Fuel burns down slowly
          if (Math.random() > 0.7 && asset.fuel > asset.bingoFuel) {
            asset.fuel -= 1;
          }
          AstraMap.createOrUpdateMarker(asset);
        }
      });
    }, 2000);
  },

  /**
   * Tactical Toast Alerts
   */
  showToast(message, isAlert = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `tactical-toast ${isAlert ? 'alert' : ''}`;
    toast.innerHTML = `
      <i class="fa-solid ${isAlert ? 'fa-triangle-exclamation text-danger' : 'fa-circle-check secure-green'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
};

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  AstraApp.init();
});
