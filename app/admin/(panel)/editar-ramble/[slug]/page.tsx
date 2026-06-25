import { notFound } from "next/navigation";
import Link from "next/link";
import RambleForm from "../../../../../components/admin/ramble-form";
import { createClient } from "../../../../../utils/supabase/server";
import { getRambleForEdit } from "../../../../../utils/rambles/get-ramble-for-edit";

export const metadata = {
  title: "Editar ramble | Panel",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditarRamblePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const ramble = await getRambleForEdit(slug, user.id);

  if (!ramble) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/rambles"
        className="text-sm text-slate-400 hover:text-slate-200"
      >
        ← Volver a rambles
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-100">Editar ramble</h1>
      <p className="mt-1 text-sm text-slate-400">
        Modifica el slug, portada o contenido de tu texto de opinión.
      </p>

      <div className="mt-8">
        <RambleForm ramble={ramble} />
      </div>
    </div>
  );
}
