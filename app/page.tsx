import Container from "../components/container";
import Link from "next/link";
import { createClient } from "../utils/supabase/server";
import { Review } from "../data/reviews";
import StarDisplay from "../components/star-display";
import RandomReviewsSlider from "../components/random-reviews-slider";
import { getRandomReviews, RANDOM_REVIEWS_MAX } from "../utils/reviews/random-reviews";

export const metadata = {
  title: "Game Reviews",
  description: "Reseñas, opiniones y noticias sobre videojuegos",
};


function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function Home() {
  const supabase = await createClient();
  const [{ data: recentReviews, error }, randomReviews] = await Promise.all([
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<Review[]>(),
    getRandomReviews(),
  ]);

  return (
    <Container>
      <section className="pt-8">
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">
          Reseñas de videojuegos simples y personales.
        </h1>

        <p className="mt-5 max-w-3xl text-lg text-slate-300">
          Reseñas, opiniones y noticias sobre videojuegos, escritas por
          jugadores.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Reseñas más recientes</h2>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            No se pudieron cargar las reseñas en este momento.
          </p>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(recentReviews ?? []).map((review) => (
            <article
              key={review.id}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-800">
                {review.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.cover_image}
                    alt={review.title}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-2xl font-semibold leading-tight">
                  {review.title}
                </h3>
                <StarDisplay value={review.rating} className="mt-1 text-base" />
                <p className="mt-3 text-sm text-slate-300">
                  {review.excerpt}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                  <span>{formatDate(review.created_at)}</span>
                  <Link
                    href={`/reviews/${review.slug}`}
                    className="font-medium text-slate-100 underline-offset-2 hover:underline"
                  >
                    Ver reseña
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/reviews" className="text-base underline">
            Ver todas las reseñas
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Reseñas random</h2>
        <p className="mt-1 text-sm text-slate-400">
          ¡Chequeá estas reviews!
        </p>
        <RandomReviewsSlider reviews={randomReviews} />
      </section>
    </Container>
  );
}
