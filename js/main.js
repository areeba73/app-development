/* =========================================================
   VYRA — recreation interactions (vanilla JS)
   ========================================================= */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. NAV ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var navMobile = document.getElementById('navMobile');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (burger) {
    burger.addEventListener('click', function () {
      var open = navMobile.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navMobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navMobile.classList.remove('is-open'); burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 1b. THEME TOGGLE (dark / light) ---------- */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- 1c. BACK-TO-TOP (fixed floating button) ---------- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    function toggleToTop() { toTop.classList.toggle('is-visible', window.scrollY > 480); }
    window.addEventListener('scroll', toggleToTop, { passive: true });
    toggleToTop();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 2. Split a heading into per-character spans ---------- */
  function splitChars(el) {
    var text = el.textContent; el.textContent = '';
    var words = text.split(' '); var idx = 0;
    words.forEach(function (word, wi) {
      var w = document.createElement('span'); w.className = 'word';
      for (var i = 0; i < word.length; i++) {
        var c = document.createElement('span'); c.className = 'char';
        c.textContent = word[i]; c.style.transitionDelay = (idx * 24) + 'ms';
        w.appendChild(c); idx++;
      }
      el.appendChild(w);
      if (wi < words.length - 1) { el.appendChild(document.createTextNode(' ')); idx++; }
    });
    return el.querySelectorAll('.char');
  }
  function animateChars(chars, startDelay) {
    chars.forEach(function (c) {
      c.style.transition = 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)';
    });
    requestAnimationFrame(function () {
      setTimeout(function () {
        chars.forEach(function (c) { c.style.opacity = '1'; c.style.transform = 'translateY(0)'; });
      }, startDelay || 120);
    });
  }

  // Hero title animates on load
  var heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    var hChars = splitChars(heroTitle);
    if (reduceMotion) hChars.forEach(function (c) { c.style.opacity = 1; c.style.transform = 'none'; });
    else animateChars(hChars, 150);
  }
  // CTA title animates when scrolled into view
  var ctaTitle = document.getElementById('ctaTitle');
  var ctaChars = ctaTitle ? splitChars(ctaTitle) : null;

  /* ---------- 3. Scroll reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var stagger = parseInt(el.getAttribute('data-stagger') || '0', 10);
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(function () { el.classList.add('is-inview'); }, delay + stagger * 90);
      if (el === ctaTitle && ctaChars && !reduceMotion) animateChars(ctaChars, 100);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

  // mark app screens in-view so bars/charts animate
  var appIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-inview'); appIO.unobserve(e.target); } });
  }, { threshold: 0.2 });
  document.querySelectorAll('[data-app], .concept, .app--mini').forEach(function (a) { appIO.observe(a); });

  /* ---------- 4. Continuous floating (phones + chips) ----------
     Measured on the reference: the phone drifts only ~±5px, while the
     chips float much more (~±20px vertical + a little horizontal), each on
     its own multi-second period. Particles bob via CSS. */
  // Matched to the reference recording: the PHONE stays nearly static (a
  // tiny vertical bob), while each CHIP rotates a full 360° continuously with
  // a strong ease-in-out — it dwells near horizontal, then spins quickly
  // through vertical and fully upside-down, clockwise, each on its own period.
  var TAU = Math.PI * 2;
  var floaters = [];
  document.querySelectorAll('[data-float]').forEach(function (el) {
    if (el.classList.contains('phone--hero') || el.classList.contains('phone--cta'))
      floaters.push({ el: el, kind: 'phone', ampY: 4, w: TAU / 6000, phase: Math.random() * TAU });
    else if (el.classList.contains('chip--fps'))
      floaters.push({ el: el, kind: 'chip', rest: -5, dir: 1, period: 4200, offset: 0.08, driftY: 15, driftX: 7, driftW: TAU / 5200, driftPhase: Math.random() * TAU });
    else if (el.classList.contains('chip--live'))
      floaters.push({ el: el, kind: 'chip', rest: -8, dir: 1, period: 5600, offset: 0.46, driftY: 13, driftX: 6, driftW: TAU / 6400, driftPhase: Math.random() * TAU });
  });
  // cubic ease-in-out: dwells ~1s near horizontal, then a gradual ~2.4s spin
  // through vertical and fully upside-down — matched to the reference timing.
  function easeInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function animateFloat(t) {
    if (!reduceMotion) {
      for (var i = 0; i < floaters.length; i++) {
        var f = floaters[i];
        if (f.kind === 'phone') {
          // drive only the bob via a CSS var so each breakpoint keeps its own centering/tilt
          var y = Math.sin(t * f.w + f.phase) * f.ampY;
          f.el.style.setProperty('--bob', y.toFixed(2) + 'px');
        } else {
          var p = ((t / f.period) + f.offset) % 1; if (p < 0) p += 1;
          var ang = f.rest + f.dir * easeInOut(p) * 360;
          var dy = Math.sin(t * f.driftW + f.driftPhase) * f.driftY;
          var dx = Math.cos(t * f.driftW * 0.8 + f.driftPhase) * f.driftX;
          f.el.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) rotate(' + ang.toFixed(2) + 'deg)';
        }
      }
    }
    requestAnimationFrame(animateFloat);
  }
  requestAnimationFrame(animateFloat);

  /* ---------- 4b. Aurora canvas (flowing gradient background) ---------- */
  (function () {
    var canvases = document.querySelectorAll('[data-aurora]');
    if (!canvases.length || reduceMotion) return;
    // palette blobs: [color, radiusFactor, path params]
    var blobs = [
      { c: '78,44,168',   r: 0.66, ox: 0.16, oy: 0.30, ax: 0.22, ay: 0.16, sx: 0.10, sy: 0.07, ph: 0 },
      { c: '20,108,120',  r: 0.58, ox: 0.52, oy: 0.12, ax: 0.20, ay: 0.20, sx: 0.08, sy: 0.11, ph: 1.7 },
      { c: '110,36,104',  r: 0.74, ox: 0.86, oy: 0.34, ax: 0.18, ay: 0.14, sx: 0.07, sy: 0.09, ph: 3.1 },
      { c: '44,38,104',   r: 0.54, ox: 0.34, oy: 0.62, ax: 0.24, ay: 0.18, sx: 0.09, sy: 0.06, ph: 4.4 },
      { c: '34,136,150',  r: 0.40, ox: 0.72, oy: 0.70, ax: 0.16, ay: 0.20, sx: 0.12, sy: 0.08, ph: 2.2 }
    ];
    canvases.forEach(function (cv) {
      var ctx = cv.getContext('2d');
      var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      function resize() {
        var rect = cv.getBoundingClientRect();
        W = Math.max(1, rect.width); H = Math.max(1, rect.height);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      var ro = new ResizeObserver(resize); ro.observe(cv);
      function draw(time) {
        var t = time * 0.00018;
        // adapt to theme: additive glow on dark, soft colour wash on light
        var light = document.documentElement.getAttribute('data-theme') === 'light';
        var a0 = light ? 0.26 : 0.34, a1 = light ? 0.08 : 0.08;
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
        var base = Math.max(W, H);
        for (var i = 0; i < blobs.length; i++) {
          var b = blobs[i];
          var cx = (b.ox + Math.sin(t * (b.sx * 10) + b.ph) * b.ax) * W;
          var cy = (b.oy + Math.cos(t * (b.sy * 10) + b.ph) * b.ay) * H;
          var rad = b.r * base * (0.9 + 0.1 * Math.sin(t * 2 + b.ph));
          var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
          g.addColorStop(0, 'rgba(' + b.c + ',' + a0 + ')');
          g.addColorStop(0.5, 'rgba(' + b.c + ',' + a1 + ')');
          g.addColorStop(1, 'rgba(' + b.c + ',0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        }
        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    });
  })();

  /* ---------- 5. Toolkit marquee (seamless, gap-free loop) ----------
     A single copy of the pills is narrower than the viewport, so just
     doubling leaves an empty gap at the -50% loop point. Instead we build a
     GROUP of enough copies to always exceed the viewport, lay down two
     identical groups, and translate by exactly one group (-50%). Duration is
     scaled to the group width so the scroll SPEED stays constant. */
  (function () {
    var track = document.getElementById('marquee');
    if (!track) return;
    var marquee = track.closest('.marquee') || track.parentElement;
    var SPEED = 44; // px/sec — preserves the original ticker pace
    function build() {
      var oneSet = track.getAttribute('data-set') || track.innerHTML;
      track.setAttribute('data-set', oneSet);
      // measure one set
      track.style.animation = 'none';
      track.innerHTML = oneSet;
      var setW = track.scrollWidth;
      var contW = Math.max(marquee.clientWidth, window.innerWidth || 0);
      var perGroup = Math.max(2, Math.ceil(contW / setW) + 1); // group always wider than viewport
      var group = '';
      for (var i = 0; i < perGroup; i++) group += oneSet;
      track.innerHTML = group + group; // two identical groups
      var groupW = track.scrollWidth / 2;
      track.style.animation = '';
      track.style.animationDuration = (groupW / SPEED).toFixed(2) + 's';
    }
    build();
    // rebuild on significant width changes so the group always covers the viewport
    var rw;
    window.addEventListener('resize', function () {
      clearTimeout(rw);
      rw = setTimeout(build, 250);
    });
  })();

  /* ---------- 6. Testimonials carousel ---------- */
  (function () {
    var trackEl = document.getElementById('quoteTrack');
    if (!trackEl) return;
    var slides = trackEl.children.length;
    var dots = Array.prototype.slice.call(document.querySelectorAll('#quoteDots .dot'));
    var prev = document.getElementById('prevQuote');
    var next = document.getElementById('nextQuote');
    var i = 0, timer;
    function go(n) {
      i = (n + slides) % slides;
      trackEl.style.transform = 'translateX(' + (-i * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
    }
    function auto() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 6000); }
    prev.addEventListener('click', function () { go(i - 1); auto(); });
    next.addEventListener('click', function () { go(i + 1); auto(); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); auto(); }); });
    if (!reduceMotion) auto();
  })();

  /* ---------- 7. Card pointer tilt ---------- */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'translateY(-6px) perspective(900px) rotateX(' + (-py * 3).toFixed(2) + 'deg) rotateY(' + (px * 4).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }
})();
