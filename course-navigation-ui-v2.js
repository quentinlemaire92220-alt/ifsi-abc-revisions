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
  // Pictogrammes colorés d'origine, sans dépendre d'une police d'icônes.
  var EMOJI = {document: '📄', book: '📘', image: '🖼️', headphones: '🎧',
    quiz: '🧠', play: '▶️', external: '↗', clock: '⏳', back: '←',
    chevron: '›', refresh: '↻'};
  function iconFor(text) {
    var value = String(text || '').trim();
    return /^📄|^📝/.test(value) ? 'document' : /^📘|^📚|^📖|^✅/.test(value) ? 'book' :
      /^◫|^📸/.test(value) ? 'image' : /^🎧/.test(value) ? 'headphones' :
      /^🧠/.test(value) ? 'quiz' : /^▶/.test(value) ? 'play' :
      /^⏳/.test(value) ? 'clock' : /^←/.test(value) ? 'back' : /^↻/.test(value) ? 'refresh' : null;
  }
  function decorateIcon(element, kind) {
    if (!kind || element.querySelector(':scope > .v8433-emoji')) return;
    var icon = document.createElement('span');
    icon.className = 'v8433-emoji';
    if (['external', 'play', 'star', 'back', 'chevron', 'refresh'].includes(kind)) icon.classList.add('v8433-utility-icon');
    icon.setAttribute('aria-hidden', 'true');
    var prefix = element.textContent.trim().match(/^(?:📄|📝|📘|📚|📖|✅|📸|🎧|🧠|▶|⏳)/);
    icon.textContent = kind === 'star' ? (element.classList.contains('on') ? '⭐' : '☆') :
      prefix ? prefix[0] : EMOJI[kind];
    Array.from(element.childNodes).forEach(function (node) {
      if (node.nodeType === 3) node.nodeValue = node.nodeValue.replace(/^\s*(?:📄|📝|📘|📚|📖|✅|◫|📸|🎧|🧠|▶|⏳|←|↻)\uFE0F?\s*/, '').replace(/\s*↗\s*$/, '');
    });
    element.insertBefore(icon, element.firstChild);
  }
  function applyIcons(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    root.querySelectorAll('.v74-pill,.v74-resource-block > .row b,.v74-resource > b,.v74-original-docs a,.v74-tile-support,.v74-child-link,.v74-child-part,.v74-source-archive summary,.v74-back,.v74-course-actions b,.v8433-course-open,.v74-source-status,.v74-official-empty,.vg-actions .btn').forEach(function (el) {
      decorateIcon(el, iconFor(el.textContent));
    });
    root.querySelectorAll('.v74-resource .actions a').forEach(function (el) { decorateIcon(el, 'external'); });
    root.querySelectorAll('[data-vocal74]').forEach(function (el) { decorateIcon(el, 'play'); });
    root.querySelectorAll('.v74-star').forEach(function (el) {
      if (el.querySelector('.v8433-emoji')) return;
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
      ".v8433-emoji{display:inline-block;width:16px;height:16px;flex:none;vertical-align:-3px;margin-right:6px;pointer-events:none}",
      ".v8430-domain-switch,.v8430-ue-switch{outline-offset:3px;min-height:42px}",
      ".v8430-domain-switch:focus-visible,.v8430-ue-switch:focus-visible{outline:3px solid var(--p);border-radius:8px}",
      ".v8430-arrow{width:28px;height:28px;display:inline-grid;place-items:center;border:0;border-radius:8px;background:transparent;color:var(--p);flex:none}.v8430-arrow .v8433-emoji{width:16px;height:16px;margin:0}",
      ".v8430-domain-switch[aria-expanded=true]>.v8430-arrow .v8433-emoji,.v8430-ue-switch[aria-expanded=true]>.v8430-arrow .v8433-emoji{transform:rotate(90deg)}",
      ".v74-ue-head{padding:4px 2px;min-height:56px}.v74-ue-head .v8430-ue-switch{display:flex;gap:8px;align-items:center;min-width:0;padding:6px 2px}",
      ".v74-ue-head .v74-ue-title{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto;column-gap:10px;row-gap:3px;align-items:center;min-width:0;flex:1}",
      ".v8430-ue-switch .v74-ue-code{grid-column:1;grid-row:1/span 2;align-self:center;font-size:11px;min-width:44px;padding:5px 8px}.v74-domain-badge{font-size:11px;padding:6px 9px}",
      ".v8430-ue-switch .v8430-ue-name{grid-column:2;grid-row:1;min-width:0;font-size:12px;font-weight:700;line-height:1.4;letter-spacing:0;padding:0;color:var(--ink);overflow-wrap:break-word}",
      ".v8430-ue-switch .v74-ue-count{grid-column:2;grid-row:2;font-size:11px;line-height:1.35;color:var(--muted);font-weight:500;min-width:0}",
      "#v74CourseGrid .v74-course-card{padding:12px}#v74CourseGrid .v74-course-card h3{font-size:14px;line-height:1.4;margin:6px 0 9px}#v74CourseGrid .v74-course-meta{margin-top:8px;gap:5px}#v74CourseGrid .v74-pill{font-size:10.5px;padding:3px 6px;display:inline-flex;align-items:center;gap:4px}#v74CourseGrid .v74-pill .v8433-emoji{width:12px;height:12px;margin:0}",
      "#v74CourseGrid .v74-tile-support{align-self:flex-start;justify-content:flex-start;display:inline-flex;width:auto!important;max-width:100%;min-height:36px;padding:5px 8px!important;margin:0 4px;gap:0;font-size:12px;font-weight:600;border:1px solid transparent;background:transparent;color:var(--p);box-shadow:none;border-radius:8px}",
      "#v74CourseGrid .v74-tile-support:hover{border-color:var(--line);background:var(--card)}#v74CourseGrid .v74-tile-support:focus-visible{outline:3px solid var(--p);outline-offset:2px}",
      "#v74CourseDetail .v74-resource-block{margin-top:14px;padding:16px}#v74CourseDetail .v74-resource-block>.row b{font-size:14px;font-weight:700;display:inline-flex;align-items:center}#v74CourseDetail .v74-resource-list{grid-template-columns:minmax(0,1fr);gap:8px;margin-top:10px}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions){display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:14px;row-gap:3px;align-items:center;padding:10px 12px;min-height:0;border-radius:10px}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.row,#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>b{grid-column:1;grid-row:1;min-width:0;align-self:end;font-size:13px;line-height:1.45;font-weight:650}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.small{grid-column:1;grid-row:2;min-width:0;align-self:start;line-height:1.4;font-size:11.5px;overflow-wrap:anywhere}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.actions{grid-column:2;grid-row:1/span 2;display:flex;align-items:center;justify-content:flex-end;gap:6px;margin:0}",
      "#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.row b{font-size:13px;line-height:1.45;font-weight:650;overflow-wrap:anywhere}",
      "#v74CourseDetail .actions .btn,#v74CourseDetail .v74-original-docs .btn,#v74CourseDetail .v74-subcourse-actions .btn,#v74CourseDetail .v74-child-part,#v74CourseDetail .vg-actions .btn{width:auto;min-width:0;max-width:100%;min-height:36px;display:inline-flex;align-items:center;justify-content:center;padding:7px 11px;font-size:12px;line-height:1.35;font-weight:650;gap:0;border-radius:9px;box-shadow:none}",
      "#v74CourseDetail .actions .v74-star{flex:none;width:36px;height:36px;min-height:36px;display:inline-grid;place-items:center;padding:0;border-radius:9px}#v74CourseDetail .v74-star .v8433-emoji{width:16px;height:16px;margin:0}#v74CourseDetail .v74-star.on .v8433-emoji{fill:currentColor}",
      "#v74CourseDetail .v74-course-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}#v74CourseDetail .v74-course-actions .btn{display:inline-flex;align-items:center;justify-content:center;flex:none;width:auto;max-width:100%;min-height:38px;padding:8px 12px;border-radius:9px;font-size:12px;line-height:1.35;box-shadow:none}#v74CourseDetail .v74-course-actions .btn b{display:inline-flex;align-items:center;font-size:12px;font-weight:650}#v74CourseDetail .v74-course-actions .btn small{display:none}",
      "#v74CourseDetail .v74-course-actions .btn.secondary{background:#f2ecfc;color:#6340aa;border:1px solid #d9cdef}#v74CourseDetail .v74-source-status{font-size:12px;font-weight:600}#v74CourseDetail .v74-original-docs{gap:6px;margin-top:8px}#v74CourseDetail .v74-course-head{padding:18px}#v74CourseDetail .v74-course-head h2{font-size:21px;line-height:1.35}",
      "body.v72-dark #v74CourseGrid .v74-tile-support{background:transparent;color:#d7bfff;border-color:transparent}body.v72-dark #v74CourseGrid .v74-tile-support:hover{background:#30273f;border-color:#635073}body.v72-dark #v74CourseDetail .v74-course-actions .btn.secondary{background:#30273f;border-color:#635073;color:#e7d6ff}body.v72-dark .v8430-arrow{background:transparent;color:#d7bfff}body.v72-dark .v8430-ue-switch .v8430-ue-name{color:#f6f0ff}",
      "@media(max-width:690px){#v74CourseGrid .v74-tile-support{min-height:44px}#v74CourseDetail .v74-resource-block{padding:14px}#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions){grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto auto;gap:4px}#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.row,#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>b{grid-column:1;grid-row:1}#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.small{grid-column:1;grid-row:2}#v74CourseDetail .v74-resource-list>.v74-resource:has(>.actions)>.actions{grid-column:1;grid-row:3;margin-top:3px}#v74CourseDetail .actions .btn,#v74CourseDetail .actions .v74-star,#v74CourseDetail .v74-course-actions .btn,#v74CourseDetail .v74-original-docs .btn,#v74CourseDetail .v74-subcourse-actions .btn,#v74CourseDetail .v74-child-part,#v74CourseDetail .vg-actions .btn{min-height:44px}#v74CourseDetail .actions .v74-star{width:44px;height:44px}#v74CourseDetail .v74-course-head h2{font-size:19px}}",
      'body.v72-dark #v74CourseDetail .btn.outline{background:#30273f;color:#e7d6ff;border-color:#635073}'
,
      ".v8433-emoji{font-family:\"Segoe UI Emoji\",\"Apple Color Emoji\",\"Noto Color Emoji\",sans-serif;font-size:16px;font-style:normal;font-weight:400;line-height:1;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;flex:none;vertical-align:-3px;margin-right:6px;pointer-events:none}",
      "#v74CourseGrid .v74-pill .v8433-emoji{font-size:13px;width:14px;height:14px;margin:0}.v8430-arrow .v8433-emoji{font-family:inherit;font-size:22px;width:16px;height:20px;margin:0}",
      "#v74CourseGrid .v74-course-tile{border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden;gap:0;display:flex;flex-direction:column;min-width:0}",
      "#v74CourseGrid .v74-course-tile>.v74-course-card{width:100%;border:0;border-radius:0;padding:12px;background:transparent;box-shadow:none;flex:1;color:var(--ink)}",
      "#v74CourseGrid .v74-course-tile:has(>.v74-course-card:hover){border-color:#bbaae8}#v74CourseGrid .v74-course-card:focus-visible{outline:3px solid var(--p);outline-offset:-3px}",
      "#v74CourseGrid .v8433-card-actions{display:flex;align-items:center;flex-wrap:wrap;gap:7px;padding:10px 12px;border-top:1px solid var(--line);min-width:0}",
      "#v74CourseGrid .v8433-card-actions .btn,#v74CourseGrid .v8433-card-actions .v74-tile-support{display:inline-flex;align-items:center;justify-content:center;flex:none;align-self:auto;width:auto!important;max-width:100%;min-height:36px;font-size:12px;line-height:1.35;font-weight:650;padding:7px 10px!important;margin:0;border-radius:9px;box-shadow:none}",
      "#v74CourseGrid .v8433-card-actions .v74-tile-support{background:#f4f0fc;border:1px solid #dfd4f0;color:#6542ad}",
      "#v74CourseGrid .v8433-card-actions .v8430-provisional{margin-left:auto;min-height:30px;padding:4px 8px;flex:none;font-size:11px}",
      "body.v72-dark #v74CourseGrid .v74-course-tile{background:#211e2a;border-color:#3b3548}body.v72-dark #v74CourseGrid .v74-course-tile>.v74-course-card{background:transparent;color:#f4f0fb}body.v72-dark #v74CourseGrid .v8433-card-actions{border-color:#3b3548}body.v72-dark #v74CourseGrid .v8433-card-actions .v74-tile-support{background:#30273f;border-color:#635073;color:#e7d6ff}",
      "#v74CourseDetail .v74-resource-block>.row b .v8433-emoji{font-size:17px}#v74CourseDetail .v74-star .v8433-emoji{font-size:20px;margin:0;width:20px;height:20px}",
      "@media(max-width:690px){#v74CourseGrid .v8433-card-actions .btn,#v74CourseGrid .v8433-card-actions .v74-tile-support{min-height:44px}.v8433-card-actions{gap:6px}#v74CourseGrid .v8433-card-actions .v8430-provisional{min-height:36px}}"
      , '.v8433-emoji.v8433-utility-icon{font-family:inherit}'
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
      // Un cadre visuel unique, avec actions sœurs du bouton de cours : aucun bouton imbriqué.
      var tile = card.closest('.v74-course-tile');
      if (!tile) {
        tile = document.createElement('article');
        tile.className = 'v74-course-tile';
        card.insertAdjacentElement('beforebegin', tile);
        tile.appendChild(card);
      }
      tile.setAttribute('role', 'group');
      tile.setAttribute('aria-label', desired);
      card.setAttribute('aria-label', 'Ouvrir le cours ' + desired);
      var actions = tile.querySelector(':scope > .v8433-card-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'v8433-card-actions';
        tile.appendChild(actions);
      }
      if (!actions.querySelector('.v8433-course-open')) {
        var open = document.createElement('button');
        open.type = 'button';
        open.className = 'btn primary v8433-course-open';
        open.textContent = '📚 Ouvrir le cours';
        open.setAttribute('aria-label', 'Ouvrir le cours ' + desired);
        open.addEventListener('click', function () { card.click(); });
        actions.appendChild(open);
      }
      var support = tile.querySelector('.v74-tile-support');
      if (support && support.parentElement !== actions) actions.appendChild(support);
      var old = actions.querySelector('.v8430-provisional');
      if (isProvisional(course)) {
        if (!old) actions.appendChild(makeTag(course));
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
      if (window.IFSI_COURSE_COMPACT) window.IFSI_COURSE_COMPACT.apply();
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

/* Présentation compacte des cours selon la maquette validée.
 * Les éléments d'origine sont déplacés, jamais clonés : liens et écouteurs conservés.
 */
(function () {
  'use strict';
  var sequence = 0;
  var sheet = document.createElement('style');
  sheet.textContent = `
  #v74CourseDetail{max-width:760px;margin:0 auto;padding-bottom:96px}
  #v74CourseDetail .v74-course-head{background:transparent;border:0;box-shadow:none;padding:0 4px 10px;border-radius:0}
  #v74CourseDetail .v74-back{border:0;background:transparent;padding:4px 0;min-height:36px;box-shadow:none;font-weight:600;font-size:12px;color:var(--muted)}
  #v74CourseDetail .v74-course-head h2{font-size:24px;line-height:1.23;letter-spacing:-.5px;margin:8px 0;color:#19143f}
  #v74CourseDetail .v74-course-head>.row{display:block}
  #v74CourseDetail .v74-course-head>.row>div>.small{display:none}
  #v74CourseDetail .mku-path{margin:0 0 4px;font-size:11px;color:var(--muted)}
  #v74CourseDetail .mku-path>summary{display:inline-flex;align-items:center;min-height:32px;cursor:pointer;list-style:none;color:#6841b7;background:#ece3ff;border-radius:5px;padding:2px 7px;font-weight:750}
  #v74CourseDetail .mku-path>summary::-webkit-details-marker,#v74CourseDetail .mku-progress>summary::-webkit-details-marker{display:none}
  #v74CourseDetail .mku-path .v8430-path{margin:6px 0;font-size:11px;line-height:1.4}
  #v74CourseDetail .mku-progress{margin:3px 0 0;color:var(--muted);font-size:11px}
  #v74CourseDetail .mku-progress>summary{cursor:pointer;list-style:none;min-height:32px;display:flex;align-items:center;gap:6px;width:max-content;max-width:100%}
  #v74CourseDetail .mku-progress>summary::after{content:'⌄';font-size:14px}
  #v74CourseDetail .mku-progress .v74-course-meta{margin:5px 0;gap:5px}
  #v74CourseDetail .v8430-course-status{margin:10px 0 3px}
  .v8430-provisional{background:#fff0d8!important;color:#99500d!important;border-color:#f4d3a3!important;border-radius:9px!important;font-weight:650!important}
  .v8430-provisional::after{content:' ⓘ';font-size:13px;margin-left:6px}
  #v74CourseDetail .v8430-provisional{font-size:11px;padding:3px 9px;min-height:32px}
  #v74CourseDetail .mku-resources-title{display:flex;gap:9px;align-items:center;margin:10px 0 12px;font-size:17px;color:#19143f}
  #v74CourseDetail .mku-resources-title .mku-stack{color:#8553dc;background:#eee5ff;border-radius:50%;width:30px;height:30px;display:inline-grid;place-items:center;font-size:22px}
  #v74CourseDetail .mku-resources-title small{margin-left:auto;color:var(--muted);font-size:10px;font-weight:500}
  #v74CourseDetail .v74-resource-block.mku-resource{margin:8px 0 0;padding:0!important;border:1px solid #e8e1f3;border-radius:16px;background:#fff;box-shadow:0 3px 10px #34225b03;overflow:hidden}
  #v74CourseDetail .mku-resource>.row{display:block;gap:0;margin:0;padding:0}
  #v74CourseDetail .mku-toggle{font:inherit;color:inherit;width:100%;border:0;background:transparent;text-align:left;display:grid;grid-template-columns:23px 46px minmax(0,1fr) 16px;align-items:center;gap:10px;padding:13px 12px;cursor:pointer;min-height:83px;border-radius:15px;box-shadow:none}
  #v74CourseDetail .mku-toggle:hover{background:#fbf9ff}
  #v74CourseDetail .mku-toggle:focus-visible{outline:3px solid #8c5bd5;outline-offset:-3px}
  #v74CourseDetail .mku-number{font-size:12px;font-weight:750;color:#4d4172;background:#f1edf8;display:grid;place-items:center;width:22px;height:25px;border-radius:50%}
  #v74CourseDetail .mku-icon{width:46px;height:52px;display:grid;place-items:center;border-radius:12px;background:var(--mku-bg);color:var(--mku-ink)}
  #v74CourseDetail .mku-icon svg{width:31px;height:34px;filter:drop-shadow(0 3px 3px #0000000c)}
  #v74CourseDetail .mku-copy{display:flex;flex-direction:column;min-width:0;gap:4px}
  #v74CourseDetail .mku-copy b{font-size:14px;line-height:1.25;color:#19143f;display:block;font-weight:750}
  #v74CourseDetail .mku-copy b .v8433-emoji{display:none}
  #v74CourseDetail .mku-subtitle{font-size:11px;color:#74698c;line-height:1.35}
  #v74CourseDetail .mku-chevron{font-size:23px;line-height:1;color:#8a78a7;text-align:center;transform-origin:center}
  #v74CourseDetail .mku-toggle[aria-expanded=true] .mku-chevron{transform:rotate(90deg)}
  #v74CourseDetail .mku-toggle:disabled{opacity:1;cursor:default}
  #v74CourseDetail .mku-resource.mku-primary{border-color:#c7adff;background:#f7f2ff}
  #v74CourseDetail .mku-primary .mku-toggle:hover{background:#f2ebff}
  #v74CourseDetail .mku-primary .mku-number{background:#ae87e5;color:white}
  #v74CourseDetail .mku-awaiting{display:inline-flex;align-items:center;gap:4px;color:#99500d;background:#fff0d8;border-radius:6px;padding:3px 6px;font-size:10px;font-weight:650;width:max-content}
  #v74CourseDetail .mku-panel{padding:0 13px 14px;border-top:1px solid #eee7f7}
  #v74CourseDetail .mku-panel[hidden]{display:none!important}
  #v74CourseDetail .mku-panel .v74-resource-list{margin-top:10px}
  #v74CourseDetail .mku-complements-title{font-size:11px;letter-spacing:.02em;color:var(--muted);font-weight:650;margin:19px 3px 8px}
  #v74CourseDetail .mku-extra .mku-toggle{grid-template-columns:23px 38px minmax(0,1fr) 16px;min-height:72px}
  #v74CourseDetail .mku-extra .mku-icon{width:38px;height:44px}
  #v74CourseDetail .mku-extra .mku-icon svg{width:26px;height:28px}
  #v74CourseDetail .mku-extra .mku-number{font-size:16px;background:transparent}
  #v74CourseDetail .mku-extra .mku-copy b{font-size:13px}
  #v74CourseGrid .v74-course-tile{border-color:#e8e1f3;border-radius:18px;box-shadow:0 5px 16px #36245106;background:#fff}
  #v74CourseGrid .v74-course-tile>.v74-course-card{display:grid;grid-template-columns:62px minmax(0,1fr) 12px;grid-template-rows:auto auto auto;gap:4px 11px;padding:12px 12px 8px;align-items:center}
  #v74CourseGrid .mku-thumbnail{grid-column:1;grid-row:1/span 3;width:62px;height:76px;border-radius:12px;background:var(--mku-thumb,#f0e6ff);display:grid;place-items:center;font-family:'Segoe UI Emoji',sans-serif;font-size:36px}
  #v74CourseGrid .v74-course-card>.row{grid-column:2;grid-row:1;justify-content:flex-start;gap:6px;flex-wrap:wrap;font-size:10px;min-width:0}
  #v74CourseGrid .v74-course-card>.row>.v74-count{display:none}
  #v74CourseGrid .v74-course-card>.row>.badge{font-size:9px;padding:1px 4px;border-radius:5px;background:transparent;color:var(--muted)}
  #v74CourseGrid .mku-code{background:#ece3ff;color:#6945b9;padding:2px 5px;font-size:10px;border-radius:4px;font-weight:750}
  #v74CourseGrid .v74-course-card h3{grid-column:2;grid-row:2;font-size:14px;line-height:1.35;margin:0;color:#19143f}
  #v74CourseGrid .v74-course-card>.v74-master{grid-column:2;grid-row:3;margin:3px 0 0;height:5px}
  #v74CourseGrid .mku-card-chevron{grid-column:3;grid-row:2;font-size:24px;color:#84709f}
  #v74CourseGrid .v8433-card-actions{padding:0 12px 9px 85px;gap:5px;border:0;position:relative}
  #v74CourseGrid .v8433-card-actions .btn,#v74CourseGrid .v8433-card-actions .v74-tile-support{font-size:11px!important;min-height:32px!important;padding:4px 6px!important;border:0;background:transparent;box-shadow:none;color:#6d46b8;line-height:1.2}
  #v74CourseGrid .v8433-card-actions .btn .v8433-emoji,#v74CourseGrid .v8433-card-actions .v74-tile-support .v8433-emoji{width:13px;height:13px;font-size:12px;margin-right:3px}
  #v74CourseGrid .v8433-card-actions .v8430-provisional{font-size:10px;margin-left:0;min-height:32px;padding:3px 6px}
  #v74CourseGrid .mku-card-info{font-size:11px;color:var(--muted);width:32px;margin-left:auto}
  #v74CourseGrid .mku-card-info>summary{cursor:pointer;min-height:32px;display:flex;align-items:center;justify-content:center;gap:4px;list-style:none;font-size:0;border-radius:7px}
  #v74CourseGrid .mku-card-info>summary::before{content:'ⓘ';font-size:16px}
  #v74CourseGrid .mku-card-info>summary::-webkit-details-marker{display:none}
  #v74CourseGrid .mku-card-info>summary:focus-visible{outline:3px solid var(--p);outline-offset:-2px}
  #v74CourseGrid .mku-card-info[open]{width:100%;margin-left:0}
  #v74CourseGrid .mku-card-info[open]>summary{font-size:10px;justify-content:flex-start}
  #v74CourseGrid .mku-card-info .v74-course-meta{margin:0;padding:5px 0}
  #v74CourseGrid .mku-card-info .v74-pill{font-size:9px}
  body.v72-dark #v74CourseDetail .v74-course-head h2,body.v72-dark #v74CourseDetail .mku-copy b,body.v72-dark #v74CourseDetail .mku-resources-title,body.v72-dark #v74CourseGrid .v74-course-card h3{color:#f4f0fb}
  body.v72-dark #v74CourseDetail .mku-resource,body.v72-dark #v74CourseGrid .v74-course-tile{background:#211e2a;border-color:#3b3548}
  body.v72-dark #v74CourseDetail .mku-primary{background:#30263f;border-color:#745096}
  body.v72-dark #v74CourseDetail .mku-toggle:hover{background:#30273f}
  body.v72-dark #v74CourseDetail .mku-panel{border-color:#3b3548}
  body.v72-dark #v74CourseDetail .mku-subtitle{color:#bcb1ce}
  body.v72-dark .v8430-provisional,body.v72-dark #v74CourseDetail .mku-awaiting{background:#483120!important;color:#ffce91!important;border-color:#74543b!important}
  body.v72-dark #v74CourseDetail .mku-path>summary,body.v72-dark #v74CourseDetail .mku-number,body.v72-dark #v74CourseGrid .mku-code{background:#3a2c50;color:#d9c3ff}
  body.v72-dark #v74CourseDetail .mku-primary .mku-number{background:#9566ce;color:white}
  body.v72-dark #v74CourseGrid .mku-thumbnail{background:#3a2c50}
  body.v72-dark #v74CourseGrid .v8433-card-actions .v74-tile-support{background:transparent;border:0;color:#d9c3ff}
  @media(min-width:800px){#v74CourseDetail{padding-top:12px}#v74CourseDetail .mku-toggle{padding:14px 20px;grid-template-columns:28px 54px minmax(0,1fr) 20px;gap:16px;min-height:90px}#v74CourseDetail .mku-copy b{font-size:16px}#v74CourseDetail .mku-subtitle{font-size:12px}#v74CourseDetail .mku-panel{padding:0 22px 18px}#v74CourseDetail .v74-course-head h2{font-size:29px}}
  @media(max-width:690px){#v74CourseGrid .v8433-card-actions .btn,#v74CourseGrid .v8433-card-actions .v74-tile-support,#v74CourseGrid .v8433-card-actions .v8430-provisional,#v74CourseGrid .mku-card-info>summary{min-height:44px!important}#v74CourseGrid .mku-card-info:not([open]){width:44px}#v74CourseDetail .v74-back{min-height:44px}#v74CourseDetail .mku-path>summary,#v74CourseDetail .mku-progress>summary,#v74CourseDetail .v8430-provisional{min-height:36px}}
  `;
  function el(tag, cls, text) {var e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function fold(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
  function icon(kind){
    var symbol=kind==='quiz'?'<path d="M12 6h12v4H12z" fill="white" opacity=".7"/><path d="m12 22 4 4 9-10" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>':
      kind==='image'?'<rect x="8" y="10" width="22" height="20" rx="2" fill="white" opacity=".85"/><circle cx="23" cy="16" r="3" fill="currentColor"/><path d="m10 28 7-10 6 8 3-4 3 6" fill="currentColor"/>':
      kind==='vocal'?'<rect x="14" y="6" width="10" height="19" rx="5" fill="white"/><path d="M10 19v3a9 9 0 0 0 18 0v-3M19 31v5m-6 0h12" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>':
      '<path d="M12 17h14m-14 6h14m-14 6h10" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".85"/>';
    return '<svg viewBox="0 0 38 42" aria-hidden="true"><path d="M8 3h16l8 8v26a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="currentColor"/><path d="M24 3v6a2 2 0 0 0 2 2h6" fill="white" opacity=".35"/>'+symbol+'</svg>';
  }
  function classify(block){
    var heading=block.querySelector(':scope > .row b');var text=fold(heading?.textContent);
    if(block.classList.contains('v74-original-support'))return {key:'support',n:1,color:'#a17bd6',bg:'#e9dbff',sub:'Le support officiel du cours.'};
    if(block.classList.contains('v74-child-supports'))return {key:'parts',n:1,color:'#a17bd6',bg:'#e9dbff',sub:'Les documents officiels par sous-cours.'};
    if(text.includes('fiches de revision'))return {key:'revision',n:2,color:'#49ac94',bg:'#d9f2ea',sub:'L’essentiel à retenir.'};
    if(block.classList.contains('v74-qcm-section'))return {key:'quiz',n:3,color:'#ee7094',bg:'#ffe0e9',sub:'Testez vos connaissances.'};
    if(text.includes('infographie'))return {key:'image',n:4,color:'#e7ae3d',bg:'#fff0cf',sub:'Schémas et visuels synthétiques.'};
    if(text.includes('vocaux'))return {key:'vocal',n:5,color:'#7d83e5',bg:'#e1e5ff',sub:'Écoutez le cours en version audio.'};
    if(block.id==='vgCourseEntry')return {key:'vocab',n:'+',color:'#6b9aba',bg:'#e0f0f6',sub:'Définitions, fiche et QCM vocabulaire.'};
    return {key:'docs',n:'+',color:'#ac84b6',bg:'#f1e4f5',sub:/flashcards/i.test(block.textContent)?'Flashcards et documents complémentaires.':'Autres documents du cours.'};
  }
  function detail(){
    var root=document.getElementById('v74CourseDetail'),head=root?.querySelector('.v74-course-head');if(!head)return;
    if(!head.querySelector('.mku-path')){
      var crumb=head.querySelector('.v8430-path');if(crumb){var path=el('details','mku-path');var code=crumb.textContent.match(/›\s*([A-Z]\d)/)?.[1]||'UE';path.appendChild(el('summary','',code));crumb.before(path);path.appendChild(crumb);}
      var meta=head.querySelector('.v74-course-meta');if(meta){var progress=el('details','mku-progress');var count=head.querySelector(':scope > .row > .badge');progress.appendChild(el('summary','',count?.textContent+' · Progression'));meta.before(progress);progress.appendChild(meta);var bar=head.querySelector('.v74-master');if(bar)progress.appendChild(bar);if(count)progress.appendChild(count);}
    }
    var blocks=Array.from(root.querySelectorAll(':scope > .v74-resource-block'));
    var main=blocks.filter(b=>classify(b).n!=='+');
    if(!root.querySelector('.mku-resources-title')&&main.length){var title=el('h3','mku-resources-title');title.append(el('span','mku-stack','▱'),el('span','','Ressources du cours'),el('small','',main.length+' rubriques'));blocks[0].before(title);}
    var extra=blocks.find(b=>classify(b).n==='+');if(extra&&!root.querySelector('.mku-complements-title'))extra.before(el('h3','mku-complements-title','Pour aller plus loin'));
    blocks.forEach(function(block){
      if(block.classList.contains('mku-resource'))return;
      var spec=classify(block),row=block.querySelector(':scope > .row'),heading=row?.querySelector('b');if(!heading)return;
      var support=spec.key==='support',waiting=support&&/Support officiel en attente/.test(block.textContent);
      var hasAccess=!!block.querySelector('a[href],button,.vg-actions');
      var button=el('button','mku-toggle');button.type='button';button.setAttribute('aria-expanded','false');
      var panel=el('div','mku-panel');panel.id='mku-panel-'+(++sequence);panel.hidden=true;button.setAttribute('aria-controls',panel.id);
      var visual=el('span','mku-icon');visual.style.setProperty('--mku-bg',spec.bg);visual.style.setProperty('--mku-ink',spec.color);visual.innerHTML=icon(spec.key);
      var copy=el('span','mku-copy'),subtitle=el('span','mku-subtitle',waiting?'Support officiel en attente.':spec.sub);
      // Préserver le titre complet et les métadonnées originaux pour l'accessibilité.
      heading.title=heading.textContent;copy.appendChild(heading);
      if(support)heading.textContent='Support du cours';
      else if(spec.key==='docs')heading.textContent=/flashcards/i.test(block.textContent)?'Documents et flashcards':'Documents du cours';
      copy.appendChild(subtitle);
      if(waiting){var state=el('span','mku-awaiting','En attente');copy.appendChild(state);}
      button.append(el('span','mku-number',String(spec.n)),visual,copy,el('span','mku-chevron',hasAccess?'›':'—'));
      var originalCount=row.querySelector('.badge');if(originalCount)panel.appendChild(originalCount);
      Array.from(block.children).filter(e=>e!==row).forEach(e=>panel.appendChild(e));
      row.replaceChildren(button);block.appendChild(panel);block.classList.add('mku-resource');
      if(support)block.classList.add('mku-primary');if(spec.n==='+')block.classList.add('mku-extra');
      if(!hasAccess)button.disabled=true;
      button.addEventListener('click',function(){panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));});
    });
  }
  function catalog(){
    document.querySelectorAll('#v74CourseGrid .v74-course-tile').forEach(function(tile){
      var card=tile.querySelector('.v74-course-card'),actions=tile.querySelector('.v8433-card-actions');if(!card||!actions||card.querySelector('.mku-thumbnail'))return;
      var title=fold(card.querySelector('h3')?.textContent),emoji=/relation|communication|bientraitance/.test(title)?'🤝':/droit|legislation|responsabilite|ethique|judiciaire/.test(title)?'⚖️':/pharmac|medicament/.test(title)?'💊':/cardio|sang|hemato/.test(title)?'🫀':/respir|infect/.test(title)?'🫁':/sante publique|environnement/.test(title)?'🌍':/psych|neuro/.test(title)?'🧠':'🩺';
      var thumb=el('span','mku-thumbnail',emoji);thumb.setAttribute('aria-hidden','true');card.prepend(thumb);card.appendChild(el('span','mku-card-chevron','›'));
      var code=tile.closest('.v74-ue-group')?.querySelector('.v74-ue-code')?.textContent;if(code)card.querySelector('.row')?.prepend(el('span','mku-code',code.replace(/^UE\s*/,'')));
      var open=actions.querySelector('.v8433-course-open');if(open)Array.from(open.childNodes).filter(n=>n.nodeType===3).forEach(n=>n.nodeValue=' Ouvrir');
      var meta=card.querySelector('.v74-course-meta');if(meta){var info=el('details','mku-card-info'),more=el('summary','','Ressources et progression');more.title='Ressources et progression';more.setAttribute('aria-label','Ressources et progression du cours');info.appendChild(more);var score=card.querySelector('.v74-count');if(score)info.appendChild(score);info.appendChild(meta);actions.appendChild(info);}
    });
  }
  // Même passe que la V2, observateurs suspendus : aucun second cycle de mutations.
  window.IFSI_COURSE_COMPACT = {apply: function () {
    if (!sheet.isConnected) document.head.appendChild(sheet);
    detail();
    catalog();
  }};
})();
