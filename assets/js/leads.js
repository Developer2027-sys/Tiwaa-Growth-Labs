/* Tiwaa Growth Labs: sends enquiries from every form to the lead API, with UTM / ad-click attribution.
   The API URL comes from window.TGL (printed by templates/layout/head.html).
   Production: Rust Worker (worker/) -> D1.  Local dev (npm run dev): tgl serve -> storage/leads.jsonl. */
(function () {
  var cfg = window.TGL || {};
  var API = cfg.api || '/api/leads';

  /* ---------- Marketing attribution (UTM tracking) ----------
     Runs on every page load. A "touch" is a visit that came from somewhere:
       1. URL tags: utm_source/medium/campaign/term/content and ad click IDs (gclid, gbraid, wbraid, fbclid, msclkid).
          A click ID without utm_source fills in the network, e.g. gclid -> google / cpc.
       2. Otherwise an outside referrer: search engines -> organic, social sites -> social, AI assistants -> ai, anything else -> referral.
       3. Otherwise (typed URL, bookmark, a click inside this site) nothing changes.
     Kept in localStorage "tgl_attr": first = the very first touch (kept forever),
     last = the latest touch (kept 90 days). Every lead gets "last" in its own columns and "first" as first_touch. */
  var ATTR_KEY = 'tgl_attr', LAST_DAYS = 90, UTM = ['source', 'medium', 'campaign', 'term', 'content'];
  var SEARCH = /(^|\.)(google|bing|yahoo|duckduckgo|yandex|baidu|ecosia|startpage|search\.brave)\./;
  var SOCIAL = { 'facebook': 'facebook', 'fb.me': 'facebook', 'instagram': 'instagram', 'linkedin': 'linkedin', 'lnkd.in': 'linkedin',
    't.co': 'twitter', 'twitter': 'twitter', 'x.com': 'twitter', 'youtube': 'youtube', 'youtu.be': 'youtube', 'pinterest': 'pinterest',
    'reddit': 'reddit', 'quora': 'quora', 'whatsapp': 'whatsapp', 'wa.me': 'whatsapp', 'threads': 'threads', 'telegram': 'telegram', 't.me': 'telegram' };
  var AI = { 'chatgpt.com': 'chatgpt', 'chat.openai.com': 'chatgpt', 'perplexity.ai': 'perplexity', 'gemini.google.com': 'gemini',
    'copilot.microsoft.com': 'copilot', 'claude.ai': 'claude' };
  var CLICK = [['gclid', 'google', 'cpc'], ['gbraid', 'google', 'cpc'], ['wbraid', 'google', 'cpc'], ['fbclid', 'facebook', 'paid_social'], ['msclkid', 'bing', 'cpc']];

  function store(v) {
    try { if (v === undefined) return JSON.parse(localStorage.getItem(ATTR_KEY) || '{}') || {}; localStorage.setItem(ATTR_KEY, JSON.stringify(v)); }
    catch (e) { return v === undefined ? (store.mem || {}) : (store.mem = v); }
  }
  function cut(s, n) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, n); }
  function refHost() {
    try { var h = new URL(document.referrer).hostname.replace(/^www\./, ''); return h && h !== location.hostname.replace(/^www\./, '') ? h : ''; }
    catch (e) { return ''; }
  }
  function lookup(map, host) {
    for (var k in map) if (host === k || host.indexOf(k + '.') === 0 || host.slice(-k.length - 1) === '.' + k || host.indexOf('.' + k + '.') > -1) return map[k];
    return '';
  }

  /* The touch for this page view, or null when it is a direct / internal visit. */
  function readTouch() {
    var q = new URLSearchParams(location.search), t = {}, any = false, host = refHost();
    UTM.forEach(function (k) { var v = cut(q.get('utm_' + k), 150); if (v) { t[k] = v; any = true; } });
    CLICK.forEach(function (c) {
      var v = cut(q.get(c[0]), 300); if (!v) return;
      var key = c[0] === 'gbraid' || c[0] === 'wbraid' ? 'gclid' : c[0];
      any = true; t[key] = t[key] || v;
      if (!t.source) { t.source = c[1]; t.medium = t.medium || c[2]; }
    });
    if (!any && host) {
      var ai = lookup(AI, host), social = lookup(SOCIAL, host);
      if (ai) { t.source = ai; t.medium = 'ai'; }
      else if (SEARCH.test('.' + host)) { t.source = host.match(SEARCH)[2].replace('search.', ''); t.medium = 'organic'; }
      else if (social) { t.source = social; t.medium = 'social'; }
      else { t.source = host; t.medium = 'referral'; }
      any = true;
    }
    if (!any) return null;
    if (!t.medium && t.source) t.medium = 'referral';
    t.landing_page = cut(location.pathname + location.search, 300);
    t.referrer = cut(document.referrer, 300);
    t.date = new Date().toISOString().slice(0, 10);
    t.ts = Date.now();
    return t;
  }

  var attr = store(), touch = readTouch();
  if (touch) {
    if (!attr.first) attr.first = touch;
    attr.last = touch;
    store(attr);
  }
  if (attr.last && Date.now() - (attr.last.ts || 0) > LAST_DAYS * 864e5) { delete attr.last; store(attr); }

  /* Fields added to every lead sent to /api/leads. */
  function attribution() {
    var l = attr.last || {}, f = attr.first, out = {};
    UTM.forEach(function (k) { out['utm_' + k] = l[k] || ''; });
    out.gclid = l.gclid || ''; out.fbclid = l.fbclid || ''; out.msclkid = l.msclkid || '';
    out.landing_page = l.landing_page || ''; out.landing_referrer = l.referrer || '';
    if (f) {
      out.first_touch = {};
      UTM.concat(['landing_page', 'referrer', 'date']).forEach(function (k) { if (f[k]) out.first_touch[k] = cut(f[k], 200); });
    }
    return out;
  }

  function send(payload) {
    payload.page = location.pathname + location.hash;
    payload.referrer = document.referrer || '';
    var a = attribution();
    for (var k in a) if (payload[k] === undefined) payload[k] = a[k];
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || !j.ok) throw new Error(j.error || 'Request failed');
        return j;
      });
    });
  }

  /* ui = {button, err, ok, form} */
  function submit(payload, ui) {
    var btn = ui.button;
    if (btn) { if (btn.disabled) return; btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
    if (ui.ok) ui.ok.hidden = true;

    send(payload).then(function () {
      var first = (payload.name || '').split(' ')[0];
      ui.ok.hidden = false;
      ui.ok.textContent = 'Thanks, ' + first + '! Your request is in. Our growth strategist will call you within 24 hours.';
      if (ui.form) ui.form.reset();
      if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', form: payload.form, utm_source: payload.utm_source, utm_medium: payload.utm_medium, utm_campaign: payload.utm_campaign });
    }).catch(function (e) {
      ui.err.textContent = (e && e.message && e.message !== 'Request failed' && e.message !== 'Failed to fetch')
        ? e.message
        : 'Sorry, we could not send your details right now. Please call or WhatsApp ' + (cfg.phone || '') + '.';
    }).then(function () {
      if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
    });
  }

  window.TGLLeads = { send: send, submit: submit, attribution: attribution };

  /* Shared contact form before the footer (templates/sections/shared/contact-form.html).
     Fields listed in data-core go to their own columns; anything else goes in "extra". */
  document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    var err = form.querySelector('.err'), ok = form.querySelector('.ok'), btn = form.querySelector('[type=submit]');
    var core = (form.dataset.core || '').split(',');
    form.addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); err.textContent = ''; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      var payload = { form: form.dataset.leadForm, cta: btn ? btn.dataset.cta || '' : '', extra: {} };
      var bad = null;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'submit') return;
        var v = (el.value || '').trim();
        if (el.name === 'hp') { payload.hp = v; return; }
        if (el.required && !v && !bad) bad = el;
        if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && !bad) bad = el;
        if (core.indexOf(el.name) > -1) payload[el.name] = v; else if (v) payload.extra[el.name] = v;
      });
      if (!bad && payload.phone !== undefined) {
        var digits = payload.phone.replace(/\D/g, '');
        if (!/^[+\d][\d\s-]{7,}$/.test(payload.phone) || digits.length < 8 || digits.length > 15) bad = form.elements.phone;
      }
      if (bad) {
        bad.setAttribute('aria-invalid', 'true');
        bad.focus();
        err.textContent = bad.name === 'phone' ? 'Please enter a valid phone number, for example +91 98765 43210.'
          : bad.type === 'email' && bad.value ? 'Please enter a valid email address.'
          : 'Please fill in: ' + (bad.closest('label').querySelector('.ef-l').firstChild.textContent.trim()) + '.';
        return;
      }
      submit(payload, { button: btn, err: err, ok: ok, form: form });
    });
  });
})();
