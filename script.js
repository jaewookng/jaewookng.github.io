// Progressive enhancement. If JS doesn't run: everything is visible, the toggle is a plain link,
// and the gel nav is a plain list of anchor links.
document.documentElement.classList.add('js');

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Fade-in on scroll ---------- */
const items = document.querySelectorAll('.reveal');
if (reduce || !('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 2) * 80}ms`;
    io.observe(el);
  });
}

/* ---------- Titration toggle ----------
   Clicking the inactive option drops titrant into the flask; the solution changes
   colour (phenolphthalein: clear -> pink or back), then the page navigates. */
const mode = document.querySelector('.mode');
if (mode && !reduce) {
  mode.querySelectorAll('.mode__btn:not(.is-active)').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // Let modified clicks / middle clicks behave like normal links.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (mode.classList.contains('is-titrating')) { e.preventDefault(); return; }
      e.preventDefault();
      mode.classList.add('is-titrating');
      setTimeout(() => mode.classList.add('is-flipped'), 420);
      setTimeout(() => { window.location.href = btn.href; }, 900);
    });
  });
}

/* ---------- Gel-electrophoresis scroll nav ----------
   Each band is placed where its section sits in the page (as a fraction of scrollable
   height); the dye front follows scroll; the band the front has passed is active. */
const gel = document.querySelector('.gel');
if (gel) {
  const front = gel.querySelector('.gel__front');
  const bands = [...gel.querySelectorAll('.gel__band')];
  const targets = bands.map((b) => document.querySelector(b.getAttribute('href')));
  const TOP = 14;                        // just under the well
  const BOTTOM = gel.offsetHeight - 8;   // above the lane's bottom edge
  let positions = [];
  let ticking = false;

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const toPx = (p) => TOP + p * (BOTTOM - TOP);

  function layout() {
    const max = maxScroll();
    if (max < 200) { gel.hidden = true; return; }
    gel.hidden = false;
    positions = targets.map((t) => {
      if (!t) return 0;
      const top = t.getBoundingClientRect().top + window.scrollY;
      return Math.min(1, Math.max(0, top / max));
    });
    bands.forEach((b, i) => { b.style.top = `${toPx(positions[i])}px`; });
    update();
  }

  function update() {
    const max = maxScroll();
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    front.style.top = `${toPx(p)}px`;
    let active = 0;
    positions.forEach((pos, i) => { if (p + 0.02 >= pos) active = i; });
    if (p >= 0.98) active = bands.length - 1;
    bands.forEach((b, i) => b.classList.toggle('is-active', i === active));
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  layout();
}

/* ---------- Dot glow follows the cursor ----------
   The red hotspot in the dot grid eases toward the pointer. Mouse/trackpad only;
   on touch devices it stays centred. */
const glow = document.querySelector('.dots__glow');
if (glow && window.matchMedia('(pointer: fine)').matches) {
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty, raf = 0;
  const apply = () => { glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; };
  const step = () => {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    apply();
    raf = (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) ? requestAnimationFrame(step) : 0;
  };
  apply();
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (reduce) { cx = tx; cy = ty; apply(); return; }
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });
}
