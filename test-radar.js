'use strict';
const assert = require('assert');
const D = require('./data.js');
const Radar = require('./radar.js');

const report = Radar.audit({ seeds: 2000, profiles: 1000, simRuns: 5000 });
assert.ok(report && report.counts && Array.isArray(report.findings), 'rapport interne absent ou incomplet');
assert.ok(report.level !== 'error', 'l’audit interne a détecté une erreur critique');
assert.strictEqual(report.counts.questions, 22, 'compte des questions d’orientation');
assert.strictEqual(report.counts.parties, 16, 'compte des formations');
assert.strictEqual(D.DEPARTAGE.length, 27, 'compte des questions de départage');
assert.ok(report.findings.every(f => f.level !== 'error'), 'une erreur subsiste dans les diagnostics');
const missingCandidateSources = D.PARTIES.filter(p => !p.statusSource);
assert.deepStrictEqual(missingCandidateSources.map(p => p.id), [], 'statut de candidature sans source');
const unsourcedQuestions = D.DEPARTAGE.filter(q => !q.sourceIds || !q.sourceIds.length);
assert.deepStrictEqual(unsourcedQuestions.map(q => q.id), [], 'question de départage sans source');
console.log('Audit interne validé : ' + report.score + '/100 (' + report.level + ').');
console.log(report.findings.filter(f => f.level === 'warn').map(f => '  À surveiller : ' + f.title).join('\n') || 'Aucun avertissement.');
