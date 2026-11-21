/* Carrusel: pasa las imágenes una por una, en bucle.
   Uso: <div class="slider" data-slider [data-controls]><div class="slider-track"><img>…</div></div>
   - data-controls agrega flechas y contador debajo.
   - Se pausa al pasar el mouse, cuando no está en pantalla y si el usuario pide menos movimiento. */
(function () {
  var DELAY = 2600;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-slider]').forEach(function (el) {
    var track = el.querySelector('.slider-track');
    var items = Array.prototype.slice.call(track.children);
    var n = items.length;
    if (n < 2) return;
    items.forEach(function (it) {
      var c = it.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.alt = '';
      track.appendChild(c);
    });
    var index = 0, timer = null, hovered = false, visible = true, count = null;

    function step() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return items[0].getBoundingClientRect().width + gap;
    }
    function place(animate) {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = 'translate3d(' + (-index * step()) + 'px,0,0)';
      if (!animate) { track.offsetWidth; track.style.transition = ''; }
      if (count) count.textContent = String((index % n) + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    }
    function go(dir) {
      if (dir < 0 && index === 0) { index = n; place(false); }
      index += dir;
      place(true);
    }
    track.addEventListener('transitionend', function (e) {
      if (e.target !== track) return;
      if (index >= n) { index -= n; place(false); }
    });

    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (reduce || hovered || !visible) return;
      timer = setInterval(function () { go(1); }, DELAY);
    }

    if (el.hasAttribute('data-controls')) {
      var bar = document.createElement('div');
      bar.className = 'slider-ctrl';
      bar.innerHTML =
        '<button type="button" class="slider-btn" aria-label="Imagen anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 12H7M11.5 7.5 7 12l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<span class="slider-count" aria-live="polite"></span>' +
        '<button type="button" class="slider-btn" aria-label="Imagen siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12h10M12.5 7.5 17 12l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
      el.after(bar);
      count = bar.querySelector('.slider-count');
      var btns = bar.querySelectorAll('.slider-btn');
      btns[0].addEventListener('click', function () { go(-1); start(); });
      btns[1].addEventListener('click', function () { go(1); start(); });
    }

    el.addEventListener('mouseenter', function () { hovered = true; stop(); });
    el.addEventListener('mouseleave', function () { hovered = false; start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }).observe(el);
    }
    window.addEventListener('resize', function () { place(false); });
    place(false);
    start();
  });
})();
