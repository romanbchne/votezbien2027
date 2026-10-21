/* ============================================================================
   VOTEZ BIEN ! — scoring.js
   Moteur de calcul PUR : aucune référence au DOM, uniquement des fonctions
   qui prennent des données et renvoient des données. Cela permet de le
   tester automatiquement avec Node (voir tests/) et de garantir que le code
   testé est EXACTEMENT le code qui s’exécute dans l’application.

   Deux niveaux de preuve, jamais mélangés :
     1. les 21 questions générales → un score par thème (6), de -2 à +2 ;
     2. jusqu’à 15 questions de départage concrètes → une position précise sur
        des propositions, comparée à celle de chaque parti.
   ========================================================================= */

(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const D = isNode ? require('./data.js') : root;
  const { DIMENSIONS, DIM_KEYS, PARTIES } = D;
  const DEPARTAGE = D.DEPARTAGE || [];

  /* ---- Constantes, documentées et utilisées PARTOUT (une seule fois chacune) ---- */
  const LABEL_BANDS = [
    { max: -0.55, label: 'Plutôt à gauche', key: 'left' },
    { max: -0.20, label: 'Centre-gauche', key: 'center-left' },
    { max: 0.20, label: 'Plutôt au centre', key: 'center' },
    { max: 0.55, label: 'Centre-droit', key: 'center-right' },
    { max: Infinity, label: 'Plutôt à droite', key: 'right' }
  ];
  // Seuils sous lesquels le profil global est jugé insuffisamment déterminé
  // pour afficher une étiquette gauche/droite (jamais d'orientation fabriquée
  // à partir de réponses absentes).
  const MIN_ANSWERED_RATIO_FOR_LABEL = 0.30;
  const MIN_CONFIDENCE_FOR_LABEL = 0.15;

  // Priorités : la personne désigne au plus 3 thèmes. Chaque thème compte 1 ;
  // les priorités comptent davantage dans la comparaison aux partis. Aucun
  // autre poids caché : tous les autres thèmes comptent à égalité.
  const PRIORITY_BOOSTS = [2.0, 1.6, 1.3];
  const MAX_PRIORITIES = 3;

  // Questions de départage
  const QUESTION_WEIGHT = 1.0;        // poids d'une question de départage, avant boost de priorité
  const MAX_DEPARTAGE = 15;           // plafond annoncé à la personne
  const MIN_DEPARTAGE = 4;            // minimum avant arrêt anticipé
  const CLEAR_LEAD_POINTS = 15;       // un leader net arrête le test dès MIN_DEPARTAGE questions
  const SOFTMAX_BETA = 14;            // concentration de la probabilité « c'est ce parti » sur les premiers
  const SAME_DIM_DECAY = 0.8;         // chaque question déjà posée sur un thème vaut 20 % de moins
  const MAX_PER_GROUP = 2;            // jamais plus de 2 questions du même sujet (ex. défense)
  const MIN_QUESTIONS_FOR_QUESTION_MODE = 3; // à partir de 3 réponses, on compare sur les propositions
  const PARTIAL_COVERAGE = 0.5;       // en dessous, un parti est « comparé partiellement »
  const NEAR_TIE_POINTS = 6;          // sous cet écart, pas de « gagnant » déclaré

  /* ----------------------------------------------------------------------
     computeDimensionResults(answers, questionSet)
     answers: { [questionId]: number(-2..2) | 'dk' }  (valeur SÉMANTIQUE :
       -2 = proposition A du fichier de données, quel que soit l'ordre
       d'affichage — voir app.js et makeBalancedFlips).
     ------------------------------------------------------------------- */
  function computeDimensionResults(answers, questionSet) {
    const byDim = {};
    DIM_KEYS.forEach(k => { byDim[k] = { vals: [], dk: 0, total: 0 }; });
    questionSet.forEach(q => {
      const bucket = byDim[q.dim];
      if (!bucket) return;
      bucket.total++;
      const a = answers[q.id];
      if (typeof a === 'number') bucket.vals.push(a);
      else if (a === 'dk') bucket.dk++;
    });

    const out = {};
    DIM_KEYS.forEach(k => {
      const b = byDim[k];
      const n = b.vals.length;
      if (n === 0) {
        out[k] = { score: null, n: 0, nDK: b.dk, nTotal: b.total, coverage: 0, consistency: 0, clarity: 0, confidence: 0 };
        return;
      }
      const mean = b.vals.reduce((a, c) => a + c, 0) / n;
      const variance = b.vals.reduce((a, c) => a + (c - mean) * (c - mean), 0) / n;
      const stddev = Math.sqrt(variance);
      const MAX_STDDEV = 2; // écart-type maximal théorique sur une échelle -2..2
      const consistency = Math.max(0, 1 - stddev / MAX_STDDEV);
      const coverage = b.total > 0 ? n / b.total : 0;
      const dkPenalty = b.total > 0 ? (b.dk / b.total) * 0.3 : 0;
      // Une moyenne proche de 0 peut traduire une position réellement
      // modérée comme un mélange de positions fortes qui s'annulent : on
      // réduit donc (sans jamais annuler) la confiance près du centre.
      const clarity = 0.5 + 0.5 * (Math.abs(mean) / 2);
      const confidence = Math.max(0, Math.min(1, coverage * consistency * clarity - dkPenalty));
      out[k] = { score: mean, n, nDK: b.dk, nTotal: b.total, coverage, consistency, clarity, confidence };
    });
    return out;
  }

  /* ----------------------------------------------------------------------
     computeOverall(dimResults) — agrégat pondéré + détection de profil
     insuffisamment déterminé ou composite. C'est ICI, et SEULEMENT ici, que
     la convention négatif=gauche / positif=droite devient une étiquette.
     ------------------------------------------------------------------- */
  function computeOverall(dimResults) {
    let weightedSum = 0, weightUsed = 0, confSum = 0;
    let totalAnswered = 0, totalDK = 0, totalQuestions = 0;
    const dimScores = [];
    DIM_KEYS.forEach(k => {
      const d = dimResults[k];
      const w = DIMENSIONS[k].weight;
      confSum += (d.confidence || 0) * w;
      totalAnswered += d.n; totalDK += d.nDK; totalQuestions += d.nTotal;
      if (d.n > 0) { weightedSum += (d.score / 2) * w; weightUsed += w; dimScores.push(d.score); }
    });
    const score = weightUsed > 0 ? weightedSum / weightUsed : 0;
    const overallConfidence = confSum;
    const answeredRatio = totalQuestions > 0 ? totalAnswered / totalQuestions : 0;
    const determined = answeredRatio >= MIN_ANSWERED_RATIO_FOR_LABEL && overallConfidence >= MIN_CONFIDENCE_FOR_LABEL;
    const band = LABEL_BANDS.find(b => score <= b.max) || LABEL_BANDS[LABEL_BANDS.length - 1];
    const label = determined ? band.label : 'Profil non déterminé';
    // Dispersion entre thèmes : « tranché » sur chaque axe mais très
    // composite d'un axe à l'autre (ex. très à gauche sur l'économie, très à
    // droite sur l'autorité) → l'étiquette globale ne résume pas le profil.
    let composite = false;
    if (dimScores.length >= 2) {
      const m = dimScores.reduce((a, c) => a + c, 0) / dimScores.length;
      const v = dimScores.reduce((a, c) => a + (c - m) * (c - m), 0) / dimScores.length;
      composite = Math.sqrt(v) >= 1.15;
    }
    return { score, label, band: determined ? band.key : 'undetermined', determined, overallConfidence, answeredRatio, totalAnswered, totalDK, totalQuestions, composite };
  }

  /* ----------------------------------------------------------------------
     Priorités (remplacent la note d'importance par question, qui gonflait
     mécaniquement : « tout est essentiel »). L'importance ne modifie JAMAIS
     la position gauche-droite : elle ne pèse que dans la comparaison aux
     partis et dans le choix des questions de départage.
     ------------------------------------------------------------------- */
  function priorityMultipliers(priorities) {
    const m = {};
    DIM_KEYS.forEach(k => { m[k] = 1; });
    (priorities || []).slice(0, MAX_PRIORITIES).forEach((k, i) => { if (m[k] !== undefined) m[k] = PRIORITY_BOOSTS[i]; });
    return m;
  }

  /* ----------------------------------------------------------------------
     Questions de départage : proximité, libellés
     ------------------------------------------------------------------- */
  function optionRange(q) { return Math.max(1, q.options.length - 1); }

  function stanceProximity(q, userPos, partyPos) {
    return 1 - Math.min(1, Math.abs(userPos - partyPos) / optionRange(q));
  }

  // Libellé lisible d'une position (un parti peut se situer « entre » deux options).
  function stanceLabel(q, pos) {
    if (typeof pos !== 'number') return { label: 'Position non codée', exact: false, known: false };
    const opt = p => q.options.find(o => o.pos === p);
    const r = Math.round(pos), lo = Math.floor(pos), hi = Math.ceil(pos);
    if (Math.abs(pos - r) <= 0.25 || lo === hi) return { label: opt(r).short, exact: true, known: true };
    return { label: 'Entre « ' + opt(lo).short + ' » et « ' + opt(hi).short + ' »', exact: false, known: true };
  }

  // Mêmes paliers que pour les thèmes, ramenés à l'échelle propre à la question.
  function proximityCategory(distance) {
    if (distance <= 0.75) return { key: 'proche', label: 'Proche' };
    if (distance <= 1.5) return { key: 'assez-proche', label: 'Assez proche' };
    if (distance <= 2.75) return { key: 'eloigne', label: 'Éloigné' };
    return { key: 'tres-eloigne', label: 'Très éloigné' };
  }
  function questionCategory(proximity) { return proximityCategory((1 - proximity) * 4); }

  /* ----------------------------------------------------------------------
     computePartyMatch — comparaison d'un parti à la personne.
       opts.priorities        : thèmes prioritaires (ordonnés, 3 max)
       opts.departageAnswers  : { [idQuestionDépartage]: position | 'dk' }
       opts.departageBank     : banque de départage (défaut : DEPARTAGE)
     Règles qui ne changent jamais :
       - une dimension non répondue par la personne est EXCLUE, jamais lue
         comme un désaccord ;
       - une position de parti non codée (absente / null) est EXCLUE, jamais
         lue comme « au milieu » ;
       - tous les thèmes comptent à égalité, sauf les priorités déclarées.
     ------------------------------------------------------------------- */
  function computePartyMatch(dimResults, party, opts) {
    opts = opts || {};
    const mult = priorityMultipliers(opts.priorities);
    const bank = opts.departageBank || DEPARTAGE;
    const dpAnswers = opts.departageAnswers || {};
    const bankById = {}; bank.forEach(q => { bankById[q.id] = q; });

    const perDim = DIM_KEYS.map(k => {
      const d = dimResults[k];
      const partyScore = party.positions[k];
      const partyKnown = typeof partyScore === 'number';
      if (!d || d.n === 0) {
        return { dim: k, available: false, reason: 'user-missing', partyKnown, userScore: null, partyScore: partyKnown ? partyScore : null, distance: null, category: { key: 'non-renseigne', label: 'Non renseigné' }, rapprochement: null };
      }
      if (!partyKnown) {
        return { dim: k, available: false, reason: 'party-unknown', partyKnown: false, userScore: d.score, partyScore: null, distance: null, category: { key: 'non-renseigne', label: 'Non comparable' }, rapprochement: null };
      }
      const distance = Math.abs(d.score - partyScore);
      return { dim: k, available: true, reason: null, partyKnown: true, userScore: d.score, partyScore, distance, category: proximityCategory(distance), rapprochement: distance <= 1.5, weight: mult[k] };
    });

    const perQuestion = Object.keys(dpAnswers).filter(id => bankById[id]).map(id => {
      const q = bankById[id];
      const ans = dpAnswers[id];
      const st = q.stances ? q.stances[party.id] : undefined;
      const known = typeof st === 'number';
      if (ans === 'dk' || typeof ans !== 'number') {
        return { id, q, available: false, reason: 'user-missing', userPos: null, partyPos: known ? st : null };
      }
      if (!known) return { id, q, available: false, reason: 'party-unknown', userPos: ans, partyPos: null };
      const proximity = stanceProximity(q, ans, st);
      return { id, q, available: true, reason: null, userPos: ans, partyPos: st, proximity, category: questionCategory(proximity), weight: mult[q.dim] * QUESTION_WEIGHT };
    });

    const comparable = perDim.filter(p => p.available);
    const qComparable = perQuestion.filter(p => p.available);
    const rapprochements = comparable.filter(p => p.rapprochement).length;
    const partyKnownCount = perDim.filter(p => p.partyKnown).length;

    let dimSum = 0, dimW = 0, qSum = 0, qW = 0;
    comparable.forEach(p => { dimSum += (1 - p.distance / 4) * p.weight; dimW += p.weight; });
    qComparable.forEach(p => { qSum += p.proximity * p.weight; qW += p.weight; });
    const themeScore = dimW > 0 ? dimSum / dimW : 0;
    const sortScore = (dimW + qW) > 0 ? (dimSum + qSum) / (dimW + qW) : 0;

    // Équité de la comparaison : dès que la personne a répondu à quelques
    // questions de départage, tous les partis doivent être jugés sur la même
    // base. Un parti dont on ne code presque aucune position sur ces
    // questions n'est plus classé (il garderait sinon son score de thèmes,
    // bien plus indulgent que celui des partis réellement confrontés aux
    // propositions) : il est « comparé partiellement ».
    const totalBankQuestions = bank.length;
    const partyBankStancesCount = bank.filter(q => q.stances && typeof q.stances[party.id] === 'number').length;
    const totalDpAttempted = Object.keys(dpAnswers).filter(id => bankById[id]).length;
    const answeredQs = Object.keys(dpAnswers).filter(id => bankById[id] && typeof dpAnswers[id] === 'number');
    const covered = answeredQs.filter(id => bankById[id].stances && typeof bankById[id].stances[party.id] === 'number').length;
    const questionMode = answeredQs.length >= MIN_QUESTIONS_FOR_QUESTION_MODE;
    const precisionPhaseEngaged = totalDpAttempted >= MIN_QUESTIONS_FOR_QUESTION_MODE;
    const questionCoverage = answeredQs.length ? covered / answeredQs.length : (totalBankQuestions ? partyBankStancesCount / totalBankQuestions : 1);
    const partial = (questionMode && questionCoverage < PARTIAL_COVERAGE) || (precisionPhaseEngaged && partyBankStancesCount < 3);

    const dataCoverage = {
      themeKnown: partyKnownCount,
      totalThemes: DIM_KEYS.length,
      precisionKnown: partyBankStancesCount,
      totalPrecisionBank: totalBankQuestions,
      comparedThemes: comparable.length,
      comparedQuestions: qComparable.length,
      level: (partyKnownCount >= 5 && partyBankStancesCount >= 10) ? 'complete' : (partyKnownCount >= 4 && partyBankStancesCount >= 3) ? 'moyenne' : 'faible',
      label: (partyKnownCount >= 5 && partyBankStancesCount >= 10) ? 'Données complètes' : (partyKnownCount >= 4 && partyBankStancesCount >= 3) ? 'Données moyennes' : 'Données partielles'
    };

    const dimsOk = comparable.length >= 3;
    const matchPercent = (dimsOk && !partial) ? Math.round(sortScore * 100) : null;
    const themePercent = dimsOk ? Math.round(themeScore * 100) : null;

    return {
      party, perDim, perQuestion,
      comparableCount: comparable.length, partyKnownCount, rapprochements,
      questionComparableCount: qComparable.length,
      questionCloseCount: qComparable.filter(p => p.category.key === 'proche' || p.category.key === 'assez-proche').length,
      questionCoverage, questionAnsweredCount: answeredQs.length, partial,
      dataCoverage,
      sortScore, themeScore, matchPercent, themePercent
    };
  }

  function computePartyMatches(dimResults, parties, opts) {
    const group = m => m.matchPercent !== null ? 0 : (m.partial && m.themePercent !== null ? 1 : 2);
    return (parties || PARTIES)
      .map(p => computePartyMatch(dimResults, p, opts))
      .sort((a, b) => {
        const ga = group(a), gb = group(b);
        if (ga !== gb) return ga - gb;
        if (ga === 0) return (b.matchPercent - a.matchPercent) || (b.sortScore - a.sortScore);
        if (ga === 1) return b.themePercent - a.themePercent;
        return 0;
      });
  }

  /* Quasi-égalité en tête. Sous cet écart (en points), la différence entre
     deux partis est plus petite que l'incertitude des estimations : désigner
     un « gagnant » serait une fausse précision. */
  function findNearTie(matches) {
    const withPct = matches.filter(m => m.matchPercent !== null);
    if (withPct.length >= 2 && (withPct[0].matchPercent - withPct[1].matchPercent) <= NEAR_TIE_POINTS) return [withPct[0], withPct[1]];
    return null;
  }

  /* ----------------------------------------------------------------------
     selectNextDepartage — choisit LA PROCHAINE question de départage, en
     tenant compte de toutes les réponses déjà données. Principe : cibler
     l'incertitude entre PARTIS, pas entre gauche et droite.
       1. on estime, pour chaque parti en course, la probabilité que ce soit
          le plus proche (softmax sur les scores actuels) ;
       2. une question vaut d'autant plus qu'elle sépare des partis encore
          probables (somme, sur les paires, de p_i · p_j · écart de leurs
          positions codées) ;
       3. on pondère par les priorités de la personne, on décote les thèmes
          déjà beaucoup interrogés et on plafonne les sujets voisins.
     Arrêt anticipé : dès MIN_DEPARTAGE réponses, si un parti mène de
     CLEAR_LEAD_POINTS ou plus, il n'y a plus rien à départager.
     Ce choix ne garantit AUCUN écart final : il ne fait que poser des
     questions neutres, déjà écrites, là où elles ont une chance de
     distinguer des partis réellement proches.
     ------------------------------------------------------------------- */
  function selectNextDepartage(args) {
    const dimResults = args.dimResults;
    const parties = args.parties || PARTIES;
    const bank = args.bank || DEPARTAGE;
    const answers = args.answers || {};
    const priorities = args.priorities || [];
    const maxQ = args.maxQuestions || MAX_DEPARTAGE;
    const minQ = args.minQuestions || MIN_DEPARTAGE;

    const askedIds = Object.keys(answers);
    if (askedIds.length >= maxQ) return null;

    const matches = computePartyMatches(dimResults, parties, { priorities, departageAnswers: answers, departageBank: bank });
    let pool = matches.filter(m => m.matchPercent !== null);
    if (askedIds.length >= minQ && pool.length >= 2 && (pool[0].matchPercent - pool[1].matchPercent) >= CLEAR_LEAD_POINTS) return null;
    // Repli (aucun parti comparable : profil non déterminé) : on départage
    // entre tous les partis suffisamment codés, à probabilités égales.
    if (pool.length < 2) pool = matches.filter(m => m.partyKnownCount >= 3 && !m.partial);
    if (pool.length < 2) return null;

    const maxS = Math.max.apply(null, pool.map(m => m.sortScore));
    const w = pool.map(m => Math.exp(SOFTMAX_BETA * (m.sortScore - maxS)));
    const total = w.reduce((a, b) => a + b, 0);
    const prob = {}; pool.forEach((m, i) => { prob[m.party.id] = w[i] / total; });

    const mult = priorityMultipliers(priorities);
    const dimCount = {}, groupCount = {};
    bank.filter(q => askedIds.indexOf(q.id) !== -1).forEach(q => {
      dimCount[q.dim] = (dimCount[q.dim] || 0) + 1;
      if (q.group) groupCount[q.group] = (groupCount[q.group] || 0) + 1;
    });

    let best = null;
    bank.forEach(q => {
      if (askedIds.indexOf(q.id) !== -1) return;
      if (q.group && (groupCount[q.group] || 0) >= MAX_PER_GROUP) return;
      const range = optionRange(q);
      let v = 0;
      for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
          const a = q.stances[pool[i].party.id], b = q.stances[pool[j].party.id];
          if (typeof a === 'number' && typeof b === 'number') {
            v += prob[pool[i].party.id] * prob[pool[j].party.id] * Math.min(1, Math.abs(a - b) / range);
          }
        }
      }
      v *= mult[q.dim] * Math.pow(SAME_DIM_DECAY, dimCount[q.dim] || 0);
      if (!best || v > best.v + 1e-12) best = { q, v };
    });
    if (!best) return null;
    if (best.v <= 0 && askedIds.length >= minQ) return null;
    return best.q;
  }

  /* ----------------------------------------------------------------------
     Ordre d'affichage aléatoire — sans jamais modifier le résultat.
     L'ordre n'est QU'UNE présentation : la valeur enregistrée reste liée au
     TEXTE choisi (app.js la convertit avec le drapeau `flip`), jamais à sa
     position à l'écran. (La V5.1 randomisait l'ordre sans le faire suivre
     aux boutons de réponse : c'était un bug de données, pas d'affichage.)
     ------------------------------------------------------------------- */
  function seededRandom(seed) { // mulberry32 : déterministe, pour les tests
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffleInPlace(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function longestRun(arr) {
    let best = 0, run = 0, prev;
    arr.forEach((v, i) => { run = (i > 0 && v === prev) ? run + 1 : 1; prev = v; if (run > best) best = run; });
    return best;
  }

  // Pour chaque thème, autant de questions « inversées » que non inversées
  // (à une près) : un éventuel réflexe de cliquer toujours le premier choix
  // s'annule dans chaque thème. Et jamais plus de `maxRun` fois de suite le
  // même sens, pour qu'aucun motif ne soit repérable.
  function makeBalancedFlips(questions, rng, maxRun) {
    rng = rng || Math.random; maxRun = maxRun || 3;
    let chosen = null;
    for (let attempt = 0; attempt < 300 && !chosen; attempt++) {
      const arr = new Array(questions.length);
      const byDim = {};
      questions.forEach((q, i) => { (byDim[q.dim] = byDim[q.dim] || []).push(i); });
      Object.keys(byDim).forEach(dim => {
        const idxs = byDim[dim], k = idxs.length;
        const trues = Math.floor(k / 2) + ((k % 2 === 1 && rng() < 0.5) ? 1 : 0);
        const flags = []; for (let t = 0; t < k; t++) flags.push(t < trues);
        shuffleInPlace(flags, rng);
        idxs.forEach((idx, t) => { arr[idx] = flags[t]; });
      });
      if (longestRun(arr) <= maxRun) chosen = arr;
      else if (attempt === 299) chosen = arr; // repli : on ne bloque jamais le test
    }
    const flips = {};
    questions.forEach((q, i) => { flips[q.id] = chosen[i]; });
    return flips;
  }

  // Ordre d'affichage des options d'une question de départage : permutation
  // aléatoire, jamais strictement croissante ni décroissante (sinon l'ordre
  // « du plus radical au plus modéré » se devinerait vite).
  function makeOptionOrder(n, rng) {
    rng = rng || Math.random;
    let order = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      order = shuffleInPlace(Array.from({ length: n }, (_, i) => i), rng);
      if (n < 3) break;
      const asc = order.every((v, i) => v === i), desc = order.every((v, i) => v === n - 1 - i);
      if (!asc && !desc) break;
    }
    return order;
  }

  /* ----------------------------------------------------------------------
     computeCandidacyMatches(partyMatches) — regroupe les partis par
     candidat unique (ex. Glucksmann = PS + Place publique après primaire).
     ------------------------------------------------------------------- */
  function computeCandidacyMatches(partyMatches) {
    const list = [];
    const seen = new Set();
    partyMatches.forEach(m => {
      const cid = m.party.jointCandidacyId || m.party.id;
      if (seen.has(cid)) return;
      seen.add(cid);
      if (m.party.jointCandidacyId) {
        const partners = partyMatches.filter(x => x.party.jointCandidacyId === cid);
        partners.sort((a, b) => ((b.matchPercent !== null ? b.matchPercent : -1) - (a.matchPercent !== null ? a.matchPercent : -1)) || (b.sortScore - a.sortScore));
        const lead = partners[0];
        list.push({
          isJointCandidacy: true,
          candidacyId: cid,
          candidateName: lead.party.personName,
          candidateRole: lead.party.personRole,
          portraitFile: lead.party.portraitFile,
          color: lead.party.color,
          leadMatch: lead,
          partyMatches: partners,
          jointLabel: lead.party.jointCandidacyLabel || partners.map(p => p.party.name).join(' · '),
          matchPercent: lead.matchPercent,
          themePercent: lead.themePercent,
          sortScore: lead.sortScore,
          partial: lead.partial,
          dataCoverage: lead.dataCoverage
        });
      } else {
        list.push({
          isJointCandidacy: false,
          candidacyId: cid,
          candidateName: m.party.personName,
          candidateRole: m.party.personRole,
          portraitFile: m.party.portraitFile,
          color: m.party.color,
          leadMatch: m,
          partyMatches: [m],
          jointLabel: m.party.name,
          matchPercent: m.matchPercent,
          themePercent: m.themePercent,
          sortScore: m.sortScore,
          partial: m.partial,
          dataCoverage: m.dataCoverage
        });
      }
    });
    return list;
  }

  const api = {
    LABEL_BANDS, MIN_ANSWERED_RATIO_FOR_LABEL, MIN_CONFIDENCE_FOR_LABEL,
    PRIORITY_BOOSTS, MAX_PRIORITIES, MAX_DEPARTAGE, MIN_DEPARTAGE, CLEAR_LEAD_POINTS,
    MAX_PER_GROUP, PARTIAL_COVERAGE, NEAR_TIE_POINTS,
    computeDimensionResults, computeOverall, priorityMultipliers,
    optionRange, stanceProximity, stanceLabel, proximityCategory, questionCategory,
    computePartyMatch, computePartyMatches, computeCandidacyMatches, findNearTie, selectNextDepartage,
    seededRandom, makeBalancedFlips, makeOptionOrder
  };

  if (isNode) module.exports = api; else root.Scoring = api;
})(typeof window !== 'undefined' ? window : this);

