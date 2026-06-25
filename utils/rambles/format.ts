export function formatSlugAsTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getRambleTitle(ramble: { title?: string | null; slug: string }): string {
  const title = ramble.title?.trim();
  return title || formatSlugAsTitle(ramble.slug);
}

export function rambleExcerpt(content: string, maxLength = 160): string {
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
