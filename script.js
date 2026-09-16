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

/* ---------- Micropipette ----------
   Rests beside the toggle. Move the pointer into the toggle area and it becomes the
   cursor (tip at the pointer); leave and it glides back. The Pro/Per links navigate
   normally; the view transition cross-fades the theme. */
const mode = document.querySelector('.mode');
const pipette = document.querySelector('.pipette');
if (mode && pipette) {
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
      rest();
    });
  }
}

/* ---------- Gel-electrophoresis scroll nav ----------
   Bands sit at fixed ladder positions (CSS --p). The dye front moves with scroll
   progress; the marker band for the section currently in view is active. */
const gel = document.querySelector('.gel');
if (gel) {
  const front = gel.querySelector('.gel__front');
  const markers = [...gel.querySelectorAll('.gel__band.is-marker')];
  const targets = markers.map((m) => document.querySelector(m.getAttribute('href')));
  const TOP = 6;                       // lane inset, matches the CSS
  const BOTTOM = gel.offsetHeight - 6;
  let tops = [];
  let ticking = false;

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  function layout() {
    const max = maxScroll();
    if (max < 200) { gel.hidden = true; return; }
    gel.hidden = false;
    tops = targets.map((t) => (t ? t.getBoundingClientRect().top + window.scrollY : 0));
    update();
  }

  function update() {
    const max = maxScroll();
    const y = window.scrollY;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    front.style.top = `${TOP + p * (BOTTOM - TOP)}px`;

    // a section is "current" once its top has reached the upper third of the viewport
    const probe = y + window.innerHeight * 0.35;
    let active = 0;
    tops.forEach((top, i) => { if (top <= probe) active = i; });
    if (max > 0 && y >= max - 2) active = markers.length - 1;
    markers.forEach((m, i) => m.classList.toggle('is-active', i === active));
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
