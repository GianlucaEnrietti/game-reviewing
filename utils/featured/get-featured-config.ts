import { FeaturedPostConfig, FeaturedPostType } from "../../data/featured-post";
import { createClient } from "../supabase/server";
import { isFeaturedPostType } from "./post-type";

type FeaturedPostRow = {
  post_type: FeaturedPostType | null;
  post_slug: string | null;
  updated_at: string | null;
};

export async function getFeaturedConfig(): Promise<FeaturedPostConfig | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("featured_post")
    .select("post_type, post_slug, updated_at")
    .eq("id", 1)
    .maybeSingle<FeaturedPostRow>();

  if (error || !data) {
    return null;
  }

  if (data.post_type && !isFeaturedPostType(data.post_type)) {
    return {
      post_type: null,
      post_slug: null,
      updated_at: data.updated_at,
    };
  }

  if (!data.post_type || !data.post_slug) {
    return {
      post_type: null,
      post_slug: null,
      updated_at: data.updated_at,
    };
  }

  return {
    post_type: data.post_type,
    post_slug: data.post_slug,
    updated_at: data.updated_at,
  };
}
