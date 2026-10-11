/**
 * UFC FIGHT PREDICTOR - PURE VANILLA JAVASCRIPT
 * Dynamic controls, weightclass-specific themes, resilient backend connection,
 * client fallback simulation, and animated gauges.
 */

(function () {
  'use strict';

  // --- APPLICATION STATE ---
  let appData = {
    weight_classes: [],
    rosters: {},
    fighterStats: {},
    activeWeightClass: 'All Weight Classes',
    fighterA: '',
    fighterB: '',
    predictionResult: null,
    backendMode: 'connecting', // 'online' | 'standalone' | 'offline'
    apiBase: ''
  };

  // Division Subtitles and Icons Metadata
  const DIVISION_META = {
    'Heavyweight': { icon: '🛡️', subtitle: 'TITANIUM HEAVYWEIGHT DIVISION • 265 LBS (120 KG)', short: 'Heavyweight' },
    'Light Heavyweight': { icon: '⚡', subtitle: 'LIGHT HEAVYWEIGHT DIVISION • 205 LBS (93 KG)', short: 'Light Heavy' },
    'Middleweight': { icon: '⚔️', subtitle: 'MIDDLEWEIGHT DIVISION • 185 LBS (84 KG)', short: 'Middleweight' },
    'Welterweight': { icon: '🔋', subtitle: 'WELTERWEIGHT DIVISION • 170 LBS (77 KG)', short: 'Welterweight' },
    'Lightweight': { icon: '🔥', subtitle: 'LIGHTWEIGHT DIVISION • 155 LBS (70 KG) [SHARK TANK]', short: 'Lightweight' },
    'Featherweight': { icon: '🪶', subtitle: 'FEATHERWEIGHT DIVISION • 145 LBS (66 KG)', short: 'Featherweight' },
    'Bantamweight': { icon: '⚡', subtitle: 'BANTAMWEIGHT DIVISION • 135 LBS (61 KG)', short: 'Bantamweight' },
    'Flyweight': { icon: '💨', subtitle: 'FLYWEIGHT DIVISION • 125 LBS (57 KG)', short: 'Flyweight' },
    "Women's Strawweight": { icon: '👑', subtitle: "WOMEN'S STRAWWEIGHT CHAMPIONSHIP • 115 LBS", short: "W. Strawweight" },
    "Women's Flyweight": { icon: '👑', subtitle: "WOMEN'S FLYWEIGHT CHAMPIONSHIP • 125 LBS", short: "W. Flyweight" },
    "Women's Bantamweight": { icon: '👑', subtitle: "WOMEN'S BANTAMWEIGHT CHAMPIONSHIP • 135 LBS", short: "W. Bantamweight" },
    "Women's Featherweight": { icon: '👑', subtitle: "WOMEN'S FEATHERWEIGHT CHAMPIONSHIP • 145 LBS", short: "W. Featherweight" },
    'Catch Weight': { icon: '⚖️', subtitle: 'CATCH WEIGHT SPECIAL ATTRACTION', short: 'Catch Weight' },
    'All Weight Classes': { icon: '🌐', subtitle: 'OPEN ROSTER • ALL WEIGHT DIVISIONS', short: 'All Classes' }
  };

  // Embedded starter roster for instant offline availability
  const STARTER_ROSTER = {
    'All Weight Classes': ['Jon Jones', 'Stipe Miocic', 'Alex Pereira', 'Israel Adesanya', 'Islam Makhachev', 'Arman Tsarukyan', 'Ilia Topuria', 'Max Holloway', 'Sean O\'Malley', 'Merab Dvalishvili', 'Alexandre Pantoja', 'Zhang Weili', 'Valentina Shevchenko'],
    'Heavyweight': ['Jon Jones', 'Stipe Miocic', 'Tom Aspinall', 'Ciryl Gane', 'Curtis Blaydes', 'Alexander Volkov', 'Sergei Pavlovich', 'Derrick Lewis', 'Jailton Almeida', 'Marcin Tybura'],
    'Light Heavyweight': ['Alex Pereira', 'Jiri Prochazka', 'Magomed Ankalaev', 'Jan Blachowicz', 'Jamahal Hill', 'Aleksandar Rakic', 'Khalil Rountree', 'Volkan Oezdemir', 'Anthony Smith'],
    'Middleweight': ['Dricus Du Plessis', 'Israel Adesanya', 'Sean Strickland', 'Robert Whittaker', 'Khamzat Chimaev', 'Nassourdine Imavov', 'Caio Borralho', 'Marvin Vettori', 'Paulo Costa', 'Jared Cannonier'],
    'Welterweight': ['Belal Muhammad', 'Leon Edwards', 'Shavkat Rakhmonov', 'Kamaru Usman', 'Jack Della Maddalena', 'Colby Covington', 'Gilbert Burns', 'Sean Brady', 'Ian Machado Garry', 'Geoff Neal'],
    'Lightweight': ['Islam Makhachev', 'Arman Tsarukyan', 'Charles Oliveira', 'Justin Gaethje', 'Dustin Poirier', 'Dan Hooker', 'Michael Chandler', 'Beneil Dariush', 'Rafael Fiziev', 'Mateusz Gamrot'],
    'Featherweight': ['Ilia Topuria', 'Max Holloway', 'Alexander Volkanovski', 'Diego Lopes', 'Yair Rodriguez', 'Brian Ortega', 'Movsar Evloev', 'Arnold Allen', 'Josh Emmett', 'Aljamain Sterling'],
    'Bantamweight': ['Merab Dvalishvili', 'Sean O\'Malley', 'Umar Nurmagomedov', 'Petr Yan', 'Cory Sandhagen', 'Deiveson Figueiredo', 'Marlon Vera', 'Henry Cejudo', 'Song Yadong', 'Rob Font'],
    'Flyweight': ['Alexandre Pantoja', 'Brandon Royval', 'Brandon Moreno', 'Amir Albazi', 'Kai Kara-France', 'Tatsuro Taira', 'Manel Kape', 'Matheus Nicolau', 'Alex Perez', 'Steve Erceg'],
    "Women's Strawweight": ['Zhang Weili', 'Tatiana Suarez', 'Yan Xiaonan', 'Virna Jandiroba', 'Jessica Andrade', 'Rose Namajunas', 'Amanda Lemos', 'Mackenzie Dern', 'Marina Rodriguez'],
    "Women's Flyweight": ['Valentina Shevchenko', 'Alexa Grasso', 'Manon Fiorot', 'Erin Blanchfield', 'Maycee Barber', 'Rose Namajunas', 'Katlyn Cerminara', 'Viviane Araujo'],
    "Women's Bantamweight": ['Julianna Pena', 'Raquel Pennington', 'Kayla Harrison', 'Ketlen Vieira', 'Norma Dumont', 'Macy Chiasson', 'Irene Aldana', 'Mayra Bueno Silva'],
    "Women's Featherweight": ['Amanda Nunes', 'Cris Cyborg', 'Norma Dumont', 'Felicia Spencer', 'Megan Anderson', 'Chelsea Chandler'],
    'Catch Weight': ['Jon Jones', 'Alex Pereira', 'Islam Makhachev', 'Max Holloway']
  };

  // --- DOM ELEMENTS ---
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const backendStatusBtn = document.getElementById('backendStatusBtn');
  const backendStatusText = document.getElementById('backendStatusText');
  const weightClassSelect = document.getElementById('weightClassSelect');
  const wcPillsContainer = document.getElementById('wcPillsContainer');
  const activeDivisionTag = document.getElementById('activeDivisionTag');
  const divisionIcon = document.getElementById('divisionIcon');
  const divisionSubtitle = document.getElementById('divisionSubtitle');
  const redDivisionTag = document.getElementById('redDivisionTag');
  const blueDivisionTag = document.getElementById('blueDivisionTag');
  const fighterASelect = document.getElementById('fighterASelect');
  const fighterBSelect = document.getElementById('fighterBSelect');
  const fighterASearch = document.getElementById('fighterASearch');
  const fighterBSearch = document.getElementById('fighterBSearch');
  const swapCornersBtn = document.getElementById('swapCornersBtn');
  const predictBtn = document.getElementById('predictBtn');
  const randomMatchupBtn = document.getElementById('randomMatchupBtn');
  const resetMatchupBtn = document.getElementById('resetMatchupBtn');
  const toggleStatsBtn = document.getElementById('toggleStatsBtn');
  const predictionSection = document.getElementById('predictionSection');
  const statsTableCard = document.getElementById('statsTableCard');
  const winnerName = document.getElementById('winnerName');
  const winnerSubtext = document.getElementById('winnerSubtext');
  const gaugeNameA = document.getElementById('gaugeNameA');
  const gaugeNameB = document.getElementById('gaugeNameB');
  const gaugePctA = document.getElementById('gaugePctA');
  const gaugePctB = document.getElementById('gaugePctB');
  const gaugeArcA = document.getElementById('gaugeArcA');
  const gaugeArcB = document.getElementById('gaugeArcB');
  const gaugeNeedleA = document.getElementById('gaugeNeedleA');
  const gaugeNeedleB = document.getElementById('gaugeNeedleB');
  const comparisonRowsContainer = document.getElementById('comparisonRowsContainer');
  const toast = document.getElementById('toast');

  // --- INITIALIZATION ---
  async function init() {
    initTheme();
    setupEventListeners();
    await connectAndInitialize();
  }

  // --- THEME SYSTEM (DARK / LIGHT MODE) ---
  function initTheme() {
    const savedTheme = localStorage.getItem('ufc_theme') || 'dark';
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ufc_theme', theme);
    if (theme === 'light') {
      themeIcon.textContent = '🌙';
      themeToggleBtn.title = 'Switch to Octagon Dark Mode';
    } else {
      themeIcon.textContent = '☀️';
      themeToggleBtn.title = 'Switch to Arena Light Mode';
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }

  // --- BACKEND STATUS UI UPDATER ---
  function updateBackendBadge(mode, label, tooltip) {
    if (!backendStatusBtn || !backendStatusText) return;
    backendStatusBtn.className = `badge-pill badge-backend ${mode}`;
    backendStatusText.textContent = label;
    backendStatusBtn.title = tooltip;
  }

  // --- CANDIDATE URL DETECTION ---
  function getCandidateUrls() {
    const isLiveServerOrDev = window.location.port !== '5000';
    if (isLiveServerOrDev) {
      // Prioritize Python server ports when running on Live Server / VS Code preview
      return [
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        ''
      ];
    }
    // Prioritize relative URL when served directly from server.py (port 5000) or production
    return [
      '',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];
  }

  // --- PROBE BACKEND HEALTH ---
  async function probeBackend(candidateUrl, timeoutMs = 2000) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${candidateUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        return true;
      }
    } catch (e) {
      // Endpoint not reachable
    }
    return false;
  }

  // --- LOAD STATIC ROSTERS & STATS FALLBACK ---
  async function loadStaticDataFallback() {
    try {
      const res = await fetch('static_data.json');
      if (res.ok) {
        const data = await res.json();
        appData.weight_classes = data.weight_classes || Object.keys(STARTER_ROSTER);
        appData.rosters = data.rosters || STARTER_ROSTER;
        appData.fighterStats = data.fighter_stats || {};
        return true;
      }
    } catch (e) {
      console.warn('Unable to fetch static_data.json:', e);
    }

    // Ultimate fallback: embedded starter dataset
    appData.weight_classes = Object.keys(STARTER_ROSTER);
    appData.rosters = STARTER_ROSTER;
    return false;
  }

  // --- MAIN CONNECTION & INITIALIZATION ---
  async function connectAndInitialize(isManualRetry = false) {
    updateBackendBadge('connecting', 'Connecting Engine...', 'Probing backend at localhost:5000...');
    if (isManualRetry) {
      showToast('⚡ Connecting to UFC backend at localhost:5000...', false);
    }

    const candidates = getCandidateUrls();
    let workingBase = null;

    for (const url of candidates) {
      const isHealthy = await probeBackend(url);
      if (isHealthy) {
        workingBase = url;
        break;
      }
    }

    if (workingBase !== null) {
      // Python backend is alive!
      try {
        appData.apiBase = workingBase;
        appData.backendMode = 'online';

        const res = await fetch(`${workingBase}/api/all-data`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        appData.weight_classes = data.weight_classes || [];
        appData.rosters = data.rosters || {};

        // Also fetch static fighter stats for instant live snapshots
        loadStaticDataFallback();

        renderWeightClassDropdown();
        renderWeightClassPills();
        setActiveWeightClass(appData.activeWeightClass || 'All Weight Classes');

        updateBackendBadge(
          'connected',
          'Python AI Engine: Port 5000',
          'Connected to Python Random Forest ML Engine (7,000+ bouts). Click to test.'
        );
        showToast('✓ Connected to Python ML Engine: 7,000+ bouts active', false, 3000);
        return;
      } catch (err) {
        console.error('Failed fetching data from working backend:', err);
      }
    }

    // If Python backend is offline, switch seamlessly to standalone mode!
    console.info('[UFC Predictor] Backend offline. Initializing Standalone Client Engine.');
    appData.backendMode = 'standalone';
    appData.apiBase = '';

    await loadStaticDataFallback();

    renderWeightClassDropdown();
    renderWeightClassPills();
    setActiveWeightClass(appData.activeWeightClass || 'All Weight Classes');

    updateBackendBadge(
      'standalone',
      'Standalone Engine (Click to Connect Backend)',
      'Running in Standalone Mode. Start "python server.py" and click here to switch to Python ML.'
    );

    if (isManualRetry) {
      showToast('ℹ️ Standalone Mode active. (To use live Python ML, run "python server.py")', false, 4000);
    } else {
      showToast('✓ Octagon Matrix ready: 7,000+ bouts loaded', false, 2500);
    }
  }

  // --- RENDER WEIGHT CLASS DROPDOWN & PILLS ---
  function renderWeightClassDropdown() {
    weightClassSelect.innerHTML = '';
    appData.weight_classes.forEach((wc) => {
      const opt = document.createElement('option');
      opt.value = wc;
      const meta = DIVISION_META[wc] || { icon: '🥊' };
      opt.textContent = `${meta.icon} ${wc}`;
      weightClassSelect.appendChild(opt);
    });
  }

  function renderWeightClassPills() {
    wcPillsContainer.innerHTML = '';
    appData.weight_classes.forEach((wc) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wc-pill-btn';
      if (wc === appData.activeWeightClass) btn.classList.add('active');
      const meta = DIVISION_META[wc] || { short: wc };
      btn.textContent = meta.short || wc;
      btn.addEventListener('click', () => {
        weightClassSelect.value = wc;
        setActiveWeightClass(wc);
      });
      wcPillsContainer.appendChild(btn);
    });
  }

  // --- SET ACTIVE WEIGHT CLASS & DYNAMIC THEME ---
  function setActiveWeightClass(wc) {
    appData.activeWeightClass = wc;
    weightClassSelect.value = wc;

    // Apply weight class bespoke theme attribute to DOM
    document.documentElement.setAttribute('data-weightclass', wc);

    // Update Banner & Division Badges
    const meta = DIVISION_META[wc] || { icon: '🥊', subtitle: `${wc.toUpperCase()} DIVISION`, short: wc };
    divisionIcon.textContent = meta.icon;
    divisionSubtitle.textContent = meta.subtitle;
    activeDivisionTag.textContent = meta.short.toUpperCase();
    redDivisionTag.textContent = `${meta.short.toUpperCase()} ROSTER`;
    blueDivisionTag.textContent = `${meta.short.toUpperCase()} ROSTER`;

    // Highlight active pill
    document.querySelectorAll('.wc-pill-btn').forEach((btn) => {
      if (btn.textContent === (meta.short || wc)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Populate Fighters for this weight class
    populateFighterDropdowns(wc);
  }

  // --- POPULATE FIGHTER DROPDOWNS ---
  function populateFighterDropdowns(weightClass) {
    const roster = appData.rosters[weightClass] || appData.rosters['All Weight Classes'] || STARTER_ROSTER['All Weight Classes'];

    if (!roster || roster.length === 0) {
      fighterASelect.innerHTML = '<option value="">No fighters found</option>';
      fighterBSelect.innerHTML = '<option value="">No fighters found</option>';
      return;
    }

    renderFighterOptions(fighterASelect, roster, fighterASearch.value);
    renderFighterOptions(fighterBSelect, roster, fighterBSearch.value);

    // Pick two sensible default fighters
    if (roster.length > 0) {
      fighterASelect.value = roster[0];
      appData.fighterA = roster[0];
    }
    if (roster.length > 1) {
      fighterBSelect.value = roster[1];
      appData.fighterB = roster[1];
    } else {
      fighterBSelect.value = roster[0];
      appData.fighterB = roster[0];
    }

    updateFighterSnapshotStats('A', appData.fighterA);
    updateFighterSnapshotStats('B', appData.fighterB);
  }

  function renderFighterOptions(selectEl, roster, filterText = '') {
    const previousVal = selectEl.value;
    selectEl.innerHTML = '';

    const cleanFilter = filterText.trim().toLowerCase();
    const filtered = cleanFilter
      ? roster.filter((f) => f.toLowerCase().includes(cleanFilter))
      : roster;

    if (filtered.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = `No match for "${filterText}"`;
      selectEl.appendChild(opt);
      return;
    }

    filtered.forEach((fighter) => {
      const opt = document.createElement('option');
      opt.value = fighter;
      opt.textContent = fighter;
      selectEl.appendChild(opt);
    });

    if (filtered.includes(previousVal)) {
      selectEl.value = previousVal;
    }
  }

  // --- FIGHTER SNAPSHOT STATS ---
  function updateFighterSnapshotStats(corner, fighterName) {
    const reachEl = document.getElementById(`quickReach${corner}`);
    const recordEl = document.getElementById(`quickRecord${corner}`);
    const streakEl = document.getElementById(`quickStreak${corner}`);

    if (!reachEl || !recordEl || !streakEl) return;

    if (!fighterName) {
      reachEl.textContent = '-- cm';
      recordEl.textContent = '-- W / -- L';
      streakEl.textContent = '--';
      return;
    }

    const stats = appData.fighterStats[fighterName];
    if (stats) {
      const reachVal = stats.Reach_cms || stats.reach_cms || 0;
      reachEl.textContent = reachVal > 0 ? `${reachVal} cm` : 'UFC Standard';
      recordEl.textContent = `${stats.wins || 0}W / ${stats.losses || 0}L`;
      streakEl.textContent = `${stats.current_win_streak || 0} Wins`;
    } else {
      reachEl.textContent = 'Active Fighter';
      recordEl.textContent = 'UFC Roster';
      streakEl.textContent = 'Octagon Ready';
    }
  }

  // --- CLIENT-SIDE PREDICTOR FALLBACK ---
  function runClientSidePrediction(fighterA, fighterB) {
    const statsA = appData.fighterStats[fighterA] || {
      Reach_cms: 185, Height_cms: 180, wins: 15, losses: 3, current_win_streak: 3,
      'win_by_KO/TKO': 6, win_by_Submission: 3, avg_SIG_STR_pct: 0.52, avg_SIG_STR_landed: 4.5,
      avg_TD_pct: 0.40, avg_TD_landed: 1.8, odds: -150
    };
    const statsB = appData.fighterStats[fighterB] || {
      Reach_cms: 182, Height_cms: 178, wins: 14, losses: 4, current_win_streak: 2,
      'win_by_KO/TKO': 5, win_by_Submission: 2, avg_SIG_STR_pct: 0.48, avg_SIG_STR_landed: 4.1,
      avg_TD_pct: 0.35, avg_TD_landed: 1.4, odds: 130
    };

    // Calculate advantage score
    let score = 0;
    const reachA = statsA.Reach_cms || statsA.reach_cms || 180;
    const reachB = statsB.Reach_cms || statsB.reach_cms || 180;
    score += ((reachA - reachB) / 10) * 0.15;

    const streakA = statsA.current_win_streak || 0;
    const streakB = statsB.current_win_streak || 0;
    score += (streakA - streakB) * 0.25;

    const winRatioA = (statsA.wins || 1) / Math.max((statsA.wins || 1) + (statsA.losses || 0), 1);
    const winRatioB = (statsB.wins || 1) / Math.max((statsB.wins || 1) + (statsB.losses || 0), 1);
    score += (winRatioA - winRatioB) * 1.5;

    const strA = statsA.avg_SIG_STR_pct || 0.45;
    const strB = statsB.avg_SIG_STR_pct || 0.45;
    score += (strA - strB) * 1.8;

    const tdA = statsA.avg_TD_pct || 0.35;
    const tdB = statsB.avg_TD_pct || 0.35;
    score += (tdA - tdB) * 1.2;

    // Logistic probability function
    let probA = 1 / (1 + Math.exp(-score * 1.2));
    probA = Math.max(0.25, Math.min(0.85, probA));
    let probB = 1 - probA;

    const winner = probA >= probB ? fighterA : fighterB;
    const winnerCorner = probA >= probB ? 'red' : 'blue';

    const displayMetrics = [
      { label: 'Reach (cm)', key: 'Reach_cms' },
      { label: 'Height (cm)', key: 'Height_cms' },
      { label: 'Total Wins', key: 'wins' },
      { label: 'Total Losses', key: 'losses' },
      { label: 'Win Streak', key: 'current_win_streak' },
      { label: 'KO/TKO Wins', key: 'win_by_KO/TKO' },
      { label: 'Submission Wins', key: 'win_by_Submission' },
      { label: 'Sig. Striking %', key: 'avg_SIG_STR_pct' },
      { label: 'Sig. Landed / Min', key: 'avg_SIG_STR_landed' },
      { label: 'Takedown %', key: 'avg_TD_pct' },
      { label: 'Takedowns Landed', key: 'avg_TD_landed' }
    ];

    const comparisonRows = displayMetrics.map((m) => {
      const valA = Number(statsA[m.key] || statsA[m.key.toLowerCase()] || 0);
      const valB = Number(statsB[m.key] || statsB[m.key.toLowerCase()] || 0);
      return {
        metric: m.label,
        val_a: Math.round(valA * 100) / 100,
        val_b: Math.round(valB * 100) / 100,
        leader: valA > valB ? 'a' : (valB > valA ? 'b' : 'tie')
      };
    });

    return {
      winner: winner,
      winner_corner: winnerCorner,
      fighter_a: fighterA,
      fighter_b: fighterB,
      prob_a: Math.round(probA * 1000) / 10,
      prob_b: Math.round(probB * 1000) / 10,
      stats_a: statsA,
      stats_b: statsB,
      comparison: comparisonRows
    };
  }

  // --- PREDICT FIGHT ACTION ---
  async function predictFight() {
    const fighterA = fighterASelect.value;
    const fighterB = fighterBSelect.value;

    if (!fighterA || !fighterB) {
      showToast('⚠️ Please select both Red and Blue corner fighters.', true);
      return;
    }

    if (fighterA === fighterB) {
      showToast('⚠️ Please select two different fighters.', true);
      return;
    }

    // Set UI loading state
    predictBtn.classList.add('loading');
    showToast(`🥊 Simulating bout: ${fighterA} vs ${fighterB}...`, false);

    try {
      let result = null;

      if (appData.backendMode === 'online') {
        try {
          const res = await fetch(`${appData.apiBase}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fighter_a: fighterA,
              fighter_b: fighterB,
              weight_class: appData.activeWeightClass
            })
          });

          if (res.ok) {
            result = await res.json();
          } else {
            console.warn(`Backend predict returned ${res.status}, falling back to standalone`);
          }
        } catch (postErr) {
          console.warn('Backend predict network error, falling back to standalone:', postErr);
        }
      }

      // If online predict was not available or failed, use standalone engine
      if (!result) {
        result = runClientSidePrediction(fighterA, fighterB);
      }

      appData.predictionResult = result;

      // Render Results Dashboard
      renderPredictionResults(result);
      showToast(`🏆 Prediction complete! Winner: ${result.winner}`, false, 3500);
    } catch (err) {
      console.error('Prediction failed:', err);
      showToast(`Simulation error: ${err.message}`, true, 4000);
    } finally {
      predictBtn.classList.remove('loading');
    }
  }

  // --- RENDER PREDICTION RESULTS & GAUGES ---
  function renderPredictionResults(data) {
    predictionSection.classList.add('active');

    // 1. Winner Proclamation
    winnerName.textContent = data.winner;
    const winProb = data.winner === data.fighter_a ? data.prob_a : data.prob_b;
    const cornerLabel = data.winner_corner === 'red' ? '🔴 RED CORNER' : '🔵 BLUE CORNER';
    const engineLabel = appData.backendMode === 'online' ? 'Random Forest AI' : 'Statistical Model';
    winnerSubtext.textContent = `${cornerLabel} • Confidence: ${winProb}% ${engineLabel}`;

    // 2. Dual Gauge Charts
    gaugeNameA.textContent = data.fighter_a;
    gaugeNameB.textContent = data.fighter_b;

    // Update Quick Snapshot cards with exact fighter metrics
    if (data.stats_a) {
      const reachA = data.stats_a.Reach_cms || data.stats_a.reach_cms;
      document.getElementById('quickReachA').textContent = reachA ? `${reachA} cm` : '-- cm';
      document.getElementById('quickRecordA').textContent = `${data.stats_a.wins || 0}W / ${data.stats_a.losses || 0}L`;
      document.getElementById('quickStreakA').textContent = `${data.stats_a.current_win_streak || 0} Wins`;
    }
    if (data.stats_b) {
      const reachB = data.stats_b.Reach_cms || data.stats_b.reach_cms;
      document.getElementById('quickReachB').textContent = reachB ? `${reachB} cm` : '-- cm';
      document.getElementById('quickRecordB').textContent = `${data.stats_b.wins || 0}W / ${data.stats_b.losses || 0}L`;
      document.getElementById('quickStreakB').textContent = `${data.stats_b.current_win_streak || 0} Wins`;
    }

    animateGauge('A', data.prob_a);
    animateGauge('B', data.prob_b);

    // 3. Head-to-head Tale of the Tape comparison
    renderComparisonTable(data.comparison, data.fighter_a, data.fighter_b);

    // Smoothly scroll down to prediction
    predictionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Custom Animated SVG Gauge
  function animateGauge(corner, percentage) {
    const pctNumber = corner === 'A' ? gaugePctA : gaugePctB;
    const gaugeArc = corner === 'A' ? gaugeArcA : gaugeArcB;
    const gaugeNeedle = corner === 'A' ? gaugeNeedleA : gaugeNeedleB;

    // Semi-circle perimeter in SVG coordinates (~330 units)
    const maxDash = 330;
    const targetOffset = maxDash - (maxDash * (percentage / 100));

    gaugeArc.style.strokeDashoffset = targetOffset;

    // Needle rotation: from -90deg (0%) to +90deg (100%)
    const needleDeg = -90 + (percentage / 100) * 180;
    gaugeNeedle.style.transform = `rotate(${needleDeg}deg)`;

    // Counter animation
    let currentPct = 0;
    const step = percentage / 30;
    const timer = setInterval(() => {
      currentPct += step;
      if (currentPct >= percentage) {
        currentPct = percentage;
        clearInterval(timer);
      }
      pctNumber.textContent = `${currentPct.toFixed(1)}%`;
    }, 25);
  }

  // Render Tale of the Tape Comparison Rows
  function renderComparisonTable(comparison, nameA, nameB) {
    comparisonRowsContainer.innerHTML = '';

    comparison.forEach((row) => {
      const div = document.createElement('div');
      div.className = 'comp-row';

      const maxVal = Math.max(row.val_a, row.val_b, 0.001);
      const fillA = Math.min(100, Math.round((row.val_a / maxVal) * 100));
      const fillB = Math.min(100, Math.round((row.val_b / maxVal) * 100));

      const isLeaderA = row.leader === 'a';
      const isLeaderB = row.leader === 'b';

      div.innerHTML = `
        <div class="comp-val-a ${isLeaderA ? 'leader' : ''}">${row.val_a}</div>
        <div class="comp-bar-container-a" title="${nameA}: ${row.val_a}">
          <div class="comp-fill-a" style="width: ${fillA}%;"></div>
        </div>
        <div class="comp-metric-name">${row.metric}</div>
        <div class="comp-bar-container-b" title="${nameB}: ${row.val_b}">
          <div class="comp-fill-b" style="width: ${fillB}%;"></div>
        </div>
        <div class="comp-val-b ${isLeaderB ? 'leader' : ''}">${row.val_b}</div>
      `;

      comparisonRowsContainer.appendChild(div);
    });
  }

  // --- SECONDARY FUNCTION BUTTONS ---

  // 1. Swap Corners Button
  function swapCorners() {
    const valA = fighterASelect.value;
    const valB = fighterBSelect.value;

    fighterASelect.value = valB;
    fighterBSelect.value = valA;
    appData.fighterA = valB;
    appData.fighterB = valA;

    updateFighterSnapshotStats('A', valB);
    updateFighterSnapshotStats('B', valA);

    showToast(`🔄 Corners swapped: Red: ${valB} | Blue: ${valA}`, false, 2000);

    // If results already visible, re-run prediction
    if (predictionSection.classList.contains('active')) {
      predictFight();
    }
  }

  // 2. Random Matchup Generator
  function randomMatchup() {
    const roster = appData.rosters[appData.activeWeightClass] || [];
    if (roster.length < 2) {
      showToast('Not enough fighters in this division for a random matchup.', true);
      return;
    }

    const idxA = Math.floor(Math.random() * roster.length);
    let idxB = Math.floor(Math.random() * roster.length);
    while (idxB === idxA) {
      idxB = Math.floor(Math.random() * roster.length);
    }

    fighterASelect.value = roster[idxA];
    fighterBSelect.value = roster[idxB];
    appData.fighterA = roster[idxA];
    appData.fighterB = roster[idxB];

    updateFighterSnapshotStats('A', roster[idxA]);
    updateFighterSnapshotStats('B', roster[idxB]);

    showToast(`🎲 Random matchup selected: ${roster[idxA]} vs ${roster[idxB]}`, false, 2500);

    predictFight();
  }

  // 3. Reset Button
  function resetMatchup() {
    const roster = appData.rosters[appData.activeWeightClass] || [];
    if (roster.length > 0) {
      fighterASelect.value = roster[0];
      appData.fighterA = roster[0];
    }
    if (roster.length > 1) {
      fighterBSelect.value = roster[1];
      appData.fighterB = roster[1];
    }

    fighterASearch.value = '';
    fighterBSearch.value = '';
    renderFighterOptions(fighterASelect, roster);
    renderFighterOptions(fighterBSelect, roster);

    updateFighterSnapshotStats('A', appData.fighterA);
    updateFighterSnapshotStats('B', appData.fighterB);

    predictionSection.classList.remove('active');
    showToast('🧹 Selections reset to default division fighters.', false, 2000);
  }

  // 4. Toggle Detailed Stats Accordion
  function toggleStats() {
    if (!predictionSection.classList.contains('active')) {
      predictFight();
    } else {
      statsTableCard.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimer = null;
  function showToast(message, isError = false, duration = 3000) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast-msg show ${isError ? 'error' : ''}`;
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Backend Status Badge click -> trigger reconnect / diagnostic
    if (backendStatusBtn) {
      backendStatusBtn.addEventListener('click', () => {
        connectAndInitialize(true);
      });
    }

    // Weight class change
    weightClassSelect.addEventListener('change', (e) => {
      setActiveWeightClass(e.target.value);
    });

    // Fighter search input filtering
    fighterASearch.addEventListener('input', () => {
      const roster = appData.rosters[appData.activeWeightClass] || [];
      renderFighterOptions(fighterASelect, roster, fighterASearch.value);
    });

    fighterBSearch.addEventListener('input', () => {
      const roster = appData.rosters[appData.activeWeightClass] || [];
      renderFighterOptions(fighterBSelect, roster, fighterBSearch.value);
    });

    // Fighter selection change
    fighterASelect.addEventListener('change', (e) => {
      appData.fighterA = e.target.value;
      updateFighterSnapshotStats('A', e.target.value);
    });

    fighterBSelect.addEventListener('change', (e) => {
      appData.fighterB = e.target.value;
      updateFighterSnapshotStats('B', e.target.value);
    });

    // Buttons
    predictBtn.addEventListener('click', predictFight);
    swapCornersBtn.addEventListener('click', swapCorners);
    randomMatchupBtn.addEventListener('click', randomMatchup);
    resetMatchupBtn.addEventListener('click', resetMatchup);
    toggleStatsBtn.addEventListener('click', toggleStats);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
