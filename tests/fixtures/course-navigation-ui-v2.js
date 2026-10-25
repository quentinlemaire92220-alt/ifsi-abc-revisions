/* IFSI ABC - navigation pédagogique v2.0 (stabilité du démarrage).
 * Module de présentation additif. Les registres, QCM, scores, liens et PDF restent inchangés.
 * Aucune dépendance à une PR audio, anatomie ou production PDF.
 */
(function () {
  'use strict';

  var DOMAIN = Object.freeze({
    A: 'Sciences infirmières et raisonnement clinique',
    B: 'Pratiques cliniques infirmières, qualité et gestion des risques',
    C: 'Prévention et promotion de la santé',
    D: 'Communication, travail en équipe et leadership',
    E: 'Démarche scientifique, recherche et méthodologie',
    T: 'Transversal — calculs de doses et mathématiques'
  });
  var UE = Object.freeze({
    A1: 'Fondements des sciences infirmières et raisonnement clinique',
    A2: 'Législation, éthique et déontologie',
    B1: 'Sciences biomédicales',
    B2: 'Sciences humaines et sociales',
    B3: 'Pratiques et interventions infirmières',
    B4: 'Démarche qualité et gestion des risques',
    C1: 'Santé publique, promotion de la santé, prévention et éducation thérapeutique',
    C2: 'Santé environnementale et transition écologique',
    D1: 'Savoir-être, communication professionnelle et leadership',
    D2: 'Coordination des activités et des soins et gestion d’une structure',
    D3: 'Formation, développement des compétences et analyse des pratiques professionnelles',
    D4: 'Numérique en santé',
    E1: 'Recherche, méthodes, analyse critique et données probantes',
    E2: 'Langue vivante étrangère',
    E3: 'Méthodes de travail et aide à la réussite'
  });
  var EXPLANATION = '« Provisoire » : les ressources reposent sur des notes, captures ou transcriptions. Elles pourront être complétées ou ajustées après comparaison avec le support officiel complet.';
  var domainOpen = new Set(['A']);
  var ueOpen = new Set(['A|A1']);
  var initialized = false;
  var pending = false;
  var observer = null;
  var disabled = false;
  var gridRoot = null;
  var detailRoot = null;
  var refreshCount = 0;

  function fold(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function simpleCode(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2);
  }
  function registry() {
    var doc = window.IFSI_V741 && window.IFSI_V741.getRegistry && window.IFSI_V741.getRegistry();
    return doc && Array.isArray(doc.courses) ? doc.courses : [];
  }
  function courseFor(label) {
    var normalized = fold(label).replace(/\s*[—-]\s*provisoire\s*$/, '');
    return registry().find(function (course) {
      return fold(course.label).replace(/\s*[—-]\s*provisoire\s*$/, '') === normalized ||
        (Array.isArray(course.aliases) && course.aliases.some(function (alias) { return fold(alias) === normalized; }));
    });
  }
  function isProvisional(course) {
    return !!course && (course.provisional === true ||
      /^provisional/i.test(String(course.sourceStatus || '')) ||
      /\bPROVISOIRE\b/i.test(String(course.label || '')));
  }
  function cleanTitle(name) {
    return String(name || '').replace(/\s*[—-]\s*PROVISOIRE\s*$/i, '').trim();
  }
  function statusWhy(course) {
    if (!course) return 'Support officiel complet non confirmé.';
    if (course.officialSupportUrl && course.officialSupportCoverage === 'partial')
      return 'Support officiel partiel : rapprochement et compléments encore nécessaires.';
    if (course.captureSupportUrl || course.sourceBasis === 'course_captures' || course.sourceStatus === 'provisional_captures')
      return 'Cours préparé à partir de captures ; support officiel complet à rapprocher.';
    if (course.officialSupportUrl)
      return 'Support officiel reçu, mais contrôle pédagogique encore en cours.';
    return 'Support officiel complet non reçu : ressources établies à partir des notes et transcriptions disponibles.';
  }
  function makeTag(course) {
    var badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'v8430-provisional';
    badge.textContent = 'Provisoire';
    badge.title = statusWhy(course);
    badge.setAttribute('aria-label', 'Cours provisoire : ' + statusWhy(course));
    badge.setAttribute('aria-haspopup', 'dialog');
    badge.addEventListener('click', function (event) {
      event.stopPropagation();
      showExplanation(course, badge);
    });
    return badge;
  }
  // Pictogrammes vectoriels locaux : même taille et même trait sur PC et mobile.
  var ICONS = {
    document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/>',
    book: '<path d="M12 5v16M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    headphones: '<path d="M3 14v-3a9 9 0 0 1 18 0v3M5 12H3v8h4v-8zM19 12h2v8h-4v-8z"/>',
    quiz: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 9 1 1 2-2M14 9h2M8 15h2M14 15h2"/>',
    play: '<path d="m8 4 12 8-12 8z"/>',
    external: '<path d="M15 3h6v6M21 3l-9 9M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    back: '<path d="m12 5-7 7 7 7M5 12h14"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    refresh: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>'
  };
  function iconFor(text) {
    var value = String(text || '').trim();
    return /^📄|^📝/.test(value) ? 'document' : /^📘|^📚|^📖|^✅/.test(value) ? 'book' :
      /^◫|^📸/.test(value) ? 'image' : /^🎧/.test(value) ? 'headphones' :
      /^🧠/.test(value) ? 'quiz' : /^▶/.test(value) ? 'play' :
      /^⏳/.test(value) ? 'clock' : /^←/.test(value) ? 'back' : /^↻/.test(value) ? 'refresh' : null;
  }
  function decorateIcon(element, kind) {
    if (!kind || element.querySelector(':scope > .v8432-icon')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'v8432-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = ICONS[kind];
    Array.from(element.childNodes).forEach(function (node) {
      if (node.nodeType === 3) node.nodeValue = node.nodeValue.replace(/^\s*(?:📄|📝|📘|📚|📖|✅|◫|📸|🎧|🧠|▶|⏳|←|↻)\s*/, '').replace(/\s*↗\s*$/, '');
    });
    element.insertBefore(svg, element.firstChild);
  }
  function applyIcons(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    root.querySelectorAll('.v74-pill,.v74-resource-block > .row b,.v74-resource > b,.v74-original-docs a,.v74-tile-support,.v74-child-link,.v74-child-part,.v74-source-archive summary,.v74-back,.v74-course-actions b,.v74-source-status,.v74-official-empty,.vg-actions .btn').forEach(function (el) {
      decorateIcon(el, iconFor(el.textContent));
    });
    root.querySelectorAll('.v74-resource .actions a').forEach(function (el) { decorateIcon(el, 'external'); });
    root.querySelectorAll('[data-vocal74]').forEach(function (el) { decorateIcon(el, 'play'); });
    root.querySelectorAll('.v74-star').forEach(function (el) {
      if (el.querySelector('.v8432-icon')) return;
      el.setAttribute('aria-label', el.classList.contains('on') ? 'Retirer des favoris' : 'Ajouter aux favoris');
      el.textContent = '';
      decorateIcon(el, 'star');
    });
    root.querySelectorAll('.v8430-arrow').forEach(function (el) {
      el.textContent = '';
      decorateIcon(el, 'chevron');
    });
    root.querySelectorAll('.v74-course-actions .btn').forEach(function (el) {
      // Les précisions restent accessibles sans agrandir chaque bouton en bandeau.
      var note = el.querySelector('small');
      if (note) {
        el.title = note.textContent;
        var label = el.querySelector('b');
        el.setAttribute('aria-label', (label ? label.textContent.trim() + ' — ' : '') + note.textContent.trim());
      }
    });
  }
  function showExplanation(course, trigger) {
    var dialog = document.getElementById('v8431ProvisionalDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'v8431ProvisionalDialog';
      dialog.setAttribute('aria-labelledby', 'v8431ProvisionalTitle');
      dialog.setAttribute('aria-describedby', 'v8431ProvisionalReason v8431ProvisionalSources');
      dialog.innerHTML = '<h2 id="v8431ProvisionalTitle">Pourquoi ce cours est provisoire ?</h2>' +
        '<b class="v8431-dialog-course"></b><p id="v8431ProvisionalReason"></p>' +
        '<p id="v8431ProvisionalSources"></p><button type="button" class="btn outline">Fermer</button>';
      dialog.querySelector('button').addEventListener('click', function () { dialog.close(); });
      dialog.addEventListener('click', function (event) { if (event.target === dialog) {
        var rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      }});
      document.body.appendChild(dialog);
    }
    dialog.querySelector('.v8431-dialog-course').textContent = cleanTitle(course.label);
    dialog.querySelector('#v8431ProvisionalReason').textContent = statusWhy(course);
    dialog.querySelector('#v8431ProvisionalSources').textContent = course.sourceNote || EXPLANATION;
    dialog.onclose = function () { if (trigger.isConnected) trigger.focus(); };
    dialog.showModal();
  }
  function addStyles() {
    if (document.getElementById('v8430CourseStyles')) return;
    var node = document.createElement('style');
    node.id = 'v8430CourseStyles';
    node.textContent = [
      '.v8430-domain-switch,.v8430-ue-switch{font:inherit;color:var(--ink);background:transparent;border:0;cursor:pointer;text-align:left;display:flex;align-items:center;gap:9px;flex:1;min-width:0;padding:3px 0}',
      '.v8430-arrow{font-size:14px;font-weight:900;color:var(--p);width:16px;flex:none}',
      '.v74-domain-head .v8430-domain-switch{font-weight:inherit}',
      '.v74-domain-head .v74-domain-name{line-height:1.35;font-size:14px;max-width:660px}',
      '.v74-ue-head{align-items:center;gap:7px}',
      '.v74-ue-head .v74-ue-title{flex:1;min-width:0;flex-wrap:wrap}',
      '.v8430-ue-name{font-size:12px;color:var(--muted);font-weight:650;line-height:1.35;min-width:160px;flex:1}',
      '.v8430-ue-switch .v74-ue-code{flex:none}',
      '.v8430-provisional{display:inline-flex;align-items:center;width:max-content;border-radius:999px;border:1px solid #b7a0ed;padding:2px 8px;font-size:11px;font-weight:750;color:#6c49b4;background:#f2ecff}',
      '.v8430-provisional{font-family:inherit;cursor:pointer;min-height:30px;max-width:100%}.v8430-provisional:focus-visible{outline:3px solid var(--p);outline-offset:3px}',
      '.v8431-card-wrap{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}.v8431-card-wrap>.v74-course-card{width:100%;flex:1}.v8431-card-wrap>.v8430-provisional{align-self:flex-start;margin-left:10px}',
      '#v8431ProvisionalDialog{box-sizing:border-box;width:calc(100% - 32px);max-width:520px;max-height:calc(100dvh - 32px);overflow:auto;border:1px solid var(--line);border-radius:18px;padding:24px;background:var(--card,#fff);color:var(--ink);box-shadow:0 20px 70px #0003;line-height:1.5;overflow-wrap:anywhere}',
      '#v8431ProvisionalDialog::backdrop{background:#21162d66}#v8431ProvisionalDialog h2{font-size:19px;margin:0 0 14px}#v8431ProvisionalDialog p{font-size:14px}#v8431ProvisionalDialog button{min-height:44px}body.v72-dark #v8431ProvisionalDialog{background:#262230;color:#f6f0ff}',
      '.v8430-note{font-size:12px;line-height:1.5;color:var(--muted);padding:9px 11px;border-radius:12px;border:1px solid var(--line);margin-top:10px}',
      '.v8430-path{font-size:12px;color:var(--muted);font-weight:650;line-height:1.6;margin:0 0 12px;overflow-wrap:anywhere}',
      '.v8430-course-status{margin-top:7px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
      '.v8430-course-why{font-size:12px;color:var(--muted);max-width:70ch;line-height:1.45}',
      '.v74-domain-body[hidden],.v74-ue-cards[hidden]{display:none!important}',
      '.v74-domain-group:has(.v74-domain-body[hidden]) .v74-domain-head{border-bottom:0}',
      'body.v72-dark .v8430-provisional{background:#342c45;color:#e2c8ff;border-color:#6a4d91}',
      'body.v72-dark .v8430-note{background:#262230;color:#d4cde2;border-color:#464052}',
      'body.v72-dark .v8430-ue-name,body.v72-dark .v8430-path,body.v72-dark .v8430-course-why{color:#d1c8df}',
      'body.v72-dark .v8430-arrow{color:#bf9aff}',
      '@media(max-width:600px){.v74-domain-head .v74-domain-name{font-size:13px}.v8430-ue-name{flex-basis:100%;padding-left:60px}.v8430-course-why{flex-basis:100%}}',
      /* Contrôles compacts V8.30.132, cibles tactiles conservées. */
      ".v8432-icon{display:inline-block;width:16px;height:16px;flex:none;vertical-align:-3px;margin-right:6px;pointer-events:none}",
      ".v8430-domain-switch,.v8430-ue-switch{outline-offset:3px;min-height:42px}",
      ".v8430-domain-switch:focus-visible,.v8430-ue-switch:focus-visible{outline:3px solid var(--p);border-radius:8px}",
      ".v8430-arrow{width:28px;height:28px;display:inline-grid;place-items:center;border:0;border-radius:8px;background:transparent;color:var(--p);flex:none}.v8430-arrow .v8432-icon{width:16px;height:16px;margin:0}",
      ".v8430-domain-switch[aria-expanded=true]>.v8430-arrow svg,.v8430-ue-switch[aria-expanded=true]>.v8430-arrow svg{transform:rotate(90deg)}",
      ".v74-ue-head{padding:4px 2px;min-height:56px}.v74-ue-head .v8430-ue-switch{display:flex;gap:8px;align-items:center;min-width:0;padding:6px 2px}",
      ".v74-ue-head .v74-ue-title{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto;column-gap:10px;row-gap:3px;align-items:center;min-width:0;flex:1}",
      ".v8430-ue-switch .v74-ue-code{grid-column:1;grid-row:1/span 2;align-self:center;font-size:11px;min-width:44px;padding:5px 8px}.v74-domain-badge{font-size:11px;padding:6px 9px}",
      ".v8430-ue-switch .v8430-ue-name{grid-column:2;grid-row:1;min-width:0;font-size:12px;font-weight:700;line-height:1.4;letter-spacing:0;padding:0;color:var(--ink);overflow-wrap:break-word}",
      ".v8430-ue-switch .v74-ue-count{grid-column:2;grid-row:2;font-size:11px;line-height:1.35;color:var(--muted);font-weight:500;min-width:0}",
      "#v74CourseGrid .v74-course-card{padding:12px}#v74CourseGrid .v74-course-card h3{font-size:14px;line-height:1.4;margin:6px 0 9px}#v74CourseGrid .v74-course-meta{margin-top:8px;gap:5px}#v74CourseGrid .v74-pill{font-size:10.5px;padding:3px 6px;display:inline-flex;align-items:center;gap:4px}#v74CourseGrid .v74-pill .v8432-icon{width:12px;height:12px;margin:0}",
      "#v74CourseGrid .v74-tile-support{align-self:flex-start;justify-content:flex-start;display:inline-flex;width:auto!important;max-width:100%;min-height:36px;padding:5px 8px!important;margin:0 4px;gap:0;font-size:12px;font-weight:600;border:1px solid transparent;background:transparent;color:var(--p);box-shadow:none;border-radius:8px}",
      "#v74CourseGrid .v74-tile-support:hover{border-color:var(--line);background:var(--card)}#v74CourseGrid .v74-tile-support:focus-visible{outline:3px solid var(--p);outline-offset:2px}",
      "#v74CourseDetail .v74-resource-block{margin-top:14px;padding:16px}#v74CourseDetail .v74-resource-block>.row b{font-size:14px;font-weight:700;display:inline-flex;align-items:center}#v74CourseDetail .v74-resource-list{grid-template-columns:minmax(0,1fr);gap:8px;margin-top:10px}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions){display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:14px;row-gap:3px;align-items:center;padding:10px 12px;min-height:0;border-radius:10px}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.row,#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>b{grid-column:1;grid-row:1;min-width:0;align-self:end;font-size:13px;line-height:1.45;font-weight:650}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.small{grid-column:1;grid-row:2;min-width:0;align-self:start;line-height:1.4;font-size:11.5px;overflow-wrap:anywhere}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.actions{grid-column:2;grid-row:1/span 2;display:flex;align-items:center;justify-content:flex-end;gap:6px;margin:0}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.row b{font-size:13px;line-height:1.45;font-weight:650;overflow-wrap:anywhere}",
      "#v74CourseDetail .actions .btn,#v74CourseDetail .v74-original-docs .btn,#v74CourseDetail .v74-subcourse-actions .btn,#v74CourseDetail .v74-child-part,#v74CourseDetail .vg-actions .btn{width:auto;min-width:0;max-width:100%;min-height:36px;display:inline-flex;align-items:center;justify-content:center;padding:7px 11px;font-size:12px;line-height:1.35;font-weight:650;gap:0;border-radius:9px;box-shadow:none}",
      "#v74CourseDetail .actions .v74-star{flex:none;width:36px;height:36px;min-height:36px;display:inline-grid;place-items:center;padding:0;border-radius:9px}#v74CourseDetail .v74-star .v8432-icon{width:16px;height:16px;margin:0}#v74CourseDetail .v74-star.on .v8432-icon{fill:currentColor}",
      "#v74CourseDetail .v74-course-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}#v74CourseDetail .v74-course-actions .btn{display:inline-flex;align-items:center;justify-content:center;flex:none;width:auto;max-width:100%;min-height:38px;padding:8px 12px;border-radius:9px;font-size:12px;line-height:1.35;box-shadow:none}#v74CourseDetail .v74-course-actions .btn b{display:inline-flex;align-items:center;font-size:12px;font-weight:650}#v74CourseDetail .v74-course-actions .btn small{display:none}",
      "#v74CourseDetail .v74-course-actions .btn.secondary{background:#f2ecfc;color:#6340aa;border:1px solid #d9cdef}#v74CourseDetail .v74-source-status{font-size:12px;font-weight:600}#v74CourseDetail .v74-original-docs{gap:6px;margin-top:8px}#v74CourseDetail .v74-course-head{padding:18px}#v74CourseDetail .v74-course-head h2{font-size:21px;line-height:1.35}",
      "body.v72-dark #v74CourseGrid .v74-tile-support{background:transparent;color:#d7bfff;border-color:transparent}body.v72-dark #v74CourseGrid .v74-tile-support:hover{background:#30273f;border-color:#635073}body.v72-dark #v74CourseDetail .v74-course-actions .btn.secondary{background:#30273f;border-color:#635073;color:#e7d6ff}body.v72-dark .v8430-arrow{background:transparent;color:#d7bfff}body.v72-dark .v8430-ue-switch .v8430-ue-name{color:#f6f0ff}",
      "@media(max-width:690px){#v74CourseGrid .v74-tile-support{min-height:44px}#v74CourseDetail .v74-resource-block{padding:14px}#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions){grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto auto;gap:4px}#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.row,#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>b{grid-column:1;grid-row:1}#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.small{grid-column:1;grid-row:2}#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.actions{grid-column:1;grid-row:3;margin-top:3px}#v74CourseDetail .actions .btn,#v74CourseDetail .actions .v74-star,#v74CourseDetail .v74-course-actions .btn,#v74CourseDetail .v74-original-docs .btn,#v74CourseDetail .v74-subcourse-actions .btn,#v74CourseDetail .v74-child-part,#v74CourseDetail .vg-actions .btn{min-height:44px}#v74CourseDetail .actions .v74-star{width:44px;height:44px}#v74CourseDetail .v74-course-head h2{font-size:19px}}",
      'body.v72-dark #v74CourseDetail .btn.outline{background:#30273f;color:#e7d6ff;border-color:#635073}'
    ].join('\n');
    document.head.appendChild(node);
  }
  function applyCatalog() {
    var root = document.getElementById('courses74');
    var grid = document.getElementById('v74CourseGrid');
    if (!root || !grid) return;
    var search = root.querySelector('#v74CourseSearch');
    var searching = !!(search && search.value.trim());
    grid.querySelectorAll('.v74-domain-group').forEach(function (group) {
      var codeTag = group.querySelector('.v74-domain-badge');
      var head = group.querySelector('.v74-domain-head');
      var title = group.querySelector('.v74-domain-name');
      var body = group.querySelector('.v74-domain-body');
      if (!codeTag || !head || !body) return;
      var code = (codeTag.textContent.match(/\b([A-E]|T)\b/) || [])[1] || '';
      if (DOMAIN[code] && title && title.textContent !== DOMAIN[code]) title.textContent = DOMAIN[code];
      var toggle = head.querySelector('.v8430-domain-switch');
      if (!toggle) {
        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'v8430-domain-switch';
        toggle.setAttribute('aria-label', 'Afficher ou masquer les cours du domaine ' + code);
        var titleGroup = head.querySelector('.v74-domain-title');
        if (titleGroup) toggle.appendChild(titleGroup);
        var arrow = document.createElement('span');
        arrow.className = 'v8430-arrow';
        toggle.insertAdjacentElement('afterbegin', arrow);
        head.insertAdjacentElement('afterbegin', toggle);
        toggle.addEventListener('click', function () {
          domainOpen.has(code) ? domainOpen.delete(code) : domainOpen.add(code);
          applyCatalog();
        });
      }
      var shown = searching || domainOpen.has(code);
      if (body.hidden !== !shown) body.hidden = !shown;
      if (toggle.getAttribute('aria-expanded') !== String(shown)) toggle.setAttribute('aria-expanded', String(shown));
      var arrow = toggle.querySelector('.v8430-arrow');
      if (arrow) arrow.textContent = shown ? '⌄' : '›';
      group.querySelectorAll('.v74-ue-group').forEach(function (ueGroup) {
        var ueBadge = ueGroup.querySelector('.v74-ue-code');
        var ueHead = ueGroup.querySelector('.v74-ue-head');
        var cards = ueGroup.querySelector('.v74-ue-cards');
        if (!ueBadge || !ueHead || !cards) return;
        var ue = simpleCode(ueBadge.textContent.replace(/^UE\s*/i, ''));
        var key = code + '|' + ue;
        var ueToggle = ueHead.querySelector('.v8430-ue-switch');
        if (!ueToggle) {
          ueToggle = document.createElement('button');
          ueToggle.type = 'button';
          ueToggle.className = 'v8430-ue-switch';
          ueToggle.setAttribute('aria-label', 'Afficher ou masquer les cours ' + ue);
          var ueTitle = ueHead.querySelector('.v74-ue-title');
          if (ueTitle) ueToggle.appendChild(ueTitle);
          var ueArrow = document.createElement('span');
          ueArrow.className = 'v8430-arrow';
          ueToggle.insertAdjacentElement('afterbegin', ueArrow);
          ueHead.insertAdjacentElement('afterbegin', ueToggle);
          ueToggle.addEventListener('click', function () {
            ueOpen.has(key) ? ueOpen.delete(key) : ueOpen.add(key);
            if (!domainOpen.has(code)) domainOpen.add(code);
            applyCatalog();
          });
        }
        if (UE[ue] && !ueToggle.querySelector('.v8430-ue-name')) {
          var ueName = document.createElement('span');
          ueName.className = 'v8430-ue-name';
          ueName.textContent = UE[ue];
          var titleHost = ueToggle.querySelector('.v74-ue-title');
          if (titleHost) titleHost.appendChild(ueName);
        }
        var expanded = searching || ueOpen.has(key);
        if (cards.hidden !== !expanded) cards.hidden = !expanded;
        if (ueToggle.getAttribute('aria-expanded') !== String(expanded)) ueToggle.setAttribute('aria-expanded', String(expanded));
        var ua = ueToggle.querySelector('.v8430-arrow');
        if (ua) ua.textContent = expanded ? '⌄' : '›';
      });
    });
    grid.querySelectorAll('.v74-course-card').forEach(function (card) {
      var h = card.querySelector('h3');
      if (!h) return;
      var course = courseFor(card.getAttribute('data-course74') || h.textContent);
      if (!course) return;
      var desired = cleanTitle(course.label);
      if (h.textContent !== desired) h.textContent = desired;
      // La pastille est un vrai bouton, frère de la carte cliquable : aucun bouton imbriqué.
      var wrapper = card.parentElement.classList.contains('v8431-card-wrap') ? card.parentElement : null;
      var old = wrapper && wrapper.querySelector('.v8430-provisional');
      if (isProvisional(course)) {
        if (!wrapper) {
          wrapper = document.createElement('div');
          wrapper.className = 'v8431-card-wrap';
          card.insertAdjacentElement('beforebegin', wrapper);
          wrapper.appendChild(card);
        }
        if (!old) wrapper.appendChild(makeTag(course));
      } else if (old) old.remove();
    });
  }
  function resourceOrder(element) {
    if (element.classList.contains('v74-original-support')) return 0;
    if (element.classList.contains('v74-child-supports')) return 0;
    if (element.classList.contains('v74-qcm-section')) return 2;
    if (element.id === 'vgCourseEntry') return 6;
    var firstRow = element.querySelector(':scope > .row b');
    var heading = fold(firstRow && firstRow.textContent);
    if (heading.includes('fiches de revision')) return 1;
    if (heading.includes('infographies')) return 3;
    if (heading.includes('vocaux')) return 4;
    return 5;
  }
  function applyDetail() {
    var root = document.getElementById('v74CourseDetail');
    if (!root) return;
    var head = root.querySelector('.v74-course-head');
    if (!head) return;
    var h2 = head.querySelector('h2');
    var course = h2 && courseFor(h2.textContent);
    if (!course) return;
    var title = cleanTitle(course.label);
    if (h2.textContent !== title) h2.textContent = title;
    var crumb = head.querySelector('.v8430-path');
    if (!crumb) {
      crumb = document.createElement('div');
      crumb.className = 'v8430-path';
      crumb.setAttribute('aria-label', 'Arborescence pédagogique');
      var back = head.querySelector('.v74-back');
      if (back) back.insertAdjacentElement('afterend', crumb);
      else head.insertAdjacentElement('afterbegin', crumb);
    }
    var domain = String(course.domain || ''), ue = simpleCode(course.ue);
    var fullPath = domain + ' — ' + (DOMAIN[domain] || 'Autre domaine') + ' › ' +
      ue + ' — ' + (UE[ue] || 'Unité d’enseignement');
    if (crumb.textContent !== fullPath) crumb.textContent = fullPath;
    var row = head.querySelector('.v8430-course-status');
    if (isProvisional(course)) {
      if (!row) {
        row = document.createElement('div');
        row.className = 'v8430-course-status';
        h2.insertAdjacentElement('afterend', row);
      }
      if (!row.querySelector('.v8430-provisional')) row.appendChild(makeTag(course));
    } else if (row) row.remove();

    // Déplacer uniquement des nœuds existants : tous les liens, écouteurs, scores et favoris sont conservés.
    var blocks = Array.from(root.children).filter(function (el) {
      return el.classList.contains('v74-resource-block');
    });
    if (blocks.length < 2) return;
    var sorted = blocks.map(function (el, i) { return {el: el, index: i, order: resourceOrder(el)}; })
      .sort(function (a, b) { return a.order - b.order || a.index - b.index; })
      .map(function (x) { return x.el; });
    if (sorted.every(function (el, i) { return blocks[i] === el; })) return;
    for (var i = 0; i < sorted.length; i++) {
      var current = Array.from(root.children).filter(function (el) { return el.classList.contains('v74-resource-block'); })[i];
      if (current !== sorted[i]) root.insertBefore(sorted[i], current || null);
    }
  }
  function observeRoots() {
    if (!observer || disabled) return;
    // Uniquement les enfants directs : un remplacement complet du catalogue
    // ou du détail vient du moteur V74. Les modifications internes apportées
    // par cette couche (pastilles, boutons, ordre) ne déclenchent pas le refresh.
    if (gridRoot) observer.observe(gridRoot, {childList: true});
    if (detailRoot) observer.observe(detailRoot, {childList: true});
  }
  function runRefresh() {
    pending = false;
    if (disabled) return;
    // Déconnecter pendant nos propres écritures : aucune boucle de mutation.
    if (observer) observer.disconnect();
    try {
      applyCatalog();
      applyDetail();
      applyIcons(gridRoot);
      applyIcons(detailRoot);
      refreshCount++;
    } catch (error) {
      disabled = true;
      console.error('[IFSI] Navigation des cours désactivée après erreur non fatale', error);
    } finally {
      if (!disabled) observeRoots();
    }
  }
  function refresh() {
    if (pending || disabled) return;
    pending = true;
    // Une seule passe par frame même après plusieurs rerenders asynchrones.
    window.requestAnimationFrame(runRefresh);
  }
  function boot() {
    if (initialized) return;
    initialized = true;
    gridRoot = document.getElementById('v74CourseGrid');
    detailRoot = document.getElementById('v74CourseDetail');
    if (!gridRoot || !detailRoot) {
      // L'application reste accessible si le DOM V74 n'a pas pu s'initialiser.
      disabled = true;
      console.warn('[IFSI] Navigation V2 absente : interface native conservée');
      return;
    }
    try {
      addStyles();
      observer = new MutationObserver(refresh);
      observeRoots();
      window.addEventListener('ifsi:v741-ready', refresh);
      window.addEventListener('storage', refresh);
      refresh();
    } catch (error) {
      disabled = true;
      if (observer) observer.disconnect();
      console.error('[IFSI] Navigation V2 non démarrée, parcours natif préservé', error);
    }
  }
  window.IFSI_COURSE_NAV_UI = {
    version: '2.0', refresh: refresh,
    status: function () { return {active: initialized && !disabled, passes: refreshCount}; },
    stop: function () { disabled = true; if (observer) observer.disconnect(); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
