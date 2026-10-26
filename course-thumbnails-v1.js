/* IFSI ABC — vignettes de cours (catalogue évolutif).
 * Seuls les fichiers recensés dans le manifeste publié peuvent remplacer l'icône.
 * Aucun visuel n'est généré au dépôt d'une source ; QCM/scores/PDF inchangés.
 */
(function () {
  'use strict';
  var MANIFEST = './docs/proposals/course-thumbnails-55-assets.json'; // chemin historique, contenu évolutif
  var ROOT = 'assets/course-thumbnails/';
  var filePattern = /^assets\/course-thumbnails\/([a-z0-9_-]+)\.webp$/;
  var published = new Map();
  var manifestState = 'loading';
  var processed = 0, failedImages = 0;
  var pending = new Set();

  function courses() {
    var value = window.IFSI_V741?.getRegistry?.()?.courses;
    return Array.isArray(value) ? value : [];
  }
  function courseForCard(card, byId) {
    var id = String(card.dataset.courseId ||
      window.IFSI_V741?.courseIdForLabel?.(card.dataset.course74) || '');
    return byId.get(id) || null; // jamais déduire une image d'un titre approximatif
  }
  function ueCode(course) {
    var code = String(course.ue || '').toUpperCase();
    return /^[A-E][1-4]$/.test(code) ? code : /^[A-E]$/.test(String(course.domain || '').toUpperCase())
      ? String(course.domain).toUpperCase() : 'IFSI';
  }
  function showPlaceholder(box, course) {
    var code = ueCode(course);
    var mark = document.createElement('span');
    mark.className = 'ifsi-course-ue-mark';
    mark.textContent = code;
    mark.setAttribute('aria-hidden', 'true');
    box.replaceChildren(mark);
    box.dataset.pictureProcessed = 'yes';
    box.dataset.thumbnailStatus = 'pending';
    box.dataset.thumbnailDomain = /^[A-E]/.test(code) ? code.charAt(0) : 'T';
    box.classList.add('ifsi-course-placeholder');
    box.title = 'Illustration du cours en attente de validation';
  }
  function showImage(box, course, path) {
    var backup = Array.from(box.childNodes);
    var previousTitle = box.title;
    var picture = document.createElement('img');
    picture.alt = ''; // le nom du cours est déjà accessible dans la carte
    picture.decoding = 'async';
    picture.loading = 'lazy';
    picture.className = 'ifsi-course-picture';
    picture.addEventListener('error', function () {
      failedImages++;
      box.replaceChildren(...backup);
      box.classList.remove('ifsi-has-picture');
      box.dataset.thumbnailStatus = 'error';
      box.title = previousTitle;
    }, {once: true});
    box.dataset.pictureProcessed = 'yes';
    box.dataset.thumbnailStatus = 'published';
    box.replaceChildren(picture);
    box.classList.add('ifsi-has-picture');
    picture.src = './' + path;
  }
  function apply() {
    if (manifestState !== 'ready') return;
    var registry = courses();
    if (!registry.length) return; // le registre asynchrone n'est pas encore chargé
    var byId = new Map(registry.map(function (course) { return [course.id, course]; }));
    pending = new Set(registry.filter(function (course) { return !published.has(course.id); })
      .map(function (course) { return course.id; }));
    document.querySelectorAll('#v74CourseGrid .v74-course-tile .v74-course-card')
      .forEach(function (card) {
        var box = card.querySelector('.mku-thumbnail');
        if (!box || box.dataset.pictureProcessed === 'yes') return;
        var course = courseForCard(card, byId);
        if (!course) return;
        var path = published.get(course.id);
        if (path) showImage(box, course, path);
        else showPlaceholder(box, course);
        processed++;
      });
  }
  function normalizeManifest(rows) {
    if (!Array.isArray(rows)) throw new Error('Manifeste des vignettes incorrect');
    var normalized = new Map();
    rows.forEach(function (row) {
      var match = typeof row.path === 'string' ? row.path.match(filePattern) : null;
      if (!match || !Number.isSafeInteger(row.length) || row.length <= 0 ||
          !/^[a-f0-9]{64}$/.test(String(row.sha256 || '')) || normalized.has(match[1])) {
        throw new Error('Entrée de vignette invalide ou en double');
      }
      normalized.set(match[1], row.path);
    });
    return normalized;
  }
  function loadManifest() {
    fetch(MANIFEST, {cache: 'no-cache'})
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
        console.warn('IFSI ABC : anciennes icônes conservées, manifeste indisponible', error);
      });
  }
  var style = document.createElement('style');
  style.textContent =
    '#v74CourseGrid .mku-thumbnail.ifsi-has-picture{overflow:hidden;padding:0;line-height:0}' +
    '#v74CourseGrid .mku-thumbnail .ifsi-course-picture{width:100%;height:100%;display:block;object-fit:cover;border-radius:inherit}' +
    '#v74CourseGrid .mku-thumbnail.ifsi-course-placeholder{display:flex;align-items:center;justify-content:center;' +
    'background:linear-gradient(145deg,#40308d,#7d63c7);color:#fff;overflow:hidden;padding:2px}' +
    '#v74CourseGrid .ifsi-course-placeholder[data-thumbnail-domain="B"]{background:linear-gradient(145deg,#244f83,#7562bc)}' +
    '#v74CourseGrid .ifsi-course-placeholder[data-thumbnail-domain="C"]{background:linear-gradient(145deg,#137575,#5b65bb)}' +
    '#v74CourseGrid .ifsi-course-placeholder[data-thumbnail-domain="D"]{background:linear-gradient(145deg,#685094,#ba70ac)}' +
    '#v74CourseGrid .ifsi-course-placeholder[data-thumbnail-domain="E"]{background:linear-gradient(145deg,#425d82,#8d789e)}' +
    '#v74CourseGrid .ifsi-course-ue-mark{font:bold clamp(12px,2vw,21px)/1 system-ui,sans-serif;' +
    'letter-spacing:.04em;color:#fff;text-shadow:0 1px 2px #0005}';
  document.head.appendChild(style);
  var compact = window.IFSI_COURSE_COMPACT;
  if (compact && typeof compact.apply === 'function') {
    var preceding = compact.apply;
    compact.apply = function () { var result = preceding.apply(this, arguments); apply(); return result; };
  }
  window.addEventListener('ifsi:v741-ready', apply);
  window.addEventListener('ifsi:course-list-updated', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once: true});
  else apply();
  window.IFSI_COURSE_THUMBNAILS = Object.freeze({
    apply: apply,
    status: function () {
      return {manifest: manifestState, configured: published.size, processed: processed,
        failedImages: failedImages, pendingCourseIds: Array.from(pending)};
    }
  });
  loadManifest();
})();