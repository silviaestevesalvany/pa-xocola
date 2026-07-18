# CLAUDE.md — pa_xocola

Guía corta para construir webs profesionales en este proyecto. Responder siempre en **español**.

## Principios
- **Mobile-first y responsive**: diseñar primero para móvil; usar `max-width`, flexbox/grid y unidades relativas (`rem`, `%`, `clamp()`). Nada de scroll horizontal.
- **Accesibilidad (a11y)**: HTML semántico (`header`, `nav`, `main`, `footer`), `alt` en imágenes, contraste de color suficiente (WCAG AA), foco visible y navegable con teclado.
- **Rendimiento**: imágenes optimizadas (WebP/AVIF, `loading="lazy"`, `width`/`height`), CSS/JS mínimos, fuentes con `font-display: swap`. Objetivo: Lighthouse ≥ 90.
- **SEO básico**: un solo `<h1>` por página, `<title>` y `<meta name="description">` únicos, Open Graph para compartir, URLs limpias, `sitemap.xml` + `robots.txt`.
- **Diseño con sistema**: definir tokens (colores, tipografía, espaciados) como variables CSS y reutilizarlos. Coherencia > improvisación.
- **Tema claro y oscuro**: soportar `prefers-color-scheme` cuando aplique.

## Estructura recomendada
- `index.html`, `css/`, `js/`, `assets/img/` — o el framework que decidamos.
- Contenido separado del estilo; nada de estilos inline salvo casos puntuales.

## Calidad y orden
- Formatear con **Prettier**; validar HTML/CSS. Linter si hay JS (ESLint).
- Nombres claros y consistentes (kebab-case en archivos/CSS).
- Commits pequeños y descriptivos.
- Probar en móvil y escritorio antes de dar algo por terminado.

## Checklist antes de publicar
- [ ] Responsive verificado (móvil, tablet, escritorio)
- [ ] Enlaces, formularios y botones funcionan
- [ ] Imágenes optimizadas y con `alt`
- [ ] Meta title/description y Open Graph
- [ ] Favicon y `404`
- [ ] Lighthouse ≥ 90 en rendimiento y accesibilidad
- [ ] HTTPS y dominio configurados
