/* Scroll motion: smooth scrolling, reveal on enter, parallax depth, scroll-linked progress.
   Everything degrades to a normal static page when JS fails or the visitor prefers reduced motion. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const top = $('#top'), hero = $('#hero'), heroMedia = $('#heroMedia'), heroContent = $('#heroContent');
  const steps = $('#steps'), fab = $('#fab'), progress = $('#scrollProgress');

  /* ---- seamless marquee: duplicate the strip once ---- */
  const mq = $('#marquee'); if (mq) mq.innerHTML += mq.innerHTML;

  /* ---- split headings into words ---- */
  function split(el) {
    if (el.dataset.splitDone) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}">${w.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</span>`).join(' ');
    el.classList.add('split-words'); el.dataset.splitDone = '1';
  }

  /* ---- reveal on enter ---- */
  const io = 'IntersectionObserver' in window && !reduce ? new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;
  function watch(root) {
    (root || document).querySelectorAll('.reveal, .reveal-img, .split-words').forEach(el => {
      if (el.dataset.watched) return; el.dataset.watched = '1';
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  function init() {
    $$('h2.split').forEach(split);
    watch();
    // cards and gallery are rendered later by site.js
    new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) watch(n.parentNode || n); }))).observe(document.body, { childList: true, subtree: true });
    onScroll();
  }
  let started = false;
  const start = () => { if (!started) { started = true; init(); } };
  document.addEventListener('gali:ready', start);
  setTimeout(start, 2500); // fallback if site.js never signals

  /* ---- scroll-linked effects ---- */
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight, docH = document.documentElement.scrollHeight - vh;
    top.classList.toggle('scrolled', y > 40);
    if (progress) progress.style.setProperty('--p', docH > 0 ? (y / docH).toFixed(4) : 0);
    if (fab) fab.classList.toggle('on', y > vh * 0.5);
    if (reduce) return;

    if (hero && y < hero.offsetHeight * 1.2) {
      heroMedia.style.transform = `translate3d(0,${(y * 0.35).toFixed(1)}px,0)`;
      const k = Math.min(1, y / (hero.offsetHeight * 0.75));
      heroContent.style.transform = `translate3d(0,${(y * 0.18).toFixed(1)}px,0)`;
      heroContent.style.opacity = (1 - k * 1.1).toFixed(3);
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
      steps.style.setProperty('--p', p.toFixed(3));
    }
    $$('[data-parallax]').forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
      el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
    });
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(onScroll));

  /* ---- soft light following the pointer in the CTA ---- */
  const cta = $('#cta');
  if (cta && !reduce && matchMedia('(pointer:fine)').matches) {
    cta.addEventListener('pointermove', e => {
      const r = cta.getBoundingClientRect();
      cta.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(0));
      cta.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(0));
    });
  }

  /* ---- smooth, weighted scrolling (Lenis); native scrolling if it fails to load ---- */
  if (!reduce) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    s.onload = () => {
      if (!window.Lenis) return;
      const lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
      lenis.on('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } });
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]'); if (!a) return;
        const id = a.getAttribute('href'); const t = id.length > 1 && document.querySelector(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -80 });
      });
      // keep inner scrolling (contact panel, dropdowns) native
      const p = $('#contactPanel'); if (p) p.setAttribute('data-lenis-prevent', '');
      window.GaliLenis = lenis;
    };
    document.head.appendChild(s);
  }
})();
