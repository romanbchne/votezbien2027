# Changelog — Audit V5.1 → refonte V6

## V7.4 — accueil compact, quiz et positions détaillées

- Accueil resserré autour du quiz, sans grande illustration ; ajout d’une page
  d’entrée dédiée au questionnaire et d’un onglet « Les programmes ».
- « Mon profil » reste accessible avant d’avoir répondu et explique comment
  commencer. Le rappel de reprise dépend toujours d’une progression réelle et
  inachevée.
- La page Programmes détaille les 21 tendances thématiques et les 24 questions
  de précision, avec un filtre par formation, les points non documentés et
  les liens de sources/programmes. Elle distingue les estimations de parti
  d’une réponse officielle de candidat.
- Questions retravaillées sur le financement des services publics, l’égalité,
  le contrôle de l’exécutif, l’agriculture et les transports pour expliciter
  les choix proposés.
- Actualisation des statuts de candidature au 14 octobre 2026 : Raphaël
  Glucksmann est affiché pour le PS et Place publique après sa victoire à la
  primaire ; Olivier Faure n’est plus présenté comme candidat.
- Cache PWA passé à V7.4.2 : version en ligne en priorité, cache utilisé hors
  connexion.

## V7.3 — nouvel emblème citoyen tricolore

- Remplacement de l’ancienne boussole par l’emblème fourni, dans l’en-tête,
  l’illustration de l’accueil, le favicon et les icônes PWA.
- Mise à jour du manifeste et du cache hors ligne pour distribuer les nouveaux
  fichiers d’icône aux personnes qui ont déjà visité ou installé le site.

## V7.1 — accueil tricolore, durée claire et annuaire des partis

- Refonte de l’accueil et de la navigation autour d’une identité républicaine
  bleu-blanc-rouge, avec un lien Accueil toujours visible.
- Correction du rappel de reprise : il apparaît uniquement s’il existe des
  réponses valides dans un questionnaire non terminé.
- Les 21 questions principales sont annoncées à environ 5 minutes ; la phase
  de précision peut aller jusqu’à 15 questions et environ 4 minutes.
- L’onglet Les partis est consultable avant le test et présente les 16
  formations, leurs figures politiques associées, les statuts, les liens
  officiels et les crédits/licences des portraits. Les scores ne s’affichent
  qu’après la fin du questionnaire.
- Les réponses et le moteur de calcul n’ont pas été modifiés. Le cache PWA est
  passé à V7.1.0 pour permettre la mise à jour aux personnes qui ont déjà
  visité le site.

## V7.0 — départage réel entre partis du même camp, ordre aléatoire, 3 priorités

Trois demandes, traitées ensemble.

### 1. Ordre A/B aléatoire, sans effet sur le résultat

Constat : on repérait vite que A était toujours la proposition de gauche et B
celle de droite. L’ordre est désormais aléatoire, **équilibré dans chaque
thème** (autant de questions inversées que non inversées, à une près : un
réflexe « toujours le premier choix » s’annule) et **jamais plus de 3 fois de
suite dans le même sens** (`makeBalancedFlips`). Les options des questions
concrètes sont aussi mélangées, sans jamais être rangées en ordre croissant ou
décroissant.

C’est précisément ce que la V5.1 avait tenté, avec un bug de données : l’ordre
affiché était randomisé mais les boutons de réponse n’en tenaient pas compte.
Ici, **la valeur enregistrée est toujours liée au texte choisi**, jamais à sa
place à l’écran (`app.js` convertit avec le drapeau `flip`, mémorisé dans
l’état pour que « Précédent » et la reprise ré-affichent le même ordre).
Preuve par l’interface (`test-order.js`) : chaque bouton, dans les deux états,
enregistre le bon sens ; un même avis donne exactement les mêmes scores avec 25
ordres différents ; contrôle de mutation : réintroduire le bug V5.1 fait
échouer 25 vérifications.

### 2. Questions de départage : concrètes, ciblées sur les partis encore en course

Constat : piocher les 8 questions dans l’ancienne banque ne pouvait pas
départager LFI, PS et Écologistes, car toutes les options y étaient rangées de
la gauche vers la droite. **L’ancienne banque de 36 questions est supprimée**
(elle ne servait plus à rien) et remplacée par une banque de **24 questions
concrètes à plusieurs options** (`DEPARTAGE`), où chaque option correspond à
une vraie position de certains partis : retraites à 60, 62 ou 64 ans, nucléaire,
taxe sur les très grandes fortunes, OTAN, Ukraine, budget de la défense,
régularisations, droit du sol, laïcité, cannabis, mode de scrutin, institutions,
etc. Tout est écrit à l’avance, rien n’est généré à la volée.

La question suivante est choisie **après chaque réponse** (`selectNextDepartage`) :
on estime la probabilité que chaque parti soit le plus proche (softmax sur les
scores actuels), et on pose la question qui sépare le plus de partis encore
probables. Donc pour un profil de gauche, elle distingue des partis de gauche ;
pour un profil de droite, des partis de droite. Garde-fous : priorités
déclarées prises en compte, rendement décroissant par thème, au plus 2
questions du même sujet, **arrêt anticipé** dès 4 réponses si un parti mène de
15 points (jusqu’à 8 sinon).

Le palier **n’affiche ni nom de parti ni pourcentage** : les montrer
permettrait d’orienter ses réponses suivantes vers un résultat espéré.

Ce que ça donne (`test-simulation.js`, positions codées à ce jour) :

| Électeur partagé PS / Écologistes… | Avant | Après |
|---|---|---|
| répond comme Les Écologistes | PS 95 % · Écolo 95 % | Écolo 96 % · PS 78 % (4 questions) |
| répond comme le PS | 95 % · 95 % | PS 94 % · Écolo 80 % (8 questions) |
| est vraiment à mi-chemin | 95 % · 95 % | écart de 5 points : **quasi-égalité affichée comme telle** |

L’écart vient de vraies différences de position sur des propositions précises,
pas d’un réglage : l’électeur réellement partagé reste à égalité. En V6.2, la
même séparation était impossible (au plus 9 points entre PS et Écologistes),
parce que les positions n’étaient codées que par thème.

**Comparaison équitable.** MoDem, UDI et UDR n’ont presque aucune position codée
sur ces questions (l’UPR très peu). Les comparer seulement sur les 6 thèmes,
bien plus indulgents que les questions précises, les aurait fait paraître
mécaniquement proches de tout le monde. Dès 3 réponses concrètes, un parti dont
moins de la moitié des positions est codée est donc « comparé partiellement » :
pas de pourcentage, classé après les autres, proximité sur les thèmes indiquée
dans sa fiche.

**Sources.** Positions recoupées avec la presse et des comparateurs (liste dans
`SOURCES`). Elles sont **provisoires** et à revérifier. Une source divergente
(mode de scrutin pour Horizons, Renaissance, DLF) donne une position **non
codée** plutôt qu’arbitrée. MonVote2027 n’a été que consulté pour recouper :
sa licence n’étant pas précisée, rien n’a été copié.

### 3. Importance : trois priorités au lieu d’une note par question

Constat : « peu important / important / essentiel » après chaque question
gonfle mécaniquement (tout paraît essentiel). Remplacé par un **classement
forcé de 3 priorités, une seule fois**, au palier : le premier compte double
(×2,0 / ×1,6 / ×1,3), tous les autres thèmes comptent à égalité (plus aucun
poids éditorial caché dans la comparaison aux partis). Facultatif : sans choix,
tous les thèmes comptent autant. Cela supprime 21 clics, oblige à arbitrer, et
l’importance ne modifie toujours jamais la position gauche-droite.

### Autres changements

- **Explications en langage simple** : bloc « En clair » sous les questions
  qui emploient un terme difficile ; définition d’une phrase pour chacun des 6
  thèmes.
- Fiche d’un parti : pour chaque question concrète, votre choix et la
  position du parti (ou « non codée ») ; comparateur : une ligne par question.
- Quasi-égalité (≤ 6 points) : « En tête, de très peu », panneau « Départager »
  (thèmes et propositions qui distinguent vraiment les deux partis).
- Clé de sauvegarde locale passée à `v7` (structure d’état différente) :
  les sauvegardes antérieures sont ignorées, sans erreur.
- `service-worker.js` : `CACHE_VERSION` 7.0.0.

### Tests

237 vérifications, 7 suites, toutes au vert, 0 erreur JavaScript. Les tests
d’interface lisent **le texte réellement affiché** pour répondre, au lieu de
supposer que « A = gauche ». Deux contrôles de mutation faits à la main
(bug V5.1 réintroduit : 25 échecs ; signe inversé : 20 échecs). Un test écrit
pendant ce travail ne vérifiait rien (corps vide) et a été remplacé par un vrai
contrôle ; le contrôle « aucune erreur JavaScript » échoue désormais réellement
si une erreur survient.

### Limites (voir aussi README)

Positions provisoires ; MoDem, UDI, UDR quasi non codés ; Renaissance et
Horizons peu séparables par la banque actuelle (3 sujets) ; liens non tous
vérifiés ; pas de test visuel sur appareil réel.

---

## V6.2 — départager les partis proches, 8 questions de précision, langage simple

**Demande** : pouvoir départager, à la fin, deux partis proches (exemple
donné : PS et Les Écologistes), avec des questions de précision orientées
sur ce qui distingue vraiment les partis, jusqu'à 8 questions, sans
allonger inutilement le test, et avec les termes difficiles expliqués.

**Ce qui a été fait**

- **8 questions de précision** au lieu de 4 (`count: 8`), choisies dans la
  banque de 36 questions déjà écrites (jamais générées à la volée).
- **Ciblage des partis en tête** (`computeContentionSpread` et
  `selectDiagnosticQuestions` dans `scoring.js`) : quand deux ou trois partis
  arrivent à quasi-égalité, la sélection privilégie les thèmes où ces partis
  divergent réellement dans `data.js`, en plus de l'incertitude de la
  personne et de l'importance déclarée. Le poids de ce signal croît avec la
  proximité de la course en tête. Il ne fait que choisir *quelles* questions
  neutres poser : il n'en modifie aucune.
- **Rendement décroissant** : chaque question supplémentaire dans un même
  thème vaut 60 % de la précédente, pour ne jamais poser 8 fois le même sujet.
  (Une première version, en tourniquet strict, ne pouvait pas concentrer les
  questions là où elles servent le plus.)
- **Palier « à l'aveugle »** : aucun nom de parti ni pourcentage n'est
  affiché avant la fin des questions de précision. Les montrer permettrait
  d'orienter ses réponses vers un résultat espéré, ce qui fausserait la
  mesure que l'on cherche justement à affiner. Le palier dit seulement, sans
  les nommer, que plusieurs partis sont proches.
- **Quasi-égalité affichée honnêtement** : si l'écart entre les deux premiers
  est de 6 points ou moins (`NEAR_TIE_POINTS`, une seule constante partagée),
  l'application n'affiche plus « Le plus proche de vous » mais « En tête, de
  très peu » / « Presque à égalité », explique que l'écart est plus petit que
  la marge d'incertitude des estimations, et affiche un panneau « Départager »
  : les thèmes où ces deux partis diffèrent, leur position, la vôtre, et
  l'importance que ce sujet a pour vous, avec un bouton vers le comparateur.
- **Termes difficiles expliqués** : bloc « En clair » sous 42 questions
  (patrimoine, dette, déficit, laïcité, CJUE, CEDH, Schengen, récépissé,
  artificialisation des sols, mix énergétique…) et une phrase de définition
  pour chacun des 6 thèmes ; vocabulaire visible unifié (« thème » plutôt que
  « dimension ») ; CNCCFP développé sur la page Méthode.

**Bug trouvé et corrigé pendant les tests : des positions « inconnues »
codées `0`.** L'UPR, parti centré sur la sortie de l'UE, avait été codée `0`
sur 5 thèmes où elle n'a pas de position établie. Résultat : pour un profil
parfaitement centriste, l'UPR arrivait *en tête* (91 %), simplement parce que
`0` se lit « centriste » et non « inconnu ». Correction : une position peut
maintenant valoir `null` (« non établie »). Un `null` est exclu de la
comparaison, jamais lu comme un `0`, et un parti comparé sur moins de 3
thèmes n'affiche aucun pourcentage (UPR : Europe seulement ; Lutte Ouvrière :
l'axe Europe n'est pas applicable à sa logique internationaliste, les 5
autres thèmes sont comparés). Le classement place désormais les partis sans
pourcentage après tous ceux qui en ont un.

**Ce que le mécanisme produit réellement (simulations, `test-simulation.js`)**

| Cas simulé | Résultat mesuré |
|---|---|
| Électeur réellement partagé entre PS et Écologistes, mêmes réponses honnêtes avant et après | Écart 0 point avant et après : aucun gagnant n'est fabriqué |
| Se révèle plus écologiste sur les questions ciblées | Les Écologistes passent devant le PS, de 2 points |
| Se révèle plus proche du PS sur les questions ciblées | Le PS passe devant, de 2 points |
| Répond exactement comme Les Écologistes sur tout | Écart de 8 à 9 points avec le PS |

**Limite structurelle, à connaître.** Un écart comme « 93 % contre 71 % »
entre PS et Écologistes est impossible avec le modèle actuel. Dans
`data.js`, ces deux partis diffèrent de 0 à 0,5 point (sur une échelle de 4)
sur cinq thèmes sur six, et de 1,2 point sur l'écologie : l'écart maximal
possible entre eux est d'environ 9 points, même pour quelqu'un qui répond
exactement comme l'un des deux. Même pour un profil calqué sur un parti,
l'écart avec le deuxième va de 1 à 10 points (Renaissance et UDI : 1 point) ;
7 profils sur 15 tombent dans la zone de quasi-égalité. Ces écarts reflètent
la proximité réelle des positions codées, et je ne les ai pas gonflés
artificiellement : ce serait fabriquer un résultat plutôt que le mesurer.

**Piste pour aller plus loin.** Une vraie séparation entre partis d'une même
famille demande des positions codées *au niveau de chaque proposition*
(nucléaire, pesticides, impôt sur les successions, âge de la retraite…) et
non plus seulement par thème : jusqu'à 36 questions × 16 partis. C'est un
travail éditorial qui doit s'appuyer sur les programmes officiels publiés
(la plupart des programmes 2027 ne le sont pas encore) et être vérifié
entrée par entrée, avec une source pour chacune. Ce n'est pas fait ici.

---


## V6.1 — un pourcentage de correspondance, sur demande explicite

Après retour direct sur la V6 : l'absence de tout pourcentage rendait le
résultat final moins clair et moins engageant qu'attendu pour une
application grand public — un renoncement pourtant motivé par la PARTIE 9
du cahier des charges initial ( « Ne donne pas immédiatement un score
« 87 % compatible » » ).

En relisant cette partie du cahier des charges, l'objection portait sur le
fait de montrer un chiffre **seul, sans méthode ni détail** — pas sur le
principe de mesurer une distance et de la traduire en pourcentage (le point
1 de cette même partie demande justement de « mesurer la distance
utilisateur ↔ parti sur chaque dimension », et le point 2 de la « pondérer
par l'importance du sujet »). Le score interne déjà calculé pour trier
l'affichage (`sortScore`, jamais montré en V6) répondait déjà à ces deux
points. Le changement en V6.1 : l'exposer comme pourcentage (`matchPercent`
dans `scoring.js`), sous forme d'anneau visuel, mais **jamais seul** —
toujours avec une phrase expliquant ce qu'il mesure et un accès direct au
détail dimension par dimension (rapprochements et différences, points 4 à
6 de la même partie), disponible en un clic depuis l'anneau lui-même.

Trois garde-fous ajoutés pour que ce pourcentage reste honnête :
- **Jamais affiché seul** : présent uniquement à côté d'une explication en
  une phrase, avec accès immédiat au détail par dimension.
- **Jamais sur des données insuffisantes** : en dessous de 3 dimensions
  comparables sur 6 (trop peu de réponses exploitables de la personne),
  l'anneau reste vide plutôt que d'afficher un chiffre peu fiable.
- **Un seul chiffre, pas deux** : le classement des partis et le
  pourcentage affiché utilisent désormais exactement le même calcul —
  auparavant, le score interne de tri et le décompte affiché
  (« X/Y dimensions ») pouvaient en théorie diverger légèrement ; ce n'est
  plus possible, testé explicitement (« le classement des partis
  correspond exactement à l'ordre décroissant du pourcentage affiché »).

Ajout également d'un **palier explicite** après les 21 questions
principales : un aperçu provisoire de l'orientation générale, puis un
bouton « Continuer (4 questions) » pour lancer la phase de précision — au
lieu d'un enchaînement silencieux comme en V6. Le bouton « Précédent » de
la première question de précision revient désormais à ce palier plutôt
qu'à la dernière question principale.

---

# Changelog — Audit V5.1 → refonte V6

## Bug critique de scoring (PARTIE 2 du cahier des charges)

**Confirmé, localisé précisément, et corrigé.**

Dans `calculate()` (V5.1), chaque réponse valait -2 à +2, où -2 correspondait
systématiquement à la proposition « A » de chaque question — et sur les 18
questions du test principal, la proposition A était systématiquement la
formulation la plus à gauche (plus de redistribution, plus de protection du
travail, plus de limites à la surveillance, etc.). Le score global était
calculé ainsi :

```js
let overall=0;
Object.entries(W).forEach(([k,w])=>overall+=(dims[k].score/2)*w);
```

→ Une personne répondant « Beaucoup plus A » à tout obtenait un score
`overall` **fortement négatif** (proche de -1).

Mais l’étiquette était ensuite choisie ainsi :

```js
let label=overall>=.55?'Plutôt à gauche':overall>=.20?'Centre-gauche'
  :overall<=-.55?'Plutôt à droite':overall<=-.20?'Centre-droit'
  :'Plutôt au centre';
```

→ Un score de -1 ne déclenche ni `overall>=.55` ni `overall>=.20` (faux), mais
déclenche `overall<=-.55` (vrai) → **« Plutôt à droite »**.

Autrement dit : **répondre le plus à gauche possible à toutes les questions
affichait « Plutôt à droite ».** Le même défaut affectait la position du
curseur sur le spectre visuel (`(1-overall)/2*100`, qui place un score très
négatif à l’extrémité visuellement « droite » de la barre). Fait notable :
l’affichage *par dimension* (`p=(score+2)/4*100`, comparé à des seuils 43/57)
utilisait une formule différente et correctement orientée — ce qui rendait le
bug difficile à repérer en testant une seule dimension à la fois, mais
garantissait une contradiction entre le résultat global et le détail par
dimension dès qu’on regardait les deux.

**Correction (V6)** : une seule fonction (`computeOverall` dans
`scoring.js`) calcule ET étiquette le score, avec une convention de signe
documentée une fois et appliquée partout (négatif = pôle gauche, positif =
pôle droit — voir l’en-tête de `data.js`). Prouvé par les tests
automatiques : `tests.js` (Tests A et B, au niveau du moteur de calcul) et
`test-e2e-signconvention.js` (la même preuve, mais à travers l’interface
réelle, jusqu’au texte affiché à l’écran).

## Second bug, indépendant du premier : ordre d’affichage A/B

V5.1 randomisait l’ordre d’affichage des deux propositions
(`order[i]||[0,1]`) pour limiter un biais de position — bonne intention,
implémentation dangereuse : l’étiquette visuelle (« Proposition A/B »)
suivait la position d’affichage (`j`), mais le **texte** suivait l’ordre
randomisé (`o`). Résultat : environ une fois sur deux, ce qui était étiqueté
« Proposition A » à l’écran affichait en réalité le texte de la proposition
B — alors que les boutons de réponse en bas de page (« Beaucoup plus A » …)
restaient, eux, câblés sur le sens sémantique fixe. Une personne répondant
« Beaucoup plus A » en pensant à ce qui était affiché sous l’étiquette A
pouvait donc voir sa réponse enregistrée dans le sens opposé à celui voulu,
de façon silencieuse et différente à chaque question.

**Correction (V6)** : l’ordre d’affichage A/B est désormais fixe (A puis B,
toujours). Un choix délibéré de simplicité plutôt qu’une réparation plus
complexe de la randomisation — conformément à la RÈGLE ABSOLUE du cahier des
charges (« si une logique existante est mauvaise, supprime-la »), le risque
d’une fonctionnalité mal implémentée dépassait son bénéfice méthodologique.

## Comparaison aux partis : entièrement absente, pas seulement approximative

V5.1 ne comparait à aucun moment votre *position* à celle des partis. Les
objets `PARTIES` ne contenaient qu’un tableau de libellés de sujets
(`['Économie','Écologie','Institutions']`), sans aucun score de position. Le
choix des partis « à explorer » se basait uniquement sur `topTopics()` — les
sujets que vous aviez déclarés *importants* pendant le test — filtrés contre
les libellés de sujets des partis. Une personne très à droite sur
l’immigration mais ayant coché « Immigration » comme sujet important pouvait
donc se voir suggérer La France insoumise, simplement parce que LFI a aussi
« Immigration » dans ses libellés — indépendamment de toute opposition de
fond sur ce sujet. Le système ne « comparait » rien : il faisait
correspondre des étiquettes de sujets, pas des positions.

**Correction (V6)** : chaque parti a désormais une position (-2 à +2) sur
chacune des 6 dimensions (`PARTIES[i].positions` dans `data.js`), comparée
dimension par dimension à votre propre score (`computePartyMatch` dans
`scoring.js`). Une dimension à laquelle vous n’avez pas répondu ne compte
jamais comme une opposition (elle est marquée « non renseigné » et exclue du
décompte). Aucun pourcentage de compatibilité global n’est calculé ni
affiché — un score interne sert uniquement à trier l’affichage, jamais montré
tel quel (voir PARTIE 9 du cahier des charges).

*(Voir « V6.1 » tout en haut de ce document : ce dernier point — l’absence
totale de pourcentage — a été révisé sur retour explicite. Le score existait
déjà ; seule sa présentation a changé, avec les garde-fous qui vont avec.)*

## Absence de véritable phase diagnostique adaptative

V5.1 ne disposait que d’**une seule** question de secours par dimension
(`ADAPT`, 6 questions au total) — il n’existait donc aucune « banque » dans
laquelle piocher : les 3 à 4 questions supplémentaires étaient en pratique
presque entièrement déterminées à l’avance, pas sélectionnées parmi des
alternatives. Un système séparé et non lié (`PROPS`, 11 propositions, écran
« Test 2 ») affichait des questions fixes, identiques pour tout le monde,
sans lien avec les réponses du test principal ni avec le calcul de profil —
un second parcours de test, déconnecté du premier, ne produisant aucun
score.

**Correction (V6)** : une banque de 36 questions diagnostiques (6 par
dimension, voir `BANK` dans `data.js`) et une sélection réellement
adaptative (`selectDiagnosticQuestions` dans `scoring.js`), fondée sur un
indice de confiance par dimension (couverture des réponses, pénalité
« je ne sais pas », cohérence interne des réponses, proximité du centre — en
particulier pour ne jamais confondre un centrisme réellement affirmé avec une
absence d’information, ce que confirme le Test C) combiné à l’importance
déclarée. Le système à deux tests déconnectés (`PROPS`/« Test 2 ») a été
retiré : il ne calculait aucun score et faisait doublon avec le test
principal sans rien apporter de plus.

## Autres corrections et clarifications

- **Position vs importance** (PARTIE 3) : l’importance déclarée n’entre
  jamais dans le calcul du score de position (`computeDimensionResults`
  l’exclut explicitement de la moyenne). Elle sert uniquement à classer les
  priorités affichées, sélectionner les questions diagnostiques, et
  pondérer le tri de l’exploration des partis — jamais à déplacer le
  curseur gauche-droite. Vérifié par les Tests E à H.
- **Dimensions redéfinies** : l’ancienne dimension unique « Europe/monde »
  mélangeait intégration européenne, immigration et politique
  internationale — trois sujets aux clivages réels différents (une même
  personne peut être europhile et restrictive sur l’immigration, ou
  l’inverse). Elles sont désormais deux dimensions séparées (Europe &
  souveraineté / Immigration & ouverture), et « Démocratie & institutions »
  a été intégrée à la dimension Autorité plutôt que d’en rester une septième
  distincte — voir la justification et la limite assumée de ce choix dans
  `data.js` et sur la page Méthode de l’application.
- **21 questions principales** (contre 18), réparties pour ne pas
  favoriser une famille politique (4 Économie · 3 Société · 4 Autorité ·
  3 Europe · 3 Immigration · 4 Écologie), toutes réécrites pour rester en
  langage courant, une seule idée par question.
- **Incertitude par dimension** (PARTIE 7) : un indicateur de confiance
  (barre + pourcentage + texte qualitatif) est affiché pour chacune des 6
  dimensions, et un profil peut être explicitement « non déterminé » quand
  trop peu de réponses exploitables ont été données (Test I).
- **Manifest et service worker** : noms de fichiers versionnés remplacés
  par un numéro de version unique dans `service-worker.js`
  (`CACHE_VERSION`) ; ajout d’un nettoyage des anciens caches (absent en
  V5.1, ce qui accumulait indéfiniment du stockage navigateur à chaque mise
  à jour) ; passage d’une stratégie cache-first pure à
  stale-while-revalidate pour qu’une personne ayant déjà ouvert l’app voie
  les mises à jour de contenu (ex. nouvelles positions de partis) sans
  devoir vider son cache.
- **Accessibilité** : vrais éléments `<button>` partout (pas de `div`
  cliquable), focus géré à l’ouverture/fermeture de la fiche parti, item
  « aller au contenu », contrastes vérifiés sur la nouvelle palette,
  `prefers-reduced-motion` respecté.

## Tests exécutés

157 vérifications automatiques, dans 6 suites (`tests/`), toutes au vert au
moment de la livraison — détail dans `README.md`. En particulier, les 10
scénarios A à J de la PARTIE 2 du cahier des charges sont couverts
explicitement et nommément dans `tests/tests.js`, et la preuve bout-en-bout
(`test-e2e-signconvention.js`) vérifie désormais aussi que le parti le plus
proche affiché est cohérent avec le profil (La France insoumise pour un
profil entièrement à gauche, Reconquête pour un profil entièrement à
droite) — pas seulement l'étiquette gauche/droite.

## Ce qui reste à valider humainement

Voir la section « Limites connues » de `README.md` : positions des partis
(estimations éditoriales à réviser à l’approche du scrutin), liens non tous
vérifiés un par un par requête réseau, liste des partis non exhaustive,
absence de test visuel réel sur différents appareils (aucun navigateur
graphique n’était disponible pendant cette refonte : le rendu a été validé
par un DOM simulé — fonctionnel, pas visuel — et par une relecture
attentive du CSS responsive, pas par une capture d’écran).

