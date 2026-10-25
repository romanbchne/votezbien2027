'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = __dirname;
const ignored = new Set(['.git', 'node_modules', 'dist', 'work']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
}
walk(ROOT);
for (const file of files) {
  try { new vm.Script(fs.readFileSync(file, 'utf8'), { filename: path.relative(ROOT, file) }); }
  catch (error) { console.error(path.relative(ROOT, file) + ': ' + error.message); process.exitCode = 1; }
}
if (!process.exitCode) console.log(files.length + ' fichiers JavaScript analysés sans erreur de syntaxe.');
