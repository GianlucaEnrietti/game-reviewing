import { FeaturedPostType } from "../../data/featured-post";

export function isFeaturedPostType(value: string): value is FeaturedPostType {
  return value === "review" || value === "news" || value === "opinion";
}

export function featuredPostHref(type: FeaturedPostType, slug: string): string {
  if (type === "review") {
    return `/reviews/${slug}`;
  }

  if (type === "news") {
    return `/noticias/${slug}`;
  }

  return `/rambles/${slug}`;
}

export function featuredPostTypeLabel(type: FeaturedPostType): string {
  if (type === "review") {
    return "Reseña";
  }

  if (type === "news") {
    return "Noticia";
  }

  return "Ramble";
}

export function featuredPostTable(type: FeaturedPostType): string {
  if (type === "review") {
    return "reviews";
  }

  if (type === "news") {
    return "news";
  }

  return "rambles";
}
