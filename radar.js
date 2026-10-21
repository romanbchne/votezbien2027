/* ============================================================================
   VOTEZ BIEN ! — radar.js
   RADAR INTELLIGENT : un audit RÉELLEMENT CALCULÉ, jamais une affirmation.

   Ce module ne contient aucun score écrit à la main. Chaque axe est le
   résultat d'un contrôle exécuté sur les données et sur le moteur de calcul
   (scoring.js), au même moment que l'utilisateur ouvre l'écran « Radar ».
   Il est donc PUR : aucune dépendance au DOM, testable avec Node.

   Les six axes audités :
     1. balance       — répartition réelle des questions entre les 6 axes,
                        comparée aux poids déclarés dans DIMENSIONS ;
     2. neutrality    — exécution de l'inversion A/B (makeBalancedFlips) sur
                        de nombreuses graines, contrôle de l'équilibre par
                        thème et de la longueur des séries ;
     3. traceability  — sources identifiées, uniques, en HTTPS, et rattachées
                        aux 27 questions de départage ;
     4. pluralism     — doublons (identité, personne, couleur) et amplitude
                        réelle du spectre politique sur chaque axe ;
     5. orderIndep    — le classement est-il identique quand on inverse ou
                        on mélange l'ordre des questions ? (test calculé) ;
     6. coverage      — quelle part des formations peut réellement être
                        comparée sans données minces (seuil du moteur).

   Chaque axe renvoie un score, des métriques chiffrées et des constats
   (niveau ok / warn / error). Le score global est la moyenne pondérée
   de ces six scores : il n'est jamais déclaré à l'avance.
   ========================================================================= */

(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const D = isNode ? require('./data.js') : root;
  const Scoring = isNode ? require('./scoring.js') : (root.Scoring || null);

  const DIMENSIONS = D.DIMENSIONS || {};
  const DIM_KEYS = D.DIM_KEYS || [];
  const QUESTIONS = D.QUESTIONS || [];
  const DEPARTAGE = D.DEPARTAGE || [];
  const PARTIES = D.PARTIES || [];
  const SOURCES = D.SOURCES || [];
  const THEMES = D.THEMES || [];
  const POLLS = D.POLLS || {};
  const CANDIDATURES = D.CANDIDATURES || [];
  const CALENDAR = D.CALENDAR || [];

  /* Poids des axes dans le score global. Explicites, et affichés tels quels. */
  const AXIS_WEIGHTS = {
    balance: 0.15,
    neutrality: 0.20,
    traceability: 0.25,
    pluralism: 0.15,
    orderIndep: 0.15,
    coverage: 0.10
  };

  const LEVEL_ORDER = { ok: 0, warn: 1, error: 2 };

  /* ----------------------------------------------------------------------
     Petits utilitaires
     ------------------------------------------------------------------- */
  function worstLevel(levels) {
    let w = 'ok';
    levels.forEach(l => { if (LEVEL_ORDER[l] > LEVEL_ORDER[w]) w = l; });
    return w;
  }
  function round1(n) { return Math.round(n * 10) / 10; }
  function pct(a, b) { return b > 0 ? (a / b) * 100 : 0; }
  function clampScore(n) { return Math.max(0, Math.min(100, n)); }

  function longestRun(arr) {
    let best = 0, run = 0, prev;
    arr.forEach((v, i) => { run = (i > 0 && v === prev) ? run + 1 : 1; prev = v; if (run > best) best = run; });
    return best;
  }

  function duplicatesOf(values) {
    const seen = {}, dup = [];
    values.forEach(v => {
      if (v === undefined || v === null || v === '') return;
      const k = String(v).trim().toLowerCase();
      if (seen[k]) dup.push(v);
      else seen[k] = true;
    });
    return dup;
  }

  /* Générateur pseudo-aléatoire déterministe (mulberry32, comme scoring.js) :
     le radar doit donner le même résultat à chaque ouverture. */
  function rngFrom(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Réponses aléatoires sur la banque d'orientation, au format attendu par
     Scoring.computeDimensionResults : { [questionId]: -2..2 | 'dk' }.
     On garantit au moins une réponse chiffrée par thème : sans cela, un
     tirage peut laisser un thème entièrement « je ne sais pas » et
     fausser la mesure d'indépendance à l'ordre. */
  function randomOrientationAnswers(rng) {
    const answers = {};
    const firstOfDim = {};
    QUESTIONS.forEach(q => {
      if (firstOfDim[q.dim] === undefined) { firstOfDim[q.dim] = true; answers[q.id] = Math.round((rng() * 4 - 2) * 100) / 100; return; }
      answers[q.id] = rng() < 0.12 ? 'dk' : Math.round((rng() * 4 - 2) * 100) / 100;
    });
    return answers;
  }

  /* Réponses aléatoires sur la banque de départage : { [questionId]: pos | 'dk' }.
     La position répondue est le `pos` de l'option retenue, et non son index
     d'affichage, pour rester correct même si l'ordre des propositions change. */
  function randomDepartageAnswers(rng, count) {
    const answers = {};
    const n = Math.max(0, Math.min(count || 0, DEPARTAGE.length));
    for (let i = 0; i < n; i++) {
      const q = DEPARTAGE[i];
      if (rng() < 0.12) { answers[q.id] = 'dk'; continue; }
      const opt = q.options[Math.floor(rng() * q.options.length)];
      answers[q.id] = typeof opt.pos === 'number' ? opt.pos : q.options.indexOf(opt);
    }
    return answers;
  }

  /* ----------------------------------------------------------------------
     1. ÉQUILIBRE THÉMATIQUE
     Les questions sont réparties sur les axes, qui n'ont pas tous le même poids.
     On compare la répartition réelle à la répartition théorique (poids).
     Un axe est « équilibré » si l'écart est d'au plus une question.
     On exige aussi qu'aucun axe ne soit sous-échantillonné (3 questions mini).
     ------------------------------------------------------------------- */
  function auditBalance(findings) {
    const total = QUESTIONS.length;
    const weightSum = DIM_KEYS.reduce((a, k) => a + (DIMENSIONS[k] && DIMENSIONS[k].weight ? DIMENSIONS[k].weight : 0), 0);
    const rows = [];
    let balanced = 0, sampled = 0;
    DIM_KEYS.forEach(k => {
      const n = QUESTIONS.filter(q => q.dim === k).length;
      const w = DIMENSIONS[k] && DIMENSIONS[k].weight ? DIMENSIONS[k].weight : 0;
      const expected = weightSum > 0 ? (w / weightSum) * total : 0;
      const dev = Math.abs(n - expected);
      const ok = dev <= 1;
      const enough = n >= 3;
      if (ok) balanced++;
      if (enough) sampled++;
      rows.push({
        dim: k,
        name: DIMENSIONS[k] ? DIMENSIONS[k].short || DIMENSIONS[k].name : k,
        count: n,
        weight: w,
        expected: round1(expected),
        deviation: round1(dev),
        balanced: ok,
        sampled: enough
      });
    });
    const balRatio = DIM_KEYS.length ? balanced / DIM_KEYS.length : 0;
    const sampRatio = DIM_KEYS.length ? sampled / DIM_KEYS.length : 0;
    const score = clampScore(100 * (0.6 * balRatio + 0.4 * sampRatio));

    const over = rows.filter(r => !r.balanced);
    if (over.length) {
      findings.push({
        level: over.some(r => !r.sampled) ? 'error' : 'warn',
        axis: 'balance',
        title: 'Répartition des questions déséquilibrée sur ' + over.length + ' axe(s)',
        message: over.map(r => r.name + ' : ' + r.count + ' questions pour un poids de ' + r.weight +
          ' (attendu ' + r.expected + ')').join(' ; ') + '.'
      });
    } else {
      findings.push({
        level: 'ok', axis: 'balance',
        title: 'Les ' + total + ' questions sont réparties conformément aux poids déclarés',
        message: 'Chaque axe se situe à une question près de la répartition théorique, et aucun axe n’est sous-échantillonné.'
      });
    }
    if (sampRatio < 1) {
      const thin = rows.filter(r => !r.sampled);
      findings.push({
        level: 'warn', axis: 'balance',
        title: 'Axe(s) sous-échantillonné(s)',
        message: thin.map(r => r.name + ' : ' + r.count + ' question(s) seulement').join(' ; ') + ' — en dessous de 3, l’axe est difficile à interpréter.'
      });
    }

    /* La banque de départage n'a pas vocation à suivre les poids : on mesure
       simplement son étalonnage, sans le pénaliser. */
    const dpCounts = {};
    DEPARTAGE.forEach(q => { dpCounts[q.dim] = (dpCounts[q.dim] || 0) + 1; });
    const dpMax = Math.max.apply(null, DIM_KEYS.map(k => dpCounts[k] || 0));
    const dpMin = Math.min.apply(null, DIM_KEYS.map(k => dpCounts[k] || 0));

    return {
      key: 'balance',
      label: 'Équilibre thématique',
      short: 'Équilibre',
      score: score,
      summary: balanced + ' / ' + DIM_KEYS.length + ' axes conformes au poids déclaré ; ' +
        'aucun axe sous-échantillonné' + (sampled === DIM_KEYS.length ? '' : ' (' + (DIM_KEYS.length - sampled) + ' en dessous de 3 questions)'),
      metrics: [
        { label: 'Questions d’orientation', value: String(total) },
        { label: 'Axes conformes', value: balanced + ' / ' + DIM_KEYS.length },
        { label: 'Axes à 3 questions ou plus', value: sampled + ' / ' + DIM_KEYS.length },
        { label: 'Départage : questions par axe', value: dpMin + ' à ' + dpMax }
      ],
      detail: rows
    };
  }

  /* ----------------------------------------------------------------------
     2. NEUTRALITÉ DE L'ORDRE D'AFFICHAGE
     On rejoue réellement l'inversion A/B sur de nombreuses graines et on
     contrôle, pour chaque tirage :
       - l'équilibre des inversions dans chaque thème (écart ≤ 1) ;
       - la longueur maximale d'une série de même sens (≤ 3).
     On contrôle aussi que l'ordre des options n'est jamais croissant ni
     décroissant de façon systématique.
     ------------------------------------------------------------------- */
  function auditNeutrality(findings, seeds) {
    const banks = [{ name: 'questions d’orientation', list: QUESTIONS }, { name: 'questions de départage', list: DEPARTAGE }];
    let totalChecks = 0, passed = 0, worstRun = 0, unbalanced = 0, monotone = 0, optionChecks = 0, optionPassed = 0;
    const perBank = [];

    banks.forEach(bank => {
      let bOk = 0, bRun = 0;
      /* Index des questions par identifiant : évite une recherche linéaire
         (O(n²)) dans la boucle de contrôle. */
      const indexOf = {};
      bank.list.forEach((q, i) => { indexOf[q.id] = i; });
      /* Les questions à propositions multiples (départage) portent un tableau
         `options` ; les questions d'orientation sont binaires (A/B). Seules
         les premières ont un ordre d'options à contrôler. */
      const multiChoice = bank.list.filter(q => Array.isArray(q.options) && q.options.length >= 3);

      for (let s = 0; s < seeds; s++) {
        totalChecks++;
        const rng = Scoring.seededRandom(1000 + s);
        const flips = Scoring.makeBalancedFlips(bank.list, rng, 3);
        const seq = bank.list.map(q => (flips[q.id] ? 1 : 0));

        // équilibre par thème
        let themeOk = true;
        const byDim = {};
        bank.list.forEach((q, i) => { (byDim[q.dim] = byDim[q.dim] || []).push(seq[i]); });
        Object.keys(byDim).forEach(dim => {
          const arr = byDim[dim];
          const nTrue = arr.filter(Boolean).length;
          if (Math.abs(nTrue - (arr.length - nTrue)) > 1) themeOk = false;
        });

        const run = longestRun(seq);
        if (run > worstRun) worstRun = run;
        if (run > bRun) bRun = run;
        if (!themeOk) unbalanced++;
        if (run <= 3 && themeOk) { passed++; bOk++; }

        // ordre des options : jamais strictement croissant ni décroissant
        if (s === 0) {
          multiChoice.forEach(q => {
            const n = q.options.length;
            optionChecks++;
            const order = Scoring.makeOptionOrder(n, rng);
            const asc = order.every((v, i) => v === i);
            const desc = order.every((v, i) => v === n - 1 - i);
            if (!asc && !desc) optionPassed++;
          });
        }
      }
      perBank.push({ name: bank.name, questions: bank.list.length, seeds, passed: bOk, worstRun: bRun });
    });

    const score = clampScore(totalChecks ? 100 * (passed / totalChecks) : 0);
    const optScore = optionChecks ? 100 * (optionPassed / optionChecks) : 100;
    const finalScore = clampScore(0.85 * score + 0.15 * optScore);

    if (unbalanced > 0) {
      findings.push({
        level: 'error', axis: 'neutrality',
        title: 'Inversion A/B déséquilibrée sur ' + unbalanced + ' tirage(s)',
        message: 'Le rapport entre questions inversées et non inversées doit différer d’au plus 1 dans chaque thème.'
      });
    }
    if (worstRun > 3) {
      findings.push({
        level: 'warn', axis: 'neutrality',
        title: 'Série trop longue d’un même sens',
        message: 'La plus longue série observée est de ' + worstRun + ' questions de même orientation (seuil : 3).'
      });
    }
    if (unbalanced === 0 && worstRun <= 3) {
      findings.push({
        level: 'ok', axis: 'neutrality',
        title: 'Inversion A/B vérifiée sur ' + seeds + ' graines × 2 banques',
        message: 'Écart ≤ 1 dans chaque thème et série maximale de ' + worstRun + ' questions : le réflexe de toujours cliquer le premier choix s’annule.'
      });
    }
    findings.push({
      level: optionPassed === optionChecks ? 'ok' : 'warn', axis: 'neutrality',
      title: 'Ordre des propositions',
      message: optionPassed + ' / ' + optionChecks + ' questions ont un ordre d’options qui n’est ni croissant ni décroissant.'
    });

    return {
      key: 'neutrality',
      label: 'Neutralité de l’affichage',
      short: 'Neutralité',
      score: finalScore,
      summary: passed + ' / ' + totalChecks + ' tirages conformes (équilibre par thème et série ≤ 3) ; ' +
        optionPassed + ' / ' + optionChecks + ' ordres d’options non monotones',
      metrics: [
        { label: 'Graines testées par banque', value: String(seeds) },
        { label: 'Tirages conformes', value: passed + ' / ' + totalChecks },
        { label: 'Série maximale observée', value: String(worstRun) + ' (seuil 3)' },
        { label: 'Ordres d’options non monotones', value: optionPassed + ' / ' + optionChecks }
      ],
      detail: perBank
    };
  }

  /* ----------------------------------------------------------------------
     3. TRAÇABILITÉ DOCUMENTAIRE
     On vérifie que chaque source est identifiée, unique et servie en HTTPS,
     que les 27 questions de départage renvoient à des sources qui existent,
     et que les formations exposent une source vérifiable.
     ------------------------------------------------------------------- */
  function auditTraceability(findings) {
    const sourceIds = SOURCES.map(s => s.id);
    const known = {};
    sourceIds.forEach(id => { known[id] = true; });

    const withId = SOURCES.filter(s => typeof s.id === 'string' && s.id.length > 0).length;
    const https = SOURCES.filter(s => typeof s.url === 'string' && /^https:\/\//.test(s.url)).length;
    const unique = new Set(sourceIds).size;
    const dupeIds = sourceIds.length - unique;

    /* Ce qui manque est COMPTÉ puis RAPPORTÉ : aucune de ces lacunes ne peut
       rester invisible derrière un score. */
    const noIdSources = SOURCES.filter(s => !(typeof s.id === 'string' && s.id.length > 0));
    const nonHttpsSources = SOURCES.filter(s => !(typeof s.url === 'string' && /^https:\/\//.test(s.url)));
    const noSite = PARTIES.filter(p => !(typeof p.site === 'string' && /^https:\/\//.test(p.site)));
    const noStatusSource = PARTIES.filter(p => !(typeof p.statusSource === 'string' && /^https:\/\//.test(p.statusSource)));
    const noStatusLabel = PARTIES.filter(p => !(typeof p.candidacyStatus === 'string' && p.candidacyStatus.length > 0));

    const withIds = DEPARTAGE.filter(q => Array.isArray(q.sourceIds) && q.sourceIds.length > 0).length;
    const resolvable = DEPARTAGE.filter(q => Array.isArray(q.sourceIds) && q.sourceIds.length > 0 && q.sourceIds.every(i => known[i])).length;
    const withBasis = DEPARTAGE.filter(q => typeof q.basis === 'string' && q.basis.trim().length > 0).length;

    const used = {};
    DEPARTAGE.forEach(q => (q.sourceIds || []).forEach(i => { used[i] = true; }));
    const orphans = SOURCES.filter(s => !used[s.id]);
    const partiesWithSite = PARTIES.filter(p => typeof p.site === 'string' && /^https:\/\//.test(p.site)).length;
    const partiesWithStatus = PARTIES.filter(p => typeof p.statusSource === 'string' && /^https:\/\//.test(p.statusSource)).length;
    const partiesWithCandidate = PARTIES.filter(p => typeof p.candidacyStatus === 'string' && p.candidacyStatus.length > 0).length;

    const c1 = pct(withId, SOURCES.length);
    const c2 = pct(https, SOURCES.length);
    const c3 = pct(unique, SOURCES.length);
    const c4 = pct(resolvable, DEPARTAGE.length);
    const c5 = pct(withBasis, DEPARTAGE.length);
    const c6 = pct(partiesWithSite, PARTIES.length);
    const c7 = pct(partiesWithStatus, PARTIES.length);

    const score = clampScore(100 * (
      0.20 * c1 / 100 + 0.10 * c2 / 100 + 0.10 * c3 / 100 +
      0.30 * c4 / 100 + 0.10 * c5 / 100 + 0.10 * c6 / 100 + 0.10 * c7 / 100
    ));

    if (dupeIds > 0) {
      findings.push({
        level: 'error', axis: 'traceability',
        title: dupeIds + ' identifiant(s) de source en double',
        message: 'Chaque source doit avoir un identifiant unique, sinon les renvois ne sont plus fiables.'
      });
    }
    if (noIdSources.length) {
      findings.push({
        level: 'error', axis: 'traceability',
        title: noIdSources.length + ' source(s) sans identifiant',
        message: 'Sans identifiant, ces documents ne peuvent pas être rattachés à une question de départage : ' +
          noIdSources.map(s => s.label || s.url || 'source sans nom').join(', ') + '.'
      });
    }
    if (nonHttpsSources.length) {
      findings.push({
        level: 'error', axis: 'traceability',
        title: nonHttpsSources.length + ' source(s) servie(s) hors HTTPS',
        message: 'Ces documents ne sont pas sécurisés au transport : ' +
          nonHttpsSources.map(s => s.label || s.url || 'source sans nom').join(', ') + '.'
      });
    }
    if (noSite.length) {
      findings.push({
        level: 'warn', axis: 'traceability',
        title: noSite.length + ' formation(s) sans site officiel documenté',
        message: noSite.map(p => p.short).join(', ') + ' : sans lien officiel, le lecteur ne peut pas vérifier leur statut.'
      });
    }
    if (noStatusSource.length) {
      findings.push({
        level: 'warn', axis: 'traceability',
        title: noStatusSource.length + ' formation(s) sans source de statut',
        message: noStatusSource.map(p => p.short).join(', ') + ' : la date et le statut de candidature affichés ne renvoient à aucun document vérifiable.'
      });
    }
    if (noStatusLabel.length) {
      findings.push({
        level: 'warn', axis: 'traceability',
        title: noStatusLabel.length + ' formation(s) sans statut de candidature renseigné',
        message: noStatusLabel.map(p => p.short).join(', ') + ' : le lecteur ne peut pas distinguer une candidature annoncée d’une candidature réelle.'
      });
    }
    if (withIds < DEPARTAGE.length) {
      findings.push({
        level: 'warn', axis: 'traceability',
        title: (DEPARTAGE.length - withIds) + ' question(s) de départage sans source rattachée',
        message: 'Les positions de ces questions ne renvoient à aucun document vérifiable.'
      });
    }
    if (resolvable < withIds) {
      findings.push({
        level: 'error', axis: 'traceability',
        title: (withIds - resolvable) + ' question(s) pointent vers une source inexistante',
        message: 'Un identifiant de source cité n’existe pas dans la liste des sources.'
      });
    }
    if (withBasis < DEPARTAGE.length) {
      findings.push({
        level: 'warn', axis: 'traceability',
        title: (DEPARTAGE.length - withBasis) + ' question(s) sans base éditoriale',
        message: 'Chaque question doit expliquer d’où viennent les positions retenues.'
      });
    }
    if (dupeIds === 0 && resolvable === withIds && withIds === DEPARTAGE.length && withBasis === DEPARTAGE.length
        && noIdSources.length === 0 && nonHttpsSources.length === 0) {
      findings.push({
        level: 'ok', axis: 'traceability',
        title: 'Les ' + DEPARTAGE.length + ' questions de départage renvoient à des sources identifiées et résolues',
        message: withIds + ' / ' + DEPARTAGE.length + ' questions rattachées, ' + withBasis + ' / ' + DEPARTAGE.length +
          ' avec base éditoriale, ' + unique + ' sources uniques dont ' + https + ' en HTTPS.'
      });
    }
    if (orphans.length) {
      findings.push({
        level: 'ok', axis: 'traceability',
        title: orphans.length + ' source(s) de contexte non rattachée(s) à une question',
        message: 'Ces sources servent de recoupement (sondages, notices, candidats) et non de position de départage.'
      });
    }

    return {
      key: 'traceability',
      label: 'Traçabilité documentaire',
      short: 'Traçabilité',
      score: score,
      summary: resolvable + ' / ' + DEPARTAGE.length + ' questions de départage rattachées à une source résolue ; ' +
        SOURCES.length + ' sources, ' + withId + ' identifiées, ' + https + ' en HTTPS',
      metrics: [
        { label: 'Sources uniques', value: unique + ' / ' + SOURCES.length },
        { label: 'Sources en HTTPS', value: https + ' / ' + SOURCES.length },
        { label: 'Questions rattachées et résolues', value: resolvable + ' / ' + DEPARTAGE.length },
        { label: 'Questions avec base éditoriale', value: withBasis + ' / ' + DEPARTAGE.length },
        { label: 'Formations avec site officiel', value: partiesWithSite + ' / ' + PARTIES.length },
        { label: 'Formations avec source de statut', value: partiesWithStatus + ' / ' + PARTIES.length },
        { label: 'Formations avec statut de candidature renseigné', value: partiesWithCandidate + ' / ' + PARTIES.length }
      ],
      detail: { orphanSources: orphans.map(s => s.label) }
    };
  }

  /* ----------------------------------------------------------------------
     4. PLURALISME ET DOUBLONS
     Le contrôle le plus important du site : une même personne (ou une même
     couleur, un même identifiant) ne doit pas apparaître deux fois. C'est
     exactement le bug qui avait fait figurer Glucksmann sous Place publique
     ET sous Parti socialiste. Le test est fait sur les données réelles.
     ------------------------------------------------------------------- */
  function auditPluralism(findings) {
    const dupIds = duplicatesOf(PARTIES.map(p => p.id));
    const dupPersons = duplicatesOf(PARTIES.map(p => p.personName));
    const dupColors = duplicatesOf(PARTIES.map(p => p.color));
    const dupShorts = duplicatesOf(PARTIES.map(p => p.short));
    const dupCandidacy = duplicatesOf(PARTIES.map(p => p.candidacyId));

    /* Doublons de personne : on retrouve toutes les formations concernées. */
    const personMap = {};
    PARTIES.forEach(p => { if (p.personName) (personMap[p.personName] = personMap[p.personName] || []).push(p.name); });
    const personDuplicates = Object.keys(personMap).filter(k => personMap[k].length > 1);

    const families = {};
    PARTIES.forEach(p => { if (p.family) families[p.family] = (families[p.family] || 0) + 1; });
    const distinctFamilies = Object.keys(families).length;

    /* Amplitude du spectre : sur chaque axe, l'écart entre la position la
       plus à gauche et la plus à droite parmi les formations codées. */
    const spread = DIM_KEYS.map(k => {
      const vals = PARTIES.map(p => p.positions[k]).filter(v => typeof v === 'number');
      const min = Math.min.apply(null, vals);
      const max = Math.max.apply(null, vals);
      return { dim: k, min, max, range: round1(max - min), covered: (max - min) >= 2, parties: vals.length };
    });
    const covered = spread.filter(s => s.covered).length;
    const spectrum = DIM_KEYS.length ? covered / DIM_KEYS.length : 0;

    /* Positions thématiques manquantes : une formation sans position sur un
       axe ne peut pas être comparée sur cet axe. */
    const missingPos = [];
    PARTIES.forEach(p => {
      DIM_KEYS.forEach(k => {
        if (typeof p.positions[k] !== 'number') missingPos.push({ party: p.name, short: p.short, dim: DIMENSIONS[k] ? DIMENSIONS[k].short || DIMENSIONS[k].name : k });
      });
    });

    const dupClasses = [dupIds.length, dupPersons.length, dupColors.length, dupShorts.length, dupCandidacy.length].filter(n => n > 0).length;
    /* Le nombre de doublons est CALCULÉ : il ne peut pas être écrit « 0 » en dur. */
    const totalDuplicates = dupIds.length + dupPersons.length + dupCandidacy.length + dupColors.length + dupShorts.length;
    const uniqueness = clampScore(100 - 20 * dupClasses);
    const diversity = PARTIES.length ? distinctFamilies / PARTIES.length : 0;
    const score = clampScore(0.45 * uniqueness + 0.35 * (spectrum * 100) + 0.20 * (diversity * 100));

    if (personDuplicates.length) {
      findings.push({
        level: 'error', axis: 'pluralism',
        title: 'Doublon de personnalité : ' + personDuplicates.join(', '),
        message: personDuplicates.map(k => k + ' est rattaché à ' + personMap[k].join(' et ')).join(' ; ') +
          '. Une même personne ne doit figurer que sous la formation qui la porte.'
      });
    }
    if (dupIds.length) {
      findings.push({ level: 'error', axis: 'pluralism', title: 'Identifiant de formation en double', message: dupIds.join(', ') });
    }
    if (dupCandidacy.length) {
      findings.push({
        level: 'error', axis: 'pluralism',
        title: 'Candidature rattachée à plusieurs formations',
        message: dupCandidacy.join(', ') + ' : une candidature unique ne peut pas être portée par deux formations.'
      });
    }
    if (dupColors.length) {
      findings.push({ level: 'warn', axis: 'pluralism', title: 'Couleur de formation en double', message: dupColors.join(', ') + ' : la distinction visuelle devient ambiguë.' });
    }
    if (dupShorts.length) {
      findings.push({ level: 'warn', axis: 'pluralism', title: 'Sigle en double', message: dupShorts.join(', ') });
    }
    if (!dupClasses) {
      findings.push({
        level: 'ok', axis: 'pluralism',
        title: 'Aucun doublon de parti, de personne, de couleur ni de candidature',
        message: PARTIES.length + ' formations, ' + distinctFamilies + ' sensibilités, chaque personne et chaque couleur n’apparaît qu’une fois.'
      });
    }
    if (covered < DIM_KEYS.length) {
      findings.push({
        level: 'warn', axis: 'pluralism',
        title: 'Spectre incomplet sur ' + (DIM_KEYS.length - covered) + ' axe(s)',
        message: spread.filter(s => !s.covered).map(s => s.dim + ' : amplitude ' + s.range).join(' ; ') + '.'
      });
    }
    if (missingPos.length) {
      findings.push({
        level: 'warn', axis: 'pluralism',
        title: missingPos.length + ' position(s) thématique(s) manquante(s)',
        message: 'Ces couples formation/axe ne sont pas comparables : ' +
          missingPos.map(m => m.short + '/' + m.dim).join(', ') + '.'
      });
    }

    return {
      key: 'pluralism',
      label: 'Pluralisme & absence de doublons',
      short: 'Pluralisme',
      score: score,
      summary: totalDuplicates + (totalDuplicates > 1 ? ' doublons' : ' doublon') + ' sur ' + PARTIES.length +
        ' formations ; ' + covered + ' / ' + DIM_KEYS.length +
        ' axes couverts par le spectre ; ' + distinctFamilies + ' sensibilités distinctes',
      metrics: [
        { label: 'Formations analysées', value: String(PARTIES.length) },
        { label: 'Doublons détectés', value: String(totalDuplicates) },
        { label: 'Sensibilités distinctes', value: distinctFamilies + ' / ' + PARTIES.length },
        { label: 'Axes couverts par le spectre', value: covered + ' / ' + DIM_KEYS.length },
        { label: 'Positions thématiques manquantes', value: String(missingPos.length) }
      ],
      detail: {
        duplicates: { ids: dupIds, personNames: personDuplicates, colors: dupColors, shorts: dupShorts, candidacyIds: dupCandidacy },
        spread: spread,
        missingPositions: missingPos
      }
    };
  }

  /* ----------------------------------------------------------------------
     5. INDÉPENDANCE À L'ORDRE DES QUESTIONS
     Test réellement exécuté : on construit des profils aléatoires, on
     calcule le classement, puis on recalcule le même classement avec la
     banque de départage inversée, mélangée, et avec les réponses réinsérées
     dans l'ordre inverse. Le classement doit être rigoureusement identique.
     ------------------------------------------------------------------- */
  function auditOrderIndependence(findings, profiles) {
    if (!Scoring) {
      findings.push({ level: 'error', axis: 'orderIndep', title: 'Moteur de calcul indisponible', message: 'scoring.js n’est pas chargé : l’audit d’indépendance ne peut pas être exécuté.' });
      return { key: 'orderIndep', label: 'Indépendance à l’ordre', short: 'Indépendance', score: 0, summary: 'Moteur indisponible', metrics: [], detail: {} };
    }
    const rng = rngFrom(20261021);
    let orderChanged = 0, valueChanged = 0, maxDelta = 0, noComparable = 0;
    const examples = [];

    for (let p = 0; p < profiles; p++) {
      const answers = randomOrientationAnswers(rng);
      const dpAnswers = randomDepartageAnswers(rng, 3 + Math.floor(rng() * 10));
      const dimResults = Scoring.computeDimensionResults(answers, QUESTIONS);

      const base = Scoring.computePartyMatches(dimResults, PARTIES, { departageAnswers: dpAnswers, departageBank: DEPARTAGE });
      if (!base.some(m => m.matchPercent !== null)) { noComparable++; continue; }
      const baseOrder = base.map(m => m.party.id).join('|');
      const baseVals = {};
      base.forEach(m => { baseVals[m.party.id] = m.matchPercent; });

      const reversedBank = DEPARTAGE.slice().reverse();
      const shuffledBank = shuffle(DEPARTAGE, rng);
      const reversedAnswers = {};
      Object.keys(dpAnswers).reverse().forEach(k => { reversedAnswers[k] = dpAnswers[k]; });

      const variants = [
        Scoring.computePartyMatches(dimResults, PARTIES, { departageAnswers: dpAnswers, departageBank: reversedBank }),
        Scoring.computePartyMatches(dimResults, PARTIES, { departageAnswers: dpAnswers, departageBank: shuffledBank }),
        Scoring.computePartyMatches(dimResults, PARTIES, { departageAnswers: reversedAnswers, departageBank: DEPARTAGE })
      ];

      let changed = false, vChanged = false, delta = 0;
      variants.forEach(v => {
        if (v.map(m => m.party.id).join('|') !== baseOrder) changed = true;
        v.forEach(m => {
          const b = baseVals[m.party.id];
          if (b === null || m.matchPercent === null) { if (b !== m.matchPercent) { changed = true; vChanged = true; } return; }
          const d = Math.abs(b - m.matchPercent);
          if (d > delta) delta = d;
          if (d > 1e-9) vChanged = true;
        });
      });
      if (changed) orderChanged++;
      if (vChanged) valueChanged++;
      if (delta > maxDelta) maxDelta = delta;
      if (changed && examples.length < 3) examples.push({ profile: p, order: baseOrder });
    }

    const comparable = profiles - noComparable;
    const score = comparable ? clampScore(100 * (1 - orderChanged / comparable)) : 0;
    const exactScore = comparable ? clampScore(100 * (1 - valueChanged / comparable)) : 0;
    const finalScore = clampScore(0.7 * score + 0.3 * exactScore);

    if (orderChanged > 0) {
      findings.push({
        level: 'error', axis: 'orderIndep',
        title: 'Le classement dépend de l’ordre des questions',
        message: orderChanged + ' profil(s) sur ' + comparable + ' donnent un classement différent quand l’ordre est inversé ou mélangé.'
      });
    } else {
      findings.push({
        level: 'ok', axis: 'orderIndep',
        title: 'Classement stable sur ' + comparable + ' profils aléatoires',
        message: 'Inverser, mélanger la banque de départage ou réinsérer les réponses dans l’ordre inverse ne change ni l’ordre des formations ni les pourcentages (écart maximal : ' + maxDelta.toExponential(1) + ').'
      });
    }
    if (maxDelta > 0 && maxDelta < 1e-9) {
      findings.push({
        level: 'ok', axis: 'orderIndep',
        title: 'Écart de calcul négligeable',
        message: 'L’ordre des additions flottantes produit un écart maximal de ' + maxDelta.toExponential(1) + ' point, très inférieur au point d’affichage.'
      });
    }

    return {
      key: 'orderIndep',
      label: 'Indépendance à l’ordre',
      short: 'Indépendance',
      score: finalScore,
      summary: comparable + ' profils testés, ' + orderChanged + ' classement(s) modifié(s) par un changement d’ordre ; écart maximal ' + maxDelta.toExponential(1),
      metrics: [
        { label: 'Profils aléatoires testés', value: String(comparable) },
        { label: 'Classements modifiés par l’ordre', value: String(orderChanged) },
        { label: 'Pourcentages modifiés', value: String(valueChanged) },
        { label: 'Écart maximal observé', value: maxDelta.toExponential(1) + ' point' }
      ],
      detail: { examples }
    };
  }

  /* ----------------------------------------------------------------------
     6. ÉQUITÉ DE DÉPARTAGE
     Une formation dont les positions concrètes sont trop rares ne doit pas
     recevoir de pourcentage précis. On applique exactement le seuil du
     moteur (Scoring.PARTIAL_COVERAGE) et on publie la liste des formations
     que le test refuse de classer.
     ------------------------------------------------------------------- */
  function auditCoverage(findings) {
    const total = DEPARTAGE.length;
    const threshold = Scoring ? Scoring.PARTIAL_COVERAGE : 0.5;
    const rows = PARTIES.map(p => {
      const coded = DEPARTAGE.filter(q => q.stances && typeof q.stances[p.id] === 'number').length;
      const ratio = total ? coded / total : 0;
      const partial = ratio < threshold;
      return {
        id: p.id, name: p.name, short: p.short, color: p.color, family: p.family,
        personName: p.personName, personRole: p.personRole,
        candidacyStatus: p.candidacyStatus || null,
        coded, total, coverage: ratio, partial,
        missing: DEPARTAGE.filter(q => !(q.stances && typeof q.stances[p.id] === 'number')).map(q => q.id)
      };
    });
    const comparable = rows.filter(r => !r.partial);
    const excluded = rows.filter(r => r.partial);
    const score = rows.length ? clampScore(100 * comparable.length / rows.length) : 0;

    /* Questions de départage où aucune formation n'a de position : inutiles. */
    const orphans = DEPARTAGE.filter(q => !PARTIES.some(p => q.stances && typeof q.stances[p.id] === 'number')).map(q => q.id);

    if (excluded.length) {
      findings.push({
        level: 'warn', axis: 'coverage',
        title: excluded.length + ' formation(s) non classables faute de positions documentées',
        message: excluded.map(r => r.short + ' (' + r.coded + '/' + r.total + ')').join(', ') +
          ' : en dessous de ' + Math.round(threshold * 100) + ' % de couverture, le test leur refuse un pourcentage de similitude.'
      });
    }
    if (orphans.length) {
      findings.push({
        level: 'error', axis: 'coverage',
        title: orphans.length + ' question(s) de départage sans aucune position',
        message: orphans.join(', ') + ' : ces questions ne départagent personne.'
      });
    }
    if (!excluded.length && !orphans.length) {
      findings.push({
        level: 'ok', axis: 'coverage',
        title: 'Toutes les formations sont classables',
        message: 'Chacune dépasse le seuil de ' + Math.round(threshold * 100) + ' % de positions documentées.'
      });
    }

    return {
      key: 'coverage',
      label: 'Équité de départage',
      short: 'Équité',
      score: score,
      summary: comparable.length + ' / ' + rows.length + ' formations comparables ; seuil appliqué : ' +
        Math.round(threshold * 100) + ' % de positions documentées',
      metrics: [
        { label: 'Formations comparables', value: comparable.length + ' / ' + rows.length },
        { label: 'Formations écartées', value: String(excluded.length) },
        { label: 'Questions sans position', value: String(orphans.length) },
        { label: 'Questions de départage', value: String(total) }
      ],
      detail: { parties: rows, threshold, orphanQuestions: orphans }
    };
  }

  /* ----------------------------------------------------------------------
     CONTRÔLES TRANSVERSAUX
     ------------------------------------------------------------------- */
  function auditConsistency(findings) {
    /* Candidatures déclarées : une candidature portée par deux formations
       serait un doublon ; une formation sans candidature est un simple
       encart, ce qui est légitime et doit être dit. */
    const byParty = {};
    CANDIDATURES.forEach(c => { if (c.partyId) (byParty[c.partyId] = byParty[c.partyId] || []).push(c.name); });
    const multi = Object.keys(byParty).filter(k => byParty[k].length > 1);
    if (multi.length) {
      findings.push({
        level: 'error', axis: 'pluralism',
        title: 'Formations portant plusieurs candidatures déclarées',
        message: multi.map(k => k + ' : ' + byParty[k].join(', ')).join(' ; ')
      });
    }
    /* Les scores de sondage doivent rester dans l'ordre de la moyenne. */
    const avg = (POLLS.averageFirstRound || []).filter(e => typeof e.score === 'number');
    const badRange = avg.filter(e => e.score < 0 || e.score > 60);
    if (badRange.length) {
      findings.push({
        level: 'error', axis: 'traceability',
        title: 'Score de sondage hors bornes',
        message: badRange.map(e => e.candidate + ' : ' + e.score + ' %').join(', ')
      });
    }
    const waves = POLLS.waves || [];
    const duels = POLLS.secondRoundDuels || [];
    const sumOk = waves.every(w => Array.isArray(w.results) && w.results.length > 0 && w.results.every(r => typeof r.score === 'number' && r.score >= 0 && r.score <= 60));
    if (!sumOk) {
      findings.push({ level: 'error', axis: 'traceability', title: 'Valeur de sondage incohérente dans une vague', message: 'Vérifier les résultats publiés.' });
    }
    const duelOk = duels.every(d => typeof d.candidateA.score === 'number' && typeof d.candidateB.score === 'number' && Math.abs(d.candidateA.score + d.candidateB.score - 100) < 0.51);
    if (!duelOk) {
      findings.push({ level: 'error', axis: 'traceability', title: 'Duels de second tour incohérents', message: 'Les deux scores d’un duel doivent additionner à 100.' });
    }
    /* Le calendrier ne doit pas avancer de date limite légale non vérifiée. */
    const cal = CALENDAR || [];
    const official = cal.filter(c => c.official === true);
    /* Le constat « cohérent » n'est affiché que si aucun contrôle de ce
       bloc n'a échoué : sinon on afficherait deux affirmations contradictoires. */
    if (!badRange.length && sumOk && duelOk && !multi.length) {
      findings.push({
        level: 'ok', axis: 'traceability',
        title: 'Données de campagne cohérentes',
        message: avg.length + ' intentions de vote, ' + waves.length + ' vagues de premier tour, ' + duels.length +
          ' duels de second tour, ' + CANDIDATURES.length + ' candidatures déclarées et ' + cal.length + ' jalons (' + official.length + ' à date fixée).'
      });
    }
    return { averageCount: avg.length, waveCount: waves.length, duelCount: duels.length, candidateCount: CANDIDATURES.length, calendarCount: cal.length };
  }

  /* ----------------------------------------------------------------------
     BANQUE D'ESSAI : MONTE-CARLO RÉEL
     On génère des profils citoyens aléatoires et on regarde quelle
     formation ressort. Un algorithme sain ne doit pas toujours faire gagner
     la même formation : on mesure donc la part de victoires, le nombre de
     quasi-égalités honnêtes et le nombre de profils sans vainqueur.
     ------------------------------------------------------------------- */
  function simulate(options) {
    const opts = options || {};
    const runs = opts.runs || 200;
    const rng = rngFrom(opts.seed || 424242);
    const wins = {};
    PARTIES.forEach(p => { wins[p.id] = 0; });
    let ties = 0, noWinner = 0, scored = 0;
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    for (let s = 0; s < runs; s++) {
      const answers = randomOrientationAnswers(rng);
      const dimResults = Scoring.computeDimensionResults(answers, QUESTIONS);
      const dpAnswers = randomDepartageAnswers(rng, 3 + Math.floor(rng() * 10));
      const ranked = Scoring.computePartyMatches(dimResults, PARTIES, { departageAnswers: dpAnswers })
        .filter(m => m.matchPercent !== null);
      if (!ranked.length) { noWinner++; continue; }
      scored++;
      wins[ranked[0].party.id] = (wins[ranked[0].party.id] || 0) + 1;
      if (ranked.length > 1 && (ranked[0].matchPercent - ranked[1].matchPercent) <= Scoring.NEAR_TIE_POINTS) ties++;
    }
    const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    const dist = PARTIES.map(p => ({ id: p.id, name: p.name, short: p.short, color: p.color, wins: wins[p.id] || 0, share: scored ? (wins[p.id] || 0) / scored : 0 }))
      .sort((a, b) => b.wins - a.wins);
    const topShare = dist.length ? dist[0].share : 0;
    const everWon = dist.filter(d => d.wins > 0).length;
    /* Formations que le moteur accepte de classer : seuil de couverture
       appliqué exactement comme dans Scoring.computePartyMatch. */
    const threshold = Scoring ? Scoring.PARTIAL_COVERAGE : 0.5;
    const eligible = PARTIES.filter(p => {
      const coded = DEPARTAGE.filter(q => q.stances && typeof q.stances[p.id] === 'number').length;
      return DEPARTAGE.length > 0 && (coded / DEPARTAGE.length) >= threshold;
    }).length;

    return {
      runs, scored, ties, noWinner,
      tieRate: scored ? ties / scored : 0,
      topShare, everWon, eligible,
      elapsedMs: Math.round(t1 - t0),
      distribution: dist
    };
  }

  /* ----------------------------------------------------------------------
     7. ERGONOMIE MESUREE (navigateur uniquement)
     Mesure reelle : largeur du document, largeur de la fenetre, et elements
     visibles qui depassent du cadre. Aucun resultat n'est invente : si le
     navigateur n'est pas disponible, la fonction renvoie null.
     ------------------------------------------------------------------- */
  function auditLayout() {
    if (isNode || typeof document === 'undefined' || typeof window === 'undefined') return null;
    const doc = document.documentElement;
    const viewport = window.innerWidth || doc.clientWidth;
    const scope = [];
    ['.screen.active', '.topbar', 'footer'].forEach(sel => {
      Array.prototype.forEach.call(document.querySelectorAll(sel), node => scope.push(node));
    });
    const offenders = [];
    const walk = node => {
      const children = node.children || [];
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (el.hasAttribute && el.hasAttribute('hidden')) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        if (style.overflowX === 'auto' || style.overflowX === 'scroll' || style.overflowX === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
          if (r.right > viewport + 1 || r.left < -1) {
            offenders.push({
              tag: el.tagName.toLowerCase(),
              cls: el.getAttribute('class') || '',
              left: Math.round(r.left),
              right: Math.round(r.right)
            });
          }
        }
        walk(el);
      }
    };
    scope.forEach(node => walk(node));
    return {
      viewport: viewport,
      documentWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflow: doc.scrollWidth > doc.clientWidth + 1,
      offenderCount: offenders.length,
      offenders: offenders.slice(0, 8)
    };
  }

  /* ----------------------------------------------------------------------
     AUDIT COMPLET
     ------------------------------------------------------------------- */
  function audit(options) {
    const opts = options || {};
    const seeds = opts.seeds || 120;
    const profiles = opts.profiles || 40;
    const findings = [];

    const axes = [
      auditBalance(findings),
      auditNeutrality(findings, seeds),
      auditTraceability(findings),
      auditPluralism(findings),
      auditOrderIndependence(findings, profiles),
      auditCoverage(findings)
    ];
    const consistency = auditConsistency(findings);

    /* Chaque axe prend le niveau du constat le plus grave qui le concerne :
       le statut affiché n'est donc jamais découplé des anomalies détectées. */
    axes.forEach(a => {
      const related = findings.filter(f => f.axis === a.key);
      a.level = related.length ? worstLevel(related.map(f => f.level)) : 'ok';
      a.findingCount = related.length;
    });

    let weighted = 0, weightSum = 0;
    axes.forEach(a => {
      const w = AXIS_WEIGHTS[a.key] || 0;
      weighted += a.score * w;
      weightSum += w;
    });
    const globalScore = weightSum ? round1(weighted / weightSum) : 0;

    const level = worstLevel(findings.map(f => f.level));
    const counts = {
      questions: QUESTIONS.length,
      departage: DEPARTAGE.length,
      parties: PARTIES.length,
      sources: SOURCES.length,
      themes: THEMES.length,
      candidates: CANDIDATURES.length,
      calendar: CALENDAR.length,
      dimensions: DIM_KEYS.length
    };

    return {
      generatedAt: new Date().toISOString(),
      score: globalScore,
      level: level,
      axes: axes,
      findings: findings,
      counts: counts,
      consistency: consistency,
      axisWeights: AXIS_WEIGHTS,
      simulation: simulate({ runs: opts.simRuns || 200, seed: 20261021 })
    };
  }

  const api = {
    AXIS_WEIGHTS,
    audit: audit,
    simulate: simulate,
    auditBalance: auditBalance,
    auditNeutrality: auditNeutrality,
    auditTraceability: auditTraceability,
    auditPluralism: auditPluralism,
    auditOrderIndependence: auditOrderIndependence,
    auditCoverage: auditCoverage,
    auditLayout: auditLayout
  };

  if (isNode) module.exports = api; else root.Radar = api;
})(typeof window !== 'undefined' ? window : this);
