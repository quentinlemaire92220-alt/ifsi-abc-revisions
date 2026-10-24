(()=>{'use strict';
// Extension de release : le script historique v8421 conserve le journal et affiche la nouvelle entree.
const dateAnchor=document.createElement('span');dateAnchor.dataset.date='2026-10-24';
window.IFSI_V8422_CHANGELOG={version:'8.30.122',apply:()=>window.IFSI_V8421_CHANGELOG?.patch?.()};
window.IFSI_V8422_CHANGELOG.apply();
})();
