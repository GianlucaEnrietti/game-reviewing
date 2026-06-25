import { FeaturedPost, FeaturedPostType } from "../../data/featured-post";
import { Review } from "../../data/reviews";
import { News } from "../../data/news";
import { Ramble } from "../../data/rambles";
import { createClient } from "../supabase/server";
import { getNewsTitle, getNewsExcerpt } from "../news/format";
import { getRambleTitle, getRambleExcerpt } from "../rambles/format";
import { getFeaturedConfig } from "./get-featured-config";
import { featuredPostHref } from "./post-type";

async function resolveReview(slug: string): Promise<FeaturedPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Review>();

  if (error || !data) {
    return null;
  }

  return {
    type: "review",
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    excerpt: data.excerpt,
    coverImage: data.cover_image,
    coverAlt: data.cover_alt,
    href: featuredPostHref("review", data.slug),
    rating: data.rating,
    createdAt: data.created_at,
  };
}

async function resolveNews(slug: string): Promise<FeaturedPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<News>();

  if (error || !data) {
    return null;
  }

  return {
    type: "news",
    slug: data.slug,
    title: getNewsTitle(data),
    subtitle: data.subtitle,
    excerpt: getNewsExcerpt(data),
    coverImage: data.cover_image,
    coverAlt: data.cover_alt,
    href: featuredPostHref("news", data.slug),
    createdAt: data.created_at,
  };
}

async function resolveRamble(slug: string): Promise<FeaturedPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rambles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Ramble>();

  if (error || !data) {
    return null;
  }

  return {
    type: "opinion",
    slug: data.slug,
    title: getRambleTitle(data),
    subtitle: data.subtitle,
    excerpt: getRambleExcerpt(data),
    coverImage: data.cover_image,
    coverAlt: data.cover_alt,
    href: featuredPostHref("opinion", data.slug),
    createdAt: data.created_at,
  };
}

export async function getFeaturedPost(): Promise<FeaturedPost | null> {
  const config = await getFeaturedConfig();

  if (!config?.post_type || !config.post_slug) {
    return null;
  }

  const { post_type, post_slug } = config;

  if (post_type === "review") {
    return resolveReview(post_slug);
  }

  if (post_type === "news") {
    return resolveNews(post_slug);
  }

  return resolveRamble(post_slug);
}

export function isFeaturedPost(
  type: FeaturedPostType,
  slug: string,
  featured: FeaturedPost | null
): boolean {
  return featured?.type === type && featured.slug === slug;
}
