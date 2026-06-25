"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { isAdminUser } from "../../utils/auth/admin";
import { FeaturedPostType } from "../../data/featured-post";
import {
  featuredPostTable,
  isFeaturedPostType,
} from "../../utils/featured/post-type";

export type FeaturedActionState = {
  error?: string;
  success?: boolean;
};

const initialState: FeaturedActionState = {};

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { supabase, user: null, error: "No autorizado." as const };
  }

  return { supabase, user, error: null };
}

async function postExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postType: FeaturedPostType,
  postSlug: string
): Promise<boolean> {
  const table = featuredPostTable(postType);
  const { data, error } = await supabase
    .from(table)
    .select("slug")
    .eq("slug", postSlug)
    .maybeSingle<{ slug: string }>();

  if (error) {
    return false;
  }

  return Boolean(data);
}

function revalidateFeaturedPaths() {
  revalidatePath("/admin/destacado");
  revalidatePath("/");
}

export async function setFeaturedPost(
  _prevState: FeaturedActionState = initialState,
  formData: FormData
): Promise<FeaturedActionState> {
  const { supabase, user, error: authError } = await assertAdmin();

  if (authError || !user) {
    return { error: authError ?? "No autorizado." };
  }

  const postType = String(formData.get("postType") ?? "").trim();
  const postSlug = String(formData.get("postSlug") ?? "").trim();

  if (!isFeaturedPostType(postType)) {
    return { error: "Selecciona un tipo de publicación válido." };
  }

  if (!postSlug) {
    return { error: "Selecciona una publicación." };
  }

  const exists = await postExists(supabase, postType, postSlug);

  if (!exists) {
    return { error: "La publicación seleccionada ya no existe." };
  }

  const { error } = await supabase.from("featured_post").upsert(
    {
      id: 1,
      post_type: postType,
      post_slug: postSlug,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { error: "No se pudo guardar el destacado." };
  }

  revalidateFeaturedPaths();
  return { success: true };
}

export async function clearFeaturedPost(): Promise<FeaturedActionState> {
  const { supabase, user, error: authError } = await assertAdmin();

  if (authError || !user) {
    return { error: authError ?? "No autorizado." };
  }

  const { error } = await supabase.from("featured_post").upsert(
    {
      id: 1,
      post_type: null,
      post_slug: null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    return { error: "No se pudo quitar el destacado." };
  }

  revalidateFeaturedPaths();
  return { success: true };
}
