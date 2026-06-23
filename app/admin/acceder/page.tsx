import { redirect } from "next/navigation";
import AdminLoginForm from "../../../components/admin/login-form";
import { createClient } from "../../../utils/supabase/server";
import { isAdminUser } from "../../../utils/auth/admin";

export const metadata = {
  title: "Acceso privado",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user && (await isAdminUser(supabase, data.user.id))) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
        <h1 className="text-2xl font-bold text-slate-100">Acceso privado</h1>
        <p className="mt-2 text-sm text-slate-400">
          Área restringida. Solo el administrador del sitio puede ingresar.
        </p>

        <AdminLoginForm />
      </div>
    </div>
  );
}
