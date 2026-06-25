import { createClient } from "../supabase/server";
import { RambleWithAuthor } from "../../data/rambles";

export async function getRambleBySlug(
  slug: string
): Promise<RambleWithAuthor | null> {
  const supabase = await createClient();
  const { data: ramble, error } = await supabase
    .from("rambles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !ramble) {
    return null;
  }

  let author: { nickname: string | null } | null = null;

  if (ramble.author_id) {
    const { data: profile } = await supabase
      .from("public_author_profiles")
      .select("nickname")
      .eq("id", ramble.author_id)
      .maybeSingle();

    author = profile ?? null;
  }

  return { ...ramble, author };
}
