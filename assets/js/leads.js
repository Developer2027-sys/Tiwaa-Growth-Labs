/* Tiwaa Growth Labs: sends enquiries from the hero form and popup to the lead API.
   The API URL comes from window.TGL (printed by templates/layout/head.html).
   Production: Rust Worker (worker/) -> D1.  Local dev (npm run dev): tgl serve -> storage/leads.jsonl. */
(function () {
  var cfg = window.TGL || {};
  var API = cfg.api || '/api/leads';

  function send(payload) {
    payload.page = location.pathname + location.hash;
    payload.referrer = document.referrer || '';
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
      if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', form: payload.form });
    }).catch(function (e) {
      ui.err.textContent = (e && e.message && e.message !== 'Request failed' && e.message !== 'Failed to fetch')
        ? e.message
        : 'Sorry, we could not send your details right now. Please call or WhatsApp ' + (cfg.phone || '') + '.';
    }).then(function () {
      if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
    });
  }

  window.TGLLeads = { send: send, submit: submit };

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
          : 'Please fill in: ' + (bad.closest('label').querySelector('.cf-l').firstChild.textContent.trim()) + '.';
        return;
      }
      submit(payload, { button: btn, err: err, ok: ok, form: form });
    });
  });
})();
