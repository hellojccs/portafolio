// Glass menu: el botón de tres líneas se abre como una placa oscura.
// Todo se anima con un solo valor de progreso (0 = botón, 1 = placa abierta),
// y una lupa ámbar se desliza con un resorte hasta la sección elegida.
(() => {
  const burger = document.querySelector('[data-burger]');
  const gm = document.querySelector('[data-gm]');
  if (!burger || !gm) return;
  const sheet = gm.querySelector('[data-gm-sheet]');
  const backdrop = gm.querySelector('.gm-backdrop');
  const closeBtn = gm.querySelector('.gm-close');
  const items = [...gm.querySelectorAll('.gm-item')];
  const lens = gm.querySelector('[data-gm-lens]');
  const lensNum = gm.querySelector('[data-gm-lens-num]');
  const led = gm.querySelector('[data-gm-led]');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const OPEN_MS = still ? 0 : 1100, CLOSE_MS = still ? 0 : 850;
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  const easeIO = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

  let state = 'closed', raf = 0, active = 0;
  let lensY = 0, lensV = 0, lensTarget = 0, lensRaf = 0;

  // Qué sección se está viendo ahora
  const currentSection = () => {
    let idx = 0;
    items.forEach((a, i) => { const s = document.querySelector(a.getAttribute('href')); if (s && s.getBoundingClientRect().top <= innerHeight * .4) idx = i; });
    return idx;
  };
  const rowY = (i) => items[i].offsetTop + sheet.querySelector('.gm-items').offsetTop + items[i].offsetHeight / 2;

  const setActive = (i) => {
    active = i;
    items.forEach((a, j) => a.classList.toggle('is-active', j === i));
    lensNum.textContent = items[i].querySelector('.gm-num').textContent;
    lensTarget = rowY(i);
  };

  // Dibuja un instante de la animación de abrir/cerrar.
  // p: progreso 0 → 1. from: el botón en pantalla. end: la placa abierta.
  const lerp = (x, y, t) => x + (y - x) * t;
  const render = (p, from, end) => {
    // 1) la placa crece desde el botón, sin rebote (0 → .75)
    const g = easeOut(seg(p, 0, .75));
    const sx = lerp(from.width / end.w, 1, g), sy = lerp(from.height / end.h, 1, g);
    const dx = (from.left + from.width / 2) - (end.x + end.w / 2);
    const dy = (from.top + from.height / 2) - (end.y + end.h / 2);
    sheet.style.transform = `translate(calc(-50% + ${(dx * (1 - g)).toFixed(1)}px), calc(-50% + ${(dy * (1 - g)).toFixed(1)}px)) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    sheet.style.borderRadius = `${lerp(end.w / 2, 36, g).toFixed(1)}px / ${lerp(end.h / 2, 36, g).toFixed(1)}px`;
    backdrop.style.opacity = seg(p, 0, .5).toFixed(3);
    // 2) las líneas del botón se vuelven las bisagras entre filas; aparece la tapa de cerrar (.35 → .75)
    const h = easeIO(seg(p, .35, .75));
    sheet.style.setProperty('--hinge', h.toFixed(3));
    closeBtn.style.transform = `scale(${(.4 + .6 * h).toFixed(3)}) rotate(${(-90 + 90 * h).toFixed(1)}deg)`;
    closeBtn.style.opacity = h.toFixed(3);
    // 3) las opciones suben una por una desde un desenfoque (.45 → .99)
    items.forEach((a, i) => {
      const k = easeOut(seg(p, .45 + i * .08, .75 + i * .08));
      a.style.opacity = k.toFixed(3);
      a.style.transform = `translateY(${((1 - k) * 18).toFixed(1)}px)`;
      a.style.filter = k < 1 ? `blur(${((1 - k) * 8).toFixed(1)}px)` : '';
    });
    // 4) la lupa y el LED aparecen al final (.85 → 1)
    const l = easeOut(seg(p, .85, 1));
    lens.style.opacity = led.style.opacity = l.toFixed(3);
    lens.style.transform = `translateY(${lensY - 28}px) scale(${(.5 + .5 * l).toFixed(3)})`;
    led.style.transform = `translateY(${lensY - 4}px)`;
  };

  // Medidas de la placa abierta (sin transformar)
  const measure = () => {
    sheet.style.transform = 'translate(-50%, -50%)';
    const r = sheet.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  };

  const run = (opening, ms, done) => {
    cancelAnimationFrame(raf);
    const from = burger.getBoundingClientRect();
    const end = measure();
    const t0 = performance.now();
    const tick = (now) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      render(opening ? t : 1 - t, from, end);
      if (t < 1) raf = requestAnimationFrame(tick); else if (done) done();
    };
    tick(t0);
  };

  // Resorte de la lupa: se estira con la velocidad y se asienta redonda
  const lensLoop = () => {
    const dt = 1 / 60, k = 170, c = 2 * Math.sqrt(k) * .85;
    lensV += (-k * (lensY - lensTarget) - c * lensV) * dt;
    lensY += lensV * dt;
    const speed = Math.min(1, Math.abs(lensV) / 900);
    lens.style.transform = `translateY(${lensY - 28}px) scale(${(1 - .12 * speed).toFixed(3)}, ${(1 - .12 * speed + .35 * speed).toFixed(3)})`;
    led.style.transform = `translateY(${lensY - 4}px)`;
    if (Math.abs(lensV) > 2 || Math.abs(lensY - lensTarget) > .5) lensRaf = requestAnimationFrame(lensLoop);
    else { lensY = lensTarget; lens.style.transform = `translateY(${lensY - 28}px)`; led.style.transform = `translateY(${lensY - 4}px)`; }
  };
  const glideTo = (i) => {
    setActive(i);
    cancelAnimationFrame(lensRaf);
    if (still) { lensY = lensTarget; lensLoop(); } else lensRaf = requestAnimationFrame(lensLoop);
  };

  const open = () => {
    if (state !== 'closed') return;
    state = 'opening';
    gm.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setActive(currentSection());
    lensY = lensTarget; lensV = 0;
    run(true, OPEN_MS, () => { state = 'open'; items[active].focus({ preventScroll: true }); });
  };
  const close = (after) => {
    if (state !== 'open' && state !== 'opening') return;
    state = 'closing';
    cancelAnimationFrame(lensRaf);
    run(false, CLOSE_MS, () => {
      state = 'closed'; gm.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus({ preventScroll: true });
      after && after();
    });
  };

  burger.addEventListener('click', open);
  gm.querySelectorAll('[data-gm-close]').forEach((el) => el.addEventListener('click', () => close()));
  addEventListener('keydown', (e) => {
    if (state === 'closed') return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const i = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      glideTo(i); items[i].focus({ preventScroll: true });
    }
  });
  items.forEach((a, i) => {
    a.addEventListener('pointerenter', () => { if (state === 'open') glideTo(i); });
    a.addEventListener('click', (e) => {
      e.preventDefault();
      glideTo(i);
      const target = document.querySelector(a.getAttribute('href'));
      setTimeout(() => close(() => target && target.scrollIntoView({ behavior: still ? 'auto' : 'smooth' })), still ? 0 : 380);
    });
  });
})();
