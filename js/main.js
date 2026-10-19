/* ============================================================
   Sulmon Bahati Otembo — Portfolio interactions
   Lenis smooth scroll + GSAP ScrollTrigger
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (!reduced) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.6 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href.length > 1 && document.querySelector(href)) {
        e.preventDefault();
        closeMenu();
        scrollToTarget(href);
      }
    });
  });

  /* ---------- Text splitting ---------- */
  function splitWords(el) {
    var text = el.textContent.trim();
    el.textContent = '';
    var words = text.split(/\s+/);
    words.forEach(function (w, i) {
      var mask = document.createElement('span');
      mask.className = 'word-mask';
      var inner = document.createElement('span');
      inner.textContent = w;
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.word-mask > span');
  }

  function splitPlain(el) {
    var text = el.textContent.trim();
    el.textContent = '';
    var words = text.split(/\s+/);
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.w');
  }

  /* Split every [data-split] outside the hero intro flow too */
  var heroSplitEls = gsap.utils.toArray('.hero [data-split]');
  heroSplitEls.forEach(splitWords);
  var otherSplitEls = gsap.utils.toArray('[data-split]').filter(function (el) { return !el.closest('.hero'); });
  otherSplitEls.forEach(splitWords);

  /* ---------- Preloader + hero intro ---------- */
  var intro = gsap.timeline({ paused: true });

  if (reduced) {
    document.getElementById('loader').style.display = 'none';
    gsap.set('[data-fade]', { opacity: 1, y: 0 });
    gsap.set('.hero .word-mask > span', { y: '0%' });
  } else {
    intro
      .to('.loader__name', { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .to('.loader__bar span', { scaleX: 1, duration: 0.85, ease: 'power2.inOut' }, 0.15)
      .to('.loader__name', { y: -12, opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.1')
      .to('#loader', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.05')
      .set('#loader', { display: 'none' })
      .from('.orb', { opacity: 0, scale: 0.82, duration: 1.7, ease: 'power3.out', stagger: 0.12 }, '-=0.85')
      .from('.hero__grid', { opacity: 0, duration: 1.6, ease: 'power2.out' }, '<')
      .to('.hero .word-mask > span', { y: '0%', duration: 1.15, ease: 'expo.out', stagger: 0.055 }, '-=1.35')
      .to('.hero [data-fade]', { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09 }, '-=0.85')
      .from('.hero__scroll', { opacity: 0, y: 14, duration: 0.9, ease: 'power3.out' }, '-=0.6');

    window.addEventListener('load', function () { intro.play(); });
    /* Safety: if load already fired or hangs, play anyway */
    if (document.readyState === 'complete') intro.play();
    setTimeout(function () { if (!intro.isActive() && intro.progress() === 0) intro.play(); }, 2200);
  }

  /* Hero scroll-away effect */
  if (!reduced) {
    gsap.to('.hero__content', {
      yPercent: -14, scale: 0.955, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 25%', scrub: true }
    });
    gsap.to('.hero__scroll', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '18% top', scrub: true }
    });
  }

  /* ---------- Generic reveals ---------- */
  if (!reduced) {
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.15, ease: 'expo.out',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    otherSplitEls.forEach(function (el) {
      var spans = el.querySelectorAll('.word-mask > span');
      gsap.to(spans, {
        y: '0%', duration: 1.1, ease: 'expo.out', stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
  } else {
    gsap.set('[data-reveal]', { opacity: 1, y: 0 });
    gsap.set('.word-mask > span', { y: '0%' });
  }

  /* ---------- Stat counters ---------- */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var obj = { v: 0 };
    var render = function () { el.textContent = Math.round(obj.v); };
    if (reduced) { el.textContent = end; return; }
    gsap.to(obj, {
      v: end, duration: 1.9, ease: 'power3.out', onUpdate: render,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* ---------- About word-by-word scrub ---------- */
  var aboutText = document.getElementById('aboutText');
  if (aboutText) {
    var aboutWords = splitPlain(aboutText);
    if (!reduced) {
      gsap.to(aboutWords, {
        opacity: 1, ease: 'none', stagger: 0.35,
        scrollTrigger: { trigger: aboutText, start: 'top 76%', end: 'bottom 48%', scrub: 0.5 }
      });
    } else {
      gsap.set(aboutWords, { opacity: 1 });
    }
  }

  /* ---------- Marquee ---------- */
  var marquee = document.querySelector('.marquee');
  if (marquee) {
    var track = marquee.querySelector('.marquee__track');
    var group = track.querySelector('.marquee__group');
    var clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    if (!reduced) {
      var marqueeTween = gsap.to(track, { xPercent: -50, repeat: -1, duration: 36, ease: 'none' });
      marquee.addEventListener('mouseenter', function () { marqueeTween.timeScale(0); });
      marquee.addEventListener('mouseleave', function () { marqueeTween.timeScale(1); });
    }
  }

  /* ---------- Timeline draw ---------- */
  var timelineLine = document.querySelector('.timeline__line span');
  if (timelineLine && !reduced) {
    gsap.to(timelineLine, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 72%', end: 'bottom 62%', scrub: 0.4 }
    });
  } else if (timelineLine) {
    gsap.set(timelineLine, { scaleY: 1 });
  }

  /* ---------- Stacked project cards ---------- */
  var cards = gsap.utils.toArray('.project-card');
  if (!reduced && cards.length > 1 && window.matchMedia('(min-width: 721px)').matches) {
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: 0.93, opacity: 0.3, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 18%', scrub: true }
      });
    });
  }

  /* ---------- Nav behavior ---------- */
  var nav = document.getElementById('nav');
  var lastY = 0;
  function onScrollNav(scroll) {
    if (scroll > 28) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
    if (scroll > lastY && scroll > 320) nav.classList.add('is-hidden');
    else nav.classList.remove('is-hidden');
    lastY = scroll;
  }
  if (lenis) lenis.on('scroll', function (e) { onScrollNav(e.scroll); });
  else window.addEventListener('scroll', function () { onScrollNav(window.scrollY); }, { passive: true });

  /* Active nav link per section */
  ['about', 'work', 'skills', 'experience', 'education', 'contact'].forEach(function (id) {
    var section = document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section, start: 'top 45%', end: 'bottom 45%',
      onToggle: function (self) {
        var link = document.querySelector('.nav__link[href="#' + id + '"]');
        if (link) link.classList.toggle('is-active', self.isActive);
      }
    });
  });

  /* Scroll progress bar */
  if (!reduced) {
    gsap.to('#progressBar', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });
  } else {
    gsap.set('#progressBar', { scaleX: 1 });
  }

  /* ---------- Orb mouse parallax ---------- */
  if (!isTouch && !reduced) {
    var orbs = gsap.utils.toArray('.orb');
    orbs.forEach(function (orb) {
      var depth = parseFloat(orb.getAttribute('data-depth') || 20);
      orb._xTo = gsap.quickTo(orb, 'x', { duration: 1.1, ease: 'power3' });
      orb._yTo = gsap.quickTo(orb, 'y', { duration: 1.1, ease: 'power3' });
      orb._depth = depth;
    });
    window.addEventListener('mousemove', function (e) {
      var cx = e.clientX / window.innerWidth - 0.5;
      var cy = e.clientY / window.innerHeight - 0.5;
      orbs.forEach(function (orb) {
        orb._xTo(cx * orb._depth);
        orb._yTo(cy * orb._depth);
      });
    }, { passive: true });
  }

  /* ---------- Custom cursor ---------- */
  var cursorRoot = document.querySelector('.cursor');
  if (!isTouch && !reduced && cursorRoot) {
    /* Hide the native cursor only once the custom one is actually running */
    document.documentElement.classList.add('has-custom-cursor');
    var dot = document.getElementById('cursorDot');
    var ringEl = document.getElementById('cursorRing');
    var dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    var dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    var rx = gsap.quickTo(ringEl, 'x', { duration: 0.45, ease: 'power3' });
    var ry = gsap.quickTo(ringEl, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('mousemove', function (e) {
      cursorRoot.classList.add('is-active');
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cursorRoot.classList.remove('is-active'); });
    document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        gsap.to(ringEl, { scale: 1.7, opacity: 0.9, duration: 0.35, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(ringEl, { scale: 1, opacity: 0.55, duration: 0.35, ease: 'power3.out' });
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.style.transition = 'none';
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.55, ease: 'power3' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.55, ease: 'power3' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  function openMenu() {
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!burger) return;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
    document.body.style.overflow = '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      if (mobileMenu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { closeMenu(); });
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = 'sulemonbahati77@gmail.com';
      var done = function () {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('is-copied');
        setTimeout(function () {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('is-copied');
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Refresh after fonts/images settle ---------- */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });


})();
