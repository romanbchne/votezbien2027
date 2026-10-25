/* Simulations d'électeurs (niveau moteur, déterministes).
   Objectif : vérifier ce que la sélection séquentielle fait RÉELLEMENT, pas ce
   qu'on aimerait qu'elle fasse :
     1. un électeur réellement partagé n'est jamais « tranché » artificiellement ;
     2. quand ses réponses honnêtes penchent d'un côté, le bon parti passe devant,
        avec un écart réel (venant de vraies différences de position, pas d'un réglage) ;
     3. répondre exactement comme un parti place ce parti en tête (cohérence de
        toute la chaîne) ;
     4. la sélection reste dans ses bornes (4 à 18 questions, pas de doublon). */
const assert = require('assert');
const { D, S, makeAnswerer, nearestOption, runner } = require('./helpers.js');
const { DIM_KEYS, QUESTIONS, DEPARTAGE, PARTIES } = D;
const T = runner('Simulations d’électeurs');
const { section, test } = T;
const P = id => PARTIES.find(p => p.id === id);

// Parcours complet : 21 réponses (position « vraie » par thème), puis questions de départage une à une.
function simulate(latent, target, priorities) {
  priorities = priorities || [];
  const ans = makeAnswerer(); const answers = {};
  QUESTIONS.forEach(q => { answers[q.id] = ans(q.dim, latent[q.dim]); });
  const dim = S.computeDimensionResults(answers, QUESTIONS);
  const before = S.computePartyMatches(dim, PARTIES, { priorities });
  const dp = {}, asked = [];
  for (let i = 0; i < 20; i++) {
    const q = S.selectNextDepartage({ dimResults: dim, answers: dp, priorities });
    if (!q) break;
    asked.push(q); dp[q.id] = nearestOption(q, target(q));
  }
  const after = S.computePartyMatches(dim, PARTIES, { priorities, departageAnswers: dp });
  return { before, after, asked, dp, dim };
}
const pct = (m, id) => m.find(x => x.party.id === id).matchPercent;
const pp = P('pp'), eco = P('ecolo');
const mid = {}; DIM_KEYS.forEach(k => { mid[k] = (pp.positions[k] + eco.positions[k]) / 2; });

section('Électeur partagé entre le PP et Les Écologistes (l’exemple demandé)');
{
  const before = simulate(mid, () => null).before;
  test('avant les questions concrètes : les deux partis sont à égalité en tête (écart ≤ 1 point)', () => {
    assert.ok(Math.abs(pct(before, 'pp') - pct(before, 'ecolo')) <= 1);
    assert.deepStrictEqual(before.slice(0, 2).map(m => m.party.id).sort(), ['ecolo', 'pp']);
  });
  const A = simulate(mid, q => q.stances.ecolo), B = simulate(mid, q => q.stances.pp);
  const gapA = pct(A.after, 'ecolo') - pct(A.after, 'pp'), gapB = pct(B.after, 'pp') - pct(B.after, 'ecolo');
  console.log('    (réponses = Écologistes : Écologistes ' + pct(A.after, 'ecolo') + ' % / PP ' + pct(A.after, 'pp') + ' % en ' + A.asked.length + ' questions ; réponses = PP : PP ' + pct(B.after, 'pp') + ' % / Écologistes ' + pct(B.after, 'ecolo') + ' % en ' + B.asked.length + ' questions)');
  test('réponses concrètes comme Les Écologistes : ils passent devant le PP d’au moins 10 points', () => { assert.strictEqual(A.after[0].party.id, 'ecolo'); assert.ok(gapA >= 10, 'écart ' + gapA); });
  test('réponses concrètes comme le PP : il passe devant Les Écologistes d’au moins 8 points', () => { assert.strictEqual(B.after[0].party.id, 'pp'); assert.ok(gapB >= 8, 'écart ' + gapB); });
  const C = simulate(mid, q => (q.stances.pp + q.stances.ecolo) / 2);
  const gapC = Math.abs(pct(C.after, 'pp') - pct(C.after, 'ecolo'));
  console.log('    (réponses à mi-chemin : écart ' + gapC + ' point(s))');
  test('réponses à mi-chemin entre les deux : aucun gagnant fabriqué (écart ≤ 8, pas de leader net)', () => assert.ok(gapC <= 8, 'écart ' + gapC));
  test('les questions posées séparent réellement PP et Écologistes (au moins 3 d’entre elles ≥ 1/3 de l’échelle)', () => {
    const seps = A.asked.filter(q => Math.abs(q.stances.pp - q.stances.ecolo) / (q.options.length - 1) >= 0.33).length; assert.ok(seps >= 3, String(seps));
  });
}

section('Répondre exactement comme un parti place ce parti en tête');
{
  const coverage = id => DEPARTAGE.filter(q => typeof q.stances[id] === 'number').length / DEPARTAGE.length;
  const testable = PARTIES.filter(p => DIM_KEYS.filter(k => typeof p.positions[k] === 'number').length >= 3 && coverage(p.id) >= 0.6);
  const summary = [];
  testable.forEach(p => {
    const lat = {}; DIM_KEYS.forEach(k => { lat[k] = p.positions[k]; });
    const r = simulate(lat, q => q.stances[p.id]);
    summary.push(p.short + ' ' + r.asked.length);
    test(p.name + ' : le profil qui répond comme lui le place en tête ou à 1 point du premier', () => {
      const own = r.after.find(m => m.party.id === p.id);
      assert.ok(own.matchPercent !== null, 'pas de pourcentage');
      assert.ok(own.matchPercent >= r.after[0].matchPercent - 1, 'classement : ' + r.after.slice(0, 3).map(m => m.party.short + ' ' + m.matchPercent).join(', '));
    });
  });
  console.log('    (questions posées par profil : ' + summary.join(', ') + ')');
  test('au moins 10 partis sont assez codés pour cette vérification', () => assert.ok(testable.length >= 10, String(testable.length)));
}

section('Bornes de la sélection');
{
  const runs = PARTIES.filter(p => DIM_KEYS.filter(k => typeof p.positions[k] === 'number').length >= 3).map(p => {
    const lat = {}; DIM_KEYS.forEach(k => { lat[k] = p.positions[k]; }); return simulate(lat, q => q.stances[p.id]);
  });
  test('toujours entre 4 et 18 questions, jamais de doublon, jamais plus de 2 du même sujet', () => {
    runs.forEach(r => {
      assert.ok(r.asked.length >= S.MIN_DEPARTAGE && r.asked.length <= S.MAX_DEPARTAGE, String(r.asked.length));
      assert.strictEqual(new Set(r.asked.map(q => q.id)).size, r.asked.length);
      const g = {}; r.asked.forEach(q => { g[q.group] = (g[q.group] || 0) + 1; }); Object.keys(g).forEach(k => assert.ok(g[k] <= S.MAX_PER_GROUP));
    });
  });
  test('le test s’arrête avant 18 questions pour certains profils (leader net) et va à 18 pour d’autres (partis restés proches)', () => {
    const counts = runs.map(r => r.asked.length);
    assert.ok(counts.some(c => c < S.MAX_DEPARTAGE), 'aucun arrêt anticipé'); assert.ok(counts.some(c => c === S.MAX_DEPARTAGE), 'jamais 18');
  });
}

section('Équité de la comparaison');
{
  const lat = mid;
  const ans = makeAnswerer(); const answers = {}; QUESTIONS.forEach(q => { answers[q.id] = ans(q.dim, lat[q.dim]); });
  const dim = S.computeDimensionResults(answers, QUESTIONS);
  const base = S.computePartyMatches(dim, PARTIES, {});
  test('répondre « je ne sais pas » à toutes les questions concrètes ne change aucun pourcentage (absence de réponse ≠ désaccord)', () => {
    const dp = {}; DEPARTAGE.slice(0, 8).forEach(q => { dp[q.id] = 'dk'; });
    const after = S.computePartyMatches(dim, PARTIES, { departageAnswers: dp });
    base.forEach(m => assert.strictEqual(after.find(x => x.party.id === m.party.id).matchPercent, m.matchPercent, m.party.id));
  });
  test('trois réponses documentées suffisent à classer l’UDI; MoDem et UDR restent signalés comme partiels', () => {
    const dp = { 'dp-retraites': 1, 'dp-nucleaire': 1, 'dp-europe': 1 };
    const r = S.computePartyMatches(dim, PARTIES, { departageAnswers: dp });
    ['modem', 'udr'].forEach(id => {
      const m = r.find(x => x.party.id === id);
      assert.strictEqual(m.partial, true, id); assert.strictEqual(m.matchPercent, null, id);
    });
    const udi = r.find(x => x.party.id === 'udi');
    assert.strictEqual(udi.partial, false, 'UDI'); assert.notStrictEqual(udi.matchPercent, null, 'UDI');
    assert.strictEqual(udi.questionComparableCount, 3);
  });
}
T.done();

