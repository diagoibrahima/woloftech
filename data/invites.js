// Personnes passées dans le podcast. À modifier librement.
// Pour un nouvel invité, ajouter une ligne et mettre l'id de l'épisode dans `episodes`
// (les id sont visibles dans data/episodes.js : S15E5, S8E1P1, SNDE1...).
// Liens possibles : linkedin, instagram, facebook, x. Omettre ceux qu'on ne connaît pas.
window.WT_SECTEURS = [
  { id: 'ia', nom: 'Intelligence artificielle et data' },
  { id: 'dev', nom: 'Développement logiciel' },
  { id: 'cyber', nom: 'Cybersécurité' },
  { id: 'cloud', nom: 'Cloud, systèmes et télécoms' },
  { id: 'fintech', nom: 'Fintech, blockchain et crypto' },
  { id: 'startup', nom: 'Startups et entrepreneuriat' },
  { id: 'iot', nom: 'IoT, XR et hardware' },
  { id: 'education', nom: 'Éducation et formation' },
  { id: 'recherche', nom: 'Recherche et université' },
  { id: 'creation', nom: 'Création numérique, design et jeu vidéo' },
  { id: 'communaute', nom: 'Communautés tech' },
  { id: 'societe', nom: 'Institutions, société et environnement' }
];

var LI = 'https://www.linkedin.com/in/', TW = 'https://x.com/', IG = 'https://www.instagram.com/', FB = 'https://www.facebook.com/';

window.WT_INVITES = [
  // Intelligence artificielle et data
  { nom: 'Elias Waly Ba', role: 'Ingénieur IA et enseignant, cofondateur de GalsenAI', secteur: 'ia', episodes: ['S6E12', 'S4E8', 'S4E4', 'S4E1'], linkedin: LI + 'eliaswalyba/', x: TW + 'eliaswalyba' },
  { nom: 'Djibril Ndoye', role: 'Spécialiste en transformation digitale et IA', secteur: 'ia', episodes: ['S14E5', 'S14E3'] },
  { nom: 'Ndiaye Dia', role: 'Expert en intelligence artificielle et innovation', secteur: 'ia', episodes: ['S13E6', 'S12E2'] },
  { nom: 'Djim Momar Lo', role: 'Cofondateur de Photon et de Process One Tech', secteur: 'ia', episodes: ['S8E9', 'S7E4'], linkedin: LI + 'djim-momar-lo-979798201/', x: TW + 'lo_jimy' },
  { nom: 'Derguene Mbaye', role: 'NLP Research Engineer, cofondateur de GalsenAI', secteur: 'ia', episodes: ['S7E10'] },
  { nom: 'Daouda Djiba', role: 'Cofondateur de GalsenAI', secteur: 'ia', episodes: ['S7E10'] },
  { nom: 'Thierno Ibrahima Diop', role: 'Data scientist', secteur: 'ia', episodes: ['S5E4'], linkedin: LI + 'thierno-ibrahima-diop-810467106/', x: TW + 'bayethiernodiop' },
  { nom: 'Papa Séga Wade', role: 'Data scientist', secteur: 'ia', episodes: ['S5E3'], linkedin: LI + 'papa-s%C3%A9ga-wade-a5727513a/', x: TW + 'papasegaw' },
  { nom: 'Mbaye Babacar Gueye', role: 'PhD en informatique et analyse de données', secteur: 'ia', episodes: ['S5E1'], linkedin: LI + 'mbgueye/', x: TW + 'mbayebgueye' },
  { nom: 'Awa Ly', role: 'Ingénieure informaticienne et data scientist', secteur: 'ia', episodes: ['S4E7'], linkedin: LI + 'awa-ly-a60a14152/', x: TW + 'LaFilleDeRouba' },

  // Développement logiciel
  { nom: 'Ady Ngom', role: 'Développeur web et mobile senior', secteur: 'dev', episodes: ['S14E2', 'S4E4', 'S4E3'], x: TW + 'adyngom' },
  { nom: 'Ndongo Samb', role: 'Développeur', secteur: 'dev', episodes: ['S14E1', 'S4E7'], linkedin: LI + 'ndongo-tonux-samb/', x: TW + 'tonux_samb' },
  { nom: 'Thiaba Diop', role: 'Ingénieure logiciel, développeuse mobile', secteur: 'dev', episodes: ['S11E9', 'S10E3', 'S7E12P2', 'S4E4', 'S2E4'], linkedin: LI + 'thiaba-diop/', x: TW + 'MimiStic_sn' },
  { nom: 'Ibrahima Ciss', role: 'Développeur iOS, créateur de Waxtu Salat', secteur: 'dev', episodes: ['S8E11', 'S8E10', 'S4E4', 'S2E4'], linkedin: LI + 'bionik6/', x: TW + 'bionik6' },
  { nom: 'Ibrahima Ndiaye', role: 'Développeur Java senior, créateur de KayDev221', secteur: 'dev', episodes: ['S8E4'], linkedin: LI + 'ibrahima-ndiaye-937501140/', x: TW + 'ibrahim2ndiaye' },
  { nom: 'Franceline Daba Dione', role: 'CTO de Wutiko', secteur: 'dev', episodes: ['S7E12P2'], linkedin: LI + 'franceline-daba-dione/', x: TW + 'fdabadione' },
  { nom: 'Anta Dieye', role: 'Ingénieure études et développement', secteur: 'dev', episodes: ['S7E12P2'], linkedin: LI + 'anta-dieye-57619b120/', x: TW + 'AnitaDieye' },
  { nom: 'Fatoumata Caroline Ndiaye', role: 'Ingénieure informatique, formatrice et entrepreneure', secteur: 'dev', episodes: ['S7E12P2'], linkedin: LI + 'fatoumata-caroline-ndiaye-5a9bb6a1/' },
  { nom: 'Sadio Sanghare', role: 'Responsable du pôle web chez Volkeno', secteur: 'dev', episodes: ['S7E7'], linkedin: LI + 'sadio-sanghare-developpeur-fullstack/', x: TW + 'sadiosan23' },
  { nom: 'Mouhamadou Mansour Dramé', role: 'Coach agile', secteur: 'dev', episodes: ['S4E9'], linkedin: LI + 'mohamadou-mansour-dram%C3%A9-0aa167a9/', x: TW + 'mmansour_drame' },
  { nom: 'Ngor Seck', role: 'Fondateur de Samane MVC', secteur: 'dev', episodes: ['S4E6'], x: TW + 'NgorSeck' },
  { nom: 'Alioune Kanouté', role: 'Développeur fullstack', secteur: 'dev', episodes: ['S4E5'], linkedin: LI + 'alioune-kanoute-0a2382171/', x: TW + 'alioune_kanoute' },
  { nom: 'Demba Fall', role: 'Ingénieur R&D', secteur: 'dev', episodes: ['S4E4', 'S1E5'], x: TW + 'Demb_is' },

  // Cybersécurité
  { nom: 'Gérard Dacosta', role: 'Ingénieur en sécurité informatique', secteur: 'cyber', episodes: ['S14E4', 'S9E5', 'S9E4', 'S4E13', 'S4E4', 'S2E4'], linkedin: LI + 'g%C3%A9rard-joseph-francisco-dacosta-49865a155/', x: TW + 'DacostaGerard' },
  { nom: 'Abdoulaye Ly', role: 'Le berger Hi-Tech', secteur: 'cyber', episodes: ['S14E4', 'S11E11'] },
  { nom: 'Moustapha Diago', role: 'Expert en cybersécurité', secteur: 'cyber', episodes: ['S13E5'], linkedin: LI + 'moustaphadiago/', x: TW + 'moustapha_diago' },
  { nom: 'Clément Domingo', role: 'Invité sur les campagnes à l\'ère des algorithmes', secteur: 'cyber', episodes: ['S12E3'] },
  { nom: 'Bamba Bathily', role: 'Analyste en cybersécurité', secteur: 'cyber', episodes: ['S11E2', 'S4E13'], linkedin: LI + 'bamba-bathily-a006b5149/', x: TW + '2b_622_b' },
  { nom: 'Mame Léna Samb', role: 'Intervenante Octobre Cyber et Women TechMakers Dakar', secteur: 'cyber', episodes: ['S10E3', 'S9E2', 'S9E1'], linkedin: LI + 'mame-l%C3%A9na-samb-300aa2213/' },
  { nom: 'Moussa Diedhiou', role: 'Formateur en cybersécurité', secteur: 'cyber', episodes: ['S8E8'], linkedin: LI + 'moussa-diedhiou/', x: TW + 'moussa_diedhiou' },

  // Cloud, systèmes et télécoms
  { nom: 'Mamadou Ndao', role: 'COO de WAW Telecom', secteur: 'cloud', episodes: ['S15E1'] },
  { nom: 'Yaye Fatou', role: 'Ingénieure réseaux chez Orange', secteur: 'cloud', episodes: ['S14E10'] },
  { nom: 'Soukeynatou', role: 'Responsable du Orange 5G Lab', secteur: 'cloud', episodes: ['S14E10'] },
  { nom: 'Mohamed Mbengue', role: 'DevOps et expert en sécurité', secteur: 'cloud', episodes: ['S14E4', 'S4E12'], linkedin: LI + 'mohamed-mbengue-250b4b46/', x: TW + 'MohamedMbengu18' },
  { nom: 'Mamadou Diagne', role: 'Communauté Linux Sénégal', secteur: 'cloud', episodes: ['S8E6'], linkedin: LI + 'dofbi/', x: TW + 'dofbi' },
  { nom: 'Seydina Issa Pate', role: 'Auditeur IT', secteur: 'cloud', episodes: ['S8E7'], linkedin: LI + 'seydina-issa-pate-04b85b41/' },
  { nom: 'Ibrahima Mbodji', role: 'Formateur certifié sur les technologies cloud Microsoft', secteur: 'cloud', episodes: ['S8E3'], linkedin: LI + 'ibnmbodji/', x: TW + 'ibnmbodji' },
  { nom: 'El Hadji Malang Diedhiou', role: 'Consultant en technologies Microsoft', secteur: 'cloud', episodes: ['S8E2'], linkedin: LI + 'supermalang/', x: TW + 'supermalang_' },
  { nom: 'Ismaila Abdoulaye Ndiaye', role: 'Business system analyst', secteur: 'cloud', episodes: ['S8E1P2', 'S8E1P1'], linkedin: LI + 'iandiaye/', x: TW + 'iandiaye' },
  { nom: 'Arona Ba', role: 'Chef de projet cloud', secteur: 'cloud', episodes: ['S4E12'], linkedin: LI + 'arona-ba-96a01152/', x: TW + 'RealAronaBa' },
  { nom: 'Gora Faye', role: 'Analyste cloud, coordinateur de la communauté Tele_net', secteur: 'cloud', episodes: ['S4E11'], linkedin: LI + 'gora-faye-402581167/', x: TW + 'gora_attidjani' },

  // Fintech, blockchain et crypto
  { nom: 'Mariama Ndiaye', role: 'Fondatrice et CEO de The UpTribe, éducation financière', secteur: 'fintech', episodes: ['S15E2'], linkedin: LI + 'mariamandiayethemoneycoach/', facebook: FB + 'UpTribeco' },
  { nom: 'Oumar Diallo', role: 'Expert fintech, fondateur de Fintra', secteur: 'fintech', episodes: ['S14E8'] },
  { nom: 'Serigne Falilou Mbacké Cissé', role: 'Directeur des relations publiques de Wave Sénégal', secteur: 'fintech', episodes: ['S14E7'] },
  { nom: 'Idy Seck', role: 'Fondateur de Xamlé Bitcoin', secteur: 'fintech', episodes: ['S11E10'] },
  { nom: 'Sébastien Ramos', role: 'Entrepreneur, Dakar Bitcoin Days', secteur: 'fintech', episodes: ['S11E10'] },
  { nom: 'Babou Ndoye', role: 'Expert fintech', secteur: 'fintech', episodes: ['S10E5'], linkedin: LI + 'babou-ndoye-0b253477/', x: TW + 'boyleboundoye' },
  { nom: 'Daouda Deme', role: 'Invité sur la fintech', secteur: 'fintech', episodes: ['S10E1'], linkedin: LI + 'daouda-deme-97b9ab39/' },
  { nom: 'Fodé Diop', role: 'Blockchain Software Engineer', secteur: 'fintech', episodes: ['S6E12', 'S6E3', 'S6E2'], linkedin: LI + 'fod%C3%A9-diop/', x: TW + 'diopfode' },
  { nom: 'Bineta Ngom', role: 'CEO de Bleu Comme La MER', secteur: 'fintech', episodes: ['S6E3', 'S6E2'], linkedin: LI + '%E2%82%BFineta-ngom-a3744b179/', x: TW + 'block_sen' },
  { nom: 'Sidiki Tall', role: 'Directeur projet et innovation à l\'ATPS', secteur: 'fintech', episodes: ['S6E11'], linkedin: LI + 'sidiki-tall-06367023/', x: TW + 'sidikitall' },
  { nom: 'Papa Mbaye Tine', role: 'Service architect à la Sonatel', secteur: 'fintech', episodes: ['S6E10'], linkedin: LI + 'papambaye/', x: TW + 'tinepapa' },
  { nom: 'Pape Demba Kane', role: 'Entrepreneur et investisseur', secteur: 'fintech', episodes: ['S6E5'], instagram: IG + 'preezeh/', x: TW + 'preezehD' },
  { nom: 'Seydina Diouf', role: 'Software engineer', secteur: 'fintech', episodes: ['S6E5'], linkedin: LI + 'seydina-baye-ndane-diouf-036606124/', x: TW + 'SeydinaBNDiouf' },

  // Startups et entrepreneuriat
  { nom: 'Moustapha Diop', role: 'Fondateur de SOLID et de MusikBi', secteur: 'startup', episodes: ['S15E3'] },
  { nom: 'Henri Ousmane Gueye', role: 'Cofondateur et CEO d\'Eyone', secteur: 'startup', episodes: ['S14E6', 'S14A6'] },
  { nom: 'Samba Sène', role: 'Fondateur de WISS Africa, coordonnateur du PAENS', secteur: 'startup', episodes: ['S13E1'], linkedin: LI + 'baccsene/' },
  { nom: 'Ibrahima Diop', role: 'Fondateur et CEO d\'IDLABS Studio (Ogadoo)', secteur: 'startup', episodes: ['S10E4'], linkedin: LI + 'ibraah/', instagram: IG + 'ibraah_xyz/' },
  { nom: 'Alex Gbanguidi', role: 'CEO d\'Atypic Digital, Agile Tour Dakar', secteur: 'startup', episodes: ['S11E7'] },
  { nom: 'Mohamed Gueye', role: 'CEO de Futurize', secteur: 'startup', episodes: ['S11E7'] },
  { nom: 'Awa Diawara Diop', role: 'Porteuse du projet Doom Yaye, lauréate POESAM', secteur: 'startup', episodes: ['S9E3'], linkedin: LI + 'ACoAABm7E5UBP-_24Nf0DFmYzkaK_BFSnceMB1k' },
  { nom: 'Diariyata Ndiaye', role: 'Porteuse du projet Sen Diabète, lauréate POESAM', secteur: 'startup', episodes: ['S9E3'], linkedin: LI + 'ACoAACoYcJsBsHMOCQJ49ZFHIt6_C4JNm_aE8yQ' },
  { nom: 'Doudou Mohamet Gaye', role: 'CEO et développeur web chez EDMG', secteur: 'startup', episodes: ['S9E3', 'S7E13'], linkedin: LI + 'doudou-mohamet-gaye-618054149/', x: TW + 'MohametDoudou' },
  { nom: 'Adji Anta Dabo', role: 'Digital manager et développeuse chez Digital Nisa', secteur: 'startup', episodes: ['S7E13'], linkedin: LI + 'ACoAACuOEwQBmRgqCGNC_B938XthwQEu_aidmsE', x: TW + 'Adji_Anta_Dabo' },
  { nom: 'Amadou Lindor Ndiaye', role: 'CEO et chef de projet IT chez Wintech', secteur: 'startup', episodes: ['S7E13'], linkedin: LI + 'lindorndiaye/', x: TW + 'NdiayeLindor' },
  { nom: 'Ndiaga Gaye', role: 'Cofondateur de Sen Ndawal', secteur: 'startup', episodes: ['S7E13'], linkedin: LI + 'ACoAADFu5OIB_wxqcdqzC9V9VkiznVLjT27LaTk' },
  { nom: 'Bachir Sarr', role: 'Responsable à WAX (JangWolof)', secteur: 'startup', episodes: ['S6E8'] },
  { nom: 'Moustapha Ndiaye', role: 'Software engineer et data scientist (JangWolof)', secteur: 'startup', episodes: ['S6E8'] },
  { nom: 'Magatte Diallo', role: 'CEO de MagLinCorp (Gnawalma)', secteur: 'startup', episodes: ['S6E4'], linkedin: LI + 'magatte-diallo/', x: TW + 'MagatteDiallo8' },
  { nom: 'Mouhamadou Lamine Kebe', role: 'CEO de Tolbi', secteur: 'startup', episodes: ['S5E5'], linkedin: LI + 'mouhamadou-lamine-kebe-%E7%A9%86%E5%93%88%E9%A9%AC%E6%9D%9C-%E5%87%AF%E6%AF%94-25177180/', facebook: FB + 'freshh.beke' },
  { nom: 'Mohamed Thiam', role: 'CEO de Jaba Store', secteur: 'startup', episodes: ['S4E10'], facebook: FB + 'medteck.hacker', x: TW + 'MedteckThiam' },
  { nom: 'Mouhammad Ciss', role: 'Invité sur le e-commerce', secteur: 'startup', episodes: ['S3E4'], linkedin: LI + 'mouhammadciss/', x: TW + 'mouhammadciss' },
  { nom: 'Hyacinthe Sambou', role: 'Invité sur le e-commerce', secteur: 'startup', episodes: ['S3E4'], linkedin: LI + 'hyacinthe-sambou-bab7a280/' },

  // IoT, XR et hardware
  { nom: 'Mouhamed Seck', role: 'Chief Operations Officer chez Venturi', secteur: 'iot', episodes: ['S11E12', 'S8E5'], linkedin: LI + 'mouhamed-seck/' },
  { nom: 'Inssa Touré', role: 'Invité sur les metaverses', secteur: 'iot', episodes: ['S11E12'] },
  { nom: 'Mouhamadou Bamba Ndiaye', role: 'Software et XR Engineer', secteur: 'iot', episodes: ['S8E5'], linkedin: LI + 'mouhamadoubambandiaye/' },
  { nom: 'François Mbengue', role: 'Opérateur machine, startup NAUTX', secteur: 'iot', episodes: ['S11E9', 'S7E14'], linkedin: LI + 'fran%C3%A7ois-mbengue-457a84215/', instagram: IG + 'franc_fgv_the_real_maker', x: TW + 'genievirtuel' },
  { nom: 'Pape El Bekri Diedhiou', role: 'Designer, startup NAUTX', secteur: 'iot', episodes: ['S7E14'], linkedin: LI + 'di%C3%A9dhiou-pape-el-b%C3%A9kri-0a2586190/', instagram: IG + 'creathor_x/', x: TW + 'el_bekri_' },
  { nom: 'Boubacar Santara', role: 'Électronicien, startup NAUTX', secteur: 'iot', episodes: ['S7E14'], linkedin: LI + 'boubacar-santara-/', instagram: IG + 'boubacar_santara/', x: TW + 'aboubacarsanta9' },
  { nom: 'Pape Alioune Guisse', role: 'Développeur, startup NAUTX', secteur: 'iot', episodes: ['S7E14'], linkedin: LI + 'papa-alioune-guisse-b010a3201/', instagram: IG + 'pa_alioune_guisse', x: TW + 'pa_alioun' },
  { nom: 'Faye Ely Manel', role: 'Fondateur et CEO de QSENSE IoT', secteur: 'iot', episodes: ['S6E12'], linkedin: LI + 'faye-ely-manel-b880163/' },
  { nom: 'Penda Fall', role: 'CEO de Smart Weather', secteur: 'iot', episodes: ['S6E7'], x: TW + 'FallPenda18' },
  { nom: 'Mourtalla Mbeguéré', role: 'Fondateur de Fossetic', secteur: 'iot', episodes: ['S5E7'], facebook: FB + 'mourtallambeguere.tassawuf' },
  { nom: 'Mamadou Diallo', role: 'Fab manager chez Orange Digital Center, fondateur de Bloctechno', secteur: 'iot', episodes: ['S5E6'], linkedin: LI + 'diallomm/', facebook: FB + 'mdiallo.md', x: TW + 'diallo_mm' },

  // Éducation et formation
  { nom: 'Ousseynou Diop', role: 'Formateur, fondateur et CEO de Xarala', secteur: 'education', episodes: ['S14E11', 'S11E3', 'S11E2', 'S4E4', 'S1E6'], linkedin: LI + 'xarala221/', x: TW + 'xarala221' },
  { nom: 'Moustapha Diop', role: 'Cofondateur de Jangalma', secteur: 'education', episodes: ['S14E9'] },
  { nom: 'Madou Dembele', role: 'Cofondateur de Jangalma', secteur: 'education', episodes: ['S14E9'] },
  { nom: 'Babacar Fall', role: 'Directeur du BST de Kaolack 2', secteur: 'education', episodes: ['S13E7'], linkedin: LI + 'babacar-fall-919720288/' },
  { nom: 'Nouhou Traoré', role: 'Initiateur de XaléCodage', secteur: 'education', episodes: ['S13E2'] },
  { nom: 'Baye Niass', role: 'Formateur aux métiers du numérique, ex-Sonatel Academy', secteur: 'education', episodes: ['S11E3', 'S5E10'], linkedin: LI + 'baye-niass-53110a10a/', facebook: FB + 'bbniass', x: TW + 'NiassBaye8' },
  { nom: 'Aminata Ly', role: 'Responsable marketing chez Tooshare', secteur: 'education', episodes: ['S7E9'], linkedin: LI + 'aminata-ly-25111280/', x: TW + 'ami_nata_ly' },
  { nom: 'Jean Noël Sarr', role: 'Digital Learning Manager, CEO de Kinnov Tech', secteur: 'education', episodes: ['S4E4', 'S1E7'], linkedin: LI + 'jean-noel-sarr-05424967/', facebook: FB + 'kaolackinnovtech', x: TW + 'WalyNoel' },
  { nom: 'Moustapha Der', role: 'Professeur, auteur du Guide du génie logiciel', secteur: 'education', episodes: ['S5E9'] },

  // Recherche et université
  { nom: 'Dr Ndèye Arame Diago', role: 'Enseignante en informatique, Human Impact ID', secteur: 'recherche', episodes: ['S15E4'] },
  { nom: 'Dr Ibrahima Gueye', role: 'Maître de conférences, fab-manager du Polylab', secteur: 'recherche', episodes: ['S7E15'], linkedin: LI + 'ibrahima-gueye-640b7725/' },
  { nom: 'Abdoulaye Doumbouya', role: 'Doctorant à l\'Université de Thiès', secteur: 'recherche', episodes: ['S7E8'] },
  { nom: 'Yoro Dia', role: 'Doctorant à l\'Université de Thiès', secteur: 'recherche', episodes: ['S7E6'] },
  { nom: 'Pr Ousmane Sall', role: 'Enseignant-chercheur à l\'Université de Thiès', secteur: 'recherche', episodes: ['S7E5'], linkedin: LI + 'ousmane-sall-a2140825/' },
  { nom: 'Camir A. N. Malack', role: 'Doctorant à l\'UASZ', secteur: 'recherche', episodes: ['S7E3'] },
  { nom: 'Sidiya Dieng', role: 'Doctorant à l\'UASZ', secteur: 'recherche', episodes: ['S7E3'] },
  { nom: 'Dr Youssou Dieng', role: 'Enseignant-chercheur à l\'UASZ', secteur: 'recherche', episodes: ['S7E2'] },
  { nom: 'Dr Marie Ndiaye', role: 'Directrice du laboratoire LI3 de l\'UASZ', secteur: 'recherche', episodes: ['S7E1'], linkedin: LI + 'marie-ndiaye-5a5ab145/' },
  { nom: 'Dr Abdoulaye Ndiaye', role: 'Enseignant-chercheur à l\'UGB', secteur: 'recherche', episodes: ['S6E11'], linkedin: LI + 'dr-abdoulaye-ndiaye-693695151/', x: TW + 'ndiaye2017' },
  { nom: 'Mame Maty Sene', role: 'Doctorante à l\'Université de Thiès, tutrice à l\'UVS', secteur: 'recherche', episodes: ['S6E6'], linkedin: LI + 'maty-s%C3%A9ne-kane-ab12b333/', x: TW + 'tymalamine' },
  { nom: 'Kéba Gueye', role: 'Professeur à l\'ESP de Dakar', secteur: 'recherche', episodes: ['S5E7'], linkedin: LI + 'k%C3%A9ba-gueye-94aa00115/', facebook: FB + 'keba.gueye.9' },

  // Création numérique, design et jeu vidéo
  { nom: 'Boubacar Djiba', role: 'Fondateur et CEO de Senmixmaster', secteur: 'creation', episodes: ['S11E13'], linkedin: LI + 'boubacar-djiba-04364149/' },
  { nom: 'Baba Dioum', role: 'Invité sur le jeu vidéo en Afrique', secteur: 'creation', episodes: ['S11E8'] },
  { nom: 'Jean Pierre Seydou Ndaw', role: 'Invité sur le jeu vidéo en Afrique', secteur: 'creation', episodes: ['S11E8'] },
  { nom: 'Thierno Ndiaye', role: 'Invité sur le jeu vidéo en Afrique', secteur: 'creation', episodes: ['S11E8'] },
  { nom: 'Abdoulaye Wone', role: 'Ingénieur du son', secteur: 'creation', episodes: ['S11E6'] },
  { nom: 'Aboubacar Ousmane Ly', role: 'Création vidéo et animation 3D', secteur: 'creation', episodes: ['S11E4'] },
  { nom: 'Ousmane Ndiaye', role: 'Expert en création 2D et 3D', secteur: 'creation', episodes: ['S11E1'] },
  { nom: 'Mouhamadou Der', role: 'Web designer et développeur front', secteur: 'creation', episodes: ['S4E2'], linkedin: LI + 'mouhamadou-der-ba833760/', x: TW + 'derkhadim' },

  // Communautés tech
  { nom: 'Marietou Diedhiou', role: 'Présidente de Daara IT', secteur: 'communaute', episodes: ['S11E11', 'S11E9', 'S11E7', 'S10E6', 'S10E3'] },
  { nom: 'Daouda Ba', role: 'Président de Galsen Dev', secteur: 'communaute', episodes: ['S11E7', 'S10E6', 'S4E5'], linkedin: LI + 'daoodaba975/', x: TW + 'galsendev221' },
  { nom: 'Salihou Ndiaye', role: 'Invité de l\'Agile Tour Dakar', secteur: 'communaute', episodes: ['S11E9'] },
  { nom: 'Serigne Khadim Faye', role: 'Ndogou Coding, Daara IT', secteur: 'communaute', episodes: ['S10E6'] },
  { nom: 'Abdoulaye Ndiaye', role: 'Ndogou Coding, Daara IT', secteur: 'communaute', episodes: ['S10E6'] },
  { nom: 'Anta Gueye Aw', role: 'Ndogou Coding, Daara IT', secteur: 'communaute', episodes: ['S10E6'] },
  { nom: 'Aita Mbaye Diagne', role: 'Women TechMakers Dakar, Daara IT', secteur: 'communaute', episodes: ['S10E6', 'S10E3'] },
  { nom: 'Zeyna Diop', role: 'Blogueuse tech', secteur: 'communaute', episodes: ['S6E3'], linkedin: LI + 'seynabou-diop/', x: TW + 'zeu_ynah' },

  // Institutions, société et environnement
  { nom: 'Abdou Touré', role: '« Tonton Vert », fondateur de Quartier Vert', secteur: 'societe', episodes: ['S15E5'] },
  { nom: 'Banel Sow Ly', role: 'Experte en villes intelligentes', secteur: 'societe', episodes: ['S13E3'] },
  { nom: 'Basile Niane', role: 'Invité sur la fintech et l\'internet au Sénégal', secteur: 'societe', episodes: ['S12E3', 'S11E2', 'S10E1'], linkedin: LI + 'basileniane/' },
  { nom: 'Mamadou Diop Decroix', role: 'Candidat à la présidentielle 2024', secteur: 'societe', episodes: ['S12E1'] },
  { nom: 'Mountaga Cissé', role: 'Invité sur l\'internet et la démocratie', secteur: 'societe', episodes: ['S11E2'], linkedin: LI + 'ACoAAAKXB9sBpy-QunNnKdwzuVikgxeUN8lfMMU' },
  { nom: 'Seydina Issa Aidara', role: 'Entraîneur de football et analyste vidéo', secteur: 'societe', episodes: ['S7E11'] },
  { nom: 'Amadou Korka Sow', role: 'Ingénieur informaticien, foot et tech', secteur: 'societe', episodes: ['S7E11'], x: TW + 'SowGenius' },
  { nom: 'Siradiou Ba', role: 'Chef de la division contentieux à la CDP', secteur: 'societe', episodes: ['S5E2'], linkedin: LI + 'siradiou-ba-734b4631/', x: TW + 'Siradji82' }
];
