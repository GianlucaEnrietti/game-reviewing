import { FeaturedPostOption } from "../../data/featured-post";
import { createClient } from "../supabase/server";
import { getNewsTitle } from "../news/format";
import { getRambleTitle } from "../rambles/format";

export type FeaturedPostOptionsByType = {
  reviews: FeaturedPostOption[];
  news: FeaturedPostOption[];
  rambles: FeaturedPostOption[];
};

export async function getFeaturedPostOptions(): Promise<FeaturedPostOptionsByType> {
  const supabase = await createClient();

  const [reviewsResult, newsResult, ramblesResult] = await Promise.all([
    supabase
      .from("reviews")
      .select("slug, title")
      .order("created_at", { ascending: false }),
    supabase
      .from("news")
      .select("slug, title")
      .order("created_at", { ascending: false }),
    supabase
      .from("rambles")
      .select("slug, title")
      .order("created_at", { ascending: false }),
  ]);

  return {
    reviews: (reviewsResult.data ?? []).map((item) => ({
      slug: item.slug,
      title: item.title,
    })),
    news: (newsResult.data ?? []).map((item) => ({
      slug: item.slug,
      title: getNewsTitle(item),
    })),
    rambles: (ramblesResult.data ?? []).map((item) => ({
      slug: item.slug,
      title: getRambleTitle(item),
    })),
  };
}
