/* Visor de presentación (Brand Guidelines).
   Uso: <section data-deck data-count="30" data-src="…g-{n}.webp" data-thumb="…t-{n}.webp">
   Flechas, teclado (← →), deslizar en celular, capítulos, miniaturas y pantalla completa. */
(function () {
  document.querySelectorAll('[data-deck]').forEach(function (deck) {
    var total = +deck.dataset.count;
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var src = function (n) { return deck.dataset.src.replace('{n}', pad(n)); };
    var thumb = function (n) { return deck.dataset.thumb.replace('{n}', pad(n)); };
    var stage = deck.querySelector('.deck-stage');
    var img = deck.querySelector('.deck-img');
    var count = deck.querySelector('.deck-count');
    var strip = deck.querySelector('.deck-thumbs');
    var chapters = Array.prototype.slice.call(deck.querySelectorAll('[data-go]'));
    var page = 1;

    for (var i = 1; i <= total; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'deck-thumb';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Página ' + i);
      b.dataset.page = i;
      b.innerHTML = '<img src="' + thumb(i) + '" alt="" loading="lazy" width="320" height="180">';
      strip.appendChild(b);
    }
    var thumbs = strip.querySelectorAll('.deck-thumb');

    function preload(n) { if (n >= 1 && n <= total) { var im = new Image(); im.src = src(n); } }

    function show(n) {
      page = Math.max(1, Math.min(total, n));
      img.classList.add('is-swap');
      var next = new Image();
      next.onload = next.onerror = function () {
        img.src = src(page);
        img.alt = 'Brand Guidelines de Holy, página ' + page + ' de ' + total;
        requestAnimationFrame(function () { img.classList.remove('is-swap'); });
      };
      next.src = src(page);
      count.textContent = pad(page) + ' / ' + pad(total);
      thumbs.forEach(function (t, k) {
        var on = k + 1 === page;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on);
        if (on) strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
      });
      var cur = null;
      chapters.forEach(function (c) { if (+c.dataset.go <= page) cur = c; });
      chapters.forEach(function (c) { c.classList.toggle('is-on', c === cur); });
      preload(page + 1); preload(page - 1);
    }

    deck.querySelector('.deck-prev').addEventListener('click', function () { show(page - 1); });
    deck.querySelector('.deck-next').addEventListener('click', function () { show(page + 1); });
    chapters.forEach(function (c) { c.addEventListener('click', function () { show(+c.dataset.go); }); });
    thumbs.forEach(function (t) { t.addEventListener('click', function () { show(+t.dataset.page); }); });
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show(page + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { show(page - 1); e.preventDefault(); }
    });

    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(page + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    var full = deck.querySelector('.deck-full');
    if (!stage.requestFullscreen) full.hidden = true;
    full.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else stage.requestFullscreen().then(function () { stage.focus(); });
    });

    show(1);
  });
})();
