export function formatSlugAsTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getNewsTitle(news: { title?: string | null; slug: string }): string {
  const title = news.title?.trim();
  return title || formatSlugAsTitle(news.slug);
}

export function getNewsExcerpt(
  news: { excerpt?: string | null; content: string },
  maxLength = 160
): string {
  const excerpt = news.excerpt?.trim();
  if (excerpt) {
    return excerpt;
  }

  return newsExcerpt(news.content, maxLength);
}

export function newsExcerpt(content: string, maxLength = 160): string {
  const plain = content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trim()}…`;
}
