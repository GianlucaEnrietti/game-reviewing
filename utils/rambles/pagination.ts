export const RAMBLES_PAGE_SIZE = 9;

export function ramblesPageUrl(page: number): string {
  return page <= 1 ? "/rambles" : `/rambles?page=${page}`;
}

export function parseRamblesPage(raw?: string): number {
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

export function getTotalPages(
  totalCount: number,
  pageSize = RAMBLES_PAGE_SIZE
): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

export function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1);
  }

  return [...pages].sort((a, b) => a - b);
}
