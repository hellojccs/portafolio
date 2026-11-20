// Parallax suave del fondo del hero: las capas se mueven un poco con el mouse
// para dar sensación de profundidad (solo en computadora).
(() => {
  const hero = document.querySelector('[data-depth]');
  if (!hero || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.06; y += (ty - y) * 0.06;
    hero.style.setProperty('--mx', x.toFixed(3));
    hero.style.setProperty('--my', y.toFixed(3));
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
  };
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!raf) raf = requestAnimationFrame(tick);
  });
  hero.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
})();
