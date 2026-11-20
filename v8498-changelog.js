(() => {
  function patch() {
    const host = document.querySelector('#v742Changelog details .small');
    if (!host || document.getElementById('v8498Change')) return;
    const entry = document.createElement('span');
    entry.id = 'v8498Change';
    entry.dataset.date='2026-11-20';
    entry.textContent = 'V8.30.198 — Fiches classées par UE et onglet Planning temporairement masqué.';
    host.prepend(entry);
  }
  window.IFSI_V8498_CHANGELOG = {patch};
  patch();
})();
