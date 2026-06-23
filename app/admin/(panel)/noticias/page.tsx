import Link from "next/link";
import { createClient } from "../../../../utils/supabase/server";
import { News } from "../../../../data/news";
import DeleteNewsButton from "../../../../components/admin/delete-news-button";
import { getNewsTitle } from "../../../../utils/news/format";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: newsItems, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<News[]>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Noticias</h1>
        <Link
          href="/admin/nueva-noticia"
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
        >
          Nueva noticia
        </Link>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          No se pudieron cargar las noticias.
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
            {(newsItems ?? []).map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-800 text-slate-200"
              >
                <td className="px-4 py-3 font-medium">
                  {getNewsTitle(item)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/noticias/${item.slug}`}
                      className="text-slate-100 underline-offset-2 hover:underline"
                    >
                      Ver
                    </Link>
                    {user && item.author_id === user.id && (
                      <>
                        <Link
                          href={`/admin/editar-noticia/${item.slug}`}
                          className="text-amber-300 underline-offset-2 hover:underline"
                        >
                          Editar
                        </Link>
                        <DeleteNewsButton
                          newsId={item.id}
                          newsTitle={getNewsTitle(item)}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {(newsItems ?? []).length === 0 && !error && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Todavía no hay noticias. Publica la primera.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
