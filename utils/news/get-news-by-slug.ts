import { createClient } from "../supabase/server";
import { NewsWithAuthor } from "../../data/news";

export async function getNewsBySlug(
  slug: string
): Promise<NewsWithAuthor | null> {
  const supabase = await createClient();
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !news) {
    return null;
  }

  let author: { nickname: string | null } | null = null;

  if (news.author_id) {
    const { data: profile } = await supabase
      .from("public_author_profiles")
      .select("nickname")
      .eq("id", news.author_id)
      .maybeSingle();

    author = profile ?? null;
  }

  return { ...news, author };
}
