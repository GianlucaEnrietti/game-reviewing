import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";
import { Review } from "../../../data/reviews";
import DeleteReviewButton from "../../../components/admin/delete-review-button";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Review[]>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Reseñas</h1>
        <Link
          href="/admin/nueva-resena"
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
        >
          Nueva reseña
        </Link>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          No se pudieron cargar las reseñas.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Puntaje</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(reviews ?? []).map((review) => (
              <tr
                key={review.id}
                className="border-t border-slate-800 text-slate-200"
              >
                <td className="px-4 py-3 font-medium">{review.title}</td>
                <td className="px-4 py-3">{review.rating}/5</td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(review.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/reviews/${review.slug}`}
                      className="text-slate-100 underline-offset-2 hover:underline"
                    >
                      Ver
                    </Link>
                    {user && review.author_id === user.id && (
                      <>
                        <Link
                          href={`/admin/editar/${review.slug}`}
                          className="text-amber-300 underline-offset-2 hover:underline"
                        >
                          Editar
                        </Link>
                        <DeleteReviewButton
                          reviewId={review.id}
                          reviewTitle={review.title}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {(reviews ?? []).length === 0 && !error && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Todavía no hay reseñas. Crea la primera.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
