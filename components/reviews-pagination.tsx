import Link from "next/link";
import {
  getVisiblePages,
  reviewsPageUrl,
} from "../utils/reviews/pagination";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function ReviewsPagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-4 text-slate-400"
      aria-label="Paginación de reseñas"
    >
      {currentPage > 1 ? (
        <Link
          href={reviewsPageUrl(currentPage - 1)}
          className="hover:text-white"
          aria-label="Página anterior"
        >
          &lt;
        </Link>
      ) : (
        <span className="cursor-not-allowed text-slate-600">&lt;</span>
      )}

      <div className="flex items-center gap-4">
        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const showEllipsis = previousPage !== undefined && page - previousPage > 1;

          return (
            <span key={page} className="flex items-center gap-4">
              {showEllipsis && <span className="text-slate-600">…</span>}
              {page === currentPage ? (
                <span className="font-semibold text-white underline underline-offset-4">
                  {page}
                </span>
              ) : (
                <Link href={reviewsPageUrl(page)} className="hover:text-white">
                  {page}
                </Link>
              )}
            </span>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={reviewsPageUrl(currentPage + 1)}
          className="hover:text-white"
          aria-label="Página siguiente"
        >
          &gt;
        </Link>
      ) : (
        <span className="cursor-not-allowed text-slate-600">&gt;</span>
      )}
    </nav>
  );
}
