// V8.30.202 build 8502 — Réutilisation des médias hors ligne
const BUILD='8502';
const CACHE='ifsi-abc-v8-30-202-local-medias';
const BASE_ASSETS=['./data/release-news.json','./v8502-changelog.js','./course-classification.js','./data/course-banks/psychometrie_20261112.json','./assets/psychometrie-20261112/Psychometrie_Cours_complet.pdf','./assets/psychometrie-20261112/Psychometrie_QCM_49_corriges.pdf','./assets/psychometrie-20261112/Psychometrie_Flashcards_141.pdf','./data/course-banks/psychologie_developpement_official_20261112.json','./assets/psycho-dev-officiel-20261112/Psychologie_developpement_Fiche_completee_support_officiel.pdf','./assets/psycho-dev-officiel-20261112/Psychologie_developpement_QCM_74_et_cas.pdf','./assets/psycho-dev-officiel-20261112/Psychologie_developpement_Flashcards_102.pdf','./assets/psycho-dev-officiel-20261112/UE_B2_Concepts_Definitions_TD_Validation_complete.pdf','./assets/ue-b2-concepts-20261112/UE_B2_Concepts_Definitions_TD_Validation.pdf','./data/course-banks/psychologie_developpement_20261111.json','./assets/psycho-dev-20261111/Psychologie_developpement_Fiche_reconstituee.pdf','./assets/psycho-dev-20261111/Psychologie_developpement_QCM_et_cas.pdf','./assets/psycho-dev-20261111/Psychologie_developpement_Flashcards_90.pdf','./assets/psycho-dev-20261111/Psychologie_developpement_Support_non_officiel_Captures.pdf','./data/course-banks/psychopathologie_20261110.json','./assets/psychopathologie-documents-20261110/Psychopathologie_Fiche_revue_41p.pdf','./assets/psychopathologie-documents-20261110/Psychopathologie_QCM_113_Corriges.pdf','./assets/psychopathologie-documents-20261110/Psychopathologie_Flashcards_350.pdf','./assets/prevention-consolide-20261109/Prevention_risque_infectieux_Fiche_Consolidee.pdf','./assets/prevention-consolide-20261109/Prevention_risque_infectieux_QCM_128_Corriges.pdf','./assets/prevention-consolide-20261109/Prevention_risque_infectieux_Flashcards_128_Recto_Verso.pdf','./data/course-banks/vih_correction_20261109.json','./assets/vih-correction-20261109/VIH_Fiche.pdf','./assets/vih-correction-20261109/VIH_QCM_50_corriges.pdf','./assets/vih-correction-20261109/VIH_Cartes_50.pdf','./data/course-banks/douleur_global_20261108.json','./assets/douleur-qcm-flashcards-20261108/UE_B3_Douleur_QCM_90_Corriges.pdf','./assets/douleur-qcm-flashcards-20261108/UE_B3_Douleur_Flashcards_90_Recto_Verso.pdf','./assets/prevention-fusion-20261107/Prevention_Fiche_unifiee.pdf','./assets/prevention-fusion-20261107/Prevention_QCM_104.pdf','./assets/prevention-fusion-20261107/Prevention_Flashcards_104.pdf','./assets/offre-soins-20261106/Offre_soins_Fiche.pdf','./assets/offre-soins-20261106/Offre_soins_QCM_60.pdf','./assets/offre-soins-20261106/Offre_soins_Flashcards_60.pdf','./assets/offre-soins-20261106/Offre_soins_Support_officiel.pdf','./data/course-banks/offre_soins_20261106.json','./data/course-banks/sante_mondiale_20261103.json','./assets/sante-mondiale-20261103/Sante_mondiale_sante_France_Fiche.pdf','./assets/sante-mondiale-20261103/Sante_mondiale_sante_France_QCM_72.pdf','./assets/sante-mondiale-20261103/Sante_mondiale_sante_France_Flashcards_72.pdf','./audio-series-v1.js','./audio-series-v1.json','./data/course-banks/diarrhees_infectieuses_p01.json','./assets/diarrhees-infectieuses-20261103/Diarrhees_infectieuses_Fiche_14p.pdf','./assets/diarrhees-infectieuses-20261103/Diarrhees_infectieuses_QCM_63_Corriges.pdf','./assets/diarrhees-infectieuses-20261103/Diarrhees_infectieuses_Flashcards_63.pdf','./assets/diarrhees-infectieuses-20261103/Diarrhees_infectieuses_Support_officiel.pdf','./v8467-sens-atlas.js','./assets/sens-refonte-20261103/planche-01.webp','./assets/sens-refonte-20261103/planche-01.svg','./assets/sens-refonte-20261103/planche-02.webp','./assets/sens-refonte-20261103/planche-02.svg','./assets/sens-refonte-20261103/planche-03.webp','./assets/sens-refonte-20261103/planche-03.svg','./assets/sens-refonte-20261103/planche-04.webp','./assets/sens-refonte-20261103/planche-04.svg','./assets/sens-refonte-20261103/planche-05.webp','./assets/sens-refonte-20261103/planche-05.svg','./assets/sens-refonte-20261103/planche-06.webp','./assets/sens-refonte-20261103/planche-06.svg','./assets/sens-refonte-20261103/planche-07.webp','./assets/sens-refonte-20261103/planche-07.svg','./data/course-banks/prevention_ias_asepsie_global_20261102.json','./assets/prevention-infectieux-20261102/Prevention_risque_infectieux_Fiche_globale.pdf','./assets/prevention-infectieux-20261102/Prevention_risque_infectieux_QCM_104_Corriges.pdf','./assets/prevention-infectieux-20261102/Prevention_risque_infectieux_Flashcards_104_Recto_Verso.pdf','./assets/hepatites-virales-20261102/Fiche_Hepatites_virales_18p.pdf','./assets/hepatites-virales-20261102/QCM_Hepatites_virales_50_Corriges.pdf','./assets/hepatites-virales-20261102/Flashcards_Hepatites_virales_50_Recto_Verso.pdf','./assets/psychologie-sante-20261102/Fiche_Psychologie_Sante_52p_79_Definitions.pdf','./assets/c11-sante-mondiale/UE_C11_Sante_Mondiale_Fiche_Hybride_V7_3.pdf','./assets/c11-sante-mondiale/UE_C11_Sante_Mondiale_QCM_56_V4_Corriges.pdf','./assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_Fiche_Revision.pdf','./assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_QCM_50_Corriges.pdf','./assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_Planches_anatomiques.pdf','./assets/droits-patients/UE_A2_1_S1_Droits_des_patients_Fiche_de_revision.pdf','./assets/entretien-infirmier-20261028/UE_D1_1_S1_Entretien_Infirmier_Fiche_Revision_V4.pdf','./assets/entretien-infirmier-20261028/UE_D1_1_S1_Entretien_Infirmier_QCM_50_Corriges_V5.pdf','./assets/entretien-infirmier-20261028/UE_D1_1_S1_Entretien_Infirmier_Flashcards_50_V5.pdf','./assets/vih-20261027/UE_B1_3_S1_VIH_Fiche_Revision_17p_v149.pdf','./assets/vih-20261027/UE_B1_3_S1_VIH_QCM_50_Corriges.pdf','./assets/vih-20261027/UE_B1_3_S1_VIH_Flashcards_50.pdf','./assets/gestion-stress-20261019/UE_B3_2_1_Gestion_du_stress_QCM_50_Corriges_v149.pdf','./assets/gestion-stress-20261019/UE_B3_2_1_Gestion_du_stress_Flashcards_50_v149.pdf','./assets/gestion-stress-20261019/UE_B3_2_1_S1_Gestion_du_stress_Fiche_Revision_v149_17p.pdf','./assets/fievre-paludisme-20261027/UE_B1_3_Fievre_Paludisme_Fiche_Revision.pdf','./assets/fievre-paludisme-20261027/UE_B1_3_Fievre_Paludisme_QCM_40_Corriges.pdf','./assets/psychologie-sante-20261027/UE_B2_S1_Psychologie_Sante_Fiche_Unique_20p_59_Definitions_20261027.pdf','./assets/psychologie-sante-20261027/UE_B2_Psychologie_Sante_QCM_50_Corriges.pdf','./assets/relation-soignant-ecoute/D1_Relation_Soignant_Soigne_Fiche_21p_20261026.pdf','./assets/relation-soignant-ecoute/D1_Relation_Soignant_Soigne_QCM_48_Corriges_20261026.pdf','./assets/relation-soignant-ecoute/D1_Relation_Soignant_Soigne_Flashcards_48_20261026.pdf','./docs/proposals/course-thumbnails-55-assets.json','./assets/theorie-symptomes-td/UE_A1_Theorie_Symptomes_Fiche_Revision.pdf','./assets/theorie-symptomes-td/UE_A1_Theorie_Symptomes_QCM_40_Corriges.pdf','./assets/theorie-symptomes-td/UE_A1_Theorie_Symptomes_Flashcards_40.pdf','./assets/sante_mondiale_france/c11-01.webp','./assets/course-thumbnails/biomolecules.webp','./assets/course-thumbnails/cellules_tissus.webp','./assets/course-thumbnails/homeostasie.webp','./assets/course-thumbnails/parasites_champignons.webp','./assets/course-thumbnails/genetique.webp','./assets/course-thumbnails/niveaux_organisation.webp','./assets/course-thumbnails/physiopathologie_infections.webp','./assets/course-thumbnails/diagnostic_virologie.webp','./assets/course-thumbnails/virus.webp','./assets/course-thumbnails/systeme_urinaire.webp','./assets/course-thumbnails/systeme_endocrinien.webp','./assets/course-thumbnails/systeme_immunitaire.webp','./assets/course-thumbnails/systeme_respiratoire.webp','./assets/course-thumbnails/systeme_cardiovasculaire.webp','./assets/course-thumbnails/prevention_ias_asepsie.webp','./assets/course-thumbnails/systeme_nerveux.webp','./assets/course-thumbnails/infections_neuro_meningees.webp','./assets/course-thumbnails/calculs_doses_mathematiques.webp','./assets/course-thumbnails/systeme_digestif.webp','./assets/course-thumbnails/appareil_locomoteur.webp','./assets/course-thumbnails/traumatologie.webp','./assets/course-thumbnails/histoire_profession_infirmiere.webp','./assets/course-thumbnails/epistemologie_savoirs.webp','./assets/course-thumbnails/ethique_infirmiere.webp','./assets/course-thumbnails/douleur.webp','./assets/course-thumbnails/parametres_vitaux.webp','./assets/course-thumbnails/grands_brules.webp','./assets/course-thumbnails/infections_cutanees.webp','./assets/course-thumbnails/diagnostic_bacteriologie.webp','./assets/course-thumbnails/infections_urinaires.webp','./assets/course-thumbnails/arthrose.webp','./assets/course-thumbnails/chirurgie_orthopedique.webp','./assets/course-thumbnails/rhumatismes_inflammatoires.webp','./assets/course-thumbnails/pathologies_microcristallines_osteoporose.webp','./assets/course-thumbnails/competences_psychosociales.webp','./assets/course-thumbnails/methodes_travail_reussite.webp','./assets/course-thumbnails/vaccination_prs.webp','./assets/course-thumbnails/infections_pulmonaires_bacteriennes.webp','./assets/course-thumbnails/infections_respiratoires_virales.webp','./assets/course-thumbnails/ist_hors_vih.webp','./assets/course-thumbnails/introduction_droit.webp','./assets/course-thumbnails/psychologie_sante.webp','./assets/course-thumbnails/pharmacologie.webp','./assets/course-thumbnails/administration_medicamenteuse.webp','./assets/course-thumbnails/systeme_reproducteur.webp','./assets/course-thumbnails/plaies_pansements.webp','./assets/course-thumbnails/stomatotherapie.webp','./assets/course-thumbnails/droits_patients.webp','./assets/course-thumbnails/pssm.webp','./assets/course-thumbnails/sante_mondiale_sante_france.webp','./assets/course-thumbnails/responsabilite_exercice_professionnel.webp','./assets/course-thumbnails/d1_communication_td1.webp','./assets/course-thumbnails/d1_posture_professionnelle_td2.webp','./assets/course-thumbnails/d1_bientraitance.webp','./assets/course-thumbnails/d1_relation_soignant_soigne_ecoute_active.webp','./assets/sante_mondiale_france/c11-02.webp','./assets/sante_mondiale_france/c11-03.webp','./assets/sante_mondiale_france/c11-04.webp','./assets/sante_mondiale_france/c11-05.webp','./assets/sante_mondiale_france/c11-06.webp','./assets/sante_mondiale_france/c11-07.webp','./assets/sante_mondiale_france/c11-08.webp','./assets/sante_mondiale_france/c11-09.webp','./assets/ethique_infirmiere/care-p02-care_cure.webp','./assets/ethique_infirmiere/care-p02-gilligan.webp','./assets/ethique_infirmiere/care-p02-tronto.webp','./assets/ethique_infirmiere/care-p02-phases.webp','./assets/ethique_infirmiere/care-p02-cas_ehpad.webp','./assets/anatomy/reproductive/review/R02.jpg','./assets/anatomy/reproductive/review/R03.jpg','./assets/anatomy/reproductive/review/R04.jpg','./assets/anatomy/reproductive/review/R05.jpg','./assets/anatomy/reproductive/review/R06.jpg','./assets/anatomy/reproductive/review/R07.jpg','./assets/pharmacologie/pharmacologie-p01-composition.webp','./assets/pharmacologie/pharmacologie-p01-essais.webp','./assets/pharmacologie/pharmacologie-p01-voies.webp','./assets/pharmacologie/pharmacologie-p01-calculs.webp','./assets/pharmacologie/pharmacologie-p01-cibles.webp','./assets/pharmacologie/pharmacologie-p01-signaux.webp','./assets/pharmacologie/pharmacologie-p01-courbes.webp','./assets/pharmacologie/pharmacologie-p01-adme.webp','./assets/pharmacologie/pharmacologie-p01-demivie.webp','./assets/pharmacologie/pharmacologie-p01-prescription.webp','./assets/pharmacologie/pharmacologie-p01-vigilance.webp','./assets/infections_neuro_meningees/infections_neuro_meningees-p01-meninges.webp','./assets/infections_neuro_meningees/infections_neuro_meningees-p01-clinique.webp','./assets/infections_neuro_meningees/infections_neuro_meningees-p01-purpura.webp','./assets/infections_neuro_meningees/infections_neuro_meningees-p01-priorites.webp','./assets/infections_neuro_meningees/infections_neuro_meningees-p01-pl.webp','./assets/infections_neuro_meningees/infections_neuro_meningees-p01-lcs.webp','./assets/infections_neuro_meningees/infections_neuro_meningees-p01-abces.webp','./qextra-56.txt','./qextra-57.txt','./qextra-58.txt','./qextra-59.txt','./assets/maths/fiche-maitre-methodes-calculs.svg','./assets/plaies/plaies-p1-01.webp','./assets/plaies/plaies-p1-02.webp','./assets/plaies/plaies-p1-03.webp','./assets/plaies/plaies-p1-04.webp','./assets/plaies/plaies-p1-05.webp','./assets/plaies/plaies-p1-06.webp','./','./index.html','./manifest.webmanifest','./build-meta.json','./icon.svg','./questions-1.json','./questions-2.json','./questions-3.json','./questions-4.json','./questions-5.json','./sheets-1.json','./sheets-2.json','./sheets-3.json','./infographics.json','./vocals.json','./course-registry-v741.json','./resource-audit-v821.json','./calculs-resources-v1.json','./math-cases-10-v1.json','./qextra-01.txt','./qextra-02.txt','./qextra-03.txt','./qextra-04.txt','./qextra-05.txt','./qextra-06.txt','./qextra-07.txt','./qextra-09.txt','./qextra-10.txt','./qextra-11.txt','./qextra-12.txt','./qextra-13.txt','./qextra-14.txt','./qextra-15.txt','./qextra-16.txt','./qextra-17.txt','./qextra-18.txt','./qextra-19.txt','./qextra-20.txt','./qextra-21.txt','./qextra-22.txt','./qextra-23.txt','./qextra-24.txt','./qextra-25.txt','./qextra-26.txt','./qextra-27.txt','./qextra-28.txt','./qextra-29.txt','./qextra-30.txt','./qextra-31.txt','./qextra-32.txt','./qextra-33.txt','./qextra-34.txt','./qextra-35.txt','./qextra-36.txt','./qextra-37.txt','./qextra-38.txt','./qextra-39.txt','./qextra-40.txt','./qextra-41.txt','./qextra-42.txt','./qextra-43.txt','./qextra-44.txt','./qextra-45.txt','./qextra-46.txt','./qextra-47.txt','./qextra-48.txt','./qextra-49.txt','./qextra-50.txt','./qextra-51.txt','./qextra-52.txt','./avatar-quentin.b64','./banner-quentin.b64','./app-features-v1.js','./app-version-v742.js','./qcm-subthemes-v1.js','./features-v9.js','./schema-v10.js','./choice-toggle-v13.js','./v7-local.js','./v71-local.js','./v72-pack.js','./progressive-v72.js','./audio-mirrors-v1.js','./audio-drive-mirrors-v1.json','./vocals-v73.js','./v74-pack.js','./course-registry-v741.js','./changelog-v742.js','./v75-smart.js','./v76-home.js','./analytics-v77.js','./v79-themes.js','./calculs-parcours-v1.js','./v81-suite.js','./v82-nav-anatomy.js','./v8399-reproductive-private-review.js','./v83-anatomy-interactive.js','./v84-respiratory-polish.js','./v85-home-lite.js','./v86-home-clean.js','./v87-settings.js','./planning-v1.js','./course-followup-v1.js','./v813-home-discovery.js','./v814-respiratory-atlas.js','./v815-urinary-atlas.js','./v816-endocrine-atlas.js','./v817-immune-atlas.js','./v822-nervous-atlas.js','./v823-cardiovascular-atlas.js','./v824-digestive-atlas.js','./v829-locomotor-atlas.js','./v8318-microscopic-atlas.js','./assets/locomotor/locomotor-01.webp','./assets/locomotor/locomotor-02.webp','./assets/locomotor/locomotor-03.webp','./assets/locomotor/locomotor-04.webp','./assets/locomotor/locomotor-05.webp','./assets/locomotor/locomotor-06.webp','./assets/locomotor/locomotor-07.webp','./assets/locomotor/locomotor-08.webp','./assets/locomotor/locomotor-09.webp','./assets/locomotor/locomotor-10.webp','./assets/locomotor/locomotor-11.webp','./assets/locomotor/locomotor-12.webp','./assets/locomotor/locomotor-13.webp','./assets/locomotor/locomotor-14.webp','./assets/locomotor/locomotor-15.webp','./assets/locomotor/locomotor-16.webp','./assets/locomotor/locomotor-17.webp','./assets/locomotor/locomotor-18.webp','./assets/locomotor/locomotor-19.webp','./assets/locomotor/locomotor-20.webp','./v821-resource-audit.js','./v828-revision-clean.js','./v8309-revision-redesign.js','./v8338-flashcards.js','./v8339-ui-polish.js','./p3-vocabulary-flashcards.js','./v8355-vocabulary.js','./vocabulaire-v1.json','./assets/bientraitance-p01/D1_Bientraitance_Fiche_Revision.pdf','./assets/bientraitance-p01/D1_Bientraitance_QCM_40_Corriges.pdf','./assets/bientraitance-p01/D1_Bientraitance_Flashcards_40.pdf','./v8303-home-startup.js','./v8312-home-revision.js','./v8357-qcm-access.js','./v8378-qcm-feedback.js','./v8378-interactive-exercises.js','./tnr-v72.js','./resp-official-overview-learn.jpg','./resp-official-overview-test.jpg','./resp-official-bronchial-learn.jpg','./resp-official-bronchial-test.jpg','./resp-official-epithelium-learn.jpg','./resp-official-epithelium-test.jpg','./qextra-53.txt','./qextra-54.txt','./assets/stomatotherapie/stoma-p01-01.webp','./assets/stomatotherapie/stoma-p01-02.webp','./assets/stomatotherapie/stoma-p01-03.webp','./assets/stomatotherapie/stoma-p01-04.webp','./assets/stomatotherapie/stoma-p01-05.webp','./assets/stomatotherapie/stoma-p01-06.webp','./assets/stomatotherapie/stoma-p01-07.webp','./math-case-engine-v1.js','./course-navigation-ui-v2.js','./course-thumbnails-v1.js','./pathologies-module-v1.js','./pathologies-boot-v1.js','./pathologies-private-review-v1.js','./pathologies-cloud-private-v1.js','./pathologies-auth-callback-v1.js','./qextra-55.txt','./qextra-60.txt','./assets/droits_patients/droits_patients-p01-psy_chronologie.webp','./v8419-home-brand.js','./portrait-infirmier-quentin.b64','./assets/psychologie-sante-20261029/Fiche_Psychologie_Sante_39p.pdf','./assets/psychologie-sante-20261029/QCM_Psychologie_Sante_62_29p.pdf','./assets/psychologie-sante-20261029/Flashcards_Psychologie_Sante_71_12p.pdf','./data/course-banks/psychologie-sociale-20261103.json','./assets/psychologie-sociale-20261103/Fiche_Psychologie_sociale.pdf','./assets/psychologie-sociale-20261103/QCM_Psychologie_sociale.pdf','./assets/psychologie-sociale-20261103/Flashcards_Psychologie_sociale.pdf','./assets/etapes-vie-20261104/Etapes_vie_Fiche.pdf','./assets/etapes-vie-20261104/Etapes_vie_QCM_68.pdf','./assets/etapes-vie-20261104/Etapes_vie_Flashcards_68.pdf','./data/course-banks/etapes_de_la_vie.json','./assets/determinants-sante-20261105/Determinants_sante_Fiche.pdf','./assets/determinants-sante-20261105/Determinants_sante_QCM_60.pdf','./assets/determinants-sante-20261105/Determinants_sante_Flashcards_60.pdf','./data/course-banks/determinants_sante.json','./assets/prevention-promotion-20261113/UE_C1_S1_Prevention_Promotion_Sante_Fiche_Revision.pdf','./assets/prevention-promotion-20261113/UE_C1_S1_Prevention_Promotion_QCM_60_Corriges.pdf','./data/course-banks/prevention_promotion_sante.json','./assets/prevention-promotion-20261113/UE_C1_S1_Prevention_Promotion_Flashcards.html',"./assets/bientraitance-20261115/D1_Bientraitance_Fiche_Complete.pdf","./assets/bientraitance-20261115/D1_Bientraitance_QCM_63_Corriges.pdf","./data/course-banks/bientraitance_20261115.json"];
let extraPromise=null,calculsResourcesPromise=null;
const LEGACY_EXTRA_NAMES=[...Array.from({length:7},(_,i)=>'./qextra-'+String(i+1).padStart(2,'0')+'.txt'),'./qextra-09.txt','./qextra-10.txt','./qextra-11.txt','./qextra-12.txt','./qextra-13.txt','./qextra-14.txt','./qextra-15.txt','./qextra-16.txt','./qextra-17.txt','./qextra-18.txt','./qextra-19.txt','./qextra-20.txt','./qextra-21.txt','./qextra-22.txt','./qextra-23.txt','./qextra-24.txt','./qextra-25.txt','./qextra-26.txt','./qextra-27.txt','./qextra-28.txt','./qextra-29.txt','./qextra-30.txt','./qextra-31.txt','./qextra-32.txt','./qextra-33.txt','./qextra-34.txt','./qextra-35.txt','./qextra-36.txt','./qextra-37.txt','./qextra-38.txt','./qextra-46.txt','./qextra-50.txt','./qextra-51.txt','./qextra-53.txt','./qextra-54.txt','./qextra-55.txt','./qextra-60.txt'];
const OVERRIDE_EXTRA_NAMES=['./qextra-39.txt','./qextra-40.txt','./qextra-41.txt','./qextra-42.txt','./qextra-43.txt','./qextra-44.txt','./qextra-45.txt','./qextra-47.txt','./qextra-48.txt','./qextra-49.txt','./qextra-52.txt','./qextra-56.txt','./qextra-57.txt','./qextra-58.txt','./qextra-59.txt','./qextra-61.txt'];
const ALL_EXTRA_NAMES=[...LEGACY_EXTRA_NAMES,...OVERRIDE_EXTRA_NAMES],qcmPackCache=new Map();
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
function keepQuestion(q){const t=((q&&q.question)||'').replace(/\bfigure dans (?:le|ce) (?:TD|cours)\b/gi,'est précisé');if(['pharmaco_031','stoma_p01_028'].includes(q?.id))return true;if(q?.id==='psychologie_sante_p01_047'&&t.trim()==='Le schéma corporel désigne…')return true;if(q?.id==='psydev_q053'&&t.trim()==="Dans l'illustration du groupe INRC par un mobile sur un support, quelles propositions sont exactes ?")return true;if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true;}
function validateQuestion(q,source='QCM'){const errors=[],choices=Array.isArray(q?.choices)?q.choices:null,answers=Array.isArray(q?.answers)?q.answers:null;if(!q||typeof q!=='object')errors.push('objet invalide');if(!choices||choices.length<4||choices.length>5)errors.push('propositions='+(choices?.length??'∅'));if(!answers||answers.length<1||answers.length>4)errors.push('bonnes réponses='+(answers?.length??'∅'));if(choices&&answers&&answers.some(a=>!Number.isInteger(a)||a<0||a>=choices.length))errors.push('index de réponse invalide');if(choices&&answers&&answers.length>=choices.length)errors.push('aucun distracteur');if(q?.announcedCorrectCount!==undefined){if(choices?.length!==5)errors.push('lean: cinq propositions A-E requises');if(answers?.length>3)errors.push('lean: trois bonnes réponses maximum');if(q.announcedCorrectCount!==answers?.length)errors.push('lean: cardinalité annoncée incohérente');}if(typeof q?.explanation!=='string'||!q.explanation.trim())errors.push('explication absente');if(errors.length){console.error('QCM rejeté',source,q?.id||'sans-id',errors.join(' • '));return false}return true}
function validQuestions(list,source){return (Array.isArray(list)?list:[]).filter(q=>validateQuestion(q,source));}
function syncCorrectionExplanation(q){const e=q?.explanation||'';if(!Array.isArray(q?.answers)||!q.answers.length||!/^Réponses? attendues? selon le corrigé du QCM\s*:/i.test(e))return q;const letters=q.answers.map(i=>'ABCDE'[i]).filter(Boolean).join(', ');if(!letters)return q;q.explanation=q.answers.length===1?`Réponse attendue selon le corrigé du QCM : ${letters}.`:`Réponses attendues selon le corrigé du QCM : ${letters}.`;return q;}
function normalizeMaxThreeAnswers(q){
 if(!q||q.answerCountNormalized===true||!Array.isArray(q.answers)||!Array.isArray(q.choices)||q.answers.length<=3)return q;
 if(q.answers.length!==4||q.choices.length!==5)return q;
 const out={...q,choices:[...q.choices],answers:[...q.answers]};
 const letters='ABCDE',good=[...new Set(out.answers)].sort((a,b)=>a-b);
 if(good.length!==4)return out;

 const original=[...out.choices],all=[0,1,2,3,4],key=a=>a.join(',');
 const combos=all.map(omit=>all.filter(i=>i!==omit));
 const shift=Array.from(String(out.id||'')).reduce((n,c)=>(n+c.charCodeAt(0))%5,0);
 const ordered=combos.slice(shift).concat(combos.slice(0,shift)),target=key(good),answerIndex=ordered.findIndex(c=>key(c)===target);
 if(answerIndex<0)return out;
 const refs=original.map((choice,i)=>`${letters[i]}. ${choice}`).join(' • ');
 out.question=`${String(out.question||'').trim()} — Repères : ${refs} — Quelle combinaison regroupe toutes les bonnes réponses ?`;
 out.choices=ordered.map(c=>c.map(i=>letters[i]).join(' + '));
 out.answers=[answerIndex];
 out.explanation=`${String(out.explanation||'').trim()} Combinaison correcte : ${good.map(i=>letters[i]).join(' + ')}.`;
 out.answerCountNormalized=true;
 return out;
}
function fixKnownContent(q){
 if(q?.id==='homeostasie_070'){q.question='Quels éléments concluent correctement les dernières diapositives ?';q.choices=['Une kaliémie anormale permet à elle seule de connaître sans examen supplémentaire toute la cause.','Tous les mécanismes homéostatiques restent nécessairement aussi efficaces avec l’âge.','Un défaut d’élimination rénale peut contribuer à une hyperkaliémie.','Hypokaliémie et hyperkaliémie peuvent être associées à des troubles cardiaques.','Un déséquilibre homéostatique peut s’accompagner de pathologies.'];q.answers=[2,3,4];q.explanation='Le cours relie les troubles du potassium aux troubles cardiaques et conclut sur les risques des déséquilibres, sans diagnostic automatique. (Support : diapo(s) 90–91.)';}
 const autonomous={
  v820_cut_021:['Quels signes cutanés orientent vers une dermo-hypodermite nécrosante ?','Une coloration cyanosée ou violacée associée à une nécrose cutanée oriente vers une forme nécrosante, qui constitue une urgence.'],
  v820_micro_025:["Concernant l’imagerie d’une chondrocalcinose du genou, quelles affirmations sont exactes ?","Un liseré calcique du cartilage peut évoquer une chondrocalcinose. L’imagerie contribue au diagnostic, mais des dépôts peuvent exister sans poussée symptomatique."],
  v820_trauma_059:["Quel matériel d’ostéosynthèse est inséré dans le canal médullaire du tibia et stabilisé par des vis de verrouillage ?","Un clou centromédullaire verrouillé est placé dans le canal médullaire du tibia et stabilisé par des vis."],
  v820_trauma_071:["Concernant le test de Thompson, quelles affirmations sont exactes ?","Le test de Thompson consiste à comprimer le mollet et à observer la flexion plantaire. Son absence évoque une rupture du tendon d’Achille."],
  v820_trauma_078:["Quels signes cliniques sont compatibles avec une luxation gléno-humérale ?","La perte du galbe de l’épaule et la déformation dite en coup de hache externe sont compatibles avec une luxation gléno-humérale."],
  v820_trauma_100:["Devant une déformation du poignet en dos de fourchette, quelles affirmations sont exactes ?","Une déformation en dos de fourchette évoque une fracture déplacée de l’extrémité distale du radius. La sensibilité et la mobilité des doigts doivent rester contrôlées."],
  v820_rhuminf_014:["Quels éléments cliniques peuvent évoquer une polyarthrite rhumatoïde ?","Une atteinte de plusieurs petites articulations, notamment des doigts et des poignets, avec gonflement, peut évoquer une polyarthrite rhumatoïde, souvent symétrique."]
 };
 if(q?.id&&autonomous[q.id]){q.question=autonomous[q.id][0];q.explanation=autonomous[q.id][1]}
 q=syncCorrectionExplanation(q);return normalizeMaxThreeAnswers(q);
}
const releaseAssets=new Set(BASE_ASSETS);
async function cachedBuildAsset(key,request=key){
 const hit=await caches.match(key,{cacheName:CACHE});
 return hit||fetch(request,{cache:'no-store'});
}

function gzipBody(bin){let p=10,flags=bin[3]||0;if(flags&4){const n=bin[p]|(bin[p+1]<<8);p+=2+n}if(flags&8)while(p<bin.length&&bin[p++]);if(flags&16)while(p<bin.length&&bin[p++]);if(flags&2)p+=2;return bin.slice(p,-8)}
async function decompressBytes(bin,format){const ds=new DecompressionStream(format);return new Response(new Blob([bin]).stream().pipeThrough(ds)).text()}
function parsePackText(txt,name){try{return JSON.parse(txt)}catch(first){const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');const parts=body.split(/}\s*,\s*\{"id":/);const recovered=[];for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q&&q.id)recovered.push(q)}catch{}}if(recovered.length){console.warn('Pack QCM partiellement récupéré',name,recovered.length);return recovered}throw first}}
async function decodePack(name){const r=await cachedBuildAsset(name);if(!r.ok)throw new Error('pack absent '+name);const source=(await r.text()).trim();let txt;if(source.startsWith('[')||source.startsWith('{'))txt=source;else{const bin=Uint8Array.from(atob(source),c=>c.charCodeAt(0));if(bin[0]===0x1f&&bin[1]===0x8b){if(typeof DecompressionStream==='undefined')throw new Error('DecompressionStream non disponible');try{txt=await decompressBytes(bin,'gzip')}catch{console.warn('CRC gzip invalide, récupération du flux brut',name);txt=await decompressBytes(gzipBody(bin),'deflate-raw')}}else txt=new TextDecoder().decode(bin)}const parsed=parsePackText(txt,name);return Array.isArray(parsed)?parsed:(parsed.questions||[]);}
// Charger les packs en petits groupes : sur Android un chargement séquentiel
// de dizaines de fichiers bloquait inutilement questions-5.json.
async function fetchQcmPacks(names,label){
 const loaded=[],failed=[];
 for(let offset=0;offset<names.length;offset+=6){
  const batch=names.slice(offset,offset+6);
  const resolved=await Promise.all(batch.map(async name=>{
   try{return {name,questions:validQuestions(await decodePack(name),name)}}
   catch(e){console.warn(label,name,e.message);return {name,error:e}}
  }));
  for(const item of resolved){if(item.error)failed.push(item.name);else{qcmPackCache.set(item.name,item.questions);loaded.push(item.name)}}
 }
 return {loaded,failed};
}
function mergeExtraPacks(){
 let all=LEGACY_EXTRA_NAMES.flatMap(name=>qcmPackCache.get(name)||[]);
 const override=OVERRIDE_EXTRA_NAMES.flatMap(name=>qcmPackCache.get(name)||[]);
 if(override.length){
  const map=new Map();for(const q of override)if(q?.id)map.set(q.id,q);
  const finalOverride=[...map.values()],ids=new Set(finalOverride.map(q=>q.id));
  all=all.filter(q=>!ids.has(q.id));all.push(...finalOverride);
 }
 const questions=validQuestions(all.filter(q=>q.sourceId!=='1ad8ZUs6PrPq_7v9IUrii7fW6pEbOcjtu').filter(keepQuestion).map(fixKnownContent),'QCM fusionné');
 questions.failed=ALL_EXTRA_NAMES.filter(name=>!qcmPackCache.has(name));
 questions.loaded=ALL_EXTRA_NAMES.length-questions.failed.length;
 questions.expected=ALL_EXTRA_NAMES.length;
 questions.status=questions.failed.length?'partial':'ready';
 return questions;
}
async function loadExtras(){
 if(extraPromise)return extraPromise;
 const missingLegacy=LEGACY_EXTRA_NAMES.filter(name=>!qcmPackCache.has(name));
 const missingOverride=OVERRIDE_EXTRA_NAMES.filter(name=>!qcmPackCache.has(name));
 if(!missingLegacy.length&&!missingOverride.length)return mergeExtraPacks();
 extraPromise=(async()=>{
  if(missingLegacy.length)await fetchQcmPacks(missingLegacy,'Pack QCM ignoré');
  if(missingOverride.length)await fetchQcmPacks(missingOverride,'Pack QCM de rééquilibrage ignoré');
  return mergeExtraPacks();
 })();
 try{return await extraPromise}finally{extraPromise=null}
}
async function loadCalculsResources(){if(calculsResourcesPromise)return calculsResourcesPromise;calculsResourcesPromise=(async()=>{const r=await cachedBuildAsset('./calculs-resources-v1.json');if(!r.ok)throw new Error('ressources calculs absentes');return r.json()})();return calculsResourcesPromise;}
async function brandedIndex(req){const r=await cachedBuildAsset('./index.html',req);let html=await r.text();try{const [avR,bnR]=await Promise.all([cachedBuildAsset('./avatar-quentin.b64'),cachedBuildAsset('./banner-quentin.b64')]);const av='data:image/webp;base64,'+(await avR.text()).trim();const bn='data:image/webp;base64,'+(await bnR.text()).trim();const css=`.headAvatar{overflow:hidden;border-radius:50%!important;padding:0!important;background:#fff!important;box-shadow:0 5px 14px #31235325}.headAvatar img{width:100%;height:100%;object-fit:cover;display:block}.hero{position:relative;overflow:hidden;padding-right:300px;min-height:210px}.heroBrand{position:absolute;right:-16px;bottom:-18px;width:310px;max-height:220px;object-fit:contain;pointer-events:none;filter:drop-shadow(0 8px 18px rgba(31,20,67,.18))}@media(max-width:650px){.hero{padding-right:17px;padding-bottom:150px}.heroBrand{width:235px;right:-18px;bottom:-20px}}`;html=html.replace('</style>',css+'</style>');html=html.replace('<div class="head"><div class="logo">Q</div>','<div class="head"><div class="logo headAvatar"><img src="'+av+'" alt="Illustration Quentin"></div>');html=html.replace('<button class="btn outline" onclick="startQuick()">▶ Série rapide</button></div>','<button class="btn outline" onclick="startQuick()">▶ Série rapide</button><img class="heroBrand" src="'+bn+'" alt="Illustration révisions IFSI"></div>')}catch(e){console.warn('Branding non chargé',e)}const MODULES=["course-classification.js","app-features-v1.js","app-version-v742.js","qcm-subthemes-v1.js","features-v9.js","schema-v10.js","choice-toggle-v13.js","v7-local.js","v71-local.js","v72-pack.js","progressive-v72.js","audio-mirrors-v1.js","audio-series-v1.js","vocals-v73.js","v74-pack.js","course-registry-v741.js","v8502-changelog.js","changelog-v742.js","v75-smart.js","v76-home.js","analytics-v77.js","v79-themes.js","calculs-parcours-v1.js","v81-suite.js","v8467-sens-atlas.js","v82-nav-anatomy.js","v8399-reproductive-private-review.js","v83-anatomy-interactive.js","v84-respiratory-polish.js","v85-home-lite.js","v86-home-clean.js","v87-settings.js","planning-v1.js","course-followup-v1.js","v813-home-discovery.js","v814-respiratory-atlas.js","v815-urinary-atlas.js","v816-endocrine-atlas.js","v817-immune-atlas.js","v822-nervous-atlas.js","v823-cardiovascular-atlas.js","v824-digestive-atlas.js","v829-locomotor-atlas.js","v8318-microscopic-atlas.js","v821-resource-audit.js","v828-revision-clean.js","v8309-revision-redesign.js","v8338-flashcards.js","p3-vocabulary-flashcards.js","v8355-vocabulary.js","v8339-ui-polish.js","v8303-home-startup.js","v8312-home-revision.js","v8357-qcm-access.js","v8378-qcm-feedback.js","v8378-interactive-exercises.js","tnr-v72.js","math-case-engine-v1.js","course-navigation-ui-v2.js","course-thumbnails-v1.js","pathologies-module-v1.js","pathologies-boot-v1.js","pathologies-private-review-v1.js","pathologies-cloud-private-v1.js","v8419-home-brand.js",];for(const name of MODULES){if(!html.includes(name))html=html.replace('</body>',`<script src="./${name}?v=8502"></script></body>`);}return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}})}
// Generated by node tools/build-offline-media.mjs.
const MEDIA_DIGESTS = {
  "./assets/psychometrie-20261112/Psychometrie_Cours_complet.pdf": "6jYw/TI390nZ0ka2dABFjwDEZ7vdIqt2LUWBmDvjVyg=",
  "./assets/psychometrie-20261112/Psychometrie_QCM_49_corriges.pdf": "M3v3tvX4Oon4EQCIJW4kR23CM4tiX9vVCRcHNGEdxeg=",
  "./assets/psychometrie-20261112/Psychometrie_Flashcards_141.pdf": "4rMDzrZG79UectDdNGr1ADlOCpKawNIRHO5rsx/0/WY=",
  "./assets/psycho-dev-officiel-20261112/Psychologie_developpement_Fiche_completee_support_officiel.pdf": "KvK3HKna6m/tcjO9tkL55yCI+XNHJY754P2Q9KgqFKw=",
  "./assets/psycho-dev-officiel-20261112/Psychologie_developpement_QCM_74_et_cas.pdf": "6VAQ/52bvhc+H5fggV0m7mzjkpwYB/JMxS+9CG8e6g0=",
  "./assets/psycho-dev-officiel-20261112/Psychologie_developpement_Flashcards_102.pdf": "Eix/ZqW3PcvZc7H4zFMIirwFTuRInQ6ZFPb+uX+b0SE=",
  "./assets/psycho-dev-officiel-20261112/UE_B2_Concepts_Definitions_TD_Validation_complete.pdf": "gxozRtQqMzhldBf0adwxnA/r53nIk89XAXwv1sHmSP8=",
  "./assets/ue-b2-concepts-20261112/UE_B2_Concepts_Definitions_TD_Validation.pdf": "A5das+xPW+anBrkPAczov0zBgYVzF47XXfWugt0ljPk=",
  "./assets/psycho-dev-20261111/Psychologie_developpement_Fiche_reconstituee.pdf": "Koj5Ax++BdDrWe1MFY6QPpwKS1xgwCyjfwrwB1LyKOE=",
  "./assets/psycho-dev-20261111/Psychologie_developpement_QCM_et_cas.pdf": "1J3clXxhFrAzr3OcKermMOnfjqfA5ZsdkTbY3Z7haY8=",
  "./assets/psycho-dev-20261111/Psychologie_developpement_Flashcards_90.pdf": "CGy/Q74oTNSjLwdLag2jrYGHMF5W2aJV4AgzR7meky0=",
  "./assets/psycho-dev-20261111/Psychologie_developpement_Support_non_officiel_Captures.pdf": "QaiUIfxJ0tH23NdzW77ceeBtlZsuNbIgZGKKV5KNPL0=",
  "./assets/psychopathologie-documents-20261110/Psychopathologie_Fiche_revue_41p.pdf": "M1N6a6tfeQm1S4mVF0W64ZCj1ItGybM4V9L7fdjUUuQ=",
  "./assets/psychopathologie-documents-20261110/Psychopathologie_QCM_113_Corriges.pdf": "/73FGVzBEvHdhFgHuFB0b2NpFk+Ihb9/uaz8IefGQHk=",
  "./assets/psychopathologie-documents-20261110/Psychopathologie_Flashcards_350.pdf": "o0xcU4+Ec88H+Hm0rSTKksTAyPfErNP2t0F9ZxO2vOY=",
  "./assets/prevention-consolide-20261109/Prevention_risque_infectieux_Fiche_Consolidee.pdf": "bFxnUr4Mh9qfqUv14A5Tp+Yd2Mc+vsuGozF6Ky9wm7k=",
  "./assets/prevention-consolide-20261109/Prevention_risque_infectieux_QCM_128_Corriges.pdf": "pwlIZukjx7vew667H7EsjUISG3ptswHXpewZQXSdXkI=",
  "./assets/prevention-consolide-20261109/Prevention_risque_infectieux_Flashcards_128_Recto_Verso.pdf": "W3ebDvijLt5U5RN1xcX3FrMA6zLwNiU/115VcYsl84I=",
  "./assets/vih-correction-20261109/VIH_Fiche.pdf": "hJxD6pFtnRNosH7s1v/E951xW7v03n8g2bDLjH0z1Ek=",
  "./assets/vih-correction-20261109/VIH_QCM_50_corriges.pdf": "L8WhRfACkFsZpd9hy6GjCbGwuoFKXqiRurIICiweugA=",
  "./assets/vih-correction-20261109/VIH_Cartes_50.pdf": "7M1JW6J64TxLlgcBk4RLAqWOBGXFZv5CasDMD161aPI=",
  "./assets/douleur-qcm-flashcards-20261108/UE_B3_Douleur_QCM_90_Corriges.pdf": "lhetLteSmxcejoR15hl6+XQglS4tpX1g5B7hISHqo78=",
  "./assets/douleur-qcm-flashcards-20261108/UE_B3_Douleur_Flashcards_90_Recto_Verso.pdf": "R84uPKwVbjeFf/SztrawywiLEK2/Z+xAuL6oYbiw4uQ=",
  "./assets/prevention-fusion-20261107/Prevention_Fiche_unifiee.pdf": "HuQqWz4vWWTSPFEbnoeQIlR1siL80HGMnJjYB9PKWog=",
  "./assets/prevention-fusion-20261107/Prevention_QCM_104.pdf": "+pY1SunCJP/UHfnwffEUz5zeyRi1Ihwc0V3IaWRWN+8=",
  "./assets/prevention-fusion-20261107/Prevention_Flashcards_104.pdf": "iXneSdD87+5MOzw0hZ+U+zB04A+uKq+dEY8uH9a8vgw=",
  "./assets/offre-soins-20261106/Offre_soins_Fiche.pdf": "6eZG112rFt/g51I+S8PSPTiZ8MbfGMfgl8pXzvMrU4Q=",
  "./assets/offre-soins-20261106/Offre_soins_QCM_60.pdf": "eQZ3I3s6WaP3tYFkspEZkJW2CvTcLZBt7xzGxeX4Gww=",
  "./assets/offre-soins-20261106/Offre_soins_Flashcards_60.pdf": "NeHkit3TJPXu4smSXTTiuq7h1GP7RcIhYxxyc996dgA=",
  "./assets/offre-soins-20261106/Offre_soins_Support_officiel.pdf": "2tmvKiZOLUHwD6v4Z4tpShOQyTeAWKG9ArxFfs9C+eo=",
  "./assets/sante-mondiale-20261103/Sante_mondiale_sante_France_Fiche.pdf": "oAyZ74yJvVQNOu7Zjf2AC3gBJ/kA7O10aCX0PA/d6Sw=",
  "./assets/sante-mondiale-20261103/Sante_mondiale_sante_France_QCM_72.pdf": "Nz3BNo8CmR1ZRT+tlBJaYXzkp6j5+Tz8qtScqNRPzvA=",
  "./assets/sante-mondiale-20261103/Sante_mondiale_sante_France_Flashcards_72.pdf": "uVUI7VKgAfan2TT8r+OMHcAZYHKyFE/kUkziOj0zeyg=",
  "./assets/diarrhees-infectieuses-20261103/Diarrhees_infectieuses_Fiche_14p.pdf": "WSY6yCBSuBiTjvusAIDBLKrxplQ3avGTQQJsN+d/FUY=",
  "./assets/diarrhees-infectieuses-20261103/Diarrhees_infectieuses_QCM_63_Corriges.pdf": "8yGBVmtAM8ebDzoMMhGF4gdvU6Ke0o/nG5Gi0J5sy90=",
  "./assets/diarrhees-infectieuses-20261103/Diarrhees_infectieuses_Flashcards_63.pdf": "m0r7s0NYQHsxD50eRho/B/CavMKr0poRuRlNDr4aWaA=",
  "./assets/diarrhees-infectieuses-20261103/Diarrhees_infectieuses_Support_officiel.pdf": "Vf/6U6ozXCyxCrGa8Zu87/j/jcPnwn+7nBANfFPKZZA=",
  "./assets/sens-refonte-20261103/planche-01.webp": "1CHKDtSrif6r9LPKauNmgjcQCo0BQdnYKooYrfINfQU=",
  "./assets/sens-refonte-20261103/planche-01.svg": "/rhgxEnXTOjihkalzQXbn0dPK4GaR5w6mmrbenPyOd8=",
  "./assets/sens-refonte-20261103/planche-02.webp": "Prs6bq1Rf3bcANQxiX+2ubmccbMGVnPbo4ROPZFj7L0=",
  "./assets/sens-refonte-20261103/planche-02.svg": "ETPTIcub4mn4lPXigjwzWd6W2vchs5wDlUA0B8gQvpY=",
  "./assets/sens-refonte-20261103/planche-03.webp": "fKOj0zNbPG+8rdo+HChwSx8jj5fbmB/TM3zkGybw3r0=",
  "./assets/sens-refonte-20261103/planche-03.svg": "TubO1lSx7pAJYEKv+Ub0MdslKogouoyXr4HWv6TMKBA=",
  "./assets/sens-refonte-20261103/planche-04.webp": "5X7lVbUT+MmO+1i6xh1Nn/8dCRLS1Cp+z7wsoN9dFXc=",
  "./assets/sens-refonte-20261103/planche-04.svg": "B/EGi/ZqMzVlZ1m0c9OCpXt9OU2iDUGZCKZyy/L+MQc=",
  "./assets/sens-refonte-20261103/planche-05.webp": "AQj8zm7dHaA965F8XdgHrxmQcrRANXOcNuoMkvvdmo0=",
  "./assets/sens-refonte-20261103/planche-05.svg": "Vo9O99XBR7lhuxCaJgxPNzrPHbxWV7L/ldhnun+UOdY=",
  "./assets/sens-refonte-20261103/planche-06.webp": "Pceqtrj9pObJHQnid3qv7XDTEtTxCCGq/4UtaFlP6eE=",
  "./assets/sens-refonte-20261103/planche-06.svg": "5BfphbqbehEQujbAkAETta44OHNMCmcFGEpzIF6SQwk=",
  "./assets/sens-refonte-20261103/planche-07.webp": "+e02DA0jMpTWimcZgNS22OsDtZq0a/r1FWLlikjHlkk=",
  "./assets/sens-refonte-20261103/planche-07.svg": "1Ku9gDqAnzPmxzTXsnJIzEChjNruCmGPk4LVIyQSPFM=",
  "./assets/prevention-infectieux-20261102/Prevention_risque_infectieux_Fiche_globale.pdf": "Csr00mBWsEN3ss1jIbMeeYLjMJSvttmOGcEGY9ZlvNc=",
  "./assets/prevention-infectieux-20261102/Prevention_risque_infectieux_QCM_104_Corriges.pdf": "0CdScRSyiuZGoSdHHaoY9X1s7df+AQVyHP6vsAS/c6M=",
  "./assets/prevention-infectieux-20261102/Prevention_risque_infectieux_Flashcards_104_Recto_Verso.pdf": "ugNBsBvNjAEYnODTzAnatyHLmW9IkaSclL5vxYo5HsM=",
  "./assets/hepatites-virales-20261102/Fiche_Hepatites_virales_18p.pdf": "KF+y9F7NZzpiMsxcMw7dxrTHbM8U8sHhP4/Tovr6qyo=",
  "./assets/hepatites-virales-20261102/QCM_Hepatites_virales_50_Corriges.pdf": "SJQv7eH7E1adCgPbJC2zzKZESmvNik47srr0Km9i67Q=",
  "./assets/hepatites-virales-20261102/Flashcards_Hepatites_virales_50_Recto_Verso.pdf": "jl+k4mvqrH262v6uuA6epO26dcpHITjYakz4TmyidjQ=",
  "./assets/psychologie-sante-20261102/Fiche_Psychologie_Sante_52p_79_Definitions.pdf": "nGUd5AeRuDdVvxGog/QNXyqWcpr+3CF7J8bTDUkSb00=",
  "./assets/c11-sante-mondiale/UE_C11_Sante_Mondiale_Fiche_Hybride_V7_3.pdf": "p0+d9XB/X8I9uZ/5Ykq/efSgy4vF+I8Ux/xcgiJjI/w=",
  "./assets/c11-sante-mondiale/UE_C11_Sante_Mondiale_QCM_56_V4_Corriges.pdf": "QVOjtVT7fcZ2+3RcJvirfDAkk8UWFrdDsa9GospsrI4=",
  "./assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_Fiche_Revision.pdf": "RaDs8G2jepEQv4Zse8pCylyPiZTYx5fXEQ+lTIviX0w=",
  "./assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_QCM_50_Corriges.pdf": "Lld6huVWimHAOXBRUEOUDaM3aeefg4nmszaLrn914ZQ=",
  "./assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_Planches_anatomiques.pdf": "OnFrM/vaFjc8pgDOtEhiwKDB/HNyt768WTaZfY57fR4=",
  "./assets/droits-patients/UE_A2_1_S1_Droits_des_patients_Fiche_de_revision.pdf": "UqtgUTdigUq7tItOyKBf9oezwEKdSWiegRhXAVlYRPU=",
  "./assets/entretien-infirmier-20261028/UE_D1_1_S1_Entretien_Infirmier_Fiche_Revision_V4.pdf": "paMeQ0V93FUTNYXH4CdZUoBOBq84eRTuAIF2OFcae1A=",
  "./assets/entretien-infirmier-20261028/UE_D1_1_S1_Entretien_Infirmier_QCM_50_Corriges_V5.pdf": "gRLd6DnRUm3rvQd1GG/nZqI3ZKedaenG2l//wBhOCXo=",
  "./assets/entretien-infirmier-20261028/UE_D1_1_S1_Entretien_Infirmier_Flashcards_50_V5.pdf": "sqTkOVscz5Il7Yohj5nCn8KcyaEMbNLrc96YVtYD5xU=",
  "./assets/vih-20261027/UE_B1_3_S1_VIH_Fiche_Revision_17p_v149.pdf": "NX/MLcjCsg+6XmnP4JHHJJ1cff/s4ZzbRNJHJWMO/24=",
  "./assets/vih-20261027/UE_B1_3_S1_VIH_QCM_50_Corriges.pdf": "vWy1pOPaJ81TjMU/mHclTvi8Fq5vrClR32tZyrpTfvw=",
  "./assets/vih-20261027/UE_B1_3_S1_VIH_Flashcards_50.pdf": "ppr9tblNscdTaJle9v1mn79llu03VVJg/MlPlaa2U+c=",
  "./assets/gestion-stress-20261019/UE_B3_2_1_Gestion_du_stress_QCM_50_Corriges_v149.pdf": "CI7UxMsxsJHt6CBDPLFGHhZ+oFUeHP6B/YA+sFsXRbc=",
  "./assets/gestion-stress-20261019/UE_B3_2_1_Gestion_du_stress_Flashcards_50_v149.pdf": "ytiaGEpOD4+ThTlYY3yeLhmF6Xmcog6vxms9Qs2oPDU=",
  "./assets/gestion-stress-20261019/UE_B3_2_1_S1_Gestion_du_stress_Fiche_Revision_v149_17p.pdf": "0vPrifoOvmx6tGTqJCO1qfvnAEyLMI1ePvE7IjLI5MY=",
  "./assets/fievre-paludisme-20261027/UE_B1_3_Fievre_Paludisme_Fiche_Revision.pdf": "c4IRFOTOJywLj92BgIxlNsE8crRE8hbY2yZosT8urLI=",
  "./assets/fievre-paludisme-20261027/UE_B1_3_Fievre_Paludisme_QCM_40_Corriges.pdf": "vZArSMprkt3y69S3VH/vpZ+QmbGSgmPM5MgAMz8kU90=",
  "./assets/psychologie-sante-20261027/UE_B2_S1_Psychologie_Sante_Fiche_Unique_20p_59_Definitions_20261027.pdf": "2nPEcLNNiaS/dOl2v304lRwfs3Xs3cvFA/IrtwmH1RI=",
  "./assets/psychologie-sante-20261027/UE_B2_Psychologie_Sante_QCM_50_Corriges.pdf": "LSUc7ln1zqp2V+iAeaIdtHGDKecnwrbRbOfOIItPVww=",
  "./assets/relation-soignant-ecoute/D1_Relation_Soignant_Soigne_Fiche_21p_20261026.pdf": "AdmgKIaROfkko9fum2jRaim3hb2vI8EJ+p73Co/4lBE=",
  "./assets/relation-soignant-ecoute/D1_Relation_Soignant_Soigne_QCM_48_Corriges_20261026.pdf": "2+ctC8HbpYzdStuUPJXQecxiQlCCfa0F8HRzC8Y3ECw=",
  "./assets/relation-soignant-ecoute/D1_Relation_Soignant_Soigne_Flashcards_48_20261026.pdf": "AUyPfi/kCTxgr081xsBStNoSwhzFaA47Sh1vBOh+1bU=",
  "./assets/theorie-symptomes-td/UE_A1_Theorie_Symptomes_Fiche_Revision.pdf": "Sy4IB6+NnBUz2pDiS87qPcZrn8HLVdqFb/MIFkyUMh0=",
  "./assets/theorie-symptomes-td/UE_A1_Theorie_Symptomes_QCM_40_Corriges.pdf": "jrLiJJpmpCyenpB0zNsIWKH0FGwpH4r5RT5V1a+bQmw=",
  "./assets/theorie-symptomes-td/UE_A1_Theorie_Symptomes_Flashcards_40.pdf": "tnxx3W/aJlrtI6Y7LCO9yPKEFsGI5s2e8fRoPO6kHn8=",
  "./assets/sante_mondiale_france/c11-01.webp": "ETo8IfS8sz0Jg+ofgW5o6vBN/B36/36nJudmeYrHf5c=",
  "./assets/course-thumbnails/biomolecules.webp": "Wybl4SgMZLDVNihock3J00l1iqriKT4JB3x+IJZKZm4=",
  "./assets/course-thumbnails/cellules_tissus.webp": "Zf6XmqpPmsvL8G1zjdtAiC/JGN1qEnBpKthrUvZiM3I=",
  "./assets/course-thumbnails/homeostasie.webp": "e8dH1I7pISiRQyY/LNCpYbQD41Rzu1uV57zym+zyH9Q=",
  "./assets/course-thumbnails/parasites_champignons.webp": "VBBczx30i3AxhIPs4rOxGOESiI/j6CRrnNZy26FY/bE=",
  "./assets/course-thumbnails/genetique.webp": "KVMbiahHcOzRoX1T+f216GMlButmBPwmTxykbOPZyqA=",
  "./assets/course-thumbnails/niveaux_organisation.webp": "a+STQaI16gngA3NI9F90pJfYGr8hvzIjseYceqFptIQ=",
  "./assets/course-thumbnails/physiopathologie_infections.webp": "ErBU6bEUeU2xN4GWF+LePbmWUb0Jl7S7eaIRjORiwPE=",
  "./assets/course-thumbnails/diagnostic_virologie.webp": "QjVbUnZKzHpMgysLLyC0fgyciYhiv3fBR2Y5YOVlZT0=",
  "./assets/course-thumbnails/virus.webp": "xTvn+XPj02cHD9cKNSM2yoM/j/ZRjeNWNAYhkkxNyds=",
  "./assets/course-thumbnails/systeme_urinaire.webp": "5E3nYU1AIVHGE5L9ATwltjs+xEbzR7aBCZfZawSST2k=",
  "./assets/course-thumbnails/systeme_endocrinien.webp": "X4pGw9aiHn3QhDjkXgR+3D14m81OeXplPWl57+7UJIU=",
  "./assets/course-thumbnails/systeme_immunitaire.webp": "m71Iz7f4FTCmWzo+HAEgwNkdCXZc4khhCsUvLRQujfM=",
  "./assets/course-thumbnails/systeme_respiratoire.webp": "wOc3OAvae13yQJ40PpP+b/Y7pOXu2uHnpipLbexMzNA=",
  "./assets/course-thumbnails/systeme_cardiovasculaire.webp": "EQwqUHZp49zPTlRUeBkQOgB7PW4wHEv6RTNdE4odFRY=",
  "./assets/course-thumbnails/prevention_ias_asepsie.webp": "zoO8V2ockYwdw2KsOsAmjGJhniG9DgOyJM54H0Ld3pg=",
  "./assets/course-thumbnails/systeme_nerveux.webp": "nqLV4QxegQC0SKoLI/Usy4lsGihKhRgoA3yHvCeEVwg=",
  "./assets/course-thumbnails/infections_neuro_meningees.webp": "Nwk7Xlo2w8SDVB071VrN31sZ+pZYveOLIf+q6m7jzmw=",
  "./assets/course-thumbnails/calculs_doses_mathematiques.webp": "ATCMwQtUE9CFwaDxMkM5gS15Lstc0kwEhaWG7lckn30=",
  "./assets/course-thumbnails/systeme_digestif.webp": "eNDileVQa3pFkYcrzZL7rkrlQ0eLxgieE3vsTZOlfR8=",
  "./assets/course-thumbnails/appareil_locomoteur.webp": "dYwAWlYuxMmiuTLHz4r/UkC3H3zjJvyiaFKxfZtsD/s=",
  "./assets/course-thumbnails/traumatologie.webp": "FNvfhsL+1VKJJe29ZscNFRpI1jkTGXOtZza0Dhj11h0=",
  "./assets/course-thumbnails/histoire_profession_infirmiere.webp": "cQ98vOj1e/ATCSz7IxiATZ7BaAuYs2rQ8cuUyY/W37c=",
  "./assets/course-thumbnails/epistemologie_savoirs.webp": "4xfHJkFZ6KJqgDzF2pvOexgL4bo+3j/QXqlAzdsDu10=",
  "./assets/course-thumbnails/ethique_infirmiere.webp": "qwM68A5sicyAfQxyYH8Bl+f837azXct90bEurtI8NMo=",
  "./assets/course-thumbnails/douleur.webp": "Hf+OroVe6+0Mia5OV560crMju3IfaMtBZ8wpir+wI0E=",
  "./assets/course-thumbnails/parametres_vitaux.webp": "k4lXuqljfCHIMKz18rs7pRFS2oqKD0GkECsEe8aiQGM=",
  "./assets/course-thumbnails/grands_brules.webp": "s9lyE0PvPKMKGPVzRsgqjLWWagjKR1j/NqVraQIzxUU=",
  "./assets/course-thumbnails/infections_cutanees.webp": "5vApr9GM7IgA/y79oXcaytA7P4WokWUBHZ/jeQ2CkZQ=",
  "./assets/course-thumbnails/diagnostic_bacteriologie.webp": "bbZGQ+m+WRI7yKvTurtQe4mbqBwrBYsnWshnC25FSy4=",
  "./assets/course-thumbnails/infections_urinaires.webp": "HPVHhJwSOyz3rmLNehFhQgyBANGjRCiTCCfbfQwNaCI=",
  "./assets/course-thumbnails/arthrose.webp": "u1gM/mON1Nu++ja0o/BcxjuKM+Zd/qBoQeE7E3LPdUg=",
  "./assets/course-thumbnails/chirurgie_orthopedique.webp": "rvVkwxyOErCxsyC7jNzB5Aurnaw2qpWX7U1CI2ZQrSQ=",
  "./assets/course-thumbnails/rhumatismes_inflammatoires.webp": "DFgeqVT3i5YHUbAoacsaX6qrWcZx0LnaHVIf5ViAg9A=",
  "./assets/course-thumbnails/pathologies_microcristallines_osteoporose.webp": "ONfV2gyyoSBnf2vs3quvBG7+ZMeSog+tn6NCY/YL4oE=",
  "./assets/course-thumbnails/competences_psychosociales.webp": "ngg9V3Dp9zzj3tpmYMSLeAc/mqe95OXDyrW2baKShlo=",
  "./assets/course-thumbnails/methodes_travail_reussite.webp": "9XwKnhSPjngVg5yjBqeDxq5NSn8GeRyOOQ+GRdwt1Cg=",
  "./assets/course-thumbnails/vaccination_prs.webp": "Rz5ChxTKpw8JZniWxz08C3Yo2r8i1DRR72qXzMs0pl0=",
  "./assets/course-thumbnails/infections_pulmonaires_bacteriennes.webp": "nZiM3aufqzp9CtQqjHhbjNCTWiMvBBgyA7IIwmdfwsY=",
  "./assets/course-thumbnails/infections_respiratoires_virales.webp": "q6xx14Vs7bdeTFgM3KbQxoA6+CaFeHYWOTROuhyJYPk=",
  "./assets/course-thumbnails/ist_hors_vih.webp": "PaanY2bHAj3MooCx/V2/oipyMO5BAG7vlB6uOGyBIgQ=",
  "./assets/course-thumbnails/introduction_droit.webp": "vIZYi2MkQoc+bgmpcUaV1vSUUxOpsVKKd9NhyAGyO6U=",
  "./assets/course-thumbnails/psychologie_sante.webp": "mbzOkdsQbZdfdu1VuGlzo3mmaAV5kXSJ843BPhQ0K+s=",
  "./assets/course-thumbnails/pharmacologie.webp": "DBhjBubz6yYtfrtk0eQRWUlkS0fOdZVzXwWF0/or11c=",
  "./assets/course-thumbnails/administration_medicamenteuse.webp": "AbFlhNLN+vRBK9gtPVzJyPQ39XRHa6eG4gB20mDwsJc=",
  "./assets/course-thumbnails/systeme_reproducteur.webp": "AEtuSXuJGXDkZAWn0l4fXllSoDklibt2mYVPMFCwPnk=",
  "./assets/course-thumbnails/plaies_pansements.webp": "g3yG1jxKpaIce1T2VPIyrv7ALv+dTdkddHuEiUBf7lE=",
  "./assets/course-thumbnails/stomatotherapie.webp": "pqUyhlM4ruQqTtenCj07DCsDfjJN4uugUgMs8baPflE=",
  "./assets/course-thumbnails/droits_patients.webp": "lM8wWrugH4cOhndBOouJvMo/aFkn3Lxhqo6x3Yn4CMg=",
  "./assets/course-thumbnails/pssm.webp": "Ox8i8TbQiPkRGJ33nxrqlCSPwAvs33ZW4XSgqHx9/ks=",
  "./assets/course-thumbnails/sante_mondiale_sante_france.webp": "IuYKGE90Qx78sz2Qu8Qax+Ze/I9secr/EBSebTe1vQ0=",
  "./assets/course-thumbnails/responsabilite_exercice_professionnel.webp": "Hju+DtOW8B/8zpLUVowtch6E3UNJPw3U6P18Qo8QVgg=",
  "./assets/course-thumbnails/d1_communication_td1.webp": "D9TfcxzNGRo4MsK7oJ3dE0HxUSfBE7I/kq7XEQdwlv8=",
  "./assets/course-thumbnails/d1_posture_professionnelle_td2.webp": "kMwUMFJimYyicCMUtkErb0CIWY21KHBSscDvkieFFsU=",
  "./assets/course-thumbnails/d1_bientraitance.webp": "BdPBQMwnRdogJQ4gH3mWZsQhzYylunE2IyZ7R+VNbOM=",
  "./assets/course-thumbnails/d1_relation_soignant_soigne_ecoute_active.webp": "0E4ZN+esgiOhmA+aG9wg5Q5s/sgW2G1qSIdCOIHNIgM=",
  "./assets/sante_mondiale_france/c11-02.webp": "yTTlEw/UVlpmYMXVH9rZNE74N2hagfTp/b5ZveJQI5w=",
  "./assets/sante_mondiale_france/c11-03.webp": "YnUEFW1sPmZQe4srudY4tdD/rzmlOEnOy+ioRnIgi7w=",
  "./assets/sante_mondiale_france/c11-04.webp": "V8NON6cd9mQZ7bmiGEfdOP65EAoNNd6/x/gTSibbehw=",
  "./assets/sante_mondiale_france/c11-05.webp": "roCsIL7wqFDvPNicsgX525tjIPiQF93p1KVVQ155+ZU=",
  "./assets/sante_mondiale_france/c11-06.webp": "fdNFPUhXDJkdwhttp8Z+sFla659KbxZ9rBNTXwX3wG0=",
  "./assets/sante_mondiale_france/c11-07.webp": "ADnHxvP9xB95FSl/mbuvVjuwTh3lQsSG5wWLLUQ0ahc=",
  "./assets/sante_mondiale_france/c11-08.webp": "ebm8rufr2PbqClRoQO9X0n6eTQIV/Zq9SbYKR2WBvkc=",
  "./assets/sante_mondiale_france/c11-09.webp": "ZF1Omf7sU7VE7skue+4efTuk0sMt891kagFdkSiMeW4=",
  "./assets/ethique_infirmiere/care-p02-care_cure.webp": "OU3pk7IC+1CaJZXeWO6dukHXgN24Hjof/c1OGeVQTN0=",
  "./assets/ethique_infirmiere/care-p02-gilligan.webp": "6vpeWIWG6plkJvK31/tqUttcX8Pf0DrChlS2cOj5hiE=",
  "./assets/ethique_infirmiere/care-p02-tronto.webp": "f+X2G8ReugjhAFKtlXLYUTZ02b2DrvRoWz2q/JhfWcg=",
  "./assets/ethique_infirmiere/care-p02-phases.webp": "hpBsx2qudRVFoGHbhTuiWctEuQ7TYEBX1W67HeDNRAM=",
  "./assets/ethique_infirmiere/care-p02-cas_ehpad.webp": "wOh4kdFeCmYBWfdFWDN2W7Bf2lcu+hnY4C7xHBejCbA=",
  "./assets/anatomy/reproductive/review/R02.jpg": "RVlV2Fg65j5A7HldaiaKHDDECcdHraZujgZUKfceulE=",
  "./assets/anatomy/reproductive/review/R03.jpg": "xT85WU+6hW9aONZZV6rNfccbiiTe1efV5AJDMhZ6leg=",
  "./assets/anatomy/reproductive/review/R04.jpg": "m60B8Sjs2OVCwu11uom4Y6t1T9vR/+KWRymRjUSXhbs=",
  "./assets/anatomy/reproductive/review/R05.jpg": "S94Ttsl387j5ykjNU5/lTA74py0aOiZNQef1xKWwh/g=",
  "./assets/anatomy/reproductive/review/R06.jpg": "xx3TtD42kr1zjvN7ZWfQcl22/oylHYObuw78yDArCwU=",
  "./assets/anatomy/reproductive/review/R07.jpg": "RRHuH5jg7NzHByWDzR6tvWAQUUR4nlSnoe7AycxXTMY=",
  "./assets/pharmacologie/pharmacologie-p01-composition.webp": "vhGs0obTzW8J8xBW/BDfViAPEiuqrVH/fTj1HpGuTdw=",
  "./assets/pharmacologie/pharmacologie-p01-essais.webp": "K2OF0gzrxMmwhUkgqRQq0Qj/FW23jNRYxxUUPCtBZ2s=",
  "./assets/pharmacologie/pharmacologie-p01-voies.webp": "XsfV5a3iVE/95Q4ymBr2yjtPXLySgCgTBwCluUCa0jk=",
  "./assets/pharmacologie/pharmacologie-p01-calculs.webp": "bQdmQHIr0T+RYPLgDGJqRrG70el9SyEXsoD4m4UXOaQ=",
  "./assets/pharmacologie/pharmacologie-p01-cibles.webp": "2kCu5tDcg6AxRaMBKNBI/sata2dT5Tr6QJV0upEX4ww=",
  "./assets/pharmacologie/pharmacologie-p01-signaux.webp": "BhC8nZZ0gdNlBFGHJ2JlspJAEo1N4SJ0pkCUb5vPqAU=",
  "./assets/pharmacologie/pharmacologie-p01-courbes.webp": "Ptc3YQAWHouLALdwn9NBLZKlSIl+3WimSRbP94ZbwHo=",
  "./assets/pharmacologie/pharmacologie-p01-adme.webp": "VTFoskcaYSLFQVifnQL5zw/EySPHsa5YOs79BB0Ioi4=",
  "./assets/pharmacologie/pharmacologie-p01-demivie.webp": "mVFNiLQVN44SFJRMI9HdBPGTXt3VpxmN0xbFZpuOZh4=",
  "./assets/pharmacologie/pharmacologie-p01-prescription.webp": "2bQ1UR1u5KphX8wU6oJ4rmrat52kfCPipV4LGv8gdAE=",
  "./assets/pharmacologie/pharmacologie-p01-vigilance.webp": "YzQTLU5DnF5Kxfz86huq3ZULVa7GheHM8hCGDr30CvQ=",
  "./assets/infections_neuro_meningees/infections_neuro_meningees-p01-meninges.webp": "ekGxzufyPn74ONruORP/hffhBBmVmDWd8hQNQZndIsE=",
  "./assets/infections_neuro_meningees/infections_neuro_meningees-p01-clinique.webp": "SGHGklheTLYq58Uore+V9k60f8O/AnlKqqOi4Qbph1Y=",
  "./assets/infections_neuro_meningees/infections_neuro_meningees-p01-purpura.webp": "KYNqCNhotcPFjd3CwXiRZ0rnGE8hLLmztezX6Cnhdqw=",
  "./assets/infections_neuro_meningees/infections_neuro_meningees-p01-priorites.webp": "peOm6zDgMKlVeKX4JeQM98Fgvf1HDatfyuWI5DO0td8=",
  "./assets/infections_neuro_meningees/infections_neuro_meningees-p01-pl.webp": "XXd8SRk4fhQh15IFF2TGzqEijJkAMS8MboNruG/qV2c=",
  "./assets/infections_neuro_meningees/infections_neuro_meningees-p01-lcs.webp": "x/I0a3MVUsVkAsbO+dz1aMicByTlDs5MAOniklWAktU=",
  "./assets/infections_neuro_meningees/infections_neuro_meningees-p01-abces.webp": "DlwFEzNu512giJQsMNAIxOMujkAxpBrHpMm3oi+RtXE=",
  "./assets/maths/fiche-maitre-methodes-calculs.svg": "LeU0JmCVIbrn4jZVxh+5qb2ji9O1mEWhRTniydSqLmY=",
  "./assets/plaies/plaies-p1-01.webp": "Dr5W2WOHGYv2ljyz+ClVCABQ5GXYRZPyS42jUn1zepU=",
  "./assets/plaies/plaies-p1-02.webp": "BtaY6g4tATV7PR9v7kiHR4zbjXOCzXmyxrdGjzzX/SM=",
  "./assets/plaies/plaies-p1-03.webp": "7VRgK2xA4piBAHDFF0Vrx3vqqfcBQdTiteYz916Fkp8=",
  "./assets/plaies/plaies-p1-04.webp": "UvCS+MYKlCXO5IU4CGeeoa+B3sKY3GZI/IH7JGXFxFY=",
  "./assets/plaies/plaies-p1-05.webp": "31OrUmSU15iGy5M5I+dbeydRqqZu4CdWtVAg8dZdA9Y=",
  "./assets/plaies/plaies-p1-06.webp": "s+Wl2zRtIeCaJCRBXbbLan+ihO4TKNTFquE04VM+RiU=",
  "./icon.svg": "SbDGUG7JZMcDm0154RUvI+7PuWt7Zo0sLtzSGkVl8f4=",
  "./assets/locomotor/locomotor-01.webp": "hasqnNaZ4tAb4nkiGfPcONkuzEdhklJMdm18Fy3IPp8=",
  "./assets/locomotor/locomotor-02.webp": "PBtdPaE/e6V01h8ozgge50j1jlI7FkrnhRs1IZoReIA=",
  "./assets/locomotor/locomotor-03.webp": "16JXriDDDy3igkRnjzQ/6lLd1pvp8O+KD1T9F4AofV8=",
  "./assets/locomotor/locomotor-04.webp": "1LRKKOJVmFH5FVSHBjeSsnZqFPnc8iVbM1sveCSZv08=",
  "./assets/locomotor/locomotor-05.webp": "EzevnbFkxTUjmhiKdXBEwbDRsnDR2tj0B9L9EzN/8ig=",
  "./assets/locomotor/locomotor-06.webp": "EzSB+STmd5f6CDYcKJY2vYbtDTng6+SrPqSyhMEBt+c=",
  "./assets/locomotor/locomotor-07.webp": "LFytb+MgDQbN1Xmu0WBhRGF0MnnWnB7N7inQTnddWFg=",
  "./assets/locomotor/locomotor-08.webp": "odqtHZOalf8Bl1JB6TSCdjsF0s2bTcHvyUi0DwYMnAc=",
  "./assets/locomotor/locomotor-09.webp": "8sdgHDR+lWMqV2ST5YaJsVSkH29jPXWu9AV8Cbkfs7Y=",
  "./assets/locomotor/locomotor-10.webp": "vEeLSuTIBlUl7F8k+FhmOjikAy2xHiwyJNl1lcV3QtU=",
  "./assets/locomotor/locomotor-11.webp": "hH3hZH/eaAh8OuWcVMP8tkR0KXQgP+HSEcyyu1l5BN8=",
  "./assets/locomotor/locomotor-12.webp": "R7Hvrf+Bc2HghY0/oM3cwV78gFCCgr99zkzek2AgOSE=",
  "./assets/locomotor/locomotor-13.webp": "ySINRikPRHdailsAcQGluFLWOyFhBiyKHf7DF64ddts=",
  "./assets/locomotor/locomotor-14.webp": "3XJxMabQGi3a/EmOq4JEnPF5v+Q8K/B9jk2UATeFNyg=",
  "./assets/locomotor/locomotor-15.webp": "q0DC/xeD/LI/QvhH/VhO7fEj8JjwctJCHTu/MJ3P3jw=",
  "./assets/locomotor/locomotor-16.webp": "Xcy1613tcE4eH8Qj82LQ+StGwFVjuPkFKztPD0GaRRI=",
  "./assets/locomotor/locomotor-17.webp": "gZkHgvCUCAbVXXglZgrFiX8psPNld/NbKfgSsTkFjXc=",
  "./assets/locomotor/locomotor-18.webp": "7sptlZ3vdQM8mq15PpsDdcHnJHSgVEJUL7OSkEwOoMg=",
  "./assets/locomotor/locomotor-19.webp": "n94X1NTcezn5MHJ3e1y9pbz5zE/dzN1yzVVl6ZLKdcw=",
  "./assets/locomotor/locomotor-20.webp": "apjC+0utZJ25LsuDIHE9n8+tPcoIweEgl3cRAT8IBuQ=",
  "./assets/bientraitance-p01/D1_Bientraitance_Fiche_Revision.pdf": "KcC2dM54Y8PEFVF6Ec+rvY+vhGH9Etfcl0gMqrVqNyM=",
  "./assets/bientraitance-p01/D1_Bientraitance_QCM_40_Corriges.pdf": "xcXGPUTv+tbZVmePtiBt0iJ2icsxIrB3oNF+iendibU=",
  "./assets/bientraitance-p01/D1_Bientraitance_Flashcards_40.pdf": "xubyx1Y1Ocj1ASk+yBccJUJtRmN6fpPoSG/MbqRhmUY=",
  "./resp-official-overview-learn.jpg": "mCtbLsUlrh7yntwzCZDIXe8+sBQpylZbj1Tt2BaW3qg=",
  "./resp-official-overview-test.jpg": "ESMpM+GRMaSYSCirN/GZeizbTL2SQXiAiIPEFE7RVGU=",
  "./resp-official-bronchial-learn.jpg": "h7MtDCZ3wmuSjhuV9TrhELeXJjSHRfDiGbKM0b3XjUg=",
  "./resp-official-bronchial-test.jpg": "AyHLwoSqxI9A+lSsSN3Xw86vBxajTtvMET38nf5sW94=",
  "./resp-official-epithelium-learn.jpg": "7plwBd6BZFWUT/aodrUwrZi4x1cVsnfIfaGFUh4gzx8=",
  "./resp-official-epithelium-test.jpg": "GHFFbptVS0blDDXYGioPyZBKH6Fa6JUdGsoUeWNaRlQ=",
  "./assets/stomatotherapie/stoma-p01-01.webp": "3/Bsx4NnGZOSahYQHCyxZPcYHUDoyq/8p+SPIbrfYb0=",
  "./assets/stomatotherapie/stoma-p01-02.webp": "rw7SshBUhJ3GpTIFkK3hn9OJy8qFp5PkeqByE70iN9U=",
  "./assets/stomatotherapie/stoma-p01-03.webp": "uJICmJ6xL9IQVlapWC5HWkaOIIWVggnJVRHfqTxqnvo=",
  "./assets/stomatotherapie/stoma-p01-04.webp": "KDgvc3Ebk2AqLwfJquE+x3SAq+00neEUpZW9hoUykqI=",
  "./assets/stomatotherapie/stoma-p01-05.webp": "MqBJhDv4bpOKUqUAVmkBfoFWFW2boIi7OTRC/90LY70=",
  "./assets/stomatotherapie/stoma-p01-06.webp": "0fkvDdN1hVgpakAoKeEYuRMJqiZ5AIK+J4SbeII9iwM=",
  "./assets/stomatotherapie/stoma-p01-07.webp": "dQvfcIla/CVAF9gRL5IvPCNOGcAs/7oWerS4UsO8vBA=",
  "./assets/droits_patients/droits_patients-p01-psy_chronologie.webp": "YRIsAzrQFKyWUI1xaLYTqvpl7kdiXISqytHZmY+weT0=",
  "./assets/psychologie-sante-20261029/Fiche_Psychologie_Sante_39p.pdf": "I2xe7QmKk608hVAu8CRqDb1lPVKFlfjHLj7ktp1Flb8=",
  "./assets/psychologie-sante-20261029/QCM_Psychologie_Sante_62_29p.pdf": "x1Woi9jHpYvXPqVm1ngRYGhJh6vUIuV/2iKo02jc0s8=",
  "./assets/psychologie-sante-20261029/Flashcards_Psychologie_Sante_71_12p.pdf": "aDn8uRCTOD643FJXFrjdzGTn9LAK5W+pl6yhKeX3txY=",
  "./assets/psychologie-sociale-20261103/Fiche_Psychologie_sociale.pdf": "dj2JvjUvYBgmdKi+x+m2cZc560qvYEKk46a0gAwSFVE=",
  "./assets/psychologie-sociale-20261103/QCM_Psychologie_sociale.pdf": "qi47+kxK/ClgsOcJGuNQQaHUg1N1MIumvfSulj69OW0=",
  "./assets/psychologie-sociale-20261103/Flashcards_Psychologie_sociale.pdf": "JFeo8AG7y+2yMx94WMHz4PByYH0uI/kI6wiSwgbqy5g=",
  "./assets/etapes-vie-20261104/Etapes_vie_Fiche.pdf": "QxDYa2lFfNnrvzObkXMkae5UzVdNtquALPZhtpkIMqA=",
  "./assets/etapes-vie-20261104/Etapes_vie_QCM_68.pdf": "TAPYo9ONkDI0krAAoXGZWaUqBfk4H4ipan4uxo+9Ptw=",
  "./assets/etapes-vie-20261104/Etapes_vie_Flashcards_68.pdf": "15UDzN4siUQylonJkaLt217DlcrdKkX6r9jHIIX6Dqc=",
  "./assets/determinants-sante-20261105/Determinants_sante_Fiche.pdf": "9wQD6SCJYnlLqc/wWWoned77hap4Y7XZD6mGbpS1woo=",
  "./assets/determinants-sante-20261105/Determinants_sante_QCM_60.pdf": "4guev/CQ6CyHITdf18HEmuU6Ry3+OK3O86Ynxp4chJ0=",
  "./assets/determinants-sante-20261105/Determinants_sante_Flashcards_60.pdf": "wlVowItMKBrGFuA+qWl4ASNYBrholSULnPao6wcnPDo=",
  "./assets/prevention-promotion-20261113/UE_C1_S1_Prevention_Promotion_Sante_Fiche_Revision.pdf": "gtlNdpb9JZlf5eiZ8fTL71JBJxQ0CscDyvLzqOOmQbs=",
  "./assets/prevention-promotion-20261113/UE_C1_S1_Prevention_Promotion_QCM_60_Corriges.pdf": "hTGH7VdARn8QZl5ned/DNicN/e110fCAacKT35s2Ro0=",
  "./assets/bientraitance-20261115/D1_Bientraitance_Fiche_Complete.pdf": "DgDqA2TK5o2yt3alSLsCh7hVfLbkBZ+H9K1JlFhg9Ks=",
  "./assets/bientraitance-20261115/D1_Bientraitance_QCM_63_Corriges.pdf": "7jqYnNfSoLJKE6cU8G5QyaG7rvr/r0G0Aa9RlOr/RLA="
};

function mediaCacheName(){
 return 'ifsi-abc-offline-media-v1:'+self.registration.scope;
}
function mediaKey(name){
 const key=new URL(name,self.registration.scope);
 key.searchParams.set('sha256',MEDIA_DIGESTS[name]);
 return key.href;
}
function validFullMedia(response){
 return response?.status===200&&!response.headers.has('Content-Range');
}
async function matchesDigest(response,digest){
 if(!validFullMedia(response))return false;
 const bytes=await response.clone().arrayBuffer();
 const computed=await crypto.subtle.digest('SHA-256',bytes);
 return btoa(String.fromCharCode(...new Uint8Array(computed)))===digest;
}
async function downloadMedia(name){
 const request=new Request(new URL(name,self.registration.scope),{
  integrity:'sha256-'+MEDIA_DIGESTS[name],cache:'reload',priority:'low'
 });
 const response=await fetch(request);
 if(!validFullMedia(response))throw Error('Média indisponible : '+name);
 return response;
}
async function installMedia(names){
 const media=await caches.open(mediaCacheName());
 const present=new Set((await media.keys()).map(request=>request.url));
 const missing=names.filter(name=>!present.has(mediaKey(name)));
 if(!missing.length)return;
 // Les anciennes versions stockaient les médias sous leur URL sans empreinte.
 const legacy=(await caches.keys()).filter(key=>key.startsWith('ifsi-abc-v')&&key!==CACHE).reverse();
 const previous=await Promise.all(legacy.map(key=>caches.open(key)));
 async function installOne(name){
  for(const old of previous){
   const response=await old.match(new URL(name,self.registration.scope));
   if(await matchesDigest(response,MEDIA_DIGESTS[name])){
    await media.put(mediaKey(name),response);
    return;
   }
  }
  await media.put(mediaKey(name),await downloadMedia(name));
 }
 for(let offset=0;offset<missing.length;offset+=4){
  await Promise.all(missing.slice(offset,offset+4).map(installOne));
 }
}
async function readMedia(name){
 const cache=await caches.open(mediaCacheName());
 const key=mediaKey(name);
 const hit=await cache.match(key);
 if(validFullMedia(hit))return hit;
 const response=await downloadMedia(name);
 try{await cache.put(key,response.clone())}catch(error){console.warn('Média non mémorisé',name,error)}
 return response;
}
self.addEventListener('install',e=>{
 self.skipWaiting();
 e.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  const required=BASE_ASSETS.filter(name=>!ALL_EXTRA_NAMES.includes(name));
  await cache.addAll(required.filter(name=>!Object.hasOwn(MEDIA_DIGESTS,name)));
  await Promise.all(ALL_EXTRA_NAMES.map(async name=>{try{await cache.add(name)}catch(err){console.warn('Préchargement QCM différé',name,err.message)}}));
  await installMedia(required.filter(name=>Object.hasOwn(MEDIA_DIGESTS,name)));
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='IFSI_ACTIVE_BUILD')event.source?.postMessage({type:'IFSI_ACTIVE_BUILD',build:BUILD});
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const media=await caches.open(mediaCacheName());
  const keep=new Set(Object.keys(MEDIA_DIGESTS).map(mediaKey));
  for(const request of await media.keys()){
   if(!keep.has(request.url))await media.delete(request);
  }
  for(const key of await caches.keys()){
   if(key.startsWith('ifsi-abc-v')&&key!==CACHE)await caches.delete(key);
  }
  await self.clients.claim();
 })());
});
async function runtimeMedia(event,mime){
 const request=event.request;
 const cached=await caches.match(request.url,{cacheName:CACHE});
 if(validFullMedia(cached)&&cached.headers.get('Content-Type')?.toLowerCase().startsWith(mime))return cached;
 const response=await fetch(request);
 if(validFullMedia(response)&&response.headers.get('Content-Type')?.toLowerCase().startsWith(mime)){
  const copy=response.clone();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request.url,copy)).catch(error=>console.warn('Média non mémorisé',error)));
 }
 return response;
}
async function cachedPdf(event,name){
 const request=event.request;
 const cached=name?await readMedia(name):await runtimeMedia(event,'application/pdf');
 if(!validFullMedia(cached))return cached;
 const range=request.headers.get('range');
 const match=range&&/^bytes=(\d*)-(\d*)$/i.exec(range);
 if(!match||(!match[1]&&!match[2]))return cached;
 const pdf=await cached.blob();
 const start=match[1]?Number(match[1]):Math.max(0,pdf.size-Number(match[2]));
 const end=match[1]&&match[2]?Math.min(Number(match[2]),pdf.size-1):pdf.size-1;
 if(start>end||start>=pdf.size)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+pdf.size}});
 return new Response(pdf.slice(start,end+1),{status:206,headers:{
  'Content-Type':'application/pdf','Accept-Ranges':'bytes','Content-Length':String(end-start+1),
  'Content-Range':`bytes ${start}-${end}/${pdf.size}`
 }});
}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(u.pathname.startsWith('/ifsi-abc-audio/audio/')){e.respondWith(fetch(e.request));return;}
 const scope=new URL(self.registration.scope).pathname;
 const key='./'+u.pathname.slice(scope.length);
 const media=u.pathname.startsWith(scope)&&Object.hasOwn(MEDIA_DIGESTS,key);
 if(media&&!key.toLowerCase().endsWith('.pdf')){
  e.respondWith(readMedia(key));return;
 }
 const asset=u.pathname.startsWith(scope+'assets/');
 if((media||asset)&&/\.pdf$/i.test(u.pathname)){
  e.respondWith(cachedPdf(e,media?key:null));return;
 }
 if(asset&&/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(u.pathname)){
  e.respondWith(runtimeMedia(e,'image/'));return;
 }
 if(e.request.mode==='navigate'||u.pathname.endsWith('/index.html')){
  if(!u.pathname.endsWith('/index.html')&&!u.pathname.endsWith('/ifsi-abc-revisions/')&&!u.pathname.endsWith('/ifsi-abc-revisions')){
   // La page de retour Magic Link ne doit JAMAIS recevoir des scripts injectés par brandedIndex.
   e.respondWith(fetch(e.request,{cache:'no-store'}));return;
  }
  e.respondWith(brandedIndex(e.request));return;
 }
 const qmatch=u.pathname.match(/questions-(\d+)\.json$/);
 if(qmatch){
  e.respondWith((async()=>{
   const baseResp=await cachedBuildAsset(e.request);
   let base=validQuestions((await baseResp.clone().json()).filter(keepQuestion).map(fixKnownContent),u.pathname),extraState=null;
   if(qmatch[1]==='5'){
    extraState=await loadExtras();
    const seen=new Set(base.map(q=>q.id));for(const q of extraState){if(!seen.has(q.id)){base.push(q);seen.add(q.id)}}
   }
   const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'};
   if(extraState){
    headers['X-IFSI-QCM-Status']=extraState.status;
    headers['X-IFSI-QCM-Failed-Packs']=extraState.failed.map(name=>name.replace(/^\.\//,'')).join(',');
    headers['X-IFSI-QCM-Loaded-Packs']=String(extraState.loaded);
    headers['X-IFSI-QCM-Expected-Packs']=String(extraState.expected);
   }
   return new Response(JSON.stringify(base),{headers});
  })());return;
 }
 if(u.pathname.endsWith('/sheets-3.json')||u.pathname.endsWith('/infographics.json')){e.respondWith((async()=>{const baseResp=await cachedBuildAsset(e.request);const base=await baseResp.clone().json();try{const extra=await loadCalculsResources();const add=u.pathname.endsWith('/sheets-3.json')?(extra.sheets||[]):(extra.infographics||[]);const seen=new Set(base.map(x=>x.url||x.title));for(const x of add){const k=x.url||x.title;if(!seen.has(k)){base.push(x);seen.add(k)}}}catch(err){console.warn('Ressources calculs ignorées',err.message)}return new Response(JSON.stringify(base),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'}})})());return;}
 if(u.pathname.startsWith(scope)&&releaseAssets.has(key)&&
    ((key.endsWith('.js')&&u.search==='?v='+BUILD)||
     (!u.search&&/\.(json|b64)$/.test(key)&&key!=='./build-meta.json'))){
  e.respondWith(cachedBuildAsset(key,e.request));return;
 }
 e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r.status===200){const c=r.clone();e.waitUntil(caches.open(CACHE).then(x=>x.put(e.request,c)).catch(error=>console.warn('Cache indisponible',error)))}return r}).catch(async()=>{const hit=await caches.match(e.request);if(hit)return hit;const clean=new URL(e.request.url);clean.search='';return caches.match(clean.toString())}));
});
