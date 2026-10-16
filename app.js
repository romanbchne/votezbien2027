/* ============================================================================
   VOTEZ BIEN ! — app.js
   État + rendu. Toute la logique de calcul vit dans scoring.js (testée
   séparément) : ce fichier ne fait qu'appeler ces fonctions et mettre à
   jour le DOM.
   ========================================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'votezbien:v7:state'; // v7 : nouvelle structure d'état (priorités, départage) — les sauvegardes v6 sont ignorées
  const SCALE_LABELS = ['Beaucoup plus A', 'Plutôt A', 'Entre les deux', 'Plutôt B', 'Beaucoup plus B'];

  const qById = {};
  QUESTIONS.forEach(q => { qById[q.id] = q; });
  DEPARTAGE.forEach(q => { qById[q.id] = q; });

  let state = freshState();
  let lastDimResults = null;
  let lastOverall = null;
  let compareSelection = [];
  let familyFilter = null;
  let lastFocusedEl = null;
  let programPhase = 'main';
  let programPartyFilter = 'all';

  function freshState() {
    return {
      phase: 'main',            // 'main' | 'checkpoint' | 'diagnostic'
      index: 0,
      answers: {},              // question générale -> valeur SÉMANTIQUE (-2..2) ou 'dk'
      flips: Scoring.makeBalancedFlips(QUESTIONS), // id -> true si A/B affichés à l'envers (présentation seulement)
      priorities: [],           // thèmes prioritaires, dans l'ordre (3 max)
      dp: [],                   // ids des questions de départage choisies jusqu'ici, dans l'ordre
      dpAnswers: {},            // id -> position d'option choisie, ou 'dk'
      dpOrders: {},             // id -> ordre d'affichage des options (présentation seulement)
      dpSignature: null,        // empreinte (réponses + priorités) ayant servi à choisir dp
      completed: false
    };
  }

  /* ---------------- Persistance locale (aucun serveur) ---------------- */
  function validState(s) {
    return !!(s && typeof s === 'object' && ['main', 'checkpoint', 'diagnostic'].includes(s.phase) &&
      Number.isInteger(s.index) && s.index >= 0 && typeof s.completed === 'boolean' &&
      s.answers && typeof s.answers === 'object' && s.flips && typeof s.flips === 'object' &&
      Array.isArray(s.priorities) && Array.isArray(s.dp) && s.dpAnswers && typeof s.dpAnswers === 'object' &&
      s.dpOrders && typeof s.dpOrders === 'object');
  }
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible : l'app continue sans reprise */ } }
  function loadState() { try { const raw = localStorage.getItem(STORAGE_KEY); const s = raw ? JSON.parse(raw) : null; return validState(s) ? s : null; } catch (e) { return null; } }
  function clearState() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }
  function hasProgress(s) {
    if (!validState(s) || s.completed) return false;
    const mainIds = new Set(QUESTIONS.map(q => q.id));
    const precisionIds = new Set(DEPARTAGE.map(q => q.id));
    const answeredMain = Object.entries(s.answers).some(([id, value]) =>
      mainIds.has(id) && (value === 'dk' || (Number.isInteger(value) && value >= -2 && value <= 2)));
    const answeredPrecision = Object.entries(s.dpAnswers).some(([id, value]) => {
      if (!precisionIds.has(id)) return false;
      const q = qById[id];
      return value === 'dk' || (Number.isInteger(value) && value >= 0 && value < q.options.length);
    });
    return answeredMain || answeredPrecision;
  }

  /* ---------------- Aides ---------------- */
  function currentQuestion() { return state.phase === 'diagnostic' ? qById[state.dp[state.index]] : QUESTIONS[state.index]; }
  function signature() { return JSON.stringify([state.answers, state.priorities]); }
  function mainDimResults() { return Scoring.computeDimensionResults(state.answers, QUESTIONS); }
  function matchOpts() { return { priorities: state.priorities, departageAnswers: state.dpAnswers, departageBank: DEPARTAGE }; }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  function computeResults() {
    lastDimResults = mainDimResults();
    lastOverall = Scoring.computeOverall(lastDimResults);
    return { dimResults: lastDimResults, overall: lastOverall };
  }

  function positionLabel(dimKey, score) {
    if (score === null || score === undefined) return 'Pas de position codée';
    const dim = DIMENSIONS[dimKey];
    const p = (score + 2) / 4 * 100;
    if (p < 43) return 'Plutôt ' + lower(dim.labelLeft);
    if (p > 57) return 'Plutôt ' + lower(dim.labelRight);
    return 'Position équilibrée entre les deux';
  }

  function pickNextDepartage() {
    return Scoring.selectNextDepartage({ dimResults: mainDimResults(), parties: PARTIES, bank: DEPARTAGE, answers: state.dpAnswers, priorities: state.priorities });
  }

  /* Anneau visuel de correspondance : le pourcentage affiché est TOUJOURS la
     valeur qui sert à classer les partis, et n'est jamais affiché seul —
     toujours à côté d'une explication et d'un accès au détail. */
  function matchRingHTML(percent, size) {
    size = size || 64;
    const stroke = size < 56 ? 5 : 6;
    const r = size / 2 - stroke;
    const c = 2 * Math.PI * r;
    const mid = size / 2;
    if (percent === null || percent === undefined) {
      return `<div class="match-ring match-ring-empty" style="--size:${size}px"><svg viewBox="0 0 ${size} ${size}"><circle class="ring-bg" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}"/></svg><span class="ring-label ring-label-empty">?</span></div>`;
    }
    const offset = (c * (1 - percent / 100)).toFixed(2);
    return `<div class="match-ring" style="--size:${size}px"><svg viewBox="0 0 ${size} ${size}"><circle class="ring-bg" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}"/><circle class="ring-fill" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}" style="stroke-dasharray:${c.toFixed(2)};stroke-dashoffset:${offset}"/></svg><span class="ring-label">${percent}%</span></div>`;
  }

  // Légende explicative sous chaque pourcentage (jamais un chiffre nu).
  function captionFor(m) {
    if (m.partial) return 'Comparaison partielle : les positions de ce parti sont peu codées sur les questions de précision' + (m.themePercent !== null ? ' (sur les 6 thèmes seulement : ' + m.themePercent + ' %)' : '');
    if (m.partyKnownCount < 3) return 'Parti dont seules quelques positions sont codées ici : comparaison trop partielle pour un pourcentage';
    if (m.comparableCount < 3) return 'Pas encore assez de réponses de votre part pour comparer';
    let s = 'Rapprochement sur ' + m.rapprochements + ' des ' + m.comparableCount + ' thèmes';
    if (m.questionComparableCount) s += ' et ' + m.questionCloseCount + ' des ' + m.questionComparableCount + ' questions de précision';
    return s;
  }

  function formatStatusDate(ym) {
    if (!ym) return 'date inconnue';
    const parts = ym.split('-');
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return mois[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  /* ================================================================
     NAVIGATION ENTRE ÉCRANS
     ================================================================ */
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');
    document.querySelectorAll('.navlink[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
    if (name === 'home') refreshResumeBanner();
    if (name === 'quizStart') refreshQuizStart();
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (name === 'results') renderResults();
    if (name === 'programs') renderPrograms();
    if (name === 'parties') renderParties();
    if (name === 'compare') renderCompare();
    if (name === 'method') renderMethod();
    if (name === 'checkpoint') renderCheckpoint();
  }

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      if (target === 'compare' && !state.completed) { showScreen('parties'); return; }
      showScreen(target);
    });
  });

  function setNavEnabled(enabled) {
    document.getElementById('navResults').disabled = false;
    document.getElementById('navParties').disabled = false;
    document.getElementById('navPrograms').disabled = false;
  }

  /* ================================================================
     ACCUEIL
     ================================================================ */
  function refreshResumeBanner() {
    const banner = document.getElementById('resumeBanner');
    const stored = loadState();
    banner.hidden = !hasProgress(stored);
  }

  function refreshQuizStart() {
    const stored = loadState();
    const resume = hasProgress(stored);
    const stateBox = document.getElementById('quizStartState');
    const resumeButton = document.getElementById('btnQuizResume');
    const startButton = document.getElementById('btnQuizStart');
    if (!stateBox || !resumeButton || !startButton) return;
    stateBox.innerHTML = resume
      ? '<strong>Un quiz est resté inachevé.</strong><span>Vous pouvez le reprendre ou recommencer depuis le début.</span>'
      : '<strong>Prêt quand vous l’êtes.</strong><span>Vos résultats apparaîtront dans « Mon profil » à la fin du questionnaire.</span>';
    resumeButton.hidden = !resume;
    startButton.textContent = resume ? 'Recommencer depuis le début' : 'Commencer le quiz 1 →';
  }

  document.getElementById('btnStart').addEventListener('click', () => {
    if (hasProgress(loadState())) { showScreen('quizStart'); return; }
    state = freshState();
    lastDimResults = null; lastOverall = null; compareSelection = [];
    saveState();
    beginQuiz();
  });
  document.getElementById('btnQuizStart').addEventListener('click', () => {
    state = freshState();
    lastDimResults = null; lastOverall = null; compareSelection = [];
    saveState();
    beginQuiz();
  });
  document.getElementById('btnQuizResume').addEventListener('click', () => {
    const stored = loadState();
    if (stored && hasProgress(stored)) { state = stored; beginQuiz(); }
    else refreshQuizStart();
  });
  document.getElementById('btnResume').addEventListener('click', () => {
    const stored = loadState();
    if (stored) { state = stored; beginQuiz(); }
  });
  document.getElementById('btnRestart').addEventListener('click', () => {
    clearState();
    state = freshState();
    refreshResumeBanner();
  });

  function beginQuiz() {
    setNavEnabled(state.completed);
    if (state.phase === 'checkpoint' || (state.phase === 'diagnostic' && !state.dp.length)) { state.phase = 'checkpoint'; showScreen('checkpoint'); return; }
    showScreen('quiz');
    renderQuestion();
  }

  /* ================================================================
     QUESTIONS (générales à échelle, puis de départage à options)
     ================================================================ */
  function renderQuestion() {
    const q = currentQuestion();
    if (!q) return;
    const isDp = state.phase === 'diagnostic';
    const total = QUESTIONS.length + Scoring.MAX_DEPARTAGE;
    const done = isDp ? QUESTIONS.length + state.index : state.index;
    document.getElementById('progressFill').style.width = Math.round((done / total) * 100) + '%';
    document.getElementById('progressLabel').textContent = isDp
      ? 'Précision ' + (state.index + 1) + ' (jusqu’à ' + Scoring.MAX_DEPARTAGE + ')'
      : (state.index + 1) + ' / ' + QUESTIONS.length;
    document.getElementById('quizDurationLabel').textContent = isDp ? 'Environ 4 min' : 'Environ 5 min';
    document.getElementById('phaseChipWrap').innerHTML = isDp
      ? '<span class="phase-chip">Questions de précision : concrètes, sur les points où vos partis les plus proches se distinguent</span>'
      : '';
    document.getElementById('viewScale').hidden = isDp;
    document.getElementById('viewChoice').hidden = !isDp;
    document.getElementById('qWhy').classList.remove('show');

    const plainBox = document.getElementById('plainBox');
    if (q.plain) { document.getElementById('plainText').textContent = q.plain; plainBox.hidden = false; } else plainBox.hidden = true;

    let canAdvance;
    if (isDp) canAdvance = renderChoiceView(q); else canAdvance = renderScaleView(q);

    const nextBtn = document.getElementById('btnNext');
    nextBtn.disabled = !canAdvance;
    let label = 'Suivant';
    if (isDp && canAdvance && state.index === state.dp.length - 1 && !pickNextDepartage()) label = 'Voir mon profil';
    nextBtn.textContent = label;
    document.getElementById('btnBack').disabled = (state.phase === 'main' && state.index === 0);
  }

  // Question générale : A/B éventuellement inversés à l'affichage. La valeur
  // ENREGISTRÉE reste liée au texte choisi (sémantique), jamais à sa place.
  function renderScaleView(q) {
    const flip = !!state.flips[q.id];
    const first = flip ? 'b' : 'a', second = flip ? 'a' : 'b';
    document.getElementById('qTopic').textContent = q.topic;
    document.getElementById('qDim').textContent = DIMENSIONS[q.dim].name;
    document.getElementById('qWhy').textContent = q.why || '';
    document.getElementById('propA').textContent = q[first];
    document.getElementById('propB').textContent = q[second];
    const clA = document.getElementById('clarifyA'), clB = document.getElementById('clarifyB');
    const tA = q['clarify' + first.toUpperCase()], tB = q['clarify' + second.toUpperCase()];
    if (tA) { clA.textContent = tA; clA.hidden = false; } else clA.hidden = true;
    if (tB) { clB.textContent = tB; clB.hidden = false; } else clB.hidden = true;

    const stored = state.answers[q.id];
    const shown = typeof stored === 'number' ? (flip ? -stored : stored) : stored; // valeur telle qu'affichée (A = 1er texte)
    const wrap = document.getElementById('scaleButtons');
    wrap.innerHTML = '';
    SCALE_LABELS.forEach((label, j) => {
      const v = j - 2;
      const b = document.createElement('button');
      const selected = typeof shown === 'number' && shown === v;
      b.type = 'button'; b.className = 'scale-btn' + (selected ? ' sel' : '');
      b.textContent = label;
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      b.addEventListener('click', () => { state.answers[q.id] = (flip ? -v : v) || 0; saveState(); renderQuestion(); });
      wrap.appendChild(b);
    });
    const dk = document.getElementById('dkBtn');
    dk.classList.toggle('sel', stored === 'dk');
    dk.onclick = () => { state.answers[q.id] = 'dk'; saveState(); renderQuestion(); };
    return typeof stored === 'number' || stored === 'dk';
  }

  // Question de départage : options concrètes, ordre d'affichage aléatoire.
  function renderChoiceView(q) {
    document.getElementById('qTopic').textContent = DIMENSIONS[q.dim].name;
    document.getElementById('qDim').textContent = q.q;
    document.getElementById('qWhy').textContent = 'Cette question porte sur un point où des partis proches de vos réponses se distinguent réellement. Ses options sont présentées dans un ordre aléatoire, sans lien avec un parti : choisissez celle qui vous ressemble le plus.';
    const order = state.dpOrders[q.id] || (state.dpOrders[q.id] = Scoring.makeOptionOrder(q.options.length));
    const stored = state.dpAnswers[q.id];
    const list = document.getElementById('choiceList');
    list.innerHTML = '';
    order.forEach(i => {
      const o = q.options[i];
      const b = document.createElement('button');
      const selected = stored === o.pos;
      b.type = 'button'; b.className = 'choice-btn' + (selected ? ' sel' : '');
      b.textContent = o.text;
      b.dataset.pos = String(o.pos);
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      b.addEventListener('click', () => setDpAnswer(q, o.pos));
      list.appendChild(b);
    });
    const dk = document.getElementById('dkBtnChoice');
    dk.classList.toggle('sel', stored === 'dk');
    dk.onclick = () => setDpAnswer(q, 'dk');
    return stored !== undefined;
  }

  // Modifier une réponse déjà donnée invalide les questions choisies APRÈS
  // elle (leur choix dépendait de cette réponse) : elles seront recalculées.
  function setDpAnswer(q, value) {
    if (state.dpAnswers[q.id] !== value && state.index < state.dp.length - 1) {
      state.dp.slice(state.index + 1).forEach(id => { delete state.dpAnswers[id]; delete state.dpOrders[id]; });
      state.dp = state.dp.slice(0, state.index + 1);
    }
    state.dpAnswers[q.id] = value;
    saveState();
    renderQuestion();
  }

  document.getElementById('qWhyToggle').addEventListener('click', () => {
    document.getElementById('qWhy').classList.toggle('show');
  });

  document.getElementById('btnBack').addEventListener('click', () => {
    if (state.index > 0) { state.index--; saveState(); renderQuestion(); return; }
    if (state.phase === 'diagnostic') { state.phase = 'checkpoint'; saveState(); showScreen('checkpoint'); }
  });

  document.getElementById('btnNext').addEventListener('click', () => {
    if (state.phase === 'main') {
      if (state.index < QUESTIONS.length - 1) { state.index++; saveState(); renderQuestion(); return; }
      state.phase = 'checkpoint'; saveState(); showScreen('checkpoint');
      return;
    }
    // phase de départage : question suivante déjà choisie, ou nouvelle sélection
    if (state.index < state.dp.length - 1) { state.index++; saveState(); renderQuestion(); return; }
    const next = pickNextDepartage();
    if (next) { state.dp.push(next.id); state.index++; saveState(); renderQuestion(); return; }
    finishTest();
  });

  function finishTest() {
    state.completed = true;
    saveState();
    setNavEnabled(true);
    computeResults();
    showScreen('results');
  }

  /* ================================================================
     PALIER : aperçu provisoire + choix des 3 priorités
     ================================================================ */
  function renderCheckpoint() {
    const dimResults = mainDimResults();
    const overall = Scoring.computeOverall(dimResults);
    const root = document.getElementById('checkpointContent');
    let html = `<p class="eyebrow-note">Étape 1 sur 2 : terminée</p>
      <h1>Premier aperçu</h1>
      <p class="lede">Voici une lecture encore <strong>provisoire</strong> de votre profil, fondée sur vos ${QUESTIONS.length} premières réponses.</p>`;

    if (overall.determined) {
      html += `<div class="spectrum">
        <p class="confidence-note" style="margin-bottom:.3rem">Tendance provisoire : <strong>${overall.label}</strong></p>
        <div class="spectrum-bar"><div class="spectrum-dot" style="left:${(overall.score + 1) / 2 * 100}%"></div></div>
        <div class="spectrum-labels"><span>Gauche</span><span>Droite</span></div>
      </div>`;
    } else {
      html += `<div class="undetermined-box"><p style="margin-bottom:0">Vos réponses jusqu’ici ne suffisent pas encore à dégager une tendance fiable : les questions concrètes qui suivent peuvent aider à clarifier cela.</p></div>`;
    }

    html += `<div class="prio-box">
      <h2>Vos 3 priorités</h2>
      <p class="lede">Touchez les sujets qui comptent le plus pour votre vote, <strong>dans l’ordre</strong> : le premier touché pèse le plus (3 au maximum). Facultatif : sans choix, tous les thèmes comptent autant.</p>
      <div class="prio-grid" id="prioGrid"></div>
    </div>`;

    // Volontairement AUCUN nom de parti ni pourcentage avant les questions de
    // précision : les afficher permettrait d'orienter ses réponses vers un
    // résultat espéré, ce qui fausserait la mesure qu'on veut affiner.
    let explainer = 'L’application va maintenant vous poser des questions <strong>concrètes</strong> (retraites, nucléaire, OTAN, impôt sur les grandes fortunes…), choisies une à une pour départager les partis qui vous correspondent le plus.';
    if (overall.determined && Scoring.findNearTie(Scoring.computePartyMatches(dimResults, PARTIES, { priorities: state.priorities }))) {
      explainer = 'Pour l’instant, <strong>plusieurs partis se rapprochent de vous à peu près autant</strong>. Les questions suivantes sont concrètes et portent sur les sujets où ces partis diffèrent réellement. Leurs noms restent volontairement cachés jusqu’à la fin, pour ne pas influencer vos réponses.';
    }
    html += `<div class="checkpoint-next">
      <h2>Jusqu’à ${Scoring.MAX_DEPARTAGE} questions pour départager · environ 4 min</h2>
      <p class="lede">${explainer} Le test s’arrête dès qu’un parti ressort nettement.</p>
      <div class="btn-row">
        <button class="btn btn-brass" id="btnContinueDiag">Continuer</button>
        <button class="btn btn-ghost" id="btnBackToMain">Revoir mes réponses précédentes</button>
      </div>
      <button class="btn-link-skip" id="btnSkipDiag" type="button">Voir un résultat préliminaire sans ces questions</button>
    </div>`;
    root.innerHTML = html;
    renderPriorityGrid();

    document.getElementById('btnContinueDiag').addEventListener('click', beginDiagnosticPhase);
    document.getElementById('btnBackToMain').addEventListener('click', () => {
      state.phase = 'main'; state.index = QUESTIONS.length - 1; saveState(); showScreen('quiz'); renderQuestion();
    });
    document.getElementById('btnSkipDiag').addEventListener('click', () => {
      state.dp = []; state.dpAnswers = {}; state.dpOrders = {}; state.dpSignature = null;
      finishTest();
    });
  }

  function renderPriorityGrid() {
    const grid = document.getElementById('prioGrid');
    if (!grid) return;
    grid.innerHTML = DIM_KEYS.map(k => {
      const rank = state.priorities.indexOf(k);
      return `<button class="prio-card${rank >= 0 ? ' sel' : ''}" type="button" data-dim="${k}" aria-pressed="${rank >= 0 ? 'true' : 'false'}">
        ${rank >= 0 ? `<span class="prio-rank" aria-label="Priorité ${rank + 1}">${rank + 1}</span>` : ''}
        <strong>${DIMENSIONS[k].name}</strong>
        <span class="prio-def">${DIMENSIONS[k].plain}</span>
      </button>`;
    }).join('');
    grid.querySelectorAll('.prio-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.dim;
        const i = state.priorities.indexOf(k);
        if (i >= 0) state.priorities.splice(i, 1);
        else if (state.priorities.length >= Scoring.MAX_PRIORITIES) { showToast('3 priorités au maximum : retirez-en une d’abord'); return; }
        else state.priorities.push(k);
        saveState();
        renderPriorityGrid();
        const again = document.querySelector('#prioGrid .prio-card[data-dim="' + k + '"]');
        if (again) again.focus();
      });
    });
  }

  function beginDiagnosticPhase() {
    const sig = signature();
    // Les questions déjà choisies ne sont conservées que si ni vos réponses
    // générales ni vos priorités n'ont changé depuis : sinon leur choix, qui
    // en dépendait, serait périmé.
    if (!state.dp.length || state.dpSignature !== sig) {
      state.dp = []; state.dpAnswers = {}; state.dpOrders = {}; state.dpSignature = sig;
      const first = pickNextDepartage();
      if (!first) { finishTest(); return; }
      state.dp.push(first.id);
    }
    state.phase = 'diagnostic';
    state.index = 0;
    saveState();
    showScreen('quiz');
    renderQuestion();
  }

  /* ================================================================
     RÉSULTATS
     ================================================================ */
  function importanceFor(dimKey) {
    const i = state.priorities.indexOf(dimKey);
    return i >= 0 ? 'C’est l’une de vos priorités (n° ' + (i + 1) + ').' : '';
  }

  // Quasi-égalité : on montre ce qui distingue réellement les deux partis,
  // thème par thème et proposition par proposition, plutôt qu'un gagnant.
  function departagerHTML(pair) {
    const a = pair[0], b = pair[1];
    const rows = [];
    DIM_KEYS.forEach(k => {
      const pa = a.perDim.find(p => p.dim === k), pb = b.perDim.find(p => p.dim === k);
      if (!pa.available || !pb.available) return;
      rows.push({
        title: DIMENSIONS[k].name, dim: k, gap: Math.abs(pa.partyScore - pb.partyScore) / 4,
        dA: pa.distance / 4, dB: pb.distance / 4,
        user: positionLabel(k, pa.userScore), la: positionLabel(k, pa.partyScore), lb: positionLabel(k, pb.partyScore)
      });
    });
    a.perQuestion.forEach(qa => {
      const qb = b.perQuestion.find(x => x.id === qa.id);
      if (!qa.available || !qb || !qb.available) return;
      rows.push({
        title: qa.q.topic, dim: qa.q.dim, gap: Math.abs(qa.partyPos - qb.partyPos) / Scoring.optionRange(qa.q),
        dA: 1 - qa.proximity, dB: 1 - qb.proximity,
        user: Scoring.stanceLabel(qa.q, qa.userPos).label, la: Scoring.stanceLabel(qa.q, qa.partyPos).label, lb: Scoring.stanceLabel(qa.q, qb.partyPos).label
      });
    });
    const distinguishing = rows.filter(r => r.gap >= 0.15).sort((x, y) => y.gap - x.gap).slice(0, 3);

    let html = `<div class="depart-box">
      <h2>Départager vos deux partis les plus proches</h2>
      <p class="lede"><strong>${a.party.name}</strong> (${a.matchPercent} %) et <strong>${b.party.name}</strong> (${b.matchPercent} %) sont à quasi-égalité pour vous : l’écart est plus petit que la marge d’incertitude de ces estimations, il ne suffit donc pas pour trancher. Voici ce qui les distingue réellement.</p>`;
    if (!distinguishing.length) {
      html += `<p class="confidence-note">Sur les sujets abordés ici, ces deux partis ont des positions quasi identiques : seule la lecture de leurs programmes détaillés permet de les distinguer.</p>`;
    } else {
      html += '<div class="depart-list">';
      distinguishing.forEach(r => {
        const equal = Math.abs(r.dA - r.dB) < 0.06;
        const tag = equal ? 'À égale distance de vous' : 'Plus proche de vous : ' + (r.dA < r.dB ? a.party.short : b.party.short);
        const imp = importanceFor(r.dim);
        html += `<div class="depart-item">
          <div class="depart-item-head"><h3>${r.title}</h3><span class="dc-tag ${equal ? 'assez-proche' : 'proche'}">${tag}</span></div>
          <p class="dc-detail">Vous : ${r.user}<br>${a.party.short} : ${r.la}<br>${b.party.short} : ${r.lb}</p>
          ${imp ? `<p class="depart-imp">${imp}</p>` : ''}
        </div>`;
      });
      html += '</div><p class="confidence-note">Si l’un de ces sujets compte particulièrement pour vous, c’est lui qui devrait faire pencher votre choix.</p>';
    }
    html += `<div class="btn-row" style="margin-top:1rem">
        <button class="btn btn-brass btn-sm" id="btnCompareTie" data-a="${a.party.id}" data-b="${b.party.id}">Comparer côte à côte</button>
      </div></div>`;
    return html;
  }

  function renderResults() {
    const root = document.getElementById('resultsContent');
    if (!state.completed) {
      root.innerHTML = `<div class="profile-empty"><span class="profile-empty-icon" aria-hidden="true">✦</span><p class="section-kicker">Mon profil</p><h1>Votre profil reste à découvrir</h1><p class="lede">Vos réponses dessineront vos tendances sur six thèmes et les formations politiques dont les positions s’en rapprochent.</p><div class="profile-empty-steps"><span>21 questions · 5 min</span><span>Jusqu’à 15 précisions · 4 min</span></div><button class="btn btn-brass" id="btnStartFromProfile">Commencer le quiz <span aria-hidden="true">→</span></button></div>`;
      document.getElementById('btnStartFromProfile').addEventListener('click', () => showScreen('quizStart'));
      return;
    }
    if (!lastDimResults) computeResults();
    const dimResults = lastDimResults, overall = lastOverall;
    let html = '';

    if (!overall.determined) {
      html += `<div class="undetermined-box"><h2 style="margin-top:0">Profil non déterminé</h2>
        <p style="margin-bottom:0">Trop peu de réponses exploitables (${overall.totalAnswered} sur ${overall.totalQuestions}, le reste en « je ne sais pas ») pour dégager une orientation fiable. C’est un résultat honnête, pas un bug : plutôt que d’inventer une tendance à partir de réponses absentes, l’application préfère vous le dire clairement.</p></div>`;
    } else {
      html += `<div class="result-headline">
        <p class="eyebrow-note">Votre orientation générale</p>
        <h1 class="label">${overall.label}</h1>
        <p class="confidence-note">Confiance globale dans cette lecture : ${Math.round(overall.overallConfidence * 100)}% · fondée sur ${overall.totalAnswered} réponses exploitables sur ${overall.totalQuestions}.</p>
      </div>`;
      if (overall.composite) {
        html += `<div class="composite-box"><strong>Profil composite.</strong> Vos thèmes ne pointent pas tous dans la même direction (par exemple à gauche sur certains sujets, à droite sur d’autres). L’étiquette ci-dessus résume une moyenne : le détail par thème ci-dessous est plus informatif que ce seul résultat.</div>`;
      }
      html += `<div class="spectrum">
        <div class="spectrum-bar"><div class="spectrum-dot" style="left:${(overall.score + 1) / 2 * 100}%"></div></div>
        <div class="spectrum-labels"><span>Gauche</span><span>Droite</span></div>
      </div>`;
    }

    // ---- Vos meilleures correspondances (partis) ----
    if (overall.determined) {
      const matches = Scoring.computePartyMatches(dimResults, PARTIES, matchOpts());
      const ranked = matches.filter(m => m.matchPercent !== null);
      const top = ranked.slice(0, 3);
      const tiePair = Scoring.findNearTie(matches);
      const nQ = Object.keys(state.dpAnswers).filter(id => typeof state.dpAnswers[id] === 'number').length;
      html += `<div class="best-matches">
        <h2>Vos meilleures correspondances</h2>
        <p class="lede">Calculé à partir de vos ${overall.totalAnswered} réponses générales${nQ ? ' et de vos ' + nQ + ' réponses aux questions de précision' : ''}. Le pourcentage compare votre position à celle de chaque parti, en donnant plus de poids à vos priorités — jamais un point auquel vous n’avez pas répondu. Le détail complet, avec les points communs et les différences, est à un clic.</p>
        <div class="match-grid">`;
      top.forEach((m, i) => {
        html += `<button class="match-card${i === 0 ? ' top' : ''}" style="--card-accent:${m.party.color}" data-party="${m.party.id}">
          ${i === 0 ? '<span class="top-badge">' + (tiePair ? 'En tête, de très peu' : 'Le plus proche de vous') + '</span>' : (i === 1 && tiePair ? '<span class="top-badge">Presque à égalité</span>' : '')}
          ${matchRingHTML(m.matchPercent, i === 0 ? 84 : 64)}
          <div class="match-card-name"><h3>${m.party.name}</h3><span class="party-family">${m.party.family}</span></div>
        </button>`;
      });
      html += `</div><div class="btn-row" style="margin-top:1rem"><button class="btn btn-ghost btn-sm" id="btnSeeAllParties">Voir les ${PARTIES.length} formations et leur détail</button></div></div>`;
      if (tiePair) html += departagerHTML(tiePair);
    }

    html += '<div class="dim-list">';
    DIM_KEYS.forEach(k => {
      const d = dimResults[k];
      const dim = DIMENSIONS[k];
      const hasScore = d.n > 0;
      const p = hasScore ? (d.score + 2) / 4 * 100 : 50;
      const confPct = Math.round(d.confidence * 100);
      const clarityText = d.n === 0 ? 'Aucune réponse exploitable' : d.confidence < 0.35 ? 'Profil encore nuancé' : d.confidence < 0.65 ? 'Profil assez clair' : 'Profil clair';
      html += `<div class="dim-row">
        <div class="dim-row-head"><h3>${dim.name}</h3><span class="dim-pos-label">${hasScore ? positionLabel(k, d.score) : 'Non renseigné'}</span></div>
        <p class="dim-plain">${dim.plain}</p>
        <div class="dim-bar-track"><div class="dim-bar-dot" style="left:${p}%; ${hasScore ? '' : 'opacity:.25'}"></div></div>
        <div class="dim-conf"><span class="conf-track"><span class="conf-fill" style="width:${confPct}%"></span></span> ${clarityText} · ${confPct}%</div>
        ${dim.note ? `<div class="dim-note">${dim.note}</div>` : ''}
      </div>`;
    });
    html += '</div>';

    html += `<div class="priorities-box"><h2>Vos priorités</h2>`;
    if (state.priorities.length) {
      html += `<p class="lede">Les thèmes que vous avez désignés comme les plus importants, dans l’ordre — indépendamment de votre position dessus.</p>
        <div class="chip-list">${state.priorities.map((k, i) => `<span class="chip">${i + 1}. ${DIMENSIONS[k].name}</span>`).join('')}</div>`;
    } else {
      html += `<p class="lede">Vous n’avez pas désigné de priorité : tous les thèmes comptent autant dans la comparaison aux partis.</p>`;
    }
    html += '</div>';

    html += `<div class="share-row">
      <button class="btn btn-brass" id="btnGoParties">Explorer les partis qui s’en rapprochent</button>
      <button class="btn btn-ghost" id="btnGoPrograms">Voir les positions par question</button>
      <button class="btn btn-ghost" id="btnShare">Copier un résumé</button>
      <button class="btn btn-ghost" id="btnRedo">Refaire le test</button>
    </div>`;

    root.innerHTML = html;
    const goParties = document.getElementById('btnGoParties');
    if (goParties) goParties.addEventListener('click', () => showScreen('parties'));
    const goPrograms = document.getElementById('btnGoPrograms');
    if (goPrograms) goPrograms.addEventListener('click', () => showScreen('programs'));
    const seeAll = document.getElementById('btnSeeAllParties');
    if (seeAll) seeAll.addEventListener('click', () => showScreen('parties'));
    root.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => openPartyDrawer(card.dataset.party));
    });
    const cmpTie = document.getElementById('btnCompareTie');
    if (cmpTie) cmpTie.addEventListener('click', () => { compareSelection = [cmpTie.dataset.a, cmpTie.dataset.b]; showScreen('compare'); });
    const shareBtn = document.getElementById('btnShare');
    if (shareBtn) shareBtn.addEventListener('click', shareResults);
    const redoBtn = document.getElementById('btnRedo');
    if (redoBtn) redoBtn.addEventListener('click', () => {
      clearState(); state = freshState(); lastDimResults = null; lastOverall = null; compareSelection = [];
      setNavEnabled(false);
      showScreen('home'); refreshResumeBanner();
    });
  }

  function shareResults() {
    if (!lastOverall) return;
    const lines = ['Mon profil politique — Votez bien !', lastOverall.determined ? ('Orientation générale : ' + lastOverall.label) : 'Profil non déterminé'];
    DIM_KEYS.forEach(k => {
      const d = lastDimResults[k];
      lines.push(DIMENSIONS[k].name + ' : ' + (d.n > 0 ? positionLabel(k, d.score) : 'non renseigné'));
    });
    const text = lines.join('\n');
    if (navigator.share) {
      navigator.share({ title: 'Mon profil politique', text }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('Résumé copié dans le presse-papiers')).catch(() => showToast('Impossible de copier automatiquement'));
    } else {
      showToast('Copie automatique indisponible sur ce navigateur');
    }
  }

  /* ================================================================
     PARTIS
     ================================================================ */
  function renderParties() {
    const hasResults = !!(state.completed && lastDimResults);
    const matches = hasResults ? Scoring.computePartyMatches(lastDimResults, PARTIES, matchOpts()) : null;

    const families = Array.from(new Set(PARTIES.map(p => p.family)));
    const filterWrap = document.getElementById('familyFilters');
    filterWrap.innerHTML = '<button class="filter-chip' + (familyFilter === null ? ' sel' : '') + '" data-fam="">Toutes les familles</button>' +
      families.map(f => `<button class="filter-chip${familyFilter === f ? ' sel' : ''}" data-fam="${f}">${f}</button>`).join('');
    filterWrap.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => { familyFilter = btn.dataset.fam || null; renderParties(); });
    });

    const grid = document.getElementById('partyGrid');
    const directory = hasResults ? matches.map(m => ({ party: m.party, match: m })) : PARTIES.map(party => ({ party, match: null }));
    const list = directory.filter(item => !familyFilter || item.party.family === familyFilter);
    grid.innerHTML = list.map(({ party, match }) => {
      const checked = compareSelection.includes(party.id) ? ' checked' : '';
      const portrait = party.portraitFile
        ? `<img class="party-photo" src="${portraitURL(party.portraitFile)}" alt="Portrait de ${party.personName}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
        : `<div class="party-photo portrait-placeholder" aria-hidden="true">${party.short}</div>`;
      const photoCredit = party.portraitFile
        ? `<span class="portrait-credit"><a href="${portraitPageURL(party.portraitFile)}" target="_blank" rel="noopener">Photo : ${party.portraitCredit}</a> · <a href="${party.portraitLicenseUrl}" target="_blank" rel="noopener">${party.portraitLicense}</a></span>`
        : '';
      const comparison = match
        ? `${matchRingHTML(match.matchPercent, 56)}<span class="match-caption">${captionFor(match)}</span>`
        : '<span class="party-unscored">À comparer après le questionnaire</span>';
      const comparePick = hasResults
        ? `<label class="compare-pick"><input type="checkbox" data-compare="${party.id}"${checked}> Ajouter au comparateur</label>`
        : '';
      return `<article class="party-card">
        <div class="party-main">
          <span class="party-portrait">${portrait}${photoCredit}</span>
          <button class="party-card-text" data-party="${party.id}" aria-label="Ouvrir la fiche ${party.name}">
            <span class="party-family">${party.family}</span>
            <strong class="party-card-title">${party.name}</strong>
            <span class="party-person">${party.personName}<small>${party.personRole}</small></span>
            <span class="party-status">${party.status}</span>
            <span class="party-card-match">${comparison}</span>
            <span class="party-open-hint">Voir la fiche et le programme <span aria-hidden="true">→</span></span>
          </button>
        </div>
        ${comparePick ? `<div class="party-card-actions">${comparePick}</div>` : ''}
      </article>`;
    }).join('') || '<p>Aucun parti dans cette famille.</p>';

    grid.querySelectorAll('.party-card-text').forEach(card => {
      card.addEventListener('click', () => openPartyDrawer(card.dataset.party));
    });
    grid.querySelectorAll('[data-compare]').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.compare;
        if (cb.checked) {
          if (compareSelection.length >= 3) { cb.checked = false; showToast('3 partis maximum pour la comparaison'); return; }
          compareSelection.push(id);
        } else {
          compareSelection = compareSelection.filter(x => x !== id);
        }
      });
    });
    const intro = document.getElementById('partyDirectoryIntro');
    if (intro) intro.textContent = hasResults
      ? 'Voici les formations rapprochées de vos réponses. Le score reste une indication : ouvrez chaque fiche pour voir les points communs, les différences et les sources.'
      : 'Explorez les 16 formations, leur personne de référence et leurs liens officiels. Les personnes en photo ne sont pas toutes candidates investies : leur statut est précisé dans chaque fiche.';
    const startButton = document.getElementById('btnStartFromParties');
    if (startButton) {
      startButton.hidden = hasResults;
      const hasSavedProgress = hasProgress(loadState()) || hasProgress(state);
      startButton.textContent = hasSavedProgress ? 'Reprendre le questionnaire' : 'Faire le questionnaire';
      startButton.onclick = () => {
        if (hasSavedProgress) document.getElementById('btnResume').click();
        else document.getElementById('btnStart').click();
      };
    }
    const compareButton = document.getElementById('btnCompareParties');
    if (compareButton) compareButton.hidden = !hasResults;
  }

  function portraitURL(file) {
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=480';
  }

  function portraitPageURL(file) {
    return 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replace(/ /g, '_'));
  }

  function openPartyDrawer(partyId) {
    const party = PARTIES.find(p => p.id === partyId);
    if (!party) return;
    const hasResults = !!(state.completed && lastDimResults);
    const match = hasResults ? Scoring.computePartyMatch(lastDimResults, party, matchOpts()) : null;
    lastFocusedEl = document.activeElement;

    let intro;
    if (!hasResults) {
      intro = 'Terminez le questionnaire pour voir comment vos réponses se rapprochent des positions de cette formation.';
    } else if (match.matchPercent !== null) {
      intro = 'Correspondance calculée sur ' + match.comparableCount + ' des ' + DIM_KEYS.length + ' thèmes' + (match.questionComparableCount ? ' et ' + match.questionComparableCount + ' questions de précision' : '') + ' (ceux où vous avez répondu et où ce parti a une position codée), en donnant plus de poids à vos priorités.';
    } else {
      intro = captionFor(match) + '.';
    }

    const portrait = party.portraitFile
      ? `<figure class="drawer-portrait"><img src="${portraitURL(party.portraitFile)}" alt="Portrait de ${party.personName}"><figcaption><a href="${portraitPageURL(party.portraitFile)}" target="_blank" rel="noopener">${party.portraitCredit}</a> · <a href="${party.portraitLicenseUrl}" target="_blank" rel="noopener">${party.portraitLicense}</a></figcaption></figure>`
      : '';
    let html = `<div class="drawer-top">
      ${portrait}
      <div><p class="party-family" style="margin:0">${party.family}</p><h2 style="margin-bottom:.2rem">${party.name}</h2><strong>${party.personName}</strong><p class="party-person-role">${party.personRole}</p></div>
      <button class="drawer-close" id="drawerCloseBtn" aria-label="Fermer">✕ Fermer</button></div>
      ${hasResults ? matchRingHTML(match.matchPercent, 60) : ''}
      <p class="confidence-note" style="margin-top:.6rem">${intro}</p>
      <p style="margin-top:1rem">${party.status}${party.statusSource ? ` <a href="${party.statusSource}" target="_blank" rel="noopener">Source du statut</a>` : ''}</p>
      <p class="confidence-note">Le statut de cette personne est actualisé en ${formatStatusDate(party.statusDate)}. Les positions politiques utilisées pour le calcul sont des estimations de la formation, codées à partir de sources publiques disponibles en septembre 2026 ; elles ne sont pas toutes des réponses de la personne citée. Voir la page Méthode.</p>
      <div class="source-row">
        <a class="btn btn-ghost btn-sm" href="${party.site}" target="_blank" rel="noopener">Site officiel</a>
        <a class="btn btn-ghost btn-sm" href="${party.program}" target="_blank" rel="noopener">Programme</a>
      </div>
      ${hasResults ? '<h3 style="margin-top:1.6rem">Thème par thème</h3><div class="dim-compare">' : ''}`;

    if (hasResults) match.perDim.forEach(p => {
      const dim = DIMENSIONS[p.dim];
      const userLabel = p.userScore !== null ? positionLabel(p.dim, p.userScore) : 'Non renseigné par vous';
      html += `<div class="dc-item">
        <div class="dc-head"><span>${dim.name}</span><span class="dc-tag ${p.category.key}">${p.category.label}</span></div>
        <div class="dc-detail">Vous : ${userLabel}<br>${party.short} : ${positionLabel(p.dim, p.partyScore)}</div>
      </div>`;
    });
    if (hasResults) html += '</div>';
    if (hasResults && match.perDim.some(p => !p.available)) {
      html += '<p class="dim-note" style="margin-top:1rem">Les thèmes marqués « non renseigné » ou « non comparable » ne comptent ni comme rapprochement ni comme opposition : soit vous n’y avez pas assez répondu, soit la position de ce parti n’y est pas codée.</p>';
    }

    if (hasResults && match.perQuestion.length) {
      html += `<h3 style="margin-top:1.8rem">Vos réponses aux questions de précision</h3><div class="dim-compare">`;
      match.perQuestion.forEach(p => {
        const you = p.userPos !== null ? Scoring.stanceLabel(p.q, p.userPos).label : 'Vous n’avez pas tranché';
        const them = Scoring.stanceLabel(p.q, p.partyPos);
        const tag = p.available ? `<span class="dc-tag ${p.category.key}">${p.category.label}</span>` : `<span class="dc-tag non-renseigne">${p.reason === 'party-unknown' ? 'Position non codée' : 'Non tranché'}</span>`;
        html += `<div class="dc-item">
          <div class="dc-head"><span>${p.q.topic}</span>${tag}</div>
          <div class="dc-detail">Vous : ${you}<br>${party.short} : ${them.label}</div>
        </div>`;
      });
      html += '</div>';
    }

    const drawer = document.getElementById('partyDrawer');
    drawer.innerHTML = html;
    drawer.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    document.getElementById('drawerBackdrop').classList.add('show');
    document.getElementById('drawerCloseBtn').addEventListener('click', closePartyDrawer);
    document.getElementById('drawerCloseBtn').focus();
  }
  function closePartyDrawer() {
    document.getElementById('partyDrawer').classList.remove('show');
    document.getElementById('partyDrawer').setAttribute('aria-hidden', 'true');
    document.getElementById('drawerBackdrop').classList.remove('show');
    if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
  }
  document.getElementById('drawerBackdrop').addEventListener('click', closePartyDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePartyDrawer(); });

  /* ================================================================
     COMPARER
     ================================================================ */
  function renderCompare() {
    const root = document.getElementById('compareContent');
    if (compareSelection.length === 0) {
      root.innerHTML = '<p class="lede">Aucun parti sélectionné pour l’instant. Depuis l’écran « Les partis », cochez « Ajouter au comparateur » sur les formations qui vous intéressent.</p><div class="btn-row"><button class="btn btn-primary" id="btnGoPartiesFromCompare">Voir les partis</button></div>';
      const b = document.getElementById('btnGoPartiesFromCompare');
      if (b) b.addEventListener('click', () => showScreen('parties'));
      return;
    }
    if (!lastDimResults) computeResults();
    const parties = compareSelection.map(id => PARTIES.find(p => p.id === id)).filter(Boolean);
    let html = '<div class="compare-table-wrap"><table class="compare"><thead><tr><th>Thème</th><th>Vous</th>' +
      parties.map(p => `<th>${p.short}</th>`).join('') + '</tr></thead><tbody>';
    DIM_KEYS.forEach(k => {
      const d = lastDimResults[k];
      html += `<tr><td>${DIMENSIONS[k].name}</td><td>${d.n > 0 ? positionLabel(k, d.score) : 'Non renseigné'}</td>`;
      parties.forEach(p => { html += `<td>${positionLabel(k, p.positions[k])}</td>`; });
      html += '</tr>';
    });
    Object.keys(state.dpAnswers).forEach(id => {
      const q = qById[id];
      const ans = state.dpAnswers[id];
      if (!q || typeof ans !== 'number') return;
      html += `<tr><td>${q.topic}</td><td>${Scoring.stanceLabel(q, ans).label}</td>`;
      parties.forEach(p => { html += `<td>${Scoring.stanceLabel(q, q.stances[p.id]).label}</td>`; });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    html += '<div class="btn-row" style="margin-top:1.2rem"><button class="btn btn-ghost" id="btnClearCompare">Vider la comparaison</button></div>';
    root.innerHTML = html;
    document.getElementById('btnClearCompare').addEventListener('click', () => { compareSelection = []; renderCompare(); });
  }

  /* ================================================================
     PROGRAMMES — lecture des positions utilisées par les deux quiz
     ================================================================ */
  function generalPosition(score) {
    if (typeof score !== 'number') return { label: 'Position non documentée', className: 'unknown' };
    if (score <= -1.25) return { label: 'Plutôt vers A', className: 'toward-a' };
    if (score < -0.35) return { label: 'Tendance vers A', className: 'toward-a' };
    if (score >= 1.25) return { label: 'Plutôt vers B', className: 'toward-b' };
    if (score > 0.35) return { label: 'Tendance vers B', className: 'toward-b' };
    return { label: 'Nuancée entre les deux', className: 'balanced' };
  }

  function programPartyRows(question, isDepartage, parties) {
    return parties.map(party => {
      const position = isDepartage
        ? (Object.prototype.hasOwnProperty.call(question.stances || {}, party.id) ? question.stances[party.id] : undefined)
        : party.positions[question.dim];
      let label, description, className;
      if (isDepartage) {
        const stance = Scoring.stanceLabel(question, position);
        label = stance.known ? stance.label : 'Position non documentée';
        if (stance.exact) {
          const option = question.options.find(o => o.pos === Math.round(position));
          description = option ? option.text : '';
        } else if (stance.known) {
          const low = question.options.find(o => o.pos === Math.floor(position));
          const high = question.options.find(o => o.pos === Math.ceil(position));
          description = low && high ? `${low.text} / ${high.text}` : '';
        } else description = 'Aucune position suffisamment établie dans cette version.';
        className = stance.known ? 'documented' : 'unknown';
      } else {
        const orientation = generalPosition(position);
        label = orientation.label;
        className = orientation.className;
        description = typeof position === 'number'
          ? `Orientation générale du parti sur « ${DIMENSIONS[question.dim].labelLeft} » ↔ « ${DIMENSIONS[question.dim].labelRight} », rapprochée de cette question.`
          : 'Aucune orientation générale n’est codée pour ce thème.';
      }
      return `<article class="program-answer ${className}">
        <div class="program-answer-head"><strong>${party.name}</strong><span>${party.personName} · ${party.personRole}</span></div>
        <span class="program-answer-label">${label}</span>
        <p>${description}</p>
      </article>`;
    }).join('');
  }

  function renderPrograms() {
    const list = document.getElementById('programQuestions');
    const phaseIntro = document.getElementById('programPhaseIntro');
    const filter = document.getElementById('programPartyFilter');
    if (!list || !phaseIntro || !filter) return;
    if (!filter.dataset.ready) {
      filter.innerHTML = '<option value="all">Toutes les formations</option>' + PARTIES.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
      filter.value = programPartyFilter;
      filter.addEventListener('change', () => { programPartyFilter = filter.value; renderPrograms(); });
      document.querySelectorAll('[data-program-phase]').forEach(button => {
        button.addEventListener('click', () => { programPhase = button.dataset.programPhase; renderPrograms(); });
      });
      filter.dataset.ready = '1';
    }
    filter.value = programPartyFilter;
    document.querySelectorAll('[data-program-phase]').forEach(button => {
      const active = button.dataset.programPhase === programPhase;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const selectedParties = programPartyFilter === 'all'
      ? PARTIES
      : PARTIES.filter(p => p.id === programPartyFilter);
    const isDepartage = programPhase === 'departage';
    const questions = isDepartage ? DEPARTAGE : QUESTIONS;
    phaseIntro.textContent = isDepartage
      ? 'La banque contient 25 questions ; le quiz en pose jusqu’à 15 (environ 4 min), choisies selon les formations encore proches. Les positions sont des estimations sur des choix concrets. « Non documentée » signifie qu’aucune position assez précise n’est codée.'
      : 'Chaque repère rapproche le profil thématique d’une formation de la proposition A ou B. Il ne signifie pas que la personne citée a répondu mot pour mot à la question.';

    list.innerHTML = questions.map((question, index) => {
      const title = isDepartage ? question.q : question.topic;
      const body = isDepartage
        ? `<p class="program-question-plain">${question.plain || ''}</p>
          <div class="program-options">${question.options.map((option, i) => `<div><span>${i + 1}</span><p>${option.text}</p></div>`).join('')}</div>
          <p class="program-basis"><strong>Repère documentaire :</strong> ${question.basis || 'Pas de source détaillée enregistrée pour cette question.'}</p>`
        : `<p class="program-question-plain">${question.plain || ''}</p>
          <div class="program-options"><div><span>A</span><p>${question.a}</p></div><div><span>B</span><p>${question.b}</p></div></div>
          <p class="program-basis">La tendance affichée est une estimation du parti à l’échelle du thème « ${DIMENSIONS[question.dim].name} » ; ce n’est pas une réponse officielle à cette formulation.</p>`;
      return `<details class="program-question">
        <summary><span class="program-question-count">${String(index + 1).padStart(2, '0')}</span><span class="program-question-title">${title}</span><span class="program-question-topic">${isDepartage ? question.topic : DIMENSIONS[question.dim].short}</span></summary>
        <div class="program-question-content">${body}<div class="program-answer-list">${programPartyRows(question, isDepartage, selectedParties)}</div></div>
      </details>`;
    }).join('');

    const programSources = document.getElementById('programSources');
    if (programSources && !programSources.dataset.filled) {
      programSources.innerHTML = `<li class="source-subheading">Sources de recoupement</li>${SOURCES.map(source => `<li><a href="${source.url}" target="_blank" rel="noopener">${source.label}</a></li>`).join('')}<li class="source-subheading">Sites et programmes des formations</li>${PARTIES.map(party => `<li><a href="${party.program}" target="_blank" rel="noopener">${party.name} — site ou programme officiel</a></li>`).join('')}`;
      programSources.dataset.filled = '1';
    }
  }

  /* ================================================================
     MÉTHODE
     ================================================================ */
  function renderMethod() {
    const ul = document.getElementById('methodDims');
    if (!ul.dataset.filled) {
      ul.innerHTML = DIM_KEYS.map(k => {
        const d = DIMENSIONS[k];
        return `<li><strong>${d.name}</strong> — de « ${d.labelLeft} » (score négatif) à « ${d.labelRight} » (score positif)</li>`;
      }).join('');
      ul.dataset.filled = '1';
    }
    const src = document.getElementById('methodSources');
    if (src && !src.dataset.filled) {
      src.innerHTML = SOURCES.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a></li>`).join('');
      src.dataset.filled = '1';
    }
  }

  /* ================================================================
     TOAST
     ================================================================ */
  let toastTimer = null;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ================================================================
     INIT
     ================================================================ */
  function init() {
    refreshResumeBanner();
    const stored = loadState();
    if (stored && stored.completed) {
      state = stored;
      setNavEnabled(true);
      computeResults();
    }
    showScreen('home');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => { /* PWA hors-ligne indisponible, l’app reste utilisable */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
