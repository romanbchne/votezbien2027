import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------
   Votez bien ! — site statique en JavaScript classique.
   Vite sert le site localement; ce plugin copie les fichiers publics
   à l’identique dans dist/ et garde leurs URLs stables.
   ------------------------------------------------------------------ */
const SITE_FILES = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'CNAME',
  'styles.css',
  'data.js',
  'themes-and-polls.js',
  'scoring.js',
  'app.js',
  'service-worker.js',
  'manifest.json',
  'icon.svg',
  'embleme-solidaire-180.png',
  'embleme-solidaire-192.png',
  'embleme-solidaire-512.png',
  'assets/css/content-pages.css',
  'a-propos/index.html',
  'methode/index.html',
  'mentions-legales/index.html',
  'confidentialite/index.html',
  'contact/index.html'
];

function staticSite(): Plugin {
  return {
    name: 'votez-bien-static-site',
    apply: 'build',
    writeBundle(options) {
      const dir = options.dir;

      // Vite may create bundled assets; remove them because this project
      // publishes stable, hand-authored file paths, then copy public files.
      fs.rmSync(path.join(dir, 'assets'), { recursive: true, force: true });

      for (const file of SITE_FILES) {
        const src = path.resolve(rootDir, file);
        if (!fs.existsSync(src)) {
          this.warn('Fichier du site introuvable, ignoré : ' + file);
          continue;
        }
        const destination = path.join(dir, file);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(src, destination);
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
