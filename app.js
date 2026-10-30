/* ============================================================================
   VOTEZ BIEN ! — app.js (Édition V7.5 Refondue)
   État + rendu + routage SPA hash + accessibilité renforcée + export Canvas.
   ========================================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'votezbien:v7:state';
  const SCALE_LABELS = ['Beaucoup plus A', 'Plutôt A', 'Entre les deux', 'Plutôt B', 'Beaucoup plus B'];
  const VALID_SCREENS = ['home', 'quizStart', 'quiz', 'checkpoint', 'results', 'themes', 'polls', 'programs', 'parties', 'compare', 'candidatures', 'method', 'donate'];

  const qById = {};
  QUESTIONS.forEach(q => { qById[q.id] = q; });
  DEPARTAGE.forEach(q => { qById[q.id] = q; });

  /* Statut de candidature : entièrement porté par les données (champ
     `candidacyStatus` de chaque formation). Aucune formation n'est
     présentée ici avec un statut écrit à la main dans le code. */
  const CANDIDACY_STATUS = {
    official:    { label: 'Désignée par sa formation',       hint: 'Désignation interne au parti ; la liste officielle du Conseil constitutionnel n’est pas encore publiée.' },
    declared:    { label: 'Déclaration publique',           hint: 'Annonce publique ; cela ne vaut pas validation sur la liste officielle des candidats.' },
    conditional: { label: 'Décision interne à venir',        hint: 'Une décision du parti ou une étape interne doit encore intervenir.' },
    reference:   { label: 'Personnalité de référence',       hint: 'Personnalité associée à la formation ; aucune candidature n’est annoncée à ce jour.' }
  };

  function candidacyBadge(party) {
    const s = CANDIDACY_STATUS[party.candidacyStatus];
    if (!s) return '';
    return '<span class="candidacy-shared-badge" data-status="' + party.candidacyStatus + '" title="' + s.hint + '">' + s.label + '</span>';
  }

  /* Nombre de formations retenues par le moteur de classement : celles dont
     la couverture documentaire dans la banque de précision atteint le seuil
     officiel (Scoring.PARTIAL_COVERAGE). Calculé, jamais écrit en dur. */
  function comparableParties() {
    const threshold = Scoring.PARTIAL_COVERAGE;
    return PARTIES.filter(p => {
      const coded = DEPARTAGE.filter(q => q.stances && typeof q.stances[p.id] === 'number').length;
      return DEPARTAGE.length > 0 && (coded / DEPARTAGE.length) >= threshold;
    });
  }

  function partyCoverage(party) {
    const coded = DEPARTAGE.filter(q => q.stances && typeof q.stances[party.id] === 'number').length;
    const total = DEPARTAGE.length;
    return { coded: coded, total: total, ratio: total ? coded / total : 0, partial: total ? (coded / total) < Scoring.PARTIAL_COVERAGE : true };
  }

  let state = freshState();
  let lastDimResults = null;
  let lastOverall = null;
  let compareSelection = [];
  let familyFilter = null;
  let lastFocusedEl = null;
  let programPhase = 'main';
  let programPartyFilter = 'all';
  let selectedThemeId = (typeof THEMES !== 'undefined' && THEMES.length) ? THEMES[0].id : null;
  let pollView = 'first-round';

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
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ } }
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

  function matchRingHTML(percent, size) {
    size = size || 64;
    const stroke = size < 56 ? 5 : 6;
    const r = size / 2 - stroke;
    const c = 2 * Math.PI * r;
    const mid = size / 2;
    if (percent === null || percent === undefined) {
      return `<div class="match-ring match-ring-empty" style="--size:${size}px" aria-label="Indice non calculé : données insuffisantes"><svg viewBox="0 0 ${size} ${size}"><circle class="ring-bg" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}"/></svg><span class="ring-label ring-label-empty">—</span></div>`;
    }
    const offset = (c * (1 - percent / 100)).toFixed(2);
    return `<div class="match-ring" style="--size:${size}px" aria-label="Indice indicatif de proximité : ${percent} sur 100"><svg viewBox="0 0 ${size} ${size}"><circle class="ring-bg" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}"/><circle class="ring-fill" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}" style="stroke-dasharray:${c.toFixed(2)};stroke-dashoffset:${offset}"/></svg><span class="ring-label">${percent}<small>/100</small></span></div>`;
  }

  function captionFor(m) {
    if (m.partial) {
      const coverage = m.databaseKnownCount + '/' + m.databaseTotalCount + ' positions concrètes codées';
      if (m.questionAnsweredCount >= Scoring.MIN_QUESTIONS_FOR_QUESTION_MODE && m.questionComparableCount < Scoring.MIN_COMPARABLE_QUESTIONS) {
        return 'Pas de score classé : seulement ' + m.questionComparableCount + ' de vos réponses précises sont comparables ; ' + coverage + ' dans la banque.';
      }
      if (m.questionAnsweredCount >= Scoring.MIN_QUESTIONS_FOR_QUESTION_MODE && m.questionCoverage < Scoring.MIN_ANSWERED_COVERAGE) {
        return 'Pas de score classé : données manquantes sur vos réponses précises (' + Math.round(m.questionCoverage * 100) + ' % couvertes) ; ' + coverage + ' dans la banque.';
      }
      return 'Pas de score classé : ' + coverage + ' dans la banque de précision. Les thèmes seuls ne suffisent pas à comparer cette formation.';
    }
    if (m.partyKnownCount < 4) return 'Données insuffisantes : moins de quatre thèmes renseignés pour cette formation.';
    if (m.comparableCount < 4) return 'Pas assez de réponses communes pour établir un indice.';
    let s = 'Indice indicatif ' + m.matchPercent + '/100 · ' + m.rapprochements + ' thèmes proches sur ' + m.comparableCount;
    if (m.questionComparableCount) s += ' · ' + m.questionComparableCount + ' réponses précises comparées';
    return s;
  }

  function formatStatusDate(ym) {
    if (!ym) return 'date inconnue';
    const parts = ym.split('-');
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return mois[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  /* ================================================================
     NAVIGATION SPA (HASH ROUTING et HISTORIQUE)
     ================================================================ */
  function showScreen(name, updateHash) {
    if (updateHash === undefined) updateHash = true;
    if (!VALID_SCREENS.includes(name)) name = 'home';

    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');

    document.querySelectorAll('.navlink[data-nav], .donate-quick[data-nav]').forEach(b => {
      const active = b.dataset.nav === name;
      b.classList.toggle('active', active);
      if (active) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

    if (updateHash) {
      try {
        if (window.location.hash !== '#' + name) {
          window.location.hash = '#' + name;
        }
      } catch (e) {}
    }

    if (name === 'home') refreshResumeBanner();
    if (name === 'quizStart') refreshQuizStart();
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (name === 'results') renderResults();
    if (name === 'themes') renderThemes();
    if (name === 'polls') renderPolls();
    if (name === 'programs') renderPrograms();
    if (name === 'parties') renderParties();
    if (name === 'compare') renderCompare();
    if (name === 'candidatures') renderCandidatures();
    if (name === 'method') renderMethod();
    if (name === 'checkpoint') renderCheckpoint();
  }

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      showScreen(target);
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (VALID_SCREENS.includes(hash)) {
      showScreen(hash, false);
    }
  });

  function setNavEnabled() {
    const res = document.getElementById('navResults');
    if (res) res.disabled = false;
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
    if (state.phase === 'checkpoint' || (state.phase === 'diagnostic' && !state.dp.length)) {
      state.phase = 'checkpoint'; showScreen('checkpoint'); return;
    }
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
    const pctVal = Math.round((done / total) * 100);

    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = pctVal + '%';
    const track = document.getElementById('quizProgressTrack');
    if (track) track.setAttribute('aria-valuenow', String(pctVal));

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
    const shown = typeof stored === 'number' ? (flip ? -stored : stored) : stored;
    const wrap = document.getElementById('scaleButtons');
    wrap.innerHTML = '';
    SCALE_LABELS.forEach((label, j) => {
      const v = j - 2;
      const b = document.createElement('button');
      const selected = typeof shown === 'number' && shown === v;
      b.type = 'button'; b.className = 'scale-btn' + (selected ? ' sel' : '');
      b.textContent = label;
      b.setAttribute('data-shortcut', String(j + 1));
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      b.addEventListener('click', () => { state.answers[q.id] = (flip ? -v : v) || 0; saveState(); renderQuestion(); });
      wrap.appendChild(b);
    });
    const dk = document.getElementById('dkBtn');
    dk.classList.toggle('sel', stored === 'dk');
    dk.onclick = () => { state.answers[q.id] = 'dk'; saveState(); renderQuestion(); };
    return typeof stored === 'number' || stored === 'dk';
  }

  function renderChoiceView(q) {
    document.getElementById('qTopic').textContent = DIMENSIONS[q.dim].name;
    document.getElementById('qDim').textContent = q.q;
    document.getElementById('qWhy').textContent = 'Cette question porte sur un point où des partis proches de vos réponses se distinguent réellement. Ses options sont présentées dans un ordre aléatoire : choisissez celle qui vous ressemble le plus.';
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
    const whyEl = document.getElementById('qWhy');
    const expanded = whyEl.classList.toggle('show');
    document.getElementById('qWhyToggle').setAttribute('aria-expanded', expanded ? 'true' : 'false');
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
      <h1 id="checkpointHeading">Premier aperçu</h1>
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
      <p class="lede">Touchez les sujets qui comptent le plus pour votre vote, <strong>dans l’ordre</strong> : le premier pèse le plus (×2,0 / ×1,6 / ×1,3). Facultatif : sans choix, tous les thèmes comptent autant.</p>
      <div class="prio-grid" id="prioGrid"></div>
    </div>`;

    let explainer = 'L’application va maintenant vous poser des questions <strong>concrètes</strong> (retraites, nucléaire, santé, logement, pouvoir d’achat, OTAN…), choisies une à une pour départager les partis qui vous correspondent le plus.';
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
      <p class="lede"><strong>${a.party.name}</strong> (indice ${a.matchPercent}/100) et <strong>${b.party.name}</strong> (indice ${b.matchPercent}/100) sont presque à égalité. Cet indice éditorial n’est ni une probabilité ni une prédiction de vote : l’écart est inférieur à la marge d’incertitude de ces estimations et ne permet pas de trancher. Voici les différences visibles dans les réponses comparables.</p>`;
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
      root.innerHTML = `<div class="profile-empty"><span class="profile-empty-icon" aria-hidden="true">✦</span><p class="section-kicker">Mon profil</p><h1 id="resultsHeading">Commencez le test pour découvrir votre profil</h1><p class="lede">Répondez au questionnaire pour découvrir vos tendances sur six thèmes et voir quelles formations politiques se rapprochent de vos idées.</p><div class="profile-empty-steps"><span>${QUESTIONS.length} questions · ~5 min</span><span>Questions de précision ciblées</span></div><button class="btn btn-brass" id="btnStartFromProfile">Commencer le test <span aria-hidden="true">→</span></button></div>`;
      document.getElementById('btnStartFromProfile').addEventListener('click', () => showScreen('quizStart'));
      return;
    }
    if (!lastDimResults) computeResults();
    const dimResults = lastDimResults, overall = lastOverall;
    let html = '';

    if (!overall.determined) {
      html += `<div class="undetermined-box"><h2 id="resultsHeading" style="margin-top:0">Profil non déterminé</h2>
        <p style="margin-bottom:0">Trop peu de réponses exploitables (${overall.totalAnswered} sur ${overall.totalQuestions}, le reste en « je ne sais pas ») pour dégager une orientation fiable. C’est un résultat honnête, pas un bug : plutôt que d’inventer une tendance à partir de réponses absentes, l’application préfère vous le dire clairement.</p></div>`;
    } else {
      html += `<div class="result-headline">
        <p class="eyebrow-note">Votre orientation générale</p>
        <h1 class="label" id="resultsHeading">${overall.label}</h1>
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
        <h2>Les formations les plus proches de vos réponses</h2>
        <p class="lede">Indice éditorial sur 100, calculé à partir de vos ${overall.totalAnswered} réponses générales${nQ ? ' et de vos ' + nQ + ' réponses aux questions de précision' : ''}. Ce n’est ni une probabilité, ni une intention de vote, ni une mesure de soutien. Un score est affiché si au moins ${Math.round(Scoring.PARTIAL_COVERAGE * 100)} % des positions du parti sont documentées, avec au moins ${Scoring.MIN_COMPARABLE_QUESTIONS} réponses précises communes; après trois réponses, au moins ${Math.round(Scoring.MIN_ANSWERED_COVERAGE * 100)} % des vôtres doivent être couvertes.</p>
        <div class="match-grid">`;
      top.forEach((m, i) => {
        html += `<button class="match-card${i === 0 ? ' top' : ''}" style="--card-accent:${m.party.color}" data-party="${m.party.id}">
          ${i === 0 ? '<span class="top-badge">' + (tiePair ? 'En tête, de très peu' : 'Le plus proche de vous') + '</span>' : (i === 1 && tiePair ? '<span class="top-badge">Presque à égalité</span>' : '')}
          ${matchRingHTML(m.matchPercent, i === 0 ? 84 : 64)}
          <div class="match-card-name">
            <h3>${m.party.name}</h3>
            <span class="party-family">${m.party.family}</span>
            ${candidacyBadge(m.party)}
          </div>
        </button>`;
      });
      html += `</div>`;
      if (!ranked.length) html += '<p class="confidence-note">Aucune formation ne dispose ici d’assez de positions comparables pour un classement fiable.</p>';
      const allSorted = ranked.map(function(m) {
        return '<li><span>' + m.party.personName + ' · ' + m.party.short + '</span><strong>' + Math.round(m.matchPercent) + ' / 100</strong></li>';
      }).join('');
      html += '<details class="all-ranked-candidates"><summary>Afficher le classement complet des ' + ranked.length + ' formations comparables</summary><ol>' + allSorted + '</ol></details>';
      const notRanked = CANDIDATURES.filter(function(c) { return !c.partyId || !ranked.some(function(m) { return m.party.id === c.partyId; }); });
      html += '<p class="confidence-note candidate-result-limit">Le quiz classe les formations dont les positions publiques sont assez documentées ; il ne donne pas un score personnel aux prétendants sans base vérifiable. La liste officielle des candidats n’est attendue qu’au plus tard le 26 mars 2027.</p>';
      if (notRanked.length) {
        html += '<details class="unranked-candidates"><summary>Personnalités suivies mais non classées (' + notRanked.length + ')</summary><ul>' + notRanked.map(function(c) { return '<li><strong>' + c.name + '</strong> — ' + (c.scopeReason || c.declarationNote || 'aucune position suffisamment documentée') + '</li>'; }).join('') + '</ul></details>';
      }
      const partialCount = matches.filter(m => m.partial).length;
      if (partialCount) html += `<p class="confidence-note">${partialCount} formations ne sont pas classées, car leur couverture documentaire est trop faible ou trop incomplète sur vos réponses.</p>`;
      html += `<div class="btn-row" style="margin-top:1rem"><button class="btn btn-ghost btn-sm" id="btnSeeAllParties">Voir les ${PARTIES.length} formations et leur détail</button></div></div>`;
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
      <button class="btn btn-brass" id="btnExportBadge">Télécharger ma boussole en image 🎨</button>
      <button class="btn btn-ghost" id="btnGoThemes">Explorer les thèmes 2027</button>
      <button class="btn btn-ghost" id="btnGoPolls">Consulter les sondages</button>
      <button class="btn btn-ghost" id="btnGoParties">Explorer les partis</button>
      <button class="btn btn-ghost" id="btnGoPrograms">Voir les positions par question</button>
      <button class="btn btn-ghost" id="btnShare">Copier un résumé</button>
      <button class="btn btn-ghost" id="btnRedo">Refaire le test</button>
    </div>`;

    root.innerHTML = html;
    const exportBtn = document.getElementById('btnExportBadge');
    if (exportBtn) exportBtn.addEventListener('click', openExportModal);
    const goThemes = document.getElementById('btnGoThemes');
    if (goThemes) goThemes.addEventListener('click', () => showScreen('themes'));
    const goPolls = document.getElementById('btnGoPolls');
    if (goPolls) goPolls.addEventListener('click', () => showScreen('polls'));
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
    const lines = ['Mon profil politique — Votez bien ! (Présidentielle 2027)', lastOverall.determined ? ('Orientation générale : ' + lastOverall.label) : 'Profil non déterminé'];
    DIM_KEYS.forEach(k => {
      const d = lastDimResults[k];
      lines.push(DIMENSIONS[k].name + ' : ' + (d.n > 0 ? positionLabel(k, d.score) : 'non renseigné'));
    });
    const text = lines.join('\n');
    if (navigator.share) {
      navigator.share({ title: 'Mon profil politique 2027', text }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('Résumé copié dans le presse-papiers')).catch(() => showToast('Impossible de copier automatiquement'));
    } else {
      showToast('Copie automatique indisponible sur ce navigateur');
    }
  }

  /* ================================================================
     EXPORT DE LA BOUSSOLE ÉLECTORALE EN IMAGE (CANVAS)
     ================================================================ */
  function openExportModal() {
    const modal = document.getElementById('exportModalBackdrop');
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    const canvas = document.getElementById('profileCanvas');
    if (canvas && lastOverall && lastDimResults) {
      drawProfileBadge(canvas, lastOverall, lastDimResults);
    }

    const closeBtn = document.getElementById('btnExportModalClose');
    if (closeBtn) closeBtn.onclick = closeExportModal;

    const downloadBtn = document.getElementById('btnDownloadCard');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        try {
          const a = document.createElement('a');
          a.download = 'boussole-electorale-2027.png';
          a.href = canvas.toDataURL('image/png');
          a.click();
          showToast('Image téléchargée avec succès !');
        } catch (e) {
          showToast('Téléchargement non supporté');
        }
      };
    }

    const copyBtn = document.getElementById('btnCopyCardText');
    if (copyBtn) copyBtn.onclick = shareResults;
  }

  function closeExportModal() {
    const modal = document.getElementById('exportModalBackdrop');
    if (modal) modal.hidden = true;
    document.body.style.overflow = '';
  }

  function drawProfileBadge(canvas, overall, dimResults) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // Fond dégradé élégant tricolore
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#11223F');
    bgGrad.addColorStop(1, '#0B1528');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Ruban républicain en haut
    const ribbonH = 8;
    ctx.fillStyle = '#244B83'; ctx.fillRect(0, 0, w / 3, ribbonH);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(w / 3, 0, w / 3, ribbonH);
    ctx.fillStyle = '#C93948'; ctx.fillRect((2 * w) / 3, 0, w / 3, ribbonH);

    // Titre
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Votez bien ! · Présidentielle 2027', w / 2, 54);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Boussole électorale citoyenne indépendante', w / 2, 78);

    // Carte blanche centrale pour le résultat
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(35, 105, w - 70, 115, 16);
    ctx.fill();

    ctx.fillStyle = '#C93948';
    ctx.font = '800 12px "Inter", sans-serif';
    ctx.fillText('ORIENTATION GÉNÉRALE', w / 2, 132);

    ctx.fillStyle = '#14213D';
    ctx.font = 'bold 30px "Fraunces", Georgia, serif';
    ctx.fillText(overall.label || 'Profil analysé', w / 2, 172);

    ctx.fillStyle = '#64748B';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText(`Indice de clarté : ${Math.round((overall.overallConfidence || 0.8) * 100)} %`, w / 2, 198);

    // 6 Thèmes majeurs
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px "Fraunces", Georgia, serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText('Profil par thèmes majeurs :', 40, 255);

    let y = 285;
    DIM_KEYS.forEach(k => {
      const d = dimResults[k];
      const dim = DIMENSIONS[k];
      const score = (d && d.n > 0) ? d.score : 0;
      const pct = (score + 2) / 4;

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '600 13px "Inter", sans-serif';
      ctx.fillText(dim.name, 40, y);

      // Barre de fond
      ctx.fillStyle = '#1E2D48';
      ctx.beginPath();
      ctx.roundRect(40, y + 8, w - 80, 8, 4);
      ctx.fill();

      // Curseur point
      const dotX = 40 + pct * (w - 80);
      ctx.fillStyle = '#C93948';
      ctx.beginPath();
      ctx.arc(dotX, y + 12, 7, 0, Math.PI * 2);
      ctx.fill();

      y += 48;
    });

    // Top partis
    const matches = Scoring.computePartyMatches(dimResults, PARTIES, matchOpts());
    const top = matches.filter(m => m.matchPercent !== null).slice(0, 3);

    y += 15;
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 15px "Fraunces", Georgia, serif';
    ctx.fillText('Formations les plus proches :', 40, y);

    y += 24;
    top.forEach((m, idx) => {
      ctx.fillStyle = '#162544';
      ctx.beginPath();
      ctx.roundRect(40, y, w - 80, 38, 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText(`${idx + 1}. ${m.party.name}`, 55, y + 24);

      ctx.fillStyle = '#FF919A';
      ctx.font = 'bold 16px "Fraunces", Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${m.matchPercent} %`, w - 55, y + 25);
      ctx.textAlign = 'left';

      y += 46;
    });

    // Bas de carte
    ctx.fillStyle = '#64748B';
    ctx.font = '12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Faites le quiz gratuit et anonyme sur www.votezbien2027.fr', w / 2, h - 22);
  }

  /* ================================================================
     NOUVEL ONGLET : THÈMES
     ================================================================ */
  function renderThemes() {
    const pillsWrap = document.getElementById('themePills');
    const detailWrap = document.getElementById('themeDetailCard');
    if (!pillsWrap || !detailWrap || typeof THEMES === 'undefined') return;
    if (!selectedThemeId && THEMES.length) selectedThemeId = THEMES[0].id;
    pillsWrap.innerHTML = THEMES.map(function(theme) {
      const active = theme.id === selectedThemeId;
      return '<button class="theme-pill' + (active ? ' active' : '') + '" type="button" role="tab" data-theme="' + theme.id + '" aria-selected="' + (active ? 'true' : 'false') + '">' +
        '<span aria-hidden="true">' + theme.icon + '</span> ' + theme.name + '</button>';
    }).join('');
    pillsWrap.querySelectorAll('.theme-pill').forEach(function(button) {
      button.addEventListener('click', function() {
        selectedThemeId = button.dataset.theme;
        renderThemes();
      });
    });
    const theme = THEMES.find(function(item) { return item.id === selectedThemeId; }) || THEMES[0];
    if (!theme) return;
    const dimension = DIMENSIONS[theme.id];
    const generalQuestions = QUESTIONS.filter(function(question) { return question.dim === theme.id; });
    const detailQuestions = DEPARTAGE.filter(function(question) { return question.dim === theme.id; });
    let html = '<article class="theme-briefing-box"><h2><span aria-hidden="true">' + theme.icon + '</span> ' + theme.name + '</h2>' +
      '<p class="lede">' + dimension.plain + '</p>' +
      '<p class="confidence-note">Ce repère résume les orientations éditoriales codées dans le quiz. Il ne vaut pas déclaration personnelle des personnes présentées. Une position sans base suffisante reste non documentée dans les réponses détaillées.</p></article>';
    html += '<section class="theme-position-section" aria-labelledby="themePositionsTitle"><div class="theme-position-section-head"><div><h3 id="themePositionsTitle">Orientations comparées</h3><p>Repères sur une échelle, d’après les positions générales codées des formations.</p></div><span>' + PARTIES.length + ' formations</span></div><div class="theme-position-grid">';
    PARTIES.forEach(function(party) {
      const score = party.positions ? party.positions[theme.id] : null;
      const known = typeof score === 'number';
      const marker = known ? Math.max(0, Math.min(100, ((score + 2) / 4) * 100)) : 50;
      const coverage = partyCoverage(party);
      html += '<article class="theme-position-card" style="--theme-party-color:' + party.color + '">' +
        '<div class="theme-position-card-head"><span class="party-family">' + party.short + '</span><strong>' + party.personName + '</strong></div>' +
        '<p>' + (known ? positionLabel(theme.id, score) : 'Position non documentée') + '</p>' +
        '<div class="theme-position-track' + (known ? '' : ' is-unknown') + '" aria-hidden="true"><span style="left:' + marker + '%"></span></div>' +
        '<div class="theme-position-labels"><span>' + dimension.labelLeft + '</span><span>' + dimension.labelRight + '</span></div>' +
        '<small>' + coverage.coded + ' positions détaillées documentées sur ' + coverage.total + ' questions dans la banque du quiz.</small>' +
        '<a href="' + (party.program || party.site) + '" target="_blank" rel="noopener">Source officielle de ' + party.short + ' ↗</a></article>';
    });
    html += '</div></section>';
    html += '<section class="theme-question-links"><div><h3>Explorer les questions de ce thème</h3><p>' +
      generalQuestions.length + ' questions générales et ' + detailQuestions.length + ' questions de précision dans la banque. Le quiz détaillé en sélectionne jusqu’à ' + Scoring.MAX_DEPARTAGE + ' selon vos réponses.</p></div>' +
      '<button class="btn btn-ghost" id="themeOpenPrograms">Voir les réponses et leurs sources →</button></section>';
    if (dimension.note) html += '<p class="confidence-note">' + dimension.note + '</p>';
    detailWrap.innerHTML = html;
    document.getElementById('themeOpenPrograms').addEventListener('click', function() { showScreen('programs'); });
  }

  /* ================================================================
     NOUVEL ONGLET : SONDAGES
     ================================================================ */
  function trendLabel(item) {
    if (item.trend === null || item.trend === undefined) return 'première mesure';
    const t = item.trend;
    const arrow = t > 0 ? '▲' : '▼';
    return arrow + ' ' + Math.abs(t).toFixed(1) + ' pt' + (Math.abs(t) > 1 ? 's' : '') + ' par rapport à la mesure précédente';
  }


  function pollTrendChartHTML(dataset, id) {
    if (!dataset || !dataset.series || !dataset.series.length) return '';
    const width = 760, height = 310, left = 54, right = 20, top = 20, bottom = 52;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;
    const xAt = function(i) { return left + (dataset.periods.length < 2 ? plotWidth / 2 : plotWidth * i / (dataset.periods.length - 1)); };
    const yAt = function(value) { return top + plotHeight * (dataset.max - value) / (dataset.max - dataset.min); };
    let svg = '<svg class="poll-trend-svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-labelledby="' + id + '-title ' + id + '-desc">';
    svg += '<title id="' + id + '-title">' + dataset.title + '</title><desc id="' + id + '-desc">' + dataset.note + '</desc>';
    dataset.ticks.forEach(function(tick) {
      const y = yAt(tick);
      svg += '<line x1="' + left + '" y1="' + y + '" x2="' + (width - right) + '" y2="' + y + '" class="poll-grid-line"></line>';
      svg += '<text x="' + (left - 10) + '" y="' + (y + 4) + '" text-anchor="end" class="poll-axis-label">' + tick + ' %</text>';
    });
    dataset.periods.forEach(function(period, i) {
      const x = xAt(i);
      svg += '<line x1="' + x + '" y1="' + top + '" x2="' + x + '" y2="' + (top + plotHeight) + '" class="poll-grid-line poll-grid-vertical"></line>';
      svg += '<text x="' + x + '" y="' + (height - 20) + '" text-anchor="middle" class="poll-axis-label">' + (dataset.periodsShort ? dataset.periodsShort[i] : period) + '</text>';
    });
    dataset.series.forEach(function(series) {
      const points = series.values.map(function(value, i) { return xAt(i) + ',' + yAt(value); }).join(' ');
      svg += '<polyline points="' + points + '" fill="none" stroke="' + series.color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>';
      series.values.forEach(function(value, i) {
        svg += '<circle cx="' + xAt(i) + '" cy="' + yAt(value) + '" r="5" fill="' + series.color + '" stroke="#fff" stroke-width="2"><title>' + series.name + ', ' + dataset.periods[i] + ' : ' + value + ' %</title></circle>';
      });
    });
    svg += '</svg>';
    let legend = '<ul class="poll-trend-legend">';
    dataset.series.forEach(function(series) {
      const latest = series.values[series.values.length - 1];
      legend += '<li><span class="poll-legend-dot" style="background:' + series.color + '"></span><span>' + series.name + '</span><strong>' + Number(latest).toLocaleString('fr-FR') + ' %</strong></li>';
    });
    legend += '</ul>';
    let table = '<div class="poll-trend-table-scroll"><table class="poll-trend-table"><caption>Valeurs de chaque vague, en pourcentage</caption><thead><tr><th scope="col">Personnalité</th>';
    dataset.periods.forEach(function(period) { table += '<th scope="col">' + period + '</th>'; });
    table += '</tr></thead><tbody>';
    dataset.series.forEach(function(series) {
      table += '<tr><th scope="row"><span class="poll-legend-dot" style="background:' + series.color + '"></span> ' + series.name + '</th>';
      series.values.forEach(function(value) { table += '<td>' + Number(value).toLocaleString('fr-FR') + ' %</td>'; });
      table += '</tr>';
    });
    table += '</tbody></table></div>';
    return '<section class="poll-trend-card" aria-labelledby="' + id + '-heading"><h3 id="' + id + '-heading">' + dataset.title + '</h3><p class="confidence-note">' + dataset.note + ' <a href="' + dataset.source + '" target="_blank" rel="noopener">Lire la notice officielle</a></p><div class="poll-trend-scroll">' + svg + '</div>' + legend + table + '<p class="confidence-note poll-trend-source">Valeurs et méthodologie : <a href="' + dataset.source + '" target="_blank" rel="noopener">notice de l’enquête</a></p></section>';
  }

  function renderPolls() {
    const root = document.getElementById('pollsContent');
    if (!root || typeof POLLS === 'undefined') return;
    document.querySelectorAll('[data-poll-view]').forEach(function(btn) {
      btn.classList.toggle('sel', btn.dataset.pollView === pollView);
    });
    let html = '';
    if (pollView === 'first-round') {
      html += '<div class="poll-aggregate-box"><div class="poll-average-header"><div><h2>Moyenne des trois enquêtes à liste commune</h2><p class="confidence-note">Actualisée au ' + POLLS.updatedAt + ' · ' + POLLS.aggregationNote + ' <a href="' + POLLS.sourceUrl + '" target="_blank" rel="noopener">Consulter les notices à la Commission des sondages</a></p></div><span class="quiz-duration">Moyenne descriptive</span></div><div class="poll-bars-list">';
      POLLS.averageFirstRound.forEach(function(item) {
        html += '<div class="poll-bar-item"><div class="poll-candidate-info"><strong>' + item.candidate + '</strong><span>' + (item.partyShort === '—' ? '' : item.partyShort + ' · ') + item.family + ' · moyenne de ' + item.waves + ' instituts</span></div><div class="poll-bar-track" aria-hidden="true"><div class="poll-bar-fill" style="width:' + item.score + '%; background:' + (item.color || '#244B83') + '"></div></div><div class="poll-score-val" style="color:' + (item.color || 'var(--ink)') + '">' + Number(item.score).toLocaleString('fr-FR') + ' %</div></div>';
      });
      html += '</div><p class="confidence-note poll-scope-note">' + POLLS.aggregationScopeNote + '</p></div>';
      html += pollTrendChartHTML(POLLS.trendSeries, 'poll-first-trend');
    } else if (pollView === 'second-round') {
      html += '<div class="poll-aggregate-box"><h2>Duels de second tour mesurés</h2><p class="confidence-note">Moyenne simple des deux mesures les plus récentes quand un même duel a été testé par OpinionWay et Toluna Harris Interactive, les 22 et 23 octobre. Les détails conservent le score de chaque institut et sa notice ; les duels non mesurés ne sont pas extrapolés.</p><div class="duels-grid">';
      POLLS.secondRoundDuels.forEach(function(d) {
        const gap = Math.abs(d.candidateA.score - d.candidateB.score);
        html += '<article class="duel-card"><h3>' + d.duel + '</h3><div class="duel-spread">Moyenne de ' + d.waves + ' enquêtes · écart de ' + gap.toLocaleString('fr-FR') + ' points</div><div class="duel-bars-wrap" style="--color-a:' + d.candidateA.color + '; --color-b:' + d.candidateB.color + '"><div class="duel-bar-a" style="width:' + d.candidateA.score + '%"></div><div class="duel-bar-b" style="width:' + d.candidateB.score + '%"></div></div><div class="duel-labels"><span style="color:' + d.candidateA.color + '">' + d.candidateA.name + ' : ' + Number(d.candidateA.score).toLocaleString('fr-FR') + ' %</span><span style="color:' + d.candidateB.color + '">' + d.candidateB.name + ' : ' + Number(d.candidateB.score).toLocaleString('fr-FR') + ' %</span></div>';
        if (d.detail && d.detail.length) {
          html += '<details class="duel-detail"><summary>Comparer les deux mesures</summary><ul>';
          d.detail.forEach(function(x) { html += '<li><span>' + x.institute + '</span><span>' + x.date + '</span><strong>' + x.a + ' – ' + x.b + '</strong><a href="' + x.notice + '" target="_blank" rel="noopener">notice</a></li>'; });
          html += '</ul></details>';
        }
        html += '</article>';
      });
      html += '</div></div>';
      html += pollTrendChartHTML(POLLS.secondRoundTrend, 'poll-second-trend');
    } else {
      html += '<div class="poll-aggregate-box"><h2>Les quatre enquêtes récentes détaillées</h2><p class="confidence-note">Les résultats ci-dessous reprennent les colonnes publiées dans les notices officielles. Une hypothèse de premier tour est une liste testée par l’institut, pas une liste de candidatures validées.</p><div class="poll-wave-list">';
      POLLS.waves.forEach(function(w) {
        html += '<article class="poll-wave-card"><div class="poll-wave-head"><div><h3>' + w.institute + (w.sponsor ? ' pour ' + w.sponsor : '') + '</h3><p class="confidence-note">Publié le ' + w.publishedAt + ' · terrain du ' + w.terrain + '</p><p class="confidence-note">' + w.sampleLabel + '</p>' + (w.sampleNote ? '<p class="confidence-note">' + w.sampleNote + '</p>' : '') + '</div><span class="tc-party-badge">' + w.scenario + '</span></div><div class="poll-wave-results">';
        w.results.forEach(function(r) {
          html += '<div class="poll-wave-result"><span>' + r.candidate + (r.partyShort ? ' <small>(' + r.partyShort + ')</small>' : '') + '</span><strong>' + Number(r.score).toLocaleString('fr-FR') + ' %</strong></div>';
        });
        html += '</div><p class="confidence-note poll-wave-source">Les chiffres dépendent de l’hypothèse et comportent une marge d’incertitude. <a href="' + w.notice + '" target="_blank" rel="noopener">Lire la notice officielle</a></p></article>';
      });
      html += '</div></div>';
    }
    root.innerHTML = html;
  }

  document.querySelectorAll('[data-poll-view]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      pollView = btn.dataset.pollView;
      renderPolls();
    });
  });

  /* ================================================================
     CANDIDATURES et CALENDRIER DE CAMPAGNE
     Données réelles : les candidatures déclarées et les jalons vérifiés.
     ================================================================ */
  function latestPollForCandidate(name) {
    const waves = (typeof POLLS !== 'undefined' && POLLS.waves) ? POLLS.waves : [];
    const matches = waves.filter(function(w) { return (w.results || []).some(function(r) { return r.candidate === name; }); });
    matches.sort(function(a, b) { return String(b.publishedISO || '').localeCompare(String(a.publishedISO || '')); });
    if (!matches.length) return null;
    const wave = matches[0], result = wave.results.find(function(r) { return r.candidate === name; });
    return {wave:wave,result:result};
  }

  function renderCandidatures() {
    const root = document.getElementById('candidaturesContent');
    if (!root || typeof CANDIDATURES === 'undefined') return;

    const inScope = CANDIDATURES.filter(c => c.inScope !== false);
    const outScope = CANDIDATURES.filter(c => c.inScope === false);

    let html = '<p class="confidence-note">Répertoire éditorial relu au 30 octobre 2026 : ' + CANDIDATURES.length + ' personnalités déclarées, désignées ou citées comme prétendantes sont suivies ici. ' + inScope.length + ' sont rattachées à une formation dont les positions sont comparées ; ' + outScope.length + ' restent hors classement, faute de positions publiques suffisamment codées. Cette sélection ne constitue pas une liste exhaustive ni la liste officielle, attendue au plus tard le 26 mars 2027. <a href="https://www.info.gouv.fr/actualite/election-presidentielle-2027" target="_blank" rel="noopener">Calendrier officiel</a> · <a href="https://www.lemonde.fr/les-decodeurs/article/2026/10/12/presidentielle-2027-qui-sont-les-principaux-candidats-declares-ou-probables_6680905_4355771.html" target="_blank" rel="noopener">Suivi de presse consulté</a>.</p>';;

    html += '<div class="candidatures-grid">';
    inScope.forEach(c => {
      const party = PARTIES.find(p => p.id === c.partyId);
      html += `<article class="candidature-card"${party ? ` style="--card-accent:${party.color}"` : ''}>
        <div class="candidature-head">
          <h3>${c.name}</h3>
          ${party ? '<span class="party-dot" style="background:' + party.color + '"></span>' : ''}
        </div>
        <p class="candidature-party">${c.party} · <span class="text-muted">${c.declaredOn ? 'déclarée le ' + formatFullDate(c.declaredOn) : 'date de déclaration non précisée'}</span></p>
        <p class="candidature-note">${c.declarationNote || ''}</p>
        ${latestPollForCandidate(c.name)
          ? (function() { const poll = latestPollForCandidate(c.name); return '<p class="candidature-poll">Dernière enquête recensée : <strong>' + Number(poll.result.score).toLocaleString('fr-FR') + ' %</strong> · ' + poll.wave.institute + ', publiée le ' + poll.wave.publishedAt + '.</p><a class="program-primary-source" href="' + poll.wave.notice + '" target="_blank" rel="noopener">Voir la notice du sondage</a>'; })()
          : '<p class="candidature-poll text-muted">Aucune mesure récente retenue dans les notices affichées</p>'}
        ${c.url ? `<a class="program-primary-source" href="${c.url}" target="_blank" rel="noopener">Source sur la candidature</a>` : ''}
      </article>`;
    });
    html += '</div>';

    if (outScope.length) {
      html += `<h2 style="margin-top:2rem">Candidatures déclarées hors du périmètre de comparaison</h2>
        <p class="confidence-note">Ces personnes se sont déclarées candidates, mais aucune formation de ce site ne porte leur candidature : leurs positions ne sont pas codées, et aucune comparaison n\'est proposée. Elles sont listées pour que le tableau soit complet, pas pour être classées.</p>
        <div class="candidatures-out-list">`;
      outScope.forEach(c => {
        html += `<div class="candidature-out-row">
          <div><strong>${c.name}</strong><span>${c.party} · ${c.declaredOn ? formatFullDate(c.declaredOn) : 'date non précisée'}</span></div>
          <p>${c.scopeReason || c.declarationNote || ''}</p>
          ${c.url ? `<a href="${c.url}" target="_blank" rel="noopener">Source</a>` : ''}
        </div>`;
      });
      html += '</div>';
    }

    if (typeof CALENDAR !== 'undefined' && CALENDAR.length) {
      html += `<h2 style="margin-top:2.4rem">Calendrier de la campagne</h2>
        <p class="confidence-note">Les jalons marqués « date fixée » sont les dates que les textes ou les annonces officielles ont déterminées ; les autres sont indicatifs et peuvent être modifiés.</p>
        <ol class="calendar-list">`;
      CALENDAR.forEach(c => {
        html += `<li class="calendar-item${c.official ? ' official' : ''}">
          <div class="calendar-date"><strong>${c.dateLabel}</strong><span>${c.kind}</span></div>
          <div class="calendar-body">
            <h3>${c.label}</h3>
            <p>${c.detail || ''}</p>
            ${c.sourceUrl ? `<a class="program-primary-source" href="${c.sourceUrl}" target="_blank" rel="noopener">Source</a>` : ''}
          </div>
          <span class="calendar-flag">${c.official ? 'date fixée' : 'indicatif'}</span>
        </li>`;
      });
      html += '</ol>';
    }

    root.innerHTML = html;
  }

  function formatFullDate(iso) {
    if (!iso) return 'date inconnue';
    const parts = String(iso).split('-');
    if (parts.length < 3) return iso;
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const m = parseInt(parts[1], 10) - 1;
    if (m < 0 || m > 11) return iso;
    return parseInt(parts[2], 10) + ' ' + mois[m] + ' ' + parts[0];
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

      const portrait = party.portraitFile
        ? `<img class="party-photo" src="${portraitURL(party.portraitFile)}" alt="Portrait de ${party.personName}" width="100" height="128" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
        : `<div class="party-photo portrait-placeholder" aria-hidden="true">${party.short}</div>`;
      const photoCredit = party.portraitFile
        ? `<span class="portrait-credit"><a href="${portraitPageURL(party.portraitFile)}" target="_blank" rel="noopener">Photo : ${party.portraitCredit}</a> · <a href="${party.portraitLicenseUrl}" target="_blank" rel="noopener">${party.portraitLicense}</a></span>`
        : '';
      const comparison = match
        ? `${matchRingHTML(match.matchPercent, 56)}<span class="match-caption">${captionFor(match)}</span>`
        : '<span class="party-unscored">À comparer après le questionnaire</span>';

      return `<article class="party-card">
        <div class="party-main">
          <span class="party-portrait">${portrait}${photoCredit}</span>
          <button class="party-card-text" data-party="${party.id}" aria-label="Ouvrir la fiche ${party.name}">
            <span class="party-family">${party.family}</span>
            <strong class="party-card-title">${party.name}</strong>
            <span class="party-person">${party.personName}<small>${party.personRole}</small></span>
            ${candidacyBadge(party)}
            <span class="party-status">${party.status}</span>
            <span class="party-card-match">${comparison}</span>
            <span class="party-open-hint">Voir la fiche et le programme <span aria-hidden="true">→</span></span>
          </button>
        </div>

      </article>`;
    }).join('') || '<p>Aucun parti dans cette famille.</p>';

    grid.querySelectorAll('.party-card-text').forEach(card => {
      card.addEventListener('click', () => openPartyDrawer(card.dataset.party));
    });
    const intro = document.getElementById('partyDirectoryIntro');
    if (intro) intro.innerHTML = hasResults
      ? 'Voici les formations rapprochées de vos réponses. Le score reste une indication : ouvrez chaque fiche pour voir les points communs, les différences et les sources.'
      : 'Explorez les ' + PARTIES.length + ' formations, leur personne de référence et leurs liens officiels. Les personnes en photo ne sont pas toutes candidates investies : leur statut est précisé dans chaque fiche.';
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
    if (compareButton) compareButton.hidden = false;
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
    const cov = partyCoverage(party);
    lastFocusedEl = document.activeElement;
    document.body.style.overflow = 'hidden';

    let intro;
    if (!hasResults) {
      intro = 'Terminez le questionnaire pour voir comment vos réponses se rapprochent des positions de cette formation.';
    } else if (match.matchPercent !== null) {
      intro = 'Indice éditorial de ' + match.matchPercent + '/100, calculé sur ' + match.comparableCount + ' des ' + DIM_KEYS.length + ' thèmes' + (match.questionComparableCount ? ' et ' + match.questionComparableCount + ' réponses précises comparables' : '') + '. Ce n’est ni une probabilité ni une prédiction de vote.';
    } else {
      intro = captionFor(match) + '.';
    }

    const portrait = party.portraitFile
      ? `<figure class="drawer-portrait"><img src="${portraitURL(party.portraitFile)}" alt="Portrait de ${party.personName}" width="90" height="116" loading="lazy" decoding="async"><figcaption><a href="${portraitPageURL(party.portraitFile)}" target="_blank" rel="noopener">${party.portraitCredit}</a> · <a href="${party.portraitLicenseUrl}" target="_blank" rel="noopener">${party.portraitLicense}</a></figcaption></figure>`
      : '';
    let html = `<div class="drawer-top">
      ${portrait}
      <div><p class="party-family" style="margin:0">${party.family}</p><h2 id="partyDrawerTitle" style="margin-bottom:.2rem">${party.name}</h2><strong>${party.personName}</strong><p class="party-person-role">${party.personRole}</p>${candidacyBadge(party)}</div>
      <button class="drawer-close" id="drawerCloseBtn" aria-label="Fermer la fiche">✕ Fermer</button></div>
      ${hasResults ? matchRingHTML(match.matchPercent, 60) : ''}
      <p class="confidence-note" style="margin-top:.6rem">${intro}</p>
      <p style="margin-top:1rem">${party.status}${party.statusSource ? ` <a href="${party.statusSource}" target="_blank" rel="noopener">Source du statut</a>` : ''}</p>
      <p class="confidence-note">Statut vérifié en ${formatStatusDate(party.statusDate)}. Les positions sont des estimations éditoriales de la formation, à partir de sources publiques. Couverture des positions concrètes codées : ${cov.coded} sur ${cov.total} (${Math.round(cov.ratio * 100)} %). ${cov.partial ? `En dessous du seuil de ${Math.round(Scoring.PARTIAL_COVERAGE * 100)} % : cette formation ne reçoit pas de pourcentage de similitude.` : 'Seuil de couverture atteint : cette formation peut être comparée à votre profil.'}</p>
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

    if (hasResults && match.perQuestion.length) {
      html += `<h3 style="margin-top:1.8rem">Vos réponses aux questions de précision</h3><div class="dim-compare">`;
      match.perQuestion.forEach(p => {
        const you = p.userPos !== null ? Scoring.stanceLabel(p.q, p.userPos).label : 'Vous n’avez pas tranché';
        const them = Scoring.stanceLabel(p.q, p.partyPos);
        const tag = p.available ? `<span class="dc-tag ${p.category.key}">${p.category.label}</span>` : `<span class="dc-tag non-renseigne">${p.reason === 'party-unknown' ? 'Position non codée' : 'Non tranché'}</span>`;
        const note = (p.q.stanceNotes && p.q.stanceNotes[party.id]) ? `<p class="dc-note">${p.q.stanceNotes[party.id]}</p>` : '';
        html += `<div class="dc-item">
          <div class="dc-head"><span>${p.q.topic}</span>${tag}</div>
          <div class="dc-detail">Vous : ${you}<br>${party.short} : ${them.label}</div>
          ${note}
        </div>`;
      });
      html += '</div>';
    }

    const drawer = document.getElementById('partyDrawer');
    drawer.innerHTML = html;
    drawer.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    document.getElementById('drawerBackdrop').classList.add('show');
    document.getElementById('drawerCloseBtn').addEventListener('click', closePartyDrawer);
    document.getElementById('drawerCloseBtn').focus();
  }

  function closePartyDrawer() {
    const drawer = document.getElementById('partyDrawer');
    drawer.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    document.getElementById('drawerBackdrop').classList.remove('show');
    document.body.style.overflow = '';
    if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
  }
  document.getElementById('drawerBackdrop').addEventListener('click', closePartyDrawer);

  /* Raccourcis clavier et Focus Trap */
  document.addEventListener('keydown', e => {
    const drawer = document.getElementById('partyDrawer');
    if (drawer && drawer.classList.contains('show')) {
      if (e.key === 'Escape') { closePartyDrawer(); return; }
      if (e.key === 'Tab') {
        const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
          .filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true');
        if (!focusable.length) { e.preventDefault(); drawer.focus(); return; }
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) {
          e.preventDefault(); first.focus();
        }
      }
      return;
    }

    const exportModal = document.getElementById('exportModalBackdrop');
    if (exportModal && !exportModal.hidden) {
      if (e.key === 'Escape') { closeExportModal(); return; }
    }

    // Touches du Quiz
    const quizEl = document.getElementById('screen-quiz');
    if (quizEl && quizEl.classList.contains('active')) {
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const btns = document.querySelectorAll('#scaleButtons .scale-btn');
        if (btns && btns[idx]) btns[idx].click();
      } else if (e.key === '0') {
        const dk = document.getElementById('dkBtn');
        if (dk && !document.getElementById('viewScale').hidden) dk.click();
      } else if (e.key === 'Enter') {
        const next = document.getElementById('btnNext');
        if (next && !next.disabled) next.click();
      } else if (e.key === 'ArrowLeft') {
        const back = document.getElementById('btnBack');
        if (back && !back.disabled) back.click();
      }
    }
  });

  /* ================================================================
     COMPARER
     ================================================================ */
  function renderCompare() {
    const root = document.getElementById('compareContent');
    if (!root) return;
    const eligible = PARTIES.filter(function(p) { return !!p.candidacyId && !!p.personName; });
    if (eligible.length < 2) {
      root.innerHTML = '<p class="lede">Les données publiques ne permettent pas encore de comparer deux candidatures.</p>';
      return;
    }
    const validIds = eligible.map(function(p) { return p.id; });
    let selected = (compareSelection || []).filter(function(id, index, ids) { return validIds.includes(id) && ids.indexOf(id) === index; }).slice(0, 2);
    if (selected.length < 2) selected = ['rn','horizons'].filter(function(id) { return validIds.includes(id); }).slice(0, 2);
    if (selected.length < 2) selected = validIds.slice(0, 2);
    compareSelection = selected;
    const partyA = eligible.find(function(p) { return p.id === selected[0]; });
    const partyB = eligible.find(function(p) { return p.id === selected[1]; });
    if (!partyA || !partyB) return;
    const optionHTML = function(current) {
      return eligible.map(function(p) {
        return '<option value="' + p.id + '"' + (p.id === current ? ' selected' : '') + '>' + p.personName + ' · ' + p.short + '</option>';
      }).join('');
    };
    let html = '<div class="candidate-compare-selectors"><label for="compareCandidateA"><span>Premier candidat</span><select id="compareCandidateA">' + optionHTML(partyA.id) + '</select></label><label for="compareCandidateB"><span>Deuxième candidat</span><select id="compareCandidateB">' + optionHTML(partyB.id) + '</select></label></div>';
    html += '<div class="candidate-compare-intro"><p>Choisissez deux personnes pour comparer les positions publiques codées de leur formation. Les orientations thématiques résument six axes ; les questions concrètes affichent les réponses documentées et les points sans source suffisante.</p><p class="confidence-note">À ce stade, ce comparateur couvre les personnalités rattachées aux formations documentées. Il ne transforme pas les prétendants sans programme vérifiable en scores fictifs. La liste officielle des candidats est attendue au plus tard le 26 mars 2027.</p></div>';
    html += '<div class="candidate-compare-identities"><article style="--party-color:' + partyA.color + '"><span class="party-family">' + partyA.family + ' · ' + partyA.short + '</span><h2>' + partyA.personName + '</h2><p>' + partyA.personRole + '</p><p class="confidence-note">' + partyA.status + '</p><a href="' + (partyA.program || partyA.site) + '" target="_blank" rel="noopener">Positions et programme public ↗</a></article><span class="candidate-compare-versus" aria-hidden="true">VS</span><article style="--party-color:' + partyB.color + '"><span class="party-family">' + partyB.family + ' · ' + partyB.short + '</span><h2>' + partyB.personName + '</h2><p>' + partyB.personRole + '</p><p class="confidence-note">' + partyB.status + '</p><a href="' + (partyB.program || partyB.site) + '" target="_blank" rel="noopener">Positions et programme public ↗</a></article></div>';
    html += '<section class="candidate-compare-axes" aria-labelledby="compareAxesTitle"><h2 id="compareAxesTitle">Vue d’ensemble sur six thèmes</h2><p class="confidence-note">Les curseurs situent une orientation éditoriale des formations, pas une réponse personnelle des candidats.</p>';
    DIM_KEYS.forEach(function(key) {
      const dim = DIMENSIONS[key];
      const aValue = partyA.positions[key];
      const bValue = partyB.positions[key];
      const aLeft = typeof aValue === 'number' ? Math.max(0, Math.min(100, ((aValue + 2) / 4) * 100)) : 50;
      const bLeft = typeof bValue === 'number' ? Math.max(0, Math.min(100, ((bValue + 2) / 4) * 100)) : 50;
      html += '<article class="candidate-compare-axis"><div class="candidate-compare-axis-head"><h3>' + dim.name + '</h3><span>' + (typeof aValue === 'number' && typeof bValue === 'number' ? (Math.abs(aValue - bValue) < 0.6 ? 'Orientations proches' : 'Orientations différentes') : 'Données partielles') + '</span></div><div class="candidate-compare-axis-values"><div><strong>' + partyA.personName + '</strong><span>' + positionLabel(key, aValue) + '</span></div><div><strong>' + partyB.personName + '</strong><span>' + positionLabel(key, bValue) + '</span></div></div><div class="candidate-compare-spectrum" aria-hidden="true"><span class="candidate-compare-spectrum-a" style="left:' + aLeft + '%"></span><span class="candidate-compare-spectrum-b" style="left:' + bLeft + '%"></span></div><div class="candidate-compare-spectrum-labels"><span>' + dim.labelLeft + '</span><span>' + dim.labelRight + '</span></div></article>';
    });
    html += '</section><section class="candidate-compare-details" aria-labelledby="compareDetailsTitle"><h2 id="compareDetailsTitle">Comparer les positions question par question</h2><p class="confidence-note">Les positions ci-dessous s’appuient sur les éléments publics cités dans l’onglet « Les programmes ». Une position non documentée reste affichée comme telle.</p>';
    DIM_KEYS.forEach(function(key, index) {
      const questions = DEPARTAGE.filter(function(q) { return q.dim === key; });
      if (!questions.length) return;
      html += '<details class="candidate-compare-theme"' + (index === 0 ? ' open' : '') + '><summary>' + DIMENSIONS[key].name + '<span>' + questions.length + ' questions</span></summary><div class="candidate-compare-question-list">';
      questions.forEach(function(q) {
        const valueA = q.stances && Object.prototype.hasOwnProperty.call(q.stances, partyA.id) ? q.stances[partyA.id] : undefined;
        const valueB = q.stances && Object.prototype.hasOwnProperty.call(q.stances, partyB.id) ? q.stances[partyB.id] : undefined;
        const stanceA = Scoring.stanceLabel(q, valueA);
        const stanceB = Scoring.stanceLabel(q, valueB);
        const close = typeof valueA === 'number' && typeof valueB === 'number' && Math.abs(valueA - valueB) < 0.26;
        html += '<article class="candidate-compare-question"><h3>' + q.q + '</h3>' + (q.plain ? '<p>' + q.plain + '</p>' : '') + '<div class="candidate-compare-answers"><div><strong>' + partyA.personName + '</strong><span class="' + (stanceA.known ? '' : 'is-unknown') + '">' + stanceA.label + '</span>' + (q.stanceNotes && q.stanceNotes[partyA.id] ? '<small>' + q.stanceNotes[partyA.id] + '</small>' : '') + '</div><div><strong>' + partyB.personName + '</strong><span class="' + (stanceB.known ? '' : 'is-unknown') + '">' + stanceB.label + '</span>' + (q.stanceNotes && q.stanceNotes[partyB.id] ? '<small>' + q.stanceNotes[partyB.id] + '</small>' : '') + '</div></div><p class="candidate-compare-difference">' + (stanceA.known && stanceB.known ? (close ? 'Les formations retiennent une position très proche sur ce point.' : 'Les positions codées prennent des orientations différentes sur ce point.') : 'La comparaison est incomplète : au moins une position n’est pas documentée.') + '</p></article>';
      });
      html += '</div></details>';
    });
    html += '</section><div class="btn-row"><button class="btn btn-ghost" id="btnComparePrograms">Voir les réponses détaillées dans les programmes</button></div>';
    root.innerHTML = html;
    const selectA = document.getElementById('compareCandidateA');
    const selectB = document.getElementById('compareCandidateB');
    selectA.addEventListener('change', function(event) {
      const previous = compareSelection[0];
      if (event.target.value === compareSelection[1]) compareSelection[1] = previous;
      compareSelection[0] = event.target.value;
      renderCompare();
    });
    selectB.addEventListener('change', function(event) {
      const previous = compareSelection[1];
      if (event.target.value === compareSelection[0]) compareSelection[0] = previous;
      compareSelection[1] = event.target.value;
      renderCompare();
    });
    document.getElementById('btnComparePrograms').addEventListener('click', function() { showScreen('programs'); });
  }

  /* ================================================================
     PROGRAMMES
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
      const isKnown = typeof position === 'number';
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
      /* Note de position : la formulation qui justifie le codage, issue des
         prises de position publiques de la formation. */
      const note = isDepartage && question.stanceNotes && question.stanceNotes[party.id]
        ? `<p class="program-answer-note">${question.stanceNotes[party.id]}</p>` : '';
      return `<article class="program-answer ${className}">
        <div class="program-answer-head"><strong>${party.name}</strong><span>${party.personName} · ${party.personRole}</span></div>
        <span class="program-answer-label">${label}</span>
        <p>${description}</p>
        ${note}
        ${isKnown ? `<a class="program-primary-source" href="${party.program}" target="_blank" rel="noopener">Consulter le programme ou le site officiel de ${party.short}</a>` : ''}
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
      document.querySelector('.program-tabs').addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const tabs = Array.from(document.querySelectorAll('[data-program-phase]'));
        const current = tabs.indexOf(event.target);
        const next = event.key === 'Home' ? 0
          : event.key === 'End' ? tabs.length - 1
            : (current + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        event.preventDefault();
        programPhase = tabs[next].dataset.programPhase;
        renderPrograms();
        tabs[next].focus();
      });
      filter.dataset.ready = '1';
    }
    filter.value = programPartyFilter;
    document.querySelectorAll('[data-program-phase]').forEach(button => {
      const active = button.dataset.programPhase === programPhase;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });
    document.getElementById('programPanel').setAttribute('aria-labelledby', programPhase === 'main' ? 'programTabMain' : 'programTabDetail');

    const selectedParties = programPartyFilter === 'all'
      ? PARTIES
      : PARTIES.filter(p => p.id === programPartyFilter);
    const isDepartage = programPhase === 'departage';
    const questions = isDepartage ? DEPARTAGE : QUESTIONS;
    phaseIntro.textContent = isDepartage
      ? 'Banque de ' + DEPARTAGE.length + ' questions concrètes ; le quiz en pose jusqu’à ' + Scoring.MAX_DEPARTAGE + ', choisies selon vos réponses. Les positions documentées reposent sur des déclarations ou documents publics consultés au 30 octobre 2026 ; ce sont des codages éditoriaux, pas des réponses officielles des personnes citées.'
      : 'Ces repères résument les positions publiques des formations consultées au 30 octobre 2026. Ils donnent une tendance par thème et ne signifient pas que la personne citée a répondu mot pour mot à la question.';

    list.innerHTML = questions.map((question, index) => {
      const title = isDepartage ? question.q : question.topic;
      const relatedSources = (question.sourceIds || []).map(id => SOURCES.find(source => source.id === id)).filter(Boolean);
      const evidence = `<div class="program-basis"><strong>Base éditoriale :</strong> ${question.basis || 'Aucune base documentaire détaillée n’est enregistrée.'}
          ${relatedSources.length ? `<p>Repères de contexte pour cette question :</p><ul>${relatedSources.map(source => `<li><a href="${source.url}" target="_blank" rel="noopener">${source.label}</a> <span>(${source.type || 'source de recoupement'})</span></li>`).join('')}</ul>` : '<p>Aucun lien spécifique à cette question n’est référencé dans cette version.</p>'}</div>`;
      const body = isDepartage
        ? `<p class="program-question-plain">${question.plain || ''}</p>
          <div class="program-options">${question.options.map((option, i) => `<div><span>${i + 1}</span><p>${option.text}</p></div>`).join('')}</div>
          ${evidence}`
        : `<p class="program-question-plain">${question.plain || ''}</p>
          <div class="program-options"><div><span>A</span><p>${question.a}</p></div><div><span>B</span><p>${question.b}</p></div></div>
          <div class="program-basis"><p>La tendance affichée est une estimation de la formation à l’échelle du thème « ${DIMENSIONS[question.dim].name} ».</p></div>`;
      return `<details class="program-question">
        <summary><span class="program-question-count">${String(index + 1).padStart(2, '0')}</span><span class="program-question-title">${title}</span><span class="program-question-topic">${isDepartage ? question.topic : DIMENSIONS[question.dim].short}</span></summary>
        <div class="program-question-content">${body}<div class="program-answer-list">${programPartyRows(question, isDepartage, selectedParties)}</div></div>
      </details>`;
    }).join('');

    const programSources = document.getElementById('programSources');
    if (programSources && !programSources.dataset.filled) {
      programSources.innerHTML = `<li class="source-subheading">Repères éditoriaux et sources de contexte</li>${SOURCES.map(source => `<li><a href="${source.url}" target="_blank" rel="noopener">${source.label}</a> <span>(${source.type || 'source de recoupement'})</span></li>`).join('')}<li class="source-subheading">Sites et programmes des formations</li>${PARTIES.map(party => `<li><a href="${party.program}" target="_blank" rel="noopener">${party.name} — site ou programme officiel</a></li>`).join('')}`;
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
      src.innerHTML = SOURCES.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a> <span class="source-type">(${s.type || 'source de recoupement'})</span></li>`).join('');
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
     INITIALISATION
     ================================================================ */
  /* Les chiffres affichés dans le texte statique sont remplacés par les
     valeurs réelles issues des données : un changement de la base se
     répercute partout, sans laisser de nombre périmé dans le site. */
  function applyDynamicCounts() {
    const counts = {
      questions: QUESTIONS.length,
      departage: DEPARTAGE.length,
      parties: PARTIES.length,
      themes: typeof THEMES !== 'undefined' ? THEMES.length : 0,
      sources: typeof SOURCES !== 'undefined' ? SOURCES.length : 0,
      candidates: typeof CANDIDATURES !== 'undefined' ? CANDIDATURES.length : 0,
      calendar: typeof CALENDAR !== 'undefined' ? CALENDAR.length : 0,
      dimensions: DIM_KEYS.length,
      threshold: Math.round(Scoring.PARTIAL_COVERAGE * 100),
      answerThreshold: Math.round(Scoring.MIN_ANSWERED_COVERAGE * 100)
    };
    document.querySelectorAll('[data-count]').forEach(el => {
      const v = counts[el.dataset.count];
      if (v !== undefined) el.textContent = String(v);
    });
  }

  /* Navigation mobile : le menu se replie dans un panneau déroulant
     sous la barre du haut, et se referme après un choix. */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;
    const setOpen = open => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); } });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
  }

  function init() {
    applyDynamicCounts();
    initMobileNav();
    refreshResumeBanner();
    const stored = loadState();
    setNavEnabled(!!(stored && stored.completed));
    if (stored && stored.completed) {
      state = stored;
      computeResults();
    }
    const hash = window.location.hash.replace('#', '');
    if (hash && VALID_SCREENS.includes(hash)) {
      showScreen(hash, false);
    } else {
      showScreen('home', false);
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
