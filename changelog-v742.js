(() => {
  'use strict';
  const {entries, latestResourceId, latestResource} = window.IFSI_RELEASE_NEWS;
  const parisDate = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Paris'});
  const parisHour = new Intl.DateTimeFormat('fr-FR', {timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23'});
  const dayMs = 86400000;
  let historyRequest;

  function week(now = new Date()) {
    const today = parisDate.format(now);
    const midnightUTC = Date.parse(today + 'T00:00:00Z');
    const firstDay = new Date(midnightUTC - 6 * dayMs).toISOString().slice(0, 10);
    const tomorrowUTC = midnightUTC + dayMs;
    // At 00:00 UTC, Paris has already crossed midnight with the same UTC offset.
    const hour = parisHour.formatToParts(tomorrowUTC).find(part => part.type === 'hour').value;
    return {today, nextMidnight: tomorrowUTC - Number(hour) * 3600000,
      entries: entries.filter(note => note.date && note.date >= firstDay && note.date <= today)};
  }

  function loadHistory() {
    if (!historyRequest) {
      historyRequest = fetch('./data/release-news.json').then(response => {
        if (!response.ok) throw Error('Journal indisponible');
        return response.json();
      }).catch(error => {
        historyRequest = undefined;
        throw error;
      });
    }
    return historyRequest;
  }

  function refresh() {
    const home = document.getElementById('home');
    if (!home) return;
    for (const id of ['v72Changelog', 'v73News', 'v74News']) document.getElementById(id)?.remove();
    if (document.getElementById('v742Changelog')) return;
    const card = document.createElement('section');
    card.id = 'v742Changelog';
    card.className = 'card v72-changelog v8312-news';
    card.innerHTML = '<div class="row"><b>Mises à jour des 7 derniers jours</b></div><div id="v8312NewsUi"><div id="v8312NewsList" class="v8312-news-list"></div></div>';
    home.appendChild(card);
  }

  window.IFSI_CHANGELOG = {refresh, week, loadHistory,
    latestResource: latestResource || entries.find(note => note.id === latestResourceId)};
  window.IFSI_V742 = window.IFSI_CHANGELOG;
  refresh();
  const home = document.getElementById('home');
  if (home) new MutationObserver(refresh).observe(home, {childList: true});
})();
