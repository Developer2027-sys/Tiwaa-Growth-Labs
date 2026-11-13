/* Contact page (/contact): open/closed status, copy buttons, live map, FAQ tabs and the
   enquiry form, which posts to the lead API through window.TGLLeads (assets/js/leads.js). */
(function () {
  function $(i) { return document.getElementById(i); }
  var ctf = $('ctForm');
  if (!ctf) return;

  /* Office hours are Mon–Sat 10 AM–7 PM India time, whatever the visitor's own time zone. */
  function ist() { var d = new Date(), u = d.getTime() + d.getTimezoneOffset() * 60000; return new Date(u + 330 * 60000); }
  var t = ist(), wd = t.getDay(), h = t.getHours() + t.getMinutes() / 60, open = wd >= 1 && wd <= 6 && h >= 10 && h < 19;
  var st = $('ctSt');
  if (st && !open) { st.classList.add('off'); st.querySelector('b').textContent = wd === 0 || (wd === 6 && h >= 19) ? 'Closed · back Monday 10 AM' : 'Closed · back at 10 AM'; }
  var on = $('ofNow');
  if (on) { on.textContent = open ? '● Open now' : '● Closed now'; if (!open) on.classList.add('off'); }
  [].forEach.call(document.querySelectorAll('#ofHrs .lc-row'), function (r) { if (r.dataset.days.split(',').indexOf(String(wd)) > -1) r.classList.add('today'); });

  /* Copy buttons (phone, email, address) */
  [].forEach.call(document.querySelectorAll('[data-copy]'), function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.copy, lab = b.innerHTML;
      function done() { b.classList.add('done'); b.textContent = 'Copied ✓'; setTimeout(function () { b.classList.remove('done'); b.innerHTML = lab; }, 1600); }
      function fb() {
        var ta = document.createElement('textarea'); ta.value = v; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (x) {} ta.remove();
        if (ok) done(); else { b.textContent = 'Copy failed'; setTimeout(function () { b.innerHTML = lab; }, 1600); }
      }
      try { navigator.clipboard.writeText(v).then(done, fb); } catch (e) { fb(); }
    });
  });

  /* Google Map: loaded only when the office section is near the screen; the drawn map shows until it loads. */
  var lm = $('locMap');
  function loadMap() {
    if (!lm || lm.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.title = 'Tiwaa Growth Labs on Google Maps'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    f.src = 'https://www.google.com/maps?q=Spaze+I+Tech+Park,+Sector+49,+Sohna+Road,+Gurugram&z=16&output=embed';
    f.addEventListener('load', function () { var fb = lm.querySelector('.loc-fb'); if (fb) fb.style.display = 'none'; });
    lm.appendChild(f);
  }
  if (lm) {
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); loadMap(); } }, { rootMargin: '400px' }).observe(lm);
    else loadMap();
  }

  /* FAQ: topic tabs + one-open-at-a-time accordion */
  var cqs = [].slice.call(document.querySelectorAll('.cq'));
  function shut() { cqs.forEach(function (x) { x.classList.remove('open'); x.querySelector('.cq-q').setAttribute('aria-expanded', 'false'); }); }
  cqs.forEach(function (q) {
    q.querySelector('.cq-q').addEventListener('click', function () {
      var o = !q.classList.contains('open'); shut();
      if (o) { q.classList.add('open'); q.querySelector('.cq-q').setAttribute('aria-expanded', 'true'); }
    });
  });
  var tb = [].slice.call(document.querySelectorAll('#cfaTabs button'));
  tb.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.t; tb.forEach(function (x) { x.setAttribute('aria-selected', x === b); }); shut(); var first = null;
      cqs.forEach(function (q) { var on = q.dataset.t === k; q.hidden = !on; q.classList.remove('in-t'); if (on) { void q.offsetWidth; q.classList.add('in-t'); if (!first) first = q; } });
      if (first) { first.classList.add('open'); first.querySelector('.cq-q').setAttribute('aria-expanded', 'true'); }
    });
  });

  /* "Get your free audit" (bottom CTA) scrolls up to the form and puts the cursor in it */
  [].forEach.call(document.querySelectorAll('a[data-focus]'), function (a) {
    a.addEventListener('click', function () { var el = $(a.dataset.focus); if (el) setTimeout(function () { el.focus({ preventScroll: true }); }, 700); });
  });

  /* Enquiry form -> lead API */
  var sub = ctf.querySelector('.cf-sub'), er = $('cErr');
  ctf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sub.disabled) return;
    var n = $('cName'), l = $('cLast'), p = $('cPhone'), m = $('cEmail'), pw = p.parentNode;
    [n, p, m].forEach(function (x) { x.classList.remove('bad'); }); pw.classList.remove('bad');
    var first = n.value.trim(), full = (first + ' ' + l.value.trim()).trim();
    if (!first) { n.classList.add('bad'); er.textContent = 'Please enter your first name.'; n.focus(); return; }
    if (full.length < 2) { n.classList.add('bad'); er.textContent = 'Please enter your full name.'; n.focus(); return; }
    if (!/^[\d][\d\s-]{6,}$/.test(p.value.trim())) { pw.classList.add('bad'); er.textContent = 'Please enter a valid phone number, for example 98765 43210.'; p.focus(); return; }
    if (m.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.value.trim())) { m.classList.add('bad'); er.textContent = 'Please check your email address.'; m.focus(); return; }
    er.textContent = '';
    var svc = $('cSvcSel').value, cc = $('cCc').value, phone = cc + ' ' + p.value.trim();
    var payload = {
      form: 'contact', cta: ctf.dataset.cta || 'Submit', name: full, phone: phone, email: m.value.trim(),
      website: $('cCo').value.trim(), service: svc, message: $('cMsg').value.trim(), hp: $('cHp').value,
      extra: { first_name: first, last_name: l.value.trim() }
    };
    if (!window.TGLLeads) { er.textContent = 'Sorry, the form could not load. Please call or WhatsApp us.'; return; }
    var lab = sub.innerHTML; sub.disabled = true; sub.setAttribute('aria-busy', 'true'); sub.textContent = 'Sending…';
    window.TGLLeads.send(payload).then(function () {
      $('okH').textContent = 'Thanks, ' + first + '!';
      $('okP').textContent = 'We have your details' + (svc && svc !== 'Not sure yet' ? ' about ' + svc : '') + ' and will call you on ' + phone + '. Here is what happens next:';
      ctf.hidden = true; var ok = $('ctOk'); ok.hidden = false; ok.focus();
      if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', form: 'contact' });
    }).catch(function (x) {
      var msg = x && x.message;
      er.textContent = msg && msg !== 'Request failed' && msg !== 'Failed to fetch' ? msg
        : 'Sorry, we could not send your details right now. Please call or WhatsApp ' + ((window.TGL || {}).phone || '') + '.';
    }).then(function () { sub.disabled = false; sub.removeAttribute('aria-busy'); sub.innerHTML = lab; });
  });
  $('okBack').addEventListener('click', function () { ctf.reset(); $('ctOk').hidden = true; ctf.hidden = false; $('cName').focus(); });
  [].forEach.call(ctf.querySelectorAll('input'), function (x) { x.addEventListener('input', function () { x.classList.remove('bad'); x.parentNode.classList.remove('bad'); er.textContent = ''; }); });
})();

/* Form card entrance (assets/css/contact.css: cfIn / cfField): start it when the card is in view */
(function () {
  var cf = document.querySelector(".cf");
  if (!cf) return;
  function go() { cf.classList.add("go"); }
  if (!("IntersectionObserver" in window)) return go();
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); go(); } }, { threshold: 0.15 }).observe(cf);
  setTimeout(go, 4000); // never leave the form hidden
})();
