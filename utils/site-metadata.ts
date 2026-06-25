import type { Metadata } from "next";

export const SITE_NAME = "Vicios y Noticias";

export const SITE_DESCRIPTION =
  "Reseñas, opiniones y noticias sobre videojuegos, escritas por aficionados.";

/** Perfil de X. Configurar en .env.local: NEXT_PUBLIC_X_PROFILE_URL=https://x.com/tu_cuenta */
export const X_PROFILE_URL =
  process.env.NEXT_PUBLIC_X_PROFILE_URL ??
  process.env.NEXT_PUBLIC_X_URL ??
  "";

export const rootMetadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};
