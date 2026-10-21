# Votez bien ! — Boussole & comparateur politique 2027

Site statique pur (HTML/CSS/JS), sans dépendance d'exécution. Il propose un questionnaire à choix orienté (ordre A/B aléatoire et équilibré), un second palier de questions concrètes de départage (sélectionné en fonction des réponses), un classement des formations politiques par proximité éditoriale avec explication, des fiches, un comparateur, des programmes, des candidatures, un calendrier et un **radar d'audit intelligent calculé en temps réel**.

## Principes

- **Aucun biais d'affichage** : pour chaque question, l'ordre des propositions est tiré de manière équilibrée et aléatoire (série maximale de 3 dans le même sens). La valeur sémantique est indépendante de l'affichage.
- **Données traçables** : 22 questions d'orientation, 27 questions concrètes de départage, 43 sources en HTTPS. Chaque question de départage renvoie à une source vérifiable et à une base éditoriale.
- **Classement honnête** : l'indice est un indice éditorial sur 100, **ni une probabilité ni un pronostic**. Les formations trop peu documentées (MoDem, UDI, UDR, NE, UPR, LO) ne reçoivent pas de pourcentage global.
- **Audit réel, non marketing** : l'écran « Radar » exécute ses contrôles dans le navigateur sur les données et le moteur. Le score, les axes et les constats sont tous calculés, jamais écrits en dur. L'audit est exposé en `window.votezAudit` pour vérification.
- **Vie privée** : aucun compte, aucun cookie de suivi, aucun pixel publicitaire. Les réponses restent dans `localStorage` de l'appareil.
- **Hors-ligne compatible** : service worker en mode tolérant au cache.

## Données

- **6 thèmes** (Économie, Société, Autorité, Europe, Immigration, Écologie) — poids déclarés, vérifiés par l'audit.
- **16 formations** analysées. Raphaël Glucksmann figure uniquement sous **Place publique** (le doublon Parti socialiste a été supprimé).
- **Positions thématiques** : la plupart couvertes sur les 6 axes ; certaines positions sont explicitement `null` et exclues du calcul (LO sur l'Europe, UPR sur 5 axes).
- **Candidatures** : statut renseigné pour chaque formation (déclaré/official/conditional/reference) avec sources quand disponibles.

## Développement

```bash
npm install
npm run dev      # serveur de dev Vite
npm run build    # build statique dans dist/ (copie à l'identique)
npm run preview  # aperçu du build
```

Pour utiliser Node portable (Windows) : `C:\Users\roman\AppData\Local\Temp\opencode\node\node-v24.20.0-win-x64\node.exe` avec `npm.cmd`.

## Tests

```bash
npm test           # lance toutes les suites (tests/, jsdom)
npm run test:radar # audit intelligent uniquement
npm run audit:devices
```

Les tests chargent **directement** les fichiers de la racine (`data.js`, `scoring.js`, `radar.js`, `app.js`) — aucune copie dans `tests/`. `tests/helpers.js` pointe vers la racine du projet.

## Structure

- `index.html`, `styles.css`, `app.js` — application SPA statique
- `data.js` — données seules (questions, départage, partis, sources, candidatures, calendrier)
- `scoring.js` — moteur de calcul pur (testable en Node)
- `radar.js` — audit intelligent calculé (6 axes + simulation Monte-Carlo)
- `service-worker.js`, `manifest.json` — PWA
- `tests/` — suite de tests jsdom
- `vite.config.mts` — build Vite produisant une copie byte-identique du site dans `dist/`

## Build

`npm run build` utilise Vite avec un plugin `writeBundle` pour recopier les fichiers sources tels quels (sans hachage, sans dossier `/assets/`, URLs relatives). Le service worker précache la liste exacte des fichiers. Le build fonctionne depuis un chemin contenant des espaces/`&`.
