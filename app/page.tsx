import Container from "../components/container";
import Link from "next/link";
import { createClient } from "../utils/supabase/server";
import { Review } from "../data/reviews";
import { News } from "../data/news";
import { Ramble } from "../data/rambles";
import StarDisplay from "../components/star-display";
import RandomReviewsSlider from "../components/random-reviews-slider";
import { getRandomReviews } from "../utils/reviews/random-reviews";
import { getNewsTitle, newsExcerpt } from "../utils/news/format";
import { getRambleTitle, rambleExcerpt } from "../utils/rambles/format";

export const metadata = {
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
  const [
    { data: recentReviews, error },
    randomReviews,
    { data: recentNews, error: newsError },
    { data: recentRambles, error: ramblesError },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<Review[]>(),
    getRandomReviews(),
    supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<News[]>(),
    supabase
      .from("rambles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<Ramble[]>(),
  ]);

  return (
    <Container>
      <section className="pt-8">
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl underline">
          Vicios y Noticias
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
                    alt={review.cover_alt || review.title}
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
                {review.subtitle && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                    {review.subtitle}
                  </p>
                )}
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
        <h2 className="text-xl font-semibold">Últimas noticias</h2>

        {newsError && (
          <p className="mt-4 text-sm text-red-400">
            No se pudieron cargar las noticias en este momento.
          </p>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(recentNews ?? []).map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-800">
                {item.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cover_image}
                    alt={item.cover_alt || getNewsTitle(item)}
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
                  {getNewsTitle(item)}
                </h3>
                {item.subtitle && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                    {item.subtitle}
                  </p>
                )}
                <p className="mt-3 line-clamp-3 text-sm text-slate-300">
                  {newsExcerpt(item.content)}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                  <span>{formatDate(item.created_at)}</span>
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="font-medium text-slate-100 underline-offset-2 hover:underline"
                  >
                    Leer noticia
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!newsError && (recentNews ?? []).length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            Todavía no hay noticias publicadas.
          </p>
        )}

        <div className="mt-8 text-center">
          <Link href="/noticias" className="text-base underline">
            Ver todas las noticias
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Rambles recientes</h2>

        {ramblesError && (
          <p className="mt-4 text-sm text-red-400">
            No se pudieron cargar los rambles en este momento.
          </p>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(recentRambles ?? []).map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-800">
                {item.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cover_image}
                    alt={item.cover_alt || getRambleTitle(item)}
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
                  {getRambleTitle(item)}
                </h3>
                {item.subtitle && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                    {item.subtitle}
                  </p>
                )}
                <p className="mt-3 line-clamp-3 text-sm text-slate-300">
                  {rambleExcerpt(item.content)}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                  <span>{formatDate(item.created_at)}</span>
                  <Link
                    href={`/rambles/${item.slug}`}
                    className="font-medium text-slate-100 underline-offset-2 hover:underline"
                  >
                    Leer ramble
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!ramblesError && (recentRambles ?? []).length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            Todavía no hay rambles publicados.
          </p>
        )}

        <div className="mt-8 text-center">
          <Link href="/rambles" className="text-base underline">
            Ver todos los rambles
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
