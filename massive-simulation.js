/* Simulation déterministe à grande échelle du moteur de classement.
   MASSIVE_RUNS permet de régler le volume sans changer la graine de référence. */
'use strict';
const assert = require('assert');
const { QUESTIONS, PARTIES, DIM_KEYS } = require('./data.js');
const S = require('./scoring.js');

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function longestRun(values) {
  let best = 0, current = 0, prev;
  for (const value of values) { current = value === prev ? current + 1 : 1; prev = value; best = Math.max(best, current); }
  return best;
}
const RUNS = Math.max(1, Number(process.env.MASSIVE_RUNS) || 1000000);
const FLIP_RUNS = Math.max(1, Number(process.env.FLIP_RUNS) || 100000);
const rng = mulberry32(20261025);
const partyById = Object.fromEntries(PARTIES.map(p => [p.id, p]));
let nullMatchCount = 0, leaders = new Map(), checkedScores = 0;

for (let run = 0; run < RUNS; run++) {
  const sourceParty = PARTIES[run % PARTIES.length];
  const latent = {};
  for (const dim of DIM_KEYS) {
    const partyPosition = sourceParty.positions[dim];
    latent[dim] = typeof partyPosition === 'number' && rng() < 0.75
      ? partyPosition
      : Math.round((rng() * 4) - 2);
  }

  const answers = {};
  for (const q of QUESTIONS) {
    const noise = rng() < 0.18 ? (rng() < 0.5 ? -1 : 1) : 0;
    answers[q.id] = clamp(Math.round(latent[q.dim] + noise), -2, 2);
  }
  const dimensions = S.computeDimensionResults(answers, QUESTIONS);
  const overall = S.computeOverall(dimensions);
  assert.ok(Number.isFinite(overall.score), 'score global non fini au profil ' + run);
  for (const dim of DIM_KEYS) {
    assert.ok(Number.isFinite(dimensions[dim].score), 'score de thème non fini : ' + dim);
    assert.ok(dimensions[dim].score >= -2 && dimensions[dim].score <= 2, 'score hors limites : ' + dim);
  }
  const ranked = S.computePartyMatches(dimensions, PARTIES);
  assert.strictEqual(new Set(ranked.map(m => m.party.id)).size, PARTIES.length, 'parti dupliqué au profil ' + run);
  let sawPartial = false, previous = Infinity;
  for (const match of ranked) {
    if (match.matchPercent === null) { nullMatchCount++; sawPartial = true; continue; }
    assert.ok(Number.isFinite(match.matchPercent), 'pourcentage non fini au profil ' + run);
    assert.ok(match.matchPercent >= 0 && match.matchPercent <= 100, 'pourcentage hors limites au profil ' + run);
    assert.ok(!sawPartial, 'comparaison partielle intercalée dans le classement');
    assert.ok(match.matchPercent <= previous, 'classement non décroissant au profil ' + run);
    previous = match.matchPercent;
  }
  const leader = ranked.find(m => m.matchPercent !== null);
  if (leader) leaders.set(leader.party.id, (leaders.get(leader.party.id) || 0) + 1);
  checkedScores++;
}

let flipChecks = 0;
for (let run = 0; run < FLIP_RUNS; run++) {
  const flips = S.makeBalancedFlips(QUESTIONS, mulberry32(20261025 + run));
  const sequence = QUESTIONS.map(q => flips[q.id]);
  assert.ok(longestRun(sequence) <= 3, 'plus de 3 inversions consécutives au tirage ' + run);
  for (const dim of DIM_KEYS) {
    const group = QUESTIONS.filter(q => q.dim === dim);
    const flipped = group.filter(q => flips[q.id]).length;
    assert.ok(Math.abs(flipped - (group.length - flipped)) <= 1, 'équilibre A/B rompu : ' + dim + ' au tirage ' + run);
  }
  flipChecks++;
}

console.log('Simulation déterministe terminée :');
console.log('  ' + checkedScores.toLocaleString('fr-FR') + ' profils générés, calculs de 6 thèmes et classement de ' + PARTIES.length + ' formations.');
console.log('  ' + flipChecks.toLocaleString('fr-FR') + ' tirages A/B contrôlés (équilibre par thème et séries ≤ 3).');
console.log('  ' + nullMatchCount.toLocaleString('fr-FR') + ' exclusions partielles observées, sans pourcentage inventé.');
console.log('  Leaders observés : ' + Array.from(leaders.entries()).map(([id, n]) => partyById[id].short + ' ' + n.toLocaleString('fr-FR')).join(' · '));
