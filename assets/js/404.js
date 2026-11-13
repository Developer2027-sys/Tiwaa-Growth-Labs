/* 404 page (templates/sections/shared/not-found.html):
   shows the address that was typed, suggests the closest real page, and searches the site's pages. */
(function () {
  function $(i) { return document.getElementById(i); }
  var list = $('nfPages');
  if (!list) return;
  var pages = [].map.call(list.children, function (li) {
    return { t: li.dataset.t, u: li.dataset.u, d: li.dataset.d, k: (li.dataset.t + ' ' + li.dataset.k + ' ' + li.dataset.u).toLowerCase(),
      uw: li.dataset.u.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean) };
  });

  /* 1. The address that was typed */
  var raw = location.pathname + location.search;
  var shown = raw.length > 60 ? raw.slice(0, 57) + '…' : raw;
  $('nfPath').textContent = decodeURIComponent(shown) || '/';

  /* 2. "Did you mean": compare the words in the typed address with every page */
  function words(s) {
    return decodeURIComponent(s).toLowerCase().replace(/\.(html?|php|aspx?)$/, '').split(/[^a-z0-9]+/)
      .filter(function (w) { return w.length > 1 && STOP.indexOf(w) < 0; });
  }
  // words that say nothing about which page was meant
  var STOP = ['page', 'pages', 'old', 'new', 'the', 'and', 'for', 'www', 'index', 'html', 'htm', 'php', 'en', 'in', 'of', 'my', 'test', 'default', 'home2', 'link'];
  function lev(a, b) { // edit distance, for typos like "serivces"
    if (a === b) return 0;
    var m = a.length, n = b.length, prev = [], cur, i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  function score(q, p) {
    var keys = p.k.split(/[^a-z0-9]+/).filter(Boolean), s = 0;
    q.forEach(function (w) {
      var best = 0;
      keys.forEach(function (k) {
        if (k === w) { best = 3; return; }
        if (k.indexOf(w) === 0 && w.length > 2) best = Math.max(best, 2);            // "whatsap" -> "whatsapp"
        // typos ("googel", "serivces")
        if (w.length > 3 && k.length > 3 && w.indexOf(k) !== 0 && lev(w, k) <= (w.length > 7 ? 2 : 1)) best = Math.max(best, 2);
        // one extra letter ("seoo", "blogg"): a weaker match, so "whats" still prefers WhatsApp over "what"
        if (k.length > 2 && w.length === k.length + 1 && w.indexOf(k) === 0) best = Math.max(best, 1.5);
        if (w.indexOf(k) === 0 && k.length > 3) best = Math.max(best, 1);            // "seoservices" -> "seo" (weaker)
      });
      s += best;
      // tie-break: a word that matches the page's own address counts a little more
      if (best && p.uw.some(function (k) { return k === w || (w.length > 2 && k.indexOf(w) === 0) || (w.length > 3 && lev(w, k) <= 1); })) s += 0.5;
    });
    return s;
  }
  function rank(q) {
    return pages.map(function (p) { return { p: p, s: score(q, p) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });
  }
  var typed = words(location.pathname);
  var hit = typed.length ? rank(typed)[0] : null;
  if (hit && hit.s >= 2) {
    var sug = $('nfSug');
    sug.href = hit.p.u; $('nfSugT').textContent = hit.p.t; $('nfSugU').textContent = hit.p.u;
    sug.hidden = false;
  }

  /* 3. Search box: filter pages as you type, arrow keys + Enter to open */
  var q = $('nfQ'), res = $('nfRes'), form = $('nfSearch'), items = [], sel = -1;
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function draw() {
    var v = q.value.trim().toLowerCase();
    if (!v) { res.hidden = true; res.innerHTML = ''; items = []; sel = -1; return; }
    var w = words(v), found = rank(w);
    if (found.length) { var top = found[0].s; found = found.filter(function (x) { return x.s >= top * 0.7; }); }
    // plain substring matches (e.g. "whats") also count
    pages.forEach(function (p) { if ((' ' + p.k.replace(/[^a-z0-9]+/g, ' ')).indexOf(' ' + v) > -1 && !found.some(function (x) { return x.p === p; })) found.push({ p: p, s: 1 }); });
    items = found.slice(0, 6).map(function (x) { return x.p; });
    sel = items.length ? 0 : -1;
    res.innerHTML = items.length
      ? items.map(function (p, i) { return '<li role="option" id="nfo' + i + '"' + (i === sel ? ' aria-selected="true"' : '') + '><a href="' + esc(p.u) + '"><b>' + esc(p.t) + '</b><small>' + esc(p.d) + '</small><span>' + esc(p.u) + '</span></a></li>'; }).join('')
      : '<li class="none">No page matches “' + esc(q.value.trim()) + '”. Try “SEO”, “ads” or “contact”.</li>';
    res.hidden = false;
  }
  function mark() {
    [].forEach.call(res.children, function (li, i) { if (li.id) li.setAttribute('aria-selected', i === sel); });
    q.setAttribute('aria-activedescendant', sel > -1 ? 'nfo' + sel : '');
  }
  q.addEventListener('input', draw);
  q.addEventListener('keydown', function (e) {
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % items.length; mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + items.length) % items.length; mark(); }
    else if (e.key === 'Escape') { q.value = ''; draw(); }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sel > -1 && items[sel]) location.href = items[sel].u;
  });
})();
