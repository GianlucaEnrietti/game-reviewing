"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { isAdminUser } from "../../utils/auth/admin";
import { CommentPostType } from "../../data/comments";

export type CommentAdminActionState = {
  error?: string;
};

function postPath(postType: CommentPostType, postSlug: string): string {
  if (postType === "review") {
    return `/reviews/${postSlug}`;
  }

  if (postType === "news") {
    return `/noticias/${postSlug}`;
  }

  return `/rambles/${postSlug}`;
}

export async function approveComment(
  commentId: string
): Promise<CommentAdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("comments")
    .select("post_slug, post_type")
    .eq("id", commentId)
    .maybeSingle<{ post_slug: string; post_type: CommentPostType }>();

  if (fetchError || !existing) {
    return { error: "Comentario no encontrado." };
  }

  const { error } = await supabase
    .from("comments")
    .update({ status: "approved" })
    .eq("id", commentId);

  if (error) {
    return { error: "No se pudo aprobar el comentario." };
  }

  revalidatePath("/admin/comentarios");
  revalidatePath(postPath(existing.post_type, existing.post_slug));
  redirect("/admin/comentarios");
}

export async function deleteComment(
  commentId: string
): Promise<CommentAdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("comments")
    .select("post_slug, post_type")
    .eq("id", commentId)
    .maybeSingle<{ post_slug: string; post_type: CommentPostType }>();

  if (fetchError || !existing) {
    return { error: "Comentario no encontrado." };
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    return { error: "No se pudo eliminar el comentario." };
  }

  revalidatePath("/admin/comentarios");
  revalidatePath(postPath(existing.post_type, existing.post_slug));
  redirect("/admin/comentarios");
}
