export const NAV_LINKS = [
  {
    href: "/",
    label: "INICIO",
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/reviews",
    label: "RESEÑAS",
    isActive: (pathname: string) => pathname.startsWith("/reviews"),
  },
  {
    href: "/noticias",
    label: "NOTICIAS",
    isActive: (pathname: string) => pathname.startsWith("/noticias"),
  },
  {
    href: "/sobre-nosotros",
    label: "SOBRE NOSOTROS",
    isActive: (pathname: string) => pathname.startsWith("/sobre-nosotros"),
  },
] as const;
