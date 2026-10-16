# Votez bien ! — V7

Application indépendante d’aide à la compréhension politique pour l’élection
présidentielle française de 2027 : 21 questions générales (environ 5 minutes),
vos 3 priorités, puis jusqu’à 15 questions **concrètes** de précision (environ
4 minutes) pour départager les partis qui restent proches de vous. Le site
propose un profil sur 6 thèmes et une comparaison à 16 partis — sans jargon,
sans compte. Les réponses restent dans le navigateur ; les portraits sont
chargés depuis Wikimedia Commons.

Voir `CHANGELOG.md` pour l’historique et le détail de ce qui a changé.

## Déployer sur GitHub Pages

1. Placez tous les fichiers de ce dossier (`index.html`, `styles.css`,
   `data.js`, `scoring.js`, `app.js`, `manifest.json`, `service-worker.js`,
   `icon.svg`) à la racine du dépôt (ou dans `/docs` si vous configurez
   GitHub Pages sur ce dossier).
2. `index.html` est le point d’entrée. Aucune étape de build : JavaScript
   natif, sans framework.
3. Tous les chemins sont relatifs : le site fonctionne à la racine d’un
   domaine comme dans un sous-dossier de projet GitHub Pages. Ne renommez pas
   les fichiers sans mettre à jour `index.html`, `manifest.json` et
   `service-worker.js`.
4. Le dossier `tests/` peut rester dans le dépôt (il n’interfère pas avec le
   site) ou être exclu du déploiement.
5. À chaque publication qui change le contenu, changez `CACHE_VERSION` dans
   `service-worker.js` : c’est ce qui fait voir la mise à jour aux personnes
   qui ont déjà ouvert l’application.

## Comment ça marche

1. **21 questions générales** (`QUESTIONS` dans `data.js`) : deux propositions,
   une échelle en 5 positions, « je ne sais pas ». Elles placent la personne
   sur 6 thèmes et entre la gauche et la droite. L’ordre A/B est aléatoire
   (voir plus bas).
2. **Palier** : aperçu provisoire gauche-droite et choix facultatif de **3
   priorités** (remplace l’ancienne note d’importance par question : quand on
   parle de grands thèmes, presque tout paraît « essentiel »). Aucun nom de
   parti ni pourcentage n’est affiché à ce stade, pour ne pas orienter les
   réponses suivantes.
3. **Jusqu’à 15 questions concrètes** (`DEPARTAGE` dans `data.js`), choisies
   une par une par `selectNextDepartage` (`scoring.js`) : on estime quels
   partis sont encore les plus proches, et on pose la question sur laquelle
   ces partis-là se séparent le plus. Les options sont de vrais choix de
   politique (retraites à 60, 62 ou 64 ans ; nucléaire ; taxe sur les très
   grandes fortunes ; OTAN…), jamais rangés de « gauche » à « droite ». Le
   test s’arrête dès qu’un parti mène de 15 points (au moins 4 questions
   posées).
4. **Résultats** : orientation, 6 thèmes avec leur niveau de clarté, vos
   priorités, partis classés avec leur pourcentage et le détail du calcul. Si
   les deux premiers sont à 6 points ou moins, l’application ne désigne pas de
   gagnant : elle montre ce qui les distingue.

Trois fichiers, trois rôles : `data.js` (toutes les données), `scoring.js`
(calcul pur, sans DOM, entièrement testé), `app.js` (affichage seulement).

## Mettre à jour le contenu

### Les 21 questions générales (`QUESTIONS`)
Chaque question oppose une proposition `a` et une proposition `b`. **Règle dont
dépend la justesse de tout le calcul** : `a` va toujours vers `labelLeft` de sa
dimension, `b` vers `labelRight` (convention documentée en tête de `data.js`).
L’ordre d’affichage est aléatoire mais n’est qu’une présentation : la valeur
enregistrée reste liée au texte choisi.

### La banque de départage (`DEPARTAGE`)
Une question = `id` (préfixe `dp-`), `dim` (thème rattaché), `group` (sujet :
jamais plus de 2 questions du même groupe), `topic`, `q` (énoncé), `plain`
(« En clair » : définir tout terme difficile), `options` (2 à 4, `pos` = 0, 1,
2… sur **un seul axe**, avec `short` et `text`), `stances` et `basis`.

- **Neutralité** : aucun nom de parti ni de candidat dans l’énoncé ni dans les
  options (les questions sont posées à l’aveugle ; un test le vérifie). Des
  options décrivant de vrais choix, pas des caricatures.
- **`stances`** : la position de chaque parti sur la même échelle que `pos`
  (décimales admises : 1,5 = entre l’option 1 et l’option 2). **Une position
  qu’on ne peut pas établir s’écrit en l’omettant, jamais en la devinant** :
  elle est alors exclue du calcul, et jamais lue comme « au milieu ». Chaque
  question doit coder au moins 7 partis.
- **Source** : toute position ajoutée ou modifiée doit s’appuyer sur un
  programme ou une déclaration publique ; l’indiquer dans `basis` et ajouter
  l’adresse dans `SOURCES`.
- Les tests vérifient que chaque question sépare au moins un couple de rivaux
  plausibles, et que chaque couple de la liste `RIVAL_PAIRS` (`tests/tests.js`)
  est séparé par au moins 3 questions. Ajouter un parti ou une paire à cette
  liste mesure immédiatement si la banque sait encore les départager.

### Les partis (`PARTIES`)
Position par thème (-2 à +2), `status`, `statusDate`, liens. **Une position
inconnue s’écrit `null`, jamais `0`** : un `0` veut dire « position réellement
modérée », et un parti codé `0` partout où il n’a pas de position ressortait en
tête pour tous les profils centristes (bug réel, corrigé).

### Réglages (`scoring.js`)
`NEAR_TIE_POINTS` (6), `MAX_DEPARTAGE` (15), `MIN_DEPARTAGE` (4),
`CLEAR_LEAD_POINTS` (15), `PRIORITY_BOOSTS` (2,0 / 1,6 / 1,3), `MAX_PER_GROUP`
(2), `PARTIAL_COVERAGE` (0,5). La page « Méthode » cite plusieurs de ces
valeurs : la mettre à jour en même temps. La clé de sauvegarde locale
(`votezbien:v7:state` dans `app.js`) doit changer quand la structure de l’état
change, pour que d’anciennes sauvegardes ne soient pas lues de travers.

## Exécuter les tests

```bash
cd tests
npm install
npm test
```

Sept suites, 237 vérifications :

- `tests.js` — moteur et données (79) : les scénarios A à J du cahier des
  charges ; structure et neutralité de la banque de départage ; capacité à
  séparer les paires proches ; comparaison équitable ; sélection des
  questions ; équilibre de l’ordre aléatoire.
- `test-simulation.js` — simulations d’électeurs (21) : un électeur partagé
  entre deux partis n’est pas « tranché » artificiellement ; des réponses
  honnêtes qui penchent d’un côté font passer le bon parti devant ; répondre
  comme un parti place ce parti en tête.
- `test-order.js` — ordre d’affichage aléatoire (34) : chaque bouton enregistre
  le sens du **texte** choisi, que A/B soient inversés ou non ; un même avis
  donne le même résultat avec 25 ordres différents.
- `test-integration.js` (26), `test-flows.js` (32), `test-departage-ui.js`
  (26) — parcours complets dans un DOM réel (jsdom), pilotés par les boutons :
  reprise, retour arrière, annulation d’une réponse, priorités, palier à
  l’aveugle, quasi-égalité, tout en « je ne sais pas ».
- `test-e2e-signconvention.js` (19) — répondre systématiquement à gauche
  n’affiche jamais « droite », avec 16 ordres d’affichage différents.

Contrôle de mutation (fait à la main, hors suite) : réintroduire le bug de la
V5.1 (valeur enregistrée indépendante de l’ordre affiché) fait échouer 25
vérifications ; inverser le signe de l’orientation globale en fait échouer 20.
Les tests peuvent donc bien échouer.

## Limites connues

- **Ce n’est pas un instrument scientifique validé.** 21 questions générales et
  8 concrètes ne capturent pas toute la complexité d’une position politique.
- **Les positions des partis sont des estimations provisoires**, construites à
  partir des propositions déclarées des candidats et des programmes à la date
  de septembre 2026 ; la plupart des programmes 2027 ne sont pas publiés. Pour
  plusieurs partis, c’est la position du candidat déclaré qui est codée. À
  revérifier avant toute publication, puis à mesure que la campagne avance.
  Sources de recoupement : voir `SOURCES` dans `data.js` et la page Méthode.
  MonVote2027 (outil citoyen) n’a été que consulté pour recouper : sa licence
  n’étant pas précisée, ses données n’ont pas été copiées.
- **MoDem, UDI et UDR n’ont presque aucune position codée** sur les questions
  concrètes (et l’UPR très peu) : faute de sources solides, rien n’a été
  deviné. Ils sont donc « comparés partiellement » (proximité sur les 6 thèmes
  seulement, jamais classés avec les autres une fois les questions concrètes
  répondues), au lieu de paraître mécaniquement proches de tout le monde.
- **Renaissance et Horizons se distinguent peu** : la banque ne les sépare que
  sur 3 sujets, et leurs candidats divergent réellement peu. Ces profils vont
  jusqu’à 15 questions sans toujours se détacher ; l’application l’affiche
  honnêtement (quasi-égalité) plutôt que de forcer un gagnant.
- **Sur le mode de scrutin**, les sources divergent pour Horizons, Renaissance
  et DLF : leur position n’est pas codée.
- Les liens des partis n’ont pas tous été vérifiés un par un par requête réseau.
- Aucun navigateur graphique n’était disponible : le rendu a été validé par un
  DOM simulé et une relecture du CSS responsive, pas par une capture d’écran
  sur appareil réel.
- La liste de 16 partis est un choix éditorial de couverture du spectre.

