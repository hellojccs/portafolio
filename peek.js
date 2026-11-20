// Tu personaje se asoma desde la orilla de abajo cuando ya pasaste la portada
// y dejas de hacer scroll. Se esconde mientras bajas y cuando llegas a Contacto.
(() => {
  const peek = document.querySelector('[data-peek]');
  if (!peek) return;
  const hero = document.querySelector('#inicio');
  const contact = document.querySelector('#contacto');
  const menu = document.querySelector('[data-gm]');
  let timer = 0;

  const canShow = () => {
    const pastHero = hero ? hero.getBoundingClientRect().bottom < innerHeight * 0.4 : scrollY > 400;
    const inContact = contact ? contact.getBoundingClientRect().top < innerHeight * 0.8 : false;
    const menuOpen = menu && !menu.hidden;
    return pastHero && !inContact && !menuOpen;
  };
  const update = () => {
    peek.classList.remove('is-up');
    clearTimeout(timer);
    if (canShow()) timer = setTimeout(() => { if (canShow()) peek.classList.add('is-up'); }, 900);
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  peek.addEventListener('click', () => peek.classList.remove('is-up'));
  update();
})();
