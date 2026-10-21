/* Outils communs aux suites de tests d'interface.
   Principe : on pilote l'application par ses boutons, comme une personne, et
   on lit le TEXTE réellement affiché pour savoir quelle question est posée et
   dans quel sens (A/B inversés ou non). Aucun test ne suppose que « A = la
   proposition de gauche » : c'est précisément ce que l'ordre aléatoire
   supprime. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const ROOT = fs.existsSync(path.join(__dirname, 'data.js')) ? __dirname : path.join(__dirname, '..');
const D = require(path.join(ROOT, 'data.js'));
const S = require(path.join(ROOT, 'scoring.js'));


function makeDom(opts) {
  opts = opts || {};
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { url: 'https://example.invalid/index.html', runScripts: 'dangerously', pretendToBeVisual: true });
  const win = dom.window;
  if (opts.seed !== undefined) win.Math.random = S.seededRandom(opts.seed); // avant le chargement des scripts
  if (opts.storage) Object.keys(opts.storage).forEach(k => win.localStorage.setItem(k, opts.storage[k]));
  const errors = [];
  win.onerror = (m) => errors.push(String(m));
  // jsdom n'implémente pas scrollTo (tous les navigateurs réels le font) : on le neutralise pour que
  // son avertissement ne noie pas d'éventuelles VRAIES erreurs dans les journaux de test.
  win.scrollTo = () => {};
  // De VRAIES balises <script> (comme un navigateur), pas eval() : eval isole
  // la portée lexicale de chaque fichier et fausserait le partage des `const`.
  ['data.js', 'themes-and-polls.js', 'scoring.js', 'app.js'].forEach(f => {
    const el = win.document.createElement('script');
    el.textContent = fs.readFileSync(path.join(ROOT, f), 'utf8');
    win.document.body.appendChild(el);
  });
  const env = { dom, win, doc: win.document, errors };
  makeDom.all.push(env);
  return env;
}
makeDom.all = [];
// Échoue si UN SEUL des environnements créés dans ce fichier de test a levé une erreur JavaScript.
function assertNoErrors() {
  const bad = [];
  makeDom.all.forEach((e, i) => e.errors.forEach(m => bad.push('env ' + i + ' : ' + m)));
  if (bad.length) throw new Error(bad.length + ' erreur(s) JS : ' + bad.slice(0, 3).join(' | '));
  if (!makeDom.all.length) throw new Error('aucun environnement créé : contrôle vide');
}

function click(env, el) { if (el) el.dispatchEvent(new env.win.MouseEvent('click', { bubbles: true })); }
function isActive(env, name) { return env.doc.getElementById('screen-' + name).classList.contains('active'); }
function savedState(env) { const raw = env.win.localStorage.getItem('votezbien:v7:state'); return raw ? JSON.parse(raw) : null; }

// Question générale affichée : on retrouve laquelle par le texte de la 1re proposition.
const TEXT_TO_SIDE = {};
D.QUESTIONS.forEach(q => { TEXT_TO_SIDE[q.a] = { q, side: 'a' }; TEXT_TO_SIDE[q.b] = { q, side: 'b' }; });
function readScale(env) {
  const hit = TEXT_TO_SIDE[env.doc.getElementById('propA').textContent];
  return hit ? { q: hit.q, flip: hit.side === 'b', shownA: env.doc.getElementById('propA').textContent, shownB: env.doc.getElementById('propB').textContent } : null;
}
// Répond avec une valeur SÉMANTIQUE (-2 = la proposition A du fichier de données), quel que soit l'affichage.
function answerScale(env, semantic) {
  const r = readScale(env);
  if (semantic === 'dk') { click(env, env.doc.getElementById('dkBtn')); return r; }
  const displayed = r.flip ? -semantic : semantic;
  click(env, env.doc.querySelectorAll('#scaleButtons .scale-btn')[displayed + 2]);
  return r;
}

const STEM_TO_Q = {};
D.DEPARTAGE.forEach(q => { STEM_TO_Q[q.q] = q; });
function readChoice(env) { return STEM_TO_Q[env.doc.getElementById('qDim').textContent] || null; }
function choiceTexts(env) { return Array.from(env.doc.querySelectorAll('#choiceList .choice-btn')).map(b => b.textContent); }
function answerChoice(env, pos) {
  const q = readChoice(env);
  if (pos === 'dk') { click(env, env.doc.getElementById('dkBtnChoice')); return q; }
  click(env, Array.from(env.doc.querySelectorAll('#choiceList .choice-btn')).find(b => b.dataset.pos === String(pos)));
  return q;
}

// Dithering : la moyenne des réponses ENTIÈRES suit la position « vraie » (une personne ne répond pas -1,4).
function makeAnswerer() {
  const carry = {}; D.DIM_KEYS.forEach(k => { carry[k] = 0; });
  return (dim, latent) => {
    if (latent === null || latent === undefined) return 'dk';
    const target = latent + carry[dim];
    const a = Math.max(-2, Math.min(2, Math.round(target)));
    carry[dim] = target - a;
    return a;
  };
}
// Option la plus proche d'une position cible (null => « je ne sais pas »).
function nearestOption(q, target) {
  if (typeof target !== 'number') return 'dk';
  return q.options.reduce((b, o) => Math.abs(o.pos - target) < Math.abs(b.pos - target) ? o : b).pos;
}

/* Pilote tout le parcours.
   opts.scale(q)      -> valeur sémantique | 'dk'   (21 questions)
   opts.choice(q)     -> position d'option | 'dk'   (questions de départage)
   opts.priorities    -> thèmes à toucher au palier
   opts.stopAt        -> 'checkpoint' pour s'arrêter au palier */
function drive(env, opts) {
  opts = opts || {};
  const log = { scale: [], choice: [], checkpointText: null, checkpointHtml: null };
  click(env, env.doc.getElementById('btnStart'));
  for (let guard = 0; guard < 150; guard++) {
    if (isActive(env, 'checkpoint')) {
      log.checkpointText = env.doc.getElementById('checkpointContent').textContent;
      log.checkpointHtml = env.doc.getElementById('checkpointContent').innerHTML;
      if (opts.stopAt === 'checkpoint') return log;
      (opts.priorities || []).forEach(k => click(env, env.doc.querySelector('#prioGrid .prio-card[data-dim="' + k + '"]')));
      click(env, env.doc.getElementById('btnContinueDiag'));
      continue;
    }
    if (!isActive(env, 'quiz')) break;
    if (!env.doc.getElementById('viewChoice').hidden) {
      const q = readChoice(env);
      const pos = opts.choice ? opts.choice(q) : 'dk';
      answerChoice(env, pos);
      log.choice.push({ q, pos });
    } else {
      const r = readScale(env);
      const v = opts.scale ? opts.scale(r.q) : 0;
      answerScale(env, v);
      log.scale.push({ q: r.q, flip: r.flip, v });
    }
    click(env, env.doc.getElementById('btnNext'));
  }
  log.resultsHtml = env.doc.getElementById('resultsContent').innerHTML;
  log.resultsText = env.doc.getElementById('resultsContent').textContent;
  return log;
}

// Mini lanceur de tests
function runner(title) {
  let passed = 0, failed = 0;
  const api = {
    section(t) { console.log('\n' + t); },
    test(name, fn) { try { fn(); passed++; console.log('  ✓ ' + name); } catch (e) { failed++; console.log('  ✗ ' + name + '\n      ' + String(e.message).split('\n')[0]); } },
    done() {
      console.log('\n' + '='.repeat(60));
      console.log(title + ' : ' + passed + ' vérifications réussies, ' + failed + ' échouées.');
      process.exitCode = failed > 0 ? 1 : 0;
    }
  };
  return api;
}

module.exports = { D, S, makeDom, assertNoErrors, click, isActive, savedState, readScale, answerScale, readChoice, choiceTexts, answerChoice, makeAnswerer, nearestOption, drive, runner };
