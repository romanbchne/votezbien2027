/* ============================================================================
   VOTEZ BIEN ! — data.js
   Toutes les données du questionnaire : dimensions, questions, banque
   diagnostique, partis. Fichier séparé de la logique (scoring.js) et de
   l’affichage (app.js) pour rester facile à mettre à jour.

   CONVENTION DE SIGNE (unique dans tout le projet — voir PARTIE 8 du cahier
   des charges) :
     - Chaque question oppose une proposition A et une proposition B.
     - La réponse est un entier de -2 à +2 :
         -2 = « Beaucoup plus A »   -1 = « Plutôt A »   0 = « Entre les deux »
         +1 = « Plutôt B »          +2 = « Beaucoup plus B »
       (« Je ne sais pas » n’est PAS 0 : c’est une absence de valeur, exclue
       du calcul de moyenne — voir scoring.js.)
     - Pour CHAQUE dimension, la proposition A est TOUJOURS celle qui va vers
       labelLeft (le pôle conventionnellement associé à la gauche) et la
       proposition B TOUJOURS celle qui va vers labelRight (le pôle
       conventionnellement associé à la droite). Un score négatif = plus
       proche du pôle « gauche » ; un score positif = plus proche du pôle
       « droite ». C’est la seule convention utilisée partout (calcul,
       couleurs, curseur, textes).
     - Limite méthodologique assumée : sur les dimensions Autorité,
       Europe et Immigration, l’axe mesuré (libéral/autoritaire,
       intégration/souveraineté, ouverture/contrôle) ne recoupe pas
       toujours le clivage gauche-droite classique (ex. souverainisme de
       gauche et de droite). Voir le champ `note` de chaque dimension et
       l’écran « Méthode » de l’application.
   ========================================================================= */

const DIMENSIONS = {
  eco: {
    id: 'eco',
    name: 'Économie & redistribution',
    short: 'Économie',
    plain: 'Ce que l’État doit faire pour l’économie et les inégalités : impôts, aides, protection des salariés.',
    labelLeft: 'Intervention publique & redistribution',
    labelRight: 'Liberté économique',
    weight: 0.24,
    color: '#c2410c',
    note: null
  },
  soc: {
    id: 'soc',
    name: 'Société & libertés',
    short: 'Société',
    plain: 'Les règles de la vie en société : libertés individuelles, égalité, évolution des modes de vie.',
    labelLeft: 'Transformation sociale & libertés',
    labelRight: 'Continuité & règles communes',
    weight: 0.16,
    color: '#a21caf',
    note: null
  },
  auth: {
    id: 'auth',
    name: 'Autorité, sécurité & pouvoir',
    short: 'Autorité',
    plain: 'Sécurité, justice et équilibre des pouvoirs : jusqu’où l’État doit contrôler, sanctionner et décider vite.',
    labelLeft: 'Prévention & contre-pouvoirs',
    labelRight: 'Fermeté & pouvoir exécutif fort',
    weight: 0.16,
    color: '#0f172a',
    note: 'Cette dimension inclut des questions sur les institutions (contre-pouvoirs, pouvoirs exceptionnels). Elle mesure surtout un axe libéral / autoritaire, qui recoupe partiellement seulement le clivage gauche-droite classique.'
  },
  europe: {
    id: 'europe',
    name: 'Europe & souveraineté',
    short: 'Europe',
    plain: 'La place de l’Union européenne : décider à plusieurs pays, ou garder plus de décisions au niveau français (la souveraineté, c’est décider par soi-même).',
    labelLeft: 'Intégration européenne',
    labelRight: 'Souveraineté nationale',
    weight: 0.14,
    color: '#1d4ed8',
    note: 'Le souverainisme existe aussi bien à gauche (critique des traités européens) qu’à droite (Frexit) : un score « souveraineté » ne signifie pas la même chose selon le reste du profil.'
  },
  immig: {
    id: 'immig',
    name: 'Immigration & ouverture',
    short: 'Immigration',
    plain: 'Combien de personnes étrangères accueillir, dans quelles conditions, et comment les intégrer.',
    labelLeft: 'Ouverture & intégration',
    labelRight: 'Contrôle & restriction',
    weight: 0.14,
    color: '#0e7490',
    note: null
  },
  ecology: {
    id: 'ecology',
    name: 'Écologie & énergie',
    short: 'Écologie',
    plain: 'Comment et à quelle vitesse agir pour le climat et l’environnement, et avec quelles contraintes.',
    labelLeft: 'Transition accélérée',
    labelRight: 'Transition progressive',
    weight: 0.16,
    color: '#15803d',
    note: null
  }
};

const DIM_KEYS = Object.keys(DIMENSIONS);

/* ----------------------------------------------------------------------
   QUESTIONS PRINCIPALES — 21 questions, réparties pour ne pas favoriser
   une famille politique par un nombre de questions déséquilibré :
   Économie 4 · Société 3 · Autorité 4 · Europe 3 · Immigration 3 · Écologie 4
   ------------------------------------------------------------------- */
const QUESTIONS = [
  { id:'eco-1', dim:'eco', topic:'Impôts', plain:'Le patrimoine, c’est ce que l’on possède : logement, épargne, placements, entreprise…',
    a:'Les personnes ayant les revenus et patrimoines les plus élevés devraient contribuer davantage au financement collectif.',
    b:'Il faut plutôt limiter les prélèvements, y compris pour les plus hauts revenus.',
    why:'Cette question mesure votre préférence entre plus de redistribution et des impôts plus limités.' },
  { id:'eco-2', dim:'eco', topic:'Services publics', plain:'La dépense publique, c’est l’argent dépensé par l’État et les collectivités : santé, école, police, aides…',
    a:'Il faut augmenter les moyens des services publics (santé, école…), même si cela coûte plus cher.',
    b:'Il faut d’abord maîtriser la dépense publique et rechercher plus d’efficacité.',
    why:'Cette question mesure l’arbitrage entre renforcer les services publics et maîtriser la dépense.' },
  { id:'eco-3', dim:'eco', topic:'Travail', plain:'Protéger les salariés : par exemple des contrats stables et des règles de licenciement. Plus de souplesse : des règles plus légères pour embaucher ou licencier.',
    a:'Il faut mieux protéger les salariés, même si cela crée davantage de règles pour les entreprises.',
    b:'Il faut donner plus de souplesse aux entreprises pour faciliter l’embauche.',
    why:'Cette question mesure l’arbitrage entre protection des salariés et flexibilité du travail.' },
  { id:'eco-4', dim:'eco', topic:'Économie',
    a:'L’État doit intervenir activement pour orienter l’économie et réduire les inégalités.',
    b:'L’État doit surtout fixer des règles simples et laisser faire les entreprises et les individus.',
    why:'Cette question mesure la place que vous donnez à l’intervention publique dans l’économie.' },

  { id:'soc-1', dim:'soc', topic:'Égalité', plain:'Les territoires : quartiers, campagnes, villes moyennes, outre-mer…',
    a:'L’action publique doit réduire les écarts réels entre les groupes sociaux et les territoires.',
    b:'Elle doit surtout garantir les mêmes règles et les mêmes chances à chacun, sans viser un résultat précis.',
    why:'Il existe plusieurs façons de concevoir l’égalité : agir sur les résultats, ou garantir des règles communes.' },
  { id:'soc-2', dim:'soc', topic:'Société',
    a:'Les lois doivent pouvoir évoluer rapidement quand les modes de vie et les mentalités changent.',
    b:'Il vaut mieux préserver les repères et les traditions déjà établis.',
    why:'Cette question mesure votre préférence entre le changement social et la continuité.' },
  { id:'soc-3', dim:'soc', topic:'Libertés',
    a:'La liberté individuelle doit primer, sauf nécessité clairement établie.',
    b:'Une règle commune peut primer sur la liberté individuelle lorsqu’elle protège la cohésion collective.',
    why:'Cette question mesure le poids que vous donnez à l’autonomie individuelle face aux règles communes.' },

  { id:'auth-1', dim:'auth', topic:'Sécurité', plain:'La réinsertion, c’est aider une personne condamnée à retrouver une place dans la société (emploi, logement…).',
    a:'Pour réduire la délinquance, il faut d’abord prévenir, accompagner et favoriser la réinsertion.',
    b:'Pour réduire la délinquance, il faut d’abord renforcer les sanctions et la présence des forces de l’ordre.',
    why:'Cette question oppose deux priorités différentes en matière de sécurité.' },
  { id:'auth-2', dim:'auth', topic:'Libertés publiques', plain:'Pouvoirs de surveillance : écoutes, fichiers, caméras, accès aux données personnelles…',
    a:'Il faut limiter les pouvoirs de surveillance de l’État pour protéger les libertés, même si cela complique certains contrôles.',
    b:'Il faut accepter davantage de moyens de surveillance et de contrôle lorsqu’ils renforcent la sécurité.',
    why:'Cette question mesure l’arbitrage entre protection des libertés et pouvoirs de contrôle de l’État.' },
  { id:'auth-3', dim:'auth', topic:'Justice', plain:'La récidive, c’est commettre une nouvelle infraction après une première condamnation. Dissuader, c’est décourager d’autres personnes de le faire.',
    a:'Une peine doit d’abord viser à réduire le risque de récidive et permettre la réinsertion.',
    b:'Une peine doit d’abord sanctionner l’acte commis et dissuader fermement.',
    why:'Cette question distingue deux priorités possibles pour la politique pénale.' },
  { id:'auth-4', dim:'auth', topic:'Institutions',
    a:'Il faut renforcer les contre-pouvoirs (Parlement, justice, médias) face à l’exécutif, même si cela ralentit les décisions.',
    b:'Il faut permettre à un pouvoir exécutif élu de décider et d’agir plus rapidement, avec moins de contraintes.',
    why:'Cette question mesure votre préférence entre plus de contrôle sur l’exécutif et plus de rapidité d’action.',
    clarifyA:'« Contre-pouvoirs » : les institutions qui peuvent limiter ou contrôler l’action du gouvernement (Parlement, justice, presse…).' },

  { id:'europe-1', dim:'europe', topic:'Europe', plain:'Aujourd’hui, certaines décisions se prennent à Paris et d’autres à Bruxelles (règles de concurrence, monnaie, commerce…).',
    a:'Il faut transférer davantage de décisions et de moyens au niveau européen pour les sujets qui dépassent les frontières.',
    b:'Il faut garder davantage de décisions et de moyens au niveau français.',
    why:'Cette question mesure la place que vous donnez à l’intégration européenne.' },
  { id:'europe-2', dim:'europe', topic:'Souveraineté budgétaire', plain:'L’Union européenne fixe des limites au déficit (quand l’État dépense plus qu’il ne reçoit) et à la dette (ce qu’il a emprunté) de ses États membres.',
    a:'La France doit respecter les règles budgétaires européennes communes, même lorsque cela impose des efforts.',
    b:'La France doit pouvoir s’écarter des règles budgétaires européennes lorsque ses priorités nationales l’exigent.',
    why:'Cette question précise votre position sur la marge de manœuvre budgétaire de la France au sein de l’Union européenne.' },
  { id:'europe-3', dim:'europe', topic:'Défense', plain:'Cadres communs : par exemple l’Union européenne ou l’OTAN (une alliance militaire).',
    a:'La France doit agir prioritairement dans des cadres communs (Europe, alliances), même si cela suppose des compromis.',
    b:'La France doit pouvoir décider seule de ses priorités de défense et de politique étrangère.',
    why:'Cette question mesure le poids donné à l’action commune par rapport à l’autonomie nationale en défense et diplomatie.' },

  { id:'immig-1', dim:'immig', topic:'Immigration', plain:'Un titre de séjour est l’autorisation officielle, donnée à une personne étrangère, de vivre en France.',
    a:'La France doit maintenir un contrôle des frontières tout en facilitant l’accueil et l’intégration des personnes qui s’installent durablement.',
    b:'La France doit réduire fortement les entrées et durcir les conditions d’accès au séjour.',
    why:'Cette question mesure votre orientation générale sur la politique migratoire.' },
  { id:'immig-2', dim:'immig', topic:'Asile',
    a:'Le droit d’asile doit rester largement garanti, avec des moyens suffisants pour l’examiner rapidement.',
    b:'L’accès à l’asile doit être davantage restreint et conditionné.',
    why:'Cette question précise votre position sur le droit d’asile, distinct de l’immigration économique ou familiale.',
    clarifyA:'Le droit d’asile protège les personnes qui fuient une persécution ou un danger grave dans leur pays.' },
  { id:'immig-3', dim:'immig', topic:'Intégration', plain:'La nationalité française est le statut de citoyen français : elle donne notamment le droit de vote.',
    a:'L’accès à la nationalité française doit rester relativement accessible pour les personnes intégrées.',
    b:'L’accès à la nationalité française doit être rendu plus difficile et plus sélectif.',
    why:'Cette question précise votre position sur les conditions d’accès à la nationalité.' },

  { id:'ecology-1', dim:'ecology', topic:'Climat', plain:'La transition écologique, c’est passer d’une économie très dépendante du pétrole, du gaz et du charbon à une économie qui émet moins de gaz à effet de serre.',
    a:'Il faut accepter des changements et des contraintes plus importants pour accélérer la transition écologique.',
    b:'Il faut avancer plus progressivement pour limiter les contraintes économiques et sociales.',
    why:'Cette question mesure le rythme de transition écologique que vous privilégiez.' },
  { id:'ecology-2', dim:'ecology', topic:'Écologie', plain:'La compétitivité, c’est la capacité des entreprises françaises à vendre face à leurs concurrents étrangers.',
    a:'Il faut renforcer les obligations environnementales des entreprises, même si cela a un coût économique.',
    b:'Il faut limiter les nouvelles contraintes environnementales pour préserver la compétitivité.',
    why:'Cette question mesure l’arbitrage entre régulation environnementale et compétitivité économique.' },
  { id:'ecology-3', dim:'ecology', topic:'Agriculture',
    a:'Il faut accélérer la transformation des pratiques agricoles pour réduire leur impact environnemental.',
    b:'Il faut d’abord préserver la production et le revenu agricoles en limitant les nouvelles contraintes.',
    why:'Cette question mesure l’arbitrage entre transition écologique et continuité de la production agricole.' },
  { id:'ecology-4', dim:'ecology', topic:'Énergie & mobilités', plain:'La sobriété énergétique, c’est consommer moins d’énergie (chauffage, transports, appareils…).',
    a:'Il faut donner la priorité aux transports collectifs, au vélo et à la sobriété énergétique.',
    b:'Il faut d’abord garantir la liberté de déplacement individuel et un accès large à l’énergie.',
    why:'Cette question mesure votre priorité entre sobriété collective et liberté individuelle de déplacement.' }
];

/* ----------------------------------------------------------------------
   BANQUE DE DÉPARTAGE — questions concrètes à plusieurs options, utilisées
   dans la seconde phase pour séparer les partis qui restent proches après
   les 21 questions (jusqu’à 15 questions, choisies une par une selon les
   partis encore en course : voir selectNextDepartage dans scoring.js).

   Différence essentielle avec les 21 questions : ici les options ne
   s’échelonnent PAS de « la gauche » à « la droite ». Elles décrivent des
   choix de politique précis, ordonnés sur un seul axe (pos = 0, 1, 2…),
   entre lesquels des partis d’un même camp se séparent réellement
   (ex. retraites à 60 ans / 62 ans / 64 ans, nucléaire, taxe sur les très
   grandes fortunes, OTAN, Ukraine…).

   Chaque `stances` donne, pour un parti, la position (sur la même échelle
   que `pos`, décimales admises : 1,5 = entre l’option 1 et l’option 2) ou
   est ABSENTE quand la position n’est pas codée : une position absente est
   exclue du calcul, jamais lue comme « au milieu ». Voir README :
   « Mettre à jour les positions ».

   STATUT : positions PROVISOIRES, codées à partir des propositions
   déclarées des candidats et des programmes de partis à la date de
   septembre 2026, recoupées avec plusieurs sources de presse et de
   comparaison (liste dans SOURCES et dans le README). La plupart des
   programmes 2027 ne sont pas encore publiés : à revérifier avant toute
   publication, puis à mesure que la campagne avance. Pour les partis dont
   la position publique se confond avec celle de leur candidat, c’est la
   position du candidat déclaré qui est codée (PS : Olivier Faure ; Place
   publique : Raphaël Glucksmann ; etc.).
   ------------------------------------------------------------------- */
const DEPARTAGE = [
  { id:'dp-retraites', dim:'eco', group:'eco-social', topic:'Retraites',
    q:'Quel âge de départ à la retraite faut-il viser ?',
    plain:'L’âge légal est l’âge à partir duquel on peut prendre sa retraite ; il monte progressivement à 64 ans depuis la réforme de 2023. La durée de cotisation est le nombre d’années de travail exigé pour toucher une pension complète.',
    options:[
      { pos:0, short:'60 ans', text:'Revenir à 60 ans, avec 40 ans de cotisation.' },
      { pos:1, short:'62 ans', text:'Revenir à 62 ans, en annulant le passage à 64 ans.' },
      { pos:2, short:'64 ans, ou durée de cotisation seule', text:'Garder 64 ans, ou supprimer l’âge légal et ne regarder que la durée de cotisation.' },
      { pos:3, short:'65 ans ou plus', text:'Reculer l’âge de départ vers 65 ans ou plus, ou l’indexer sur l’espérance de vie.' }
    ],
    stances:{ lfi:0.25, pcf:0, lo:0, ecolo:0.75, ps:1, pp:1.5, rn:1, renaissance:2, reconquete:2, horizons:3, lr:3, dlf:0.5 },
    basis:'Propositions déclarées des candidats (JDD, 20 Minutes, septembre 2026).' },

  { id:'dp-fortune', dim:'eco', group:'fiscal', topic:'Très grandes fortunes',
    q:'Faut-il taxer davantage les très grandes fortunes ?',
    plain:'Aujourd’hui, l’impôt sur la fortune ne porte que sur l’immobilier (IFI) et les revenus du capital sont taxés à taux fixe (« flat tax »). La « taxe Zucman » est une proposition d’impôt minimal de 2 % par an sur les patrimoines de plus de 100 millions d’euros.',
    options:[
      { pos:0, short:'Cadre actuel', text:'Garder le cadre actuel, sans impôt supplémentaire sur les très grandes fortunes.' },
      { pos:1, short:'Impôt sur la fortune financière', text:'Remplacer l’impôt sur la fortune immobilière par un impôt sur la fortune financière (actions, placements), sans toucher à l’immobilier.' },
      { pos:2, short:'Impôt minimal de 2 % (taxe Zucman)', text:'Créer un impôt minimal de 2 % sur les patrimoines de plus de 100 millions d’euros (« taxe Zucman »).' },
      { pos:3, short:'ISF progressif et plafond', text:'Rétablir un impôt sur la fortune progressif et plafonner les très gros héritages.' }
    ],
    stances:{ lfi:3, lo:3, pcf:2.5, ecolo:2.25, ps:2, pp:2, rn:1, renaissance:0, horizons:0, lr:0, reconquete:0 },
    basis:'LaFacture2027, Contribuables associés (septembre 2026), débat sur la taxe Zucman (octobre 2025).' },

  { id:'dp-invest', dim:'eco', group:'fiscal', topic:'Investissement et déficit',
    q:'Comment concilier investissements publics et finances de l’État ?',
    plain:'Le déficit public, c’est quand l’État dépense plus qu’il ne reçoit sur une année ; la dette publique, c’est l’ensemble de ce qu’il a emprunté et doit rembourser.',
    options:[
      { pos:0, short:'Plan d’investissement, déficit assumé', text:'Lancer un grand plan d’investissement public (écoles, hôpitaux, climat), quitte à accepter un déficit plus élevé.' },
      { pos:1, short:'Investir en taxant les plus riches', text:'Investir davantage en finançant l’effort par de nouveaux impôts sur les plus riches et les grandes entreprises, sans creuser le déficit.' },
      { pos:2, short:'Réduire le déficit, effort partagé', text:'Réduire le déficit en partageant l’effort entre économies et impôts.' },
      { pos:3, short:'Réduire fortement la dépense', text:'Réduire fortement la dépense publique, sans augmenter les impôts.' }
    ],
    stances:{ lfi:0, pcf:0, ecolo:0.75, ps:1, pp:1, dlf:1, renaissance:2.5, horizons:2.5, rn:2.5, lr:3, reconquete:3 },
    basis:'Positions déclarées des candidats sur l’investissement public et la réduction du déficit (septembre 2026).' },

  { id:'dp-propriete', dim:'eco', group:'fiscal', topic:'Entreprises publiques',
    q:'Quel rôle pour l’État dans la propriété des entreprises ?',
    plain:'Nationaliser, c’est faire passer une entreprise sous propriété de l’État ; privatiser, c’est l’inverse. Les autoroutes, par exemple, sont confiées à des sociétés privées par des concessions qui s’achèvent entre 2031 et 2036.',
    options:[
      { pos:0, short:'Privatiser davantage', text:'Confier davantage d’activités et de services publics au secteur privé.' },
      { pos:1, short:'Équilibre actuel', text:'Garder l’équilibre actuel entre public et privé.' },
      { pos:2, short:'Reprendre quelques secteurs clés', text:'Reprendre en main publique quelques secteurs clés (par exemple les autoroutes, une partie de l’énergie).' },
      { pos:3, short:'Nationaliser largement', text:'Nationaliser largement les secteurs stratégiques (énergie, transports, banques…).' }
    ],
    stances:{ lfi:3, pcf:3, lo:3, dlf:2.5, ecolo:2, ps:2, rn:2, pp:1, reconquete:1, renaissance:0.75, horizons:0.75, lr:0 },
    basis:'Positions déclarées des candidats sur les nationalisations et les privatisations (septembre 2026).' },

  { id:'dp-rsa', dim:'eco', group:'eco-social', topic:'RSA',
    q:'Faut-il demander une contrepartie pour toucher le RSA ?',
    plain:'Le RSA (revenu de solidarité active) est une aide versée aux personnes sans ressources suffisantes. Une loi de 2023 généralise, pour une partie des bénéficiaires, une activité d’environ 15 heures par semaine (formation, insertion, emploi).',
    options:[
      { pos:0, short:'Sans contrepartie', text:'Verser le RSA sans contrepartie obligatoire.' },
      { pos:1, short:'Accompagnement, sans obligation d’heures', text:'Renforcer l’accompagnement et la formation, sans imposer un nombre d’heures.' },
      { pos:2, short:'Contrepartie en heures d’activité', text:'Conditionner le RSA à un nombre d’heures d’activité (emploi, formation ou bénévolat).' }
    ],
    stances:{ lfi:0, pcf:0, lo:0, ecolo:0, ps:0, pp:0.75, horizons:1.75, rn:1.75, renaissance:2, lr:2, reconquete:2, dlf:2 },
    basis:'Positions déclarées des candidats sur la conditionnalité du RSA (septembre 2026).' },

  { id:'dp-revenu', dim:'eco', group:'eco-social', topic:'Revenu de base',
    q:'Quelle forme donner aux aides pour les personnes sans ressources ?',
    plain:'Un revenu universel serait versé à tous les adultes, sans condition de ressources ni d’activité. Un revenu minimum garanti n’est versé qu’à ceux dont les ressources sont sous un seuil.',
    options:[
      { pos:0, short:'Revenu universel', text:'Verser à tous les adultes un revenu de base, sans condition de ressources.' },
      { pos:1, short:'Revenu minimum garanti', text:'Garantir à chacun un revenu minimum, versé à ceux qui en ont besoin, en regroupant les aides existantes.' },
      { pos:2, short:'Garder les minima actuels', text:'Garder le système actuel (RSA, aides au logement, etc.).' }
    ],
    stances:{ ecolo:0, lfi:0.75, ps:1.5, pp:1.5, renaissance:1.5, pcf:2, lo:2, horizons:2, rn:2, lr:2, reconquete:2, dlf:2 },
    basis:'Positions déclarées des candidats sur le revenu universel (septembre 2026).' },

  { id:'dp-nucleaire', dim:'ecology', group:'ecologie', topic:'Nucléaire',
    q:'Quelle place pour le nucléaire dans la production d’électricité ?',
    plain:'Environ 70 % de l’électricité française vient aujourd’hui du nucléaire. Les « EPR2 » sont les nouveaux réacteurs prévus par l’État.',
    options:[
      { pos:0, short:'Sortir du nucléaire', text:'Sortir du nucléaire à terme, en visant 100 % d’énergies renouvelables.' },
      { pos:1, short:'Garder l’existant, sans nouveau réacteur', text:'Garder les réacteurs actuels, sans en construire de nouveaux, et développer les renouvelables.' },
      { pos:2, short:'Garder, en construire, et renouvelables', text:'Garder les réacteurs actuels, en construire quelques nouveaux et développer aussi les renouvelables.' },
      { pos:3, short:'Miser avant tout sur le nucléaire', text:'Miser avant tout sur le nucléaire (beaucoup de nouveaux réacteurs) et cesser de soutenir l’éolien et le solaire.' }
    ],
    stances:{ lfi:0, ecolo:0.5, ps:1.5, pp:2, renaissance:2, horizons:2, lr:2.5, pcf:2.5, dlf:2.5, rn:3, reconquete:3 },
    basis:'Colloque UFE (Sfen, juillet 2026), Révolution énergétique et ECOinfos (juin et août 2026), programme LFI (septembre 2026).' },

  { id:'dp-carbone', dim:'ecology', group:'ecologie', topic:'Taxe carbone',
    q:'Que faire de la taxe carbone ?',
    plain:'La taxe carbone est une taxe sur les énergies fossiles (essence, gaz, fioul) qui vise à réduire les émissions de CO₂. Sa hausse est gelée depuis 2018, après la crise des « gilets jaunes ».',
    options:[
      { pos:0, short:'L’augmenter, en redistribuant', text:'L’augmenter progressivement, en redistribuant le produit aux ménages et aux entreprises.' },
      { pos:1, short:'La garder telle quelle', text:'La garder à son niveau actuel.' },
      { pos:2, short:'La supprimer', text:'La supprimer.' }
    ],
    stances:{ ecolo:0.25, pp:0.25, ps:1, horizons:1, lfi:1.5, renaissance:1.5, lr:1.75, pcf:2, rn:2, reconquete:2, dlf:2 },
    basis:'Positions déclarées des candidats sur la fiscalité carbone (septembre 2026).' },

  { id:'dp-thermique', dim:'ecology', group:'ecologie', topic:'Voitures thermiques',
    q:'Faut-il maintenir l’interdiction de vendre des voitures thermiques neuves en 2035 ?',
    plain:'L’Union européenne a décidé d’interdire, à partir de 2035, la vente de voitures neuves à moteur essence ou diesel ; une exception est prévue pour les carburants de synthèse.',
    options:[
      { pos:0, short:'La maintenir', text:'Maintenir l’interdiction en 2035.' },
      { pos:1, short:'L’assouplir', text:'L’assouplir (hybrides, carburants de synthèse, report de la date).' },
      { pos:2, short:'La supprimer', text:'La supprimer.' }
    ],
    stances:{ ecolo:0, pp:0, lfi:0, ps:0.5, pcf:0.5, renaissance:0.5, horizons:1.5, lr:2, rn:2, reconquete:2, dlf:2 },
    basis:'Positions déclarées des candidats sur l’échéance de 2035 (septembre 2026).' },

  { id:'dp-pesticides', dim:'ecology', group:'ecologie', topic:'Pesticides',
    q:'Quelle politique pour les pesticides ?',
    plain:'Les pesticides de synthèse protègent les cultures mais ont des effets sur la santé et l’environnement. Exemple de débat récent : l’acétamipride, un insecticide interdit en France dont la réautorisation a été débattue en 2025.',
    options:[
      { pos:0, short:'Interdire progressivement', text:'Interdire progressivement les pesticides de synthèse.' },
      { pos:1, short:'Interdire les plus dangereux', text:'Interdire les plus dangereux et aider les agriculteurs à s’en passer.' },
      { pos:2, short:'Pas sans alternative', text:'Ne pas interdire de nouvelles substances tant qu’aucune alternative n’est prête.' },
      { pos:3, short:'Assouplir les normes', text:'Assouplir les normes françaises pour les aligner sur celles des autres pays.' }
    ],
    stances:{ ecolo:0, lfi:0, ps:0.75, pp:0.75, pcf:0.75, renaissance:2, horizons:2, dlf:2.25, lr:2.5, reconquete:2.5, rn:3 },
    basis:'Positions déclarées des candidats sur les pesticides (septembre 2026).' },

  { id:'dp-europe', dim:'europe', group:'europe', topic:'Place de l’Union européenne',
    q:'Quelle place pour l’Union européenne ?',
    plain:'Aujourd’hui, le droit européen s’impose au droit français dans les domaines où l’Union a compétence (concurrence, monnaie, commerce, règles budgétaires…).',
    options:[
      { pos:0, short:'Approfondir l’UE', text:'Approfondir l’Union européenne (budget commun, défense commune, plus de décisions prises à plusieurs).' },
      { pos:1, short:'Désobéir à certaines règles', text:'Rester dans l’Union, mais pouvoir désobéir à certaines règles quand elles empêchent d’appliquer notre politique.' },
      { pos:2, short:'La Constitution avant le droit européen', text:'Rester dans l’Union, mais faire passer la Constitution française avant le droit européen.' },
      { pos:3, short:'Quitter l’UE', text:'Quitter l’Union européenne.' }
    ],
    stances:{ pp:0, renaissance:0, modem:0, udi:0.25, ecolo:0.25, ps:0.5, horizons:0.5, lfi:1.25, pcf:1.25, lr:2, rn:2, reconquete:2, dlf:3, upr:3 },
    basis:'Programme LFI 2027 (« désobéir »), ÉlyséeScope (juillet 2026), propositions Retailleau (septembre 2026).' },

  { id:'dp-otan', dim:'europe', group:'defense', topic:'OTAN',
    q:'Quelle place pour la France dans l’OTAN ?',
    plain:'L’OTAN est une alliance militaire entre pays d’Amérique du Nord et d’Europe, créée en 1949. La France en avait quitté le commandement militaire intégré en 1966 et l’a réintégré en 2009.',
    options:[
      { pos:0, short:'Quitter l’OTAN', text:'Quitter l’OTAN.' },
      { pos:1, short:'Sortir du commandement intégré', text:'Rester dans l’alliance, mais sortir de son commandement militaire intégré.' },
      { pos:2, short:'Rester comme aujourd’hui', text:'Rester dans l’OTAN comme aujourd’hui.' }
    ],
    stances:{ lfi:0, pcf:0, upr:0, dlf:1, reconquete:1.25, rn:1.5, ecolo:1.75, ps:2, pp:2, renaissance:2, horizons:2, lr:2 },
    basis:'Positions déclarées des candidats sur l’OTAN (septembre 2026), ÉlyséeScope (juillet 2026).' },

  { id:'dp-ukraine', dim:'europe', group:'defense', topic:'Ukraine',
    q:'Quelle politique à l’égard de l’Ukraine et de la Russie ?',
    plain:'Depuis l’invasion russe de février 2022, la France livre des armes à l’Ukraine et finance son soutien.',
    options:[
      { pos:0, short:'Limiter les armes, négocier', text:'Arrêter ou limiter fortement les livraisons d’armes et privilégier la négociation avec la Russie.' },
      { pos:1, short:'Maintenir l’aide actuelle', text:'Maintenir l’aide actuelle, sans l’augmenter et sans envoyer de soldats français.' },
      { pos:2, short:'Augmenter l’aide militaire', text:'Augmenter l’aide militaire (y compris armements lourds) et garantir durablement la sécurité de l’Ukraine.' }
    ],
    stances:{ lfi:0.25, reconquete:0, dlf:0, upr:0, rn:0.75, pcf:0.75, ecolo:1.75, ps:2, pp:2, renaissance:2, horizons:2, lr:2 },
    basis:'Positions déclarées des candidats sur le soutien militaire à l’Ukraine (septembre 2026).' },

  { id:'dp-defense', dim:'europe', group:'defense', topic:'Budget de la défense',
    q:'Quel budget pour l’armée ?',
    plain:'Le budget de la défense représente aujourd’hui environ 2 % de la richesse produite par le pays (le PIB).',
    options:[
      { pos:0, short:'Réduire ou geler', text:'Réduire ou geler le budget militaire.' },
      { pos:1, short:'Maintenir environ 2 %', text:'Le maintenir à peu près au niveau actuel (environ 2 % du PIB).' },
      { pos:2, short:'Augmenter modérément', text:'L’augmenter modérément.' },
      { pos:3, short:'3 % du PIB ou plus', text:'Le porter à 3 % du PIB ou plus.' }
    ],
    stances:{ lfi:0, lo:0, pcf:0.75, ecolo:0.75, ps:1.5, pp:2.5, horizons:2.75, dlf:2.75, renaissance:3, lr:3, rn:3, reconquete:3 },
    basis:'Positions déclarées des candidats sur l’objectif de 3 % du PIB (septembre 2026).' },

  { id:'dp-armee', dim:'europe', group:'defense', topic:'Défense européenne',
    q:'Faut-il une armée européenne ?',
    plain:'Une armée européenne aurait un commandement commun aux pays de l’Union, distinct de l’OTAN.',
    options:[
      { pos:0, short:'Armée européenne commune', text:'Créer une armée européenne commune, avec un commandement unique.' },
      { pos:1, short:'Coopération renforcée', text:'Renforcer la coopération entre armées nationales (achats communs, industrie, commandement coordonné), sans armée unique.' },
      { pos:2, short:'Chaque pays garde sa défense', text:'Garder une défense nationale, avec une coopération au cas par cas.' }
    ],
    stances:{ pp:0, renaissance:0, ecolo:0.5, ps:0.5, horizons:0.5, lr:1.5, lfi:2, pcf:2, rn:2, reconquete:2, dlf:2 },
    basis:'Positions déclarées des candidats sur la défense européenne (septembre 2026), ÉlyséeScope (juillet 2026).' },

  { id:'dp-dissuasion', dim:'europe', group:'defense', topic:'Armes nucléaires',
    q:'Que faire de la dissuasion nucléaire française ?',
    plain:'La dissuasion nucléaire désigne les armes nucléaires de la France, censées décourager toute attaque contre elle. Le traité d’interdiction des armes nucléaires (TIAN, 2021) n’a pas été signé par la France.',
    options:[
      { pos:0, short:'S’engager vers le désarmement', text:'S’engager vers un désarmement nucléaire (signer le traité d’interdiction).' },
      { pos:1, short:'Garder, et viser un désarmement multilatéral', text:'Garder la dissuasion tout en œuvrant pour un désarmement négocié avec les autres pays.' },
      { pos:2, short:'Garder et moderniser', text:'Garder et moderniser la dissuasion nationale.' }
    ],
    stances:{ ecolo:0, lfi:0.75, pcf:1, ps:1, pp:2, renaissance:2, horizons:2, lr:2, rn:2, reconquete:2, dlf:2 },
    basis:'Positions déclarées des candidats sur le désarmement nucléaire (septembre 2026).' },

  { id:'dp-regul', dim:'immig', group:'immigration', topic:'Personnes en situation irrégulière',
    q:'Que faire des personnes étrangères en situation irrégulière ?',
    plain:'Une personne en situation irrégulière vit en France sans titre de séjour. Une OQTF (obligation de quitter le territoire français) est la décision administrative qui lui ordonne de partir. Régulariser, c’est lui accorder un titre de séjour.',
    options:[
      { pos:0, short:'Régulariser largement', text:'Régulariser largement les personnes installées durablement, sans expulsions systématiques.' },
      { pos:1, short:'Au cas par cas', text:'Régulariser au cas par cas et expulser en priorité les personnes condamnées.' },
      { pos:2, short:'Expulser la plupart', text:'Expulser la plupart des personnes en situation irrégulière, en ne régularisant qu’exceptionnellement.' },
      { pos:3, short:'Expulser systématiquement', text:'Expulser systématiquement toute personne en situation irrégulière.' }
    ],
    stances:{ lfi:0, ecolo:0, lo:0, ps:0.5, pcf:1, pp:2.25, renaissance:2.25, horizons:2.25, lr:3, rn:3, reconquete:3, dlf:3 },
    basis:'Positions déclarées des candidats sur les expulsions et les régularisations (septembre 2026).' },

  { id:'dp-sol', dim:'immig', group:'immigration', topic:'Droit du sol',
    q:'Que faire du droit du sol ?',
    plain:'Le droit du sol permet à un enfant né en France de parents étrangers d’acquérir la nationalité française, sous conditions de résidence.',
    options:[
      { pos:0, short:'Le maintenir', text:'Le maintenir tel qu’il est.' },
      { pos:1, short:'Ajouter des conditions', text:'Le garder en ajoutant des conditions (par exemple sur la situation des parents).' },
      { pos:2, short:'Le supprimer ou le limiter fortement', text:'Le supprimer ou le limiter fortement : naître en France ne donnerait plus accès automatiquement à la nationalité.' }
    ],
    stances:{ lfi:0, pcf:0, lo:0, ecolo:0, ps:0, pp:0, renaissance:0.5, horizons:1, lr:2, rn:2, reconquete:2, dlf:2 },
    basis:'Positions déclarées des candidats sur le droit du sol (septembre 2026).' },

  { id:'dp-preference', dim:'immig', group:'immigration', topic:'Aides sociales et nationalité',
    q:'Les étrangers en situation régulière doivent-ils avoir les mêmes droits aux aides sociales ?',
    plain:'La « préférence nationale » (ou « priorité nationale ») consiste à réserver en priorité certaines aides ou certains logements aux citoyens français.',
    options:[
      { pos:0, short:'Mêmes règles pour tous', text:'Mêmes règles pour tous les résidents en situation régulière.' },
      { pos:1, short:'Délai de résidence plus long', text:'Exiger une durée de résidence ou de cotisation plus longue avant certaines aides (par exemple 5 ans).' },
      { pos:2, short:'Priorité aux Français', text:'Réserver en priorité aux Français les aides sociales et les logements sociaux (préférence nationale).' }
    ],
    stances:{ lfi:0, pcf:0, lo:0, ecolo:0, ps:0, pp:0, renaissance:0.5, horizons:1, lr:1.25, dlf:1.5, rn:2, reconquete:2 },
    basis:'Positions déclarées des candidats sur le délai de carence et la priorité nationale (septembre 2026).' },

  { id:'dp-laicite', dim:'soc', group:'societe', topic:'Laïcité',
    q:'Quelles règles pour les signes religieux ?',
    plain:'La laïcité, c’est la séparation de l’État et des religions : l’État est neutre. Aujourd’hui, les agents publics doivent être neutres et les élèves ne peuvent pas porter de signe religieux ostensible à l’école publique (loi de 2004).',
    options:[
      { pos:0, short:'Liberté pour les usagers', text:'Laisser les usagers libres d’afficher leurs convictions : la neutralité ne s’impose qu’aux agents publics.' },
      { pos:1, short:'Règles actuelles', text:'Garder les règles actuelles, sans les étendre.' },
      { pos:2, short:'Étendre à d’autres lieux', text:'Étendre l’interdiction des signes religieux ostensibles à d’autres lieux (université, sorties scolaires, compétitions sportives).' },
      { pos:3, short:'Interdire pour tous dans les services publics', text:'Interdire les signes religieux ostensibles à tous dans les services publics (agents comme usagers).' }
    ],
    stances:{ lfi:0, ecolo:0, ps:1, pp:1, pcf:1, horizons:1.25, renaissance:2.25, lr:3, rn:3, reconquete:3, dlf:3 },
    basis:'Positions déclarées des candidats sur la laïcité et les signes religieux (septembre 2026).' },

  { id:'dp-cannabis', dim:'auth', group:'societe', topic:'Cannabis',
    q:'Quelle politique pour le cannabis ?',
    plain:'Aujourd’hui, l’usage de cannabis est interdit en France et passible d’une amende forfaitaire. Dépénaliser, c’est ne plus sanctionner l’usage sans autoriser la vente ; légaliser, c’est autoriser et encadrer la vente.',
    options:[
      { pos:0, short:'Légaliser et encadrer', text:'Légaliser et encadrer la production et la vente, sous contrôle de l’État.' },
      { pos:1, short:'Dépénaliser l’usage', text:'Dépénaliser l’usage sans légaliser la vente.' },
      { pos:2, short:'Maintenir l’interdiction', text:'Maintenir l’interdiction et les amendes actuelles.' },
      { pos:3, short:'Durcir la répression', text:'Durcir la répression, y compris contre les usagers.' }
    ],
    stances:{ lfi:0, ecolo:0, ps:0.5, pp:0.5, lo:1, pcf:2, renaissance:2, horizons:2, reconquete:2.25, lr:3, rn:3, dlf:3 },
    basis:'Positions déclarées des candidats sur la légalisation du cannabis (septembre 2026).' },

  { id:'dp-scrutin', dim:'auth', group:'institutions', topic:'Mode de scrutin',
    q:'Comment élire les députés ?',
    plain:'Aujourd’hui, chaque député est élu dans sa circonscription au scrutin majoritaire à deux tours. À la proportionnelle, les sièges sont répartis selon la part des voix obtenue par chaque parti.',
    options:[
      { pos:0, short:'Proportionnelle intégrale', text:'Élire tous les députés à la proportionnelle.' },
      { pos:1, short:'Une part de proportionnelle', text:'Garder des circonscriptions et ajouter une part de proportionnelle.' },
      { pos:2, short:'Scrutin actuel', text:'Garder le scrutin actuel.' }
    ],
    stances:{ lfi:0, rn:0, ecolo:0.5, pp:0.5, ps:0.75, reconquete:1.75, lr:2 },
    basis:'Positions déclarées des candidats sur la proportionnelle (septembre 2026). Horizons, Renaissance et DLF : sources divergentes, non codés.' },

  { id:'dp-republique', dim:'auth', group:'institutions', topic:'Institutions',
    q:'Faut-il changer les institutions ?',
    plain:'La Ve République (1958) donne de grands pouvoirs au président. L’article 49.3 permet au gouvernement de faire adopter un texte sans vote, sauf motion de censure. Une VIe République supposerait une nouvelle Constitution.',
    options:[
      { pos:0, short:'Nouvelle République', text:'Changer de République : élire une Assemblée constituante pour écrire une nouvelle Constitution.' },
      { pos:1, short:'Rééquilibrer la Ve', text:'Rééquilibrer la Ve République : plus de pouvoirs pour le Parlement, moins pour le président, fin du 49.3.' },
      { pos:2, short:'Garder les institutions', text:'Garder les institutions actuelles.' }
    ],
    stances:{ lfi:0, pcf:0, ecolo:0, pp:0.5, ps:1, dlf:1, renaissance:1.5, horizons:1.75, lr:2, rn:2, reconquete:2 },
    basis:'Positions déclarées des candidats sur la VIe République, le 49.3 et les pouvoirs du Parlement (septembre 2026).' },

  { id:'dp-snu', dim:'auth', group:'societe', topic:'Service national',
    q:'Faut-il un service national obligatoire ?',
    plain:'Le Service national universel (SNU) est un dispositif de quelques semaines (cohésion, engagement, découverte de la défense) proposé aux jeunes de 15 à 17 ans.',
    options:[
      { pos:0, short:'Volontariat seulement', text:'Garder uniquement le volontariat (service civique).' },
      { pos:1, short:'SNU obligatoire', text:'Rendre obligatoire un service national universel de quelques semaines.' },
      { pos:2, short:'Service militaire', text:'Rétablir un service militaire obligatoire.' }
    ],
    stances:{ lfi:0, pcf:0, lo:0, ps:0, ecolo:0.25, lr:0.25, horizons:0.5, pp:1, renaissance:1, rn:1.25, dlf:1.25, reconquete:1.5 },
    basis:'Positions déclarées des candidats sur le SNU obligatoire (septembre 2026).' }
];

/* Sources consultées pour recouper les positions ci-dessus (septembre 2026).
   Aucune n’est reproduite : elles servent de contrôle. MonVote2027 est un
   outil citoyen indépendant ; sa licence d’utilisation n’étant pas précisée,
   ses données n’ont PAS été copiées, seulement consultées pour vérifier la
   cohérence des codages ci-dessus, qui restent un travail éditorial propre. */
const SOURCES = [
  { label:'Retraites : positions des candidats (BDOR)', url:'https://www.bdor.fr/actualites-or/presidentielle-2027-age-retraite-candidats' },
  { label:'Retraites : ce que proposent les candidats (JDD)', url:'https://www.lejdd.fr/politique/retraites-ce-que-proposent-les-candidats-a-la-presidentielle-184728' },
  { label:'Nucléaire : positions des grands partis (Sfen, juillet 2026)', url:'https://www.sfen.org/rgn/presidentielle-2027-au-colloque-de-lufe-les-grands-partis-listent-leurs-positions-sur-le-nucleaire/' },
  { label:'Énergie : qui dit quoi parmi les candidats (Révolution énergétique)', url:'https://www.revolution-energetique.com/actus/qui-dit-quoi-sur-lenergie-parmi-les-candidats-declares-a-la-presidentielle/' },
  { label:'Impôt sur la fortune : position de chaque candidat (LaFacture2027)', url:'https://lafacture2027.fr/isf-2027-candidats' },
  { label:'Fiscalité : suivi des propositions (Contribuables associés)', url:'https://contribuablesassocies.org/2026/09/09/presidentielle-2027-a-quelle-sauce-fiscale-serez-vous-assaisonnes/' },
  { label:'Europe : candidats favorables ou hostiles à l’UE (ÉlyséeScope)', url:'https://www.elyseescope.com/le-radar/europe-2027-les-candidats-favorables-ou-hostiles-a-l-ue' },
  { label:'Programme LFI 2027, chapitre Europe', url:'https://melenchon2027.fr/programme2025/livre/chapitre17/s2/' },
  { label:'Attal et Philippe : comparatif sur 40 propositions (France-Vote)', url:'https://www.france-vote.fr/comparateur/gabriel-attal-vs-edouard-philippe' },
  { label:'Attal, Retailleau et Philippe : sept différences (Contexte)', url:'https://www.contexte.com/fr/article/pouvoirs/finances-publiques-travail-retraites-institutions-le-jeu-des-sept-differences-entre-gabriel-attal-bruno-retailleau-et-edouard-philippe_272575' },
  { label:'Positions des candidats en données ouvertes (MonVote2027), consultées pour recoupement uniquement', url:'https://monvote2027.fr/donnees' }
];

/* ----------------------------------------------------------------------
   PARTIS — positions estimées sur chaque dimension (-2 à +2, même échelle
   que les réponses). CE SONT DES ESTIMATIONS ÉDITORIALES construites à
   partir des programmes et prises de position publiques identifiées,
   PAS des scores auto-déclarés par les partis. Voir la fiche de chaque
   parti dans l’application et la méthodologie pour le détail et les
   limites. Situation politique arrêtée en septembre 2026 (voir
   CHANGELOG / README pour les sources) : à vérifier avant toute
   publication, notamment les liens, à l’approche de la présidentielle
   d’avril 2027.

   VALEUR null : signifie « position non établie sur cette dimension » (le
   parti n’a pas de position identifiable sur ce thème, ou l’axe mesuré ne
   s’applique pas à sa logique — ex. l’axe intégration/souveraineté pour un
   parti internationaliste). Ce n’est JAMAIS un 0 : un 0 voudrait dire
   « position réellement modérée ». Une dimension null est exclue de la
   comparaison pour ce parti (comme une dimension à laquelle la personne
   n’a pas répondu), au lieu de rapprocher artificiellement ce parti de
   tous les profils centristes.
   ------------------------------------------------------------------- */
const PARTIES = [
  { id:'lfi', name:'La France insoumise', short:'LFI', family:'Gauche', color:'#7b5dc8',
    site:'https://lafranceinsoumise.fr/', program:'https://lafranceinsoumise.fr/programme/',
    status:'Candidature pressentie de Jean-Luc Mélenchon. Programme de référence : « L’Avenir en commun ». Positions actualisées par les votes et déclarations du mouvement en 2025-2026.',
    statusDate:'2026-09',
    personName:'Jean-Luc Mélenchon', personRole:'Candidature pressentie', portraitFile:'Jean-Luc Mélenchon en 2026.png', portraitCredit:'jlm2017.fr', portraitLicense:'CC BY 4.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by/4.0/',
    positions:{ eco:-2, soc:-1.5, auth:-1, europe:0.8, immig:-1.5, ecology:-2 } },
  { id:'pcf', name:'Parti communiste français', short:'PCF', family:'Gauche', color:'#b5193f',
    site:'https://www.pcf.fr/', program:'https://www.pcf.fr/nos_propositions',
    status:'Fabien Roussel, candidat déclaré (annoncé le 6 septembre 2026). 40ᵉ congrès du parti en cours en 2026.',
    statusDate:'2026-09',
    personName:'Fabien Roussel', personRole:'Candidat proposé par les adhérents', portraitFile:'Fabien Roussel 2022.jpg', portraitCredit:'Zouhair Nakara', portraitLicense:'CC BY-SA 4.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
    positions:{ eco:-1.8, soc:-1, auth:-0.5, europe:0.5, immig:-1, ecology:-1 } },
  { id:'ps', name:'Parti socialiste', short:'PS', family:'Centre-gauche', color:'#df2160',
    site:'https://parti-socialiste.fr/', program:'https://parti-socialiste.fr/',
    status:'Olivier Faure, candidat à la primaire « Choisir 2027 » organisée avec Place publique (octobre 2026), aux côtés de Jérôme Guedj, Emmanuel Maurel et Ségolène Royal.',
    statusDate:'2026-09',
    personName:'Olivier Faure', personRole:'Candidat à la primaire annoncée', portraitFile:'Olivier Faure PSE-CARCA--1194 (cropped).jpg', portraitCredit:'PES Group Committee of the Regions', portraitLicense:'CC BY 2.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by/2.0/',
    positions:{ eco:-1, soc:-1.2, auth:-0.3, europe:-1.3, immig:-0.5, ecology:-0.8 } },
  { id:'pp', name:'Place publique', short:'PP', family:'Centre-gauche européen', color:'#6c53a4',
    site:'https://place-publique.eu/', program:'https://place-publique.eu/',
    status:'Raphaël Glucksmann, candidat à la primaire « Choisir 2027 » organisée avec le Parti socialiste (octobre 2026).',
    statusDate:'2026-09',
    personName:'Raphaël Glucksmann', personRole:'Candidat à la primaire annoncée', portraitFile:'2024-03-03 - Congrès du PSE- 105 - Raphael Glucksmann.jpg', portraitCredit:'Mathieu Delmestre', portraitLicense:'CC0 1.0', portraitLicenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',
    positions:{ eco:-0.8, soc:-1.2, auth:-0.3, europe:-1.8, immig:-0.5, ecology:-1.3 } },
  { id:'ecolo', name:'Les Écologistes', short:'LE', family:'Écologie', color:'#1e9b58',
    site:'https://lesecologistes.fr/', program:'https://lesecologistes.fr/',
    status:'Marine Tondelier, secrétaire nationale (réélue en avril 2025) et candidate déclarée depuis octobre 2025 ; maintient sa candidature hors des primaires en cours (position réaffirmée en août 2026).',
    statusDate:'2026-09',
    personName:'Marine Tondelier', personRole:'Secrétaire nationale · candidate déclarée selon le statut indiqué', portraitFile:'Huma2023MarineTondelier (cropped).jpg', portraitCredit:'Selbymay', portraitLicense:'CC BY 4.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by/4.0/',
    positions:{ eco:-1.2, soc:-1.5, auth:-0.5, europe:-1.3, immig:-1, ecology:-2 } },
  { id:'renaissance', name:'Renaissance', short:'RE', family:'Centre', color:'#0b2d4f',
    site:'https://parti-renaissance.fr/', program:'https://parti-renaissance.fr/',
    status:'Gabriel Attal, secrétaire général depuis décembre 2024, candidature officialisée le 22 mai 2026.',
    statusDate:'2026-09',
    personName:'Gabriel Attal', personRole:'Candidat déclaré selon le statut indiqué', portraitFile:'Gabriel Attal 2025 (close crop).jpg', portraitCredit:'Ismail Aissoub', portraitLicense:'CC BY 4.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by/4.0/',
    positions:{ eco:0.8, soc:-0.3, auth:0.3, europe:-1.5, immig:0.3, ecology:0 } },
  { id:'modem', name:'Mouvement Démocrate', short:'MD', family:'Centre', color:'#4c67c7',
    site:'https://www.mouvementdemocrate.fr/', program:'https://www.mouvementdemocrate.fr/',
    status:'Membre du « comité de liaison » du bloc central (Renaissance, Horizons, MoDem, UDI) constitué en 2026 en vue de la présidentielle.',
    statusDate:'2026-09',
    personName:'François Bayrou', personRole:'Figure du Mouvement Démocrate', portraitFile:'François Bayrou - 2025 (cropped).jpg', portraitCredit:'Nicolas Kovarik / Commission européenne', portraitLicense:'CC BY 4.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by/4.0/',
    positions:{ eco:0.3, soc:-0.5, auth:0, europe:-1.8, immig:0, ecology:-0.3 } },
  { id:'udi', name:'Union des Démocrates et Indépendants', short:'UDI', family:'Centre-droit', color:'#0b5fae',
    site:'https://www.parti-udi.fr/', program:'https://www.parti-udi.fr/',
    status:'Membre du « comité de liaison » du bloc central constitué en 2026.',
    statusDate:'2026-09',
    personName:'Hervé Marseille', personRole:'Président de l’UDI', portraitFile:'Herve Marseille-IMG 4093.jpg', portraitCredit:'Rama', portraitLicense:'CC BY-SA 2.0 France', portraitLicenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/fr/',
    positions:{ eco:0.8, soc:-0.2, auth:0.3, europe:-1.3, immig:0.3, ecology:-0.2 } },
  { id:'horizons', name:'Horizons', short:'H', family:'Centre-droit', color:'#111827',
    site:'https://horizonsleparti.fr/', program:'https://horizonsleparti.fr/le-manifeste/',
    status:'Édouard Philippe, président du parti et candidat déclaré, réélu maire du Havre en mars 2026.',
    statusDate:'2026-09',
    personName:'Édouard Philippe', personRole:'Candidat déclaré selon le statut indiqué', portraitFile:'Édouard Philippe MSC 2018 (cropped).jpg', portraitCredit:'Mueller / MSC', portraitLicense:'CC BY 3.0 Allemagne', portraitLicenseUrl:'https://creativecommons.org/licenses/by/3.0/de/',
    positions:{ eco:1, soc:-0.2, auth:0.5, europe:-1, immig:0.5, ecology:-0.2 } },
  { id:'lr', name:'Les Républicains', short:'LR', family:'Droite', color:'#1d4f91',
    site:'https://republicains.fr/', program:'https://republicains.fr/nos-propositions/',
    status:'Bruno Retailleau, président du parti depuis mai 2025, désigné candidat par un vote des adhérents (environ 74 %) en février 2026. Tension interne persistante avec Laurent Wauquiez.',
    statusDate:'2026-09',
    personName:'Bruno Retailleau', personRole:'Candidat désigné par les adhérents selon le statut indiqué', portraitFile:"Bruno Retailleau - Ministre de l'Intérieur français (3x4 cropped).jpg", portraitCredit:'Anthony Montardy', portraitLicense:'CC BY 4.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by/4.0/',
    positions:{ eco:1.5, soc:0.8, auth:1.3, europe:0.3, immig:1.5, ecology:1 } },
  { id:'udr', name:'Union des droites pour la République', short:'UDR', family:'Droite nationale', color:'#203552',
    site:'https://www.udr.fr/', program:'https://www.udr.fr/',
    status:'Éric Ciotti, parti fondé en 2024 après sa rupture avec Les Républicains ; groupe parlementaire (UDDPLR) formé en septembre 2025, allié du Rassemblement national.',
    statusDate:'2026-09',
    personName:'Éric Ciotti', personRole:'Président et figure de l’UDR', portraitFile:'Éric Ciotti, EPP Summit, 23 March, Brussels (52765298047) (cropped).jpg', portraitCredit:'European People’s Party', portraitLicense:'CC BY 2.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by/2.0/',
    positions:{ eco:1.3, soc:1.3, auth:1.8, europe:1.3, immig:1.8, ecology:1.3 } },
  { id:'rn', name:'Rassemblement National', short:'RN', family:'Droite nationale', color:'#173f70',
    site:'https://rassemblementnational.fr/', program:'https://rassemblementnational.fr/programme/',
    status:'Marine Le Pen, candidature officialisée le 7 juillet 2026 après réduction en appel de sa peine d’inéligibilité (pourvoi en cassation en cours). Jordan Bardella, président du parti, pressenti pour Matignon en cas de victoire.',
    statusDate:'2026-09',
    personName:'Marine Le Pen', personRole:'Candidate déclarée selon le statut indiqué', portraitFile:'Marine Le Pen in 2026.jpg', portraitCredit:'Elekes Andor', portraitLicense:'CC BY 4.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by/4.0/',
    positions:{ eco:0.3, soc:1.3, auth:1.8, europe:1.3, immig:2, ecology:0.8 } },
  { id:'reconquete', name:'Reconquête', short:'R', family:'Droite nationale', color:'#a93f4b',
    site:'https://www.parti-reconquete.fr/', program:'https://www.parti-reconquete.fr/programme',
    status:'Éric Zemmour, président et candidat déclaré (annoncé le 17 septembre 2026).',
    statusDate:'2026-09',
    personName:'Éric Zemmour', personRole:'Candidat déclaré selon le statut indiqué', portraitFile:'Portrait Éric Zemmour, avril 2022 cropped.jpg', portraitCredit:'Anh De France', portraitLicense:'CC0 1.0', portraitLicenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',
    positions:{ eco:1, soc:1.8, auth:2, europe:1.8, immig:2, ecology:0.8 } },
  { id:'dlf', name:'Debout la France', short:'DLF', family:'Droite souverainiste', color:'#1683b5',
    site:'https://www.debout-la-france.fr/', program:'https://www.debout-la-france.fr/notre-projet/',
    status:'Nicolas Dupont-Aignan, président et candidat déclaré (officialisé le 19 septembre 2026), campagne centrée sur la sortie de l’Union européenne (« Frexit »).',
    statusDate:'2026-09',
    personName:'Nicolas Dupont-Aignan', personRole:'Candidat déclaré selon le statut indiqué', portraitFile:'Nicolas Dupont-Aignan in 2014.jpg', portraitCredit:'Laurence de Terline', portraitLicense:'CC BY-SA 2.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/',
    positions:{ eco:0.5, soc:0.8, auth:1.3, europe:2, immig:1.5, ecology:0.5 } },
  { id:'upr', name:'Union populaire républicaine', short:'UPR', family:'Souverainiste', color:'#25518a',
    site:'https://upr.fr/', program:'https://upr.fr/notre-programme',
    status:'Parti structuré presque exclusivement autour de la sortie de l’Union européenne, de l’euro et de l’OTAN ; ses positions sur les autres thèmes ne sont pas codées dans cette version. Il n’est donc comparé que sur l’Europe et l’OTAN, et n’affiche pas de pourcentage.',
    statusDate:'2026-09',
    personName:'François Asselineau', personRole:'Président de l’UPR', portraitFile:'François ASSELINEAU.jpg', portraitCredit:'Union Populaire Républicaine', portraitLicense:'CC BY-SA 4.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
    positions:{ eco:null, soc:null, auth:null, europe:2, immig:null, ecology:null } },
  { id:'lo', name:'Lutte Ouvrière', short:'LO', family:'Extrême gauche', color:'#c81f1f',
    site:'https://www.lutte-ouvriere.org/', program:'https://www.lutte-ouvriere.org/',
    status:'Nathalie Arthaud, porte-parole historique, testée dans les enquêtes d’intentions de vote pour 2027. Parti internationaliste : sa position ne se lit pas sur l’axe « intégration européenne / souveraineté nationale », cette dimension n’est donc pas comparée.',
    statusDate:'2026-09',
    personName:'Nathalie Arthaud', personRole:'Porte-parole de Lutte Ouvrière', portraitFile:'Nathalie Arthaud.png', portraitCredit:'Minamonoch', portraitLicense:'CC BY-SA 3.0', portraitLicenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',
    positions:{ eco:-2, soc:-1, auth:-1, europe:null, immig:-1.5, ecology:-0.5 } }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DIMENSIONS, DIM_KEYS, QUESTIONS, DEPARTAGE, PARTIES, SOURCES };
} else if (typeof window !== 'undefined') {
  // Dans le navigateur, ces `const` de haut niveau sont bien visibles par
  // nom depuis les balises <script> suivantes (portée lexicale partagée),
  // mais ne deviennent PAS des propriétés de `window` (contrairement à
  // `var`). scoring.js y accède via `window.DIMENSIONS` etc. : on les y
  // attache donc explicitement pour que ce module reste indépendant de
  // l’ordre exact d’exécution et inspectable facilement (console/débogage).
  window.DIMENSIONS = DIMENSIONS; window.DIM_KEYS = DIM_KEYS;
  window.QUESTIONS = QUESTIONS; window.DEPARTAGE = DEPARTAGE;
  window.PARTIES = PARTIES; window.SOURCES = SOURCES;
}

