import Link from "next/link";
import { createClient } from "../../../../utils/supabase/server";
import { Ramble } from "../../../../data/rambles";
import DeleteRambleButton from "../../../../components/admin/delete-ramble-button";
import { getRambleTitle } from "../../../../utils/rambles/format";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminRamblesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rambles, error } = await supabase
    .from("rambles")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Ramble[]>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Rambles</h1>
        <Link
          href="/admin/nuevo-ramble"
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
        >
          Nuevo ramble
        </Link>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          No se pudieron cargar los rambles.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(rambles ?? []).map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-800 text-slate-200"
              >
                <td className="px-4 py-3 font-medium">
                  {getRambleTitle(item)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/rambles/${item.slug}`}
                      className="text-slate-100 underline-offset-2 hover:underline"
                    >
                      Ver
                    </Link>
                    {user && item.author_id === user.id && (
                      <>
                        <Link
                          href={`/admin/editar-ramble/${item.slug}`}
                          className="text-amber-300 underline-offset-2 hover:underline"
                        >
                          Editar
                        </Link>
                        <DeleteRambleButton
                          rambleId={item.id}
                          rambleTitle={getRambleTitle(item)}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {(rambles ?? []).length === 0 && !error && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Todavía no hay rambles. Publica el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
