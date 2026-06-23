import { Review } from "../../data/reviews";
import { createClient } from "../supabase/server";

export async function getReviewForEdit(
  slug: string,
  userId: string
): Promise<Review | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle<Review>();

  if (error || !data) {
    return null;
  }

  if (data.author_id !== userId) {
    return null;
  }

  return data;
}
