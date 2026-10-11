# vendly-site

Página pública de [Vendly](https://drgerssonsr.github.io/vendly-site/), la extensión de Chrome para vender en lives:
la landing y la política de privacidad. Hecha con [Astro](https://astro.build) y GSAP.

- Landing: `src/pages/index.astro`, con una sección por componente en `src/components/`.
- Política de privacidad (es/en/pt): `src/legal/privacy.html` (se sirve desde `src/pages/privacy/index.astro`). Su URL no debe cambiar: la ficha de la Chrome Web Store apunta a ella.

## Comandos

```bash
pnpm install
pnpm dev        # http://localhost:4600/vendly-site/
pnpm build      # genera dist/
pnpm preview    # sirve dist/ en http://localhost:4600/vendly-site/
```

## Despliegue

Se publica en GitHub Pages con GitHub Actions (`.github/workflows/deploy.yml`): cada push a `main` compila el sitio y lo
publica. No hay que copiar `dist/` a mano.

Requisito de una sola vez: en GitHub, **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Estructura

- `src/scripts/`: animaciones con GSAP (`hero-stage.ts`, `how-scroll.ts`, `ui.ts`).
- `src/styles/`: tokens y estilos globales; `panel.css` es la maqueta del panel de la extensión.
- `src/data/site.ts`: enlace de la Chrome Web Store y correo de contacto.
- `public/video/`: los 3 videos de demostración, comprimidos para web.

## Datos a mantener

- El enlace de la tienda y el correo están en `src/data/site.ts` y, para el botón de compartir, en la constante `STORE` de `src/scripts/ui.ts`.
- Las cifras de la demo (pedidos, stock, montos) son datos de ejemplo.

## Formulario de contacto

El formulario de la sección "A tu medida" envía el mensaje con [Web3Forms](https://web3forms.com) si `FORM_ACCESS_KEY`
(en `src/data/site.ts`) tiene valor; la clave es pública por diseño y llega por correo al registrar tu dirección en su
sitio. Si está vacía, el formulario abre Gmail con el mensaje listo. Tocar el correo lo copia al portapapeles.
