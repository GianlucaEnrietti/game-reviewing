import { unstable_cache } from "next/cache";
import { Review } from "../../data/reviews";
import { createPublicClient } from "../supabase/public";

export const RANDOM_REVIEWS_MAX = 8;
/** How often the random selection is refreshed (seconds). */
export const RANDOM_REVIEWS_REVALIDATE_SECONDS = 60 * 60;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

async function fetchRandomReviews(): Promise<Review[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, created_at, title, slug, excerpt, rating, cover_image, genres, author_id, final_thoughts, content"
    )
    .returns<Review[]>();

  if (error || !data?.length) {
    return [];
  }

  return shuffle(data).slice(0, RANDOM_REVIEWS_MAX);
}

const getCachedRandomReviews = unstable_cache(
  fetchRandomReviews,
  ["home-random-reviews"],
  { revalidate: RANDOM_REVIEWS_REVALIDATE_SECONDS }
);

export async function getRandomReviews(): Promise<Review[]> {
  return getCachedRandomReviews();
}
