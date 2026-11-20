// "Word Stagger" (Text Motion Studio): las palabras del título suben una por una.
// Ajustes: 0.9 s por palabra, 0.1 s de espera, 0.08 s entre palabras (desde la
// primera), curva power4.out, sube 0.4em, empieza transparente, gira desde abajo.
(() => {
  const EASE = 'linear(0, 0.0999, 0.1917, 0.2758, 0.3528, 0.4231, 0.4871, 0.5453, 0.5981, 0.6459, 0.689, 0.7279, 0.7627, 0.7939, 0.8217, 0.8464, 0.8683, 0.8876, 0.9046, 0.9195, 0.9325, 0.9437, 0.9534, 0.9617, 0.9688, 0.9747, 0.9798, 0.984, 0.9874, 0.9903, 0.9926, 0.9944, 0.9959, 0.997, 0.9979, 0.9985, 0.999, 0.9994, 0.9996, 0.9998, 0.9999, 0.9999, 1, 1, 1, 1, 1, 1, 1)';
  const S = { duration: 900, delay: 100, stagger: 80, distance: '0.4em' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const run = (el) => {
    const text = el.textContent.trim();
    // Copia accesible (la lee el lector de pantalla) + copia animada (oculta para él)
    const sr = document.createElement('span'); sr.className = 'tm-sr'; sr.textContent = text;
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    const words = text.split(/\s+/).map((w, i) => {
      if (i) vis.append(' ');
      const s = document.createElement('span'); s.className = 'tm-word'; s.textContent = w;
      vis.append(s); return s;
    });
    el.replaceChildren(sr, vis);
    el.classList.add('tm-ready');

    if (!words[0].animate) return;
    if (reduce.matches) {                 // sin movimiento: solo aparece
      vis.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'backwards' });
      return;
    }
    words.forEach((w, i) => w.animate(
      [{ transform: `translateY(${S.distance})`, opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: S.duration, delay: S.delay + i * S.stagger, easing: EASE, fill: 'backwards' }
    ));
  };

  const els = document.querySelectorAll('[data-text-motion]');
  if (!els.length) return;
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const timeout = new Promise((r) => setTimeout(r, 2500));   // por si la fuente tarda demasiado
  Promise.race([fonts, timeout]).then(() => els.forEach(run), () => els.forEach(run));
})();
