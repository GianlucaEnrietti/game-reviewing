export const MAX_COVER_BYTES = 5 * 1024 * 1024;

type SupabaseClient = {
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        file: File,
        options: { contentType: string; upsert: boolean }
      ) => Promise<{ error: { message: string } | null }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

export async function uploadCoverImage(
  supabase: SupabaseClient,
  cover: FormDataEntryValue | null,
  slug: string,
  bucket: string
): Promise<{ coverImage: string | null; error?: string }> {
  if (!(cover instanceof File) || cover.size === 0) {
    return { coverImage: null };
  }

  if (!cover.type.startsWith("image/")) {
    return { coverImage: null, error: "El archivo de portada debe ser una imagen." };
  }

  if (cover.size > MAX_COVER_BYTES) {
    return { coverImage: null, error: "La portada no puede superar los 5MB." };
  }

  const extension = cover.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${slug}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, cover, {
      contentType: cover.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      coverImage: null,
      error: `Error al subir la portada: ${uploadError.message}`,
    };
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  return { coverImage: publicUrl.publicUrl };
}
