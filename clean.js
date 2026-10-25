'use strict';
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
console.log('Dossier dist supprimé (s’il existait).');
