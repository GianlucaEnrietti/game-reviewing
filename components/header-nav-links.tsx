"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
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

export default function HeaderNavLinks() {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-6 text-sm font-medium md:flex">
      {NAV_LINKS.map(({ href, label, isActive }) => {
        const active = isActive(pathname);

        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "text-white underline underline-offset-4"
                : "text-slate-200 hover:text-white"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
