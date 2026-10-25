/* Preuve bout-en-bout, à travers l'interface réelle ET avec un ordre d'affichage
   aléatoire, que le bug critique original reste corrigé : répondre
   systématiquement à gauche n'affiche jamais « droite » (et inversement), quel
   que soit l'ordre dans lequel A et B sont affichés. */
const assert = require('assert');
const H = require('./helpers.js');
const { D, makeDom, drive, nearestOption, runner } = H;
const T = runner('Convention gauche/droite (bout en bout)');
const { section, test } = T;
const LEFT = ['La France insoumise', 'Parti communiste français', 'Lutte Ouvrière', 'Les Écologistes', 'Place publique'];
const RIGHT = ['Rassemblement National', 'Reconquête', 'Union des droites pour la République', 'Debout la France', 'Les Républicains'];
const label = t => (t.match(/Plutôt à gauche|Centre-gauche|Plutôt au centre|Centre-droit|Plutôt à droite|Profil non déterminé/) || [])[0];
const top = html => { const m = html.match(/(?:Le plus proche de vous|En tête, de très peu)<\/span>[\s\S]{0,400}?<h3>([^<]+)<\/h3>/); return m ? m[1] : null; };

const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
const runs = { left: [], right: [] };
section('Réponses systématiquement à gauche (valeur sémantique -2), 8 ordres d’affichage différents');
seeds.forEach(seed => {
  const env = makeDom({ seed });
  const log = drive(env, { scale: () => -2, choice: q => nearestOption(q, q.stances.lfi) });
  runs.left.push({ seed, lab: label(log.resultsText), top: top(log.resultsHtml), flips: log.scale.filter(x => x.flip).length });
});
runs.left.forEach(r => test('ordre n°' + r.seed + ' (' + r.flips + ' questions inversées sur 22) → « ' + r.lab + ' » · parti en tête : ' + r.top, () => {
  assert.strictEqual(r.lab, 'Plutôt à gauche'); assert.ok(LEFT.includes(r.top), r.top);
}));
test('les 8 ordres affichent bien des nombres différents de questions inversées (l’ordre varie réellement)', () => assert.ok(new Set(runs.left.map(r => r.flips)).size >= 2));

section('Réponses systématiquement à droite (valeur sémantique +2), 8 ordres d’affichage différents');
seeds.forEach(seed => {
  const env = makeDom({ seed: seed + 100 });
  const log = drive(env, { scale: () => 2, choice: q => nearestOption(q, q.stances.reconquete) });
  runs.right.push({ seed, lab: label(log.resultsText), top: top(log.resultsHtml), flips: log.scale.filter(x => x.flip).length });
});
runs.right.forEach(r => test('ordre n°' + r.seed + ' (' + r.flips + ' inversées) → « ' + r.lab + ' » · parti en tête : ' + r.top, () => {
  assert.strictEqual(r.lab, 'Plutôt à droite'); assert.ok(RIGHT.includes(r.top), r.top);
}));
test('jamais « gauche » côté droite ni « droite » côté gauche, sur les 16 parcours', () => {
  runs.left.forEach(r => assert.ok(!/droite/.test(r.lab))); runs.right.forEach(r => assert.ok(!/gauche/.test(r.lab)));
});
test('aucune erreur JavaScript dans aucun des 16 parcours', () => H.assertNoErrors());
T.done();
