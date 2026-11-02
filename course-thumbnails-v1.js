/* IFSI ABC — illustration automatique des cours présents et futurs.
 * Images spécifiques du manifeste, puis bibliothèque thématique, UE et repli intégré.
 * Aucun changement des cours, liens, QCM, scores ou validations des images spécifiques.
 */
(function () {
  'use strict';
  var MANIFEST = './docs/proposals/course-thumbnails-55-assets.json';
  var ROOT = 'assets/course-thumbnails/';
  var filePattern = /^assets\/course-thumbnails\/([a-z0-9_-]+)\.webp$/;
  var published = new Map();
  var manifestState = 'loading';
  var processed = 0, failedImages = 0;
  var pending = new Set();
  // Copie exacte d'une illustration de la bibliothèque : aucun téléchargement requis en dernier recours.
  var EMBEDDED = 'data:image/webp;base64,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';
  var GENERAL = 'epistemologie_savoirs';
  var UE_IMAGES = {A1:'epistemologie_savoirs',A2:'droits_patients',B1:'cellules_tissus',
    B2:'psychologie_sante',B3:'parametres_vitaux',C1:'sante_mondiale_sante_france',
    C2:'sante_mondiale_sante_france',D1:'d1_relation_soignant_soigne_ecoute_active',
    D2:'d1_posture_professionnelle_td2',D3:'methodes_travail_reussite',
    D4:'responsabilite_exercice_professionnel',E1:'epistemologie_savoirs',
    E2:'methodes_travail_reussite',E3:'methodes_travail_reussite'};
  var DOMAIN_IMAGES = {A:'epistemologie_savoirs',B:'parametres_vitaux',
    C:'sante_mondiale_sante_france',D:'d1_relation_soignant_soigne_ecoute_active',
    E:'methodes_travail_reussite',T:'calculs_doses_mathematiques'};
  // Règles sémantiques générales : aucun ID de nouveau cours à ajouter manuellement.
  var THEMES = [
    [/palud|parasite|champignon|retour.*voyage/, 'parasites_champignons'],
    [/vih|immun|vaccin/, 'systeme_immunitaire'],
    [/diarrhe|digest|intestin|gastro/, 'systeme_digestif'],
    [/organes?.*sens|sensoriel|vision|audition|ophtalm|oreille/, 'systeme_nerveux'],
    [/psych|stress|emotion|souffrance.*travail|sante.*mentale/, 'psychologie_sante'],
    [/entretien|relation|ecoute|communication|bientraitance/, 'd1_relation_soignant_soigne_ecoute_active'],
    [/symptom|douleur/, 'douleur'],
    [/roles?.*ide|missions?.*ide|profession.*infirm|posture|soins? infirmiers?/, 'd1_posture_professionnelle_td2'],
    [/offre.*soins|organisation.*sante|systeme.*sante|sante.*publique|prevention|environnement/, 'sante_mondiale_sante_france'],
    [/pharmac|medicament|therapeutique/, 'pharmacologie'],
    [/cardio|circulation|coeur|sang|hematol/, 'systeme_cardiovasculaire'],
    [/respir|pulmon|poumon/, 'systeme_respiratoire'],
    [/urin|renal|renaux|rein/, 'systeme_urinaire'],
    [/neuro|nerveux|cerveau/, 'systeme_nerveux'],
    [/reproduct|genital|obstet|grossesse/, 'systeme_reproducteur'],
    [/endocrin|hormon|diabet/, 'systeme_endocrinien'],
    [/os\b|osseux|locomot|muscul|fractur|orthoped|arthr/, 'appareil_locomoteur'],
    [/plaie|pansement|cutane|peau|brul/, 'plaies_pansements'],
    [/virus|virolog/, 'virus'],
    [/infect|bacter|microbio|asepsie|hygiene/, 'diagnostic_bacteriologie'],
    [/genet|adn|hered/, 'genetique'],
    [/cellul|tissu|biolog|biomed/, 'cellules_tissus'],
    [/droit|ethiq|legislat|responsabilite|secret|confidential/, 'droits_patients'],
    [/calcul|mathem|dosage/, 'calculs_doses_mathematiques'],
    [/recherche|science|epistem|method/, 'epistemologie_savoirs']
  ];
  function courses() {
    var value = window.IFSI_V741?.getRegistry?.()?.courses;
    return Array.isArray(value) ? value : [];
  }
  function courseForCard(card, byId) {
    var id = String(card.dataset.courseId ||
      window.IFSI_V741?.courseIdForLabel?.(card.dataset.course74) || '');
    return byId.get(id) || null;
  }
  function illustrationCandidates(course) {
    var candidates = [];
    function add(id, kind) {
      var path = published.get(id);
      if (path && !candidates.some(function (x) { return x.src === './' + path; }))
        candidates.push({src:'./' + path, kind:kind});
    }
    add(course.id, 'published');
    var text = [course.label, course.id, ...(Array.isArray(course.topics) ? course.topics : [])]
      .join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[_-]/g, ' ');
    var theme = THEMES.find(function (entry) { return entry[0].test(text); });
    if (theme) add(theme[1], 'thematic');
    var ue = String(course.ue || '').trim().toUpperCase().match(/^([A-E][1-9]\d*)(?:\.\d+)*$/)?.[1];
    add(UE_IMAGES[ue], 'thematic');
    add(DOMAIN_IMAGES[String(course.domain || '').toUpperCase()], 'fallback');
    // Ces deux replis sont livrés avec le module et ne dépendent pas du manifeste distant.
    var general = './' + ROOT + GENERAL + '.webp';
    if (!candidates.some(function (x) { return x.src === general; })) candidates.push({src:general, kind:'fallback'});
    candidates.push({src:EMBEDDED, kind:'embedded'});
    return candidates;
  }
  function showImage(box, candidates, index) {
    var selected = candidates[index];
    var picture = document.createElement('img');
    picture.alt = ''; // Le titre adjacent nomme déjà le cours.
    picture.decoding = 'async';
    picture.loading = 'lazy';
    picture.className = 'ifsi-course-picture';
    picture.addEventListener('error', function () {
      if (box.childNodes[0] !== picture) return; // Une réponse tardive ne remplace pas l'image courante.
      failedImages++;
      if (index + 1 < candidates.length) showImage(box, candidates, index + 1);
    }, {once:true});
    box.dataset.pictureProcessed = 'yes';
    box.dataset.thumbnailStatus = selected.kind;
    box.replaceChildren(picture);
    box.classList.add('ifsi-has-picture');
    box.title = '';
    picture.src = selected.src;
  }
  function apply() {
    var registry = courses();
    if (!registry.length) return;
    var byId = new Map(registry.map(function (course) { return [course.id, course]; }));
    pending = new Set(registry.filter(function (course) { return !published.has(course.id); })
      .map(function (course) { return course.id; }));
    document.querySelectorAll('#v74CourseGrid .v74-course-tile .v74-course-card').forEach(function (card) {
      var box = card.querySelector('.mku-thumbnail');
      if (!box) return;
      var course = courseForCard(card, byId);
      if (!course) return;
      var candidates = illustrationCandidates(course);
      var key = course.id + '|' + candidates.map(function (x) { return x.kind === 'embedded' ? 'embedded' : x.src; }).join('|');
      if (box.dataset.pictureKey === key) return;
      box.dataset.pictureKey = key;
      showImage(box, candidates, 0);
      processed++;
    });
  }
  function normalizeManifest(rows) {
    if (!Array.isArray(rows)) throw new Error('Manifeste des vignettes incorrect');
    var normalized = new Map();
    rows.forEach(function (row) {
      var match = typeof row?.path === 'string' ? row.path.match(filePattern) : null;
      if (!match || !Number.isSafeInteger(row.length) || row.length <= 0 ||
          !/^[a-f0-9]{64}$/.test(String(row.sha256 || '')) || normalized.has(match[1]))
        throw new Error('Entrée de vignette invalide ou en double');
      normalized.set(match[1], row.path);
    });
    return normalized;
  }
  function loadManifest() {
    fetch(MANIFEST, {cache:'no-cache'})
      .then(function (response) {
        if (!response.ok) throw new Error('Manifeste des vignettes indisponible');
        return response.json();
      })
      .then(function (rows) {
        published = normalizeManifest(rows);
        manifestState = 'ready';
        apply();
      })
      .catch(function (error) {
        manifestState = 'error';
        console.warn('IFSI ABC : illustration de repli utilisée, manifeste indisponible', error);
        apply();
      });
  }
  var style = document.createElement('style');
  style.textContent =
    '#v74CourseGrid .mku-thumbnail.ifsi-has-picture{overflow:hidden;padding:0;line-height:0}' +
    '#v74CourseGrid .mku-thumbnail .ifsi-course-picture{width:100%;height:100%;display:block;object-fit:cover;border-radius:inherit}';
  document.head.appendChild(style);
  var compact = window.IFSI_COURSE_COMPACT;
  if (compact && typeof compact.apply === 'function') {
    var preceding = compact.apply;
    compact.apply = function () { var result = preceding.apply(this, arguments); apply(); return result; };
  }
  window.addEventListener('ifsi:v741-ready', apply);
  window.addEventListener('ifsi:course-list-updated', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once:true});
  else apply();
  window.IFSI_COURSE_THUMBNAILS = Object.freeze({
    apply:apply,
    status:function () {
      return {manifest:manifestState, configured:published.size, processed:processed,
        failedImages:failedImages, pendingCourseIds:Array.from(pending)};
    }
  });
  loadManifest();
})();
