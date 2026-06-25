import Container from "../../components/container";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Ramble } from "../../data/rambles";
import { createClient } from "../../utils/supabase/server";
import RamblesPagination from "../../components/rambles-pagination";
import { getRambleTitle, rambleExcerpt } from "../../utils/rambles/format";
import {
  getTotalPages,
  parseRamblesPage,
  ramblesPageUrl,
  RAMBLES_PAGE_SIZE,
} from "../../utils/rambles/pagination";

export const metadata = {
  title: "Rambles",
  description: "Opiniones, reflexiones y editoriales sobre videojuegos",
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

export default async function RamblesPage({ searchParams }: Props) {
  const { page: rawPage } = await searchParams;
  const requestedPage = parseRamblesPage(rawPage);

  const supabase = await createClient();
  const from = (requestedPage - 1) * RAMBLES_PAGE_SIZE;
  const to = from + RAMBLES_PAGE_SIZE - 1;

  const { data: rambles, error, count } = await supabase
    .from("rambles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<Ramble[]>();

  const totalCount = count ?? 0;
  const totalPages = getTotalPages(totalCount);
  const currentPage = Math.min(requestedPage, totalPages);

  if (requestedPage > totalPages && totalCount > 0) {
    redirect(ramblesPageUrl(totalPages));
  }

  return (
    <Container>
      <h1 className="text-center text-4xl font-extrabold tracking-tight md:text-6xl">
        Rambles
      </h1>

      <p className="mt-4 text-center text-slate-400">
        Opiniones y reflexiones personales sobre videojuegos.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          No se pudieron cargar los rambles en este momento.
        </p>
      )}

      {!error && totalCount === 0 && (
        <p className="mt-8 text-center text-slate-400">
          Todavía no hay rambles publicados.
        </p>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(rambles ?? []).map((item) => (
          <Link
            key={item.id}
            href={`/rambles/${item.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-slate-600"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-800">
              {item.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_image}
                  alt={item.cover_alt || getRambleTitle(item)}
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
                {getRambleTitle(item)}
              </h2>

              {item.subtitle && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                  {item.subtitle}
                </p>
              )}

              <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                {rambleExcerpt(item.content)}
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
          <RamblesPagination currentPage={currentPage} totalPages={totalPages} />
          <p className="mt-4 text-center text-xs text-slate-500">
            Página {currentPage} de {totalPages} · {totalCount} ramble
            {totalCount === 1 ? "" : "s"}
          </p>
        </>
      )}
    </Container>
  );
}
