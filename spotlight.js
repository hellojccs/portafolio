// Efecto spotlight en el menú: la píldora naranja viaja con "resortes" hasta
// la sección que estás viendo (el borde de adelante va más rápido, así que se
// estira y se acomoda). El haz de luz la sigue con un poco de retraso, se
// adelgaza mientras viaja y se abre con un destello al llegar.
(() => {
  const nav = document.querySelector('[data-nav]');
  const box = nav && nav.querySelector('[data-tabs]');
  if (!box) return;
  const tabs = [...box.querySelectorAll('.tab')];
  const pill = box.querySelector('[data-active]');
  const hover = box.querySelector('[data-hover]');
  const beam = nav.querySelector('[data-beam]');
  const floor = nav.querySelector('[data-floor]');
  const rim = nav.querySelector('[data-rimlight]');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let active = -1, hovered = -1, lock = 0, last = 0;
  const geo = (i) => ({ x: tabs[i].offsetLeft, w: tabs[i].offsetWidth });
  const L = { x: 0, v: 0, k: 300 }, R = { x: 0, v: 0, k: 300 };
  const H = { l: 0, r: 0, vl: 0, vr: 0, o: 0, vo: 0 };
  let show = 0, beamX = 0, tilt = 0, focus = 1, vf = 0, pulse = 0, armed = false;

  const setActive = (i) => {
    if (i === active) return;
    const prev = active;
    active = i;
    tabs.forEach((t, j) => {
      t.classList.toggle('is-active', j === i);
      j === i ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current');
    });
    if (i < 0) return;
    if (prev < 0) {            // aparece en su lugar, sin viajar desde la nada
      const g = geo(i);
      L.x = g.x; R.x = g.x + g.w; L.v = R.v = 0; beamX = g.x + g.w / 2;
      return;
    }
    L.lead = i < prev; R.lead = i > prev;
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { setActive(i); lock = performance.now() + 900; });
    t.addEventListener('pointerenter', () => { hovered = i; });
    t.addEventListener('pointerleave', () => { if (hovered === i) hovered = -1; });
  });

  // La sección que está en pantalla enciende su pestaña (en la portada, ninguna)
  const sections = tabs.map((t) => document.querySelector(t.getAttribute('href')));
  const spy = () => {
    if (performance.now() < lock) return;
    const y = innerHeight * 0.35;
    let idx = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= y) idx = i; });
    const contact = document.querySelector('#contacto');
    if (contact && contact.getBoundingClientRect().top <= y) idx = -1;   // en Contacto no hay pestaña
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
    const visible = box.offsetParent !== null;   // en celular el menú usa el glass menu

    if (visible) {
      show += ((active >= 0 ? 1 : 0) - show) * Math.min(1, dt * 8);
      if (active >= 0) {
        const t = geo(active);
        if (still) { L.x = t.x; R.x = t.x + t.w; L.v = R.v = 0; }
        else {
          L.k += ((L.lead ? 230 : 150) - L.k) * Math.min(1, dt * 6);
          R.k += ((R.lead ? 230 : 150) - R.k) * Math.min(1, dt * 6);
          spring(L, t.x, dt); spring(R, t.x + t.w, dt);
        }
      }
      const w = Math.max(0, R.x - L.x), cx = L.x + w / 2;
      // Las letras se encienden cuando la píldora pasa por encima
      tabs.forEach((t, i) => {
        const g = geo(i), cover = 1 - Math.abs(g.x + g.w / 2 - cx) / (0.7 * g.w);
        t.classList.toggle('is-lit', show > 0.3 && cover > 0.15);
      });
      pill.style.transform = `translateX(${L.x.toFixed(1)}px)`;
      pill.style.width = `${w.toFixed(1)}px`;
      pill.style.opacity = show.toFixed(3);

      // Píldora de "hover" (negra con borde, como el CTA negro)
      const showHover = hovered >= 0 && hovered !== active;
      if (showHover) {
        const h = geo(hovered);
        if (H.o < 0.02) { H.l = h.x; H.r = h.x + h.w; }
        H.vl += (-420 * (H.l - h.x) - 36 * H.vl) * dt; H.l += H.vl * dt;
        H.vr += (-420 * (H.r - (h.x + h.w)) - 36 * H.vr) * dt; H.r += H.vr * dt;
      }
      H.vo += (-200 * (H.o - (showHover ? 1 : 0)) - 26 * H.vo) * dt; H.o += H.vo * dt;
      hover.style.transform = `translateX(${H.l.toFixed(1)}px)`;
      hover.style.width = `${Math.max(0, H.r - H.l).toFixed(1)}px`;
      hover.style.opacity = Math.max(0, Math.min(1, H.o)).toFixed(3);

      // El haz: delgado mientras la píldora viaja, se abre con un destello al llegar
      const speed = Math.abs(L.v) + Math.abs(R.v);
      vf += (-90 * (focus - (speed > 35 ? 0.12 : 1)) - 17 * vf) * dt;
      focus = Math.max(0, Math.min(1.25, focus + vf * dt));
      if (focus < 0.4) armed = true;
      if (armed && focus > 0.75) { pulse = 1; armed = false; }
      pulse *= Math.pow(0.12, dt);
      const f = Math.min(1, focus);

      beamX += (cx - beamX) * Math.min(1, dt * 9);
      const lean = Math.max(-10, Math.min(10, (cx - beamX) * -0.05));
      tilt += (lean - tilt) * Math.min(1, dt * 6);

      const off = box.offsetLeft;
      const foot = 14 + (w * 0.95 - 14) * f;
      const breathe = 0.85 + 0.15 * Math.sin(T * 1.7);
      beam.style.width = `${foot.toFixed(1)}px`;
      beam.style.transform = `translateX(${(off + beamX - foot / 2).toFixed(1)}px) skewX(${tilt.toFixed(2)}deg)`;
      beam.style.setProperty('--top', `${(2 + 3 * f).toFixed(1)}px`);
      beam.style.opacity = (((0.45 + 0.55 * f) * breathe + 0.25 * pulse) * show).toFixed(3);

      const fw = w * 1.2;
      floor.style.width = `${fw.toFixed(1)}px`;
      floor.style.transform = `translateX(${(off + beamX - fw / 2).toFixed(1)}px)`;
      floor.style.opacity = ((0.45 + 0.35 * f + 0.5 * pulse) * show).toFixed(3);

      const rw = w * (0.3 + 0.6 * f);
      rim.style.width = `${rw.toFixed(1)}px`;
      rim.style.transform = `translateX(${(off + beamX - rw / 2).toFixed(1)}px)`;
      rim.style.opacity = ((0.35 + 0.65 * f) * show).toFixed(3);
    } else {
      beam.style.opacity = floor.style.opacity = rim.style.opacity = '0';
    }
    requestAnimationFrame(frame);
  };

  const start = () => requestAnimationFrame(frame);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start, start);
})();
