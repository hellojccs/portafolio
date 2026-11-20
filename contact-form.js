// Formulario de Contacto: como la página no tiene servidor, al enviar se abre
// WhatsApp con un mensaje ya escrito con los datos. Solo hay que tocar "Enviar".
(() => {
  const WHATSAPP = '525536771350';   // +52 55 3677 1350
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const msg = form.querySelector('.cform-msg');
  const say = (t) => { msg.textContent = t; };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = Object.fromEntries([...new FormData(form)].map(([k, x]) => [k, String(x).trim()]));
    form.querySelectorAll('input').forEach((i) => i.removeAttribute('aria-invalid'));
    if (!v.nombre) { form.nombre.setAttribute('aria-invalid', 'true'); form.nombre.focus(); return say('Escribe tu nombre.'); }
    if (!v.correo && !v.telefono) { form.correo.setAttribute('aria-invalid', 'true'); form.correo.focus(); return say('Déjame tu correo o tu teléfono para responderte.'); }
    if (v.correo && !form.correo.checkValidity()) { form.correo.setAttribute('aria-invalid', 'true'); form.correo.focus(); return say('Revisa tu correo.'); }
    const lines = [
      `Hola Juan Carlos, soy ${v.nombre}.`,
      v.marca && `Marca: ${v.marca}`,
      v.correo && `Correo: ${v.correo}`,
      v.telefono && `Teléfono: ${v.telefono}`,
      'Me gustaría platicar sobre un proyecto.',
    ].filter(Boolean);
    say('Abriendo WhatsApp…');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();
