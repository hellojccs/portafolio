// Menú en píldora con efecto "spotlight".
// La píldora naranja viaja con "resortes" hasta la sección activa: el borde de
// adelante va más rápido, así que se estira y luego se acomoda. El haz de luz
// la sigue con un poco de retraso, se hace delgado mientras se mueve y se
// abre de nuevo (con un destello) cuando llega.
(() => {
  const root = document.querySelector('[data-pillnav]');
  if (!root) return;
  const tabsBox = root.querySelector('[data-tabs]');
  const tabs = [...root.querySelectorAll('.tab')];
  const pill = root.querySelector('[data-active]');
  const hover = root.querySelector('[data-hover]');
  const beam = root.querySelector('[data-beam]');
  const floor = root.querySelector('[data-floor]');
  const rim = root.querySelector('[data-rimlight]');
  const bar = root.querySelector('.bar');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let active = 0, hovered = -1, clickLock = 0;
  const geo = (i) => ({ x: tabs[i].offsetLeft, w: tabs[i].offsetWidth });

  // Estado de la animación (en px dentro de la barra de pestañas)
  const g0 = geo(0);
  const L = { x: g0.x, v: 0, k: 300 }, R = { x: g0.x + g0.w, v: 0, k: 300 };
  const H = { l: g0.x, r: g0.x + g0.w, vl: 0, vr: 0, o: 0, vo: 0 };
  let beamX = g0.x + g0.w / 2, tilt = 0, focus = 1, vf = 0, pulse = 0, armed = false, last = 0;

  const setActive = (i) => {
    if (i === active) return;
    const dir = i > active ? 1 : -1;
    active = i;
    tabs.forEach((t, j) => { t.classList.toggle('is-active', j === i); j === i ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current'); });
    L.lead = dir < 0; R.lead = dir > 0;
  };
  tabs[0].classList.add('is-active');

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { setActive(i); clickLock = performance.now() + 900; });
    t.addEventListener('pointerenter', () => { hovered = i; });
    t.addEventListener('pointerleave', () => { if (hovered === i) hovered = -1; });
  });

  // La sección que se ve en pantalla enciende su pestaña
  const sections = tabs.map((t) => document.querySelector(t.getAttribute('href')));
  const spy = () => {
    if (performance.now() < clickLock) return;
    const y = innerHeight * 0.35;
    let idx = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= y) idx = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) idx = sections.length - 1;
    setActive(idx);
  };
  addEventListener('scroll', spy, { passive: true });
  spy();

  const spring = (s, target, dt) => {
    const c = 2 * Math.sqrt(s.k);
    s.v += (-s.k * (s.x - target) - c * s.v) * dt;
    s.x += s.v * dt;
  };

  const frame = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 0.04) : 1 / 60;
    last = now;
    const T = now / 1000;
    const t = geo(active);

    if (still) {
      L.x = t.x; R.x = t.x + t.w; L.v = R.v = 0;
    } else {
      L.k += ((L.lead ? 230 : 150) - L.k) * Math.min(1, dt * 6);
      R.k += ((R.lead ? 230 : 150) - R.k) * Math.min(1, dt * 6);
      spring(L, t.x, dt);
      spring(R, t.x + t.w, dt);
    }
    const w = Math.max(0, R.x - L.x), cx = L.x + w / 2;
    pill.style.transform = `translateX(${L.x}px)`;
    pill.style.width = `${w}px`;

    // Píldora de "hover"
    const showHover = hovered >= 0 && hovered !== active;
    if (showHover) {
      const h = geo(hovered);
      H.vl += (-420 * (H.l - h.x) - 36 * H.vl) * dt; H.l += H.vl * dt;
      H.vr += (-420 * (H.r - (h.x + h.w)) - 36 * H.vr) * dt; H.r += H.vr * dt;
    }
    H.vo += (-200 * (H.o - (showHover ? 1 : 0)) - 26 * H.vo) * dt; H.o += H.vo * dt;
    hover.style.transform = `translateX(${H.l}px)`;
    hover.style.width = `${Math.max(0, H.r - H.l)}px`;
    hover.style.opacity = Math.max(0, Math.min(1, H.o)).toFixed(3);

    // Enfoque del haz: delgado mientras viaja, se abre al llegar
    const speed = Math.abs(L.v) + Math.abs(R.v);
    vf += (-90 * (focus - (speed > 35 ? 0.12 : 1)) - 17 * vf) * dt;
    focus = Math.max(0, Math.min(1.25, focus + vf * dt));
    if (focus < 0.4) armed = true;
    if (armed && focus > 0.75) { pulse = 1; armed = false; }
    pulse *= Math.pow(0.12, dt);
    const f = Math.min(1, focus);

    // El haz sigue a la píldora con un poco de retraso y se inclina
    beamX += (cx - beamX) * Math.min(1, dt * 9);
    const lean = Math.max(-10, Math.min(10, (cx - beamX) * -0.05));
    tilt += (lean - tilt) * Math.min(1, dt * 6);

    // Posiciones en el espacio del menú completo
    const off = tabsBox.offsetLeft;
    const foot = 14 + (w * 0.95 - 14) * f;
    const breathe = 0.85 + 0.15 * Math.sin(T * 1.7);
    beam.style.width = `${foot}px`;
    beam.style.transform = `translateX(${off + beamX - foot / 2}px) skewX(${tilt.toFixed(2)}deg)`;
    beam.style.setProperty('--top', `${(2 + 3 * f).toFixed(1)}px`);
    beam.style.opacity = ((0.45 + 0.55 * f) * breathe + 0.25 * pulse).toFixed(3);

    const fw = w * 1.2;
    floor.style.width = `${fw}px`;
    floor.style.transform = `translateX(${off + beamX - fw / 2}px)`;
    floor.style.opacity = (0.45 + 0.35 * f + 0.5 * pulse).toFixed(3);

    const rw = w * (0.3 + 0.6 * f);
    rim.style.width = `${rw}px`;
    rim.style.transform = `translateX(${off - bar.clientLeft + beamX - rw / 2}px)`;
    rim.style.opacity = (0.35 + 0.65 * f).toFixed(3);

    requestAnimationFrame(frame);
  };

  const start = () => requestAnimationFrame(frame);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start, start);
})();
