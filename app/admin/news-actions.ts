"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { isAdminUser } from "../../utils/auth/admin";
import { slugify } from "../../utils/slug";
import { uploadCoverImage } from "../../utils/storage/upload-cover";
import {
  parseNewsFormData,
  validateNewsFields,
} from "../../utils/news/news-form-data";

export type NewsActionState = {
  error?: string;
};

const NEWS_COVERS_BUCKET = "news-covers";

function revalidateNewsPaths(slugs: string[]) {
  revalidatePath("/admin/noticias");

  for (const slug of slugs) {
    if (slug) {
      revalidatePath(`/noticias/${slug}`);
    }
  }

  revalidatePath("/noticias");
  revalidatePath("/");
}

export async function createNews(
  formData: FormData
): Promise<NewsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  const fields = parseNewsFormData(formData);
  const slug = fields.slugInput
    ? slugify(fields.slugInput)
    : slugify(fields.title);
  const validationError = validateNewsFields(fields, slug);

  if (validationError) {
    return { error: validationError };
  }

  const { coverImage, error: uploadError } = await uploadCoverImage(
    supabase,
    fields.cover,
    slug,
    NEWS_COVERS_BUCKET
  );

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: insertError } = await supabase.from("news").insert({
    title: fields.title,
    slug,
    content: fields.content,
    cover_image: coverImage,
    cover_alt: fields.coverAlt || null,
    author_id: user.id,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "Ya existe una noticia con ese slug." };
    }

    return { error: insertError.message };
  }

  revalidateNewsPaths([slug]);
  redirect("/admin/noticias");
}

export async function updateNews(
  formData: FormData
): Promise<NewsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  const newsId = String(formData.get("newsId") ?? "").trim();

  if (!newsId) {
    return { error: "Noticia no válida." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("news")
    .select("*")
    .eq("id", newsId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Noticia no encontrada." };
  }

  if (existing.author_id !== user.id) {
    return { error: "Solo puedes editar noticias que hayas publicado." };
  }

  const fields = parseNewsFormData(formData);
  const slug = fields.slugInput
    ? slugify(fields.slugInput)
    : slugify(fields.title);
  const validationError = validateNewsFields(fields, slug);

  if (validationError) {
    return { error: validationError };
  }

  const { coverImage, error: uploadError } = await uploadCoverImage(
    supabase,
    fields.cover,
    slug,
    NEWS_COVERS_BUCKET
  );

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: updateError } = await supabase
    .from("news")
    .update({
      title: fields.title,
      slug,
      content: fields.content,
      cover_alt: fields.coverAlt || null,
      ...(coverImage ? { cover_image: coverImage } : {}),
    })
    .eq("id", newsId)
    .eq("author_id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return { error: "Ya existe una noticia con ese slug." };
    }

    return { error: updateError.message };
  }

  revalidateNewsPaths([existing.slug as string, slug]);
  redirect("/admin/noticias");
}

export async function deleteNews(newsId: string): Promise<NewsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  if (!newsId) {
    return { error: "Noticia no válida." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("news")
    .select("slug")
    .eq("id", newsId)
    .maybeSingle<{ slug: string }>();

  if (fetchError || !existing) {
    return { error: "Noticia no encontrada." };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("news")
    .delete()
    .eq("id", newsId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (!deleted) {
    return { error: "Solo puedes eliminar noticias que hayas publicado." };
  }

  revalidateNewsPaths([existing.slug]);
  redirect("/admin/noticias");
}
