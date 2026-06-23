import Container from "../../components/container";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Review } from "../../data/reviews";
import { createClient } from "../../utils/supabase/server";
import StarDisplay from "../../components/star-display";
import ReviewsPagination from "../../components/reviews-pagination";
import {
  getTotalPages,
  parseReviewsPage,
  reviewsPageUrl,
  REVIEWS_PAGE_SIZE,
} from "../../utils/reviews/pagination";

export const metadata = {
  title: "Reseñas",
  description: "Listado de reseñas de videojuegos",
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ReviewsPage({ searchParams }: Props) {
  const { page: rawPage } = await searchParams;
  const requestedPage = parseReviewsPage(rawPage);

  const supabase = await createClient();
  const from = (requestedPage - 1) * REVIEWS_PAGE_SIZE;
  const to = from + REVIEWS_PAGE_SIZE - 1;

  const { data: reviews, error, count } = await supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<Review[]>();

  if (error) {
    console.error("[reviews:list] Supabase error", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }

  const totalCount = count ?? 0;
  const totalPages = getTotalPages(totalCount);
  const currentPage = Math.min(requestedPage, totalPages);

  if (requestedPage > totalPages && totalCount > 0) {
    redirect(reviewsPageUrl(totalPages));
  }

  return (
    <Container>
      <h1 className="text-center text-4xl font-extrabold tracking-tight md:text-6xl">
        Catálogo de Reseñas
      </h1>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          No se pudieron cargar las reseñas en este momento.
        </p>
      )}

      {!error && totalCount === 0 && (
        <p className="mt-8 text-center text-slate-400">
          Todavía no hay reseñas publicadas.
        </p>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(reviews ?? []).map((review) => (
          <Link
            key={review.id}
            href={`/reviews/${review.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-slate-600"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-800">
              {review.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.cover_image}
                  alt={review.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h2 className="line-clamp-2 text-xl font-bold leading-tight text-slate-100">
                {review.title}
              </h2>

              <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                {review.excerpt}
              </p>

              <div className="mt-auto flex items-center justify-between pt-4">
                <StarDisplay value={review.rating} className="text-lg" />
                <span className="text-xs text-slate-500">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!error && totalCount > 0 && (
        <>
          <ReviewsPagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
          <p className="mt-4 text-center text-xs text-slate-500">
            Página {currentPage} de {totalPages} · {totalCount} reseña
            {totalCount === 1 ? "" : "s"}
          </p>
        </>
      )}
    </Container>
  );
}
