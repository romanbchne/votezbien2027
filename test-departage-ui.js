/* Départage entre partis proches, vu par la personne : palier à l'aveugle,
   affichage honnête d'une quasi-égalité, leader net, vue « choix ». */
const assert = require('assert');
const H = require('./helpers.js');
const { D, S, makeDom, click, isActive, savedState, readChoice, answerChoice, drive, nearestOption, makeAnswerer, runner } = H;
const { DIM_KEYS, PARTIES } = D;
const T = runner('Départage (interface)');
const { section, test } = T;
const P = id => PARTIES.find(p => p.id === id);
const $ = (env, id) => env.doc.getElementById(id);
const topOf = html => { const m = html.match(/<span class="top-badge">(Le plus proche de vous|En tête, de très peu)<\/span>[\s\S]*?<h3>([^<]+)<\/h3>/); return m ? { badge: m[1], name: m[2] } : null; };
function persona(latentFn) { const ans = makeAnswerer(); return q => ans(q.dim, latentFn(q.dim)); }

const pp = P('pp'), eco = P('ecolo'), lr = P('lr');
const mid = k => (pp.positions[k] + eco.positions[k]) / 2;

section('Palier : aucun nom de parti ni pourcentage avant les questions concrètes');
{
  const env = makeDom({ seed: 7 });
  const log = drive(env, { scale: persona(mid), stopAt: 'checkpoint' });
  test('le palier ne contient AUCUN nom de parti (aucune influence sur les réponses suivantes)', () => PARTIES.forEach(p => assert.ok(!log.checkpointText.includes(p.name), p.name)));
  test('… ni aucun pourcentage', () => assert.ok(!/\d\s?%/.test(log.checkpointText)));
  test('… ni aucun candidat nommé', () => ['Mélenchon', 'Le Pen', 'Retailleau', 'Attal', 'Faure', 'Glucksmann', 'Tondelier', 'Roussel', 'Zemmour', 'Philippe'].forEach(n => assert.ok(!log.checkpointText.includes(n), n)));
  test('pour un électeur partagé entre deux partis, il annonce — sans les nommer — que plusieurs partis sont proches', () => assert.ok(/plusieurs partis se rapprochent de vous à peu près autant/.test(log.checkpointText)));
  test('il annonce « jusqu’à 18 questions » et qu’un parti qui ressort nettement arrête le test', () => { assert.ok(log.checkpointText.includes('Jusqu’à 18 questions')); assert.ok(log.checkpointText.includes('dès qu’un parti ressort nettement')); });
  test('il propose de choisir 3 priorités (facultatif) et affiche un aperçu provisoire gauche-droite', () => { assert.ok(log.checkpointText.includes('Vos 3 priorités')); assert.ok(/Tendance provisoire/.test(log.checkpointText)); });
}

section('Les questions concrètes : vue « choix » dédiée');
{
  const env = makeDom({ seed: 8 });
  drive(env, { scale: persona(mid), stopAt: 'checkpoint' });
  click(env, $(env, 'btnContinueDiag'));
  test('la vue « choix » est visible, la vue « échelle » masquée', () => { assert.strictEqual($(env, 'viewChoice').hidden, false); assert.strictEqual($(env, 'viewScale').hidden, true); });
  test('l’énoncé est une vraie question, avec 2 à 4 options de politique précises et une case « aucune de ces options »', () => {
    const q = readChoice(env); assert.ok(q); const n = env.doc.querySelectorAll('#choiceList .choice-btn').length; assert.ok(n >= 2 && n <= 4);
    assert.ok($(env, 'dkBtnChoice').textContent.includes('Aucune de ces options'));
  });
  test('la progression indique la première question de précision et un bandeau explique ces questions', () => {
    assert.ok($(env, 'progressLabel').textContent.startsWith('Précision 1')); assert.ok($(env, 'phaseChipWrap').textContent.includes('Questions de précision'));
  });
  test('le bloc « En clair » explique les termes de la question', () => { assert.strictEqual($(env, 'plainBox').hidden, false); assert.ok($(env, 'plainText').textContent.length > 40); });
  test('« Suivant » est désactivé tant qu’on n’a pas choisi', () => assert.strictEqual($(env, 'btnNext').disabled, true));
  test('« Aucune de ces options » est une réponse valable : elle débloque « Suivant » et n’est jamais comptée contre un parti', () => {
    answerChoice(env, 'dk'); assert.strictEqual($(env, 'btnNext').disabled, false); assert.strictEqual(savedState(env).dpAnswers[readChoice(env).id], 'dk');
  });
  // « Voir mon profil » exactement sur la dernière question
  const e2 = makeDom({ seed: 9 }); const target = persona(mid);
  drive(e2, { scale: target, stopAt: 'checkpoint' }); click(e2, $(e2, 'btnContinueDiag'));
  const labels = [];
  for (let i = 0; i < 12 && isActive(e2, 'quiz'); i++) {
    const q = readChoice(e2); answerChoice(e2, nearestOption(q, (pp.positions.ecology + eco.positions.ecology) / 2 > 0 ? (q.stances.pp + q.stances.ecolo) / 2 : 0));
    labels.push($(e2, 'btnNext').textContent); click(e2, $(e2, 'btnNext'));
  }
  test('le bouton devient « Voir mon profil » uniquement sur la toute dernière question, puis les résultats s’ouvrent', () => {
    assert.ok(isActive(e2, 'results')); assert.strictEqual(labels[labels.length - 1], 'Voir mon profil');
    labels.slice(0, -1).forEach(l => assert.strictEqual(l, 'Suivant'));
  });
}

section('Quasi-égalité : l’application ne désigne pas de gagnant, elle montre ce qui distingue');
{
  const env = makeDom({ seed: 10 });
  const log = drive(env, { scale: persona(mid), choice: q => nearestOption(q, (q.stances.pp + q.stances.ecolo) / 2) });
  const html = log.resultsHtml, text = log.resultsText;
  test('les deux premiers partis sont PP et Les Écologistes, à moins de 6 points', () => {
    const tie = S.findNearTie(S.computePartyMatches(S.computeDimensionResults(savedState(env).answers, D.QUESTIONS), PARTIES, { priorities: savedState(env).priorities, departageAnswers: savedState(env).dpAnswers }));
    assert.ok(tie); assert.deepStrictEqual(tie.map(m => m.party.id).sort(), ['ecolo', 'pp']);
  });
  test('aucun « Le plus proche de vous » : « En tête, de très peu » et « Presque à égalité »', () => { assert.ok(!html.includes('Le plus proche de vous')); assert.ok(html.includes('En tête, de très peu') && html.includes('Presque à égalité')); });
  test('le panneau « Départager vos deux partis les plus proches » explique que l’écart est inférieur à la marge d’incertitude', () => { assert.ok(text.includes('Départager vos deux partis les plus proches')); assert.ok(text.includes('marge d’incertitude')); });
  test('il liste des différences concrètes (votre position, celle de chaque parti) et au plus 3', () => {
    const items = env.doc.querySelectorAll('.depart-item'); assert.ok(items.length >= 1 && items.length <= 3, String(items.length));
    items.forEach(it => assert.ok(/Vous :/.test(it.textContent) && /PP :/.test(it.textContent) && /LE :/.test(it.textContent)));
  });
  test('« Comparer côte à côte » ouvre le comparateur avec exactement ces deux partis', () => {
    click(env, $(env, 'btnCompareTie')); assert.ok(isActive(env, 'compare')); const h = $(env, 'compareContent').innerHTML; assert.ok(h.includes('<th>PP</th>') && h.includes('<th>LE</th>'));
  });
}

section('Leader net : un parti est déclaré « le plus proche »');
{
  const env = makeDom({ seed: 11 });
  const log = drive(env, { scale: persona(k => lr.positions[k]), choice: q => nearestOption(q, q.stances.lr) });
  test('le parti en tête est Les Républicains, déclaré « Le plus proche de vous »', () => { const t = topOf(log.resultsHtml); assert.ok(t); assert.strictEqual(t.badge, 'Le plus proche de vous'); assert.strictEqual(t.name, 'Les Républicains'); });
  test('aucun panneau de départage (rien à départager)', () => assert.ok(!log.resultsText.includes('Départager vos deux partis')));
  test('le test s’est arrêté avant 18 questions (un leader net ressort : arrêt anticipé)', () => assert.ok(log.choice.length < S.MAX_DEPARTAGE, String(log.choice.length)));
  test('le palier de ce profil ne parlait pas de partis proches', () => assert.ok(!/plusieurs partis se rapprochent/.test(log.checkpointText)));
}

section('Priorités');
{
  const withP = makeDom({ seed: 12 }); const l1 = drive(withP, { scale: persona(mid), choice: q => nearestOption(q, q.stances.ecolo), priorities: ['ecology'] });
  const without = makeDom({ seed: 12 }); const l2 = drive(without, { scale: persona(mid), choice: q => nearestOption(q, q.stances.ecolo) });
  test('une priorité choisie s’affiche dans « Vos priorités »', () => assert.ok(l1.resultsText.includes('1. Écologie et énergie')));
  test('sans priorité, l’application le dit : tous les thèmes comptent autant', () => assert.ok(l2.resultsText.includes('Vous n’avez pas désigné de priorité')));
  test('la priorité ne modifie jamais l’orientation gauche-droite affichée', () => {
    const lab = t => (t.match(/Plutôt à (gauche|droite)|Centre-gauche|Centre-droit|Plutôt au centre/) || [])[0];
    assert.strictEqual(lab(l1.resultsText), lab(l2.resultsText));
  });
}
test('aucune erreur JavaScript dans aucun de ces parcours', () => H.assertNoErrors());
T.done();

