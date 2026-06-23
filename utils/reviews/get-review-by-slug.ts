import { Review, ReviewWithAuthor } from "../../data/reviews";
import { createClient } from "../supabase/server";

export async function getReviewBySlug(
  slug: string
): Promise<ReviewWithAuthor | null> {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle<Review>();

  if (error || !review) {
    return null;
  }

  if (!review.author_id) {
    return { ...review, author: null };
  }

  const { data: author } = await supabase
    .from("public_author_profiles")
    .select("nickname")
    .eq("id", review.author_id)
    .maybeSingle<{ nickname: string | null }>();

  return {
    ...review,
    author: author ?? null,
  };
}
