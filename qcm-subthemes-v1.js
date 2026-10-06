(()=>{
'use strict';
const VERSION='1.0';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const idNum=(id,prefix)=>String(id||'').startsWith(prefix)?Number(String(id).slice(prefix.length).match(/^\d+/)?.[0]||NaN):NaN;
const between=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
const pick=(id,prefix,ranges)=>{
  const n=idNum(id,prefix);if(!Number.isFinite(n))return '';
  for(const [a,b,label] of ranges)if(between(n,a,b))return label;
  return '';
};
const R={
  biomolecules:q=>pick(q.id,'biomolecules_',[
    [1,10,'Atomes, ions et liaisons'],[11,15,'pH et équilibre acido-basique'],[16,20,'Eau, hydratation et osmose'],
    [21,35,'Minéraux, oligoéléments et vitamines'],[36,50,'Glucides et métabolisme énergétique'],[51,65,'Lipides et lipoprotéines'],
    [66,78,'Protéines et acides aminés'],[79,87,'Enzymes'],[88,100,'ADN, ARN et expression génétique']
  ]),
  cellules_tissus:q=>pick(q.id,'cellules_',[
    [1,15,'Membrane et transports cellulaires'],[16,24,'Cytoplasme et organites'],[25,34,'Communication cellulaire et récepteurs'],
    [35,47,'Tissus et peau'],[48,60,'Sang et hémostase'],[61,66,'Excitabilité et potentiel d’action'],
    [67,78,'Neurones, glie et synapses'],[79,90,'Tissu musculaire et contraction']
  ]),
  niveaux_organisation:q=>pick(q.id,'niveaux_organisation_',[
    [1,8,'Niveaux chimique et cellulaire'],[9,13,'Tissus'],[14,22,'Organes, viscères et membranes'],
    [23,29,'Systèmes de l’organisme'],[30,39,'Anatomie, plans et repères'],[40,50,'Cavités et régions corporelles']
  ]),
  homeostasie:q=>pick(q.id,'homeostasie_',[
    [1,10,'Principes de l’homéostasie et rétrocontrôles'],[11,21,'pH et équilibre acido-basique'],[22,34,'Thermorégulation'],
    [35,48,'Régulation de la glycémie'],[49,57,'Équilibre hydrique et ADH'],[58,70,'Calcium, sodium et potassium']
  ]),
  prevention_ias_asepsie:q=>pick(q.id,'v820_ias_',[
    [1,15,'Micro-organismes, portage et IAS'],[16,30,'Précautions standard, hygiène des mains et EPI'],[31,34,'Accidents d’exposition au sang'],
    [35,44,'Excréta et déchets de soins'],[45,57,'Précautions complémentaires et isolement'],[58,68,'Antisepsie'],
    [69,77,'Dispositifs médicaux, désinfection et stérilisation'],[78,81,'Environnement, eau et travaux'],[82,84,'Vaccination des soignants']
  ]),
  epistemologie_savoirs:q=>{
    return pick(q.id,'v820_epist_',[
      [1,15,'Épistémologie, sciences et production des savoirs'],[16,25,'Paradigmes et métaparadigme infirmier'],
      [26,39,'Objectif central, personne, santé et environnement'],[40,46,'Discipline, raisonnement clinique et pratique réflexive']
    ])||pick(q.id,'v820_a1p3_',[
      [1,17,'Courants et écoles de pensée infirmière'],[18,30,'Théories et modèles infirmiers']
    ])||pick(q.id,'v820_a1p4_',[
      [1,14,'Virginia Henderson et besoins fondamentaux'],[15,27,'Théorie de gestion des symptômes'],[28,38,'Modèle clinique trifocal et synthèse']
    ]);
  },
  ethique_infirmiere:q=>pick(q.id,'v820_ethique_',[
    [1,10,'Morale, éthique, déontologie et dignité'],[11,17,'Autonomie, bienfaisance, non-malfaisance et justice'],
    [18,20,'Méthode d’analyse éthique'],[21,30,'Consentement, refus de soins et personne de confiance'],
    [31,38,'Contention et autonomie'],[39,50,'Information, droits du patient et situations éthiques']
  ]),
  traumatologie:q=>pick(q.id,'v820_trauma_',[
    [1,23,'Principes de traumatologie, immobilisation et complications'],[24,29,'Plaies de la main'],[30,44,'Hanche et fractures du fémur'],
    [45,49,'Patella et appareil extenseur'],[50,65,'Jambe, cheville et syndrome des loges'],[66,71,'Tendon d’Achille'],
    [72,87,'Épaule, clavicule et humérus'],[88,100,'Avant-bras et poignet']
  ]),
  appareil_locomoteur:q=>pick(q.id,'v820_loco_',[
    [1,9,'Repères anatomiques et os'],[10,19,'Membre supérieur'],[20,29,'Membre inférieur'],
    [30,38,'Articulations et ligaments'],[39,43,'Muscles et tendons'],[44,48,'Rachis et innervation'],[49,50,'Consolidation osseuse']
  ]),
  parametres_vitaux:q=>pick(q.id,'v820_vitals_',[
    [1,5,'Principes de surveillance'],[6,12,'Température'],[13,20,'Pouls et fréquence cardiaque'],[21,29,'Pression artérielle'],
    [30,39,'Respiration et saturation en oxygène'],[40,44,'Glycémie capillaire'],[45,49,'Diurèse et urines'],[50,50,'Traçabilité']
  ]),
  histoire_profession_infirmiere:q=>pick(q.id,'v820_histoire_',[
    [1,10,'Origines du soin et Moyen Âge'],[11,16,'Premières pratiques, simulation et organisation du soin'],
    [17,32,'XIXe–début XXe : formation et professionnalisation'],[33,41,'1942–2009 : diplômes, textes et réformes'],
    [42,50,'Universitarisation, pratique avancée et évolutions récentes']
  ]),
  infections_cutanees:q=>pick(q.id,'v820_cut_',[
    [1,15,'Infections bactériennes superficielles et abcès'],[16,25,'Dermo-hypodermites'],[26,32,'Plaies chroniques et pied diabétique'],
    [33,39,'Mycoses cutanées'],[40,46,'Herpès, varicelle et zona'],[47,50,'Gale et pédiculoses']
  ]),
  arthrose:q=>pick(q.id,'v820_arthrose_',[
    [1,10,'Physiopathologie et facteurs de risque'],[11,20,'Douleur, clinique et biologie'],[21,24,'Imagerie et évolution'],
    [25,30,'Traitements et prise en charge'],[31,40,'Localisations : genou, hanche, rachis et mains']
  ]),
  grands_brules:q=>pick(q.id,'v820_brules_',[
    [1,13,'Profondeur, surface et gravité des brûlures'],[14,20,'Accueil et prise en charge initiale'],
    [21,27,'Choc, remplissage et surveillance'],[28,36,'Hygiène, pansements, respiration, nutrition et douleur'],[37,40,'Chirurgie, greffes et rééducation']
  ]),
  douleur_aigue_chronique:q=>pick(q.id,'v820_douleur_',[
    [1,12,'Définitions, mécanismes et composantes de la douleur'],[13,20,'Évaluation et échelles de douleur'],
    [21,26,'Traitements médicamenteux et non médicamenteux'],[27,30,'Raisonnement clinique et rôle infirmier']
  ]),
  chirurgie_orthopedique:q=>pick(q.id,'v820_chirortho_',[
    [1,6,'Arthrose et indications chirurgicales'],[7,20,'Prothèse totale de hanche et postopératoire'],
    [21,24,'Prothèse totale de genou et rééducation'],[25,30,'Rachis, radiculalgies et chirurgie']
  ]),
  systeme_nerveux:q=>pick(q.id,'nervous_',[
    [1,8,'Organisation du système nerveux, neurone et synapse'],[9,22,'Encéphale, cortex, tronc cérébral et cervelet'],
    [23,30,'Moelle, méninges et LCS'],[31,36,'Nerfs périphériques'],[37,42,'Système autonome et réflexes'],[43,46,'Mémoire'],[47,49,'Douleur']
  ]),
  genetique:q=>pick(q.id,'genetique_',[
    [1,8,'Gènes, allèles et génomes'],[9,18,'ADN, chromosomes, réplication et mutations'],[19,28,'ARN, transcription et traduction'],
    [29,33,'Méiose et brassage génétique'],[34,41,'Caryotype et anomalies chromosomiques'],[42,50,'Mendel et modes de transmission']
  ]),
  systeme_urinaire:q=>pick(q.id,'urinaire_',[
    [1,8,'Anatomie du rein'],[9,18,'Néphron et circulation rénale'],[19,28,'Uretères, vessie et urètre'],
    [29,34,'Urine et filtration glomérulaire'],[35,44,'Réabsorption, sécrétion et régulation hormonale'],[45,45,'Miction et diurèse']
  ]),
  systeme_endocrinien:q=>pick(q.id,'endocrinien_',[
    [1,7,'Principes hormonaux et régulation'],[8,16,'Hypothalamus, hypophyse et épiphyse'],[17,21,'Thyroïde et parathyroïdes'],
    [22,24,'Pancréas endocrine'],[25,29,'Glandes surrénales'],[30,33,'Gonades et hormones sexuelles'],[34,40,'Pathologies endocriniennes']
  ]),
  systeme_immunitaire:q=>pick(q.id,'immunitaire_',[
    [1,8,'Principes de l’immunité et organes lymphoïdes'],[9,16,'Immunité innée, barrières et phagocytose'],[17,20,'Réaction inflammatoire'],
    [21,28,'Immunité adaptative humorale et anticorps'],[29,33,'Immunité cellulaire et lymphocytes T'],[34,36,'Vaccination et VIH'],[37,39,'Groupes sanguins ABO']
  ]),
  virus:q=>pick(q.id,'virus_',[
    [1,10,'Structure et classification des virus'],[11,20,'Cycle, hôte et tropisme viral'],[21,26,'Virome et diversité virale'],
    [27,30,'Contage et incubation'],[31,43,'Infections aiguës, chroniques et latentes'],[44,50,'Conséquences et prévention des infections virales']
  ]),
  parasites_champignons:q=>pick(q.id,'parasites_champignons_',[
    [1,13,'Modes de vie, parasites et effets pathogènes'],[14,23,'Cycles, hôtes et voies d’infestation'],
    [24,34,'Diagnostic parasitaire et parasitoses'],[35,46,'Mycologie, morphologie et types de champignons'],
    [47,52,'Mycoses superficielles et profondes'],[53,60,'Diagnostic mycologique et antifongigramme']
  ]),
  physiopathologie_infections:q=>pick(q.id,'physiopath_infections_',[
    [1,5,'Épidémiologie et évolution des maladies infectieuses'],[6,12,'Hôte, colonisation et barrières de défense'],
    [13,25,'Réponse inflammatoire et immunitaire'],[26,40,'Chaîne de transmission, réservoirs et voies de contamination'],
    [41,50,'Triangle épidémiologique, hôte fragile et prévention']
  ]),
  pathologies_microcristallines_osteoporose:q=>pick(q.id,'v820_micro_',[
    [1,18,'Goutte : clinique, diagnostic et prise en charge'],[19,28,'Chondrocalcinose'],
    [29,40,'Ostéoporose : risques, fractures et diagnostic'],[41,45,'Ostéoporose : prévention et prise en soins']
  ]),
  diagnostic_virologie:q=>pick(q.id,'diagnostic_virologie_',[
    [1,9,'Principes et prélèvements virologiques'],[10,19,'Diagnostic direct et détection virale'],[20,39,'PCR, charge virale et séquençage'],
    [40,50,'Diagnostic indirect et sérologie']
  ])
};
const aliases={
  'biomolecules':'biomolecules','cellules et tissus':'cellules_tissus','cellules_tissus':'cellules_tissus',
  'niveaux d organisation':'niveaux_organisation','niveaux_organisation':'niveaux_organisation',
  'homeostasie':'homeostasie','prevention ias asepsie':'prevention_ias_asepsie','prevention_ias_asepsie':'prevention_ias_asepsie',
  'epistemologie et savoirs infirmiers':'epistemologie_savoirs','epistemologie_savoirs':'epistemologie_savoirs',
  'ethique infirmiere':'ethique_infirmiere','ethique_infirmiere':'ethique_infirmiere','traumatologie':'traumatologie',
  'appareil locomoteur':'appareil_locomoteur','appareil_locomoteur':'appareil_locomoteur','parametres vitaux':'parametres_vitaux','parametres_vitaux':'parametres_vitaux',
  'histoire de la profession infirmiere':'histoire_profession_infirmiere','histoire_profession_infirmiere':'histoire_profession_infirmiere',
  'infections cutanees':'infections_cutanees','infections_cutanees':'infections_cutanees','arthrose':'arthrose',
  'grands brules':'grands_brules','grands_brules':'grands_brules','douleur aigue et chronique':'douleur_aigue_chronique',
  'douleur_aigue_chronique':'douleur_aigue_chronique','chirurgie orthopedique':'chirurgie_orthopedique','chirurgie_orthopedique':'chirurgie_orthopedique',
  'systeme nerveux':'systeme_nerveux','systeme_nerveux':'systeme_nerveux','information genetique':'genetique','genetique':'genetique',
  'systeme urinaire':'systeme_urinaire','systeme_urinaire':'systeme_urinaire','systeme endocrinien':'systeme_endocrinien','systeme_endocrinien':'systeme_endocrinien',
  'systeme immunitaire':'systeme_immunitaire','systeme_immunitaire':'systeme_immunitaire','ecologie microbienne virus':'virus','virus':'virus',
  'diagnostic virologique':'diagnostic_virologie','diagnostic_virologie':'diagnostic_virologie'
};
function resolve(q){
  if(!q)return 'Général';
  const rawCourse=String(q.courseId||q.course||q.theme||'').trim();
  const key=aliases[norm(rawCourse)]||aliases[norm(q.course)]||aliases[norm(q.courseId)]||'';
  const refined=key&&R[key]?R[key](q):'';
  if(refined)return refined;
  const t=String(q.theme||'').trim(),c=String(q.course||'').trim();
  if(t&&norm(t)!==norm(c)&&norm(t)!=='general')return t;
  return 'Général';
}
window.IFSI_QCM_SUBTHEMES={version:VERSION,resolve};
})();