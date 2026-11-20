(() => {
  function patch() {
    const host = document.querySelector('#v742Changelog details .small');
    if (!host || document.getElementById('v8497Change')) return;
    const entry = document.createElement('span');
    entry.id = 'v8497Change';
    entry.dataset.date='2026-11-20';
    entry.textContent = 'V8.30.197 — Correctif du démarrage et des rechargements sur mobile.';
    host.prepend(entry);
  }
  window.IFSI_V8497_CHANGELOG = {patch};
  patch();
})();
