/* Parcours : sauvegarde et reprise, navigation, annulation d'une réponse,
   priorités, chemins limites (tout en « je ne sais pas », sans questions concrètes). */
const assert = require('assert');
const H = require('./helpers.js');
const { D, S, makeDom, click, isActive, savedState, readScale, answerScale, readChoice, answerChoice, drive, nearestOption, runner } = H;
const T = runner('Parcours (interface)');
const { section, test } = T;
const tick = () => new Promise(r => setTimeout(r, 40));
const KEY = 'votezbien:v7:state';
const $ = (env, id) => env.doc.getElementById(id);
const next = env => click(env, $(env, 'btnNext'));
const back = env => click(env, $(env, 'btnBack'));
// Démarre et répond (valeur sémantique 1) à n questions générales
function startAndAnswer(env, n) { click(env, $(env, 'btnStart')); for (let i = 0; i < n; i++) { answerScale(env, 1); next(env); } }
// Va jusqu'à la 1re question concrète (palier franchi)
function toFirstChoice(env, priorities) {
  drive(env, { scale: () => -1, stopAt: 'checkpoint' });
  (priorities || []).forEach(k => click(env, env.doc.querySelector('#prioGrid .prio-card[data-dim="' + k + '"]')));
  click(env, $(env, 'btnContinueDiag'));
}

(async () => {
  section('Sauvegarde et reprise');
  {
    const fresh = makeDom({ seed: 2 }); await tick();
    test('sans réponse enregistrée, la bannière de reprise est masquée', () => {
      assert.strictEqual($(fresh, 'resumeBanner').hidden, true); assert.strictEqual($(fresh, 'btnResume').hidden, true);
    });
    const env = makeDom({ seed: 3 }); startAndAnswer(env, 7);
    const stored = env.win.localStorage.getItem(KEY);
    test('l’état est enregistré après 7 réponses (question n° 8 en cours)', () => { const st = savedState(env); assert.strictEqual(st.index, 7); assert.strictEqual(Object.keys(st.answers).length, 7); });
    const env2 = makeDom({ seed: 99, storage: { [KEY]: stored } }); await tick();
    test('la bannière de reprise s’affiche au chargement', () => assert.strictEqual($(env2, 'resumeBanner').hidden, false));
    click(env2, $(env2, 'btnResume'));
    test('la reprise ramène à la question n° 8, dans le même ordre d’affichage', () => {
      assert.ok($(env2, 'progressLabel').textContent.startsWith('8 /')); assert.strictEqual(readScale(env2).shownA, readScale(env).shownA);
    });
    // palier
    const envC = makeDom({ seed: 4 }); drive(envC, { scale: () => 1, stopAt: 'checkpoint' });
    const envC2 = makeDom({ seed: 5, storage: { [KEY]: envC.win.localStorage.getItem(KEY) } }); await tick();
    click(envC2, $(envC2, 'btnResume'));
    test('une reprise faite au palier ramène au palier (pas à une question)', () => assert.ok(isActive(envC2, 'checkpoint')));
    // départage
    const envD = makeDom({ seed: 6 }); toFirstChoice(envD);
    answerChoice(envD, 'dk'); next(envD);
    const envD2 = makeDom({ seed: 7, storage: { [KEY]: envD.win.localStorage.getItem(KEY) } }); await tick();
    click(envD2, $(envD2, 'btnResume'));
    test('une reprise en cours de questions concrètes ramène à la bonne question concrète (n° 2)', () => {
      assert.ok(isActive(envD2, 'quiz')); assert.strictEqual($(envD2, 'viewChoice').hidden, false); assert.ok($(envD2, 'progressLabel').textContent.startsWith('Précision 2'));
      assert.strictEqual(readChoice(envD2).id, savedState(envD).dp[1]);
    });
    // test terminé
    const envF = makeDom({ seed: 8 }); drive(envF, { scale: () => -1, choice: q => nearestOption(q, q.stances.lfi) });
    const envF2 = makeDom({ seed: 9, storage: { [KEY]: envF.win.localStorage.getItem(KEY) } }); await tick();
    test('après un test terminé, « Mon profil » et « Les partis » sont disponibles dès le rechargement', () => {
      assert.strictEqual($(envF2, 'navResults').disabled, false); click(envF2, $(envF2, 'navResults'));
      assert.ok(isActive(envF2, 'results')); assert.ok(/Plutôt à|Centre/.test($(envF2, 'resultsContent').textContent));
    });
    // anciennes sauvegardes et sauvegardes corrompues
    const old = makeDom({ storage: { 'votezbien:v6:state': JSON.stringify({ phase: 'main', index: 3, answers: { 'eco-1': 1 }, importances: {} }) } }); await tick();
    test('une sauvegarde de l’ancienne version (v6, structure différente) est ignorée, sans erreur', () => assert.strictEqual($(old, 'resumeBanner').hidden, true));
    const bad1 = makeDom({ storage: { [KEY]: '{"phase":"main"}' } }); const bad2 = makeDom({ storage: { [KEY]: '{pas du json' } }); await tick();
    test('une sauvegarde incomplète ou illisible est ignorée sans planter l’application', () => { assert.strictEqual($(bad1, 'resumeBanner').hidden, true); assert.strictEqual($(bad2, 'resumeBanner').hidden, true); });
  }

  section('Navigation précédent / suivant');
  {
    const env = makeDom({ seed: 10 }); click(env, $(env, 'btnStart'));
    test('« Précédent » est désactivé sur la toute première question', () => assert.strictEqual($(env, 'btnBack').disabled, true));
    test('« Suivant » est désactivé tant qu’on n’a pas répondu', () => assert.strictEqual($(env, 'btnNext').disabled, true));
    answerScale(env, 2); next(env);
    test('« Précédent » ramène à la question 1 avec la réponse toujours sélectionnée', () => { back(env); assert.ok($(env, 'progressLabel').textContent.startsWith('1 /')); assert.ok(env.doc.querySelector('#scaleButtons .scale-btn.sel')); });
    drive(makeDom({ seed: 1 }), {}); // (parcours indépendant, vérifié par ailleurs)
    const e2 = makeDom({ seed: 11 }); toFirstChoice(e2);
    test('depuis la 1re question concrète, « Précédent » ramène au palier', () => { back(e2); assert.ok(isActive(e2, 'checkpoint')); });
    test('« Revoir mes réponses précédentes » ramène à la 22ᵉ question', () => { click(e2, $(e2, 'btnBackToMain')); assert.ok(isActive(e2, 'quiz')); assert.ok($(e2, 'progressLabel').textContent.startsWith('22 /')); });
    const e3 = makeDom({ seed: 12 }); toFirstChoice(e3); answerChoice(e3, 0); next(e3);
    test('« Précédent » entre deux questions concrètes ré-affiche la 1re avec le choix conservé', () => { back(e3); assert.ok(e3.doc.querySelector('#choiceList .choice-btn.sel')); });
  }

  section('Modifier une réponse déjà donnée invalide les questions choisies après elle');
  {
    const env = makeDom({ seed: 13 }); toFirstChoice(env);
    for (let i = 0; i < 3; i++) { answerChoice(env, 0); next(env); }           // 3 questions répondues, la 4ᵉ affichée
    const before = savedState(env);
    back(env); back(env); back(env);                                            // retour à la question concrète n° 1
    const q1 = readChoice(env); const prev = before.dpAnswers[q1.id]; const other = q1.options.find(o => o.pos !== prev).pos;
    test('on a bien 4 questions choisies avant modification', () => assert.strictEqual(before.dp.length, 4));
    answerChoice(env, other);
    const st = savedState(env);
    test('changer la réponse n° 1 supprime les questions suivantes et leurs réponses (leur choix en dépendait)', () => {
      assert.strictEqual(st.dp.length, 1); assert.deepStrictEqual(Object.keys(st.dpAnswers), [q1.id]); assert.strictEqual(st.dpAnswers[q1.id], other);
    });
    next(env);
    test('« Suivant » recalcule alors une nouvelle question à partir de la nouvelle réponse', () => { assert.strictEqual(savedState(env).dp.length, 2); assert.ok(readChoice(env)); });
    const env2 = makeDom({ seed: 14 }); toFirstChoice(env2); const q = readChoice(env2); answerChoice(env2, 0); answerChoice(env2, 0);
    test('re-cliquer la même réponse ne supprime rien', () => { next(env2); const n = savedState(env2).dp.length; back(env2); answerChoice(env2, 0); assert.strictEqual(savedState(env2).dp.length, n); });
  }

  section('Choix des 3 priorités');
  {
    const env = makeDom({ seed: 15 }); drive(env, { scale: () => 0, stopAt: 'checkpoint' });
    const card = k => env.doc.querySelector('#prioGrid .prio-card[data-dim="' + k + '"]');
    test('six thèmes sont proposés, aucun sélectionné au départ, chacun avec sa définition', () => {
      assert.strictEqual(env.doc.querySelectorAll('#prioGrid .prio-card').length, 6); assert.strictEqual(env.doc.querySelectorAll('#prioGrid .prio-card.sel').length, 0);
      env.doc.querySelectorAll('#prioGrid .prio-def').forEach(d => assert.ok(d.textContent.length > 20));
    });
    ['ecology', 'eco', 'immig'].forEach(k => click(env, card(k)));
    test('les 3 thèmes touchés sont classés 1, 2, 3 dans l’ordre du toucher', () => {
      assert.deepStrictEqual(savedState(env).priorities, ['ecology', 'eco', 'immig']);
      // les cartes sont affichées dans l'ordre des thèmes, pas du toucher : on lit le rang de CHAQUE thème
      ['ecology', 'eco', 'immig'].forEach((k, i) => assert.strictEqual(card(k).querySelector('.prio-rank').textContent, String(i + 1), k));
      assert.strictEqual(env.doc.querySelectorAll('#prioGrid .prio-rank').length, 3);
    });
    click(env, card('soc'));
    test('un 4ᵉ thème est refusé avec un message, sans rien modifier', () => {
      assert.deepStrictEqual(savedState(env).priorities, ['ecology', 'eco', 'immig']); assert.ok($(env, 'toast').classList.contains('show')); assert.ok($(env, 'toast').textContent.includes('3 priorités'));
    });
    click(env, card('eco'));
    test('retirer une priorité garde l’ordre des autres et libère une place', () => {
      assert.deepStrictEqual(savedState(env).priorities, ['ecology', 'immig']);
      click(env, card('soc')); assert.deepStrictEqual(savedState(env).priorities, ['ecology', 'immig', 'soc']);
    });
    test('les priorités sont facultatives : on peut continuer sans en choisir', () => {
      const e2 = makeDom({ seed: 16 }); drive(e2, { scale: () => 0, stopAt: 'checkpoint' }); click(e2, $(e2, 'btnContinueDiag')); assert.ok(isActive(e2, 'quiz')); assert.deepStrictEqual(savedState(e2).priorities, []);
    });
    test('changer ses priorités après avoir commencé les questions concrètes les fait recalculer (leur choix en dépendait)', () => {
      const e3 = makeDom({ seed: 17 }); toFirstChoice(e3); answerChoice(e3, 0); next(e3);
      assert.ok(Object.keys(savedState(e3).dpAnswers).length >= 1);
      back(e3); back(e3); click(e3, e3.doc.querySelector('#prioGrid .prio-card[data-dim="ecology"]')); click(e3, $(e3, 'btnContinueDiag'));
      const st = savedState(e3); assert.deepStrictEqual(st.dpAnswers, {}); assert.strictEqual(st.dp.length, 1);
    });
    test('à l’inverse, revenir au palier sans rien changer conserve les réponses déjà données', () => {
      const e4 = makeDom({ seed: 18 }); toFirstChoice(e4); answerChoice(e4, 0); next(e4); back(e4); back(e4); click(e4, $(e4, 'btnContinueDiag'));
      assert.strictEqual(Object.keys(savedState(e4).dpAnswers).length, 1);
    });
    test('modifier une réponse générale puis reprendre fait aussi recalculer les questions concrètes', () => {
      const e5 = makeDom({ seed: 19 }); toFirstChoice(e5); answerChoice(e5, 0); next(e5); back(e5); back(e5);
      click(e5, $(e5, 'btnBackToMain')); const r = readScale(e5); answerScale(e5, r.q && savedState(e5).answers[r.q.id] === 2 ? -2 : 2); next(e5);
      click(e5, $(e5, 'btnContinueDiag')); assert.deepStrictEqual(savedState(e5).dpAnswers, {});
    });
  }

  section('Chemins limites');
  {
    const envDK = makeDom({ seed: 20 });
    const log = drive(envDK, { scale: () => 'dk', choice: () => 'dk' });
    test('tout en « je ne sais pas » : le palier annonce honnêtement qu’aucune tendance fiable n’apparaît', () => assert.ok(/ne suffisent pas encore/.test(log.checkpointText)));
    test('… des questions concrètes sont quand même proposées (au moins 4)', () => assert.ok(log.choice.length >= 4, String(log.choice.length)));
    test('… et le résultat est « Profil non déterminé », sans correspondances inventées', () => {
      assert.ok(log.resultsText.includes('Profil non déterminé')); assert.ok(!log.resultsText.includes('Les formations les plus proches de vos réponses'));
    });
    const envSkip = makeDom({ seed: 21 }); drive(envSkip, { scale: () => -1, stopAt: 'checkpoint' });
    click(envSkip, $(envSkip, 'btnSkipDiag'));
    test('« Voir un résultat préliminaire sans ces questions » mène aux résultats, sans question concrète', () => {
      assert.ok(isActive(envSkip, 'results')); assert.strictEqual(savedState(envSkip).dp.length, 0);
      assert.ok(!/réponses aux questions de précision/.test($(envSkip, 'resultsContent').textContent)); // aucune réponse concrète n'est annoncée
      assert.ok(/Les formations les plus proches de vos réponses/.test($(envSkip, 'resultsContent').textContent));
    });
    test('« Refaire le test » efface la sauvegarde et laisse Mon profil accessible', () => {
      click(envSkip, $(envSkip, 'btnRedo')); assert.strictEqual(savedState(envSkip), null); assert.ok(isActive(envSkip, 'home')); assert.strictEqual($(envSkip, 'navResults').disabled, false);
      click(envSkip, $(envSkip, 'navResults')); assert.ok(isActive(envSkip, 'results')); assert.ok($(envSkip, 'resultsContent').textContent.includes('Commencez le test pour découvrir votre profil'));
    });
  }
  test('aucune erreur JavaScript dans aucun de ces parcours', () => H.assertNoErrors());
  T.done();
})();
