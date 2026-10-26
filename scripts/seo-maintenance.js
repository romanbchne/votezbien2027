#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://www.votezbien2027.fr';
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const REQUIRED = [
  'index.html',
  'a-propos/index.html',
  'methode/index.html',
  'mentions-legales/index.html',
  'confidentialite/index.html',
];
const writeSitemap = process.argv.includes('--write');
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(dir, relative, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.github') continue;
    const rel = relative ? path.posix.join(relative, entry.name) : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, rel, out);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html') && rel !== '404.html') out.push(rel.replace(/\\/g, '/'));
  }
  return out;
}

function routeFor(file) {
  const normalized = file.replace(/\\/g, '/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return '/' + normalized.slice(0, -'index.html'.length);
  return '/' + normalized;
}

function attr(tag, name) {
  const expression = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const match of tag.matchAll(expression)) {
    if (match[1].toLowerCase() === name.toLowerCase()) return match[2] ?? match[3] ?? '';
  }
  return '';
}

function meta(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) if (attr(tag, key).toLowerCase() === value.toLowerCase()) return attr(tag, 'content');
  return '';
}

function sitemapFor(pages) {
  const urls = pages.map(file => ORIGIN + routeFor(file)).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(url => '  <url><loc>' + url + '</loc></url>').join('\n') +
    '\n</urlset>\n';
}

function checkLinks(file, html) {
  const tags = html.match(/<(?:a|link|img|script|source)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const name = tag.slice(1).match(/^[a-z]+/i)?.[0]?.toLowerCase();
    const value = attr(tag, name === 'img' || name === 'script' || name === 'source' ? 'src' : 'href');
    if (!value || value.startsWith('#') || /^(?:mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    let url;
    try {
      url = new URL(value, ORIGIN + routeFor(file));
    } catch {
      fail(file + ': URL invalide : ' + value);
      continue;
    }
    const canonicalHost = new URL(ORIGIN).hostname;
    if (/^(?:www\.)?votezbien2027\.(?:fr|com|store|info)$/i.test(url.hostname) && url.hostname.toLowerCase() !== canonicalHost) {
      fail(file + ': domaine non canonique dans ' + value);
      continue;
    }
    if (url.hostname.toLowerCase() !== canonicalHost) {
      if ((name === 'img' || name === 'script' || name === 'source') && url.protocol !== 'https:') fail(file + ': ressource externe sans HTTPS : ' + value);
      continue;
    }
    if (url.protocol !== 'https:') {
      fail(file + ': lien interne sans HTTPS : ' + value);
      continue;
    }
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { fail(file + ': chemin encodé invalide : ' + value); continue; }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const resolved = path.resolve(ROOT, '.' + pathname);
    const relativePath = path.relative(ROOT, resolved);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      fail(file + ': chemin sortant du dépôt : ' + value);
      continue;
    }
    const candidates = [resolved];
    if (!path.extname(pathname)) candidates.push(resolved + '.html');
    if (!candidates.some(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())) {
      fail(file + ': lien ou ressource interne introuvable : ' + value);
    }
  }
}

const pages = walk(ROOT, '', []).sort();
for (const required of REQUIRED) if (!fs.existsSync(path.join(ROOT, required))) fail('Page principale manquante : ' + required);
if (!fs.existsSync(path.join(ROOT, 'CNAME')) || fs.readFileSync(path.join(ROOT, 'CNAME'), 'utf8').trim() !== 'www.votezbien2027.fr') fail('CNAME doit contenir exactement www.votezbien2027.fr');

const sitemap = sitemapFor(pages);
if (writeSitemap) {
  fs.writeFileSync(SITEMAP_PATH, sitemap, 'utf8');
  console.log('sitemap.xml généré depuis ' + pages.length + ' pages HTML publiques.');
} else if (!fs.existsSync(SITEMAP_PATH) || fs.readFileSync(SITEMAP_PATH, 'utf8').replace(/\r\n/g, '\n') !== sitemap) {
  fail('sitemap.xml est absent ou périmé : exécutez npm run seo:sitemap puis commitez le résultat.');
}
if (fs.existsSync(SITEMAP_PATH)) {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset\b[\s\S]*<\/urlset>\s*$/.test(xml)) fail('sitemap.xml n’est pas un document XML urlset valide.');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (new Set(locs).size !== locs.length) fail('sitemap.xml contient des URLs en double.');
  for (const loc of locs) if (!loc.startsWith(ORIGIN + '/')) fail('URL non canonique dans le sitemap : ' + loc);
}
if (!fs.existsSync(path.join(ROOT, 'robots.txt'))) fail('robots.txt est manquant.');
else {
  const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
  if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots) || !robots.includes('Sitemap: ' + ORIGIN + '/sitemap.xml')) fail('robots.txt doit autoriser le crawl et annoncer le sitemap canonique.');
  if (robots.includes('Disallow: /')) fail('robots.txt bloque tout le site.');
}

const allHtml = [...pages, '404.html'].filter(file => fs.existsSync(path.join(ROOT, file)));
const titles = new Map();
const descriptions = new Map();
for (const file of allHtml) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!/<html\b[^>]*\blang=["']fr["']/i.test(html)) fail(file + ': lang="fr" manquant.');
  if (!/<meta\b[^>]*charset=["']utf-8["']/i.test(html)) fail(file + ': encodage UTF-8 manquant.');
  if (!meta(html, 'name', 'viewport')) fail(file + ': meta viewport manquante.');
  const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1].replace(/<[^>]*>/g, '').trim();
  const description = meta(html, 'name', 'description').trim();
  if (!title) fail(file + ': title manquant.');
  else if (titles.has(title)) fail(file + ': title dupliqué avec ' + titles.get(title));
  else titles.set(title, file);
  if (!description) fail(file + ': meta description manquante.');
  else if (descriptions.has(description)) fail(file + ': meta description dupliquée avec ' + descriptions.get(description));
  else descriptions.set(description, file);
  if (file !== '404.html' && (description.length < 150 || description.length > 160)) fail(file + ': meta description hors de la plage éditoriale 150–160 caractères (' + description.length + ').');
  if (!meta(html, 'property', 'og:title') || !meta(html, 'property', 'og:description') || !meta(html, 'property', 'og:url') || !meta(html, 'property', 'og:image')) fail(file + ': métadonnées Open Graph incomplètes.');
  if (!meta(html, 'name', 'twitter:card') || !meta(html, 'name', 'twitter:title') || !meta(html, 'name', 'twitter:description') || !meta(html, 'name', 'twitter:image')) fail(file + ': métadonnées Twitter incomplètes.');
  const robots = meta(html, 'name', 'robots').toLowerCase();
  if (file === '404.html') {
    if (!robots.includes('noindex')) fail('404.html doit rester noindex.');
    if (/<link\b[^>]*rel=["']canonical["']/i.test(html)) fail('404.html ne doit pas canoniser son erreur vers une autre page.');
  } else {
    if (robots.includes('noindex')) fail(file + ': noindex inattendu.');
    const canonicalTag = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [''])[0];
    const canonical = attr(canonicalTag, 'href');
    if (canonical !== ORIGIN + routeFor(file)) fail(file + ': canonical absent ou incohérent, attendu ' + ORIGIN + routeFor(file));
    if ((html.match(/<link\b[^>]*rel=["']canonical["']/gi) || []).length !== 1) fail(file + ': une seule balise canonical est attendue.');
  }
  const images = html.match(/<img\b[^>]*>/gi) || [];
  for (const image of images) {
    if (!attr(image, 'alt').trim()) fail(file + ': image sans texte alternatif.');
    if (!attr(image, 'width') || !attr(image, 'height')) fail(file + ': image sans dimensions explicites.');
  }
  if (file !== 'index.html' && file !== '404.html' && (html.match(/<h1\b/gi) || []).length !== 1) fail(file + ': la page doit contenir exactement un H1.');
  if (file !== '404.html') checkLinks(file, html);
}
if (process.argv.includes('--check-dist')) {
  const dist = path.join(ROOT, 'dist');
  const distFiles = [
    'index.html', '404.html', 'robots.txt', 'sitemap.xml', 'CNAME',
    'styles.css', 'data.js', 'themes-and-polls.js', 'scoring.js', 'app.js',
    'service-worker.js', 'manifest.json', 'embleme-solidaire-180.png',
    'embleme-solidaire-192.png', 'embleme-solidaire-512.png',
    'assets/css/content-pages.css',
    'a-propos/index.html', 'methode/index.html', 'mentions-legales/index.html',
    'confidentialite/index.html'
  ];
  for (const file of distFiles) {
    const sourcePath = path.join(ROOT, file);
    const outputPath = path.join(dist, file);
    if (!fs.existsSync(outputPath)) {
      fail('Fichier de publication absent de dist/: ' + file);
    } else if (fs.existsSync(sourcePath) && !fs.readFileSync(sourcePath).equals(fs.readFileSync(outputPath))) {
      fail('Le fichier publié diffère de sa source : ' + file);
    }
  }
}
console.log(failures.length ? 'Échec des contrôles SEO :\n- ' + failures.join('\n- ') : 'Contrôles SEO réussis : ' + pages.length + ' pages canoniques, métadonnées, liens internes, robots.txt et sitemap.xml cohérents.');
if (failures.length) process.exitCode = 1;
