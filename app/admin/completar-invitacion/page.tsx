import { redirect } from "next/navigation";
import CompleteInviteForm from "../../../components/admin/complete-invite-form";
import { createClient } from "../../../utils/supabase/server";
import { isAdminUser } from "../../../utils/auth/admin";

export const metadata = {
  title: "Completar invitación",
  robots: { index: false, follow: false },
};

export default async function CompleteInvitePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await isAdminUser(supabase, user.id))) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Completar invitación
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Definí tu nickname y contraseña para acceder al panel de reseñas.
        </p>

        <CompleteInviteForm initialEmail={user?.email ?? null} />
      </div>
    </div>
  );
}
