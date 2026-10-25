# Votez bien ! — Boussole & comparateur politique 2027

Site statique pur (HTML/CSS/JS), sans dépendance d'exécution. Il propose un questionnaire à choix orienté (ordre A/B aléatoire et équilibré), un second palier de questions concrètes de départage (sélectionné en fonction des réponses), un classement des formations politiques par proximité éditoriale avec explication, des fiches, un comparateur, des programmes, des candidatures, un calendrier et un diagnostic de qualité conservé pour la maintenance, absent de l’interface publique.

## Principes

- **Aucun biais d'affichage** : pour chaque question, l'ordre des propositions est tiré de manière équilibrée et aléatoire (série maximale de 3 dans le même sens). La valeur sémantique est indépendante de l'affichage.
- **Données traçables** : 22 questions d'orientation, 27 questions concrètes de départage et des sources consultables en HTTPS. Chaque question de précision renvoie aux sources disponibles et à une base éditoriale.
- **Classement honnête** : l’indice est éditorial sur 100, **ni une probabilité ni un pronostic**. Le moteur demande au moins 15 % de couverture de la banque, trois réponses précises comparables et 25 % de couverture des réponses posées. Des positions UDI désormais sourcées permettent son classement indicatif; les données insuffisantes restent signalées.
- **Contrôle de maintenance** : `radar.js` contient des diagnostics internes; il n’est pas chargé ni publié dans l’interface du site.
- **Vie privée** : aucun compte, aucun cookie de suivi, aucun pixel publicitaire. Les réponses restent dans `localStorage` de l'appareil.
- **Hors-ligne compatible** : service worker en mode tolérant au cache.

## Données

- **6 thèmes** (Économie, Société, Autorité, Europe, Immigration, Écologie) — poids éditoriaux déclarés, contrôlés en interne.
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
npm test              # syntaxe, moteur, interface, audit et simulation à grande échelle
npm run test:massif    # 1 000 000 de profils + 100 000 contrôles d’ordre A/B
npm run test:radar     # audit interne et contrôles des sources
```

Les scripts et suites de tests sont à la racine du dépôt. Les parcours d’interface utilisent jsdom ; les tests moteur chargent directement les données et le calcul. Le rapport Radar reste un outil de maintenance et n’est pas affiché aux utilisateurs.

## Structure

- `index.html`, `styles.css`, `app.js` — application SPA statique
- `data.js` — données seules (questions, départage, partis, sources, candidatures, calendrier)
- `scoring.js` — moteur de calcul pur (testable en Node)
- `radar.js` — audit intelligent calculé (6 axes + simulation Monte-Carlo)
- `service-worker.js`, `manifest.json` — PWA
- `tests.js`, `test-*.js` — suites moteur, parcours, interface et audit
- `vite.config.mts` — build Vite produisant une copie byte-identique du site dans `dist/`

## Build

`npm run build` utilise Vite avec un plugin `writeBundle` pour recopier les fichiers sources tels quels (sans hachage, sans dossier `/assets/`, URLs relatives). Le service worker précache la liste exacte des fichiers. Le build fonctionne depuis un chemin contenant des espaces/`&`.


## Améliorations de l’audit

Les diagnostics internes distinguent les défauts bloquants des limites de couverture. Les positions non sourcées restent non renseignées : le site ne transforme pas une absence de données en position centriste. À ce jour, les axes manquants concernent cinq positions de l’UPR et l’axe Europe de Lutte ouvrière ; MoDem, UDR, Nouvelle Énergie et UPR restent parfois non classables faute de positions concrètes suffisantes. Ces lacunes sont des priorités éditoriales pour de futures mises à jour sourcées.

Les scripts `npm test` incluent aussi un million de profils déterministes et cent mille tirages de l’ordre A/B. Le workflow GitHub Actions exécute cette suite et construit le site à chaque pull request.
