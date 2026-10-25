/* Suite du moteur et des données (sans DOM). Exécuter : node tests.js */
const assert = require('assert');
const { D, S, runner } = require('./helpers.js');
const { DIMENSIONS, DIM_KEYS, QUESTIONS, DEPARTAGE, PARTIES, SOURCES } = D;
const T = runner('Moteur et données');
const { section, test } = T;

function dimAll(score, n) { const r = {}; DIM_KEYS.forEach(k => { r[k] = { score, n: n || 3, nDK: 0, nTotal: n || 3, confidence: 1 }; }); return r; }
function answerAll(v) { const a = {}; QUESTIONS.forEach(q => { a[q.id] = v; }); return a; }
const P = id => PARTIES.find(p => p.id === id);
function nearestPos(q, partyId) { const t = q.stances[partyId]; return typeof t === 'number' ? q.options.reduce((b, o) => Math.abs(o.pos - t) < Math.abs(b.pos - t) ? o : b).pos : 'dk'; }

/* ===================== TESTS A à J (position, jamais l'importance) ===================== */
section('TEST A — toutes les réponses très à gauche (-2 partout)');
{
  const dr = S.computeDimensionResults(answerAll(-2), QUESTIONS), o = S.computeOverall(dr);
  test('jamais « Plutôt à droite » ni « Centre-droit »', () => { assert.notStrictEqual(o.label, 'Plutôt à droite'); assert.notStrictEqual(o.label, 'Centre-droit'); });
  test('étiquette « Plutôt à gauche », score < -0,9', () => { assert.strictEqual(o.label, 'Plutôt à gauche'); assert.ok(o.score < -0.9); });
  test('chaque thème vaut exactement -2 (aucune polarité inversée)', () => DIM_KEYS.forEach(k => assert.strictEqual(dr[k].score, -2, k)));
}
section('TEST B — toutes les réponses très à droite (+2 partout)');
{
  const dr = S.computeDimensionResults(answerAll(2), QUESTIONS), o = S.computeOverall(dr);
  test('étiquette « Plutôt à droite », score > 0,9', () => { assert.strictEqual(o.label, 'Plutôt à droite'); assert.ok(o.score > 0.9); });
  test('chaque thème vaut exactement +2', () => DIM_KEYS.forEach(k => assert.strictEqual(dr[k].score, 2, k)));
}
section('TEST C — toutes les réponses « entre les deux »');
{
  const o = S.computeOverall(S.computeDimensionResults(answerAll(0), QUESTIONS));
  test('« Plutôt au centre », score ≈ 0, profil déterminé', () => { assert.strictEqual(o.label, 'Plutôt au centre'); assert.ok(Math.abs(o.score) < 0.05); assert.strictEqual(o.determined, true); });
  test('un centre cohérent n’est pas une absence de données (confiance > seuil)', () => assert.ok(o.overallConfidence > S.MIN_CONFIDENCE_FOR_LABEL));
}
section('TEST D — gauche sur l’économie, droite sur l’autorité');
{
  const a = {}; QUESTIONS.forEach(q => { a[q.id] = q.dim === 'eco' ? -2 : q.dim === 'auth' ? 2 : 0; });
  const dr = S.computeDimensionResults(a, QUESTIONS), o = S.computeOverall(dr);
  test('thèmes bien orientés, profil composite, étiquette non extrême', () => {
    assert.strictEqual(dr.eco.score, -2); assert.strictEqual(dr.auth.score, 2);
    assert.strictEqual(o.composite, true); assert.ok(o.score > -0.55 && o.score < 0.55);
  });
}
section('TEST E–H — les priorités ne modifient JAMAIS la position gauche-droite');
{
  const dr = S.computeDimensionResults(answerAll(-2), QUESTIONS);
  const before = S.computeOverall(dr);
  const matchesNone = S.computePartyMatches(dr, PARTIES, { priorities: [] });
  const matchesPrio = S.computePartyMatches(dr, PARTIES, { priorities: ['ecology', 'eco', 'soc'] });
  const after = S.computeOverall(dr);
  test('l’étiquette et le score globaux sont identiques avec ou sans priorités', () => { assert.strictEqual(before.label, after.label); assert.strictEqual(before.score, after.score); });
  test('les priorités ne changent pas les scores de thème (dimResults non touché)', () => DIM_KEYS.forEach(k => assert.strictEqual(dr[k].score, -2)));
  test('en revanche elles modifient bien le poids dans la comparaison aux partis', () => {
    assert.ok(matchesNone.some(m => m.sortScore !== matchesPrio.find(x => x.party.id === m.party.id).sortScore));
  });
  test('priorityMultipliers : 2,0 / 1,6 / 1,3 pour les trois premiers, 1 pour tous les autres', () => {
    const m = S.priorityMultipliers(['ecology', 'eco', 'soc', 'auth']);
    assert.deepStrictEqual([m.ecology, m.eco, m.soc, m.auth, m.europe, m.immig], [2.0, 1.6, 1.3, 1, 1, 1]);
  });
  test('une priorité inconnue est ignorée ; aucune priorité = poids égaux', () => {
    const m = S.priorityMultipliers(['inconnue']); DIM_KEYS.forEach(k => assert.strictEqual(m[k], 1));
  });
}
section('TEST I — « je ne sais pas » partout');
{
  const a = {}; QUESTIONS.forEach(q => { a[q.id] = 'dk'; });
  const o = S.computeOverall(S.computeDimensionResults(a, QUESTIONS));
  test('profil explicitement non déterminé, sans « gauche », « droite » ni « centre »', () => {
    assert.strictEqual(o.determined, false); assert.strictEqual(o.label, 'Profil non déterminé'); assert.ok(!/gauche|droite|centre/i.test(o.label));
  });
}
section('TEST J — réponses contradictoires au sein de chaque thème');
{
  const a = {}; QUESTIONS.forEach((q, i) => { a[q.id] = i % 2 === 0 ? -2 : 2; });
  const dr = S.computeDimensionResults(a, QUESTIONS), o = S.computeOverall(dr);
  test('confiance basse sur chaque thème touché et globalement (incohérence détectée, pas masquée)', () => {
    DIM_KEYS.forEach(k => assert.ok(dr[k].confidence < 0.35, k)); assert.ok(o.overallConfidence < 0.35);
  });
  test('le profil « composite » (thèmes opposés entre eux) reste un signal distinct', () => assert.strictEqual(o.composite, false));
}

/* ===================== Intégrité des données ===================== */
section('Intégrité des données');
const camps = new Set(PARTIES.map(p => p.id));
test('6 thèmes, poids somment à 1 ; 22 questions d’orientation ; 16 partis', () => {
  assert.strictEqual(DIM_KEYS.length, 6); assert.ok(Math.abs(DIM_KEYS.reduce((a, k) => a + DIMENSIONS[k].weight, 0) - 1) < 1e-9);
  assert.strictEqual(QUESTIONS.length, 22); assert.strictEqual(PARTIES.length, 16);
});
test('chaque position de parti par thème est un nombre dans [-2, 2] ou un null explicite', () => {
  PARTIES.forEach(p => DIM_KEYS.forEach(k => { assert.ok(k in p.positions, p.id + '.' + k); const v = p.positions[k]; assert.ok(v === null || (typeof v === 'number' && v >= -2 && v <= 2), p.id + '.' + k); }));
});
test('les seuls null de thème sont ceux documentés (LO sur l’Europe, UPR hors Europe)', () => {
  const nulls = []; PARTIES.forEach(p => DIM_KEYS.forEach(k => { if (p.positions[k] === null) nulls.push(p.id + '.' + k); }));
  assert.deepStrictEqual(nulls.sort(), ['lo.europe', 'upr.auth', 'upr.eco', 'upr.ecology', 'upr.immig', 'upr.soc'].sort());
});
test('identifiants de questions uniques et valides (22 générales + départage)', () => {
  const ids = QUESTIONS.concat(DEPARTAGE).map(q => q.id); assert.strictEqual(new Set(ids).size, ids.length);
  QUESTIONS.concat(DEPARTAGE).forEach(q => assert.ok(DIM_KEYS.includes(q.dim), q.id));
});
test('les 22 questions ont deux propositions et une explication ; « plain » sans apostrophe droite', () => {
  QUESTIONS.forEach(q => { assert.ok(q.a && q.b && q.why, q.id); if (q.plain) assert.ok(!q.plain.includes("'"), q.id); });
  DIM_KEYS.forEach(k => assert.ok(DIMENSIONS[k].plain && DIMENSIONS[k].plain.length > 20, k));
});

section('Banque de départage : structure et neutralité');
test('au moins 20 questions, identifiants « dp- » uniques, chacune avec un sujet, un énoncé, un « en clair », un groupe', () => {
  assert.ok(DEPARTAGE.length >= 20);
  DEPARTAGE.forEach(q => { assert.ok(/^dp-/.test(q.id), q.id); assert.ok(q.topic && q.q && q.plain && q.group && q.basis, q.id); });
});
test('2 à 4 options par question, positions 0…n-1 dans l’ordre, avec libellé court et texte', () => {
  DEPARTAGE.forEach(q => {
    assert.ok(q.options.length >= 2 && q.options.length <= 4, q.id);
    q.options.forEach((o, i) => { assert.strictEqual(o.pos, i, q.id); assert.ok(o.short && o.text, q.id); });
  });
});
test('chaque position de parti est un nombre dans l’échelle de la question, d’un parti existant ; au moins 7 partis codés (une position non codée vaut mieux qu’une position devinée)', () => {
  DEPARTAGE.forEach(q => {
    const ids = Object.keys(q.stances); assert.ok(ids.length >= 7, q.id + ' : ' + ids.length + ' partis codés');
    ids.forEach(id => { assert.ok(camps.has(id), q.id + ' : parti inconnu ' + id); const v = q.stances[id]; assert.ok(typeof v === 'number' && v >= 0 && v <= q.options.length - 1, q.id + '.' + id); });
  });
});
test('aucun nom de parti ni de candidat dans les énoncés et options (questions à l’aveugle)', () => {
  const bad = [];
  const names = PARTIES.map(p => p.name).concat(['Mélenchon', 'Le Pen', 'Retailleau', 'Attal', 'Faure', 'Glucksmann', 'Tondelier', 'Roussel', 'Zemmour', 'Bardella', 'Philippe', 'Macron', 'Insoumise', 'Rassemblement', 'Reconquête']);
  const shorts = PARTIES.map(p => p.short).filter(s => s.length >= 2);
  DEPARTAGE.forEach(q => {
    const txt = [q.q, q.plain].concat(q.options.map(o => o.text + ' ' + o.short)).join(' | ');
    names.forEach(n => { if (txt.includes(n)) bad.push(q.id + ':' + n); });
    shorts.forEach(s => { if (new RegExp('\\b' + s + '\\b').test(txt)) bad.push(q.id + ':' + s); });
  });
  assert.deepStrictEqual(bad, []);
});
test('aucune apostrophe droite qui casserait une chaîne (texte, court, énoncé, en clair)', () => {
  DEPARTAGE.forEach(q => [q.q, q.plain, q.basis].concat(q.options.map(o => o.text + o.short)).forEach(t => assert.ok(!t.includes("'"), q.id)));
});
test('SOURCES : adresses https valides, au moins 8', () => {
  assert.ok(SOURCES.length >= 8); SOURCES.forEach(s => { assert.ok(s.label && /^https:\/\//.test(s.url), s.label); });
});

// Couples de partis susceptibles de rester proches l'un de l'autre : la banque existe pour les départager.
const RIVAL_PAIRS = [
  ['lfi', 'ecolo'], ['lfi', 'pcf'], ['lfi', 'pp'], ['ecolo', 'pp'], ['pcf', 'ecolo'], ['pcf', 'pp'],
  ['renaissance', 'horizons'], ['renaissance', 'pp'], ['renaissance', 'lr'], ['horizons', 'lr'],
  ['lr', 'rn'], ['lr', 'reconquete'], ['rn', 'reconquete'], ['rn', 'dlf'], ['lr', 'dlf'],
  ['pp', 'udi'], ['ecolo', 'udi'], ['pcf', 'udi']
];
test('les options ne sont pas rangées « de gauche à droite » : chaque question sépare au moins un couple de rivaux plausibles', () => {
  DEPARTAGE.forEach(q => {
    const sep = RIVAL_PAIRS.some(([a, b]) => typeof q.stances[a] === 'number' && typeof q.stances[b] === 'number' && Math.abs(q.stances[a] - q.stances[b]) / (q.options.length - 1) >= 0.33);
    assert.ok(sep, q.id + ' ne sépare aucun couple de rivaux plausibles');
  });
});

section('Banque de départage : capacité à départager les paires proches');
{
  const sepCount = (a, b) => DEPARTAGE.filter(q => typeof q.stances[a] === 'number' && typeof q.stances[b] === 'number' && Math.abs(q.stances[a] - q.stances[b]) / (q.options.length - 1) >= 0.33).length;
  RIVAL_PAIRS.forEach(([a, b]) => test(P(a).short + ' – ' + P(b).short + ' : au moins 3 questions les séparent', () => assert.ok(sepCount(a, b) >= 3, sepCount(a, b) + ' seulement')));
  test('Écologistes – PP (l’exemple demandé) : au moins 5 questions les séparent', () => assert.ok(sepCount('ecolo', 'pp') >= 5));
}

/* ===================== Comparaison aux partis ===================== */
section('Comparaison aux partis');
{
  const rn = P('rn'), lfi = P('lfi'), lo = P('lo');
  const mirror = {}; DIM_KEYS.forEach(k => { mirror[k] = { score: rn.positions[k], n: 3, nDK: 0, nTotal: 3, confidence: 1 }; });
  test('un profil qui recopie un parti obtient 100 % et 6/6 rapprochements avec lui', () => {
    const m = S.computePartyMatch(mirror, rn); assert.strictEqual(m.matchPercent, 100); assert.strictEqual(m.rapprochements, 6);
  });
  test('… et nettement moins avec un parti opposé', () => assert.ok(S.computePartyMatch(mirror, lfi).matchPercent < 70));
  test('une dimension sans réponse est exclue (« non renseigné »), jamais comptée comme un désaccord', () => {
    const part = Object.assign({}, mirror, { ecology: { score: null, n: 0, nDK: 3, nTotal: 3, confidence: 0 } });
    const m = S.computePartyMatch(part, rn);
    assert.strictEqual(m.comparableCount, 5); assert.strictEqual(m.perDim.find(p => p.dim === 'ecology').reason, 'user-missing'); assert.strictEqual(m.matchPercent, 100);
  });
  test('moins de 3 thèmes comparables : aucun pourcentage plutôt qu’un chiffre peu fiable', () => {
    const sparse = {}; DIM_KEYS.forEach((k, i) => { sparse[k] = i < 2 ? mirror[k] : { score: null, n: 0, nDK: 3, nTotal: 3, confidence: 0 }; });
    assert.strictEqual(S.computePartyMatch(sparse, rn).matchPercent, null);
  });
  test('une position de parti non codée (null) est exclue, jamais lue comme un « 0 » centriste (régression UPR)', () => {
    const centrist = dimAll(0);
    const ranked = S.computePartyMatches(centrist, PARTIES);
    assert.notStrictEqual(ranked[0].party.id, 'upr');
    const u = ranked.find(m => m.party.id === 'upr'); assert.strictEqual(u.partyKnownCount, 1); assert.strictEqual(u.matchPercent, null);
    assert.strictEqual(ranked[ranked.length - 1].party.id, 'upr');
    assert.strictEqual(S.computePartyMatch(centrist, lo).perDim.find(p => p.dim === 'europe').reason, 'party-unknown');
  });
  test('le classement est l’ordre décroissant du pourcentage affiché', () => {
    const r = S.computePartyMatches(mirror, PARTIES).filter(m => m.matchPercent !== null);
    for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].matchPercent >= r[i].matchPercent);
  });
  test('findNearTie : détecte un écart ≤ 6 points et rien au-delà', () => {
    const fake = (a, b) => [{ matchPercent: a, party: rn }, { matchPercent: b, party: lfi }];
    assert.ok(S.findNearTie(fake(90, 84))); assert.strictEqual(S.findNearTie(fake(90, 83)), null);
    assert.strictEqual(S.findNearTie([{ matchPercent: 80, party: rn }, { matchPercent: null, party: lfi }]), null);
  });
}

section('Proximité sur une question de départage');
{
  const q = DEPARTAGE.find(x => x.id === 'dp-retraites');
  test('proximité = 1 − écart / amplitude de l’échelle', () => {
    assert.strictEqual(S.stanceProximity(q, 0, 0), 1); assert.strictEqual(S.stanceProximity(q, 0, 3), 0); assert.ok(Math.abs(S.stanceProximity(q, 1, 2) - (1 - 1 / 3)) < 1e-9);
  });
  test('libellé d’une position : option exacte, « entre » deux options, ou non codée', () => {
    assert.strictEqual(S.stanceLabel(q, 1).label, '62 ans');
    assert.strictEqual(S.stanceLabel(q, 0.75).label, '62 ans');
    assert.ok(/^Entre « .+ » et « .+ »$/.test(S.stanceLabel(q, 1.5).label));
    assert.strictEqual(S.stanceLabel(q, undefined).known, false);
  });
  const userFr = dimAll(0);
  const mk = (id, ans) => S.computePartyMatch(userFr, P(id), { departageAnswers: { [q.id]: ans } });
  test('une réponse précise rapproche le parti qui la porte et éloigne celui qui la refuse', () => {
    assert.ok(mk('lfi', 0).perQuestion[0].proximity > mk('lr', 0).perQuestion[0].proximity);
    assert.ok(mk('lr', 3).perQuestion[0].proximity > mk('lfi', 3).perQuestion[0].proximity);
  });
  test('« je ne sais pas » ou position non codée : aucune preuve (exclu, jamais compté contre)', () => {
    const dk = mk('lfi', 'dk').perQuestion[0]; assert.strictEqual(dk.available, false);
    const noStance = S.computePartyMatch(userFr, P('udr'), { departageAnswers: { [q.id]: 1 } }).perQuestion[0];
    assert.strictEqual(noStance.available, false); assert.strictEqual(noStance.reason, 'party-unknown');
  });
}

section('Comparaison équitable : parti peu codé = « comparaison partielle »');
{
  const dr = dimAll(0);
  const answers = {}; ['dp-retraites', 'dp-nucleaire', 'dp-europe', 'dp-fortune'].forEach(id => { answers[id] = 1; });
  const ranked = S.computePartyMatches(dr, PARTIES, { departageAnswers: answers });
  test('MoDem et UDR restent sans indice, tandis que les positions UDI sourcées suffisent ici', () => {
    ['modem', 'udr'].forEach(id => { const m = ranked.find(x => x.party.id === id); assert.strictEqual(m.partial, true, id); assert.strictEqual(m.matchPercent, null, id); assert.ok(m.themePercent !== null, id); });
    const udi = ranked.find(x => x.party.id === 'udi'); assert.strictEqual(udi.partial, false); assert.notStrictEqual(udi.matchPercent, null); assert.strictEqual(udi.questionComparableCount, 3);
  });
  test('ils sont classés après tous les partis qui ont un pourcentage', () => {
    const firstPartial = ranked.findIndex(m => m.partial); ranked.slice(0, firstPartial).forEach(m => assert.notStrictEqual(m.matchPercent, null));
  });
  test('les partis bien codés gardent leur pourcentage', () => assert.notStrictEqual(ranked.find(m => m.party.id === 'pp').matchPercent, null));
  test('une seule réponse ne déclenche pas la pénalité de couverture; les lacunes de banque restent signalées', () => {
    const oneAnswer = S.computePartyMatches(dr, PARTIES, { departageAnswers: { 'dp-retraites': 1 } });
    oneAnswer.forEach(m => {
      if (m.databaseCoverage < S.PARTIAL_COVERAGE) assert.strictEqual(m.partial, true, m.party.id);
      else assert.strictEqual(m.partial, false, m.party.id);
    });
  });
}

/* ===================== Sélection séquentielle des questions de départage ===================== */
section('Sélection des questions de départage');
{
  const pp = P('pp'), eco = P('ecolo');
  const mid = {}; DIM_KEYS.forEach(k => { mid[k] = { score: (pp.positions[k] + eco.positions[k]) / 2, n: 4, nDK: 0, nTotal: 4, confidence: 1 }; });
  const first = S.selectNextDepartage({ dimResults: mid, answers: {} });
  test('à égalité PP / Écologistes, la 1re question sépare réellement ces deux partis (≥ 1/3 de l’échelle)', () => {
    assert.ok(first); assert.ok(Math.abs(first.stances.pp - first.stances.ecolo) / (first.options.length - 1) >= 0.33, first.id);
  });
  test('la sélection ne repose jamais une question déjà posée, et s’arrête à 8', () => {
    const answers = {}; const seen = new Set();
    const noEarlyStop = { minQuestions: 100, maxQuestions: 8 }; // neutralise l'arrêt anticipé pour vérifier le seul plafond
    for (let i = 0; i < 8; i++) { const q = S.selectNextDepartage(Object.assign({ dimResults: mid, answers }, noEarlyStop)); assert.ok(q, 'question ' + i); assert.ok(!seen.has(q.id)); seen.add(q.id); answers[q.id] = 0; }
    assert.strictEqual(S.selectNextDepartage(Object.assign({ dimResults: mid, answers }, noEarlyStop)), null);
  });
  test('jamais plus de 2 questions d’un même sujet (ex. défense)', () => {
    const answers = {}; const groups = {};
    for (let i = 0; i < 8; i++) { const q = S.selectNextDepartage({ dimResults: mid, answers, minQuestions: 8 }); if (!q) break; groups[q.group] = (groups[q.group] || 0) + 1; answers[q.id] = 0; }
    Object.keys(groups).forEach(g => assert.ok(groups[g] <= S.MAX_PER_GROUP, g + ' : ' + groups[g]));
  });
  test('la question est choisie selon les partis encore en course : pour un profil de droite elle n’est pas la même que pour la gauche', () => {
    const lr = P('lr'), rn = P('rn'); const midR = {}; DIM_KEYS.forEach(k => { midR[k] = { score: (lr.positions[k] + rn.positions[k]) / 2, n: 4, nDK: 0, nTotal: 4, confidence: 1 }; });
    const qr = S.selectNextDepartage({ dimResults: midR, answers: {} });
    assert.ok(Math.abs(qr.stances.lr - qr.stances.rn) / (qr.options.length - 1) >= 0.33, qr.id);
    assert.notStrictEqual(qr.id, first.id);
  });
  test('arrêt anticipé : jamais avant 4 réponses, puis dès qu’un parti mène nettement', () => {
    const two = [P('lfi'), P('rn')]; const l = {}; DIM_KEYS.forEach(k => { l[k] = { score: P('lfi').positions[k], n: 3, nDK: 0, nTotal: 3, confidence: 1 }; });
    const answers = {};
    for (let i = 0; i < S.MIN_DEPARTAGE; i++) { const q = S.selectNextDepartage({ dimResults: l, parties: two, answers }); assert.ok(q, 'avant le minimum, i=' + i); answers[q.id] = nearestPos(q, 'lfi'); }
    assert.strictEqual(S.selectNextDepartage({ dimResults: l, parties: two, answers }), null);
  });
  test('profil non déterminé (« je ne sais pas » partout) : une question utile est quand même proposée', () => {
    const none = {}; DIM_KEYS.forEach(k => { none[k] = { score: null, n: 0, nDK: 3, nTotal: 3, confidence: 0 }; });
    assert.ok(S.selectNextDepartage({ dimResults: none, answers: {} }));
  });

  // Banque synthétique : la logique gloutonne, indépendamment des vraies données
  const mkParty = id => ({ id, name: id, short: id, positions: { eco: 0, soc: 0, auth: 0, europe: 0, immig: 0, ecology: 0 } });
  const synth = [mkParty('p1'), mkParty('p2'), mkParty('p3')];
  const zero = {}; DIM_KEYS.forEach(k => { zero[k] = { score: 0, n: 3, nDK: 0, nTotal: 3, confidence: 1 }; });
  test('égalité ≤ 6 points : la question suivante vise une position connue et différente pour les deux partis', () => {
    const a = mkParty('a'), b = mkParty('b');
    const bank = Array.from({ length: 8 }, (_, i) => ({
      id: 'pair-' + i, dim: DIM_KEYS[i % DIM_KEYS.length], group: 'g' + i,
      topic: 'sujet ' + i, q: 'question ' + i, plain: '',
      options: [{ pos: 0, short: 'a', text: 'A' }, { pos: 1, short: 'b', text: 'B' }, { pos: 2, short: 'c', text: 'C' }],
      stances: { a: i === 4 ? 0 : 0, b: i === 4 ? 2 : (i === 5 ? 1 : 0) }, basis: 'source'
    }));
    const answers = { 'pair-0': 0, 'pair-1': 0, 'pair-2': 0, 'pair-3': 0 };
    const next = S.selectNextDepartage({ dimResults: zero, parties: [a, b], bank, answers });
    assert.strictEqual(next.id, 'pair-4');
  });

  const sq = (id, dim, group, st) => ({ id, dim, group, topic: id, q: id, plain: '', options: [{ pos: 0, short: 'a', text: 'a' }, { pos: 1, short: 'b', text: 'b' }], stances: st, basis: '' });
  test('logique : la question qui sépare le plus de partis probables est posée en premier', () => {
    const bank = [sq('A', 'eco', 'g1', { p1: 0, p2: 1, p3: 0.5 }), sq('B', 'ecology', 'g2', { p1: 0, p2: 0.5, p3: 0.9 })];
    assert.strictEqual(S.selectNextDepartage({ dimResults: zero, parties: synth, bank, answers: {} }).id, 'A');
  });
  test('logique : une priorité sur un thème fait remonter ses questions', () => {
    const b2 = [sq('A', 'eco', 'g1', { p1: 0, p2: 1, p3: 0 }), sq('B', 'ecology', 'g2', { p1: 0, p2: 0, p3: 0.9 })];
    assert.strictEqual(S.selectNextDepartage({ dimResults: zero, parties: synth, bank: b2, answers: {} }).id, 'A');
    assert.strictEqual(S.selectNextDepartage({ dimResults: zero, parties: synth, bank: b2, answers: {}, priorities: ['ecology'] }).id, 'B');
  });
  test('logique : un thème déjà interrogé est décoté (rendement décroissant)', () => {
    const b3 = [sq('A', 'eco', 'g1', { p1: 0, p2: 1, p3: 0 }), sq('A2', 'eco', 'g3', { p1: 0, p2: 1, p3: 0 }), sq('B', 'ecology', 'g2', { p1: 0, p2: 0.85, p3: 0 })];
    assert.strictEqual(S.selectNextDepartage({ dimResults: zero, parties: synth, bank: b3, answers: { A: 0 }, minQuestions: 1 }).id, 'B');
  });
}

/* ===================== Ordre d'affichage aléatoire ===================== */
section('Ordre aléatoire : équilibre et absence de motif');
{
  const seeds = Array.from({ length: 60 }, (_, i) => i + 1);
  const longest = arr => { let b = 0, r = 0, p; arr.forEach((v, i) => { r = (i > 0 && v === p) ? r + 1 : 1; p = v; if (r > b) b = r; }); return b; };
  test('dans chaque thème, autant de questions inversées que non inversées (à une près), pour 60 tirages', () => {
    seeds.forEach(s => {
      const f = S.makeBalancedFlips(QUESTIONS, S.seededRandom(s));
      DIM_KEYS.forEach(k => { const qs = QUESTIONS.filter(q => q.dim === k); const t = qs.filter(q => f[q.id]).length; assert.ok(Math.abs(t - (qs.length - t)) <= 1, 'seed ' + s + ' ' + k); });
    });
  });
  test('jamais plus de 3 questions de suite dans le même sens, pour 60 tirages', () => {
    seeds.forEach(s => { const f = S.makeBalancedFlips(QUESTIONS, S.seededRandom(s)); assert.ok(longest(QUESTIONS.map(q => f[q.id])) <= 3, 'seed ' + s); });
  });
  test('le tirage est réellement aléatoire (au moins 20 motifs différents sur 60 tirages) et déterministe à graine égale', () => {
    const pats = new Set(seeds.map(s => QUESTIONS.map(q => S.makeBalancedFlips(QUESTIONS, S.seededRandom(s))[q.id] ? 1 : 0).join('')));
    assert.ok(pats.size >= 20, String(pats.size));
    assert.deepStrictEqual(S.makeBalancedFlips(QUESTIONS, S.seededRandom(5)), S.makeBalancedFlips(QUESTIONS, S.seededRandom(5)));
  });
  test('la proposition de gauche (A) est affichée en premier à peu près une fois sur deux (45–55 % sur 60 tirages)', () => {
    let first = 0, total = 0; seeds.forEach(s => { const f = S.makeBalancedFlips(QUESTIONS, S.seededRandom(s)); QUESTIONS.forEach(q => { total++; if (!f[q.id]) first++; }); });
    const ratio = first / total; assert.ok(ratio > 0.45 && ratio < 0.55, String(ratio));
  });
  test('options d’une question à choix : permutation complète, jamais strictement croissante ni décroissante', () => {
    seeds.forEach(s => { const o = S.makeOptionOrder(4, S.seededRandom(s)); assert.deepStrictEqual(o.slice().sort(), [0, 1, 2, 3]); assert.ok(!o.every((v, i) => v === i) && !o.every((v, i) => v === 3 - i), 'seed ' + s); });
  });
}

T.done();
