// Servicios en pestañas: arriba los 4 nombres, abajo se abre la descripción
// del que elijas. Los botones lila del inicio abren directo su pestaña.
// Sin JavaScript se ven los 4 servicios completos, uno debajo del otro.
(() => {
  const wrap = document.querySelector('.services');
  if (!wrap) return;
  const panels = [...wrap.querySelectorAll('.service')];
  const section = wrap.closest('section');

  const list = document.createElement('div');
  list.className = 'svc-tabs'; list.setAttribute('role', 'tablist'); list.setAttribute('aria-label', 'Servicios');
  const tabs = panels.map((p, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'svc-tab'; b.id = `tab-${p.id}`;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', p.id);
    b.innerHTML = `<span class="num">${p.querySelector('.num').textContent}</span><span class="svc-tab-name">${p.querySelector('h3').textContent}</span>`;
    p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', b.id); p.tabIndex = 0;
    b.addEventListener('click', () => select(i));
    b.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); const n = (i + d + panels.length) % panels.length; select(n); tabs[n].focus(); }
      if (e.key === 'Home') { e.preventDefault(); select(0); tabs[0].focus(); }
      if (e.key === 'End') { e.preventDefault(); select(panels.length - 1); tabs[panels.length - 1].focus(); }
    });
    list.append(b); return b;
  });
  wrap.before(list);
  wrap.classList.add('is-tabs');

  function select(i) {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
    panels.forEach((p, j) => { p.hidden = j !== i; });
  }

  const byHash = (h) => panels.findIndex((p) => '#' + p.id === h);
  // Links a un servicio (por ejemplo, los botones lila del inicio): abren su pestaña
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const i = byHash(a.getAttribute('href'));
    if (i < 0) return;
    e.preventDefault(); select(i);
    section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  });
  const start = byHash(location.hash);
  select(start < 0 ? 0 : start);
  if (start >= 0) section.scrollIntoView();
})();
