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

/* ---------- Micropipette titration ----------
   The pipette rests beside the toggle. Move the pointer into the toggle area and it
   becomes the cursor (tip at the pointer). Click the other option: the plunger goes
   down, a drop falls, and a wash of the new colour spreads from the landing point
   over the whole screen (phenolphthalein: clear -> pink or back). Then the page follows. */
const mode = document.querySelector('.mode');
const pipette = document.querySelector('.pipette');
const wash = document.querySelector('.wash');
if (mode && pipette && wash) {
  const pill = mode.querySelector('.mode__pill');
  const fine = window.matchMedia('(pointer: fine)').matches;
  let following = false;

  // Where the tip sits inside the rendered SVG (viewBox 28x80, tip at 14,76).
  const tipOffset = () => {
    const r = pipette.getBoundingClientRect();
    return { x: r.width * 14 / 28, y: r.height * 76 / 80 };
  };
  // Put the tip at (x, y), measured from .mode's top-left corner.
  const place = (x, y) => {
    const t = tipOffset();
    pipette.style.transform = `translate(${x - t.x}px, ${y - t.y}px)`;
  };
  const rest = () => {
    const m = mode.getBoundingClientRect();
    const p = pill.getBoundingClientRect();
    place(p.left - m.left - 16, p.top - m.top + p.height / 2);
  };
  rest();
  window.addEventListener('resize', rest);
  window.addEventListener('load', rest);

  if (fine && !reduce) {
    mode.addEventListener('pointerenter', () => {
      if (mode.classList.contains('is-titrating')) return;
      following = true;
      mode.classList.add('has-pointer');
      pipette.classList.add('is-following');
    });
    mode.addEventListener('pointermove', (e) => {
      if (!following) return;
      const m = mode.getBoundingClientRect();
      place(e.clientX - m.left, e.clientY - m.top);
    });
    mode.addEventListener('pointerleave', () => {
      following = false;
      mode.classList.remove('has-pointer');
      pipette.classList.remove('is-following');
      if (!mode.classList.contains('is-titrating')) rest();
    });
  }

  mode.querySelectorAll('.mode__btn:not(.is-active)').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // Modified / middle clicks and reduced motion: behave like a normal link.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || reduce) return;
      e.preventDefault();
      if (mode.classList.contains('is-titrating')) return;
      mode.classList.add('is-titrating');

      // Freeze the pipette where it is and dispense.
      following = false;
      pipette.classList.remove('is-following');
      pipette.classList.add('is-dispensing');

      // The drop lands just below the tip (viewport coords).
      const r = pipette.getBoundingClientRect();
      const t = tipOffset();
      const x = r.left + t.x;
      const y = r.top + t.y + 16;

      setTimeout(() => {
        wash.style.left = `${x}px`;
        wash.style.top = `${y}px`;
        // scale a 10px circle until it covers the far corner of the viewport
        const scale = (2 * Math.hypot(window.innerWidth, window.innerHeight)) / 10;
        wash.getBoundingClientRect(); // flush position before transitioning
        wash.classList.add('is-active');
        wash.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }, 360);
      setTimeout(() => { window.location.href = btn.href; }, 1100);
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
