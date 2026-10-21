/* ============================================================================
   VOTEZ BIEN ! — themes-data.js
   Données complètes des thèmes, enjeux et points de vue des candidats (2027)
   ========================================================================= */

const THEMES_DATA = [
  {
    id: 'eco',
    name: 'Économie, redistribution & fiscalité',
    icon: '💼',
    tagline: 'Impôts, partage des richesses, retraites et rôle de l’État',
    enjeu: 'Le quinquennat 2027-2032 s’ouvre dans un contexte de dette publique record (plus de 3 200 milliards d’euros) et d’exigence de réindustrialisation décarbonée. Le grand clivage oppose la relance par l’investissement public, la justice fiscale et la redistribution des superprofits d’un côté, au rétablissement de la compétitivité par la baisse des dépenses publiques, l’allègement des cotisations et la flexibilité du travail de l’autre.',
    questionsCles: [
      'Faut-il rétablir un impôt de solidarité sur la fortune (ISF) ou adopter la taxe Zucman de 2 % sur les très hauts patrimoines ?',
      'Faut-il revenir sur la réforme des retraites de 2023 (retour à 60 ou 62 ans) ou reculer encore l’âge légal ?',
      'L’État doit-il nationaliser les secteurs stratégiques (énergie, autoroutes) ou confier davantage d’activités au privé ?'
    ],
    candidates: [
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'Rupture & redistribution radicale',
        badge: 'Planification écologique & fiscale',
        proposals: [
          'Rétablissement de l’ISF avec barème progressif jusqu’à 3 % et taxation des superprofits.',
          'Retraite à 60 ans à taux plein après 40 annuités de cotisation.',
          'Nationalisation complète d’EDF, d’Engie et reprise en main publique des concessions autoroutières.',
          'Blocage des marges de la grande distribution sur les biens essentiels.'
        ],
        quote: '« La richesse de la France n’a jamais été aussi immense : c’est son partage qui est scandaleusement faussé. »'
      },
      {
        partyId: 'pp',
        candidate: 'Raphaël Glucksmann',
        party: 'Place publique / PS',
        color: '#6c53a4',
        orientation: 'Social-démocratie & justice fiscale',
        badge: 'Candidature commune de la gauche démocrate',
        proposals: [
          'Soutien à la « taxe Zucman » : impôt minimal de 2 % sur les patrimoines supérieurs à 100 millions d’euros.',
          'Abrogation du recul de l’âge de départ à 64 ans et négociation d’un nouvel équilibre axé sur la pénibilité.',
          'Grand plan d’emprunt et d’investissement ciblé dans les filières industrielles vertes d’avenir.',
          'Conditionnement strict de toutes les aides publiques aux entreprises à des engagements sociaux et environnementaux.'
        ],
        quote: '« La justice fiscale n’est pas une punition, c’est le socle sans lequel aucune transition écologique n’est acceptée. »'
      },
      {
        partyId: 'renaissance',
        candidate: 'Gabriel Attal',
        party: 'Renaissance',
        color: '#0b2d4f',
        orientation: 'Politique de l’offre & valorisation du travail',
        badge: 'Continuité réformatrice pro-entreprises',
        proposals: [
          'Maintien de la réforme des retraites à 64 ans pour préserver l’équilibre financier du système par répartition.',
          'Désmicardisation : refonte des allègements de charges pour inciter les employeurs à augmenter les salaires au-delà du SMIC.',
          'Refus de toute hausse générale des impôts ou de retour de l’ISF, sanctuarisation de la « flat tax » sur le capital.',
          'Poursuite des simplifications administratives et soutien aux start-ups et technologies de rupture.'
        ],
        quote: '« Nous devons faire en sorte que le travail paie toujours plus et mieux que l’inactivité. »'
      },
      {
        partyId: 'horizons',
        candidate: 'Édouard Philippe',
        party: 'Horizons',
        color: '#111827',
        orientation: 'Rigueur budgétaire & vision à long terme',
        badge: 'Réformes structurelles & effort collectif',
        proposals: [
          'Trajectoire stricte de réduction des dépenses publiques pour ramener le déficit sous 3 % d’ici 2029.',
          'Recul progressif de l’âge de départ à la retraite si l’évolution démographique et financière l’impose.',
          'Augmentation de la durée globale du travail dans la vie pour financer le modèle social et l’autonomie.',
          'Poursuite de la baisse des impôts de production pesant sur l’industrie française.'
        ],
        quote: '« La France ne peut pas vivre indéfiniment à crédit en reportant la charge de son modèle sur les générations futures. »'
      },
      {
        partyId: 'lr',
        candidate: 'Bruno Retailleau',
        party: 'LR',
        color: '#1d4f91',
        orientation: 'Libéralisme économique & réduction de l’État',
        badge: 'Choc de compétitivité & coupe dans la dépense',
        proposals: [
          'Plan d’économies massif de 50 milliards d’euros sur les dépenses de fonctionnement de l’État.',
          'Repousser l’âge de départ à la retraite à 65 ans et supprimer les régimes spéciaux résiduels.',
          'Suppression quasi-totale des droits de succession en ligne directe jusqu’à 1 million d’euros par enfant.',
          'Suppression des 35 heures par accord libre dans chaque entreprise.'
        ],
        quote: '« Moins de bureaucratie, moins de dépenses publiques, plus de liberté pour ceux qui créent la valeur. »'
      },
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Protectionnisme & priorité nationale',
        badge: 'Souverainisme économique populaire',
        proposals: [
          'Remplacement de l’impôt sur la fortune immobilière (IFI) par un impôt sur la fortune financière (IFF) pour encourager l’enracinement.',
          'Retraite à 60 ans avec 40 annuités pour les personnes ayant commencé à travailler avant 20 ans.',
          'Exonération totale d’impôt sur le revenu pour tous les jeunes actifs jusqu’à 30 ans.',
          'Nationalisation des concessions autoroutières pour baisser les tarifs des péages de 15 %.'
        ],
        quote: '« Notre économie doit être mise au service exclusif des travailleurs français et des familles de notre pays. »'
      },
      {
        partyId: 'reconquete',
        candidate: 'Éric Zemmour',
        party: 'Reconquête',
        color: '#a93f4b',
        orientation: 'Ultra-libéralisme national & baisse des charges',
        badge: 'Capitalisme national & dérégulation',
        proposals: [
          'Suppression de l’IFI, de la taxe foncière sur les résidences principales et des droits de succession.',
          'Fin des aides sociales accordées aux personnes étrangères pour financer des baisses massives de cotisations.',
          'Suppression du salaire minimum légal uniforme au profit d’accords territoriaux et sectoriels.',
          'Liberté totale du temps de travail et abrogation définitive des 35 heures.'
        ],
        quote: '« Il faut libérer nos entreprises du carcan fiscal tout en réservant la solidarité nationale à nos concitoyens. »'
      }
    ]
  },
  {
    id: 'pouvoir-achat',
    name: 'Pouvoir d’achat, salaires & inflation',
    icon: '💶',
    tagline: 'Niveau des salaires, blocage des prix, TVA et factures d’énergie',
    enjeu: 'Préoccupation numéro 1 des Français dans tous les baromètres d’opinion, la question du pouvoir d’achat oppose deux philosophies : l’augmentation directe des salaires nets et l’intervention sur les prix (blocage, baisse de la TVA) face à la modération fiscale et l’incitation au travail supplémentaire.',
    questionsCles: [
      'Faut-il augmenter le SMIC par décret ou baisser les cotisations salariales pour gonfler le net ?',
      'L’État doit-il abaisser la TVA sur l’énergie et les carburants à 5,5 % ?',
      'Faut-il indexer automatiquement tous les salaires sur l’inflation comme en Belgique ?'
    ],
    candidates: [
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'Hausse directe & blocage légal',
        badge: 'SMIC à 1 600 € net & échelle mobile',
        proposals: [
          'Augmentation immédiate du SMIC à 1 600 euros net par décret.',
          'Rétablissement de l’échelle mobile des salaires : indexation automatique de toutes les grilles salariales sur les prix.',
          'Blocage des prix des denrées alimentaires de première nécessité, du carburant, de l’électricité et du gaz.',
          'Garantie d’autonomie de 1 100 euros par mois pour tous les étudiants et lycéens professionnels.'
        ],
        quote: '« Personne ne doit être contraint de choisir entre se chauffer et manger dans la sixième puissance mondiale. »'
      },
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Baisse de la TVA & exonérations',
        badge: 'Baisse de la TVA énergétique à 5,5 %',
        proposals: [
          'Baisse permanente de la TVA de 20 % à 5,5 % sur tous les produits énergétiques (essence, fioul, gaz, électricité).',
          'Hausse de 10 % des salaires jusqu’à 3 fois le SMIC, entièrement exonérée de cotisations patronales pour l’employeur.',
          'Suppression de la redevance incitative et arrêt des taxes punitives sur l’automobile.',
          'Défiscalisation intégrale des heures supplémentaires sans plafond.'
        ],
        quote: '« Rendre immédiatement du pouvoir d’achat aux Français en réduisant le racket fiscal de l’État sur les factures d’énergie. »'
      },
      {
        partyId: 'pp',
        candidate: 'Raphaël Glucksmann',
        party: 'Place publique / PS',
        color: '#6c53a4',
        orientation: 'Conférence sociale & chèques ciblés',
        badge: 'Redistribution sociale écologique',
        proposals: [
          'Organisation d’une conférence nationale sur les salaires pour contraindre les branches à revaloriser les grilles sous le SMIC.',
          'Taxation exceptionnelle des superprofits des géants de l’énergie pour financer un chèque vert universel aux ménages modestes.',
          'Tarification progressive de l’eau et de l’électricité : premiers mètres cubes indispensables gratuits ou à coût modique.',
          'Plafonnement des frais bancaires et des commissions sur les paiements essentiels.'
        ],
        quote: '« La dignité passe par un travail qui permet de vivre debout, pas par des primes aléatoires laissées au bon vouloir du patron. »'
      },
      {
        partyId: 'renaissance',
        candidate: 'Gabriel Attal',
        party: 'Renaissance',
        color: '#0b2d4f',
        orientation: 'Désmicardisation & primes de partage',
        badge: 'Augmenter le net sans alourdir le brut',
        proposals: [
          'Refonte de la fiscalité sociale pour supprimer la « trappe à bas salaires » et encourager les augmentations au-dessus du SMIC.',
          'Pérennisation et renforcement de la prime de partage de la valeur (dite prime Macron) défiscalisée.',
          'Maintien du bouclier tarifaire sur l’électricité en cas de crise et régulation des prix d’EDF.',
          'Développement de la semaine de 4 jours sur la base du volontariat sans perte de salaire.'
        ],
        quote: '« Le vrai pouvoir d’achat se gagne par le travail et l’activité, pas par l’illusion de décrets qui détruisent l’emploi. »'
      }
    ]
  },
  {
    id: 'sante',
    name: 'Santé, hôpital public & déserts médicaux',
    icon: '🏥',
    tagline: 'Accès aux soins, crise des urgences et liberté d’installation des médecins',
    enjeu: 'Plus de 6 millions de Français n’ont pas de médecin traitant. Face aux fermetures de lits d’urgence et à l’épuisement des soignants, la campagne de 2027 s’articule autour de la question décisive : faut-il obliger les médecins à s’installer dans les zones sous-dotées ou miser sur des incitations financières et la délégation de tâches ?',
    questionsCles: [
      'Faut-il encadrer obligatoirement l’installation des médecins pour mettre fin aux déserts médicaux ?',
      'Quel plan de financement pour réhabiliter et rouvrir des services d’urgences dans les hôpitaux de proximité ?',
      'Faut-il élargir les compétences des infirmiers et pharmaciens pour prescrire et soigner au premier recours ?'
    ],
    candidates: [
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'Régulation obligatoire & 100 % Sécu',
        badge: 'Centres de santé publics & fin du numerus clausus',
        proposals: [
          'Conventionnement sélectif : interdiction de s’installer en zone surdotée sans départ préalable d’un confrère.',
          'Création d’un réseau de centres de santé municipaux avec médecins et soignants salariés par la Sécurité sociale.',
          'Reconnaissance du 100 % Sécurité sociale avec intégration des remboursements des mutuelles privées.',
          'Plan d’embauche d’urgence de 100 000 soignants et réouverture immédiate des lits fermés.'
        ],
        quote: '« La santé est un droit humain fondamental, pas un marché soumis à la loi de la rentabilité financière. »'
      },
      {
        partyId: 'pp',
        candidate: 'Raphaël Glucksmann',
        party: 'Place publique / PS',
        color: '#6c53a4',
        orientation: 'Plan Marshall hospitalier & régulation concertée',
        badge: 'Régulation incitative & investissement massif',
        proposals: [
          'Plan d’investissement de 5 milliards d’euros pour moderniser et désengorger les urgences hospitalières.',
          'Régulation territoriale concertée avec les ordres médicaux et obligation de gardes de nuit partagées.',
          'Revalorisation des carrières paramédicales et ratios minimaux obligatoires soignants/patients par service.',
          'Financement public prioritaire de la santé mentale et des soins préventifs précoces chez les jeunes.'
        ],
        quote: '« L’hôpital public est le joyau de la République : quand il s’effondre, c’est le contrat républicain tout entier qui vacille. »'
      },
      {
        partyId: 'renaissance',
        candidate: 'Gabriel Attal',
        party: 'Renaissance',
        color: '#0b2d4f',
        orientation: 'Délégations de tâches & responsabilisation',
        badge: 'Pragmatique & liberté d’installation',
        proposals: [
          'Instauration de la « taxe lapin » pour pénaliser financièrement les rendez-vous médicaux non honorés.',
          'Délégation d’actes médicaux simples et renouvellements d’ordonnances aux pharmaciens et infirmiers en pratique avancée.',
          'Développement massif de la télémédecine et des cabines de téléconsultation dans les territoires ruraux.',
          'Maintien du principe de liberté d’installation des médecins libéraux avec renforcement des aides à l’installation.'
        ],
        quote: '« Libérer du temps médical utile pour nos médecins en confiant les actes courants à nos soignants de proximité. »'
      },
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Plan d’urgence & priorité aux soignants nationaux',
        badge: '20 milliards pour l’hôpital & incitations fiscales',
        proposals: [
          'Plan d’urgence de 20 milliards d’euros sur 5 ans pour moderniser l’hôpital public et réhabiliter les maternités de proximité.',
          'Suppression des agences régionales de santé (ARS), jugées technocratiques, au profit des préfets de département.',
          'Exonération d’impôt sur le revenu pendant 5 ans pour les médecins qui s’installent dans les déserts médicaux.',
          'Suppression de l’Aide Médicale d’État (AME) pour réaffecter son budget au financement des urgences françaises.'
        ],
        quote: '« Chaque Français, où qu’il vive sur notre territoire, doit pouvoir être soigné dignement sans attendre six mois un rendez-vous. »'
      }
    ]
  },
  {
    id: 'logement',
    name: 'Logement, loyers & cadre de vie',
    icon: '🏠',
    tagline: 'Crise immobilière, pénurie de HLM, encadrement des loyers et squat',
    enjeu: 'Le coût du logement pèse jusqu’à 40 % du budget des ménages urbains. Deux visions s’affrontent : contraindre les propriétaires par l’encadrement strict des loyers et le logement social obligatoire, ou au contraire libéraliser le foncier, alléger les normes écologiques et sécuriser les bailleurs face aux impayés.',
    questionsCles: [
      'Faut-il généraliser l’encadrement des loyers dans toutes les agglomérations sous tension ?',
      'Faut-il durcir les sanctions de la loi SRU contre les communes qui refusent de bâtir 25 % de logements sociaux ?',
      'Faut-il assouplir les règles du Diagnostic de Performance Énergétique (DPE) pour éviter l’interdiction de louer des passoires thermiques ?'
    ],
    candidates: [
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'Encadrement général & construction publique',
        badge: 'Droit au toit & réquisition des logements vides',
        proposals: [
          'Encadrement des loyers à la baisse dans toutes les zones tendues et gel des hausses de loyers.',
          'Construction de 200 000 logements sociaux publics par an et triplement des amendes SRU.',
          'Interdiction stricte des expulsions locatives sans solution pérenne de relogement.',
          'Réquisition immédiate des logements vacants appartenant aux grands groupes financiers et foncières.'
        ],
        quote: '« Le logement est un bien commun fondamental : il est inacceptable qu’il devienne un instrument de spéculation sauvage. »'
      },
      {
        partyId: 'renaissance',
        candidate: 'Gabriel Attal',
        party: 'Renaissance',
        color: '#0b2d4f',
        orientation: 'Relance de l’offre & rénovation pragmatique',
        badge: 'Prêt à taux zéro & simplification des normes',
        proposals: [
          'Élargissement du Prêt à Taux Zéro (PTZ) à tous les primo-accédants sur l’ensemble du territoire national.',
          'Simplification du calendrier d’interdiction de location du DPE pour ne pas bloquer les propriétaires de bonne foi.',
          'Création de zones franches de construction rapide dans les territoires en forte tension économique.',
          'Application renforcée de la loi anti-squat protégeant immédiatement les petits propriétaires.'
        ],
        quote: '« Débloquer l’accès à la propriété pour les jeunes classes moyennes en levant les verrous bureaucratiques. »'
      },
      {
        partyId: 'lr',
        candidate: 'Bruno Retailleau',
        party: 'LR',
        color: '#1d4f91',
        orientation: 'Protection des propriétaires & dérégulation',
        badge: 'Abrogation de la loi SRU & choc d’offre privée',
        proposals: [
          'Abrogation définitive des quotas de la loi SRU imposant 25 % de HLM aux maires.',
          'Suppression de l’encadrement des loyers pour restaurer la rentabilité de l’investissement locatif privé.',
          'Expulsion immédiate des squatteurs et locataires en situation d’impayé prolongé en moins de 48 heures.',
          'Allègement massif des normes environnementales et thermiques pesant sur la construction neuve.'
        ],
        quote: '« On ne relance pas la construction en persécutant les propriétaires et en imposant des quotas absurdes aux maires. »'
      },
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Priorité nationale & soutien aux primo-accédants',
        badge: 'Réservation des HLM aux familles françaises',
        proposals: [
          'Instauration de la priorité nationale dans l’attribution des logements sociaux HLM.',
          'Création d’un grand prêt à taux zéro garanti par l’État pour permettre l’accession à la propriété des jeunes ménages français.',
          'Baisse des droits de mutation (frais de notaire) sur la première résidence principale.',
          'Plafonnement des taxes foncières pour protéger les propriétaires occupants de la classe moyenne.'
        ],
        quote: '« Il est anormal que des familles françaises attendent des années un logement social pendant que d’autres en bénéficient immédiatement. »'
      }
    ]
  },
  {
    id: 'ecole',
    name: 'École, jeunesse & éducation',
    icon: '🎓',
    tagline: 'Discipline, niveau des élèves, statut des professeurs et enseignement privé',
    enjeu: 'Les classements internationaux (PISA) et les crises successives de recrutement enseignant placent l’école au cœur des débats. La controverse oppose les tenants du retour à l’autorité, de l’uniforme et du mérite républicain aux défenseurs de l’égalité des chances, de la gratuité totale et de la mixité sociale.',
    questionsCles: [
      'Faut-il généraliser le port de l’uniforme ou de la tenue républicaine unique dans toutes les écoles et collèges ?',
      'Faut-il maintenir les groupes de niveau au collège pour enseigner le français et les mathématiques ?',
      'Faut-il conditionner les financements publics accordés aux écoles privées sous contrat au respect de la mixité sociale ?'
    ],
    candidates: [
      {
        partyId: 'renaissance',
        candidate: 'Gabriel Attal',
        party: 'Renaissance',
        color: '#0b2d4f',
        orientation: 'Choc des savoirs & restauration de l’autorité',
        badge: 'Groupes de niveau & uniforme obligatoire',
        proposals: [
          'Généralisation de la tenue unique (uniforme) dans tous les établissements scolaires publics du premier et second degré.',
          'Organisation pérenne des cours de français et de mathématiques en groupes de niveau au collège.',
          'Sanctions financières directes contre les parents d’élèves auteurs d’agressions ou de manquements graves.',
          'Interdiction totale des téléphones portables et écrans dans l’enceinte de l’ensemble des collèges.'
        ],
        quote: '« L’école républicaine n’est pas un lieu de contestation : c’est le sanctuaire où l’on réapprend le respect et l’effort. »'
      },
      {
        partyId: 'pp',
        candidate: 'Raphaël Glucksmann',
        party: 'Place publique / PS',
        color: '#6c53a4',
        orientation: 'Revalorisation inconditionnelle & mixité',
        badge: 'Financement équitable & fin du séparatisme scolaire',
        proposals: [
          'Revalorisation salariale immédiate de 20 % pour l’ensemble du corps enseignant sans alourdissement du temps de service.',
          'Conditionnement strict des dotations publiques aux établissements privés sous contrat au respect des objectifs de mixité.',
          'Fin du système de tri précoce des élèves et abandon des groupes de niveau stigmatisants.',
          'Recrutement massif d’accompagnants d’élèves en situation de handicap (AESH) intégrés dans la fonction publique.'
        ],
        quote: '« On ne répare pas l’école avec des uniformes et de la communication, mais en respectant enfin ceux qui enseignent. »'
      },
      {
        partyId: 'lr',
        candidate: 'Bruno Retailleau',
        party: 'LR',
        color: '#1d4f91',
        orientation: 'Autorité traditionnelle & mérite',
        badge: 'Sanctions, vouvoiement & redoublement libre',
        proposals: [
          'Rétablissement du vouvoiement obligatoire des maîtres et respect du lever au passage de l’enseignant.',
          'Restauration du pouvoir des conseils de classe de décider souverainement du redoublement d’un élève.',
          'Suppression des allocations familiales pour les parents d’élèves absentéistes ou multirécidivistes.',
          'Sanctuarisation de la liberté de l’enseignement privé et défense du libre choix des familles.'
        ],
        quote: '« Sans transmission de l’autorité et de l’amour de la patrie, il n’y a plus de citoyenneté possible. »'
      },
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'Gratuité totale & émancipation populaire',
        badge: '50 000 enseignants & fin de Parcoursup',
        proposals: [
          'Gratuité scolaire absolue : cantine bio, fournitures scolaires, transports et sorties culturelles pris en charge par l’État.',
          'Recrutement de 50 000 professeurs supplémentaires et abaissement du nombre maximal d’élèves à 20 par classe.',
          'Suppression de la plateforme Parcoursup au profit du libre choix d’inscription universitaire.',
          'Abrogation définitive du SNU pour réaffecter l’intégralité de ses crédits aux budgets de l’école publique.'
        ],
        quote: '« L’éducation est le moyen pour chaque enfant de la République de devenir un esprit libre et éclairé. »'
      }
    ]
  },
  {
    id: 'soc',
    name: 'Société, libertés & égalité',
    icon: '👥',
    tagline: 'Laïcité, bioéthique, fin de vie, droits des femmes et libertés individuelles',
    enjeu: 'Le débat sociétal touche aux fondements du pacte républicain : l’application stricte de la laïcité face aux revendications communautaires, l’aide active à mourir (loi sur la fin de vie), et la protection des libertés publiques face aux outils numériques de surveillance.',
    questionsCles: [
      'Faut-il légaliser une aide active à mourir (suicide assisté et euthanasie encadrée) pour les personnes en phase terminale ?',
      'Faut-il étendre l’interdiction des signes religieux ostensibles à l’université et lors des sorties scolaires ?',
      'Faut-il légaliser et encadrer la vente de cannabis sous monopole d’État pour assécher les trafics ?'
    ],
    candidates: [
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'Libertés individuelles & progressisme',
        badge: 'Légalisation du cannabis & fin de vie choisie',
        proposals: [
          'Légalisation du droit à mourir dans la dignité avec ouverture de l’euthanasie et du suicide assisté.',
          'Légalisation et encadrement public de la production et de la distribution du cannabis.',
          'Constitutionnalisation pleine et entière de l’égalité des droits et de la liberté de conscience.',
          'Protection stricte des libertés publiques contre la surveillance de masse par algorithmes et caméras IA.'
        ],
        quote: '« Chacun est l’unique propriétaire de son corps, de sa conscience et du choix de sa propre destinée. »'
      },
      {
        partyId: 'pp',
        candidate: 'Raphaël Glucksmann',
        party: 'Place publique / PS',
        color: '#6c53a4',
        orientation: 'Humanisme laïque & droits fondamentaux',
        badge: 'Aide à mourir & égalité femmes-hommes',
        proposals: [
          'Adoption rapide d’une loi équilibrée sur la fin de vie garantissant le droit à une aide active à mourir accompagnée de soins palliatifs universels.',
          'Plan d’action massif doté de 1 milliard d’euros contre les violences intrafamiliales et sexistes.',
          'Dépénalisation de l’usage de cannabis et ouverture d’un débat parlementaire sur la légalisation contrôlée.',
          'Défense rigoureuse de la laïcité de la loi de 1905, sans dérive discriminatoire ni complaisance.'
        ],
        quote: '« La laïcité est un principe d’émancipation et de liberté, jamais une arme de stigmatisation d’une partie de nos concitoyens. »'
      },
      {
        partyId: 'lr',
        candidate: 'Bruno Retailleau',
        party: 'LR',
        color: '#1d4f91',
        orientation: 'Conservatisme moral & laïcité de combat',
        badge: 'Refus de l’euthanasie & extension de l’interdiction du voile',
        proposals: [
          'Opposition absolue à la légalisation de l’euthanasie et du suicide assisté, priorité au développement des soins palliatifs.',
          'Extension de l’interdiction des signes religieux ostensibles aux accompagnatrices scolaires et aux compétitions sportives.',
          'Durcissement des sanctions pénales contre le trafic et la consommation de stupéfiants avec tolérance zéro.',
          'Protection du modèle familial traditionnel et interdiction définitive de la gestation pour autrui (GPA).'
        ],
        quote: '« La vie humaine n’a pas de prix et ne peut être abrégée par la loi au nom d’un individualisme sans repère. »'
      },
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Tradition républicaine & fermeté contre l’islamisme',
        badge: 'Interdiction du voile dans l’espace public',
        proposals: [
          'Interdiction du port du voile islamique dans l’ensemble de l’espace public comme idéologie politique.',
          'Réserves majeures sur l’euthanasie active et développement prioritaire des soins palliatifs dans chaque département.',
          'Refus catégorique de toute dépénalisation ou légalisation du cannabis.',
          'Défense intransigeante de l’héritage culturel et des traditions historiques de la France.'
        ],
        quote: '« La République ne cède rien face aux assauts du communautarisme islamiste qui veut imposer ses règles à notre société. »'
      }
    ]
  },
  {
    id: 'auth',
    name: 'Sécurité, autorité & institutions',
    icon: '⚖️',
    tagline: 'Police, peines planchers, narcotrafic, Ve République et contre-pouvoirs',
    enjeu: 'Le maintien de l’ordre républicain face au narcotrafic et aux violences urbaines se double d’un débat institutionnel majeur sur la concentration des pouvoirs présidentiels (article 49.3, régime semi-présidentiel) et l’introduction de la proportionnelle.',
    questionsCles: [
      'Faut-il instaurer des peines planchers automatiques pour toute agression contre un policier, pompier ou soignant ?',
      'Faut-il modifier les institutions de la Ve République (suppression du 49.3, proportionnelle intégrale) ou passer à une VIe République ?',
      'Faut-il abaisser la majorité pénale à 16 ans pour sanctionner les mineurs récidivistes ?'
    ],
    candidates: [
      {
        partyId: 'lr',
        candidate: 'Bruno Retailleau',
        party: 'LR',
        color: '#1d4f91',
        orientation: 'Fermeté régalienne totale',
        badge: 'Majorité pénale à 16 ans & peines planchers',
        proposals: [
          'Abaissement de la majorité pénale à 16 ans pour que les mineurs coupables de crimes et délits graves soient jugés comme des majeurs.',
          'Rétablissement de peines planchers obligatoires sans aménagement possible pour les récidivistes et agresseurs des forces de l’ordre.',
          'Création de 20 000 places de prison supplémentaires et construction de centres de rétention éducatifs fermés.',
          'Guerre totale déclarée au narcotrafic avec création d’un parquet national anti-drogue (Pnad).'
        ],
        quote: '« La première des libertés, c’est la sécurité : la peur doit changer de camp et s’installer chez les délinquants. »'
      },
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Tolérance zéro & perpétuité réelle',
        badge: 'Présomption de légitime défense pour les policiers',
        proposals: [
          'Instauration d’une présomption de légitime défense au profit des membres des forces de sécurité intérieure.',
          'Création d’une peine de perpétuité réelle incompressible sans possibilité de remise en liberté.',
          'Rétablissement de la double peine : expulsion automatique de tout délinquant ou criminel étranger à l’issue de sa peine.',
          'Recours fréquent au référendum d’initiative citoyenne (RIC) sur les grands sujets de société.'
        ],
        quote: '« Les honnêtes citoyens n’ont rien à craindre : ce sont les voyous qui doivent enfin être mis hors d’état de nuire. »'
      },
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'VIe République & police citoyenne',
        badge: 'Assemblée constituante & fin du 49.3',
        proposals: [
          'Convocation d’une Assemblée constituante pour rédiger la Constitution de la VIe République et abolir la monarchie présidentielle.',
          'Suppression de l’article 49 alinéa 3 et instauration du droit de révoquer les élus par référendum citoyen.',
          'Rétablissement d’une police de proximité désarmée d’armes de guerre et démantèlement de la BRAV-M.',
          'Élection de tous les députés au scrutin proportionnel intégral.'
        ],
        quote: '« Nous voulons rendre le pouvoir au peuple et en finir avec l’hyper-présidentialisme monarchique de la Ve République. »'
      },
      {
        partyId: 'renaissance',
        candidate: 'Gabriel Attal',
        party: 'Renaissance',
        color: '#0b2d4f',
        orientation: 'Ordre républicain & justice des mineurs',
        badge: 'Comparution immédiate dès 16 ans',
        proposals: [
          'Instauration de la comparution immédiate pour les mineurs récidivistes dès l’âge de 16 ans.',
          'Atténuation de l’excuse de minorité dans les cas d’atteintes physiques particulièrement graves.',
          'Déploiement de 8 500 nouveaux magistrats et personnels de justice pour diviser par deux les délais de jugement.',
          'Stabilité institutionnelle de la Ve République tout en maintenant l’ouverture au dialogue parlementaire.'
        ],
        quote: '« Pas de République sans autorité : l’ordre et le respect des règles communes sont la condition de notre liberté. »'
      }
    ]
  },
  {
    id: 'europe',
    name: 'Europe, souveraineté & diplomatie',
    icon: '🇪🇺',
    tagline: 'Union européenne, OTAN, guerre en Ukraine, défense commune et souverainisme',
    enjeu: 'Face au réarmement mondial et aux tensions géopolitiques majeures, la place de la France dans l’Union européenne et dans l’Alliance atlantique est une ligne de fracture historique. Le débat oppose les partisans d’une Europe fédérale et de la solidarité atlantique aux tenants de la souveraineté nationale et du non-alignement.',
    questionsCles: [
      'La France doit-elle faire prévaloir sa Constitution nationale sur les traités et directives de l’Union européenne ?',
      'Faut-il intensifier l’aide militaire à l’Ukraine jusqu’à la victoire ou pousser à un cessez-le-feu immédiat avec la Russie ?',
      'La France doit-elle rester membre du commandement militaire intégré de l’OTAN ?'
    ],
    candidates: [
      {
        partyId: 'pp',
        candidate: 'Raphaël Glucksmann',
        party: 'Place publique / PS',
        color: '#6c53a4',
        orientation: 'Européisme convaincu & résistance géopolitique',
        badge: 'Emprunt de défense européen & soutien total à l’Ukraine',
        proposals: [
          'Création d’un grand emprunt européen de 100 milliards d’euros pour bâtir une véritable industrie de défense commune.',
          'Soutien militaire inconditionnel et massif à l’Ukraine, y compris par la livraison d’armements stratégiques à longue portée.',
          'Rejet des traités de libre-échange non conformes aux normes écologiques (Mercosur) et défense de la souveraineté industrielle.',
          'Fin de la règle de l’unanimité au Conseil européen en politique étrangère pour empêcher les vetos complaisants.'
        ],
        quote: '« Si nous laissons l’Ukraine tomber, c’est notre propre sécurité, notre liberté et notre modèle démocratique qui s’effondrent. »'
      },
      {
        partyId: 'renaissance',
        candidate: 'Gabriel Attal',
        party: 'Renaissance',
        color: '#0b2d4f',
        orientation: 'Souveraineté européenne & fidélité aux alliances',
        badge: 'Autonomie stratégique & respect des traités',
        proposals: [
          'Poursuite de la stratégie d’autonomie stratégique européenne initiée par la France depuis 2017.',
          'Maintien d’une participation pleine et active au commandement intégré de l’OTAN tout en renforçant le pilier européen.',
          'Soutien financier et militaire résolu à Kiev tout en évitant toute cobelligérance directe avec Moscou.',
          'Mise en œuvre du Pacte européen sur la migration et l’asile pour contrôler solidairement les frontières extérieures de l’UE.'
        ],
        quote: '« Une France forte dans une Europe souveraine et capable de peser face aux empires américain et chinois. »'
      },
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'Souverainisme de gauche & non-alignement',
        badge: 'Sortie de l’OTAN & désobéissance aux traités',
        proposals: [
          'Sortie immédiate du commandement militaire intégré de l’OTAN et engagement vers un non-alignement diplomatique.',
          'Désobéissance assumée aux règles budgétaires européennes et aux traités de libre-échange qui détruisent l’agriculture.',
          'Privilégier la voie de la négociation diplomatique pour mettre fin au conflit en Ukraine et refus de toute escalade militaire.',
          'Adhésion de la France au Traité d’interdiction des armes nucléaires (TIAN) dans une démarche multilatérale.'
        ],
        quote: '« La France doit retrouver sa voix indépendante dans le monde, sans se soumettre aux diktats de Washington ou de Bruxelles. »'
      },
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Europe des nations & primauté juridique',
        badge: 'Primauté constitutionnelle & retrait du commandement OTAN',
        proposals: [
          'Inscription dans la Constitution de la primauté absolue du droit français sur les traités et jurisprudences de l’UE.',
          'Remplacement de l’Union européenne supranationale par une « Alliance européenne des nations souveraines ».',
          'Sortie du commandement intégré de l’OTAN pour préserver la liberté d’action de l’armée française.',
          'Refus de toute livraison d’armes à longue portée à l’Ukraine et arrêt de toute perspective d’adhésion de l’Ukraine à l’UE.'
        ],
        quote: '« Nous refusons l’effacement de notre nation au profit d’un super-État fédéral européen technocratique. »'
      },
      {
        partyId: 'upr',
        candidate: 'François Asselineau',
        party: 'UPR',
        color: '#25518a',
        orientation: 'Frexit intégral',
        badge: 'Sortie unilatérale de l’UE, de l’Euro et de l’OTAN',
        proposals: [
          'Activation immédiate de l’article 50 du traité de l’Union européenne pour sortir de l’UE.',
          'Rétablissement du franc français et recouvrement de la pleine souveraineté monétaire.',
          'Sortie complète et définitive de l’OTAN.',
          'Rétablissement des contrôles douaniers et frontaliers stricts.'
        ],
        quote: '« La seule façon pour la France de retrouver sa liberté, c’est le Frexit juridique par l’article 50. »'
      }
    ]
  },
  {
    id: 'immig',
    name: 'Immigration, asile & intégration',
    icon: '🌍',
    tagline: 'Contrôle des frontières, régularisations, droit du sol, OQTF et asile',
    enjeu: 'Le sujet migratoire structure une polarisation intense. Les propositions oscillent entre la régularisation des travailleurs des métiers en tension et le respect inconditionnel de l’asile d’une part, et l’instauration de la priorité nationale, la suppression du droit du sol et l’exécution systématique des OQTF d’autre part.',
    questionsCles: [
      'Faut-il inscrire dans la Constitution le principe de priorité nationale pour l’accès aux prestations sociales et aux logements sociaux ?',
      'Faut-il supprimer ou restreindre le droit du sol pour l’acquisition de la nationalité française ?',
      'Faut-il conditionner l’octroi des visas et de l’aide au développement à la délivrance de laissez-passer consulaires pour expulser les personnes en situation irrégulière ?'
    ],
    candidates: [
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Priorité nationale & arrêt de l’immigration de masse',
        badge: 'Référendum constitutionnel & fin du droit du sol',
        proposals: [
          'Organisation d’un référendum constitutionnel pour instaurer la priorité nationale pour l’emploi et le logement.',
          'Suppression du droit du sol : la nationalité française ne sera plus acquise que par filiation ou naturalisation méritoire.',
          'Traitement des demandes d’asile exclusivement dans les ambassades et consulats à l’étranger.',
          'Expulsion systématique de tous les étrangers en situation irrégulière sous OQTF et suppression de l’AME.'
        ],
        quote: '« La France n’a plus les moyens matériels ni culturels d’accueillir des centaines de milliers de personnes chaque année. »'
      },
      {
        partyId: 'reconquete',
        candidate: 'Éric Zemmour',
        party: 'Reconquête',
        color: '#a93f4b',
        orientation: 'Remigration & assimilation intransigeante',
        badge: 'Zéro immigration & ministère de la remigration',
        proposals: [
          'Arrêt total et immédiat de toute immigration légale et illégale : zéro entrée économique ou familiale.',
          'Suppression du regroupement familial, du droit d’asile sur le territoire métropolitain et du droit du sol.',
          'Création d’un ministère de la Remigration chargé du renvoi forcé des clandestins et délinquants étrangers.',
          'Déchéance de nationalité pour tous les binationaux coupables de crimes ou de délits graves.'
        ],
        quote: '« Il ne s’agit plus de réguler l’immigration, mais d’inverser les flux pour assurer la survie de notre civilisation. »'
      },
      {
        partyId: 'lr',
        candidate: 'Bruno Retailleau',
        party: 'LR',
        color: '#1d4f91',
        orientation: 'Fermeté républicaine & référendum migratoire',
        badge: 'Plafonds migratoires stricts & aide d’urgence vitale',
        proposals: [
          'Révision de la Constitution par référendum pour déroger aux règles européennes paralysant les expulsions.',
          'Suppression de l’Aide Médicale d’État (AME), remplacée par une simple aide médicale d’urgence vitale.',
          'Conditionnement strict de l’aide publique au développement et des visas à la délivrance des laissez-passer consulaires.',
          'Durcissement drastique du regroupement familial avec exigence de ressources autonomes et de maîtrise du français.'
        ],
        quote: '« C’est au peuple français souverain de décider qui entre et qui doit sortir de son territoire, pas aux juges de Strasbourg. »'
      },
      {
        partyId: 'lfi',
        candidate: 'Jean-Luc Mélenchon',
        party: 'LFI',
        color: '#7b5dc8',
        orientation: 'Accueil digne, régularisation & droit d’asile',
        badge: 'Régularisation des sans-papiers & maintien de l’AME',
        proposals: [
          'Régularisation de l’ensemble des travailleurs sans-papiers présents sur le territoire national.',
          'Garantie inconditionnelle du droit d’asile avec ouverture de voies légales et sûres d’accès.',
          'Maintien et sanctuarisation de l’Aide Médicale d’État (AME) pour des impératifs d’humanité et de santé publique.',
          'Défense pleine et entière du droit du sol républicain.'
        ],
        quote: '« Ceux qui travaillent ici, bâtissent nos immeubles et nettoient nos gares ont vocation à être pleinement reconnus comme nos égaux. »'
      },
      {
        partyId: 'pp',
        candidate: 'Raphaël Glucksmann',
        party: 'Place publique / PS',
        color: '#6c53a4',
        orientation: 'Régulation humaine, intégration & fermeté contre les passeurs',
        badge: 'Solidarité européenne & lutte contre les trafiquants',
        proposals: [
          'Création de voies régulières d’immigration professionnelle pour combler les pénuries réelles de main-d’œuvre.',
          'Solidarité européenne obligatoire dans l’accueil et la répartition des demandeurs d’asile.',
          'Lutte implacable contre les réseaux de passeurs mafieux en Méditerranée.',
          'Maintien de l’AME et intégration républicaine renforcée par des cours intensifs de français et de valeurs civiques.'
        ],
        quote: '« Sortir du déni de la droite qui fantasme l’étanchéité absolue et de la gauche qui esquive la nécessité d’un ordre républicain. »'
      }
    ]
  },
  {
    id: 'ecology',
    name: 'Écologie, climat & énergie',
    icon: '🌿',
    tagline: 'Nucléaire, énergies renouvelables, fin du moteur thermique 2035 et pesticides',
    enjeu: 'Atteindre la neutralité carbone en 2050 exige de décarboner massivement l’électricité, l’industrie, le chauffage et les transports. Les débats opposent le choix stratégique entre le tout-nucléaire et le 100 % renouvelable, le rythme d’interdiction des véhicules thermiques et la conciliation entre souveraineté agricole et réduction des pesticides.',
    questionsCles: [
      'Faut-il construire de 6 à 14 nouveaux réacteurs nucléaires EPR2 ou engager la sortie du nucléaire au profit des renouvelables ?',
      'Faut-il maintenir l’interdiction européenne de vente de voitures thermiques neuves fixée à 2035 ?',
      'Faut-il interdire immédiatement les pesticides les plus nocifs ou conditionner tout retrait à l’existence d’alternatives rentables ?'
    ],
    candidates: [
      {
        partyId: 'ecolo',
        candidate: 'Marine Tondelier',
        party: 'Les Écologistes',
        color: '#1e9b58',
        orientation: 'Transition radicale & 100 % renouvelables',
        badge: 'Sortie programmée du nucléaire & justice environnementale',
        proposals: [
          'Arrêt immédiat de tout projet de nouveau réacteur nucléaire (EPR2) et trajectoire de sortie progressive de l’atome.',
          'Plan massif de déploiement des énergies renouvelables (éolien terrestre et marin, solaire, biomasse).',
          'Interdiction rapide des pesticides de synthèse et soutien financier à la conversion intégrale vers l’agroécologie.',
          'Maintien strict de l’échéance de 2035 pour la fin du moteur thermique et grand plan de ferroutage.'
        ],
        quote: '« Le dérèglement climatique n’attend pas : chaque euro investi dans un EPR fantôme est un euro perdu pour l’isolation et les renouvelables. »'
      },
      {
        partyId: 'renaissance',
        candidate: 'Gabriel Attal',
        party: 'Renaissance',
        color: '#0b2d4f',
        orientation: 'Écologie industrielle & relance nucléaire',
        badge: 'Mix 6 à 14 EPR2 + solaire et éolien en mer',
        proposals: [
          'Construction prioritaire de 6 réacteurs nucléaires EPR2 avec option pour 8 réacteurs supplémentaires d’ici 2045.',
          'Développement pragmatique du photovoltaïque et des parcs éoliens maritimes au large.',
          'Maintien de l’interdiction de vente de voitures neuves thermiques en 2035 avec accompagnement par le leasing social.',
          'Pas d’interdiction de pesticides sans alternative éprouvée pour préserver les rendements des agriculteurs français.'
        ],
        quote: '« Une écologie de progrès et d’innovation, qui réindustrialise la France au lieu de culpabiliser les citoyens. »'
      },
      {
        partyId: 'rn',
        candidate: 'Marine Le Pen',
        party: 'RN',
        color: '#173f70',
        orientation: 'Tout-nucléaire & refus de l’écologie punitive',
        badge: 'Moratoire sur l’éolien & démantèlement',
        proposals: [
          'Relance massive et sans équivoque de la filière nucléaire avec au moins 20 nouveaux réacteurs et prolongation des centrales à 60 ans.',
          'Moratoire immédiat sur les nouvelles éoliennes et plan de démantèlement progressif des parcs existants.',
          'Abrogation de l’interdiction européenne des moteurs thermiques en 2035 et défense du véhicule à essence populaire.',
          'Arrêt de la surtransposition des normes environnementales européennes pesant sur l’agriculture française.'
        ],
        quote: '« Les éoliennes sont une escroquerie visuelle et financière : le nucléaire est la seule énergie propre, souveraine et pilotable. »'
      },
      {
        partyId: 'lr',
        candidate: 'Bruno Retailleau',
        party: 'LR',
        color: '#1d4f91',
        orientation: 'Nucléaire souverain & liberté agricole',
        badge: 'Abrogation de l’échéance 2035 & soutien aux agriculteurs',
        proposals: [
          'Priorité absolue donnée au nucléaire et à l’hydroélectricité comme piliers de la souveraineté énergétique.',
          'Abrogation de l’interdiction de 2035 pour autoriser durablement les moteurs hybrides et les biocarburants.',
          'Fin immédiate du carcan environnemental imposé à nos exploitants agricoles et refus du zéro artificialisation nette (ZAN).',
          'Suppression des zones à faibles émissions (ZFE) qui pénalisent les ruraux et les ménages modestes.'
        ],
        quote: '« L’écologie ne doit pas être le faux-nez de la décroissance et de la punition des gens qui travaillent. »'
      },
      {
        partyId: 'pp',
        candidate: 'Raphaël Glucksmann',
        party: 'Place publique / PS',
        color: '#6c53a4',
        orientation: 'Social-écologie & investissement ferroviaire',
        badge: 'ISF climatique & rénovation thermique globale',
        proposals: [
          'Création d’un ISF climatique taxant les investissements bruns et les patrimoines très polluants.',
          'Mix énergétique décarboné pragmatique : maintien et prolongation du nucléaire sûr combiné à l’essor rapide des renouvelables.',
          'Investissement de 100 milliards d’euros dans le réseau ferroviaire et les transports publics du quotidien.',
          'Interdiction progressive mais résolue des pesticides cancérigènes avec compensation financière intégrale pour les agriculteurs.'
        ],
        quote: '« La transition écologique sera juste et populaire ou elle ne sera pas : les plus gros pollueurs doivent payer le plus. »'
      }
    ]
  }
];

/* ============================================================================
   SONDAGES PRÉSIDENTIELLE 2027
   Données consolidées d’après les sondages récents des instituts agréés
   (IFOP, Elabe, Harris Interactive, Odoxa, OpinionWay), recensés sur Wikipédia
   et déposés auprès de la Commission nationale des sondages.
   ========================================================================= */

const POLLS_DATA = {
  lastUpdate: 'Octobre 2026',
  sourceUrl: 'https://fr.wikipedia.org/wiki/Liste_de_sondages_sur_l%27%C3%A9lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2027',
  sourceLabel: 'Wikipédia — Liste de sondages sur l’élection présidentielle française de 2027',
  commissionNotice: 'Conformément à la loi du 19 juillet 1977 modifiée, les intentions de vote ne constituent pas une prévision du résultat électoral mais une mesure des rapports de force à la date de l’enquête. Pour un échantillon classique de 1 000 à 1 800 personnes, la marge d’erreur statistique varie entre ±1,8 et ±3,2 points de pourcentage.',

  hypotheses: [
    {
      id: 'philippe',
      label: 'Hypothèse Édouard Philippe (Centre)',
      shortLabel: 'Avec Édouard Philippe',
      description: 'Configuration centrale avec Édouard Philippe (Horizons) portant les couleurs du bloc central, avec le soutien d’une partie des parlementaires de la majorité.',
      averages: [
        { candidate: 'Marine Le Pen', party: 'RN', score: 34.5, color: '#173f70', photo: 'Marine Le Pen in 2026.jpg' },
        { candidate: 'Édouard Philippe', party: 'Horizons', score: 18.0, color: '#111827', photo: 'Édouard Philippe MSC 2018 (cropped).jpg' },
        { candidate: 'Jean-Luc Mélenchon', party: 'LFI', score: 15.0, color: '#7b5dc8', photo: 'Jean-Luc Mélenchon en 2026.png' },
        { candidate: 'Raphaël Glucksmann', party: 'PS - Place publique', score: 14.0, color: '#6c53a4', photo: '2024-03-03 - Congrès du PSE- 105 - Raphael Glucksmann.jpg' },
        { candidate: 'Bruno Retailleau', party: 'LR', score: 7.5, color: '#1d4f91', photo: "Bruno Retailleau - Ministre de l'Intérieur français (3x4 cropped).jpg" },
        { candidate: 'Éric Zemmour', party: 'Reconquête', score: 5.5, color: '#a93f4b', photo: 'Portrait Éric Zemmour, avril 2022 cropped.jpg' },
        { candidate: 'Fabien Roussel', party: 'PCF', score: 3.0, color: '#b5193f', photo: 'Fabien Roussel 2022.jpg' },
        { candidate: 'Marine Tondelier', party: 'Les Écologistes', score: 2.5, color: '#1e9b58', photo: 'Huma2023MarineTondelier (cropped).jpg' },
        { candidate: 'Nicolas Dupont-Aignan', party: 'DLF', score: 2.0, color: '#1683b5', photo: 'Nicolas Dupont-Aignan in 2014.jpg' },
        { candidate: 'Nathalie Arthaud', party: 'LO', score: 0.5, color: '#c81f1f', photo: 'Nathalie Arthaud.png' },
        { candidate: 'François Asselineau', party: 'UPR', score: 0.5, color: '#25518a', photo: 'François ASSELINEAU.jpg' }
      ]
    },
    {
      id: 'attal',
      label: 'Hypothèse Gabriel Attal (Centre)',
      shortLabel: 'Avec Gabriel Attal',
      description: 'Configuration centrale avec Gabriel Attal investi par Renaissance comme candidat officiel de la coalition sortante.',
      averages: [
        { candidate: 'Marine Le Pen', party: 'RN', score: 36.0, color: '#173f70', photo: 'Marine Le Pen in 2026.jpg' },
        { candidate: 'Jean-Luc Mélenchon', party: 'LFI', score: 16.0, color: '#7b5dc8', photo: 'Jean-Luc Mélenchon en 2026.png' },
        { candidate: 'Raphaël Glucksmann', party: 'PS - Place publique', score: 14.5, color: '#6c53a4', photo: '2024-03-03 - Congrès du PSE- 105 - Raphael Glucksmann.jpg' },
        { candidate: 'Gabriel Attal', party: 'Renaissance', score: 13.0, color: '#0b2d4f', photo: 'Gabriel Attal 2025 (close crop).jpg' },
        { candidate: 'Bruno Retailleau', party: 'LR', score: 8.0, color: '#1d4f91', photo: "Bruno Retailleau - Ministre de l'Intérieur français (3x4 cropped).jpg" },
        { candidate: 'Éric Zemmour', party: 'Reconquête', score: 6.0, color: '#a93f4b', photo: 'Portrait Éric Zemmour, avril 2022 cropped.jpg' },
        { candidate: 'Fabien Roussel', party: 'PCF', score: 3.0, color: '#b5193f', photo: 'Fabien Roussel 2022.jpg' },
        { candidate: 'Marine Tondelier', party: 'Les Écologistes', score: 2.5, color: '#1e9b58', photo: 'Huma2023MarineTondelier (cropped).jpg' },
        { candidate: 'Nicolas Dupont-Aignan', party: 'DLF', score: 1.5, color: '#1683b5', photo: 'Nicolas Dupont-Aignan in 2014.jpg' },
        { candidate: 'Nathalie Arthaud', party: 'LO', score: 0.5, color: '#c81f1f', photo: 'Nathalie Arthaud.png' },
        { candidate: 'François Asselineau', party: 'UPR', score: 0.5, color: '#25518a', photo: 'François ASSELINEAU.jpg' }
      ]
    }
  ],

  recentPolls: [
    {
      institute: 'Elabe',
      sponsor: 'BFMTV & La Tribune Dimanche',
      date: '15-18 octobre 2026',
      sample: '1 508 inscrits',
      margin: '±2,5 pts',
      leadCandidate: 'Marine Le Pen (34 %)',
      secondCandidate: 'Édouard Philippe (18 %)',
      summary: 'Marine Le Pen confirme son socle élevé au premier tour. Le duel pour la 2e place oppose Édouard Philippe à Jean-Luc Mélenchon (15 %) et Raphaël Glucksmann (14 %), en forte hausse après sa victoire à la primaire.'
    },
    {
      institute: 'IFOP-Fiducial',
      sponsor: 'Le Figaro & Sud Radio',
      date: '24-27 septembre 2026',
      sample: '1 820 inscrits',
      margin: '±2,3 pts',
      leadCandidate: 'Marine Le Pen (35 %)',
      secondCandidate: 'Édouard Philippe (17,5 %)',
      summary: 'Édouard Philippe domine le centre devant Gabriel Attal. Bruno Retailleau (LR) est mesuré à 7,5 % et Éric Zemmour (Reconquête) à 5 %.'
    },
    {
      institute: 'Harris Interactive',
      sponsor: 'M6 & RTL',
      date: '12-15 septembre 2026',
      sample: '1 450 inscrits',
      margin: '±2,6 pts',
      leadCandidate: 'Marine Le Pen (34 %)',
      secondCandidate: 'Édouard Philippe (18,5 %)',
      summary: 'Stabilité des intentions de vote en cette rentrée : le RN reste en tête de plus de 15 points d’avance sur ses premiers poursuivants.'
    },
    {
      institute: 'Odoxa',
      sponsor: 'Le Nouvel Obs',
      date: 'Juillet-Août 2026',
      sample: '1 005 inscrits',
      margin: '±3,1 pts',
      leadCandidate: 'Marine Le Pen (33 %)',
      secondCandidate: 'Édouard Philippe (19 %)',
      summary: 'Test d’été montrant une forte attente de renouvellement politique et une compétition vive entre les forces de gauche.'
    },
    {
      institute: 'OpinionWay',
      sponsor: 'CNews & Europe 1',
      date: 'Juin 2026',
      sample: '1 200 inscrits',
      margin: '±2,8 pts',
      leadCandidate: 'Marine Le Pen (33,5 %)',
      secondCandidate: 'Édouard Philippe (18 %)',
      summary: 'Premier sondage d’envergure mesurant la dynamique post-européennes et la consolidation des grands blocs politiques.'
    }
  ],

  secondRoundDuels: [
    {
      duel: 'Marine Le Pen vs Édouard Philippe',
      candidateA: { name: 'Marine Le Pen', party: 'RN', score: 51, color: '#173f70' },
      candidateB: { name: 'Édouard Philippe', party: 'Horizons', score: 49, color: '#111827' },
      source: 'Elabe & IFOP (Automne 2026)',
      status: 'Coude-à-coude dans la marge d’erreur'
    },
    {
      duel: 'Marine Le Pen vs Gabriel Attal',
      candidateA: { name: 'Marine Le Pen', party: 'RN', score: 54, color: '#173f70' },
      candidateB: { name: 'Gabriel Attal', party: 'Renaissance', score: 46, color: '#0b2d4f' },
      source: 'Elabe (Octobre 2026)',
      status: 'Avance nette de Marine Le Pen'
    },
    {
      duel: 'Marine Le Pen vs Raphaël Glucksmann',
      candidateA: { name: 'Marine Le Pen', party: 'RN', score: 53, color: '#173f70' },
      candidateB: { name: 'Raphaël Glucksmann', party: 'PS - Place publique', score: 47, color: '#6c53a4' },
      source: 'IFOP-Fiducial (Automne 2026)',
      status: 'Rassemblement démocrate en progression'
    },
    {
      duel: 'Marine Le Pen vs Jean-Luc Mélenchon',
      candidateA: { name: 'Marine Le Pen', party: 'RN', score: 61, color: '#173f70' },
      candidateB: { name: 'Jean-Luc Mélenchon', party: 'LFI', score: 39, color: '#7b5dc8' },
      source: 'IFOP & Harris (2026)',
      status: 'Large victoire mesurée pour le RN'
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { THEMES_DATA, POLLS_DATA };
} else if (typeof window !== 'undefined') {
  window.THEMES_DATA = THEMES_DATA;
  window.POLLS_DATA = POLLS_DATA;
}
