// SRMJ shared script: before/after sliders, copy-address button, clean #section links.
(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Before/after sliders
  document.querySelectorAll('.cmp').forEach(function (cmp) {
    var range = cmp.querySelector('input'), touched = false;
    function set(v) { cmp.style.setProperty('--pos', v + '%'); }
    function update() {
      set(range.value);
      range.setAttribute('aria-valuetext', range.value + ' percent before, ' + (100 - range.value) + ' percent after');
    }
    range.addEventListener('input', update);
    update();
    ['pointerdown', 'keydown', 'focus'].forEach(function (ev) {
      range.addEventListener(ev, function () { touched = true; });
    });
    // Drag anywhere on the photo (iOS only drags a range by its thumb). touch-action:pan-y keeps vertical scrolling.
    var dragging = false;
    function fromPointer(e) {
      var r = cmp.getBoundingClientRect();
      range.value = Math.round(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)));
      update();
    }
    range.addEventListener('pointerdown', function (e) { dragging = true; range.setPointerCapture(e.pointerId); fromPointer(e); });
    range.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e); });
    range.addEventListener('pointerup', function () { dragging = false; });
    range.addEventListener('pointercancel', function () { dragging = false; });
    cmp.querySelectorAll('img').forEach(function (im) {
      function miss() { cmp.classList.add('empty'); }
      im.addEventListener('error', miss);
      if (im.complete && im.naturalWidth === 0) miss();
    });
    // One short sweep the first time a slider is seen, so people notice it can be dragged.
    if (still || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function step(t) {
        if (touched) return update();
        if (t0 === null) t0 = t;
        var k = Math.min((t - t0) / 1400, 1);
        set((50 - 18 * Math.sin(k * Math.PI)).toFixed(2));
        if (k < 1) requestAnimationFrame(step); else update();
      }
      setTimeout(function () { requestAnimationFrame(step); }, 400);
    }, { threshold: 0.6 });
    io.observe(cmp);
  });

  // Copy address button
  var copy = document.getElementById('copy');
  if (copy) {
    var addr = document.getElementById('addr'), out = document.getElementById('copied');
    copy.addEventListener('click', function () {
      var t = addr.textContent.trim();
      function fallback() {
        var s = window.getSelection(), r = document.createRange();
        r.selectNodeContents(addr); s.removeAllRanges(); s.addRange(r);
        out.textContent = 'Address selected. Press Ctrl+C or Cmd+C to copy.';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { out.textContent = 'Copied: ' + t; }, fallback);
      } else { fallback(); }
    });
  }

  // How it works: swap the start panel for the walkthrough on click (saves 570 KB for visitors who skip it).
  var start = document.querySelector('.deck-start');
  if (start) start.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = start.getAttribute('data-src');
    f.title = 'How it works: a short presentation in three steps';
    start.replaceWith(f);
    f.addEventListener('load', function () { try { f.contentWindow.focus(); } catch (e) {} });
  });

  // Phone contact bar: visible once the hero is gone, hidden again when the contact band is on screen.
  var bar = document.getElementById('mbar'), hero = document.querySelector('.hero'), contact = document.getElementById('contact');
  if (bar && hero && contact && 'IntersectionObserver' in window) {
    var past = false, near = false;
    var show = function () { bar.classList.toggle('on', past && !near); };
    new IntersectionObserver(function (e) { past = !e[0].isIntersecting; show(); }).observe(hero);
    new IntersectionObserver(function (e) { near = e[0].isIntersecting || e[0].boundingClientRect.top < 0; show(); }).observe(contact);
  }

  // Our work: tap a photo to see it full size. Uses the native <dialog> (Esc and focus handling come free).
  var gallery = document.querySelector('.work');
  if (gallery && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML = '<img alt=""><button type="button" class="lb-close" aria-label="Close">Close</button>';
    document.body.appendChild(dlg);
    var big = dlg.querySelector('img');
    gallery.querySelectorAll('.pair img').forEach(function (im) {
      im.tabIndex = 0;
      im.style.cursor = 'zoom-in';
      function open() {
        var src = im.getAttribute('srcset') ? im.getAttribute('srcset').split(',').pop().trim().split(' ')[0] : im.src;
        big.src = src; big.alt = im.alt; dlg.showModal();
      }
      im.addEventListener('click', open);
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    dlg.addEventListener('click', function (e) { if (e.target !== big) dlg.close(); });
  }

  // Our work: filter the examples by the type in each caption (Interior, Exterior, Outdoor).
  if (gallery) {
    var figs = [].slice.call(gallery.querySelectorAll('figure'));
    var kinds = [];
    figs.forEach(function (f) { var k = f.querySelector('figcaption span'); if (k && kinds.indexOf(k.textContent) < 0) kinds.push(k.textContent); });
    if (kinds.length > 1) {
      var bar = document.createElement('div');
      bar.className = 'work-filter'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Show examples');
      ['All'].concat(kinds).forEach(function (k, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = k; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        b.addEventListener('click', function () {
          bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          figs.forEach(function (f) { var s = f.querySelector('figcaption span'); f.hidden = k !== 'All' && (!s || s.textContent !== k); });
        });
        bar.appendChild(b);
      });
      gallery.parentNode.insertBefore(bar, gallery);
      if (window.HTMLDialogElement) {
        var hint = document.createElement('p');
        hint.className = 'cap work-hint';
        hint.textContent = 'Tap or click a photo to see it full size.';
        bar.appendChild(hint);
      }
    }
  }

  // Front page gallery: tap a tile to toggle the original (hover does it on a mouse); tiles fade in once.
  document.querySelectorAll('.tile').forEach(function (t) {
    t.addEventListener('click', function () { t.classList.toggle('show'); });
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.classList.toggle('show'); } });
  });
  var rev = document.querySelectorAll('[data-reveal]');
  if (rev.length) {
    if (still || !('IntersectionObserver' in window)) rev.forEach(function (el) { el.classList.add('in'); });
    else {
      var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { threshold: 0.15 });
      rev.forEach(function (el, i) { el.style.transitionDelay = (i * 0.08) + 's'; ro.observe(el); });
    }
  }

  // Keep the address bar clean after jumping to a #section on the same page.
  function clean() { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1), el = id && document.getElementById(id);
    if (!el && id !== 'top') return;
    e.preventDefault();
    if (el) {
      el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
      // preventDefault also cancels the focus move, so move keyboard focus ourselves (skip link, Contact).
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    } else window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
    clean();
  });
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    setTimeout(function () { if (target) target.scrollIntoView({ block: 'start' }); clean(); }, 50);
  }
})();

// v5 motion pack: kinetic headlines and scroll reveals. Skipped entirely with reduced motion.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.stage-copy h1, .phead h1, .ahead h1, .intro.ink h1').forEach(function (h) {
    var i = 0, out = [];
    h.setAttribute('aria-label', h.textContent.trim());
    // Keep <em> accents: split text nodes and <em> children word by word.
    h.childNodes.forEach(function (n) {
      var em = n.nodeType === 1 && n.tagName === 'EM';
      (n.textContent || '').split(/\s+/).forEach(function (w) {
        if (!w) return;
        var t = w.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        out.push('<span class="w" aria-hidden="true"><span style="--i:' + (i++) + '">' + (em ? '<em>' + t + '</em>' : t) + '</span></span>');
      });
    });
    h.innerHTML = out.join(' ');
    h.classList.add('kin');
  });
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  function mark(sel, cls) { document.querySelectorAll(sel).forEach(function (el, n) { if (el.getBoundingClientRect().top < innerHeight) return; /* already on screen: never hide it */ el.classList.add(cls); el.style.transitionDelay = (n % 3) * 0.09 + 's'; io.observe(el); }); }
  mark('.who-img, .h3t, .ahead-img, .work .pair, .example .pair', 'wipe');
  mark('.sec-h, .promise li, .who-big, .who-note, .lead.stack, .tip, .sec h2, .person, .faq details, .contact h2', 'rise-in');
})();

// Scroll-scrubbed before/after: the edit sweeps across the photo as the section scrolls past.
(function () {
  var sec = document.querySelector('.scrub');
  if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ticking = false;
  function draw() {
    ticking = false;
    var r = sec.getBoundingClientRect(), run = r.height - innerHeight;
    var k = Math.max(0, Math.min(1, -r.top / (run || 1)));
    k = Math.max(0, Math.min(1, (k - 0.1) / 0.75)); // hold a moment at both ends
    sec.style.setProperty('--p', (k * 100).toFixed(2) + '%');
    sec.style.setProperty('--oa', k > 0.55 ? 1 : 0);
    sec.style.setProperty('--ob', k < 0.45 ? 1 : 0);
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
  addEventListener('resize', draw);
  draw();
})();
