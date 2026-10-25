/* IFSI ABC - navigation pédagogique v1.0.
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
    var note = String(course && (course.sourceNote || course.sourceBasis) || '').trim();
    return note || 'Support officiel complet non confirmé : rapprochement pédagogique encore nécessaire.';
  }
  function makeTag(course) {
    var badge = document.createElement('span');
    badge.className = 'v8430-provisional';
    badge.textContent = 'Provisoire';
    badge.title = statusWhy(course);
    badge.setAttribute('aria-label', 'Cours provisoire : ' + statusWhy(course));
    return badge;
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
      '@media(max-width:600px){.v74-domain-head .v74-domain-name{font-size:13px}.v8430-ue-name{flex-basis:100%;padding-left:60px}.v8430-course-why{flex-basis:100%}}'
    ].join('\n');
    document.head.appendChild(node);
  }
  function applyCatalog() {
    var root = document.getElementById('courses74');
    var grid = document.getElementById('v74CourseGrid');
    if (!root || !grid) return;
    var search = root.querySelector('#v74CourseSearch');
    var searching = !!(search && search.value.trim());
    var header = root.querySelector(':scope > .card');
    if (header && !header.querySelector('.v8430-note')) {
      var note = document.createElement('div');
      note.className = 'v8430-note';
      note.setAttribute('role', 'note');
      note.textContent = 'NB : ' + EXPLANATION;
      header.appendChild(note);
    }
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
      body.hidden = !shown;
      toggle.setAttribute('aria-expanded', String(shown));
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
        cards.hidden = !expanded;
        ueToggle.setAttribute('aria-expanded', String(expanded));
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
      var old = card.querySelector('.v8430-provisional');
      if (isProvisional(course)) {
        if (!old) h.insertAdjacentElement('afterend', makeTag(course));
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
      var reason = row.querySelector('.v8430-course-why');
      if (!reason) {
        reason = document.createElement('span');
        reason.className = 'v8430-course-why';
        row.appendChild(reason);
      }
      var why = statusWhy(course);
      if (reason.textContent !== why) reason.textContent = why;
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
  function refresh() {
    if (pending) return;
    pending = true;
    queueMicrotask(function () {
      pending = false;
      applyCatalog();
      applyDetail();
    });
  }
  function boot() {
    if (initialized) return;
    initialized = true;
    addStyles();
    var observer = new MutationObserver(refresh);
    var catalog = document.getElementById('courses74');
    var detail = document.getElementById('v74CourseDetail');
    if (catalog) observer.observe(catalog, {childList: true, subtree: true});
    if (detail) observer.observe(detail, {childList: true, subtree: true});
    window.addEventListener('ifsi:v741-ready', refresh);
    window.addEventListener('storage', refresh);
    refresh();
  }
  window.IFSI_COURSE_NAV_UI = {version: '1.0', refresh: refresh};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
