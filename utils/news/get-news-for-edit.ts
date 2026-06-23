import { createClient } from "../supabase/server";
import { News } from "../../data/news";

export async function getNewsForEdit(
  slug: string,
  userId: string
): Promise<News | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("author_id", userId)
    .maybeSingle<News>();

  if (error || !data) {
    return null;
  }

  return data;
}
