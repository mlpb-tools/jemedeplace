// app.js
(function(){
  "use strict";

  // Données principales (vulgarisées) – basées sur le Book Mobilités 2025 :
  // - Fonds départementaux mobilité (ex : aide déplacements 450€/12 mois, base 0,20€/km, etc.)
  // - Entretien/réparation 500€ max (reste à charge mini 10%)
  // - Assurance 350€ max (reste à charge mini 10%)
  // - Achat vélo / 2-roues / VAE : dépenses réelles ou 500€ max (reste à charge mini 10%) + aides de droit commun d’abord
  // - Code : dépenses réelles ou 200€ max (reste à charge mini 10%)
  // - Heures de conduite : 90% max, 35h max après code, délai 8 mois
  // - FASTT SOS Location : 10€/jour voiture, 3€/jour 2-roues, 60 jours/an
  // - France Travail aide mobilité (conditions distance, situation, etc.)
  // - Microcrédit personnel (jusqu’à 8 000€ / 12 000€ selon cas), ADIE prêt mobilité jusqu’à 6 000€
  // - Txik Txak : tarification solidaire, covoiturage BlaBlaCar Daily (jusqu’à 100€/mois conducteur), TAD, TPMR, abonnement combiné + TER
  // - Carte Solidaire TER SNCF Nouvelle-Aquitaine : -80% ; QF<960€ ou AAH/ADA/etc.
  //
  // NB : Tout est présenté en “premier niveau d’info” pour jeunes NEET, avec “quoi / pour qui / comment / pièces”.

  const AIDES = {
    dept_deplacements: {
      title: "Aide aux déplacements (Fonds départementaux)",
      tags: ["Déplacements", "Insertion", "Urgence"],
      who: [
        "Personnes répondant aux critères du règlement (public/ressources) + motif lié à l’insertion ou social."
      ],
      what: [
        "Aide forfaitaire mobilisable plusieurs fois dans l’année selon besoins, dans la limite de 450 € sur 12 mois.",
        "Motifs : reprise d’emploi, reprise de formation, rendez-vous médicaux, justice, entretien d’embauche."
      ],
      how: [
        "Montant calculé sur base 0,20 € / km (véhicule perso).",
        "Si covoiturage : prise en charge à 100% sur attestation écrite du transporteur.",
        "Si trajets fréquents : l’aide couvre au maximum 1 aller/retour par jour."
      ],
      notes: [
        "Si formation PRF Région Nouvelle-Aquitaine : vérifier Fonds social formation (si activable, le Département n’intervient pas).",
        "L’aide n’est mobilisable que si transport en commun/covoiturage impossibles.",
        "Location de véhicule non financée via cette aide."
      ],
      docs: [
        "Attestation d’entrée en formation ou contrat de travail",
        "Convocation (médical/justice/entretien)",
        "Carte grise + assurance + permis",
        "RIB (avec date de naissance)",
        "Le cas échéant : attestation Région (fonds social formation)"
      ]
    },

    dept_reparation: {
      title: "Entretien & réparation du véhicule",
      tags: ["Voiture", "Réparation"],
      who: ["Dans le cadre du fonds mobilité, sur évaluation sociale."],
      what: ["Jusqu’à 500 € maximum, avec reste à charge minimum de 10%."],
      how: [
        "Pas de factures déjà acquittées.",
        "Exclus : entretien courant/esthétique, contrôle technique.",
        "Possibilité achat de pièces détachées uniquement par virement à un tiers.",
        "Achat de pièces d’occasion à un particulier : non."
      ],
      docs: ["Carte grise", "Assurance", "Permis", "Devis (1 suffit)", "Facture (pour versement)", "RIB du tiers"]
    },

    dept_assurance: {
      title: "Assurance véhicule (auto / moto / scooter)",
      tags: ["Voiture", "Assurance"],
      who: ["Dans le cadre du fonds mobilité, sur évaluation sociale."],
      what: ["Jusqu’à 350 € maximum, avec reste à charge minimum de 10%."],
      how: ["Sur devis ou quittance d’assurance en cours (selon cas)."],
      docs: ["Carte grise", "Permis", "Quittance d’assurance en cours ou devis"]
    },

    dept_bon_transport: {
      title: "Bon de transport (transport en commun)",
      tags: ["Transport", "Ponctuel"],
      who: ["Selon situations listées + évaluation sociale."],
      what: [
        "1 bon 1 fois/an pour : convocation JAF/JE/Prud’homme, insertion (entretien/concours/formation), urgence familiale (décès/maladie grave).",
        "1 bon limité à 2 fois/an pour permettre au parent séparé d’accueillir son enfant."
      ],
      how: [
        "Prioriser les horaires les moins onéreux (sinon justifier).",
        "Si déplacement en Nouvelle-Aquitaine : utiliser la Carte Solidaire Région (obligatoire)."
      ],
      docs: ["Convocation / justificatif du motif", "Éléments d’identité selon procédure locale"]
    },

    dept_velo_2roues: {
      title: "Achat vélo / 2-roues (dont VAE)",
      tags: ["Vélo", "Scooter", "VAE"],
      who: [
        "Personnes dans un parcours d’insertion (Mission Locale / référent unique RSA hors France Travail).",
        "BRSA : CER en cours de validité."
      ],
      what: ["Dépenses réelles ou 500 € max, avec reste à charge minimum 10%."],
      how: [
        "Achat nécessaire et directement lié au projet d’insertion (pas court terme).",
        "Pour VAE : mobiliser d’abord les aides de droit commun (État/EPCI/communes) ; l’aide vient en complément.",
        "Achat possible à un tiers ou seconde main si attestation du tiers."
      ],
      docs: [
        "Devis puis facture acquittée",
        "Pour achat à un tiers : certificat d’immatriculation + attestation sur l’honneur + copie CI vendeur (si concerné)"
      ]
    },

    dept_code: {
      title: "Code de la route (aide)",
      tags: ["Permis", "Code"],
      who: ["Dans un parcours d’insertion ; demande avant démarrage du code."],
      what: ["Dépenses réelles ou 200 € max, reste à charge minimum 10%."],
      how: ["Versée à l’usager uniquement si l’examen est présenté dans les 6 mois suivant validation de l’aide."],
      docs: ["Devis code", "Attestation de passage d’examen", "RIB (date de naissance)", "Fiche SIREN (si organisme)"]
    },

    dept_conduite: {
      title: "Heures de conduite (aide)",
      tags: ["Permis", "Conduite"],
      who: ["Après obtention du code, dans un parcours d’insertion."],
      what: ["Jusqu’à 90% du coût, maximum 35 heures."],
      how: [
        "Heures à réaliser dans les 8 mois suivant la signature de la convention auto-école.",
        "Versée à l’auto-école.",
        "Non pris en charge : frais de dossier/inscription, évaluation, supports pédagogiques, heures sup/remise à niveau."
      ],
      docs: ["Devis permis", "Évaluation auto-école", "Attestation code validé", "Fiche SIREN auto-école"]
    },

    fastt_location: {
      title: "FASTT – SOS Location (intérimaires)",
      tags: ["Intérim", "Location"],
      who: ["Avoir le statut d’intérimaire au moment de la location + conditions FASTT."],
      what: ["Location à tarif réduit : 10 €/jour voiture ; 3 €/jour 2-roues ; jusqu’à 60 jours/an."],
      how: [
        "Demande en ligne via espace personnel FASTT : dates de mission + dates de location + partenaire proche.",
        "Réservation traitée automatiquement + SMS de confirmation."
      ],
      notes: [
        "La location inclut assistance/assurance (RC, vol, incendie) avec franchise.",
        "Une caution peut aller jusqu’à 700€ (selon loueur).",
        "Pas de couverture bris de glace et usages pro (livraison, etc.)."
      ],
      docs: ["Justificatif de mission (agence d’intérim)", "Permis (voiture) / BSR si concerné"]
    },

    ft_mobilite: {
      title: "France Travail – Aide à la mobilité (recherche d’emploi)",
      tags: ["France Travail", "Entretien", "Concours"],
      who: [
        "Inscrit à France Travail + situations éligibles.",
        "Action : entretien, concours, examen certifiant, immersion (PMSMP), prestation prescrite."
      ],
      what: ["Aide pour les déplacements liés à la recherche d’emploi / reprise d’emploi (selon barèmes France Travail)."],
      how: [
        "Lieu situé en France à +60 km aller-retour (ou +2h de trajet A/R) du domicile (conditions spécifiques Outre-mer).",
        "L’entretien doit viser un CDI ou un CDD/intérim d’au moins 3 mois (selon règles indiquées)."
      ],
      docs: ["Convocation / justificatif action", "Justificatif domicile", "Statut France Travail", "Autres pièces selon dossier"]
    },

    microcredit: {
      title: "Microcrédit personnel (mobilité)",
      tags: ["Financement", "Crédit"],
      who: ["Personnes exclues du crédit bancaire classique + projet de mobilité/professionnel évalué + capacité de remboursement."],
      what: ["Jusqu’à 8 000 € (ou 12 000 € selon cas), remboursable sur 5 à 7 ans max."],
      how: [
        "Dossier évalué + accompagnement social (budget/droits) avant et après l’accord.",
        "Demandes étudiées par des structures locales d’accompagnement."
      ],
      docs: ["Pièce d’identité", "RIB", "Justificatifs de revenus", "Selon projet : permis, devis, etc."]
    },

    adie_pret: {
      title: "ADIE – Prêt mobilité",
      tags: ["Financement", "Prêt"],
      who: ["Besoin de financer un projet (mobilité/emploi/formation) + banques peu susceptibles de financer + garant possible (selon conditions)."],
      what: ["Jusqu’à 6 000 € ; durée jusqu’à 42 mois ; taux (variable selon conditions de date)."],
      how: [
        "Demande en agence ADIE (RDV) avec dossier complet.",
        "Réponse annoncée sous ~10 jours (selon indication), déblocage rapide si accepté."
      ],
      docs: ["Pièce d’identité", "Justificatifs de revenus", "3 relevés bancaires", "RIB", "Permis (si achat/réparation véhicule)"]
    },

    txik_solid: {
      title: "Txik Txak – Tarification solidaire",
      tags: ["Bus/Tram", "Pays Basque", "Réduction"],
      who: [
        "Selon quotient familial (QF) : ex. Solidaire+ ≤ 430€ ; Solidaire 431–620€ ; Solidaire -28 ans (foyer non imposable)."
      ],
      what: ["Jusqu’à 75% (Solidaire+) ou 50% (Solidaire) de réduction (selon profil)."],
      how: [
        "Souscrire en ligne ou en agence Txik Txak.",
        "Dossier : pièce d’identité + domicile (-3 mois) + avis d’imposition + photo."
      ],
      notes: ["Concerne : bus, tram’bus, transport à la demande (selon infos)."],
      docs: ["Pièce d’identité", "Justificatif domicile", "Avis d’imposition", "Photo d’identité"]
    },

    txik_covoit: {
      title: "Txik Txak – Aide covoiturage (BlaBlaCar Daily)",
      tags: ["Covoiturage", "Pays Basque"],
      who: ["Conducteur ou passager via la plateforme partenaire BlaBlaCar Daily."],
      what: ["Gratuité pour le passager + prise en charge de la rémunération conducteur (jusqu’à 100€/mois conducteur)."],
      how: ["Créer un compte BlaBlaCar Daily + suivre procédure Txik Txak (selon dispositif en vigueur)."],
      docs: ["Compte BlaBlaCar Daily", "Éléments demandés dans l’app (trajets)"]
    },

    txik_tad_tpmr: {
      title: "Txik Txak – TAD / TPMR / Abonnement combiné TER",
      tags: ["TAD", "TPMR", "TER"],
      who: ["Usagers du réseau selon conditions de service."],
      what: [
        "TAD : zones non desservies (réservation jusqu’à ~1h) au tarif ticket bus.",
        "TPMR : horaires étendus, réservation jusqu’à 1 mois à l’avance.",
        "Combiné Txik Txak + TER : supplément mensuel (ex. 5€/mois -28 ans ; 10€/mois +28 ans sur lignes TER concernées)."
      ],
      how: ["Consulter Txik Txak / agences / infos réseau pour modalités exactes (selon ligne/commune)."],
      docs: ["Selon service (compte client / carte)"]
    },

    carte_solidaire_ter: {
      title: "Carte Solidaire TER Nouvelle-Aquitaine (SNCF)",
      tags: ["TER", "Région NA", "-80%"],
      who: [
        "Domicilié Nouvelle-Aquitaine + QF < 960€",
        "ou bénéficiaire AAH, ADA, réfugié réinstallé, protection temporaire UE, etc."
      ],
      what: ["Carte nominative gratuite, valable 1 an, donnant -80% sur trains/cars régionaux (billet unitaire tarif normal)."],
      how: [
        "Demande en ligne (transports.nouvelle-aquitaine.fr) ou par courrier (dossier complet).",
        "Renouvellement à faire dans le mois avant fin de validité.",
        "Titres : en train (gare/en ligne TER NA) ; en car (Ticket Solidaire auprès conducteur)."
      ],
      docs: ["Identité + justificatifs selon catégorie (QF/AAH/ADA/etc.)"]
    },

    zfe_critair: {
      title: "ZFE / Crit’Air (à connaître)",
      tags: ["Règles", "Voiture"],
      who: ["Toute personne utilisant une voiture en zone concernée."],
      what: ["Comprendre restrictions et vignette Crit’Air selon véhicule et zones."],
      how: ["Vérifier si tu passes par une ZFE et si ton véhicule est autorisé (selon classe Crit’Air)."],
      docs: ["Selon démarche (carte grise, etc.)"]
    },

    permis_international: {
      title: "Permis international (si besoin)",
      tags: ["Permis", "Étranger"],
      who: ["Personnes partant à l’étranger dans certains pays."],
      what: ["Permis international = traduction officielle du permis (selon pays)."],
      how: ["Démarches selon procédure officielle (préfecture/ANTS selon cas)."],
      docs: ["Permis, identité, photo, justificatif, etc. (selon procédure)"]
    },

    permis_etranger: {
      title: "Reconnaître un permis étranger en France",
      tags: ["Permis", "Équivalence"],
      who: ["Titulaire d’un permis étranger (selon pays/accords/statut)."],
      what: ["Échange ou reconnaissance selon règles (pays d’émission, délai, statut)."],
      how: ["Vérifier conditions d’échange/validité (procédure officielle)."],
      docs: ["Permis, identité, justificatifs (selon procédure)"]
    },

    permis_am_asr: {
      title: "Permis AM / ASR (autres permis)",
      tags: ["2-roues", "Sécu"],
      who: ["Selon âge/situation (AM : cyclomoteur ; ASR : attestation sécurité routière si besoin)."],
      what: ["Solutions pour rouler en 50cc / sécuriser l’accès à certains permis."],
      how: ["Se rapprocher d’un organisme/auto-école + vérifier prérequis."],
      docs: ["Selon dispositif"]
    },

    trottinette: {
      title: "Trottinette électrique (règles de base)",
      tags: ["Micro-mobilité"],
      who: ["Usagers EDPM."],
      what: ["Option de micro-mobilité sur distances courtes."],
      how: ["Respecter règles locales (équipements, circulation, assurance selon cas)."],
      docs: ["Selon cas"]
    },

    voiturette: {
      title: "Permis voiturette",
      tags: ["Voiturette", "Alternative"],
      who: ["Selon âge et réglementation (catégorie spécifique)."],
      what: ["Alternative à la voiture classique dans certains cas."],
      how: ["Se renseigner auto-école + réglementation."],
      docs: ["Selon dispositif"]
    }
  };

  // Deck (structure “slide”)
  const SLIDES = [
    {
      id: "s1",
      title: "Comprendre ma mobilité pour avancer",
      kicker: "Webinaire Mobilités • Jeunes NEET • Freins majeurs",
      body: `
        <p class="p"><strong>Objectif :</strong> rendre ta mobilité <b>visible</b>, puis trouver des solutions <b>concrètes</b>.</p>
        <div class="callout">
          <strong>Principe simple</strong>
          <p>On part de ta réalité (carte), puis on choisit les aides/solutions adaptées.</p>
        </div>
        <div class="grid cols-3">
          <div class="card">
            <div class="card__title">🗺️ 1) Je trace</div>
            <div class="card__meta">D’où je pars, où je dois aller, comment, quand, combien.</div>
          </div>
          <div class="card">
            <div class="card__title">🧩 2) Je comprends</div>
            <div class="card__meta">Mes vrais freins : horaires, coût, fatigue, isolement, sécurité.</div>
          </div>
          <div class="card">
            <div class="card__title">🚀 3) J’active</div>
            <div class="card__meta">Solutions + aides selon mon cas (permis, transport, vélo, prêt, etc.).</div>
          </div>
        </div>
      `
    },

    {
      id: "s2",
      title: "Ce qu’on va faire ensemble",
      kicker: "Déroulé • 60–90 min",
      body: `
        <ul class="list">
          <li class="item">
            <div class="item__icon">1</div>
            <div class="item__txt">
              <div class="item__t">Diagnostiquer ta mobilité</div>
              <div class="item__d">Avec Map-Ta-Mob : lieux, temps, moyens, obstacles.</div>
            </div>
          </li>
          <li class="item">
            <div class="item__icon">2</div>
            <div class="item__txt">
              <div class="item__t">Trouver les solutions adaptées</div>
              <div class="item__d">Transport, permis, 2-roues, aides, prêt, covoiturage…</div>
            </div>
          </li>
          <li class="item">
            <div class="item__icon">3</div>
            <div class="item__txt">
              <div class="item__t">Repartir avec un plan d’action</div>
              <div class="item__d">Une prochaine étape simple + un RDV si besoin.</div>
            </div>
          </li>
        </ul>
        <div class="row">
          <span class="badge badge--accent"><b>Astuce</b> : tu peux noter les infos importantes au fur et à mesure.</span>
        </div>
      `
    },

    {
      id: "s3",
      title: "Map-Ta-Mob : la carte de ta réalité",
      kicker: "Outil pédagogique • pas un test",
      body: `
        <p class="p">Tu ne “rates” rien. On veut juste voir <b>ce qui bloque</b> et <b>ce qui serait possible</b> si on active les bons leviers.</p>
        <div class="grid cols-2">
          <div class="card card--soft">
            <div class="card__title">📍 Ce que tu vas placer</div>
            <div class="card__meta">
              • Ton point de départ<br>
              • Les lieux importants (travail/formation/santé/démarches)<br>
              • Tes moyens actuels<br>
              • Tes freins (coût, horaires, fatigue, dépendance…)
            </div>
          </div>
          <div class="card card--soft">
            <div class="card__title">✅ Ce qu’on obtient</div>
            <div class="card__meta">
              • Un diagnostic clair<br>
              • Des solutions “par situation”<br>
              • Un support pour ton conseiller (plus rapide, plus juste)
            </div>
          </div>
        </div>
        <div class="row">
          <a class="btn btn--accent" href="https://mlpb-tools.github.io/Map-Ta-Mob/" target="_blank" rel="noreferrer">Ouvrir Map-Ta-Mob</a>
          <span class="badge"><b>Raccourci</b> : <kbd>M</kbd></span>
        </div>
      `
    },

    {
      id: "s4",
      title: "Diagnostic express (2 minutes)",
      kicker: "Mini quiz",
      body: `
        <p class="p">Réponds vite : ça nous aide à t’orienter vers les bonnes solutions.</p>
        <div class="grid cols-2">
          <div class="card">
            <div class="card__title">1) Distance principale</div>
            <select class="select" id="qDistance">
              <option value="">— Choisir —</option>
              <option value="court">0–5 km (proche)</option>
              <option value="moyen">5–20 km (moyen)</option>
              <option value="loin">20 km+ (loin)</option>
            </select>
            <div class="small">Ex : maison → lieu de travail/formation</div>
          </div>
          <div class="card">
            <div class="card__title">2) Ton frein #1</div>
            <select class="select" id="qFrein">
              <option value="">— Choisir —</option>
              <option value="cout">Coût</option>
              <option value="horaires">Horaires / correspondances</option>
              <option value="pasdevehicule">Pas de véhicule</option>
              <option value="stress">Stress / fatigue / sécurité</option>
            </select>
            <div class="small">On choisit ensuite les leviers utiles</div>
          </div>
        </div>
        <div class="row">
          <button class="btn btn--accent" id="btnQuiz" type="button">Voir mes pistes</button>
          <span class="badge badge--warn" id="quizResult">—</span>
        </div>
      `
    },

    {
      id: "s5",
      title: "Carte (option) : embed rapide",
      kicker: "Si tu veux afficher l’outil dans la slide",
      body: `
        <p class="p">Selon le navigateur/réseau, l’embed peut être bloqué. Sinon tu peux ouvrir dans un onglet.</p>
        <div class="embed">
          <iframe src="https://mlpb-tools.github.io/Map-Ta-Mob/" title="Map-Ta-Mob"></iframe>
        </div>
      `
    },

    // --- À partir d’ici : “slide 12” logique = on entre dans les solutions du book, mais on garde un préambule ---
    {
      id: "s6",
      title: "On passe aux solutions (selon ton cas)",
      kicker: "Book Mobilités 2025 • vulgarisé",
      body: `
        <p class="p">Tu vas voir <b>toutes les solutions utiles</b> du book, en version simple : <b>à quoi ça sert</b>, <b>pour qui</b>, <b>comment</b>, <b>quelles pièces</b>.</p>
        <div class="grid cols-3">
          <div class="card"><div class="card__title">🪪 Permis</div><div class="card__meta">Code + conduite + aides.</div></div>
          <div class="card"><div class="card__title">🚗 Voiture</div><div class="card__meta">Déplacements, assurance, réparation, location.</div></div>
          <div class="card"><div class="card__title">🚌 Transport</div><div class="card__meta">Txik Txak, TER, carte solidaire, covoiturage.</div></div>
        </div>
        <div class="callout">
          <strong>Important</strong>
          <p>On choisit une solution seulement si elle aide ton insertion (emploi/formation/démarches), pas “juste pour avoir un véhicule”.</p>
        </div>
      `
    },

    // =========================
    // SLIDE “12” DEMANDÉE : détail à partir d’ici
    // =========================

    {
      id: "s12",
      title: "Aide #1 : Aide aux déplacements (jusqu’à 450€/12 mois)",
      kicker: "Fonds départementaux • Déplacements",
      body: aidSlide("dept_deplacements", "Quand c’est utile ? Quand tu dois te déplacer pour un truc important (emploi/formation/médical/justice/entretien).")
    },

    {
      id: "s13",
      title: "Aide #2 : Réparation véhicule (jusqu’à 500€)",
      kicker: "Fonds départementaux • Réparation",
      body: aidSlide("dept_reparation", "Quand c’est utile ? Quand ton véhicule est indispensable pour ton insertion et qu’une réparation bloque tout.")
    },

    {
      id: "s14",
      title: "Aide #3 : Assurance véhicule (jusqu’à 350€)",
      kicker: "Fonds départementaux • Assurance",
      body: aidSlide("dept_assurance", "Quand c’est utile ? Quand l’assurance est un frein immédiat à ta reprise (emploi/formation).")
    },

    {
      id: "s15",
      title: "Aide #4 : Bon de transport (ponctuel)",
      kicker: "Transport en commun • Ponctuel",
      body: aidSlide("dept_bon_transport", "Quand c’est utile ? Pour un déplacement exceptionnel (convocation/urgence) quand tu n’as pas de solution.")
    },

    {
      id: "s16",
      title: "Aide #5 : Achat vélo / 2-roues (jusqu’à 500€)",
      kicker: "Mobilité douce • Autonomie",
      body: aidSlide("dept_velo_2roues", "Quand c’est utile ? Quand la distance est “faisable” et que ça débloque un emploi/formation.")
    },

    {
      id: "s17",
      title: "Aide #6 : Code de la route (jusqu’à 200€)",
      kicker: "Permis • Étape 1",
      body: aidSlide("dept_code", "Quand c’est utile ? Si le code est le premier gros blocage, et que tu peux le passer rapidement.")
    },

    {
      id: "s18",
      title: "Aide #7 : Heures de conduite (jusqu’à 35h / 90%)",
      kicker: "Permis • Étape 2",
      body: aidSlide("dept_conduite", "Quand c’est utile ? Après le code, pour financer une partie des heures si ton projet est solide.")
    },

    {
      id: "s19",
      title: "Solution : Location véhicule (intérimaires) – FASTT",
      kicker: "Intérim • Location à prix réduit",
      body: aidSlide("fastt_location", "Quand c’est utile ? Si tu es intérimaire et qu’un véhicule te manque pour accepter une mission.")
    },

    {
      id: "s20",
      title: "Solution : France Travail – aide mobilité (recherche d’emploi)",
      kicker: "France Travail • Entretien / concours / immersion",
      body: aidSlide("ft_mobilite", "Quand c’est utile ? Si tu dois te déplacer loin (distance/temps) pour une action de recherche d’emploi.")
    },

    {
      id: "s21",
      title: "Solution : Microcrédit personnel (mobilité)",
      kicker: "Financement • Crédit accompagné",
      body: aidSlide("microcredit", "Quand c’est utile ? Si tu as besoin d’un budget (achat/réparation/permis) et que la banque dit non.")
    },

    {
      id: "s22",
      title: "Solution : ADIE – prêt mobilité (jusqu’à 6 000€)",
      kicker: "Financement • Prêt",
      body: aidSlide("adie_pret", "Quand c’est utile ? Si tu peux rembourser un petit prêt et qu’un garant est possible (selon conditions).")
    },

    {
      id: "s23",
      title: "Solution : Txik Txak – tarification solidaire",
      kicker: "Pays Basque • Réductions transport",
      body: aidSlide("txik_solid", "Quand c’est utile ? Si tu peux utiliser bus/tram’bus/TAD mais que le prix est le frein.")
    },

    {
      id: "s24",
      title: "Solution : Txik Txak – covoiturage (BlaBlaCar Daily)",
      kicker: "Covoiturage • Gratuité passager",
      body: aidSlide("txik_covoit", "Quand c’est utile ? Si les transports ne collent pas aux horaires et qu’un covoit est possible.")
    },

    {
      id: "s25",
      title: "Solution : Txik Txak – TAD / TPMR / Combiné TER",
      kicker: "Services • TAD/TPMR/TER",
      body: aidSlide("txik_tad_tpmr", "Quand c’est utile ? Si tu es en zone mal desservie (TAD) ou si tu as besoin d’un service adapté (TPMR).")
    },

    {
      id: "s26",
      title: "Solution : Carte Solidaire TER Nouvelle-Aquitaine (SNCF)",
      kicker: "Région NA • -80%",
      body: aidSlide("carte_solidaire_ter", "Quand c’est utile ? Si tu dois voyager en TER/cars régionaux et que ton QF (ou ton statut) te rend éligible.")
    },

    {
      id: "s27",
      title: "À connaître : ZFE / Crit’Air",
      kicker: "Règles • Anticiper",
      body: aidSlide("zfe_critair", "Pourquoi c’est utile ? Pour éviter une galère : voiture non autorisée sur un trajet clé.")
    },

    {
      id: "s28",
      title: "À connaître : Permis international",
      kicker: "Étranger • Selon pays",
      body: aidSlide("permis_international", "Pourquoi c’est utile ? Si tu dois conduire à l’étranger (selon règles du pays).")
    },

    {
      id: "s29",
      title: "À connaître : Reconnaissance d’un permis étranger",
      kicker: "Équivalence • Démarches",
      body: aidSlide("permis_etranger", "Pourquoi c’est utile ? Si tu as déjà un permis, mais qu’il faut le rendre valable en France.")
    },

    {
      id: "s30",
      title: "Autres permis : AM / ASR",
      kicker: "2-roues • Sécurité routière",
      body: aidSlide("permis_am_asr", "Pourquoi c’est utile ? Pour débloquer un 2-roues (selon âge) ou sécuriser l’accès au permis.")
    },

    {
      id: "s31",
      title: "Micro-mobilité : trottinette électrique",
      kicker: "Courte distance • Règles",
      body: aidSlide("trottinette", "Pourquoi c’est utile ? Sur des trajets courts, si tu peux circuler en sécurité et légalement.")
    },

    {
      id: "s32",
      title: "Alternative : permis voiturette",
      kicker: "Option • Selon profil",
      body: aidSlide("voiturette", "Pourquoi c’est utile ? Comme alternative (selon réglementation et situation).")
    },

    {
      id: "s33",
      title: "Plan d’action (simple)",
      kicker: "En 3 étapes",
      body: `
        <div class="grid cols-3">
          <div class="card">
            <div class="card__title">1) Je clarifie</div>
            <div class="card__meta">Je termine Map-Ta-Mob + je note mon frein #1.</div>
          </div>
          <div class="card">
            <div class="card__title">2) Je choisis</div>
            <div class="card__meta">Je sélectionne 1 solution “effet immédiat” + 1 solution “durable”.</div>
          </div>
          <div class="card">
            <div class="card__title">3) J’active</div>
            <div class="card__meta">Je rassemble les pièces + je prends un RDV conseiller.</div>
          </div>
        </div>
        <div class="callout">
          <strong>Règle d’or</strong>
          <p>On vise un premier débloquage rapide (ex : bus/covoit) pendant qu’on prépare le durable (ex : permis / 2-roues / financement).</p>
        </div>
        <div class="row">
          <button class="btn btn--accent" id="btnBuildRecap" type="button">Générer mon récap</button>
          <span class="badge" id="recapStatus">—</span>
        </div>
      `
    },

    {
      id: "s34",
      title: "On reste en contact",
      kicker: "Mission Locale Pays Basque",
      body: `
        <p class="p">Si la mobilité bloque ton insertion, ce n’est pas “ta faute”. On va chercher la solution la plus réaliste, au bon moment.</p>
        <div class="grid cols-2">
          <div class="card">
            <div class="card__title">✅ À faire maintenant</div>
            <div class="card__meta">
              • Finaliser Map-Ta-Mob<br>
              • Choisir 1 ou 2 solutions<br>
              • Préparer les pièces clés
            </div>
          </div>
          <div class="card">
            <div class="card__title">📅 Prochaine étape</div>
            <div class="card__meta">
              Prendre rendez-vous avec ton conseiller pour activer la solution adaptée.
            </div>
          </div>
        </div>
      `
    }
  ];

  // Helpers
  function aidSlide(aidKey, intro){
    const a = AIDES[aidKey];
    if(!a) return `<p class="p">Aide introuvable.</p>`;

    const tagBadges = (a.tags || []).map(t => `<span class="badge badge--accent"><b>${escapeHtml(t)}</b></span>`).join(" ");

    const mkList = (arr) => (arr && arr.length)
      ? `<ul class="list">${arr.map(x => `
        <li class="item">
          <div class="item__icon">✓</div>
          <div class="item__txt">
            <div class="item__t">${escapeHtml(x)}</div>
          </div>
        </li>`).join("")}</ul>`
      : `<p class="p">—</p>`;

    const mkBullets = (arr) => (arr && arr.length)
      ? `<ul class="list">${arr.map(x => `
        <li class="item">
          <div class="item__icon">•</div>
          <div class="item__txt">
            <div class="item__t">${escapeHtml(x)}</div>
          </div>
        </li>`).join("")}</ul>`
      : `<p class="p">—</p>`;

    const docs = (a.docs && a.docs.length) ? a.docs.map(d => `<span class="pill" data-pill="1">${escapeHtml(d)}</span>`).join("") : "";

    return `
      <p class="p">${escapeHtml(intro)}</p>
      <div class="row">${tagBadges}</div>

      <div class="grid cols-2">
        <div class="card">
          <div class="card__title">🧠 Pour qui ?</div>
          <div class="card__meta">${mkBullets(a.who)}</div>
        </div>
        <div class="card">
          <div class="card__title">🎁 Ça sert à quoi ?</div>
          <div class="card__meta">${mkBullets(a.what)}</div>
        </div>
      </div>

      <div class="grid cols-2">
        <div class="card">
          <div class="card__title">🛠️ Comment ça marche ?</div>
          <div class="card__meta">${mkBullets(a.how)}</div>
        </div>
        <div class="card">
          <div class="card__title">📄 Pièces souvent demandées</div>
          <div class="card__meta">
            <div class="pills">${docs || `<span class="small">—</span>`}</div>
          </div>
        </div>
      </div>

      ${(a.notes && a.notes.length) ? `
        <div class="callout">
          <strong>À savoir</strong>
          <p>${a.notes.map(escapeHtml).join("<br>")}</p>
        </div>
      ` : ""}

      <div class="row">
        <button class="btn" type="button" data-open-aid="${escapeHtml(aidKey)}">Voir en fiche</button>
        <span class="badge"><b>Astuce</b> : clique “Copier récap” en bas quand tu veux.</span>
      </div>
    `;
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // Rendering
  const deck = document.getElementById("deck");
  const slideIndexEl = document.getElementById("slideIndex");
  const slideTotalEl = document.getElementById("slideTotal");
  const progressBar = document.getElementById("progressBar");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnOverview = document.getElementById("btnOverview");
  const btnHelp = document.getElementById("btnHelp");
  const btnCopyRecap = document.getElementById("btnCopyRecap");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const drawer = document.getElementById("drawer");
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerBody = document.getElementById("drawerBody");

  let idx = 0;

  function renderSlides(){
    deck.innerHTML = SLIDES.map((s, i) => `
      <section class="slide ${i===0 ? "is-active" : ""}" data-i="${i}" aria-label="Slide ${i+1}">
        <div class="slide__inner">
          <div class="kicker"><span class="dot"></span> ${escapeHtml(s.kicker || "")}</div>
          <h1 class="${(i===0 || (s.title||"").length<36) ? "h1" : "h2"}">${escapeHtml(s.title || "")}</h1>
          <div class="hr"></div>
          <div class="content">${s.body || ""}</div>
          <div class="spacer"></div>
          <div class="row">
            <span class="badge"><b>Navigation</b> : <kbd>←</kbd> <kbd>→</kbd> • <kbd>O</kbd> sommaire • <kbd>H</kbd> aide • <kbd>C</kbd> copier récap</span>
          </div>
        </div>
      </section>
    `).join("");

    slideTotalEl.textContent = String(SLIDES.length);
    updateUI();
  }

  function goto(i){
    const next = Math.max(0, Math.min(SLIDES.length-1, i));
    if(next === idx) return;

    const curEl = deck.querySelector(`.slide[data-i="${idx}"]`);
    const nextEl = deck.querySelector(`.slide[data-i="${next}"]`);
    if(curEl) curEl.classList.remove("is-active");
    if(nextEl) nextEl.classList.add("is-active");
    idx = next;
    updateUI();
  }

  function updateUI(){
    slideIndexEl.textContent = String(idx + 1);
    const pct = ((idx+1) / SLIDES.length) * 100;
    progressBar.style.width = pct.toFixed(2) + "%";
  }

  // Modal
  function openModal(title, html){
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal(){
    modal.setAttribute("aria-hidden", "true");
    modalBody.innerHTML = "";
  }
  modal.addEventListener("click", (e)=>{
    const t = e.target;
    if(t && t.getAttribute && t.getAttribute("data-close")==="1") closeModal();
  });

  // Drawer (overview/help)
  function openDrawer(title, html){
    drawerTitle.textContent = title;
    drawerBody.innerHTML = html;
    drawer.setAttribute("aria-hidden","false");
  }
  function closeDrawer(){
    drawer.setAttribute("aria-hidden","true");
    drawerBody.innerHTML = "";
  }
  drawer.addEventListener("click",(e)=>{
    const t = e.target;
    if(t && t.getAttribute && t.getAttribute("data-dclose")==="1") closeDrawer();
  });

  function buildTOC(){
    return `
      <div class="toc">
        ${SLIDES.map((s,i)=>`
          <button class="toc__btn" type="button" data-goto="${i}">
            ${escapeHtml(s.title || ("Slide "+(i+1)))}
            <small>${escapeHtml(s.kicker || "")}</small>
          </button>
        `).join("")}
      </div>
    `;
  }

  function buildHelp(){
    return `
      <div class="card">
        <div class="card__title">Raccourcis</div>
        <div class="card__meta">
          <div class="row">
            <span class="badge"><b>←</b> / <b>→</b> : slide</span>
            <span class="badge"><b>O</b> : sommaire</span>
            <span class="badge"><b>H</b> : aide</span>
            <span class="badge"><b>C</b> : copier récap</span>
            <span class="badge"><b>M</b> : Map-Ta-Mob</span>
            <span class="badge"><b>Esc</b> : fermer fenêtre</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card__title">Comment utiliser ce support</div>
        <div class="card__meta">
          1) Fais le diagnostic sur Map-Ta-Mob.<br>
          2) Reviens ici et clique sur les aides qui correspondent.<br>
          3) Génère un récap en fin (ou copie quand tu veux).<br>
        </div>
      </div>
    `;
  }

  // Recap builder (simple)
  function getRecapText(){
    const qD = document.getElementById("qDistance")?.value || "";
    const qF = document.getElementById("qFrein")?.value || "";
    const quiz = document.getElementById("quizResult")?.textContent || "";

    const lines = [];
    lines.push("RÉCAP MOBILITÉ – Webinaire");
    if(qD) lines.push(`- Distance : ${qD}`);
    if(qF) lines.push(`- Frein principal : ${qF}`);
    if(quiz && quiz!=="—") lines.push(`- Pistes proposées : ${quiz}`);

    lines.push("");
    lines.push("Lien Map-Ta-Mob : https://mlpb-tools.github.io/Map-Ta-Mob/");
    lines.push("Aides/solutions vues :");
    Object.keys(AIDES).forEach(k=>{
      const a = AIDES[k];
      lines.push(`- ${a.title}`);
    });
    return lines.join("\n");
  }

  async function copyRecap(){
    const txt = getRecapText();
    try{
      await navigator.clipboard.writeText(txt);
      toast("Récap copié ✅");
    }catch{
      openModal("Copier le récap", `<pre style="white-space:pre-wrap; margin:0">${escapeHtml(txt)}</pre>`);
    }
  }

  // Toast (mini)
  let toastTimer = null;
  function toast(msg){
    clearTimeout(toastTimer);
    const el = document.createElement("div");
    el.className = "chip";
    el.style.position = "fixed";
    el.style.left = "18px";
    el.style.bottom = "64px";
    el.style.zIndex = "9999";
    el.style.background = "rgba(0,0,0,.35)";
    el.style.backdropFilter = "blur(10px)";
    el.innerHTML = msg;
    document.body.appendChild(el);
    toastTimer = setTimeout(()=> el.remove(), 1800);
  }

  // Events
  btnPrev.addEventListener("click", ()=>goto(idx-1));
  btnNext.addEventListener("click", ()=>goto(idx+1));

  btnOverview.addEventListener("click", ()=>{
    openDrawer("Sommaire", buildTOC());
  });
  btnHelp.addEventListener("click", ()=>{
    openDrawer("Aide", buildHelp());
  });

  btnCopyRecap.addEventListener("click", copyRecap);

  // Delegation (open aid modal / toc goto / quiz)
  document.addEventListener("click", (e)=>{
    const t = e.target;

    // TOC goto
    const g = t?.getAttribute?.("data-goto");
    if(g !== null && g !== undefined){
      const i = Number(g);
      if(Number.isFinite(i)){
        closeDrawer();
        goto(i);
      }
    }

    // Open aid fiche
    const aidKey = t?.getAttribute?.("data-open-aid");
    if(aidKey && AIDES[aidKey]){
      const a = AIDES[aidKey];
      openModal(a.title, `
        <div class="card">
          <div class="card__title">🎁 À quoi ça sert ?</div>
          <div class="card__meta">${(a.what||[]).map(escapeHtml).join("<br>")}</div>
        </div>
        <div class="card">
          <div class="card__title">🧠 Pour qui ?</div>
          <div class="card__meta">${(a.who||[]).map(escapeHtml).join("<br>")}</div>
        </div>
        <div class="card">
          <div class="card__title">🛠️ Comment ?</div>
          <div class="card__meta">${(a.how||[]).map(escapeHtml).join("<br>")}</div>
        </div>
        ${(a.notes && a.notes.length) ? `
          <div class="card">
            <div class="card__title">ℹ️ À savoir</div>
            <div class="card__meta">${a.notes.map(escapeHtml).join("<br>")}</div>
          </div>
        ` : ""}
        ${(a.docs && a.docs.length) ? `
          <div class="card">
            <div class="card__title">📄 Pièces utiles</div>
            <div class="card__meta">${a.docs.map(escapeHtml).join("<br>")}</div>
          </div>
        ` : ""}
      `);
    }

    // Quiz
    if(t && t.id === "btnQuiz"){
      const d = document.getElementById("qDistance")?.value || "";
      const f = document.getElementById("qFrein")?.value || "";
      const out = document.getElementById("quizResult");
      if(!out) return;

      if(!d || !f){
        out.textContent = "Choisis distance + frein 👆";
        return;
      }

      const picks = [];
      if(d === "court"){
        picks.push("Vélo/2-roues (si réaliste)");
        picks.push("Txik Txak (tarif solidaire)");
      }else if(d === "moyen"){
        picks.push("Txik Txak + covoiturage");
        picks.push("Aide déplacements (selon motifs)");
      }else{
        picks.push("Covoiturage / voiture (si indispensable)");
        picks.push("France Travail aide mobilité (si éligible)");
      }

      if(f === "cout"){
        picks.unshift("Tarification solidaire / Carte solidaire TER");
        picks.push("Microcrédit / prêt (si besoin)");
      }
      if(f === "horaires"){
        picks.unshift("Covoiturage (BlaBlaCar Daily) ou TAD");
      }
      if(f === "pasdevehicule"){
        picks.unshift("FASTT (si intérim) / solutions transport + covoit");
      }
      if(f === "stress"){
        picks.unshift("Solution la plus simple (1 changement) + accompagnement");
      }

      out.textContent = picks.slice(0,3).join(" • ");
      toast("Pistes affichées ✅");
    }

    // Recap generator
    if(t && t.id === "btnBuildRecap"){
      const s = document.getElementById("recapStatus");
      if(s) s.textContent = "Récap prêt → clique “Copier récap”";
      toast("Récap prêt ✅");
    }
  });

  // Keyboard
  document.addEventListener("keydown", (e)=>{
    if(e.key === "ArrowRight") goto(idx+1);
    if(e.key === "ArrowLeft") goto(idx-1);
    if(e.key === "Escape"){ closeModal(); closeDrawer(); }
    if(e.key.toLowerCase() === "o") openDrawer("Sommaire", buildTOC());
    if(e.key.toLowerCase() === "h") openDrawer("Aide", buildHelp());
    if(e.key.toLowerCase() === "c") copyRecap();
    if(e.key.toLowerCase() === "m") window.open("https://mlpb-tools.github.io/Map-Ta-Mob/", "_blank", "noreferrer");
  });

  // Close drawer on click buttons
  drawerBody.addEventListener("click",(e)=>{
    const t = e.target;
    if(t && t.classList && t.classList.contains("toc__btn")) return;
  });

  // Modal close button
  document.getElementById("modalClose").addEventListener("click", closeModal);

  // Init
  renderSlides();

})();
