import { createClient } from "../supabase/server";
import { Ramble } from "../../data/rambles";

export async function getRambleForEdit(
  slug: string,
  userId: string
): Promise<Ramble | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rambles")
    .select("*")
    .eq("slug", slug)
    .eq("author_id", userId)
    .maybeSingle<Ramble>();

  if (error || !data) {
    return null;
  }

  return data;
}
