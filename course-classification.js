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
  function normalize(value) {
    const code = String(value || '').trim().toUpperCase().replace(/^(?:(?:UE|S1)\s+)+/, '')
      .trim().replace(/^([A-E])\.(?=\d)/, '$1');
    return /^[A-E][1-9]\d*(?:\.\d+)*$/.test(code) ? code : '';
  }
  function courseCode(course) {
    return byCourse.get(course?.id) || normalize(course?.ue);
  }
  function sheetCode(sheet) {
    const registry = window.IFSI_V741?.getRegistry?.();
    const registered = registry?.courses?.find(c => c.id === sheet.courseId);
    const code = byCourse.get(sheet.courseId) || courseCode(registered);
    const source = normalize(sheet.ue);
    return source && code && source.startsWith(code + '.') ? source : code || source;
  }
  function label(code) {
    return titles[code] ? code + ' — ' + titles[code] : code;
  }
  window.IFSI_COURSE_CLASSIFICATION = {courseCode, sheetCode, label};
})();
