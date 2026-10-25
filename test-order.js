/* Ordre d'affichage aléatoire : prouve, par l'interface réelle, qu'il ne
   modifie JAMAIS le résultat (le bug de la V5.1 était exactement l'inverse :
   la valeur enregistrée ne suivait pas l'ordre affiché). */
const assert = require('assert');
const H = require('./helpers.js');
const { D, S, makeDom, click, savedState, readScale, answerScale, drive, runner } = H;
const { QUESTIONS, DIM_KEYS } = D;
const T = runner('Ordre aléatoire (interface)');
const { section, test } = T;

// Une graine donnant chaque état d'inversion pour la 1re question
function envWithFlip(wantFlip) {
  for (let seed = 1; seed < 200; seed++) {
    const env = makeDom({ seed });
    click(env, env.doc.getElementById('btnStart'));
    if (readScale(env).flip === wantFlip) return env;
  }
  throw new Error('aucune graine trouvée');
}

section('Chaque bouton enregistre le sens du TEXTE choisi, que A/B soient inversés ou non');
[false, true].forEach(flip => {
  const label = flip ? 'A/B inversés' : 'A/B dans l’ordre du fichier';
  const env = envWithFlip(flip);
  const r = readScale(env);
  test(label + ' : la proposition affichée en A est bien ' + (flip ? 'la B du fichier' : 'la A du fichier'), () => {
    assert.strictEqual(r.shownA, flip ? r.q.b : r.q.a); assert.strictEqual(r.shownB, flip ? r.q.a : r.q.b);
  });
  [-2, -1, 0, 1, 2].forEach(v => {
    test(label + ' : bouton affiché « ' + ['Beaucoup plus A', 'Plutôt A', 'Entre les deux', 'Plutôt B', 'Beaucoup plus B'][v + 2] + ' » → valeur enregistrée ' + ((flip ? -v : v) || 0), () => {
      click(env, env.doc.querySelectorAll('#scaleButtons .scale-btn')[v + 2]);
      const stored = savedState(env).answers[r.q.id];
      assert.strictEqual(stored, (flip ? -v : v) || 0);
      // sens : choisir « beaucoup plus A » = préférer le texte AFFICHÉ en A
      if (v === -2) assert.strictEqual(stored === -2 ? r.q.a : r.q.b, r.shownA);
      if (v === 2) assert.strictEqual(stored === -2 ? r.q.a : r.q.b, r.shownB);
    });
  });
  test(label + ' : le bouton choisi reste visuellement sélectionné après un nouvel affichage', () => {
    click(env, env.doc.querySelectorAll('#scaleButtons .scale-btn')[0]); // « Beaucoup plus A »
    const sel = env.doc.querySelector('#scaleButtons .scale-btn.sel'); assert.ok(sel && sel.textContent === 'Beaucoup plus A');
  });
  test(label + ' : « je ne sais pas » enregistre « dk », quel que soit l’affichage', () => {
    click(env, env.doc.getElementById('dkBtn')); assert.strictEqual(savedState(env).answers[r.q.id], 'dk');
  });
});
test('les explications « clarify » suivent leur proposition quand A/B sont inversés', () => {
  const q = QUESTIONS.find(x => x.clarifyA);
  for (let seed = 1; seed < 400; seed++) {
    const env = makeDom({ seed });
    click(env, env.doc.getElementById('btnStart'));
    for (let i = 0; i < QUESTIONS.length; i++) {
      const r = readScale(env);
      if (r.q.id === q.id) {
        const shownFirstClarify = !env.doc.getElementById('clarifyA').hidden ? env.doc.getElementById('clarifyA').textContent : null;
        const shownSecondClarify = !env.doc.getElementById('clarifyB').hidden ? env.doc.getElementById('clarifyB').textContent : null;
        // clarifyA du fichier explique la proposition A du fichier : elle doit rester sous elle
        if (r.flip) { assert.strictEqual(shownSecondClarify, q.clarifyA); assert.strictEqual(shownFirstClarify, null); }
        else { assert.strictEqual(shownFirstClarify, q.clarifyA); assert.strictEqual(shownSecondClarify, null); }
        if (r.flip) return; // cas inversé vérifié : terminé
        break;
      }
      answerScale(env, 0); click(env, env.doc.getElementById('btnNext'));
    }
  }
  throw new Error('cas inversé non rencontré');
});

section('Le résultat ne dépend pas de l’ordre affiché : une même opinion donne le même résultat');
{
  const results = [];
  for (let seed = 1; seed <= 25; seed++) {
    const env = makeDom({ seed });
    drive(env, { scale: () => -2, stopAt: 'checkpoint' }); // « je préfère toujours le texte A du fichier » = pôle gauche
    const dr = S.computeDimensionResults(savedState(env).answers, QUESTIONS);
    results.push({ seed, dr, o: S.computeOverall(dr) });
  }
  test('25 ordres différents, même opinion (toujours le texte de gauche) : scores de thème strictement identiques', () => {
    results.forEach(r => DIM_KEYS.forEach(k => assert.strictEqual(r.dr[k].score, -2, 'seed ' + r.seed + ' ' + k)));
  });
  test('… et même étiquette globale « Plutôt à gauche » à chaque fois', () => results.forEach(r => assert.strictEqual(r.o.label, 'Plutôt à gauche')));
  test('idem pour le texte de droite : « Plutôt à droite » quel que soit l’ordre (25 tirages)', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const env = makeDom({ seed }); drive(env, { scale: () => 2, stopAt: 'checkpoint' });
      assert.strictEqual(S.computeOverall(S.computeDimensionResults(savedState(env).answers, QUESTIONS)).label, 'Plutôt à droite', 'seed ' + seed);
    }
  });
  test('une opinion nuancée (mêmes réponses sémantiques variées) donne exactement les mêmes scores avec deux ordres différents', () => {
    const pattern = q => [-2, -1, 0, 1, 2][QUESTIONS.indexOf(q) % 5];
    const run = seed => { const env = makeDom({ seed }); drive(env, { scale: pattern, stopAt: 'checkpoint' }); return S.computeDimensionResults(savedState(env).answers, QUESTIONS); };
    const a = run(3), b = run(41);
    DIM_KEYS.forEach(k => assert.strictEqual(a[k].score, b[k].score, k));
  });
}

section('Équilibre et absence de motif, vus depuis l’interface');
{
  const flipsOf = seed => { const env = makeDom({ seed }); drive(env, { stopAt: 'checkpoint' }); return savedState(env).flips; };
  const longest = arr => { let b = 0, r = 0, p; arr.forEach((v, i) => { r = (i > 0 && v === p) ? r + 1 : 1; p = v; if (r > b) b = r; }); return b; };
  const sample = [2, 9, 17, 23, 31].map(flipsOf);
  test('dans l’application réelle, chaque thème est équilibré (à une question près) et jamais plus de 3 de suite', () => {
    sample.forEach((f, i) => {
      DIM_KEYS.forEach(k => { const qs = QUESTIONS.filter(q => q.dim === k); const t = qs.filter(q => f[q.id]).length; assert.ok(Math.abs(t - (qs.length - t)) <= 1, 'tirage ' + i + ' ' + k); });
      assert.ok(longest(QUESTIONS.map(q => f[q.id])) <= 3, 'tirage ' + i);
    });
  });
  test('les 5 tirages sont tous différents : l’ordre change réellement d’une personne à l’autre', () => {
    assert.strictEqual(new Set(sample.map(f => QUESTIONS.map(q => f[q.id] ? 1 : 0).join(''))).size, 5);
  });
  test('à l’écran, le texte de gauche n’est PAS toujours en A : il est en A pour 8 à 13 des 22 questions', () => {
    sample.forEach(f => { const aFirst = QUESTIONS.filter(q => !f[q.id]).length; assert.ok(aFirst >= 8 && aFirst <= 14, String(aFirst)); });
  });
}

section('Persistance : l’ordre ne change pas quand on revient en arrière ou qu’on reprend plus tard');
{
  const env = makeDom({ seed: 11 });
  click(env, env.doc.getElementById('btnStart'));
  const seen = [];
  for (let i = 0; i < 5; i++) { const r = readScale(env); seen.push(r.shownA); answerScale(env, 1); click(env, env.doc.getElementById('btnNext')); }
  test('« Précédent » ré-affiche chaque question exactement dans le même ordre', () => {
    for (let i = 4; i >= 0; i--) { click(env, env.doc.getElementById('btnBack')); assert.strictEqual(readScale(env).shownA, seen[i], 'question ' + i); }
  });
  test('après rechargement de la page, la reprise ré-affiche la même question dans le même ordre', () => {
    const stored = env.win.localStorage.getItem('votezbien:v7:state');
    const env2 = makeDom({ seed: 999, storage: { 'votezbien:v7:state': stored } });
    click(env2, env2.doc.getElementById('btnResume'));
    const idx = savedState(env2).index; assert.strictEqual(readScale(env2).shownA, seen[idx]);
  });
  test('chaque réponse enregistrée a son sens d’affichage mémorisé (pour toujours pouvoir la relire)', () => {
    const st = savedState(env); Object.keys(st.answers).forEach(id => assert.ok(typeof st.flips[id] === 'boolean', id));
  });
}

section('Questions de départage : ordre des options aléatoire, valeur liée au texte choisi');
{
  const env = makeDom({ seed: 5 });
  drive(env, { scale: () => -1, stopAt: 'checkpoint' });
  click(env, env.doc.getElementById('btnContinueDiag'));
  const q = H.readChoice(env);
  const texts = H.choiceTexts(env);
  test('la question de départage affichée est connue et ses options sont toutes présentes', () => { assert.ok(q); assert.deepStrictEqual(texts.slice().sort(), q.options.map(o => o.text).sort()); });
  test('l’ordre affiché des options n’est pas celui du fichier (jamais croissant ni décroissant)', () => {
    const inFile = q.options.map(o => o.text); assert.notDeepStrictEqual(texts, inFile); assert.notDeepStrictEqual(texts, inFile.slice().reverse());
  });
  q.options.forEach(o => test('cliquer « ' + o.short + ' » enregistre la position ' + o.pos + ' (le texte choisi), pas sa place à l’écran', () => {
    H.answerChoice(env, o.pos); assert.strictEqual(savedState(env).dpAnswers[q.id], o.pos);
    assert.strictEqual(env.doc.querySelector('#choiceList .choice-btn.sel').textContent, o.text);
  }));
  test('« Précédent » puis retour : mêmes options dans le même ordre', () => {
    click(env, env.doc.getElementById('btnNext')); click(env, env.doc.getElementById('btnBack'));
    assert.deepStrictEqual(H.choiceTexts(env), texts);
  });
}
test('aucune erreur JavaScript dans aucun de ces parcours', () => H.assertNoErrors());
T.done();
