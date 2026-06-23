import Link from "next/link";
import { createClient } from "../utils/supabase/server";
import HeaderUserMenu from "./header-user-menu";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-slate-100">
            <span className="mr-2">🎮</span>
            JOSTICKS
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="text-slate-200 hover:text-white">
              INICIO
            </Link>
            <Link href="/reviews" className="text-slate-200 hover:text-white">
              RESEÑAS
            </Link>
            <Link
              href="/sobre-nosotros"
              className="text-slate-200 hover:text-white"
            >
              SOBRE NOSOTROS
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && <HeaderUserMenu email={user.email} />}
        </div>
      </nav>
    </header>
  );
}
