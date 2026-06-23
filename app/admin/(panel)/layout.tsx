import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";
import { isAdminUser } from "../../../utils/auth/admin";
import { signOut } from "../actions";

export const metadata = {
  title: "Panel | Game Reviews",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/acceder");
  }

  if (!(await isAdminUser(supabase, user.id))) {
    await supabase.auth.signOut();
    redirect("/admin/acceder");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-slate-100">Panel</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-slate-200 hover:text-white">
              Reseñas
            </Link>
            <Link
              href="/admin/nueva-resena"
              className="text-slate-200 hover:text-white"
            >
              Nueva reseña
            </Link>
            <Link
              href="/admin/noticias"
              className="text-slate-200 hover:text-white"
            >
              Noticias
            </Link>
            <Link
              href="/admin/nueva-noticia"
              className="text-slate-200 hover:text-white"
            >
              Nueva noticia
            </Link>
            <Link href="/" className="text-slate-400 hover:text-white">
              Ver sitio
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="hidden truncate sm:inline">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-slate-700 px-3 py-1.5 font-medium text-slate-100 hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
