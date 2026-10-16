/* Parcours complet dans un DOM réel (jsdom) : 21 questions, palier, questions
   de départage, résultats, partis, fiche, comparateur, méthode. */
const assert = require('assert');
const H = require('./helpers.js');
const { D, S, makeDom, click, isActive, drive, nearestOption, makeAnswerer, runner } = H;
const { DIM_KEYS, DIMENSIONS, PARTIES, QUESTIONS, SOURCES } = D;
const T = runner('Intégration (interface)');
const { section, test } = T;
const decode = html => html.replace(/&amp;/g, '&');

const eco = PARTIES.find(p => p.id === 'ecolo');
const ans = makeAnswerer();
const env = makeDom({ seed: 21 });
const log = drive(env, {
  scale: q => ans(q.dim, eco.positions[q.dim]),
  choice: q => nearestOption(q, q.stances.ecolo),
  priorities: ['ecology', 'eco']
});

section('Parcours : accueil → 21 questions → palier → questions concrètes → résultats');
test('le parcours se termine sur l’écran des résultats', () => assert.ok(isActive(env, 'results')));
test('21 questions générales ont été posées, chacune une seule fois', () => {
  assert.strictEqual(log.scale.length, 21); assert.strictEqual(new Set(log.scale.map(x => x.q.id)).size, 21);
});
test('entre 4 et 15 questions concrètes ont été posées, sans doublon', () => {
  assert.ok(log.choice.length >= S.MIN_DEPARTAGE && log.choice.length <= S.MAX_DEPARTAGE, String(log.choice.length));
  assert.strictEqual(new Set(log.choice.map(x => x.q.id)).size, log.choice.length);
});
test('les questions concrètes sont de vraies options (3 ou 4 choix), jamais une échelle gauche-droite', () => {
  log.choice.forEach(c => assert.ok(c.q.options.length >= 2 && c.q.options.length <= 4));
});

section('Écran résultats');
{
  const html = log.resultsHtml, text = log.resultsText;
  test('une étiquette d’orientation générale est affichée', () => assert.ok(/Plutôt à|Centre/.test(text)));
  test('les 6 thèmes apparaissent, chacun avec sa définition en une phrase', () => DIM_KEYS.forEach(k => { assert.ok(decode(html).includes(DIMENSIONS[k].name), k); assert.ok(decode(html).includes(DIMENSIONS[k].plain.slice(0, 40)), k); }));
  test('« Vos meilleures correspondances » avec des pourcentages, et la précision sur le nombre de réponses', () => { assert.ok(/Vos meilleures correspondances/.test(text)); assert.ok(/\d+%/.test(text)); assert.ok(/réponses aux questions de précision/.test(text)); });
  test('le parti en tête porte un libellé d’écart honnête (« Le plus proche de vous » ou « En tête, de très peu »)', () => assert.ok(html.includes('Le plus proche de vous') || html.includes('En tête, de très peu')));
  test('un profil calqué sur Les Écologistes les place en tête', () => assert.ok(/(Le plus proche de vous|En tête, de très peu)<\/span>[\s\S]{0,400}?<h3>Les Écologistes<\/h3>/.test(html)));
  test('les priorités choisies s’affichent dans l’ordre', () => { assert.ok(text.includes('1. Écologie & énergie')); assert.ok(text.includes('2. Économie & redistribution')); });
}

section('Écran des partis, fiche détaillée, comparateur, méthode');
{
  click(env, env.doc.querySelector('[data-nav="parties"]'));
  const cards = env.doc.querySelectorAll('.party-card');
  test('les 16 partis sont rendus', () => { assert.ok(isActive(env, 'parties')); assert.strictEqual(cards.length, PARTIES.length); });
  test('les partis qui ont un pourcentage sont classés du plus élevé au plus faible, et passent AVANT ceux comparés partiellement', () => {
    const labels = Array.from(env.doc.querySelectorAll('#partyGrid .ring-label')).map(e => e.textContent.trim());
    const nums = []; let sawNonNum = false;
    labels.forEach(t => { const n = parseInt(t, 10); if (t.endsWith('%')) { assert.ok(!sawNonNum, 'pourcentage après un parti sans pourcentage'); nums.push(n); } else sawNonNum = true; });
    assert.ok(nums.length >= 8, String(nums.length)); nums.forEach((v, i) => { if (i) assert.ok(v <= nums[i - 1]); });
  });
  test('MoDem, UDI et UDR sont signalés « comparaison partielle » après les questions concrètes', () => {
    const grid = decode(env.doc.getElementById('partyGrid').textContent); assert.ok(grid.includes('Comparaison partielle'));
  });
  test('chaque carte a une légende explicative (jamais un pourcentage nu)', () => cards.forEach(c => assert.ok(c.querySelector('.match-caption').textContent.length > 20)));
  click(env, cards[0]);
  const drawer = env.doc.getElementById('partyDrawer');
  test('la fiche s’ouvre avec les 6 thèmes et la section « Vos réponses aux questions de précision »', () => {
    assert.ok(drawer.classList.contains('show')); const t = decode(drawer.textContent);
    DIM_KEYS.forEach(k => assert.ok(t.includes(DIMENSIONS[k].name), k)); assert.ok(t.includes('Vos réponses aux questions de précision'));
  });
  test('la fiche donne, pour chaque question concrète, votre choix ET la position du parti (ou « non codée »)', () => {
    const items = drawer.querySelectorAll('.dim-compare')[1].querySelectorAll('.dc-item'); assert.strictEqual(items.length, log.choice.length);
    items.forEach(it => assert.ok(/Vous :/.test(it.textContent) && /: /.test(it.textContent)));
  });
  click(env, env.doc.getElementById('drawerCloseBtn'));
  test('la fiche se ferme', () => assert.ok(!drawer.classList.contains('show')));

  const cb = env.doc.querySelector('[data-compare="ecolo"]'); cb.checked = true; cb.dispatchEvent(new env.win.Event('change', { bubbles: true }));
  const cb2 = env.doc.querySelector('[data-compare="ps"]'); cb2.checked = true; cb2.dispatchEvent(new env.win.Event('change', { bubbles: true }));
  click(env, env.doc.querySelector('[data-nav="compare"]'));
  test('le comparateur affiche les 6 thèmes ET une ligne par question concrète répondue', () => {
    const rows = env.doc.querySelectorAll('#compareContent tbody tr'); assert.strictEqual(rows.length, DIM_KEYS.length + log.choice.filter(c => c.pos !== 'dk').length);
    assert.ok(env.doc.getElementById('compareContent').innerHTML.includes('<th>LE</th>') && env.doc.getElementById('compareContent').innerHTML.includes('<th>PS</th>'));
  });
  click(env, env.doc.querySelector('[data-nav="method"]'));
  test('la page Méthode liste les 6 thèmes et toutes les sources de recoupement (liens https)', () => {
    DIM_KEYS.forEach(k => assert.ok(decode(env.doc.getElementById('methodDims').innerHTML).includes(DIMENSIONS[k].name), k));
    const links = env.doc.querySelectorAll('#methodSources a'); assert.strictEqual(links.length, SOURCES.length);
    links.forEach(a => assert.ok(a.href.startsWith('https://')));
  });
  test('la page Méthode ne contient plus aucune trace de l’ancienne note d’importance par question', () => {
    const t = env.doc.getElementById('screen-method').textContent; assert.ok(!/Peu important|Essentiel/.test(t));
  });
}

// jsdom déclenche DOMContentLoaded de façon asynchrone : on laisse init() s'exécuter avant de lire l'accueil.
const tick = () => new Promise(r => setTimeout(r, 40));
(async () => {
  section('Écran d’accueil');
  {
    const e2 = makeDom({ seed: 2 });
    await tick(); // jsdom déclenche DOMContentLoaded (donc init()) de façon asynchrone ; un navigateur le fait avant toute interaction
    test('l’accueil est actif, avec la boussole d’illustration et le bouton de départ', () => {
      assert.ok(isActive(e2, 'home')); assert.ok(e2.doc.querySelectorAll('#compassSpokes line').length === 12); assert.ok(e2.doc.getElementById('btnStart'));
    });
    test('« Mon profil » et « Les partis » sont désactivés tant que le test n’est pas terminé', () => {
      assert.strictEqual(e2.doc.getElementById('navResults').disabled, true); assert.strictEqual(e2.doc.getElementById('navParties').disabled, true);
    });
    test('le premier écran de question affiche le bloc « En clair » quand un terme le demande', () => {
      click(e2, e2.doc.getElementById('btnStart')); assert.strictEqual(e2.doc.getElementById('plainBox').hidden, false);
      assert.ok(e2.doc.getElementById('plainText').textContent.length > 20);
    });
    test('la vue « échelle » est visible et la vue « choix » masquée pendant les 21 premières questions', () => {
      assert.strictEqual(e2.doc.getElementById('viewScale').hidden, false); assert.strictEqual(e2.doc.getElementById('viewChoice').hidden, true);
      assert.strictEqual(e2.doc.querySelectorAll('#scaleButtons .scale-btn').length, 5);
    });
    test('il n’y a plus de ligne « importance » sous les questions', () => assert.strictEqual(e2.doc.querySelectorAll('.imp-btn, #impChoices').length, 0));
  }
  test('aucune erreur JavaScript dans aucun de ces parcours', () => H.assertNoErrors());

  T.done();
})();

