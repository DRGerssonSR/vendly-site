import { defineConfig } from 'astro/config'

// Se publica en GitHub Pages: https://drgerssonsr.github.io/vendly-site/
export default defineConfig({
  site: 'https://drgerssonsr.github.io',
  base: '/vendly-site',
  trailingSlash: 'always',
})
