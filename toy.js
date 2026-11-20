// Personaje del hero: se inclina suavemente hacia donde está el mouse
// (como si te siguiera con la mirada) y salta para saludar al tocarlo.
(() => {
  const toy = document.querySelector('[data-toy]');
  if (!toy) return;
  const body = toy.querySelector('[data-toy-body]');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Salto al tocarlo
  toy.addEventListener('click', () => {
    toy.classList.remove('is-hop');
    void toy.offsetWidth;            // reinicia la animación
    toy.classList.add('is-hop');
  });
  toy.addEventListener('animationend', (e) => { if (e.animationName === 'toy-hop') toy.classList.remove('is-hop'); });

  if (still || !matchMedia('(pointer: fine)').matches) return;

  // Inclinación hacia el mouse, con suavizado
  let tx = 0, ty = 0, x = 0, y = 0;
  addEventListener('pointermove', (e) => {
    const r = toy.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
    const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
    tx = Math.max(-1, Math.min(1, dx * 2)); ty = Math.max(-1, Math.min(1, dy * 2));
  }, { passive: true });
  document.addEventListener('pointerleave', () => { tx = ty = 0; });
  const loop = () => {
    x += (tx - x) * 0.08; y += (ty - y) * 0.08;
    body.style.transform = `rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) translateX(${(x * 6).toFixed(1)}px)`;
    requestAnimationFrame(loop);
  };
  loop();
})();
