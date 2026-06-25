import Container from "../../components/container";
import Link from "next/link";
import { redirect } from "next/navigation";
import { News } from "../../data/news";
import { createClient } from "../../utils/supabase/server";
import NewsPagination from "../../components/news-pagination";
import { getNewsTitle, getNewsExcerpt } from "../../utils/news/format";
import {
  getTotalPages,
  NEWS_PAGE_SIZE,
  newsPageUrl,
  parseNewsPage,
} from "../../utils/news/pagination";

export const metadata = {
  title: "Noticias",
  description: "Noticias y novedades sobre videojuegos",
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

export default async function NewsPage({ searchParams }: Props) {
  const { page: rawPage } = await searchParams;
  const requestedPage = parseNewsPage(rawPage);

  const supabase = await createClient();
  const from = (requestedPage - 1) * NEWS_PAGE_SIZE;
  const to = from + NEWS_PAGE_SIZE - 1;

  const { data: newsItems, error, count } = await supabase
    .from("news")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<News[]>();

  const totalCount = count ?? 0;
  const totalPages = getTotalPages(totalCount);
  const currentPage = Math.min(requestedPage, totalPages);

  if (requestedPage > totalPages && totalCount > 0) {
    redirect(newsPageUrl(totalPages));
  }

  return (
    <Container>
      <h1 className="text-center text-4xl font-extrabold tracking-tight md:text-6xl">
        Noticias
      </h1>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          No se pudieron cargar las noticias en este momento.
        </p>
      )}

      {!error && totalCount === 0 && (
        <p className="mt-8 text-center text-slate-400">
          Todavía no hay noticias publicadas.
        </p>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(newsItems ?? []).map((item) => (
          <Link
            key={item.id}
            href={`/noticias/${item.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-slate-600"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-800">
              {item.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_image}
                  alt={item.cover_alt || getNewsTitle(item)}
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
                {getNewsTitle(item)}
              </h2>

              {item.subtitle && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                  {item.subtitle}
                </p>
              )}

              <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                {getNewsExcerpt(item)}
              </p>

              <span className="mt-auto pt-4 text-xs text-slate-500">
                {formatDate(item.created_at)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {!error && totalCount > 0 && (
        <>
          <NewsPagination currentPage={currentPage} totalPages={totalPages} />
          <p className="mt-4 text-center text-xs text-slate-500">
            Página {currentPage} de {totalPages} · {totalCount} noticia
            {totalCount === 1 ? "" : "s"}
          </p>
        </>
      )}
    </Container>
  );
}
