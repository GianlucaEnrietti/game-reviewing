import type { Metadata } from "next";

export const SITE_NAME = "Vicios y Noticias";

export const SITE_DESCRIPTION =
  "Reseñas, opiniones y noticias sobre videojuegos, escritas por aficionados.";

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
