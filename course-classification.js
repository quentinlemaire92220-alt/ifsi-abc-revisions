// Codes de présentation du semestre 1, rapprochés des programmes FAC et des séances IFSI.
// Les identifiants des cours et les métadonnées des documents publiés restent historiques.
(() => {
  'use strict';
  const byCourse = new Map();
  const groups = {
    'B1.1': ['biomolecules', 'cellules_tissus', 'genetique', 'homeostasie',
      'systeme_nerveux', 'systeme_digestif', 'systeme_urinaire', 'systeme_respiratoire',
      'systeme_cardiovasculaire', 'systeme_reproducteur', 'pharmacologie',
      'organes_des_sens_b11', 'etapes_de_la_vie'],
    'B1.3': ['systeme_immunitaire', 'parasites_champignons', 'virus', 'physiopathologie_infections',
      'diagnostic_bacteriologie', 'diagnostic_virologie', 'infections_urinaires',
      'infections_pulmonaires_bacteriennes', 'infections_respiratoires_virales',
      'ist_hors_vih', 'infections_neuro_meningees', 'infections_cutanees', 'prevention_ias_asepsie'],
    'B2.1.1': ['psychologie_sante', 'psychopathologie', 'psychometrie', 'psychologie_developpement'],
    'B3.1': ['calculs_doses_mathematiques'],
    'B3.2.1': ['gestion_stress_professionnel'],
    'B3.3': ['stomatotherapie', 'plaies_pansements', 'douleur'],
    'A2.1': ['ethique_infirmiere', 'droits_patients', 'responsabilite_exercice_professionnel'],
    'D1.1': ['d1_bientraitance', 'd1_relation_soignant_soigne_ecoute_active']
  };
  for (const [code, ids] of Object.entries(groups)) {
    for (const id of ids) byCourse.set(id, code);
  }
  const titles = {
    'B1.1': 'Bases fondamentales et fonctionnement du corps humain',
    'B1.3': 'Système immunitaire, pathologies inflammatoires et infectieuses (3i)',
    'B2.1.1': 'Psychologie'
  };
  // Public catalogue names. Signed deliveries keep the spelling used at publication.
  const names = new Map(Object.entries({
    d1_communication_td1: ['Communication', 'TD communication', 'TD 1 communication', 'Communication (TD 1)'],
    d1_posture_professionnelle_td2: ['Posture professionnelle et contexte de soin', 'TD posture', 'TD2 posture', 'TD 2 posture', 'Posture professionnelle et contexte de soin (TD 2)'],
    theorie_gestion_symptomes_td: ['Théorie de gestion des symptômes', 'A1 TD d’application', 'TD application', 'TD3 théorie de gestion des symptômes'],
    vaccination_prs: ['Vaccination', 'TD vaccination'],
    entretien_infirmier: ['Entretien infirmier'],
    fievre_retour_voyage_paludisme: ['Fièvre au retour de voyage et paludisme'],
    niveaux_organisation: ['Niveaux d’organisation du corps humain'],
    calculs_doses_mathematiques: ['Calculs de doses et mathématiques'],
    roles_missions_ide: ['Rôles et missions de l’infirmier', 'Rôles et missions de l’IDE'],
    vih_b13_20261027: ['Infection par le VIH']
  }));
  const isActive = id => id !== 'pssm';
  const courseTitle = id => names.get(id)?.[0];
  function studentRegistry(registry) {
    const courses = registry.courses.filter(c => isActive(c.id)).map(c => {
      const namesForCourse = names.get(c.id);
      if (!namesForCourse) return c;
      const [label, ...extra] = namesForCourse;
      return {...c, label, aliases: [...new Set([...(c.aliases || []), c.label, ...extra])]};
    });
    const ueResources=registry.ueResources?.map(r=>r.id==='b2_concepts_definitions_td'
      ? {...r,title:'Recueil de concepts et définitions'} : r);
    return {...registry, courses, ueResources};
  }
  function studentSheet(sheet) {
    const title=courseTitle(sheet.courseId);
    if(!title)return sheet;
    if(sheet.courseId==='vaccination_prs'&&sheet.displayTitle==='Vaccination — travail PRS'
      ||sheet.courseId==='niveaux_organisation'&&sheet.displayTitle==='Niveaux d’organisation'
      ||['d1_communication_td1_written_p01','d1_posture_td2_written_p02','a1_tgs_td_written_p01',
         'entretien_infirmier_sheet_v4','fievre_paludisme_written_p01'].includes(sheet.resourceId)){
      return {...sheet,label:title,displayTitle:title+' — fiche de révision'};
    }
    return sheet;
  }
  function normalize(value) {
    const code = String(value || '').trim().toUpperCase().replace(/^(?:(?:UE|S1)\s+)+/, '')
      .trim().replace(/^([A-E])\.(?=\d)/, '$1');
    return /^[A-E][1-9]\d*(?:\.\d+)*$/.test(code) ? code : '';
  }
  // Classement du catalogue étudiant. Les codes des supports restent disponibles à la recherche.
  const infectiousPathologies = new Set([
    'physiopathologie_infections', 'infections_urinaires', 'infections_neuro_meningees',
    'infections_cutanees', 'infections_pulmonaires_bacteriennes', 'infections_respiratoires_virales',
    'ist_hors_vih', 'vih_b13_20261027', 'fievre_retour_voyage_paludisme',
    'diarrhees_infectieuses', 'hepatites_virales'
  ]);
  function catalogueCode(code, courseId) {
    if (infectiousPathologies.has(courseId)) return 'B3';
    return /^B[123](?:\.|$)/.test(code) ? code.split('.')[0] : code;
  }
  function sourceCourseCode(course) {
    return byCourse.get(course?.id) || normalize(course?.ue);
  }
  function courseCode(course) {
    return catalogueCode(sourceCourseCode(course), course?.id);
  }
  function sheetCode(sheet) {
    const registry = window.IFSI_V741?.getRegistry?.();
    const registered = registry?.courses?.find(c => c.id === sheet.courseId);
    const code = byCourse.get(sheet.courseId) || sourceCourseCode(registered);
    const source = normalize(sheet.ue);
    const detail = source && code && source.startsWith(code + '.') ? source : code || source;
    return catalogueCode(detail, sheet.courseId);
  }
  function label(code) {
    return titles[code] ? code + ' — ' + titles[code] : code;
  }
  window.IFSI_COURSE_CLASSIFICATION = {courseCode, sourceCourseCode, sheetCode, label, isActive, courseTitle, studentRegistry, studentSheet};
})();
