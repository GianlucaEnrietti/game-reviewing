"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { isAdminUser } from "../../utils/auth/admin";
import { slugify } from "../../utils/slug";
import { uploadCoverImage } from "../../utils/storage/upload-cover";
import {
  parseRambleFormData,
  validateRambleFields,
} from "../../utils/rambles/ramble-form-data";

export type RambleActionState = {
  error?: string;
};

const RAMBLE_COVERS_BUCKET = "ramble-covers";

function revalidateRamblePaths(slugs: string[]) {
  revalidatePath("/admin/rambles");

  for (const slug of slugs) {
    if (slug) {
      revalidatePath(`/rambles/${slug}`);
    }
  }

  revalidatePath("/rambles");
  revalidatePath("/");
}

export async function createRamble(
  formData: FormData
): Promise<RambleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  const fields = parseRambleFormData(formData);
  const slug = fields.slugInput
    ? slugify(fields.slugInput)
    : slugify(fields.title);
  const validationError = validateRambleFields(fields, slug);

  if (validationError) {
    return { error: validationError };
  }

  const { coverImage, error: uploadError } = await uploadCoverImage(
    supabase,
    fields.cover,
    slug,
    RAMBLE_COVERS_BUCKET
  );

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: insertError } = await supabase.from("rambles").insert({
    title: fields.title,
    subtitle: fields.subtitle || null,
    excerpt: fields.excerpt,
    slug,
    content: fields.content,
    cover_image: coverImage,
    cover_alt: fields.coverAlt || null,
    author_id: user.id,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "Ya existe un ramble con ese slug." };
    }

    return { error: insertError.message };
  }

  revalidateRamblePaths([slug]);
  redirect("/admin/rambles");
}

export async function updateRamble(
  formData: FormData
): Promise<RambleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  const rambleId = String(formData.get("rambleId") ?? "").trim();

  if (!rambleId) {
    return { error: "Ramble no válido." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("rambles")
    .select("*")
    .eq("id", rambleId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Ramble no encontrado." };
  }

  if (existing.author_id !== user.id) {
    return { error: "Solo puedes editar rambles que hayas publicado." };
  }

  const fields = parseRambleFormData(formData);
  const slug = fields.slugInput
    ? slugify(fields.slugInput)
    : slugify(fields.title);
  const validationError = validateRambleFields(fields, slug);

  if (validationError) {
    return { error: validationError };
  }

  const { coverImage, error: uploadError } = await uploadCoverImage(
    supabase,
    fields.cover,
    slug,
    RAMBLE_COVERS_BUCKET
  );

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: updateError } = await supabase
    .from("rambles")
    .update({
      title: fields.title,
      subtitle: fields.subtitle || null,
      excerpt: fields.excerpt,
      slug,
      content: fields.content,
      cover_alt: fields.coverAlt || null,
      ...(coverImage ? { cover_image: coverImage } : {}),
    })
    .eq("id", rambleId)
    .eq("author_id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return { error: "Ya existe un ramble con ese slug." };
    }

    return { error: updateError.message };
  }

  revalidateRamblePaths([existing.slug as string, slug]);
  redirect("/admin/rambles");
}

export async function deleteRamble(
  rambleId: string
): Promise<RambleActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdminUser(supabase, user.id))) {
    return { error: "No autorizado." };
  }

  if (!rambleId) {
    return { error: "Ramble no válido." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("rambles")
    .select("slug")
    .eq("id", rambleId)
    .maybeSingle<{ slug: string }>();

  if (fetchError || !existing) {
    return { error: "Ramble no encontrado." };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("rambles")
    .delete()
    .eq("id", rambleId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (!deleted) {
    return { error: "Solo puedes eliminar rambles que hayas publicado." };
  }

  revalidateRamblePaths([existing.slug]);
  redirect("/admin/rambles");
}
