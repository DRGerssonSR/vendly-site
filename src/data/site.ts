export const STORE_URL =
  "https://chromewebstore.google.com/detail/vendly/nhmlejopnhofdhipibokklbaiopceiio?hl=es";
export const EMAIL = "salazar199925@gmail.com";

/**
 * Clave pública de Web3Forms (https://web3forms.com) para que el formulario de contacto llegue al correo sin depender
 * del programa de correo del visitante. Vacía = el formulario abre Gmail con el mensaje listo.
 */
export const FORM_ACCESS_KEY = "33e5ca1a-74eb-4c5a-9398-0de85cb1ff07";

/** Ruta a un archivo de /public respetando el base de GitHub Pages. */
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path}`;
