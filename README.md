# Portafolio JCCS

Sitio web personal de JCCS, Brand & Visual Designer.

Es una página sencilla: no necesita instalar nada. Todo vive en tres piezas:

- `index.html` — el contenido (textos, proyectos, contacto).
- `styles.css` — el diseño (colores, tipografía, espacios).
- `assets/img/` — la carpeta donde van las fotos de los proyectos.

## Cómo cambiar algo

**Textos:** abre `index.html` en GitHub, toca el ícono del lápiz y edita las palabras que quieras. Guarda con el botón verde “Commit changes”.

**Fotos de proyectos:** sube tus imágenes a la carpeta `assets/img/` (botón “Add file” → “Upload files”). Luego, en `index.html`, cambia cada recuadro de muestra:

```html
<div class="ph ph-2"><span>Proyecto 02</span></div>
```

por tu foto:

```html
<img src="assets/img/mi-proyecto.jpg" alt="Descripción breve">
```

**Correo y redes:** en `index.html`, busca `hola@tucorreo.com` y los enlaces `#` de Instagram, Behance y LinkedIn.

**Colores:** al inicio de `styles.css` están los colores principales (fondo, texto y el naranja de acento).

## Publicarlo en internet (gratis, con GitHub Pages)

1. En este repositorio, entra a **Settings** → **Pages**.
2. En “Branch”, elige `main` y la carpeta `/ (root)`. Guarda.
3. En un par de minutos tu sitio estará en `https://hellojccs.github.io/portafolio/`.
4. Para usar tu dominio (por ejemplo `hello.jccs.com`), escríbelo en el campo “Custom domain” de esa misma pantalla.
