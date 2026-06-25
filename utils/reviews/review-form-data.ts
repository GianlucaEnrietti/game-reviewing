import { MAX_COVER_BYTES } from "../storage/upload-cover";

export { MAX_COVER_BYTES };

export function parseReviewFormData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const finalThoughts = String(formData.get("finalThoughts") ?? "").trim();
  const coverAlt = String(formData.get("coverAlt") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const genres = String(formData.get("genres") ?? "")
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);
  const cover = formData.get("cover");

  return {
    title,
    subtitle,
    slugInput,
    excerpt,
    content,
    finalThoughts,
    coverAlt,
    rating,
    genres,
    cover,
  };
}

export function validateReviewFields(
  fields: ReturnType<typeof parseReviewFormData>,
  slug: string
): string | null {
  if (!fields.title) {
    return "El título es obligatorio.";
  }

  if (!slug) {
    return "No se pudo generar un slug válido.";
  }

  if (!fields.excerpt) {
    return "El extracto es obligatorio.";
  }

  if (!fields.content) {
    return "El contenido es obligatorio.";
  }

  if (!fields.finalThoughts) {
    return "Los pensamientos finales son obligatorios.";
  }

  const isHalfStep =
    Number.isFinite(fields.rating) && Number.isInteger(fields.rating * 2);

  if (!isHalfStep || fields.rating < 0.5 || fields.rating > 5) {
    return "El rating debe estar entre 0.5 y 5 (en pasos de media estrella).";
  }

  return null;
}
