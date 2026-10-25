/* ============================================================================
   VOTEZ BIEN ! — data.js
   Toutes les données du questionnaire : dimensions, questions, banque
   diagnostique, partis, thèmes détaillés et baromètre des sondages.
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
   QUESTIONS PRINCIPALES
   ------------------------------------------------------------------- */
const QUESTIONS = [
  { id:'eco-1', dim:'eco', topic:'Impôts', plain:'Le patrimoine, c’est ce que l’on possède : logement, épargne, placements, entreprise…',
    a:'Les personnes ayant les revenus et patrimoines les plus élevés devraient contribuer davantage au financement collectif.',
    b:'Il faut plutôt limiter les prélèvements, y compris pour les plus hauts revenus.',
    why:'Cette question mesure votre préférence entre plus de redistribution et des impôts plus limités.' },
  { id:'eco-2', dim:'eco', topic:'Services publics', plain:'La dépense publique, c’est l’argent dépensé par l’État et les collectivités : santé, école, police, aides…',
    a:'Il faut augmenter les moyens des services publics (santé, école…), même si cela demande de nouvelles recettes ou davantage de dette.',
    b:'Il faut éviter d’augmenter les dépenses et les prélèvements, quitte à réorganiser ou réduire certains services publics.',
    why:'Les deux propositions opposent des choix de financement quand les ressources publiques sont limitées.' },
  { id:'eco-3', dim:'eco', topic:'Travail', plain:'Protéger les salariés : par exemple des contrats stables et des règles de licenciement. Plus de souplesse : des règles plus légères pour embaucher ou licencier.',
    a:'Il faut mieux protéger les salariés, même si cela crée davantage de règles pour les entreprises.',
    b:'Il faut donner plus de souplesse aux entreprises pour faciliter l’embauche.',
    why:'Cette question mesure l’arbitrage entre protection des salariés et flexibilité du travail.' },
  { id:'eco-4', dim:'eco', topic:'Économie',
    a:'L’État doit intervenir activement pour orienter l’économie et réduire les inégalités.',
    b:'L’État doit surtout fixer des règles simples et laisser faire les entreprises et les individus.',
    why:'Cette question mesure la place que vous donnez à l’intervention publique dans l’économie.' },
  { id:'eco-5', dim:'eco', topic:'Retraites', plain:'L’âge de départ à la retraite est l’âge minimal auquel une personne peut toucher sa pension de retraite. La durée de cotisation est un autre paramètre, mesuré séparément dans les questions de précision.',
    a:'L’âge de départ à la retraite doit être abaissé, pour que davantage de personnes puissent partir plus tôt.',
    b:'L’âge de départ à la retraite doit être relevé, pour faire face au vieillissement de la population et préserver les finances publiques.',
    why:'Cette question mesure l’âge de départ, pour réduire l’effort des actifs, et le relever, pour préserver les finances publiques. Elle porte sur l’âge seul, pas sur la durée de cotisation.' },

  { id:'soc-1', dim:'soc', topic:'Égalité', plain:'Les territoires : quartiers, campagnes, villes moyennes, outre-mer…',
    a:'Les politiques publiques doivent réduire les écarts de résultats entre les groupes sociaux et les territoires, même si les moyens sont ciblés différemment.',
    b:'Les politiques publiques doivent garantir les mêmes règles et les mêmes chances à chacun, sans objectif de réduire les écarts de résultats.',
    why:'Les deux objectifs peuvent se compléter. La question vous demande lequel doit guider en premier l’action publique.' },
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
    a:'Le gouvernement doit rendre davantage de comptes au Parlement et aux contre-pouvoirs, même si certaines décisions prennent plus de temps.',
    b:'Le gouvernement doit pouvoir appliquer plus rapidement son programme, même si le contrôle du Parlement est moins contraignant.',
    why:'La question porte sur le contrôle démocratique de l’exécutif : davantage de vérifications, ou davantage de marge pour agir vite.',
    clarifyA:'Les contre-pouvoirs sont les institutions qui peuvent contrôler l’action du gouvernement, notamment le Parlement et la justice.' },

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
    a:'Il faut accélérer les changements de pratiques agricoles pour réduire les pollutions et les émissions, avec un accompagnement des agriculteurs.',
    b:'Il faut faire évoluer les pratiques plus progressivement pour préserver la production et le revenu agricoles.',
    why:'La question compare deux rythmes de transition et demande quelle priorité guiderait les décisions.' },
  { id:'ecology-4', dim:'ecology', topic:'Transports du quotidien', plain:'Selon le lieu où l’on vit, les transports collectifs ne sont pas toujours une solution de remplacement à la voiture.',
    a:'Il faut investir d’abord dans des transports collectifs fréquents et abordables, même si la voiture prend moins de place dans certaines zones.',
    b:'Il faut préserver la liberté de se déplacer en voiture, notamment là où les transports collectifs sont peu pratiques.',
    why:'Cette question porte sur les priorités de transport et les solutions proposées au quotidien, pas sur la production d’énergie.' }
];

/* ----------------------------------------------------------------------
   BANQUE DE DÉPARTAGE — 27 questions concrètes à plusieurs options
   (inclut les 3 thèmes de la vie quotidienne : Pouvoir d’achat, Santé, Logement)
   ------------------------------------------------------------------- */
const DEPARTAGE = [
  {
    "id": "dp-retraites",
    "dim": "eco",
    "group": "eco-social",
    "topic": "Retraites",
    "q": "Quel âge légal de départ à la retraite faut-il fixer ?",
    "plain": "L’âge légal est l’âge minimal pour partir à la retraite. Cette question porte uniquement sur cet âge : la durée de cotisation est un autre choix de réforme, qui n’est pas mesuré ici.",
    "options": [
      {
        "pos": 0,
        "short": "60 ans",
        "text": "Fixer l’âge légal à 60 ans."
      },
      {
        "pos": 1,
        "short": "62 ans",
        "text": "Fixer l’âge légal à 62 ans."
      },
      {
        "pos": 2,
        "short": "64 ans",
        "text": "Maintenir un âge légal de 64 ans."
      },
      {
        "pos": 3,
        "short": "65 ans ou plus",
        "text": "Fixer l’âge légal à 65 ans ou plus."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "lo": 0,
      "ecolo": 0.75,
      "pp": 1,
      "rn": 1,
      "reconquete": 2,
      "horizons": 3,
      "lr": 1.5,
      "dlf": 0.5,
      "ne": 3,
      "udi": 2
    },
    "stanceNotes": {
      "lfi": "Rétablir le droit à la retraite à 60 ans (programme « L’avenir en commun », septembre 2026).",
      "pp": "Abroger la réforme de 2023 pour ramener l’âge légal à 62 ans (déclaration du 5 octobre 2026).",
      "lr": "Fixer un âge minimal de départ à 63 ans, avec un taux plein à 65 ans.",
      "ne": "Porter l’âge légal à 65 ans (programme « Réussir une nouvelle ambition française », octobre 2026).",
      "reconquete": "Allonger la durée de cotisation à 44-46 ans ; l’âge légal de 64 ans n’est pas modifié.",
      "udi": "Le 27 juin 2025, l’UDI dit ne pas vouloir rouvrir l’âge légal de 64 ans. Codage sur l’âge légal uniquement; la déclaration traite séparément du financement et des négociations sur la durée de cotisation."
    },
    "basis": "Positions reprises de la page « Retraites » d’Élections 2027, qui renvoie pour chaque candidat à sa source et à sa date, complétées par les propositions publiques des formations ; l’âge et la durée de cotisation sont séparés dans l’énoncé.",
    "sourceIds": [
      "prog-retraites",
      "retraites-jdd",
      "udi-retirement-2025"
    ]
  },
  {
    "id": "dp-fortune",
    "dim": "eco",
    "group": "fiscal",
    "topic": "Très grandes fortunes",
    "q": "Faut-il taxer davantage les très grandes fortunes ?",
    "plain": "Aujourd’hui, l’impôt sur la fortune ne porte que sur l’immobilier (IFI) et les revenus du capital sont taxés à taux fixe (« flat tax »). La « taxe Zucman » est une proposition d’impôt minimal de 2 % par an sur les patrimoines de plus de 100 millions d’euros.",
    "options": [
      {
        "pos": 0,
        "short": "Cadre actuel",
        "text": "Garder le cadre actuel, sans impôt supplémentaire sur les très grandes fortunes."
      },
      {
        "pos": 1,
        "short": "Impôt sur la fortune financière",
        "text": "Remplacer l’impôt sur la fortune immobilière par un impôt sur la fortune financière (actions, placements), sans toucher à l’immobilier."
      },
      {
        "pos": 2,
        "short": "Impôt minimal de 2 % (taxe Zucman)",
        "text": "Créer un impôt minimal de 2 % sur les patrimoines de plus de 100 millions d’euros (« taxe Zucman »)."
      },
      {
        "pos": 3,
        "short": "ISF progressif et plafond",
        "text": "Rétablir un impôt sur la fortune progressif et plafonner les très gros héritages."
      }
    ],
    "stances": {
      "lfi": 3,
      "lo": 3,
      "pcf": 2.5,
      "ecolo": 2.25,
      "pp": 2.5,
      "rn": 0,
      "renaissance": 0,
      "horizons": 0,
      "lr": 0,
      "reconquete": 0
    },
    "stanceNotes": {
      "lfi": "Rétablir l’impôt de solidarité sur la fortune et taxer les « profiteurs de crise » (programme « L’avenir en commun »).",
      "pcf": "Rétablir l’ISF, supprimé en 2018 (discours de campagne, septembre 2026).",
      "pp": "Taxer les « méga-héritages » de plus de deux millions d’euros pour financer une baisse de la CSG sur les salaires (déclaration du 5 octobre 2026).",
      "rn": "Aucune taxe sur la fortune n’est proposée : la « règle d’or » budgétaire porte sur le déficit (tribune du 1er octobre 2026).",
      "horizons": "La baisse concerne les impôts de production, pas les fortunes (programme de campagne, octobre 2026).",
      "reconquete": "Le programme de limitation des dépenses publiques ne comporte pas d’impôt sur la fortune (entretien du 19 mai 2026)."
    },
    "basis": "Positions reprises de la page « Économie et impôts » d’Élections 2027, avec pour chaque candidat la source et la date citées, et recoupées avec les deux comparateurs fiscaux listés.",
    "sourceIds": [
      "prog-economie",
      "fortune-lafacture",
      "fiscalite-contribuables"
    ]
  },
  {
    "id": "dp-invest",
    "dim": "eco",
    "group": "fiscal",
    "topic": "Investissement et déficit",
    "q": "Comment concilier investissements publics et finances de l’État ?",
    "plain": "Le déficit public, c’est quand l’État dépense plus qu’il ne reçoit sur une année ; la dette publique, c’est l’ensemble de ce qu’il a emprunté et doit rembourser.",
    "options": [
      {
        "pos": 0,
        "short": "Plan d’investissement, déficit assumé",
        "text": "Lancer un grand plan d’investissement public (écoles, hôpitaux, climat), quitte à accepter un déficit plus élevé."
      },
      {
        "pos": 1,
        "short": "Investir en taxant les plus riches",
        "text": "Investir davantage en finançant l’effort par de nouveaux impôts sur les plus riches et les grandes entreprises, sans creuser le déficit."
      },
      {
        "pos": 2,
        "short": "Réduire le déficit, effort partagé",
        "text": "Réduire le déficit en partageant l’effort entre économies et impôts."
      },
      {
        "pos": 3,
        "short": "Réduire fortement la dépense",
        "text": "Réduire fortement la dépense publique, sans augmenter les impôts."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "ecolo": 0.75,
      "pp": 1,
      "dlf": 1,
      "renaissance": 2.5,
      "horizons": 2.5,
      "rn": 2.5,
      "lr": 3,
      "reconquete": 3
    },
    "stanceNotes": {
      "horizons": "Ramener le déficit à 2 % du PIB en fin de quinquennat (programme de campagne, octobre 2026).",
      "renaissance": "150 milliards d’euros d’économies et un déficit sous 3 % du PIB avant la fin du mandat (« Messmer II », 23 septembre 2026).",
      "rn": "Règle d’or budgétaire inscrite dans la Constitution : 4,9 % du PIB en 2027 ramené à 2,4 % en 2033 (tribune du 1er octobre 2026).",
      "reconquete": "Réduire les dépenses publiques d’au moins 100 milliards d’euros par an (entretien du 19 mai 2026)."
    },
    "basis": "Positions reprises de la page « Économie et impôts » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-economie"
    ]
  },
  {
    "id": "dp-propriete",
    "dim": "eco",
    "group": "fiscal",
    "topic": "Entreprises publiques",
    "q": "Quel rôle pour l’État dans la propriété des entreprises ?",
    "plain": "Nationaliser, c’est faire passer une entreprise sous propriété de l’État ; privatiser, c’est l’inverse. Les autoroutes, par exemple, sont confiées à des sociétés privées par des concessions qui s’achèvent entre 2031 et 2036.",
    "options": [
      {
        "pos": 0,
        "short": "Privatiser davantage",
        "text": "Confier davantage d’activités et de services publics au secteur privé."
      },
      {
        "pos": 1,
        "short": "Équilibre actuel",
        "text": "Garder l’équilibre actuel entre public et privé."
      },
      {
        "pos": 2,
        "short": "Reprendre quelques secteurs clés",
        "text": "Reprendre en main publique quelques secteurs clés (par exemple les autoroutes, une partie de l’énergie)."
      },
      {
        "pos": 3,
        "short": "Nationaliser largement",
        "text": "Nationaliser largement les secteurs stratégiques (énergie, transports, banques…)."
      }
    ],
    "stances": {
      "lfi": 3,
      "pcf": 2,
      "lo": 3,
      "dlf": 2.5,
      "ecolo": 2,
      "rn": 2,
      "pp": 1,
      "reconquete": 1,
      "renaissance": 0.75,
      "horizons": 0.75,
      "lr": 0
    },
    "stanceNotes": {
      "pcf": "Nationaliser une « grande banque », présentée comme une impérieuse nécessité (discours de campagne, septembre 2026)."
    },
    "basis": "Positions reprises de la page « Économie et impôts » d’Élections 2027, complétées par les propositions publiques des formations sur les nationalisations.",
    "sourceIds": [
      "prog-economie"
    ]
  },
  {
    "id": "dp-rsa",
    "dim": "eco",
    "group": "eco-social",
    "topic": "RSA",
    "q": "Faut-il demander une contrepartie pour toucher le RSA ?",
    "plain": "Le RSA (revenu de solidarité active) est une aide versée aux personnes sans ressources suffisantes. Une loi de 2023 généralise, pour une partie des bénéficiaires, une activité d’environ 15 heures par semaine (formation, insertion, emploi).",
    "options": [
      {
        "pos": 0,
        "short": "Sans contrepartie",
        "text": "Verser le RSA sans contrepartie obligatoire."
      },
      {
        "pos": 1,
        "short": "Accompagnement, sans obligation d’heures",
        "text": "Renforcer l’accompagnement et la formation, sans imposer un nombre d’heures."
      },
      {
        "pos": 2,
        "short": "Contrepartie en heures d’activité",
        "text": "Conditionner le RSA à un nombre d’heures d’activité (emploi, formation ou bénévolat)."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "lo": 0,
      "ecolo": 0,
      "pp": 0.75,
      "horizons": 1.75,
      "rn": 1.75,
      "renaissance": 2,
      "lr": 2,
      "reconquete": 2,
      "dlf": 2
    },
    "stanceNotes": {
      "lr": "Plafonner à 70 % du SMIC le total des prestations sociales perçues (meeting, 20 juin 2026)."
    },
    "basis": "Positions publiques des formations, estimées à partir des sources listées sur la conditionnalité du RSA, et recoupées avec les mesures sociales publiées.",
    "sourceIds": [
      "prog-travail",
      "prog-economie"
    ]
  },
  {
    "id": "dp-revenu",
    "dim": "eco",
    "group": "eco-social",
    "topic": "Revenu de base",
    "q": "Quelle forme donner aux aides pour les personnes sans ressources ?",
    "plain": "Un revenu universel serait versé à tous les adultes, sans condition de ressources ni d’activité. Un revenu minimum garanti n’est versé qu’à ceux dont les ressources sont sous un seuil.",
    "options": [
      {
        "pos": 0,
        "short": "Revenu universel",
        "text": "Verser à tous les adultes un revenu de base, sans condition de ressources."
      },
      {
        "pos": 1,
        "short": "Revenu minimum garanti",
        "text": "Garantir à chacun un revenu minimum, versé à ceux qui en ont besoin, en regroupant les aides existantes."
      },
      {
        "pos": 2,
        "short": "Garder les minima actuels",
        "text": "Garder le système actuel (RSA, aides au logement, etc.)."
      }
    ],
    "stances": {
      "ecolo": 0,
      "lfi": 0.75,
      "pp": 1.5,
      "renaissance": 1.5,
      "pcf": 2,
      "lo": 2,
      "horizons": 2,
      "rn": 2,
      "lr": 2,
      "reconquete": 2,
      "dlf": 2
    },
    "basis": "Positions publiques des formations, estimées à partir des sources listées sur le revenu universel, et recoupées avec les mesures sociales publiées.",
    "sourceIds": [
      "prog-economie",
      "prog-travail"
    ]
  },
  {
    "id": "dp-pouvoir-achat",
    "dim": "eco",
    "group": "pouvoir-achat",
    "topic": "Salaires & prix",
    "q": "Comment soutenir en priorité le pouvoir d’achat face au coût de la vie ?",
    "plain": "Face à l’inflation, certains proposent de bloquer les prix ou de relever le salaire minimum, d’autres privilégient des primes défiscalisées ou des baisses de cotisations sociales.",
    "options": [
      {
        "pos": 0,
        "short": "Bloquer les prix et SMIC à 1600 €",
        "text": "Bloquer les prix des produits de première nécessité et de l’énergie, et augmenter le SMIC net à 1600 euros."
      },
      {
        "pos": 1,
        "short": "Hausse des salaires par négociation",
        "text": "Conditionner les aides publiques aux entreprises à des hausses de salaires et revaloriser les grilles de branches."
      },
      {
        "pos": 2,
        "short": "Primes défiscalisées & allègements ciblés",
        "text": "Développer les primes sans charges ni impôts (prime de partage de la valeur) et baisser les cotisations sur les classes moyennes."
      },
      {
        "pos": 3,
        "short": "Baisse générale des impôts et charges",
        "text": "Baisser massivement les charges sociales et la fiscalité de production pour stimuler l’emploi et le salaire net."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "lo": 0,
      "ecolo": 0.5,
      "pp": 1,
      "rn": 1.5,
      "renaissance": 2,
      "horizons": 2,
      "lr": 3,
      "reconquete": 3,
      "dlf": 1.5
    },
    "stanceNotes": {
      "lfi": "Bloquer les prix et porter le SMIC à 1 600 euros net (programme « L’avenir en commun »).",
      "pcf": "Exiger de TotalEnergies une baisse de 30 à 50 centimes par litre, sous peine de nationalisation (septembre 2026).",
      "ecolo": "Porter le salaire minimum à 2 000 euros brut par mois (programme « Prospérité écologique », juillet 2026).",
      "rn": "Ramener de 5,5 % à 0 % la TVA sur un panier de cent produits de première nécessité (4 juin 2026)."
    },
    "basis": "Positions reprises de la page « Pouvoir d’achat » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-pouvoir-achat"
    ]
  },
  {
    "id": "dp-sante",
    "dim": "soc",
    "group": "sante",
    "topic": "Déserts médicaux & soignants",
    "q": "Comment lutter contre les déserts médicaux et le manque de soignants ?",
    "plain": "Un désert médical est une zone où l’accès à un médecin traitant ou à des spécialistes est très difficile. La liberté d’installation permet aux praticiens de choisir leur lieu d’exercice.",
    "options": [
      {
        "pos": 0,
        "short": "Réguler l’installation des médecins",
        "text": "Réguler l’installation des médecins : obliger les nouveaux praticiens à exercer temporairement en zone sous-dotée."
      },
      {
        "pos": 1,
        "short": "Centres de santé publics & incitations",
        "text": "Créer massivement des centres de santé publics avec des médecins salariés et renforcer les bourses d’engagement."
      },
      {
        "pos": 2,
        "short": "Incitations financières & délégations d’actes",
        "text": "Conserver la liberté d’installation en augmentant les aides financières et en confiant plus d’actes aux infirmiers et pharmaciens."
      },
      {
        "pos": 3,
        "short": "Liberté totale et allègements de contraintes",
        "text": "Garantir une liberté totale d’installation et supprimer les contraintes administratives pour attirer les soignants."
      }
    ],
    "stances": {
      "pcf": 0,
      "lfi": 0,
      "ecolo": 1,
      "pp": 0.75,
      "rn": 1.5,
      "lr": 1.75,
      "renaissance": 2,
      "horizons": 2,
      "reconquete": 2.5,
      "dlf": 1.5,
      "ne": 1
    },
    "stanceNotes": {
      "ecolo": "Créer 2 000 nouveaux centres de santé sur le territoire (programme « Prospérité écologique », juillet 2026).",
      "ne": "Généraliser les maisons de santé pluridisciplinaires à l’échelle de chaque canton (programme « Santé », octobre 2026).",
      "rn": "Supprimer les agences régionales de santé (synthèse Aladom, octobre 2026)."
    },
    "basis": "Positions reprises de la page « Santé » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-sante"
    ]
  },
  {
    "id": "dp-logement",
    "dim": "eco",
    "group": "logement",
    "topic": "Crise du logement & loyers",
    "q": "Quelle politique pour résoudre la crise du logement ?",
    "plain": "L’encadrement des loyers plafonne le montant des loyers dans les zones tendues. Le statut de bailleur privé bénéficie parfois d’avantages fiscaux pour inciter à louer.",
    "options": [
      {
        "pos": 0,
        "short": "Encadrement strict & réquisition de logements vides",
        "text": "Généraliser l’encadrement strict des loyers, interdire les expulsions sans relogement et réquisitionner les logements vacants."
      },
      {
        "pos": 1,
        "short": "Construction massive de logements sociaux",
        "text": "Relancer prioritairement la construction de logements sociaux publics et rénover thermiquement le parc existant."
      },
      {
        "pos": 2,
        "short": "Incitations aux propriétaires privés",
        "text": "Encourager l’investissement locatif privé par des avantages fiscaux et assouplir les règles d’expulsion en cas d’impayés."
      },
      {
        "pos": 3,
        "short": "Dérégulation & suppression du zonage",
        "text": "Déréguler l’urbanisme, supprimer l’encadrement des loyers et réduire les normes environnementales pour construire plus vite."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 1,
      "lo": 0,
      "ecolo": 1,
      "pp": 1,
      "rn": 2.5,
      "renaissance": 2,
      "horizons": 2,
      "lr": 2.5,
      "reconquete": 3,
      "dlf": 2
    },
    "stanceNotes": {
      "lfi": "Produire 400 000 logements abordables par an, réquisitionner les logements vacants et limiter la location touristique (septembre 2026).",
      "pcf": "Consacrer 10 milliards d’euros à la rénovation de 700 000 passoires thermiques et rejeter la priorité nationale dans l’attribution des HLM (septembre 2026).",
      "ecolo": "Réaliser 500 000 rénovations énergétiques performantes de logements par an (programme « Prospérité écologique », juillet 2026).",
      "rn": "Abroger la loi SRU, supprimer l’objectif de « zéro artificialisation nette » et réserver la priorité d’accès au logement social aux ressortissants français (septembre 2026).",
      "horizons": "Créer un prêt à taux zéro pour les familles qui déménagent à l’arrivée d’un enfant (9 octobre 2026).",
      "renaissance": "Loi de programmation du logement sur cinq ans et assouplissement des règles de construction au profit des maires (29 septembre 2026).",
      "lr": "Produire un million de logements supplémentaires en cinq ans en supprimant l’objectif « zéro artificialisation nette » (10 juin 2026)."
    },
    "basis": "Positions reprises de la page « Logement » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-logement"
    ]
  },
  {
    "id": "dp-nucleaire",
    "dim": "ecology",
    "group": "ecologie",
    "topic": "Nucléaire",
    "q": "Quelle place pour le nucléaire dans la production d’électricité ?",
    "plain": "Environ 70 % de l’électricité française vient aujourd’hui du nucléaire. Les « EPR2 » sont les nouveaux réacteurs prévus par l’État.",
    "options": [
      {
        "pos": 0,
        "short": "Sortir du nucléaire",
        "text": "Sortir du nucléaire à terme, en visant 100 % d’énergies renouvelables."
      },
      {
        "pos": 1,
        "short": "Garder l’existant, sans nouveau réacteur",
        "text": "Garder les réacteurs actuels, sans en construire de nouveaux, et développer les renouvelables."
      },
      {
        "pos": 2,
        "short": "Garder, en construire, et renouvelables",
        "text": "Garder les réacteurs actuels, en construire quelques nouveaux et développer aussi les renouvelables."
      },
      {
        "pos": 3,
        "short": "Construire beaucoup de nouveaux réacteurs",
        "text": "Construire un grand nombre de nouveaux réacteurs et développer les renouvelables en complément."
      }
    ],
    "stances": {
      "lfi": 0,
      "ecolo": 0.5,
      "pp": 2,
      "renaissance": 3,
      "horizons": 2,
      "lr": 2.5,
      "pcf": 2.5,
      "dlf": 2.5,
      "rn": 3,
      "reconquete": 3,
      "udi": 2.5
    },
    "stanceNotes": {
      "lfi": "Planifier la sortie du nucléaire dans le cadre d’une planification écologique (programme « L’avenir en commun »).",
      "renaissance": "Sécuriser la construction de 14 réacteurs EPR au rythme d’un par an (« Messmer II », 23 septembre 2026).",
      "horizons": "Relancer le nucléaire et électrifier massivement les usages (programme de campagne, octobre 2026).",
      "udi": "Le programme européen veut renforcer la place du nucléaire et tripler la production européenne d’ici 2050. Le codage reste intermédiaire car le texte ne fixe pas un nombre de nouveaux réacteurs en France."
    },
    "basis": "Positions reprises de la page « Écologie et énergie » d’Élections 2027, et recoupées avec les deux sources sectorielles sur le mix électrique.",
    "sourceIds": [
      "prog-ecologie",
      "nucleaire-sfen",
      "energie-revolution",
      "udi-europe-2024"
    ]
  },
  {
    "id": "dp-carbone",
    "dim": "ecology",
    "group": "ecologie",
    "topic": "Taxe carbone",
    "q": "Que faire de la taxe carbone ?",
    "plain": "La taxe carbone est une taxe sur les énergies fossiles (essence, gaz, fioul) qui vise à réduire les émissions de CO₂. Sa hausse est gelée depuis 2018, après la crise des « gilets jaunes ».",
    "options": [
      {
        "pos": 0,
        "short": "L’augmenter, en redistribuant",
        "text": "L’augmenter progressivement, en redistribuant le produit aux ménages et aux entreprises."
      },
      {
        "pos": 1,
        "short": "La garder telle quelle",
        "text": "La garder à son niveau actuel."
      },
      {
        "pos": 2,
        "short": "La supprimer",
        "text": "La supprimer."
      }
    ],
    "stances": {
      "ecolo": 0.25,
      "pp": 0.25,
      "horizons": 1,
      "lfi": 1.5,
      "renaissance": 1.5,
      "lr": 1.75,
      "pcf": 2,
      "rn": 2,
      "reconquete": 2,
      "dlf": 2
    },
    "basis": "Positions publiques des formations, estimées à partir des sources listées sur la fiscalité carbone, et recoupées avec les mesures sur l’énergie publiées.",
    "sourceIds": [
      "prog-ecologie"
    ]
  },
  {
    "id": "dp-thermique",
    "dim": "ecology",
    "group": "ecologie",
    "topic": "Voitures thermiques",
    "q": "Faut-il maintenir l’interdiction de vendre des voitures thermiques neuves en 2035 ?",
    "plain": "La règle européenne actuelle prévoit qu’à partir de 2035 les voitures neuves n’émettent plus de CO₂ à l’échappement. Elle prévoit déjà un traitement particulier pour les carburants de synthèse. Ici, on demande si la règle doit rester, être élargie aux hybrides rechargeables, ou être supprimée.",
    "options": [
      {
        "pos": 0,
        "short": "Maintenir la règle",
        "text": "Maintenir la règle de 2035 telle qu’elle est prévue."
      },
      {
        "pos": 1,
        "short": "Autoriser les hybrides rechargeables",
        "text": "Modifier la règle pour permettre aussi la vente de voitures hybrides rechargeables après 2035."
      },
      {
        "pos": 2,
        "short": "Supprimer la règle",
        "text": "Supprimer la règle européenne et laisser les motorisations thermiques neuves rester en vente."
      }
    ],
    "stances": {
      "ecolo": 0,
      "pp": 0,
      "lfi": 0,
      "pcf": 0.5,
      "renaissance": 0.5,
      "horizons": 1.5,
      "lr": 2,
      "rn": 2,
      "reconquete": 2,
      "dlf": 2
    },
    "basis": "Positions publiques des formations, estimées à partir des sources listées sur l’échéance de 2035, et recoupées avec les mesures sur l’énergie et les transports.",
    "sourceIds": [
      "prog-ecologie"
    ]
  },
  {
    "id": "dp-pesticides",
    "dim": "ecology",
    "group": "ecologie",
    "topic": "Pesticides",
    "q": "Quelle politique pour les pesticides ?",
    "plain": "Les pesticides de synthèse protègent les cultures mais ont des effets sur la santé et l’environnement. Exemple de débat récent : l’acétamipride, un insecticide interdit en France dont la réautorisation a été débattue en 2025.",
    "options": [
      {
        "pos": 0,
        "short": "Interdire progressivement",
        "text": "Interdire progressivement les pesticides de synthèse."
      },
      {
        "pos": 1,
        "short": "Interdire les plus dangereux",
        "text": "Interdire les plus dangereux et aider les agriculteurs à s’en passer."
      },
      {
        "pos": 2,
        "short": "Pas sans alternative",
        "text": "Ne pas interdire de nouvelles substances tant qu’aucune alternative n’est prête."
      },
      {
        "pos": 3,
        "short": "Assouplir les normes",
        "text": "Assouplir les normes françaises pour les aligner sur celles des autres pays."
      }
    ],
    "stances": {
      "ecolo": 0,
      "lfi": 0,
      "pp": 0.75,
      "pcf": 0.75,
      "renaissance": 2,
      "horizons": 2,
      "dlf": 2.25,
      "lr": 2.5,
      "reconquete": 2.5,
      "rn": 3
    },
    "stanceNotes": {
      "lfi": "Interdire l’usage du glyphosate en France (programme « L’avenir en commun »).",
      "lr": "Autoriser l’acétamipride et supprimer l’Office français de la biodiversité (21 septembre 2026)."
    },
    "basis": "Positions reprises des pages « Écologie et énergie » et « Agriculture » d’Élections 2027, qui indiquent pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-ecologie",
      "prog-agriculture"
    ]
  },
  {
    "id": "dp-europe",
    "dim": "europe",
    "group": "europe",
    "topic": "Place de l’Union européenne",
    "q": "Quelle place pour l’Union européenne ?",
    "plain": "Aujourd’hui, le droit européen s’impose au droit français dans les domaines où l’Union a compétence (concurrence, monnaie, commerce, règles budgétaires…).",
    "options": [
      {
        "pos": 0,
        "short": "Approfondir l’UE",
        "text": "Approfondir l’Union européenne (budget commun, défense commune, plus de décisions prises à plusieurs)."
      },
      {
        "pos": 1,
        "short": "Désobéir à certaines règles",
        "text": "Rester dans l’Union, mais pouvoir désobéir à certaines règles quand elles empêchent d’appliquer notre politique."
      },
      {
        "pos": 2,
        "short": "La Constitution avant le droit européen",
        "text": "Rester dans l’Union, mais faire passer la Constitution française avant le droit européen."
      },
      {
        "pos": 3,
        "short": "Quitter l’UE",
        "text": "Quitter l’Union européenne."
      }
    ],
    "stances": {
      "pp": 0,
      "renaissance": 0,
      "modem": 0,
      "udi": 0.25,
      "ecolo": 0.25,
      "horizons": 0.5,
      "lfi": 1.25,
      "pcf": 1.25,
      "lr": 2,
      "rn": 2,
      "reconquete": 2,
      "dlf": 3,
      "upr": 3
    },
    "stanceNotes": {
      "pp": "Supprimer le droit de veto au sein de l’Union européenne et lancer un grand emprunt européen (mai 2026).",
      "renaissance": "Bâtir des « États-Unis d’Europe » avec un noyau de pays volontaires (discours de Reims, 17 septembre 2026).",
      "lfi": "Désobéir aux décisions européennes jugées contraires aux intérêts des Français et modifier les traités (débat Medef, 27 août 2026).",
      "lr": "Inscrire dans la Constitution la primauté de la Constitution française sur le droit de l’Union européenne (3 septembre 2026).",
      "dlf": "Cesser de verser chaque année environ dix milliards d’euros nets de contribution au budget de l’Union européenne (8 mars 2025).",
      "udi": "L’UDI défend une intégration politique européenne et la suppression de vetos qui paralysent les décisions. Codage de son orientation générale en faveur d’une UE plus intégrée."
    },
    "basis": "Positions reprises de la page « Europe et international » d’Élections 2027, recoupées avec le programme de la France insoumise et une analyse indépendante des positions européennes.",
    "sourceIds": [
      "prog-europe",
      "lfi-europe",
      "europe-elyseescope",
      "udi-values",
      "udi-veto",
      "udi-europe-2024"
    ]
  },
  {
    "id": "dp-otan",
    "dim": "europe",
    "group": "defense",
    "topic": "OTAN",
    "q": "Quelle place pour la France dans l’OTAN ?",
    "plain": "L’OTAN est une alliance militaire entre pays d’Amérique du Nord et d’Europe, créée en 1949. La France en avait quitté le commandement militaire intégré en 1966 et l’a réintégré en 2009.",
    "options": [
      {
        "pos": 0,
        "short": "Quitter l’OTAN",
        "text": "Quitter l’OTAN."
      },
      {
        "pos": 1,
        "short": "Sortir du commandement intégré",
        "text": "Rester dans l’alliance, mais sortir de son commandement militaire intégré."
      },
      {
        "pos": 2,
        "short": "Rester comme aujourd’hui",
        "text": "Rester dans l’OTAN comme aujourd’hui."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "upr": 0,
      "dlf": 1,
      "reconquete": 1.25,
      "rn": 1.5,
      "ecolo": 1.75,
      "pp": 2,
      "renaissance": 2,
      "horizons": 2,
      "lr": 2
    },
    "stanceNotes": {
      "dlf": "Sortir de la France du commandement militaire intégré de l’OTAN pour retrouver une pleine autonomie de défense (8 mars 2025)."
    },
    "basis": "Positions reprises de la page « Europe et international » d’Élections 2027, et estimées pour les autres formations à partir des sources listées sur l’OTAN.",
    "sourceIds": [
      "prog-europe"
    ]
  },
  {
    "id": "dp-ukraine",
    "dim": "europe",
    "group": "defense",
    "topic": "Ukraine",
    "q": "Quelle politique à l’égard de l’Ukraine et de la Russie ?",
    "plain": "Depuis l’invasion russe de février 2022, la France livre des armes à l’Ukraine et finance son soutien.",
    "options": [
      {
        "pos": 0,
        "short": "Limiter les armes, négocier",
        "text": "Arrêter ou limiter fortement les livraisons d’armes et privilégier la négociation avec la Russie."
      },
      {
        "pos": 1,
        "short": "Maintenir l’aide actuelle",
        "text": "Maintenir l’aide actuelle, sans l’augmenter et sans envoyer de soldats français."
      },
      {
        "pos": 2,
        "short": "Augmenter l’aide militaire",
        "text": "Augmenter l’aide militaire (y compris armements lourds) et garantir durablement la sécurité de l’Ukraine."
      }
    ],
    "stances": {
      "lfi": 0.25,
      "reconquete": 0,
      "dlf": 0,
      "upr": 0,
      "rn": 0.75,
      "pcf": 0.5,
      "ecolo": 1.75,
      "pp": 2,
      "renaissance": 2,
      "horizons": 2,
      "lr": 2,
      "udi": 1
    },
    "stanceNotes": {
      "pcf": "Œuvrer à un cessez-le-feu rapide entre l’Ukraine et la Russie afin de réorienter une partie des dépenses militaires vers les services publics (septembre 2026).",
      "pp": "Saisir les avoirs publics russes pour financer le soutien à l’Ukraine et renforcer l’aide apportée à Kiev (déclaration du 5 octobre 2026).",
      "udi": "Le programme appelle à poursuivre le soutien militaire à l’Ukraine, sans chiffrer de hausse. Codage prudent sur l’option la plus proche, « maintenir l’aide actuelle »."
    },
    "basis": "Positions reprises de la page « Europe et international » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-europe",
      "udi-europe-2024"
    ]
  },
  {
    "id": "dp-defense",
    "dim": "europe",
    "group": "defense",
    "topic": "Budget de la défense",
    "q": "Quel budget pour l’armée ?",
    "plain": "Le budget de la défense représente aujourd’hui environ 2 % de la richesse produite par le pays (le PIB).",
    "options": [
      {
        "pos": 0,
        "short": "Réduire ou geler",
        "text": "Réduire ou geler le budget militaire."
      },
      {
        "pos": 1,
        "short": "Maintenir environ 2 %",
        "text": "Le maintenir à peu près au niveau actuel (environ 2 % du PIB)."
      },
      {
        "pos": 2,
        "short": "Augmenter modérément",
        "text": "L’augmenter modérément."
      },
      {
        "pos": 3,
        "short": "3 % du PIB ou plus",
        "text": "Le porter à 3 % du PIB ou plus."
      }
    ],
    "stances": {
      "lfi": 0,
      "lo": 0,
      "pcf": 0.75,
      "ecolo": 0.75,
      "pp": 2.5,
      "horizons": 2.75,
      "dlf": 2.75,
      "renaissance": 3,
      "lr": 3,
      "rn": 3,
      "reconquete": 3,
      "udi": 3
    },
    "stanceNotes": {
      "horizons": "Dépasser 100 000 obus produits par an, porter les réservistes de 45 000 à 250 000 et adopter une loi de programmation militaire de « massification » (octobre 2026).",
      "pcf": "Réorienter une partie des dépenses militaires vers les services publics (septembre 2026).",
      "udi": "Le programme européen de l’UDI vise un budget de défense de 3 % du PIB d’ici 2030."
    },
    "basis": "Positions reprises de la page « Europe et international » d’Élections 2027, et estimées pour les autres formations à partir des sources listées sur l’objectif de 3 % du PIB.",
    "sourceIds": [
      "prog-europe",
      "udi-europe-2024"
    ]
  },
  {
    "id": "dp-armee",
    "dim": "europe",
    "group": "defense",
    "topic": "Défense européenne",
    "q": "Faut-il une armée européenne ?",
    "plain": "Une armée européenne aurait un commandement commun aux pays de l’Union, distinct de l’OTAN.",
    "options": [
      {
        "pos": 0,
        "short": "Armée européenne commune",
        "text": "Créer une armée européenne commune, avec un commandement unique."
      },
      {
        "pos": 1,
        "short": "Coopération renforcée",
        "text": "Renforcer la coopération entre armées nationales (achats communs, industrie, commandement coordonné), sans armée unique."
      },
      {
        "pos": 2,
        "short": "Chaque pays garde sa défense",
        "text": "Garder une défense nationale, avec une coopération au cas par cas."
      }
    ],
    "stances": {
      "pp": 0,
      "renaissance": 0,
      "ecolo": 0.5,
      "horizons": 0.5,
      "lr": 1.5,
      "lfi": 2,
      "pcf": 2,
      "rn": 2,
      "reconquete": 2,
      "dlf": 2,
      "udi": 1
    },
    "stanceNotes": {
      "pp": "Supprimer le droit de veto au sein de l’Union européenne et lancer un grand emprunt européen (mai 2026).",
      "renaissance": "Bâtir des « États-Unis d’Europe » avec une union bancaire et des marchés de capitaux communs (17 septembre 2026).",
      "udi": "Le programme propose une force européenne de réaction rapide et une coopération renforcée; il ne propose pas une armée unique avec commandement commun."
    },
    "basis": "Positions reprises de la page « Europe et international » d’Élections 2027, et estimées pour les autres formations à partir des sources listées sur la défense européenne.",
    "sourceIds": [
      "prog-europe",
      "udi-europe-2024"
    ]
  },
  {
    "id": "dp-dissuasion",
    "dim": "europe",
    "group": "defense",
    "topic": "Armes nucléaires",
    "q": "Que faire de la dissuasion nucléaire française ?",
    "plain": "La dissuasion nucléaire désigne les armes nucléaires de la France, censées décourager toute attaque contre elle. Le traité d’interdiction des armes nucléaires (TIAN, 2021) n’a pas été signé par la France.",
    "options": [
      {
        "pos": 0,
        "short": "S’engager vers le désarmement",
        "text": "S’engager vers un désarmement nucléaire (signer le traité d’interdiction)."
      },
      {
        "pos": 1,
        "short": "Garder, et viser un désarmement multilatéral",
        "text": "Garder la dissuasion tout en œuvrant pour un désarmement négocié avec les autres pays."
      },
      {
        "pos": 2,
        "short": "Garder et moderniser",
        "text": "Garder et moderniser la dissuasion nationale."
      }
    ],
    "stances": {
      "ecolo": 0,
      "lfi": 0.75,
      "pcf": 1,
      "pp": 2,
      "renaissance": 2,
      "horizons": 2,
      "lr": 2,
      "rn": 2,
      "reconquete": 2,
      "dlf": 2
    },
    "basis": "Positions publiques des formations, estimées à partir des sources listées sur le désarmement nucléaire, et recoupées avec les mesures de défense publiées.",
    "sourceIds": [
      "prog-europe"
    ]
  },
  {
    "id": "dp-regul",
    "dim": "immig",
    "group": "immigration",
    "topic": "Personnes en situation irrégulière",
    "q": "Que faire des personnes étrangères en situation irrégulière ?",
    "plain": "Une personne en situation irrégulière vit en France sans titre de séjour. Une OQTF (obligation de quitter le territoire français) est la décision administrative qui lui ordonne de partir. Régulariser, c’est lui accorder un titre de séjour.",
    "options": [
      {
        "pos": 0,
        "short": "Régulariser largement",
        "text": "Régulariser largement les personnes installées durablement, sans expulsions systématiques."
      },
      {
        "pos": 1,
        "short": "Au cas par cas",
        "text": "Régulariser au cas par cas et expulser en priorité les personnes condamnées."
      },
      {
        "pos": 2,
        "short": "Expulser la plupart",
        "text": "Expulser la plupart des personnes en situation irrégulière, en ne régularisant qu’exceptionnellement."
      },
      {
        "pos": 3,
        "short": "Expulser systématiquement",
        "text": "Expulser systématiquement toute personne en situation irrégulière."
      }
    ],
    "stances": {
      "lfi": 0,
      "ecolo": 0,
      "lo": 0,
      "pcf": 1,
      "pp": 0.5,
      "renaissance": 2.25,
      "horizons": 2.25,
      "lr": 3,
      "rn": 3,
      "reconquete": 3,
      "dlf": 3
    },
    "stanceNotes": {
      "pp": "Régulariser les travailleurs sans papiers (déclaration de la primaire, 5 octobre 2026).",
      "horizons": "Instaurer des quotas migratoires et mettre fin au « dévoiement de l’asile » (programme de campagne, octobre 2026).",
      "lr": "Soumettre à l’électorat une loi de réduction de l’immigration (déclaration de candidature, février 2026).",
      "rn": "Référendum constitutionnel sur l’immigration, avec fin du droit du sol et du regroupement familial (5 septembre 2026).",
      "reconquete": "Expulser l’ensemble des détenus étrangers et les étrangers réguliers au chômage depuis plus de six à douze mois (17 septembre 2026).",
      "dlf": "Déployer l’armée aux frontières pour bloquer les entrées illégales et expulser les délinquants étrangers (8 mars 2025)."
    },
    "basis": "Positions reprises de la page « Immigration » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-immigration"
    ]
  },
  {
    "id": "dp-sol",
    "dim": "immig",
    "group": "immigration",
    "topic": "Droit du sol",
    "q": "Que faire du droit du sol ?",
    "plain": "Le droit du sol permet à un enfant né en France de parents étrangers d’acquérir la nationalité française, sous conditions de résidence.",
    "options": [
      {
        "pos": 0,
        "short": "Le maintenir",
        "text": "Le maintenir tel qu’il est."
      },
      {
        "pos": 1,
        "short": "Ajouter des conditions",
        "text": "Le garder en ajoutant des conditions (par exemple sur la situation des parents)."
      },
      {
        "pos": 2,
        "short": "Le supprimer ou le limiter fortement",
        "text": "Le supprimer ou le limiter fortement : naître en France ne donnerait plus accès automatiquement à la nationalité."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "lo": 0,
      "ecolo": 0,
      "pp": 0,
      "renaissance": 0.5,
      "horizons": 1,
      "lr": 2,
      "rn": 2,
      "reconquete": 2,
      "dlf": 2,
      "ne": 2
    },
    "stanceNotes": {
      "ne": "Mettre fin à l’automaticité du droit du sol (programme « Immigration », octobre 2026).",
      "rn": "Référendum constitutionnel comportant la fin du droit du sol (5 septembre 2026)."
    },
    "basis": "Positions reprises de la page « Immigration » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-immigration"
    ]
  },
  {
    "id": "dp-preference",
    "dim": "immig",
    "group": "immigration",
    "topic": "Aides sociales et nationalité",
    "q": "Les étrangers en situation régulière doivent-ils avoir les mêmes droits aux aides sociales ?",
    "plain": "La « préférence nationale » (ou « priorité nationale ») consiste à réserver en priorité certaines aides ou certains logements aux citoyens français.",
    "options": [
      {
        "pos": 0,
        "short": "Mêmes règles pour tous",
        "text": "Mêmes règles pour tous les résidents en situation régulière."
      },
      {
        "pos": 1,
        "short": "Délai de résidence plus long",
        "text": "Exiger une durée de résidence ou de cotisation plus longue avant certaines aides (par exemple 5 ans)."
      },
      {
        "pos": 2,
        "short": "Priorité aux Français",
        "text": "Réserver en priorité aux Français les aides sociales et les logements sociaux (préférence nationale)."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "lo": 0,
      "ecolo": 0,
      "pp": 0,
      "renaissance": 0.5,
      "horizons": 1,
      "lr": 1.25,
      "dlf": 1.5,
      "rn": 2,
      "reconquete": 2
    },
    "stanceNotes": {
      "rn": "Référendum constitutionnel prévoyant la priorité nationale pour les prestations sociales (5 septembre 2026).",
      "horizons": "Restreindre l’immigration familiale (programme de campagne, octobre 2026).",
      "reconquete": "Expulser les étrangers réguliers au chômage depuis plus de six à douze mois et ceux vivant uniquement d’aides sociales (17 septembre 2026)."
    },
    "basis": "Positions reprises de la page « Immigration » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-immigration"
    ]
  },
  {
    "id": "dp-laicite",
    "dim": "soc",
    "group": "societe",
    "topic": "Laïcité",
    "q": "Quelles règles pour les signes religieux ?",
    "plain": "La laïcité, c’est la séparation de l’État et des religions : l’État est neutre. Aujourd’hui, les agents publics doivent être neutres et les élèves ne peuvent pas porter de signe religieux ostensible à l’école publique (loi de 2004).",
    "options": [
      {
        "pos": 0,
        "short": "Liberté pour les usagers",
        "text": "Laisser les usagers libres d’afficher leurs convictions : la neutralité ne s’impose qu’aux agents publics."
      },
      {
        "pos": 1,
        "short": "Règles actuelles",
        "text": "Garder les règles actuelles, sans les étendre."
      },
      {
        "pos": 2,
        "short": "Étendre à d’autres lieux",
        "text": "Étendre l’interdiction des signes religieux ostensibles à d’autres lieux (université, sorties scolaires, compétitions sportives)."
      },
      {
        "pos": 3,
        "short": "Interdire pour tous dans les services publics",
        "text": "Interdire les signes religieux ostensibles à tous dans les services publics (agents comme usagers)."
      }
    ],
    "stances": {
      "lfi": 0,
      "ecolo": 0,
      "pp": 1,
      "pcf": 1,
      "horizons": 1.25,
      "renaissance": 2.25,
      "lr": 3,
      "rn": 3,
      "reconquete": 3,
      "dlf": 3
    },
    "basis": "Positions publiques des formations, estimées à partir des sources listées sur la laïcité et les signes religieux. Aucune page thématique ne recense encore de mesure sourcée sur ce sujet : la page « Programmes 2027 » d’Élections 2027 le signale explicitement.",
    "sourceIds": [
      "prog-hub"
    ]
  },
  {
    "id": "dp-cannabis",
    "dim": "auth",
    "group": "societe",
    "topic": "Cannabis",
    "q": "Quelle politique pour le cannabis ?",
    "plain": "Aujourd’hui, l’usage de cannabis est interdit en France et passible d’une amende forfaitaire. Dépénaliser, c’est ne plus sanctionner l’usage sans autoriser la vente ; légaliser, c’est autoriser et encadrer la vente.",
    "options": [
      {
        "pos": 0,
        "short": "Légaliser et encadrer",
        "text": "Légaliser et encadrer la production et la vente, sous contrôle de l’État."
      },
      {
        "pos": 1,
        "short": "Dépénaliser l’usage",
        "text": "Dépénaliser l’usage sans légaliser la vente."
      },
      {
        "pos": 2,
        "short": "Maintenir l’interdiction",
        "text": "Maintenir l’interdiction et les amendes actuelles."
      },
      {
        "pos": 3,
        "short": "Durcir la répression",
        "text": "Durcir la répression, y compris contre les usagers."
      }
    ],
    "stances": {
      "lfi": 0,
      "ecolo": 0,
      "pp": 0.5,
      "lo": 1,
      "pcf": 2,
      "renaissance": 2,
      "horizons": 2,
      "reconquete": 2.25,
      "lr": 3,
      "rn": 3,
      "dlf": 3
    },
    "basis": "Positions publiques des formations, estimées à partir des sources listées sur la légalisation du cannabis. Aucune page thématique ne recense encore de mesure sourcée sur ce sujet : la page « Programmes 2027 » d’Élections 2027 le signale explicitement.",
    "sourceIds": [
      "prog-hub"
    ]
  },
  {
    "id": "dp-scrutin",
    "dim": "auth",
    "group": "institutions",
    "topic": "Mode de scrutin",
    "q": "Comment élire les députés ?",
    "plain": "Aujourd’hui, chaque député est élu dans sa circonscription au scrutin majoritaire à deux tours. À la proportionnelle, les sièges sont répartis selon la part des voix obtenue par chaque parti.",
    "options": [
      {
        "pos": 0,
        "short": "Proportionnelle intégrale",
        "text": "Élire tous les députés à la proportionnelle."
      },
      {
        "pos": 1,
        "short": "Une part de proportionnelle",
        "text": "Garder des circonscriptions et ajouter une part de proportionnelle."
      },
      {
        "pos": 2,
        "short": "Scrutin actuel",
        "text": "Garder le scrutin actuel."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "rn": 0,
      "modem": 0,
      "ecolo": 0.5,
      "pp": 0.5,
      "renaissance": 1,
      "reconquete": 1.75,
      "lr": 2
    },
    "stanceNotes": {
      "dlf": "Réduire le nombre de parlementaires et instaurer un référendum d’initiative citoyenne : le mode de scrutin des députés n’est pas précisé, la position n’est donc pas codée."
    },
    "basis": "Positions publiques des formations, estimées à partir des sources listées sur la proportionnelle, et recoupées avec la page « Institutions » d’Élections 2027. Horizons : sources divergentes, position non codée.",
    "sourceIds": [
      "prog-institutions"
    ]
  },
  {
    "id": "dp-republique",
    "dim": "auth",
    "group": "institutions",
    "topic": "Institutions",
    "q": "Faut-il changer les institutions ?",
    "plain": "La Ve République (1958) donne de grands pouvoirs au président. L’article 49.3 permet au gouvernement de faire adopter un texte sans vote, sauf motion de censure. Une VIe République supposerait une nouvelle Constitution.",
    "options": [
      {
        "pos": 0,
        "short": "Nouvelle République",
        "text": "Changer de République : élire une Assemblée constituante pour écrire une nouvelle Constitution."
      },
      {
        "pos": 1,
        "short": "Rééquilibrer la Ve",
        "text": "Rééquilibrer la Ve République : plus de pouvoirs pour le Parlement, moins pour le président, fin du 49.3."
      },
      {
        "pos": 2,
        "short": "Garder les institutions",
        "text": "Garder les institutions actuelles."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "ecolo": 0,
      "pp": 0.5,
      "dlf": 1,
      "renaissance": 1.5,
      "horizons": 1.75,
      "lr": 2,
      "rn": 1.75,
      "reconquete": 1
    },
    "stanceNotes": {
      "lfi": "Passer à une VIe République (programme « L’avenir en commun »).",
      "dlf": "Instaurer un référendum d’initiative citoyenne à partir d’un million de signatures, reconnaître le vote blanc, réduire le nombre de parlementaires et supprimer les conseils régionaux (8 mars 2025).",
      "rn": "Référendum constitutionnel sur l’immigration : les institutions sont révisées sans changement de République (5 septembre 2026).",
      "pp": "Instaurer un service civique obligatoire de dix mois, le volet militaire restant volontaire (mai 2026).",
      "ecolo": "Sanctionner les responsables politiques auteurs de mensonges factuels et délibérés (4 septembre 2026)."
    },
    "basis": "Positions reprises de la page « Institutions » d’Élections 2027, qui indique pour chaque candidat la mesure retenue, sa source et sa date.",
    "sourceIds": [
      "prog-institutions"
    ]
  },
  {
    "id": "dp-snu",
    "dim": "auth",
    "group": "societe",
    "topic": "Service national",
    "q": "Faut-il un service national obligatoire ?",
    "plain": "Le Service national universel (SNU) est un dispositif de quelques semaines (cohésion, engagement, découverte de la défense) proposé aux jeunes de 15 à 17 ans.",
    "options": [
      {
        "pos": 0,
        "short": "Volontariat seulement",
        "text": "Garder uniquement le volontariat (service civique)."
      },
      {
        "pos": 1,
        "short": "SNU obligatoire",
        "text": "Rendre obligatoire un service national universel de quelques semaines."
      },
      {
        "pos": 2,
        "short": "Service militaire",
        "text": "Rétablir un service militaire obligatoire."
      }
    ],
    "stances": {
      "lfi": 0,
      "pcf": 0,
      "lo": 0,
      "ecolo": 0.25,
      "lr": 0.25,
      "horizons": 0.5,
      "pp": 1,
      "renaissance": 1,
      "rn": 1.25,
      "dlf": 1.25,
      "reconquete": 1.5
    },
    "stanceNotes": {
      "pp": "Instaurer un service civique obligatoire de dix mois pour tous les jeunes, effectué en Ehpad, à l’école ou dans les services publics, le volet militaire restant volontaire (mai 2026)."
    },
    "basis": "Positions reprises de la page « Institutions » d’Élections 2027, et estimées pour les autres formations à partir des sources listées sur le SNU obligatoire.",
    "sourceIds": [
      "prog-institutions",
      "prog-hub"
    ]
  }
];

/* ----------------------------------------------------------------------
   SOURCES CONSULTÉES
   ------------------------------------------------------------------- */
const SOURCES = [
  {
    "id": "retraites-jdd",
    "label": "Retraites : ce que proposent les candidats (JDD)",
    "url": "https://www.lejdd.fr/politique/retraites-ce-que-proposent-les-candidats-a-la-presidentielle-184728",
    "type": "Presse"
  },
  {
    "id": "nucleaire-sfen",
    "label": "Nucléaire : positions des grands partis (Sfen, juillet 2026)",
    "url": "https://www.sfen.org/rgn/presidentielle-2027-au-colloque-de-lufe-les-grands-partis-listent-leurs-positions-sur-le-nucleaire/",
    "type": "Débat sectoriel"
  },
  {
    "id": "energie-revolution",
    "label": "Énergie : qui dit quoi parmi les candidats (Révolution énergétique)",
    "url": "https://www.revolution-energetique.com/actus/qui-dit-quoi-sur-lenergie-parmi-les-candidats-declares-a-la-presidentielle/",
    "type": "Presse / analyse"
  },
  {
    "id": "fortune-lafacture",
    "label": "Impôt sur la fortune : position de chaque candidat (LaFacture2027)",
    "url": "https://lafacture2027.fr/isf-2027-candidats",
    "type": "Comparateur indépendant"
  },
  {
    "id": "fiscalite-contribuables",
    "label": "Fiscalité : suivi des propositions (Contribuables associés)",
    "url": "https://contribuablesassocies.org/2026/09/09/presidentielle-2027-a-quelle-sauce-fiscale-serez-vous-assaisonnes/",
    "type": "Association"
  },
  {
    "id": "europe-elyseescope",
    "label": "Europe : candidats favorables ou hostiles à l’UE (ÉlyséeScope)",
    "url": "https://www.elyseescope.com/le-radar/europe-2027-les-candidats-favorables-ou-hostiles-a-l-ue",
    "type": "Analyse indépendante"
  },
  {
    "id": "lfi-europe",
    "label": "Programme « L’avenir en commun » (La France insoumise)",
    "url": "https://melenchon2027.fr/programme/laec/",
    "type": "Programme officiel du parti"
  },
  {
    "id": "comparateur-france-vote",
    "label": "Attal et Philippe : comparatif sur 40 propositions (France-Vote)",
    "url": "https://www.france-vote.fr/comparateur/gabriel-attal-vs-edouard-philippe",
    "type": "Comparateur indépendant"
  },
  {
    "id": "comparateur-contexte",
    "label": "Attal, Retailleau et Philippe : sept différences (Contexte)",
    "url": "https://www.contexte.com/fr/article/pouvoirs/finances-publiques-travail-retraites-institutions-le-jeu-des-sept-differences-entre-gabriel-attal-bruno-retailleau-et-edouard-philippe_272575",
    "type": "Presse"
  },
  {
    "id": "monvote-2027",
    "label": "Positions des candidats en données ouvertes (MonVote2027), consultées pour recoupement uniquement",
    "url": "https://monvote2027.fr/donnees",
    "type": "Données ouvertes"
  },
  {
    "id": "candidatures-lcp",
    "label": "Suivi des candidatures à la présidentielle (LCP, mis à jour le 14 octobre 2026)",
    "url": "https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373",
    "type": "Presse"
  },
  {
    "id": "primaire-lcp",
    "label": "Primaire « Choisir 2027 » (PS, Place publique, GRS) : 1er tour les 9 et 10 octobre 2026, résultat proclamé le 11 octobre (LCP)",
    "url": "https://lcp.fr/actualites/primaire-socialiste-vainqueur-des-le-1er-tour-raphael-glucksmann-sera-le-candidat-de-la",
    "type": "Presse"
  },
  {
    "id": "primaire-guide",
    "label": "Primaire « Choisir 2027 » : dates, règles de vote et issue (guide vérifié le 6 octobre 2026)",
    "url": "https://www.elections2027.com/guides/primaire-gauche-2027",
    "type": "Guide sourcé"
  },
  {
    "id": "sondages-2027",
    "label": "Moyenne des intentions de vote au 1er tour (Élections 2027, 24 octobre 2026)",
    "url": "https://www.elections2027.com/sondages",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "second-tour-2027",
    "label": "Duels de second tour testés par les instituts (Élections 2027, mise à jour le 21 octobre 2026)",
    "url": "https://www.elections2027.com/sondages/second-tour",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "election-calendar",
    "label": "Calendrier de l’élection présidentielle 2027 (Élections 2027, d’après les décisions du Conseil des ministres)",
    "url": "https://www.elections2027.com/calendrier",
    "type": "Source officielle"
  },
  {
    "id": "prog-hub",
    "label": "Programmes 2027 : toutes les propositions, mesure par mesure, avec leurs sources (Élections 2027)",
    "url": "https://elections2027.com/programmes",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-pouvoir-achat",
    "label": "Pouvoir d’achat : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/pouvoir-achat",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-retraites",
    "label": "Retraites : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/retraites",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-economie",
    "label": "Économie et impôts : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/economie-fiscalite",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-travail",
    "label": "Travail et emploi : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/travail-emploi",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-immigration",
    "label": "Immigration : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/immigration",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-securite",
    "label": "Sécurité et justice : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/securite",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-sante",
    "label": "Santé : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/sante",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-education",
    "label": "Éducation : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/education",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-ecologie",
    "label": "Écologie et énergie : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/ecologie-energie",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-logement",
    "label": "Logement : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/logement",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-agriculture",
    "label": "Agriculture : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/agriculture",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-institutions",
    "label": "Institutions : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/institutions",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "prog-europe",
    "label": "Europe et international : ce que proposent les candidats (Élections 2027)",
    "url": "https://elections2027.com/programmes/europe-international",
    "type": "Agrégateur indépendant"
  },
  {
    "id": "pp-glucksmann",
    "label": "Raphaël Glucksmann désigné candidat représentant la gauche socialiste et démocratique (Place publique, annonce du 11 octobre 2026)",
    "url": "https://action.place-publique.eu/actualite/1pLGM09haM00P1wJaOcI3c/raphael-glucksmann-avec-66-candidat-de-la",
    "type": "Source officielle du parti"
  },
  {
    "id": "lfi-candidature",
    "label": "Proposition de Jean-Luc Mélenchon à l’investiture populaire (La France insoumise, 3 mai 2026)",
    "url": "https://lafranceinsoumise.fr/2026/05/03/declaration-de-lintergroupe-de-la-france-insoumise-du-3-mai-2026/",
    "type": "Source officielle du parti"
  },
  {
    "id": "pcf-roussel",
    "label": "Vote des adhérents et proposition de candidature Fabien Roussel (PCF, 6 septembre 2026)",
    "url": "https://projet.pcf.fr/canaux/3524",
    "type": "Source officielle du parti"
  },
  {
    "id": "ne-programme",
    "label": "Programme « Réussir une nouvelle ambition française » (Nouvelle Énergie, octobre 2026)",
    "url": "https://www.unenouvelleenergie.fr/notre-programme/reussir-une-nouvelle-ambition-francaise/",
    "type": "Source officielle du parti"
  },
  {
    "id": "ne-souverainete",
    "label": "Programme « Être maître de notre destin » : institutions, dette et Europe (Nouvelle Énergie)",
    "url": "https://www.unenouvelleenergie.fr/notre-programme/etre-maitre-de-notre-destin/",
    "type": "Source officielle du parti"
  },
  {
    "id": "ne-citoyennete",
    "label": "Programme « Générer un renouveau civique » : école, décentralisation, écologie (Nouvelle Énergie)",
    "url": "https://www.unenouvelleenergie.fr/notre-programme/generer-un-renouveau-civique/",
    "type": "Source officielle du parti"
  },
  {
    "id": "ne-immigration",
    "label": "Programme « Immigration » (Nouvelle Énergie)",
    "url": "https://www.unenouvelleenergie.fr/notre-programme/immigration/",
    "type": "Source officielle du parti"
  },
  {
    "id": "ne-lisnard",
    "label": "Fiche de candidature de David Lisnard : déclaration du 31 mars 2026 (annoncée à 20 h sur France 2)",
    "url": "https://www.elections2027.com/candidats/david-lisnard",
    "type": "Fiche agrégée"
  },
  {
    "id": "notice-ifop-1910",
    "label": "Notice officielle de l’enquête IFOP du 19 octobre 2026 (Commission des sondages)",
    "url": "https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10327-pres-barometre-election-v7-ifop-20-octobre.pdf",
    "type": "Notice officielle"
  },
  {
    "id": "notice-elabe-1610",
    "label": "Notice officielle de l’enquête Elabe du 16 octobre 2026 (Commission des sondages)",
    "url": "https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10324-pres-iv-elabe-17-octobre.pdf",
    "type": "Notice officielle"
  },
  {
    "id": "notice-cluster17-1510",
    "label": "Notice officielle de l’enquête Cluster17 du 15 octobre 2026 (Commission des sondages)",
    "url": "https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10325-pres-focus-droite-et-centre-cluster17-le-point-18-octobre.pdf",
    "type": "Notice officielle"
  },
  {
    "id": "notice-opinionway-1410",
    "label": "Notice officielle de l’enquête OpinionWay du 14 octobre 2026 (Commission des sondages)",
    "url": "https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10319-pres-iv-opinionway-cnews-15-octobre.pdf",
    "type": "Notice officielle"
  },
  {
    "id": "notice-ifop-1410",
    "label": "Notice officielle de l’enquête IFOP du 14 octobre 2026 (Commission des sondages)",
    "url": "https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10314-pres-climat-politique-post-primaire-ps-pp-ifop-lci-14-octobre.pdf",
    "type": "Notice officielle"
  },
  {
    "id": "udi-retirement-2025",
    "label": "UDI — Retraites : des annonces qui vont dans le bon sens (27 juin 2025)",
    "url": "https://parti-udi.fr/actualites/retraites-des-annonces-qui-vont-dans-le-bon-sens",
    "type": "Source primaire · UDI"
  },
  {
    "id": "udi-europe-2024",
    "label": "UDI — L’UDI engagée dans la liste Besoin d’Europe (programme européen, 2024)",
    "url": "https://parti-udi.fr/actualites/ludi-engagee-dans-la-liste-besoin-deurope",
    "type": "Source primaire · UDI"
  },
  {
    "id": "udi-values",
    "label": "UDI — Nos valeurs",
    "url": "https://www.parti-udi.fr/valeurs",
    "type": "Source primaire · UDI"
  },
  {
    "id": "udi-veto",
    "label": "UDI — Pour la suppression des vetos qui paralysent l’Europe",
    "url": "https://parti-udi.fr/actualites/pour-la-suppression-des-vetos-qui-paralysent-leurope",
    "type": "Source primaire · UDI"
  },
  {
    "id": "opinionway-oct22",
    "label": "OpinionWay pour CNEWS — Notice présidentielle (22 octobre 2026)",
    "url": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2352",
    "type": "Notice officielle · Commission des sondages"
  },
  {
    "id": "toluna-oct23",
    "label": "Toluna Harris pour M6 et RTL — Notice présidentielle (23 octobre 2026)",
    "url": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2351",
    "type": "Notice officielle · Commission des sondages"
  }
];

/* ----------------------------------------------------------------------
   PARTIS — 15 formations politiques & candidatures associées
   ------------------------------------------------------------------- */
const PARTIES = [
  {
    "id": "lfi",
    "name": "La France insoumise",
    "short": "LFI",
    "family": "Gauche",
    "color": "#7b5dc8",
    "candidacyId": "melenchon",
    "candidacyStatus": "declared",
    "site": "https://lafranceinsoumise.fr/",
    "program": "https://lafranceinsoumise.fr/programme/",
    "status": "Le 3 mai 2026, l’intergroupe a proposé Jean-Luc Mélenchon à une investiture populaire de 150 000 personnes ; cette étape interne n’est pas la liste officielle des candidats. Programme de référence : « L’Avenir en commun ».",
    "statusDate": "2026-10",
    "statusSource": "https://lafranceinsoumise.fr/2026/05/03/declaration-de-lintergroupe-de-la-france-insoumise-du-3-mai-2026/",
    "personName": "Jean-Luc Mélenchon",
    "personRole": "Candidat déclaré",
    "portraitFile": "Jean-Luc Mélenchon en 2026.png",
    "portraitCredit": "jlm2017.fr",
    "portraitLicense": "CC BY 4.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "positions": {
      "eco": -2,
      "soc": -1.5,
      "auth": -1,
      "europe": 0.8,
      "immig": -1.5,
      "ecology": -2
    }
  },
  {
    "id": "pcf",
    "name": "Parti communiste français",
    "short": "PCF",
    "family": "Gauche",
    "color": "#b5193f",
    "candidacyId": "roussel",
    "candidacyStatus": "official",
    "site": "https://www.pcf.fr/",
    "program": "https://www.pcf.fr/nos_propositions",
    "status": "Le 6 septembre 2026, les adhérents du PCF ont approuvé à 72,06 % la proposition de candidature de Fabien Roussel, conformément au processus interne du parti.",
    "statusDate": "2026-10",
    "statusSource": "https://projet.pcf.fr/canaux/3524",
    "personName": "Fabien Roussel",
    "personRole": "Candidat désigné par les adhérents",
    "portraitFile": "Fabien Roussel 2022.jpg",
    "portraitCredit": "Zouhair Nakara",
    "portraitLicense": "CC BY-SA 4.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "positions": {
      "eco": -1.8,
      "soc": -1,
      "auth": -0.5,
      "europe": 0.5,
      "immig": -1,
      "ecology": -1
    }
  },
  {
    "id": "pp",
    "name": "Place publique",
    "short": "PP",
    "family": "Centre-gauche européen",
    "color": "#df2160",
    "candidacyId": "glucksmann",
    "candidacyStatus": "official",
    "site": "https://place-publique.eu/",
    "program": "https://place-publique.eu/",
    "status": "Raphaël Glucksmann a remporté dès le premier tour, le 9 et 10 octobre 2026, la primaire « Choisir 2027 » organisée par le Parti socialiste, Place publique et la Gauche républicaine et socialiste (résultat proclamé le 11 octobre, 66 % des suffrages, sans second tour). Il est donc le candidat de Place publique pour porter un rassemblement social-démocrate et pro-européen.",
    "statusDate": "2026-10",
    "statusSource": "https://action.place-publique.eu/actualite/1pLGM09haM00P1wJaOcI3c/raphael-glucksmann-avec-66-candidat-de-la",
    "personName": "Raphaël Glucksmann",
    "personRole": "Candidat de Place publique (rassemblement social-démocrate)",
    "portraitFile": "2024-03-03 - Congrès du PSE- 105 - Raphael Glucksmann.jpg",
    "portraitCredit": "Mathieu Delmestre",
    "portraitLicense": "CC0 1.0",
    "portraitLicenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "positions": {
      "eco": -0.8,
      "soc": -1.2,
      "auth": -0.3,
      "europe": -1.8,
      "immig": -0.5,
      "ecology": -1.3
    }
  },
  {
    "id": "ecolo",
    "name": "Les Écologistes",
    "short": "LE",
    "family": "Écologie",
    "color": "#1e9b58",
    "candidacyId": "tondelier",
    "candidacyStatus": "conditional",
    "site": "https://lesecologistes.fr/",
    "program": "https://lesecologistes.fr/",
    "status": "Marine Tondelier maintient sa candidature, mais un nouveau vote des adhérents du parti est prévu en décembre 2026.",
    "statusDate": "2026-10",
    "statusSource": "https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373",
    "personName": "Marine Tondelier",
    "personRole": "Secrétaire nationale · candidature à confirmer par un vote interne",
    "portraitFile": "Huma2023MarineTondelier (cropped).jpg",
    "portraitCredit": "Selbymay",
    "portraitLicense": "CC BY 4.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "positions": {
      "eco": -1.2,
      "soc": -1.5,
      "auth": -0.5,
      "europe": -1.3,
      "immig": -1,
      "ecology": -2
    }
  },
  {
    "id": "renaissance",
    "name": "Renaissance",
    "short": "RE",
    "family": "Centre",
    "color": "#0b2d4f",
    "candidacyId": "attal",
    "candidacyStatus": "declared",
    "site": "https://parti-renaissance.fr/",
    "program": "https://parti-renaissance.fr/",
    "status": "Gabriel Attal a officialisé sa candidature le 22 mai 2026.",
    "statusDate": "2026-10",
    "personName": "Gabriel Attal",
    "personRole": "Candidat déclaré selon le statut indiqué",
    "portraitFile": "Gabriel Attal 2025 (close crop).jpg",
    "portraitCredit": "Ismail Aissoub",
    "portraitLicense": "CC BY 4.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "positions": {
      "eco": 0.8,
      "soc": -0.3,
      "auth": 0.3,
      "europe": -1.5,
      "immig": 0.3,
      "ecology": 0
    }
  },
  {
    "id": "modem",
    "name": "Mouvement Démocrate",
    "short": "MD",
    "family": "Centre",
    "color": "#4c67c7",
    "candidacyId": "bayrou",
    "candidacyStatus": "reference",
    "site": "https://www.mouvementdemocrate.fr/",
    "program": "https://www.mouvementdemocrate.fr/",
    "status": "Aucune candidature présidentielle du MoDem n’est annoncée dans le suivi du 14 octobre 2026. François Bayrou reste la personnalité de référence de cette fiche.",
    "statusDate": "2026-10",
    "statusSource": "https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373",
    "personName": "François Bayrou",
    "personRole": "Personnalité de référence · pas de candidat annoncé",
    "portraitFile": "François Bayrou - 2025 (cropped).jpg",
    "portraitCredit": "Nicolas Kovarik / Commission européenne",
    "portraitLicense": "CC BY 4.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "positions": {
      "eco": 0.3,
      "soc": -0.5,
      "auth": 0,
      "europe": -1.8,
      "immig": 0,
      "ecology": -0.3
    }
  },
  {
    "id": "udi",
    "name": "Union des Démocrates et Indépendants",
    "short": "UDI",
    "family": "Centre-droit",
    "color": "#0b5fae",
    "candidacyId": "marseille",
    "candidacyStatus": "reference",
    "site": "https://www.parti-udi.fr/",
    "program": "https://www.parti-udi.fr/nos-idees/",
    "status": "Aucune candidature présidentielle de l’UDI n’est annoncée dans le suivi du 14 octobre 2026. Hervé Marseille est présenté comme personnalité de référence du parti.",
    "statusDate": "2026-10",
    "statusSource": "https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373",
    "personName": "Hervé Marseille",
    "personRole": "Président de l’UDI · pas de candidat annoncé",
    "portraitFile": "Herve Marseille-IMG 4093.jpg",
    "portraitCredit": "Rama",
    "portraitLicense": "CC BY-SA 2.0 France",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/fr/",
    "positions": {
      "eco": 0.8,
      "soc": -0.2,
      "auth": 0.3,
      "europe": -1.3,
      "immig": 0.3,
      "ecology": -0.2
    }
  },
  {
    "id": "horizons",
    "name": "Horizons",
    "short": "H",
    "family": "Centre-droit",
    "color": "#111827",
    "candidacyId": "philippe",
    "candidacyStatus": "declared",
    "site": "https://horizonsleparti.fr/",
    "program": "https://horizonsleparti.fr/le-manifeste/",
    "status": "Édouard Philippe, président d’Horizons, est candidat déclaré à la présidentielle.",
    "statusDate": "2026-10",
    "personName": "Édouard Philippe",
    "personRole": "Candidat déclaré selon le statut indiqué",
    "portraitFile": "Édouard Philippe MSC 2018 (cropped).jpg",
    "portraitCredit": "Mueller / MSC",
    "portraitLicense": "CC BY 3.0 Allemagne",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by/3.0/de/",
    "positions": {
      "eco": 1,
      "soc": -0.2,
      "auth": 0.5,
      "europe": -1,
      "immig": 0.5,
      "ecology": -0.2
    }
  },
  {
    "id": "lr",
    "name": "Les Républicains",
    "short": "LR",
    "family": "Droite",
    "color": "#1d4f91",
    "candidacyId": "retailleau",
    "candidacyStatus": "official",
    "site": "https://republicains.fr/",
    "program": "https://republicains.fr/nos-propositions/",
    "status": "Bruno Retailleau a été désigné candidat des Républicains par un vote des adhérents en avril 2026.",
    "statusDate": "2026-10",
    "personName": "Bruno Retailleau",
    "personRole": "Candidat désigné par les adhérents selon le statut indiqué",
    "portraitFile": "Bruno Retailleau - Ministre de l'Intérieur français (3x4 cropped).jpg",
    "portraitCredit": "Anthony Montardy",
    "portraitLicense": "CC BY 4.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "positions": {
      "eco": 1.5,
      "soc": 0.8,
      "auth": 1.3,
      "europe": 0.3,
      "immig": 1.5,
      "ecology": 1
    }
  },
  {
    "id": "udr",
    "name": "Union des droites pour la République",
    "short": "UDR",
    "family": "Droite nationale",
    "color": "#203552",
    "candidacyId": "ciotti",
    "candidacyStatus": "reference",
    "site": "https://www.udr.fr/",
    "program": "https://www.udr.fr/",
    "status": "Éric Ciotti est la personnalité de référence de l’UDR. Le suivi du 14 octobre 2026 ne fait pas état d’une candidature présidentielle du parti.",
    "statusDate": "2026-10",
    "statusSource": "https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373",
    "personName": "Éric Ciotti",
    "personRole": "Président et figure de l’UDR · pas de candidat annoncé",
    "portraitFile": "Éric Ciotti, EPP Summit, 23 March, Brussels (52765298047) (cropped).jpg",
    "portraitCredit": "European People’s Party",
    "portraitLicense": "CC BY 2.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by/2.0/",
    "positions": {
      "eco": 1.3,
      "soc": 1.3,
      "auth": 1.8,
      "europe": 1.3,
      "immig": 1.8,
      "ecology": 1.3
    }
  },
  {
    "id": "rn",
    "name": "Rassemblement National",
    "short": "RN",
    "family": "Droite nationale",
    "color": "#173f70",
    "candidacyId": "lepen",
    "candidacyStatus": "declared",
    "site": "https://rassemblementnational.fr/",
    "program": "https://rassemblementnational.fr/programme/",
    "status": "Marine Le Pen a confirmé sa candidature le 7 juillet 2026. La possibilité de se présenter reste liée à l’issue de sa procédure judiciaire.",
    "statusDate": "2026-10",
    "statusSource": "https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373",
    "personName": "Marine Le Pen",
    "personRole": "Candidate déclarée selon le statut indiqué",
    "portraitFile": "Marine Le Pen in 2026.jpg",
    "portraitCredit": "Elekes Andor",
    "portraitLicense": "CC BY 4.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "positions": {
      "eco": 0.3,
      "soc": 1.3,
      "auth": 1.8,
      "europe": 1.3,
      "immig": 2,
      "ecology": 0.8
    }
  },
  {
    "id": "reconquete",
    "name": "Reconquête",
    "short": "R",
    "family": "Droite nationale",
    "color": "#a93f4b",
    "candidacyId": "zemmour",
    "candidacyStatus": "declared",
    "site": "https://www.parti-reconquete.fr/",
    "program": "https://www.parti-reconquete.fr/programme",
    "status": "Éric Zemmour a officialisé sa candidature le 17 septembre 2026.",
    "statusDate": "2026-10",
    "personName": "Éric Zemmour",
    "personRole": "Candidat déclaré selon le statut indiqué",
    "portraitFile": "Portrait Éric Zemmour, avril 2022 cropped.jpg",
    "portraitCredit": "Anh De France",
    "portraitLicense": "CC0 1.0",
    "portraitLicenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "positions": {
      "eco": 1,
      "soc": 1.8,
      "auth": 2,
      "europe": 1.8,
      "immig": 2,
      "ecology": 0.8
    }
  },
  {
    "id": "dlf",
    "name": "Debout la France",
    "short": "DLF",
    "family": "Droite souverainiste",
    "color": "#1683b5",
    "candidacyId": "dupont-aignan",
    "candidacyStatus": "declared",
    "site": "https://www.debout-la-france.fr/",
    "program": "https://www.debout-la-france.fr/notre-projet/",
    "status": "Nicolas Dupont-Aignan est candidat déclaré à la présidentielle.",
    "statusDate": "2026-10",
    "personName": "Nicolas Dupont-Aignan",
    "personRole": "Candidat déclaré selon le statut indiqué",
    "portraitFile": "Nicolas Dupont-Aignan in 2014.jpg",
    "portraitCredit": "Laurence de Terline",
    "portraitLicense": "CC BY-SA 2.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/",
    "positions": {
      "eco": 0.5,
      "soc": 0.8,
      "auth": 1.3,
      "europe": 2,
      "immig": 1.5,
      "ecology": 0.5
    }
  },
  {
    "id": "ne",
    "name": "Nouvelle Énergie",
    "short": "NE",
    "family": "Droite libérale",
    "color": "#0f766e",
    "candidacyId": "lisnard",
    "candidacyStatus": "declared",
    "site": "https://www.unenouvelleenergie.fr/",
    "program": "https://www.unenouvelleenergie.fr/notre-programme/reussir-une-nouvelle-ambition-francaise/",
    "status": "David Lisnard, président du mouvement Nouvelle Énergie, a déclaré sa candidature à la présidentielle le 31 mars 2026 (annoncée à 20 h sur France 2). Le parti revendique 75 360 adhérents au 21 octobre 2026 et présente un programme en trois axes : « Être maître de notre destin », « Réussir une nouvelle ambition française », « Générer un renouveau civique ».",
    "statusDate": "2026-03",
    "statusSource": "https://www.elections2027.com/candidats/david-lisnard",
    "personName": "David Lisnard",
    "personRole": "Candidat déclaré · président de Nouvelle Énergie",
    "portraitFile": "David Lisnard - 2013.jpg",
    "portraitCredit": "Frantogian",
    "portraitLicense": "CC BY-SA 3.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "positionsBasis": "Positions d’axes codées à partir du programme officiel du parti (octobre 2026) : pour l’économie, suppression de la C3S et de la CVAE et division par deux des impôts de production ; pour la société, révolution scolaire libérale, décentralisation et partage de recettes fiscales ; pour l’autorité, renforcement des forces de sécurité, doubling des procureurs et recentrage de l’exécutif ; pour l’Europe, refus du repli mais critique de l’« Europe technocratique » ; pour l’immigration, division par huit des titres de séjour et fin de l’automaticité du droit du sol ; pour l’écologie, objectif « Bas carbone » porté par le nucléaire, sans écologie contraignante. Les 27 positions de départage ne sont pas encore codées pour ce parti : la comparaison précise est donc impossible et la formation n’est pas classée.",
    "positions": {
      "eco": 1.5,
      "soc": 0.3,
      "auth": 1.6,
      "europe": -0.3,
      "immig": 1.9,
      "ecology": 0.2
    }
  },
  {
    "id": "upr",
    "name": "Union populaire républicaine",
    "short": "UPR",
    "family": "Souverainiste",
    "color": "#25518a",
    "candidacyId": "asselineau",
    "candidacyStatus": "declared",
    "site": "https://upr.fr/",
    "program": "https://upr.fr/notre-programme",
    "status": "François Asselineau et l’UPR sont candidats déclarés à la présidentielle. Les positions du parti sur certains thèmes ne sont pas codées dans cette version ; la comparaison peut donc être partielle.",
    "statusDate": "2026-10",
    "personName": "François Asselineau",
    "personRole": "Président de l’UPR",
    "portraitFile": "François ASSELINEAU.jpg",
    "portraitCredit": "Union Populaire Républicaine",
    "portraitLicense": "CC BY-SA 4.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "positions": {
      "eco": null,
      "soc": null,
      "auth": null,
      "europe": 2,
      "immig": null,
      "ecology": null
    }
  },
  {
    "id": "lo",
    "name": "Lutte Ouvrière",
    "short": "LO",
    "family": "Extrême gauche",
    "color": "#c81f1f",
    "candidacyId": "arthaud",
    "candidacyStatus": "declared",
    "site": "https://www.lutte-ouvriere.org/",
    "program": "https://www.lutte-ouvriere.org/",
    "status": "Nathalie Arthaud est candidate pour Lutte ouvrière. Le parti se définit comme internationaliste ; sa position ne se lit pas sur l’axe « intégration européenne / souveraineté nationale ».",
    "statusDate": "2026-10",
    "personName": "Nathalie Arthaud",
    "personRole": "Porte-parole de Lutte Ouvrière",
    "portraitFile": "Nathalie Arthaud.png",
    "portraitCredit": "Minamonoch",
    "portraitLicense": "CC BY-SA 3.0",
    "portraitLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "positions": {
      "eco": -2,
      "soc": -1,
      "auth": -1,
      "europe": null,
      "immig": -1.5,
      "ecology": -0.5
    }
  }
];

/* ----------------------------------------------------------------------
   THÈMES DÉTAILLÉS & POINTS DE VUE DES CANDIDATS (NOUVEL ONGLET THÈMES)
   ------------------------------------------------------------------- */
const THEMES = [
  {
    "id": "pouvoir-achat",
    "name": "Pouvoir d’achat, salaires & inflation",
    "icon": "💰",
    "summary": "La première préoccupation des Français : hausse des prix de l’alimentation et de l’énergie, salaires stagnants et partage de la valeur.",
    "cleavages": "La gauche propose le blocage des prix et la hausse immédiate du SMIC net à 1600 €. Le centre privilégie la prime de partage de la valeur défiscalisée et la baisse des charges. La droite et le RN misent sur des baisses massives de TVA et de cotisations patronales.",
    "candidates": [
      {
        "candidateName": "Raphaël Glucksmann",
        "partyShort": "PP",
        "partyName": "Place publique",
        "color": "#df2160",
        "stance": "Conditionner les aides publiques aux entreprises à des hausses réelles de salaires et taxer les superprofits pour financer des chèques énergie ciblés.",
        "proposals": [
          "Conditionnalité sociale des 150 milliards d’euros d’aides publiques annuelles aux entreprises",
          "Conférence nationale sur les salaires avec indexation des bas salaires sur l’inflation",
          "Tarification progressive de l’eau et de l’électricité avec gratuité des premiers mètres cubes"
        ]
      },
      {
        "candidateName": "Jean-Luc Mélenchon",
        "partyShort": "LFI",
        "partyName": "La France insoumise",
        "color": "#7b5dc8",
        "stance": "Rupture immédiate : blocage des prix des biens de première nécessité et SMIC à 1600 euros net.",
        "proposals": [
          "SMIC net revalorisé à 1600 € dès le premier mois",
          "Blocage immédiat des prix de 100 produits de première nécessité et de l’énergie",
          "Rétablissement de l’échelle mobile des salaires (indexation automatique)"
        ]
      },
      {
        "candidateName": "Gabriel Attal",
        "partyShort": "RE",
        "partyName": "Renaissance",
        "color": "#0b2d4f",
        "stance": "Défiscalisation du travail, désmicardisation des classes moyennes et prime de partage de la valeur sans impôt.",
        "proposals": [
          "Refonte des allègements de charges pour inciter aux augmentations au-dessus du SMIC",
          "Pérennisation et relèvement du plafond de la prime de partage de la valeur sans cotisations",
          "Semaine de 4 jours modulable pour les salariés volontaires"
        ]
      },
      {
        "candidateName": "Édouard Philippe",
        "partyShort": "H",
        "partyName": "Horizons",
        "color": "#111827",
        "stance": "Valoriser l’effort et augmenter le nombre global d’heures travaillées dans l’économie pour créer de la richesse durable.",
        "proposals": [
          "Autonomie accrue des branches professionnelles pour négocier le temps de travail",
          "Baisse ciblée des cotisations salariales sur les salaires médians (1,5 à 2,5 SMIC)",
          "Incitation forte au cumul emploi-retraite sans décote"
        ]
      },
      {
        "candidateName": "Bruno Retailleau",
        "partyShort": "LR",
        "partyName": "Les Républicains",
        "color": "#1d4f91",
        "stance": "Le travail doit rapporter nettement plus que l’assistanat : baisse drastique des charges et allègement fiscal des heures supplémentaires.",
        "proposals": [
          "Défiscalisation totale et désocialisation des heures supplémentaires",
          "Baisse de 10 % des cotisations patronales compensée par la réduction de la dépense publique",
          "Plafonnement strict de l’ensemble des aides sociales à 70 % du SMIC"
        ]
      },
      {
        "candidateName": "Marine Le Pen",
        "partyShort": "RN",
        "partyName": "Rassemblement National",
        "color": "#173f70",
        "stance": "Baisse de la TVA sur l’énergie et exonération fiscale des hausses de salaires accordées par les employeurs.",
        "proposals": [
          "Baisse permanente de la TVA de 20 % à 5,5 % sur l’électricité, le gaz, le fioul et les carburants",
          "Exonération de cotisations patronales pendant 5 ans pour toute hausse de salaire de 10 % jusqu’à 3 SMIC",
          "Suppression de l’impôt sur le revenu pour les jeunes actifs de moins de 30 ans"
        ]
      }
    ]
  },
  {
    "id": "retraites-travail",
    "name": "Retraites, travail & modèle social",
    "icon": "⏳",
    "summary": "L’âge de départ, la pénibilité au travail et le financement pérenne des régimes de répartition.",
    "cleavages": "LFI, le PCF et LO exigent le retour à 60 ans. Place publique et les Écologistes défendent 62 ans avec prise en compte accrue de la pénibilité. Renaissance maintient 64 ans ; Horizons et LR demandent un relèvement à 65 ans.",
    "candidates": [
      {
        "candidateName": "Raphaël Glucksmann",
        "partyShort": "PP",
        "partyName": "Place publique",
        "color": "#df2160",
        "stance": "Abrogation de la réforme des 64 ans, retour à 62 ans avec 42 annuités et financement par une cotisation sur les hauts patrimoines.",
        "proposals": [
          "Retour à l’âge légal de départ à 62 ans",
          "Reconnaissance réelle de la pénibilité physique et des carrières hachées des femmes",
          "Contribution de solidarité sur les super-dividendes pour équilibrer la caisse des retraites"
        ]
      },
      {
        "candidateName": "Jean-Luc Mélenchon",
        "partyShort": "LFI",
        "partyName": "La France insoumise",
        "color": "#7b5dc8",
        "stance": "Droit à la retraite à 60 ans à taux plein après 40 annuités de cotisation.",
        "proposals": [
          "Abrogation immédiate de la réforme Borne de 2023",
          "Départ possible dès 60 ans avec 40 annuités",
          "Pension minimale égale au SMIC pour une carrière complète"
        ]
      },
      {
        "candidateName": "Gabriel Attal",
        "partyShort": "RE",
        "partyName": "Renaissance",
        "color": "#0b2d4f",
        "stance": "Maintien de l’âge légal à 64 ans pour garantir l’équilibre budgétaire sans augmenter la dette des générations futures.",
        "proposals": [
          "Préservation de la trajectoire à 64 ans adoptée en 2023",
          "Renforcement du compte professionnel de prévention pour les métiers usants",
          "Développement de l’épargne retraite collective et de l’actionnariat salarié"
        ]
      },
      {
        "candidateName": "Édouard Philippe",
        "partyShort": "H",
        "partyName": "Horizons",
        "color": "#111827",
        "stance": "Aller plus loin dans l’effort d’activité avec un départ progressif jusqu’à 65 ans ou un système par points.",
        "proposals": [
          "Perspective d’un âge de référence relevé à 65 ans pour équilibrer durablement les régimes",
          "Création d’un véritable pilier de retraite par capitalisation collective",
          "Simplification radicale des 42 régimes spéciaux vers un système unifié"
        ]
      },
      {
        "candidateName": "Marine Le Pen",
        "partyShort": "RN",
        "partyName": "Rassemblement National",
        "color": "#173f70",
        "stance": "Retraite à 60 ans pour ceux ayant commencé à travailler avant 20 ans avec 40 annuités, et 62 ans pour les autres.",
        "proposals": [
          "Retraite anticipée dès 60 ans pour les carrières longues (début avant 20 ans, 40 annuités)",
          "Refus du départ à 64 ans et révision des critères de pénibilité",
          "Revalorisation des pensions de réversion pour les conjoints survivants"
        ]
      },
      {
        "candidateName": "Position de l’UDI · aucun candidat annoncé",
        "partyShort": "UDI",
        "partyName": "Union des Démocrates et Indépendants",
        "color": "#0b5fae",
        "stance": "Ne pas rouvrir l’âge légal fixé à 64 ans, tout en discutant du financement et des modalités de la réforme.",
        "proposals": [
          "Maintenir l’âge légal à 64 ans; la déclaration de l’UDI ne tranche pas à elle seule la durée de cotisation.",
          "Poursuivre la discussion sur la soutenabilité financière du système."
        ],
        "sourceUrl": "https://parti-udi.fr/actualites/retraites-des-annonces-qui-vont-dans-le-bon-sens",
        "sourceLabel": "UDI · 27 juin 2025"
      }
    ]
  },
  {
    "id": "sante-hopital",
    "name": "Santé, hôpital public & déserts médicaux",
    "icon": "🏥",
    "summary": "Urgences saturées, crise de l’hôpital public, pénurie de médecins de campagne et accès aux spécialistes.",
    "cleavages": "La gauche et les communistes veulent réguler l’installation des médecins pour enrayer les déserts médicaux. La majorité présidentielle privilégie les délégations de tâches et les bourses incitatives. La droite défend la liberté absolue d’installation et la débureaucratisation.",
    "candidates": [
      {
        "candidateName": "Fabien Roussel",
        "partyShort": "PCF",
        "partyName": "Parti communiste français",
        "color": "#b5193f",
        "stance": "Un grand plan public pour l’hôpital, moratoire sur les fermetures de lits et régulation de l’installation des soignants.",
        "proposals": [
          "Plan de 20 milliards d’euros pour réembaucher 100 000 soignants hospitaliers",
          "Obligation temporaire d’exercice pour les jeunes médecins dans les zones sous-dotées",
          "Création de centres de santé municipaux avec médecins salariés"
        ]
      },
      {
        "candidateName": "Raphaël Glucksmann",
        "partyShort": "PP",
        "partyName": "Place publique",
        "color": "#df2160",
        "stance": "Conventionnement sélectif des médecins pour sauver l’égalité d’accès aux soins et investissement d’urgence dans les urgences pédiatriques et psychiatriques.",
        "proposals": [
          "Régulation douce de l’installation : un nouveau médecin ne peut s’installer en zone surdotée qu’au départ d’un confrère",
          "Augmentation du nombre d’étudiants en médecine et internat en zone rurale financé",
          "Revalorisation statutaire des gardes de nuit et des carrières infirmières"
        ]
      },
      {
        "candidateName": "Gabriel Attal",
        "partyShort": "RE",
        "partyName": "Renaissance",
        "color": "#0b2d4f",
        "stance": "Délégation d’actes aux pharmaciens et infirmiers de pratique avancée (IPA), taxe sur les rendez-vous médicaux non honorés (« taxe lapin »).",
        "proposals": [
          "Délégation accrue de prescriptions et diagnostics simples aux paramédicaux",
          "Déploiement massif de la télémédecine et des bus de santé itinérants",
          "Suppression définitive du reste à charge sur les bilans de prévention aux âges clés"
        ]
      },
      {
        "candidateName": "Bruno Retailleau",
        "partyShort": "LR",
        "partyName": "Les Républicains",
        "color": "#1d4f91",
        "stance": "Défense ferme de la médecine libérale, suppression des lourdeurs administratives et revalorisation de la consultation.",
        "proposals": [
          "Refus catégorique de toute coercition à l’installation des médecins",
          "Suppression de la moitié des postes administratifs en ARS et hôpitaux pour réaffecter au soin",
          "Doublement des bourses d’internat contre engagement d’installation en zone rurale"
        ]
      },
      {
        "candidateName": "Marine Le Pen",
        "partyShort": "RN",
        "partyName": "Rassemblement National",
        "color": "#173f70",
        "stance": "Plan d’urgence pour réarmer l’hôpital, suppression des ARS et incitations fiscales très fortes dans les déserts médicaux.",
        "proposals": [
          "Suppression des Agences régionales de santé (ARS) remplacées par un commandement préfectoral",
          "Exonération d’impôt sur le revenu pendant 5 ans pour les médecins s’installant en désert médical",
          "Réintégration immédiate et indemnisation des personnels suspendus sous le Covid-19"
        ]
      }
    ]
  },
  {
    "id": "logement",
    "name": "Logement, loyers & rénovation",
    "icon": "🏡",
    "summary": "Crise de la construction neuve, explosion des loyers dans les métropoles, passoires thermiques et pénurie de HLM.",
    "cleavages": "La gauche prône l’encadrement généralisé des loyers et le respect strict de la loi SRU (25 % de HLM). Le centre cherche à relancer l’investissement privé via des niches adaptées. La droite demande l’assouplissement du calendrier du DPE et des sanctions contre les squats.",
    "candidates": [
      {
        "candidateName": "Marine Tondelier",
        "partyShort": "LE",
        "partyName": "Les Écologistes",
        "color": "#1e9b58",
        "stance": "Un grand plan national de rénovation thermique 100 % prise en charge pour les ménages modestes et régulation drastique de Airbnb.",
        "proposals": [
          "Généralisation obligatoire de l’encadrement des loyers dans toutes les zones tendues",
          "Plafond strict de 30 jours par an pour les locations meublées touristiques de type Airbnb",
          "Plan de rénovation thermique globale de 700 000 logements par an financé par l’État"
        ]
      },
      {
        "candidateName": "Raphaël Glucksmann",
        "partyShort": "PP",
        "partyName": "Place publique",
        "color": "#df2160",
        "stance": "Relancer massivement le logement social public et sanctionner lourdement les maires hors-la-loi qui refusent de bâtir des HLM.",
        "proposals": [
          "Multiplication par cinq des amendes pour les communes ne respectant pas les 25 % de la loi SRU",
          "Création d’un statut public du bailleur privé solidaire avec exonération fiscale en échange d’un loyer modéré",
          "Garantie universelle des loyers publique pour sécuriser propriétaires et locataires"
        ]
      },
      {
        "candidateName": "Gabriel Attal",
        "partyShort": "RE",
        "partyName": "Renaissance",
        "color": "#0b2d4f",
        "stance": "Simplification des permis de construire, densification douce et adaptation pragmatique du calendrier d’interdiction des passoires thermiques (DPE).",
        "proposals": [
          "Assouplissement des critères du DPE pour les petites surfaces et copropriétés",
          "Pacte national avec les banques pour faciliter l’accès au crédit immobilier des primo-accédants",
          "Développement du bail réel solidaire (BRS) pour dissocier le foncier du bâti"
        ]
      },
      {
        "candidateName": "Bruno Retailleau",
        "partyShort": "LR",
        "partyName": "Les Républicains",
        "color": "#1d4f91",
        "stance": "Protéger le droit de propriété, supprimer l’interdiction de louer liée au DPE et expulser les squatteurs en 24h.",
        "proposals": [
          "Moratoire immédiat sur l’interdiction de louer les logements classés F et G",
          "Exonération totale des droits de donation pour aider les parents à loger leurs enfants",
          "Expulsion administrative immédiate des squatteurs et tolérance zéro sur les impayés"
        ]
      },
      {
        "candidateName": "Marine Le Pen",
        "partyShort": "RN",
        "partyName": "Rassemblement National",
        "color": "#173f70",
        "stance": "Priorité nationale pour l’attribution des logements sociaux et prêt à taux zéro généralisé.",
        "proposals": [
          "Réservation prioritaire des logements sociaux aux familles françaises",
          "Prêt à taux zéro garanti par l’État de 100 000 € pour les jeunes couples s’installant dans leur premier logement",
          "Baisse des frais de notaire pour la première acquisition immobilière"
        ]
      }
    ]
  },
  {
    "id": "ecologie-energie",
    "name": "Écologie, climat & mix énergétique",
    "icon": "🌱",
    "summary": "Relance des réacteurs nucléaires EPR2 contre le 100 % renouvelable, fin du moteur thermique en 2035 et sobriété.",
    "cleavages": "Les Écologistes et LFI veulent sortir du nucléaire et accélérer sur le solaire/éolien. Le PCF défend à la fois le nucléaire et les renouvelables. La majorité, la droite et le RN misent très lourdement sur l’atome et s’opposent aux éoliennes terrestres.",
    "candidates": [
      {
        "candidateName": "Marine Tondelier",
        "partyShort": "LE",
        "partyName": "Les Écologistes",
        "color": "#1e9b58",
        "stance": "100 % d’énergies renouvelables d’ici 2045, abandon des nouveaux réacteurs EPR2 et moratoire sur les autoroutes superflues.",
        "proposals": [
          "Arrêt du programme de construction des 6 à 14 nouveaux EPR2 jugés trop lents et trop coûteux",
          "Déploiement massif de l’éolien terrestre et marin et solarisation obligatoire de tous les toits industriels",
          "Interdiction définitive des pesticides tueurs d’abeilles (néonicotinoïdes) sans dérogation"
        ]
      },
      {
        "candidateName": "Raphaël Glucksmann",
        "partyShort": "PP",
        "partyName": "Place publique",
        "color": "#df2160",
        "stance": "Mix pragmatique : prolongation du parc nucléaire existant couplée à un essor fulgurant des énergies renouvelables et un plan ferroviaire.",
        "proposals": [
          "Grand plan rail de 100 milliards d’euros pour relier les villes moyennes et réhabiliter le fret",
          "Mix équilibré : maintien des réacteurs actuels sous contrôle de l’ASN et rattrapage sur l’éolien marin",
          "Taxe carbone européenne aux frontières avec redistribution sociale pour financer les alternatives"
        ]
      },
      {
        "candidateName": "Gabriel Attal",
        "partyShort": "RE",
        "partyName": "Renaissance",
        "color": "#0b2d4f",
        "stance": "Relance historique du nucléaire français (6 à 14 réacteurs EPR2), électrification des transports et écologie incitative sans décroissance.",
        "proposals": [
          "Construction confirmée des 6 premiers réacteurs nucléaires EPR2 et études pour 8 supplémentaires",
          "Leasing social de voitures électriques à 100 € par mois pour les actifs modestes",
          "Soutien aux technologies de décarbonation industrielle et à l’hydrogène vert"
        ]
      },
      {
        "candidateName": "Marine Le Pen",
        "partyShort": "RN",
        "partyName": "Rassemblement National",
        "color": "#173f70",
        "stance": "Moratoire immédiat sur les éoliennes terrestres, démantèlement des parcs existants et tout-nucléaire souverain.",
        "proposals": [
          "Arrêt total de toute nouvelle implantation d’éoliennes et suppression progressive des subventions",
          "Prolongation de tous les réacteurs nucléaires jusqu’à 60 ans minimum",
          "Refus de l’interdiction européenne des moteurs thermiques en 2035"
        ]
      },
      {
        "candidateName": "Position de l’UDI · aucun candidat annoncé",
        "partyShort": "UDI",
        "partyName": "Union des Démocrates et Indépendants",
        "color": "#0b5fae",
        "stance": "Renforcer la place du nucléaire dans le mix énergétique européen, en complément des autres sources d’énergie.",
        "proposals": [
          "Le programme européen de l’UDI appelle à tripler la production nucléaire en Europe d’ici 2050.",
          "L’objectif porte sur l’échelle européenne; le programme ne fixe pas un nombre de réacteurs à construire en France."
        ],
        "sourceUrl": "https://parti-udi.fr/actualites/ludi-engagee-dans-la-liste-besoin-deurope",
        "sourceLabel": "UDI · programme européen 2024"
      }
    ]
  },
  {
    "id": "securite-justice",
    "name": "Sécurité, justice & libertés publiques",
    "icon": "🛡️",
    "summary": "Augmentation des moyens de la police et de la justice, peines planchers, surpopulation carcérale et réinsertion.",
    "cleavages": "La gauche met l’accent sur la police de proximité, la prévention et la fin des peines courtes automatiques. Le centre et la droite prônent la fermeté, la création de places de prison et des peines minimales incompressibles.",
    "candidates": [
      {
        "candidateName": "Jean-Luc Mélenchon",
        "partyShort": "LFI",
        "partyName": "La France insoumise",
        "color": "#7b5dc8",
        "stance": "Refonte républicaine de la police, démantèlement des BAC, retour de la police de proximité et récépissé contre le contrôle au faciès.",
        "proposals": [
          "Création d’une police de proximité formée aux désescalades et médiations citoyennes",
          "Récépissé délivré lors de tout contrôle d’identité pour éviter les contrôles arbitraires répétitifs",
          "Remplacement de l’IGPN par une autorité administrative véritablement indépendante"
        ]
      },
      {
        "candidateName": "Raphaël Glucksmann",
        "partyShort": "PP",
        "partyName": "Place publique",
        "color": "#df2160",
        "stance": "Une justice rapide et indépendante, doublement des magistrats et rétablissement des commissariats de quartier.",
        "proposals": [
          "Plan Marshall pour la justice avec doublement du nombre de greffiers et magistrats d’ici 2032",
          "Rétablissement d’une police de quartier présente au quotidien dans les zones sensibles",
          "Moyens renforcés pour la protection des femmes victimes de violences conjugales (bracelets anti-rapprochement)"
        ]
      },
      {
        "candidateName": "Gabriel Attal",
        "partyShort": "RE",
        "partyName": "Renaissance",
        "color": "#0b2d4f",
        "stance": "Atténuation de l’excuse de minorité pour les délinquants récidivistes, comparution immédiate dès 16 ans et peines d’intérêt général rapides.",
        "proposals": [
          "Possibilité de lever l’excuse de minorité dès 16 ans pour les actes de violences graves récidivistes",
          "Travaux d’intérêt général (TIG) obligatoires exécutés dans les semaines suivant la décision de justice",
          "Création de 15 000 places de prison supplémentaires"
        ]
      },
      {
        "candidateName": "Bruno Retailleau",
        "partyShort": "LR",
        "partyName": "Les Républicains",
        "color": "#1d4f91",
        "stance": "Tolérance zéro, rétablissement des peines planchers, abaissement de la majorité pénale à 16 ans et exécution systématique des courtes peines.",
        "proposals": [
          "Majorité pénale abaissée à 16 ans pour tous les crimes et délits avec violences",
          "Rétablissement des peines de prison planchers automatiques pour les multirécidivistes",
          "Construction d’établissements pénitentiaires de courte peine sans aménagements possibles"
        ]
      },
      {
        "candidateName": "Marine Le Pen",
        "partyShort": "RN",
        "partyName": "Rassemblement National",
        "color": "#173f70",
        "stance": "Perpétuité réelle incompressible, présomption de légitime défense pour les policiers et expulsion des criminels étrangers.",
        "proposals": [
          "Instauration d’une peine de prison à perpétuité réelle sans aucune libération conditionnelle",
          "Présomption de légitime défense inscrite dans la loi au bénéfice des forces de l’ordre",
          "Expulsion immédiate de tout ressortissant étranger condamné pour crime ou délit grave"
        ]
      }
    ]
  },
  {
    "id": "immigration-asile",
    "name": "Immigration, asile & intégration",
    "icon": "🛂",
    "summary": "Régulation des flux migratoires, droit du sol, régularisation des travailleurs sans-papiers et conventions d’asile.",
    "cleavages": "La gauche défend la régularisation des travailleurs des métiers en tension et le respect du droit d’asile. Le centre durcit les conditions de regroupement familial. La droite et le RN veulent supprimer le droit du sol et instaurer la priorité nationale.",
    "candidates": [
      {
        "candidateName": "Jean-Luc Mélenchon",
        "partyShort": "LFI",
        "partyName": "La France insoumise",
        "color": "#7b5dc8",
        "stance": "Régularisation de tous les travailleurs sans-papiers exerçant en France, garantie totale du droit d’asile et accueil digne.",
        "proposals": [
          "Régularisation globale des travailleurs sans-papiers des secteurs clés (restauration, BTP, nettoyage)",
          "Fermeture définitive des centres de rétention administrative (CRA) jugés indignes",
          "Droit de vote des étrangers aux élections locales après 5 ans de résidence légale"
        ]
      },
      {
        "candidateName": "Raphaël Glucksmann",
        "partyShort": "PP",
        "partyName": "Place publique",
        "color": "#df2160",
        "stance": "Accueil humain et digne des réfugiés, régularisation au cas par cas des travailleurs intégrés, et fermeté envers les réseaux de passeurs.",
        "proposals": [
          "Régularisation transparente des travailleurs étrangers exerçant dans les métiers en tension reconnus",
          "Garantie d’un délai maximal de 6 mois pour l’instruction des demandes d’asile à l’OFPRA",
          "Lutte européenne intransigeante contre les filières de traite humaine en Méditerranée"
        ]
      },
      {
        "candidateName": "Bruno Retailleau",
        "partyShort": "LR",
        "partyName": "Les Républicains",
        "color": "#1d4f91",
        "stance": "Bouclier constitutionnel pour déroger aux traités européens, suppression de l’aide médicale d’État (AME) et fin du droit du sol automatique.",
        "proposals": [
          "Référendum constitutionnel pour inscrire la primauté de la Constitution française sur les traités migratoires",
          "Remplacement de l’Aide médicale d’État (AME) par une aide d’urgence vitale stricte",
          "Suppression de l’acquisition automatique de la nationalité par le droit du sol"
        ]
      },
      {
        "candidateName": "Marine Le Pen",
        "partyShort": "RN",
        "partyName": "Rassemblement National",
        "color": "#173f70",
        "stance": "Priorité nationale pour les aides sociales et logements, expulsion de tous les clandestins et traitement des demandes d’asile à l’étranger.",
        "proposals": [
          "Traitement exclusif des demandes d’asile dans les ambassades et consulats à l’étranger avant toute entrée",
          "Suppression pure et simple du droit du sol : la nationalité ne se transmettra que par le sang",
          "Réservation des prestations de solidarité aux nationaux avec un délai de carence de 5 ans pour les résidents"
        ]
      }
    ]
  },
  {
    "id": "europe-defense",
    "name": "Europe, défense & souveraineté",
    "icon": "🇪🇺",
    "summary": "Pacte de stabilité budgétaire, soutien militaire à l’Ukraine, rôle dans l’OTAN et autonomie stratégique de la France.",
    "cleavages": "Place publique et Renaissance veulent une Europe fédérale avec une armée commune et un soutien militaire massif à l’Ukraine. LFI critique les traités libéraux et refuse l’élargissement de l’OTAN. Le RN et Reconquête prônent la souveraineté des nations et la négociation diplomatique.",
    "candidates": [
      {
        "candidateName": "Raphaël Glucksmann",
        "partyShort": "PP",
        "partyName": "Place publique",
        "color": "#df2160",
        "stance": "Europe puissance démocratique, soutien indéfectible et armé à l’Ukraine face à la Russie de Poutine, et fin de la règle de l’unanimité à 27.",
        "proposals": [
          "Création d’un fonds européen de défense financé par un grand emprunt commun à 27",
          "Livraison de toutes les armes nécessaires à l’Ukraine pour libérer son territoire souverain",
          "Suppression du droit de veto au Conseil européen pour empêcher les blocages autoritaires"
        ]
      },
      {
        "candidateName": "Gabriel Attal",
        "partyShort": "RE",
        "partyName": "Renaissance",
        "color": "#0b2d4f",
        "stance": "Poursuite de l’autonomie stratégique européenne initiée par Emmanuel Macron, budget de défense porté à 3 % du PIB et économie de guerre.",
        "proposals": [
          "Loi de programmation militaire respectée et budget des armées hissé vers 3 % du PIB",
          "Commandement militaire conjoint et achats d’armes 100 % fabriquées en Europe",
          "Coordination renforcée avec l’OTAN tout en bâtissant une défense européenne autonome"
        ]
      },
      {
        "candidateName": "Jean-Luc Mélenchon",
        "partyShort": "LFI",
        "partyName": "La France insoumise",
        "color": "#7b5dc8",
        "stance": "Sortie du commandement militaire intégré de l’OTAN, refus de la dérive militariste et non-alignement diplomatique républicain.",
        "proposals": [
          "Sortie de la France du commandement intégré de l’OTAN pour retrouver une voix indépendante",
          "Dénonciation des traités budgétaires européens d’austérité (pacte de stabilité)",
          "Initiatives diplomatiques pour un cessez-le-feu immédiat et négociations de paix en Ukraine"
        ]
      },
      {
        "candidateName": "Marine Le Pen",
        "partyShort": "RN",
        "partyName": "Rassemblement National",
        "color": "#173f70",
        "stance": "L’Europe des nations contre le fédéralisme bruxellois, refus d’envoyer des troupes ou des missiles longue portée en Ukraine.",
        "proposals": [
          "Remplacement de l’Union européenne par une Alliance européenne des nations libres et souveraines",
          "Refus absolu de toute participation à une armée européenne ou partage de la dissuasion nucléaire",
          "Refus de livraisons d’armes susceptibles de frapper le sol russe pour éviter l’escalade"
        ]
      },
      {
        "candidateName": "Position de l’UDI · aucun candidat annoncé",
        "partyShort": "UDI",
        "partyName": "Union des Démocrates et Indépendants",
        "color": "#0b5fae",
        "stance": "Renforcer la coopération européenne de défense, continuer le soutien à l’Ukraine et investir davantage dans les capacités militaires.",
        "proposals": [
          "Viser 3 % du PIB pour la défense d’ici 2030.",
          "Créer une force européenne de réaction rapide.",
          "Poursuivre l’aide militaire à l’Ukraine; le texte ne chiffre pas d’augmentation."
        ],
        "sourceUrl": "https://parti-udi.fr/actualites/ludi-engagee-dans-la-liste-besoin-deurope",
        "sourceLabel": "UDI · programme européen 2024"
      }
    ]
  }
];

/* ----------------------------------------------------------------------
   BAROMÈTRE DES SONDAGES PRÉSIDENTIELS (ONGLET SONDAGES)
   Données réelles : moyenne agrégée, cinq vagues de 1er tour et onze duels
   de second tour, avec les notices publiées par la Commission des sondages.
   ------------------------------------------------------------------- */
const POLLS = {
  "updatedAt": "24 octobre 2026 à 17:19",
  "sourceLabel": "Moyenne simple des cinq enquêtes présidentielles les plus récentes",
  "sourceUrl": "https://www.elections2027.com/sondages",
  "secondRoundSourceUrl": "https://www.elections2027.com/sondages/second-tour",
  "legalNotice": "Les intentions de vote ne constituent pas une prévision du résultat électoral. Chaque enquête a son propre échantillon, sa méthode et sa marge d’incertitude; consultez la notice de l’institut. La moyenne est descriptive et ne corrige pas les différences de scénarios entre enquêtes.",
  "averageFirstRound": [
    {
      "candidate": "Marine Le Pen",
      "partyShort": "RN",
      "family": "Droite nationale",
      "score": 33.3,
      "trend": -0.7,
      "waves": 5,
      "color": "#173f70",
      "inScope": true
    },
    {
      "candidate": "Jean-Luc Mélenchon",
      "partyShort": "LFI",
      "family": "Gauche",
      "score": 16.2,
      "trend": 0,
      "waves": 5,
      "color": "#7b5dc8",
      "inScope": true
    },
    {
      "candidate": "Édouard Philippe",
      "partyShort": "H",
      "family": "Centre-droit",
      "score": 14.5,
      "trend": 0.5,
      "waves": 5,
      "color": "#111827",
      "inScope": true
    },
    {
      "candidate": "Raphaël Glucksmann",
      "partyShort": "PP",
      "family": "Centre-gauche européen",
      "score": 12.7,
      "trend": 2.1,
      "waves": 5,
      "color": "#df2160",
      "inScope": true,
      "note": "Candidat de Place publique issu de la primaire « Choisir 2027 »."
    },
    {
      "candidate": "David Lisnard",
      "partyShort": "NE",
      "family": "Droite libérale",
      "score": 6.4,
      "trend": 1.9,
      "waves": 4,
      "color": "#0f766e",
      "inScope": true,
      "note": "Candidat de Nouvelle Énergie."
    },
    {
      "candidate": "Bruno Retailleau",
      "partyShort": "LR",
      "family": "Droite",
      "score": 5.9,
      "trend": 0,
      "waves": 5,
      "color": "#1d4f91",
      "inScope": true
    },
    {
      "candidate": "Gabriel Attal",
      "partyShort": "RE",
      "family": "Centre",
      "score": 4,
      "trend": -1.5,
      "waves": 3,
      "color": "#0b2d4f",
      "inScope": true
    },
    {
      "candidate": "Éric Zemmour",
      "partyShort": "R",
      "family": "Droite nationale",
      "score": 3.7,
      "trend": -0.6,
      "waves": 5,
      "color": "#a93f4b",
      "inScope": true
    },
    {
      "candidate": "Marine Tondelier",
      "partyShort": "LE",
      "family": "Écologie",
      "score": 2.1,
      "trend": -0.3,
      "waves": 5,
      "color": "#1e9b58",
      "inScope": true
    },
    {
      "candidate": "Nicolas Dupont-Aignan",
      "partyShort": "DLF",
      "family": "Droite souverainiste",
      "score": 1.6,
      "trend": 0.2,
      "waves": 5,
      "color": "#1683b5",
      "inScope": true
    },
    {
      "candidate": "Fabien Roussel",
      "partyShort": "PCF",
      "family": "Gauche",
      "score": 1.6,
      "trend": -0.2,
      "waves": 5,
      "color": "#b5193f",
      "inScope": true
    },
    {
      "candidate": "Nathalie Arthaud",
      "partyShort": "LO",
      "family": "Extrême gauche",
      "score": 0.7,
      "trend": 0.1,
      "waves": 5,
      "color": "#c81f1f",
      "inScope": true
    },
    {
      "candidate": "Dominique de Villepin",
      "partyShort": "—",
      "family": "Indépendant",
      "score": 1.5,
      "trend": -0.5,
      "waves": 3,
      "color": "#64748b",
      "inScope": false,
      "note": "Candidature indépendante, hors du périmètre des formations comparées sur ce site."
    },
    {
      "candidate": "Karim Bouamrane",
      "partyShort": "PS",
      "family": "Gauche",
      "score": 1,
      "trend": 0,
      "waves": 1,
      "color": "#64748b",
      "inScope": false,
      "note": "Mesure publiée dans un scénario de candidature distinct de la candidature portée par Place publique."
    }
  ],
  "secondRoundDuels": [
    {
      "duel": "Marine Le Pen vs Gabriel Attal",
      "candidateA": {
        "name": "Marine Le Pen",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 56
      },
      "candidateB": {
        "name": "Gabriel Attal",
        "partyShort": "RE",
        "color": "#0b2d4f",
        "score": 44
      },
      "waves": 5,
      "detail": [
        {
          "institute": "IFOP",
          "date": "19 octobre 2026",
          "a": 58,
          "b": 42
        },
        {
          "institute": "Toluna Harris",
          "date": "10 septembre 2026",
          "a": 56,
          "b": 44
        },
        {
          "institute": "OpinionWay",
          "date": "3 septembre 2026",
          "a": 55,
          "b": 45
        },
        {
          "institute": "Elabe",
          "date": "28 août 2026",
          "a": 57,
          "b": 43
        },
        {
          "institute": "IFOP",
          "date": "25 août 2026",
          "a": 54,
          "b": 46
        }
      ]
    },
    {
      "duel": "Marine Le Pen vs Raphaël Glucksmann",
      "candidateA": {
        "name": "Marine Le Pen",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 56.2
      },
      "candidateB": {
        "name": "Raphaël Glucksmann",
        "partyShort": "PP",
        "color": "#df2160",
        "score": 43.8
      },
      "waves": 7,
      "detail": [
        {
          "institute": "IFOP",
          "date": "19 octobre 2026",
          "a": 57,
          "b": 43
        },
        {
          "institute": "Elabe",
          "date": "16 octobre 2026",
          "a": 53.5,
          "b": 46.5
        },
        {
          "institute": "OpinionWay",
          "date": "14 octobre 2026",
          "a": 56,
          "b": 44
        },
        {
          "institute": "Elabe",
          "date": "28 août 2026",
          "a": 57,
          "b": 43
        },
        {
          "institute": "IFOP",
          "date": "25 août 2026",
          "a": 55,
          "b": 45
        },
        {
          "institute": "OpinionWay",
          "date": "22 octobre 2026",
          "a": 56,
          "b": 44,
          "notice": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2352"
        },
        {
          "institute": "Toluna Harris",
          "date": "23 octobre 2026",
          "a": 59,
          "b": 41,
          "notice": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2351"
        }
      ]
    },
    {
      "duel": "Marine Le Pen vs Jean-Luc Mélenchon",
      "candidateA": {
        "name": "Marine Le Pen",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 68.4
      },
      "candidateB": {
        "name": "Jean-Luc Mélenchon",
        "partyShort": "LFI",
        "color": "#7b5dc8",
        "score": 31.6
      },
      "waves": 7,
      "detail": [
        {
          "institute": "IFOP",
          "date": "19 octobre 2026",
          "a": 68,
          "b": 32
        },
        {
          "institute": "Elabe",
          "date": "16 octobre 2026",
          "a": 69,
          "b": 31
        },
        {
          "institute": "OpinionWay",
          "date": "14 octobre 2026",
          "a": 68,
          "b": 32
        },
        {
          "institute": "Toluna Harris",
          "date": "8 octobre 2026",
          "a": 67,
          "b": 33
        },
        {
          "institute": "Odoxa",
          "date": "7 octobre 2026",
          "a": 68,
          "b": 32
        },
        {
          "institute": "OpinionWay",
          "date": "22 octobre 2026",
          "a": 69,
          "b": 31,
          "notice": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2352"
        },
        {
          "institute": "Toluna Harris",
          "date": "23 octobre 2026",
          "a": 70,
          "b": 30,
          "notice": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2351"
        }
      ]
    },
    {
      "duel": "Marine Le Pen vs Édouard Philippe",
      "candidateA": {
        "name": "Marine Le Pen",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 55.2
      },
      "candidateB": {
        "name": "Édouard Philippe",
        "partyShort": "H",
        "color": "#111827",
        "score": 44.8
      },
      "waves": 7,
      "detail": [
        {
          "institute": "IFOP",
          "date": "19 octobre 2026",
          "a": 56,
          "b": 44
        },
        {
          "institute": "Elabe",
          "date": "16 octobre 2026",
          "a": 52.5,
          "b": 47.5
        },
        {
          "institute": "OpinionWay",
          "date": "14 octobre 2026",
          "a": 56,
          "b": 44
        },
        {
          "institute": "Toluna Harris",
          "date": "8 octobre 2026",
          "a": 56,
          "b": 44
        },
        {
          "institute": "Odoxa",
          "date": "7 octobre 2026",
          "a": 53,
          "b": 47
        },
        {
          "institute": "OpinionWay",
          "date": "22 octobre 2026",
          "a": 56,
          "b": 44,
          "notice": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2352"
        },
        {
          "institute": "Toluna Harris",
          "date": "23 octobre 2026",
          "a": 57,
          "b": 43,
          "notice": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2351"
        }
      ]
    },
    {
      "duel": "Édouard Philippe vs Jordan Bardella",
      "candidateA": {
        "name": "Édouard Philippe",
        "partyShort": "H",
        "color": "#111827",
        "score": 50.3
      },
      "candidateB": {
        "name": "Jordan Bardella",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 49.7
      },
      "waves": 5,
      "detail": [
        {
          "institute": "Toluna Harris",
          "date": "27 mai 2026",
          "a": 46,
          "b": 54
        },
        {
          "institute": "Odoxa",
          "date": "21 mai 2026",
          "a": 48,
          "b": 52
        },
        {
          "institute": "Odoxa",
          "date": "24 avril 2026",
          "a": 54,
          "b": 46
        },
        {
          "institute": "Elabe",
          "date": "27 mars 2026",
          "a": 51.5,
          "b": 48.5
        },
        {
          "institute": "Odoxa",
          "date": "26 mars 2026",
          "a": 52,
          "b": 48
        }
      ]
    },
    {
      "duel": "Marine Le Pen vs Bruno Retailleau",
      "candidateA": {
        "name": "Marine Le Pen",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 57
      },
      "candidateB": {
        "name": "Bruno Retailleau",
        "partyShort": "LR",
        "color": "#1d4f91",
        "score": 43
      },
      "waves": 3,
      "detail": [
        {
          "institute": "IFOP",
          "date": "25 août 2026",
          "a": 58,
          "b": 42
        },
        {
          "institute": "Cluster17",
          "date": "24 juillet 2026",
          "a": 57,
          "b": 43
        },
        {
          "institute": "Elabe",
          "date": "10 juillet 2026",
          "a": 56,
          "b": 44
        }
      ]
    },
    {
      "duel": "Jordan Bardella vs Jean-Luc Mélenchon",
      "candidateA": {
        "name": "Jordan Bardella",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 68.8
      },
      "candidateB": {
        "name": "Jean-Luc Mélenchon",
        "partyShort": "LFI",
        "color": "#7b5dc8",
        "score": 31.2
      },
      "waves": 3,
      "detail": [
        {
          "institute": "Toluna Harris",
          "date": "27 mai 2026",
          "a": 68,
          "b": 32
        },
        {
          "institute": "Elabe",
          "date": "27 mars 2026",
          "a": 71.5,
          "b": 28.5
        },
        {
          "institute": "IFOP",
          "date": "18 avril 2025",
          "a": 67,
          "b": 33
        }
      ]
    },
    {
      "duel": "Marine Le Pen vs François Hollande",
      "candidateA": {
        "name": "Marine Le Pen",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 56.5
      },
      "candidateB": {
        "name": "François Hollande",
        "partyShort": "—",
        "color": "#64748b",
        "score": 43.5
      },
      "waves": 2,
      "detail": [
        {
          "institute": "IFOP",
          "date": "19 octobre 2026",
          "a": 59,
          "b": 41
        },
        {
          "institute": "IFOP",
          "date": "25 août 2026",
          "a": 54,
          "b": 46
        }
      ]
    },
    {
      "duel": "Jordan Bardella vs Gabriel Attal",
      "candidateA": {
        "name": "Jordan Bardella",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 54.5
      },
      "candidateB": {
        "name": "Gabriel Attal",
        "partyShort": "RE",
        "color": "#0b2d4f",
        "score": 45.5
      },
      "waves": 2,
      "detail": [
        {
          "institute": "Toluna Harris",
          "date": "27 mai 2026",
          "a": 57,
          "b": 43
        },
        {
          "institute": "IFOP",
          "date": "18 avril 2025",
          "a": 52,
          "b": 48
        }
      ]
    },
    {
      "duel": "Jordan Bardella vs Bruno Retailleau",
      "candidateA": {
        "name": "Jordan Bardella",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 55.5
      },
      "candidateB": {
        "name": "Bruno Retailleau",
        "partyShort": "LR",
        "color": "#1d4f91",
        "score": 44.5
      },
      "waves": 2,
      "detail": [
        {
          "institute": "Elabe",
          "date": "27 mars 2026",
          "a": 58,
          "b": 42
        },
        {
          "institute": "IFOP",
          "date": "18 avril 2025",
          "a": 53,
          "b": 47
        }
      ]
    },
    {
      "duel": "Jordan Bardella vs Raphaël Glucksmann",
      "candidateA": {
        "name": "Jordan Bardella",
        "partyShort": "RN",
        "color": "#173f70",
        "score": 58.5
      },
      "candidateB": {
        "name": "Raphaël Glucksmann",
        "partyShort": "PP",
        "color": "#df2160",
        "score": 41.5
      },
      "waves": 1,
      "detail": [
        {
          "institute": "Elabe",
          "date": "27 mars 2026",
          "a": 58.5,
          "b": 41.5
        }
      ]
    }
  ],
  "waves": [
    {
      "institute": "Toluna Harris Interactive",
      "publishedAt": "23 octobre 2026",
      "terrain": "19 octobre 2026 → 21 octobre 2026",
      "sampleSize": 2094,
      "sampleNote": "2 500 adultes interrogés au total; 2 094 inscrits sur les listes électorales.",
      "sponsor": "M6 et RTL",
      "sponsorNote": "Les intentions de vote sont une photographie de l’opinion, pas une prévision.",
      "scenario": "1er tour · hypothèse Édouard Philippe, avec D. de Villepin et D. Lisnard",
      "notice": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2351",
      "results": [
        {
          "candidate": "Nathalie Arthaud",
          "partyShort": "LO",
          "score": 1
        },
        {
          "candidate": "Jean-Luc Mélenchon",
          "partyShort": "LFI",
          "score": 17
        },
        {
          "candidate": "Fabien Roussel",
          "partyShort": "PCF",
          "score": 2
        },
        {
          "candidate": "Marine Tondelier",
          "partyShort": "LE",
          "score": 2
        },
        {
          "candidate": "Raphaël Glucksmann",
          "partyShort": "PP",
          "score": 12
        },
        {
          "candidate": "Édouard Philippe",
          "partyShort": "H",
          "score": 15
        },
        {
          "candidate": "Dominique de Villepin",
          "score": 1
        },
        {
          "candidate": "David Lisnard",
          "partyShort": "NE",
          "score": 7
        },
        {
          "candidate": "Bruno Retailleau",
          "partyShort": "LR",
          "score": 4
        },
        {
          "candidate": "Nicolas Dupont-Aignan",
          "partyShort": "DLF",
          "score": 1
        },
        {
          "candidate": "Marine Le Pen",
          "partyShort": "RN",
          "score": 33
        },
        {
          "candidate": "Éric Zemmour",
          "partyShort": "R",
          "score": 5
        }
      ]
    },
    {
      "institute": "OpinionWay",
      "publishedAt": "22 octobre 2026",
      "terrain": "21 octobre 2026 → 22 octobre 2026",
      "sampleSize": 973,
      "sampleNote": "1 033 adultes interrogés au total; 731 inscrits certains d’aller voter et 680 exprimant une intention.",
      "sponsor": "CNEWS",
      "scenario": "1er tour · hypothèse publiée dans la notice",
      "notice": "https://www.commission-des-sondages.fr/notices/medias/fichiers/add/2352",
      "results": [
        {
          "candidate": "Marine Le Pen",
          "partyShort": "RN",
          "score": 36
        },
        {
          "candidate": "Jean-Luc Mélenchon",
          "partyShort": "LFI",
          "score": 16
        },
        {
          "candidate": "Raphaël Glucksmann",
          "partyShort": "PP",
          "score": 13
        },
        {
          "candidate": "Édouard Philippe",
          "partyShort": "H",
          "score": 12
        }
      ]
    },
    {
      "id": "ifop-2026-10-19",
      "institute": "IFOP",
      "sponsor": null,
      "sponsorNote": "Commanditaire non précisé dans la notice publiée",
      "publishedAt": "19 octobre 2026",
      "terrain": "17 octobre 2026 → 19 octobre 2026",
      "sampleSize": 1928,
      "scenario": "1er tour",
      "notice": "https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10327-pres-barometre-election-v7-ifop-20-octobre.pdf",
      "results": [
        {
          "candidate": "Marine Le Pen",
          "partyShort": "RN",
          "score": 34
        },
        {
          "candidate": "Jean-Luc Mélenchon",
          "partyShort": "LFI",
          "score": 15
        },
        {
          "candidate": "Raphaël Glucksmann",
          "partyShort": "PP",
          "score": 12
        },
        {
          "candidate": "Édouard Philippe",
          "partyShort": "H",
          "score": 12
        },
        {
          "candidate": "David Lisnard",
          "partyShort": "NE",
          "score": 5.5
        },
        {
          "candidate": "Bruno Retailleau",
          "partyShort": "LR",
          "score": 5.5
        },
        {
          "candidate": "Gabriel Attal",
          "partyShort": "RE",
          "score": 4
        },
        {
          "candidate": "Éric Zemmour",
          "partyShort": "R",
          "score": 3
        }
      ]
    },
    {
      "id": "elabe-2026-10-16",
      "institute": "Elabe",
      "sponsor": null,
      "sponsorNote": "Commanditaire non précisé dans la notice publiée",
      "publishedAt": "16 octobre 2026",
      "terrain": "14 octobre 2026 → 16 octobre 2026",
      "sampleSize": 1701,
      "scenario": "1er tour",
      "notice": "https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10324-pres-iv-elabe-17-octobre.pdf",
      "results": [
        {
          "candidate": "Marine Le Pen",
          "partyShort": "RN",
          "score": 32.5
        },
        {
          "candidate": "Édouard Philippe",
          "partyShort": "H",
          "score": 16.5
        },
        {
          "candidate": "Raphaël Glucksmann",
          "partyShort": "PP",
          "score": 15.5
        },
        {
          "candidate": "Jean-Luc Mélenchon",
          "partyShort": "LFI",
          "score": 15
        },
        {
          "candidate": "Bruno Retailleau",
          "partyShort": "LR",
          "score": 7
        },
        {
          "candidate": "Éric Zemmour",
          "partyShort": "R",
          "score": 3.5
        },
        {
          "candidate": "Marine Tondelier",
          "partyShort": "LE",
          "score": 3
        },
        {
          "candidate": "Nicolas Dupont-Aignan",
          "partyShort": "DLF",
          "score": 2.5
        }
      ]
    },
    {
      "id": "cluster17-2026-10-15",
      "institute": "Cluster17",
      "sponsor": "Le Point",
      "sponsorNote": "Commanditaire indiqué dans la notice publiée",
      "publishedAt": "15 octobre 2026",
      "terrain": "14 octobre 2026 → 15 octobre 2026",
      "sampleSize": 1263,
      "scenario": "1er tour",
      "notice": "https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10325-pres-focus-droite-et-centre-cluster17-le-point-18-octobre.pdf",
      "results": [
        {
          "candidate": "Marine Le Pen",
          "partyShort": "RN",
          "score": 31
        },
        {
          "candidate": "Jean-Luc Mélenchon",
          "partyShort": "LFI",
          "score": 18
        },
        {
          "candidate": "Édouard Philippe",
          "partyShort": "H",
          "score": 17
        },
        {
          "candidate": "Raphaël Glucksmann",
          "partyShort": "PP",
          "score": 11
        },
        {
          "candidate": "David Lisnard",
          "partyShort": "NE",
          "score": 7
        },
        {
          "candidate": "Bruno Retailleau",
          "partyShort": "LR",
          "score": 7
        },
        {
          "candidate": "Éric Zemmour",
          "partyShort": "R",
          "score": 3
        },
        {
          "candidate": "Marine Tondelier",
          "partyShort": "LE",
          "score": 2
        }
      ]
    }
  ],
  "aggregationNote": "Moyenne descriptive par candidature des cinq vagues les plus récentes recensées. Les listes et scénarios diffèrent d’une enquête à l’autre; les scores ne sont ni normalisés entre scénarios ni une prévision."
};

/* ----------------------------------------------------------------------
   CANDIDATURES DÉCLARÉES POUR LA PRÉSIDENTIELLE 2027
   Liste de référence : les 28 candidatures déclarées suivies par
   l’agrégateur Élections 2027 (page mise à jour le 21 octobre 2026).
   Chaque ligne indique le parti, la date de déclaration, le score de la
   moyenne agrégée quand la candidature y est testée, et la raison pour
   laquelle elle entre — ou non — dans le périmètre de comparaison.
   ------------------------------------------------------------------- */
const CANDIDATURES = [
  { name:'Bernard Cazeneuve', party:'La Convention', partyId:null, declaredOn:'2026-07-16',
    declarationNote:'Se déclare candidat dans un entretien au Parisien ; décline la primaire socialiste, sans officialisation formelle.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Aucune formation de ce site ne porte cette candidature : les positions ne sont pas codées.',
    url:'https://www.elections2027.com/candidats/bernard-cazeneuve' },
  { name:'Francis Lalanne', party:'Indépendant', partyId:null, declaredOn:'2026-08-19',
    declarationNote:'Lance sa campagne ; condamné début octobre à six mois avec sursis pour abandon de famille, il fait appel.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Candidature indépendante : aucune formation ne porte ce programme, rien à comparer.',
    url:'https://www.elections2027.com/candidats/francis-lalanne' },
  { name:'Delphine Batho', party:'Génération écologie', partyId:null, declaredOn:null,
    declarationNote:'Annoncée dans Le Nouvel Obs.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Génération écologie n’est pas une des formations comparées ici : positions non codées.',
    url:'https://www.elections2027.com/candidats/delphine-batho' },
  { name:'Marine Tondelier', party:'Les Écologistes', partyId:'ecolo', declaredOn:'2026-09-21',
    declarationNote:'Désignée candidate à la présidentielle par Les Écologistes. Un vote militant du 13 décembre 2026 tranchera entre une candidature seule et une union à gauche.',
    pollScore:2.3, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées.',
    url:'https://www.elections2027.com/candidats/marine-tondelier' },
  { name:'Fabien Roussel', party:'Parti communiste français', partyId:'pcf', declaredOn:'2026-09-06',
    declarationNote:'Désigné candidat par les adhérents du PCF lors d’une consultation interne (72,06 %).',
    pollScore:1.6, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées.',
    url:'https://www.elections2027.com/candidats/fabien-roussel' },
  { name:'Mira Markovic', party:'Parti animaliste', partyId:null, declaredOn:'2026-10-02',
    declarationNote:'Annonce sa candidature pour le Parti animaliste (listée par Wikipédia, non recoupée par la presse nationale).',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Candidature très minoritaire, sans programme public documenté : hors périmètre.',
    url:'https://www.elections2027.com/candidats/mira-markovic' },
  { name:'Gilles Platret', party:'Divers droite', partyId:null, declaredOn:'2026-10-08',
    declarationNote:'Officialise sa candidature à l’Élysée sur une ligne souverainiste.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Candidature individuelle sans formation rattachée : hors périmètre.',
    url:'https://www.elections2027.com/candidats/gilles-platret' },
  { name:'Selma Labib', party:'NPA – Révolutionnaires', partyId:null, declaredOn:'2026-06-17',
    declarationNote:'Candidature annoncée par son parti.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Le NPA – Révolutionnaires n’est pas une des formations comparées ici : positions non codées.',
    url:'https://www.elections2027.com/candidats/selma-labib' },
  { name:'Florian Philippot', party:'Les Patriotes', partyId:null, declaredOn:'2026-05-09',
    declarationNote:'Annonce sa candidature sur France 2 ; il se retirerait si Philippe de Villiers se présentait.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Les Patriotes ne sont pas une des formations comparées ici : positions non codées.',
    url:'https://www.elections2027.com/candidats/florian-philippot' },
  { name:'Natacha Polony', party:'Non précisé', partyId:null, declaredOn:'2026-10-14',
    declarationNote:'Officialise sa candidature pour 2027 et dévoile son cap.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Candidature individuelle, sans parti ni positions documentées : hors périmètre.',
    url:'https://www.elections2027.com/candidats/natacha-polony' },
  { name:'Raphaël Glucksmann', party:'Place publique', partyId:'pp', declaredOn:'2026-08-23',
    declarationNote:'Annonce sa candidature à 20 h sur TF1 le 23 août 2026 ; remporte dès le premier tour la primaire « Choisir 2027 » (PS, Place publique, GRS) les 9 et 10 octobre 2026, résultat proclamé le 11 octobre avec 66 % des suffrages.',
    pollScore:12.6, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : candidat de Place publique, les 27 positions de départage sont codées.',
    url:'https://www.elections2027.com/candidats/raphael-glucksmann' },
  { name:'Juan Branco', party:'Indépendant', partyId:null, declaredOn:'2025-12-19',
    declarationNote:'Annonce sa candidature sur Sud Radio ; les 500 parrainages ne sont pas acquis.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Candidature indépendante : aucune formation ne porte ce programme, rien à comparer.',
    url:'https://www.elections2027.com/candidats/juan-branco' },
  { name:'Antoine Mikolajczak', party:'Équinoxe', partyId:null, declaredOn:'2026-06-27',
    declarationNote:'Désigné par son parti Équinoxe (listé par Wikipédia, non recoupé par la presse nationale).',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Équinoxe n’est pas une des formations comparées ici : positions non codées.',
    url:'https://www.elections2027.com/candidats/antoine-mikolajczak' },
  { name:'Éric Zemmour', party:'Reconquête', partyId:'reconquete', declaredOn:'2026-09-17',
    declarationNote:'Officialise sa candidature sur BFMTV.',
    pollScore:3.5, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées.',
    url:'https://www.elections2027.com/candidats/eric-zemmour' },
  { name:'Gabriel Attal', party:'Renaissance', partyId:'renaissance', declaredOn:'2026-05-22',
    declarationNote:'Annoncé à Mur-de-Barrez (Aveyron).',
    pollScore:4.7, pollWaves:3, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées.',
    url:'https://www.elections2027.com/candidats/gabriel-attal' },
  { name:'Nicolas Dupont-Aignan', party:'Debout la France', partyId:'dlf', declaredOn:'2026-09-19',
    declarationNote:'Officialise sa candidature (annoncée dans son principe dès mars 2025).',
    pollScore:1.6, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées (une position « non documentée »).',
    url:'https://www.elections2027.com/candidats/nicolas-dupont-aignan' },
  { name:'Clara Egger', party:'Solution démocratique', partyId:null, declaredOn:null,
    declarationNote:'Communiqué de Solution démocratique.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Solution démocratique n’est pas une des formations comparées ici : positions non codées.',
    url:'https://www.elections2027.com/candidats/clara-egger' },
  { name:'Olivier Becht', party:'Ensemble pour la République', partyId:null, declaredOn:'2026-09-24',
    declarationNote:'Officialise sa candidature à l’élection présidentielle de 2027.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Ensemble pour la République n’est pas une des formations comparées ici : positions non codées.',
    url:'https://www.elections2027.com/candidats/olivier-becht' },
  { name:'Bruno Retailleau', party:'Les Républicains', partyId:'lr', declaredOn:'2026-02-12',
    declarationNote:'Annonce sa candidature le 12 février 2026 ; désigné par les adhérents LR en avril 2026 (73,8 %).',
    pollScore:6.1, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées.',
    url:'https://www.elections2027.com/candidats/bruno-retailleau' },
  { name:'David Lisnard', party:'Nouvelle Énergie', partyId:'ne', declaredOn:'2026-03-31',
    declarationNote:'Annoncé au 20 h sur France 2 le 31 mars 2026 ; quitte Les Républicains le même jour.',
    pollScore:5.6, pollWaves:4, inScope:true,
    scopeReason:'Formation comparée sur les 6 axes, mais sans positions de départage codées : la formation est affichée sans indice de précision.',
    url:'https://www.elections2027.com/candidats/david-lisnard' },
  { name:'François Asselineau', party:'Union populaire républicaine', partyId:'upr', declaredOn:null,
    declarationNote:'Annoncé à Paris.',
    pollScore:null, pollWaves:0, inScope:true,
    scopeReason:'Formation comparée mais très peu documentée : 3 positions de départage sur 27, la comparaison précise est impossible.',
    url:'https://www.elections2027.com/candidats/francois-asselineau' },
  { name:'Anasse Kazib', party:'Révolution permanente', partyId:null, declaredOn:'2026-06-01',
    declarationNote:'Clip de campagne.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Révolution permanente n’est pas une des formations comparées ici : positions non codées.',
    url:'https://www.elections2027.com/candidats/anasse-kazib' },
  { name:'Édouard Philippe', party:'Horizons', partyId:'horizons', declaredOn:'2024-09-03',
    declarationNote:'Annoncé dans Le Point.',
    pollScore:14.1, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées (une position « non documentée »).',
    url:'https://www.elections2027.com/candidats/edouard-philippe' },
  { name:'François Ruffin', party:'Debout', partyId:null, declaredOn:null,
    declarationNote:'Candidat sous condition : il se présentera s’il n’y a pas de primaire de la gauche.',
    pollScore:null, pollWaves:0, inScope:false,
    scopeReason:'Candidature conditionnelle et sans positions documentées : hors périmètre.',
    url:'https://www.elections2027.com/candidats/francois-ruffin' },
  { name:'Jean-Luc Mélenchon', party:'La France insoumise', partyId:'lfi', declaredOn:'2026-05-03',
    declarationNote:'Annoncé à 20 h sur TF1 le 3 mai 2026 ; l’intergroupe de la France insoumise le propose ensuite à une investiture populaire de 150 000 personnes, étape interne qui ne constitue pas la liste officielle des candidats.',
    pollScore:15.8, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées.',
    url:'https://www.elections2027.com/candidats/jean-luc-melenchon' },
  { name:'Nathalie Arthaud', party:'Lutte ouvrière', partyId:'lo', declaredOn:null,
    declarationNote:'Annoncé en conférence de presse.',
    pollScore:0.5, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée mais peu documentée : 13 positions de départage sur 27, la comparaison précise est impossible.',
    url:'https://www.elections2027.com/candidats/nathalie-arthaud' },
  { name:'Karim Bouamrane', party:'Parti socialiste', partyId:null, declaredOn:'2026-06-09',
    declarationNote:'Annoncé sur France Inter le 9 juin 2026. Le Parti socialiste a ensuite lancé avec Place publique et la GRS la primaire « Choisir 2027 » ; c’est Raphaël Glucksmann qui en est issu, le 11 octobre 2026 (66 %). Le Parti socialiste n’est donc pas une formation comparée sur ce site, et Glucksmann n’y figure qu’une seule fois, sous Place publique.',
    pollScore:1.0, pollWaves:1, inScope:false,
    scopeReason:'Hors périmètre de comparaison : le Parti socialiste n’est pas une formation retenue ici, et la candidature issue de la primaire « Choisir 2027 » est portée par Place publique.',
    url:'https://www.elections2027.com/candidats/karim-bouamrane' },
  { name:'Marine Le Pen', party:'Rassemblement national', partyId:'rn', declaredOn:'2026-07-07',
    declarationNote:'Annoncée à 20 h sur TF1 le 7 juillet 2026.',
    pollScore:32.9, pollWaves:5, inScope:true,
    scopeReason:'Formation comparée : les 27 positions de départage sont codées.',
    url:'https://www.elections2027.com/candidats/marine-le-pen' },
  { name:'Dominique de Villepin', party:'Indépendant (« La France humaniste »)', partyId:null, declaredOn:null,
    declarationNote:'Candidature indépendante : il ne figure pas dans la liste des 28 déclarations reprise par l’agrégateur, mais il est mesuré dans trois vagues d’enquêtes à 1,8 %. L’absence de déclaration formelle comme l’absence de positions documentées l’excluent de toute comparaison.',
    pollScore:1.8, pollWaves:3, inScope:false,
    scopeReason:'Mesuré par les instituts mais sans déclaration reprise par l’agrégateur : aucune formation de ce site ne porte cette candidature, aucune position n’est codée.',
    url:'https://www.elections2027.com/sondages' }
];

/* ----------------------------------------------------------------------
   CALENDRIER DE LA CAMPAGNE 2027
   Jalons vérifiés ; la colonne `official` distingue les dates fixées par
   le Conseil constitutionnel ou le Conseil des ministres des repères
   indicatifs advanced par la presse.
   ------------------------------------------------------------------- */
const CALENDAR = [
  { date:'2026-10-09', dateLabel:'9 et 10 octobre 2026', official:true, kind:'Primaire',
    label:'Premier tour de la primaire « Choisir 2027 » (Parti socialiste, Place publique, GRS)',
    detail:'VoteScrutin électronique de 8 h à 20 h. Raphaël Glucksmann l’emporte dès le premier tour avec 66 % des suffrages, devant Olivier Faure, Ségolène Royal, Emmanuel Maurel et Jérôme Guedj : aucun second tour n’est organisé.',
    sourceUrl:'https://www.elections2027.com/guides/primaire-gauche-2027' },
  { date:'2026-10-11', dateLabel:'11 octobre 2026', official:true, kind:'Primaire',
    label:'Résultat proclamé de la primaire « Choisir 2027 »',
    detail:'Raphaël Glucksmann est désigné candidat du pôle social-démocrate. Il est le candidat de Place publique sur ce site : aucune autre formation ne le présente.',
    sourceUrl:'https://lcp.fr/actualites/primaire-socialiste-vainqueur-des-le-1er-tour-raphael-glucksmann-sera-le-candidat-de-la' },
  { date:'2026-12-13', dateLabel:'13 décembre 2026', official:false, kind:'Campagne',
    label:'Vote des Écologistes sur leur stratégie présidentielle',
    detail:'Les Écologistes tranchent entre la candidature de Marine Tondelier et une union à gauche. Tant que ce vote n’a pas eu lieu, la stratégie du parti reste ouverte.',
    sourceUrl:'https://www.elections2027.com/calendrier' },
  { date:'2027-02-01', dateLabel:'1er février 2027', official:false, kind:'Électoral',
    label:'Ouverture indicative du recueil des parrainages',
    detail:'Repère usuel de début de la collecte des 500 parrainages ; la date exacte est fixée par le Conseil constitutionnel.',
    sourceUrl:'https://www.elections2027.com/calendrier' },
  { date:'2027-03-01', dateLabel:'1er mars 2027', official:false, kind:'Électoral',
    label:'Clôture indicative du recueil des parrainages',
    detail:'Repère usuel de fin de collecte, à confirmer par le Conseil constitutionnel.',
    sourceUrl:'https://www.elections2027.com/calendrier' },
  { date:'2027-03-10', dateLabel:'10 mars 2027', official:false, kind:'Électoral',
    label:'Publication indicative de la liste officielle des candidats',
    detail:'Liste des candidatures validées : la date exacte est fixée par le Conseil constitutionnel. Aucune date limite légale n’est donc avancée sur ce site.',
    sourceUrl:'https://www.elections2027.com/calendrier' },
  { date:'2027-03-12', dateLabel:'12 mars 2027', official:true, kind:'Électoral',
    label:'Date limite d’inscription sur les listes électorales et de dépôt des parrainages',
    detail:'Calculée d’après la loi : sixième vendredi avant le premier tour.',
    sourceUrl:'https://www.elections2027.com/calendrier' },
  { date:'2027-03-28', dateLabel:'28 mars 2027', official:false, kind:'Campagne',
    label:'Ouverture indicative de la campagne officielle',
    detail:'Début typique de la campagne audiovisuelle réglementée avant le premier tour.',
    sourceUrl:'https://www.elections2027.com/calendrier' },
  { date:'2027-04-18', dateLabel:'18 avril 2027', official:true, kind:'Électoral',
    label:'Premier tour de l’élection présidentielle',
    detail:'Date fixée par le Conseil des ministres du 1er juillet 2026. Le scrutin a lieu le samedi 17 avril dans plusieurs territoires d’outre-mer.',
    sourceUrl:'https://www.elections2027.com/calendrier' },
  { date:'2027-05-02', dateLabel:'2 mai 2027', official:true, kind:'Électoral',
    label:'Second tour de l’élection présidentielle',
    detail:'Le scrutin a lieu le samedi 1er mai dans plusieurs territoires d’outre-mer.',
    sourceUrl:'https://www.elections2027.com/calendrier' },
  { date:'2027-05-13', dateLabel:'13 mai 2027', official:true, kind:'Électoral',
    label:'Fin du mandat d’Emmanuel Macron',
    detail:'Le président de la République en exercice quitte ses fonctions.',
    sourceUrl:'https://www.elections2027.com/calendrier' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DIMENSIONS, DIM_KEYS, QUESTIONS, DEPARTAGE, PARTIES, SOURCES, THEMES, POLLS, CANDIDATURES, CALENDAR };
} else if (typeof window !== 'undefined') {
  window.DIMENSIONS = DIMENSIONS; window.DIM_KEYS = DIM_KEYS;
  window.QUESTIONS = QUESTIONS; window.DEPARTAGE = DEPARTAGE;
  window.PARTIES = PARTIES; window.SOURCES = SOURCES;
  window.THEMES = THEMES; window.POLLS = POLLS;
  window.CANDIDATURES = CANDIDATURES; window.CALENDAR = CALENDAR;
}
