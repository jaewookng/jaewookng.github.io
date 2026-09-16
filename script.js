// Progressive enhancement. If JS doesn't run: everything is visible, the toggle is a plain link,
// and the gel nav is a plain list of anchor links.
document.documentElement.classList.add('js');

// The Pro/Per links carry a cache-busting ?v= so a switch always fetches a fresh page.
// Once loaded, drop it from the address bar.
if (/[?&]v=/.test(window.location.search)) {
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.hash);
}

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
   Rests beside the toggle. Move the pointer onto the station and the hand cursor picks
   the pipette up by its body; while it's held, clicks register where the TIP is, not
   where the hand is (the button under the tip is highlighted so you can aim). Leave and
   it glides back. When you switch pages while holding it, the position is handed to the
   next page so the pipette doesn't jump. */
const mode = document.querySelector('.mode');
const pipette = document.querySelector('.pipette');
if (mode && pipette) {
  const pill = mode.querySelector('.mode__pill');
  const buttons = [...mode.querySelectorAll('.mode__btn')];
  const fine = window.matchMedia('(pointer: fine)').matches;
  const KEY = 'pipette';
  let following = false;
  let last = null;   // last grip point, relative to the station

  // Points on the pipette (viewBox 28x80): the tip, and where the hand grips the body.
  const TIP = [14, 76];
  const GRIP = [14, 34];
  const placeAt = (x, y, [ax, ay]) => {
    const r = pipette.getBoundingClientRect();
    pipette.style.transform = `translate(${x - r.width * ax / 28}px, ${y - r.height * ay / 80}px)`;
  };
  const rest = () => {
    const m = mode.getBoundingClientRect();
    const p = pill.getBoundingClientRect();
    placeAt(p.left - m.left - 16, p.top - m.top + p.height / 2, TIP);
  };

  // The button under the tip (viewport coords), if any.
  const buttonAtTip = () => {
    const r = pipette.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width * TIP[0] / 28, r.top + r.height * TIP[1] / 80);
    return el ? el.closest('.mode__btn') : null;
  };
  const setHot = (btn) => buttons.forEach((b) => b.classList.toggle('is-hot', b === btn));

  const hold = () => {
    following = true;
    mode.classList.add('is-holding');
    pipette.classList.add('is-following');
  };
  const release = () => {
    following = false;
    mode.classList.remove('is-holding');
    pipette.classList.remove('is-following');
    setHot(null);
    rest();
  };

  // Is this viewport point over the station? (geometry, so it works even right after a
  // navigation when the browser hasn't re-hit-tested the fresh page yet)
  const overStation = (x, y) => {
    const m = mode.getBoundingClientRect();
    return x >= m.left && x <= m.right && y >= m.top && y <= m.bottom;
  };

  // Did the previous page hand us a held pipette?
  let saved = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
  } catch (err) { saved = null; }

  if (fine && !reduce && saved && Date.now() - saved.t < 5000) {
    hold();
    last = { x: saved.x, y: saved.y };
    placeAt(last.x, last.y, GRIP);
    setHot(buttonAtTip());
  } else {
    rest();
  }
  window.addEventListener('resize', () => { if (!following) rest(); });
  window.addEventListener('load', () => { if (!following) rest(); });

  if (fine && !reduce) {
    // Holding is decided by where the pointer is on every move, not by enter/leave events
    // (those are missed when the pointer is already over the station as a page loads).
    document.addEventListener('pointermove', (e) => {
      const inside = overStation(e.clientX, e.clientY);
      if (inside && !following) hold();
      if (!inside) { if (following) release(); return; }
      const m = mode.getBoundingClientRect();
      last = { x: e.clientX - m.left, y: e.clientY - m.top };
      placeAt(last.x, last.y, GRIP);
      setHot(buttonAtTip());
    }, { passive: true });
    document.addEventListener('pointerleave', () => { if (following) release(); });

    // While holding: the click happens at the tip.
    mode.addEventListener('click', (e) => {
      if (!following || e.detail === 0) return;                       // keyboard: leave it alone
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      const btn = buttonAtTip();
      if (btn && !btn.classList.contains('is-active')) {
        if (last) {
          try { sessionStorage.setItem(KEY, JSON.stringify({ x: last.x, y: last.y, t: Date.now() })); } catch (err) { /* private mode */ }
        }
        window.location.href = btn.href;
      }
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
