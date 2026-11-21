/* Botón para activar/silenciar el sonido del video de portada del proyecto. */
(function () {
  document.querySelectorAll('[data-sound]').forEach(function (btn) {
    var video = btn.parentElement.querySelector('video');
    if (!video) return;
    btn.addEventListener('click', function () {
      video.muted = !video.muted;
      if (!video.muted) video.play();
      btn.setAttribute('aria-pressed', String(!video.muted));
      btn.textContent = video.muted ? 'Activar sonido' : 'Silenciar';
    });
  });
})();
