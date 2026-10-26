/* Parcours complet dans un DOM réel (jsdom) : 22 questions, palier, questions
   de départage, résultats, partis, fiche, comparateur, méthode. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const H = require('./helpers.js');
const { D, S, makeDom, click, isActive, drive, nearestOption, makeAnswerer, runner } = H;
const { DIM_KEYS, DIMENSIONS, PARTIES, QUESTIONS, SOURCES } = D;
const T = runner('Intégration (interface)');
const { section, test } = T;
const decode = html => html.replace(/&amp;/g, '&');
const topParty = html => { const m = html.match(/<span class="top-badge">(?:Le plus proche de vous|En tête, de très peu)<\/span>[\s\S]*?<h3>([^<]+)<\/h3>/); return m ? m[1] : null; };

const eco = PARTIES.find(p => p.id === 'ecolo');
const ans = makeAnswerer();
const env = makeDom({ seed: 21 });
const log = drive(env, {
  scale: q => ans(q.dim, eco.positions[q.dim]),
  choice: q => nearestOption(q, q.stances.ecolo),
  priorities: ['ecology', 'eco']
});

section('Parcours : accueil → 22 questions → palier → questions concrètes → résultats');
test('le parcours se termine sur l’écran des résultats', () => assert.ok(isActive(env, 'results')));
test('22 questions générales ont été posées, chacune une seule fois', () => {
  assert.strictEqual(log.scale.length, 22); assert.strictEqual(new Set(log.scale.map(x => x.q.id)).size, 22);
});
test('entre 4 et 18 questions concrètes ont été posées, sans doublon', () => {
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
  test('« Les formations les plus proches de vos réponses » avec des pourcentages, et la précision sur le nombre de réponses', () => { assert.ok(/Les formations les plus proches de vos réponses/.test(text)); assert.ok(/\d+\/100/.test(text)); assert.ok(/réponses aux questions de précision/.test(text)); });
  test('le parti en tête porte un libellé d’écart honnête (« Le plus proche de vous » ou « En tête, de très peu »)', () => assert.ok(html.includes('Le plus proche de vous') || html.includes('En tête, de très peu')));
  test('un profil calqué sur Les Écologistes les place en tête', () => assert.strictEqual(topParty(html), 'Les Écologistes'));
  test('les priorités choisies s’affichent dans l’ordre', () => { assert.ok(text.includes('1. Écologie et énergie')); assert.ok(text.includes('2. Économie et redistribution')); });
}

section('Écran des partis, fiche détaillée, comparateur, méthode');
{
  const openMethodScreen = () => {
    env.win.history.replaceState(null, '', '#method');
    env.win.dispatchEvent(new env.win.Event('hashchange'));
  };
  test('Méthode reste accessible au pied de page, sans onglet principal', () => {
    assert.strictEqual(env.doc.querySelector('#mainNav [data-nav="method"]'), null);
    assert.ok(Array.from(env.doc.querySelectorAll('footer .footer-links a')).some(a => new URL(a.href).pathname === '/methode/'));
  });
  click(env, env.doc.querySelector('[data-nav="parties"]'));
  const cards = env.doc.querySelectorAll('.party-card');
  test('les 16 partis sont rendus', () => { assert.ok(isActive(env, 'parties')); assert.strictEqual(cards.length, PARTIES.length); });
  test('les partis qui ont un pourcentage sont classés du plus élevé au plus faible, et passent AVANT ceux comparés partiellement', () => {
    const labels = Array.from(env.doc.querySelectorAll('#partyGrid .ring-label')).map(e => e.textContent.trim());
    const nums = []; let sawNonNum = false;
    labels.forEach(t => { const n = parseInt(t, 10); if (t.endsWith('/100')) { assert.ok(!sawNonNum, 'pourcentage après un parti sans pourcentage'); nums.push(n); } else sawNonNum = true; });
    assert.ok(nums.length >= 8, String(nums.length)); nums.forEach((v, i) => { if (i) assert.ok(v <= nums[i - 1]); });
  });
  test('MoDem et UDR restent partiels, tandis que l’UDI reçoit un indice quand les réponses couvrent ses positions', () => {
    const udi = env.doc.querySelector('[data-party="udi"]'); const comparable = log.choice.filter(c => c.pos !== 'dk' && typeof c.q.stances.udi === 'number').length; assert.ok(udi); assert.strictEqual(comparable, 1); assert.ok(udi.textContent.includes('Pas de score classé')); assert.ok(env.doc.getElementById('partyGrid').textContent.includes('Pas de score classé'));
  });
  test('chaque carte a une légende explicative (jamais un pourcentage nu)', () => cards.forEach(c => assert.ok(c.querySelector('.match-caption').textContent.length > 20)));
  click(env, cards[0].querySelector('.party-card-text'));
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
  const cb2 = env.doc.querySelector('[data-compare="pp"]'); cb2.checked = true; cb2.dispatchEvent(new env.win.Event('change', { bubbles: true }));
  click(env, env.doc.querySelector('[data-nav="compare"]'));
  test('le comparateur affiche les 6 thèmes ET une ligne par question concrète répondue', () => {
    const rows = env.doc.querySelectorAll('#compareContent tbody tr'); assert.strictEqual(rows.length, DIM_KEYS.length + log.choice.filter(c => c.pos !== 'dk').length);
    assert.ok(env.doc.getElementById('compareContent').innerHTML.includes('<th>LE</th>') && env.doc.getElementById('compareContent').innerHTML.includes('<th>PP</th>'));
  });
  openMethodScreen();
  test('la page Méthode liste les 6 thèmes et toutes les sources de recoupement (liens https)', () => {
    DIM_KEYS.forEach(k => assert.ok(decode(env.doc.getElementById('methodDims').innerHTML).includes(DIMENSIONS[k].name), k));
    const links = env.doc.querySelectorAll('#methodSources a'); assert.strictEqual(links.length, SOURCES.length);
    links.forEach(a => assert.ok(a.href.startsWith('https://')));
  });
  click(env, env.doc.querySelector('[data-nav="themes"]'));
  test('l’onglet Thèmes charge ses données et affiche les propositions', () => {
    assert.ok(env.doc.querySelectorAll('#themeDetailCard .theme-candidate-card').length > 0);
  });
  click(env, env.doc.querySelector('[data-nav="polls"]'));
  test('l’onglet Sondages charge ses données et affiche la moyenne', () => {
    assert.ok(env.doc.querySelectorAll('#pollsContent .poll-bar-item').length > 0);
  });
  openMethodScreen();
  test('la page Méthode explique pourquoi le site a été créé', () => {
    const t = env.doc.getElementById('screen-method').textContent; assert.ok(t.includes('À l’approche des élections')); assert.ok(t.includes('mieux comprendre les candidats'));
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
    test('l’accueil est actif avec le titre et le bouton de départ', () => {
      assert.ok(isActive(e2, 'home')); assert.ok(e2.doc.getElementById('homeTitle').textContent.includes('Vos idées')); assert.ok(e2.doc.getElementById('btnStart'));
    });
    test('sans réponse, la reprise reste cachée et Mon profil affiche une invitation', () => {
      assert.strictEqual(e2.doc.getElementById('resumeBanner').hidden, true);
      assert.strictEqual(e2.doc.getElementById('navResults').disabled, false);
      click(e2, e2.doc.getElementById('navResults'));
      assert.ok(isActive(e2, 'results'));
      assert.ok(e2.doc.getElementById('resultsContent').textContent.includes('Commencez le test pour découvrir votre profil'));
      assert.ok(e2.doc.getElementById('btnStartFromProfile'));
      click(e2, e2.doc.getElementById('navHome'));
    });
    test('l’annuaire des partis reste consultable avant le test', () => assert.strictEqual(e2.doc.getElementById('navParties').disabled, false));
    test('la bannière respecte hidden malgré son display flex', () => {
      const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
      assert.ok(/\.resume-banner\[hidden\]\s*\{\s*display:\s*none/.test(css));
    });
    test('la page charge les données des thèmes et sondages avant app.js', () => {
      const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
      assert.ok(html.indexOf('themes-and-polls.js') >= 0); assert.ok(html.indexOf('themes-and-polls.js') < html.indexOf('app.js'));
    });
    test('Faire un don affiche l’explication et ouvre la cagnotte fournie', () => {
      assert.ok(e2.doc.getElementById('navDonateQuick'));
      click(e2, e2.doc.getElementById('navDonateQuick')); assert.ok(isActive(e2, 'donate'));
      const link = e2.doc.querySelector('#screen-donate a.btn-donate');
      assert.strictEqual(link.href, 'https://www.onparticipe.fr/c/woesXZj5');
      const t = e2.doc.getElementById('screen-donate').textContent;
      assert.ok(t.includes('hébergement du site web')); assert.ok(t.includes('toutes ses mises à jour'));
      click(e2, e2.doc.getElementById('navHome'));
    });
    test('le premier écran de question affiche le bloc « En clair » quand un terme le demande', () => {
      click(e2, e2.doc.getElementById('btnStart')); assert.strictEqual(e2.doc.getElementById('plainBox').hidden, false);
      assert.ok(e2.doc.getElementById('plainText').textContent.length > 20);
    });
    test('la vue « échelle » est visible et la vue « choix » masquée pendant les 22 premières questions', () => {
      assert.strictEqual(e2.doc.getElementById('viewScale').hidden, false); assert.strictEqual(e2.doc.getElementById('viewChoice').hidden, true);
      assert.strictEqual(e2.doc.querySelectorAll('#scaleButtons .scale-btn').length, 5);
    });
    test('il n’y a plus de ligne « importance » sous les questions', () => assert.strictEqual(e2.doc.querySelectorAll('.imp-btn, #impChoices').length, 0));
  }
  test('aucune erreur JavaScript dans aucun de ces parcours', () => H.assertNoErrors());

  T.done();
})();

