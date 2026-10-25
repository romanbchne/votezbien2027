import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------
   Votez bien ! — site statique en JavaScript classique.

   Le site n'a besoin ni de bundling, ni de transpilation, ni de
   hachage : c'est du HTML, du CSS et des scripts classiques
   (<script src="./data.js">). Vite sert ici de moteur de build, mais
   la copie finale est faite à l'identique, ce qui garantit :
     - des URL relatives (le site fonctionne à la racine d'un domaine
       comme dans un sous-dossier) ;
     - des noms de fichiers stables, donc une liste de préchargement
       exacte pour le service worker ;
     - un dist/ qui est une reproduction fidèle des sources.
   ------------------------------------------------------------------ */
const SITE_FILES = [
  'index.html',
  'styles.css',
  'data.js',
  'scoring.js',
  'app.js',
  'service-worker.js',
  'manifest.json',
  'embleme-citoyen-180.png',
  'embleme-citoyen-192.png',
  'embleme-citoyen-512.jpg'
];

function staticSite(): Plugin {
  return {
    name: 'votez-bien-static-site',
    apply: 'build',
    writeBundle(options) {
      const dir = options.dir;

      /* Plus aucune ressource sous assets/ : toutes les URL du site sont
         relatives et pointent vers la racine du dossier publié. */
      fs.rmSync(path.join(dir, 'assets'), { recursive: true, force: true });

      for (const file of SITE_FILES) {
        const src = path.resolve(rootDir, file);
        if (!fs.existsSync(src)) {
          this.warn('Fichier du site introuvable, ignoré : ' + file);
          continue;
        }
        fs.copyFileSync(src, path.join(dir, file));
      }
    }
  };
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [staticSite()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: 'es2019',
    assetsInlineLimit: 0
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 4173
  }
});
